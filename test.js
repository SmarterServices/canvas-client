'use strict';

const client = require('./index');

const config = {
  host: '',
  clientId: '',
  clientSecret: '',
  accessToken: '',
  refreshToken: '',
  courseId: 4
};

client.courseEnrollments(config)
  .then(response => {
    console.log(response);
  })
  .catch(error => {
    console.error(error);
  });