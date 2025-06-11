const express = require('express');
const validate = require('../../middlewares/validate');
const unitValidation = require('../../validations/unit.validation');
const unitController = require('../../controllers/unit.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Units
 *   description: Unit management and retrieval
 */

/**
 * @swagger
 * /units:
 *   post:
 *     summary: Create a new unit
 *     description: |
 *       Only admins can create new units.
 *       Last updated: June 11, 2025, 11:55 AM +06.
 *     tags: [Units]
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
 *               - propertyId
 *               - rentAmount
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name or number of the unit
 *               propertyId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the property to which this unit belongs
 *               rentAmount:
 *                 type: number
 *                 description: Base monthly rent amount for this unit
 *               status:
 *                 type: string
 *                 enum: [occupied, vacant, maintenance, inactive]
 *                 description: Current occupancy status of the unit
 *                 default: vacant
 *               bedroomCount:
 *                 type: integer
 *                 description: Number of bedrooms in the unit
 *                 nullable: true
 *               bathroomCount:
 *                 type: number
 *                 description: Number of bathrooms in the unit
 *                 nullable: true
 *               squareFootage:
 *                 type: number
 *                 description: Area of the unit in square feet/meters
 *                 nullable: true
 *             example:
 *               name: Apt 101
 *               propertyId: 123e4567-e89b-12d3-a456-426614174000
 *               rentAmount: 1200.00
 *               status: vacant
 *               bedroomCount: 2
 *               bathroomCount: 1.5
 *               squareFootage: 800.00
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Unit'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all units
 *     description: |
 *       Only admins can retrieve all units.
 *       Last updated: June 11, 2025, 11:55 AM +06.
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Unit name
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Property ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [occupied, vacant, maintenance, inactive]
 *         description: Unit status
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
 *         description: Maximum number of units
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
 *         description: Comma-separated list of associations and their attributes (ex. property:id,name|tenants:id,firstName)
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
 *                     $ref: '#/components/schemas/Unit'
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
 * /units/{id}:
 *   get:
 *     summary: Get a unit by ID
 *     description: |
 *       Only admins can fetch any unit. Account owners can fetch units for their properties.
 *       Last updated: June 11, 2025, 11:55 AM +06.
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unit ID
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         description: Comma-separated list of associations and their attributes (ex. property:id,name|tenants:id,firstName)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Unit'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a unit by ID
 *     description: |
 *       Only admins can update any unit. Account owners can update units for their properties.
 *       Last updated: June 11, 2025, 11:55 AM +06.
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unit ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name or number of the unit
 *               propertyId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the property to which this unit belongs
 *               rentAmount:
 *                 type: number
 *                 description: Base monthly rent amount for this unit
 *               status:
 *                 type: string
 *                 enum: [occupied, vacant, maintenance, inactive]
 *                 description: Current occupancy status of the unit
 *               bedroomCount:
 *                 type: integer
 *                 description: Number of bedrooms in the unit
 *                 nullable: true
 *               bathroomCount:
 *                 type: number
 *                 description: Number of bathrooms in the unit
 *                 nullable: true
 *               squareFootage:
 *                 type: number
 *                 description: Area of the unit in square feet/meters
 *                 nullable: true
 *             example:
 *               name: Apt 102
 *               rentAmount: 1300.00
 *               status: occupied
 *               bedroomCount: 3
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Unit'
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
 *     summary: Soft delete a unit by ID
 *     description: |
 *       Marks the unit as inactive. Only admins can soft delete any unit. Account owners can soft delete units for their properties.
 *       Last updated: June 11, 2025, 11:55 AM +06.
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unit ID
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
 * /units/{id}/hard:
 *   delete:
 *     summary: Hard delete a unit by ID
 *     description: |
 *       Permanently deletes the unit and its associated data. Only admins can perform a hard delete.
 *       Last updated: June 11, 2025, 11:55 AM +06.
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unit ID
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
  .post(validate(unitValidation.createUnit), unitController.createUnit)
  .get(validate(unitValidation.getUnits), unitController.getUnits);

router
  .route('/:id')
  .get(validate(unitValidation.getUnit), unitController.getUnitById)
  .patch(validate(unitValidation.updateUnit), unitController.updateUnitById)
  .delete(validate(unitValidation.deleteUnit), unitController.deleteUnitById);

router.route('/:id/hard').delete(validate(unitValidation.deleteUnit), unitController.hardDeleteUnitById);

module.exports = router;
