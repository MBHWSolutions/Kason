const chalk = require('chalk')

const relevant = process.env.NODE_VERSION || 'v12'
const actual = process.version

module.exports = () => {
  if (!actual.startsWith(relevant)) {
    console.log(chalk.yellow('************************************'))
    console.log('')
    console.log(chalk.yellow(`You cannot run this theme because your current version of NodeJS is insufficient. Version ${relevant} or above is required.`))
    console.log(chalk.yellow(`See Node.JS installation instructions`))
    console.log(chalk.blue('https://github.com/XMPieLab/uStore-NG/wiki/Upgrading-a-Custom-Theme'))
    console.log('')
    console.log(chalk.yellow('************************************'))

    return false
  } else {
    return true
  }
}
