import { UStoreProvider } from '@ustore/core'
import { debounce } from 'throttle-debounce'
import themeContext from '$ustoreinternal/services/themeContext'
import { Router } from '$routes'
import { queryOrCookieStrToObj, isServer, getNextConfig } from '$ustoreinternal/services/utils'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import variables from '$styles/_theme.scss'
import logger from './logger'

const ngToLegacyConversions = [
  {
    reg: /^((?!product|category).)*\/drafts/,
    generateURL: () => `Drafts`
  },
  {
    reg: /(.*)\/product\/(.*)/,
    generateURL: (storeFriendlyID, id) => `${storeFriendlyID}/Category/0/Product/${id}/`,

  },
  {
    reg: /.*\/order-final-step/,
    generateURL: () => `OrderFinalStep.aspx`
  },
  {
    reg: /^((?!product|category).)*\/cart/,
    generateURL: () => `Cart`
  },
  {
    reg: /^((?!product|category).)*\/addresses/,
    generateURL: () => `Adresses`
  },
  {
    reg: /.*\/checkout-complete/,
    generateURL: () => `CheckoutComplete.aspx`
  },
  {
    reg: /.*\/checkout-final/,
    generateURL: () => `CheckoutFinal.aspx`
  },
  {
    reg: /.*\/checkout-payment-submission/,
    generateURL: () => `CheckoutPaymentSubmission.aspx`
  },
  {
    reg: /.*\/clearing-unknown-order/,
    generateURL: () => `Clearing/UnknownOrder.aspx`
  },
  {
    reg: /.*\/customization/,
    generateURL: () => `Customization.aspx`
  },
  {
    reg: /.*\/custom-main/,
    generateURL: () => `CustomMain.aspx`
  },
  {
    reg: /.*\/empty-page/,
    generateURL: () => `EmptyPage.aspx`
  },
  {
    reg: /.*\/error-page/,
    generateURL: () => `ErrorPage.aspx`
  },
  {
    reg: /.*\/file-submission/,
    generateURL: () => `FileSubmission/FileSubmission.aspx`
  },
  {
    reg: /.*\/my-recipient-lists/,
    generateURL: () => `MyRecipientLists`
  },
  {
    reg: /.*\/order-approval-list/,
    generateURL: () => `OrderApprovalList.aspx`
  },
  {
    reg: /.*\/order-details/,
    generateURL: () => `OrderDetails.aspx`
  },
  {
    reg: /.*\/order-history/,
    generateURL: () => `OrderHistory`
  },
  {
    reg: /.*\/personal-information/,
    generateURL: () => `PersonalInformation`
  },
  {
    reg: /.*\/product-details/,
    generateURL: () => `ProductDetails`
  },
  {
    reg: /.*\/product-unavailable/,
    generateURL: () => `ProductUnavailable.aspx`
  },
  {
    reg: /^((?!product|category).)*\/recipient/,
    generateURL: () => `Recipient.aspx`
  },
  // {
  //   reg: /^((?!product|category).)*\/search/,
  //   generateURL: (storeFriendlyID, id) => `${storeFriendlyID}/Search/${id}`
  // },
  {
    reg: /.*\/split-shipping-addresses/,
    generateURL: () => `SplitShipping/Addresses.aspx`
  },
  {
    reg: /.*\/split-shipping-items/,
    generateURL: () => `SplitShipping/Items.aspx`
  },
  {
    reg: /.*\/uedit-customization/,
    generateURL: () => `uEditCustomization.aspx`
  },
]

