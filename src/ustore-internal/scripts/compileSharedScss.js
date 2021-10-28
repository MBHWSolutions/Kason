const sass = require('node-sass')
const fs = require('fs')
const fse = require('fs-extra')
const {includeCssPaths} = require('../../next.dev.config')

const main = (files, output) => {
  fse.ensureDirSync(output)

  for (const {file, outFile} of files) {
    const target = `${output}/${outFile}`

    const renderedSass = sass.renderSync({
      file,
      outputStyle: 'nested',
      includeCssPaths
    })

    fs.writeFileSync(target, renderedSass.css.toString())
  }
}

module.exports = main
