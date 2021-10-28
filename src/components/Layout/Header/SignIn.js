import './SignIn.scss'
import themeContext from '$ustoreinternal/services/themeContext'
import { deleteCookie } from '$ustoreinternal/services/utils'
import { UStoreProvider } from '@ustore/core'
import { t } from '$themelocalization'

const SignIn = ({ showTitle = true }) => {


  const goToUrl = () => {
    const { storeID, classicUrl, securityToken, storeFriendlyID, languageCode, userID, showThemeAsDraft } = themeContext.get()

    const userIDfromStore = UStoreProvider.state.get().currentUser.ID

    const tempUserId = (!userID || (userIDfromStore && userIDfromStore !== userID)) ? userIDfromStore : userID

    const isDraft = showThemeAsDraft && showThemeAsDraft.toLowerCase() === 'true'

    const pageURL = window.location.href

    deleteCookie('_token')
    window.location.href = `${classicUrl}/logout.aspx?SecurityToken=${securityToken}&StoreGuid=${storeID}&storeid=${storeFriendlyID}&NgLanguageCode=${languageCode}&forceLogin=true&SignIn=true&ShowRibbon=false${isDraft ? '&showThemeAsDraft=true' : ''}&tempUserId=${tempUserId}&returnNGURL=/${encodeURIComponent(pageURL.slice(pageURL.indexOf(languageCode)))}`
  }

  return (
    <div className="signin">
      <div className="signin-info">
        {showTitle && <div className="signin-title">{t('Profile.My_Account')}</div>}
      </div>
      <div className="btn-container d-flex align-items-center">
        <a onClick={goToUrl} className='button-secondary'>Sign In</a>
      </div>
    </div>
  )
}
export default SignIn


