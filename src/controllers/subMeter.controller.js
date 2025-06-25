const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { subMeterService } = require('../services');
const { Meter, Unit } = require('../models');

// Helper function to parse include query parameter
const parseInclude = (include) => {
  // If no include string is provided, just return an empty array.
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
          meter: Meter,
          unit: Unit,
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
          // Consider adding 'required: false' here if you generally want LEFT JOINs (outer joins)
          // required: false,
        };

        // ONLY add the 'attributes' property if 'attributesString' is defined.
        // If 'attributesString' is undefined, Sequelize will include all attributes by default,
        // which is typically what you want when no specific attributes are requested.
        if (attributesString) {
          includeOptions.attributes = attributesString.split(',');
        }

        return includeOptions;
      })
      // Filter out any 'null' entries that resulted from unknown model names.
      .filter((item) => item !== null)
  );
};

const createSubmeter = catchAsync(async (req, res) => {
  const submeter = await subMeterService.createSubmeter({ ...req.body, accountId: req.user.accountId });
  res.status(httpStatus.CREATED).send(submeter);
});

const getSubmeters = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['number', 'status', 'meterId', 'unitId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);
  const deleted = req.query.deleted || 'false'; // Default to 'false'

  if (req.user.role !== 'super_admin') {
    filter.accountId = req.user.accountId; // Ensure only properties for the user's account are fetched
  }

  const submeters = await subMeterService.getSubmeters(filter, options, deleted);
  res.send(submeters);
});

const getSubmeterById = catchAsync(async (req, res) => {
  const submeter = await subMeterService.getSubmeter(req.params.id, parseInclude(req.query.include));
  res.send(submeter);
});

const updateSubmeterById = catchAsync(async (req, res) => {
  const submeter = await subMeterService.updateSubmeter(req.params.id, req.body);
  res.send(submeter);
});

const deleteSubmeterById = catchAsync(async (req, res) => {
  await subMeterService.deleteSubmeter(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeleteSubmeterById = catchAsync(async (req, res) => {
  await subMeterService.hardDeleteSubmeter(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSubmeter,
  getSubmeters,
  getSubmeterById,
  updateSubmeterById,
  deleteSubmeterById,
  hardDeleteSubmeterById,
};
