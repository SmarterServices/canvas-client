'use strict';

const _ = require('lodash');

const dataMap = {
  firstName: function (data) {
    let key = 'user.name';
    return _.get(data, key).split(' ')[0];
  },
  lastName: function (data) {
    let key = 'user.name';
    return _.get(data, key).split(' ').slice(1).join(' ');
  },
  userId: 'user_id',
  courseId: 'course_id',
  emailAddress: 'user.email',
  enrollmentState: 'enrollment_state',
  role: 'role',
  rootAccountId: 'root_account_id',
  sisUserId: 'sis_user_id'
};


module.exports = dataMap;
