import React, {Component} from 'react'
import {Legacy} from './Legacy'
import {UStoreProvider} from "@ustore/core";

export default class Product extends Component {
  static getInitialProps = async (ctx) => {
    const { query: { id: productFriendlyID } } = ctx

    if (!productFriendlyID) return {}

    const productID = await UStoreProvider.api.products.getProductIDByFriendlyID(productFriendlyID)
    const currentProduct = await UStoreProvider.api.products.getProductByID(productID, false)

    return {
      currentProduct
    }
  }

  render() {
    return <Legacy {...this.props}/>
  }
}