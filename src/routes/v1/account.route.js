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
 *       Last updated: May 31, 2025, 11:12 AM +06.
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
 *               - contactName
 *               - contactEmail
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the account
 *               subscriptionType:
 *                 type: string
 *                 enum: [free, basic, premium]
 *                 description: Subscription type of the account
 *                 default: free
 *               contactName:
 *                 type: string
 *                 description: Name of the contact person
 *               contactEmail:
 *                 type: string
 *                 description: Email address of the contact person
 *               contactPhone:
 *                 type: string
 *                 description: Phone number of the contact person
 *                 nullable: true
 *               isActive:
 *                 type: boolean
 *                 description: Whether the account is active
 *                 default: true
 *               subscriptionExpiry:
 *                 type: string
 *                 format: date-time
 *                 description: Expiry date of the subscription
 *                 nullable: true
 *             example:
 *               name: Main Business Account
 *               subscriptionType: premium
 *               contactName: John Doe
 *               contactEmail: john.doe@example.com
 *               contactPhone: +1234567890
 *               isActive: true
 *               subscriptionExpiry: 2026-05-31T11:12:02Z
 *     responses:
 *       "201":
 *         description: Created
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
 *
 *   get:
 *     summary: Get all accounts
 *     description: |
 *       Only admins can retrieve all accounts.
 *       Last updated: May 31, 2025, 11:12 AM +06.
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
 *         name: subscriptionType
 *         schema:
 *           type: string
 *           enum: [free, basic, premium]
 *         description: Subscription type
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
 *       Last updated: May 31, 2025, 11:12 AM +06.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Account ID
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
 *       Last updated: May 31, 2025, 11:12 AM +06.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Account ID
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
 *               subscriptionType:
 *                 type: string
 *                 enum: [free, basic, premium]
 *                 description: Subscription type of the account
 *               contactName:
 *                 type: string
 *                 description: Name of the contact person
 *               contactEmail:
 *                 type: string
 *                 description: Email address of the contact person
 *               contactPhone:
 *                 type: string
 *                 description: Phone number of the contact person
 *                 nullable: true
 *               isActive:
 *                 type: boolean
 *                 description: Whether the account is active
 *               subscriptionExpiry:
 *                 type: string
 *                 format: date-time
 *                 description: Expiry date of the subscription
 *                 nullable: true
 *             example:
 *               name: Main Business Account Updated
 *               subscriptionType: basic
 *               contactName: Jane Doe
 *               contactEmail: jane.doe@example.com
 *               contactPhone: +1234567890
 *               isActive: true
 *               subscriptionExpiry: 2026-05-31T11:12:02Z
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
 *       Last updated: May 31, 2025, 11:12 AM +06.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Account ID
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
  .get(validate(accountValidation.getAccount), accountController.getAccountById)
  .patch(validate(accountValidation.updateAccount), accountController.updateAccountById)
  .delete(validate(accountValidation.deleteAccount), accountController.deleteAccountById);

module.exports = router;
