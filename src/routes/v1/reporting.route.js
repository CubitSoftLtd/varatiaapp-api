// src/routes/v1/reporting.route.js
const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const reportingValidation = require('../../validations/reporting.validation');
const reportingController = require('../../controllers/reporting.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reporting
 *   description: Reporting and analytics
 */

/**
 * @swagger
 * /reports/financial-summary:
 *   get:
 *     summary: Get financial summary
 *     description: Admins and owners can retrieve financial summaries.
 *     tags: [Reporting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the summary (e.g., "2025-01-01")
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the summary (e.g., "2025-05-27")
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalIncome:
 *                   type: number
 *                 totalExpenses:
 *                   type: number
 *                 netProfit:
 *                   type: number
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /reports/maintenance-stats:
 *   get:
 *     summary: Get maintenance request statistics
 *     description: Admins and owners can retrieve maintenance statistics.
 *     tags: [Reporting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: integer
 *         description: Filter by property ID (optional)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 openRequests:
 *                   type: integer
 *                 closedRequests:
 *                   type: integer
 *                 averageResolutionTime:
 *                   type: number
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

router
  .route('/financial-summary')
  .get(auth('getReports'), validate(reportingValidation.getFinancialSummary), reportingController.getFinancialSummary);

router
  .route('/maintenance-stats')
  .get(auth('getReports'), validate(reportingValidation.getMaintenanceStats), reportingController.getMaintenanceStats);

module.exports = router;
