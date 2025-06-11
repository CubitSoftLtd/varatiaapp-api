const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { utilityTypeService } = require('../services');
const { Meter } = require('../models');

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
          meters: Meter,
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

const createUtilityType = catchAsync(async (req, res) => {
  const utilityType = await utilityTypeService.createUtilityType(req.body);
  res.status(httpStatus.CREATED).send(utilityType);
});

const getUtilityTypes = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'unitOfMeasurement']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);

  if (req.user.role !== 'super_admin') {
    filter.accountId = req.user.accountId; // Ensure only properties for the user's account are fetched
  }

  const utilityTypes = await utilityTypeService.getAllUtilityTypes(filter, options);
  res.send(utilityTypes);
});

const getUtilityTypeById = catchAsync(async (req, res) => {
  const utilityType = await utilityTypeService.getUtilityTypeById(req.params.id, parseInclude(req.query.include));
  res.send(utilityType);
});

const updateUtilityTypeById = catchAsync(async (req, res) => {
  const utilityType = await utilityTypeService.updateUtilityType(req.params.id, req.body);
  res.send(utilityType);
});

const deleteUtilityTypeById = catchAsync(async (req, res) => {
  await utilityTypeService.deleteUtilityType(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeleteUtilityTypeById = catchAsync(async (req, res) => {
  await utilityTypeService.hardDeleteUtilityType(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUtilityType,
  getUtilityTypes,
  getUtilityTypeById,
  updateUtilityTypeById,
  deleteUtilityTypeById,
  hardDeleteUtilityTypeById,
};
