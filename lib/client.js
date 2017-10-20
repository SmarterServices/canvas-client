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
    let url = utils.buildUrl(urlTemplate, params, query);

    return {method, url};
  }

  /*
  /!**
  * Process the request made to client
  * @param {string} methodName - Request method name
  * @param {Object} payload - Request payload
  * @returns {Promise}
  * @returns {Promise.<TResult>}
  * @private
  *!/
  _process(methodName, payload) {
   // validate the payload
   return this._validatePayload(methodName, payload)
     // send request
     .then(response => this._request(methodName, payload));
 }

  /!**
  * Validates request payload against joi schema
  * @param {string} methodName - Request method name
  * @param {Object} payload - Request payload
  * @returns {Promise}
  * @private
  *!/
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

  /!**
  * Check if need to send request directly
  * Or do need to login first
  * Or should loging if request fails
  * @param {string} methodName - Request method name
  * @param {Object} payload - Request payload
  * @returns {Promise}
  * @private
  *!/
  _request(methodName, payload) {
   let _this = this;

   return this._send(methodName, payload)
     .catch(response => {
       if(_this._isUnAuthorized(response)) {
         return this._requestWithLogin(methodName, payload);
       }
       return Promise.reject(response);
     });
 }

  /!**
  * Core method to send the request
  * @param {string} methodName - Request method name
  * @param {Object} payload - Request payload
  * @returns {Promise}
  * @private
  *!/
  _send(methodName, payload) {
   let apiTemplate = apiList[methodName].endpoint;
   let apiUrl = this._buildUrl(apiTemplate, payload);

   const requestOptions = {
     url: this._basePath + apiUrl,
     method: `${apiList[methodName].method}`,
     headers: {
       'Authorization': `Bearer ${this._token}`,
       'content-type': 'application/json'
     },
     json: true
   };

   return requestPromise(requestOptions);
 }*/
}

module.exports = new CanvasClient();
