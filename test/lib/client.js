'use strict';

const _ = require('lodash');
const client = require('./../../index');
const mockData = require('./../data/mock.json');
const sinon = require('sinon');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

const utils = require('./../../lib/utils');
const enrollmentMap = require('./../../data/enrollment-data-map');
const examMap = require('./../../data/exam-data-map');
const canvasMock = require('./mock');
require('mocha-generators').install();

describe('Client', function testCanvasClient() {
  const canvasConfig = {
    host: 'https://smarterservices.instructure.com',
    clientId: 'test',
    clientSecret: 'test',
    accessToken: 'test',
    refreshToken: 'test'
  };

  afterEach('Restore mock', () => {
    canvasMock.restore();
  });

  const updateAccessTokenSpy = sinon.stub().resolves();

  describe('Course Enrollments', function testCourseEnrollments() {
    it('Should list course enrollments', () => {
      const request = mockData.courseEnrollments.requests.valid;

      const options = _.cloneDeep(canvasConfig);
      options.perPage = 2;
      options.courseId = request.params.courseId;

      canvasMock.mockCanvasEndpoint(canvasConfig.host, request, mockData.courseEnrollments.endpoint, options.perPage);

      return client
        .courseEnrollments(options, updateAccessTokenSpy)
        .then(response => {
          const expectedResponse = utils.formatResponse(request.response, enrollmentMap);
          expect(response).to.eql(expectedResponse);
          expect(updateAccessTokenSpy.called).to.equal(false);
          updateAccessTokenSpy.resetHistory();
        });
    });

    it('Should fail to list course enrollments for bad request', function* () {
      const request = mockData.courseEnrollments.requests.invalid;

      const options = _.cloneDeep(canvasConfig);
      options.perPage = 2;
      options.courseId = request.params.courseId;

      canvasMock.mockCanvasEndpoint(canvasConfig.host, request, mockData.courseEnrollments.endpoint, options.perPage);

      const courseEnrollmentsPromise = client.courseEnrollments(options, updateAccessTokenSpy);

      yield expect(courseEnrollmentsPromise).to.be.rejected;

      return courseEnrollmentsPromise
        .catch(error => {
          expect(error.statusCode).to.equal(request.statusCode);
          expect(updateAccessTokenSpy.called).to.equal(false);
          updateAccessTokenSpy.resetHistory();
        });
    });

    it('Should fail to list course enrollment for unauthorized request', function* () {
      const request = mockData.courseEnrollments.requests.unauthorized;

      const options = _.cloneDeep(canvasConfig);
      options.perPage = 2;
      options.courseId = request.params.courseId;

      canvasMock.mockCanvasEndpoint(canvasConfig.host, request, mockData.courseEnrollments.endpoint, options.perPage);
      canvasMock.mockRefreshToken(canvasConfig);

      const courseEnrollmentsPromise = client.courseEnrollments(options, updateAccessTokenSpy);

      yield expect(courseEnrollmentsPromise).to.be.rejected;

      return courseEnrollmentsPromise
        .catch(error => {
          expect(error.statusCode).to.equal(request.statusCode);
          expect(updateAccessTokenSpy.called).to.equal(true);
          updateAccessTokenSpy.resetHistory();
        });
    });

    it('Should fail to list course enrollment for no courseId in params', () => {
      const options = _.cloneDeep(canvasConfig);
      options.perPage = 2;

      return expect(client.courseEnrollments(options, updateAccessTokenSpy)).to.be.rejected;
    });
  });

  describe('Course exams', function testCourseExams() {
    it('Should list course exams', () => {
      const request = mockData.courseExams.requests.valid;

      const options = _.cloneDeep(canvasConfig);
      options.perPage = 2;
      options.courseId = request.params.courseId;

      canvasMock.mockCanvasEndpoint(canvasConfig.host, request, mockData.courseExams.endpoint, options.perPage);

      return client
        .courseExams(options, updateAccessTokenSpy)
        .then(response => {
          expect(response).to.eql(request.response);
          expect(updateAccessTokenSpy.called).to.equal(false);
          updateAccessTokenSpy.resetHistory();
        });
    });

    it('Should fail to list course exams for bad request', function* () {
      const request = mockData.courseExams.requests.invalid;

      const options = _.cloneDeep(canvasConfig);
      options.perPage = 2;
      options.courseId = request.params.courseId;

      canvasMock.mockCanvasEndpoint(canvasConfig.host, request, mockData.courseExams.endpoint, options.perPage);

      const courseExamsPromise = client.courseExams(options, updateAccessTokenSpy);

      yield expect(courseExamsPromise).to.be.rejected;

      return courseExamsPromise
        .catch(error => {
          expect(error.statusCode).to.eql(request.statusCode);
          expect(updateAccessTokenSpy.called).to.equal(false);
          updateAccessTokenSpy.resetHistory();
        });
    });

    it('Should fail to list course exams for unauthorized request', function* () {
      const request = mockData.courseExams.requests.unauthorized;

      const options = _.cloneDeep(canvasConfig);
      options.perPage = 2;
      options.courseId = request.params.courseId;

      canvasMock.mockCanvasEndpoint(canvasConfig.host, request, mockData.courseExams.endpoint, options.perPage);
      canvasMock.mockRefreshToken(canvasConfig);

      const courseExamsPromise = client.courseExams(options, updateAccessTokenSpy);

      yield expect(courseExamsPromise).to.be.rejected;

      return courseExamsPromise
        .catch(error => {
          expect(error.statusCode).to.eql(request.statusCode);
          expect(updateAccessTokenSpy.called).to.equal(true);
          updateAccessTokenSpy.resetHistory();
        });
    });

    it('Should fail to list course enrollment for no courseId in params', () => {
      const options = _.cloneDeep(canvasConfig);
      options.perPage = 2;

      return expect(client.courseExams(options, updateAccessTokenSpy)).to.be.rejected;
    });
  });

  describe('Course external tools', function testCourseExternalTools() {
    it('Should list course external tools', () => {
      const request = mockData.courseExternalTools.requests.valid;

      const options = _.cloneDeep(canvasConfig);
      options.courseId = request.params.courseId;

      canvasMock.mockCanvasEndpoint(canvasConfig.host, request, mockData.courseExternalTools.endpoint);

      return client
        .listCourseExternalTools(options, updateAccessTokenSpy)
        .then(response => {
          expect(response).to.eql(request.response);
          expect(updateAccessTokenSpy.called).to.equal(false);
          updateAccessTokenSpy.resetHistory();
        });
    });

    it('Should fail to list course external tools for bad request', function* () {
      const request = mockData.courseExternalTools.requests.invalid;

      const options = _.cloneDeep(canvasConfig);
      options.courseId = request.params.courseId;

      canvasMock.mockCanvasEndpoint(canvasConfig.host, request, mockData.courseExternalTools.endpoint);

      const courseExternalToolsPromise = client.listCourseExternalTools(options, updateAccessTokenSpy);

      yield expect(courseExternalToolsPromise).to.be.rejected;

      return courseExternalToolsPromise
        .catch(error => {
          expect(error.statusCode).to.eql(request.statusCode);
          expect(updateAccessTokenSpy.called).to.equal(false);
          updateAccessTokenSpy.resetHistory();
        });
    });

    it('Should fail to list course external tools for unquthorized request', function* () {
      const request = mockData.courseExternalTools.requests.unauthorized;

      const options = _.cloneDeep(canvasConfig);
      options.courseId = request.params.courseId;

      canvasMock.mockCanvasEndpoint(canvasConfig.host, request, mockData.courseExternalTools.endpoint);
      canvasMock.mockRefreshToken(canvasConfig);

      const courseExternalToolsPromise = client.listCourseExternalTools(options, updateAccessTokenSpy);

      yield expect(courseExternalToolsPromise).to.be.rejected;

      return courseExternalToolsPromise
        .catch(error => {
          expect(error.statusCode).to.eql(request.statusCode);
          expect(updateAccessTokenSpy.called).to.equal(true);
          updateAccessTokenSpy.resetHistory();
        });
    });

    it('Should fail to list course enrollment for no courseId in params', () => {
      const options = _.cloneDeep(canvasConfig);
      options.perPage = 2;

      return expect(client.listCourseExternalTools(options, updateAccessTokenSpy)).to.be.rejected;
    });
  });

  describe('Get Exam', function testExam() {
    it('Should get exam', () => {
      const request = mockData.getExam.requests.valid;

      const options = _.cloneDeep(canvasConfig);
      options.courseId = request.params.courseId;
      options.quizId = request.params.quizId;

      canvasMock.mockCanvasEndpoint(canvasConfig.host, request, mockData.getExam.endpoint, 0, false);

      return client
        .getExam(options, updateAccessTokenSpy)
        .then(response => {
          const expectedResponse = utils.formatResponse(request.response, examMap);
          expect(response).to.eql(expectedResponse);
        });
    });

    it('Should fail to get exam for bad request', function* () {
      const request = mockData.getExam.requests.invalid;

      const options = _.cloneDeep(canvasConfig);
      options.courseId = request.params.courseId;
      options.quizId = request.params.quizId;

      canvasMock.mockCanvasEndpoint(canvasConfig.host, request, mockData.getExam.endpoint, 0, false);

      const getExamPromise = client.getExam(options, updateAccessTokenSpy);

      yield expect(getExamPromise).to.be.rejected;

      return getExamPromise
        .catch(error => {
          expect(error.statusCode).to.equal(request.statusCode);
        });
    });

    it('Should fail to get exam for unauthorized request', function* () {
      const request = mockData.getExam.requests.unauthorized;

      const options = _.cloneDeep(canvasConfig);
      options.courseId = request.params.courseId;
      options.quizId = request.params.quizId;

      canvasMock.mockCanvasEndpoint(canvasConfig.host, request, mockData.getExam.endpoint, 0, false);
      canvasMock.mockRefreshToken(canvasConfig);

      const getExamPromise = client.getExam(options);

      yield expect(getExamPromise).to.be.rejected;

      return getExamPromise
        .catch(error => {
          expect(error.statusCode).to.equal(request.statusCode);
        });
    });

    it('Should fail to get exam for invalid [quizId]', function* () {
      const request = mockData.getExam.requests.notFound;

      const options = _.cloneDeep(canvasConfig);
      options.courseId = request.params.courseId;
      options.quizId = request.params.quizId;

      canvasMock.mockCanvasEndpoint(canvasConfig.host, request, mockData.getExam.endpoint, 0, false);

      const getExamPromise = client.getExam(options);

      yield expect(getExamPromise).to.be.rejected;

      return getExamPromise
        .catch(error => {
          expect(error.statusCode).to.equal(request.statusCode);
        });
    });
  });
});
