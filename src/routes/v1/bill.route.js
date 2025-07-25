/* eslint-disable prettier/prettier */
const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const billValidation = require('../../validations/bill.validation');
const billController = require('../../controllers/bill.controller');
const paymentRouter = require('./payment.route');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bills
 *   description: Bill management and retrieval
 */

/**
 * @swagger
 * /bills:
 *   post:
 *     summary: Create a new bill
 *     description: |
 *       Only admins can create new bills.
 *       Last updated: June 15, 2025, 1:06 PM +06.
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenantId
 *               - unitId
 *               - billingPeriodStart
 *               - billingPeriodEnd
 *               - rentAmount
 *               - dueDate
 *             properties:
 *               tenantId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the tenant
 *               unitId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the unit
 *               billingPeriodStart:
 *                 type: string
 *                 format: date
 *                 description: Start date of the billing period
 *               billingPeriodEnd:
 *                 type: string
 *                 format: date
 *                 description: End date of the billing period
 *               rentAmount:
 *                 type: number
 *                 description: Rent amount for the period
 *               totalUtilityAmount:
 *                 type: number
 *                 description: Total utility amount for the period (optional, calculated if not provided)
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Due date for the bill
 *               issueDate:
 *                 type: string
 *                 format: date
 *                 description: Issue date of the bill
 *               notes:
 *                 type: string
 *                 description: Additional notes for the bill
 *                 nullable: true
 *             example:
 *               tenantId: 123e4567-e89b-12d3-a456-426614174000
 *               unitId: 223e4567-e89b-12d3-a456-426614174001
 *               billingPeriodStart: 2025-06-01
 *               billingPeriodEnd: 2025-06-30
 *               rentAmount: 1000.00
 *               totalUtilityAmount: 150.50
 *               dueDate: 2025-07-05
 *               issueDate: 2025-06-15
 *               notes: Monthly rent and utilities
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bill'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all bills
 *     description: |
 *       Only admins can retrieve all bills.
 *       Last updated: June 15, 2025, 1:06 PM +06.
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by tenant ID
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by unit ID
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by account ID
 *       - in: query
 *         name: billingPeriodStart
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by billing period start date
 *       - in: query
 *         name: billingPeriodEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by billing period end date
 *       - in: query
 *         name: dueDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by due date
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [unpaid, partially_paid, paid, overdue, cancelled]
 *         description: Filter by payment status
 *       - in: query
 *         name: deleted
 *         schema:
 *           type: string
 *           enum: [true, false, all]
 *         description: 'Filter accounts by deletion status (default: false)'
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by query in the form of field:desc/asc (ex. dueDate:desc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of bills
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         description: Comma-separated list of associations and attributes (ex. tenant:id,notes|payments:id,amount)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bill'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /bills/{id}:
 *   get:
 *     summary: Get a bill by ID
 *     description: |
 *       Only admins can fetch bills.
 *       Last updated: June 15, 2025, 1:06 PM +06.
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bill ID
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         description: Comma-separated list of associations and attributes (ex. tenant:id,notes|payments:id,amount)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bill'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a bill by ID
 *     description: |
 *       Only admins can update bills. Total utility amount is recalculated if billing period changes.
 *       Last updated: June 15, 2025, 1:06 PM +06.
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bill ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tenantId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the tenant
 *               unitId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the unit
 *               billingPeriodStart:
 *                 type: string
 *                 format: date
 *                 description: Start date of the billing period
 *               billingPeriodEnd:
 *                 type: string
 *                 format: date
 *                 description: End date of the billing period
 *               rentAmount:
 *                 type: number
 *                 description: Rent amount for the period
 *               totalUtilityAmount:
 *                 type: number
 *                 description: Total utility amount for the period (optional, calculated if not provided)
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Due date for the bill
 *               issueDate:
 *                 type: string
 *                 format: date
 *                 description: Issue date of the bill
 *               paymentStatus:
 *                 type: string
 *                 enum: [unpaid, partially_paid, paid, overdue, cancelled]
 *                 description: Payment status of the bill
 *               notes:
 *                 type: string
 *                 description: Additional notes for the bill
 *                 nullable: true
 *             example:
 *               rentAmount: 1100.00
 *               totalUtilityAmount: 160.75
 *               dueDate: 2025-07-10
 *               notes: Updated rent and utility amounts
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bill'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Soft delete a bill by ID
 *     description: |
 *       Marks the bill as deleted. Only admins can soft delete bills.
 *       Last updated: June 15, 2025, 1:06 PM +06.
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bill ID
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 * /bills/{id}/restore:
 *   delete:
 *     summary: Restore a bill by ID
 *     description: |
 *      Restore a bill. Only admins can perform a restore.
 *       Last updated: June 15, 2025, 1:06 PM +06.
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bill ID
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 * /bills/{id}/hard:
 *   delete:
 *     summary: Hard delete a bill by ID
 *     description: |
 *       Permanently deletes the bill. Only admins can perform a hard delete.
 *       Last updated: June 15, 2025, 1:06 PM +06.
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bill ID
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /bills/property/{propertyId}:
 *   get:
 *     summary: Get all tenant bills for a property within a date range
 *     description: |
 *       Retrieves bills for all tenants in units belonging to the specified property, filtered by a date range.
 *       Only admins can access bills for any property. Account owners can access bills for their own properties.
 *       Last updated: June 25, 2025, 03:58 PM +06.
 *     tags:
 *       - Bills
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Property ID
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date of the billing period range (e.g., 2025-06-01)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date of the billing period range (e.g., 2025-06-30)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           pattern: '^[a-zA-Z]+:(asc|desc)$'
 *         description: Sort by field (e.g., billingPeriodStart:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Maximum number of bills
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         description: Comma-separated list of associations (e.g., tenant:id,name|unit:id,name)
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bill'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /bills/property/{propertyId}/print:
 *   get:
 *     summary: Get tenant bills for a property within a date range for printing
 *     description: |
 *       Retrieves bills for all tenants in units belonging to the specified property, formatted for printing (e.g., invoices).
 *       Includes tenant and unit details. Only admins can access bills for any property. Account owners can access bills for their own properties.
 *       Last updated: June 25, 2025, 03:58 PM +06.
 *     tags:
 *       - Bills
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Property ID
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date of the billing period range (e.g., 2025-06-01)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date of the billing period range (e.g., 2025-06-30)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           pattern: '^[a-zA-Z]+:(asc|desc)$'
 *         description: Sort by field (e.g., billingPeriodStart:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Maximum number of bills
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       invoiceNo:
 *                         type: integer
 *                       fullInvoiceNumber:
 *                         type: string
 *                       tenantId:
 *                         type: string
 *                         format: uuid
 *                       unitId:
 *                         type: string
 *                         format: uuid
 *                       billingPeriodStart:
 *                         type: string
 *                         format: date
 *                       billingPeriodEnd:
 *                         type: string
 *                         format: date
 *                       rentAmountFormatted:
 *                         type: string
 *                       totalUtilityAmountFormatted:
 *                         type: string
 *                       totalAmountFormatted:
 *                         type: string
 *                       dueDate:
 *                         type: string
 *                         format: date
 *                       paymentStatus:
 *                         type: string
 *                       tenantName:
 *                         type: string
 *                       unitName:
 *                         type: string
 *                       unitAddress:
 *                         type: string
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 */

