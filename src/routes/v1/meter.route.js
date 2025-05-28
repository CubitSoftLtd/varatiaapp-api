const express = require('express');
const validate = require('../../middlewares/validate');
const meterValidation = require('../../validations/meter.validation');
const meterController = require('../../controllers/meter.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Meters
 *   description: Meter management and retrieval
 */

/**
 * @swagger
 * /meters:
 *   post:
 *     summary: Create a new meter
 *     description: Only admins and owners can create meters.
 *     tags: [Meters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - unitId
 *               - utilityTypeId
 *               - meterNumber
 *             properties:
 *               unitId:
 *                 type: integer
 *                 description: ID of the unit associated with the meter
 *               utilityTypeId:
 *                 type: integer
 *                 description: ID of the utility type (e.g., electricity, water)
 *               meterNumber:
 *                 type: string
 *                 description: Unique meter number
 *             example:
 *               unitId: 1
 *               utilityTypeId: 1
 *               meterNumber: MTR12345
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meter'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all meters
 *     description: Admins and owners can retrieve all meters. Tenants can retrieve meters for their units.
 *     tags: [Meters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: integer
 *         description: Unit ID
 *       - in: query
 *         name: utilityTypeId
 *         schema:
 *           type: integer
 *         description: Utility type ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by query in the form of field:desc/asc (ex. meterNumber:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of meters
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
 *                     $ref: '#/components/schemas/Meter'
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
 * /meters/{id}:
 *   get:
 *     summary: Get a meter
 *     description: Admins and owners can fetch any meter. Tenants can fetch meters for their units.
 *     tags: [Meters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Meter id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meter'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a meter
 *     description: Only admins and owners can update meters.
 *     tags: [Meters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Meter id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               unitId:
 *                 type: integer
 *                 description: ID of the unit associated with the meter
 *               utilityTypeId:
 *                 type: integer
 *                 description: ID of the utility type (e.g., electricity, water)
 *               meterNumber:
 *                 type: string
 *                 description: Unique meter number
 *             example:
 *               unitId: 2
 *               utilityTypeId: 2
 *               meterNumber: MTR67890
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meter'
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
 *     summary: Delete a meter
 *     description: Only admins and owners can delete meters.
 *     tags: [Meters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Meter id
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
  .post(validate(meterValidation.createMeter), meterController.createMeter)
  .get(validate(meterValidation.getMeters), meterController.getMeters);

router
  .route('/:id')
  .get(validate(meterValidation.getMeter), meterController.getMeters)
  .patch(validate(meterValidation.updateMeter), meterController.updateMeterById)
  .delete(validate(meterValidation.deleteMeter), meterController.deleteMeterById);

module.exs = router;
