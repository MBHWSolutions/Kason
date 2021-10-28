import React from 'react'
import deepcopy from "deepcopy"
import './DotCarousel.scss'

const LEFT = "left"
const RIGHT = "right"
const REGULAR = "regular-dot"
const PADDING = 8
const SMALLEST_WIDTH = 6
const SMALLER_WIDTH = 7
const REGULAR_WIDTH = 8
const SMALLER = "smaller-dot"
const SMALLEST = "smallest-dot"
const HIDDEN = "hidden-dot"

const DotCarousel = (props) => {
  const { images, active } = props
  if (!images || images.length < 2) {
    return null
  }

  const [dots, setDots] = React.useState([])

  const filterDots = (dots, reverse) => {
    if (reverse) {
      images.forEach((image, i) => {
        if ([active + 1, active - 3].includes(i)) {
          dots.push({ class: SMALLER, id: i })
        } else if ([active + 2, active - 4].includes(i)) {
          dots.push({ class: SMALLEST, id: i })
        } else if ([active, active - 1, active - 2].includes(i)) {
          dots.push({ class: REGULAR, id: i, active: i === active })
        } else {
          dots.push({ class: HIDDEN, id: i })
        }
      })
    } else {
      images.forEach((image, i) => {
        if ([active - 2, active + 4].includes(i)) {
          dots.push({ class: SMALLEST, id: i })
        } else if ([active - 1, active + 3].includes(i)) {
          dots.push({ class: SMALLER, id: i })
        } else if ([active, active + 1, active + 2].includes(i)) {
          dots.push({ class: REGULAR, id: i, active: i === active })
        } else {
          dots.push({ class: HIDDEN, id: i })
        }
      })
    }
  }

  React.useEffect(() => {
    const dots = []
    if (images.length < 6) {
      images.forEach((image, i) => {
        dots.push({ class: REGULAR, id: i, active: i === active })
      })
    } else {
      filterDots(dots)
    }

    setDots(dots)
  }, [images])

  React.useEffect(() => {
    const newDots = deepcopy(dots)
    const nextActiveDot = newDots.find(dot => dot.id === active)
    const actualActiveDot = newDots.find(dot => dot.active)

    if (nextActiveDot && nextActiveDot !== actualActiveDot) {
      if (nextActiveDot.class === REGULAR) {
        if (actualActiveDot) {
          actualActiveDot.active = false
        }
        nextActiveDot.active = true

        setDots(newDots)
      } else {
        const direction = actualActiveDot.id > active ? LEFT : RIGHT
        const dots = []

        if (direction === LEFT) {
          filterDots(dots)
        } else {
          filterDots(dots, true)
        }

        setDots(dots)
      }
    }
  }, [active])

  const renderDots = () => {
    let left = 0
    if (dots.length < 6) {
      left = 0
      return dots.map((dot) => {
        const styles = { position: 'relative', margin: '0 4px' }

        return (
          <span
            style={styles}
            key={dot.id}
            className={`dot-indicator ${dot.class} ${dot.active ? 'active' : ''}`}
          />
        )
      })
    }

    const visible = dots.filter(dot => dot.class !== HIDDEN)
    const last = dots[dots.length - 1]
    if (last) {
      if (last.class === REGULAR) {
        left = SMALLER_WIDTH + SMALLEST_WIDTH + PADDING * 2
      } else if (last.class === SMALLER) {
        left = PADDING + SMALLEST_WIDTH
      }
    }

    return dots.map((dot, i) => {
      const styles = {}
      if (dot.class === HIDDEN && i < visible[0].id) {
        styles.left = `-${PADDING + SMALLEST_WIDTH}px`
      } else if (dot.class === HIDDEN && i > visible[visible.length - 1].id) {
        styles.left = "196px"
      } else {
        const prev = dots[i - 1]
        if (prev) {
          if (prev.class === SMALLER) {
            left += PADDING + SMALLER_WIDTH
          } else if (prev.class === SMALLEST) {
            left += PADDING + SMALLEST_WIDTH
          } else if (prev.class === REGULAR) {
            left += PADDING + REGULAR_WIDTH
          }
        }

        styles.left = `${left}px`
      }

      return (
        <span
          style={styles}
          key={dot.id}
          className={`dot-indicator ${dot.class} ${dot.active ? 'active' : ''}`}
        />
      )
    })
  }

  return (
    <div className="dot-carousel-wrapper">
      <div className="dot-carousel" style={{
        height: `${REGULAR_WIDTH}px`,
        width: `${PADDING * 7 + REGULAR_WIDTH * 6}px`
      }}>
        {renderDots()}
      </div>
    </div>
  )
}

export default DotCarousel
