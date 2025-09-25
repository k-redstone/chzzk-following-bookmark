// openTab.ts
export interface OpenTabOptions {
  active?: boolean
  nextToCurrent?: boolean
}

export type OpenTabOk = { ok: true; tabId: number | null }
export type OpenTabErr = { ok: false; error: string }
export type OpenTabResp = OpenTabOk | OpenTabErr

export function openTab(
  urlRaw: string,
  opts: OpenTabOptions = {},
): Promise<OpenTabResp> {
  const url = new URL(urlRaw, location.origin).toString()
  const message = {
    type: 'OPEN_TAB' as const,
    url,
    active: Boolean(opts.active),
    nextToCurrent: Boolean(opts.nextToCurrent),
  }

  return new Promise<OpenTabResp>((resolve) => {
    chrome.runtime.sendMessage(message, (resp: OpenTabResp) => {
      resolve(resp)
    })
  })
}
