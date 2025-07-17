const express = require('express');
const { meterChargeController } = require('../../controllers');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { meterChargeValidation } = require('../../validations');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: MeterCharges
 *     description: Meter Charge management and retrieval
 */

/**
 * @swagger
 * /meter-charges:
 *   post:
 *     summary: Create a new Meter Charge
 *     description: Only admins can create new Meter Charge.
 *     tags: [MeterCharges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - meterId
 *               - propertyId
 *               - expenseDate
 *               - amount
 *             properties:
 *               meterId:
 *                 type: string
 *                 format: uuid
 *               propertyId:
 *                 type: string
 *                 format: uuid
 *               expenseDate:
 *                 type: string
 *                 format: date
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *                 nullable: true
 *               category:
 *                 type: string
 *                 nullable: true
 *             example:
 *               propertyId: 123e4567-e89b-12d3-a456-426614174000
 *               meterId: 223e4567-e89b-12d3-a456-426614174001
 *               expenseDate: 2025-06-01
 *               amount: 1000.00
 *               description: Reliable tenant
 *               category: Utility
 *     responses:
 *       "201":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MeterCharges'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all meter-charges
 *     tags: [MeterCharges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: meterId
 *         schema:
 *           type: string
 *           format: uuid
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of meter charge
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
 *                     $ref: '#/components/schemas/MeterCharges'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
/**
 * @swagger
 * /meter-charges/{id}:
 *   get:
 *     summary: Get a meter-charge by ID
 *     description: |
 *       Only admins can fetch meter-charte.
 *       Last updated: June 15, 2025, 1:06 PM +06.
 *     tags: [MeterCharges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Meter ID
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         description: Comma-separated list of associations and attributes (ex. tenant:id,notes|payments:id,amount)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MeterCharges'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a meter charge by ID
 *     description: |
 *       Only admins can update meter charge. Total utility amount is recalculated if billing period changes.
 *       Last updated: June 15, 2025, 1:06 PM +06.
 *     tags: [MeterCharges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Meter Charge ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - meterId
 *               - propertyId
 *               - expenseDate
 *               - amount
 *             properties:
 *               meterId:
 *                 type: string
 *                 format: uuid
 *               propertyId:
 *                 type: string
 *                 format: uuid
 *               expenseDate:
 *                 type: string
 *                 format: date
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *                 nullable: true
 *               category:
 *                 type: string
 *                 nullable: true
 *             example:
 *               propertyId: 123e4567-e89b-12d3-a456-426614174000
 *               meterId: 223e4567-e89b-12d3-a456-426614174001
 *               expenseDate: 2025-06-01
 *               amount: 1000.00
 *               description: Reliable tenant
 *               category: Utility
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MeterCharges'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
/**
 * @swagger
 * /meter-charges/{id}:
 *   delete:
 *     summary: Soft delete a meter charge by ID
 *     tags: [MeterCharges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 * /meter-charges/{id}/hard:
 *   delete:
 *     summary: Hard delete a meter charge by ID
 *     tags: [MeterCharges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 * /meter-charges/{id}/restore:
 *   delete:
 *     summary: Restore a meter charge by ID
 *     tags: [MeterCharges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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

// Route bindings
router
  .route('/')
  .post(auth(), validate(meterChargeValidation.createMeterCharge), meterChargeController.createMeterCharge)
  .get(auth(), validate(meterChargeValidation.getMeterCharges), meterChargeController.getMeterCharges);

router
  .route('/:id')
  .get(auth(), validate(meterChargeValidation.getMeterCharge), meterChargeController.getMeterChargeById)
  .patch(auth(), validate(meterChargeValidation.updateMeterCharge), meterChargeController.updateMeterChargeById)
  .delete(auth(), validate(meterChargeValidation.deleteHardMeterChage), meterChargeController.deleteMeterChargeById);

router
  .route('/:id/hard')
  .delete(auth(), validate(meterChargeValidation.deleteHardMeterChage), meterChargeController.hardDeleteMeterChargeById);

router
  .route('/:id/restore')
  .delete(auth(), validate(meterChargeValidation.deleteHardMeterChage), meterChargeController.restoreMeterChargeById);

module.exports = router;
