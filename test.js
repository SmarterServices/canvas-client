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
};

// client.courseExams(config)
client.courseEnrollments(config)
  .then(results => {
    console.log(results);
  })
  .catch(error => {
    console.error(error);
  });
