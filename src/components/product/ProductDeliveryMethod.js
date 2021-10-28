import React, { Component } from 'react'
import './ProductDeliveryMethod.scss'
import RadioGroup from '$core-components/RadioGroup'
import { t } from '$themelocalization'


/**
 * A component that is
 *
 * @param {string} className -
 * @param {object} productModel -
 * @param {function} onDeliveryChange -
 * @param {number} currentDeliveryMethod
 * @param {string} currentDeliveryServiceID
 * @param {array} deliveryServices
 *
 */


class ProductDeliveryMethod extends Component {
  deliveryOptions = []

  constructor(props) {
    super(props)

    this.state = {
      selectedDelivery: null,
    }
  }

  componentDidMount() {
    const { onDeliveryChange, productModel, currentDeliveryMethod, currentDeliveryServiceID, deliveryServices } = this.props
    if (!productModel || !productModel.Configuration || !productModel.Configuration.Delivery || !productModel.Configuration.Delivery.Shipping.Enabled && !productModel.Configuration.Delivery.Mailing.Enabled) {
      return null
    }


    this.setState({ selectedDelivery: currentDeliveryServiceID ? currentDeliveryServiceID : currentDeliveryMethod })
    onDeliveryChange && onDeliveryChange(currentDeliveryMethod, currentDeliveryServiceID)
  }

  static getDerivedStateFromProps(props, state) {
    if (props.selectedDelivery && props.selectedDelivery !== state.selectedDelivery) {
      return { selectedDelivery: props.selectedDelivery }
    }

    return null
  }

  onDeliveryChanged = (value, obj) => {
    const { onDeliveryChange } = this.props

    this.setState({ selectedDelivery: value })
    onDeliveryChange && onDeliveryChange(obj && obj.isMailing ? 2 : value, obj && obj.isMailing ? value : null)
  }

  render() {
    const { className, productModel, deliveryServices } = this.props


    if (!productModel) { // || !isMultiple || !productModel.Configuration.Delivery.Shipping.Enabled && !productModel.Configuration.Delivery.Mailing.Enabled) {
      return null
    }

    this.deliveryOptions = [
      {
        value: 1,
        label: t('product.shipping'),
        enabled: productModel.Configuration && productModel.Configuration.Delivery && productModel.Configuration.Delivery.Shipping.Enabled,
        isMailing: false
      },
      // { value: 2, label: 'Mail Drop', enabled: productModel.Configuration.Delivery.Mailing.Enabled }
    ]
    if (deliveryServices && deliveryServices.MailingServices && deliveryServices.MailingServices.length) {
      deliveryServices.MailingServices.forEach((service) => {
        this.deliveryOptions.push(
          {
            value: service.ID,
            label: service.Name,
            enabled: productModel.Configuration && productModel.Configuration.Delivery && productModel.Configuration.Delivery.Mailing.Enabled,
            isMailing: true
          })
      })
    }

    const enabledOptions = this.deliveryOptions.filter(item => item.enabled)

    if (!enabledOptions || enabledOptions.length <= 1) {
      return null
    }

    return <div className={`${className} product-delivery-method`}>
      <div className='delivery-method'>
        <div className='delivery-method-label'>
          <span>{t('product.delivery')}</span><span className='required-indicator'>*</span>
        </div>
        <RadioGroup
          groupName='delivery'
          className={'static-delivery'}
          options={this.deliveryOptions.filter(d => d.enabled)}
          selectedValue={this.state.selectedDelivery}
          onChange={this.onDeliveryChanged}
        />
      </div>
    </div>
  }
}

export default ProductDeliveryMethod