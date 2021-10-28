const path = require('path');
const relpath = path.join.bind(path, __dirname);

module.exports = {
  assetPrefix: '/ustorethemes/Kason/',
  apiUrl: '/uStoreRestAPI' ,
  classicUrl: '/ustore',
  themeCustomizationUrl: '/uStoreThemeCustomizations',
  serverDomain: 'http://localhost:5000',
  buildType: process.env.BUILD_TYPE,
  '$styles': relpath('./styles'),
  '$themepages': relpath('./routes'),
  '$themelocalization': relpath(`./localizations`),
  '$assets': relpath('./assets'),
  '$ustoreinternal': relpath(`/ustore-internal`),
  '$themeservices':  relpath(`/services`),
  'includeCssPaths': [relpath(`./styles`)]
}
