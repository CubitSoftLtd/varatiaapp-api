/* eslint-disable prettier/prettier */
const express = require('express');
const auth = require('../../middlewares/auth');
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
 *       Last updated: June 11, 2025, 1:09 PM +06.
 *     tags:
 *       - Accounts
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
 *               - contactPhone
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the account
 *                 minLength: 3
 *                 maxLength: 255
 *               subscriptionType:
 *                 type: string
 *                 enum: [free, basic, premium, enterprise]
 *                 description: Subscription type of the account
 *                 default: free
 *               contactName:
 *                 type: string
 *                 description: Name of the contact person
 *                 minLength: 3
 *                 maxLength: 255
 *               contactEmail:
 *                 type: string
 *                 format: email
 *                 description: Email address of the contact person
 *               contactPhone:
 *                 type: string
 *                 description: Phone number of the contact person
 *                 pattern: '^\\+?[0-9\\s-]{5,50}$'
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
 *               contactPhone: "+1234567890"
 *               isActive: true
 *               subscriptionExpiry: "2026-06-11T10:41:02Z"
 *     responses:
 *       '201':
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *   get:
 *     summary: Get all accounts
 *     description: |
 *       Only admins can retrieve all accounts.
 *       Last updated: June 11, 2025, 1:09 PM +06.
 *     tags:
 *       - Accounts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 255
 *         description: Account name
 *       - in: query
 *         name: subscriptionType
 *         schema:
 *           type: string
 *           enum: [free, basic, premium, enterprise]
 *         description: Subscription type
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false, all]
 *         description: 'Filter accounts by deletion status (default: false)'
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           pattern: '^[a-zA-Z]+:(asc|desc)$'
 *         description: Sort by query (e.g. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Maximum number of accounts
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
 *         description: Comma-separated list of associations (e.g. users:id,name|properties:id,address)
 *     responses:
 *       '200':
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
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /accounts/{id}:
 *   get:
 *     summary: Get an account by ID
 *     description: |
 *       Only admins can fetch any account. Account owners can fetch their own accounts.
 *       Last updated: June 11, 2025, 1:09 PM +06.
 *     tags:
 *       - Accounts
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
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         description: Comma-separated list of associations (e.g. users:id,name|properties:id,address)
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *   patch:
 *     summary: Update an account by ID
 *     description: |
 *       Only admins can update any account. Account owners can update their own accounts.
 *       Last updated: June 11, 2025, 1:09 PM +06.
 *     tags:
 *       - Accounts
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
 *                 minLength: 3
 *                 maxLength: 255
 *               subscriptionType:
 *                 type: string
 *                 enum: [free, basic, premium, enterprise]
 *               contactName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *               contactEmail:
 *                 type: string
 *                 format: email
 *               contactPhone:
 *                 type: string
 *                 pattern: '^\\+?[0-9\\s-]{5,50}$'
 *               isActive:
 *                 type: boolean
 *               subscriptionExpiry:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *             example:
 *               name: Main Business Account Updated
 *               subscriptionType: basic
 *               contactName: Jane Doe
 *               contactEmail: jane.doe@example.com
 *               contactPhone: "+1234567890"
 *               isActive: true
 *               subscriptionExpiry: "2026-06-11T10:41:02Z"
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Soft delete an account by ID
 *     description: |
 *       Marks the account as inactive. Only admins can soft delete any account. Account owners can soft delete their own accounts.
 *       Last updated: June 11, 2025, 1:09 PM +06.
 *     tags:
 *       - Accounts
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
 *       '204':
 *         description: No content
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /accounts/{id}/restore:
 *   delete:
 *     summary: Restore an account by ID
 *     description: |
 *      Restore the account . Only admins can restore.
 *       Last updated: June 11, 2025, 1:09 PM +06.
 *     tags:
 *       - Accounts
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
 *       '204':
 *         description: No content
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 */
/**
 * @swagger
 * /accounts/{id}/hard:
 *   delete:
 *     summary: Hard delete an account by ID
 *     description: |
 *       Permanently deletes the account and its associated data. Only admins can perform a hard delete.
 *       Last updated: June 11, 2025, 1:09 PM +06.
 *     tags:
 *       - Accounts
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
 *       '204':
 *         description: No content
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 */

router
  .route('/')
  .post(auth('account:management'), validate(accountValidation.createAccount), accountController.createAccount)
  .get(auth('account:management'), validate(accountValidation.getAccounts), accountController.getAccounts);

router
  .route('/:id')
  .get(auth('account:management'), validate(accountValidation.getAccount), accountController.getAccountById)
  .patch(auth('account:management'), validate(accountValidation.updateAccount), accountController.updateAccountById)
  .delete(auth('account:management'), validate(accountValidation.deleteAccount), accountController.deleteAccountById);
  // .delete(auth('account:management'), validate(accountValidation.restoreAccount), accountController.restoreAccountById);

router.route('/:id/hard').delete(auth(), validate(accountValidation.deleteAccount), accountController.hardDeleteAccountById);
router.route('/:id/restore').delete(auth(), validate(accountValidation.restoreAccount), accountController.restoreAccountById);

module.exports = router;
