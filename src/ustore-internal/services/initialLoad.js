import {
  isServer,
  dashToCamel,
  globalVar,
  createContext,
  deleteCookie,
  getNextConfig, setCookie, getCookie, getHeader, queryOrCookieStrToObj
} from '$ustoreinternal/services/utils'
import themeContext from '$ustoreinternal/services/themeContext'
import { UStoreProvider, http } from '@ustore/core'
import pages from '$themepages/index'
import i18n from 'roddeh-i18n'
import { loadLocalization } from '$ustoreinternal/services/localization'
import { initiateThemeState } from '$themeservices/initThemeState'
import { Router } from '$routes'

export const USER_ID_EXPIRATION_DAYS = 30

const getUserInitialProps = async (initialPropsFunctionName, ctx) => {
  const routedPage = Object.keys(pages).filter(p => p.toLowerCase() === initialPropsFunctionName.toLowerCase())

  if (routedPage.length > 0 && pages[routedPage].getInitialProps) {
    return await pages[routedPage].getInitialProps(ctx)
  }

  return pages.Home.getInitialProps ? await pages.Home.getInitialProps(ctx) : {}
}

export const getInitialProps = (ctx) => {
  const { buildType } = getNextConfig()
  if (isServer() && buildType === 'client_only') {
    return {}
  }
  return initialLoad(ctx)
}

export const redirectToLogout = (ctx) => {
  const { securityToken, storeFriendlyID, storeID, languageCode, logoutUrl } = themeContext.get()
  const storeType = UStoreProvider && UStoreProvider.state.get().currentStore && UStoreProvider.state.get().currentStore.StoreType
  deleteCookie('_token')

  if (storeType === 3 && logoutUrl)
    redirectToFullURL(ctx, decodeURIComponent(logoutUrl))
  else
    redirectToLegacy(ctx, `logout.aspx?SecurityToken=${securityToken}&StoreGuid=${storeID}&storeid=${storeFriendlyID}ShowRibbon=false&forceLogin=true&NgLanguageCode=${languageCode}`)
}

export const redirectToStoreErrorPage = (ctx) => {
  redirectToLegacy(ctx, 'ShowMessage.aspx?ErrorCode=0')
}

export const redirectToGenericErrorPage = (ctx) => {
  redirectToLegacy(ctx, `errorPage.aspx`)
}

export const redirectToLegacy = (ctx, legacyURL) => {
  const { classicUrl } = themeContext.get()
  const url = `${classicUrl}/${legacyURL}`
  if (ctx && ctx.res) {
    ctx.res.writeHead(302, {
      Location: url
    })
    ctx.res.end()
  } else {
    window.location.href = url
  }
  return {}
}

const redirectToFullURL = (ctx, newURL) => {
  if (ctx && ctx.res) {
    ctx.res.writeHead(302, {
      Location: newURL
    })
    ctx.res.end()
  } else {
    window.location.href = newURL
  }
  return {}
}

