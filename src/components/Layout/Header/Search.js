import { InputGroup, InputGroupAddon } from 'reactstrap'
import Icon from '$core-components/Icon'
import './Search.scss'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import { Router } from '$routes'
import { withRouter } from 'next/router'
import React from 'react';
import { withState } from '$ustoreinternal/services/withState'
import { t } from '$themelocalization'
import { UStoreProvider } from '@ustore/core'

/**
 * This component represents the search text box in the header
 * When searching - the store redirects to the 'Search' page with results from the input
 *
 * @param {object} customState - custom state of store
 */
export class Search extends React.Component {
  state = {
    searchValue: ''
  }

  constructor(props) {
    super(props);
    this.onSearchClicked = this.onSearchClicked.bind(this)
    this.onKeyPress = this.onKeyPress.bind(this)
  }

  setSearchValue() {
    if (!this.props.router) {
      return;
    }

    const { router: { asPath, query } } = this.props

    const searchValue = (asPath && asPath.indexOf('/search/') > -1) ? query.id : ''
    this.setState({ searchValue })
  }

  onSearchClicked() {
    let value = this.escapeValue(this.input.value)
    if (value.length > 0) {
      UStoreProvider.state.customState.set('searchValue', value)
      Router.pushRoute(urlGenerator.get({ page: 'search', id: decodeURIComponent(value) }))
    }
  }

  escapeValue(value) {
    if (!value) {
      return ''
    }

    return value.replace(/[&:<>'"+*?\\/.%#|]/g, " ").trim()
  }

  onKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.onSearchClicked()
      event.preventDefault();
    }
  }

  onChange = (e) => {
    UStoreProvider.state.customState.delete('searchValue')
    this.setState({ searchValue: e.target.value })
  }

  onRouteComplete = (url) => {
    // google analytics is available, send page view event
    if (window.ga) {
      window.ga('send', 'pageview', url);
    }
    this.setSearchValue()
  }

  componentDidMount() {
    Router.events.on('routeChangeComplete', this.onRouteComplete)
    this.setSearchValue()
  }

  componentWillUnmount() {
    Router.events.off('routeChangeComplete', this.onRouteComplete)
  }

  render() {
    if (!this.props.customState) {
      return null
    }

    const { customState: { searchValue } } = this.props

    return <div className="search">
      <InputGroup size="normal">
        <input type="text" className="search-input form-control"
          value={searchValue ? searchValue : this.state.searchValue}
          placeholder={t('Search.Search_Products')}
          ref={(userInput) => this.input = userInput}
          onChange={this.onChange}
          onKeyPress={this.onKeyPress} />
        <InputGroupAddon className="search-button" addonType="append" onClick={this.onSearchClicked}>
          <div className="search-icon-container">
            <Icon name="search.svg" width="21px" height="21px" className="search-icon" />
          </div>
        </InputGroupAddon>
      </InputGroup>
    </div>
  }
}

export default withRouter(withState(Search))
