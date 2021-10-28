import './Cart.scss'
import urlGenerator from '$ustoreinternal/services/urlGenerator'
import { Link } from '$routes'
import Icon from '$core-components/Icon'

/**
 * This component represents the cart icon.
 * When clicking on it - the store redirects to the 'Cart' page
 */
const Cart = ({ connectCartUrl = '' }) => {

  const cartComponent = () => {
    return <div className="cart-icon-container">
      <Icon name="cart.svg" width="23px" height="21px" className="cart-icon" />
    </div>
  }

  return (
    <div className="cart">

      {
        connectCartUrl ?
          <a onClick={() => { window.location.href = decodeURIComponent(connectCartUrl) }}>{cartComponent()}</a>
          :
          <Link to={urlGenerator.get({ page: 'cart' })}>
            <a>
              {cartComponent()}
            </a>
          </Link>
      }
    </div>
  )
}
export default Cart
