(function () {

  var queryOrCookieStrToObj = function (str) {
    if (str && str !== '') {
      return JSON.parse('{"' +
        str
          .replace(/^(.*)\?/, '')
          .split(/[&;]\s?/g)
          .map(function (keyval) {
            return keyval.replace(/=/, '":"')
          })
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
    cookieParams[pair[0]] = pair.splice(1).join('=')
  });

  if (queryParams.StoreGuid) {
    cookieParams._storeID = queryParams.StoreGuid
    document.cookie = "_storeID=" + queryParams.StoreGuid + '; path=/;'
  }

  var caltureRegex = /\/([a-z]{2}-[A-Za-z]{2})/;
  var culture = location.pathname.match(caltureRegex)

  var url = window.location.href

  if (culture && url && culture.length >= 2 && url.length > 0) {

    window.onload = function () {
      // check if google analytics code exists for store
      fetch('/uStoreRestAPI/v1/store/resourceByUrl?url=' + encodeURIComponent(url) + '&type=5&cultureCode=' + culture[1] + '&isDraft=false')
        .then(function (r) {
          return r.text()
        })
        .then(function (text) {
          const GA_ID = /UA-[0-9]*-[0-9]/
          const res = text.match(GA_ID)

          // if code exists and contain an Analytics code (UA-XXXXX-Y), add the analytics.js include
          if (res && res.length > 0) {
            (function (i, s, o, g, r, a, m) {
              i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
                (i[r].q = i[r].q || []).push(arguments)
              }, i[r].l = 1 * new Date(); a = s.createElement(o),
                m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
            })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

            // initiate the analytics functionality and send a pageview,
            window.ga('create', res[0], 'auto');
            window.ga('send', 'pageview', window.location.asPath);
          }
        })
    }

    // add localization
    document.writeln('<script type="application/javascript" src="/uStoreRestAPI/v1/store/resourceByUrl?url=' + encodeURIComponent(url) + '&type=1&cultureCode=' + culture[1] + '&isDraft=false"></script>')
  }
}
)()

