const express = require('express');
const validate = require('../../middlewares/validate');
const accountValidation = require('../../validations/account.validation');
const accountController = require('../../controllers/account.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: Account management and retrieval
 */

/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Create a new account
 *     description: |
 *       Only admins can create new accounts.
 *       Last updated: May 27, 2025, 03:35 PM +06.
 *     tags: [Accounts]
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
 *               - accountNumber
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the account
 *               accountNumber:
 *                 type: string
 *                 description: Unique account number
 *               type:
 *                 type: string
 *                 enum: [savings, checking]
 *                 description: Type of account
 *             example:
 *               name: Main Savings Account
 *               accountNumber: ACC123456
 *               type: savings
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       "400":
 *         $ref: '#/components/responses/DuplicateAccountNumber'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all accounts
 *     description: |
 *       Only admins can retrieve all accounts.
 *       Last updated: May 27, 2025, 03:35 PM +06.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Account name
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Account type
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
 *         description: Maximum number of accounts
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
 *                     $ref: '#/components/schemas/Account'
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
 * /accounts/{id}:
 *   get:
 *     summary: Get an account by ID
 *     description: |
 *       Only admins can fetch any account. Account owners can fetch their own accounts.
 *       Last updated: May 27, 2025, 03:35 PM +06.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Account id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update an account by ID
 *     description: |
 *       Only admins can update any account. Account owners can update their own accounts.
 *       Last updated: May 27, 2025, 03:35 PM +06.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Account id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the account
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: Account status
 *             example:
 *               name: Main Savings Account Updated
 *               status: active
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
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
 *     summary: Delete an account by ID
 *     description: |
 *       Only admins can delete any account. Account owners can delete their own accounts.
 *       Last updated: May 27, 2025, 03:35 PM +06.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Account id
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
  .post(validate(accountValidation.createAccount), accountController.createAccount)
  .get(validate(accountValidation.getAccounts), accountController.getAccounts);

router
  .route('/:id')
  .get(validate(accountValidation.getAccount), accountController.getAccounts)
  .patch(validate(accountValidation.updateAccount), accountController.updateAccountById)
  .delete(validate(accountValidation.deleteAccount), accountController.deleteAccountById);

module.exports = router;