router
  .route('/')
  .post(auth('bill:create'), validate(billValidation.createBill), billController.createBill)
  .get(auth('bill:view_all', 'bill:view_own'), validate(billValidation.getBills), billController.getBills);

router
  .route('/:id')
  .get(auth('bill:view'), validate(billValidation.getBill), billController.getBillById)
  .patch(auth('bill:update'), validate(billValidation.updateBill), billController.updateBillById)
  .delete(auth('bill:delete'), validate(billValidation.deleteBill), billController.deleteBillById);
// .delete(auth('bill:delete'), validate(billValidation.restoreBill), billController.restoreBillById);

router
  .route('/:id/hard')
  .delete(auth('bill:hard_delete'), validate(billValidation.deleteBill), billController.hardDeleteBillById);
router
  .route('/:id/restore')
  .delete(auth('bill:restore'), validate(billValidation.restoreBill), billController.restoreBillById);

router
  .route('/property/:propertyId')
  .get(auth(), validate(billValidation.getBillsByPropertyAndDateRange), billController.getBillsByPropertyAndDateRange);

router
  .route('/property/:propertyId/print')
  .get(
    auth('report:management'),
    validate(billValidation.getBillsByPropertyForPrint),
    billController.getBillsByPropertyForPrint
  );

router.use('/:billId/payments', paymentRouter);

module.exports = router;
