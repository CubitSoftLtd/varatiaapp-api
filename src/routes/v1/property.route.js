/* eslint-disable prettier/prettier */
const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const propertyValidation = require('../../validations/property.validation');
const propertyController = require('../../controllers/property.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Properties
 *   description: Property management and retrieval
 */

/**
 * @swagger
 * /properties:
 *   post:
 *     summary: Create a new property
 *     description: |
 *       Only admins can create new properties.
 *       Last updated: June 11, 2025, 11:07 AM +06.
 *     tags: [Properties]
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
 *               - address
 *               - accountId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the property
 *               address:
 *                 type: string
 *                 description: Full physical address of the property
 *               accountId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the account to which this property belongs
 *               type:
 *                 type: string
 *                 enum: [residential, commercial, mixed-use]
 *                 description: Type of property
 *                 nullable: true
 *               yearBuilt:
 *                 type: integer
 *                 description: Year the property was built
 *                 nullable: true
 *               totalUnits:
 *                 type: integer
 *                 description: Total number of units in the property
 *                 nullable: true
 *             example:
 *               name: Main Street Apartments
 *               address: 123 Main St, Anytown, USA
 *               accountId: 123e4567-e89b-12d3-a456-426614174000
 *               type: residential
 *               yearBuilt: 2005
 *               totalUnits: 50
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all properties
 *     description: |
 *       Only admins can retrieve all properties.
 *       Last updated: June 11, 2025, 11:07 AM +06.
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Property name
 *       - in: query
 *         name: address
 *         schema:
 *           type: string
 *         description: Property address
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Account ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [residential, commercial, mixed-use]
 *         description: Property type
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
 *         description: Maximum number of properties
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
 *         description: Comma-separated list of associations and their attributes (ex. account:id,name|units:id,name)
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
 *                     $ref: '#/components/schemas/Property'
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
 * /properties/{id}:
 *   get:
 *     summary: Get a property by ID
 *     description: |
 *       Only admins can fetch any property. Account owners can fetch their own properties.
 *       Last updated: June 11, 2025, 11:07 AM +06.
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Property ID
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         description: Comma-separated list of associations and their attributes (ex. account:id,name|units:id,name)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a property by ID
 *     description: |
 *       Only admins can update any property. Account owners can update their own properties.
 *       Last updated: June 11, 2025, 11:07 AM +06.
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the property
 *               address:
 *                 type: string
 *                 description: Full physical address of the property
 *               accountId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the account to which this property belongs
 *               type:
 *                 type: string
 *                 enum: [residential, commercial, mixed-use]
 *                 description: Type of property
 *                 nullable: true
 *               yearBuilt:
 *                 type: integer
 *                 description: Year the property was built
 *                 nullable: true
 *               totalUnits:
 *                 type: integer
 *                 description: Total number of units in the property
 *                 nullable: true
 *             example:
 *               name: Main Street Apartments Updated
 *               address: 123 Main St, Anytown, USA
 *               accountId: 123e4567-e89b-12d3-a456-426614174000
 *               type: commercial
 *               yearBuilt: 2010
 *               totalUnits: 60
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
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
 *     summary: Soft delete a property by ID
 *     description: |
 *       Marks the property as inactive. Only admins can soft delete any property. Account owners can soft delete their own properties.
 *       Last updated: June 11, 2025, 11:07 AM +06.
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Property ID
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
 * /properties/{id}/hard:
 *   delete:
 *     summary: Hard delete a property by ID
 *     description: |
 *       Permanently deletes the property and its associated data. Only admins can perform a hard delete.
 *       Last updated: June 11, 2025, 11:07 AM +06.
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Property ID
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 * /properties/{id}/restore:
 *   delete:
 *     summary: Restore a property by ID
 *     description: |
 *       Restore the property and its associated data. Only admins can perform a restore.
 *       Last updated: June 11, 2025, 11:07 AM +06.
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Property ID
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
  .post(auth('property:management'), validate(propertyValidation.createProperty), propertyController.createProperty)
  .get(auth('property:management'), validate(propertyValidation.getProperties), propertyController.getProperties);

router
  .route('/:id')
  .get(auth('property:management'), validate(propertyValidation.getProperty), propertyController.getPropertyById)
  .patch(auth('property:management'), validate(propertyValidation.updateProperty), propertyController.updatePropertyById)
  .delete(auth('property:management'), validate(propertyValidation.deleteProperty), propertyController.deletePropertyById);

router
  .route('/:id/hard')
  .delete(
    auth('property:management'),
    validate(propertyValidation.deleteProperty),
    propertyController.hardDeletePropertyById
  );
router
  .route('/:id/restore')
  .delete(auth('property:management'), validate(propertyValidation.deleteProperty), propertyController.restorePropertyById);

module.exports = router;
