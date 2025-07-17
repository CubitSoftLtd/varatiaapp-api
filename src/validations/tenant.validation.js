const Joi = require('joi');

const statusTypes = {
  CURRENT: 'current',
  PROSPECTIVE: 'prospective',
  PAST: 'past',
  EVICTED: 'evicted',
  NOTICE: 'notice',
  INACTIVE: 'inactive',
};

const phoneRegex = /^\+?[0-9\s\-.()]{7,25}$/;
const nationalIdRegex = /^[A-Za-z0-9\-/]{5,50}$/;

const createTenant = {
  body: Joi.object().keys({
    firstName: Joi.string().required().min(1).max(100).messages({
      'string.base': 'First name must be a string',
      'string.empty': 'First name is required',
      'string.min': 'First name must be at least 1 character long',
      'string.max': 'First name cannot exceed 100 characters',
    }),
    lastName: Joi.string().required().min(1).max(100).messages({
      'string.base': 'Last name must be a string',
      'string.empty': 'Last name is required',
      'string.min': 'Last name must be at least 1 character long',
      'string.max': 'Last name cannot exceed 100 characters',
    }),
    email: Joi.string().required().email().max(255).messages({
      'string.base': 'Email must be a string',
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address',
      'string.max': 'Email cannot exceed 255 characters',
    }),
    phoneNumber: Joi.string().required().pattern(phoneRegex).messages({
      'string.base': 'Phone number must be a string',
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Phone number must be valid (7-25 characters, digits, spaces, +, -, () allowed)',
    }),
    emergencyContactName: Joi.string().max(255).allow(null).messages({
      'string.base': 'Emergency contact name must be a string',
      'string.max': 'Emergency contact name cannot exceed 255 characters',
    }),
    emergencyContactPhone: Joi.string().pattern(phoneRegex).allow(null).messages({
      'string.base': 'Emergency contact phone must be a string',
      'string.pattern.base': 'Emergency contact phone must be valid (7-25 characters, digits, spaces, +, -, () allowed)',
    }),
    // unitId: Joi.string()
    //   .uuid({ version: ['uuidv4'] })
    //   .allow(null)
    //   .messages({
    //     'string.base': 'Unit ID must be a string',
    //     'string.uuid': 'Unit ID must be a valid UUID',
    //   }),
    // leaseStartDate: Joi.date().required().messages({
    //   'date.base': 'Lease start date must be a valid date',
    //   'any.required': 'Lease start date is required',
    // }),
    // leaseEndDate: Joi.date().allow(null).messages({
    //   'date.base': 'Lease end date must be a valid date',
    // }),
    depositAmount: Joi.number().required().min(0).precision(2).messages({
      'number.base': 'Deposit amount must be a number',
      'number.min': 'Deposit amount cannot be negative',
      'number.precision': 'Deposit amount must have at most 2 decimal places',
      'any.required': 'Deposit amount is required',
    }),
    status: Joi.string()
      .valid(...Object.values(statusTypes))
      .default('current')
      .messages({
        'string.base': 'Status must be a string',
        'any.only': 'Status must be one of: current, prospective, past, evicted, notice, inactive',
      }),
    nationalId: Joi.string().pattern(nationalIdRegex).allow(null).messages({
      'string.base': 'National ID must be a string',
      'string.pattern.base': 'National ID must be valid (5-50 characters, alphanumeric, hyphen, slash allowed)',
    }),
    // moveInDate: Joi.date().allow(null).messages({
    //   'date.base': 'Move-in date must be a valid date',
    // }),
    // moveOutDate: Joi.date().allow(null).messages({
    //   'date.base': 'Move-out date must be a valid date',
    // }),
    notes: Joi.string().max(65535).allow(null).messages({
      'string.base': 'Notes must be a string',
      'string.max': 'Notes cannot exceed 65535 characters',
    }),
  }),
};

const getTenants = {
  query: Joi.object().keys({
    firstName: Joi.string().min(1).max(100).messages({
      'string.base': 'First name must be a string',
      'string.min': 'First name must be at least 1 character long',
      'string.max': 'First name cannot exceed 100 characters',
    }),
    lastName: Joi.string().min(1).max(100).messages({
      'string.base': 'Last name must be a string',
      'string.min': 'Last name must be at least 1 character long',
      'string.max': 'Last name cannot exceed 100 characters',
    }),
    email: Joi.string().email().max(255).messages({
      'string.base': 'Email must be a string',
      'string.email': 'Email must be a valid email address',
      'string.max': 'Email cannot exceed 255 characters',
    }),
    phoneNumber: Joi.string().pattern(phoneRegex).messages({
      'string.base': 'Phone number must be a string',
      'string.pattern.base': 'Phone number must be valid (7-25 characters, digits, spaces, +, -, () allowed)',
    }),
    unitId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .messages({
        'string.base': 'Unit ID must be a string',
        'string.uuid': 'Unit ID must be a valid UUID',
      }),
    status: Joi.string()
      .valid(...Object.values(statusTypes))
      .messages({
        'string.base': 'Status must be a string',
        'any.only': 'Status must be one of: current, prospective, past, evicted, notice, inactive',
      }),
    sortBy: Joi.string()
      .pattern(/^[a-zA-Z]+:(asc|desc)$/)
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
      'string.base': 'include must be a string',
    }), // Added include parameter
    deleted: Joi.string().valid('true', 'false', 'all').optional().messages({
      'string.base': 'Deleted must be a string',
      'any.only': 'Deleted must be one of "true", "false", or "all"',
    }),
  }),
};

