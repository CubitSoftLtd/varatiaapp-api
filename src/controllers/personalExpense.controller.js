/* eslint-disable prettier/prettier */
const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { personalExpenseService } = require("../services");
const pick = require("../utils/pick");

const createPersonalExpense = catchAsync(async (req, res) => {
  const expense = await personalExpenseService.createPersonalExpense({ ...req.body, accountId: req.user.accountId });
  res.status(httpStatus.CREATED).send(expense);
});

const getPersonalExpenses = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['accountId','beneficiary', 'expenseDate']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const deleted = req.query.deleted || 'false'; // Default to 'false'

  if (req.user.role !== 'super_admin') {
    filter.accountId = req.user.accountId; // Ensure only properties for the user's account are fetched
  }

  const expenses = await personalExpenseService.getAllPersonalExpenses(filter, options, deleted);
  res.send(expenses);
});

const getPersonalExpenseById = catchAsync(async (req, res) => {
  const expense = await personalExpenseService.getPersonalExpenseById(req.params.id);
  res.send(expense);
});

const updatePersonalExpenseById = catchAsync(async (req, res) => {
  const expense = await personalExpenseService.updatePesonalExpense(req.params.id, req.body);
  res.send(expense);
});

const deletePersonalExpenseById = catchAsync(async (req, res) => {
  await personalExpenseService.deletePersonalExpense(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});
const restorePersonalExpenseById = catchAsync(async (req, res) => {
  await personalExpenseService.restorePersonalExpense(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeletePersonalExpenseById = catchAsync(async (req, res) => {
  await personalExpenseService.hardDeletePersonalExpense(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createPersonalExpense,
  getPersonalExpenses,
  getPersonalExpenseById,
  updatePersonalExpenseById,
  deletePersonalExpenseById,
  restorePersonalExpenseById,
  hardDeletePersonalExpenseById,
};