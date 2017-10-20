'use strict';

const _ = require('lodash');
const CanvasRequester = require('./canvas-requester');

class CanvasListIterator {
  /**
   * @param {Object} credentials - Required options
   * @param {String} credentials.host - Canvas host
   * @param {String} credentials.clientId - Canvas client ID
   * @param {String} credentials.clientSecret - Canvas client secret
   * @param {String} credentials.accessToken - Canvas access token
   * @param {String} credentials.refreshToken - Canvas refresh token
   */
  constructor(credentials) {
    this.requester = new CanvasRequester(credentials);
    this.response = undefined;
    this.requestOptions = undefined;
    this.usedCurrent = false;
  }
  
  request(requestOptions) {
    // save requestOptions to future use
    this.requestOptions = requestOptions;

    return this
      .requester
      .request(requestOptions)
      .then(response => {
        this.response = _.cloneDeep(response);
        return this;
      })
  }

  size() {
    return this.current().pagination.totalPages;
  }

  /**
   * Get information of current page
   * @returns {Object}
   */
  current() {
    return this.response;
  }

  /**
   * Get the desired page
   * @param {first | last | next | prev} page - Page to get
   * @returns {Promise | Object}
   * @private
   */
  _getPage(page) {
    let url = _.get(this.response, `pagination.${page}`);
    if(!url) {
      return Promise.reject(`Does not have ${page} page`);
    }

    this.requestOptions.url = url;

    return this
      .request(this.requestOptions)
      .then(response => this.current());
  }

  /**
   * Get first page
   * @returns {*}
   */
  first() {
    return this._getPage('first');
  }

  /**
   * Get next page
   * @returns {*}
   */
  next() {
    if(!this.usedCurrent) {
      // return current page information
      this.usedCurrent = true;
      return Promise.resolve(this.current());
    }
    return this._getPage('next');
  }

  /**
   * Get last page
   * @returns {*}
   */
  last() {
    return this._getPage('last');
  }

  /**
   * Get previous page
   * @returns {*}
   */
  prev() {
    return this._getPage('prev');
  }
}

module.exports = CanvasListIterator;
