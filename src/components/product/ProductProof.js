import React from 'react'
import { Modal, ModalBody } from "reactstrap"
import { t } from '$themelocalization'
import ImageLoader from '$core-components/ImageLoader'
import ImageZoom from "../ImageZoom"
import "./ProductProof.scss"

const ProductProof = ({ type, src, isModalOpen, onCloseModal, modalClassName = 'product-proof-modal', isMobile = false }) => {
  if (!src) {
    return null
  }

  const isProofPdf = type === "application/pdf"

  return (
    <Modal toggle={onCloseModal} isOpen={isModalOpen} modalClassName={`${modalClassName} product-proof-modal`}>
      <div className='modal-close'>
        <div className='close-btn' onClick={onCloseModal}>×</div>
      </div>
      <ModalBody>
        {isProofPdf &&
          <div className='proof-modal-pdf'>
            <object data={src + '&inline=true&#view=Fit'}
              type="application/pdf"
              width="100%"
              height="100%">
              <div className='download-pdf-wrapper'>
                <a href={src}>{t('productProof.download')}</a>
              </div>
            </object>
          </div>}
        {!isProofPdf && !isMobile &&
          <div className="proof-modal-image"><ImageZoom src={src} /></div>
        }
        {!isProofPdf && isMobile &&
          <div className="proof-modal-image mobile"><ImageLoader className='image' src={src} /></div>
        }
      </ModalBody>
    </Modal>
  )
}

export default ProductProof