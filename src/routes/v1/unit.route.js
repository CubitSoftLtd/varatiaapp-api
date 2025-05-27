const express = require('express');
const auth = require('../../middlewares/auth');
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
 *     description: Only admins and owners can create units.
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
 *               - propertyId
 *               - unitNumber
 *               - type
 *             properties:
 *               propertyId:
 *                 type: integer
 *                 description: ID of the property
 *               unitNumber:
 *                 type: string
 *                 description: Unique unit number within the property
 *               type:
 *                 type: string
 *                 enum: [apartment, office, retail]
 *                 description: Type of unit
 *             example:
 *               propertyId: 1
 *               unitNumber: A101
 *               type: apartment
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
 *     description: Admins and owners can retrieve all units. Tenants can retrieve units they are associated with.
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: integer
 *         description: Property ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Unit type
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by query in the form of field:desc/asc (ex. unitNumber:asc)
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
 *     summary: Get a unit
 *     description: Admins and owners can fetch any unit. Tenants can fetch units they are associated with.
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unit id
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
 *     summary: Update a unit
 *     description: Only admins and owners can update units.
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unit id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               unitNumber:
 *                 type: string
 *                 description: Unique unit number within the property
 *               type:
 *                 type: string
 *                 enum: [apartment, office, retail]
 *                 description: Type of unit
 *             example:
 *               unitNumber: A102
 *               type: office
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
 *     summary: Delete a unit
 *     description: Only admins and owners can delete units.
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unit id
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
  .post(auth('manageUnits'), validate(unitValidation.createUnit), unitController.createUnit)
  .get(auth('getUnits'), validate(unitValidation.getUnits), unitController.getUnits);

router
  .route('/:id')
  .get(auth('getUnits'), validate(unitValidation.getUnit), unitController.getUnit)
  .patch(auth('manageUnits'), validate(unitValidation.updateUnit), unitController.updateUnit)
  .delete(auth('manageUnits'), validate(unitValidation.deleteUnit), unitController.deleteUnit);

module.exports = router;
