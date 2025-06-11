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
      const [model, attributes] = item.split(':');
      const modelMap = {
        users: User,
        properties: Property,
        payments: Payment,
        expenses: Expense,
      };
      return {
        model: modelMap[model],
        as: model,
        attributes: attributes.split(','),
      };
    })
    .filter((item) => item.model); // Filter out invalid models
};

const createAccount = catchAsync(async (req, res) => {
  // Log request body for debugging (consider replacing with a proper logger)
  // eslint-disable-next-line no-console
  console.debug('createAccount payload:', req.body);

  // Create the account
  const account = await accountService.createAccount(req.body);

  // If account creation succeeded, provision the initial admin user
  if (account) {
    const { contactEmail, adminFirstName, adminLastName } = req.body;

    await userService.createUser({
      accountId: account.id,
      email: contactEmail,
      firstName: adminFirstName,
      lastName: adminLastName,
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
  options.include = parseInclude(req.query.include);
  const accounts = await accountService.getAllAccounts(filter, options);

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
  hardDeleteAccountById,
};
