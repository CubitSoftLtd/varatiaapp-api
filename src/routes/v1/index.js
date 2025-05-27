const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
// const accountRoute = require('./account.route');
// const propertyRoute = require('./property.route');
// const unitRoute = require('./unit.route');
// const tenantRoute = require('./tenant.route');
// const leaseRoute = require('./lease.route');
// const billRoute = require('./bill.route');
// const paymentRoute = require('./payment.route');
// const utilityTypeRoute = require('./utilityType.route');
// const meterRoute = require('./meter.route');
// const subMeterRoute = require('./subMeter.route');
// const meterReadingRoute = require('./meterReading.route');
// const utilityChargeRoute = require('./utilityCharge.route');
// const expenseCategoryRoute = require('./expenseCategory.route');
// const expenseRoute = require('./expense.route');
// const maintenanceRequestRoute = require('./maintenanceRequest.route');
// const reportingRoute = require('./reporting.route');
// const notificationRoute = require('./notification.route');
// const adminRoute = require('./admin.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  // {
  //   path: '/accounts',
  //   route: accountRoute,
  // },
  // {
  //   path: '/properties',
  //   route: propertyRoute,
  // },
  // {
  //   path: '/properties/:propertyId/units',
  //   route: unitRoute,
  // },
  // {
  //   path: '/units/:unitId',
  //   route: unitRoute,
  // },
  // {
  //   path: '/tenants',
  //   route: tenantRoute,
  // },
  // {
  //   path: '/leases',
  //   route: leaseRoute,
  // },
  // {
  //   path: '/leases/:leaseId/bills',
  //   route: billRoute,
  // },
  // {
  //   path: '/bills/:billId',
  //   route: billRoute,
  // },
  // {
  //   path: '/bills/:billId/payments',
  //   route: paymentRoute,
  // },
  // {
  //   path: '/leases/:leaseId/payments',
  //   route: paymentRoute,
  // },
  // {
  //   path: '/utility-types',
  //   route: utilityTypeRoute,
  // },
  // {
  //   path: '/properties/:propertyId/meters',
  //   route: meterRoute,
  // },
  // {
  //   path: '/meters/:meterId',
  //   route: meterRoute,
  // },
  // {
  //   path: '/meters/:meterId/units/:unitId/sub-meters',
  //   route: subMeterRoute,
  // },
  // {
  //   path: '/units/:unitId/sub-meters',
  //   route: subMeterRoute,
  // },
  // {
  //   path: '/meters/:meterId/sub-meters/:subMeterId/meter-readings',
  //   route: meterReadingRoute,
  // },
  // {
  //   path: '/meter-readings/:id',
  //   route: meterReadingRoute,
  // },
  // {
  //   path: '/utility-types/:utilityTypeId/utility-charges',
  //   route: utilityChargeRoute,
  // },
  // {
  //   path: '/utility-charges/:id',
  //   route: utilityChargeRoute,
  // },
  // {
  //   path: '/expense-categories',
  //   route: expenseCategoryRoute,
  // },
  // {
  //   path: '/properties/:propertyId/expenses',
  //   route: expenseRoute,
  // },
  // {
  //   path: '/expenses/:id',
  //   route: expenseRoute,
  // },
  // {
  //   path: '/units/:unitId/maintenance-requests',
  //   route: maintenanceRequestRoute,
  // },
  // {
  //   path: '/maintenance-requests/:id',
  //   route: maintenanceRequestRoute,
  // },
  // {
  //   path: '/leases/:leaseId/billing',
  //   route: billingRoute,
  // },
  // {
  //   path: '/reports',
  //   route: reportingRoute,
  // },
  // {
  //   path: '/notifications',
  //   route: notificationRoute,
  // },
  // {
  //   path: '/admin',
  //   route: adminRoute,
  // },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {

  // Register the route with the router
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
