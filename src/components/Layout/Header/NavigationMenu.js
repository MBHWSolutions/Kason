/**
 * A menu popover allowing navigation of categories in the system according to the given categories tree
 *
 * @param {object} categoriesTree - a list of CategoryTreeNodeModel, each element denotes a tree node in the categories tree structure.
 * @param {object} [selectedCategory] - the selected category to show in right panel (in all categories view this will be null and first category will show)
 * @param {boolean} [viewShowAll] - true if the menu should show the all categories view, false if the single category view
 */

import React, { Component } from 'react'
import './NavigationMenu.scss'
import { Link, Router } from '$routes'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import { t } from '$themelocalization'
import { Scrollbars } from 'react-custom-scrollbars'
import { decodeStringForURL } from '$ustoreinternal/services/utils'


const DIV_VIEW_COLUMNS_HEIGHT = 270
const DIV_CATEGORY_ROW_HEIGHT = 27
const NUMBER_OF_COLUMNS = 3


class NavigationMenu extends Component {

  constructor(props) {
    super(props)

    const { categoriesTree, selectedCategory } = props

    if (categoriesTree && categoriesTree.length) {
      const selected = selectedCategory && categoriesTree.find(node => node.Category.ID === selectedCategory.ID) ? selectedCategory : categoriesTree[0].Category
      this.state = {
        selectedCategory: selected
      }
    }

  }

  getSubCategoriesMapped(categoryTreeNode, countInColumn) {
    const { Category: category, SubCategories: subCategories } = categoryTreeNode
    let subCategoriesMapped = []

    if (category.HasSubCategories && subCategories) {
      let count = 0
      let countAll = 0

      subCategoriesMapped = subCategories.map((categoryTreeNodeL2) => {
        const { Category: categoryL2, SubCategories: subCategoriesL2 } = categoryTreeNodeL2

        //save the size of the entire group - category L2 and all its L3 categories plus featured products link if exist
        const groupSize = subCategoriesL2.length + ((categoryL2.HasProducts && categoryL2.HasSubCategories) ? 2 : 1)
        let countBlankSpaces = 0
        if (categoryL2.HasSubCategories && subCategoriesL2) {
          const indexInColumn = count
          count += groupSize
          if (count > countInColumn) {
            countBlankSpaces = groupSize - (count - countInColumn) //count the blank spaces to fill in this column
            count = groupSize % countInColumn                      //set count as the number of items from this group in the next column

            //handle the a case when a large group is the first group in the column - its already starting a new column no need to move
            if (indexInColumn === 0) {
              countBlankSpaces = 0              //no need for blank spaces
              count = (groupSize % countInColumn)  //set count as the number of items from this group in the next column
            }
          }
        }
        else {
          count++
          if (count > countInColumn) {
            count = 1             //set count as the number of items from this group in the next column (which is 1)
          }
        }

        countAll += groupSize + countBlankSpaces

        return {
          ...categoryL2,
          showFeaturedProducts: categoryL2.HasProducts && categoryL2.HasSubCategories,
          subCategories: subCategoriesL2.map(categoryL3Node => categoryL3Node.Category),
          countBlankSpaces,
          countAll
        }
      })
    }

    return subCategoriesMapped
  }

