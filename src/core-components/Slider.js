/**
 * @function Slider - a component which displays items in a circular way
 * 
 * @param {boolean} multi - defined: multiple items in a page, not-defined: single item
 * @param {Component} children - The children components
 */

import React, { Component } from 'react'
import { throttle } from 'throttle-debounce'
import Swipeable from 'react-swipeable'
import './Slider.scss'
import Icon from './Icon'

/**
 * Direction mapping for the react-swipeable library
 */
const RIGHT = '-1'
const LEFT = '+1'

/**
 * Transition speed
 */
const TRANSITION_SPEED = 500

/**
 * arrows consts
 */
const ARROW_MARGIN = 20
const ARROW_WIDTH = 30
const ARROW_HEIGHT = 30

class Slider extends Component {
  constructor(props) {
    super(props)

    this.slider = React.createRef()

    this.state = {
      children: [],                 // Holds a copy of each item
      childrenLength: 0,            // Number of items
      currentPosition: 0,           // Current "left" value of the slider
      currentPage: 0,               // Current page
      displayedItems: 0,            // Number of items in a page
      lastClonedItemRight: null,    // Index (children) of the last item on the right section
      lastClonedItemLeft: null,     // Index (children) of the last item on the left section
      lastItemWidth: null          // Used to check if there was a change in breakpoint
    }

    this.arrowsActive = true
  }

  componentDidMount() {
    // Some initializations code
    this.setInitState()

    // On screen resizing
    window.addEventListener('resize', () => {
      this.onResize()
    });

    throttle(250, this.onResize)
    throttle(250, this.slide)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
  }

  onResize() {
    const { multi } = this.props

    if (!this.slider || !this.state || !multi || !this.arrowsActive) {
      return
    }

    const children = this.slider.childNodes
    const displayedItems = Math.round(this.slider.clientWidth / children[0].clientWidth)

    const lastItemWidth = this.state.lastItemWidth
    let addPosition = 0

    if (lastItemWidth !== children[0].clientWidth) {
      if (lastItemWidth > children[0].clientWidth) {
        addPosition -= children[0].clientWidth
      } else {
        addPosition += children[0].clientWidth
      }
    }

    const currentPosition = -this.slider.clientWidth + addPosition
    this.slider.style.left = `${currentPosition}px`

    this.setState({
      currentPosition,
      displayedItems,
      lastItemWidth
    })
  }

  setButtons() {

    if (this.slider && this.slider.parentNode) {
      const sliderClientWidth = this.slider.clientWidth

      const leftBtn = this.slider.parentNode.querySelector(`.left-btn`)
      const rightBtn = this.slider.parentNode.querySelector(`.right-btn`)

      if (leftBtn && rightBtn) {
        if (this.arrowsActive) {
          leftBtn.style.visibility = 'visible'
          rightBtn.style.visibility = 'visible'
          rightBtn.style.left = `${sliderClientWidth - ARROW_WIDTH - ARROW_MARGIN}px`
        }
        else {
          leftBtn.style.visibility = 'hidden'
          rightBtn.style.visibility = 'hidden'
        }
      }
    }
  }

  setInitState() {
    if (!(this.slider && this.slider.childNodes)) {
      return
    }

    const children = this.slider.childNodes
    const itemsInRow = this.getItemsInRow() || 1
    const clonedNodes = []
    const childrenLength = this.state.childrenLength || children.length

    this.setState({
      childrenLength
    })

    // On init (componentDidMount) - Clone all children
    if (this.state.children.length === 0) {
      for (let i = 0; i < childrenLength; i++) {
        clonedNodes.push(children[i].cloneNode(true))
      }
      this.setState({
        children: clonedNodes
      })
    }
    // On Resize - clear slider, fill with children, set left to position zero
    else {
      this.slider.innerHTML = ''

      for (let i = 0; i < this.state.children.length; i++) {
        this.slider.appendChild(this.state.children[i])
      }

      this.slider.style.left = '0px'
    }

    if (childrenLength <= itemsInRow) {
      this.slider.style.justifyContent = 'center'
      this.arrowsActive = false
      return
    }

    this.arrowsActive = true

    // Calculate number of items in a row
    const displayedItems = Math.round(this.slider.clientWidth / children[0].clientWidth)

    this.setState({
      displayedItems,
      lastItemWidth: children[0].clientWidth
    })

    this.createInitRightSection(displayedItems, clonedNodes)
    this.createInitLeftSection(displayedItems, clonedNodes)
    this.setSliderPosition(true, false, displayedItems)
    this.setDotsPosition()
    this.initDots(childrenLength)
  }

