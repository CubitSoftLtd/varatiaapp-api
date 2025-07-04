/* eslint-disable prettier/prettier */
const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const expenseValidation = require('../../validations/expense.validation');
const expenseController = require('../../controllers/expense.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Expense management and retrieval
 */

/**
 * @swagger
 * /expenses:
 *   post:
 *     summary: Create a new expense
 *     description: |
 *       Only admins can create new expenses. Account owners can create expenses for their accounts.
 *       Last updated: June 11, 2025, 12:00 PM +06.
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - amount
 *               - expenseDate
 *             properties:
 *               propertyId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the property associated with this expense
 *                 nullable: true
 *               unitId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the unit associated with this expense
 *                 nullable: true
 *               billId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the bill if this expense is charged to a tenant
 *                 nullable: true
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the expense category
 *               amount:
 *                 type: number
 *                 description: Monetary amount of the expense
 *               expenseDate:
 *                 type: string
 *                 format: date
 *                 description: Date when the expense was incurred or paid
 *               description:
 *                 type: string
 *                 description: Detailed description of the expense
 *                 nullable: true
 *             example:
 *               propertyId: 123e4567-e89b-12d3-a456-426614174000
 *               unitId: 223e4567-e89b-12d3-a456-426614174001
 *               billId: 323e4567-e89b-12d3-a456-426614174002
 *               categoryId: 423e4567-e89b-12d3-a456-426614174003
 *               amount: 500.00
 *               expenseDate: 2025-06-01
 *               description: Plumbing repair for Unit 101
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all expenses
 *     description: |
 *       Only admins can retrieve all expenses. Account owners can retrieve expenses for their accounts.
 *       Last updated: June 11, 2025, 12:00 PM +06.
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by property ID
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by unit ID
 *       - in: query
 *         name: billId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by bill ID
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by category ID
 *       - in: query
 *         name: amount
 *         schema:
 *           type: number
 *         description: Filter by amount
 *       - in: query
 *         name: expenseDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by expense date
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
 *         description: Sort by query in the form of field:desc/asc (ex. expenseDate:desc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of expenses
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
 *         description: Comma-separated list of associations and their attributes (ex. account:id,name|property:id,name)
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
 *                     $ref: '#/components/schemas/Expense'
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
 * /expenses/{id}:
 *   get:
 *     summary: Get an expense by ID
 *     description: |
 *       Only admins can fetch any expense. Account owners can fetch expenses for their accounts.
 *       Last updated: June 11, 2025, 12:00 PM +06.
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense ID
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         description: Comma-separated list of associations and their attributes (ex. account:id,name|property:id,name)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update an expense by ID
 *     description: |
 *       Only admins can update any expense. Account owners can update expenses for their accounts.
 *       Last updated: June 11, 2025, 12:00 PM +06.
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               propertyId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the property associated with this expense
 *                 nullable: true
 *               unitId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the unit associated with this expense
 *                 nullable: true
 *               billId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the bill if this expense is charged to a tenant
 *                 nullable: true
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the expense category
 *               amount:
 *                 type: number
 *                 description: Monetary amount of the expense
 *               expenseDate:
 *                 type: string
 *                 format: date
 *                 description: Date when the expense was incurred or paid
 *               description:
 *                 type: string
 *                 description: Detailed description of the expense
 *                 nullable: true
 *             example:
 *               amount: 600.00
 *               expenseDate: 2025-06-02
 *               description: Updated plumbing repair cost
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
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
 *     summary: Soft delete an expense by ID
 *     description: |
 *       Marks the expense as deleted. Only admins can soft delete any expense. Account owners can soft delete expenses for their accounts.
 *       Last updated: June 11, 2025, 12:00 PM +06.
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense ID
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
 * /expenses/{id}/hard:
 *   delete:
 *     summary: Hard delete an expense by ID
 *     description: |
 *       Permanently deletes the expense. Only admins can perform a hard delete.
 *       Last updated: June 11, 2025, 12:00 PM +06.
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense ID
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 * /expenses/{id}/restore:
 *   delete:
 *     summary: Restore an expense by ID
 *     description: |
 *      Restore the expense. Only admins can perform a restore.
 *       Last updated: June 11, 2025, 12:00 PM +06.
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense ID
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
  .post(auth('expense:management'), validate(expenseValidation.createExpense), expenseController.createExpense)
  .get(auth('expense:management'), validate(expenseValidation.getExpenses), expenseController.getExpenses);

router
  .route('/:id')
  .get(auth('expense:management'), validate(expenseValidation.getExpense), expenseController.getExpenseById)
  .patch(auth('expense:management'), validate(expenseValidation.updateExpense), expenseController.updateExpenseById)
  .delete(auth('expense:management'), validate(expenseValidation.deleteExpense), expenseController.deleteExpenseById);

router.route('/:id/hard').delete(auth(), validate(expenseValidation.deleteExpense), expenseController.hardDeleteExpenseById);
router.route('/:id/restore').delete(auth(), validate(expenseValidation.restoreExpense), expenseController.restoreExpenseById);

module.exports = router;
