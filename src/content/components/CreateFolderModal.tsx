import { useState } from 'react'

import { SEARCH_FORM_CLASS, SEARCH_INPUT_CLASS } from '@/constants/chzzkEl'
import CommonModal from '@/content/components/CommonModal'


interface CreateFolderModalProps {
  handleModalClose: () => void
  onSubmit: (folderName: string) => void
}

export default function CreateFolderModal({
  handleModalClose,
  onSubmit,
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState<string>('')

  return (
    <CommonModal handleModalClose={handleModalClose}>
      <div className="bg-foreground flex w-[35rem] flex-col gap-y-6 rounded-xl px-6 py-4">
        <div className="flex justify-between gap-x-2.5">
          <h1 className="text-xl font-bold">폴더 추가</h1>
        </div>
        <div className={`${SEARCH_FORM_CLASS}`}>
          <input
            className={`rounded-lg p-2 ${SEARCH_INPUT_CLASS}`}
            type="text"
            placeholder="폴더명을 입력해주세요."
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-x-2">
          <div
            className="bg-background cursor-pointer rounded-lg border-0 px-3 py-2 font-semibold"
            onClick={() => onSubmit(folderName)}
          >
            만들기
          </div>
          <div
            className="bg-background cursor-pointer rounded-lg border-0 px-3 py-2 font-semibold"
            onClick={handleModalClose}
          >
            닫기
          </div>
        </div>
      </div>
    </CommonModal>
  )
}
