import type { BookmarkState } from '@/types/bookmark'
import type { ISettingState } from '@/types/setting'

import DividerSection from '@/popup/components/DividerSection'
import ToggleSwitch from '@/popup/components/ToggleSwitch'
import useSettingState from '@/popup/hooks/queries/useSettingState'
import { toggleSettingTab, saveSettingState } from '@/stores/settingStore'
import { downloadJson, isValidImportData, readJsonFile } from '@/utils/data'
import { sendRuntimeMessage } from '@/utils/helper'

export default function App() {
  const { data, isSuccess, invalidate } = useSettingState()

  if (!isSuccess) return null

  function requestDataFromContentScript(tabId: number): Promise<BookmarkState> {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(
        tabId,
        { type: 'EXPORT_BOOKMARK_DATA' },
        (response) => {
          resolve(response)
        },
      )
    })
  }

  const handleExportData = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab.id) {
      const bookmark = await requestDataFromContentScript(tab.id)
      const setting = await sendRuntimeMessage<ISettingState>('getSettingState')
      const data = { bookmark: bookmark, setting: setting }
      downloadJson(data)
      return
    }
  }

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const json = await readJsonFile(file)
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      })

      const tab = tabs[0]
      if (!tab || tab.id == null) {
        alert('활성 탭을 찾을 수 없습니다.')
        return
      }

      if (!isValidImportData(json)) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'IMPORT_ERROR',
          payload: {
            message: '데이터 불러오기 실패',
            variant: 'error',
          },
        })
        return
      }

      await saveSettingState(json.setting)

      const tabId = tab.id
      chrome.tabs.sendMessage(
        tabId,
        { type: 'IMPORT_BOOKMARK_DATA', data: json.bookmark },
        (res) => {
          if (res.ok) {
            chrome.tabs.sendMessage(tabId, {
              type: 'IMPORT_ERROR',
              payload: {
                message: '데이터 불러오기 성공',
                variant: 'success',
              },
            })
          } else {
            chrome.tabs.sendMessage(tabId, {
              type: 'IMPORT_ERROR',
              payload: {
                message: '데이터 불러오기 실패',
                variant: 'error',
              },
            })
          }
        },
      )
    } catch (err) {
      chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        const tab = tabs[0]
        if (tab && tab.id != null) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'IMPORT_ERROR',
            payload: {
              message: `불러오기 에러: ${err instanceof Error ? err.message : '알 수 없는 에러'}`,
              variant: 'error',
            },
          })
        }
      })
    }
  }

  return (
    <>
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
            <label className="bg-bg-chzzk-04 cursor-pointer rounded px-3 py-1 text-center">
              불러오기
              <input
                type="file"
                accept="application/json"
                onChange={(e) => {
                  handleImportData(e)
                  e.target.value = ''
                }}
                style={{ display: 'none' }}
              />
            </label>
            <button
              type="button"
              onClick={() => handleExportData()}
              className="bg-content-card-1000000 cursor-pointer rounded py-1"
            >
              내보내기
            </button>
          </div>
        </DividerSection>
      </div>
    </>
  )
}
