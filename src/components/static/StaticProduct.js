import './StaticProduct.scss'
import React, { Component } from 'react'
import { throttle } from 'throttle-debounce'
import ProductLayout from '../product/ProductLayout'
import ProductDetails from '../product/ProductDetails'
import ImageCarousel from '../carousel/ImageCarousel'
import ProductOrderSummary from '../product/ProductOrderSummary'
import ProductProperties from '../product/ProductProperties'
import ProductDeliveryMethod from '../product/ProductDeliveryMethod'
import { UStoreProvider } from '@ustore/core'
import { isOutOfStock } from '../Inventory'
import LoadingDots from '$core-components/LoadingDots'
import { Popover, PopoverBody } from 'reactstrap'
import { ReactComponent as ErrorIcon } from "$assets/icons/error.svg"
import Price from '../Price'
import themeContext from '$ustoreinternal/services/themeContext'
import { ReactComponent as ProofIcon } from "$assets/icons/proof.svg"
import ProductProof from "../product/ProductProof"
import ProductStickyPrice from "../product/ProductStickyPrice"
import ProductApproval from "../product/ProductApproval"
import { t } from '$themelocalization'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import { Router } from '$routes'
import { decodeStringForURL } from '$ustoreinternal/services/utils'
import theme from '$styles/_theme.scss'
import { isServer } from '$ustoreinternal/services/utils'




/**
 * A component that is loaded for displaying a product of type Static
 *
 * @param {object} customState - the entire object from redux state
 * @param {object} router - the information about the current route, query param, etc
 *
 */

export class StaticProduct extends Component {

  constructor(props) {
    super(props)

    this.initialDataLoaded = false
    this.firstPriceCalculated = false

    this.state = {
      isLoading: (props.currentProduct && props.currentProduct.Configuration.Properties && props.currentProduct.Configuration.Properties.length),
      proofApproved: false,
      activeCarouselSlide: 0,
      activeModalCarouselSlide: 0,
      isPriceCalculating: false,
      isQuantityValid: true,
      showErrorPopover: false,
      errorPopoverTarget: null,
      selectedDelivery: null,
      isPreviewModalOpen: false,
      isApprovalModalOpen: false,
      doValidateIframe: false,
      isLoadingReorder: false,
      hideProofLinkFromIframe: false,
    }



    this.promiseResolve = null
    this.promiseReject = null
  }

  oniFrameClick = () => {
    if (document.activeElement.closest('iframe')) {
      this.setState({ showErrorPopover: false })
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll, true)
    window.addEventListener('beforeunload', this.doDataCleanup, true);
    window.addEventListener('blur', this.oniFrameClick, true);
    throttle(250, this.onScroll)					// Call this function once in 250ms only

    this.onScroll()
  }

  doDataCleanup = () => {
    UStoreProvider.state.customState.delete('currentProduct')
    UStoreProvider.state.customState.delete('currentOrderItem')
    UStoreProvider.state.customState.delete('currentOrderItemId')
    UStoreProvider.state.customState.delete('currentOrderItemPriceModel')
    UStoreProvider.state.customState.delete('lastOrder')
    UStoreProvider.state.customState.delete('currentProductThumbnails')
    UStoreProvider.state.customState.delete('currentDeliveryServices')
  }

  componentWillUnmount() {
    this.doDataCleanup()
    window.removeEventListener('scroll', this.onScroll, true)
    window.removeEventListener('blur', this.oniFrameClick, true);
    window.removeEventListener('beforeunload', this.doDataCleanup, true);


  }

  getData = async function (productID, orderItemID) {
    if (!productID) return

    UStoreProvider.state.customState.set({ isLoadingData: true })

    const product = await UStoreProvider.api.products.getProductByID(productID)
    const thumbnails = await UStoreProvider.api.products.getProductThumbnails(productID)
    let orderProduct
    if (orderItemID) {
      orderProduct = await UStoreProvider.api.orders.getOrderItem(orderItemID)
    } else {
      orderProduct = await UStoreProvider.api.orders.addOrderItem(productID)
    }
    const lastOrder = await UStoreProvider.api.orders.getLastOrder(productID) //null

    let deliveryServices = null
    if (product.Configuration.Delivery.Mailing.Enabled)
      deliveryServices = await UStoreProvider.api.orders.getDeliveryServices(orderProduct.ID)
    else
      deliveryServices = {}

    UStoreProvider.state.customState.setBulk({
      currentProduct: product,
      currentProductThumbnails: thumbnails,
      currentOrderItem: orderProduct,
      lastOrder: lastOrder,
      currentDeliveryServices: deliveryServices,
      isLoadingData: false
    })

  }

