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
 * /bills/{billId}/payments:
 *   post:
 *     summary: Create a new payment for a bill
 *     description: Tenants can create payments for their bills. Admins can create payments on behalf of tenants.
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
 *         description: UUID of the bill
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amountPaid
 *               - paymentDate
 *               - paymentMethod
 *             properties:
 *               amountPaid:
 *                 type: number
 *                 description: Payment amount
 *               paymentDate:
 *                 type: string
 *                 format: date
 *                 description: Date of the payment
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, credit_card, bank_transfer, mobile_payment, check]
 *                 description: Method of payment
 *             example:
 *               amountPaid: 500.00
 *               paymentDate: "2025-05-27"
 *               paymentMethod: "credit_card"
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
 *     summary: Get all payments for a specific bill
 *     description: Retrieves all payments associated with a specific bill ID.
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
 *         description: UUID of the bill
 *     responses:
 *       "200":
 *         description: A list of payments
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

/**
 * @swagger
 * /bills/{billId}/payments/{id}:
 *   get:
 *     summary: Get a payment
 *     description: Admins can fetch any payment. Tenants can fetch their own payments.
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
 *         description: UUID of the bill
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payment ID
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
 *     summary: Update a payment
 *     description: Only admins can update payments.
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
 *         description: UUID of the bill
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
 *               amountPaid:
 *                 type: number
 *                 description: Payment amount
 *               paymentDate:
 *                 type: string
 *                 format: date
 *                 description: Date of the payment
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, credit_card, bank_transfer, mobile_payment, check]
 *                 description: Method of payment
 *             example:
 *               amountPaid: 550.00
 *               paymentDate: "2025-05-28"
 *               paymentMethod: "bank_transfer"
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
 *     summary: Delete a payment
 *     description: Only admins can delete payments.
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
 *         description: UUID of the bill
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
 */

// Base route: /payments (under /bills/:billId/payments from parent)
router
  .route('/')
  .post(validate(paymentValidation.createPayment), paymentController.createPayment)
  .get(validate(paymentValidation.getPaymentsByBillId), paymentController.getPaymentsByBillId);

// Item route: /:id (under /bills/:billId/payments/:id from parent)
router
  .route('/:id')
  .get(validate(paymentValidation.getPayment), paymentController.getPaymentById)
  .patch(validate(paymentValidation.updatePayment), paymentController.updatePaymentById)
  .delete(validate(paymentValidation.deletePayment), paymentController.deletePaymentById);

module.exports = router;
