/**
 * A component to display quantity input based on quantity data model
 *
 * @param {function} onQuantityChange(value, isValid) - a callback fired when quantity was changed.
 * @param {object} productModel
 * @param {object} orderModel
 * @param {supportsInventory} boolean
 */

import React, { Component } from 'react'
import './ProductQuantity.scss'
import BaseQuantity from '../product/BaseQuantity'
import { t } from '$themelocalization'


class ProductQuantity extends Component {

  constructor(props) {
    super(props)

    this.state = {
      errorMessage: ''
    }

    this.onChange = this.onChange.bind(this)
    this.getValidationErrorMessage = this.getValidationErrorMessage.bind(this)
  }


  componentDidMount() {
    const { productModel: { Configuration: { Quantity } }, orderModel } = this.props
    // run onChange on mount, to show validation errors on default value.
    if ((Quantity.Changeable && Quantity.Options === null)) {
      // text box
      this.onChange({ target: { value: orderModel.Quantity } })
    }
  }

  getValidationErrorMessage(value) {
    const { productModel: { Configuration: { Quantity: { Minimum, Maximum } } }, productModel: { Unit, Inventory }, supportsInventory } = this.props

    const inventory = supportsInventory && Inventory ? Inventory.Quantity : null

    if (!value || isNaN(value)) {
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

    const value = e.target.value
    const errorMessage = this.getValidationErrorMessage(value)

    this.setState({ errorMessage })

    // send new value and error (if any, null if valid) to parent.
    onQuantityChange(value, errorMessage === null)

  }

  render() {

    const { productModel: { Configuration: { Quantity }, ID, Unit }, orderModel } = this.props

    // if no Configuration or if value = 1 and read only => dont show anything
    if (!Quantity) {
      return null
    }
    const additionalClassName = this.state.errorMessage ? 'not-valid' : ''

    const itemUnitName = Unit.PackType ?
      `${Unit.PackType.PluralName}`
      : Unit.ItemType ? Unit.ItemType.PluralName : ''

    const packDesc = Unit.PackType ? ` (${t('product.packs_notation',
      {
        PackTypeName: Unit.PackType.Name,
        ItemQuantity: Unit.ItemQuantity,
        ItemTypePluralName: Unit.ItemType.PluralName
      })})` : ''

    return (<div className='product-quantity-component'>
      <BaseQuantity
        quantityConfig={Quantity}
        additionalClassName={additionalClassName}
        quantity={orderModel.Quantity}
        id={ID}
        onChange={this.onChange}
      />
      <span className='quantity-units'>{itemUnitName}</span>
      {Unit.PackType && <span className='pack-description'>{packDesc}</span>}
      {this.state.errorMessage && (<span className='quantity-error'>{this.state.errorMessage}</span>)}
    </div>)

  }
}

export default ProductQuantity

