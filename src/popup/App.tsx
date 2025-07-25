import DividerSection from '@/popup/components/DividerSection'
import ToggleSwitch from '@/popup/components/ToggleSwitch'
import useSettingState from '@/popup/hooks/queries/useSettingState'
import { toggleSettingTab } from '@/stores/settingStore'

export default function App() {
  const { data, isSuccess, invalidate } = useSettingState()

  if (!isSuccess) return null

  return (
    <div className="min-w-64 bg-[#1c1d1f] p-5 text-white">
      <DividerSection>
        <div className="flex flex-col gap-y-2">
          <h2 className="font-bold">사이드바 설정</h2>
          <ToggleSwitch
            checked={data.following}
            onChange={async () => {
              await toggleSettingTab('following')
              invalidate()
            }}
            label="팔로잉 채널"
          />
          <ToggleSwitch
            checked={data.category}
            onChange={async () => {
              await toggleSettingTab('category')
              invalidate()
            }}
            label="인기 카테고리"
          />
          <ToggleSwitch
            checked={data.partner}
            onChange={async () => {
              await toggleSettingTab('partner')
              invalidate()
            }}
            label="파트너 스트리머"
          />
          <ToggleSwitch
            checked={data.service}
            onChange={async () => {
              await toggleSettingTab('service')
              invalidate()
            }}
            label="서비스 바로가기"
          />
        </div>
      </DividerSection>

      <DividerSection>
        <div className="flex flex-col gap-y-2">
          <h2 className="font-bold">통나무 파워</h2>
          <ToggleSwitch
            checked={data.chatting_power}
            onChange={async () => {
              await toggleSettingTab('chatting_power')
              invalidate()
            }}
            label="1시간 라이브 인증 (BETA)"
          />
        </div>
      </DividerSection>

      <DividerSection>
        <div className="flex flex-col gap-y-2">
          <h2 className="font-bold">데이터</h2>
        </div>
      </DividerSection>
    </div>
  )
}
