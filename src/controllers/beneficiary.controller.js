/* eslint-disable prettier/prettier */
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { beneficiaryService } = require('../services');
const { Expense } = require('../models');

// Helper function to parse include query parameter

const createBeneficiary = catchAsync(async (req, res) => {
  const beneficiary = await beneficiaryService.createBeneficiary({ ...req.body, accountId: req.user.accountId });
  res.status(httpStatus.CREATED).send(beneficiary);
});

const getBenneficiaries = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const deleted = req.query.deleted || 'false'; // Default to 'false'
  if (req.user.role !== 'super_admin') {
    filter.accountId = req.user.accountId;
  }
  const beneficiaries = await beneficiaryService.getAllBeneficiary(filter, options, deleted);
  res.send(beneficiaries);
});

const getBeneficiaryById = catchAsync(async (req, res) => {
  const beneficiary = await beneficiaryService.getBeneficiaryById(req.params.id);
  res.send(beneficiary);
});

const updateBeneficiaryById = catchAsync(async (req, res) => {
  const beneficiary = await beneficiaryService.updateBeneficiary(req.params.id, req.body);
  res.send(beneficiary);
});

const deleteBeneficiaryById = catchAsync(async (req, res) => {
  if (req.user.role !== 'super_admin') {
    res.status(httpStatus.FORBIDDEN).send();
    return;
  }
  await beneficiaryService.deleteBeneficiary(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});
const restoreBeneficiaryById = catchAsync(async (req, res) => {
  if (req.user.role !== 'super_admin') {
    res.status(httpStatus.FORBIDDEN).send();
    return;
  }
  await beneficiaryService.restoreBeneficiary(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeleteBeneficiaryById = catchAsync(async (req, res) => {
  if (req.user.role !== 'super_admin') {
    res.status(httpStatus.FORBIDDEN).send();
    return;
  }
  await beneficiaryService.hardDeleteBeneficiary(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createBeneficiary,
  getBenneficiaries,
  getBeneficiaryById,
  updateBeneficiaryById,
  deleteBeneficiaryById,
  restoreBeneficiaryById,
  hardDeleteBeneficiaryById,
};