  render() {
    const { categoriesTree, viewShowAll } = this.props

    if (!(categoriesTree && categoriesTree.length)) {
      return null
    }

    const selectedCategory = this.state.selectedCategory
    const viewShowOnlyAllPanel = !selectedCategory.HasSubCategories
    const subCategoriesTreeNode = categoriesTree.filter(node => node.Category.ID === selectedCategory.ID)[0]

    const countInColumn = Math.floor(DIV_VIEW_COLUMNS_HEIGHT / DIV_CATEGORY_ROW_HEIGHT)

    const subCategoriesMapped = !viewShowOnlyAllPanel && this.getSubCategoriesMapped(subCategoriesTreeNode, countInColumn)
    const countAll = subCategoriesMapped && subCategoriesMapped.length && subCategoriesMapped[subCategoriesMapped.length - 1].countAll

    return (
      <div className={`navigation-menu ${(viewShowAll ? "view-show-all" : "")} ${(viewShowOnlyAllPanel ? 'hide-category-panel' : '')}`}>
        {
          viewShowAll &&
          <div className="show-all-panel">
            {
              <Scrollbars className="scrollbar" universal hideTracksWhenNotNeeded
                renderThumbVertical={props => <div {...props} className="thumb-vertical" />}>
                <div className="content">
                  {
                    categoriesTree.map(({ Category }, i) => {
                      const { ID, FriendlyID, Name } = Category
                      return <div key={i} className={`category-l1-menu ${(selectedCategory.ID === ID ? "selected" : "")}`}
                        onMouseOver={() => this.setState({ selectedCategory: Category })}>
                        <Link key={i} to={urlGenerator.get({ page: 'category', id: FriendlyID, name: decodeStringForURL(Name) })}><a key={i} className="category-name truncate" dangerouslySetInnerHTML={{__html: Name}}/></Link>
                      </div>
                    })
                  }
                </div>
              </Scrollbars>
            }
          </div>
        }
        <div className="category-panel">
          <div className="category-l1-title">
            <span className="category-l1">
              <Link to={urlGenerator.get({ page: 'category', id: selectedCategory.FriendlyID, name: decodeStringForURL(selectedCategory.Name) })}><a dangerouslySetInnerHTML={{__html: selectedCategory.Name}}/></Link>
            </span>
            {
              selectedCategory.HasProducts &&
              <span className="featured-products">
                <Link to={urlGenerator.get({ page: 'category', id: selectedCategory.FriendlyID, name: decodeStringForURL(selectedCategory.Name) })}>
                  <a className="featured-products-link">
                    {t('NavigationMenu.See_featured_products')}
                  </a>
                </Link>
              </span>
            }
          </div>
          <div className="view-columns">
            {
              subCategoriesMapped && subCategoriesMapped.map((categoryL2, i) => {
                const { FriendlyID, Name, showFeaturedProducts, subCategories, countBlankSpaces } = categoryL2
                return <React.Fragment key={i}>
                  {
                    //if this categoryL2 and its sub rows will span more than the place in this column it should move to next column - fill with blank rows
                    countBlankSpaces > 0 &&
                    [...Array(countBlankSpaces)].map((x, i) => <div key={i} className="column category"></div>)
                  }
                  <div key={i} className="column category">
                    <Link key={i} to={urlGenerator.get({ page: 'category', id: FriendlyID, name: decodeStringForURL(Name) })}><a key={i} className="category-l2 truncate" dangerouslySetInnerHTML={{__html: Name}} /></Link>
                  </div>
                  {
                    showFeaturedProducts &&
                    <div key="featured-products" className="column category">
                      <Link key="key-featured-products" to={urlGenerator.get({ page: 'category', id: FriendlyID, name: decodeStringForURL(Name) })}><a key="key-featured-products" className="category-l3 truncate">
                        {t('General.FeaturedProducts')}
                      </a>
                      </Link>
                    </div>
                  }
                  {
                    subCategories && subCategories.map((categoryL3, i) => {
                      const { FriendlyID, Name } = categoryL3

                      return <div key={i} className="column category">
                        <Link key={i} to={urlGenerator.get({ page: 'category', id: FriendlyID, name: decodeStringForURL(Name) })}><a key={i} className="category-l3 truncate" dangerouslySetInnerHTML={{__html: Name}} /></Link>
                      </div>
                    })
                  }
                </React.Fragment>
              })
            }
            {
              //if there are categories only in first column, fill up another column of blank rows for pushing the category image to the right
              (countAll <= countInColumn) ?
                [...Array(countInColumn)].map((x, i) => <div key={i} className="column category" />) : ''
            }
            {
              selectedCategory.ImageUrl &&
              <div className="column category-image-column">
                <div className="category-image-wrapper"><img src={selectedCategory.ImageUrl} className="category-image" /></div>
              </div>
            }
          </div>
          {
            //if the total count of the rows (categories, subcategories, etc) are more than the span of the designated columns - show a link to see more
            (countAll > countInColumn * NUMBER_OF_COLUMNS) ?
              <div className="see-more">
                <Link to={urlGenerator.get({ page: 'category', id: selectedCategory.FriendlyID, name: decodeStringForURL(selectedCategory.Name) })}><a className="see-more-link">{t('NavigationMenu.See_More')}</a></Link>
              </div> : null
          }
        </div>
      </div>
    )
  }
}

export default NavigationMenu
