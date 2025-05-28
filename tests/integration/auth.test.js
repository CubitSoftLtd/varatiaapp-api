const request = require('supertest');
const httpStatus = require('http-status');
const httpMocks = require('node-mocks-http');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const config = require('../../src/config/config');
const auth = require('../../src/middlewares/auth');
const { tokenService, emailService } = require('../../src/services');
const ApiError = require('../../src/utils/ApiError');
const setupTestDB = require('../utils/setupTestDB');
const { User, Token } = require('../../src/models');
const { roleRights } = require('../../src/config/roles');
const { tokenTypes } = require('../../src/config/tokens');
const { userOne, admin, insertUsers } = require('../fixtures/user.fixture');

setupTestDB();

describe('Auth routes', () => {
  // Clear email mocks after each test to prevent interference
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /v1/auth/register', () => {
    let newUser;
    beforeEach(() => {
      newUser = {
        name: 'Test User',
        email: 'test.user@example.com',
        password: 'password1',
      };
    });

    test('should return 201 and successfully register user if request data is ok', async () => {
      const res = await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.CREATED);

      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body.user).toEqual({
        id: expect.anything(),
        name: newUser.name,
        email: newUser.email,
        role: 'user',
        isEmailVerified: false,
      });

      const dbUser = await User.findByPk(res.body.user.id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(newUser.password);
      expect(await bcrypt.compare(newUser.password, dbUser.password)).toBe(true); // Verify password hash
      expect(dbUser).toMatchObject({ name: newUser.name, email: newUser.email, role: 'user', isEmailVerified: false });
      expect(dbUser.isEmailVerified).toBe(res.body.user.isEmailVerified); // Verify database matches response

      expect(res.body.tokens).toEqual({
        access: { token: expect.anything(), expires: expect.anything() },
        refresh: { token: expect.anything(), expires: expect.anything() },
      });
      // Verify token expiration (assumes expires is a parseable date string; adjust if format differs)
      expect(new Date(res.body.tokens.access.expires).getTime()).toBeGreaterThan(Date.now());
      expect(new Date(res.body.tokens.refresh.expires).getTime()).toBeGreaterThan(Date.now());
    });

    test('should return 400 error if email is invalid', async () => {
      newUser.email = 'invalidEmail';

      await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if email is already used', async () => {
      await insertUsers([userOne]);
      newUser.email = userOne.email;

      await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if password length is less than 6 characters', async () => {
      newUser.password = 'pass1';

      await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/auth/login', () => {
    let insertedUserOne;
    beforeEach(async () => {
      const insertedUsers = await insertUsers([userOne]);
      insertedUserOne = insertedUsers; // Store the inserted user to get its ID
    });

    test('should return 200 and login user if email and password match', async () => {
      const loginCredentials = {
        email: userOne.email,
        password: userOne.password,
      };

      const res = await request(app).post('/v1/auth/login').send(loginCredentials).expect(httpStatus.OK);

      expect(res.body.user).toEqual({
        id: insertedUserOne.id,
        name: userOne.name,
        email: userOne.email,
        role: userOne.role,
        isEmailVerified: userOne.isEmailVerified,
      });

      const dbUser = await User.findByPk(insertedUserOne.id);
      expect(await bcrypt.compare(userOne.password, dbUser.password)).toBe(true); // Verify password hash

      expect(res.body.tokens).toEqual({
        access: { token: expect.anything(), expires: expect.anything() },
        refresh: { token: expect.anything(), expires: expect.anything() },
      });
      expect(new Date(res.body.tokens.access.expires).getTime()).toBeGreaterThan(Date.now());
      expect(new Date(res.body.tokens.refresh.expires).getTime()).toBeGreaterThan(Date.now());
    });

    test('should return 401 error if there are no users with that email', async () => {
      const loginCredentials = {
        email: 'nonexistent@example.com',
        password: userOne.password,
      };

      const res = await request(app).post('/v1/auth/login').send(loginCredentials).expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({ code: httpStatus.UNAUTHORIZED, message: 'Incorrect email or password' });
    });

    test('should return 401 error if password is wrong', async () => {
      const loginCredentials = {
        email: userOne.email,
        password: 'wrongPassword1',
      };

      const res = await request(app).post('/v1/auth/login').send(loginCredentials).expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({ code: httpStatus.UNAUTHORIZED, message: 'Incorrect email or password' });
    });
  });

  describe('POST /v1/auth/logout', () => {
    let insertedUserOne;
    let refreshToken;
    beforeEach(async () => {
      const insertedUsers = await insertUsers([userOne]);
      insertedUserOne = insertedUsers;
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      refreshToken = tokenService.generateToken(insertedUserOne.id, expires, tokenTypes.REFRESH);
      await tokenService.saveToken(refreshToken, insertedUserOne.id, expires, tokenTypes.REFRESH);
    });

    test('should return 204 if refresh token is valid', async () => {
      await request(app).post('/v1/auth/logout').send({ refreshToken }).expect(httpStatus.NO_CONTENT);

      const dbRefreshTokenDoc = await Token.findOne({ where: { token: refreshToken } });
      expect(dbRefreshTokenDoc).toBe(null);
    });

    test('should return 400 error if refresh token is missing from request body', async () => {
      await request(app).post('/v1/auth/logout').send().expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if refresh token is not found in the database', async () => {
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const nonExistentRefreshToken = tokenService.generateToken(insertedUserOne.id, expires, tokenTypes.REFRESH);

      await request(app)
        .post('/v1/auth/logout')
        .send({ refreshToken: nonExistentRefreshToken })
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 error if refresh token is blacklisted', async () => {
      await Token.update({ blacklisted: true }, { where: { token: refreshToken } });

      await request(app).post('/v1/auth/logout').send({ refreshToken }).expect(httpStatus.NOT_FOUND);
    });
  });

  describe('POST /v1/auth/refresh-tokens', () => {
    let insertedUserOne;
    let refreshToken;
    beforeEach(async () => {
      const insertedUsers = await insertUsers([userOne]);
      insertedUserOne = insertedUsers;
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      refreshToken = tokenService.generateToken(insertedUserOne.id, expires, tokenTypes.REFRESH);
      await tokenService.saveToken(refreshToken, insertedUserOne.id, expires, tokenTypes.REFRESH);
    });

    test('should return 200 and new auth tokens if refresh token is valid', async () => {
      const res = await request(app).post('/v1/auth/refresh-tokens').send({ refreshToken }).expect(httpStatus.OK);

      expect(res.body).toEqual({
        access: { token: expect.anything(), expires: expect.anything() },
        refresh: { token: expect.anything(), expires: expect.anything() },
      });

      const dbRefreshTokenDoc = await Token.findOne({ where: { token: res.body.refresh.token } });
      expect(dbRefreshTokenDoc).toMatchObject({ type: tokenTypes.REFRESH, user: insertedUserOne.id, blacklisted: false });

      const dbRefreshTokenCount = await Token.count();
      expect(dbRefreshTokenCount).toBe(1);
    });

    test('should return 400 error if refresh token is missing from request body', async () => {
      await request(app).post('/v1/auth/refresh-tokens').send().expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 error if refresh token is signed using an invalid secret', async () => {
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const invalidRefreshToken = tokenService.generateToken(
        insertedUserOne.id,
        expires,
        tokenTypes.REFRESH,
        'invalidSecret'
      );
      await tokenService.saveToken(invalidRefreshToken, insertedUserOne.id, expires, tokenTypes.REFRESH);

      await request(app)
        .post('/v1/auth/refresh-tokens')
        .send({ refreshToken: invalidRefreshToken })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 error if refresh token is not found in the database', async () => {
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const nonExistentRefreshToken = tokenService.generateToken(insertedUserOne.id, expires, tokenTypes.REFRESH);

      await request(app)
        .post('/v1/auth/refresh-tokens')
        .send({ refreshToken: nonExistentRefreshToken })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 error if refresh token is blacklisted', async () => {
      await Token.update({ blacklisted: true }, { where: { token: refreshToken } });

      await request(app).post('/v1/auth/refresh-tokens').send({ refreshToken }).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 error if refresh token is expired', async () => {
      const expires = moment().subtract(1, 'minutes');
      const expiredRefreshToken = tokenService.generateToken(insertedUserOne.id, expires, tokenTypes.REFRESH);
      await tokenService.saveToken(expiredRefreshToken, insertedUserOne.id, expires, tokenTypes.REFRESH);

      await request(app)
        .post('/v1/auth/refresh-tokens')
        .send({ refreshToken: expiredRefreshToken })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 error if user is not found', async () => {
      await User.destroy({ where: { id: insertedUserOne.id } }); // Delete the user

      await request(app).post('/v1/auth/refresh-tokens').send({ refreshToken }).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /v1/auth/forgot-password', () => {
    let insertedUserOne;
    beforeEach(async () => {
      const insertedUsers = await insertUsers([userOne]);
      insertedUserOne = insertedUsers;
      jest.spyOn(emailService.transport, 'sendMail').mockResolvedValue();
    });

    test('should return 204 and send reset password email to the user', async () => {
      const sendResetPasswordEmailSpy = jest.spyOn(emailService, 'sendResetPasswordEmail');

      await request(app).post('/v1/auth/forgot-password').send({ email: userOne.email }).expect(httpStatus.NO_CONTENT);

      expect(sendResetPasswordEmailSpy).toHaveBeenCalledWith(userOne.email, expect.any(String));
      const resetPasswordToken = sendResetPasswordEmailSpy.mock.calls[0][1];
      const dbResetPasswordTokenDoc = await Token.findOne({
        where: { token: resetPasswordToken, user: insertedUserOne.id },
      });
      expect(dbResetPasswordTokenDoc).toBeDefined();
    });

    test('should return 400 if email is missing', async () => {
      await request(app).post('/v1/auth/forgot-password').send().expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 if email does not belong to any user', async () => {
      await request(app)
        .post('/v1/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('POST /v1/auth/reset-password', () => {
    let insertedUserOne;
    let resetPasswordToken;
    beforeEach(async () => {
      const insertedUsers = await insertUsers([userOne]);
      insertedUserOne = insertedUsers;
      const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
      resetPasswordToken = tokenService.generateToken(insertedUserOne.id, expires, tokenTypes.RESET_PASSWORD);
      await tokenService.saveToken(resetPasswordToken, insertedUserOne.id, expires, tokenTypes.RESET_PASSWORD);
    });

    test('should return 204 and reset the password', async () => {
      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: 'password2' })
        .expect(httpStatus.NO_CONTENT);

      const dbUser = await User.findByPk(insertedUserOne.id);
      const isPasswordMatch = await bcrypt.compare('password2', dbUser.password);
      expect(isPasswordMatch).toBe(true);

      const dbResetPasswordTokenCount = await Token.count({
        where: { user: insertedUserOne.id, type: tokenTypes.RESET_PASSWORD },
      });
      expect(dbResetPasswordTokenCount).toBe(0);
    });

    test('should return 400 if reset password token is missing', async () => {
      await request(app).post('/v1/auth/reset-password').send({ password: 'password2' }).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 if reset password token is blacklisted', async () => {
      await Token.update({ blacklisted: true }, { where: { token: resetPasswordToken } });

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: 'password2' })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 if reset password token is expired', async () => {
      const expires = moment().subtract(1, 'minutes');
      const expiredResetPasswordToken = tokenService.generateToken(insertedUserOne.id, expires, tokenTypes.RESET_PASSWORD);
      await tokenService.saveToken(expiredResetPasswordToken, insertedUserOne.id, expires, tokenTypes.RESET_PASSWORD);

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: expiredResetPasswordToken })
        .send({ password: 'password2' })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 if user is not found', async () => {
      await User.destroy({ where: { id: insertedUserOne.id } });

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: 'password2' })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 if password is missing or invalid', async () => {
      await request(app).post('/v1/auth/reset-password').query({ token: resetPasswordToken }).expect(httpStatus.BAD_REQUEST);

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: 'short' })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/auth/send-verification-email', () => {
    let insertedUserOne;
    let accessToken;
    beforeEach(async () => {
      const insertedUsers = await insertUsers([userOne]);
      insertedUserOne = insertedUsers;
      const expires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
      accessToken = tokenService.generateToken(insertedUserOne.id, expires, tokenTypes.ACCESS);
      jest.spyOn(emailService.transport, 'sendMail').mockResolvedValue();
    });

    test('should return 204 and send verification email to the user', async () => {
      const sendVerificationEmailSpy = jest.spyOn(emailService, 'sendVerificationEmail');

      await request(app)
        .post('/v1/auth/send-verification-email')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(httpStatus.NO_CONTENT);

      expect(sendVerificationEmailSpy).toHaveBeenCalledWith(userOne.email, expect.any(String));
      const verifyEmailToken = sendVerificationEmailSpy.mock.calls[0][1];
      const dbVerifyEmailToken = await Token.findOne({ where: { token: verifyEmailToken, user: insertedUserOne.id } });

      expect(dbVerifyEmailToken).toBeDefined();
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/auth/send-verification-email').send().expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /v1/auth/verify-email', () => {
    let insertedUserOne;
    let verifyEmailToken;
    beforeEach(async () => {
      const insertedUsers = await insertUsers([userOne]);
      insertedUserOne = insertedUsers;
      const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
      verifyEmailToken = tokenService.generateToken(insertedUserOne.id, expires, tokenTypes.VERIFY_EMAIL);
      await tokenService.saveToken(verifyEmailToken, insertedUserOne.id, expires, tokenTypes.VERIFY_EMAIL);
    });

    test('should return 204 and verify the email', async () => {
      await request(app)
        .post('/v1/auth/verify-email')
        .query({ token: verifyEmailToken })
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbUser = await User.findByPk(insertedUserOne.id);
      expect(dbUser.isEmailVerified).toBe(true);

      const dbVerifyEmailTokenCount = await Token.count({
        where: { user: insertedUserOne.id, type: tokenTypes.VERIFY_EMAIL },
      });
      expect(dbVerifyEmailTokenCount).toBe(0);
    });

    test('should return 400 if verify email token is missing', async () => {
      await request(app).post('/v1/auth/verify-email').send().expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 if verify email token is blacklisted', async () => {
      await Token.update({ blacklisted: true }, { where: { token: verifyEmailToken } });

      await request(app)
        .post('/v1/auth/verify-email')
        .query({ token: verifyEmailToken })
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 if verify email token is expired', async () => {
      const expires = moment().subtract(1, 'minutes');
      const expiredVerifyEmailToken = tokenService.generateToken(insertedUserOne.id, expires, tokenTypes.VERIFY_EMAIL);
      await tokenService.saveToken(expiredVerifyEmailToken, insertedUserOne.id, expires, tokenTypes.VERIFY_EMAIL);

      await request(app)
        .post('/v1/auth/verify-email')
        .query({ token: expiredVerifyEmailToken })
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 if user is not found', async () => {
      await User.destroy({ where: { id: insertedUserOne.id } });

      await request(app)
        .post('/v1/auth/verify-email')
        .query({ token: verifyEmailToken })
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });
});

describe('Auth middleware', () => {
  let insertedUserOne;
  let insertedAdmin;
  let userAccessToken;
  let adminToken;
  beforeEach(async () => {
    insertedUserOne = await insertUsers([userOne]);
    insertedAdmin = await insertUsers([admin]);
    const expires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    userAccessToken = tokenService.generateToken(insertedUserOne.id, expires, tokenTypes.ACCESS);
    adminToken = tokenService.generateToken(insertedAdmin.id, expires, tokenTypes.ACCESS);
  });

  test('should call next with no errors if access token is valid', async () => {
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${userAccessToken}` } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user.id).toEqual(insertedUserOne.id);
  });

  test('should call next with unauthorized error if access token is not found in header', async () => {
    const req = httpMocks.createRequest();
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    );
  });

  test('should call next with unauthorized error if access token is not a valid jwt token', async () => {
    const req = httpMocks.createRequest({ headers: { Authorization: 'Bearer randomToken' } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    );
  });

  test('should call next with unauthorized error if the token is not an access token', async () => {
    const expires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const refreshToken = tokenService.generateToken(insertedUserOne.id, expires, tokenTypes.REFRESH);
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${refreshToken}` } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    );
  });

  test('should call next with unauthorized error if access token is generated with an invalid secret', async () => {
    const expires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const accessToken = tokenService.generateToken(insertedUserOne.id, expires, tokenTypes.ACCESS, 'invalidSecret');
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${accessToken}` } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    );
  });

  test('should call next with unauthorized error if access token is expired', async () => {
    const expires = moment().subtract(1, 'minutes');
    const accessToken = tokenService.generateToken(insertedUserOne.id, expires, tokenTypes.ACCESS);
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${accessToken}` } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    );
  });

  test('should call next with unauthorized error if user is not found', async () => {
    await User.destroy({ where: { id: insertedUserOne.id } });
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${userAccessToken}` } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    );
  });

  test('should call next with forbidden error if user does not have required rights and userId is not in params', async () => {
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${userAccessToken}` } });
    const next = jest.fn();

    await auth('anyRight')(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: httpStatus.FORBIDDEN, message: 'Forbidden' }));
  });

  test('should call next with no errors if user does not have required rights but userId is in params', async () => {
    const req = httpMocks.createRequest({
      headers: { Authorization: `Bearer ${userAccessToken}` },
      params: { userId: insertedUserOne.id.toString() },
    });
    const next = jest.fn();

    await auth('anyRight')(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith();
  });

  test('should call next with no errors if user has required rights', async () => {
    const req = httpMocks.createRequest({
      headers: { Authorization: `Bearer ${adminToken}` },
      params: { userId: insertedUserOne.id.toString() },
    });
    const next = jest.fn();

    await auth(...roleRights.get('admin'))(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith();
  });
});
