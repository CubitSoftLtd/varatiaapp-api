const httpStatus = require('http-status');
const { Tenant, Unit, Lease, Submeter, Property } = require('../models');
const { leaseService, meterReadingService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');

// Helper function to parse include query parameter
const parseInclude = (include) => {
  if (!include || typeof include !== 'string') {
    return [];
  }

  const modelMap = {
    unit: Unit,
    tenant: Tenant,
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
      if (!Lease?.associations[modelName]) {
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

const createLease = catchAsync(async (req, res) => {
  const lease = await leaseService?.createLease({ ...req.body, accountId: req.user.accountId });

  if (lease && lease.unitId && lease.startedMeterReading && lease.leaseStartDate) {
    const submeter = await Submeter.findOne({
      where: { unitId: lease.unitId },
      attributes: ['id', 'meterId'],
    });

    await meterReadingService.createMeterReading({
      meterId: submeter.meterId,
      submeterId: submeter.id,
      readingValue: lease.startedMeterReading,
      readingDate: lease.leaseStartDate,
      accountId: req.user.accountId,
      createdBy: req.user.id,
    });
  }
  res.status(httpStatus.CREATED).send(lease);
});

const getLeases = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['unitId', 'tenantId', 'propertyId', 'status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);
  if (req.user.role !== 'super_admin') filter.accountId = req.user.accountId;

  const leases = await leaseService?.getAllLeases(filter, options);
  res.send(leases);
});

const getLeaseById = catchAsync(async (req, res) => {
  const includes = parseInclude(req.query.include);
  const tenant = await leaseService.getLeaseById(req.params.id, includes);
  res.send(tenant);
});

const updateLeaseById = catchAsync(async (req, res) => {
  const tenant = await leaseService.updateLease(req.params.id, req.body);
  res.send(tenant);
});

const deleteLeaseById = catchAsync(async (req, res) => {
  await leaseService.deleteLease(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});
const restoreLeaseById = catchAsync(async (req, res) => {
  await leaseService.restoreLease(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeleteLeaseById = catchAsync(async (req, res) => {
  await leaseService.hardDeleteLease(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});
const terminateLeaseController = catchAsync(async (req, res) => {
  const updatedLease = await leaseService.terminateLease(req.params.id);
  res.send(updatedLease);
});
module.exports = {
  createLease,
  getLeases,
  getLeaseById,
  updateLeaseById,
  deleteLeaseById,
  restoreLeaseById,
  hardDeleteLeaseById,
  terminateLeaseController,
};
