import Document, { Head, Main, NextScript } from 'next/document';
import { getNextConfig } from "$ustoreinternal/services/utils";
import { createHeadSection } from '$ustoreinternal/services/headSection'
import { createFooterScripts } from '$ustoreinternal/services/footerScriptsSection'

export default class MyDocument extends Document {

  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    const { storeScriptUrls, storeStyleUrls } = {}
    const { assetPrefix } = getNextConfig()

    return (
      <html lang="en">
        <Head>
          <script src={`${assetPrefix}/static-internal/ie-11-polyfill.js`} />
          <script src={`${assetPrefix}/static-internal/fetch.polyfill.js?rand=${Math.random()}`} />
          <script src={`${assetPrefix}/static-internal/browser-compatibility-check.js?rand=${Math.random()}`} />
          <script src={`${assetPrefix}/static-internal/append-scripts.js?rand=${Math.random()}`} />
          {/* this is for supporting a favicon */}
          <link rel="shortcut icon" id='favicon' href='' />

          {createHeadSection(storeStyleUrls, assetPrefix)}
          {/* This is for a future support of ie 11 */}
          <script src={`${assetPrefix}/static-internal/css-vars-ponyfill.min.js`} />
        </Head>
        <body>
          <script src={`${assetPrefix}/static-internal/append-custom-css.js?rand=${Math.random()}`} />
          <script src={`${assetPrefix}/static-internal/append-theme-editor-vars.js?rand=${Math.random()}`} />
          <Main />
          <NextScript />
          {createFooterScripts(storeScriptUrls, assetPrefix)}
          <iframe id="legacy-iframe" src="about:blank" className="iframe" height="0" />
        </body>
      </html>
    );
  }
}
