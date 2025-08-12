/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable prettier/prettier */
const { Op, fn, col } = require('sequelize');
const moment = require('moment');
const httpStatus = require('http-status');
const { Bill, Payment, Expense, Lease, MaintenanceRequest, MeterCharge, Unit, Tenant, Property, Meter, Sequelize, MeterReading, UtilityType, Submeter } = require('../models');
const ApiError = require('../utils/ApiError');

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
  const totalExpenses = (await Expense.sum('amount', { where })) || 0;
  // const meterCharges = (await MeterCharge.sum('amount', { where })) || 0;
  // const totalExpenses = otherExpenses + meterCharges;

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

// const getTenantHistoryReport = async (filter) => {
//   const { tenantId, leaseId } = filter;

//   if (!tenantId) {
//     throw new Error('tenantId is required');
//   }

//   const baseWhere = { tenantId };
//   if (leaseId) {
//     baseWhere.id = leaseId;
//   }

//   const [leases, payments, bills] = await Promise.all([
//     Lease.findAll({
//       where: baseWhere,
//       attributes: [
//         'id',
//         'unitId',
//         'status',
//         'leaseStartDate',
//         'leaseEndDate',
//         'moveInDate',
//         'moveOutDate',
//       ],
//       include: [
//         {
//           model: Unit,
//           as: 'unit',
//           attributes: ['id', 'name'],
//         },
//       ],
//       order: [['createdAt', 'DESC']],
//     }),

//     Payment.findAll({
//       where: { tenantId },
//       include: [
//         {
//           model: Bill,
//           as: 'bill',
//           attributes: ['id', 'invoiceNo', 'issueDate'],
//         },
//       ],
//     }),

//     Bill.findAll({ where: { tenantId } }),
//   ]);

//   const tenant = await Tenant.findByPk(tenantId, {
//     attributes: ['id', 'name', 'depositAmount'],
//   });

//   const totalBillAmount = bills.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);
//   const totalUtilityAmount = bills.reduce((sum, b) => sum + parseFloat(b.totalUtilityAmount || 0), 0);
//   const totalRentAmount = bills.reduce((sum, b) => sum + parseFloat(b.rentAmount || 0), 0);
//   const totalOtherCharges = bills.reduce((sum, b) => sum + parseFloat(b.otherChargesAmount || 0), 0);
//   const totalBalanceDue = bills.reduce((sum, b) => sum + parseFloat(b.balanceDue || 0), 0);
//   const totalPaidAmount = payments.reduce((sum, p) => sum + parseFloat(p.amountPaid || 0), 0);

//   const lease = leases[0] || null;

//   return {
//     tenantId: tenant.id,
//     tenantName: tenant.name,
//     depositAmount: tenant.depositAmount,
//     period: leaseId ? `Lease ID: ${leaseId}` : 'All Time',

//     // Flattened lease info
//     leaseId: lease?.id ?? null,
//     leaseStatus: lease?.status ?? null,
//     leaseStartDate: lease?.leaseStartDate ?? null,
//     leaseEndDate: lease?.leaseEndDate ?? null,
//     moveInDate: lease?.moveInDate ?? null,
//     moveOutDate: lease?.moveOutDate ?? null,
//     unitId: lease?.unitId ?? null,
//     unitName: lease?.unit?.name ?? null,

//     totalBillAmount,
//     totalUtilityAmount,
//     totalRentAmount,
//     totalOtherCharges,
//     totalPaidAmount,
//     totalBalanceDue,

//     payments: payments.map((p) => ({
//       id: p.id,
//       billId: p.billId,
//       billInvoiceNo: p.bill?.invoiceNo,
//       billTotalAmount: p.bill?.totalAmount,
//       paymentMethod: p.paymentMethod,
//       transactionId: p.transactionId,
//       paymentDate: p.paymentDate,
//       amountPaid: p.amountPaid,
//       bills: {
//         id: p.bill.id,
//         fullInvoiceNumber: `INV-${new Date(p.bill.issueDate).getFullYear()}-${String(p.bill.invoiceNo).padStart(4, '0')}`,
//       },
//     })),

//     bills: bills.map((b) => ({
//       id: b.id,
//       invoiceNo: b.invoiceNo,
//       fullInvoiceNumber: `INV-${new Date(b.issueDate).getFullYear()}-${String(b.invoiceNo).padStart(4, '0')}`,
//       billingPeriodStart: b.billingPeriodStart,
//       billingPeriodEnd: b.billingPeriodEnd,
//       rentAmount: b.rentAmount,
//       totalUtilityAmount: b.totalUtilityAmount,
//       otherChargesAmount: b.otherChargesAmount,
//       totalAmount: b.totalAmount,
//       amountPaid: b.amountPaid,
//       balanceDue: b.balanceDue,
//       tenantName: b.tenant?.fullName,
//     })),

