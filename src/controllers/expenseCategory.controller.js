const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const { expenseCategoryService } = require('../services');

const createExpenseCategory = catchAsync(async (req, res) => {
  const expenseCategory = await expenseCategoryService.createExpenseCategory(req.body);
  res.status(httpStatus.CREATED).send(expenseCategory);
});

const getExpenseCategories = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'type']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const expenseCategories = await expenseCategoryService.getAllExpenseCategories(filter, options);
  res.send(expenseCategories);
});

const getExpenseCategoryById = catchAsync(async (req, res) => {
  const expenseCategory = await expenseCategoryService.getExpenseCategoryById(req.params.id);
  res.send(expenseCategory);
});

const updateExpenseCategoryById = catchAsync(async (req, res) => {
  const expenseCategory = await expenseCategoryService.updateExpenseCategory(req.params.id, req.body);
  res.send(expenseCategory);
});

const deleteExpenseCategoryById = catchAsync(async (req, res) => {
  await expenseCategoryService.deleteExpenseCategory(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createExpenseCategory,
  getExpenseCategories,
  getExpenseCategoryById,
  updateExpenseCategoryById,
  deleteExpenseCategoryById,
};
