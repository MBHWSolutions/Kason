export const createFooterScripts = (storeScriptUrls, baseUrl) => {
  const storeScript = storeScriptUrls ? storeScriptUrls.map((scriptUrl, i) => <script src={scriptUrl} key={i}></script>) : []
  return [
    ...storeScript
  ]
}
