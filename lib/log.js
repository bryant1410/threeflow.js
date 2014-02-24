var clc;

clc = require('cli-color');

module.exports = {
  LOG_DELAY: 200,
  error_color: clc.red.bold,
  warn_color: clc.red,
  notice_color: clc.green,
  info_color: clc.cyan,
  __log: function(args, color) {
    var doIt;
    doIt = function() {
      return console.log(color.apply(this, args));
    };
    return setTimeout(doIt, this.LOG_DELAY);
  },
  error: function() {
    return this.__log(arguments, this.error_color);
  },
  warn: function() {
    return this.__log(arguments, this.warn_color);
  },
  notice: function() {
    return this.__log(arguments, this.notice_color);
  },
  info: function() {
    return this.__log(arguments, this.info_color);
  },
  clear: function() {
    return console.log(clc.reset);
  }
};
