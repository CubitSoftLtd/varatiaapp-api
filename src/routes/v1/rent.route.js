const express = require('express');
const validate = require('../../middlewares/validate');
const rentValidation = require('../../validations/rent.validation');
const rentController = require('../../controllers/rent.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rents
 *   description: Rent management and retrieval
 */

/**
 * @swagger
 * /rents:
 *   post:
 *     summary: Create a new rent
 *     description: Only admins and owners can create rents.
 *     tags: [Rents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenantId
 *               - unitId
 *               - startDate
 *               - endDate
 *               - rentAmount
 *             properties:
 *               tenantId:
 *                 type: integer
 *                 description: ID of the tenant
 *               unitId:
 *                 type: integer
 *                 description: ID of the unit
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of the rent
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of the rent
 *               rentAmount:
 *                 type: number
 *                 description: Monthly rent amount
 *             example:
 *               tenantId: 1
 *               unitId: 1
 *               startDate: 2025-06-01
 *               endDate: 2026-05-31
 *               rentAmount: 1000.00
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rent'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all rents
 *     description: Admins and owners can retrieve all rents. Tenants can retrieve their own rents.
 *     tags: [Rents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: integer
 *         description: Tenant ID
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: integer
 *         description: Unit ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by query in the form of field:desc/asc (ex. startDate:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of rents
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
 *                     $ref: '#/components/schemas/Rent'
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
 * /rents/{id}:
 *   get:
 *     summary: Get a rent
 *     description: Admins and owners can fetch any rent. Tenants can fetch their own rents.
 *     tags: [Rents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Rent id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rent'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a rent
 *     description: Only admins and owners can update rents.
 *     tags: [Rents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Rent id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of the rent
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of the rent
 *               rentAmount:
 *                 type: number
 *                 description: Monthly rent amount
 *               status:
 *                 type: string
 *                 enum: [active, terminated, expired]
 *                 description: Rent status
 *             example:
 *               startDate: 2025-06-01
 *               endDate: 2026-06-30
 *               rentAmount: 1050.00
 *               status: active
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rent'
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
 *     summary: Delete a rent
 *     description: Only admins and owners can delete rents.
 *     tags: [Rents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Rent id
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
  .post(validate(rentValidation.createRent), rentController.createRent)
  .get(validate(rentValidation.getRents), rentController.getRents);

router
  .route('/:id')
  .get(validate(rentValidation.getRent), rentController.getRents)
  .patch(validate(rentValidation.updateRent), rentController.updateRentById)
  .delete(validate(rentValidation.deleteRent), rentController.deleteRentById);

module.exports = router;
