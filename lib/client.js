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

  _validateOptions(apiName, options) {
    let credentials = _.pick(options, CREDENTIAL_PROPERTIES);
    let pagination = _.pick(options, PAGINATION_PROPERTIES)
    let params = _.omit(options, CREDENTIAL_PROPERTIES, PAGINATION_PROPERTIES);

    return this._validatePayload('credentials', credentials)
      .then(() => this._validatePayload('pagination', pagination))
      .then(() => this._validatePayload(apiName, params))
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
  _validatePayload(methodName, payload) {
    let schema = payloadSchema[methodName];

    return new Promise(function (resolve, reject) {
      joi.validate(payload, schema, function (error, data) {
        if (error) {
          return reject(get(error, 'details[0].message'));
        }
        resolve();
      })
    });

  }

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
