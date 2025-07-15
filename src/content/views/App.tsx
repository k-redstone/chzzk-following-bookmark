import {
  NAV_TITLE_CLASS,
  NAV_HEADER_CLASS,
  NAV_LIST_CLASS,
  NAV_ITEM_CLASS,
} from '../../constants/chzzkEl'

export default function App() {
  return (
    <>
      <div className={`${NAV_HEADER_CLASS}`}>
        <h2 className={`${NAV_TITLE_CLASS} chzzk:block hidden`}>
          팔로잉 북마크
        </h2>
        <h2 className={`${NAV_TITLE_CLASS} chzzk:hidden block`}>북마크</h2>
      </div>
      <div className={`${NAV_LIST_CLASS}`}>
        <a className={`${NAV_ITEM_CLASS}`}>asdf</a>
        <a className={`${NAV_ITEM_CLASS}`}>asdfasdf</a>
        <a className={`${NAV_ITEM_CLASS}`}>asdfasdfdfasdf</a>
      </div>
    </>
  )
}
