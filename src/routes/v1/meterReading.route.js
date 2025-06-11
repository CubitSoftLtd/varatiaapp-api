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
 *     description: |
 *       Only admins can create new meter readings.
 *       Last updated: June 11, 2025, 12:19 PM +06.
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
 *               - readingValue
 *               - readingDate
 *             properties:
 *               meterId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the main meter (mutually exclusive with submeterId)
 *                 nullable: true
 *               submeterId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the submeter (mutually exclusive with meterId)
 *                 nullable: true
 *               readingValue:
 *                 type: number
 *                 description: The actual meter reading value
 *               readingDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time when the reading was taken
 *               consumption:
 *                 type: number
 *                 description: Calculated consumption since the previous reading
 *                 nullable: true
 *               enteredByUserId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user who entered the reading
 *                 nullable: true
 *             example:
 *               meterId: 123e4567-e89b-12d3-a456-426614174000
 *               readingValue: 1234.567890
 *               readingDate: 2025-06-01T10:00:00Z
 *               enteredByUserId: 223e4567-e89b-12d3-a456-426614174001
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
 *     description: |
 *       Only admins can retrieve all meter readings.
 *       Last updated: June 11, 2025, 12:19 PM +06.
 *     tags: [MeterReadings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: meterId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by meter ID
 *       - in: query
 *         name: submeterId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by submeter ID
 *       - in: query
 *         name: readingDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by reading date
 *       - in: query
 *         name: enteredByUserId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by user who entered the reading
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by query in the form of field:desc/asc (ex. readingDate:desc)
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
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         description: Comma-separated list of associations and their attributes (ex. meter:id,serialNumber|submeter:id,serialNumber|user:id,name)
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
 *     summary: Get a meter reading by ID
 *     description: |
 *       Only admins can fetch meter readings.
 *       Last updated: June 11, 2025, 12:19 PM +06.
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
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         description: Comma-separated list of associations and their attributes (ex. meter:id,serialNumber|submeter:id,serialNumber|user:id,name)
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
 *     summary: Update a meter reading by ID
 *     description: |
 *       Only admins can update meter readings.
 *       Last updated: June 11, 2025, 12:19 PM +06.
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
 *               meterId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the main meter (mutually exclusive with submeterId)
 *                 nullable: true
 *               submeterId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the submeter (mutually exclusive with meterId)
 *                 nullable: true
 *               readingValue:
 *                 type: number
 *                 description: The actual meter reading value
 *               readingDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time when the reading was taken
 *               consumption:
 *                 type: number
 *                 description: Calculated consumption since the previous reading
 *                 nullable: true
 *               enteredByUserId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user who entered the reading
 *                 nullable: true
 *             example:
 *               readingValue: 1235.678901
 *               readingDate: 2025-06-02T10:00:00Z
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
 *     summary: Soft delete a meter reading by ID
 *     description: |
 *       Marks the meter reading as deleted. Only admins can soft delete meter readings.
 *       Last updated: June 11, 2025, 12:19 PM +06.
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
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 * /meter-readings/{id}/hard:
 *   delete:
 *     summary: Hard delete a meter reading by ID
 *     description: |
 *       Permanently deletes the meter reading. Only admins can perform a hard delete.
 *       Last updated: June 11, 2025, 12:19 PM +06.
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
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 * /meter-readings/calculate-consumption:
 *   post:
 *     summary: Calculate consumption for a meter or submeter
 *     description: |
 *       Calculates consumption between two dates for a specified meter or submeter. Only admins can calculate consumption.
 *       Last updated: June 11, 2025, 12:19 PM +06.
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
 *               - startDate
 *               - endDate
 *             properties:
 *               meterId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the main meter (mutually exclusive with submeterId)
 *                 nullable: true
 *               submeterId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the submeter (mutually exclusive with meterId)
 *                 nullable: true
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Start date for consumption calculation
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: End date for consumption calculation
 *             example:
 *               meterId: 123e4567-e89b-12d3-a456-426614174000
 *               startDate: 2025-06-01T00:00:00Z
 *               endDate: 2025-06-30T23:59:59Z
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: number
 *               example: 123.456789
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
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
  .get(validate(meterReadingValidation.getMeterReading), meterReadingController.getMeterReadingById)
  .patch(validate(meterReadingValidation.updateMeterReading), meterReadingController.updateMeterReadingById)
  .delete(validate(meterReadingValidation.deleteMeterReading), meterReadingController.deleteMeterReadingById);

router
  .route('/:id/hard')
  .delete(validate(meterReadingValidation.deleteMeterReading), meterReadingController.hardDeleteMeterReadingById);

router
  .route('/calculate-consumption')
  .post(validate(meterReadingValidation.calculateConsumption), meterReadingController.calculateConsumption);

module.exports = router;
