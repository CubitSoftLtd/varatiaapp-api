const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { expenseCategoryService } = require('../services');
const { Expense } = require('../models');

// Helper function to parse include query parameter
const parseInclude = (include) => {
  if (!include) return [];
  return include
    .split('|')
    .map((item) => {
      const [model, attributes] = item.split(':');
      const modelMap = {
        expenses: Expense,
      };
      return {
        model: modelMap[model],
        as: model,
        attributes: attributes.split(','),
      };
    })
    .filter((item) => item.model); // Filter out invalid models
};

const createExpenseCategory = catchAsync(async (req, res) => {
  const category = await expenseCategoryService.createExpenseCategory(req.body);
  res.status(httpStatus.CREATED).send(category);
});

const getExpenseCategories = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'categoryType']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);
  const categories = await expenseCategoryService.getAllExpenseCategories(filter, options);
  res.send(categories);
});

const getExpenseCategoryById = catchAsync(async (req, res) => {
  const category = await expenseCategoryService.getExpenseCategoryById(req.params.id, parseInclude(req.query.include));
  res.send(category);
});

const updateExpenseCategoryById = catchAsync(async (req, res) => {
  const category = await expenseCategoryService.updateExpenseCategory(req.params.id, req.body);
  res.send(category);
});

const deleteExpenseCategoryById = catchAsync(async (req, res) => {
  await expenseCategoryService.deleteExpenseCategory(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeleteExpenseCategoryById = catchAsync(async (req, res) => {
  await expenseCategoryService.hardDeleteExpenseCategory(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createExpenseCategory,
  getExpenseCategories,
  getExpenseCategoryById,
  updateExpenseCategoryById,
  deleteExpenseCategoryById,
  hardDeleteExpenseCategoryById,
};
