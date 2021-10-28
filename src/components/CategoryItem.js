import './CategoryItem.scss'
import { Link } from '$routes'
import HTMLLinesEllipsis from "react-lines-ellipsis/lib/html"

/**
 * This component represents the category in the store
 * It contains the category image and details
 *
 * @param {object} model - the category
 * @param {string} url - the url to redirects when clicking the category
 * @param {string} [className] - the css class to add to main div
 */
const CategoryItem = ({ model, url, className }) => {

  if (!model) {
    return <div className="category-item" />
  }

  const imageUrl = model.ImageUrl ? model.ImageUrl : require(`$assets/images/default.png`)

  return (
    <Link to={url}>
      <a className={`category-item ${className || ''}`} data-qaautomationinfo={model.FriendlyID}>
        <div className="image-wrapper">
          <img src={imageUrl} />
        </div>
        <div className="category-name">
          <HTMLLinesEllipsis style={{ whiteSpace: 'pre-wrap' }} unsafeHTML={model.Name} maxLine={2} basedOn='words' />
        </div>
      </a>
    </Link>
  )
}

export default CategoryItem
