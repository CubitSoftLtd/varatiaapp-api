const express = require('express');
const validate = require('../../middlewares/validate');
const propertyValidation = require('../../validations/property.validation');
const propertyController = require('../../controllers/property.controller');
const expenseRouter = require('./expense.route'); // Import the expense routes

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
 *       Only owners and managers can create properties.
 *       Last updated: June 01, 2025, 9:59 PM +06.
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
 *                 description: Address of the property
 *               accountId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the associated account
 *             example:
 *               name: Downtown Apartment
 *               address: 123 Main St
 *               accountId: "123e4567-e89b-12d3-a456-426614174000"
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
 *     summary: Get all properties for the user's account
 *     description: |
 *       Users can retrieve their own properties.
 *       Last updated: June 01, 2025, 9:59 PM +06.
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         description: JSON string to filter properties
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by field (e.g., "name:asc")
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of results per page
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
 *       Users can fetch their own properties.
 *       Last updated: June 01, 2025, 9:59 PM +06.
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
 *       Only owners and managers can update properties.
 *       Last updated: June 01, 2025, 9:59 PM +06.
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
 *                 description: Address of the property
 *               accountId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the associated account
 *             example:
 *               name: Downtown Apartment Updated
 *               address: 124 Main St
 *               accountId: "123e4567-e89b-12d3-a456-426614174000"
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
 *     summary: Delete a property by ID
 *     description: |
 *       Only owners and managers can delete properties.
 *       Last updated: June 01, 2025, 9:59 PM +06.
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
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * POST   /properties
 * GET    /properties
 */
router
  .route('/')
  .post(validate(propertyValidation.createProperty), propertyController.createProperty)
  .get(validate(propertyValidation.getProperties), propertyController.getProperties);

/**
 * GET    /properties/:id
 * PATCH  /properties/:id
 * DELETE /properties/:id
 */
router
  .route('/:id')
  .get(validate(propertyValidation.getProperty), propertyController.getPropertyById)
  .patch(validate(propertyValidation.updateProperty), propertyController.updatePropertyById)
  .delete(validate(propertyValidation.deleteProperty), propertyController.deletePropertyById);

/**
 * Mount expenseRouter under /properties/:id/expenses
 *
 * - POST   /properties/:id/expenses       → create a new property expense
 * - GET    /properties/:id/expenses       → list all property expenses
 * - GET    /properties/:id/expenses/:id   → get a single expense by its ID
 * - PATCH  /properties/:id/expenses/:id   → update an expense by its ID
 * - DELETE /properties/:id/expenses/:id   → delete an expense by its ID
 */
router.use('/:propertyId/expenses', expenseRouter);

module.exports = router;
