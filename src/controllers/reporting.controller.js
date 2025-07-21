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
module.exports = {
  getFinancialReport,
  getTenantActivityReport,
  getMonthlyRevenueExpenseReport,
  getTenantHistoryReportController,
  getBillPaymentPieByYear,
};
