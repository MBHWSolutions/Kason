/**
 * A component to display units of measure information of a product
 *
 * @param {object} model - ProductUnitModel containing data regarding the units of the product
 * @param {number} minQuantity - the minimum quantity of units that can be ordered from the product
 * @param {isMinimumPrice} boolean - a flag to denote if the component should show display regarding minimum price or not
 * 
 */

import { t } from '$themelocalization'
import './UnitsOfMeasure.scss'

const UnitsOfMeasure = (props) => {
  const { model, minQuantity, isMinimumPrice } = props

  if (!model) {
    return null
  }

  const pricePerItem = model && model.PackType === null
  const { ItemType, PackType, ItemQuantity } = model
  return (
    <span className="units-of-measure">
      {
        pricePerItem ?
          (minQuantity > 1 && isMinimumPrice) ? t('UnitsOfMeasure.Per_Quantity_Item_Type', {
            MinimumQuantity: minQuantity,
            ItemTypePluralName: ItemType.PluralName
          }) : '' //e.g. Per 100 items
          :
          (minQuantity === 1 || !isMinimumPrice) ?  //e.g. Sold in Packs (100 Items/Pack)
            t('UnitsOfMeasure.Sold_in_Pack_Type', {
              PackTypePluralName: PackType.PluralName,
              ItemQuantity,
              PackTypeName: PackType.Name,
              ItemTypePluralName: ItemType.PluralName
            })
            :  //e.g. Per 2 packs (100 items/pack)
            t('UnitsOfMeasure.Per_Quantity_Pack_Type',
              {
                MinimumQuantity: minQuantity,
                PackTypePluralName: PackType.PluralName,
                ItemQuantity,
                PackTypeName: PackType.Name,
                ItemTypePluralName: ItemType.PluralName
              })
      }
    </span>
  )
}

export default UnitsOfMeasure
