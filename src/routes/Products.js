import { UStoreProvider } from '@ustore/core'
import { Component } from 'react'
import React from 'react'
import Layout from '../components/Layout'
import './Products.scss'
import LoadingDots from '$core-components/LoadingDots'
import { productTypes, getIsNGProduct } from '../services/utils'
import themeContext from '$ustoreinternal/services/themeContext'
import { t } from '$themelocalization'



import KitProduct from '../components/kit/KitProduct'
import StaticProduct from '../components/static/StaticProduct'

class Products extends Component {

    constructor(props) {
        super(props)
    }

    renderLoader() {

        return (
            <div>
                <div className={'product-loading'}>
                    <LoadingDots />
                    {t('product.loading-msg')}
                </div>
            </div>
        )
    }

    render() {
        if (!this.props.state || !this.props.customState) {
            return <Layout {...this.props}>
                {this.renderLoader()}
            </Layout>
        }

        const { customState: { currentProduct } } = this.props

        if (!currentProduct) {
            return <Layout {...this.props}>
                {this.renderLoader()}
            </Layout>
        }

        // check type of prodocut to decide which component to render.
        switch (currentProduct.Type) {
            case productTypes.KIT:
                return <Layout {...this.props}>
                    <KitProduct key={currentProduct.ID} {...this.props} />
                </Layout>
            case productTypes.STATIC:
                return <Layout {...this.props}>
                    <StaticProduct key={currentProduct.ID} {...this.props} />
                </Layout>
            default:
                return null
        }
    }
}

const checkRedirectToLegacyProduct = (ctx, product) => {
    const { currentStore } = UStoreProvider.state.get()

    if (getIsNGProduct(product.Type, currentStore) === false) {

        if (ctx && ctx.res) {
            ctx.res.writeHead(301, {
                Location: themeContext.context['assetPrefix'] + ctx.req.path.replace('/products/', '/product/').substring(1)
            })
            ctx.res.end()
        }
    }
}

Products.getInitialProps = async function (ctx) {

    const { query: { id: productFriendlyID, OrderItemId: orderItemID } } = ctx

    if (!productFriendlyID) return {}

    const { currentProduct } = UStoreProvider.state.customState.get()
    if (currentProduct && currentProduct.FriendlyID === parseInt(productFriendlyID)) {

        checkRedirectToLegacyProduct(ctx, currentProduct)

        return {}
    }

    const productID = await UStoreProvider.api.products.getProductIDByFriendlyID(productFriendlyID)
    const productDetails = await UStoreProvider.api.products.getProductsByIDs([productID])

    checkRedirectToLegacyProduct(ctx, productDetails[0])

    if (productDetails && productDetails.length === 1) {
        return { currentProduct: productDetails[0], currentOrderItemId: orderItemID }
    }

    return {}
}

export default Products
