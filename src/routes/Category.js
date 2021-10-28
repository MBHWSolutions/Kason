import { UStoreProvider } from '@ustore/core'
import Layout from '../components/Layout'
import './Category.scss'
import Slider from '$core-components/Slider'
import CategoryItem from '../components/CategoryItem'
import ProductItem from '../components/ProductItem'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import ScrollableGallery from '$core-components/ScrollableGallery'
import { t } from '$themelocalization'
import theme from '$styles/_theme.scss'
import { throttle } from 'throttle-debounce'
import { Component } from 'react'
import { getIsNGProduct } from '../services/utils'
import { decodeStringForURL, isServer } from '$ustoreinternal/services/utils'



const PRODUCTS_PAGE_SIZE = 8

/**
 * This is the category page
 * URL : http://<store-domain>/{language-code}/category/{category friendly ID}/
 *
 * @param {object} state - the state of the store
 */
class Category extends Component {

  constructor(props) {
    super(props)

    this.state = {
      isMobile: false
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize.bind(this))
    throttle(250, this.onResize);					// Call this function once in 250ms only

    this.onResize()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
    this.clearCustomState()
  }

  clearCustomState() {
    UStoreProvider.state.customState.delete('categoryFeaturedProducts')
    UStoreProvider.state.customState.delete('categoryProductsCount')
    UStoreProvider.state.customState.delete('currentCategory')
    UStoreProvider.state.customState.delete('subCategories')
    UStoreProvider.state.customState.delete('currentProduct')
    UStoreProvider.state.customState.delete('currentOrderItem')
    UStoreProvider.state.customState.delete('currentOrderItemId')
    UStoreProvider.state.customState.delete('currentOrderItemPriceModel')
    UStoreProvider.state.customState.delete('lastOrder')
    UStoreProvider.state.customState.delete('currentProductThumbnails')
  }

  onResize() {
    this.setState({ isMobile: document.body.clientWidth < parseInt(theme.md.replace('px', '')) })
  }

  async loadProducts() {
    if (!this.props.customState) {
      return null
    }

    const { customState: { currentCategory, categoryFeaturedProducts } } = this.props
    const nextPage = Math.ceil(categoryFeaturedProducts.length / PRODUCTS_PAGE_SIZE) + 1
    const { Products: products } = await UStoreProvider.api.products.getProducts(currentCategory.ID, nextPage, PRODUCTS_PAGE_SIZE)
    const joinedProducts = categoryFeaturedProducts.concat(products)

    UStoreProvider.state.customState.set('categoryFeaturedProducts', joinedProducts)


  }

  componentDidUpdate() {

    if (!this.props.customState || this.props.customState === undefined) return

    // check if there are more items to be loaded, BUT the screen has no scroll (in case of a vert big screen)
    // then manually load additional products, 
    // this will happen in a loop until either all products are loaded or screen has scrolling
    // a 1 Sec delay will prevent flashing of the screen when multiple calls happen (very very not likely)

    const { customState: { categoryFeaturedProducts, categoryProductsCount } } = this.props
    const hasMoreItems = categoryFeaturedProducts && categoryFeaturedProducts.length < categoryProductsCount

    if (hasMoreItems && !isServer() && document.body.clientHeight === window.innerHeight) {
      setTimeout(() => {
        this.loadProducts()
      }, 1000);
    }
  }

  render() {
    if (!this.props.customState) {
      return null
    }

    const { customState: { categoryFeaturedProducts, categoryProductsCount, subCategories, currentCategory }, state: { currentStore } } = this.props

    const galleryTitle =
      categoryProductsCount ?
        subCategories && subCategories.length > 0 ?
          t('Category.Count_featured_products', { count: categoryProductsCount }) :
          t('Category.Count_products', { count: categoryProductsCount })
        : ''

    const hasMoreItems = categoryFeaturedProducts && categoryFeaturedProducts.length < categoryProductsCount



    return (

      <Layout {...this.props} className="category">

        <div className="title" dangerouslySetInnerHTML={{ __html: currentCategory && currentCategory.Name }} />

        {subCategories && subCategories.length > 0 &&
          <div>
            <div className="categories-wrapper">
              <Slider key={currentCategory.ID} multi>
                {
                  subCategories.map((model) => {
                    return <CategoryItem key={model.ID} model={model}
                      url={urlGenerator.get({ page: 'category', id: model.FriendlyID, name: decodeStringForURL(model.Name) })} />
                  }
                  )
                }
              </Slider>
            </div>
            <div className="divider" />
          </div>
        }
        {currentCategory && categoryFeaturedProducts && categoryFeaturedProducts.length > 0 &&
          <div>
            <div className="featured-products-wrapper">
              <ScrollableGallery title={galleryTitle} hasMoreItems={hasMoreItems} onScroll={this.loadProducts.bind(this)}>
                {
                  categoryFeaturedProducts.map((model) => {
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
          </div>
        }

      </Layout>
    )
  }
}

Category.getInitialProps = async (ctx) => {
  const { query: { id: categoryFriendlyID } } = ctx

  if (!categoryFriendlyID || categoryFriendlyID === undefined) return {}

  const categoryID = await UStoreProvider.api.categories.getCategoryIDByFriendlyID(categoryFriendlyID)
  const currentCategory = await UStoreProvider.api.categories.getCategory(categoryID)

  const { Categories: subCategories } = await UStoreProvider.api.categories.getSubCategories(categoryID)
  const { Products: categoryFeaturedProducts, Count: categoryProductsCount } = await UStoreProvider.api.products.getProducts(categoryID, 1, PRODUCTS_PAGE_SIZE)

  return {
    categoryFeaturedProducts,
    categoryProductsCount,
    currentCategory,
    subCategories
  }

}

export default Category
