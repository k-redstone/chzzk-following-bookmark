export function sendRuntimeMessage<T>(
  type: string,
  ...args: unknown[]
): Promise<T> {
  return chrome.runtime.sendMessage({ type, args }) as Promise<T>
}
