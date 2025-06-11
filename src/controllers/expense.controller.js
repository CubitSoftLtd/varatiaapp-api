const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { expenseService } = require('../services');
const { Account, Property, Unit, Bill, ExpenseCategory } = require('../models');

// Helper function to parse include query parameter
const parseInclude = (include) => {
  if (!include) return [];
  return include
    .split('|')
    .map((item) => {
      const [model, attributes] = item.split(':');
      const modelMap = {
        account: Account,
        property: Property,
        unit: Unit,
        bill: Bill,
        category: ExpenseCategory,
      };
      return {
        model: modelMap[model],
        as: model,
        attributes: attributes.split(','),
      };
    })
    .filter((item) => item.model); // Filter out invalid models
};

const createExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.createExpense(req.body);
  res.status(httpStatus.CREATED).send(expense);
});

const getExpenses = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['accountId', 'propertyId', 'unitId', 'billId', 'categoryId', 'amount', 'expenseDate']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);
  const expenses = await expenseService.getAllExpenses(filter, options);
  res.send(expenses);
});

const getExpenseById = catchAsync(async (req, res) => {
  const expense = await expenseService.getExpenseById(req.params.id, parseInclude(req.query.include));
  res.send(expense);
});

const updateExpenseById = catchAsync(async (req, res) => {
  const expense = await expenseService.updateExpense(req.params.id, req.body);
  res.send(expense);
});

const deleteExpenseById = catchAsync(async (req, res) => {
  await expenseService.deleteExpense(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeleteExpenseById = catchAsync(async (req, res) => {
  await expenseService.hardDeleteExpense(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpenseById,
  deleteExpenseById,
  hardDeleteExpenseById,
};
