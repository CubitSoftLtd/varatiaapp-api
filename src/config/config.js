const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    DB_NAME: Joi.string().required().description('MySQL database name'),
    DB_USER: Joi.string().required().description('MySQL username'),
    DB_PASSWORD: Joi.string().allow('').description('MySQL password'),
    DB_HOST: Joi.string().required().description('MySQL host'),
    DB_PORT: Joi.number().required().description('MySQL PORT'),
    DB_SSL: Joi.string().valid('true', 'false').default('false').description('Enable SSL for MySQL'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  database: {
    development: {
      database: envVars.DB_NAME,
      username: envVars.DB_USER,
      password: envVars.DB_PASSWORD,
      host: envVars.DB_HOST,
      port: envVars.DB_PORT,
      dialect: 'mysql',
      timezone: '+06:00',
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    },
    production: {
      database: envVars.DB_NAME,
      username: envVars.DB_USER,
      password: envVars.DB_PASSWORD,
      host: envVars.DB_HOST,
      port: envVars.DB_PORT,
      dialect: 'mysql',
      timezone: '+06:00',
      logging: false,
      pool: {
        max: 10,
        min: 2,
        acquire: 60000,
        idle: 30000,
      },
      dialectOptions: {
        connectTimeout: 30000,
        retry: {
          max: 3,
          backoffBase: 1000,
          backoffExponent: 2,
        },
        ssl:
          envVars.DB_SSL === 'true'
            ? {
                require: true,
                rejectUnauthorized: false,
              }
            : null,
      },
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
};
