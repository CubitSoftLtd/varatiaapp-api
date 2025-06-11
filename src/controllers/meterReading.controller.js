const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { meterReadingService } = require('../services');
const { Meter, Submeter, User } = require('../models');

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
        // If no ':' is present (e.g., "meter"), attributesString will be undefined.
        const [modelName, attributesString] = item.split(':');

        // Define your model mapping.
        const modelMap = {
          meter: Meter,
          submeter: Submeter,
          user: User,
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
          // Conditionally set the 'as' alias for the 'user' model.
          as: modelName === 'user' ? 'enteredByUser' : modelName,
          // Consider setting 'required: false' here if you generally want LEFT JOINs by default
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
const createMeterReading = catchAsync(async (req, res) => {
  const meterReading = await meterReadingService.createMeterReading(req.body);
  res.status(httpStatus.CREATED).send(meterReading);
});

const getMeterReadings = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['meterId', 'submeterId', 'readingDate', 'enteredByUserId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);

  if (req.user.role !== 'super_admin') {
    filter.accountId = req.user.accountId; // Ensure only properties for the user's account are fetched
  }

  const meterReadings = await meterReadingService.getAllMeterReadings(filter, options);
  res.send(meterReadings);
});

const getMeterReadingById = catchAsync(async (req, res) => {
  const meterReading = await meterReadingService.getMeterReadingById(req.params.id, parseInclude(req.query.include));
  res.send(meterReading);
});

const updateMeterReadingById = catchAsync(async (req, res) => {
  const meterReading = await meterReadingService.updateMeterReading(req.params.id, req.body);
  res.send(meterReading);
});

const deleteMeterReadingById = catchAsync(async (req, res) => {
  await meterReadingService.deleteMeterReading(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeleteMeterReadingById = catchAsync(async (req, res) => {
  await meterReadingService.hardDeleteMeterReading(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const calculateConsumption = catchAsync(async (req, res) => {
  const { meterId, submeterId, startDate, endDate } = req.body;
  const consumption = await meterReadingService.calculateConsumption(meterId, submeterId, startDate, endDate);
  res.send({ consumption });
});

module.exports = {
  createMeterReading,
  getMeterReadings,
  getMeterReadingById,
  updateMeterReadingById,
  deleteMeterReadingById,
  hardDeleteMeterReadingById,
  calculateConsumption,
};