const legacyToNGConversions = [
  {
    reg: /\/category\/0\/product\//,
    page: 'product',
    params: (url) => {
      const res = url.match(/\/product\/(\d+)\/(.*)/)

      return {
        id: res[1],
        name: res[2]
      }
    }
  },
  {
    reg: /\/ustore\/orderfinalstep/,
    page: 'order-final-step'
  },
  {
    reg: /\/ustore\/productdetails/,
    page: 'product-details'
  },
  {
    reg: /\/ustore\/(cart|checkout)(?!final|paymentsubmission|complete)/,
    page: 'cart'
  },
  {
    reg: /\/ustore\/checkoutfinal/,
    page: 'checkout-final'
  },
  {
    reg: /\/ustore\/checkoutpaymentsubmission/,
    page: 'checkout-payment-submission'
  },
  {
    reg: /\/ustore\/checkoutcomplete/,
    page: 'checkout-complete'
  },
  {
    reg: /\/ustore\/(orderhistory|orderlist)/,
    page: 'order-history'
  },
  {
    reg: /\/ustore\/(personalinformation|accountsettings)/,
    page: 'personal-information'
  },
  {
    reg: /\/ustore\/(adresses|deliveryaddress)/,
    page: 'addresses'
  },
  {
    reg: /\/ustore\/recipient(?!manager)/,
    page: 'recipient'
  },
  {
    reg: /\/ustore\/(myrecipientlists|recipientmanager)/,
    page: 'my-recipient-lists'
  },
  {
    reg: /\/ustore\/filesubmission\/filesubmission/,
    page: 'file-submission'
  },
  {
    reg: /\/ustore\/customization/,
    page: 'customization'
  },
  {
    reg: /\/ustore\/ueditcustomization/,
    page: 'uedit-customization'
  },
  {
    reg: /\/ustore\/splitshipping\/addresses/,
    page: 'split-shipping-addresses'
  },
  {
    reg: /\/ustore\/splitshipping\/items/,
    page: 'split-shipping-items'
  },
  {
    reg: /\/ustore\/orderdetails/,
    page: 'order-details'
  },
  {
    reg: /\/ustore\/product-unavailable/,
    page: 'order-details'
  },
  {
    reg: /\/ustore\/drafts/,
    page: 'drafts'
  },
  {
    reg: /\/ustore\/emptypage/,
    page: 'empty-page'
  },
  {
    reg: /\/ustore\/errorpage/,
    page: 'error-page'
  },
  // {
  //   reg: /\/ustore\/([\w-]+)\/search/,
  //   page: 'search',
  //   params: (url) => ({ id: url.match(/\/search\/(.*)\?/)[1] })
  // },
  {
    reg: /\/ustore\/orderapprovallist/,
    page: 'order-approval-list'
  },
  {
    reg: /\/ustore\/custommain/,
    page: 'custom-main'
  },
  {
    reg: /\/ustore\/clearing\/unknownorder/,
    page: 'clearing-unknown-order'
  },
  {
    reg: /\/ustore(\/?(([\w-]+)\/home\/?)?)$/,
    page: 'home'
  },
  {
    reg: /\/ustore\/default/,
    page: 'home'
  }
]

class LegacyIframeHandler {
  constructor() {
    this.viewMobileState = null
    this._iframeElm = null
    this.iframeID = 'legacy-iframe'
    this.clearContentSrc = 'about:blank'
    this.iframeContainer = null
    this.isIframeVisible = false
    this.buildType = getNextConfig().buildType
    Router.events.on('routeChangeComplete', this.handleRoute)
  }

  get iframeElm() {
    if (!this._iframeElm) {
      this._iframeElm = document.getElementById(this.iframeID)
    }
    return this._iframeElm
  }

  postMessage(message) {

    logger.info('message to iframe', message)


    if (!this.iframeElm) {
      return
    }
    this.iframeElm.contentWindow.postMessage(message, '*')
  }

  removeRandParamFromUrl(string) {
    if (!string) {
      return string
    }

    const randIndex = string.indexOf('rand')
    if (randIndex === -1) {
      return string
    }

    const ampersandIndex = string.indexOf('&', randIndex)
    return string.replace(
      ampersandIndex === -1 ? string.substring(randIndex - 1) : string.substring(randIndex, ampersandIndex + 1),
      ''
    )
  }

