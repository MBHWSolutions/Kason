(async function () {

  const queryOrCookieStrToObj = function (str) {
    if (str && str !== '') {
      return JSON.parse('{"' +
        str
          .replace(/^(.*)\?/, '')
          .split(/[&;]\s?/g)
          .map(function (keyval) { return keyval.replace(/=/, '":"') })
          .join('","')
        + '"}', function (key, value) {
          return key === "" ? value : decodeURIComponent(value)
        })
    }
    return {}
  }

  var search = location.search.substring(1);
  var queryParams = queryOrCookieStrToObj(search)

  var cookieParams = {};
  document.cookie && document.cookie.split(/\s*;\s*/).forEach(function (pair) {
    pair = pair.split(/\s*=\s*/);
    cookieParams[pair[0]] = pair.splice(1).join('=');
  });

  if (queryParams.StoreGuid) {
    cookieParams._storeID = queryParams.StoreGuid
    document.cookie = "_storeID=" + queryParams.StoreGuid + '; path=/;'
  }

  //Initialize the _showThemeAsDraft only when logging to the application. This is when the 'SecurityToken' param exists
  if (queryParams.SecurityToken) {
    const isDraft = (!!queryParams.ShowThemeAsDraft).toString()
    cookieParams._showThemeAsDraft = isDraft
    document.cookie = "_showThemeAsDraft=" + isDraft + '; path=/;'
  }

  var status = cookieParams._showThemeAsDraft === 'true' ? 'true' : 'false'

  var caltureRegex = /\/([a-z]{2}-[A-Za-z]{2})/;
  var culture = location.pathname.match(caltureRegex)

  var url = window.location.href

  document.writeln('<link type="text/css" rel="stylesheet" as="style" href="/uStoreRestAPI/v1/store/resourceByUrl?url=' + encodeURIComponent(url) + '&type=2&cultureCode=' + culture[1] + '&isDraft=' + status + '"/>')
  document.writeln('<link type="text/css" rel="stylesheet" as="style" href="/uStoreRestAPI/v1/store/resourceByUrl?url=' + encodeURIComponent(url) + '&type=3&cultureCode=' + culture[1] + '&isDraft=' + status + '"/>')
  document.writeln('<link type="text/css" rel="stylesheet" as="style" href="/uStoreRestAPI/v1/store/resourceByUrl?url=' + encodeURIComponent(url) + '&type=4&cultureCode=' + culture[1] + '&isDraft=' + status + '"/>')

}
)()
