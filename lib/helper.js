"use strict";

/**
* Helper object
*/
const Helper = {
  isString: function(testVar) {
    return typeof testVar === "string" || testVar instanceof String;
  }
};

module.exports = Helper;
