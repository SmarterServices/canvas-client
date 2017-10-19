'use strict';

const CanvasClient = require('./index');

const config = {
  accessToken: '',
  clientId: '',
  clientSecret: '',
  refreshToken: ''
};

const client = new CanvasClient(config);

// client.method()
//   .then(response => {
//     console.log(response);
//   })
//   .catch(error => {
//     console.error(error);
//   })