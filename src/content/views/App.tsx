import {
  NAV_TITLE_CLASS,
  NAV_HEADER_CLASS,
  NAV_LIST_CLASS,
} from '../../constants/chzzkEl'

export default function App() {
  return (
    <>
      <div className={`${NAV_HEADER_CLASS}`}>
        <h2 className={`${NAV_TITLE_CLASS}`}>팔로잉 북마크</h2>
      </div>
      <div className={`${NAV_LIST_CLASS}`}>
        <span className="text-red-500">asdf</span>
        <span>asdfasdf</span>
        <span>asdfasdfdfasdf</span>
      </div>
    </>
  )
}
