/**
 * A component to display quantity input based on quantity data model
 *
 * @param {function} onQuantityChange(value, isValid) - a callback fired when quantity was changed.
 * @param {object} productModel
 * @param {object} orderModel
 * @param {supportsInventory} boolean
 */

import React, { Component } from 'react'
import './ProductItemQuantity.scss'
import BaseQuantity from './product/BaseQuantity'
import { t } from '$themelocalization'
import { Tooltip } from 'reactstrap'
import { isServer } from '$ustoreinternal/services/utils'

class ProductItemQuantity extends Component {

  constructor(props) {
    super(props)

    this.state = {
      errorMessage: '',
      showErrorTooltip: false,
      errorTooltipTarget: ''
    }

    this.onChange = this.onChange.bind(this)
    this.getValidationErrorMessage = this.getValidationErrorMessage.bind(this)
  }

  getValidationErrorMessage(value) {
    const { productModel: { Configuration: { Quantity: { Minimum, Maximum } } }, productModel: { Unit, Inventory }, supportsInventory } = this.props

    const inventory = supportsInventory && Inventory ? Inventory.Quantity : null

    if (value === null || value === undefined || isNaN(value)) {
      return <span className='validation-required'>{t('KitQuantity.Validation_required')}</span>
    }

    if (Minimum && Number(value) < Minimum) {
      return <span className='validation-minimum'>{t('KitQuantity.Validation_minimum', { MinimumQuantity: Minimum })}</span>
    }

    if (Maximum && Number(value) > Maximum) {
      return <span className='validation-maximum'>{t('KitQuantity.Validation_maximum', { MaximumQuantity: Maximum })}</span>
    }

    if (inventory && Number(value) > inventory && !Inventory.AllowOutOfStockPurchase) {
      return <span className='validation-inventory'>{t('KitQuantity.Validation_inventory', { InventoryQuantity: inventory })}</span>
    }

    return null

  }

  onChange(e) {
    const { onQuantityChange } = this.props

    const value = parseInt(e.target.value)
    const errorMessage = this.getValidationErrorMessage(value)
    this.setState({ errorMessage, showErrorTooltip: !!errorMessage, errorTooltipTarget: e.target.id })

    // send new value and isValid to parent.
    onQuantityChange(value, !errorMessage)

  }

  render() {

    const { productModel: { Configuration: { Quantity }, ID, Unit }, orderModel } = this.props

    // if no Configuration dont show anything
    if (!Quantity) {
      return null
    }
    const additionalClassName = this.state.errorMessage ? 'not-valid' : ''
    const targetExist = !isServer() && document.getElementById(`${this.state.errorTooltipTarget}`)

    return (<div className="product-item-quantity">
      <BaseQuantity
        quantityConfig={Quantity}
        additionalClassName={additionalClassName}
        quantity={orderModel.Quantity}
        id={ID}
        onChange={this.onChange}
        showMinimalDisplay={true}
      />
      {
        this.state.showErrorTooltip && targetExist &&
        <Tooltip placement='bottom' isOpen={true} target={this.state.errorTooltipTarget}
          className="quantity-error-tooltip">
          {this.state.errorMessage}
        </Tooltip>
      }
    </div>)
  }
}

export default ProductItemQuantity

