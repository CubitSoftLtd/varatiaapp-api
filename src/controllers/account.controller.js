const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { accountService } = require('../services');

const createAccount = catchAsync(async (req, res) => {
  const account = await accountService.createAccount(req.body);
  res.status(httpStatus.CREATED).send(account);
});

const getAccounts = catchAsync(async (req, res) => {
  const accounts = await accountService.getAllAccounts();
  res.send(accounts);
});

const getAccountById = catchAsync(async (req, res) => {
  const account = await accountService.getAccountById(req.params.id);
  res.send(account);
});

const updateAccountById = catchAsync(async (req, res) => {
  const account = await accountService.updateAccountById(req.params.id, req.body);
  res.send(account);
});

const deleteAccountById = catchAsync(async (req, res) => {
  await accountService.deleteAccountById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccountById,
  deleteAccountById,
};
