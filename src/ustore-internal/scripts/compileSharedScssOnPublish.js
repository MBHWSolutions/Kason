const compileSharedCss = require(`./compileSharedScss`)
const themeFolder = process.argv[2]

const filesToCompile = [ {
  file: `${themeFolder}/styles/fonts.scss`,
  outFile: 'fonts.css'
},
  {
    file: `${themeFolder}/styles/variables.scss`,
    outFile: 'variables.css'
  },
]

compileSharedCss(filesToCompile, `${themeFolder}/out/assets` )