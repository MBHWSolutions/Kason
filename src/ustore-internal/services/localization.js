import 'isomorphic-fetch'

export const loadLocalization = async ({ apiUrl }, locale, url) => {

  try {
    const localeUrl = `${apiUrl}/v1/store/resourceByUrl?url=${url}&type=1&cultureCode=${locale}&isDraft=false`

    const jsonFile = await fetch(localeUrl)
    const fileContent = await jsonFile.text()

    const json = fileContent
      .replace(/window\.uStoreLocalization\s+=\s+window\.uStoreLocalization\s+\|\|\s+{};/igm, '')
      .replace(/window.uStoreLocalization\[\'[a-z]{2}-[A-Za-z]+\'\]\s+=/igm, '')
      .replace(/\s*;$/, '')
    return JSON.parse(json)
  } catch (e) {
    return {}
  }
}