  createInitRightSection(displayedItems, children) {
    const clonedNodesToAppend = []

    // Clone all first items that need to filled the gap of items per row
    const itemsTofill = displayedItems - children.length % displayedItems

    for (let i = 0; i < itemsTofill; i++) {
      if (!children[i]) {
        continue
      }

      clonedNodesToAppend.push(children[i].cloneNode(true))

      if (i === itemsTofill - 1) {
        this.setState({
          lastClonedItemRight: i
        })
      }
    }

    // Append the clonedNodesToAppend after the last item
    for (let i = 0; i < clonedNodesToAppend.length; i++) {
      this.slider.append(clonedNodesToAppend[i])
    }
  }

  createInitLeftSection(displayedItems, children) {
    const clonedNodesToPrepend = []

    // Clone all last items per row child nodes
    let j = displayedItems
    for (let i = children.length - 1; i >= 0; i--) {
      clonedNodesToPrepend.push(children[i].cloneNode(true))
      j--
      if (j === 0) {
        this.setState({
          lastClonedItemLeft: i
        })
        break
      }
    }

    // Prepend the clonedNodesToPrepend before the first item
    for (let i = 0; i < clonedNodesToPrepend.length; i++) {
      const firstItem = this.slider.firstChild
      this.slider.insertBefore(clonedNodesToPrepend[i], firstItem)
    }
  }

  reorderItems(isForward) {
    let lastClonedItem = (isForward) ? this.state.lastClonedItemRight : this.state.lastClonedItemLeft

    if (lastClonedItem === null) {
      return
    }

    if (isForward) {
      const clonedNodesToAppend = []
      let j = lastClonedItem + 1

      // Clone all items of the next row
      for (let i = 0; i < this.state.displayedItems; i++) {
        if (j === this.state.children.length) {
          j = 0
        }
        clonedNodesToAppend.push(this.state.children[j].cloneNode(true))

        if (i === this.state.displayedItems - 1) {
          this.setState({
            lastClonedItemRight: j
          })
          lastClonedItem = j
        }
        j++
      }

      // Append the clonedNodesToAppend after the last item
      for (let i = 0; i < clonedNodesToAppend.length; i++) {
        this.slider.append(clonedNodesToAppend[i])
      }

      // Remove trailing row
      for (let i = 0; i < this.state.displayedItems; i++) {
        this.slider.childNodes[0].remove()
      }

      // Find the last left cloned item
      j = lastClonedItem - 1
      for (let i = 0; i < this.state.displayedItems; i++) {
        if (j === -1) {
          j = this.state.children.length - 1
        }

        if (i === this.state.displayedItems - 1) {
          this.setState({
            lastClonedItemLeft: j
          })
        }
        j--
      }

      this.setSliderPosition(false, false, this.state.displayedItems)
    }
    else {
      const children = this.slider.childNodes
      const clonedNodesToPrepend = []
      let j = lastClonedItem - 1

      // Clone all items of the next row
      for (let i = 0; i < this.state.displayedItems; i++) {
        if (j === -1) {
          j = this.state.children.length - 1
        }

        clonedNodesToPrepend.push(this.state.children[j].cloneNode(true))

        if (i === this.state.displayedItems - 1) {
          this.setState({
            lastClonedItemLeft: j
          })
          lastClonedItem = j
        }
        j--
      }

      // Append the clonedNodesToPrepend after the last item
      for (let i = 0; i < clonedNodesToPrepend.length; i++) {
        const firstItem = children[0]
        this.slider.insertBefore(clonedNodesToPrepend[i], firstItem)
      }

      // Remove last row
      for (let i = 0; i < this.state.displayedItems; i++) {
        this.slider.childNodes[this.slider.childNodes.length - 1].remove()
      }

      // Find the last right cloned item
      j = lastClonedItem + 1
      for (let i = 0; i < this.state.displayedItems; i++) {
        if (j === this.state.children.length) {
          j = 0
        }

        if (i === this.state.displayedItems - 1) {
          this.setState({
            lastClonedItemRight: j
          })
        }
        j++
      }

      this.setSliderPosition(true, false, this.state.displayedItems)
    }
  }

