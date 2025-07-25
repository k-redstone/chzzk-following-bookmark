import { CHAT_POWER_QUERY } from '@/constants/chzzkEl'

let liveChatObserver: MutationObserver | null = null
let lastContainer: Element | null = null

function tryClickLiveChat() {
  const btn = document.querySelector(
    CHAT_POWER_QUERY,
  ) as HTMLButtonElement | null
  console.log(new Date())
  console.log('debug: 라이브 시청 인증 자동 클릭 실행')
  if (btn && !btn.disabled) {
    console.log('debug: 정상작동 ')
    btn.click()
    return true
  }
  console.log('debug: 실패 ')
  return false
}

export function enableAutoClickLiveChat() {
  if (liveChatObserver) return
  console.log('debug: 1시간 라이브 시청 인증 자동 클릭 on')
  liveChatObserver = new MutationObserver(() => {
    const container = document.querySelector(
      '.live_chatting_power_container__SEJC4',
    )

    if (container && container !== lastContainer) {
      lastContainer = container
      tryClickLiveChat()
    }
  })

  liveChatObserver.observe(document.body, { childList: true, subtree: true })
}

export function disableAutoClickLiveChat() {
  if (liveChatObserver) {
    console.log('debug: 1시간 라이브 시청 인증 자동 클릭 off')
    liveChatObserver.disconnect()
    liveChatObserver = null
  }
}

export function handleLiveChatPower(isOn: boolean) {
  if (isOn) enableAutoClickLiveChat()
  else disableAutoClickLiveChat()
}
