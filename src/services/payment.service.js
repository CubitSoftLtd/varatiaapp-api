/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { Payment, Bill, Tenant, Account, Lease } = require('../models');
const ApiError = require('../utils/ApiError');

const validMethods = ['cash', 'credit_card', 'bank_transfer', 'mobile_payment', 'check', 'online'];

const createPayment = async (paymentData) => {
  const { billId, tenantId, accountId, amountPaid, paymentDate, paymentMethod, transactionId, notes } = paymentData;

  if (!billId || !accountId || !amountPaid || !paymentMethod) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Required fields: billId, accountId, amountPaid, paymentMethod');
  }

  if (amountPaid <= 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment amount must be greater than 0');
  }

  if (!validMethods.includes(paymentMethod)) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Invalid payment method. Must be one of: ${validMethods.join(', ')}`);
  }

  const bill = await Bill.findByPk(billId);
  if (!bill || bill.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, `Bill not found for ID: ${billId}`);
  }

  if (bill.paymentStatus === 'cancelled') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot add payment to a cancelled bill');
  }

  if (tenantId) {
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) throw new ApiError(httpStatus.NOT_FOUND, `Tenant not found for ID: ${tenantId}`);
    if (bill.tenantId !== tenantId) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Tenant ID ${tenantId} does not match bill's tenant ID`);
    }
  }

  const account = await Account.findByPk(accountId);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, `Account not found for ID: ${accountId}`);
  }
  if (bill.accountId !== accountId) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Account ID ${accountId} does not match bill's account ID`);
  }

  if (transactionId) {
    const existingPayment = await Payment.findOne({ where: { transactionId, isDeleted: false } });
    if (existingPayment) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Transaction ID ${transactionId} is already used`);
    }
  }

  // ✅ শুধু পেমেন্ট তৈরি করা হবে, Bill আপডেট নয়
  return Payment.create({
    billId,
    tenantId: tenantId || null,
    accountId,
    amountPaid,
    paymentDate: paymentDate || new Date(),
    paymentMethod,
    transactionId: transactionId || null,
    notes: notes || null,
    status: 'pending', // নতুন status
    isDeleted: false,
  });
};
const getAllPayments = async (filter, options, deleted = 'false') => {
  const whereClause = { ...filter };

  // Apply the isDeleted filter based on the 'deleted' parameter
  if (deleted === 'true') {
    whereClause.isDeleted = true;
  } else if (deleted === 'false') {
    whereClause.isDeleted = false;
  } else if (deleted === 'all') {
    // No filter on isDeleted, allowing all bills to be returned
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid value for deleted parameter');
  }

  const limit = Math.max(parseInt(options.limit, 10) || 10, 1);
  const page = Math.max(parseInt(options.page, 10) || 1, 1);
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  // Clone include to avoid mutating options
  let include = options.include || [];
  if (include.some((item) => item.model === Bill && item.attributes.includes('invoiceNo'))) {
    include = include.map((item) => {
      if (item.model === Bill) {
        return {
          ...item,
          attributes: [...(item.attributes || []), 'issueDate'],
        };
      }
      return item;
    });
  }

  const { count, rows } = await Payment.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: sort.length ? sort : [['paymentDate', 'DESC']],
    include,
  });

  const results = rows.map((payment) => {
    const clonedPayment = payment.toJSON();

    if (clonedPayment.bill?.issueDate && clonedPayment.bill?.invoiceNo !== undefined) {
      const billYear = new Date(clonedPayment.bill.issueDate).getFullYear();
      const formattedInvoiceNo = String(clonedPayment.bill.invoiceNo).padStart(4, '0');
      clonedPayment.bill.invoiceNo = `INV-${billYear}-${formattedInvoiceNo}`;
      delete clonedPayment.bill.issueDate;
    }

    return clonedPayment;
  });

  return {
    results,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    totalResults: count,
  };
};

// const getPaymentsByBillId = async (billId, include = []) => {
//   const bill = await Bill.findByPk(billId);
//   if (!bill) {
//     throw new ApiError(httpStatus.NOT_FOUND, `Bill not found for ID: ${billId}`);
//   }
//   if (include.some((item) => item.model === Bill && item.attributes.includes('invoiceNo'))) {
//     include = include.map((item) => {
//       if (item.model === Bill) {
//         return {
//           ...item,
//           attributes: [...(item.attributes || []), 'issueDate'],
//         };
//       }
//       return item;
//     });
//   }
//   return Payment.findAll({
//     where: { billId, isDeleted: false },
//     order: [['paymentDate', 'DESC']],
//     include,
//   });
// };
const getPaymentsByBillId = async (billId, include = []) => {
  const bill = await Bill.findByPk(billId);
  if (!bill) {
    throw new ApiError(httpStatus.NOT_FOUND, `Bill not found for ID: ${billId}`);
  }
  if (include.some((item) => item.model === Bill && item.attributes.includes('invoiceNo'))) {
    include = include.map((item) => {
      if (item.model === Bill) {
        return {
          ...item,
          attributes: [...(item.attributes || []), 'issueDate'],
        };
      }
      return item;
    });
  }
  const payments = await Payment.findAll({
    where: { billId, isDeleted: false },
    order: [['paymentDate', 'DESC']],
    include,
  });
  const results = payments.map((payment) => {
    const clonedPayment = payment.toJSON();

    if (clonedPayment.bill?.issueDate && clonedPayment.bill?.invoiceNo !== undefined) {
      const billYear = new Date(clonedPayment.bill.issueDate).getFullYear();
      const formattedInvoiceNo = String(clonedPayment.bill.invoiceNo).padStart(4, '0');
      clonedPayment.bill.invoiceNo = `INV-${billYear}-${formattedInvoiceNo}`;
      delete clonedPayment.bill.issueDate;
    }
    return clonedPayment;
  });

  return results;
};

const getPaymentById = async (paymentId, include = []) => {
  if (include.find((item) => item.model === Bill && item.attributes.includes('invoiceNo'))) {
    /* If the Bill model is included but does not have issueDate, add it to attributes */
    /* eslint-disable-next-line no-param-reassign */
    include = include.map((item) => {
      if (item.model === Bill) {
        return {
          ...item,
          attributes: [...(item.attributes || []), 'issueDate'],
        };
      }
      return item;
    });
  }

  const payment = await Payment.findByPk(paymentId, { include });
  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, `Payment not found for ID: ${paymentId}`);
  }

  // If the expense has a bill, ensure it is included in the result
  if (payment.bill) {
    const billYear = new Date(payment.bill.dataValues.issueDate).getFullYear();
    const formattedInvoiceNo = String(payment.bill.dataValues.invoiceNo).padStart(4, '0');
    payment.bill.dataValues.invoiceNo = `INV-${billYear}-${formattedInvoiceNo}`;
    delete payment.bill.issueDate;
  }

  return payment;
};

const updatePayment = async (paymentId, updateBody) => {
  const payment = await getPaymentById(paymentId);
  if (!payment) throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');

  const { tenantId, amountPaid, paymentDate, paymentMethod, transactionId, notes, billId } = updateBody;

  if (billId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update billId of a payment');
  }

  const bill = await Bill.findByPk(payment.billId);
  if (!bill) throw new ApiError(httpStatus.NOT_FOUND, 'Bill not found');
  if (bill.paymentStatus === 'cancelled') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update payment for a cancelled bill');
  }

  if (tenantId !== undefined && tenantId !== null) {
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) throw new ApiError(httpStatus.NOT_FOUND, `Tenant not found for ID: ${tenantId}`);
    if (bill.tenantId !== tenantId) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Tenant ID ${tenantId} does not match bill's tenant ID`);
    }
  }

  if (amountPaid !== undefined && amountPaid <= 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment amount must be greater than 0');
  }

  if (paymentMethod && !validMethods.includes(paymentMethod)) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Invalid payment method. Must be one of: ${validMethods.join(', ')}`);
  }

  if (transactionId !== undefined && transactionId !== payment.transactionId) {
    const existingPayment = await Payment.findOne({ where: { transactionId, isDeleted: false } });
    if (existingPayment) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Transaction ID ${transactionId} is already used`);
    }
  }

  await payment.update({
    tenantId: tenantId ?? payment.tenantId,
    amountPaid: amountPaid ?? payment.amountPaid,
    paymentDate: paymentDate || payment.paymentDate,
    paymentMethod: paymentMethod || payment.paymentMethod,
    transactionId: transactionId ?? payment.transactionId,
    notes: notes ?? payment.notes,
  });

  return payment;
};

