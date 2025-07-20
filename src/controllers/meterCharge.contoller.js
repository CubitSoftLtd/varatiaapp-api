const httpStatus = require('http-status');
const { MeterCharge, Meter, Property } = require('../models');
const { meterChargeService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');

const parseInclude = (include) => {
  if (!include || typeof include !== 'string') {
    return [];
  }

  const modelMap = {
    meter: Meter,
    property: Property,
  };

  const includes = include
    .split('|')
    .map((item) => {
      const [modelName, attributesString] = item.split(':');
      const model = modelMap[modelName];
      if (!model) {
        return null;
      }
      if (!MeterCharge?.associations[modelName]) {
        return null;
      }
      const includeOptions = {
        model,
        as: modelName,
        required: false, // LEFT JOIN to still return Tenant
      };
      if (attributesString) includeOptions.attributes = attributesString.split(',');
      return includeOptions;
    })
    .filter(Boolean);

  return includes;
};

const createMeterCharge = catchAsync(async (req, res) => {
  const meterCharge = await meterChargeService.createMeterCharge({ ...req.body, accountId: req.user.accountId });
  res.status(httpStatus.CREATED).send(meterCharge);
});

const getMeterCharges = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['propertyId', 'meterId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);
  const deleted = req.query.deleted || 'false';
  if (req.user.role !== 'super_admin') filter.accountId = req.user.accountId;

  const meterCharges = await meterChargeService.getAllMeterCharge(filter, options, deleted);
  res.send(meterCharges);
});

const getMeterChargeById = catchAsync(async (req, res) => {
  const includes = parseInclude(req.query.include);
  const tenant = await meterChargeService.getMeterCharge(req.params.id, includes);
  res.send(tenant);
});

const updateMeterChargeById = catchAsync(async (req, res) => {
  const tenant = await meterChargeService.updateMeterCharge(req.params.id, req.body);
  res.send(tenant);
});

const deleteMeterChargeById = catchAsync(async (req, res) => {
  await meterChargeService.deleteMeterCharge(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});
const restoreMeterChargeById = catchAsync(async (req, res) => {
  await meterChargeService.restoreMeterCharge(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeleteMeterChargeById = catchAsync(async (req, res) => {
  await meterChargeService.hardDeleteMeterCharge(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createMeterCharge,
  getMeterCharges,
  getMeterChargeById,
  updateMeterChargeById,
  deleteMeterChargeById,
  restoreMeterChargeById,
  hardDeleteMeterChargeById,
};
