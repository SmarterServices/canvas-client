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
  constructor(credentials, updateAccessToken) {
    this.requester = new CanvasRequester(credentials, updateAccessToken);
    this._response = undefined;
    this._requestOptions = undefined;
    this._usedCurrent = false;
  }

  /**
   * Send the request to canvas API
   * @param requestOptions
   * @returns {Promise.<TResult>}
   */
  request(requestOptions) {
    // save requestOptions to future use
    this._requestOptions = requestOptions;

    return this
      .requester
      .request(requestOptions)
      .then(response => {
        //console.log(response);
        this._response = _.cloneDeep(response);
        return this;
      })
  }

  /**
   * Number of pages next including current page
   * @returns {Integer}
   */
  size() {
    // return this.current().pagination.totalPages;

    if(this._nextPageCount) return this._nextPageCount;

    let pagination = this.current().pagination;
    this._nextPageCount = pagination.totalPages - pagination.pageNumber + 1;

    return this._nextPageCount;
  }

  /**
   * Get information of current page
   * @returns {Object}
   */
  current() {
    return this._response;
  }

  /**
   * Get the desired page
   * @param {first | last | next | prev} page - Page to get
   * @returns {Promise | Object}
   * @private
   */
  _getPage(page) {
    console.log(`Get Page ${page}`);
    let url = _.get(this._response, `pagination.${page}`);
    if(!url) {
      return Promise.reject(`Does not have ${page} page`);
    }

    this._requestOptions.url = url;

    return this
      .request(this._requestOptions)
      .then(response => this.current());
  }

  /**
   * Get first page
   * @returns {Promise}
   */
  first() {
    return this._getPage('first');
  }

  /**
   * Get next page
   * @returns {Promise}
   */
  next() {
    console.log('Get Next');
    if(!this._usedCurrent) {
      // return current page information
      this._usedCurrent = true;
      console.log('>>>>> Use Current');
      return Promise.resolve(this.current());
    }
    return this._getPage('next');
  }

  /**
   * Get next page
   * @returns {Promise}
   */
   hasNext() {
    let url = _.get(this._response, `pagination.next`);
    
    if(!url) {
      return false;
    }else{
      return true;
    }
  }

  /**
   * Get last page
   * @returns {Promise}
   */
  last() {
    return this._getPage('last');
  }

  /**
   * Get previous page
   * @returns {Promise}
   */
  prev() {
    return this._getPage('prev');
  }
}

module.exports = CanvasListIterator;
