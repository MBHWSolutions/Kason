// this script checks browser compatibility.
// in case IE 11 or earlier is used, the script uses the internal loginByUrl API to obtain the store GUID and an anonymous token needed to get to the login page.
// on login page a proper message will appear and further navigation will be blocked. 

(function () {
    if (window.navigator.userAgent.indexOf('MSIE ') !== -1 || window.navigator.userAgent.indexOf('Trident/7.') !== -1) {
        var url = window.location.href;

        fetch('/uStoreRestAPI/v1/store/loginByUrl',
            {
                method: 'POST',
                body: JSON.stringify({ FullURL: url }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        ).then(function (r) { return r.json() })
            .then(function (json) {
                const token = json.Token.Token;
                const storeID = json.StoreID;

                if (token && storeID)
                    window.location.href = '/ustore/logout.aspx?SecurityToken=' + token + '&StoreGuid=' + storeID + '&forceLogin=true'
                else
                    window.location.href = '/ustore/error.aspx'

            }).catch(function (error) {
                console.log(error)
                window.location.href = '/ustore/error.aspx'
            })
    }
})()