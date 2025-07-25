export function observeTabList(
  target: Element,
  callback: () => void,
): MutationObserver {
  const observer = new MutationObserver(callback)
  observer.observe(target, { childList: true, subtree: false })
  return observer
}
