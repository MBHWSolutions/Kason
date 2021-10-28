import React, { Component } from 'react'

import './ImageZoom.scss'

/**
 * @function ImageZoom - a component which displays an array of items (childrens)
 * 
 * @param {HTML} [children] - The path of the image
 */

class ImageZoom extends Component {

    constructor(props) {
        super(props)

        this.state = {
            isZoomed: false,
            scrollToPosition: {
                x: 0,
                y: 0
            },
            showZoom: true
        }

        this.onImageClicked = this.onImageClicked.bind(this)
        this.onImageHover = this.onImageHover.bind(this)
        this.setScrollPosition = this.setScrollPosition.bind(this)

        this.containerRef = React.createRef()

    }

    componentDidUpdate(prevProps) {

        if (this.state.showZoom &&
            this.containerRef.current.querySelector('img').height < this.containerRef.current.clientHeight &&
            this.containerRef.current.querySelector('img').width < this.containerRef.current.clientWidth
        ) {
            this.setState({ showZoom: false })
        }
        else if (!this.state.showZoom &&
            (this.containerRef.current.querySelector('img').height >= this.containerRef.current.clientHeight ||
                this.containerRef.current.querySelector('img').width >= this.containerRef.current.clientWidth)) {
            this.setState({ showZoom: true })
        }

    }

    onImageClicked(e) {

        if (!this.state.showZoom) {
            return
        }

        if (this.state.isZoomed) {
            this.setState({ isZoomed: false })
            return
        }

        const rect = this.containerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left //x position within the element.
        const y = e.clientY - rect.top  //y position within the element.

        const vOffset = (y / rect.height)
        const hOffset = (x / rect.width)



        this.setState({ isZoomed: !this.state.isZoomed, scrollToPosition: { x: hOffset, y: vOffset } }, this.setScrollPosition)
    }

    setScrollPosition() {

        const wrapper = this.containerRef.current.querySelector('.scroll-wrapper')

        const height = wrapper.scrollHeight
        const width = wrapper.scrollWidth

        const containerHeight = wrapper.clientHeight
        const containerWidth = wrapper.clientWidth

        wrapper.scrollTo((this.state.scrollToPosition.x * width) - (containerWidth / 2), (this.state.scrollToPosition.y * height) - (containerHeight / 2))
    }

    onImageHover(e) {

        if (!this.state.showZoom || !this.state.isZoomed) {
            return
        }

        const wrapper = this.containerRef.current.querySelector('.scroll-wrapper')

        const rect = this.containerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left //x position within the element.
        const y = e.clientY - rect.top  //y position within the element.

        const vOffset = (y / rect.height)
        const hOffset = (x / rect.width)

        const height = wrapper.scrollHeight
        const width = wrapper.scrollWidth

        const containerHeight = wrapper.clientHeight
        const containerWidth = wrapper.clientWidth

        wrapper.scrollTo((hOffset * width) - (containerWidth / 2), (vOffset * height) - (containerHeight / 2))

    }


    render() {
        const className = this.state.isZoomed ? 'zoomed' : 'contained'
        const wrapperClassName = this.state.showZoom ? '' : ' small-image'
        return <div ref={this.containerRef} className={'image-zoom' + wrapperClassName} onMouseMove={this.onImageHover}>
            <div className={'scroll-wrapper ' + className} onClick={this.onImageClicked}>
                {this.props.children}
            </div>
        </div>
    }

}

export default ImageZoom

