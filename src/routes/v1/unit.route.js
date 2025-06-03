const express = require('express');
const validate = require('../../middlewares/validate');
const unitValidation = require('../../validations/unit.validation');
const unitController = require('../../controllers/unit.controller');
const expenseRouter = require('./expense.route');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Units
 *   description: Unit management and retrieval
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Unit:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the unit
 *         name:
 *           type: string
 *           description: Name of the unit (e.g., A101)
 *         propertyId:
 *           type: string
 *           format: uuid
 *           description: ID of the associated property
 *         rentAmount:
 *           type: number
 *           format: float
 *           description: Monthly rent amount for the unit
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
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
 *               - name
 *               - rentAmount
 *             properties:
 *               propertyId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the property
 *               name:
 *                 type: string
 *                 description: Name of the unit (e.g., A101)
 *               rentAmount:
 *                 type: number
 *                 format: float
 *                 description: Monthly rent amount for the unit
 *             example:
 *               propertyId: "550e8400-e29b-41d4-a716-446655440000"
 *               name: "A101"
 *               rentAmount: 1200.00
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
 *           type: string
 *           format: uuid
 *         description: Property ID
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
 *           default: 10
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
 *           type: string
 *           format: uuid
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
 *           type: string
 *           format: uuid
 *         description: Unit id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the unit (e.g., A102)
 *               rentAmount:
 *                 type: number
 *                 format: float
 *                 description: Monthly rent amount for the unit
 *             example:
 *               name: "A102"
 *               rentAmount: 1300.00
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
 *           type: string
 *           format: uuid
 *         description: Unit id
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

/**
 * GET    /units/:id
 * PATCH  /units/:id
 * DELETE /units/:id
 */
router
  .route('/:id')
  .get(validate(unitValidation.getUnit), unitController.getUnitById)
  .patch(validate(unitValidation.updateUnit), unitController.updateUnitById)
  .delete(validate(unitValidation.deleteUnit), unitController.deleteUnitById);

/**
 * Mount expenseRouter under /units/:id/expenses
 *
 * - POST   /units/:id/expenses       → create a new unit expense
 * - GET    /units/:id/expenses       → list all unit expenses
 * - GET    /units/:id/expenses/:id   → get a single expense by its ID
 * - PATCH  /units/:id/expenses/:id   → update an expense by its ID
 * - DELETE /units/:id/expenses/:id   → delete an expense by its ID
 */
router.use('/:unitId/expenses', expenseRouter);

module.exports = router;
