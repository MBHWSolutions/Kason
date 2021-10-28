import { Component } from "react"
import deepcopy from "deepcopy"
import { withRouter } from 'next/router'
import { UStoreProvider } from '@ustore/core'
import pages from '$themepages/index'
import { isServer, camelToPascal, dashToCamel, setCookie, getCookie, getNextConfig } from '$ustoreinternal/services/utils'
import { getInitialProps, initialLoad, initAndLogin } from '$ustoreinternal/services/initialLoad'
import themeContext from '$ustoreinternal/services/themeContext'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import { Router } from '$routes'
import legacyIframeHandler from '$ustoreinternal/services/legacyIframeHandler'
import '$styles/index.scss'
import { getVariableValue } from '$ustoreinternal/services/cssVariables'

const renewTokenIntervalSec = 60 * 20;

export class Generic extends Component {

  constructor(props) {
    super(props)
    const publicRuntimeConfig = getNextConfig()

    this.config = publicRuntimeConfig
    this.doRenewToken = null

    if (!isServer()) {
      themeContext.updateRouteParams()
      themeContext.init()

      const url = window && window.location.href

      // if client_only mode - no need to call InitAndLogin, because ComponentDidMount will init the context and will call it there.
      if (this.config.buildType !== 'client_only') {
        initAndLogin(null, url)

        UStoreProvider.state.set(this.props.state)
      }
    }

  }

  async componentDidMount() {
    const { buildType } = this.config

    // connect redux state change to react to update when state has changed
    this.unsubscribe = UStoreProvider.state.subscribe(() => {
      // This prevent the storeFriendlyID from being null on reload in legacy page.
      if (UStoreProvider.state.get().currentStore) {
        themeContext.set('storeFriendlyID', UStoreProvider.state.get().currentStore.FriendlyID)
      }

      this.forceUpdate()
    })

    // in client init the context and set cookies according to the context
    if (!isServer()) {
      themeContext.init()
      const { securityToken, languageCode } = themeContext.get()
      securityToken && setCookie('_token', securityToken)
      languageCode && setCookie('_language', languageCode)
    }

    //Init iframe handler service
    const { router: { asPath } } = this.props

    legacyIframeHandler.handleRoute(asPath)

    let initialState
    if (!isServer() && buildType === 'client_only') {
      // in client only not using getInitalprops, so we need to simulate it in the didmount event
      // since getinitailprops called only on server side.
      initialState = await initialLoad()
    }

    if (!isServer()) {
      //In a B2C store when user is anonymous - do renew token every 20 minuts to keep the session alive
      const { currentStore, currentUser } = UStoreProvider.state.get()
      if (currentStore && currentStore.StoreType == 2 && currentUser.IsAnonymous && !this.doRenewToken) {
        this.doRenewToken = setInterval(async () => {
          //getting new token
          const newToken = await UStoreProvider.api.store.renewToken()
          //updating new token
          UStoreProvider.contextService.setValue('securityToken', newToken.Token)
          setCookie('_token', newToken.Token)
          themeContext.set('securityToken', newToken.Token)
        }, 1000 * renewTokenIntervalSec);
      }
    }

    if (initialState)
      return initialState
    // if URL contains SecurityToken, remove it so if a user copies the URL and sends it, the token will not be passed along.
  }

  // this is for supporting a favicon
  componentDidUpdate() {
    if (!isServer()) {
      //if not client_only mode - the currentUser is updated with the logged-in user after the interval has sarted - need to cancel it
      if (this.config.buildType !== 'client_only') {
        const { currentUser } = UStoreProvider.state.get()
        if (!currentUser.IsAnonymous && this.doRenewToken) {
          clearInterval(this.doRenewToken)
        }
      }
      const favIcon = document.getElementById('favicon')
      if (favIcon) {
        favIcon.href = getVariableValue('--favicon-url', '', true)
      }

      const asPath = window.location.href

      // remove params added by legacy login page.
      // in order not to interfere with quary params used by legacy pages like customization and finalize,
      // we dont remove all params, just the oned being passed to us from login page.
      if (asPath.includes('?')) {
        let href = asPath
        if (href.includes('SecurityToken=')) {
          const res = href.match(/SecurityToken=[a-zA-Z0-9]*[&]?/)
          href = href.replace(res[0], '')
        }

        if (href.includes('StoreGuid=')) {
          const res = href.match(/StoreGuid=[a-zA-Z0-9/-]*[&]?/)
          href = href.replace(res[0], '')
        }

        if (href.includes('ShowRibbon=')) {
          const res = href.match(/ShowRibbon=[a-zA-Z0-9]*[&]?/)
          href = href.replace(res[0], '')
        }

        if (href.includes('CurrencyID=')) {
          const res = href.match(/CurrencyID=[a-zA-Z0-9/-]*[&]?/)
          href = href.replace(res[0], '')
        }

        if (href.endsWith('?')) href = href.substring(0, href.length - 1)

        if (asPath !== href) {
          let currentState = window.history.state
          // in Safari, history.state is NULL, so we need to replace it with an object.
          if (currentState === null || currentState === undefined) {
            currentState = { url: '', as: '', options: {} }
          }
          currentState.url = href
          currentState.as = href

          window.history.replaceState(currentState, '', href)
        }


      }
    }
  }

  componentWillUnmount() {
    this.unsubscribe()
    legacyIframeHandler.unmount()
    if (this.doRenewToken)
      clearInterval(this.doRenewToken)
  }

  getPageComponentName(page) {
    return camelToPascal(dashToCamel(page))
  }

  applyStateChanges(pages, pageComponentName) {

    const modifyStateBeforeRender = pages[pageComponentName] ? pages[pageComponentName].modifyStateBeforeRender : pages.Home.modifyStateBeforeRender;
    const uStoreState = UStoreProvider ? UStoreProvider.state.get() : {};

    const userState = modifyStateBeforeRender ? modifyStateBeforeRender(deepcopy(uStoreState)) : uStoreState;
    return userState || uStoreState;
  }

  render() {
    // in client only mode render an empty div, when application is initialise it will render the page.
    if (isServer() && this.config.buildType === 'client_only') {
      return <div />
    }

    const { router: { query, asPath } } = this.props

    // in client only will redirect when the url is missing the page name
    if ((asPath.match(/\//g) || []).length < 2 && !isServer()) {
      setTimeout(() => Router.push(urlGenerator.get({ page: 'home' }) + window.location.search))
    }

    // in client if security token is missing get it from the cookie
    if (!isServer() && !query.SecurityToken) {
      query.SecurityToken = getCookie('_token')
    }

    const ctx = themeContext.get()
    if (!ctx || !ctx.page) {
      return null
    }

    const pageComponentName = this.getPageComponentName(ctx.page)

    // modify state that is sent to the page with out modifying the state in the uStoreProvider
    const state = this.applyStateChanges(pages, pageComponentName)

    // create all properties needed from the page component
    const newProps = { ...this.props, state, customState: state.customState }

    return React.createElement(pages[pageComponentName], newProps)
  }
}

Generic.getInitialProps = getInitialProps

export default withRouter(Generic)
