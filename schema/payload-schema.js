'use strict';

const joi = require('joi');

const schema = {
  credentials : joi
    .object({
      host: joi
        .string()
        .uri()
        .required()
        .description('a'),
      clientId: joi
        .string()
        .required()
        .description('a'),
      clientSecret: joi
        .string()
        .required()
        .description('a'),
      accessToken: joi
        .string()
        .required()
        .description('a'),
      refreshToken: joi
        .string()
        .required()
        .description('a')
    })
    .required()
    .description('Credentials schema'),
  pagination: joi
    .object({
      page: joi
        .number()
        .integer()
        .positive()
        .description('a'),
      perPage: joi
        .number()
        .integer()
        .positive()
        .description('a')
    })
    .required()
    .description('Pagination schema'),
  courseEnrollments: joi
    .object({
      courseId: joi
        .number()
        .integer()
        .positive()
        .required()
        .description('Canvas client ID')
    })
    .required()
    .description('Refresh token schema')
};

module.exports = schema;
