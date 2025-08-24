/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable prettier/prettier */
const { Op, fn, col } = require('sequelize');
const moment = require('moment');
const httpStatus = require('http-status');
const { Bill, Payment, Expense, Lease, MaintenanceRequest, MeterCharge, Unit, Tenant, Property, Meter, Sequelize, MeterReading, UtilityType, Submeter, PersonalExpense, Beneficiary } = require('../models');
const ApiError = require('../utils/ApiError');

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

  // ✅ Total Revenue (only approved payments)
  const totalRevenue = (await Payment.sum('amountPaid', {
    where: {
      ...where,
      status: 'approved', // শুধু approved payment
    },
  })) || 0;

  // ✅ Total Expenses (Expense + PersonalExpense)
  const expenseAmount = (await Expense.sum('amount', { where })) || 0;
  const personalExpenseAmount = (await PersonalExpense.sum('amount', { where })) || 0;
  const totalExpenses = expenseAmount + personalExpenseAmount;

  // ✅ Outstanding payments
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

const getMonthlyRevenueExpenseReport = async ({ year, accountId }) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const result = Array.from({ length: 12 }, (_, i) => ({
    month: monthNames[i],
    revenue: 0,
    expense: 0,
  }));

  const startOfYear = new Date(`${year}-01-01`);
  const startOfNextYear = new Date(`${parseInt(year) + 1}-01-01`);

  // Fetch all payments within year
  const payments = await Payment.findAll({
    where: {
      isDeleted: false,
      accountId,
      createdAt: {
        [Op.gte]: startOfYear,
        [Op.lt]: startOfNextYear,
      },
    },
    attributes: ['amountPaid', 'createdAt'],
    raw: true,
  });

  // Fetch all expenses within year (Expense + PersonalExpense)
  const expenses = await Expense.findAll({
    where: {
      isDeleted: false,
      accountId,
      expenseDate: {  // createdAt নয়, expenseDate ব্যবহার করা হলো
        [Op.gte]: startOfYear,
        [Op.lt]: startOfNextYear,
      },
    },
    attributes: ['amount', 'expenseDate'],
    raw: true,
  });

  const personalExpenses = await PersonalExpense.findAll({
    where: {
      isDeleted: false,
      accountId,
      expenseDate: {
        [Op.gte]: startOfYear,
        [Op.lt]: startOfNextYear,
      },
    },
    attributes: ['amount', 'expenseDate'],
    raw: true,
  });

  // Map payments to months
  for (const p of payments) {
    const monthIndex = new Date(p.createdAt).getMonth();
    result[monthIndex].revenue += parseFloat(p.amountPaid);
  }

  // Map Expense to months
  for (const e of expenses) {
    const monthIndex = new Date(e.expenseDate).getMonth();
    result[monthIndex].expense += parseFloat(e.amount);
  }

  // Map PersonalExpense to months
  for (const pe of personalExpenses) {
    const monthIndex = new Date(pe.expenseDate).getMonth();
    result[monthIndex].expense += parseFloat(pe.amount);
  }

  return {
    year: parseInt(year),
    data: result,
    generatedAt: new Date(),
  };
};


