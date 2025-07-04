const httpStatus = require('http-status');
const { ExpenseCategory, Expense } = require('../models');
const ApiError = require('../utils/ApiError');

const categoryTypes = ['property_related', 'tenant_chargeable', 'administrative', 'personal'];

/**
 * Create a new expense category with validation and transaction
 * @param {Object} categoryBody - { name, categoryType, description? }
 * @returns {Promise<ExpenseCategory>}
 */
const createExpenseCategory = async (categoryBody) => {
  const { name, categoryType, description } = categoryBody;

  // Validate required fields
  if (!name || !categoryType) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name and category type are required');
  }

  // Validate categoryType
  if (!categoryTypes.includes(categoryType)) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Category type must be one of: ${categoryTypes.join(', ')}`);
  }

  // Check for existing category name
  const existingCategory = await ExpenseCategory.findOne({ where: { name } });
  if (existingCategory) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category name already exists');
  }

  // Create category in a transaction
  const category = await ExpenseCategory.sequelize.transaction(async (t) => {
    return ExpenseCategory.create(
      {
        name,
        type: categoryType,
        description: description || null,
        isDeleted: false,
      },
      { transaction: t }
    );
  });

  return category;
};

/**
 * Query for all expense categories with pagination, sorting, and optional inclusion
 * @param {Object} filter - Sequelize filter
 * @param {Object} options - { sortBy, limit, page, include? }
 * @returns {Promise<{ results: ExpenseCategory[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllExpenseCategories = async (filter, options, deleted = 'false') => {
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

  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const sort = [];
  if (options.sortBy) {
    const [field, order] = options.sortBy.split(':');
    sort.push([field, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  // Use provided include or default to empty array
  const include = options.include || [];

  const { count, rows } = await ExpenseCategory.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: sort.length ? sort : [['name', 'ASC']],
    include,
  });

  return {
    results: rows,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    totalResults: count,
  };
};

/**
 * Get expense category by ID
 * @param {string} id - Expense category UUID
 * @param {Array} [include=[]] - Array of objects specifying models and attributes to include
 * @returns {Promise<ExpenseCategory>}
 */
const getExpenseCategoryById = async (id, include = []) => {
  const category = await ExpenseCategory.findByPk(id, { include });
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Expense category not found');
  }
  return category;
};

/**
 * Update an existing expense category by ID
 * @param {string} categoryId - Expense category UUID
 * @param {Object} updateBody - { name?, categoryType?, description? }
 * @returns {Promise<ExpenseCategory>}
 */
const updateExpenseCategory = async (categoryId, updateBody) => {
  const category = await getExpenseCategoryById(categoryId);
  const { name, categoryType, description } = updateBody;

  // Validate name uniqueness if provided
  if (name && name !== category.name) {
    const existingCategory = await ExpenseCategory.findOne({ where: { name } });
    if (existingCategory) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Category name already exists');
    }
  }

  // Prevent categoryType change if expenses exist
  if (categoryType && categoryType !== category.categoryType) {
    if (!categoryTypes.includes(categoryType)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Category type must be one of: ${categoryTypes.join(', ')}`);
    }
    const expenses = await Expense.findAll({ where: { categoryId } });
    if (expenses.length > 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot change category type with associated expenses');
    }
  }

  await category.update({
    name: name !== undefined ? name : category.name,
    categoryType: categoryType !== undefined ? categoryType : category.categoryType,
    description: description !== undefined ? description : category.description,
  });

  return category;
};

/**
 * Soft delete an expense category by ID
 * @param {string} categoryId - Expense category UUID
 * @returns {Promise<void>}
 */
const deleteExpenseCategory = async (categoryId) => {
  const category = await getExpenseCategoryById(categoryId);
  if (category.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Expense category is already deleted');
  }
  const expenses = await Expense.findAll({ where: { categoryId } });
  if (expenses.length > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete category with associated expenses');
  }
  await category.update({ isDeleted: true });
};
const restoreExpenseCategory = async (categoryId) => {
  const category = await getExpenseCategoryById(categoryId);
  if (!category.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Expense category is already restore');
  }
  const expenses = await Expense.findAll({ where: { categoryId } });
  if (expenses.length > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot restore category with associated expenses');
  }
  await category.update({ isDeleted: false });
};

/**
 * Hard delete an expense category by ID
 * @param {string} categoryId - Expense category UUID
 * @returns {Promise<void>}
 */
const hardDeleteExpenseCategory = async (categoryId) => {
  const category = await getExpenseCategoryById(categoryId);
  const expenses = await Expense.findAll({ where: { categoryId } });
  if (expenses.length > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete category with associated expenses');
  }
  await category.destroy();
};

module.exports = {
  createExpenseCategory,
  getAllExpenseCategories,
  getExpenseCategoryById,
  updateExpenseCategory,
  deleteExpenseCategory,
  restoreExpenseCategory,
  hardDeleteExpenseCategory,
};
