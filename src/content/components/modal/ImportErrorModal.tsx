import type { IImportMsg } from '@/types/setting'

import CommonModal from '@/content/components/modal/CommonModal'

interface IImportErrorModalProps {
  handleModalClose: () => void
  payload: IImportMsg | undefined
}

export default function ImportErrorModal({
  handleModalClose,
  payload,
}: IImportErrorModalProps) {
  return (
    <CommonModal handleModalClose={handleModalClose}>
      <div className="bg-foreground flex w-[32rem] flex-col gap-y-6 rounded-xl px-6 py-4 text-sm">
        <div className="flex justify-center">
          <h1
            className={`text-base font-extrabold ${payload?.variant === 'success' ? `text-bg-chzzk-04` : 'text-content-card-1000000'}`}
          >
            <p>{payload ? payload.message : ''}</p>
            {payload?.variant === 'success' && <p>새로고침을 해주세요.</p>}
          </h1>
        </div>
      </div>
    </CommonModal>
  )
}
