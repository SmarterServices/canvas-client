'use strict';

const _ = require('lodash');
const requestPromise = require('request-promise');
const utils = require('./utils');

const REFRESH_TOKEN_API = '/login/oauth2/token'

class CanvasRequester {
  /**
   * @param {Object} credentials - Required options
   * @param {String} credentials.host - Canvas host
   * @param {String} credentials.clientId - Canvas client ID
   * @param {String} credentials.clientSecret - Canvas client secret
   * @param {String} credentials.accessToken - Canvas access token
   * @param {String} credentials.refreshToken - Canvas refresh token
   */
  constructor(credentials) {
    this.credentials = Object.assign({}, credentials);
  }

  /**
   *
   * @param {Object} options - Request options
   * @param {String} options.url - Request url
   * @param {POST | GET | PUT} options.method - Request method
   * @returns {Promise.<TResult>}
   */
  request(options) {
    return this
      ._send(options)
      .catch(response => {
        if (this._isUnAuthorized(response)) {
          // access token has expired so generate on first
          // and resend the request
          return this
            ._refreshAccessToken()
            .then(response => this._send(options));
        }
        return Promise.reject(response);
      })
      .then(response => this._formatResponse(response));
  }
  /**
   * Sends the actual request
   * @param {Object} options - Request options
   * @param {String} options.url - Request url
   * @param {POST | GET | PUT} options.method - Request method
   * @returns {Promise.<TResult>}
   */
  _send(options) {
    const requestOptions = {
      url: options.url,
      method: options.method.toUpperCase(),
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken}`,
        'content-type': 'application/json'
      },
      resolveWithFullResponse: true,
      json: true
    };

    return requestPromise(requestOptions);
  }

  /**
   * Check if a canvas response is unauthorized
   * @param {Object} response - The response object
   * @returns {boolean}
   * @private
   */
  _isUnAuthorized(response) {
    let unAuthorized = true;

    // check status code
    unAuthorized &= _.get(response, 'statusCode') === 401;
    unAuthorized &= _.get(response, 'message') === '401 - {"errors":[{"message":"Invalid access token."}]}';
    unAuthorized &= _.get(response, 'error.errors[0].message') === 'Invalid access token.';
    unAuthorized &= _.get(response, 'response.body.errors[0].message') === 'Invalid access token.';
    unAuthorized &= _.get(response, 'response.headers.status') === '401 Unauthorized';

    return unAuthorized;
  }

  /**
   * Generates a new canvas access token
   * @returns {Promise.<TResult>}
   * @private
   */
  _refreshAccessToken() {
    let url = this.credentials.host + REFRESH_TOKEN_API;
    // get query params for token refresh
    let paramsList = ['clientId', 'clientSecret', 'refreshToken'];
    let params = _.pick(this.credentials, paramsList);
    params.grantType = 'refresh_token';
    // query keys must be snake case
    params = _.mapKeys(params, (val, key) => _.snakeCase(key));
    // update url with query params
    url = utils.buildUrl(url, {}, params);

    let options = {
      url: url,
      method: 'POST'
    };
    
    return this
      ._send(options)
      .then(response => {
        // save received token
        this.credentials.accessToken = response.body.access_token;
        return Promise.resolve();
      })
  }

  /**
   * Format the response from canvas to more user friendly way
   * @param {Object} response - The response object
   * @returns {Promise.<Object>}
   * @private
   */
  _formatResponse(response) {
    let body = response.body;
    // get pagination stuff
    let pagination = this._parsePagination(response.headers);
    // add pagination stuff in body
    let formattedResponse = Object.assign({}, {results: body}, {pagination});

    return Promise.resolve(formattedResponse);
  }

  /**
   * Parse pagination stuff from header
   * and make it more user friendly
   * @param {Object} header - Response header
   * @returns {{totalPages, perPage, first, last, next, prev, current}}
   * @private
   */
  _parsePagination(header) {

    if (!header.link) {
      //if no pagination in the header, return empty object
      return {};
    }

    let pages = header.link.split(',');
    pages = pages.map(page => page.split(';'));
    let pageMap = {};

    for(let page of pages) {
      // get page url from <https://canvas.com/blah/blah>
      let pageUrl = /<(.+)>/.exec(page[0])[1];
      // get page name from rel="first" or rel="next" or ...
      let pageName = /="([a-z]+)"/.exec(page[1])[1];
      pageMap[pageName] = pageUrl;
    }

    // page count
    let lastPage = pageMap.last;
    let currentPage = pageMap.current;
    // get per page limit from https://...?per_page=10&...
    pageMap.perPage = /per_page=([0-9]+)/.exec(lastPage)[1];
    // get total page count from https://...?page=10&...
    pageMap.totalPages = /(?!_)page=([0-9]+)/.exec(lastPage)[1];
    // get currentPageNumber from https://...?page=10&...
    pageMap.pageNumber = /(?!_)page=([0-9]+)/.exec(currentPage)[1];

    return pageMap;
  }
}

module.exports = CanvasRequester;