'use strict';
const _ = require('lodash');
const utils = {
  /**
   * Build request URl from url template
   * @param {String} urlTemplate - Url template string
   * @param {Object} params - Path params map
   * @param {Object} [query={}] - Query params map
   * @returns {*}
   * @private
   */
  buildUrl(urlTemplate, params, query = {}) {
    let paramRegex = new RegExp('\{(.+?)\}', 'gm'),
      paramNames;

    do {
      //Get the matching params
      paramNames = paramRegex.exec(urlTemplate);

      //If there is a match and has a param value for the match
      //Using hasOwnProperty because param might also have null or 0 values which might result in false
      if (paramNames && params.hasOwnProperty(paramNames[1])) {

        //Replace and update the urlTemplate
        urlTemplate = urlTemplate.replace(paramNames[0], params[paramNames[1]]);
      }
    } while (paramNames);

    if (query) {
      // flag for first key
      let first = true;

      for (let queryKey in query) {
        // if first key use '?' as delimiter, '&' otherwise
        let delimiter = (first) ? '?' : '&';
        first = false;
        // append the query key-value pairs with original url
        let isObjectKey = typeof query[queryKey] === 'object';
        let queryValue = (isObjectKey) ?
          JSON.stringify(query[queryKey]) :
          query[queryKey];

        urlTemplate = urlTemplate + delimiter + queryKey + '=' + queryValue;
      }
    }

    return urlTemplate;
  },
  /**
   * Creates new object by extracting values from data according to Keymap
   * @param {Object} data
   * @param {Object} keyMap - a map used to get properties from data
   * @return {Object} result - formattedResult
   */
  formatResponse: function formatResponse(data, keyMap) {
    let _this = this;
    if (Array.isArray(data)) {
      //call this function recursively
      let results = data.map(singleData => _this.formatResponse(singleData, keyMap));
      return results;
    }

    //get values from data
    let result = _.mapValues(keyMap, (value) => {
      if (typeof value === 'function') {
        return value(data);
      }
      return _.get(data, value);
    });

    return _this.stringifyRecurse(result);
  },

  /**
   * Recursively convert all the number values inside the source to string
   * @param {Object} source
   */
  stringifyRecurse: function stringifyRecurse(source) {
    let _this = this;

    if (typeof source === 'object') {

      //If the source have any nested object check all the props
      _.forEach(source, (val, key) => {
        if (typeof val === 'object') {
          _this.stringifyRecurse(val);
        } else if (typeof val === 'number') {
          source[key] = val.toString();
        }
      });

      return source;
    } else if (typeof source === 'number') {
      return source.toString();
    } else {
      return source;
    }
  }
};

module.exports = utils;
