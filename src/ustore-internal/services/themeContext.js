import {
  getCookie,
  getHeader,
  isServer,
  queryOrCookieStrToObj,
  setCookie,
  getNextConfig
} from '$ustoreinternal/services/utils'
import { routes } from '$routes'
import { USER_ID_EXPIRATION_DAYS } from '$ustoreinternal/services/initialLoad'
import { UStoreProvider } from '@ustore/core'

const publicRuntimeConfig = getNextConfig()

class ThemeContext {
  constructor() {
    this.context = { ...publicRuntimeConfig, ...{ page: 'home' } }
  }

  get(key) {
    return key ? this.context[key] : this.context
  }

  set(key, value) {
    this.context[key] = value
  }

  deleteKey(key) {
    delete this.context[key]
  }

  updateRouteParams(ctx) {
    const asPath = ctx ? ctx.asPath : window.location.pathname

    this.set('page', 'home')
    this.deleteKey('id')

    routes.forEach(r => {
      const m = r.match(asPath.split('?')[0])
      if (m) {
        Object.assign(this.context, m)
      }
    })
  }

  // init the application context in the follow uses cases:
  // 1. in the server from the request then use the requests header fields
  // 2. in the server from the url which will override the header fields
  // 3. in the client only from the query string
  // 4. in the client only from the cookies (cookies are using also inserted to the request header)
  init(ctx) {

    if (ctx) {
      if (ctx.req) {

        this.context.securityToken = getHeader(ctx.req, '_token')
        this.context.languageCode = getHeader(ctx.req, '_language')
        this.context.storeID = getHeader(ctx.req, '_storeID')
        this.context.currencyFriendlyID = getHeader(ctx.req, '_currencyID')
        this.context.userID = getHeader(ctx.req, '_userID')
        this.context.currencyID = getHeader(ctx.req, '_currencyGUID')
        this.context.cartUrl = getHeader(ctx.req, '_cartUrl')
        this.context.logoutUrl = getHeader(ctx.req, '_logoutUrl')
      }
      if (ctx.query) {

        ctx.query.SecurityToken && (this.context.securityToken = ctx.query.SecurityToken)
        ctx.query.languageCode && (this.context.languageCode = ctx.query.languageCode)
        ctx.query.StoreGuid && (this.context.storeID = ctx.query.StoreGuid)
        ctx.query.currencyFriendlyID && (this.context.currencyFriendlyID = ctx.query.currencyFriendlyID)
        ctx.query.UserID && (this.context.userID = ctx.query.UserID)
        ctx.query.currencyID && (this.context.currencyID = ctx.query.currencyID)
        ctx.query.cartUrl && (this.context.cartUrl = ctx.query.cartUrl)
        ctx.query.logoutUrl && (this.context.logoutUrl = ctx.query.logoutUrl)
      }
    } else {
      const searchStr = window.location.search.substring(1)

      if (searchStr) {
        const q = queryOrCookieStrToObj(searchStr)

        if (q.SecurityToken) {
          this.context.securityToken = q.SecurityToken
          setCookie('_token', this.context.securityToken)
        }

        if (q.CultureCode) {
          this.context.languageCode = q.CultureCode
          setCookie('_language', this.context.languageCode)
        }

        if (q.StoreGuid) {
          this.context.storeID = q.StoreGuid
          setCookie('_storeID', this.context.storeID)
        }

        if (q.currencyFriendlyID) {
          this.context.currencyFriendlyID = q.currencyFriendlyID
          setCookie('_currencyID', this.context.currencyFriendlyID)
        }

        if (q.UserID) {
          this.context.userID = q.UserID
          setCookie('_userID', this.context.userID, USER_ID_EXPIRATION_DAYS)
        }

        if (q.ShowRibbon) {
          UStoreProvider.state.customState.set('showCookieRibbon', (q.ShowRibbon.toLowerCase() === 'true'))
          setCookie('_cookieRibbonNotShownYet', (q.ShowRibbon.toLowerCase() === 'true') ? 1 : 0)
        }

        if (q.CurrencyID) {
          UStoreProvider.state.customState.set('currencyID', (q.CurrencyID))
          this.context.currencyID = q.CurrencyID
          setCookie('_currencyGUID', q.CurrencyID)
        }

        if (q.cartUrl) {
          UStoreProvider.state.customState.set('cartUrl', (q.cartUrl))
          this.context.cartUrl = q.cartUrl
          setCookie('_cartUrl', q.cartUrl)
        }

        if (q.logoutUrl) {
          UStoreProvider.state.customState.set('logoutUrl', (q.logoutUrl))
          this.context.logoutUrl = q.logoutUrl
          setCookie('_logoutUrl', q.logoutUrl)
        }

      }

      this.context.languageCode = getCookie('_language') || this.context.languageCode
      this.context.showThemeAsDraft = getCookie('_showThemeAsDraft') || this.context.showThemeAsDraft
      this.context.securityToken = getCookie('_token') || this.context.securityToken
      this.context.storeID = getCookie('_storeID') || this.context.storeID
      this.context.currencyFriendlyID = getCookie('_currencyID') || this.context.currencyFriendlyID
      this.context.userID = getCookie('_userID') || this.context.userID

      this.context.CurrencyID = getCookie('_currencyGUID') || this.context.CurrencyID
      this.context.cartUrl = getCookie('_cartUrl') || this.context.cartUrl
      this.context.logoutUrl = getCookie('_logoutUrl') || this.context.logoutUrl

    }

    if (UStoreProvider.state.get() && UStoreProvider.state.get().currentUser) {
      this.context.userID = UStoreProvider.state.get().currentUser.ID
      if (!isServer()) setCookie('_userID', this.context.userID, USER_ID_EXPIRATION_DAYS)
      if (ctx && ctx.query) ctx.query.UserID = UStoreProvider.state.get().currentUser.ID

    }

    const asPath = isServer() ? ctx.req.path : window.location.pathname

    // analise the routes and extract the route variables (i.e ':page')
    routes.forEach(r => {
      const m = r.match(asPath.split('?')[0])

      if (m) {
        this.context = Object.assign({}, this.context, m)
      }
    })

  }


}

export default new ThemeContext()
