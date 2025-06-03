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
 * components:
 *   schemas:
 *     Meter:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the meter
 *         number:
 *           type: string
 *           description: Unique meter number
 *         propertyId:
 *           type: string
 *           format: uuid
 *           description: ID of the associated property
 *         utilityTypeId:
 *           type: string
 *           format: uuid
 *           description: ID of the associated utility type
 *         status:
 *           type: string
 *           enum: [active, inactive, maintenance]
 *           description: Status of the meter
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /meters:
 *   post:
 *     summary: Create a new meter
 *     description: |
 *       Only admins can create new meters. Property ID must be provided in the request body.
 *       Last updated: June 02, 2025, 04:48 PM +06.
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
 *               - number
 *               - propertyId
 *               - utilityTypeId
 *             properties:
 *               number:
 *                 type: string
 *                 description: Unique meter number
 *               propertyId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the associated property
 *               utilityTypeId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the associated utility type
 *               status:
 *                 type: string
 *                 enum: [active, inactive, maintenance]
 *                 description: Status of the meter
 *                 default: active
 *             example:
 *               number: MTR123456
 *               propertyId: "b567bd64-12ac-4d7c-add8-eec1dad11225"
 *               utilityTypeId: "123e4567-e89b-12d3-a456-426614174001"
 *               status: active
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
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   get:
 *     summary: Get all meters
 *     description: |
 *       Admins can retrieve all meters. Other authenticated users can view meters.
 *       Last updated: June 02, 2025, 04:48 PM +06.
 *     tags: [Meters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: number
 *         schema:
 *           type: string
 *         description: Meter number
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, maintenance]
 *         description: Meter status
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by property ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by query in the form of field:desc/asc (ex. number:asc)
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
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /meters/{id}:
 *   get:
 *     summary: Get a meter by ID
 *     description: |
 *       Admins can fetch any meter. Other authenticated users can view meters.
 *       Last updated: June 02, 2025, 04:48 PM +06.
 *     tags: [Meters]
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
 *     summary: Update a meter by ID
 *     description: |
 *       Only admins can update meters.
 *       Last updated: June 02, 2025, 04:48 PM +06.
 *     tags: [Meters]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               number:
 *                 type: string
 *                 description: Unique meter number
 *               propertyId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the associated property
 *               utilityTypeId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the associated utility type
 *               status:
 *                 type: string
 *                 enum: [active, inactive, maintenance]
 *                 description: Status of the meter
 *             example:
 *               number: MTR123456
 *               propertyId: "b567bd64-12ac-4d7c-add8-eec1dad11225"
 *               utilityTypeId: "123e4567-e89b-12d3-a456-426614174001"
 *               status: active
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
 *     summary: Delete a meter by ID
 *     description: |
 *       Only admins can delete meters.
 *       Last updated: June 02, 2025, 04:48 PM +06.
 *     tags: [Meters]
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
  .post(validate(meterValidation.createMeter), meterController.createMeter)
  .get(validate(meterValidation.getMeters), meterController.getMeters);

router
  .route('/:id')
  .get(validate(meterValidation.getMeter), meterController.getMeterById)
  .patch(validate(meterValidation.updateMeter), meterController.updateMeterById)
  .delete(validate(meterValidation.deleteMeter), meterController.deleteMeterById);

module.exports = router;
