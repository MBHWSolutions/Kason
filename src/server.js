const isNodeVersionCorrect = require('./ustore-internal/scripts/checkNodeVersion')

if (!isNodeVersionCorrect()) {
  return
}

const nextPort = 5010
const proxyPort = nextPort - 10
const fs = require('fs')
const express = require('express')
const next = require('next')
const helmet = require('helmet')
const httpProxy = require('express-http-proxy');
const proxy = require('http-proxy-middleware');
const routes = require('./routes')
const { join } = require('path')
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = routes.getRequestHandler(app)
const buildEnv = process.env.DEPLOY_ENV || 'dev'
const { assetPrefix, $assets } = require(`./next.${buildEnv}.config`)

const argv = (str) => {
  const idx = process.argv.findIndex((a) => a.startsWith(str))
  if (idx > -1) {
    return process.argv[idx].substring(str.length + 1)
  }
  return null
}
const uStoreServerUrl = argv('server') || 'http://uStoreNG.xmpie.net' // 'http://frontend1'

const proxyDirectories = ['/ustore', '/uStore', '/uStoreRestAPI', '/uStoreThemeCustomizations', '/uStoreThemes', '/favicon.ico']

const makeHttpProxy = (base) => httpProxy(`${uStoreServerUrl}`,
  {
    https: false,
    proxyReqPathResolver: (req) => base + req.url,
  }
)

// Allows running the client only version under the out directory
// This is to enable testing the client only build.
if (argv('client')) {
  console.log('\x1b[31m%s\x1b[0m', '=====! Using exported directory !=====');
  const proxyServer = express();

  // create a proxy that will redirect all assets request to the out directory
  proxyServer.use(
    '/',
    proxy({
      target: `http://localhost:${nextPort}`,
      pathRewrite: {
        [`^${assetPrefix}`]: '/'
      }
    })
  );


  proxyServer.listen(proxyPort, proxyError => {
    if (proxyError) throw proxyError;

    const nextServer = express()

    nextServer.use(helmet.noCache())
    nextServer.use(helmet.frameguard())

    //serve static files from the out directory
    if (dev) {
      nextServer.use(express.static(__dirname + '/out'))
      nextServer.use('/webcomponents', express.static(join(__dirname, './webcomponents')))

      proxyDirectories.forEach(p => nextServer.use(p, makeHttpProxy(p)))
    }
    // all requests to the server should respond with the index.html
    // this enabled the client sides routing
    nextServer.get('*', (req, res) => {
      res.sendFile(__dirname + '/out/index.html')
    })


    nextServer.listen(nextPort, (err) => {
      if (err) throw err
      console.log(`next > Ready on http://localhost:${proxyPort}`)
    })
  });
} else {
  // This is the normal development server of nextjs
  const proxyServer = express();

  // Create a proxy server with url rewrite for the asset prefix
  proxyServer.use(
    '/',
    proxy({
      target: `http://localhost:${nextPort}`,
      pathRewrite: {
        [`^${assetPrefix}`]: '/'
      }
    })
  );

  proxyServer.listen(proxyPort, proxyError => {
    if (proxyError) throw proxyError;

    app.prepare()
      .then(() => {
        const nextServer = express()

        // set the asset prefix for the nextjs application
        app.setAssetPrefix(`http://localhost:${proxyPort}${assetPrefix}`);

        nextServer.use(helmet.noCache())
        nextServer.use(helmet.frameguard())

        // serve  static assets from global directories and directories inside the theme.
        if (dev) {
          console.log('Dev server is serving static files')
          nextServer.use(`/assets`, express.static($assets))
          nextServer.use('/static', express.static(join(__dirname, '/static')))
          nextServer.use('/static-internal', express.static(join(__dirname, '/ustore-internal/static')))
          nextServer.use('webcomponents', express.static(join(__dirname, './webcomponents')))
          proxyDirectories.forEach(p => nextServer.use(p, makeHttpProxy(p)))
        }

        // all requests are processed by the next application
        nextServer.get('*', (req, res) => {
          return handle(req, res)
        })

        nextServer.listen(nextPort, (err) => {
          if (err) throw err
          console.log(`next > Ready on http://localhost:${proxyPort}`)
        })
      })
      .catch((ex) => {
        console.error(ex.stack)
        process.exit(1)
      })
  });
}
