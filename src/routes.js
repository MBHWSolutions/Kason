const USTORE_THEME_PREFIX = 'ustorethemes'

const router = module.exports = require('next-routes')()

const isServer = () => Object.prototype.toString.call(global.process) === '[object process]'
let assetPrefix = ''
if (!isServer()) {
  const reg = /(.*)(\/[a-z]{2}-[A-Za-z]{2})\//
  const exec = reg.exec(location.pathname)
  assetPrefix = exec[1]

  // in order to dettect extended URL, we will look for 'ustorethemes' (USTORE_THEME_PREFIX) in the URL, and if found, remove the last folder (i.e. store ID) from the asset prefix.
  if (exec[1].toLowerCase().includes(USTORE_THEME_PREFIX)) {
    assetPrefix = assetPrefix.substring(0, assetPrefix.lastIndexOf('/'))
  }

}
const getRoute = (r) => assetPrefix + r

const routes = isServer() || assetPrefix.toLowerCase().includes(USTORE_THEME_PREFIX) ?
  [
    '',
    '/',
    '/:storeFriendlyID/:languageCode',
    '/:storeFriendlyID/:languageCode/',
    '/:storeFriendlyID/:languageCode/:page',
    '/:storeFriendlyID/:languageCode/:page/',
    '/:storeFriendlyID/:languageCode/:page/:id',
    '/:storeFriendlyID/:languageCode/:page/:id/',
    '/:storeFriendlyID/:languageCode/:page/:id/:name',
    '/:storeFriendlyID/:languageCode/:page/:id/:name/',
  ]
  :
  [
    '',
    '/',
    '/:languageCode',
    '/:languageCode/',
    '/:languageCode/:page',
    '/:languageCode/:page/',
    '/:languageCode/:page/:id',
    '/:languageCode/:page/:id/',
    '/:languageCode/:page/:id/:name',
    '/:languageCode/:page/:id/:name/',
  ]


routes.forEach(r => router.add({ name: getRoute(r), page: 'generic', pattern: getRoute(r) }))




