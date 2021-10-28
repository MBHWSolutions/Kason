/**
 * Wrapper component for svg (only) icons. It creates a component for placing the svg inline during build (using SVGR loader).
 * It also creates a container around the icon for being able to replace it using external css, and adds className to all elements under svg element.
 *
 * @param {string} name - the image file name
 * @param {string} width - the image width
 * @param {string} height - the image height
 * @param {string} [className] - a class name to place on image element
 */

import React, { Component } from 'react'

class Icon extends Component {

  componentDidMount(){
    this.setCssClass()
  }

  setCssClass() {
    const { className } = this.props

    //adding className to all <g> and <path> nodes under svg to allow stroke coloring
    if (document.querySelectorAll(`svg.${className}`).length) {
      document.querySelectorAll(`svg.${className}`).forEach((svg) => {
        svg.querySelectorAll('g').forEach((element) =>
          element.classList.add(className)
        )
        svg.querySelectorAll('path').forEach((element) =>
          element.classList.add(className)
        )
      })
    }
  }

  render() {

    const { name, className, height, width } = this.props

    if (!name || !height || !width) {
      return null
    }

    const splittedName = name.split('.')

    if (splittedName.length <= 1) {
      return null
    }

    const extension = splittedName[1]

    let svgComponent
    if (extension === 'svg') {
      const importedSVG = require(`$assets/icons/${name}`)
      const props = {...this.props, className: `icon-image ${className? className: ''}`}
      svgComponent = React.createElement(importedSVG.ReactComponent, props)
    }

    return (
      <div className="icon icon-holder" style={{ width: `${width}`, height: `${height}`, 'backgroundSize': `${width} ${height}` }}>
        {
          (svgComponent) ? svgComponent : null
        }

      </div>
    )
  }
}

export default Icon
