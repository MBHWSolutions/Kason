import React, { Component } from 'react'
import themeContext from '$ustoreinternal/services/themeContext'
import theme from '$styles/_theme.scss'
import { deleteCookie } from '$ustoreinternal/services/utils'
import { Router } from '$routes'
import { UStoreProvider } from '@ustore/core'


/**
 * A component that is loaded for displaying and comunicating with an Iframe.
 *
 * @param {string} className -the class name to be added to the iframe container
 * @param {string} orderItemID - the orderItemID to pass to the iFrame's src.
 * @param {boolean} doValidate - when the flag is true, calling validate function to the iframe
 * @param {function} onLoaded - callback function for calling when iframe finished loading.
 * @param {function} onStatusChanged - callback function for calling when iframe finished validation.
 * @param {function} onSizeChanged - callback function for calling when iframe changes it size.
 * @param {function} onLoadReceived - a callback function to clear the doLoad flag, so that it will only happen once.
 * @param {function} onValidateReceived - a callback function to clear the doValidate flag, so that it will only happen once.
 * @param {function} onOnlineErrors
 * @param {function} onMessageRecievedFromIframe = a callback that allows parent component react to messages as well.
 */

class IFrameHelper extends Component {

    constructor(props) {
        super(props)

        this.state = {
            isLoading: false,
            isLoaded: false,
            isValidating: false,
            isValid: false,
            iFrameUrl: '',
            doValidate: false,
            onLineErrors: []

        }

        this.scrollableContainer = React.createRef()
        this.iframeElem = React.createRef()

    }

    static getDerivedStateFromProps(props, state) {
        if (props.doValidate && !state.doValidate) {
            return { doValidate: true }
        }
        return { doValidate: false }
    }

    componentDidMount() {
        const { orderItemID, onValidateReceived, onLoadReceived } = this.props

        // add all handlers to the iFrame messages.
        this.addIframeMessageHandlers()


        if (!this.state.isLoaded && !this.state.isLoading && orderItemID) {
            this.setState({ iFrameUrl: this.getIframeSrc(orderItemID), isLoaded: false, isLoading: true })
            onLoadReceived && onLoadReceived()
        }

        if (!this.state.isValidating && this.state.isLoaded && this.state.doValidate) {
            this.setState({ isValidating: true })
            this.validate()
            onValidateReceived && onValidateReceived()
        }
    }

    componentDidUpdate() {

        const { onValidateReceived } = this.props

        if (!this.state.isValidating && this.state.isLoaded && this.state.doValidate) {
            this.setState({ isValidating: true })
            this.validate()
            onValidateReceived && onValidateReceived()
        }
    }

    componentWillUnmount() {

        window.removeEventListener('message', this.onMessageRecieved)
    }


    addIframeMessageHandlers() {


        window.addEventListener('message', this.onMessageRecieved)
    }

    onMessageRecieved = (e) => {

        const { orderItemID, onLoaded, onStatusChanged, onOnlineErrors, onMessageRecievedFromIframe } = this.props

        if (e.data.type === '@PRODUCT_PROPERTIES_STATUS') {
            const msgOrderItemID = e.data.data.orderItemID
            if (msgOrderItemID && msgOrderItemID === orderItemID) {

                const isValid = e.data.data.isValid
                const errors = e.data.data.errors

                this.setState({ isValid: isValid, isValidating: false, errors, onLineErrors: [] })
                onStatusChanged && onStatusChanged(orderItemID, isValid, errors, [])

            }
        }
        if (e.data.type === '@PRODUCT_PROPERTIES_VALIDATION') {
            const msgOrderItemID = e.data.data.orderItemID
            if (msgOrderItemID && msgOrderItemID === orderItemID) {

                const errors = e.data.data.errors

                this.setState({ onLineErrors: errors })
                onOnlineErrors && onOnlineErrors(orderItemID, errors)
            }
        }
        if (e.data.type === '@PRODUCT_POPERTIES_LOADED') {
            const msgOrderItemID = e.data.data.orderItemID
            if (msgOrderItemID && msgOrderItemID === orderItemID) {

                this.setState({ isLoaded: true, isLoading: false })
                onLoaded && onLoaded(orderItemID)
            }
        }
        if (e.data.type === '@CHANGE_DIMENSIONS') {
            const msgOrderItemID = e.data.data.orderItemID
            if (msgOrderItemID && msgOrderItemID === orderItemID) {
                const height = e.data.data.height
                const width = e.data.data.width

                // TODO
                // handle iframe size change.
                if (this.iframeElem && this.iframeElem.style) {
                    this.iframeElem.style.height = `${height}px`
                    this.iframeElem.style.width = `${width}px`
                }
            }
        }

        if (e.data.type === '@CHANGE_LEGACY_ROUTE') {
            if (e.data.data.match(/\/login\.aspx\?/) || e.data.data.match(/\/ShowMessage\.aspx\?.*StoreID=-1&ErrorCode=3/)) {
                const { securityToken, storeID, classicUrl } = themeContext.get()
                const cookies = ['_token', '_storeID', '_language']
                cookies.forEach(cn => deleteCookie(cn))

                const url = `${classicUrl}/logout.aspx?SecurityToken=${securityToken}&StoreGuid=${storeID}`
                Router.pushRoute(url)
            }
        }

        onMessageRecievedFromIframe && onMessageRecievedFromIframe(e)


    }

    getIframeSrc(orderItemID) {
        const { width } = document.getElementsByClassName('product-properties')[0].getBoundingClientRect()
        const desktopBreakpoint = parseInt(theme.lg.replace('px', ''))
        const viewMobileVal = document.body.clientWidth > desktopBreakpoint ? 'viewMobile=false' : 'viewMobile=true'
        const { classicUrl, storeID } = themeContext.get()
        const { currentCulture, currentCurrency, currentUser } = UStoreProvider.state.get()
        const url = `${classicUrl}/ProductProperties.aspx?OrderItemId=${orderItemID}&isFrameMode=true&StoreGuid=${storeID}&${viewMobileVal}&userUniqueId=${currentUser ? currentUser.ID : ''}&rand=${Math.random()}&width=${width}&showValidation=false&currentCurrencyFriendlyID=${currentCurrency ? currentCurrency.FriendlyID : ''}&currentCultureFriendlyID=${currentCulture ? currentCulture.FriendlyID : ''}`
        return url
    }

    validate() {
        // send a message to the iFrame that will start the validation process.
        // when validation will complete, a @PRODUCT_PROPERTIES_STATUS message will be sent back.
        // if validation passed, the data will also be saved by the BE.
        if (this.iframeElem.contentWindow) {
            this.iframeElem.contentWindow.postMessage({
                type: '@PRODUCT_PROPERTIES_SAVE',
                data: {}
            }, '*')
        }

    }

    render() {

        const { className } = this.props

        return <div className='iframe-helper'>
            <div className="scrollable-container" ref={(ref) => this.scrollableContainer = ref}>
                <iframe
                    className={`${className}`}
                    src={this.state.iFrameUrl}
                    scrolling='no' height='auto' width='auto'
                    ref={(ref) => this.iframeElem = ref} frameBorder="0"
                />
            </div>
        </div>
    }

}

export default IFrameHelper