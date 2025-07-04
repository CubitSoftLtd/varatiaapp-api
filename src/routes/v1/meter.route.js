const express = require('express');
const auth = require('../../middlewares/auth');
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
 *     description: |
 *       Only admins can create new meters.
 *       Last updated: June 11, 2025, 10:47 AM +06.
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
 *                 description: Unique identifier or serial number of the meter
 *               propertyId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the property to which this meter is assigned
 *               utilityTypeId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the utility type (e.g., electricity, water, gas)
 *               status:
 *                 type: string
 *                 enum: [active, inactive, maintenance, retired]
 *                 description: Current operational status of the meter
 *                 default: active
 *               installedDate:
 *                 type: string
 *                 format: date
 *                 description: Date the meter was installed
 *                 nullable: true
 *               lastReadingDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date of the last recorded reading
 *                 nullable: true
 *               description:
 *                 type: string
 *                 description: Optional detailed description of the meter
 *                 nullable: true
 *             example:
 *               number: MTR123456
 *               propertyId: 123e4567-e89b-12d3-a456-426614174000
 *               utilityTypeId: 789c1234-d56e-78f9-g012-345678901234
 *               status: active
 *               installedDate: 2025-01-01
 *               lastReadingDate: 2025-06-01T10:00:00Z
 *               description: Main electricity meter for building
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
 *     description: |
 *       Only admins can retrieve all meters.
 *       Last updated: June 11, 2025, 10:47 AM +06.
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
 *           enum: [active, inactive, maintenance, retired]
 *         description: Meter status
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Property ID
 *       - in: query
 *         name: utilityTypeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Utility type ID
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
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         description: Comma-separated list of associations and their attributes (ex. property:id,name|utilityType:id,name)
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
 *     summary: Get a meter by ID
 *     description: |
 *       Only admins can fetch any meter. Account owners can fetch meters for their properties.
 *       Last updated: June 11, 2025, 10:47 AM +06.
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
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         description: Comma-separated list of associations and their attributes (ex. property:id,name|utilityType:id,name)
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
 *       Only admins can update any meter. Account owners can update meters for their properties.
 *       Last updated: June 11, 2025, 10:47 AM +06.
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
 *                 description: Unique identifier or serial number of the meter
 *               propertyId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the property to which this meter is assigned
 *               utilityTypeId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the utility type (e.g., electricity, water, gas)
 *               status:
 *                 type: string
 *                 enum: [active, inactive, maintenance, retired]
 *                 description: Current operational status of the meter
 *               installedDate:
 *                 type: string
 *                 format: date
 *                 description: Date the meter was installed
 *                 nullable: true
 *               lastReadingDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date of the last recorded reading
 *                 nullable: true
 *               description:
 *                 type: string
 *                 description: Optional detailed description of the meter
 *                 nullable: true
 *             example:
 *               number: MTR123456-UPDATED
 *               propertyId: 123e4567-e89b-12d3-a456-426614174000
 *               utilityTypeId: 789c1234-d56e-78f9-g012-345678901234
 *               status: maintenance
 *               installedDate: 2025-01-01
 *               lastReadingDate: 2025-06-01T10:00:00Z
 *               description: Updated electricity meter description
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
 *     summary: Soft delete a meter by ID
 *     description: |
 *       Marks the meter as inactive. Only admins can soft delete any meter. Account owners can soft delete meters for their properties.
 *       Last updated: June 11, 2025, 10:47 AM +06.
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
 *
 * /meters/{id}/hard:
 *   delete:
 *     summary: Hard delete a meter by ID
 *     description: |
 *       Permanently deletes the meter and its associated data. Only admins can perform a hard delete.
 *       Last updated: June 11, 2025, 10:47 AM +06.
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
 * /meters/{id}/restore:
 *   delete:
 *     summary: Restore a meter by ID
 *     description: |
 *      Restore the meter and its associated data. Only admins can perform a restore.
 *       Last updated: June 11, 2025, 10:47 AM +06.
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
  .post(auth('meter:management'), validate(meterValidation.createMeter), meterController.createMeter)
  .get(auth('meter:management'), validate(meterValidation.getMeters), meterController.getMeters);

router
  .route('/:id')
  .get(auth('meter:management'), validate(meterValidation.getMeter), meterController.getMeterById)
  .patch(auth('meter:management'), validate(meterValidation.updateMeter), meterController.updateMeterById)
  .delete(auth('meter:management'), validate(meterValidation.deleteMeter), meterController.deleteMeterById);

router.route('/:id/hard').delete(auth(), validate(meterValidation.deleteMeter), meterController.hardDeleteMeterById);
router.route('/:id/restore').delete(auth(), validate(meterValidation.restoreMeter), meterController.restoreMeterById);

module.exports = router;
