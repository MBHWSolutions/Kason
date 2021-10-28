
class Logger {

  get logger() {
    if(!this._logger){
      this._logger = require('logdown')('ustore')
      this._logger.isEnabled = process.env.NODE_ENV !== "production"
    }
    return this._logger;
  }

  log(...args){
    this.logger.log(...args);
  }

  warn(...args){
    this.logger.warn(...args);
  }

  info(...args){
    this.logger.info(...args);
  }

  error(...args){
    this.logger.error(...args);
  }
}

export default new Logger()
