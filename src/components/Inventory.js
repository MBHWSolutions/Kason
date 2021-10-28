/**
 * A component to display inventory information of a product
 *
 * @param {object} model - ProductInventoryModel containing data regarding inventory of the product
 * @param {number} minQuantity - the minimum quantity of units that can be ordered from the product
 * @param {boolean} hideInStock (false) - Hide the 'In Stock #####' label if is in stock.
 * @param {string} pluralName - the plural name of the item type.
 */

import { t } from '$themelocalization'
import './Inventory.scss'

export const isOutOfStock = (quantity, minQuantity, AllowOutOfStockPurchase) => {
  return (quantity < minQuantity && !AllowOutOfStockPurchase)
}

const Inventory = (props) => {
  const { model, minQuantity, hideInStock = true, pluralName, singleName } = props

  return (
    <span className="inventory">
      {
        (model && pluralName != 'Kits') ?
          ((model.Quantity > 0) ?
            <div className="default">In Stock. {model.Quantity} items.</div>
            :
            <div className="oos">Out of stock.</div>)
          :
          null
      }
      {/* {!hideInStock && model && model.Quantity >= minQuantity ?
        <div className='inStock'>
          {{t('Inventory.In_Stock', model.Quantity)}}
          {`${t('Inventory.In_stock')} ${model.Quantity} ${model.Quantity === 1 ? singleName ? singleName : 'Item' : pluralName ? pluralName : 'Items'}`}
        </div>
        : null
      } */}
    </span>
  )
}

export default Inventory
