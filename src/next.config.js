const path = require('path')
const relpath = path.join.bind(path, __dirname)
const withSass = require('@zeit/next-sass')
const withCSS = require('@zeit/next-css')
const buildEnv = process.env.DEPLOY_ENV || 'dev'
const envConfig = require(`./next.${buildEnv}.config`)
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = withCSS(withSass({
  exportPathMap: function (defaultPathMap) {
    return {
      '/': { page: '/generic' }
    };
  },
  assetPrefix: envConfig.assetPrefix,
  publicRuntimeConfig: envConfig,
  useFileSystemPublicRoutes: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.minimizer = [new UglifyJsPlugin({ cache: true })]
      config.plugins.push(new OptimizeCSSAssetsPlugin({}))
    }

    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.js$/,
      use: ["source-map-loader"],
      enforce: "pre"
    },
      {
        test: /icons.*\.svg$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              icon: true
            },
          }
        ],
        exclude: /images/
      },
      {
        test: /static\/images.*\.(png|gif|jpg|jpeg|eot|otf|woff|woff2|ttf|svg)?$/,
        loaders: ['file-loader'],
        exclude: /bootstrap|assets/
      },
      {
        test: /assets.*\.(png|gif|jpg|jpeg|svg)?$/,
        loaders: [{
          loader: 'file-loader',
          options: {
            name: (file) => `[name].[ext]`,
            publicPath: `${envConfig.assetPrefix}/assets/images`
          }
        }],
        exclude: /bootstrap|static/
      },
      {
        test: /assets.*\.(eot|otf|woff|woff2|ttf)?$/,
        loaders: [{
          loader: 'url-loader'
        }],
        exclude: /bootstrap|static/
      },
      {
        test: /fonts\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          "css-loader"
        ]
      }
    );

    config.resolve.alias = Object.assign({}, config.resolve.alias, {
      '$core-components': relpath('./core-components'),
      '$styles': envConfig.$styles,
      '$themepages': envConfig.$themepages,
      '$routes': relpath('./routes.js'),
      '$themelocalization': envConfig.$themelocalization,
      '$assets': envConfig.$assets,
      '$ustoreinternal': envConfig.$ustoreinternal,
      '$themeservices': envConfig.$themeservices
    })
    config.resolve.modules.push(relpath('./scripts'))

    return config
  },
  sassLoaderOptions: {
    sassOptions: {
      includePaths: envConfig.includeCssPaths
    }
  }
}));
