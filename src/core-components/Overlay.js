/**
 * @function Overlay - Shadow overlay as a background for modals, popups etc.
 * 
 * @param {bool} isActive - true: display, false: hide
 * @param {func} overlayClicked - the function to call when the user clicks on the overlay
 */

import './Overlay.scss'

const Overlay = ({isActive, overlayClicked}) => {

	let className = "overlay";
	className += isActive ? " active" : "";

	return (
		<div className={className} onClick={overlayClicked}/>
	)
}

export default Overlay
