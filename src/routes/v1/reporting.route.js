const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const reportingValidation = require('../../validations/reporting.validation');
const reportingController = require('../../controllers/reporting.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Re generation and retrieval
 */

/**
 * @swagger
 * /reports/financial:
 *   get:
 *     summary: Get financial re
 *     description: Retrieve a financial re with total revenue, expenses, and outstanding payments.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the re (e.g., 2025-01-01)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the re (e.g., 2025-05-28)
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: integer
 *         description: Filter by property ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by field in the form of field:desc/asc (ex. generatedAt:desc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of records
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRevenue:
 *                   type: number
 *                   example: 5000
 *                 totalExpenses:
 *                   type: number
 *                   example: 2000
 *                 outstandingPayments:
 *                   type: number
 *                   example: 1000
 *                 profit:
 *                   type: number
 *                   example: 3000
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-05-28T10:57:00.000Z
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /reports/tenant-activity:
 *   get:
 *     summary: Get tenant activity re
 *     description: Retrieve a tenant activity re with lease status, payment history, and maintenance requests.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the re (e.g., 2025-01-01)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the re (e.g., 2025-05-28)
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: integer
 *         description: Filter by tenant ID
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: integer
 *         description: Filter by unit ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by field in the form of field:desc/asc (ex. generatedAt:desc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of records
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 leases:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                         format: date
 *                       endDate:
 *                         type: string
 *                         format: date
 *                 payments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       amount:
 *                         type: number
 *                       paymentDate:
 *                         type: string
 *                         format: date-time
 *                 maintenanceRequests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-05-28T10:57:00.000Z
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 * /reports/monthly-financial:
 *   get:
 *     summary: Get monthly financial report
 *     description: Retrieve a month-wise financial report with total revenue and expenses.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           example: 2025
 *         description: Year for the report (defaults to current year)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 year:
 *                   type: integer
 *                   example: 2025
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: Jan
 *                       revenue:
 *                         type: number
 *                         example: 4000
 *                       expense:
 *                         type: number
 *                         example: 2400
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-07-14T12:00:00.000Z
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 * /reports/tenant-history:
 *   get:
 *     summary: Get tenant history report
 *     description: Retrieve a month-wise financial report with total revenue and expenses.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *           example: a1b2c3d4
 *         description: ID of the tenant
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-07-01
 *         description: Start date of the report period (optional)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-07-31
 *         description: End date of the report period (optional)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 leases:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       status:
 *                         type: string
 *                       leaseStartDate:
 *                         type: string
 *                         format: date
 *                       leaseEndDate:
 *                         type: string
 *                         format: date
 *                       moveInDate:
 *                         type: string
 *                         format: date
 *                       moveOutDate:
 *                         type: string
 *                         format: date
 *                 payments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       billId:
 *                         type: string
 *                         format: uuid
 *                       paymentMethod:
 *                         type: integer
 *                       amountPaid:
 *                         type: number
 *                       paymentDate:
 *                         type: string
 *                         format: date
 *                 bills:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       invoiceNo:
 *                         type: string
 *                       billingPeriodStart:
 *                         type: string
 *                         format: date
 *                       billingPeriodEnd:
 *                         type: string
 *                         format: date
 *                       rentAmount:
 *                         type: number
 *                       totalUtilityAmount:
 *                         type: number
 *                       otherChargesAmount:
 *                         type: number
 *                       totalAmount:
 *                         type: number
 *                       amountPaid:
 *                         type: number
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-05-28T10:57:00.000Z
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
/**
 * @swagger
 * /reports/bill-pie:
 *   get:
 *     summary: Get year-wise bill payment pie report
 *     description: Returns the percentage of paid vs outstanding bills for a given year.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           example: 2025
 *         description: The year for which to generate the report
 *     responses:
 *       "200":
 *         description: Pie data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     enum: [Paid, Outstanding]
 *                   value:
 *                     type: number
 *                     format: float
 *                     example: 70.25
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
/**
 * @swagger
 * /reports/meter-recharges:
 *   get:
 *     summary: Get year-wise bill payment pie report
 *     description: Returns the Meter recharge of a month and year .
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-07-01
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-07-31
 *         description: The year for which to generate the report
 *       - in: query
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           example: a1b2c3d4
 *         description: ID of the tenant
 *       - in: query
 *         name: meterId
 *         required: false
 *         schema:
 *           type: string
 *           example: a1b2c3d4
 *         description: ID of the tenant
 *     responses:
 *       "200":
 *         description: Pie data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     enum: [Paid, Outstanding]
 *                   value:
 *                     type: number
 *                     format: float
 *                     example: 70.25
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
/**
 * @swagger
 * /reports/submeter-consumption:
 *   get:
 *     summary: Get submeter consumption report
 *     description: Retrieve submeter usage and cost within a specified period.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the property
 *       - in: query
 *         name: meterId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by a specific meter (optional)
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-07-01
 *         description: Start date of the report
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-07-31
 *         description: End date of the report
 *     responses:
 *       "200":
 *         description: Submeter report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   unitName:
 *                     type: string
 *                   meterId:
 *                     type: string
 *                     format: uuid
 *                   consumption:
 *                     type: number
 *                   cost:
 *                     type: number
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
router.route('/financial').get(auth(), validate(reportingValidation.getFinancialRe), reportingController.getFinancialReport);

router
  .route('/tenant-activity')
  .get(auth(), validate(reportingValidation.getTenantActivityReport), reportingController.getTenantActivityReport);
router
  .route('/monthly-financial')
  .get(auth(), validate(reportingValidation.getMonthlyFinancialReport), reportingController.getMonthlyRevenueExpenseReport);
router
  .route('/tenant-history')
  .get(auth(), validate(reportingValidation.getTenantHistoryValidate), reportingController.getTenantHistoryReportController);
router
  .route('/bill-pie')
  .get(auth(), validate(reportingValidation.getBillPaymentPieByYear), reportingController.getBillPaymentPieByYear);
router
  .route('/meter-recharges')
  .get(auth(), validate(reportingValidation.getMeterRechargeReport), reportingController.getMeterRechargeReport);
router
  .route('/submeter-consumption')
  .get(auth(), validate(reportingValidation.getSubmeterConsumptionReport), reportingController.getSubmeterConsumptionReport);
module.exports = router;
