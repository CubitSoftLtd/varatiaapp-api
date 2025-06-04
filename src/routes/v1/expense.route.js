const express = require('express');
const validate = require('../../middlewares/validate');
const expenseValidation = require('../../validations/expense.validation');
const expenseController = require('../../controllers/expense.controller');

const router = express.Router({ mergeParams: true }); // mergeParams so we can access propertyId / unitId / userId

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Expense management and retrieval for properties, units, and users
 */

/**
 * @swagger
 * /properties/{propertyId}/expenses:
 *   post:
 *     summary: Create a new expense for a property
 *     description: Only admins and owners can create utility expenses for a property.
 *     tags: [Expenses]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountId
 *               - amount
 *               - expenseDate
 *               - categoryId
 *               - expenseType
 *             properties:
 *               accountId:
 *                 type: string
 *                 format: uuid
 *                 description: Account ID associated with the expense
 *               amount:
 *                 type: number
 *                 description: Amount of the expense
 *               expenseDate:
 *                 type: string
 *                 format: date
 *                 description: Date of the expense
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the expense category
 *               expenseType:
 *                 type: string
 *                 enum: [utility]
 *                 description: Type of the expense (must be 'utility')
 *               description:
 *                 type: string
 *                 description: Description of the expense
 *             example:
 *               accountId: 123e4567-e89b-12d3-a456-426614174000
 *               amount: 500.00
 *               expenseDate: 2025-05-27
 *               categoryId: 123e4567-e89b-12d3-a456-426614174003
 *               expenseType: utility
 *               description: Electricity bill for property
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
 *     summary: Get all expenses for a property
 *     description: Admins and owners can retrieve all expenses for a property. Users can view expenses for their properties.
 *     tags: [Expenses]
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
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense category ID
 *       - in: query
 *         name: billId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bill ID
 *       - in: query
 *         name: expenseType
 *         schema:
 *           type: string
 *           enum: [utility, tenant_charge]
 *         description: Type of the expense
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by query in the form of field:desc/asc (ex. expenseDate:asc)
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
 * /units/{unitId}/expenses:
 *   post:
 *     summary: Create a new expense for a unit
 *     description: Only admins and owners can create tenant_charge expenses for a unit.
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unitId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unit ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountId
 *               - amount
 *               - expenseDate
 *               - categoryId
 *               - expenseType
 *               - billId
 *             properties:
 *               accountId:
 *                 type: string
 *                 format: uuid
 *                 description: Account ID associated with the expense
 *               amount:
 *                 type: number
 *                 description: Amount of the expense
 *               expenseDate:
 *                 type: string
 *                 format: date
 *                 description: Date of the expense
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the expense category
 *               expenseType:
 *                 type: string
 *                 enum: [tenant_charge]
 *                 description: Type of the expense (must be 'tenant_charge')
 *               billId:
 *                 type: string
 *                 format: uuid
 *                 description: Bill ID associated with the expense
 *               description:
 *                 type: string
 *                 description: Description of the expense
 *             example:
 *               accountId: 123e4567-e89b-12d3-a456-426614174000
 *               amount: 25.00
 *               expenseDate: 2025-05-27
 *               categoryId: 123e4567-e89b-12d3-a456-426614174003
 *               expenseType: tenant_charge
 *               billId: abcde123-456f-7890-abcd-ef1234567890
 *               description: Late fee for tenant
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
 *     summary: Get all expenses for a unit
 *     description: Admins and owners can retrieve all expenses for a unit. Users can view expenses for their units.
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unitId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unit ID
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense category ID
 *       - in: query
 *         name: billId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bill ID
 *       - in: query
 *         name: expenseType
 *         schema:
 *           type: string
 *           enum: [tenant_charge]
 *         description: Type of the expense
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by query in the form of field:desc/asc (ex. expenseDate:asc)
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
 * /users/{userId}/expenses:
 *   post:
 *     summary: Create a new personal expense for a user
 *     description: Only admins and owners can create personal expenses for a user.
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountId
 *               - amount
 *               - expenseDate
 *               - categoryId
 *               - expenseType
 *             properties:
 *               accountId:
 *                 type: string
 *                 format: uuid
 *                 description: Account ID associated with the expense
 *               amount:
 *                 type: number
 *                 description: Amount of the expense
 *               expenseDate:
 *                 type: string
 *                 format: date
 *                 description: Date of the expense
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the expense category
 *               expenseType:
 *                 type: string
 *                 enum: [personal]
 *                 description: Type of the expense (must be 'personal')
 *               description:
 *                 type: string
 *                 description: Description of the expense
 *             example:
 *               accountId: 123e4567-e89b-12d3-a456-426614174000
 *               amount: 100.00
 *               expenseDate: 2025-05-27
 *               categoryId: 123e4567-e89b-12d3-a456-426614174003
 *               expenseType: personal
 *               description: Office supplies
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
 *     summary: Get all personal expenses for a user
 *     description: Admins and owners can retrieve all personal expenses for a user. Users can view their own expenses.
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense category ID
 *       - in: query
 *         name: billId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bill ID
 *       - in: query
 *         name: expenseType
 *         schema:
 *           type: string
 *           enum: [personal]
 *         description: Type of the expense
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by query in the form of field:desc/asc (ex. expenseDate:asc)
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
 *     description: Admins and owners can fetch any expense. Users can view expenses for their properties.
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
 *     description: Only admins and owners can update expenses.
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
 *               amount:
 *                 type: number
 *                 description: Amount of the expense
 *               expenseDate:
 *                 type: string
 *                 format: date
 *                 description: Date of the expense
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the expense category
 *               billId:
 *                 type: string
 *                 format: uuid
 *                 description: Bill ID associated with the expense
 *               description:
 *                 type: string
 *                 description: Description of the expense
 *             example:
 *               amount: 550.00
 *               expenseDate: 2025-05-28
 *               categoryId: 123e4567-e89b-12d3-a456-426614174003
 *               billId: abcde123-456f-7890-abcd-ef1234567890
 *               description: Updated late fee
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
 *     summary: Delete an expense by ID
 *     description: Only admins and owners can delete expenses.
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
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/* Create or list expenses in the parent context */
router
  .route('/')
  .post((req, res, next) => {
    if (req.params.propertyId) {
      return validate(expenseValidation.createPropertyExpense)(req, res, next);
    }
    if (req.params.unitId) {
      return validate(expenseValidation.createUnitExpense)(req, res, next);
    }
    if (req.params.userId) {
      return validate(expenseValidation.createUserExpense)(req, res, next);
    }
    return res.status(400).json({ message: 'Missing parent identifier (propertyId, unitId, or userId).' });
  }, expenseController.createExpense)
  .get((req, res, next) => {
    if (req.params.propertyId) {
      return validate(expenseValidation.getPropertyExpenses)(req, res, next);
    }
    if (req.params.unitId) {
      return validate(expenseValidation.getUnitExpenses)(req, res, next);
    }
    if (req.params.userId) {
      return validate(expenseValidation.getUserExpenses)(req, res, next);
    }
    return res.status(400).json({ message: 'Missing parent identifier (propertyId, unitId, or userId).' });
  }, expenseController.getExpenses);

/* Get / Update / Delete a single expense by its ID */
router
  .route('/:id')
  .get(validate(expenseValidation.getExpense), expenseController.getExpenseById)
  .patch(validate(expenseValidation.updateExpense), expenseController.updateExpenseById)
  .delete(validate(expenseValidation.deleteExpense), expenseController.deleteExpenseById);

module.exports = router;
