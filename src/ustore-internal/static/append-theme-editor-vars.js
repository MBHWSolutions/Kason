//theme customization logic (injecting cssVariables/customCss into the DOM)
var themeCustomizationController = (function () {

  /* PRIVATE METHODS */
  var variablesContainerId = 'draftVariablesContainer';
  var customCssContainerId = 'draftCustomCssContainer';

  //create containers for injecting css into DOM
  function createStyleContainers() {
    insertStyleContainerToDom(variablesContainerId);
    insertStyleContainerToDom(customCssContainerId);
  }

  //insert style tag to dom with given id (if it not exists)
  function insertStyleContainerToDom(containerId) {
    var container = document.querySelector('#' + containerId);
    if (!container) {
      container = document.createElement('style');
      container.type = 'text/css';
      container.id = containerId;
      document.getElementsByTagName("body")[0].appendChild(container);
    }
  }

  //send message to legacy iframe to apply styles there
  function sendMessageToLegacy(msg) {
    var legacyFrame = document.querySelector('iframe.iframe');

    if (legacyFrame) {
      legacyFrame.contentWindow.postMessage(msg, '*');
    }

    // pass the data to Kitting iFrame as well
    var kitFrame = document.querySelector('iframe.iframe-modal');

    if (kitFrame) {
      kitFrame.contentWindow.postMessage(msg, '*');
    }

    // pass the data to static iFrame as well
    var staticFrame = document.querySelector('.iframe-helper iframe');

    if (staticFrame) {
      staticFrame.contentWindow.postMessage(msg, '*');
    }
  }


  function injectCss(containerId, cssText) {
    //ensure that custom containers are in dom in right order
    createStyleContainers();

    var styleContainer = document.querySelector('#' + containerId);
    styleContainer.innerHTML = '';
    styleContainer.appendChild(document.createTextNode(cssText));
  }

  //in case you need to delete css properties, they will be visible from custom css link, so it must be deleted
  function removeCustomCssLink() {
    var linksToRemove = document.querySelectorAll('link[href*="/Css/Custom.css" i]');
    linksToRemove.forEach(function (link) {
      link.parentNode.removeChild(link);
    })
  }
  /* END OF PRIVATE METHODS */

  //PUBLIC METHODS:
  //- reloadVariables
  //- reloadCustomCss
  return {
    reloadVariables: function (msg) {
      injectCss(variablesContainerId, msg.data.css);
      sendMessageToLegacy(msg);
    },

    reloadCustomCss: function (msg) {
      injectCss(customCssContainerId, msg.data.css);
      removeCustomCssLink();
      sendMessageToLegacy(msg);
    }
  }

}());

//listen post message from parent page
window.addEventListener('message', function (e) {
  var msg = e.data;
  if (!msg) {
    return;
  }
  if (msg.type === '@RELOAD_DRAFT_VARS') {
    themeCustomizationController.reloadVariables(msg);
  }

  if (msg.type === '@RELOAD_DRAFT_CSS') {
    themeCustomizationController.reloadCustomCss(msg);
  }
});

