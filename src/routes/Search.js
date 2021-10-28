import React, { Component } from 'react'
import Layout from '../components/Layout'
import { UStoreProvider } from '@ustore/core'
import ScrollableGallery from '$core-components/ScrollableGallery'
import ProductItem from '../components/ProductItem'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import { getIsNGProduct } from '../services/utils'
import { decodeStringForURL } from '$ustoreinternal/services/utils'
import Slider from '$core-components/Slider'
import CategoryItem from '../components/CategoryItem'
import './Search.scss'
import { t } from '$themelocalization'

const PRODUCTS_PAGE_SIZE = 8

/**
 * This is the Search page
 * URL : http://<store-domain>/{language-code}/search/{search text}/
 *
 * @param {object} state - the state of the store
 */
class Search extends Component {

  constructor(props) {
    super(props)

    this.state = {
      isMobile: false
    }
  }

  componentWillUnmount() {
    UStoreProvider.state.customState.delete('searchResults')
    UStoreProvider.state.customState.delete('searchValue')
    UStoreProvider.state.customState.delete('searchResultsCount')
  }

  async loadProducts() {
    if (!this.props.customState) {
      return null
    }

    const { customState: { searchValue, searchResults } } = this.props
    const nextPage = Math.ceil(searchResults.length / PRODUCTS_PAGE_SIZE) + 1
    const { Products: products } = await UStoreProvider.api.products.search(searchValue, nextPage, PRODUCTS_PAGE_SIZE)
    const joinedProducts = searchResults.concat(products)

    UStoreProvider.state.customState.set('searchResults', joinedProducts)
  }

  render() {

    if (!this.props.state || !this.props.state.currentStore || !this.props.customState) {
      return null
    }

    const { customState: { searchResults, searchResultsCount, categories }, state: { currentStore } } = this.props

    const galleryTitle =
      searchResultsCount ? t('SearchResults.Count_products', { count: searchResultsCount }) : ''

    return <Layout {...this.props} className='search-ng'>
      {searchResults && searchResultsCount > 0 ?
        <div className="search-results">
          <div className="title main-title">{t('SearchResults.Title')}</div>
          <ScrollableGallery title={galleryTitle} hasMoreItems={true} onScroll={this.loadProducts.bind(this)}>
            {searchResults.map((model) => {
              const hideProduct =
                this.state.isMobile &&
                model.Attributes &&
                model.Attributes.find(attr => attr.Name === 'UEditEnabled' && attr.Value === 'true') !== undefined

              return !hideProduct &&
                <ProductItem
                  key={model.ID}
                  model={model} detailed
                  productNameLines="2"
                  descriptionLines="4"
                  url={getIsNGProduct(model.Type, currentStore) ?
                    urlGenerator.get({ page: 'products', id: model.FriendlyID, name: decodeStringForURL(model.Name) })
                    :
                    urlGenerator.get({ page: 'product', id: model.FriendlyID, name: decodeStringForURL(model.Name) })
                  }

                />
            })
            }
          </ScrollableGallery>
        </div>
        :
        (searchResults && !searchResults.length) ?
          <div className="no-results">
            <div className="top-section">
              <div className="title no-results-title">{t('SearchResults.No_results_title')}</div>
              <div className="no-results-subtitle">{t('SearchResults.No_results_subtitle')}</div>
            </div>
            {categories && categories.length > 0 &&
              <div className="bottom-section">
                <div className="divider"></div>
                <div className="title bottom-section-title">{t('SearchResults.No_results_bottom_section_title')}</div>
                <div className="categories-wrapper">
                  <Slider multi>
                    {
                      categories.map((model) => {
                        return <CategoryItem key={model.ID} model={model}
                          url={urlGenerator.get({ page: 'category', id: model.FriendlyID, name: decodeStringForURL(model.Name) })} />
                      }
                      )
                    }
                  </Slider>
                </div>
              </div>
            }
          </div> : null
      }
    </Layout>
  }
}

Search.getInitialProps = async (ctx) => {
  const searchValue = ctx.query.id

  const { Products: searchResults, Count: searchResultsCount } = await UStoreProvider.api.products.search(searchValue, 1, PRODUCTS_PAGE_SIZE)

  return {
    searchResults,
    searchValue,
    searchResultsCount
  }
}

export default Search
