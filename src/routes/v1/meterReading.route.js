const express = require('express');
const auth = require('../../middlewares/auth');
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
 *       Admins, owners, and employees can create new meter readings. Use meterId alone for main meter readings, or meterId and submeterId together for submeter readings.
 *       Last updated: Thursday, June 12, 2025, 12:21 PM +06.
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
 *               - consumption
 *             properties:
 *               meterId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the main meter (required for both meter and submeter readings)
 *                 nullable: true
 *               submeterId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the submeter (optional, required only for submeter readings when provided)
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
 *             examples:
 *               Meter Reading:
 *                 value:
 *                   meterId: "123e4567-e89b-12d3-a456-426614174000"
 *                   readingValue: 1234.567890
 *                   readingDate: "2025-06-01T10:00:00Z"
 *                   consumption: 100.50
 *               Submeter Reading:
 *                 value:
 *                   meterId: "123e4567-e89b-12d3-a456-426614174000"
 *                   submeterId: "223e4567-e89b-12d3-a456-426614174001"
 *                   readingValue: 1234.567890
 *                   readingDate: "2025-06-01T10:00:00Z"
 *                   consumption: 100.50
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
 *       Admins, owners, and employees can retrieve all meter readings.
 *       Last updated: Thursday, June 12, 2025, 12:21 PM +06.
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
 *         name: deleted
 *         schema:
 *           type: string
 *           enum: [true, false, all]
 *         description: 'Filter accounts by deletion status (default: false)'
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
 *         description: Comma-separated list of associations and their attributes
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
 * /meter-readings/{id}:
 *   get:
 *     summary: Get a meter reading by ID
 *     description: |
 *       Admins, owners, and employees can fetch meter readings.
 *       Last updated: Thursday, June 12, 2025, 12:21 PM +06.
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
 *         description: Comma-separated list of associations and their attributes
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
 *       Admins, owners, and employees can update meter readings.
 *       Last updated: Thursday, June 12, 2025, 12:21 PM +06.
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
 *                 nullable: true
 *               submeterId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               readingValue:
 *                 type: number
 *               readingDate:
 *                 type: string
 *                 format: date-time
 *               consumption:
 *                 type: number
 *             example:
 *               readingValue: 1235.678901
 *               readingDate: 2025-06-02T10:00:00Z
 *               consumption: 101.25
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
 *       Admins, owners, and employees can soft delete meter readings.
 *       Last updated: Thursday, June 12, 2025, 12:21 PM +06.
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
 *       Only admins can perform a hard delete.
 *       Last updated: Thursday, June 12, 2025, 12:21 PM +06.
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
 * /meter-readings/{id}/restore:
 *   delete:
 *     summary: Restore a meter reading by ID
 *     description: |
 *       Only admins can restore.
 *       Last updated: Thursday, June 12, 2025, 12:21 PM +06.
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
 *       Admins, owners, and employees can calculate consumption.
 *       Last updated: Thursday, June 12, 2025, 12:21 PM +06.
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
 *                 nullable: true
 *               submeterId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
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
  .post(
    auth('meter_reading:management'),
    validate(meterReadingValidation.createMeterReading),
    meterReadingController.createMeterReading
  )
  .get(
    auth('meter_reading:management'),
    validate(meterReadingValidation.getMeterReadings),
    meterReadingController.getMeterReadings
  );

router
  .route('/:id')
  .get(
    auth('meter_reading:management'),
    validate(meterReadingValidation.getMeterReading),
    meterReadingController.getMeterReadingById
  )
  .patch(
    auth('meter_reading:management'),
    validate(meterReadingValidation.updateMeterReading),
    meterReadingController.updateMeterReadingById
  )
  .delete(
    auth('meter_reading:management'),
    validate(meterReadingValidation.deleteMeterReading),
    meterReadingController.deleteMeterReadingById
  );

router
  .route('/:id/hard')
  .delete(
    auth('meter_reading:management'),
    validate(meterReadingValidation.deleteMeterReading),
    meterReadingController.hardDeleteMeterReadingById
  );

router
  .route('/:id/restore')
  .delete(
    auth('meter_reading:management'),
    validate(meterReadingValidation.deleteMeterReading),
    meterReadingController.restoreMeterReadingById
  );

router
  .route('/calculate-consumption')
  .post(
    auth('meter_reading:management'),
    validate(meterReadingValidation.calculateConsumption),
    meterReadingController.calculateConsumption
  );

module.exports = router;
