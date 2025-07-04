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
      const [modelName, attributesString] = item.split(':'); // Destructure into distinct variables for clarity

      const modelMap = {
        account: Account,
        property: Property,
        unit: Unit,
        bill: Bill,
        category: ExpenseCategory, // Assuming 'category' maps to ExpenseCategory model
      };

      const model = modelMap[modelName];

      // If the model name isn't found in the map, return null to be filtered out later.
      // This prevents errors from undefined models and helps in debugging.
      if (!model) {
        //  console.warn(`Warning: Unknown model specified for include: '${modelName}'. This include will be ignored.`);
        return null;
      }

      const includeOptions = {
        model,
        as: modelName,
        // You might want to default to `required: false` for LEFT JOINs unless specified
        // required: false,
      };

      // Safely parse attributes: only attempt to split if attributesString is provided.
      // If no attributesString, Sequelize will include all attributes by default.
      if (attributesString) {
        includeOptions.attributes = attributesString.split(',');
      }

      return includeOptions;
    })
    .filter((item) => item !== null); // Filter out any `null` entries created from unknown models
};

const createExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.createExpense({ ...req.body, accountId: req.user.accountId });
  res.status(httpStatus.CREATED).send(expense);
});

const getExpenses = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['accountId', 'propertyId', 'unitId', 'billId', 'categoryId', 'amount', 'expenseDate']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);
  const deleted = req.query.deleted || 'false'; // Default to 'false'

  if (req.user.role !== 'super_admin') {
    filter.accountId = req.user.accountId; // Ensure only properties for the user's account are fetched
  }

  const expenses = await expenseService.getAllExpenses(filter, options, deleted);
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
const restoreExpenseById = catchAsync(async (req, res) => {
  await expenseService.restoreExpense(req.params.id);
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
  restoreExpenseById,
  hardDeleteExpenseById,
};
