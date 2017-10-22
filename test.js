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

client.courseEnrollments(config)
  .then(iterator => {
    let it = iterator;
    console.log('size', it.size());

    let promise = it.next();

    for(let i=0; i< it.size(); ++i) {
      promise = promise.then((response) =>{
        console.log(response.results[0].id);
        return it.next();
      })
    }
  })
  .catch(error => {
    console.error(error);
  });