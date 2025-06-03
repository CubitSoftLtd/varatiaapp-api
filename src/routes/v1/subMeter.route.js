const express = require('express');
const validate = require('../../middlewares/validate');
const subMeterValidation = require('../../validations/subMeter.validation');
const subMeterController = require('../../controllers/subMeter.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Submeters
 *   description: Sub-meter management and retrieval
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Submeter:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the sub-meter
 *         meterId:
 *           type: string
 *           format: uuid
 *           description: ID of the parent meter
 *         unitId:
 *           type: string
 *           format: uuid
 *           description: ID of the unit associated with the sub-meter
 *         submeterNumber:
 *           type: string
 *           description: Unique sub-meter number
 *         status:
 *           type: string
 *           enum: [active, inactive, maintenance]
 *           description: Status of the sub-meter
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /sub-meters:
 *   post:
 *     summary: Create a new sub-meter
 *     description: Only admins and owners can create sub-meters.
 *     tags: [Submeters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - meterId
 *               - unitId
 *               - submeterNumber
 *             properties:
 *               meterId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the parent meter
 *               unitId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the unit associated with the sub-meter
 *               submeterNumber:
 *                 type: string
 *                 description: Unique sub-meter number
 *               status:
 *                 type: string
 *                 enum: [active, inactive, maintenance]
 *                 description: Status of the sub-meter
 *             example:
 *               meterId: "550e8400-e29b-41d4-a716-446655440000"
 *               unitId: "987fcdeb-1234-5678-9abc-def123456789"
 *               submeterNumber: "SUBMTR12345"
 *               status: "active"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Submeter'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all sub-meters
 *     description: Admins and owners can retrieve all sub-meters. Tenants can retrieve sub-meters for their units.
 *     tags: [Submeters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: meterId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Parent meter ID
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unit ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by query in the form of field:desc/asc (ex. submeterNumber:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Maximum number of sub-meters
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
 *                     $ref: '#/components/schemas/Submeter'
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
 * /sub-meters/{id}:
 *   get:
 *     summary: Get a sub-meter
 *     description: Admins and owners can fetch any sub-meter. Tenants can fetch sub-meters for their units.
 *     tags: [Submeters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Sub-meter ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Submeter'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a sub-meter
 *     description: Only admins and owners can update sub-meters.
 *     tags: [Submeters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Sub-meter ID
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
 *                 description: ID of the parent meter
 *               unitId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the unit associated with the sub-meter
 *               submeterNumber:
 *                 type: string
 *                 description: Unique sub-meter number
 *               status:
 *                 type: string
 *                 enum: [active, inactive, maintenance]
 *                 description: Status of the sub-meter
 *             example:
 *               meterId: "550e8400-e29b-41d4-a716-446655440000"
 *               unitId: "987fcdeb-1234-5678-9abc-def123456789"
 *               submeterNumber: "SUBMTR67890"
 *               status: "maintenance"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Submeter'
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
 *     summary: Delete a sub-meter
 *     description: Only admins and owners can delete sub-meters.
 *     tags: [Submeters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Sub-meter ID
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
  .post(validate(subMeterValidation.createSubmeter), subMeterController.createSubmeter)
  .get(validate(subMeterValidation.getSubmeters), subMeterController.getSubmeters);

router
  .route('/:id')
  .get(validate(subMeterValidation.getSubmeter), subMeterController.getSubmeterById)
  .patch(validate(subMeterValidation.updateSubmeter), subMeterController.updateSubmeterById)
  .delete(validate(subMeterValidation.deleteSubmeter), subMeterController.deleteSubmeterById);

module.exports = router;
