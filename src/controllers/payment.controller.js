const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { paymentService } = require('../services');
const { Bill, Tenant, Account } = require('../models');

// Helper function to parse include query parameter
const parseInclude = (include) => {
  // If no include string is provided, simply return an empty array.
  if (!include) {
    return [];
  }

  return (
    include
      .split('|') // Split the include string by '|' to process each item.
      .map((item) => {
        // Destructure the item into the model name string and the attributes string.
        // If no ':' is present (e.g., "bill"), attributesString will be undefined.
        const [modelName, attributesString] = item.split(':');

        // Define your map of string keys to actual Sequelize model objects.
        const modelMap = {
          bill: Bill,
          tenant: Tenant,
          account: Account,
        };

        const model = modelMap[modelName];

        // If the model name isn't found in our map, return null.
        // This item will be filtered out at the end.
        if (!model) {
          return null;
        }

        // Build the Sequelize include options object.
        const includeOptions = {
          model,
          as: modelName, // The alias for the association.
          // Consider adding 'required: false' here if you want LEFT JOINs by default.
          // required: false,
        };

        // ONLY add the 'attributes' property if attributesString is defined.
        // If it's undefined, Sequelize will include all attributes by default,
        // which is usually what you want when no specific attributes are requested.
        if (attributesString) {
          includeOptions.attributes = attributesString.split(',');
        }

        return includeOptions;
      })
      // Filter out any 'null' entries that resulted from unknown model names.
      // The `.filter((item) => item)` you had works because null is a falsy value.
      // Explicitly checking for 'item !== null' can sometimes be clearer.
      .filter((item) => item !== null)
  );
};

const createPayment = catchAsync(async (req, res) => {
  const payment = await paymentService.createPayment({ ...req.body, accountId: req.user.accountId });
  res.status(httpStatus.CREATED).json(payment);
});

const getPayments = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['billId', 'tenantId', 'accountId', 'paymentDate', 'paymentMethod']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.include = parseInclude(req.query.include);
  const deleted = req.query.deleted || 'false'; // Default to 'false'

  if (req.user.role !== 'super_admin') {
    filter.accountId = req.user.accountId;
  }

  const payments = await paymentService.getAllPayments(filter, options, deleted);
  res.json(payments);
});

const getPaymentById = catchAsync(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.params.id, parseInclude(req.query.include));
  res.json(payment);
});

const getPaymentsByBillId = catchAsync(async (req, res) => {
  const payments = await paymentService.getPaymentsByBillId(req.params.billId, parseInclude(req.query.include));
  res.json(payments);
});

const updatePaymentById = catchAsync(async (req, res) => {
  const payment = await paymentService.updatePayment(req.params.id, req.body);
  res.json(payment);
});

const deletePaymentById = catchAsync(async (req, res) => {
  await paymentService.deletePayment(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeletePaymentById = catchAsync(async (req, res) => {
  await paymentService.hardDeletePayment(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  getPaymentsByBillId,
  updatePaymentById,
  deletePaymentById,
  hardDeletePaymentById,
};
