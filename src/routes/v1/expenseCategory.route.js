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
 *     description: Only admins and owners can create expense categories.
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the expense category
 *               description:
 *                 type: string
 *                 description: Description of the expense category
 *             example:
 *               name: Maintenance
 *               description: Costs related to property maintenance
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
 *     description: Admins and owners can retrieve all expense categories. Users can view categories.
 *     tags: [ExpenseCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Name of the expense category
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
 *     description: Admins and owners can fetch any expense category. Users can view categories.
 *     tags: [ExpenseCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Expense Category ID
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
 *     description: Only admins and owners can update expense categories.
 *     tags: [ExpenseCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Expense Category ID
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
 *               description:
 *                 type: string
 *                 description: Description of the expense category
 *             example:
 *               name: Maintenance Updated
 *               description: Updated costs related to property maintenance
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
 *     summary: Delete an expense category by ID
 *     description: Only admins and owners can delete expense categories.
 *     tags: [ExpenseCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Expense Category ID
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
  .post(
    auth('manageExpenseCategories'),
    validate(expenseCategoryValidation.createExpenseCategory),
    expenseCategoryController.createExpenseCategory
  )
  .get(
    auth('getExpenseCategories'),
    validate(expenseCategoryValidation.getExpenseCategories),
    expenseCategoryController.getExpenseCategories
  );

router
  .route('/:id')
  .get(
    auth('getExpenseCategories'),
    validate(expenseCategoryValidation.getExpenseCategory),
    expenseCategoryController.getExpenseCategoryById
  )
  .patch(
    auth('manageExpenseCategories'),
    validate(expenseCategoryValidation.updateExpenseCategory),
    expenseCategoryController.updateExpenseCategoryById
  )
  .delete(
    auth('manageExpenseCategories'),
    validate(expenseCategoryValidation.deleteExpenseCategory),
    expenseCategoryController.deleteExpenseCategoryById
  );

module.exports = router;