  setSliderPosition(isForward, isTransition, displayedItems) {
    const itemWidth = this.slider.childNodes[0].clientWidth
    const sliderWidth = displayedItems * itemWidth
    let currentPosition = this.state.currentPosition

    if (isForward) {
      currentPosition -= sliderWidth
    }
    else {
      currentPosition += sliderWidth
    }

    if (isTransition) {
      this.slider.style.transition = `left ${TRANSITION_SPEED}ms`
    }
    else {
      this.slider.style.transition = `none`
    }

    const left = `${currentPosition}px`
    this.slider.style.left = left

    this.setState({
      currentPosition
    })
  }

  slide(isForward, isReorder) {
    if (!this.arrowsActive) {
      return
    }

    this.setSliderPosition(isForward, true, this.state.displayedItems)

    setTimeout(() => {
      if (isReorder) {
        this.reorderItems(isForward)
      }
    }, TRANSITION_SPEED)

    this.setActiveDot(isForward)
  }

  setDotsPosition() {
    const dots = this.slider.parentNode.querySelector(`div.dots`)
    if (!dots) {
      return
    }
    dots.style.top = '-100px'
  }

  initDots(childrenLength) {
    const dots = this.slider.parentNode.querySelector(`div.dots`)
    if (!dots)
      return

    dots.innerHTML = ''

    for (let i = 0; i < childrenLength; i++) {
      const dot = document.createElement('div')
      dot.className = 'dot'
      dots.appendChild(dot)
    }

    dots.childNodes[0].setAttribute('class', 'dot active')
  }

  setActiveDot(isForward) {
    const dots = this.slider.parentNode.querySelector(`div.dots`)
    if (!dots) {
      return
    }

    let currentPage = this.state.currentPage
    const childrenLength = this.state.childrenLength

    if (isForward) {
      currentPage += 1
      if (currentPage === childrenLength) {
        currentPage = 0
      }
    }
    else {
      currentPage -= 1
      if (currentPage === -1) {
        currentPage = childrenLength - 1
      }
    }

    this.setState({
      currentPage
    })

    for (let i = 0; i < dots.childNodes.length; i++) {
      dots.childNodes[i].setAttribute('class', 'dot')
    }
    dots.childNodes[currentPage].setAttribute('class', 'dot active')
  }

  getCssContent(key) {
    let content = window.getComputedStyle(this.slider, ':after').getPropertyValue('content')
    content = content.replace(new RegExp('"', 'g'), '').replace(new RegExp('`', 'g'), '"')

    try {
      content = JSON.parse(content)
      return content[key]
    }
    catch (e) { }
  }

  getItemsInRow() {
    return this.getCssContent('items')
  }

  onSwiped(direction) {
    const isForward = direction === RIGHT ? false : true
    this.slide(isForward, true)
  }

  render() {
    const { children, multi } = this.props

    if (!children) {
      return null
    }

    this.setButtons()

    return (
      <Swipeable
        trackMouse
        preventDefaultTouchmoveEvent
        onSwipedLeft={() => children.length > 1 && this.onSwiped(LEFT)}
        onSwipedRight={() => children.length > 1 && this.onSwiped(RIGHT)}
      >
        <div className={`slider-wrapper${multi ? '-multi' : '-single'}`}>
          <div className="slider" ref={(ref) => { this.slider = ref }}>
            {children}
          </div>
          <div className="arrows left-btn" onClick={this.slide.bind(this, false, true)}>
            <Icon name="arrow.svg" width={`${ARROW_WIDTH}px`} height={`${ARROW_HEIGHT}px`} className="left-arrow-icon" />
          </div>
          <div className="arrows right-btn" onClick={this.slide.bind(this, true, true)}>
            <Icon name="arrow.svg" width={`${ARROW_WIDTH}px`} height={`${ARROW_HEIGHT}px`} className="right-arrow-icon" />
          </div>
          {!multi && <div className="dots" />}
        </div>
      </Swipeable>
    )
  }
}

export default Slider
