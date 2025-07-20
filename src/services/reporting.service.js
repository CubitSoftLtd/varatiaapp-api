const { Op } = require('sequelize');
const moment = require('moment');
const { Bill, Payment, Expense, Lease, MaintenanceRequest, MeterCharge, Unit, Tenant } = require('../models');

// const getFinancialReport = async (filter) => {
//   const { startDate, endDate, propertyId } = filter;
//   const where = {};
//   if (startDate) where.createdAt = { [Op.gte]: new Date(startDate) };
//   if (endDate) where.createdAt = { [Op.lte]: new Date(endDate) };
//   if (propertyId) where.propertyId = propertyId;

//   const totalRevenue = (await Payment.sum('amountPaid', { where })) || 0;
//   const otherExpenses = (await Expense.sum('amount', { where })) || 0;
//   const meterCharges = (await MeterCharge.sum('amount', { where })) || 0;
//   const totalExpenses = otherExpenses + meterCharges;
//   const outstandingPayments =
//     (await Bill.sum('totalAmount', {
//       where: { paymentStatus: 'pending', ...where },
//     })) || 0;

//   return {
//     totalRevenue,
//     totalExpenses,
//     outstandingPayments,
//     profit: totalRevenue - totalExpenses,
//     generatedAt: new Date(),
//   };
// };
const getFinancialReport = async (filter) => {
  const { startDate, endDate, propertyId, accountId } = filter;
  const where = {};

  // Date range filter
  if (startDate) where.createdAt = { [Op.gte]: new Date(startDate) };
  if (endDate) {
    if (!where.createdAt) where.createdAt = {};
    where.createdAt[Op.lte] = new Date(endDate);
  }

  // Property ID filter
  if (propertyId) where.propertyId = propertyId;

  // Account ID filter
  if (accountId) where.accountId = accountId;

  // Revenues & expenses
  const totalRevenue = (await Payment.sum('amountPaid', { where })) || 0;
  const otherExpenses = (await Expense.sum('amount', { where })) || 0;
  const meterCharges = (await MeterCharge.sum('amount', { where })) || 0;
  const totalExpenses = otherExpenses + meterCharges;

  // ✅ Correct way to calculate outstanding payments:
  const bills = await Bill.findAll({
    where,
    attributes: ['totalAmount', 'amountPaid'],
  });

  let outstandingPayments = 0;
  for (const bill of bills) {
    const total = parseFloat(bill.totalAmount ?? '0');
    const paid = parseFloat(bill.amountPaid ?? '0');
    outstandingPayments += total - paid;
  }

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
// const getMonthlyRevenueExpenseReport = async (year) => {
//   const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

//   const result = Array.from({ length: 12 }, (_, i) => ({
//     month: monthNames[i],
//     revenue: 0,
//     expense: 0,
//   }));

//   // Fetch all payments within year
//   const payments = await Payment.findAll({
//     where: {
//       isDeleted: false,
//       createdAt: {
//         [Op.gte]: new Date(`${year}-01-01`),
//         [Op.lt]: new Date(`${parseInt(year) + 1}-01-01`),
//       },
//     },
//     attributes: ['amountPaid', 'createdAt'],
//     raw: true,
//   });

//   // Fetch all expenses within year
//   const expenses = await Expense.findAll({
//     where: {
//       isDeleted: false,
//       createdAt: {
//         [Op.gte]: new Date(`${year}-01-01`),
//         [Op.lt]: new Date(`${parseInt(year) + 1}-01-01`),
//       },
//     },
//     attributes: ['amount', 'createdAt'],
//     raw: true,
//   });

//   // Map payments to months
//   for (const p of payments) {
//     const monthIndex = new Date(p.createdAt).getMonth();
//     result[monthIndex].revenue += parseFloat(p.amountPaid);
//   }

//   // Map expenses to months
//   for (const e of expenses) {
//     const monthIndex = new Date(e.createdAt).getMonth();
//     result[monthIndex].expense += parseFloat(e.amount);
//   }

//   return {
//     year: parseInt(year),
//     data: result,
//     generatedAt: new Date(),
//   };
// };
const getMonthlyRevenueExpenseReport = async ({ year, accountId }) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const result = Array.from({ length: 12 }, (_, i) => ({
    month: monthNames[i],
    revenue: 0,
    expense: 0,
  }));

  const startOfYear = new Date(`${year}-01-01`);
  const startOfNextYear = new Date(`${parseInt(year) + 1}-01-01`);
  const whereClause = {
    isDeleted: false,
    accountId,
    createdAt: {
      [Op.gte]: startOfYear,
      [Op.lt]: startOfNextYear,
    },
  };
  // Fetch all payments within year
  const payments = await Payment.findAll({
    where: whereClause,
    attributes: ['amountPaid', 'createdAt'],
    raw: true,
  });

  // Fetch all expenses within year
  const expenses = await Expense.findAll({
    where: whereClause,
    attributes: ['amount', 'createdAt'],
    raw: true,
  });

  // ✅ Fetch all meter charges within year
  const meterCharges = await MeterCharge.findAll({
    where: whereClause,
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

  // ✅ Map meter charges to months
  for (const m of meterCharges) {
    const monthIndex = new Date(m.createdAt).getMonth();
    result[monthIndex].expense += parseFloat(m.amount);
  }

  return {
    year: parseInt(year),
    data: result,
    generatedAt: new Date(),
  };
};

const getTenantHistoryReport = async (filter) => {
  const { tenantId, startDate, endDate } = filter;

  if (!tenantId) {
    throw new Error('tenantId is required');
  }

  const where = { tenantId };

  if (startDate && endDate) {
    where.createdAt = {
      [Op.gte]: new Date(startDate),
      [Op.lte]: new Date(endDate),
    };
  }

  const [leases, payments, bills] = await Promise.all([
    Lease.findAll({
      where,
      include: [
        {
          model: Unit,
          as: 'unit',
          attributes: ['id', 'name'], // unit name
        },
      ],
    }),
    Payment.findAll({
      where,
      include: [
        {
          model: Bill,
          as: 'bill',
          attributes: ['id', 'invoiceNo'],
        },
      ],
    }),
    Bill.findAll({ where }),
  ]);
  const tenant = await Tenant.findByPk(tenantId, {
    attributes: ['id', 'name', 'depositAmount'],
  });
  // const lease = await Lease.findByPk(tenantId, {
  //   attributes: ['id', 'name', 'depositAmount'],
  // });
  return {
    tenantId: tenant.id,
    tenantName: tenant.name,
    period: startDate && endDate ? `${startDate} to ${endDate}` : 'All Time',
    leases: leases.map((l) => ({
      id: l.id,
      unitId: l.unitId,
      unitName: l.unit?.name,
      status: l.status,
      leaseStartDate: l.leaseStartDate,
      leaseEndDate: l.leaseEndDate,
      moveInDate: l.moveInDate,
      moveOutDate: l.moveOutDate,
    })),
    payments: payments.map((p) => ({
      id: p.id,
      billId: p.billId,
      billInvoiceNo: p.bill?.invoiceNo,
      billTotalAmount: p.bill?.totalAmount,
      paymentMethod: p.paymentMethod,
      paymentDate: p.paymentDate,
      amountPaid: p.amountPaid,
    })),
    bills: bills.map((b) => ({
      id: b.id,
      invoiceNo: b.invoiceNo,
      billingPeriodStart: b.billingPeriodStart,
      billingPeriodEnd: b.billingPeriodEnd,
      rentAmount: b.rentAmount,
      totalUtilityAmount: b.totalUtilityAmount,
      otherChargesAmount: b.otherChargesAmount,
      totalAmount: b.totalAmount,
      amountPaid: b.amountPaid,
      tenantName: b.tenant?.fullName,
    })),
    generatedAt: new Date(),
  };
};

const getBillPaymentPieByYear = async ({ year, accountId }) => {
  const whereClause = {
    isDeleted: false,
    accountId,
  };

  if (year) {
    whereClause.billingPeriodStart = {
      [Op.between]: [`${year}-01-01`, `${year}-12-31`],
    };
  }

  const bills = await Bill.findAll({
    where: whereClause,
    attributes: ['amountPaid', 'totalAmount'],
  });

  let totalPaid = 0;
  let totalAmountOfBill = 0;

  for (const bill of bills) {
    totalAmountOfBill += parseFloat(bill.totalAmount ?? '0'); // amountPaid is string
    totalPaid += parseFloat(bill.amountPaid ?? '0'); // amountPaid is string
  }
  const totalOutStanding = totalAmountOfBill - totalPaid;
  const paidPercentage = totalAmountOfBill > 0 ? (totalPaid / totalAmountOfBill) * 100 : 0;
  const outstandingPercentage = totalAmountOfBill > 0 ? (totalOutStanding / totalAmountOfBill) * 100 : 0;

  return [
    { name: 'Paid', value: parseFloat(paidPercentage.toFixed(2)) },
    { name: 'Outstanding', value: parseFloat(outstandingPercentage.toFixed(2)) },
  ];
};

module.exports = {
  getFinancialReport,
  getTenantActivityReport,
  getMonthlyRevenueExpenseReport,
  getTenantHistoryReport,
  getBillPaymentPieByYear,
};