  setIframeSrc(url, mobileViewChanged = false) {
    try {
      const { pathname, search } = this.iframeElm.contentWindow.location

      const pathnameAfterCategoryFix = pathname
        .replace(/\/Category\/\d+\/Product\//i, '/Category/0/Product/')
        .replace(/(\/Category\/0\/Product\/\d+)(.*)/i, '$1')

      const pathIsTheSame = this.removeRandParamFromUrl(url)
        .toLowerCase()
        .startsWith(`${pathnameAfterCategoryFix}${this.removeRandParamFromUrl(search)}`.toLowerCase())

      if (!pathIsTheSame || mobileViewChanged) {
        this.iframeElm.contentWindow.location.replace(url)
      }
    } catch (e) {
      const ngurl = this.convertUrlLegacyToNG(url)
      window.location.href = ngurl
    }
  }

  getIframeSrc() {
    const { pathname, search, hash } = this.iframeElm.contentWindow.location
    return `${pathname}${search}${hash}`
  }

  handleRoute = (url) => {
    if (!this.iframeElm) {
      return
    }

    this.iframeElm.setAttribute('scrolling', 'no')

    // Send message to theme editor on routing changes
    window.parent.postMessage({
      type: '@CHANGE_NG_ROUTE',
      data: url
    }, '*')

    const { classicUrl, storeFriendlyID } = themeContext.get()

    // In case of a client only build on reload we need to wait until the
    // state is ready with currentStore, currentCulture and currentCurrency
    // for legacy iframe to be rendered correctly.
    if (this.buildType === 'client_only' && !isServer()) {
      const { currentCulture, currentCurrency } = UStoreProvider.state.get()
      if (!storeFriendlyID || !currentCurrency || !currentCulture) {
        setTimeout(() => this.handleRoute(url), 100)
        return
      }
    }

    //Identify if the 'url' is legacy or NG.
    //If NG - hide iframe
    //If legacy - show iframe and set it's src
    const legacyURL = this.iframeURLWithMobileBreak(this.getLegacyUrl(url))
    if (legacyURL && legacyURL.length > 0) {
      this.isIframeVisible = true
      this.setIframeSrc(legacyURL)
    } else {
      this.hideIframe()
    }
  }

  iframeURLWithMobileBreak(url) {
    if (!url || url.length === 0 || url === this.clearContentSrc) {
      return url
    }

    const addViewMobile = (u, val) => url.includes("viewMobile") ?
      u.replace(/viewMobile=false|viewMobile=true/gi, val) :
      u.includes('?') ? url.concat(`&${val}`) : url.concat(`?${val}`)

    const desktopBreakpoint = parseInt(variables.lg.replace('px', ''))
    const viewMobileVal = document.body.clientWidth > desktopBreakpoint ? 'viewMobile=false' : 'viewMobile=true'
    if (!this.viewMobileState || viewMobileVal !== this.viewMobileState) {
      this.viewMobileState = viewMobileVal
      return addViewMobile(url, viewMobileVal)
    }
    return url
  }

  getLegacyUrl(url) {
    let legacyUrl = this.convertUrlNGToLegacy(url)
    if (!legacyUrl || legacyUrl.length === 0) {
      return legacyUrl
    }
    const queryString = this.createCleanQueryString(url)
    legacyUrl += `${queryString.length > 0 ? '?' : ''}${queryString}`
    return this.appendMessagingParams(legacyUrl)
  }

  appendMessagingParams(url) {

    const { showThemeAsDraft, storeID, userID } = themeContext.get()
    const isDraft = showThemeAsDraft && showThemeAsDraft.toLowerCase() === 'true'
    const { currentCulture, currentCurrency, currentUser } = UStoreProvider.state.get()
    url += url.includes('showThemeAsDraft') ? '' : (`${url.includes('?') ? '&' : '?'}` + `showThemeAsDraft=${isDraft}&isFrameMode=true`)
    url += url.includes('currentCultureFriendlyID') ? '' : `&currentCultureFriendlyID=${currentCulture ? currentCulture.FriendlyID : ''}`
    url += url.includes('currentCurrencyFriendlyID') ? '' : `&currentCurrencyFriendlyID=${currentCurrency ? currentCurrency.FriendlyID : ''}`
    url += url.includes('rand') ? '' : `&rand=${Math.random()}`
    url += url.includes('userUniqueId') ? '' : `&userUniqueId=${currentUser ? currentUser.ID : ''}`
    url += url.includes('parentUrl') ? '' : `&parentUrl=${encodeURIComponent(window.location.href)}`
    url += url.includes('StoreGuid') ? '' : `&StoreGuid=${storeID ? storeID : ''}`
    return url
  }

  convertUrlLegacyToNG(legacyUrl) {
    const url = legacyUrl.toLowerCase();
    const ngUrl = legacyToNGConversions.reduce((res, { reg, page, params }) => {
      if (reg.test(url)) {
        const p = params ? params(url) : {}
        return urlGenerator.get({ page, ...p })
      }
      return res
    }, '')

    const queryString = this.createCleanQueryString(legacyUrl)
    return `${ngUrl}${queryString.length > 0 ? '?' : ''}${queryString}`
  }

  convertUrlNGToLegacy(url) {
    const { storeFriendlyID, id, classicUrl } = themeContext.get()
    const legacyURL = ngToLegacyConversions.reduce((res, { reg, generateURL }) => {
      if (reg.test(url)) {
        return generateURL(storeFriendlyID, id, classicUrl)
      }
      return res
    }, '')
    return legacyURL && legacyURL.length > 0 ? `${classicUrl}/${legacyURL}` : ""
  }

  createCleanQueryString(url = '') {
    const queryParamsJson = queryOrCookieStrToObj(url.split('?')[1]);

    return Object.entries(queryParamsJson)
      .filter(([key, value]) => key !== 'isFrameMode' && key !== 'showThemeAsDraft' && key !== 'currentCurrencyFriendlyID' && key !== 'currentCultureFriendlyID' && key !== 'rand')
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
  }

  hideIframe() {
    if (this.iframeElm) {
      this.isIframeVisible = false
      this.setIframeSrc(this.clearContentSrc)
      this.iframeElm.style.display = 'none'
    }
  }

  adaptIframeToContainer() {
    if (this.iframeElm && this.iframeContainer) {
      this.iframeElm.style.top = `${this.iframeContainer.offsetTop}px`
      this.iframeElm.height = this.iframeContainer.style.height
      this.iframeElm.width = this.iframeContainer.clientWidth
      this.iframeElm.style.display = 'block'
    }
  }

  adaptContainerToIframe() {
    if (this.iframeContainer) {
      this.iframeContainer.style.height = this.iframeElm.height
    }
  }

  onRedirectRequested(msg) {
    if (!msg || !msg.data || !msg.data.url) return
    const url = msg.data.url

    if (url.startsWith('http')) {
      window.location.href = url
    }
    else {
      Router.pushRoute(url)
    }
  }

  onScrollParentRequested(msg) {
    if (!msg) return

    if (msg.type === '@SCROLL_PARENT_DISABLE') {

      var x = window.scrollX;
      var y = window.scrollY;
      window.onscroll = function () { window.scrollTo(x, y); };

    }
    else if (msg.type === '@SCROLL_PARENT_ENABLE') {
      window.onscroll = function () { }
    }
  }


  onRequestScrollPosition(msg) {
    if (this.iframeElm && this.iframeContainer) {
      const response = {
        type: '@RESPONSE_UI_INFO',
        data: {
          scroll: document.querySelector('html').scrollTop
        }
      }

      this.postMessage(response)
    }
  }

  changeRouteOrDimensions(msg, asPath) {

    logger.info('message from iframe', msg, asPath)

    const changeRouteResult = {
      isRoutingFromLegacy: false,
      messageHandled: msg.type === '@CHANGE_DIMENSIONS' || msg.type === '@CHANGE_LEGACY_ROUTE'
    }
    if (msg.type === '@CHANGE_LEGACY_ROUTE') {
      // The following code prevents the iframe to be showed with
      // the login page inside. The page will redirect to the
      // original login page
      if (/login\.aspx/i.test(msg.data) || /showmessage\.aspx/i.test(msg.data)) {
        this.hideIframe()
        window.location.href = msg.data
        return changeRouteResult
      }
      window && window.scrollTo(0, 0)
      const nextUrl = msg.data ? this.convertUrlLegacyToNG(msg.data) : null
      if (nextUrl) {
        if (nextUrl !== asPath) {
          changeRouteResult.isRoutingFromLegacy = true
          Router.replaceRoute(nextUrl)
        }
      }
    } else if (msg.type === '@CHANGE_DIMENSIONS') {
      if (this.iframeContainer && msg.data && msg.data.height && this.isIframeVisible) {
        this.iframeContainer.style.height = `${msg.data.height}px`
        this.adaptIframeToContainer()
      }
    }
    return changeRouteResult
  }

  handleClickingIframe = () => {
    this.iframeContainer && this.iframeContainer.click()
  }

  handleResize = debounce(300, () => {
    const iframeSrc = this.getIframeSrc()

    const urlWithMobileBreak = this.iframeURLWithMobileBreak(iframeSrc)
    if (urlWithMobileBreak !== iframeSrc) {
      this.setIframeSrc(this.appendMessagingParams(urlWithMobileBreak), true)
    }
    this.adaptIframeToContainer()
  })

  handleScrolling({ type, data }) {
    if (type === '@SCROLL_ON') {
      this.iframeElm.setAttribute('scrolling', 'yes')
    }
    if (type === '@SCROLL_TO') {
      window.scrollTo(data.x, data.y)
    }
    return type === '@SCROLL_ON'
  }

  unmount() {
    Router.events.off('routeChangeComplete', this.handleRoute)
  }

}

export default new LegacyIframeHandler()
