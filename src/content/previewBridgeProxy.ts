/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LiveInfo, PreviewMountParams } from '@/types/preview-bridge'

declare global {
  interface Window {
    __previewBridge?: {
      fetchLiveDetail(uid: string): Promise<LiveInfo>
      mountPlayer(p: PreviewMountParams): Promise<void>
      unmountPlayer(): void
    }
  }
}

// background로 요청
function callBG<T>(type: string, ...args: string[]): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type, args }, (res) => {
      if (chrome.runtime.lastError)
        return reject(new Error(chrome.runtime.lastError.message))
      if (res && (res as any).error)
        return reject(new Error((res as any).error))
      resolve(res as T)
    })
  })
}

// page-bridge로 RPC
type RPCOk<T> = { __previewRPC: true; id: string; ok: true; result: T }
type RPCErr = { __previewRPC: true; id: string; ok: false; error: string }
type RPCRes<T> = RPCOk<T> | RPCErr

function callPageRPC<T>(
  method: 'mountPlayer',
  ...args: [PreviewMountParams]
): Promise<T>
function callPageRPC<T>(method: 'unmountPlayer', ...args: []): Promise<T>
function callPageRPC<T>(method: string, ...args: unknown[]): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = `${method}:${Date.now()}:${Math.random().toString(16).slice(2)}`

    const onMsg = (ev: MessageEvent) => {
      // 요청 에코는 무시하고, 응답만 처리
      const data = ev.data as RPCRes<T> | any
      if (
        !data ||
        data.__previewRPC !== true ||
        data.id !== id ||
        typeof data.ok !== 'boolean'
      )
        return
      window.removeEventListener('message', onMsg)
      if (data.ok) resolve(data.result as T)
      else reject(new Error(data.error || 'RPC failed'))
    }

    window.addEventListener('message', onMsg)
    window.postMessage({ __previewRPC: true, id, method, args }, '*')
  })
}

// 싱글턴 바인딩
if (!window.__previewBridge) {
  window.__previewBridge = {
    // ✅ 하이브리드: 데이터는 background
    fetchLiveDetail: (uid) => callBG<LiveInfo>('fetchLiveDetail', uid),

    // ✅ 재생/언마운트는 page-bridge
    mountPlayer: (p) => callPageRPC<void>('mountPlayer', p),
    unmountPlayer: () => callPageRPC<void>('unmountPlayer'),
  }
}