  componentDidUpdate(prevProps, prevState) {
    const { isPriceCalculating } = this.state
    const { isPriceCalculating: prevIsPriceCalculating } = prevState

    if (!prevIsPriceCalculating && !isPriceCalculating) {
      this.onScroll()
    }

  }

  isInViewport = (el) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 159 && // header height + tooltip height
      rect.left >= 0 &&
      rect.bottom - rect.height <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)

    );
  }

  onScroll = (e) => {

    const topMarker = document.querySelector('.static-product-price')
    const header = document.querySelector('.header')
    const bottomMarker = document.querySelector('.add-to-cart-button')
    const stickyPanel = document.querySelector('.sticky-price')

    const headerHeight = header ? header.getBoundingClientRect().height : 0


    if (stickyPanel && bottomMarker) {

      if (bottomMarker.getBoundingClientRect().top <= window.innerHeight
        || (topMarker && topMarker.getBoundingClientRect().top + topMarker.getBoundingClientRect().height >= headerHeight)) {
        stickyPanel.style.height = '0'
        stickyPanel.style.padding = '0'
      } else {
        stickyPanel.style = {}
      }
    }

    // hide the error popover when scrolling the target out of view.
    if (this.state.showErrorPopover && this.state.errorPopoverTarget) {

      const element = document.querySelector(`#${this.state.errorPopoverTarget}`)
      const isInSticky = element.closest('.sticky-price')
      const isInView = this.isInViewport(element)
      const isStickyHidden = stickyPanel.style.height === '0px'

      if ((!isInSticky && !isStickyHidden) || (isInSticky && isStickyHidden)) this.setState({ showErrorPopover: false })
      else if (!isInView) { this.setState({ showErrorPopover: false }) }
    }
  }

  // A method to calculate the price of this kit OrderItem.
  // The price is calculated with the API and change the price model in the state in order to re render all children.
  // Optional parameter:
  //    - updatedKitOrderItem - an updated kit OrderItem to perform calculation of price according to, if doesnt exist takes the currentOrderItem from the props
  onCalculatePrice = async () => {
    const { customState: { currentOrderItem, currentDeliveryServices, currentProduct } } = this.props
    if (this.state.isLoading || !currentOrderItem || !currentDeliveryServices) return

    this.setState({ isPriceCalculating: true })

    if (currentProduct.Configuration &&
      currentProduct.Configuration.Delivery &&
      currentProduct.Configuration.Delivery.Shipping.Enabled === false &&
      currentProduct.Configuration.Delivery.Mailing.Enabled === true &&
      currentOrderItem.DeliveryMethod === 1) {
      currentOrderItem.DeliveryMethod = 2
      currentOrderItem.DeliveryServiceID = currentDeliveryServices.MailingServices[0].ID
    }

    const priceModel = await UStoreProvider.api.orders.getPriceOrderItem(currentOrderItem.ID, currentOrderItem)

    //validating that the returned price is the one received from the last updated OrderItem object, otherwise discard it.
    UStoreProvider.state.customState.set('currentOrderItemPriceModel', priceModel)
    this.setState({ isPriceCalculating: false })

  }


  onQuantityChange = (value, isValid) => {

    const { customState: { currentOrderItem, currentProduct } } = this.props

    this.setState({ tempQuantity: value })

    const hasProperties = currentProduct.Configuration.Properties && currentProduct.Configuration.Properties.length > 0

    this.setState({ isQuantityValid: isValid }, () => { isValid && !hasProperties && this.saveOrderItem })

    if (isValid && !hasProperties) {
      currentOrderItem.Quantity = value

      UStoreProvider.state.customState.set('currentOrderItem', currentOrderItem)
      this.onCalculatePrice()
    }

  }

  onPropertiesClearValidation = (orderItemID) => {
    this.setState({ doValidateIframe: false })
  }

  onPropertiesStatusChanged = (orderItemID, isValid) => {

    isValid ? this.promiseResolve() : this.promiseReject()

  }

  validateAndSave = async (errorPopoverTarget) => {

    this.setState({ isLoading: true, showErrorPopover: false })

    const { customState: { currentProduct } } = this.props

    const ngValid = this.state.isQuantityValid && (this.state.selectedDelivery || (!currentProduct.Configuration.Delivery.Mailing.Enabled && !currentProduct.Configuration.Delivery.Shipping.Enabled))
    if (!ngValid) {
      this.setState({ isLoading: false, showErrorPopover: true, errorPopoverTarget })
      return false
    }

    // start the iframe validation process by setting the doValidateIframe flag to true which will trigger validation request to the iframe.
    if (currentProduct && currentProduct.Configuration.Properties && currentProduct.Configuration.Properties.length) {
      this.setState({ doValidateIframe: true })

      //create a promise that would be resolved or rejected when iframe returns valid\invalid.
      try {
        await new Promise((resolve, reject) => {
          this.promiseResolve = resolve;
          this.promiseReject = reject;
        });
      } catch (error) {
        this.setState({ isLoading: false, showErrorPopover: true, errorPopoverTarget })

        return false
      }

    }

    await this.saveOrderItem()

    this.setState({ isLoading: false })

    return true
  }

  onPropertiesLoadComplete = (orderItemID) => {
    this.setState({ isLoading: false })
  }

  onContinueClick = async (errorPopoverTarget) => {
    if (this.state.isLoading) return

    const { customState: { currentProduct } } = this.props

    if (!(await this.validateAndSave(errorPopoverTarget))) return


    if (currentProduct.Configuration.Proof && currentProduct.Configuration.Proof.RequireProofApproval) {
      await this.onCalculatePrice()
      this.toggleApprovalModal()
      return
    }

    await this.addToCartOrSave()
    // validation will be done on NG, and if passed, then on iFrame and if that passed as well, saving will happen.
  }

  onUpdatePriceClick = async (errorPopoverTarget) => {
    if (this.state.isLoading) return
    const { customState: { currentOrderItem } } = this.props

    this.setState({ isPriceCalculating: true })

    if (!(await this.validateAndSave(errorPopoverTarget))) {
      this.setState({ isPriceCalculating: false })
      return
    }

    await this.onCalculatePrice()

    this.forceUpdate()


  }

  saveOrderItem = async () => {
    const { customState: { currentOrderItem } } = this.props

    currentOrderItem.Quantity = this.state.tempQuantity ? this.state.tempQuantity : currentOrderItem.Quantity

    // call the update order api
    await UStoreProvider.api.orders.updateOrderItem(currentOrderItem.ID, currentOrderItem)

  }

  addToCartOrSave = async () => {
    const { customState: { currentProduct } } = this.props

    if (this.getIsOutOfStock(currentProduct))
      await this.saveForLater()
    else
      await this.addToCart()
  }

  addToCart = async () => {
    const { customState: { currentOrderItem } } = this.props

    // call the add to cart api and route to cart if succeeds.
    await UStoreProvider.api.orders.addToCart(currentOrderItem.ID)

    this.routeToCart()
  }

  saveForLater = async () => {
    const { customState: { currentOrderItem } } = this.props

    // call the add to cart api and route to cart if succeeds.
    await UStoreProvider.api.orders.saveForLater(currentOrderItem.ID)

    this.routeToCart()
  }

  routeToCart = () => {
    const { state: { currentStore: { StoreType } }, customState: { currentOrderItem } } = this.props
    const { cartUrl } = themeContext.get()

    // handle connectNG store:
    if (StoreType === 3 && cartUrl) {
      const decoded = decodeURIComponent(cartUrl)
      const url = `${decoded}${decoded.includes('?') ? '&' : '?'}OrderProductId=${currentOrderItem.FriendlyID}`
      window.location.href = url
    }
    else {
      Router.pushRoute(urlGenerator.get({ page: 'cart' }))
    }
  }

  toggleErrorPopover = (errorPopoverTarget = '') => {
    this.setState({ showErrorPopover: !this.state.showErrorPopover, errorPopoverTarget })
  }

  onDeliveryChanged = (value, serviceID = null) => {

    const { customState: { currentOrderItem, currentProduct } } = this.props

    currentOrderItem.DeliveryMethod = value
    currentOrderItem.DeliveryServiceID = serviceID

    UStoreProvider.state.customState.set('currentOrderItem', currentOrderItem)

    this.setState({ selectedDelivery: value }, this.onCalculatePrice)
  }

  toggleProofModal = () => {
    this.setState({ isPreviewModalOpen: !this.state.isPreviewModalOpen })
  }

  toggleApprovalModal = () => {
    this.setState({ isApprovalModalOpen: !this.state.isApprovalModalOpen })
  }

  getMinQuantity = (currentProduct) => {
    return currentProduct.Configuration &&
      currentProduct.Configuration.Quantity &&
      currentProduct.Configuration.Quantity.Minimum ? currentProduct.Configuration.Quantity.Minimum : 0
  }

  getIsOutOfStock = (currentProduct) => {

    const minQuantity = this.getMinQuantity(currentProduct)

    return currentProduct.Inventory && isOutOfStock(currentProduct.Inventory && currentProduct.Inventory.Quantity, minQuantity, currentProduct.Inventory && currentProduct.Inventory.AllowOutOfStockPurchase)

  }

  onReorder = async () => {
    const { customState: { currentProduct, lastOrder } } = this.props
    this.setState({ isLoading: true, isLoadingReorder: true })
    const newOrder = await UStoreProvider.api.orders.reorder(lastOrder.OrderItemID)
    const newURL = `${urlGenerator.get({ page: 'products', id: currentProduct.FriendlyID, name: decodeStringForURL(currentProduct.Name) })}?OrderItemId=${newOrder.ID}&reorder=true`
    window.location.replace(newURL)
  }

  handleIframeMessages = (e) => {

    const { customState: { currentOrderItem } } = this.props

    if (!currentOrderItem) return

    // almost all messages are handled inside the generic iFrameHelper.
    // since this message is only for static product, then we dont want to handle it in the generic helper.]
    if (e.data.type === '@PRODUCTION_OUTPUT_HAS_VALUE') {
      const msgOrderItemID = e.data.data.orderItemID
      if (msgOrderItemID && msgOrderItemID === currentOrderItem.ID) {
        // this message means that we need to hide the view proof link.
        this.setState({ hideProofLinkFromIframe: true })
      }
    }
  }

  render() {


    const { customState } = this.props
    if (!customState || !customState.currentProduct) {
      return null
    }

    const { currentProduct, currentOrderItem, currentOrderItemId, isLoadingData } = customState

    if (isLoadingData) {
      return null
    }

    if (isServer()) {
      return null
    }

    if (!this.initialDataLoaded && currentProduct) {
      this.initialDataLoaded = true
      this.getData(currentProduct.ID, currentOrderItemId)
      return null
    }

    const { customState: { currentOrderItemPriceModel, currentProductThumbnails, lastOrder, currentDeliveryServices }, state: { currentStore: { TaxFormatType }, currentCurrency } } = this.props

    if (!currentOrderItem || !currentDeliveryServices) {
      return null
    }

    const { languageCode } = themeContext.get()

    if (!this.firstPriceCalculated) {
      this.firstPriceCalculated = true
      this.onCalculatePrice()
    }

    const minQuantity = this.getMinQuantity(currentProduct)
    const isProductOutOfStock = this.getIsOutOfStock(currentProduct)
    const addOrSaveText = isProductOutOfStock ? t('product.save_for_later') : t('product.add_to_cart')
    const continueButtonText = currentProduct.Configuration.Proof && currentProduct.Configuration.Proof.RequireProofApproval ? t('product.review_approve') : addOrSaveText

    const { router: { asPath } } = this.props
    const showReorderLink = !asPath.includes('reorder')

    const hasProperties = currentProduct.Configuration.Properties && currentProduct.Configuration.Properties.length > 0
    const showPricing = currentProduct && currentOrderItemPriceModel && currentProduct.HasPricing && currentOrderItemPriceModel.Price !== null

    const priceComponent = currentOrderItemPriceModel !== undefined && showPricing
      ? (
        <div className='static-product-price'>
          <div className='total-price'>
            {this.state.isPriceCalculating || !currentOrderItemPriceModel || currentOrderItemPriceModel === undefined ?
              <LoadingDots />
              :
              <div className='price-wrapper'>
                <Price model={currentOrderItemPriceModel.Price}
                  showCurrency
                  isMinimumPrice={currentOrderItemPriceModel.IsMinimumPrice} />

              </div>
            }
            {hasProperties &&
              <span className={`price-details-link ${this.state.isLoading ? 'hidden' : ''}`} id='update-price' onClick={this.onUpdatePriceClick.bind(this, 'update-price')}>
                {t('productPrice.updatePrice')}
              </span>
            }
          </div>
        </div>
      ) : null

    const getViewProofComponent = (currentProduct, isMobile, hasThumbnails = true, orderItemID) => {
      if (!currentProduct || !currentProduct.Proof) return null

      if (this.state.hideProofLinkFromIframe) return null

      const fileURL = `${currentProduct.Proof.Url}&OrderItemID=${orderItemID}`

      // if mobile && not image OR desktop and not image and not PDF -> download instead of modal
      const isDownloadProof = currentProduct.Proof &&
        ((isMobile && !currentProduct.Proof.MimeType.startsWith('image/')) ||
          (!isMobile && currentProduct.Proof.MimeType !== "application/pdf" &&
            !currentProduct.Proof.MimeType.startsWith('image/')))

      if (!isMobile) {
        if (isDownloadProof) {
          return <a download className="view-proof-wrapper desktop" href={fileURL} >
            <div className="view-proof">
              <ProofIcon className="view-proof-icon" width="20px" height="24px" />
              <div className="view-proof-title">{t('product.view_proof')}</div>
            </div>
          </a >
        }

        return < div className="view-proof-wrapper desktop" onClick={this.toggleProofModal} >
          <div className="view-proof">
            <ProofIcon className="view-proof-icon" width="20px" height="24px" />
            <div className="view-proof-title">{t('product.view_proof')}</div>
          </div>
        </div >
      }
      else {
        // mobile
        if (isDownloadProof) {
          return <a download className={`view-proof-wrapper mobile ${hasThumbnails ? '' : 'no-thumbs'}`} href={fileURL}>
            <ProofIcon className="view-proof-icon" width="20px" height="24px" />
          </a>
        }

        return <div className={`view-proof-wrapper mobile ${hasThumbnails ? '' : 'no-thumbs'}`} onClick={this.toggleProofModal}>
          <ProofIcon className="view-proof-icon" width="20px" height="24px" />
        </div>

      }


    }

    const isMobile = document.body.clientWidth < parseInt(theme.md.replace('px', ''))

    const proofURL = currentProduct.Proof ? `${currentProduct.Proof.Url}&OrderItemID=${currentOrderItem.ID}` : null

    return <ProductLayout className='static-product'>
      <left is="custom">
        <ImageCarousel
          showTitle={true}
          scale={0.8}
          activeSlide={this.state.activeCarouselSlide}
          images={currentProductThumbnails.Thumbnails}
          onChange={this.onCarouselImageChange}
        />
        {
          getViewProofComponent(currentProduct, false, true, currentOrderItem.ID)
        }
      </left>
      <right is="custom">
        {this.state.isLoadingReorder &&
          <div className='loading-content-container'>
            <LoadingDots />
          </div>
        }
        <ProductDetails
          className='static-product'
          productModel={currentProduct}
          minimumQuantity={minQuantity}
          reorderModel={showReorderLink ? lastOrder : null}
          onReorder={this.onReorder}
          showInStock={true}
          langCode={languageCode}
        />
        {isMobile && <div className='image-carousel-mobile'>
          <ImageCarousel
            zoomAllowed={false}
            activeSlide={this.state.activeCarouselSlide}
            images={currentProductThumbnails.Thumbnails}
            onChange={() => { }}
          />
          {
            getViewProofComponent(currentProduct, true, currentProductThumbnails && currentProductThumbnails.Thumbnails.length > 1)
          }
        </div>}
        {priceComponent}
        <div className='static-product-wizard'>
          <ProductProperties
            className='static-product-properties'
            productModel={currentProduct}
            orderModel={currentOrderItem}
            onQuantityChange={this.onQuantityChange}
            onStatusChanged={this.onPropertiesStatusChanged}
            onLoadComplete={this.onPropertiesLoadComplete}
            onCalculatePrice={this.onCalculatePrice}
            isPriceCalculating={this.state.isPriceCalculating}
            doValidate={this.state.doValidateIframe}
            clearValidateActionFlag={this.onPropertiesClearValidation}
            onIframeMessageRecieved={this.handleIframeMessages}
          />
        </div>
        <ProductDeliveryMethod
          className='static-delivery-method'
          productModel={currentProduct}
          onDeliveryChange={this.onDeliveryChanged}
          currentDeliveryMethod={currentOrderItem ? currentOrderItem.DeliveryMethod : null}
          currentDeliveryServiceID={currentOrderItem ? currentOrderItem.DeliveryServiceID : null}
          deliveryServices={currentDeliveryServices ? currentDeliveryServices : null}

        />
        <ProductOrderSummary
          currency={currentCurrency.Code}
          deliveryMethod={this.state.selectedDelivery}
          className='static-order-summary'
          productModel={currentProduct}
          quantity={currentOrderItem.Quantity}
          taxFormatType={TaxFormatType}
          priceModel={currentOrderItemPriceModel}
          isPriceCalculating={this.state.isPriceCalculating}
          onUpdatePrice={this.onUpdatePriceClick.bind(this, 'summary-table-link')}
        />
        <ProductProof
          onAddToCartClick={this.onContinueClick}
          isModalOpen={this.state.isPreviewModalOpen}
          modalClassName="static-product-proof-modal"
          src={proofURL}
          type={currentProduct.Proof && currentProduct.Proof.MimeType ? currentProduct.Proof.MimeType : ''}
          onCloseModal={this.toggleProofModal}
          isMobile={isMobile} />
        <ProductApproval
          isModalOpen={this.state.isApprovalModalOpen}
          src={proofURL}
          type={currentProduct.Proof && currentProduct.Proof.MimeType ? currentProduct.Proof.MimeType : ''}
          onCloseModal={this.toggleApprovalModal}
          onAddToCartClick={this.addToCartOrSave}
          addToCartBtnText={addOrSaveText}
          checkboxText={currentProduct.Configuration && currentProduct.Configuration.Proof && currentProduct.Configuration.Proof.ProofApprovalText}
          errorText={currentProduct.Configuration && currentProduct.Configuration.Proof && currentProduct.Configuration.Proof.ProofApprovalValidationMessage}
        />
        <div
          id="add-to-cart-button"
          className='button button-primary add-to-cart-button'
          onClick={this.onContinueClick.bind(this, 'add-to-cart-button')}
        >
          {this.state.isLoading || this.state.isPriceCalculating ? <LoadingDots /> : continueButtonText}
        </div>
      </right>
      <sticky className='hidden' is="custom">
        {
          this.state.showErrorPopover &&
          <Popover
            placement='top'
            isOpen={this.state.showErrorPopover}
            target={this.state.errorPopoverTarget ? this.state.errorPopoverTarget : 'add-to-cart-button'}
            toggle={this.toggleErrorPopover}
            className="error-popover">
            <PopoverBody>
              <div className='popover-close'>
                {/* <div className='close-btn' onClick={this.toggleErrorPopover}>×</div> */}
              </div>
              <ErrorIcon className='error-icon' width='15px' height='15px' />
              <div className='popover-message'>
                {t('product.validation_error')}
              </div>
            </PopoverBody>
          </Popover>
        }
        <ProductStickyPrice longPrice={TaxFormatType === 3}
          disabled={this.state.isLoading || this.state.isPriceCalculating}
          onClick={this.onContinueClick}
          addToCartBtnText={continueButtonText}
          priceModel={currentOrderItemPriceModel}
          onUpdatePrice={this.onUpdatePriceClick.bind(this, 'sticky-update-price')}
          showUpdatePriceLink={hasProperties && showPricing}
          isPriceLoading={this.state.isLoading || this.state.isPriceCalculating}
        />
      </sticky>
    </ProductLayout >
  }
}

export default StaticProduct