export const initAndLogin = async (ctx, url) => {

  const publicRuntimeConfig = getNextConfig()

  const reg = /(.*)(\/[a-z]{2}-[A-Za-z]{2})\//

  const res = reg.exec(url)

  if (!res) return

  const storeBaseFromURL = res[1]
  const storeBaseFromMem = themeContext.get('storeBaseURL') || getCookie('_storeBaseURL') || (ctx && getHeader(ctx.req, '_storeBaseURL'))

  let securityTokenFromUrl = ''
  let showRibbonFromUrl = false
  if (ctx) {

    if (ctx.query && ctx.query.SecurityToken) securityTokenFromUrl = ctx.query.SecurityToken
    if (ctx.query && ctx.query.ShowRibbon) showRibbonFromUrl = ctx.query.ShowRibbon.toLowerCase() === 'true'

  }
  else if (!isServer()) {

    const searchStr = window.location.search.substring(1)

    if (searchStr) {
      const q = queryOrCookieStrToObj(searchStr)
      if (q.SecurityToken) {
        securityTokenFromUrl = q.SecurityToken
      }
      if (q.ShowRibbon) {
        showRibbonFromUrl = q.ShowRibbon.toLowerCase() === 'true'
      }
    }
  }

  const shouldCallLoginByUrl = !!url && !securityTokenFromUrl &&
    (themeContext.get('securityToken') === undefined || !themeContext.get('securityToken') ||
      (storeBaseFromMem && storeBaseFromURL !== storeBaseFromMem))

  const date = new Date();
  date.setTime(date.getTime() + (USER_ID_EXPIRATION_DAYS * 24 * 60 * 60 * 1000));
  const expires = "; expires=" + date.toUTCString();

  if (shouldCallLoginByUrl) {
    ['securityToken', 'storeBaseURL', 'storeID', 'FriendlyID'].forEach(key => themeContext.deleteKey(key))

    const currentUser = themeContext.get('userID') || getCookie('_userID') || (ctx && getHeader(ctx.req, '_userID'))

    let loginResponse = await http.post(`${publicRuntimeConfig.apiUrl}/v1/store/loginByUrl`, { FullURL: url, UserID: currentUser }, { auth: false })

    // raise the showRibbon flag, so if not redirecting to logout, NG will show the cookie ribbon.
    UStoreProvider.state.customState.set('showCookieRibbon', true)


    if ((!loginResponse.Token || !loginResponse.Token.Token) && !loginResponse.URL) {
      // in case no new token returned, or API failed, redirect to logout.
      redirectToGenericErrorPage(ctx)
      return false
    }

    // save info from API to context and cookie
    themeContext.set('storeBaseURL', undefined)
    themeContext.set('securityToken', loginResponse.Token.Token)
    themeContext.set('storeID', loginResponse.StoreID)
    themeContext.set('userID', loginResponse.UserID)

    if (ctx && ctx.res && ctx.res.getHeader && ctx.res.setHeader) {
      let cookies = ctx.res.getHeader('Set-Cookie') || []
      cookies.push(`_token=${loginResponse.Token.Token}; path=/`)
      cookies.push(`_storeID=${loginResponse.StoreID}; path=/`)
      cookies.push(`_storeBaseURL=${storeBaseFromURL}; path=/`)
      // need to save the user ID to the cookie, so that if he closes the browser and reopens he wont lose his data.
      cookies.push(`_userID=${loginResponse.UserID}; path=/${expires}`)
      cookies.push(`_cookieRibbonNotShownYet=1; path=/`)
      ctx.res.setHeader('Set-Cookie', cookies)
    }
    else if (!isServer()) {

      setCookie('_token', themeContext.get('securityToken'))
      setCookie('_storeID', themeContext.get('storeID'))
      setCookie('_storeBaseURL', storeBaseFromURL)
      setCookie('_cookieRibbonNotShownYet', 1)
      // need to save the user ID to the cookie, so that if he closes the browser and reopens he wont lose his data.
      setCookie('_userID', loginResponse.UserID, USER_ID_EXPIRATION_DAYS)
    }

    let returnURL = loginResponse.URL

    if (returnURL) {
      returnURL += returnURL.includes('?') ? '&ShowRibbon=true' : '?ShowRibbon=true'
      // check if return URL is logout page, and if so, append the ShowRibbon=true
      if (returnURL.toLowerCase().includes('logout.aspx')) {
        returnURL += '&forceLogin=true'
      }

      redirectToFullURL(ctx, returnURL)
      return false
    }
  }
  else {
    UStoreProvider.state.customState.set('showCookieRibbon', showRibbonFromUrl)

    if (ctx && ctx.res && ctx.res.getHeader && ctx.res.setHeader) {
      let cookies = []
      cookies.push(`_token=${themeContext.get('securityToken')}; path=/`)
      cookies.push(`_storeID=${themeContext.get('storeID')}; path=/`)
      cookies.push(`_storeBaseURL=${storeBaseFromURL}; path=/`)
      // need to save the user ID to the cookie, so that if he closes the browser and reopens he wont lose his data.
      cookies.push(`_userID=${themeContext.get('userID')}; path=/${expires}`)
      cookies.push(`_cookieRibbonNotShownYet=${showRibbonFromUrl ? 1 : 0}; path=/`)
      ctx.res.setHeader('Set-Cookie', cookies)
    }
    else if (!isServer()) {
      setCookie('_token', themeContext.get('securityToken'))
      setCookie('_storeID', themeContext.get('storeID'))
      setCookie('_storeBaseURL', storeBaseFromURL)
      setCookie('_cookieRibbonNotShownYet', showRibbonFromUrl ? 1 : 0)
      // need to save the user ID to the cookie, so that if he closes the browser and reopens he wont lose his data.
      setCookie('_userID', themeContext.get('userID'), USER_ID_EXPIRATION_DAYS)
    }
  }

  themeContext.set('storeBaseURL', storeBaseFromURL)
  await UStoreProvider.init(publicRuntimeConfig, {
    ...themeContext.get(),
    onAccessDenied: () => redirectToLogout(ctx),
    onStoreNotAvailable: () => redirectToStoreErrorPage(ctx),
    onGeneralError: () => redirectToGenericErrorPage(ctx),
  }).then(() => {
    initiateThemeState()
  })

  return true

}

export const initialLoad = async (ctxParam) => {

  const ctx = ctxParam || createContext()
  if (isServer()) {
    themeContext.init(ctx)
  } else {
    themeContext.updateRouteParams(ctx)
  }

  let fullUrl
  // in dev mode wait for load localizations
  if (isServer()) {
    fullUrl = ctx.req.protocol + '://' + ctx.req.get('host') + themeContext.context['assetPrefix'] + ctx.asPath.substring(1)
    const keys = await loadLocalization(themeContext.get(), themeContext.context['languageCode'], fullUrl)
    globalVar.uStoreLocalization = { [themeContext.context['languageCode']]: i18n.create({ values: keys }) }

  }
  else {
    fullUrl = window ? window.location.href : ''
  }

  let shouldContinue = await initAndLogin(ctx, fullUrl)

  // if should not continue, do not load further data.
  if (!shouldContinue) return {}
  // }

  const { page } = themeContext.get()
  const initialPropsFunctionName = dashToCamel(page)

  //sets the user initial props to custom state.
  const userInitialProps = await getUserInitialProps(initialPropsFunctionName, ctx)
  if (userInitialProps) {
    UStoreProvider.state.customState.setBulk(userInitialProps)
  }

  const userCustomState = { customState: { ...UStoreProvider.state.get().customState, ...userInitialProps } }

  // returns the state from the component to be rendered.
  return { state: { ...UStoreProvider.state.get(), ...userCustomState }, context: ctx.query }
}
