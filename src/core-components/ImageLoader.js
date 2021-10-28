import './ImageLoader.scss'
import { isServer } from '$ustoreinternal/services/utils'
import React, { Component } from 'react'

class ImageLoader extends Component {

  constructor (props) {
    super(props)
    this.imageOnLoad = this.imageOnLoad.bind(this)
    this.imageOnError = this.imageOnError.bind(this)
    this.image = React.createRef()
  }

  componentDidMount () {
    const img = this.image.current
    if (img && img.complete) {
      this.imageOnLoad()
    }
  }

  imageOnLoad () {
    const imageElem = this.image.current
    if (imageElem) {
      imageElem.classList.remove('hide')
      imageElem.classList.add('show')
      imageElem.previousSibling.classList.remove('show')
      imageElem.previousSibling.classList.add('hide')
    }
  }

  imageOnError = () => {
    const imageElem = this.image.current
    if (imageElem) {
      imageElem.src = require(`$assets/images/default.png`)
      imageElem.classList.remove('hide')
      imageElem.classList.add('show')
      imageElem.previousSibling.classList.remove('show')
      imageElem.previousSibling.classList.add('hide')
    }
  }

  render () {
    return (
      <div className={`image-loader ${this.props.className ? this.props.className : ''}`}>
        <div className="animated loading"/>
        <img
          ref={this.image}
          src={this.props.src}
          onError={this.imageOnError}
          onLoad={this.imageOnLoad}
          className="hide"
        />
      </div>
    )
  }
}

export default ImageLoader