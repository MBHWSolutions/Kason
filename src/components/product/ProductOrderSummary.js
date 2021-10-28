import react, { Component } from 'react'
import './ProductOrderSummary.scss'
import Price from '../Price'
import { t } from '$themelocalization'
import LoadingDots from '$core-components/LoadingDots'

/**
 * A component that is
 *
 * @param {string} className -
 * @param {object} productModel -
 * @param {object} quantity -
 * @param {boolean} priceModel -
 * @param {boolean} isPriceCalculating
 * @param {int} deliveryMethod
 * @param {function} onUpdatePrice
 *
 */


class ProductOrderSummary extends Component {
    render() {
        const { currency, className, productModel, quantity, priceModel, isPriceCalculating, deliveryMethod, taxFormatType, onUpdatePrice } = this.props

        if (!productModel || !priceModel || !productModel.HasPricing || priceModel.Price === null) return null

        const itemUnitName = productModel.Unit.PackType
            ? `(${quantity} ${quantity.toString() === '1' ? productModel.Unit.PackType.Name : productModel.Unit.PackType.PluralName})`
            : productModel.Unit.ItemType
                ? `(${quantity} ${quantity.toString() === '1' ? productModel.Unit.ItemType.Name : productModel.Unit.ItemType.PluralName})`
                : ''


        const showUpdateLink = productModel.Configuration.Properties && productModel.Configuration.Properties.length > 0

        return <div className={`${className} product-order-summary`}>
            <div className='summary-header'>{t('product.summary')}</div>

            <div className={`summary-table${taxFormatType === 3 ? ' custom-price' : ''}`}>
                {/* <div className={`summary-table`}> */}
                <div className='summary-table-row'>
                    <div className='summary-table-label'>{t('productPrice.product_total', { itemUnitName })}  </div>
                    <div className='summary-table-value'>{isPriceCalculating ? <LoadingDots /> :
                        priceModel.IsMinimumPrice ? <span>-</span> : <Price showCurrency={false} model={{ Price: priceModel.ProductPrice, Tax: 0 }} isMinimumPrice={false} overridePriceFormat={'{Price}'} />}
                    </div>
                </div>
                {deliveryMethod === 1 && <div className='summary-table-row'>
                    <div className='summary-table-label'>{t('productPrice.shipping_message')}</div>
                </div>}
                {deliveryMethod === 2 && <div className='summary-table-row'>
                    <div className='summary-table-label'>{t('productPrice.mailiing_fee')}</div>
                    <div className='summary-table-value'>{isPriceCalculating ? <LoadingDots /> :
                        priceModel.IsMinimumPrice ? <span>-</span> : <Price showCurrency={false} model={{ Price: priceModel.MailingFee, Tax: 0 }} isMinimumPrice={false} overridePriceFormat={'{Price}'} />}
                    </div>
                </div>}
                {(taxFormatType === 3 || taxFormatType === 2) && <div className='summary-table-row'>
                    <div className='summary-table-label'>{t('productPrice.tax')}</div>
                    <div className='summary-table-value'>{isPriceCalculating ? <LoadingDots /> :
                        priceModel.IsMinimumPrice ? <span>-</span> : <Price showCurrency={false} model={{ Price: priceModel.Price.Tax, Tax: 0 }} isMinimumPrice={false} overridePriceFormat={'{Price}'} />}
                    </div>
                </div>}
                <div className='summary-table-row total-row'>
                    <div className='summary-table-label total'>{t('productPrice.total_price', { currency })}</div>
                    <div className='summary-table-value total'>{isPriceCalculating ? <LoadingDots /> :
                        <Price showCurrency={false} model={priceModel.Price} isMinimumPrice={priceModel.IsMinimumPrice} />}
                    </div>
                </div>
                {showUpdateLink && <div className={`price-details-link ${isPriceCalculating ? 'hidden' : ''}`} id='summary-table-link' onClick={onUpdatePrice}>{t('productPrice.updatePrice')}</div>}
            </div>
        </div >
    }
}

export default ProductOrderSummary