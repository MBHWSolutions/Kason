import themeContext from "$ustoreinternal/services/themeContext";
import urlGenerator from '$ustoreinternal/services/urlGenerator'

//NOTE: this method is not supported in SSR
import { getNextConfig, isServer } from "./utils";

export const getVariableValue = (varName, defaultValue, isImageURL, isURL) => {
  const setVarValue = (value) => {
    value = value.trim()
    if (value.startsWith("\"") || value.startsWith("'")) {
      value = value.substring(1, value.length - 1)
    }
    if (isImageURL && value.startsWith("Assets") || value.startsWith("assets")) {
      const { showThemeAsDraft, storeID } = themeContext.get()
      const { themeCustomizationUrl } = getNextConfig()
      const imagePrefix = `${themeCustomizationUrl}/${storeID}/${showThemeAsDraft === 'true' ? 'Draft' : 'Published'}`
      value = `${imagePrefix}/${value}`
    }
    if (isURL && value.startsWith("/")) {
      let qs = null

      if (value.indexOf('?') > -1) {
        qs = value.split('?')[1]
        value = value.substring(0, value.indexOf('?'))
      }

      const params = value.split('/')
      const paramsObj = { page: params[1] }
      if (params.length > 2) {
        paramsObj.id = params[2]
      }

      value = `${urlGenerator.get(paramsObj)}${qs ? `?${qs}` : ''}`
    }
    return value
  }

  if (!isServer()) {
    const style = window.getComputedStyle(document.body)
    let varValue = style.getPropertyValue(varName)
    varValue = setVarValue(varValue)
    return (varValue && varValue.length) ? varValue : defaultValue
  }

  return defaultValue
}
