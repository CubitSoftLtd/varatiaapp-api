const express = require('express');
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
 *       Only admins and owners can create bills. Total amount is computed as rentAmount + totalUtilityAmount.
 *       Last updated: June 02, 2025, 10:50 PM +06.
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
 *               - billingPeriod
 *               - rentAmount
 *               - totalUtilityAmount
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
 *               billingPeriod:
 *                 type: string
 *                 description: Billing period in YYYY-MM format
 *               rentAmount:
 *                 type: number
 *                 description: Base rent amount
 *               totalUtilityAmount:
 *                 type: number
 *                 description: Total utility amount
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Due date for the bill payment
 *               paymentStatus:
 *                 type: string
 *                 enum: [unpaid, partially_paid, paid, overdue]
 *                 description: Payment status of the bill
 *                 default: unpaid
 *               paymentDate:
 *                 type: string
 *                 format: date
 *                 description: Date of payment, if paid
 *               notes:
 *                 type: string
 *                 description: Additional notes for the bill
 *             example:
 *               tenantId: "123e4567-e89b-12d3-a456-426614174001"
 *               unitId: "123e4567-e89b-12d3-a456-426614174002"
 *               billingPeriod: "2025-06"
 *               rentAmount: 1000.00
 *               totalUtilityAmount: 50.00
 *               dueDate: "2025-07-01"
 *               paymentStatus: "unpaid"
 *               paymentDate: null
 *               notes: "June bill"
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
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   get:
 *     summary: Get all bills
 *     description: |
 *       Admins and owners can retrieve all bills. Tenants can retrieve their own bills.
 *       Last updated: June 02, 2025, 10:50 PM +06.
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Tenant ID
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unit ID
 *       - in: query
 *         name: billingPeriod
 *         schema:
 *           type: string
 *         description: Billing period in YYYY-MM format
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [unpaid, partially_paid, paid, overdue]
 *         description: Payment status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by query in the form of field:desc/asc (ex. dueDate:asc)
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
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /bills/{id}:
 *   get:
 *     summary: Get a bill by ID
 *     description: |
 *       Admins and owners can fetch any bill. Tenants can fetch their own bills.
 *       Last updated: June 02, 2025, 10:50 PM +06.
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
 *       Only admins and owners can update bills.
 *       Last updated: June 02, 2025, 10:50 PM +06.
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
 *               rentAmount:
 *                 type: number
 *                 description: Base rent amount
 *               totalUtilityAmount:
 *                 type: number
 *                 description: Total utility amount
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Due date for the bill payment
 *               paymentStatus:
 *                 type: string
 *                 enum: [unpaid, partially_paid, paid, overdue]
 *                 description: Payment status of the bill
 *               paymentDate:
 *                 type: string
 *                 format: date
 *                 description: Date of payment, if paid
 *               notes:
 *                 type: string
 *                 description: Additional notes for the bill
 *             example:
 *               rentAmount: 1050.00
 *               totalUtilityAmount: 60.00
 *               dueDate: "2025-07-01"
 *               paymentStatus: "partially_paid"
 *               paymentDate: "2025-06-25"
 *               notes: "Updated June bill"
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
 *     summary: Delete a bill by ID
 *     description: |
 *       Only admins and owners can delete bills.
 *       Last updated: June 02, 2025, 10:50 PM +06.
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

router
  .route('/')
  .post(validate(billValidation.createBill), billController.createBill)
  .get(validate(billValidation.getBills), billController.getBills);

router
  .route('/:id')
  .get(validate(billValidation.getBill), billController.getBillById)
  .patch(validate(billValidation.updateBill), billController.updateBillById)
  .delete(validate(billValidation.deleteBill), billController.deleteBillById);

router.use('/:billId/payments', paymentRouter);

module.exports = router;
