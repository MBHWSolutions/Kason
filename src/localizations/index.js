import themeContext from '$ustoreinternal/services/themeContext'
const i18n = require('roddeh-i18n')
import enUs from './en-US'
import frFr from './fr-FR'
import deDE from './de-DE'
import jaJP from './ja-JP'
import enGB from './en-GB'
import esES from './es-ES'
import nlNL from './nl-NL'
import ptBR from './pt-BR'
import { globalVar } from "$ustoreinternal/services/utils"

const fixTranslation = (v) => {
  const reFormat = /{\s*(.*?)\s*}/igm
  return v.replace(reFormat, '%{$1}')
}
const fixTranslationValues = (t) => {
  if (!t) {
    return ''
  }

  return Object
    .entries(t)
    .map(([k,v]) =>  ({  key:k, value: fixTranslation(v) }))
    .reduce((r, i) => ({ ...r, ...{ [i.key]: i.value } }), {})
}

const localizations = {
  'en-US' : i18n.create({ values: fixTranslationValues(enUs) }),
  'fr-FR' : i18n.create({ values: fixTranslationValues(frFr) }),
  'de-DE' : i18n.create({ values: fixTranslationValues(deDE) }),
  'ja-JP' : i18n.create({ values: fixTranslationValues(jaJP) }),
  'en-GB' : i18n.create({ values: fixTranslationValues(enGB) }),
  'es-ES' : i18n.create({ values: fixTranslationValues(esES) }),
  'nl-NL' : i18n.create({ values: fixTranslationValues(nlNL) }),
  'pt-BR' : i18n.create({ values: fixTranslationValues(ptBR) })
}

const NO_LOCALIZATION = '[no localization]'
export const t = function () {
  const languageCode = themeContext.get('languageCode')

  if (!languageCode) {
    return ''
  }

  const globalLocalization = globalVar.uStoreLocalization || {}

  if ( typeof globalLocalization[languageCode] !== 'function' ) {
    globalLocalization[languageCode] = i18n.create({ values: fixTranslationValues(globalLocalization[languageCode]) })
  }

  const args =  [...arguments]
  if (args.length > 1 && typeof args[1] === 'string') {
    args[1] = fixTranslation(args[1])
  }
  const globalTranslation = globalLocalization[languageCode] ? globalLocalization[languageCode](...args) : NO_LOCALIZATION
  const bundledTranslation = localizations[languageCode] ? localizations[languageCode](...args) : NO_LOCALIZATION


  if (bundledTranslation !== arguments[0] && bundledTranslation !== NO_LOCALIZATION) {
    return bundledTranslation
  }

  return globalTranslation === arguments[0] ? NO_LOCALIZATION : globalTranslation
};

export default localizations
