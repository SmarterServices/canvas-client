'use strict';

const _ = require('lodash');
const requestPromise = require('request-promise');
const utils = require('./utils');

const REFRESH_TOKEN_API = '/login/oauth2/token'

class CanvasRequester {
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
   *
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
        this.credentials.accessToken = response.body.access_token;
        return Promise.resolve();
      })
      .catch(response => {
        return Promise.reject(response);
      })
  }

  _formatResponse(response) {
    let body = response.body;
    let pagination = this._parsePagination(response.headers);

    Object.assign(body, {pagination});

    return Promise.resolve(body);
  }

  _parsePagination(header) {
    let pages = header.link.split(',');
    pages = pages.map(page => page.split(';'));
    let pageMap = {};

    for(let page of pages) {
      let pageUrl = /<(.+)>/.exec(pages[0])[1];
      let pageName = /="([a-z]+)"/.exec(page[1])[1];
      pageMap[pageName] = pageUrl;
    }

    // page count
    let lastPage = pageMap.last;
    pageMap.perPage = /per_page=([0-9]+)/.exec(lastPage)[1];
    pageMap.totalPages = /(?!_)page=([0-9]+)/.exec(lastPage)[1];

    return pageMap;
  }
}

module.exports = CanvasRequester;