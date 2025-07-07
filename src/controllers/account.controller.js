const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { accountService, userService } = require('../services');
const { User, Property, Payment, Expense } = require('../models');

// Helper function to parse include query parameter
const parseInclude = (include) => {
  if (!include) return [];

  return include
    .split('|')
    .map((item) => {
      const [modelName, attributesString] = item.split(':'); // Renamed for clarity

      const modelMap = {
        users: User,
        properties: Property,
        payments: Payment,
        expenses: Expense,
      };

      const model = modelMap[modelName];

      if (!model) {
        // Handle cases where the modelName is not found in modelMap
        // You might want to log a warning or throw an error here depending on your application's needs
        return null; // Return null to be filtered out later
      }

      const includeObject = {
        model,
        as: modelName,
      };

      if (attributesString) {
        includeObject.attributes = attributesString.split(',');
      }

      return includeObject;
    })
    .filter((item) => item !== null); // Filter out any null entries from invalid models
};

const createAccount = catchAsync(async (req, res) => {
  // Create the account
  const account = await accountService.createAccount(req.body);

  // If account creation succeeded, provision the initial admin user
  if (account) {
    const { contactEmail, contactName } = req.body;

    await userService.createUser({
      accountId: account.id,
      email: contactEmail,
      name: contactName,
      role: 'account_admin',
      // In production, generate a secure random password or require admin to set
      password: 'Demo@1234',
    });

    // Generate email verification token and send welcome email
    // const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);
    // await emailService.sendVerificationEmail(user.email, verifyEmailToken);
  }

  res.status(httpStatus.CREATED).send(account);
});

const getAccounts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'subscriptionType']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const isActive = req.query.isActive || 'true'; // Default to 'false'
  options.include = parseInclude(req.query.include);
  const accounts = await accountService.getAllAccounts(filter, options, isActive);

  res.send(accounts);
});

const getAccountById = catchAsync(async (req, res) => {
  const account = await accountService.getAccountById(req.params.id, parseInclude(req.query.include));
  res.send(account);
});

const updateAccountById = catchAsync(async (req, res) => {
  const account = await accountService.updateAccount(req.params.id, req.body);
  res.send(account);
});

const deleteAccountById = catchAsync(async (req, res) => {
  await accountService.deleteAccount(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});
const restoreAccountById = catchAsync(async (req, res) => {
  await accountService.restoreAccount(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const hardDeleteAccountById = catchAsync(async (req, res) => {
  await accountService.hardDeleteAccount(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccountById,
  deleteAccountById,
  restoreAccountById,
  hardDeleteAccountById,
};
