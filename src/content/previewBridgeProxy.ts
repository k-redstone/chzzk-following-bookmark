import type { LiveInfo } from '@/types/preview-bridge'

// background로 요청
function callBG<T>(type: string, ...args: string[]): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type, args }, (res: unknown) => {
      if (chrome.runtime.lastError)
        return reject(new Error(chrome.runtime.lastError.message))
      if (res && typeof res === 'object' && 'error' in res)
        return reject(new Error(String((res as { error: unknown }).error)))
      resolve(res as T)
    })
  })
}

// 싱글턴 바인딩 (라이브 데이터 조회는 background 경유)
if (!window.__previewBridge) {
  window.__previewBridge = {
    fetchLiveDetail: (uid) => callBG<LiveInfo>('fetchLiveDetail', uid),
  }
}
