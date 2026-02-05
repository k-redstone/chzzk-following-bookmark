export function createShadowRoot(opts: {
  hostId: string
  hostTag?: keyof HTMLElementTagNameMap
  hostClassName?: string
  styles: string[]
  mountTo: Element
  insertBefore?: Element | null
  hostStyle?: Partial<CSSStyleDeclaration>
}) {
  const {
    hostId,
    hostTag = 'div',
    hostClassName,
    styles,
    mountTo,
    insertBefore = null,
    hostStyle,
  } = opts

  const host = document.createElement(hostTag)
  host.id = hostId
  if (hostClassName) host.className = hostClassName
  if (hostStyle) Object.assign(host.style, hostStyle)

  const shadowRoot = host.attachShadow({ mode: 'open' })

  const sheet = new CSSStyleSheet()
  sheet.replaceSync(styles.join('\n'))
  shadowRoot.adoptedStyleSheets = [sheet]

  const wrapper = document.createElement('div')
  shadowRoot.append(wrapper)

  if (insertBefore) mountTo.insertBefore(host, insertBefore)
  else mountTo.appendChild(host)

  return { host, shadowRoot, wrapper }
}
