/**
 * Wrapper component for flag image
 *
 * @param {object} props - all the properties we would like to pass to the flag image tag including:
 *      @param {string} name - the flag file name
 *      @param {number} width - the flag image width
 *      @param {number} height - the flag image height
 *      @param {string} [className] - a class to place on flag image element
 */

import themeContext from "$ustoreinternal/services/themeContext";

const Flag = (props) => {
    const assetPrefix = (themeContext && themeContext.get().hasOwnProperty('assetPrefix')) ? themeContext.get().assetPrefix : props.assetPrefix
    const { name } = props

    if(!name) {
      return null;
    }

    const src = (`${assetPrefix}/static-internal/images/flags/${name.toLowerCase()}`)
    return (
      <img
        src={src}
        {...props}
        style={{display:'inline-block'}}
      />
    );
}

export default Flag;
