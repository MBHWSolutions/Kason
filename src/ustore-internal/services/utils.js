import getConfig from 'next/config'
import { routes } from '$routes'
import logger from './logger'


export const isServer = () => Object.prototype.toString.call(global.process) === '[object process]'

export const extractPage = (asPath) => asPath.substring(1).split('/')[0]

export const dashToCamel = (str) => str.replace(/\W+(.)/g, (x, chr) => chr.toUpperCase())

export const camelToPascal = (str) => str.replace(/^([a-z])/, (x, chr) => chr.toUpperCase())

export const globalVar = isServer() ? global : window

export const decodeStringForURL = (string) => string ? string.replace(new RegExp(' ', 'g'), '-') : ''

export const queryOrCookieStrToObj = (str, splitter) => {
  const res = {}

  if (str && str !== '') {
    const splitBy = splitter ? splitter : /[&;]\s?/g

    str
      .replace(/^(.*)\?/, '')
      .split(splitBy)
      .forEach(pair => {
        const [key, value] = pair.split(/=(.+)/)
        res[key] = value
      })
  }

  return res
}

export const getCookie = (key) => typeof document === 'undefined' ? null : queryOrCookieStrToObj(document.cookie, /[;]\s?/g)[key]

export const getHeader = (req, key) => !!req && req.headers ? queryOrCookieStrToObj(req.headers.cookie, /[;]\s?/g)[key] : null

export const setCookie = (name, value, days, path) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=" + (path || '/');
}

export const deleteCookie = function (name) {
  document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
}

export const createContext = () => {
  const asPath = window.location.href.replace(window.location.origin, '')
  let query = {}
  routes.forEach(r => {
    const m = r.match(asPath.split('?')[0])

    if (m) {
      query = Object.assign({}, m)
    }
  })
  return {
    query: Object.assign(queryOrCookieStrToObj(window.location.search), query),
    asPath: asPath
  }
}
export const formatNumByLocale = (amount, locale) => {
  try {
    return amount && locale ? new Intl.NumberFormat(locale).format(amount) : amount
  } catch (error) {
    logger.error('Error on formatting number, defaulting to "en-US". Error: ' + error)
    return amount && locale ? new Intl.NumberFormat('en-US').format(amount) : amount
  }
}

export const formatDateByLocale = (date, locale) => {
  if (!date) {
    return date
  }
  const utcDate = new Date(date)
  const options = { month: 'long', day: '2-digit', year: 'numeric' }
  try {
    return date ? new Intl.DateTimeFormat(locale, options).format(utcDate) : date
  }
  catch (error) {
    logger.error('Error on formatting date, defaulting to "en-US". Error: ' + error)
    return new Intl.DateTimeFormat('en-US', options).format(utcDate)
  }
}

export const cleanPath = (p, assetPrefix) => p.replace(assetPrefix, '').substring(0, p.indexOf('?') > 0 ? p.indexOf('?') : p.length).replace(/\#|\?.*$/, '')

export const getCurrentCulture = (context = {}) => context.CultureCode || getCookie('_language')

export const getNextConfig = () => {
  const { publicRuntimeConfig } = getConfig() || {
    publicRuntimeConfig: {
      serverDomain: 'http',
      apiUrl: 'http',
      themeCustomizationUrl: 'http'
    }
  };
  const settingToFix = ['apiUrl', 'themeCustomizationUrl']
  let domain = publicRuntimeConfig.serverDomain

  if (!isServer()) {
    domain = window.location.protocol + '//' + window.location.hostname + (window.location.port !== '' ? ':' + window.location.port : '')
    publicRuntimeConfig.baseUrl = /(.*)(\/[a-z]{2}-[A-Za-z]{2})/.exec(location.pathname)[1]
  } else if (publicRuntimeConfig.buildType === 'client_only') {
    domain = ''
  }

  settingToFix.forEach(k => {
    if (!publicRuntimeConfig[k].startsWith('http')) {
      publicRuntimeConfig[k] = `${domain}${publicRuntimeConfig[k]}`
    }
  })

  return publicRuntimeConfig
}

export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}
