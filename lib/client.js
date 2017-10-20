'use strict';

const _ = require('lodash');
const apiList = require('../data/api-list.json');
const CanvasRequester = require('./canvas-requester');
const joi = require('joi');
const payloadSchema = require('../schema/payload-schema');
const requestPromise = require('request-promise');
const utils = require('./utils');
// constants
const CREDENTIAL_PROPERTIES = [
  'host',
  'accessToken',
  'refreshToken',
  'clientId',
  'clientSecret'
];
const PAGINATION_PROPERTIES = [
  'page',
  'perPage'
];

class CanvasClient {
  /**
   * Get enrollment list by courseId
   * @param {Object} options - Required options
   * @param {String} options.host - Canvas host
   * @param {String} options.clientId - Canvas client ID
   * @param {String} options.clientSecret - Canvas client secret
   * @param {String} options.accessToken - Canvas access token
   * @param {String} options.refreshToken - Canvas refresh token
   * @param {String} options.courseId - Canvas course ID
   * @param {String} [options.page] - Pagination page number
   * @param {String} [options.perPage] - Pagination per page limit
   * @returns {Promise.<TResult>}
   */
  courseEnrollments(options) {
    let apiName = 'courseEnrollments';

    return this
      ._validateOptions(apiName, options)
      .then(response => {
        let {credentials, pagination, params} = response;
        let requester = new CanvasRequester(credentials);
        let requestOptions = this._buildRequestOptions(credentials.host, apiName, params, pagination);
        return requester.request(requestOptions);
      });
  }

  /**
   * Validate options provided in the API method
   * and returns validated Objects
   * @param {String} apiName - API name in API list
   * @param {Object} options - The options object
   * @returns {Promise.<TResult>}
   * @resolves {{credentials:Object, params:Object, pagination:Object}}
   * @private
   */
  _validateOptions(apiName, options) {
    let credentials = _.pick(options, CREDENTIAL_PROPERTIES);
    let pagination = _.pick(options, PAGINATION_PROPERTIES)
    let params = _.omit(options, CREDENTIAL_PROPERTIES, PAGINATION_PROPERTIES);

    return this._validateData('credentials', credentials)
      .then(() => this._validateData('pagination', pagination))
      .then(() => this._validateData(apiName, params))
      .then(() => {
        return Promise.resolve({credentials, pagination, params});
      })
  }

  /**
   * Validates request payload against joi schema
   * @param {string} methodName - Request method name
   * @param {Object} payload - Request payload
   * @returns {Promise}
   * @private
   */
  _validateData(methodName, payload) {
    let schema = payloadSchema[methodName];

    return new Promise(function (resolve, reject) {
      joi.validate(payload, schema, function (error, data) {
        if (error) {
          return reject(_.get(error, 'details[0].message'));
        }
        resolve();
      })
    });

  }

  /**
   * Build request url with
   * @param {String} host - Host / domain
   * @param {String} apiName - API name in apiList
   * @param {Object} params - Path params
   * @param {Object} query - Query params
   * @returns {{method:String, url:String}}
   * @private
   */
  _buildRequestOptions(host, apiName, params, query) {
    let urlTemplate = host + apiList[apiName].endpoint
    let method = apiList[apiName].method;
    // make query parameters snake case as per canvas requirement
    query = _.mapKeys(query, (val, key) => _.snakeCase(key));
    let url = utils.buildUrl(urlTemplate, params, query);

    return {method, url};
  }
}

module.exports = new CanvasClient();
