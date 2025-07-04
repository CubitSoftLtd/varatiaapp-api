const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { meterService } = require('../services');
const { Property, UtilityType, Submeter, MeterReading } = require('../models');

// Helper function to parse include query parameter
const parseInclude = (include) => {
  // If no include string is provided, return an empty array.
  if (!include) {
    return [];
  }

  return (
    include
      .split('|') // Split the include string by '|' to get individual include items.
      .map((item) => {
        // Destructure each item into modelName and attributesString.
        // If no ':' is present, attributesString will be undefined.
        const [modelName, attributesString] = item.split(':');

        // Define your model mapping.
        const modelMap = {
          property: Property,
          utilityType: UtilityType,
          submeters: Submeter,
          readings: MeterReading,
        };

        // Get the actual Sequelize model from the map.
        const model = modelMap[modelName];

        // If the model name is not found in the map, log a warning and return null.
        // This item will be filtered out later.
        if (!model) {
          return null;
        }

        // Initialize the include options object.
        const includeOptions = {
          model,
          as: modelName,
          // Consider setting 'required: false' here if you generally want LEFT JOINs
          // required: false,
        };

        // Only add the 'attributes' property if attributesString is defined.
        // If attributesString is undefined, Sequelize will include all attributes by default.
        if (attributesString) {
          includeOptions.attributes = attributesString.split(',');
        }

        return includeOptions;
      })
      // Filter out any null entries that resulted from unknown model names.
      .filter((item) => item !== null)
  );
};

const createMeter = catchAsync(async (req, res) => {
  const meter = await meterService.createMeter({ ...req.body, accountId: req.user.accountId });
  res.status(httpStatus.CREATED).send(meter);
});

const getMeters = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['number', 'status', 'propertyId', 'utilityTypeId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);
  const deleted = req.query.deleted || 'false'; // Default to 'false'

  if (req.user.role !== 'super_admin') {
    filter.accountId = req.user.accountId; // Ensure only properties for the user's account are fetched
  }

  const meters = await meterService.getAllMeters(filter, options, deleted);
  res.send(meters);
});

const getMeterById = catchAsync(async (req, res) => {
  const meter = await meterService.getMeterById(req.params.id, parseInclude(req.query.include));
  res.send(meter);
});

const updateMeterById = catchAsync(async (req, res) => {
  const meter = await meterService.updateMeter(req.params.id, req.body);
  res.send(meter);
});

const deleteMeterById = catchAsync(async (req, res) => {
  await meterService.deleteMeter(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});
const restoreMeterById = catchAsync(async (req, res) => {
  await meterService.restoreMeter(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeleteMeterById = catchAsync(async (req, res) => {
  await meterService.hardDeleteMeter(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createMeter,
  getMeters,
  getMeterById,
  updateMeterById,
  deleteMeterById,
  restoreMeterById,
  hardDeleteMeterById,
};
