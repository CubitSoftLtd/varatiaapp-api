/* eslint-disable prettier/prettier */
const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { personalExpenseService } = require("../services");
const pick = require("../utils/pick");
const { ExpenseCategory, Beneficiary } = require("../models");

const parseInclude = (include) => {
  if (!include) return [];

  return include
    .split('|')
    .map((item) => {
      const [modelName, attributesString] = item.split(':'); // Destructure into distinct variables for clarity

      const modelMap = {
        category: ExpenseCategory, // Assuming 'category' maps to ExpenseCategory model
        beneficiary: Beneficiary, // Assuming 'category' maps to ExpenseCategory model
      };
      const model = modelMap[modelName];
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
      if (attributesString) {
        includeOptions.attributes = attributesString.split(',');
      }
      return includeOptions;
    })
    .filter((item) => item !== null); // Filter out any `null` entries created from unknown models
};
const createPersonalExpense = catchAsync(async (req, res) => {
  const expense = await personalExpenseService.createPersonalExpense({ ...req.body, accountId: req.user.accountId });
  res.status(httpStatus.CREATED).send(expense);
});

const getPersonalExpenses = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['accountId', 'beneficiaryId', 'expenseDate','categoryId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);
  const deleted = req.query.deleted || 'false'; // Default to 'false'

  if (req.user.role !== 'super_admin') {
    filter.accountId = req.user.accountId; // Ensure only properties for the user's account are fetched
  }

  const expenses = await personalExpenseService.getAllPersonalExpenses(filter, options, deleted);
  res.send(expenses);
});

const getPersonalExpenseById = catchAsync(async (req, res) => {
  const expense = await personalExpenseService.getPersonalExpenseById(req.params.id, parseInclude(req.query.include));
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