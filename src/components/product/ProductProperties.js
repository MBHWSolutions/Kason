import React, { Component } from 'react'
import './ProductProperties.scss'
import ProductQuantity from './ProductQuantity'
import IFrameHelper from './IFrameHelper'
import LoadingDots from '$core-components/LoadingDots'
import { t } from '$themelocalization'
import { ReactComponent as ErrorIcon } from "$assets/icons/error.svg"


/**
 * A component that is
 *
 * @param {string} className -
 * @param {object} productModel -
 * @param {object} orderModel -
 * @param {function} onQuantityChange -
 * @param {function} onCalculatePrice -
 * @param {function} onLoadComplete
 * @param {boolean} isPriceCalculating -
 * @param {function} onStatusChanged - inform validation result
 * @param {function} clearValidateActionFlag -
 * @param {boolean} doValidate
 *
 */


class ProductProperties extends Component {
  constructor(props) {
    super(props)

    this.state = {
      doValidateIframe: false,
      isIframeLoaded: false,
      isIframeValid: null,
      //TEST DATA
      propertiesErrors: [],
      onLineErrors: []
    }

    this.iframeSrc = ''
  }

  static getDerivedStateFromProps(props, state) {
    if (props.doValidate && !state.doValidateIframe) {
      return { ...state, doValidateIframe: true }
    }

    return { ...state, doValidateIframe: false }
  }

  onIframeLoaded = (orderItemID) => {
    const { onLoadComplete } = this.props
    this.setState({ isIframeLoaded: true })
    onLoadComplete && onLoadComplete(orderItemID)
  }

  onIframeStatusChange = (orderItemID, isValid, errors, onLineErrors) => {
    const { onStatusChanged } = this.props
    this.setState({ isIframeValid: isValid, propertiesErrors: errors, onLineErrors: onLineErrors })
    onStatusChanged && onStatusChanged(orderItemID, isValid)
  }

  onOnlineErrors = (orderItemID, errors) => {
    this.setState({ onLineErrors: errors, isIframeValid: errors.length === 0 })
  }

  clearValidateActionFlag = () => {
    const { clearValidateActionFlag, orderModel: { ID } } = this.props

    if (this.state.doValidateIframe) this.setState({ doValidateIframe: false })
    clearValidateActionFlag && clearValidateActionFlag(ID, false)
  }

  render() {
    const { className, productModel, orderModel, onQuantityChange, isPriceCalculating, onIframeMessageRecieved } = this.props
    const { propertiesErrors, onLineErrors } = this.state

    if (!productModel) {
      return null
    }

    return (
      <div className={` ${className} product-properties`}>
        <div className='quantity'>
          <span className='quantity-label'>{t('product.quantity')}</span>
          <ProductQuantity supportsInventory={true} productModel={productModel} orderModel={orderModel} onQuantityChange={onQuantityChange} />
          {/* <span className='quantity-units'>{itemUnitName}</span> */}
        </div>
        {(propertiesErrors.length > 0 || onLineErrors.length > 0) && (
          <div className='properties-errors'>
            {propertiesErrors.map(err =>
              <div className='error' key='err'>
                <ErrorIcon width='12px' height='12px' className='error-icon' />
                <div className='error-text'>{err}</div>
              </div>
            )}
            {onLineErrors.map(err =>
              <div className='error' key='err'>
                <ErrorIcon width='12px' height='12px' className='error-icon' />
                <div className='error-text'>{err}</div>
              </div>
            )}
          </div>
        )}
        {productModel.Configuration.Properties.length > 0 && <div className='properties-iframe-container'>
          {!this.state.isIframeLoaded && <LoadingDots />}
          <IFrameHelper
            className={!this.state.isIframeLoaded ? 'iframe-hidden' : ''}
            orderItemID={orderModel.ID}
            onLoaded={this.onIframeLoaded}
            doValidate={this.state.doValidateIframe}
            onStatusChanged={this.onIframeStatusChange}
            onValidateReceived={this.clearValidateActionFlag}
            onOnlineErrors={this.onOnlineErrors}
            onMessageRecievedFromIframe={onIframeMessageRecieved}
          />
        </div>}
      </div>
    )
  }
}

export default ProductProperties