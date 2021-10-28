import React from 'react'
import Head from 'next/head'
import themeContext from '$ustoreinternal/services/themeContext'

const HIDDEN = 1
const SUFFIX = 2
const PREFIX = 3

const PRODUCT = 'product'
const PRODUCTS = 'products'
const CATEGORY = 'category'
const HOME = 'home'

const getSEO = (data, defaults) => {
  const { title, description } = defaults

  if (!data) {
    return { title, description }
  }

  return { title: data.Title, description: data.Description }
}

/**
 @param {string} string - capitalize first letter
 */
const capitalize = (string) => {
  return string ? string.charAt(0).toUpperCase() + string.slice(1) : ''
}

/**
 *
 * @param {string} pageTitle
 * @param {string} storeTitle
 * @param {number} type
 */
const concatenate = (pageTitle, storeTitle, type = SUFFIX) => {
  if (!pageTitle || !storeTitle) {
    return
  }

  switch (type) {
    case HIDDEN:
      return pageTitle
    case PREFIX:
      return `${storeTitle} ${pageTitle}`
    case SUFFIX:
      return `${pageTitle} ${storeTitle}`
  }
}

const HeadSEO = ({ currentStore, customState }) => {
  if (!currentStore || !customState) {
    return null
  }

  const { Name: storeTitle, Description: storeDescription, SeoConfiguration } = currentStore
  const { page } = themeContext.get()

  let titleAdditionFormat = SUFFIX
  let titleAdditionText = storeTitle
  if (SeoConfiguration) {
    titleAdditionFormat = SeoConfiguration.TitleTagType
    titleAdditionText = SeoConfiguration.TitleTag
  }

  let title = storeTitle
  let description = ''
  let data

  switch (page) {
    case HOME:
      data = getSEO(
        SeoConfiguration,
        { title: storeTitle, description: storeDescription }
      )

      title = data.title
      description = data.description
      break
    case CATEGORY:
      const { currentCategory } = customState

      if (currentCategory) {
        data = getSEO(
          currentCategory.SeoConfiguration,
          { title: currentCategory.Name, description: currentCategory.Description }
        )

        title = concatenate(data.title, titleAdditionText, titleAdditionFormat)
        description = data.description
      }

      break

    case PRODUCTS:
    case PRODUCT:
      const { currentProduct } = customState

      if (currentProduct) {
        data = getSEO(
          currentProduct.SeoConfiguration,
          { title: currentProduct.Name, description: currentProduct.Description }
        )

        title = concatenate(data.title, titleAdditionText, titleAdditionFormat)
        description = data.description
      }

      break
    default:
      title = concatenate(capitalize(page), titleAdditionText, titleAdditionFormat)
  }

  return (
    <Head>
      <title>{title.replace(/<[^>]*>?/gm, '') || ''}</title>
      {description && <meta name="description" content={description.replace(/<[^>]*>?/gm, '')} />}
    </Head>
  )
}

export default HeadSEO
