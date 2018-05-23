'use strict';

const _ = require('lodash');
const nock = require('nock');
const mockData = require('./../data/mock.json');
const {buildUrl} = require('./../../lib/utils');

module.exports = {
  /**
   * Mock a canvas endpoint
   * @param {string} host - Host address of canvas
   * @param {integer} perPage - Amount of items per page
   * @param {Object} request - The request details
   * @param {integer} request.statusCode - The status code of response of the request
   * @param {Object} request.params - Request path parameters
   * @param {Object} request.response - The request response payload
   * @return {Object}
   */
  mockCanvasEndpoint(host, request, endpoint, perPage, shouldPaginate = true) {
    const path = buildUrl(endpoint, request.params);

    // There must be at least one page
    const pageCount = Math.ceil(request.response.length / perPage) || 1;

    const fullPath = host + path;
    const interceptors = [];

    const internalPerPage = perPage || 10;
    for (let i = 0; i < pageCount; i++) {
      // Create the links
      const currentPage = `<${fullPath}?page=${i + 1}&per_page=${internalPerPage}>; rel="current"`;
      const nextPage = `<${fullPath}?page=${Math.min(i + 2, pageCount)}&per_page=${internalPerPage}>; rel="next"`;
      const firstPage = `<${fullPath}?page=${1}&per_page=${internalPerPage}>; rel="first"`;
      const lastPage = `<${fullPath}?page=${pageCount}&per_page=${internalPerPage}>; rel="last"`;

      const headerLink = [currentPage, nextPage, firstPage, lastPage].join(',');

      const query = {};
      if (i !== 0) {
        query['per_page'] = internalPerPage;
        query.page = i + 1;
      } else if (i === 0 && perPage) {
        query['per_page'] = perPage;
      }

      // For error cases, response is usually  object instead of array
      const response = Array.isArray(request.response)
        ? request.response.slice(i * internalPerPage, (i + 1) * internalPerPage)
        : request.response;


      const headers = Object.assign({}, request.headers);

      if (shouldPaginate) {
        headers.link = headerLink;
      }
      const interceptor = nock(host)
        .persist()
        .get(path)
        .query(query)
        .reply(request.statusCode, response, headers);

      interceptors.push(interceptor);
    }

    return interceptors;
  },

  /**
   * Mock canvas course users
   * @param {string} host - Host address of canvas
   * @param {integer} perPage - Amount of items per page
   * @param {Object} request - The request details
   * @param {integer} request.statusCode - The status code of response of the request
   * @param {Object} request.params - Request path parameters
   * @param {Object} request.response - The request response payload
   * @return {Object}
   */
  mockCourseUsers(host, request, endpoint, perPage) {
    const path = buildUrl(endpoint, request.params);

    // There must be at least one page
    const pageCount = Math.ceil(request.response.length / perPage) || 1;

    const fullPath = host + path;
    const interceptors = [];

    const internalPerPage = perPage || 10;
    for (let i = 0; i < pageCount; i++) {
      // Create the links
      const currentPage = `<${fullPath}?page=${i + 1}&per_page=${internalPerPage}&include[]=email>; rel="current"`;
      const nextPage = `<${fullPath}?page=${Math.min(i + 2, pageCount)}&per_page=${internalPerPage}&include[]=email>; rel="next"`;
      const firstPage = `<${fullPath}?page=${1}&per_page=${internalPerPage}&include[]=email>; rel="first"`;
      const lastPage = `<${fullPath}?page=${pageCount}&per_page=${internalPerPage}&include[]=email>; rel="last"`;

      const headerLink = [currentPage, nextPage, firstPage, lastPage].join(',');

      const query = {include: ['email']};
      if (i !== 0) {
        query['per_page'] = internalPerPage;
        query.page = i + 1;
      } else if (i === 0 && perPage) {
        query['per_page'] = perPage;
      }

      // For error cases, response is usually  object instead of array
      const response = Array.isArray(request.response)
        ? request.response.slice(i * internalPerPage, (i + 1) * internalPerPage)
        : request.response;

      const headers = Object.assign({}, request.headers, {link: headerLink});
      const interceptor = nock(host)
        .persist()
        .get(path)
        .query(query)
        .reply(request.statusCode, response, headers);

      interceptors.push(interceptor);
    }

    return interceptors;
  },

  /**
   * Mock refreshToken function
   * @param {Object} options - Refresh token endpoint options
   * @param {string} options.host - Host address of canvas
   * @param {string} options.clientId - Client id
   * @param {string} options.clientSecret - Client secret
   * @param {string} options.accessToken - Access token for canvas
   * @param {string} options.refreshToken - Refresh token for canvas
   * @return {Object}
   */
  mockRefreshToken(options) {
    const host = options.host;
    const queryOptions = _.omit(options, 'host', 'accessToken');
    queryOptions.grantType = 'refresh_token';
    const query = _.mapKeys(queryOptions, (value, key) => _.snakeCase(key));

    return nock(host)
      .post('/login/oauth2/token')
      .query(query)
      .reply(200, {'access_token': 'test'});
  },

  restore: nock.cleanAll
};
