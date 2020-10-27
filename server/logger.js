var log4js = require('log4js');

log4js.configure({
  appenders: { phase_one: { type: 'file', filename: 'phase_one.log' } },
  categories: { default: { appenders: ['phase_one'], level: 'error' } }
});

const logger = log4js.getLogger('phase_one');
// logger.setLevel('DEBUG');

Object.defineProperty(exports, "LOG", {
    value: logger
});
