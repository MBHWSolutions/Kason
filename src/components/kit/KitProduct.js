/**
 * A component that is loaded for displaying a product of type Kit
 *
 * @param {object} customState - the entire object from redux state
 * @param {object} router - the information about the current route, query param, etc
 *
 */

import { Router } from '$routes'
import './KitProduct.scss'
import React, { Component } from 'react'
import ImageCarousel from '$core-components/ImageCarousel'
import KitItemsList from './KitItemsList'
import { t } from '$themelocalization'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import { formatDateByLocale } from '$ustoreinternal/services/utils'
import { UStoreProvider } from '@ustore/core'
import deepcopy from 'deepcopy'
import LoadingDots from '$core-components/LoadingDots'
import { throttle } from 'throttle-debounce'
import { Popover, PopoverBody } from 'reactstrap'
import Price from '../Price'
import { kitChangeType } from '../consts'
import KitQuantity from './KitQuantity'
import themeContext from '$ustoreinternal/services/themeContext'
import { isOutOfStock } from '../Inventory'
import { decodeStringForURL } from '$ustoreinternal/services/utils'


class KitProduct extends Component {
  constructor() {
    super()
    this.state = {
      activeCarouselSlide: 0,
      doValidate: false,
      isKitQuantityValid: true,
      isPriceCalculating: true,
      showLoadingOnContinue: true,
      isLoading: false,
      isLoadingReorder: false,
      showWarningPopover: false,
      showErrorPopover: false,
    }

    this.initialDataLoaded = false // flag to indicate on ComponentDidUpdate whether the data APIs were already called.
    this.firstPriceCalculated = false

    this.ContinueErrorProperties = false
    this.ContinueErrorQuantity = false

    this.quantityChangeTriggered = false
    this.showItemsErrorOnKit = false
    this.lastChangedOrderItemID = 0

    this.onClickContinue = this.onClickContinue.bind(this)
    this.onClickContinueAnyway = this.onClickContinueAnyway.bind(this)
    this.onQuantityChange = this.onQuantityChange.bind(this)
    this.onCarouselImageChange = this.onCarouselImageChange.bind(this)
    this.onCalculatePrice = this.onCalculatePrice.bind(this)
    this.toggleWarningPopover = this.toggleWarningPopover.bind(this)
    this.toggleErrorPopover = this.toggleErrorPopover.bind(this)
    this.routeToCustomization = this.routeToCustomization.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onReorder = this.onReorder.bind(this)
  }

  getData = async function (productID, orderItemID) {

    if (!productID || productID === undefined) return

    const product = await UStoreProvider.api.products.getProductByID(productID, true)
    let orderProduct = null

    if (orderItemID) {
      orderProduct = await UStoreProvider.api.orders.getOrderItem(orderItemID)
    } else {
      orderProduct = await UStoreProvider.api.orders.addOrderItem(productID)
    }

    const lastOrder = await UStoreProvider.api.orders.getLastOrder(productID)

    const kitViewModel = { items: {} }
    orderProduct.Items.forEach(orderItem => {
      kitViewModel.items[orderItem.ID] = {
        iframeLoading: false,
        iframeLoaded: null,
        propsWasOpened: false,
        modalIsOpen: false,
        showPropsNotOpenedWarning: false,
        isPropertiesValid: null,
        isQuantityValid: null
      }

      if (orderItem.IsIncluded && product.Items) {
        const productItem = product.Items.find(
          kitProductItem => kitProductItem.Product.ID === orderItem.ProductID
        )
        if (productItem && productItem.Product.Inventory && isOutOfStock(productItem.Product.Inventory.Quantity, productItem.Product.Configuration.Quantity.Minimum, productItem.Product.Inventory.AllowOutOfStockPurchase)) {
          orderItem.IsIncluded = false
        }
      }
    })

    UStoreProvider.state.customState.setBulk({ currentProduct: product, currentOrderItem: orderProduct, lastOrder: lastOrder, kitViewModel: kitViewModel })
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll, true)
    throttle(250, this.onScroll);					// Call this function once in 250ms only

