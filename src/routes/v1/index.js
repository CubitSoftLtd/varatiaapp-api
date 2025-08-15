const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const accountRoute = require('./account.route');
const propertyRoute = require('./property.route');
const unitRoute = require('./unit.route');
const tenantRoute = require('./tenant.route');
const billRoute = require('./bill.route');
const paymentRoute = require('./payment.route');
const utilityTypeRoute = require('./utilityType.route');
const meterRoute = require('./meter.route');
const subMeterRoute = require('./subMeter.route');
const meterReadingRoute = require('./meterReading.route');
const expenseCategoryRoute = require('./expenseCategory.route');
const expenseRoute = require('./expense.route');
const roleRoute = require('./role.route');
const leaseRoute = require('./lease.route');
const meterChargeRoute = require('./meterCharge.route');
const personalExpenseRoute = require('./personalExpense.route');
// Removed direct mounting of expenseRoute under /expenses
const reportingRoute = require('./reporting.route');
const notificationRoute = require('./notification.route');
const beneficiaryRoute = require('./beneficiary.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  { path: '/auth', route: authRoute },
  { path: '/users', route: userRoute },
  { path: '/accounts', route: accountRoute },
  { path: '/properties', route: propertyRoute },
  { path: '/units', route: unitRoute },
  { path: '/tenants', route: tenantRoute },
  { path: '/bills', route: billRoute },
  { path: '/payments', route: paymentRoute },
  { path: '/utility-types', route: utilityTypeRoute },
  { path: '/meters', route: meterRoute },
  { path: '/sub-meters', route: subMeterRoute },
  { path: '/meter-readings', route: meterReadingRoute },
  { path: '/expense-categories', route: expenseCategoryRoute },
  { path: '/expenses', route: expenseRoute },
  { path: '/reports', route: reportingRoute },
  { path: '/notifications', route: notificationRoute },
  { path: '/roles', route: roleRoute },
  { path: '/leases', route: leaseRoute },
  { path: '/meter-charges', route: meterChargeRoute },
  { path: '/personal-expenses', route: personalExpenseRoute },
  { path: '/beneficiaries', route: beneficiaryRoute },
];

const devRoutes = [{ path: '/docs', route: docsRoute }];

// Add logging to identify the problematic route
defaultRoutes.forEach((route) => {
  if (!route.route) {
    // eslint-disable-next-line no-console
    console.error(`Warning: Route for path ${route.path} is undefined. Skipping...`);
    return;
  }
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    if (!route.route) {
      // eslint-disable-next-line no-console
      console.error(`Warning: Route for path ${route.path} in development is undefined. Skipping...`);
      return;
    }
    router.use(route.path, route.route);
  });
}

// Last updated: June 03, 2025, 03:14 PM +06
module.exports = router;
