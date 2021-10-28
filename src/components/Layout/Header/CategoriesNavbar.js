/**
 * A menu strip showing all L1 categories in the system in desktop view
 * 
 * @param {object} categoriesTree - a list of CategoryTreeNodeModel, each element denotes a tree node in the categories tree structure.
 */

import { Popover, PopoverBody } from 'reactstrap'
import './CategoriesNavbar.scss'
import NavigationMenu from "./NavigationMenu"
import React, { Component } from 'react'
import { Link } from '$routes'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import { t } from '$themelocalization'
import { decodeStringForURL } from '$ustoreinternal/services/utils'

class CategoriesNavbar extends Component {

  constructor(props) {
    super(props)

    this.mouseOverElement = false
    this.categoryChanged = false

    this.state = {
      selectedCategory: null,
      isOverlayOpen: false,
      popoverTarget: 'id-0',
      keepNavigationOpen: false
    }
  }

  handleMouseOut() {
    if (!this.state.keepNavigationOpen) {
      this.mouseOverElement = false

      //close popover with delay to handle a case where mouse is already over another element
      setTimeout(() => {
        if (!this.mouseOverElement) {
          this.setState({ selectedCategory: null, isOverlayOpen: false })
        }
        else {
          //if mouse is already over another element check if the category has changed - if so close the popover and open again (for refresh), else do nothing
          if (this.categoryChanged) {
            this.setState({ isOverlayOpen: false })
            if (this.state.selectedCategory.HasSubCategories) //handeling the case when popover shouldn't open because there are no sub categories
              this.setState({ isOverlayOpen: true })
          }
        }
      }, 5)
    }
  }

  handleMouseOver(category) {
    this.mouseOverElement = true

    //if !category its the popover - dont do anything
    if (!category)
      return

    this.categoryChanged = !this.state.selectedCategory || (this.state.selectedCategory.FriendlyID !== category.FriendlyID)

    this.setState({ selectedCategory: category })

    //if category doesn't have sub categories or its the popover - return
    if ((category && !category.HasSubCategories && category.FriendlyID !== 0))
      return

    this.setState({ popoverTarget: `id-${category.FriendlyID}`, isOverlayOpen: true })
  }


  render() {
    const { categoriesTree } = this.props
    if (!(categoriesTree && categoriesTree.length > 0)) {
      return null
    }

    const selected = this.state.selectedCategory
    const viewShowAll = selected && selected.FriendlyID === 0

    return (
      <div className="categories-navbar">
        <div className="category-title-wrapper" onMouseOver={() => this.handleMouseOver({ FriendlyID: 0 })} onMouseOut={() => this.handleMouseOut()}>
          <span className={`category-title ${selected && selected.FriendlyID === 0 ? 'highlight' : ''}`} id="id-0">
            {t('Header.All_Categories')}
          </span>
        </div>
        {
          categoriesTree.map(({ Category }, i) => {
            const { FriendlyID, Name } = Category
            return <Link key={i} to={urlGenerator.get({ page: 'category', id: FriendlyID, name: decodeStringForURL(Name) })}>
              <div key={i} className="category-title-wrapper" onMouseOver={() => this.handleMouseOver(Category)} onMouseOut={() => this.handleMouseOut()}>
                <span className={`category-title ${selected && selected.FriendlyID === FriendlyID ? 'highlight' : ''}`} key={i} id={`id-${FriendlyID}`}>
                  <a className="link" key={i} dangerouslySetInnerHTML={{__html: Name}}/>
                </span>
              </div>
            </Link>
          })
        }
        {
          selected &&
          <div id="popover-wrapper" className="popover-wrapper" onMouseOver={() => this.handleMouseOver()}
            onMouseLeave={() => this.handleMouseOut()} keep-navigation-open={`${this.state.keepNavigationOpen}`}>
            <Popover placement="bottom-start" isOpen={this.state.isOverlayOpen} target={this.state.popoverTarget}
              className={viewShowAll ? "view-show-all" : ""} container="popover-wrapper">
              <PopoverBody>
                <NavigationMenu categoriesTree={categoriesTree} viewShowAll={viewShowAll} selectedCategory={selected} />
              </PopoverBody>
            </Popover>
          </div>
        }
      </div>
    )
  }
}


export default CategoriesNavbar
