const { Bill, Expense, ExpenseCategory, Sequelize } = require('../models');

const { Op } = Sequelize;

/**
 * Create a new Bill, associate unbilled tenant-chargeable Expenses, and calculate totals.
 */
async function createBill({
  tenantId,
  unitId,
  accountId,
  billingPeriodStart,
  billingPeriodEnd,
  rentAmount,
  totalUtilityAmount,
  dueDate,
  issueDate,
  notes,
}) {
  // 1) Fetch unbilled tenant-chargeable expenses within period
  const tenantCharges = await Expense.findAll({
    where: {
      unitId,
      billId: null,
      expenseDate: { [Op.between]: [billingPeriodStart, billingPeriodEnd] },
    },
    include: [
      {
        model: ExpenseCategory,
        as: 'category',
        where: { type: 'tenant_chargeable' },
        attributes: [],
      },
    ],
  });

  // 2) Sum their amounts
  const otherChargesAmount = tenantCharges.reduce((sum, ch) => sum + parseFloat(ch.amount), 0);

  // 3) Compute totalAmount = rent + utilities + other charges
  const totalAmount = parseFloat(rentAmount) + parseFloat(totalUtilityAmount) + otherChargesAmount;

  // 4) Create Bill within a transaction and update those Expenses
  const bill = await Bill.sequelize.transaction(async (t) => {
    const newBill = await Bill.create(
      {
        tenantId,
        unitId,
        accountId,
        billingPeriodStart,
        billingPeriodEnd,
        rentAmount,
        totalUtilityAmount,
        otherChargesAmount,
        totalAmount,
        dueDate,
        issueDate: issueDate || new Date(),
        paymentStatus: 'unpaid',
        amountPaid: 0.0,
        notes: notes || null,
        isDeleted: false,
      },
      { transaction: t }
    );

    if (tenantCharges.length) {
      await Expense.update(
        { billId: newBill.id },
        {
          where: {
            id: tenantCharges.map((e) => e.id),
            billId: null,
          },
          transaction: t,
        }
      );
    }

    return newBill;
  });

  return bill;
}

/**
 * Update an existing Bill, reassign Expenses, and recalculate totals.
 */
async function updateBill(
  billId,
  {
    tenantId,
    unitId: newUnitId,
    accountId,
    billingPeriodStart: newStart,
    billingPeriodEnd: newEnd,
    rentAmount,
    totalUtilityAmount: newTotalUtilityAmount,
    dueDate,
    issueDate,
    notes,
  }
) {
  const bill = await Bill.findByPk(billId);
  if (!bill) throw new Error('Bill not found');

  return Bill.sequelize.transaction(async (t) => {
    // 1) Unlink previously linked Expenses outside the new period
    await Expense.update(
      { billId: null },
      {
        where: {
          unitId: bill.unitId,
          billId,
          expenseDate: { [Op.notBetween]: [newStart, newEnd] },
        },
        transaction: t,
      }
    );

    // 2) Fetch Expenses now in the updated period
    const updatedCharges = await Expense.findAll({
      where: {
        unitId: newUnitId,
        billId: { [Op.or]: [billId, null] },
        expenseDate: { [Op.between]: [newStart, newEnd] },
      },
      include: [
        {
          model: ExpenseCategory,
          as: 'category',
          where: { type: 'tenant_chargeable' },
          attributes: [],
        },
      ],
      transaction: t,
    });

    // 3) Sum their amounts
    const newOtherChargesAmount = updatedCharges.reduce((sum, ch) => sum + parseFloat(ch.amount), 0);

    // 4) Compute new totalAmount
    const newTotalAmount =
      (rentAmount !== undefined ? parseFloat(rentAmount) : bill.rentAmount) + newTotalUtilityAmount + newOtherChargesAmount;

    // 5) Update Bill fields
    await bill.update(
      {
        tenantId,
        unitId: newUnitId,
        accountId,
        billingPeriodStart: newStart,
        billingPeriodEnd: newEnd,
        rentAmount: rentAmount !== undefined ? rentAmount : bill.rentAmount,
        totalUtilityAmount: newTotalUtilityAmount,
        otherChargesAmount: newOtherChargesAmount,
        totalAmount: newTotalAmount,
        dueDate,
        issueDate,
        notes,
      },
      { transaction: t }
    );

    // 6) Link the fetched Expenses to this Bill
    const toLink = updatedCharges.filter((e) => e.billId !== billId).map((e) => e.id);
    if (toLink.length) {
      await Expense.update({ billId }, { where: { id: toLink }, transaction: t });
    }

    return bill;
  });
}

/**
 * Retrieve a Bill by its primary key.
 */
async function getBillById(billId) {
  return Bill.findByPk(billId);
}

/**
 * List all Bills (with optional filters).
 */
async function listBills(filter = {}) {
  return Bill.findAll({ where: filter });
}

/**
 * Soft-delete a Bill by setting isDeleted flag.
 */
async function deleteBill(billId) {
  return Bill.update({ isDeleted: true }, { where: { id: billId } });
}

module.exports = {
  createBill,
  updateBill,
  getBillById,
  listBills,
  deleteBill,
};
