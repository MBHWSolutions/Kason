/**
 * A component to display quantity input based on quantity data model
 *
 * @param {function} onQuantityChange(value, isValid) - a callback fired when quantity was changed.
 * @param {object} productModel
 * @param {object} orderModel
 */

import React, { Component } from 'react'
import './KitQuantity.scss'
import BaseQuantity from '../product/BaseQuantity'
import { t } from '$themelocalization'


class KitQuantity extends Component {

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
        const { productModel: { Configuration: { Quantity: { Minimum, Maximum } } }, productModel: { Unit } } = this.props

        if (!value || isNaN(value)) {
            return t('KitQuantity.Validation_required')
        }

        if (Minimum && Number(value) < Minimum) {
            return t('KitQuantity.Validation_minimum', { MinimumQuantity: Minimum })
        }

        if (Maximum && Number(value) > Maximum) {
            return t('KitQuantity.Validation_maximum', { MaximumQuantity: Maximum })
        }

        return null

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

        const { productModel: { Configuration: { Quantity }, ID }, orderModel } = this.props

        // if no Configuration or if value = 1 and read only => dont show anything
        if (!Quantity || (!Quantity.Changeable && orderModel.Quantity === 1)) {
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
            {this.state.errorMessage && (
                <span className='quantity-error'>{this.state.errorMessage}</span>
            )}
        </div>)

    }
}

export default KitQuantity

