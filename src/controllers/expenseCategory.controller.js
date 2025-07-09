const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { expenseCategoryService } = require('../services');
const { Expense } = require('../models');

// Helper function to parse include query parameter
const parseInclude = (include) => {
  if (!include) {
    return []; // If no include string is provided, return an empty array
  }

  return (
    include
      .split('|')
      .map((item) => {
        // Destructure the item into modelName and attributesString.
        // If no colon is present, attributesString will be undefined.
        const [modelName, attributesString] = item.split(':');

        const modelMap = {
          expenses: Expense, // Your defined model mapping
        };

        const model = modelMap[modelName];

        // If the modelName doesn't exist in our map, return null.
        // This allows us to filter out invalid entries later.
        if (!model) {
          return null;
        }

        const includeOptions = {
          model,
          as: modelName,
          // You might consider adding 'required: false' here if you want LEFT JOINs by default
          // required: false,
        };

        // Conditionally add the 'attributes' property.
        // If attributesString is undefined, Sequelize will include all attributes by default.
        if (attributesString) {
          includeOptions.attributes = attributesString.split(',');
        }

        return includeOptions;
      })
      // Filter out any null entries that resulted from unknown model names
      .filter((item) => item !== null)
  );
};

const createExpenseCategory = catchAsync(async (req, res) => {
  if (req.user.role !== 'super_admin') {
    res.status(httpStatus.FORBIDDEN).send();
    return;
  }
  const category = await expenseCategoryService.createExpenseCategory(req.body);
  res.status(httpStatus.CREATED).send(category);
});

const getExpenseCategories = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'categoryType']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);
  const deleted = req.query.deleted || 'false'; // Default to 'false'

  const categories = await expenseCategoryService.getAllExpenseCategories(filter, options, deleted);
  res.send(categories);
});

const getExpenseCategoryById = catchAsync(async (req, res) => {
  const category = await expenseCategoryService.getExpenseCategoryById(req.params.id, parseInclude(req.query.include));
  res.send(category);
});

const updateExpenseCategoryById = catchAsync(async (req, res) => {
  if (req.user.role !== 'super_admin') {
    res.status(httpStatus.FORBIDDEN).send();
    return;
  }

  const category = await expenseCategoryService.updateExpenseCategory(req.params.id, req.body);
  res.send(category);
});

const deleteExpenseCategoryById = catchAsync(async (req, res) => {
  if (req.user.role !== 'super_admin') {
    res.status(httpStatus.FORBIDDEN).send();
    return;
  }
  await expenseCategoryService.deleteExpenseCategory(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});
const restoreExpenseCategoryById = catchAsync(async (req, res) => {
  if (req.user.role !== 'super_admin') {
    res.status(httpStatus.FORBIDDEN).send();
    return;
  }
  await expenseCategoryService.restoreExpenseCategory(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeleteExpenseCategoryById = catchAsync(async (req, res) => {
  if (req.user.role !== 'super_admin') {
    res.status(httpStatus.FORBIDDEN).send();
    return;
  }
  await expenseCategoryService.hardDeleteExpenseCategory(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createExpenseCategory,
  getExpenseCategories,
  getExpenseCategoryById,
  updateExpenseCategoryById,
  deleteExpenseCategoryById,
  restoreExpenseCategoryById,
  hardDeleteExpenseCategoryById,
};
