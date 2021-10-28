const configJson = require('../../../config.json')

const util = require('util')
const exec = util.promisify(require('child_process').exec)

const main = async () => {
  console.log(`npm run publish -- name=${configJson.name} displayName="${configJson.displayName}"`)
  const {stdout, stderr} = await exec(`npm run publish -- name=${configJson.name} displayName="${configJson.displayName}"`)
  console.log(stdout)
  console.error(stderr)
}

main()
