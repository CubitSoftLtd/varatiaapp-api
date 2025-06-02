const express = require('express');
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
 *       Only admins can create utility types.
 *       Last updated: June 01, 2025, 9:02 PM +06.
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Unique name of the utility type
 *               unitRate:
 *                 type: number
 *                 format: float
 *                 description: Rate per unit (e.g., 12.25, 2.50)
 *               unitOfMeasurement:
 *                 type: string
 *                 description: Unit of measurement (e.g., kWh, gallons)
 *                 default: unit
 *             example:
 *               name: Electricity
 *               unitRate: 1.25
 *               unitOfMeasurement: kWh
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
 *       Admins can retrieve all utility types. Other users can view utility types.
 *       Last updated: June 01, 2025, 9:02 PM +06.
 *     tags: [UtilityTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Utility type name
 *       - in: query
 *         name: unitOfMeasurement
 *         schema:
 *           type: string
 *         description: Unit of measurement
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
 *       Admins can fetch any utility type. Other users can view utility types.
 *       Last updated: June 01, 2025, 9:02 PM +06.
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
 *       Last updated: June 01, 2025, 9:02 PM +06.
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
 *                 description: Unique name of the utility type
 *               unitRate:
 *                 type: number
 *                 format: float
 *                 description: Rate per unit (e.g., 12.25, 2.50)
 *               unitOfMeasurement:
 *                 type: string
 *                 description: Unit of measurement (e.g., kWh, gallons)
 *             example:
 *               name: Electricity Updated
 *               unitRate: 1.50
 *               unitOfMeasurement: kWh
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
 *     summary: Delete a utility type by ID
 *     description: |
 *       Only admins can delete utility types.
 *       Last updated: June 01, 2025, 9:02 PM +06.
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
  .post(validate(utilityTypeValidation.createUtilityType), utilityTypeController.createUtilityType)
  .get(validate(utilityTypeValidation.getUtilityTypes), utilityTypeController.getUtilityTypes);

router
  .route('/:id')
  .get(validate(utilityTypeValidation.getUtilityType), utilityTypeController.getUtilityTypeById)
  .patch(validate(utilityTypeValidation.updateUtilityType), utilityTypeController.updateUtilityTypeById)
  .delete(validate(utilityTypeValidation.deleteUtilityType), utilityTypeController.deleteUtilityTypeById);

module.exports = router;
