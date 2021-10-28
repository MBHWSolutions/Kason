import React from "react"
import { Carousel, CarouselItem } from 'reactstrap'
import Swipeable from 'react-swipeable'
import DotCarousel from "./DotCarousel"
import './ImageCarousel.scss'
import { ReactComponent as LeftArrow } from "$assets/icons/left_arrow.svg"
import { ReactComponent as RightArrow } from "$assets/icons/right_arrow.svg"
import MultiItemsCarousel from "$core-components/MultiItemsCarousel"
import ImageZoom from "../ImageZoom"
import ImageLoader from "$core-components/ImageLoader"

const SHOW_TITLE = 1
const SHOW_NUM = 2
const IMAGES_LIMIT = 20

var slides = []

const ImageCarousel = props => {
  const { images, scale = 0.7, onChange, zoomAllowed = true } = props
  const wrapper = React.useRef(null)
  if (!images || images.length === 0) {
    return null
  }

  const [animating, setAnimating] = React.useState(false)
  const [activeImage, setActiveImage] = React.useState(0)
  const [activeHoveredImage, setActiveHoveredImage] = React.useState(-1)
  const [showArrows, setShowArrows] = React.useState(true)
  const [hoveredImageTimeout, setHoveredImageTimeout] = React.useState(null)

  React.useEffect(() => {
    onChange && onChange(activeImage)
  }, [activeImage])

  React.useEffect(() => {
    hoveredImageTimeout && clearTimeout(hoveredImageTimeout)

    if (activeHoveredImage !== -1) {
      setHoveredImageTimeout(setTimeout(() => setActiveImage(activeHoveredImage), 500))
    }
  }, [activeHoveredImage])

  const triggerZoomed = (imageZoomed) => {
    if (imageZoomed) {
      setShowArrows(false)
    } else {
      setShowArrows(true)
    }
  }


  const next = () => {
    if (animating) return
    const nextIndex = activeImage === images.length - 1 ? 0 : activeImage + 1
    setActiveImage(nextIndex)
  }
  const previous = () => {
    if (animating) return
    const nextIndex = activeImage === 0 ? images.length - 1 : activeImage - 1
    setActiveImage(nextIndex)
  }

  // if (!slides || slides.length === 0 || slides.length !== images.length) {
  slides = images.map(image => (
    <CarouselItem
      key={image.Url}
      onExiting={() => setAnimating(true)}
      onExited={() => setAnimating(false)}
    >
      <div className="image-wrapper">
        {zoomAllowed
          ? <ImageZoom onImageZoomed={triggerZoomed} src={image.Url} />
          : <ImageLoader className='image' src={image.Url} />
        }
      </div>
    </CarouselItem>
  ))
  // }



  const getThumbnailTitleWrapper = () => {
    const titleShouldAppears = props.showTitle && images[activeImage].DisplayName && images[activeImage].DisplayName.trim().length > 0

    let type = 0
    let value = null
    if (titleShouldAppears) {
      type = SHOW_TITLE
    } else if (images.length > IMAGES_LIMIT) {
      type = SHOW_NUM
    }

    switch (type) {
      case SHOW_TITLE:
        value = images[activeImage].DisplayName
        break
      case SHOW_NUM:
        value = `${activeImage + 1}/${images.length}`
        break
      default:
        return null
    }

    return (
      <div className="thumbnail-title-wrapper">
        {value}
      </div>
    )
  }



  return (
    <div ref={wrapper} className="main-carousel-wrapper">
      <div
        id="image-carousel-wrapper"
        className="image-carousel-wrapper carousel-fade"
      >
        {slides.length > 1 &&
          <span className={`arrows left-arrow${showArrows ? ' show' : ''}`}>
            <LeftArrow width="40px" height="40px" onClick={previous} />
          </span>
        }
        <Swipeable
          trackMouse
          preventDefaultTouchmoveEvent
          onSwipedLeft={() => slides.length > 1 && next()}
          onSwipedRight={() => slides.length > 1 && previous()}
        >
          <Carousel
            interval={false}
            previous={previous}
            next={next}
            activeIndex={activeImage}>
            {slides}
          </Carousel>
        </Swipeable>
        {slides.length > 1 &&
          <span className={`arrows right-arrow${showArrows ? ' show' : ''}`}>
            <RightArrow width="40px" height="40px" onClick={next} />
          </span>
        }
      </div>
      {getThumbnailTitleWrapper()}
      {images.length > 1 &&
        <MultiItemsCarousel
          responsive={{
            1919: { items: 7 },
            1439: { items: 5 },
            1199: { items: 4 },
            1024: { items: 3 },
            767: { items: 2 }
          }}
          leftArrow={{
            width: 7, height: 12
          }}
          rightArrow={{
            width: 7, height: 12
          }}
          styles={{ width: `100%` }}
          images={images.map(image => image.Url)}
          onItemClicked={setActiveImage}
          onItemHovered={setActiveHoveredImage}
          activeImage={activeImage}
          hideDisabledArrows={false}
        />}
      <DotCarousel images={images} active={activeImage} />
    </div>
  )
}

export default ImageCarousel