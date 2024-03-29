'use strict';

const _ = require('lodash');
const apiList = require('../data/api-list.json');
const CanvasRequestIterator = require('./canvas-list-iterator');
const enrollmentMap = require('../data/enrollment-data-map');
const examMap = require('../data/exam-data-map');
const courseMap = require('../data/course-data-map');
const joi = require('joi');
const payloadSchema = require('../schema/payload-schema');
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
   * @param {function} [updateAccessToken] - Update access token on refresh
   * @param {String} options.host - Canvas host
   * @param {String} options.clientId - Canvas client ID
   * @param {String} options.clientSecret - Canvas client secret
   * @param {String} options.accessToken - Canvas access token
   * @param {String} options.refreshToken - Canvas refresh token
   * @param {String} options.courseId - Canvas course ID
   * @param {String} [options.page] - Pagination page number
   * @param {String} [options.perPage] - Pagination per page limit
   * @returns {CanvasRequestIterator}
   */
  courseEnrollments(options, updateAccessToken) {
    const apiName = 'courseEnrollments';
    const _this = this;
    let enrollments;

    return this
      ._validateOptions(apiName, options)
      .then(response => {
        let {credentials, pagination, params} = response;
        let requestOptions = this._buildRequestOptions(credentials.host, apiName, params, pagination);
        let requestIterator = new CanvasRequestIterator(credentials, updateAccessToken);

        return requestIterator.request(requestOptions);
      })
      .then(function getIteratedResult(iterator) {
        console.log('---Pre _getResultByIterator');
        return _this._getResultByIterator(iterator);
      })
      .then(results => {
        enrollments = results;
        //console.log('///////// Next Step');
        //console.log('****Course Users');
        //console.log(JSON.stringify(enrollments));
        //process.exit();
        
        return this._courseUsers(options, updateAccessToken);
      })
      .then(users => {
        
        /* 
          For some reason the user variable is returned as an array, and other times it is returned as an object with 
          a results array. This will check to make sure we use the right variable to continue.
        */
        if(!Array.isArray(users)){
          // check to see if the results key is under the object.
          if(users.results){
            users = users.results;
          }else{
            console.log("users is not an array nor does it have the results array within it.");
          }
        }
        
        // Create a map of users with user id as key
        const usersMap = users.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
      
        if(enrollments.results){
          enrollments = enrollments.results;
        }

        // Merge the user objects
        return enrollments.map(enrollment => {
          Object.assign(enrollment.user, usersMap[enrollment['user_id']]);
          return enrollment;
        });
      })
      .then(mergedEnrollments => {
        console.log('xxxxxx Done');
        return utils.formatResponse(mergedEnrollments, enrollmentMap);
      });
  }

  /**
   * Get exam list by courseId
   * @param {Object} options - Required options
   * @param {function} [updateAccessToken] - Update access token on refresh
   * @param {String} options.host - Canvas host
   * @param {String} options.clientId - Canvas client ID
   * @param {String} options.clientSecret - Canvas client secret
   * @param {String} options.accessToken - Canvas access token
   * @param {String} options.refreshToken - Canvas refresh token
   * @param {String} options.courseId - Canvas course ID
   * @param {String} [options.page] - Pagination page number
   * @param {String} [options.perPage] - Pagination per page limit
   * @returns {CanvasRequestIterator}
   */
  _courseUsers(options, updateAccessToken) {
    let apiName = 'courseUsers';
    const _this = this;

    return this
      ._validateOptions(apiName, options)
      .then(response => {
        const {credentials, pagination, params} = response;
        const query = Object.assign(pagination, {'include[]': 'email'});
        const requestOptions = this._buildRequestOptions(credentials.host, apiName, params, query);
        const requestIterator = new CanvasRequestIterator(credentials, updateAccessToken);

        return requestIterator.request(requestOptions);
      })
      .then(function getIteratedResult(iterator) {
        return _this._getResultByIterator(iterator);
      });
  }

  /**
   * Get exam list by courseId
   * @param {Object} options - Required options
   * @param {function} [updateAccessToken] - Update access token on refresh
   * @param {String} options.host - Canvas host
   * @param {String} options.clientId - Canvas client ID
   * @param {String} options.clientSecret - Canvas client secret
   * @param {String} options.accessToken - Canvas access token
   * @param {String} options.refreshToken - Canvas refresh token
   * @param {String} options.courseId - Canvas course ID
   * @param {String} [options.page] - Pagination page number
   * @param {String} [options.perPage] - Pagination per page limit
   * @returns {CanvasRequestIterator}
   */
  courseExams(options, updateAccessToken) {
    let apiName = 'courseExams';
    const _this = this;

    return this
      ._validateOptions(apiName, options)
      .then(response => {
        let {credentials, pagination, params} = response;
        let requestOptions = this._buildRequestOptions(credentials.host, apiName, params, pagination);
        let requestIterator = new CanvasRequestIterator(credentials, updateAccessToken);

        return requestIterator.request(requestOptions);
      })
      .then(function getIteratedResult(iterator) {
        return _this._getResultByIterator(iterator);
      });
  }

  /**
   * Getting LTI Launch URL by courseId
   * @param {Object} options - Required options
   * @param {function} [updateAccessToken] - Update access token on refresh
   * @param {String} options.host - Canvas host
   * @param {String} options.clientId - Canvas client ID
   * @param {String} options.clientSecret - Canvas client secret
   * @param {String} options.accessToken - Canvas access token
   * @param {String} options.refreshToken - Canvas refresh token
   * @param {String} options.courseId - Canvas course ID
   * @returns {Array}
   */
  listCourseExternalTools(options, updateAccessToken) {
    let apiName = 'courseExternalTools';
    let _this = this;

    return this
      ._validateOptions(apiName, options)
      .then(response => {
        let {credentials, pagination, params} = response;
        let requestOptions = this._buildRequestOptions(credentials.host, apiName, params, pagination);
        let requestIterator = new CanvasRequestIterator(credentials, updateAccessToken);

        return requestIterator.request(requestOptions);
      })
      .then(function getIteratedResult(iterator) {
        return _this._getResultByIterator(iterator);
      });
  }


  /**
   * External tools against accountId
   * @param {Object} options - Required options
   * @param {function} [updateAccessToken] - Update access token on refresh
   * @param {String} options.host - Canvas host
   * @param {String} options.clientId - Canvas client ID
   * @param {String} options.clientSecret - Canvas client secret
   * @param {String} options.accessToken - Canvas access token
   * @param {String} options.refreshToken - Canvas refresh token
   * @param {String} options.accountId - Canvas account ID
   * @returns {Array}
   */
  listAccountExternalTools(options, updateAccessToken) {
    let apiName = 'accountExternalTools';
    let _this = this;

    return this
      ._validateOptions(apiName, options)
      .then(response => {
        let {credentials, pagination, params} = response;
        let requestOptions = this._buildRequestOptions(credentials.host, apiName, params, pagination);
        let requestIterator = new CanvasRequestIterator(credentials, updateAccessToken);

        return requestIterator.request(requestOptions);
      })
      .then(function getIteratedResult(iterator) {
        return _this._getResultByIterator(iterator);
      });
  }

  /**
   * Get exam by examId
   * @param {Object} options - Required options
   * @param {function} [updateAccessToken] - Update access token on refresh
   * @param {String} options.host - Canvas host
   * @param {String} options.clientId - Canvas client ID
   * @param {String} options.clientSecret - Canvas client secret
   * @param {String} options.accessToken - Canvas access token
   * @param {String} options.refreshToken - Canvas refresh token
   * @param {String} options.courseId - Canvas course ID
   * @param {String} options.quizId - Canvas exam ID
   * @param {String} [options.page] - Pagination page number
   * @param {String} [options.perPage] - Pagination per page limit
   * @returns {CanvasRequestIterator}
   */
  getExam(options, updateAccessToken) {
    let apiName = 'getExam';
    const _this = this;


    return this
      ._validateOptions(apiName, options)
      .then(response => {
        const {credentials, pagination, params} = response;
        const requestOptions = this._buildRequestOptions(credentials.host, apiName, params, pagination);
        const requestIterator = new CanvasRequestIterator(credentials, updateAccessToken);

        return requestIterator.request(requestOptions);
      })
      .then(function (response) {
        return response.current().results;
      })
      .then(exam => {
        return utils.formatResponse(exam, examMap);
      });
  }


  /**
   * Get course details by courseId
   * @param {Object} options - Required options
   * @param {function} [updateAccessToken] - Update access token on refresh
   * @param {String} options.host - Canvas host
   * @param {String} options.clientId - Canvas client ID
   * @param {String} options.clientSecret - Canvas client secret
   * @param {String} options.accessToken - Canvas access token
   * @param {String} options.refreshToken - Canvas refresh token
   * @param {String} options.courseId - Canvas course ID
   * @param {String} [options.page] - Pagination page number
   * @param {String} [options.perPage] - Pagination per page limit
   * @returns {CanvasRequestIterator}
   */
  getCourseDetails(options, updateAccessToken) {
    let apiName = 'getCourseDetails';

    return this
      ._validateOptions(apiName, options)
      .then(response => {
        const {credentials, pagination, params} = response;
        const requestOptions = this._buildRequestOptions(credentials.host, apiName, params, pagination);
        const requestIterator = new CanvasRequestIterator(credentials, updateAccessToken);

        return requestIterator.request(requestOptions);
      })
      .then(function (response) {
        return response.current().results;
      })
      .then(course => {
        return utils.formatResponse(course, courseMap);
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
      });
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
    let urlTemplate = host + apiList[apiName].endpoint;
    let method = apiList[apiName].method;
    // make query parameters snake case as per canvas requirement
    query = _.mapKeys(query, (val, key) => {
      if (key === _.camelCase(key)) {
        return _.snakeCase(key);
      } else {
        return key;
      }
    });
    let url = utils.buildUrl(urlTemplate, params, query);

    return {method, url};
  }

  /**
   * Get results by iterating over pages
   * @param iterator
   * @return {Promise|string|Object|*|IteratorResult<T>}
   * @private
   */
  _getResultByIterator(iterator) {
    let results = [];
    let promise = iterator.next();
    console.log("=======================");
    console.log("Start _getResultByIterator");
    console.log("Has Next ", iterator.hasNext()); 

    for (let i = 0; i < 20; ++i) {
      if(!iterator.hasNext()){
        break;
      }
      promise = promise.then(response => {
        // update result list
        console.log(`Result Loop: ${i}`);
        //console.log(response.results);
        console.log(iterator.hasNext());

        if(response && response.results){
          results = results.concat(response.results);
        }
        
        if (iterator.hasNext()) {
          // call next iterator
          return iterator.next();
        }
        // all iteration is done, send the results
        return Promise.resolve(results);
      });
    }

    /*
    for (let i = 0; i < iterator.size(); ++i) {
      promise = promise.then(response => {
        // update result list
        //console.log(`${i} Results`);
        //console.log(response.results);
        results = results.concat(response.results);
        if (i < iterator.size() - 1) {
          // call next iterator
          return iterator.next();
        }
        // all iteration is done, send the results
        return Promise.resolve(results);
      });
    }
    */

    return promise;
  }
}

module.exports = new CanvasClient();
