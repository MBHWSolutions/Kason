/**
 * A menu with drill in showing all categories in the system in tablet/mobile view according to the given categories tree
 *
 * @param {object} categoriesTree - a list of CategoryTreeNodeModel, each element denotes a tree node in the categories tree structure.
 * @param {func} onRedirect - the function to be called when the user clicks on a category that doesn't drill in the menu
 */

import {Component} from "react"
import './CategoriesSidebar.scss'
import {Link} from '$routes'
import {t} from '$themelocalization'
import Icon from '$core-components/Icon'

class CategoriesSidebar extends Component {

  constructor(props) {
    super(props)

    this.state = {
      subCategoriesTree: [],
      currentCategory: null
    }
  }

  drillIn(currentCategoryNode){
    if (currentCategoryNode.Category &&
      currentCategoryNode.SubCategories &&
      currentCategoryNode.SubCategories.length > 0) {

      const currentCategory = {
        ...currentCategoryNode.Category,
        parentNode: {
          Category: this.state.currentCategory,
          SubCategories: this.state.subCategoriesTree
        }
      }

      this.setState({subCategoriesTree: currentCategoryNode.SubCategories})
      this.setState({currentCategory: currentCategory})
    }
  }

  drillOut(){
    if (this.state.currentCategory && this.state.subCategoriesTree){
      const {Category: category, SubCategories: categoriesTree} = this.state.currentCategory.parentNode
      this.setState({subCategoriesTree: categoriesTree})
      this.setState({currentCategory: category})
    }
  }

  static getDerivedStateFromProps(props, state){
    if (props.categoriesTree && props.categoriesTree.length && !state.subCategoriesTree.length){
      return {subCategoriesTree: props.categoriesTree}
    }
    return null;
  }

  render(){
    const {categoriesTree, onRedirect} = this.props

    if(!(categoriesTree && categoriesTree.length > 0)) {
      return null
    }

    const currentCategory = this.state.currentCategory ? this.state.currentCategory : null
    return (
      <div className={`categories-sidebar ${currentCategory ? 'top' : ''}`}>
        {
          currentCategory &&
            <div className="back-block">
              <div className="back-icon-container" onClick={() => this.drillOut()}>
                <Icon name="back.svg" width="9px" height="19px" className="back-icon" />
              </div>
              <div className="main-title">
                <div className="label-title truncate" dangerouslySetInnerHTML={{__html: currentCategory.Name}}/>
              </div>
            </div>
        }
        <div className='categories-list'>
        {
          currentCategory && currentCategory.HasProducts &&
          <div key="featured-products" className='category-title' onClick={() => onRedirect({page: 'category',id: currentCategory.FriendlyID})}>
            <span key="featured-products" className="category-name truncate">{t('General.FeaturedProducts')}</span>
          </div>
        }
        {
          this.state.subCategoriesTree && this.state.subCategoriesTree.map((node, i) => {
            const {FriendlyID, Name} = node.Category
            const subCategories = node.SubCategories
            return (
                  subCategories && subCategories.length > 0 ?
                    <div key={i} className="category-title" onClick={() => this.drillIn(node)}>
                      <span key={i} className="category-name truncate" dangerouslySetInnerHTML={{__html: Name}}/>
                    </div>
                    :
                    <div key={i} className="category-title" onClick={() => onRedirect({page: 'category',id: FriendlyID})}>
                      <span key={i} className="category-name truncate" dangerouslySetInnerHTML={{__html: Name}}/>
                    </div>
            )
          })
        }
        </div>
      </div>
    )
  }

}

export default CategoriesSidebar