//     generatedAt: new Date(),
//   };
// };

const getTenantHistoryReport = async (filter) => {
  const { tenantId, leaseId } = filter;

  if (!tenantId) {
    throw new Error('tenantId is required');
  }

  let lease = null;
  let unitId = null;

  // 🔍 Step 1: Load selected lease to extract unitId
  if (leaseId) {
    lease = await Lease.findOne({
      where: {
        id: leaseId,
        tenantId,
      },
      include: [
        {
          model: Unit,
          as: 'unit',
          attributes: ['id', 'name'],
        },
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!lease) {
      throw new Error('Lease not found or does not belong to tenant');
    }

    unitId = lease.unitId;
  }

  // 🔍 Step 2: Filter bills by tenantId and (optional) unitId
  const billWhere = { tenantId };
  if (unitId) {
    billWhere.unitId = unitId;
  }

  const bills = await Bill.findAll({
    where: billWhere,
  });

  // 🔍 Step 3: Filter payments by billId in found bills
  const billIds = bills.map((b) => b.id);

  const payments = await Payment.findAll({
    where: {
      tenantId,
      billId: {
        [Op.in]: billIds.length ? billIds : [null], // avoid empty IN ()
      },
    },
    include: [
      {
        model: Bill,
        as: 'bill',
        attributes: ['id', 'invoiceNo', 'issueDate', 'totalAmount'],
      },
    ],
  });

  const tenant = await Tenant.findByPk(tenantId, {
    attributes: ['id', 'name', 'depositAmount'],
  });

  const totalBillAmount = bills.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);
  const totalUtilityAmount = bills.reduce((sum, b) => sum + parseFloat(b.totalUtilityAmount || 0), 0);
  const totalRentAmount = bills.reduce((sum, b) => sum + parseFloat(b.rentAmount || 0), 0);
  const totalOtherCharges = bills.reduce((sum, b) => sum + parseFloat(b.otherChargesAmount || 0), 0);
  const totalBalanceDue = bills.reduce((sum, b) => sum + parseFloat(b.balanceDue || 0), 0);
  const totalPaidAmount = payments.reduce((sum, p) => sum + parseFloat(p.amountPaid || 0), 0);

  return {
    tenantId: tenant.id,
    tenantName: tenant.name,
    depositAmount: tenant.depositAmount,
    period: leaseId ? `Lease ID: ${leaseId}` : 'All Time',

    leaseId: lease?.id ?? null,
    leaseStatus: lease?.status ?? null,
    leaseStartDate: lease?.leaseStartDate ?? null,
    leaseEndDate: lease?.leaseEndDate ?? null,
    moveInDate: lease?.moveInDate ?? null,
    moveOutDate: lease?.moveOutDate ?? null,
    unitId: lease?.unitId ?? null,
    unitName: lease?.unit?.name ?? null,
    property: lease?.property?.name ?? null,

    totalBillAmount,
    totalUtilityAmount,
    totalRentAmount,
    totalOtherCharges,
    totalPaidAmount,
    totalBalanceDue,

    payments: payments.map((p) => ({
      id: p.id,
      billId: p.billId,
      billInvoiceNo: p.bill?.invoiceNo,
      billTotalAmount: p.bill?.totalAmount,
      paymentMethod: p.paymentMethod,
      transactionId: p.transactionId,
      paymentDate: p.paymentDate,
      amountPaid: p.amountPaid,
      bills: {
        id: p.bill.id,
        fullInvoiceNumber: `INV-${new Date(p.bill.issueDate).getFullYear()}-${String(p.bill.invoiceNo).padStart(4, '0')}`,
      },
    })),

    bills: bills.map((b) => ({
      id: b.id,
      invoiceNo: b.invoiceNo,
      fullInvoiceNumber: `INV-${new Date(b.issueDate).getFullYear()}-${String(b.invoiceNo).padStart(4, '0')}`,
      billingPeriodStart: b.billingPeriodStart,
      billingPeriodEnd: b.billingPeriodEnd,
      rentAmount: b.rentAmount,
      totalUtilityAmount: b.totalUtilityAmount,
      otherChargesAmount: b.otherChargesAmount,
      totalAmount: b.totalAmount,
      amountPaid: b.amountPaid,
      balanceDue: b.balanceDue,
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
const getMeterRechargeReportByProperty = async ({ propertyId, meterId, startDate, endDate, accountId }) => {
  if (!propertyId || !startDate || !endDate) {
    throw new Error('propertyId, startDate and endDate are required');
  }

  const whereClause = {
    propertyId,
    accountId,
    expenseDate: {
      [Op.gte]: startDate,
      [Op.lte]: endDate,
    },
  };

  if (meterId) {
    whereClause.meterId = meterId;
  }

  const meterCharges = await MeterCharge.findAll({
    where: whereClause,
    attributes: ['meterId', 'amount', 'expenseDate', 'propertyId'],
    include: [
      {
        model: Meter,
        as: 'meter',
        attributes: ['id', 'number'],
      },
      {
        model: Property,
        as: 'property',
        attributes: ['id', 'name'],
      },
    ],
    raw: false,
  });

  // meterId অনুযায়ী গ্রুপিং কিন্তু নামসহ
  const meterMap = {};

  for (const mc of meterCharges) {
    const id = mc.meterId;
    if (!meterMap[id]) {
      meterMap[id] = {
        meterId: id,
        meterNumber: mc.meter?.number || null,
        propertyId: mc.propertyId,
        propertyName: mc.property?.name || null,
        expenseDate: mc.expenseDate,
        rechargeCount: 0,
        totalRechargeAmount: 0,
      };
    }

    meterMap[id].rechargeCount += 1;
    meterMap[id].totalRechargeAmount += parseFloat(mc.amount ?? 0);
  }

  return {
    propertyId,
    month: startDate.getMonth() + 1,
    year: startDate.getFullYear(),
    meterId: meterId ?? null,
    results: Object.values(meterMap),
    generatedAt: new Date(),
  };
};

const getSubmeterConsumptionReport = async ({ propertyId, meterId, startDate, endDate, accountId }) => {
  // Validation
  if (!propertyId || !meterId || !startDate || !endDate) {
    throw new Error("propertyId, meterId, startDate, endDate are required.");
  }
  // Get the main meter with utility info
  const meter = await Meter.findOne({
    where: { id: meterId, propertyId, accountId },
    include: [{ model: UtilityType, as: "utilityType", attributes: ["name", "unitRate"] }],
  });

  if (!meter) throw new Error("Meter not found");

  const unitRate = parseFloat(meter.utilityType?.unitRate || 0);

  // Get submeters under this meter
  const submeters = await Submeter.findAll({
    where: { meterId, propertyId, accountId },
    attributes: ["id", "number"],
    raw: true,
  });

  const submeterIds = submeters.map((s) => s.id);

  // Get all readings within date range for these submeters
  const readings = await MeterReading.findAll({
    where: {
      submeterId: { [Op.in]: submeterIds },
      readingDate: { [Op.between]: [startDate, endDate] },
    },
    attributes: ["submeterId", "consumption"],
    raw: true,
  });

  // Group readings by submeterId and sum their consumption
  const consumptionMap = {};

  for (const reading of readings) {
    const id = reading.submeterId;
    const consumption = parseFloat(reading.consumption || 0);
    if (!consumptionMap[id]) {
      consumptionMap[id] = 0;
    }
    consumptionMap[id] += consumption;
  }

  // Final result: match submeters with their consumption and amount
  const result = submeters
    .map((sub) => {
      const totalConsumption = consumptionMap[sub.id] || 0;

      if (totalConsumption === 0) return null;

      const totalAmount = parseFloat((totalConsumption * unitRate).toFixed(2));

      return {
        propertyId,
        meterId,
        meterNumber: meter.number,
        submeterId: sub.id,
        submeterNumber: sub.number,
        totalConsumption,
        totalAmount,
      };
    })
    .filter(Boolean);

  return result;
};


const generateBillsByPropertyAndDateRange = async (propertyId, startDate, endDate, accountId) => {
  // Validate property exists
  const property = await Property.findByPk(propertyId);
  if (!property) throw new ApiError(httpStatus.NOT_FOUND, `Property not found: ${propertyId}`);

  // Get active leases for this property
  const leases = await Lease.findAll({
    where: {
      propertyId,
      status: 'active',
    },
    attributes: ['unitId', 'tenantId'],
  });

  if (leases.length === 0) {
    return { results: [], totalResults: 0 };
  }

  const unitIds = leases.map((l) => l.unitId);
  const unitTenantMap = {};
  leases.forEach((l) => {
    unitTenantMap[l.unitId] = l.tenantId;
  });

  const units = await Unit.findAll({
    where: { id: { [Op.in]: unitIds } },
    attributes: ['id', 'name', 'rentAmount'],
    include: [
      {
        model: Submeter,
        as: 'submeters',
        attributes: ['id', 'meterId'],
        include: [
          {
            model: Meter,
            as: 'meter',
            include: [
              {
                model: UtilityType,
                as: 'utilityType',
                attributes: ['unitRate'],
                required: true,
              },
            ],
          },
        ],
      },
    ],
  });

  const year = new Date(startDate).getFullYear();

  const lastBill = await Bill.findOne({
    include: [
      {
        model: Unit,
        as: 'unit',
        where: { propertyId },
        attributes: [],
      },
    ],
    where: {
      issueDate: {
        [Op.between]: [`${year}-01-01`, `${year}-12-31`],
      },
    },
    order: [['invoiceNo', 'DESC']],
  });

  let lastInvoiceNo = lastBill ? lastBill.invoiceNo : 0;

  const billsData = [];
  for (const unit of units) {
    const tenantId = unitTenantMap[unit.id];

    // Calculate amounts
    const rentAmount = parseFloat(unit.rentAmount) || 0;
    let totalUtilityAmount = 0;

    for (const submeter of unit.submeters) {
      const readings = await MeterReading.findAll({
        where: {
          submeterId: submeter.id,
          readingDate: { [Op.between]: [startDate, endDate] },
        },
        attributes: ['consumption'],
      });

      const submeterConsumption = readings.reduce((acc, r) => acc + (parseFloat(r.consumption) || 0), 0);

      const unitRate = submeter.meter?.utilityType?.unitRate || 0;
      totalUtilityAmount += submeterConsumption * unitRate;
    }

    const expenses = await Expense.findAll({
      where: {
        unitId: unit.id,
        expenseDate: { [Op.between]: [startDate, endDate] },
      },
      attributes: ['amount'],
    });

    const otherChargesAmount = expenses.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);

    const totalAmount = rentAmount + totalUtilityAmount + otherChargesAmount;

    const dueDateObj = new Date(endDate);
    dueDateObj.setMonth(dueDateObj.getMonth() + 1);
    dueDateObj.setDate(10);

    // Check if bill exists
    const existingBill = await Bill.findOne({
      where: {
        tenantId,
        unitId: unit.id,
        billingPeriodStart: startDate,
        billingPeriodEnd: endDate,
        isDeleted: false,
      },
    });

    let billRecord;
    if (existingBill) {
      // Update existing bill
      billRecord = await existingBill.update({
        rentAmount,
        totalUtilityAmount,
        otherChargesAmount,
        totalAmount,
        dueDate: dueDateObj,
        issueDate: new Date(),
        paymentStatus: 'unpaid',
        isDeleted: false,
      });
    } else {
      // Create new bill
      lastInvoiceNo += 1;
      billRecord = await Bill.create({
        invoiceNo: lastInvoiceNo,
        tenantId,
        unitId: unit.id,
        accountId,
        billingPeriodStart: startDate,
        billingPeriodEnd: endDate,
        rentAmount,
        totalUtilityAmount,
        otherChargesAmount,
        totalAmount,
        amountPaid: 0,
        dueDate: dueDateObj,
        issueDate: new Date(),
        paymentStatus: 'unpaid',
        notes: null,
        isDeleted: false,
      });
    }

    const tenant = tenantId ? await Tenant.findByPk(tenantId, { attributes: ['id', 'name'] }) : null;

    billsData.push({
      invoiceNo: billRecord.invoiceNo,
      issueDate: billRecord.issueDate,
      rentAmount: billRecord.rentAmount,
      totalUtilityAmount: billRecord.totalUtilityAmount,
      otherChargesAmount: billRecord.otherChargesAmount,
      totalAmount: billRecord.totalAmount,
      tenant: tenant ? { id: tenant.id, name: tenant.name } : null,
      unit: {
        id: unit.id,
        name: unit.name,
        property: {
          name: property.name,
        },
      },
    });
  }

  const formattedResults = billsData.map((bill) => {
    const billYear = new Date(bill.issueDate).getFullYear();
    const formattedInvoiceNo = bill.invoiceNo ? String(bill.invoiceNo).padStart(4, '0') : '0000';

    return {
      fullInvoiceNumber: `INV-${billYear}-${formattedInvoiceNo}`,
      rentAmountFormatted: bill.rentAmount.toFixed(2),
      issueDate: bill.issueDate,
      totalUtilityAmountFormatted: bill.totalUtilityAmount.toFixed(2),
      otherChargesAmount: bill.otherChargesAmount.toFixed(2),
      totalAmountFormatted: bill.totalAmount.toFixed(2),
      tenantName: bill.tenant?.name || 'N/A',
      unitName: bill.unit?.name || 'N/A',
      propertyName: bill.unit?.property?.name || 'N/A',
    };
  });

  return {
    results: formattedResults,
    totalResults: formattedResults.length,
    message: `Bills Generated Successfully.`,
  };
};





module.exports = {
  getFinancialReport,
  getTenantActivityReport,
  getMonthlyRevenueExpenseReport,
  getTenantHistoryReport,
  getBillPaymentPieByYear,
  getMeterRechargeReportByProperty,
  getSubmeterConsumptionReport,
  generateBillsByPropertyAndDateRange,
};
