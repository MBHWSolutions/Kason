import './Footer.scss'

/**
 * This component represents the footer in the store
 */
const Footer = () => {
  return (
    /* Bobby Long Edit - Custom Footer for Kason */
    <div className="footer">
       <ul className="list">
         <li><a href="https://s3.amazonaws.com/hwprinting.xmpie/Kason/Website+Assets/KASON-how-to-use-this-site.pdf">Using this Site</a></li>
         <li><a href="https://s3.amazonaws.com/hwprinting.xmpie/Storefront+Ordering+Guides/kason+order+guide.pdf">Ordering Guide</a></li>
       </ul>
       <ul className="list">
         <li><a href="https://www.hwsolutions.com/returns-and-exchanges/">Request a Return</a></li>
         <li><a href="mailto: bryan.nix@hwsolutions.com">Place a Special Order/Bulk Order</a></li>
       </ul>
    </div>
    /* End Custom Edit */
  )
}

export default Footer
