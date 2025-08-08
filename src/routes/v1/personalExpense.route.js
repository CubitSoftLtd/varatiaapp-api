/* eslint-disable prettier/prettier */
const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { personalExpenseValidation } = require('../../validations');
const { personalExpenseController } = require('../../controllers');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: PersonalExpense
 *   description: Personal Expense management and retrieval
 */

/**
 * @swagger
 * /personal-expenses:
 *   post:
 *     summary: Create a new personal expense
 *     description: |
 *       Only admins can create new expenses. Account owners can create expenses for their accounts.
 *       Last updated: June 11, 2025, 12:00 PM +06.
 *     tags: [PersonalExpense]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - beneficiary
 *               - categoryId
 *               - amount
 *               - expenseDate
 *             properties:
 *               beneficiary:
 *                 type: string
 *                 description: beneficiary name
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
 *               beneficiary: Iqbal Hossain
 *               categoryId: 423e4567-e89b-12d3-a456-426614174003
 *               amount: 500.00
 *               expenseDate: 2025-07-01
 *               description: For his personal use
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PersonalExpense'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all personal expenses
 *     description: |
 *       Only admins can retrieve all personal expenses. Account owners can retrieve expenses for their accounts.
 *       Last updated: June 11, 2025, 12:00 PM +06.
 *     tags: [PersonalExpense]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: beneficiary
 *         schema:
 *           type: string
 *         description: beneficiary name
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
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PersonalExpense'
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
 * /personal-expenses/{id}:
 *   get:
 *     summary: Get an expense by ID
 *     description: |
 *       Only admins can fetch any expense. Account owners can fetch expenses for their accounts.
 *       Last updated: June 11, 2025, 12:00 PM +06.
 *     tags: [PersonalExpense]
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
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PersonalExpense'
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
 *     tags: [PersonalExpense]
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
 *               beneficiary:
 *                 type: string
 *                 description: beneficiary name
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
 *               beneficiary: Iqbal Hossain
 *               categoryId: 423e4567-e89b-12d3-a456-426614174003
 *               amount: 500.00
 *               expenseDate: 2025-07-01
 *               description: For his personal use
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PersonalExpense'
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
 *     tags: [PersonalExpense]
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

/**
 * @swagger
 * /personal-expenses/{id}/hard:
 *   delete:
 *     summary: Hard delete an expense by ID
 *     description: |
 *       Permanently deletes the expense. Only admins can perform a hard delete.
 *       Last updated: June 11, 2025, 12:00 PM +06.
 *     tags: [PersonalExpense]
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

/**
 * @swagger
 * /personal-expenses/{id}/restore:
 *   delete:
 *     summary: Restore an expense by ID
 *     description: |
 *       Restore the expense. Only admins can perform a restore.
 *       Last updated: June 11, 2025, 12:00 PM +06.
 *     tags: [PersonalExpense]
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
  .post(auth('personal_expense:management'), validate(personalExpenseValidation.createPersonalExpense), personalExpenseController.createPersonalExpense)
  .get(auth('personal_expense:management'), validate(personalExpenseValidation.getPersonalExpenses), personalExpenseController.getPersonalExpenses);

router
  .route('/:id')
  .get(auth('personal_expense:managementt'), validate(personalExpenseValidation.getPersonalExpense), personalExpenseController.getPersonalExpenseById)
  .patch(auth('personal_expense:management'), validate(personalExpenseValidation.updatePersonalExpense), personalExpenseController.updatePersonalExpenseById)
  .delete(auth('personal_expense:management'), validate(personalExpenseValidation.deletePersonalExpense), personalExpenseController.deletePersonalExpenseById);

router.route('/:id/hard').delete(auth(), validate(personalExpenseValidation.deleteHardPersonalExpense), personalExpenseController.hardDeletePersonalExpenseById);
router
  .route('/:id/restore')
  .delete(auth(), validate(personalExpenseValidation.restorePersonalExpense), personalExpenseController.restorePersonalExpenseById);

module.exports = router;