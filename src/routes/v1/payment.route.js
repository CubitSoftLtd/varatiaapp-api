const express = require('express');
const validate = require('../../middlewares/validate');
const paymentValidation = require('../../validations/payment.validation');
const paymentController = require('../../controllers/payment.controller');

const router = express.Router({ mergeParams: true }); // mergeParams to inherit billId from parent route

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management and retrieval
 */

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Create a new payment
 *     description: |
 *       Only admins can create new payments.
 *       Last updated: June 11, 2025, 12:34 PM +06.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - billId
 *               - accountId
 *               - amountPaid
 *               - paymentMethod
 *             properties:
 *               billId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the bill
 *               tenantId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the tenant (optional)
 *                 nullable: true
 *               accountId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the account
 *               amountPaid:
 *                 type: number
 *                 description: Amount paid
 *               paymentDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of payment
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, credit_card, bank_transfer, mobile_payment, check, online]
 *                 description: Payment method
 *               transactionId:
 *                 type: string
 *                 description: External transaction ID
 *                 nullable: true
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *                 nullable: true
 *             example:
 *               billId: 123e4567-e89b-12d3-a456-426614174000
 *               tenantId: 223e4567-e89b-12d3-a456-426614174001
 *               accountId: 323e4567-e89b-12d3-a456-426614174002
 *               amountPaid: 500.00
 *               paymentDate: 2025-06-11T12:00:00Z
 *               paymentMethod: credit_card
 *               transactionId: TXN123456
 *               notes: Partial payment for June rent
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all payments
 *     description: |
 *       Only admins can retrieve all payments.
 *       Last updated: June 11, 2025, 12:34 PM +06.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: billId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by bill ID
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by tenant ID
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by account ID
 *       - in: query
 *         name: paymentDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by payment date
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [cash, credit_card, bank_transfer, mobile_payment, check, online]
 *         description: Filter by payment method
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by query in the form of field:desc/asc (ex. paymentDate:desc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of payments
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
 *         description: Comma-separated list of associations and attributes (ex. bill:id,totalAmount|tenant:id,notes)
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
 *                     $ref: '#/components/schemas/Payment'
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
 * /payments/{id}:
 *   get:
 *     summary: Get a payment by ID
 *     description: |
 *       Only admins can fetch payments.
 *       Last updated: June 11, 2025, 12:34 PM +06.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payment ID
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         description: Comma-separated list of associations and attributes (ex. bill:id,totalAmount|tenant:id,notes)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a payment by ID
 *     description: |
 *       Only admins can update payments. billId cannot be updated.
 *       Last updated: June 11, 2025, 12:34 PM +06.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payment ID
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
 *                 description: ID of the tenant (optional)
 *                 nullable: true
 *               amountPaid:
 *                 type: number
 *                 description: Amount paid
 *               paymentDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of payment
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, credit_card, bank_transfer, mobile_payment, check, online]
 *                 description: Payment method
 *               transactionId:
 *                 type: string
 *                 description: External transaction ID
 *                 nullable: true
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *                 nullable: true
 *             example:
 *               amountPaid: 600.00
 *               paymentMethod: bank_transfer
 *               notes: Updated payment amount
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
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
 *     summary: Soft delete a payment by ID
 *     description: |
 *       Marks the payment as deleted. Only admins can soft delete payments.
 *       Last updated: June 11, 2025, 12:34 PM +06.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payment ID
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
 * /payments/{id}/hard:
 *   delete:
 *     summary: Hard delete a payment by ID
 *     description: |
 *       Permanently deletes the payment. Only admins can perform a hard delete.
 *       Last updated: June 11, 2025, 12:34 PM +06.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payment ID
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
 * /bills/{billId}/payments:
 *   get:
 *     summary: Get all payments for a bill
 *     description: |
 *       Only admins can retrieve payments for a specific bill.
 *       Last updated: June 11, 2025, 12:34 PM +06.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: billId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bill ID
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         description: Comma-separated list of associations and attributes (ex. bill:id,totalAmount|tenant:id,notes)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Payment'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

router
  .route('/')
  .post(validate(paymentValidation.createPayment), paymentController.createPayment)
  .get(validate(paymentValidation.getPayments), paymentController.getPayments)
  .get(validate(paymentValidation.getPaymentsByBillId), paymentController.getPaymentsByBillId);

router
  .route('/:id')
  .get(validate(paymentValidation.getPayment), paymentController.getPaymentById)
  .patch(validate(paymentValidation.updatePayment), paymentController.updatePaymentById)
  .delete(validate(paymentValidation.deletePayment), paymentController.deletePaymentById);

router.route('/:id/hard').delete(validate(paymentValidation.deletePayment), paymentController.hardDeletePaymentById);

module.exports = router;