const getTenantHistoryReport = async (filter) => {
  const { tenantId, leaseId } = filter;

  if (!tenantId) throw new Error('tenantId is required');

  let lease = null;
  let unitId = null;

  if (leaseId) {
    lease = await Lease.findOne({
      where: { id: leaseId, tenantId },
      include: [
        { model: Unit, as: 'unit', attributes: ['id', 'name'] },
        { model: Property, as: 'property', attributes: ['id', 'name'] },
        { model: Tenant, as: 'tenant', attributes: ['id', 'name'] },
      ],
    });

    if (!lease) throw new Error('Lease not found or does not belong to tenant');
    unitId = lease.unitId;
  }

  const billWhere = { tenantId };
  if (unitId) billWhere.unitId = unitId;

  const bills = await Bill.findAll({ where: billWhere });

  const totalBillAmount = bills.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);
  const totalDeductedAmount = bills.reduce(
    (sum, b) => b.paymentStatus !== 'unpaid' ? sum + parseFloat(b.deductedAmount || 0) : sum,
    0
  );
  const totalUtilityAmount = bills.reduce((sum, b) => sum + parseFloat(b.totalUtilityAmount || 0), 0);
  const totalRentAmount = bills.reduce((sum, b) => sum + parseFloat(b.rentAmount || 0), 0);
  const totalOtherCharges = bills.reduce((sum, b) => sum + parseFloat(b.otherChargesAmount || 0), 0);
  const totalBalanceDue = bills.reduce((sum, b) => sum + parseFloat(b.balanceDue || 0), 0);
  const totalPaidAmount = bills.reduce((sum, b) => sum + parseFloat(b.amountPaid || 0), 0);

  return {
    leaseId: lease?.id ?? null,
    leaseStatus: lease?.status ?? null,
    leaseStartDate: lease?.leaseStartDate ?? null,
    leaseEndDate: lease?.leaseEndDate ?? null,
    moveInDate: lease?.moveInDate ?? null,
    moveOutDate: lease?.moveOutDate ?? null,
    unitId: lease?.unitId ?? null,
    unitName: lease?.unit?.name ?? null,
    property: lease?.property?.name ?? null,
    period: leaseId ? `Lease ID: ${leaseId}` : 'All Time',

    totalBillAmount,
    totalPaidAmount,
    totalDeductedAmount,
    totalUtilityAmount,
    totalRentAmount,
    totalOtherCharges,
    totalBalanceDue,
    depositAmount: lease?.depositAmount ?? 0,
    depositAmountLeft: lease?.depositAmountLeft ?? 0,
    tenantName: lease?.tenant?.name,
    bills: bills.map((b) => ({
      id: b.id,
      invoiceNo: b.invoiceNo,
      fullInvoiceNumber: `INV-${new Date(b.issueDate).getFullYear()}-${String(b.invoiceNo).padStart(4, '0')}`,
      billingPeriodStart: b.billingPeriodStart,
      billingPeriodEnd: b.billingPeriodEnd,
      rentAmount: b.rentAmount,
      deductedAmount: b.paymentStatus !== 'unpaid' ? b.deductedAmount : 0,
      paymentStatus: b.paymentStatus,
      totalUtilityAmount: b.totalUtilityAmount,
      otherChargesAmount: b.otherChargesAmount,
      totalAmount: b.totalAmount,
      amountPaid: b.amountPaid,
      balanceDue: b.balanceDue,
      tenantName: b.tenant?.fullName,
    })),
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
  if (!propertyId || !meterId || !startDate || !endDate) {
    throw new Error("propertyId, meterId, startDate, endDate are required.");
  }
  const monthName = moment(startDate).format("MMMM YYYY");
  // Main meter with utility info and property name
  const meter = await Meter.findOne({
    where: { id: meterId, propertyId, accountId },
    include: [
      { model: UtilityType, as: "utilityType", attributes: ["name", "unitRate"] },
      { model: Property, as: "property", attributes: ["name"] }, // join Property table
    ],
  });

  if (!meter) throw new Error("Meter not found");

  const unitRate = parseFloat(meter.utilityType?.unitRate || 0);
  const propertyName = meter.property?.name || "";

  // All submeters
  const submeters = await Submeter.findAll({
    where: { meterId, propertyId, accountId },
    attributes: ["id", "number"],
    include: [
      { model: Unit, as: "unit", attributes: ["name"] }
    ],
    raw: true,
    nest: true
  });
  const submeterIds = submeters.map(s => s.id);

  // All readings for these submeters in date range
  const readings = await MeterReading.findAll({
    where: {
      submeterId: { [Op.in]: submeterIds },
      readingDate: { [Op.between]: [startDate, endDate] },
    },
    attributes: ["submeterId", "consumption"],
    raw: true,
  });

  // Group readings
  const consumptionMap = {};
  for (const r of readings) {
    const sid = r.submeterId;
    const cons = parseFloat(r.consumption || 0);
    consumptionMap[sid] = (consumptionMap[sid] || 0) + cons;
  }

  // Meter recharge sum
  const rechargeData = await MeterCharge.findOne({
    where: {
      meterId,
      expenseDate: { [Op.between]: [startDate, endDate] },
    },
    attributes: [[fn("SUM", col("amount")), "totalRechargeAmount"]],
    raw: true,
  });
  const totalRechargeAmount = parseFloat(rechargeData?.totalRechargeAmount || 0);

  // Build submeter array
  const submeterData = submeters
    .map(sub => {
      const totalConsumption = consumptionMap[sub.id] || 0;
      if (totalConsumption === 0) return null;

      const totalAmount = parseFloat((totalConsumption * unitRate).toFixed(2));

      return {
        propertyId,
        meterId,
        meterNumber: meter.number,
        unitId: sub.unitId,
        unitName: sub.unit?.name || "",
        submeterId: sub.id,
        submeterNumber: sub.number,
        totalConsumption,
        totalAmount
      };
    })
    .filter(Boolean);

  // Final structure
  return {
    propertyId,
    propertyName,
    meterId: meter.id,
    meterNumber: meter.number,
    monthName,
    totalRechargeAmount,
    submeters: submeterData
  };
};

