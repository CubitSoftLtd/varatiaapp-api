const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { expenseService } = require('../services');

const createExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.createExpense(req.params.propertyId, req.body);
  res.status(httpStatus.CREATED).send(expense);
});

const getExpenses = catchAsync(async (req, res) => {
  const expenses = await expenseService.getExpensesByPropertyId(req.params.propertyId);
  res.send(expenses);
});

const getExpenseById = catchAsync(async (req, res) => {
  const expense = await expenseService.getExpenseById(req.params.id);
  res.send(expense);
});

const updateExpenseById = catchAsync(async (req, res) => {
  const expense = await expenseService.updateExpenseById(req.params.id, req.body);
  res.send(expense);
});

const deleteExpenseById = catchAsync(async (req, res) => {
  await expenseService.deleteExpenseById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exs = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpenseById,
  deleteExpenseById,
};
