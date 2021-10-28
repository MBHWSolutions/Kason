/**
 * @function PromotionItem - a component which includes:
 *    Responsive background image
 *    Live text with animation and language localization
 *    Button which navigates to specific product/product list page
 *
 * @param {string} imageUrl - the URL of the main background image
 * @param {string} title - the main title
 * @param {string} subTitle - the sub-title
 * @param {string} buttonText - the button's text
 * @param {string} url - the url to redirect to when clicking the button
 * @param {string} className - the css class to add to main div
 */
import {Router} from '$routes'
import './PromotionItem.scss'
import React, {Component} from "react"
import theme from '$styles/_theme.scss'
import {throttle} from 'throttle-debounce'

class PromotionItem extends Component
{
  constructor() {
    super();
    this.promotionItem = React.createRef();
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
    throttle(250, this.onResize);

    this.setButtonSize()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
  }

  goTo(url){
    if(!url){
      return
    }
    if (url.startsWith('http')) {
      window.location.href = url
    }
    else {
      Router.pushRoute(url)
    }
  }

  onResize = () => {
    this.setButtonSize()
  }

  setButtonSize(){
    if(!this.promotionItem) {
      return
    }

    const button = this.promotionItem.querySelector('.button')
    const width = document.body.clientWidth

    if (window.matchMedia(`(max-width: ${theme.md})`).matches) {
      button.style['max-width'] = `${width - (2 * 20)}px`
    }
    else{
      button.style['max-width'] = ''
    }
  }

  render() {
    const {imageUrl, title, subTitle, buttonText, url, className} = this.props;

    return (
      <div className={`promotion-item ${ className || ''}`} ref={(ref) =>this.promotionItem = ref}>
        {
          imageUrl && <img className="promotion-image" src={`${imageUrl}`} alt=""/>
        }
        <div className="main">
          <div className="title-area">
            <div className="title text">{title}</div>
            <div className="subtitle text">{subTitle}</div>
            <div className="button button-primary truncate" onClick={() => this.goTo(url) }>{buttonText}</div>
          </div>
        </div>
      </div>
    )
  }
}
export default PromotionItem