const generateBillsByPropertyAndDateRange = async (propertyId, startDate, endDate, accountId) => {
  // 🔹 Property validate
  const property = await Property.findByPk(propertyId);
  if (!property) throw new ApiError(httpStatus.NOT_FOUND, `Property not found: ${propertyId}`);

  // 🔹 Active leases আনুন (deposit সহ)
  const leases = await Lease.findAll({
    where: { propertyId, status: 'active' },
    attributes: ['id', 'unitId', 'tenantId', 'deductedAmount', 'depositAmount', 'depositAmountLeft'],
  });

  if (leases.length === 0) {
    return { message: "No active leases found", results: [], totalResults: 0 };
  }

  const unitIds = leases.map(l => l.unitId);

  // maps তৈরি
  const unitLeaseMap = {}; // full lease access করার জন্য
  leases.forEach(l => {
    unitLeaseMap[l.unitId] = l;
  });

  // 🔹 Unit data আনুন
  const units = await Unit.findAll({
    where: { id: { [Op.in]: unitIds } },
    attributes: ['id', 'name', 'rentAmount'],
    include: [
      {
        model: Submeter,
        as: 'submeters',
        attributes: ['id', 'meterId', 'adjustedConsumption', 'adjustedUnitRate'],
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

  // 🔹 Last invoice no বের করুন (GLOBAL, সব property মিলিয়ে)
  const year = new Date(startDate).getFullYear();
  const lastBill = await Bill.findOne({
    where: { issueDate: { [Op.between]: [`${year}-01-01`, `${year}-12-31`] } },
    order: [['invoiceNo', 'DESC']],
  });
  let lastInvoiceNo = lastBill ? lastBill.invoiceNo : 0;

  const billsData = [];
  let createdBillsCount = 0;

  for (const unit of units) {
    const lease = unitLeaseMap[unit.id];
    if (!lease) continue;

    const {tenantId} = lease;
    const baseRentAmount = parseFloat(unit.rentAmount) || 0;
    const deductedAmount = parseFloat(lease.deductedAmount) || 0;
    const depositAmountLeft = parseFloat(lease.depositAmountLeft) || 0;

    // আগে থেকে এই তারিখে বিল আছে কিনা চেক
    const existingBill = await Bill.findOne({
      where: {
        tenantId,
        unitId: unit.id,
        billingPeriodStart: startDate,
        billingPeriodEnd: endDate,
      },
    });
    if (existingBill) continue;

    lastInvoiceNo += 1;

    // 🔹 Rent adjustment (depositAmountLeft থেকে deduction)
    let adjustedRentAmount = baseRentAmount;
    let finalDeductedAmount = 0;

    const deductedAmountModify = depositAmountLeft > deductedAmount ? deductedAmount : depositAmountLeft;

    if (depositAmountLeft > 0 && deductedAmountModify > 0) {
      adjustedRentAmount = baseRentAmount - deductedAmountModify;
      finalDeductedAmount = deductedAmountModify;

      // ✅ Lease এর depositAmountLeft update করুন
    }

    let totalUtilityAmount = 0;

    // 🔹 Utility Calculation
    for (const submeter of unit.submeters) {
      const readings = await MeterReading.findAll({
        where: {
          submeterId: submeter.id,
          readingDate: { [Op.between]: [startDate, endDate] },
        },
        attributes: ['consumption'],
      });

      const submeterConsumption = readings.reduce(
        (acc, r) => acc + (parseFloat(r.consumption) || 0),
        0
      );

      let unitRate = submeter.meter?.utilityType?.unitRate || 0;

      // Condition apply → যদি consumption adjustedConsumption ছাড়ায়
      if (
        submeter.adjustedConsumption !== null &&
        submeter.adjustedConsumption !== undefined &&
        submeterConsumption > submeter.adjustedConsumption
      ) {
        if (submeter.adjustedUnitRate !== null && submeter.adjustedUnitRate !== undefined) {
          unitRate = submeter.adjustedUnitRate;
        }
      }

      totalUtilityAmount += submeterConsumption * unitRate;
    }

    // 🔹 Expenses আনুন
    const expenses = await Expense.findAll({
      where: {
        unitId: unit.id,
        expenseDate: { [Op.between]: [startDate, endDate] },
      },
      attributes: ['amount'],
    });
    const otherChargesAmount = expenses.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);

    const totalAmount = adjustedRentAmount + totalUtilityAmount + otherChargesAmount;

    // 🔹 Due Date সেট করুন
    const dueDateObj = new Date(endDate);
    dueDateObj.setMonth(dueDateObj.getMonth() + 1);
    dueDateObj.setDate(10);

    // 🔹 Bill create
    const newBill = await Bill.create({
      invoiceNo: lastInvoiceNo,
      tenantId,
      unitId: unit.id,
      accountId,
      billingPeriodStart: startDate,
      billingPeriodEnd: endDate,
      rentAmount: baseRentAmount,
      deductedAmount: finalDeductedAmount, // ✅ এখন শুধুমাত্র condition মেনে deduct হবে
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

    createdBillsCount++;

    billsData.push({
      invoiceNo: newBill.invoiceNo,
      issueDate: newBill.issueDate,
      rentAmount: baseRentAmount,
      deductedAmount: finalDeductedAmount, // ✅ ফাইনাল ডিডাকশন এখানে reflect হবে
      totalUtilityAmount: newBill.totalUtilityAmount,
      otherChargesAmount: newBill.otherChargesAmount,
      totalAmount: newBill.totalAmount,
      tenant: tenantId ? { id: tenantId } : null,
      unit: {
        id: unit.id,
        name: unit.name,
        property: { name: property.name },
      },
    });
  }

  if (createdBillsCount === 0) {
    const monthName = new Date(startDate).toLocaleString('en-US', { month: 'long', year: 'numeric' });
    throw new ApiError(httpStatus.BAD_REQUEST, `All bills for ${monthName} already created!!`);
  }

  // 🔹 Final formatted results
  const formattedResults = billsData.map((bill) => {
    const billYear = new Date(bill.issueDate).getFullYear();
    const formattedInvoiceNo = bill.invoiceNo ? String(bill.invoiceNo).padStart(4, '0') : '0000';
    return {
      fullInvoiceNumber: `INV-${billYear}-${formattedInvoiceNo}`,
      rentAmountFormatted: bill.rentAmount.toFixed(2),
      deductedAmountFormatted: bill.deductedAmount,
      issueDate: bill.issueDate,
      totalUtilityAmountFormatted: bill.totalUtilityAmount.toFixed(2),
      otherChargesAmount: bill.otherChargesAmount.toFixed(2),
      totalAmountFormatted: bill.totalAmount.toFixed(2),
      tenantId: bill.tenant?.id || 'N/A',
      unitName: bill.unit?.name || 'N/A',
      propertyName: bill.unit?.property?.name || 'N/A',
    };
  });

  return {
    message: `${createdBillsCount} Bills Created Successfully!!!`,
    results: formattedResults,
    totalResults: formattedResults.length,
  };
};




const getPersonalExpenseReportByBeneficiary = async (filter) => {
  const { beneficiaryId, startDate, endDate, accountId } = filter;

  if (!beneficiaryId) {
    throw new Error("beneficiaryId is required");
  }

  const where = { beneficiaryId, accountId };

  // Date range filter
  if (startDate) where.expenseDate = { [Op.gte]: new Date(startDate) };
  if (endDate) {
    if (!where.expenseDate) where.expenseDate = {};
    where.expenseDate[Op.lte] = new Date(endDate);
  }

  // সব ডাটা beneficiary join সহ নিয়ে আসা
  const expenses = await PersonalExpense.findAll({
    where,
    include: [
      {
        model: Beneficiary,
        as: "beneficiary",
        attributes: ["id", "name"],
      },
    ],
    order: [["expenseDate", "ASC"]],
  });

  // মোট খরচ
  const totalAmount = expenses.reduce((sum, exp) => {
    return sum + parseFloat(exp.amount || 0);
  }, 0);

  // রিপোর্টের জন্য সময়
  let period = "All Time";
  if (startDate && endDate) {
    const startMonth = new Date(startDate).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
    const endMonth = new Date(endDate).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
    period = startMonth === endMonth ? startMonth : `${startMonth} - ${endMonth}`;
  }

  return {
    beneficiaryId,
    beneficiaryName: expenses[0]?.beneficiary?.name || null, // beneficiary টেবিল থেকে নাম
    period,
    totalExpense: totalAmount,
    expenseCount: expenses.length,
    expenses: expenses.map((e) => ({
      id: e.id,
      beneficiaryId: e.beneficiaryId,
      beneficiaryName: e.beneficiary?.name || null,
      description: e.description,
      amount: parseFloat(e.amount || 0),
      expenseDate: e.expenseDate,
    })),
    generatedAt: new Date(),
  };
};

const getFinancialReportByYear = async (filter) => {
  const { year, propertyId, accountId } = filter;
  if (!year) {
    throw new Error("year is required");
  }

  const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
  const endOfYear = new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`);

  const where = {
    createdAt: { [Op.gte]: startOfYear, [Op.lt]: endOfYear },
  };

  // Property ID filter
  if (propertyId) where.propertyId = propertyId;

  // Account ID filter
  if (accountId) where.accountId = accountId;

  // ✅ Total Revenue (only approved payments)
  const totalRevenue = (await Payment.sum('amountPaid', {
    where: {
      ...where,
      status: 'approved',
    },
  })) || 0;

  // ✅ Total Expenses (Expense + PersonalExpense)
  const expenseAmount = (await Expense.sum('amount', { where })) || 0;
  const personalExpenseAmount = (await PersonalExpense.sum('amount', { where })) || 0;
  const totalExpenses = expenseAmount + personalExpenseAmount;

  // ✅ Outstanding payments
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
    year: parseInt(year),
    totalRevenue,
    totalExpenses,
    outstandingPayments,
    profit: totalRevenue - totalExpenses,
    generatedAt: new Date(),
  };
};
const getTenantPayments = async (filter) => {
  const { tenantId, leaseId } = filter;

  if (!tenantId) throw new Error('tenantId is required');

  let lease = null;
  let unitId = null;

  if (leaseId) {
    lease = await Lease.findOne({
      where: { id: leaseId, tenantId },
      include: [
        { model: Unit, as: 'unit', attributes: ['id', 'name'] },
        { model: Property, as: 'property', attributes: ['id', 'name'] },
        { model: Tenant, as: 'tenant', attributes: ['id', 'name'] },
      ],
    });

    if (!lease) throw new Error('Lease not found or does not belong to tenant');
    unitId = lease.unitId;
  }

  // 🔹 Bills needed for aggregating totals
  const billWhere = { tenantId };
  if (unitId) billWhere.unitId = unitId;
  const bills = await Bill.findAll({ where: billWhere });

  const totalBillAmount = bills.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);
  const totalDeductedAmount = bills.reduce(
    (sum, b) => b.paymentStatus !== 'unpaid' ? sum + parseFloat(b.deductedAmount || 0) : sum,
    0
  );
  const totalUtilityAmount = bills.reduce((sum, b) => sum + parseFloat(b.totalUtilityAmount || 0), 0);
  const totalRentAmount = bills.reduce((sum, b) => sum + parseFloat(b.rentAmount || 0), 0);
  const totalOtherCharges = bills.reduce((sum, b) => sum + parseFloat(b.otherChargesAmount || 0), 0);
  const totalBalanceDue = bills.reduce((sum, b) => sum + parseFloat(b.balanceDue || 0), 0);
  // const totalPaidAmount = bills.reduce((sum, b) => sum + parseFloat(b.balanceDue || 0), 0);

  const payments = await Payment.findAll({
    where: { tenantId, billId: { [Op.in]: bills.map(b => b.id) } },
    include: [
      { model: Bill, as: 'bill', attributes: ['id', 'invoiceNo', 'issueDate', 'totalAmount'] },
    ],
  });

  const totalPaidAmount = payments.reduce((sum, p) => sum + parseFloat(p.amountPaid || 0), 0);

  return {
    leaseId: lease?.id ?? null,
    leaseStatus: lease?.status ?? null,
    leaseStartDate: lease?.leaseStartDate ?? null,
    leaseEndDate: lease?.leaseEndDate ?? null,
    unitId: lease?.unitId ?? null,
    unitName: lease?.unit?.name ?? null,
    property: lease?.property?.name ?? null,
    period: leaseId ? `Lease ID: ${leaseId}` : 'All Time',
    moveInDate: lease?.moveInDate ?? null,
    moveOutDate: lease?.moveOutDate ?? null,
    totalBillAmount,
    totalDeductedAmount,
    totalUtilityAmount,
    totalRentAmount,
    totalOtherCharges,
    totalBalanceDue,
    totalPaidAmount,
    depositAmount: lease?.depositAmount ?? 0,
    depositAmountLeft: lease?.depositAmountLeft ?? 0,
    tenantName: lease?.tenant?.name,
    payments: payments.map((p) => ({
      id: p.id,
      billId: p.billId,
      billInvoiceNo: p.bill?.invoiceNo,
      billTotalAmount: p.bill?.totalAmount,
      paymentMethod: p.paymentMethod,
      transactionId: p.transactionId,
      paymentDate: p.paymentDate,
      amountPaid: p.amountPaid,
      billFullInvoiceNumber: p.bill
        ? `INV-${new Date(p.bill.issueDate).getFullYear()}-${String(p.bill.invoiceNo).padStart(4, '0')}`
        : null,
    })),
  };
};
const getDashboardCounts = async (filter) => {
  try {
    const whereClause = { isDeleted: false };

    if (filter?.accountId) {
      whereClause.accountId = filter.accountId;
    }

    const [tenantCount, propertyCount, meterCount, submeterCount,unitCount] = await Promise.all([
      Tenant.count({ where: whereClause }),
      Property.count({ where: whereClause }),
      Meter.count({ where: whereClause }),
      Submeter.count({ where: whereClause }),
      Unit.count({ where: whereClause }),
    ]);

    return {
      tenants: tenantCount,
      properties: propertyCount,
      meters: meterCount,
      submeters: submeterCount,
      unit: unitCount,
    };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch dashboard counts');
  }
};
module.exports = {
  getFinancialReport,
  getMonthlyRevenueExpenseReport,
  getTenantHistoryReport,
  getBillPaymentPieByYear,
  getMeterRechargeReportByProperty,
  getSubmeterConsumptionReport,
  generateBillsByPropertyAndDateRange,
  getPersonalExpenseReportByBeneficiary,
  getFinancialReportByYear,
  getTenantPayments,
  getDashboardCounts
};
