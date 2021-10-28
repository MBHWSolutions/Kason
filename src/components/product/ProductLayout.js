
import './ProductLayout.scss'
import React, { Component } from 'react'

/**
 * A component that is loaded for displaying a product of type Kit
 *
 * @param {string} className -the class name to be added to the main container
 *
 * @param children
 */


const ProductLayout = ({ className, children }) => {
    if (!children) {
        return null
    }

    return <div className={`${className} product-layout`}>
        <div className='main-wrapper'>
            <div className='left'>
                {children.find((child) => { return child.type === "left" })}
            </div>
            <div className='right'>
                {children.find((child) => { return child.type === "right" })}
                <div className='sticky-price'>
                    {children.find((child) => { return child.type === "sticky" })}
                </div>
            </div>
        </div>
    </div>
}

export default ProductLayout


