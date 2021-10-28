/**
 * A component to display quantity input based on quantity data model
 *
 * @param {function} onQuantityChange(value, isValid) - a callback fired when quantity was changed.
 * @param {number} kitQuantity - the number of Kits (to multiply in case of Component Quantity)
 * @param {object} productModel
 * @param {object} orderModel
 */

import React, { Component } from 'react'
import './KitQuantity.scss'
import { Tooltip } from 'reactstrap';
import BaseQuantity from '../product/BaseQuantity'
import { t } from '$themelocalization'

class KitItemQuantity extends Component {

    constructor(props) {
        super(props)

        this.state = {
            errorMessage: ''
        }

        this.onChange = this.onChange.bind(this)
        this.getValidationErrorMessage = this.getValidationErrorMessage.bind(this)
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.kitQuantity !== this.props.kitQuantity && !isNaN(this.props.kitQuantity)) {
            const { orderModel } = this.props
            this.onChange({ target: { value: orderModel.Quantity } })
        }

    }

    componentDidMount() {
        const { orderModel } = this.props

        if (!orderModel) {
            return
        }

        // run onChange on mount, to show validation errors on default value.
        this.onChange({ target: { value: orderModel.Quantity } })

    }

    getValidationErrorMessage(value) {
        const { productModel: { Unit, Configuration: { Quantity: { Minimum, Maximum } }, Inventory }, kitQuantity } = this.props

        const itemUnitName = Unit.PackType ? Unit.PackType.PluralName : Unit.ItemType ? Unit.ItemType.PluralName : ''

        const inventory = Inventory ? Inventory.Quantity : null

        if (!value || isNaN(value)) {
            return t('KitQuantity.Validation_required')
        }

        if (Minimum && Number(value) < Minimum) {
            return t('KitQuantity.Validation_minimum', { MinimumQuantity: Minimum })
        }

        if (Maximum && Number(value) * kitQuantity > Maximum) {
            return kitQuantity === 1 ?
                t('KitQuantity.Validation_maximum', { MaximumQuantity: Maximum })
                :
                `${t('KitQuantity.Validation_maximum', { MaximumQuantity: Maximum })}. 
                    ${t('KitQuantity.Validation_quantity_multiplier', {
                    Quantity: Number(value),
                    UnitPluralName: itemUnitName,
                    KitQuantity: kitQuantity,
                    TotalQuantity: kitQuantity * Number(value)
                })}
                `
        }

        if (inventory && Number(value) * kitQuantity > inventory && !Inventory.AllowOutOfStockPurchase) {
            return kitQuantity === 1 ?
                t('KitQuantity.Validation_inventory', { InventoryQuantity: inventory })
                :
                `${t('KitQuantity.Validation_inventory', { InventoryQuantity: inventory })}
                ${t('KitQuantity.Validation_quantity_multiplier', {
                    Quantity: Number(value),
                    UnitPluralName: itemUnitName,
                    KitQuantity: kitQuantity,
                    TotalQuantity: kitQuantity * Number(value)
                })}`
        }

        return null // valid

    }

    onChange(e) {
        const { onQuantityChange } = this.props

        const value = e.target.value
        const errorMessage = this.getValidationErrorMessage(value)

        this.setState({ errorMessage: errorMessage })

        // send new value and error (if any, null if valid) to parent.
        onQuantityChange(value, errorMessage === null)

    }

    render() {
        const { productModel, orderModel } = this.props

        if (!productModel || !orderModel) {
            return null
        }

        const { Configuration: { Quantity }, ID } = productModel

        if (!Quantity) {
            return null
        }
        const additionalClassName = this.state.errorMessage ? 'not-valid' : ''

        return (<div className='kit-quantity-component'>
            <BaseQuantity
              quantityConfig={Quantity}
              additionalClassName={additionalClassName}
              quantity={orderModel.Quantity}
              id={ID}
              onChange={this.onChange}
            />
            {this.state.errorMessage &&
            <Tooltip className='quantity-error-tooltip' placement="bottom" isOpen={true} target={'quantity_' + ID}>
                {this.state.errorMessage}
            </Tooltip>
            }
        </div>)

    }
}

export default KitItemQuantity

