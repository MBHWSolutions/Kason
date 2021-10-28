/**
 * A component to display and manage all items of a product of type Kit.
 *
 * @param {object} kitProduct - the kit product that is currently in redux state
 * @param {object} kitOrderItem - the order item of the kit product that is currently in redux state
 * @param {object} kitViewModel - the view model of this kit item, with all the information about displaying himself and its items
 * @param {object} [kitOrderItemPriceModel] - the price model of the kit order item that is currently in redux state
 * @param {boolean} [doValidate] - a flag to denotes a required action of validation, this flag is set from the parent component and passed to the children
 * @param {function} [onCalculatePrice] - a callback to signal that the price should be recalculated
 * @param {function} [onChange] - a callback to signal that one of the items were changed (added/removed/quantity/properties save)
 * @param {boolean} [isPriceCalculating] - a flag to indicate if the price is in loading state, this flag is set from the parent component and passed to the children
 * @param {number} lastChangedOrderItemID - the ID of the last orderItem that were changed, this should come as prop from parent component in order for the parent to manage this in case of concurrent actions from UI
 * @param {number} kitQuantity - the Quantity of the kit itself, to pass to the items, used for validation of quantity.
 */

import React, { Component } from 'react'
import KitItem from './KitItem'

class KitItemsList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      doValidate: false
    }
    this.doLoadIframes = false

    this.onItemChange = this.onItemChange.bind(this)
  }

  static getDerivedStateFromProps(props, state) {
    if (props.doValidate && !state.doValidate) {
      return { doValidate: true }
    }
    return { doValidate: false }
  }

  componentDidMount() {
    this.doLoadIframes = true
  }

  onItemChange(orderItemID, changeType, data) {
    const { onChange } = this.props

    onChange && onChange(orderItemID, changeType, data)
  }

  render() {
    const { kitProduct, kitOrderItem, kitViewModel, kitOrderItemPriceModel, doValidate, isPriceCalculating, lastChangedOrderItemID, kitQuantity } = this.props

    if (!kitProduct || !kitOrderItem || !kitViewModel) {
      return null
    }
    const { Items: productItems } = kitProduct
    let { Items: orderItems } = kitOrderItem

    if (!productItems || !orderItems) {
      return null
    }
    return orderItems.map((orderItem, i) => {
      const productItem = productItems.find(
        kitProductItem => kitProductItem.Product.ID === orderItem.ProductID
      )
      const orderItemPriceModel = kitOrderItemPriceModel && kitOrderItemPriceModel.Items.find(
        kitItemPriceModel => kitItemPriceModel.OrderItemID === orderItem.ID
      )

      //show loading for price if all these conditions exist:
      //  - isPriceCalculating flag is true
      //  - the item is included
      //  - there is no lastChangedOrderItemID, or there is a lastChangedOrderItemID its this item
      //otherwise: dont show loading
      const isPriceCalculatingForItem =
        isPriceCalculating && orderItem.IsIncluded && (!lastChangedOrderItemID || (lastChangedOrderItemID && lastChangedOrderItemID === orderItem.ID))

      const kitItemViewModel = kitViewModel.items[orderItem.ID]

      return (
        productItem && (
          <KitItem
            key={i}
            kitItemOrderItemModel={orderItem}
            kitItemProductModel={productItem.Product}
            kitItemViewModel={kitItemViewModel}
            kitItemPriceModel={orderItemPriceModel}
            onChange={this.onItemChange}
            doLoadIframe={this.doLoadIframes}
            doValidate={doValidate}
            isPriceCalculating={isPriceCalculatingForItem}
            kitQuantity={kitQuantity}
          />
        )
      )
    })
  }
}

export default KitItemsList
