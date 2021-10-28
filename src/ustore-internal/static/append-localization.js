(function () {

    const queryOrCookieStrToObj = function(str) {
      if (str && str !== '') {
        return JSON.parse('{"' +
          str
            .replace(/^(.*)\?/, '')
            .split(/[&;]\s?/g)
            .map(function(keyval){ return keyval.replace(/=/, '":"')})
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
    document.cookie && document.cookie.split(/\s*;\s*/).forEach(function(pair) {
      pair = pair.split(/\s*=\s*/);
      cookieParams[pair[0]] = pair.splice(1).join('=');
    });

    if (queryParams.StoreGuid) {
      cookieParams._storeID = queryParams.StoreGuid
      document.cookie = "_storeID=" + queryParams.StoreGuid
    }

    var storeID = queryParams.StoreGuid || cookieParams._storeID

    var caltureRegex = /\/([a-z]{2,}-[A-Za-z]{2,})/;
    var culture = location.pathname.match(caltureRegex)

  if (culture && storeID && culture.length >= 2 && storeID.length > 0) {
    document.writeln('<script type="application/javascript" src="/uStoreRestAPI/v1/store/localization?cultureCode=' + culture[1] + '&storeID=' + storeID + '"></script>')
  }
}
)()

