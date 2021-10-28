// const isNodeVersionCorrect = require('./checkNodeVersion')

// if (!isNodeVersionCorrect()) {
//   return
// }

const fs = require('fs')
const fse = require('fs-extra')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const path = require('path')
const archiver = require('archiver')
const compileSharedScss = require('./compileSharedScss')
const copyThemeAssets = require('./copyThemeAssets')
const relpath = path.join.bind(path, __dirname)
const themePackage = require(`../../package.json`)

const argv = (str) => {
  const idx = process.argv.findIndex((a) => a.startsWith(str))
  if (idx > -1) {
    return process.argv[idx].substring(str.length + 1)
  }
  return null
}

const serverCssFileToTCompile = [{
  file: `./styles/fonts.scss`,
  outFile: 'fonts.css'
},
{
  file: `./styles/variables.scss`,
  outFile: 'variables.css'
},
]

const zipIncludedFiles = [
  { type: 'directory', name: 'ustore-internal', root: 'src/', themeDevPath: '../src/', xmpiePath: '/' },
  { type: 'directory', name: 'assets', root: 'src/', themeDevPath: '../src/', xmpiePath: '/themes/{themeName}/' },
  { type: 'directory', name: 'styles', root: 'src/', themeDevPath: '../src/', xmpiePath: '/themes/{themeName}/' },
  { type: 'directory', name: 'components', root: 'src/', themeDevPath: '../src/', xmpiePath: '/themes/{themeName}/' },
  { type: 'directory', name: 'core-components', root: 'src/', themeDevPath: '../src/', xmpiePath: '/' },
  { type: 'directory', name: 'out', root: 'src/', themeDevPath: '../src/', xmpiePath: '/' },
  { type: 'directory', name: 'pages', root: 'src/', themeDevPath: '../src/', xmpiePath: '/' },
  { type: 'directory', name: 'routes', root: 'src/', themeDevPath: '../src/', xmpiePath: '/themes/{themeName}/' },
  { type: 'directory', name: 'services', root: 'src/', themeDevPath: '../src/', xmpiePath: '/themes/{themeName}/' },
  { type: 'directory', name: 'localizations', root: 'src/', themeDevPath: '../src/', xmpiePath: '/themes/{themeName}/' },
  { type: 'directory', name: 'npm_packages', root: 'src/', themeDevPath: '../src/', xmpiePath: '/' },
  { type: 'directory', name: 'skin', root: '/', themeDevPath: '../', xmpiePath: '/themes/{themeName}/' },
  { type: 'file', name: 'next.config.js', root: 'src/', themeDevPath: '../src/', xmpiePath: '/' },
  { type: 'file', name: 'routes.js', root: 'src/', themeDevPath: '../src/', xmpiePath: '/' },
  { type: 'file', name: 'server.js', root: 'src/', themeDevPath: '../src/', xmpiePath: '/' },
  { type: 'file', name: '.babelrc', root: 'src/', themeDevPath: '../src/', xmpiePath: '/' },
  { type: 'file', name: '.eslintrc', root: 'src/', themeDevPath: '../src/', xmpiePath: '/' },
  { type: 'file', name: '.gitignore', root: 'src/', themeDevPath: '../src/', xmpiePath: '/' },
  { type: 'file', name: '.npmrc', root: 'src/', themeDevPath: '../src/', xmpiePath: '/' },
  { type: 'file', name: 'thumbnail.png', root: '/', themeDevPath: '../', xmpiePath: '/themes/{themeName}/' }
]

const parseVariables = async (variableFilePath, configFilePath, themeName, themeDisplayName) => {
  let variableFile = await fse.readFile(variableFilePath, 'utf8')
  //get the content of the curly braces
  variableFile = variableFile.match(/{([^}]*)}/)[1]
  //Eliminate comments
  variableFile = variableFile.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/g, '')
  //Eliminate \t\n\r
  variableFile = variableFile.replace(/[\r,\n,\t]/g, '')
  let variablesJson = {}
  variableFile.split(';').forEach((variable) => {
    const variableName = variable.split(':')[0]
    const variableValue = variable.split(':')[1]
    if (variableName && variableValue) {
      variablesJson[variableName] = variableValue.replace(/'/g, '').trim()
    }
  })
  const config = await fse.readJson(configFilePath)

  if (!config.customization) throw "Customization section does not exists in config file"
  config.customization.variables = config.customization.variables.map((variable) => {
    variable.defaultValue = variablesJson[variable.cssVariableName] ? variablesJson[variable.cssVariableName] : variable.defaultValue
    return variable
  })

  config.name = themeName
  config.displayName = themeDisplayName

  return JSON.stringify(config, null, '  ')
}

// execute shell command
const execCommandInTheme = async (command) => {
  console.log(`executing command ${command}`)
  const { stdout, stderr } = await exec(`${command}`)
  console.log(`done command ${command}`)
  console.log(stdout)
  if (stderr) {
    console.error(stderr)
  }
}

