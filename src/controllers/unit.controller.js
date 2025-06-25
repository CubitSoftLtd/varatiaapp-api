const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { unitService } = require('../services');
const { Property, Tenant, Bill, Submeter, Expense } = require('../models');

// Helper function to parse include query parameter
const parseInclude = (include) => {
  // If no include string is provided, simply return an empty array.
  if (!include) {
    return [];
  }

  return (
    include
      .split('|') // Split the include string by '|' to process each individual item.
      .map((item) => {
        // Destructure each item into the model name string and the attributes string.
        // If there's no colon (':'), 'attributesString' will be undefined.
        const [modelName, attributesString] = item.split(':');

        // Define your map from string keys to actual Sequelize model objects.
        const modelMap = {
          property: Property,
          tenants: Tenant,
          bills: Bill,
          submeters: Submeter,
          expenses: Expense,
        };

        // Get the Sequelize model from the map.
        const model = modelMap[modelName];

        // If the model name isn't found in your map, log a warning and return null.
        // This item will be filtered out in the next step.
        if (!model) {
          return null;
        }

        // Build the Sequelize include options object.
        const includeOptions = {
          model,
          as: modelName, // The alias for the association.
          // Consider setting 'required: false' here if you generally want LEFT JOINs (outer joins).
          // required: false,
        };

        // ONLY add the 'attributes' property if 'attributesString' is defined.
        // If 'attributesString' is undefined, Sequelize will include all attributes by default.
        if (attributesString) {
          includeOptions.attributes = attributesString.split(',');
        }

        return includeOptions;
      })
      // Filter out any 'null' entries that resulted from unknown model names.
      .filter((item) => item !== null)
  );
};

const createUnit = catchAsync(async (req, res) => {
  const unit = await unitService.createUnit({ ...req.body, accountId: req.user.accountId });
  res.status(httpStatus.CREATED).send(unit);
});

const getUnits = catchAsync(async (req, res) => {
  // Extract query parameters for filtering and pagination/sorting options
  const filter = pick(req.query, [
    'name',
    'propertyId',
    'rentAmount',
    'status',
    'bedroomCount',
    'bathroomCount',
    'squareFootage',
  ]);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include); // Custom function to parse include query
  const deleted = req.query.deleted || 'false'; // Default to 'false'

  // Restrict units to the user's account for non-super_admin users
  if (req.user.role !== 'super_admin') {
    // Safety check: Ensure accountId exists on req.user
    if (!req.user.accountId) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Account ID is required');
    }
    // Directly filter by accountId since it’s a field on Unit
    filter.accountId = req.user.accountId;
  }

  // Fetch units using a service layer (assumed to handle Sequelize queries)
  const units = await unitService.getAllUnits(filter, options, deleted);
  res.send(units);
});

const getUnitById = catchAsync(async (req, res) => {
  const unit = await unitService.getUnitById(req.params.id, parseInclude(req.query.include));
  res.send(unit);
});

const updateUnitById = catchAsync(async (req, res) => {
  const unit = await unitService.updateUnit(req.params.id, req.body);
  res.send(unit);
});

const deleteUnitById = catchAsync(async (req, res) => {
  await unitService.deleteUnit(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeleteUnitById = catchAsync(async (req, res) => {
  await unitService.hardDeleteUnit(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUnit,
  getUnits,
  getUnitById,
  updateUnitById,
  deleteUnitById,
  hardDeleteUnitById,
};