const deletePayment = async (paymentId) => {
  const payment = await getPaymentById(paymentId);
  if (!payment) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment is already deleted');
  }

  const bill = await Bill.findByPk(payment.billId);
  if (bill.paymentStatus === 'cancelled') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete payment for a cancelled bill');
  }

  // এখানে শুধু payment delete হবে, bill এর status/amount update হবে না
  return Payment.sequelize.transaction(async (t) => {
    await payment.update({ isDeleted: true }, { transaction: t });
  });
};

const restorePayment = async (paymentId) => {
  const payment = await getPaymentById(paymentId);
  if (!payment.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment is already activated');
  }

  const bill = await Bill.findByPk(payment.billId);
  if (bill.paymentStatus === 'cancelled') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot restore payment for a cancelled bill');
  }

  // এখানে শুধু payment restore হবে, bill এর status/amount update হবে না
  return Payment.sequelize.transaction(async (t) => {
    await payment.update({ isDeleted: false }, { transaction: t });
  });
};

const hardDeletePayment = async (paymentId) => {
  const payment = await getPaymentById(paymentId);
  const bill = await Bill.findByPk(payment.billId);
  if (bill.paymentStatus === 'cancelled') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete payment for a cancelled bill');
  }

  return Payment.sequelize.transaction(async (t) => {
    await payment.destroy({ transaction: t });

    // Hard delete হলে bill এর status সবসময় unpaid হবে
    await bill.update({ amountPaid: 0, paymentStatus: 'unpaid' }, { transaction: t });
  });
};
const approvePayment = async (paymentId) => {
  const payment = await getPaymentById(paymentId);
  if (!payment) throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');

  if (payment.status === 'approved') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment is already approved');
  }

  const bill = await Bill.findByPk(payment.billId);
  if (!bill) throw new ApiError(httpStatus.NOT_FOUND, 'Bill not found');
  if (bill.paymentStatus === 'cancelled') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot approve payment for a cancelled bill');
  }

  return Payment.sequelize.transaction(async (t) => {
    // পেমেন্টের স্ট্যাটাস approved করা
    await payment.update({ status: 'approved' }, { transaction: t });

    // সব approved পেমেন্ট নিয়ে মোট টাকা বের করা
    const approvedPayments = await Payment.findAll({
      where: { billId: bill.id, isDeleted: false, status: 'approved' },
      transaction: t,
    });
    const totalPaid = approvedPayments.reduce((sum, p) => sum + parseFloat(p.amountPaid), 0);

    // নতুন bill status নির্ধারণ
    let newBillStatus;
    if (totalPaid >= parseFloat(bill.totalAmount)) newBillStatus = 'paid';
    else if (totalPaid > 0) newBillStatus = 'partially_paid';
    else newBillStatus = 'unpaid';

    // Bill আপডেট
    await bill.update(
      { amountPaid: totalPaid, paymentStatus: newBillStatus },
      { transaction: t }
    );

    // 🔹 Unit থেকে active lease বের করা
    const activeLease = await Lease.findOne({
      where: {
        unitId: bill.unitId,        // Bill এর unitId ধরে
        status: 'active',
      },
      transaction: t
    });

    if (
      bill.paymentStatus === 'unpaid' &&
      activeLease &&
      activeLease.deductedAmount &&
      activeLease.deductedAmount > 0
    ) {
      if (activeLease.depositAmountLeft && activeLease.depositAmountLeft > 0) {
        const newDepositAmountLeft =
          parseFloat(activeLease.depositAmountLeft) - parseFloat(bill.deductedAmount);

        await activeLease.update(
          { depositAmountLeft: newDepositAmountLeft < 0 ? 0 : newDepositAmountLeft },
          { transaction: t }
        );
      }
    }

    return { payment, bill };
  });
};

