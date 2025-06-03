const express = require('express');
const validate = require('../../middlewares/validate');
const meterReadingValidation = require('../../validations/meterReading.validation');
const meterReadingController = require('../../controllers/meterReading.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: MeterReadings
 *   description: Meter reading management and retrieval
 */

/**
 * @swagger
 * /meter-readings:
 *   post:
 *     summary: Create a new meter reading
 *     description: Only admins and owners can create meter readings.
 *     tags: [MeterReadings]
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
 *               - readingValue
 *               - readingDate
 *             properties:
 *               meterId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the meter
 *               submeterId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the submeter (optional)
 *               readingValue:
 *                 type: number
 *                 description: Meter reading value
 *               readingDate:
 *                 type: string
 *                 format: date
 *                 description: Date of the meter reading
 *             example:
 *               meterId: "123e4567-e89b-12d3-a456-426614174000"
 *               submeterId: "123e4567-e89b-12d3-a456-426614174001"
 *               readingValue: 150.50
 *               readingDate: "2025-05-27"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MeterReading'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all meter readings
 *     description: Admins and owners can retrieve all meter readings. Tenants can retrieve meter readings for their units.
 *     tags: [MeterReadings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: meterId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Meter ID
 *       - in: query
 *         name: submeterId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Submeter ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by query in the form of field:desc/asc (ex. readingDate:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of meter readings
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
 *                     $ref: '#/components/schemas/MeterReading'
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
 * /meter-readings/{id}:
 *   get:
 *     summary: Get a meter reading
 *     description: Admins and owners can fetch any meter reading. Tenants can fetch meter readings for their units.
 *     tags: [MeterReadings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Meter reading ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MeterReading'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a meter reading
 *     description: Only admins and owners can update meter readings.
 *     tags: [MeterReadings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Meter reading ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               readingValue:
 *                 type: number
 *                 description: Meter reading value
 *               readingDate:
 *                 type: string
 *                 format: date
 *                 description: Date of the meter reading
 *             example:
 *               readingValue: 160.00
 *               readingDate: "2025-06-01"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MeterReading'
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
 *     summary: Delete a meter reading
 *     description: Only admins and owners can delete meter readings.
 *     tags: [MeterReadings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Meter reading ID
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
  .post(validate(meterReadingValidation.createMeterReading), meterReadingController.createMeterReading)
  .get(validate(meterReadingValidation.getMeterReadings), meterReadingController.getMeterReadings);

router
  .route('/:id')
  .get(
    validate(meterReadingValidation.getMeterReading),
    meterReadingController.getMeterReadingById // Fixed typo: getMeterReadings → getMeterReadingById
  )
  .patch(validate(meterReadingValidation.updateMeterReading), meterReadingController.updateMeterReadingById)
  .delete(validate(meterReadingValidation.deleteMeterReading), meterReadingController.deleteMeterReadingById);

module.exports = router;
