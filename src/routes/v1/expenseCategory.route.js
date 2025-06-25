const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const expenseCategoryValidation = require('../../validations/expenseCategory.validation');
const expenseCategoryController = require('../../controllers/expenseCategory.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ExpenseCategories
 *   description: Expense category management and retrieval
 */

/**
 * @swagger
 * /expense-categories:
 *   post:
 *     summary: Create a new expense category
 *     description: |
 *       Only admins can create new expense categories.
 *       Last updated: June 11, 2025, 12:08 PM +06.
 *     tags: [ExpenseCategories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - categoryType
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the expense category
 *               categoryType:
 *                 type: string
 *                 enum: [property_related, tenant_chargeable, administrative, personal]
 *                 description: General classification of the expense category
 *               description:
 *                 type: string
 *                 description: Detailed description of the expense category
 *                 nullable: true
 *             example:
 *               name: Repairs
 *               categoryType: property_related
 *               description: Costs related to property maintenance and repairs
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpenseCategory'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all expense categories
 *     description: |
 *       Only admins can retrieve all expense categories.
 *       Last updated: June 11, 2025, 12:08 PM +06.
 *     tags: [ExpenseCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by category name
 *       - in: query
 *         name: categoryType
 *         schema:
 *           type: string
 *           enum: [property_related, tenant_chargeable, administrative, personal]
 *         description: Filter by category type
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
 *         description: Sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of expense categories
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
 *         description: Comma-separated list of associations and their attributes (ex. expenses:id,amount)
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
 *                     $ref: '#/components/schemas/ExpenseCategory'
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
 * /expense-categories/{id}:
 *   get:
 *     summary: Get an expense category by ID
 *     description: |
 *       Only admins can fetch expense categories.
 *       Last updated: June 11, 2025, 12:08 PM +06.
 *     tags: [ExpenseCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense category ID
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         description: Comma-separated list of associations and their attributes (ex. expenses:id,amount)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpenseCategory'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update an expense category by ID
 *     description: |
 *       Only admins can update expense categories.
 *       Last updated: June 11, 2025, 12:08 PM +06.
 *     tags: [ExpenseCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the expense category
 *               categoryType:
 *                 type: string
 *                 enum: [property_related, tenant_chargeable, administrative, personal]
 *                 description: General classification of the expense category
 *               description:
 *                 type: string
 *                 description: Detailed description of the expense category
 *                 nullable: true
 *             example:
 *               name: Maintenance
 *               categoryType: property_related
 *               description: Updated description for maintenance costs
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpenseCategory'
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
 *     summary: Soft delete an expense category by ID
 *     description: |
 *       Marks the expense category as deleted. Only admins can soft delete expense categories.
 *       Last updated: June 11, 2025, 12:08 PM +06.
 *     tags: [ExpenseCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense category ID
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
 * /expense-categories/{id}/hard:
 *   delete:
 *     summary: Hard delete an expense category by ID
 *     description: |
 *       Permanently deletes the expense category. Only admins can perform a hard delete.
 *       Last updated: June 11, 2025, 12:08 PM +06.
 *     tags: [ExpenseCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense category ID
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
  .post(auth(), validate(expenseCategoryValidation.createExpenseCategory), expenseCategoryController.createExpenseCategory)
  .get(auth(), validate(expenseCategoryValidation.getExpenseCategories), expenseCategoryController.getExpenseCategories);

router
  .route('/:id')
  .get(auth(), validate(expenseCategoryValidation.getExpenseCategory), expenseCategoryController.getExpenseCategoryById)
  .patch(
    auth(),
    validate(expenseCategoryValidation.updateExpenseCategory),
    expenseCategoryController.updateExpenseCategoryById
  )
  .delete(
    auth(),
    validate(expenseCategoryValidation.deleteExpenseCategory),
    expenseCategoryController.deleteExpenseCategoryById
  );

router
  .route('/:id/hard')
  .delete(
    auth(),
    validate(expenseCategoryValidation.deleteExpenseCategory),
    expenseCategoryController.hardDeleteExpenseCategoryById
  );

module.exports = router;
