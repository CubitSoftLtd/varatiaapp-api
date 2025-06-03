const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { accountService, userService } = require('../services');

const createAccount = catchAsync(async (req, res) => {
  const account = await accountService.createAccount(req.body);

  // TODO: Need to send email
  if (account) {
    // If the account is created successfully, also create a user for this account
    await userService.createUser({
      accountId: account.id,
      email: account.contactEmail,
      name: account.name,
    });

    // const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);
    // await emailService.sendVerificationEmail(user.email, verifyEmailToken);
  }

  res.status(httpStatus.CREATED).send(account);
});

const getAccounts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'type']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const accounts = await accountService.getAllAccounts(filter, options);

  res.send(accounts);
});

const getAccountById = catchAsync(async (req, res) => {
  const account = await accountService.getAccountById(req.params.id);
  res.send(account);
});

const updateAccountById = catchAsync(async (req, res) => {
  const account = await accountService.updateAccount(req.params.id, req.body);
  res.send(account);
});

const deleteAccountById = catchAsync(async (req, res) => {
  await accountService.deleteAccount(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccountById,
  deleteAccountById,
};
