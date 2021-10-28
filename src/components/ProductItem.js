/**
 * A component to display a product's photo, title and more info
 *
 * @param {object} model - ProductModel containing data of the product
 * @param {number} productNameLines - max lines of product name (default is 2)
 * @param {number} descriptionLines - max lines of short description (default is 4)
 * @param {boolean} detailed - controls the display - if true the description of the product should show, otherwise hide
 * @param {string} url - the url to redirect to when clicking the product
 * @param {string} [className] - a class name to place on the product element
 */

import React, { Component } from 'react'
import './ProductItem.scss'
import { Router } from '$routes'
import Price from './Price'
import UnitsOfMeasure from "./UnitsOfMeasure"
import Inventory from "./Inventory"
import HTMLLinesEllipsis from 'react-lines-ellipsis/lib/html'
import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC'
import ImageLoader from '$core-components/ImageLoader'
import ProductItemQuantity from './ProductItemQuantity'
import Icon from '$core-components/Icon'
import { t } from '$themelocalization'
import Button from '$core-components/Button'
import LoadingDots from '$core-components/LoadingDots'
import { UStoreProvider } from '@ustore/core'

// using this ResponsiveEllipsis will handle responsive changes to the lineEllipsis component.
const ResponsiveHTMLEllipsis = responsiveHOC()(HTMLLinesEllipsis)

const onClick = (url) => {

  if (typeof url === "string") {
    Router.pushRoute(url)
  }
}

class ProductItem extends Component {

  constructor() {
    super()

    this.addToCartShowSuccessTimer = null;

    this.state = {
      currentOrderItem: null,
      isPriceCalculating: false,
      calculatedPriceModel: null,
      addToCartShowSuccess: false,
      quantity: null,
      isQuantityValid: true
    }
  }

  componentWillUnmount() {
    clearTimeout(this.addToCartShowSuccessTimer)
  }

  onQuantityChange = async (value, isValid) => {
    const { model } = this.props

    if (isValid) {
      if (model.HasPricing) {
        this.setState({ isPriceCalculating: true })
        await this.onCalculatePrice(value)
        this.setState({ isPriceCalculating: false, quantity: value, isQuantityValid: true })
      }
      else {
        this.setState({ quantity: value, isQuantityValid: true })
      }
    }
    else {
      this.setState({ quantity: value, isQuantityValid: false })
    }
  }

  onCalculatePrice = async (value) => {
    const { model } = this.props
    const currentOrderItem = this.state.currentOrderItem ? this.state.currentOrderItem : await UStoreProvider.api.orders.addOrderItem(model.ID)

    if (currentOrderItem.Quantity)
      currentOrderItem.Quantity = value

    const priceModel = await UStoreProvider.api.orders.getPriceOrderItem(currentOrderItem.ID, currentOrderItem)

    this.setState({ calculatedPriceModel: priceModel.Price, currentOrderItem: currentOrderItem })

  }

  addToCart = async () => {
    if (!!this.state.isQuantityValid) {
      const { model } = this.props
      const currentOrderItem = this.state.currentOrderItem ? this.state.currentOrderItem : await UStoreProvider.api.orders.addOrderItem(model.ID)

      // call the update order api if quantity is updated
      if (this.state.quantity)
        await UStoreProvider.api.orders.updateOrderItem(currentOrderItem.ID, currentOrderItem)

      await UStoreProvider.api.orders.addToCart(currentOrderItem.ID)
      return true
    }

    return false
  }

  onAddToCartClick = async () => {
    const success = await this.addToCart()

    if (success) {
      this.setState({ addToCartShowSuccess: true, currentOrderItem: null, quantity: null })

      this.addToCartShowSuccessTimer = setTimeout(() => {
        this.setState({ addToCartShowSuccess: false, calculatedPriceModel: null })
      }, 3000)
    }
  }

  render() {
    let { descriptionLines, productNameLines, model, url, detailed, className } = this.props

    if (!model) {
      return null
    }

    productNameLines = productNameLines ? productNameLines : 2
    descriptionLines = descriptionLines ? descriptionLines : 4

    const imageUrl = (model && model.ImageUrl) ? model.ImageUrl : require(`$assets/images/default.png`)
    const productNameAndCatalog = model.CatalogNumber && model.CatalogNumber.trim().length > 0 ? `${model.Name} / ${model.CatalogNumber}` : model.Name
    const showQuickAddToCart = model.Configuration && model.Configuration.AllowQuickAddToCart
    const priceModelToDisplay = this.state.calculatedPriceModel ? this.state.calculatedPriceModel : model.MinimumPrice
    const isMinimumPrice = !this.state.calculatedPriceModel && !showQuickAddToCart
    const quantity = this.state.quantity ? this.state.quantity : model.MinimumQuantity

    return (
      <div className={`product-item ${className ? className : ''}`} data-qaautomationinfo={model.FriendlyID}>
        <div className="image-wrapper" onClick={() => onClick(url)}>
          <ImageLoader className="image" src={imageUrl} />
        </div>
        <div className="product-name" style={{ maxHeight: `${productNameLines * 1.5}em` }} onClick={() => onClick(url)}>
          <ResponsiveHTMLEllipsis style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
            unsafeHTML={productNameAndCatalog}
            maxLine={productNameLines}
            basedOn='letters' />
        </div>
        {detailed && <div className="product-description" style={{ maxHeight: `${descriptionLines * 1.5}em` }}>
          <ResponsiveHTMLEllipsis unsafeHTML={model.ShortDescription} maxLine={descriptionLines} basedOn='words' />
        </div>}
        <Inventory model={model.Inventory} minQuantity={model.MinimumQuantity} pluralName={model.Unit.ItemType.PluralName} />
        {model.HasPricing && priceModelToDisplay && <div>
          <div className="product-units">
            <UnitsOfMeasure minQuantity={model.MinimumQuantity} model={model.Unit} isMinimumPrice={isMinimumPrice} />
          </div>
          <div className="product-price">
            {this.state.isPriceCalculating ?
              <LoadingDots /> : <Price model={priceModelToDisplay} isMinimumPrice={isMinimumPrice} />
            }
          </div>
        </div>}
        <div className="anchor-flex-end"></div>
        {showQuickAddToCart && <div className='add-to-cart'>
          {!this.state.addToCartShowSuccess && <div className='add-to-cart-controls'>
            <div className='add-to-cart-product-quantity'>
              <ProductItemQuantity
                supportsInventory={true}
                onQuantityChange={this.onQuantityChange}
                productModel={model}
                orderModel={{ Quantity: quantity }}
              />
            </div>
            <div className='add-to-cart-button-wrapper'>
              <Button className='button-secondary add-to-cart-button' text={t('ProductItem.Add_to_cart_button_text')} onClick={() => this.onAddToCartClick()} />
              <Button className='button-secondary add-button' text={t('ProductItem.Add_button_text')} onClick={() => this.onAddToCartClick()} />
            </div>
          </div>
          }
          {this.state.addToCartShowSuccess &&
            <div className='add-to-cart-success'>
              <div>{t('ProductItem.Added_successfully_message')}
                <span className='success-checkmark-icon-wrapper'>
                  <Icon name="checkmark.svg" width="20px" height="20px" className="success-checkmark-icon" />
                </span>
              </div>

            </div>
          }
        </div>
        }
      </div>
    )
  }
}
export default ProductItem
