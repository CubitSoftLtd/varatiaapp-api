/* eslint-disable prettier/prettier */
const httpStatus = require('http-status');
const { Beneficiary, Expense } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a new beneficiary with validation and transaction
 * @param {Object} beneficiaryBody - { name, categoryType, description? }
 * @returns {Promise<Beneficiary>}
 */
const createBeneficiary = async (beneficiaryBody) => {
    const { name,  description,accountId } = beneficiaryBody;

    // Validate required fields
    if (!name ) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Name is required');
    }

    // Check for existing category name
    const existingBeneficiary = await Beneficiary.findOne({ where: { name } });
    if (existingBeneficiary) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Beneficiary name already exists');
    }

    // Create category in a transaction
    const category = await Beneficiary.sequelize.transaction(async (t) => {
        return Beneficiary.create(
            {
                name,
                accountId,
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
 * @returns {Promise<{ results: Beneficiary[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
const getAllBeneficiary = async (filter, options, deleted = 'false') => {
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

    const { count, rows } = await Beneficiary.findAndCountAll({
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
 * @returns {Promise<Beneficiary>}
 */
const getBeneficiaryById = async (id, include = []) => {
    const ben = await Beneficiary.findByPk(id, { include });
    if (!ben) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Beneficiary not found');
    }
    return ben;
};

/**
 * Update an existing expense category by ID
 * @param {string} id - Expense category UUID
 * @param {Object} updateBody - { name?, categoryType?, description? }
 * @returns {Promise<Beneficiary>}
 */
const updateBeneficiary = async (id, updateBody) => {
    const ben = await getBeneficiaryById(id);
    // Validate name uniqueness if provided
    await ben.update({updateBody});

    return ben;
};

/**
 * Soft delete an expense category by ID
 * @param {string} id - Expense category UUID
 * @returns {Promise<void>}
 */
const deleteBeneficiary = async (id) => {
    const ben = await getBeneficiaryById(id);
    if (ben.isDeleted) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Beneficiary is already deleted');
    }
    await ben.update({ isDeleted: true });
};
const restoreBeneficiary = async (id) => {
    const ben = await getBeneficiaryById(id);
    if (!ben.isDeleted) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Beneficiary is already restore');
    }
    await ben.update({ isDeleted: false });
};

/**
 * Hard delete an expense category by ID
 * @param {string} id - Expense category UUID
 * @returns {Promise<void>}
 */
const hardDeleteBeneficiary = async (id) => {
    const ben = await getBeneficiaryById(id);
    await ben.destroy();
};

module.exports = {
    createBeneficiary,
    getAllBeneficiary,
    getBeneficiaryById,
    updateBeneficiary,
    deleteBeneficiary,
    restoreBeneficiary,
    hardDeleteBeneficiary,
};
