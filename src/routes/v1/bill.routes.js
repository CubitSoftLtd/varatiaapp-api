const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const billValidation = require('../../validations/bill.validation');
const billController = require('../../controllers/bill.controller');

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
 *     description: Only admins and owners can create bills.
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
 *               - leaseId
 *               - amount
 *               - dueDate
 *             properties:
 *               leaseId:
 *                 type: integer
 *                 description: ID of the lease
 *               amount:
 *                 type: number
 *                 description: Bill amount
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Due date of the bill
 *             example:
 *               leaseId: 1
 *               amount: 500.00
 *               dueDate: 2025-06-01
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
 *     description: Admins and owners can retrieve all bills. Tenants can retrieve their own bills.
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: leaseId
 *         schema:
 *           type: integer
 *         description: Lease ID
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
 */

/**
 * @swagger
 * /bills/{id}:
 *   get:
 *     summary: Get a bill
 *     description: Admins and owners can fetch any bill. Tenants can fetch their own bills.
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bill id
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
 *     summary: Update a bill
 *     description: Only admins and owners can update bills.
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bill id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Bill amount
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Due date of the bill
 *               status:
 *                 type: string
 *                 enum: [pending, paid, overdue]
 *                 description: Bill status
 *             example:
 *               amount: 550.00
 *               dueDate: 2025-06-15
 *               status: pending
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
 *     summary: Delete a bill
 *     description: Only admins and owners can delete bills.
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bill id
 *     responses:
 *       "200":
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
  .post(auth('manageBills'), validate(billValidation.createBill), billController.createBill)
  .get(auth('getBills'), validate(billValidation.getBills), billController.getBills);

router
  .route('/:id')
  .get(auth('getBills'), validate(billValidation.getBill), billController.getBill)
  .patch(auth('manageBills'), validate(billValidation.updateBill), billController.updateBill)
  .delete(auth('manageBills'), validate(billValidation.deleteBill), billController.deleteBill);

module.exports = router;
