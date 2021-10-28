import './ProductDetails.scss'
import Inventory from '../Inventory'
import { t } from '$themelocalization'
import { formatDateByLocale } from '$ustoreinternal/services/utils'


/**
 * A component that is loaded for displaying the main details of the product (name, description, inventory, reorder)
 *
 * @param {object} productModel - the productModel that contains the details of the product.
 * @param {object} reorderModel - the object (if exist) that contains the reorder details for the product.
 * @param {function} onReorder - the callback function to be called when the reorder link is clicked.
 * @param {string} langCode - the locale code for date conversion.
 * @param {string} className -the class name to be added to the main container
 *
 */

const ProductDetails = ({ className, productModel, onReorder, reorderModel, langCode }) => {

    if (!productModel) {
        return null
    }

    const displayName = `${productModel.Name} ${productModel.CatalogNumber ? ' / ' + productModel.CatalogNumber : ''}`

    const pluralName = productModel.Unit.PackType ? productModel.Unit.PackType.PluralName : productModel.Unit.ItemType.PluralName
    const itemName = productModel.Unit.PackType ? productModel.Unit.PackType.Name : productModel.Unit.ItemType.Name


    return <div className={`${className} product-details`}>
        <div className='product-name' dangerouslySetInnerHTML={{ __html: displayName }} />
        {reorderModel && <div className='product-reorder'>
            {t('KitProduct.Last_order_notation', {
                OrderSubmittedDate: formatDateByLocale(reorderModel.SubmittedDate, langCode)
            })}
            <span className='reorder-link' onClick={onReorder}>{t('KitProduct.Reorder')}</span>
        </div>}
        {productModel.Inventory && <div className='product-inventory'>
            <Inventory hideInStock={false}
                model={productModel.Inventory}
                minQuantity={productModel.Configuration.Quantity.Minimum}
                pluralName={pluralName}
                singleName={itemName}
            />
        </div>}
        {productModel.Description && <div className='product-description'>
            <div className='product-description' dangerouslySetInnerHTML={{ __html: productModel.Description }} />
        </div>}
    </div>
}





export default ProductDetails
