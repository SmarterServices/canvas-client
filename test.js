'use strict';

const client = require('./index');

const config = {
  host: '',
  clientId: '',
  clientSecret: '',
  accessToken: '',
  refreshToken: '',
  courseId: 4,
  perPage: 2,
  accountId: 1
};

const examConfig = Object.assign({}, config, {quizId: 2});
// client.getExam(examConfig)
// client.courseExams(config)
// client.courseEnrollments(config)
// client.listCourseExternalTools(config)
client
  .listAccountExternalTools(config)
  .then(results => {
    console.log(results);
  })
  .catch(error => {
    console.error(error);
  });
