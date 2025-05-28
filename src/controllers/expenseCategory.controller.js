const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { expenseCategoryService } = require('../services');

const createExpenseCategory = catchAsync(async (req, res) => {
  const expenseCategory = await expenseCategoryService.createExpenseCategory(req.body);
  res.status(httpStatus.CREATED).send(expenseCategory);
});

const getExpenseCategories = catchAsync(async (req, res) => {
  const expenseCategories = await expenseCategoryService.getAllExpenseCategories();
  res.send(expenseCategories);
});

const getExpenseCategoryById = catchAsync(async (req, res) => {
  const expenseCategory = await expenseCategoryService.getExpenseCategoryById(req.params.id);
  res.send(expenseCategory);
});

const updateExpenseCategoryById = catchAsync(async (req, res) => {
  const expenseCategory = await expenseCategoryService.updateExpenseCategoryById(req.params.id, req.body);
  res.send(expenseCategory);
});

const deleteExpenseCategoryById = catchAsync(async (req, res) => {
  await expenseCategoryService.deleteExpenseCategoryById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createExpenseCategory,
  getExpenseCategories,
  getExpenseCategoryById,
  updateExpenseCategoryById,
  deleteExpenseCategoryById,
};
