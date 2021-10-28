/**
 * @function Profile - Dropdown for profile settings and actions
 *
 * @param {object} currentUser - should contains at least FirstName
 * @param {object} [userOrdersSummary] - data regarding the rejected/pending orders of the user in an approval process of the store
 */

import React, { Component } from 'react'
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap'
import SignOut from './SignOut'
import SignIn from './SignIn'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import './Profile.scss'
import { Link } from '$routes'
import themeContext from '$ustoreinternal/services/themeContext'
import { t } from '$themelocalization'
import Icon from '$core-components/Icon'
import { redirectToLegacy } from '$ustoreinternal/services/initialLoad'
import { UStoreProvider } from "@ustore/core";

const createLink = (anonymous, loginURL, pageTitle, additional) => {
  const { languageCode } = themeContext.get()
  const pageURL = urlGenerator.get({ page: pageTitle })

  if (anonymous) {
    return `${loginURL}&returnNGURL=/${encodeURIComponent(pageURL.slice(pageURL.indexOf(languageCode)))}${additional ? '?' + additional : ''}`
  }

  return `${pageURL}${additional ? '?' + additional : ''}`
}

const getLinkComponent = (pageName, IsAnonymous, loginPage, pageTitle, additional) => {
  return IsAnonymous ?
    <DropdownItem tag="a" onClick={() => { redirectToLegacy(null, createLink(IsAnonymous, loginPage, pageTitle, additional)) }}>{pageName}</DropdownItem>
    :
    <Link to={createLink(IsAnonymous, loginPage, pageTitle, additional)}>
      <DropdownItem tag="a">{pageName}</DropdownItem>
    </Link>
}

class Profile extends Component {
  constructor(props) {
    super(props)
    this.toggle = this.toggle.bind(this)
    this.state = {
      isDropdownOpen: false
    }
  }

  toggle() {
    this.setState(prevState => ({
      isDropdownOpen: !prevState.isDropdownOpen
    }))
  }

  render() {
    const { currentUser, userOrdersSummary } = this.props
    const { userID, storeID, securityToken, storeFriendlyID, languageCode } = themeContext.get()

    const userIDFromStore = UStoreProvider.state.get().currentUser.ID
    const tempUserId = (!userID || (userIDFromStore && userIDFromStore !== userID)) ? userIDFromStore : userID

    if (!currentUser) {
      return null
    }

    const rejectedOrderCount = (userOrdersSummary) ? userOrdersSummary.RejectedOrderCount : null
    const pendingApprovalOrderCount = (userOrdersSummary) ? userOrdersSummary.PendingApprovalOrderCount : null
    const loginPage = `/logout.aspx?tempUserId=${tempUserId}&SecurityToken=${securityToken}&StoreGuid=${storeID}&storeid=${storeFriendlyID}&NgLanguageCode=${languageCode}&forceLogin=true&ShowRibbon=false&SignIn=true`
    const IsAnonymous = currentUser.IsAnonymous

    return (
      <Dropdown
        isOpen={this.state.isDropdownOpen}
        toggle={this.toggle}
        className="profile"
      >
        <DropdownToggle
          tag='div'
          data-toggle='dropdown'
        >
          {/*<i className="fas fa-user fa-lg"></i>*/}
          <div className="profile-icon-container">
            <Icon name="user.svg" width="20px" height="20px" className="profile-icon" />
            {
              pendingApprovalOrderCount > 0 &&
              <div className="notification-icon">
                <Icon name="profile-notification.svg" width="20px" height="20px" className="profile-icon" />
              </div>
            }
          </div>
        </DropdownToggle>
        <DropdownMenu right>
          {
            IsAnonymous
              ? <SignIn />
              : <SignOut currentUser={currentUser} />
          }
          <div className="dd-body">

            {
              getLinkComponent(t('Profile.My_orders'), IsAnonymous, loginPage, 'order-history', 'filter=0')
            }
            {
              userOrdersSummary && currentUser.Roles.Shopper &&
              getLinkComponent(t('Profile.Rejected_orders', { rejectedOrderCount }), IsAnonymous, loginPage, 'order-history', 'filter=2')
            }
            {
              userOrdersSummary && currentUser.Roles.Approver &&
              getLinkComponent(t('Profile.Orders_to_approve', { pendingApprovalOrderCount }), IsAnonymous, loginPage, 'order-approval-list')
            }
            <Link to={urlGenerator.get({ page: 'drafts' })}>
              <DropdownItem tag="a" className="drafts">{t('Profile.Draft_orders')}</DropdownItem>
            </Link>
            {
              getLinkComponent(t('Profile.Recipient_lists'), IsAnonymous, loginPage, 'my-recipient-lists')
            }
            {
              getLinkComponent(t('Profile.Addresses'), IsAnonymous, loginPage, 'addresses')
            }
            {
              getLinkComponent(t('Profile.Personal_information'), IsAnonymous, loginPage, 'personal-information')
            }
          </div>
        </DropdownMenu>
      </Dropdown>
    )
  }
}

export default Profile
