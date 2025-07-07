const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const utilityTypeValidation = require('../../validations/utilityType.validation');
const utilityTypeController = require('../../controllers/utilityType.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: UtilityTypes
 *   description: Utility type management and retrieval
 */

/**
 * @swagger
 * /utility-types:
 *   post:
 *     summary: Create a new utility type
 *     description: |
 *       Only admins can create new utility types.
 *       Last updated: June 11, 2025, 12:14 PM +06.
 *     tags: [UtilityTypes]
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
 *               - unitRate
 *               - unitOfMeasurement
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the utility type (e.g., Electricity, Water)
 *               unitRate:
 *                 type: number
 *                 description: Default rate per unit of measurement
 *               unitOfMeasurement:
 *                 type: string
 *                 description: Standard unit of measurement (e.g., kWh, m³)
 *               description:
 *                 type: string
 *                 description: Detailed description of the utility type
 *                 nullable: true
 *             example:
 *               name: Electricity
 *               unitRate: 0.123456
 *               unitOfMeasurement: kWh
 *               description: Cost per kilowatt-hour for electricity usage
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UtilityType'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all utility types
 *     description: |
 *       Only admins can retrieve all utility types.
 *       Last updated: June 11, 2025, 12:14 PM +06.
 *     tags: [UtilityTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by utility type name
 *       - in: query
 *         name: unitOfMeasurement
 *         schema:
 *           type: string
 *         description: Filter by unit of measurement
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
 *         description: Maximum number of utility types
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
 *         description: Comma-separated list of associations and their attributes (ex. meters:id,serialNumber)
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
 *                     $ref: '#/components/schemas/UtilityType'
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
 * /utility-types/{id}:
 *   get:
 *     summary: Get a utility type by ID
 *     description: |
 *       Only admins can fetch utility types.
 *       Last updated: June 11, 2025, 12:14 PM +06.
 *     tags: [UtilityTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Utility type ID
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         description: Comma-separated list of associations and their attributes (ex. meters:id,serialNumber)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UtilityType'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a utility type by ID
 *     description: |
 *       Only admins can update utility types.
 *       Last updated: June 11, 2025, 12:14 PM +06.
 *     tags: [UtilityTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Utility type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the utility type
 *               unitRate:
 *                 type: number
 *                 description: Default rate per unit of measurement
 *               unitOfMeasurement:
 *                 type: string
 *                 description: Standard unit of measurement
 *               description:
 *                 type: string
 *                 description: Detailed description of the utility type
 *                 nullable: true
 *             example:
 *               name: Water
 *               unitRate: 1.234567
 *               unitOfMeasurement: m³
 *               description: Updated cost per cubic meter for water usage
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UtilityType'
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
 *     summary: Soft delete a utility type by ID
 *     description: |
 *       Marks the utility type as deleted. Only admins can soft delete utility types.
 *       Last updated: June 11, 2025, 12:14 PM +06.
 *     tags: [UtilityTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Utility type ID
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
 * /utility-types/{id}/hard:
 *   delete:
 *     summary: Hard delete a utility type by ID
 *     description: |
 *       Permanently deletes the utility type. Only admins can perform a hard delete.
 *       Last updated: June 11, 2025, 12:14 PM +06.
 *     tags: [UtilityTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Utility type ID
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 * /utility-types/{id}/restore:
 *   delete:
 *     summary: Hard delete a utility type by ID
 *     description: |
 *       Permanently deletes the utility type. Only admins can perform a hard delete.
 *       Last updated: June 11, 2025, 12:14 PM +06.
 *     tags: [UtilityTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Utility type ID
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
  .post(auth(), validate(utilityTypeValidation.createUtilityType), utilityTypeController.createUtilityType)
  .get(auth(), validate(utilityTypeValidation.getUtilityTypes), utilityTypeController.getUtilityTypes);

router
  .route('/:id')
  .get(auth(), validate(utilityTypeValidation.getUtilityType), utilityTypeController.getUtilityTypeById)
  .patch(auth(), validate(utilityTypeValidation.updateUtilityType), utilityTypeController.updateUtilityTypeById)
  .delete(auth(), validate(utilityTypeValidation.deleteUtilityType), utilityTypeController.deleteUtilityTypeById);

router
  .route('/:id/hard')
  .delete(auth(), validate(utilityTypeValidation.deleteUtilityType), utilityTypeController.hardDeleteUtilityTypeById);
router
  .route('/:id/restore')
  .delete(auth(), validate(utilityTypeValidation.deleteUtilityType), utilityTypeController.restoreUtilityTypeById);

module.exports = router;
