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
 */

router.route('/financial').get(auth(), validate(reportingValidation.getFinancialRe), reportingController.getFinancialReport);

router
  .route('/tenant-activity')
  .get(auth(), validate(reportingValidation.getTenantActivityReport), reportingController.getTenantActivityReport);

module.exports = router;
