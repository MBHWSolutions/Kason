import React from 'react'
import Price from "../Price"
import "./ProductStickyPrice.scss"
import { ReactComponent as AddToCartIcon } from "$assets/icons/add_to_cart.svg"
import { t } from '$themelocalization'
import LoadingDots from '$core-components/LoadingDots'
import Icon from '$core-components/Icon'


const ProductStickyPrice = ({ priceModel, addToCartBtnText, disabled, onClick, longPrice, onUpdatePrice, showUpdatePriceLink, isPriceLoading }) => {
  return (
    <div className='product-sticky-price'>
      <div className={`total-price${longPrice ? ' long-price' : ''}${!priceModel ? ' button-only' : ''}`}>
        {!!priceModel
          ? <>
            <span className={`${isPriceLoading ? 'text-hidden' : ''}`}>
              <Price
                showCurrency
                model={priceModel.Price}
                isMinimumPrice={priceModel.IsMinimumPrice}
              />
            </span>
            {isPriceLoading && <LoadingDots />}
            {showUpdatePriceLink && <div className={`price-details-link ${isPriceLoading ? 'hidden' : ''}`} id="sticky-update-price" onClick={onUpdatePrice}>{t('productPrice.updatePrice')}</div>}
            <div className='filler'></div>
          </>
          : null
        }
        <span className='add-to-cart-icon-wrapper'>
          <Icon id="sticky-add-to-cart-icon" className='sticky-add-to-cart-icon' name='add_to_cart.svg' width='26px' height='26px'
            onClick={() => !disabled ? onClick('sticky-add-to-cart-icon') : undefined} />
        </span>
        <div
          id="sticky-add-to-cart-button"
          className='button button-primary sticky-add-to-cart-button'
          onClick={() => !disabled ? onClick('sticky-add-to-cart-button') : undefined}
        >
          <span className={`${disabled ? 'text-hidden' : ''}`}>{addToCartBtnText}</span>
          {disabled && <LoadingDots />}
        </div>
      </div>
    </div>
  )
}

export default ProductStickyPrice