const getTenant = {
  params: Joi.object().keys({
    id: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'ID must be a string',
        'string.empty': 'ID is required',
        'string.uuid': 'ID must be a valid UUID',
      }),
  }),
  query: Joi.object().keys({
    include: Joi.string().optional().messages({
      'string.base': 'include must be a string',
    }), // Added include parameter
  }),
};

const updateTenant = {
  params: Joi.object().keys({
    id: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'ID must be a string',
        'string.empty': 'ID is required',
        'string.uuid': 'ID must be a valid UUID',
      }),
  }),
  body: Joi.object()
    .keys({
      firstName: Joi.string().min(1).max(100).messages({
        'string.base': 'First name must be a string',
        'string.min': 'First name must be at least 1 character long',
        'string.max': 'First name cannot exceed 100 characters',
      }),
      lastName: Joi.string().min(1).max(100).messages({
        'string.base': 'Last name must be a string',
        'string.min': 'Last name must be at least 1 character long',
        'string.max': 'Last name cannot exceed 100 characters',
      }),
      email: Joi.string().email().max(255).messages({
        'string.base': 'Email must be a string',
        'string.email': 'Email must be a valid email address',
        'string.max': 'Email cannot exceed 255 characters',
      }),
      phoneNumber: Joi.string().pattern(phoneRegex).messages({
        'string.base': 'Phone number must be a string',
        'string.pattern.base': 'Phone number must be valid (7-25 characters, digits, spaces, +, -, () allowed)',
      }),
      emergencyContactName: Joi.string().max(255).allow(null).messages({
        'string.base': 'Emergency contact name must be a string',
        'string.max': 'Emergency contact name cannot exceed 255 characters',
      }),
      emergencyContactPhone: Joi.string().pattern(phoneRegex).allow(null).messages({
        'string.base': 'Emergency contact phone must be a string',
        'string.pattern.base': 'Emergency contact phone must be valid (7-25 characters, digits, spaces, +, -, () allowed)',
      }),
      // unitId: Joi.string()
      //   .uuid({ version: ['uuidv4'] })
      //   .allow(null)
      //   .messages({
      //     'string.base': 'Unit ID must be a string',
      //     'string.uuid': 'Unit ID must be a valid UUID',
      //   }),
      // leaseStartDate: Joi.date().messages({
      //   'date.base': 'Lease start date must be a valid date',
      // }),
      // leaseEndDate: Joi.date().allow(null).messages({
      //   'date.base': 'Lease end date must be a valid date',
      // }),
      depositAmount: Joi.number().min(0).precision(2).messages({
        'number.base': 'Deposit amount must be a number',
        'number.min': 'Deposit amount cannot be negative',
        'number.precision': 'Deposit amount must have at most 2 decimal places',
      }),
      status: Joi.string()
        .valid(...Object.values(statusTypes))
        .messages({
          'string.base': 'Status must be a string',
          'any.only': 'Status must be one of: current, prospective, past, evicted, notice, inactive',
        }),
      nationalId: Joi.string().pattern(nationalIdRegex).allow(null).messages({
        'string.base': 'National ID must be a string',
        'string.pattern.base': 'National ID must be valid (5-50 characters, alphanumeric, hyphen, slash allowed)',
      }),
      // moveInDate: Joi.date().allow(null).messages({
      //   'date.base': 'Move-in date must be a valid date',
      // }),
      // moveOutDate: Joi.date().allow(null).messages({
      //   'date.base': 'Move-out date must be a valid date',
      // }),
      notes: Joi.string().max(65535).allow(null).messages({
        'string.base': 'Notes must be a string',
        'string.max': 'Notes cannot exceed 65535 characters',
      }),
    })
    .min(1)
    .messages({
      'object.min': 'At least one field must be provided for update',
    }),
};

const deleteTenant = {
  params: Joi.object().keys({
    id: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'ID must be a string',
        'string.empty': 'ID is required',
        'string.uuid': 'ID must be a valid UUID',
      }),
  }),
};

const deleteHardTenant = {
  params: Joi.object().keys({
    id: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'ID must be a string',
        'string.empty': 'ID is required',
        'string.uuid': 'ID must be a valid UUID',
      }),
  }),
};

const getTenantsByUnitAndProperty = {
  params: Joi.object().keys({
    propertyId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'Property ID must be a string',
        'string.empty': 'Property ID is required',
        'string.uuid': 'Property ID must be a valid UUID',
      }),
    unitId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'Unit ID must be a string',
        'string.empty': 'Unit ID is required',
        'string.uuid': 'Unit ID must be a valid UUID',
      }),
  }),
  query: Joi.object().keys({
    include: Joi.string().optional().messages({
      'string.base': 'include must be a string',
    }), // Added include parameter
  }),
};

const getHistoricalTenantsByUnit = {
  params: Joi.object().keys({
    unitId: Joi.string()
      .uuid({ version: ['uuidv4'] })
      .required()
      .messages({
        'string.base': 'Unit ID must be a string',
        'string.empty': 'Unit ID is required',
        'string.uuid': 'Unit ID must be a valid UUID',
      }),
  }),
  query: Joi.object().keys({
    startDate: Joi.date().required().messages({
      'date.base': 'Start date must be a valid date',
      'any.required': 'Start date is required',
    }),
    endDate: Joi.date().required().messages({
      'date.base': 'End date must be a valid date',
      'any.required': 'End date is required',
    }),
    include: Joi.string().optional().messages({
      'string.base': 'include must be a string',
    }), // Added include parameter
  }),
};

module.exports = {
  createTenant,
  getTenants,
  getTenant,
  updateTenant,
  deleteTenant,
  deleteHardTenant,
  getTenantsByUnitAndProperty,
  getHistoricalTenantsByUnit,
};
