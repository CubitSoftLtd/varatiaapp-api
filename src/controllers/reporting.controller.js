/* eslint-disable prettier/prettier */
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { reportingService } = require('../services');

const getFinancialReport = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['startDate', 'endDate', 'propertyId', 'accountId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (req.user.role !== 'super_admin') {
    filter.accountId = req.user.accountId;
  }
  const report = await reportingService.getFinancialReport(filter, options);
  res.send(report);
});

const getTenantActivityReport = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['startDate', 'endDate', 'tenantId', 'unitId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const report = await reportingService.getTenantActivityReport(filter, options);
  res.send(report);
});
const getMonthlyRevenueExpenseReport = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['year', 'accountId']);
  const year = filter.year || new Date().getFullYear();
  if (req.user.role !== 'super_admin') {
    filter.accountId = req.user.accountId;
  }
  const report = await reportingService.getMonthlyRevenueExpenseReport(filter);
  res.send(report);
});
const getTenantHistoryReportController = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['tenantId', 'leaseId']); // ✅ শুধুমাত্র tenantId ও leaseId
  const report = await reportingService.getTenantHistoryReport(filter);
  res.send(report);
});

const getBillPaymentPieByYear = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['year']);
  if (req.user.role !== 'super_admin') {
    filter.accountId = req.user.accountId;
  }
  const data = await reportingService.getBillPaymentPieByYear(filter);
  res.send(data);
});

const getMeterRechargeReport = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['propertyId', 'meterId', 'startDate', 'endDate']);
  if (!filter.propertyId) {
    return res.status(400).send({ message: 'propertyId is required' });
  }
  if (!filter.startDate || !filter.endDate) {
    return res.status(400).send({ message: 'startDate and endDate are required' });
  }
  if (req.user.role !== 'super_admin') {
    filter.accountId = req.user.accountId;
  }
  const startDate = new Date(filter.startDate);
  const endDate = new Date(filter.endDate);
  const report = await reportingService.getMeterRechargeReportByProperty({
    ...filter,
    startDate,
    endDate,
  });

  res.send(report);
});
const getSubmeterConsumptionReport = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['propertyId', 'meterId', 'startDate', 'endDate']);

  if (!filter.propertyId || !filter.meterId || !filter.startDate || !filter.endDate) {
    return res.status(400).send({ message: 'propertyId, meterId, startDate and endDate are required' });
  }

  if (req.user.role !== 'super_admin') {
    filter.accountId = req.user.accountId;
  }

  const report = await reportingService.getSubmeterConsumptionReport(filter);
  res.send(report);
});
const getBillsByPropertyAndDateRange = catchAsync(async (req, res) => {
const { propertyId } = req.query
  const filter = pick(req.query, ['startDate', 'endDate']);

  // role অনুযায়ী accountId filter দিতে চাইলে uncomment করুন
  if (req.user.role !== 'super_admin') {
    filter.accountId = req.user.accountId;
  }

  if (!filter.startDate || !filter.endDate) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: 'startDate and endDate query parameters are required',
    });
  }

  const result = await reportingService.generateBillsByPropertyAndDateRange(
    propertyId,
    filter.startDate,
    filter.endDate,
    filter.accountId
  );

  res.status(httpStatus.OK).send(result);
});
const getPersonalExpenseReportC = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['beneficiary', 'startDate', 'endDate']);

  if (!filter.beneficiary ||!filter.startDate || !filter.endDate) {
    return res.status(400).send({ message: 'propertyId, meterId, startDate and endDate are required' });
  }

  if (req.user.role !== 'super_admin') {
    filter.accountId = req.user.accountId;
  }

  const report = await reportingService.getPersonalExpenseReport(filter);
  res.send(report);
});
module.exports = {
  getFinancialReport,
  getTenantActivityReport,
  getMonthlyRevenueExpenseReport,
  getTenantHistoryReportController,
  getBillPaymentPieByYear,
  getMeterRechargeReport,
  getSubmeterConsumptionReport,
  getBillsByPropertyAndDateRange,
  getPersonalExpenseReportC,
  
};
