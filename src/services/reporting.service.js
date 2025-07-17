const { Op } = require('sequelize');
const { Bill, Payment, Expense, Lease, MaintenanceRequest } = require('../models');

const getFinancialReport = async (filter) => {
  const { startDate, endDate, propertyId } = filter;
  const where = {};
  if (startDate) where.createdAt = { [Op.gte]: new Date(startDate) };
  if (endDate) where.createdAt = { [Op.lte]: new Date(endDate) };
  if (propertyId) where.propertyId = propertyId;

  const totalRevenue = (await Payment.sum('amountPaid', { where })) || 0;
  const totalExpenses = (await Expense.sum('amount', { where })) || 0;
  const outstandingPayments =
    (await Bill.sum('totalAmount', {
      where: { paymentStatus: 'pending', ...where },
    })) || 0;

  return {
    totalRevenue,
    totalExpenses,
    outstandingPayments,
    profit: totalRevenue - totalExpenses,
    generatedAt: new Date(),
  };
};

const getTenantActivityReport = async (filter) => {
  const { startDate, endDate, tenantId, unitId } = filter;
  const where = {};
  if (startDate) where.createdAt = { [Op.gte]: new Date(startDate) };
  if (endDate) where.createdAt = { [Op.lte]: new Date(endDate) };
  if (tenantId) where.tenantId = tenantId;
  if (unitId) where.unitId = unitId;

  const leases = await Lease?.findAll({ where });
  const payments = await Payment?.findAll({ where });
  const maintenanceRequests = await MaintenanceRequest?.findAll({ where });

  return {
    leases: leases?.map((l) => ({
      id: l.id,
      status: l.status,
      startDate: l.startDate,
      endDate: l.endDate,
    })),
    payments: payments?.map((p) => ({
      id: p.id,
      amount: p.amount,
      paymentDate: p.paymentDate,
    })),
    maintenanceRequests: maintenanceRequests?.map((m) => ({
      id: m.id,
      description: m.description,
      status: m.status,
    })),
    generatedAt: new Date(),
  };
};
const getMonthlyRevenueExpenseReport = async (year) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const result = Array.from({ length: 12 }, (_, i) => ({
    month: monthNames[i],
    revenue: 0,
    expense: 0,
  }));

  // Fetch all payments within year
  const payments = await Payment.findAll({
    where: {
      isDeleted: false,
      createdAt: {
        [Op.gte]: new Date(`${year}-01-01`),
        [Op.lt]: new Date(`${parseInt(year) + 1}-01-01`),
      },
    },
    attributes: ['amountPaid', 'createdAt'],
    raw: true,
  });

  // Fetch all expenses within year
  const expenses = await Expense.findAll({
    where: {
      isDeleted: false,
      createdAt: {
        [Op.gte]: new Date(`${year}-01-01`),
        [Op.lt]: new Date(`${parseInt(year) + 1}-01-01`),
      },
    },
    attributes: ['amount', 'createdAt'],
    raw: true,
  });

  // Map payments to months
  for (const p of payments) {
    const monthIndex = new Date(p.createdAt).getMonth();
    result[monthIndex].revenue += parseFloat(p.amountPaid);
  }

  // Map expenses to months
  for (const e of expenses) {
    const monthIndex = new Date(e.createdAt).getMonth();
    result[monthIndex].expense += parseFloat(e.amount);
  }

  return {
    year: parseInt(year),
    data: result,
    generatedAt: new Date(),
  };
};
module.exports = {
  getFinancialReport,
  getTenantActivityReport,
  getMonthlyRevenueExpenseReport,
};
