export type WebpackModuleId = string | number

export type WebpackModuleFactory = (
  module: unknown,
  exports: unknown,
  __r: WebpackRequireFn,
) => unknown

export type WebpackModuleTable = {
  [key: string]: WebpackModuleFactory
  [key: number]: WebpackModuleFactory
}

export interface WebpackRequireFn {
  (id: WebpackModuleId): unknown
  m: WebpackModuleTable
}

type WebpackChunkPushArgs = [
  ReadonlyArray<WebpackModuleId>,
  WebpackModuleTable,
  (req: (id: WebpackModuleId) => unknown) => unknown,
]

function getWebpackChunkKey(win: Window): string {
  const keys = Object.keys(win)
  const found = keys.find((k) => /^webpackChunk/.test(k))
  if (!found) {
    throw new Error('webpackChunk* key not found on window')
  }
  return found
}

/**
 * 페이지의 Webpack 런타임에서 __webpack_require__를 안전하게 뽑아온다.
 * - 모듈 팩토리/런타임 시그니처 엄격 타이핑
 */
export async function getWebpackRequire(): Promise<WebpackRequireFn> {
  const key = getWebpackChunkKey(window)
  const bag = (window as unknown as Record<string, unknown>)[key]

  if (
    typeof bag !== 'object' ||
    bag === null ||
    !('push' in (bag as Record<string, unknown>))
  ) {
    throw new Error('Invalid webpackChunk object')
  }

  const queue = bag as { push: (args: WebpackChunkPushArgs) => number }

  return await new Promise<WebpackRequireFn>((resolve) => {
    const id: string = `probe_${Math.random().toString(36).slice(2)}`

    const modules: WebpackModuleTable = {
      [id]: (_module, _exports, __r) => resolve(__r),
    }

    const runtime = (req: (x: WebpackModuleId) => unknown): unknown => req(id)

    queue.push([[id], modules, runtime])
  })
}
