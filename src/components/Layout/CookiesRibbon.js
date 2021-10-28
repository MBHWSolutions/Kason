import React from 'react'

import './CookiesRibbon.scss'
import Icon from '$core-components/Icon'
import { UStoreProvider } from '@ustore/core'
import { t } from '$themelocalization'


const CookiesRibbon = ({ IsB2C, showRibbon }) => {
  if (!IsB2C || !showRibbon) {
    return null
  }

  const closeRibbon = () => {
    UStoreProvider.state.customState.set('showCookieRibbon', false)
  }

  return (
    <div className="cookies-ribbon">
      <div className="text">
        <div dangerouslySetInnerHTML={{ __html: t('GdprRibbon.By_Continuing_to_browse') }} />
      </div>
      <div onClick={closeRibbon} className="close-btn-container">
        <Icon name="close_white.svg" width="15px" height="15px" className="close-btn" />
      </div>
    </div>
  )
}

export default CookiesRibbon
