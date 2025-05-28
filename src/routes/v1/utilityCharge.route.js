const express = require('express');
const validate = require('../../middlewares/validate');
const utilityChargeValidation = require('../../validations/utilityCharge.validation');
const utilityChargeController = require('../../controllers/utilityCharge.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: UtilityCharges
 *   description: Utility charge management and retrieval
 */

/**
 * @swagger
 * /utility-types/{utilityTypeId}/charges:
 *   post:
 *     summary: Create a new utility charge
 *     description: Only admins and owners can create utility charges.
 *     tags: [UtilityCharges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: utilityTypeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Utility Type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rate
 *               - effectiveDate
 *             properties:
 *               rate:
 *                 type: number
 *                 description: Rate of the utility charge
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *                 description: Effective date of the charge
 *             example:
 *               rate: 0.15
 *               effectiveDate: 2025-06-01
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UtilityCharge'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all utility charges for a utility type
 *     description: Admins and owners can retrieve all utility charges. Users can view charges for their utility types.
 *     tags: [UtilityCharges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: utilityTypeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Utility Type ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UtilityCharge'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /utility-charges/{id}:
 *   get:
 *     summary: Get a utility charge by ID
 *     description: Admins and owners can fetch any utility charge. Users can view charges for their utility types.
 *     tags: [UtilityCharges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Utility Charge ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UtilityCharge'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a utility charge by ID
 *     description: Only admins and owners can update utility charges.
 *     tags: [UtilityCharges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Utility Charge ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rate:
 *                 type: number
 *                 description: Rate of the utility charge
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *                 description: Effective date of the charge
 *             example:
 *               rate: 0.16
 *               effectiveDate: 2025-06-15
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UtilityCharge'
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
 *     summary: Delete a utility charge by ID
 *     description: Only admins and owners can delete utility charges.
 *     tags: [UtilityCharges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Utility Charge ID
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
  .route('/utility-types/:utilityTypeId/charges')
  .post(validate(utilityChargeValidation.createUtilityCharge), utilityChargeController.createUtilityCharge)
  .get(validate(utilityChargeValidation.getUtilityCharges), utilityChargeController.getUtilityCharges);

router
  .route('/utility-charges/:id')
  .get(validate(utilityChargeValidation.getUtilityCharge), utilityChargeController.getUtilityChargeById)
  .patch(validate(utilityChargeValidation.updateUtilityCharge), utilityChargeController.updateUtilityChargeById)
  .delete(validate(utilityChargeValidation.deleteUtilityCharge), utilityChargeController.deleteUtilityChargeById);

module.exports = router;
