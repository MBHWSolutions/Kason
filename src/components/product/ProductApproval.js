import React from 'react'
import { Modal, ModalBody } from "reactstrap"
import theme from '$styles/_theme.scss'
import { t } from '$themelocalization'

import "./ProductApproval.scss"
import ImageZoom from "../ImageZoom"
const ProductApproval = ({ type, isModalOpen, onCloseModal, src, onAddToCartClick, addToCartBtnText, checkboxText, errorText }) => {
  if (!src) {
    return null
  }

  const isMobile = document.body.clientWidth < parseInt(theme.lg.replace('px', ''))

  const isProofPdf = type === "application/pdf"
  const isimage = type.startsWith('image/')
  const [approved, setApproved] = React.useState(false)
  const [showError, setShowError] = React.useState(false)

  const onAddClicked = () => {
    if (approved) {
      setShowError(false)
      onAddToCartClick()
    }
    else {
      setShowError(true)
    }
  }

  return (
    <Modal toggle={onCloseModal} isOpen={isModalOpen} modalClassName="proof-approval">
      <div className={`${isProofPdf ? 'transparent' : ''} modal-close`}>
        <div className='close-btn' onClick={onCloseModal}>×</div>
      </div>
      <ModalBody>
        <div className={`approval-title mobile`}>
          {t('productProof.review_label')}
        </div>
        {isProofPdf && !isMobile &&
          <div className='approve-modal-pdf'>
            <object data={src + '&inline=true&#view=Fit'}
              type="application/pdf"
              width="100%"
              height="100%"
            >
            </object>
          </div>
        }
        {isimage && (
          !isMobile ?
            <div className="approval-image-wrapper"><ImageZoom src={src} /></div>
            :
            <div className="approval-image-wrapper mobile"><img src={src} /></div>
        )
        }
        {((!isimage && !isProofPdf) || (isProofPdf && isMobile)) &&
          <div className={`approve-modal-pdf ${isMobile ? 'mobile' : ''}`}>

            <div className='download-pdf-wrapper'>
              <a download href={src}>{t('productProof.download')}</a>
            </div>
          </div>
        }
        <div className={`proof-approval ${isMobile ? 'mobile' : ''}`}>
          <div className="approval-title desktop">
            {t('productProof.review_label')}
          </div>
          <div className="approval-checkbox">
            <label>
              <input type="checkbox" onChange={() => { setApproved(prev => !prev) }} />
              <span className='checkbox-label'>{checkboxText ? checkboxText : 'Proof is approved'}</span>
              <span className="required">*</span>
            </label>
          </div>
          {
            showError && <div className='proof-approval-required'>
              <span>{errorText ? errorText : "Please confirm that the proof is approved"}</span>
            </div>
          }
          <div
            className='button button-primary add-to-cart-button'
            onClick={onAddClicked}
          >
            {addToCartBtnText}
          </div>
        </div>
      </ModalBody>
    </Modal >
  )
}

export default ProductApproval