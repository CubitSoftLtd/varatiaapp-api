/* eslint-disable prettier/prettier */
const Joi = require('joi');

// Reusable UUID v4 schema
const uuidV4Schema = Joi.string().uuid({ version: 'uuidv4' });

const createPersonalExpense = {
    body: Joi.object().keys({
        beneficiary: Joi.string().required().min(1).max(100).messages({
            'string.base': 'Beneficiary must be a string',
            'string.empty': 'Beneficiary is required',
            'string.min': 'Beneficiary must be at least 1 character long',
            'string.max': 'Beneficiary cannot exceed 100 characters',
        }),
        categoryId: uuidV4Schema.required().messages({
            'string.base': 'Category ID must be a string',
            'string.empty': 'Category ID is required',
            'string.uuid': 'Category ID must be a valid UUID',
        }),
        amount: Joi.number().required().min(0.01).precision(2).messages({
            'number.base': 'Amount must be a number',
            'number.min': 'Amount must be at least 0.01',
            'number.precision': 'Amount must have at most 2 decimal places',
            'any.required': 'Amount is required',
        }),
        expenseDate: Joi.date().required().messages({
            'date.base': 'Expense date must be a valid date',
            'any.required': 'Expense date is required',
        }),
        description: Joi.string().max(1000).allow(null).messages({
            'string.base': 'Description must be a string',
            'string.max': 'Description cannot exceed 1000 characters',
        }),
    }),
};

const getPersonalExpenses = {
    query: Joi.object().keys({

        beneficiary: Joi.string().min(1).max(100).messages({
            'string.base': 'Beneficiary must be a string',
            'string.min': 'Beneficiary must be at least 1 character long',
            'string.max': 'Beneficiary cannot exceed 100 characters',
        }),
        expenseDate: Joi.date().messages({
            'date.base': 'Expense date must be a valid date',
        }),
        sortBy: Joi.string()
            .pattern(/^[a-zA-Z0-9_]+:(asc|desc)$/)
            .messages({
                'string.base': 'SortBy must be a string',
                'string.pattern.base': 'SortBy must be in the format "field:asc" or "field:desc"',
            }),
        limit: Joi.number().integer().min(1).default(10).messages({
            'number.base': 'Limit must be a number',
            'number.integer': 'Limit must be an integer',
            'number.min': 'Limit must be at least 1',
        }),
        page: Joi.number().integer().min(1).default(1).messages({
            'number.base': 'Page must be a number',
            'number.integer': 'Page must be an integer',
            'number.min': 'Page must be at least 1',
        }),
        include: Joi.string().optional().messages({
            'string.base': 'Include must be a string',
        }),
        deleted: Joi.string().valid('true', 'false', 'all').optional().messages({
            'string.base': 'Deleted must be a string',
            'any.only': 'Deleted must be one of "true", "false", or "all"',
        }),
    }),
};

const getPersonalExpense = {
    params: Joi.object().keys({
        id: uuidV4Schema.required().messages({
            'string.base': 'ID must be a string',
            'string.empty': 'ID is required',
            'string.uuid': 'ID must be a valid UUID',
        }),
    }),
};

const updatePersonalExpense = {
    params: Joi.object().keys({
        id: uuidV4Schema.required().messages({
            'string.base': 'ID must be a string',
            'string.empty': 'ID is required',
            'string.uuid': 'ID must be a valid UUID',
        }),
    }),
    body: Joi.object()
        .keys({
            beneficiary: Joi.string().required().min(1).max(100).messages({
                'string.base': 'Beneficiary must be a string',
                'string.empty': 'Beneficiary is required',
                'string.min': 'Beneficiary must be at least 1 character long',
                'string.max': 'Beneficiary cannot exceed 100 characters',
            }),
            categoryId: uuidV4Schema.messages({
                'string.base': 'Category ID must be a string',
                'string.uuid': 'Category ID must be a valid UUID',
            }),
            amount: Joi.number().min(0.01).precision(2).messages({
                'number.base': 'Amount must be a number',
                'number.min': 'Amount must be at least 0.01',
                'number.precision': 'Amount must have at most 2 decimal places',
            }),
            expenseDate: Joi.date().messages({
                'date.base': 'Expense date must be a valid date',
            }),
            description: Joi.string().max(1000).allow(null).messages({
                'string.base': 'Description must be a string',
                'string.max': 'Description cannot exceed 1000 characters',
            }),
        })
        .min(1)
        .messages({
            'object.min': 'At least one field must be provided for update',
        }),
};

const deletePersonalExpense = {
    params: Joi.object().keys({
        id: uuidV4Schema.required().messages({
            'string.base': 'ID must be a string',
            'string.empty': 'ID is required',
            'string.uuid': 'ID must be a valid UUID',
        }),
    }),
};
const restorePersonalExpense = {
    params: Joi.object().keys({
        id: uuidV4Schema.required().messages({
            'string.base': 'ID must be a string',
            'string.empty': 'ID is required',
            'string.uuid': 'ID must be a valid UUID',
        }),
    }),
};

const deleteHardPersonalExpense = {
    params: Joi.object().keys({
        id: uuidV4Schema.required().messages({
            'string.base': 'ID must be a string',
            'string.empty': 'ID is required',
            'string.uuid': 'ID must be a valid UUID',
        }),
    }),
};

module.exports = {
    createPersonalExpense,
    getPersonalExpenses,
    getPersonalExpense,
    updatePersonalExpense,
    deletePersonalExpense,
    deleteHardPersonalExpense,
    restorePersonalExpense,
};