    this.onScroll()
  }

  componentDidUpdate() {
    const { customState: { currentProduct, currentOrderItemId } } = this.props

    const { customState: { currentOrderItem, kitViewModel } } = this.props

    if (!currentOrderItem || !kitViewModel || !currentProduct || !currentProduct.Items) return // we still don't have all data, do not continue.

    const { customState: { kitViewModel: { items } } } = this.props

    // if this is the first time we are getting the current order Item, and we found items with iframes, start showing loader on continue button, and calculate p
    if (!this.firstPriceCalculated) {
      this.firstPriceCalculated = true

      const itemsWithNoProperties = currentOrderItem.Items.filter(orderItem => {
        const productItem = orderItem && currentProduct.Items.find(kitProductItem => orderItem.ProductID === kitProductItem.Product.ID).Product
        return (productItem && !productItem.Configuration.Properties.length)
      }).map(item => item.ID)

      //check if there are items which are included and have properties
      const includedItemsWithIframe = currentOrderItem.Items.filter(orderItem => {
        return orderItem.IsIncluded && !itemsWithNoProperties.includes(orderItem.ID)
      })

      this.setState({ showLoadingOnContinue: !!includedItemsWithIframe.length })

      this.onCalculatePrice()
      return
    }

    const includedItems = currentOrderItem.Items.filter(item => item.IsIncluded).map(item => item.ID)

    const itemsWithNoProperties = currentOrderItem.Items.filter(orderItem => {
      const productItem = orderItem && currentProduct.Items.find(kitProductItem => orderItem.ProductID === kitProductItem.Product.ID).Product
      return (productItem && !productItem.Configuration.Properties.length)
    }).map(item => item.ID)

    //check if all included kit items with properties has finished loading their iframes
    const allIncludedIframesAreLoaded = Object.keys(items).every(key => {
      return !includedItems.includes(key) ||
        (items[key].iframeLoaded && includedItems.includes(key)) ||
        itemsWithNoProperties.includes(key)
    })

    //if all included kit items are loaded - remove loading from continue
    if (this.state.showLoadingOnContinue && allIncludedIframesAreLoaded) {
      this.setState({ showLoadingOnContinue: false })
    }

    //if the kit quantity was changed and there is at least one item with invalid quantity - show general error on kit quantity
    if (this.quantityChangeTriggered && Object.keys(items).find(key => includedItems.includes(key) && items[key].isQuantityValid === false)) {
      this.showItemsErrorOnKit = true
    }

    //if the show general error on kit quantity is shown and all items have valid quantity or are not included - remove general error, remove flag of quantity changed
    if (this.showItemsErrorOnKit && Object.keys(items).every(key => !includedItems.includes(key) || items[key].isQuantityValid)) {
      this.showItemsErrorOnKit = false
      this.quantityChangeTriggered = false
    }

    const allItemsValidationReturned = Object.keys(items).every(key => !includedItems.includes(key) || items[key].isPropertiesValid !== null)

    //if all items returned from validation with any isValid value:
    //  - remove loader on right side
    //  - if at least one item is invalid or kit quantity is invalid - do nothing (errors are already shown)
    //  - if all items are valid and kit quantity is valid check for warning on continue for not opening all items' props window
    //  - if all items' props were opened dont show warning, navigate to next page
    if (this.state.isLoading && allItemsValidationReturned) {

      this.setState({ isLoading: false, isLoadingReorder: false, doValidate: false })

      //all is valid if kit quantity is valid, and all items have valid properties and valid quantity (or they are initially not included and their quantity in null)
      const isAllValid = this.state.isKitQuantityValid &&
        Object.keys(items).every(key => !includedItems.includes(key) || (items[key].isPropertiesValid && items[key].isQuantityValid)
        )

      if (isAllValid) {
        //reset flag for showing validation error popover
        this.ContinueErrorQuantity = this.ContinueErrorQuantity = false

        const allOpened = Object.keys(items).every(key => {
          return !includedItems.includes(key) ||
            items[key].propsWasOpened ||
            itemsWithNoProperties.includes(key)
        })

        // if at least one is included, has properties and not opened -> show the continue popover
        if (!allOpened) {
          this.setState({ showWarningPopover: !this.state.showWarningPopover })
          this.setAllKitViewModel(items, { showPropsNotOpenedWarning: true })
          return
        }

        // if valid and no need for popover, first put the OrderItemID into the URL, for navigation.
        this.routeToCustomization()
      }
      else {
        this.setState({ showErrorPopover: true })
        //if kit quantity is not valid or there is at least one item with invalid quantity - raise flag for quantity error
        this.ContinueErrorQuantity = !this.state.isKitQuantityValid || Object.keys(items).find(key => includedItems.includes(key) && items[key].isQuantityValid === false)
        //if there is at least one item with invalid properties - raise flag for properties error
        this.ContinueErrorProperties = Object.keys(items).find(key => includedItems.includes(key) && items[key].isPropertiesValid === false)

        const nonValidItems = document.getElementsByClassName('not-valid')
        nonValidItems && nonValidItems.length && nonValidItems[0].scrollIntoView(true)
      }
    }

    //if any of the items has a modal opened, prevent scrolling on the back
    if (Object.keys(items).find(key => items[key].modalIsOpen)) {
      document.querySelector('html').classList.add('modal-open')
    }
    else {
      document.querySelector('html').classList.remove('modal-open')
    }

  }

  componentWillUnmount() {
    UStoreProvider.state.customState.delete('currentProduct')
    UStoreProvider.state.customState.delete('currentOrderItem')
    UStoreProvider.state.customState.delete('currentOrderItemId')
    UStoreProvider.state.customState.delete('currentOrderItemPriceModel')
    UStoreProvider.state.customState.delete('kitViewModel')
    UStoreProvider.state.customState.delete('lastOrder')
    window.removeEventListener('scroll', this.onScroll, true)
  }

  onScroll() {
    // make sure needed HTML elements exist
    const carousel = document.querySelector('.imageCarousel-component')
    const footer = document.querySelector('.footer')
    const stickyPanel = document.querySelector('.sticky-price-panel')

    if (!stickyPanel || stickyPanel.length === 0 || !carousel || !footer) return

    if (window.scrollY > 80) {
      carousel.classList.add('floating')
    }
    else if (window.scrollY < 80) {
      carousel.classList.remove('floating')
    }

    if (footer.getBoundingClientRect().top <= window.innerHeight) {
      stickyPanel.classList.remove('fixed')
    }
    else {
      stickyPanel.classList.add('fixed')
    }
  }

  setAllKitViewModel(items, object) {
    const kitViewModelToMerge = { kitViewModel: { items: {} } }
    items && Object.keys(items).forEach(key => {
      kitViewModelToMerge.kitViewModel.items[key] = object
    })

    UStoreProvider.state.customState.merge(kitViewModelToMerge)
  }

  onClickContinue() {

    if (this.state.showLoadingOnContinue || this.state.isLoading) return

    const { customState: { currentOrderItem, kitViewModel: { items } } } = this.props

    const hasIncluded = currentOrderItem.Items && currentOrderItem.Items.find(item => item.IsIncluded) !== undefined

    if (!hasIncluded) return

    this.setAllKitViewModel(items, { isPropertiesValid: null })
    this.setState({ doValidate: true, isLoading: true, isLoadingReorder: false })
  }

  onClickContinueAnyway() {
    this.routeToCustomization()
  }

  async routeToCustomization() {
    if (!this.props.router) {
      return null
    }

    const { router: { asPath }, customState: { currentOrderItem } } = this.props

    const updatedFromDB = await UStoreProvider.api.orders.updateOrderItem(currentOrderItem.ID, currentOrderItem)

    //route only if update succeeded
    if (updatedFromDB) {
      if (!asPath.toLowerCase().includes(('?OrderItemID=').toLowerCase())) {
        const href = `${asPath}?OrderItemID=${currentOrderItem.ID}`

        let currentState = window.history.state
        // in Safari, history.state is NULL, so we need to replace it with an object.
        if (currentState === null || currentState === undefined) {
          currentState = { url: '', as: '', options: {} }
        }

        currentState.url = href
        currentState.as = href

        window.history.replaceState(currentState, '', href)
      }

      // now move to the next page (customization)
      Router.pushRoute(urlGenerator.get({ page: 'customization' }) + `?OrderItemID=${currentOrderItem.ID}`)
    }
  }

  onQuantityChange(value, isvalid) {
    const { customState: { currentOrderItem } } = this.props

    if (currentOrderItem.Quantity !== value) {
      this.quantityChangeTriggered = true
      this.onChange(null, kitChangeType.KIT_QUANTITY, { quantity: value })
    }

    this.setState({ isKitQuantityValid: isvalid })

  }

  onCarouselImageChange(index) {
    this.setState({ activeCarouselSlide: index })
  }

  //this function is called when something has changed - kit_quantity/quantity/remove/add/save - price should be recalculate
  onChange(orderItemID, changeType, data) {
    let updatedKitOrderItem
    let orderItem
    let requestID

    //performing a lock in this thread in order to prevent concurrent updates on the OrderItem object
    if (!this.locked) {
      this.locked = true

      const { customState: { currentOrderItem } } = this.props

      updatedKitOrderItem = deepcopy(currentOrderItem)
      const orderItems = updatedKitOrderItem.Items
      switch (changeType) {
        case kitChangeType.KIT_QUANTITY:
          updatedKitOrderItem.Quantity = parseInt(data.quantity)
          break
        case kitChangeType.QUANTITY:
          orderItem = orderItems.find(item => item.ID === orderItemID)
          orderItem.Quantity = parseInt(data.quantity)
          break
        case kitChangeType.REMOVE:
          orderItem = orderItems.find(item => item.ID === orderItemID)
          orderItem.IsIncluded = false
          break
        case kitChangeType.ADD:
          orderItem = orderItems.find(item => item.ID === orderItemID)
          orderItem.IsIncluded = true
          //TODO: set showLoadingOnContinue: true only if item has properties
          this.setState({ showLoadingOnContinue: true })
          break
        case kitChangeType.SAVE:
          break
        default:
        // do nothing t
      }

      //saving the last OrderItemID that made the request in order to know which loader to show
      this.lastChangedOrderItemID = orderItemID

      //saving the last requestID in order to know when the last updated price is returned and show it
      requestID = Math.floor(Math.random() * Math.pow(10, 17)) + 1
      this.lastChangeRequestID = requestID

      UStoreProvider.state.customState.set('currentOrderItem', updatedKitOrderItem)
      this.locked = false
    }

    updatedKitOrderItem && this.onCalculatePrice(updatedKitOrderItem, requestID)
  }

  // A method to calculate the price of this kit OrderItem.
  // The price is calculated with the API and change the price model in the state in order to re render all children.
  // Optional parameter:
  //    - updatedKitOrderItem - an updated kit OrderItem to perform calculation of price according to, if doesnt exist takes the currentOrderItem from the props
  async onCalculatePrice(updatedKitOrderItem, requestID) {
    const { customState: { currentOrderItem } } = this.props

    this.setState({ isPriceCalculating: true })

    const kitOrderItemForPrice = updatedKitOrderItem ? updatedKitOrderItem : currentOrderItem

    const priceModel = await UStoreProvider.api.orders.getPriceOrderItem(kitOrderItemForPrice.ID, kitOrderItemForPrice)

    //validating that the returned price is the one received from the last updated OrderItem object, otherwise discard it.
    if (this.lastChangeRequestID === requestID || !requestID) {
      UStoreProvider.state.customState.set('currentOrderItemPriceModel', priceModel)
      this.setState({ isPriceCalculating: false })
    }
  }

  toggleWarningPopover() {
    this.setState({ showWarningPopover: false })
    const notEdited = document.getElementsByClassName('not-edited')
    notEdited && notEdited.length && notEdited[0].scrollIntoView(true)
  }

  toggleErrorPopover() {
    this.setState({ showErrorPopover: false })
  }

  async onReorder() {
    const { customState: { currentProduct, lastOrder } } = this.props
    this.setState({ isLoading: true, isLoadingReorder: true })
    const newOrder = await UStoreProvider.api.orders.reorder(lastOrder.OrderItemID)
    const newURL = `${urlGenerator.get({ page: 'products', id: currentProduct.FriendlyID, name: decodeStringForURL(currentProduct.Name) })}?OrderItemId=${newOrder.ID}&reorder=true`
    window.location.replace(newURL)
  }

  render() {
    if (!this.props.customState) return null

    const { customState: { currentProduct, currentOrderItem, lastOrder, kitViewModel, currentOrderItemPriceModel, currentOrderItemId } } = this.props

    if (!this.initialDataLoaded && currentProduct) {
      this.initialDataLoaded = true

      this.getData(currentProduct.ID, currentOrderItemId)

      return null
    }

    const { router: { asPath } } = this.props
    const showReorderLink = asPath.includes('reorder')

    const { languageCode } = themeContext.get()

    if (!currentProduct) return null

    const quantityError = this.showItemsErrorOnKit ? t('KitProduct.Validation_kit_quantity_change_invalid_items') : null

    const catalogNumber = currentProduct.CatalogNumber ? ' / ' + currentProduct.CatalogNumber : ''

    const hasIncluded = !currentOrderItem || !currentOrderItem.Items ? null : currentOrderItem.Items.find(item => item.IsIncluded) !== undefined
    const showQuantity = !currentOrderItem ? false : !(!currentProduct.Configuration.Quantity.Changeable && currentOrderItem.Quantity === 1)

    return (
      <div className='kit-product'>
        <div className='main'>
          <div className='relative-size-left desktop-only'>
            <ImageCarousel
              activeSlide={this.state.activeCarouselSlide}
              images={currentProduct.Thumbnails}
              onChange={this.onCarouselImageChange}
            />
          </div>
          <div className='fixed-size-right'>
            {this.state.isLoading && (
              <div className='right-side-loading-container'>
                <div className='loading-content-container'>
                  {this.state.isLoadingReorder && <div className='reorder-loading-msg'>{t('KitProduct.Reorder_loading_msg')}</div>}
                  <LoadingDots />
                </div>
              </div>
            )}

            <div className='kit-name' dangerouslySetInnerHTML={{ __html: `${currentProduct.Name} ${catalogNumber}` }} />
            {lastOrder && !showReorderLink && <div className='kit-reorder'>
              {t('KitProduct.Last_order_notation', {
                OrderSubmittedDate: formatDateByLocale(lastOrder.SubmittedDate, languageCode)
              })}
              <span className='reorder-link' onClick={this.onReorder}>{t('KitProduct.Reorder')}</span>
            </div>}
            {currentProduct.Description && <div className='kit-description'>
              <div dangerouslySetInnerHTML={{ __html: currentProduct.Description }} />
            </div>}
            <div className='image-carousel mobile-only'>
              <div className='carousel-wrapper'>
                <ImageCarousel
                  activeSlide={this.state.activeCarouselSlide}
                  images={currentProduct.Thumbnails}
                  onChange={this.onCarouselImageChange} zoom={false} />
              </div>
            </div>
            {showQuantity && currentOrderItem && <span className='kit-quantity'>
              {t('KitProduct.Quantity')}
              <div className='quantity-wrapper'>
                <KitQuantity
                  onQuantityChange={this.onQuantityChange}
                  productModel={currentProduct}
                  orderModel={currentOrderItem}
                />
                {quantityError && (
                  <div className='quantity-error'>{quantityError}</div>
                )}
              </div>
            </span>}

            <div className='divider' />
            <span className='kit-includes-title'>{t('KitProduct.Kit_includes')}</span>
            <div className='kit-item-list-wrapper'>
              {currentOrderItem && kitViewModel && currentOrderItemPriceModel ?
                <KitItemsList
                  kitOrderItem={currentOrderItem}
                  kitProduct={currentProduct}
                  kitViewModel={kitViewModel}
                  kitOrderItemPriceModel={currentOrderItemPriceModel}
                  doValidate={this.state.doValidate}
                  onCalculatePrice={this.onCalculatePrice}
                  onChange={this.onChange}
                  isPriceCalculating={this.state.isPriceCalculating}
                  lastChangedOrderItemID={this.lastChangedOrderItemID}
                  kitQuantity={currentOrderItem.Quantity}
                />
                :
                <div className='list-loader'>
                  <LoadingDots />
                </div>
              }
            </div>

            <div className='sticky-price-panel fixed'>
              <span className='total-price'>
                {this.state.isPriceCalculating && <LoadingDots />}
                {!this.state.isPriceCalculating && currentOrderItemPriceModel && <Price model={currentOrderItemPriceModel.Total.Price} isMinimumPrice={currentOrderItemPriceModel.Total.IsMinimumPrice} />}
              </span>
              <div
                id='kit-continue-button'
                className='continue-button button button-primary truncate'
                onClick={this.onClickContinue}
                disabled={!hasIncluded || this.state.isLoading}
              >
                {this.state.showLoadingOnContinue ?
                  <LoadingDots />
                  :
                  t('KitProduct.Continue')}
              </div>
              {
                this.state.showWarningPopover &&
                <Popover
                  placement='top'
                  isOpen={this.state.showWarningPopover}
                  target='kit-continue-button'
                  toggle={this.toggleWarningPopover}
                  className="continue-popover warning">
                  <PopoverBody>
                    <div className='continue-popover-message'>
                      {t('KitProduct.Continue_warning_msg')}
                    </div>
                    <div className='popover-buttons'>
                      <div
                        className='button btn-popover-cancel'
                        onClick={this.toggleWarningPopover} >
                        {t('KitProduct.Continue_warning_cancel')}
                      </div>
                      <div
                        className='btn-popover-continue button button-secondary'
                        onClick={this.onClickContinueAnyway} >
                        {t('KitProduct.Continue_warning_continue')}
                      </div>
                    </div>
                  </PopoverBody>
                </Popover>
              }
              {
                this.state.showErrorPopover &&
                <Popover
                  placement='top'
                  isOpen={this.state.showErrorPopover}
                  target='kit-continue-button'
                  toggle={this.toggleErrorPopover}
                  className="continue-popover error">
                  <PopoverBody>
                    <div className='popover-close'><div className='close-btn' onClick={this.toggleErrorPopover}>×</div></div>
                    <div className='continue-popover-message'>
                      {t('KitProduct.Continue_error_msg')}&nbsp;
                      {
                        this.ContinueErrorProperties && this.ContinueErrorQuantity ?
                          <div>
                            <ul>
                              <li>{t('KitProduct.Continue_error_edit_msg')}</li>
                              <li>{t('KitProduct.Continue_error_quantity_msg')}</li>
                            </ul>
                          </div>
                          :
                          this.ContinueErrorProperties ? t('KitProduct.Continue_error_edit_msg') : t('KitProduct.Continue_error_quantity_msg')
                      }
                    </div>
                  </PopoverBody>
                </Popover>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}
export default KitProduct
