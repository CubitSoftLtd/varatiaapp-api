/* eslint-disable prettier/prettier */
const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { beneficiaryValidation } = require('../../validations');
const { beneficiaryController } = require('../../controllers');


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Beneficiary
 *   description: Beneficiary management and retrieval
 */

/**
 * @swagger
 * /beneficiaries:
 *   post:
 *     summary: Create a new beneficiary
 *     description: |
 *       Only admins can create new beneficiary.
 *       Last updated: June 11, 2025, 12:08 PM +06.
 *     tags: [Beneficiary]
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
 *                 description: Name of the Beneficiary
 *               description:
 *                 type: string
 *                 description: Detailed description of the Beneficiary
 *                 nullable: true
 *             example:
 *               name: Kamal Uddin
 *               description: Costs related to property maintenance and repairs
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Beneficiary'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all Beneficiaries
 *     description: |
 *       Only admins can retrieve all beneficiaries.
 *       Last updated: June 11, 2025, 12:08 PM +06.
 *     tags: [Beneficiary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by category name
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
 *                     $ref: '#/components/schemas/Beneficiary'
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
 * /beneficiaries/{id}:
 *   get:
 *     summary: Get an beneficiary by ID
 *     description: |
 *       Only admins can fetch beneficiaries.
 *       Last updated: June 11, 2025, 12:08 PM +06.
 *     tags: [Beneficiary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Beneficiary ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Beneficiary'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update an beneficiary by ID
 *     description: |
 *       Only admins can update beneficiaries.
 *       Last updated: June 11, 2025, 12:08 PM +06.
 *     tags: [Beneficiary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Beneficiary ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *                 description: Detailed description of the beneficiary
 *                 nullable: true
 *             example:
 *               name: Kamal Uddin
 *               description: Give him money to his personal
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Beneficiary'
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
 *     summary: Soft delete an Beneficiary by ID
 *     description: |
 *       Marks the Beneficiary as deleted. Only admins can soft delete expense categories.
 *       Last updated: June 11, 2025, 12:08 PM +06.
 *     tags: [Beneficiary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Beneficiary ID
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
 * /beneficiaries/{id}/hard:
 *   delete:
 *     summary: Hard delete an Beneficiary by ID
 *     description: |
 *       Permanently deletes the Beneficiary. Only admins can perform a hard delete.
 *       Last updated: June 11, 2025, 12:08 PM +06.
 *     tags: [Beneficiary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Beneficiary ID
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 * /beneficiaries/{id}/restore:
 *   delete:
 *     summary: Restore an Beneficiary by ID
 *     description: |
 *       Restore the Beneficiary. Only admins can perform a restore.
 *       Last updated: June 11, 2025, 12:08 PM +06.
 *     tags: [Beneficiary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Beneficiary ID
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
  .post(
    auth('beneficiary:management'),
    validate(beneficiaryValidation.createBeneficiaryV),
    beneficiaryController.createBeneficiary
  )
  .get(
    auth('beneficiary:management'),
    validate(beneficiaryValidation.getBeneficiariesV),
    beneficiaryController.getBenneficiaries
  );

router
  .route('/:id')
  .get(
    auth('beneficiary:management'),
    validate(beneficiaryValidation.getBeneficiaryV),
    beneficiaryController.getBeneficiaryById
  )
  .patch(
    auth('beneficiary:management'),
    validate(beneficiaryValidation.updateBeneficiaryV),
    beneficiaryController.updateBeneficiaryById
  )
  .delete(
    auth('beneficiary:management'),
    validate(beneficiaryValidation.deleteBeneficiaryV),
    beneficiaryController.deleteBeneficiaryById
  );

router
  .route('/:id/hard')
  .delete(
    auth('beneficiary:management'),
    validate(beneficiaryValidation.deleteBeneficiaryV),
    beneficiaryController.hardDeleteBeneficiaryById
  );
router
  .route('/:id/restore')
  .delete(
    auth('beneficiary:management'),
    validate(beneficiaryValidation.restoreBeneficiaryV),
    beneficiaryController.restoreBeneficiaryById
  );

module.exports = router;
