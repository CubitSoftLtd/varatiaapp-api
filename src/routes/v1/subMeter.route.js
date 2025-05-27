const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const subMeterValidation = require('../../validations/subMeter.validation');
const subMeterController = require('../../controllers/subMeter.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: SubMeters
 *   description: Sub-meter management and retrieval
 */

/**
 * @swagger
 * /sub-meters:
 *   post:
 *     summary: Create a new sub-meter
 *     description: Only admins and owners can create sub-meters.
 *     tags: [SubMeters]
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
 *               - subMeterNumber
 *             properties:
 *               meterId:
 *                 type: integer
 *                 description: ID of the parent meter
 *               unitId:
 *                 type: integer
 *                 description: ID of the unit associated with the sub-meter
 *               subMeterNumber:
 *                 type: string
 *                 description: Unique sub-meter number
 *             example:
 *               meterId: 1
 *               unitId: 1
 *               subMeterNumber: SUBMTR12345
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubMeter'
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
 *     tags: [SubMeters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: meterId
 *         schema:
 *           type: integer
 *         description: Parent meter ID
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: integer
 *         description: Unit ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by query in the form of field:desc/asc (ex. subMeterNumber:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
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
 *                     $ref: '#/components/schemas/SubMeter'
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
 *     tags: [SubMeters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sub-meter id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubMeter'
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
 *     tags: [SubMeters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sub-meter id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               meterId:
 *                 type: integer
 *                 description: ID of the parent meter
 *               unitId:
 *                 type: integer
 *                 description: ID of the unit associated with the sub-meter
 *               subMeterNumber:
 *                 type: string
 *                 description: Unique sub-meter number
 *             example:
 *               meterId: 2
 *               unitId: 2
 *               subMeterNumber: SUBMTR67890
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubMeter'
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
 *     tags: [SubMeters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sub-meter id
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
  .post(auth('manageSubMeters'), validate(subMeterValidation.createSubMeter), subMeterController.createSubMeter)
  .get(auth('getSubMeters'), validate(subMeterValidation.getSubMeters), subMeterController.getSubMeters);

router
  .route('/:id')
  .get(auth('getSubMeters'), validate(subMeterValidation.getSubMeter), subMeterController.getSubMeters)
  .patch(auth('manageSubMeters'), validate(subMeterValidation.updateSubMeter), subMeterController.updateSubMeterById)
  .delete(auth('manageSubMeters'), validate(subMeterValidation.deleteSubMeter), subMeterController.deleteSubMeterById);

module.exports = router;
