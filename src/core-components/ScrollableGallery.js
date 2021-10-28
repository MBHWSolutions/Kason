/**
 * @function Gallery - a component which displays an array of items (childrens)
 *
 * @param {String} [title] - The main title at the top of the component
 * @param {Function} onScroll - The callback function to call for loading more items on scroll
 * @param (Boolean) [hasMoreItems] - True if the gallery has more items o show on scroll, false otherwise
 * @param {Component} children - The children components
 */

import React, { Component } from 'react'
import './Gallery.scss'
import InfiniteScroll from 'react-infinite-scroller'

class ScrollableGallery extends Component {

  render() {
    const {title, onScroll, hasMoreItems, children} = this.props

    if (!onScroll || !children){
      return null
    }

    return (
      <div className="gallery">
        <div className="top">
          {
            title && <div className='main-title scrollable-title'>{title}</div>
          }
        </div>
        <InfiniteScroll
          className="main"
          loadMore={onScroll}
          hasMore={hasMoreItems}
          initialLoad={false}>
          {children}
        </InfiniteScroll>
      </div>
    )
  }
}

export default ScrollableGallery