const changeAssetPrefix = async (themeName, xmpBuild) => {
  const content = fse.readFileSync(xmpBuild ? './next.template.config.js' : './next.dev.config.js', 'utf8')
  return content
    .replace('{{ASSET_PREFIX}}', themeName)
    .replace(/assetprefix\s*:\s*'\/ustorethemes\/(.*)/igm, `assetPrefix: '/ustorethemes/${themeName}/',`)
}

// commands to compile a library
const publishLib = async (themeName, themeDisplayName) => {
  const xmpieBuild = fs.existsSync('./.xmpie')

  console.log(`deleting out directory`)
  fse.removeSync(`./out`)

  console.log(`deleting .next directory`)
  fse.removeSync(`./.next`)

  console.log(`change next.dev.config.js assetPrefix value to theme name`)
  const nextDevWithAssetPrefix = await changeAssetPrefix(themeName, xmpieBuild)
  fs.writeFileSync('./next.publish.config.js', nextDevWithAssetPrefix)

  console.log(`change package.json customization section from variables.scss`)
  const configJsonWithParsedVars = xmpieBuild ?
    await parseVariables(`../src/themes/${themeName}/styles/variables.scss`, `../src/themes/${themeName}/config.json`, themeName, themeDisplayName) :
    await parseVariables(`../src/styles/variables.scss`, `../config.json`, themeName, themeDisplayName)

  console.log(`exporting library`)
  const commands = ['npm run export']
  for (const cmd of commands) {
    await execCommandInTheme(cmd, themeName)
  }

  await copyThemeAssets(xmpieBuild)

  console.log('compiling shared css files')
  if (xmpieBuild) {
    await compileSharedScss(serverCssFileToTCompile.map(({ file, outFile }) => ({ file: file.replace('.', `./themes/${themeName}`), outFile })), relpath(`../../out/assets`))
  } else {
    await compileSharedScss(serverCssFileToTCompile, relpath(`../../out/assets`))
  }

  const distDir = relpath('../../dist/')
  fse.ensureDirSync(distDir)

  if (xmpieBuild) {
    const scriptsToCopy = ['start:theme-dev', 'build', 'client_only:build', 'client_only:export', 'export', 'publish', 'republish', 'compile_shared_scss']
    themePackage.scripts = scriptsToCopy.reduce((r, i) => Object.assign({}, r, { [i]: themePackage.scripts[i] }), {})

    //add build environment variable to export scripts
    themePackage.scripts['client_only:build'] = themePackage.scripts['client_only:build'].replace('cross-env', 'cross-env DEPLOY_ENV=publish ')
    themePackage.scripts['client_only:export'] = themePackage.scripts['client_only:export'].replace('cross-env', 'cross-env DEPLOY_ENV=publish ')
    themePackage.scripts['export'] = themePackage.scripts['export'].replace(/(copy_static_files)|(compile_shared_scss)/g, '')
    themePackage.scripts['compile_shared_scss'] = themePackage.scripts['compile_shared_scss'].replace('compileSharedScssOnExport.js', 'compileSharedScssOnPublish.js')

    //Rename script 'start:theme-dev' to 'start'
    themePackage.scripts['start'] = themePackage.scripts['start:theme-dev']
    delete themePackage.scripts['start:theme-dev'];

    const coreVersion = require('../../../ustore-core/package.json').version
    const coreTgzFileName = `ustore-core-${coreVersion}.tgz`
    themePackage.dependencies['@ustore/core'] = `file:./npm_packages/${coreTgzFileName}`
  }

  themePackage.name = themeName

  console.log(`Zip theme directory ${distDir}/${themeName}.zip`)
  const output = fs.createWriteStream(`${distDir}/${themeName}.zip`);

  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });
  archive.pipe(output);
  zipIncludedFiles.forEach(d => {
    const path = xmpieBuild ? d.xmpiePath.replace('{themeName}', themeName) : d.themeDevPath
    const p = relpath(`../../${path}/${d.name}`)
    if (fs.existsSync(p)) {
      if (d.type === 'directory') {
        archive.glob(`${d.name}/**/*`, { cwd: relpath(`../../${path}/`), ignore: ['**/__mocks__/**'] }, { prefix: d.root })
      } else {
        archive.file(p, { name: d.root + d.name })
      }
    } else {
      console.log('file not found', p)
    }
  })

  if (xmpieBuild) {
    const coreVersion = require('../../../ustore-core/package.json').version
    const coreTgzFileName = `ustore-core-${coreVersion}.tgz`
    archive.file(relpath(`../../../ustore-core/${coreTgzFileName}`), { name: `/src/npm_packages/${coreTgzFileName}` })
  }

  archive.append(nextDevWithAssetPrefix, { name: '/src/next.dev.config.js' })
  archive.append(configJsonWithParsedVars, { name: '/config.json' })
  archive.append(JSON.stringify(themePackage, null, '  '), { name: '/src/package.json' })
  archive.finalize();

  console.log('Delete temporary config file (next.publish.config.js)')
  fse.removeSync('./next.publish.config.js')
}

const nameArg = argv('name')
const displayNameArg = argv('displayName')

if (nameArg || displayNameArg) {
  if (!nameArg) {
    console.error('Error: package name is required.\n')
    process.exit(1)
  }

  if (!/^[a-zA-Z0-9_]{0,20}$/.test(nameArg)) {
    console.error('Error: Package name field can contain up to 20 characters which include letters, numbers and underscore.\n')
    process.exit(1)
  }

  if (!displayNameArg) {
    console.error('Error: displayName parameter is required.\n')
    process.exit(1)
  }

  publishLib(nameArg, displayNameArg)
} else {
  console.error('Error: Both name and display name arguments are required')
}
