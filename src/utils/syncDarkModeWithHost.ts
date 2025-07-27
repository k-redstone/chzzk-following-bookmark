export function syncDarkModeWithHost(wrapper: HTMLElement) {
  const observer = new MutationObserver(() => {
    const isDark = document.documentElement.classList.contains('theme_dark')
    wrapper.classList.toggle('dark', isDark)
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })

  const isDark = document.documentElement.classList.contains('theme_dark')
  wrapper.classList.toggle('dark', isDark)
}
