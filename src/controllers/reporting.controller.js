const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { reportingService } = require('../services');

const getFinancialReport = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['startDate', 'endDate', 'propertyId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
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
  const filter = pick(req.query, ['year']);
  const year = filter.year || new Date().getFullYear();
  const report = await reportingService.getMonthlyRevenueExpenseReport(year);
  res.send(report);
});

module.exports = {
  getFinancialReport,
  getTenantActivityReport,
  getMonthlyRevenueExpenseReport,
};
