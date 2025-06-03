// src/controllers/expense.controller.js

const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { expenseService } = require('../services');

/**
 * Create a new expense in the given context (property, unit, or user).
 * The URL param will supply exactly one of { propertyId, unitId, userId }.
 */
const createExpense = catchAsync(async (req, res) => {
  // Build context from URL params
  const context = {};
  if (req.params.propertyId) context.propertyId = req.params.propertyId;
  if (req.params.unitId) context.unitId = req.params.unitId;
  if (req.params.userId) context.userId = req.params.userId;

  const expense = await expenseService.createExpense(context, req.body);
  res.status(httpStatus.CREATED).send(expense);
});

/**
 * Get all expenses in the given context (property, unit, or user).
 * Supports query filters: categoryId, expenseType, sortBy, limit, page.
 */
const getExpenses = catchAsync(async (req, res) => {
  // Build filterOptions from query + context
  const filterOptions = {
    ...(req.query.categoryId && { categoryId: req.query.categoryId }),
    ...(req.query.expenseType && { expenseType: req.query.expenseType }),
    ...(req.params.propertyId && { propertyId: req.params.propertyId }),
    ...(req.params.unitId && { unitId: req.params.unitId }),
    ...(req.params.userId && { userId: req.params.userId }),
  };

  const options = {
    sortBy: req.query.sortBy,
    limit: req.query.limit,
    page: req.query.page,
  };

  const result = await expenseService.getAllExpenses(filterOptions, options);
  res.send(result);
});

/**
 * Get a single expense by its ID (no context needed here).
 */
const getExpenseById = catchAsync(async (req, res) => {
  const expense = await expenseService.getExpenseById(req.params.id);
  res.send(expense);
});

/**
 * Update an existing expense by its ID.
 */
const updateExpenseById = catchAsync(async (req, res) => {
  const updated = await expenseService.updateExpense(req.params.id, req.body);
  res.send(updated);
});

/**
 * Delete an expense by its ID.
 */
const deleteExpenseById = catchAsync(async (req, res) => {
  await expenseService.deleteExpense(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpenseById,
  deleteExpenseById,
};
