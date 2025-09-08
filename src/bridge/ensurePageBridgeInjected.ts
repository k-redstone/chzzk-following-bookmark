let inflight: Promise<void> | null = null

export type PreviewBridge = {
  mountPlayer: (...args: unknown[]) => Promise<void> | void
  unmountPlayer: () => void
  fetchLiveDetail?: (uid: string) => Promise<unknown>
}

function hasPreviewBridge(w: Window): boolean {
  const b = w.__previewBridge
  return !!(
    b &&
    typeof b === 'object' &&
    typeof b.mountPlayer === 'function' &&
    typeof b.unmountPlayer === 'function'
  )
}

function logError(context: string, err: unknown): void {
  const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
  // 필요 시 여기서 Sentry/내부 로거로 전달
  console.error(`[page-bridge] ${context}`, msg)
}

export function ensurePageBridgeInjected(options?: {
  verify?: boolean
  timeoutMs?: number
  retry?: boolean
}): Promise<void> {
  const MARK = 'data-preview-bridge-injected'
  const SCRIPT_ID = 'chzzk-preview-bridge'
  const verify = options?.verify ?? true
  const timeoutMs = Math.max(1000, options?.timeoutMs ?? 7000)
  const allowRetry = options?.retry ?? true

  if (document.documentElement.hasAttribute(MARK)) {
    return Promise.resolve()
  }
  if (document.getElementById(SCRIPT_ID)) {
    return inflight ?? Promise.resolve()
  }
  if (inflight) return inflight

  inflight = new Promise<void>((resolve, reject) => {
    const container = document.head || document.documentElement

    const injectAttempt = (attempt: number): void => {
      let settled = false
      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.type = 'module'

      const base = chrome.runtime.getURL('page-bridge.esm.js')
      script.src = attempt === 0 ? base : `${base}?r=${Date.now().toString(36)}`
      script.async = false

      const cleanup = (tid: number): void => {
        try {
          script.onload = null
          script.onerror = null
          window.clearTimeout(tid)
        } catch (e) {
          logError('cleanup', e)
        }
      }

      const finalizeOk = (): void => {
        if (settled) return
        settled = true
        document.documentElement.setAttribute(MARK, '1')
        inflight = null
        resolve()
      }

      const finalizeErr = (context: string, err: unknown): void => {
        if (settled) return
        settled = true
        inflight = null
        logError(context, err)
        reject(err instanceof Error ? err : new Error(String(err)))
      }

      const tid = window.setTimeout(() => {
        try {
          container.removeChild(script)
        } catch (e) {
          logError('timeout.removeChild', e)
        }
        if (allowRetry && attempt === 0) {
          injectAttempt(1)
        } else {
          cleanup(tid)
          finalizeErr('load.timeout', new Error('page-bridge load timeout'))
        }
      }, timeoutMs)

      script.onload = () => {
        const verifyOrFinish = (): void => {
          if (!verify) {
            cleanup(tid)
            finalizeOk()
            return
          }
          // 최대 1초 동안 얇게 폴링
          const started = performance.now()
          const poll = (): void => {
            if (hasPreviewBridge(window)) {
              cleanup(tid)
              finalizeOk()
              return
            }
            if (performance.now() - started < 1000) {
              requestAnimationFrame(poll)
            } else if (allowRetry && attempt === 0) {
              try {
                container.removeChild(script)
              } catch (e) {
                logError('verify.removeChild', e)
              }
              injectAttempt(1)
            } else {
              cleanup(tid)
              finalizeErr(
                'verify.failed',
                new Error('page-bridge verify failed'),
              )
            }
          }
          requestAnimationFrame(poll)
        }

        try {
          verifyOrFinish()
        } catch (e) {
          cleanup(tid)
          finalizeErr('onload.verifyOrFinish', e)
        }
      }

      script.onerror = (ev: Event | string) => {
        try {
          container.removeChild(script)
        } catch (e) {
          logError('onerror.removeChild', e)
        }
        if (allowRetry && attempt === 0) {
          cleanup(tid)
          injectAttempt(1)
        } else {
          cleanup(tid)
          const err =
            typeof ev === 'string'
              ? new Error(ev)
              : new Error('page-bridge load failed')
          finalizeErr('onerror', err)
        }
      }

      // 기존 동일 id 스크립트가 남아 있다면 제거 후 삽입
      try {
        const prev = document.getElementById(SCRIPT_ID)
        if (prev) container.removeChild(prev)
      } catch (e) {
        logError('pre-remove', e)
      }

      try {
        container.appendChild(script)
      } catch (e) {
        cleanup(tid)
        finalizeErr('appendChild', e)
      }
    }

    try {
      injectAttempt(0)
    } catch (e) {
      inflight = null
      logError('injectAttempt.throw', e)
      reject(e instanceof Error ? e : new Error(String(e)))
    }
  })

  return inflight
}