const approveMultiplePayments = async (paymentIds) => {
  if (!Array.isArray(paymentIds) || paymentIds.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No payment IDs provided');
  }

  return Payment.sequelize.transaction(async (t) => {
    const payments = await Payment.findAll({
      where: { id: paymentIds, isDeleted: false },
      transaction: t,
    });

    if (payments.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No payments found for provided IDs');
    }

    const results = [];

    for (const payment of payments) {
      if (payment.status === 'approved') continue; // skip already approved

      const bill = await Bill.findByPk(payment.billId, { transaction: t });
      if (!bill) {
        throw new ApiError(httpStatus.NOT_FOUND, `Bill not found for payment ID: ${payment.id}`);
      }
      if (bill.paymentStatus === 'cancelled') {
        throw new ApiError(httpStatus.BAD_REQUEST, `Cannot approve payment for cancelled bill ID: ${bill.id}`);
      }

      // ✅ Approve payment
      await payment.update({ status: 'approved' }, { transaction: t });

      // 🔹 Recalculate total approved payments
      const approvedPayments = await Payment.findAll({
        where: { billId: bill.id, isDeleted: false, status: 'approved' },
        transaction: t,
      });
      const totalPaid = approvedPayments.reduce((sum, p) => sum + parseFloat(p.amountPaid || 0), 0);

      // 🔹 Update bill status
      const totalAmount = parseFloat(bill.totalAmount || 0);
      let newBillStatus;
      if (totalPaid >= totalAmount) newBillStatus = 'paid';
      else if (totalPaid > 0) newBillStatus = 'partially_paid';
      else newBillStatus = 'unpaid';

      await bill.update({ amountPaid: totalPaid, paymentStatus: newBillStatus }, { transaction: t });

      // 🔹 Update lease depositAmountLeft (if deduction applied in this bill)
      const activeLease = await Lease.findOne({
        where: { unitId: bill.unitId, tenantId: bill.tenantId, status: 'active' },
        transaction: t,
      });

      if (
        bill.paymentStatus === 'unpaid' &&
        activeLease &&
        parseFloat(activeLease.deductedAmount || 0) > 0
      ) {
        const currentDepositLeft = parseFloat(activeLease.depositAmountLeft || 0);

        if (currentDepositLeft > 0 && parseFloat(bill.deductedAmount || 0) > 0) {
          const newDepositLeft = currentDepositLeft - parseFloat(bill.deductedAmount || 0);

          await activeLease.update(
            { depositAmountLeft: newDepositLeft < 0 ? 0 : newDepositLeft },
            { transaction: t }
          );
        }
      }

      results.push({ payment, bill });
    }

    return results;
  });
};


module.exports = {
  createPayment,
  getAllPayments,
  getPaymentsByBillId,
  getPaymentById,
  updatePayment,
  deletePayment,
  restorePayment,
  hardDeletePayment,
  approvePayment,
  approveMultiplePayments
};
