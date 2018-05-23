'use strict';

const joi = require('joi');

const schema = {
  credentials: joi
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
        .description('Canvas course ID')
    })
    .required()
    .description('Course enrollment list schema'),
  courseUsers: joi
    .object({
      courseId: joi
        .number()
        .integer()
        .positive()
        .required()
        .description('Canvas course ID')
    })
    .required()
    .description('Course user list schema'),
  courseExams: joi
    .object({
      courseId: joi
        .number()
        .integer()
        .positive()
        .required()
        .description('Canvas client ID')
    }),
  courseExternalTools: joi
    .object({
      courseId: joi
        .number()
        .integer()
        .positive()
        .required()
        .description('Canvas client Course ID')
    })
    .required()
    .description('Course exam list schema'),
  getExam: joi
    .object({
      courseId: joi
        .number()
        .integer()
        .positive()
        .required()
        .description('Canvas client Course ID'),
      quizId: joi
        .number()
        .integer()
        .positive()
        .required()
        .description('Canvas client quiz ID')
    })
    .required()
    .description('Course exam get schema'),

  getCourseDetails: joi
    .object({
      courseId: joi
        .number()
        .integer()
        .positive()
        .required()
        .description('Canvas client Course ID')
    })
    .required()
    .description('Course course details from canvas')
};

module.exports = schema;
