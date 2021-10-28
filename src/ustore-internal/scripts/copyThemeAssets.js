const fse = require('fs-extra')
const theme = process.env.THEME_PAGES || 'AquaBlue'
const path = require('path')
const relpath = path.join.bind(path, __dirname)

const main = (xmpieBuild) => {
  if(xmpieBuild){
    fse.copySync(relpath(`../../themes/${theme}/assets/`), relpath('../../out/assets/'))
  }
  else{
    fse.copySync(relpath(`../../assets/`), relpath('../../out/assets/'))
  }

  fse.copySync(relpath(`../../ustore-internal/static/`), relpath('../../out/static-internal/'))
}

module.exports = main