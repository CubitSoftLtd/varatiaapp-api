/* eslint-disable prettier/prettier */
const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const submeterValidation = require('../../validations/subMeter.validation');
const submeterController = require('../../controllers/subMeter.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Submeters
 *   description: Submeter management and retrieval
 */

/**
 * @swagger
 * /sub-meters:
 *   post:
 *     summary: Create a new submeter
 *     description: |
 *       Only admins can create new submeters.
 *       Last updated: June 11, 2025, 10:51 AM +06.
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
 *               - number
 *               - meterId
 *               - unitId
 *             properties:
 *               number:
 *                 type: string
 *                 description: Unique identifier or serial number of the submeter
 *               meterId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the main meter to which this submeter is connected
 *               unitId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the unit to which this submeter is installed
 *               status:
 *                 type: string
 *                 enum: [active, inactive, maintenance, retired]
 *                 description: Current operational status of the submeter
 *                 default: active
 *               installedDate:
 *                 type: string
 *                 format: date
 *                 description: Date the submeter was installed
 *                 nullable: true
 *             example:
 *               number: SUB123456
 *               meterId: 123e4567-e89b-12d3-a456-426614174000
 *               unitId: 789c1234-d56e-78f9-g012-345678901234
 *               status: active
 *               installedDate: 2025-01-01
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
 *     summary: Get all submeters
 *     description: |
 *       Only admins can retrieve all submeters.
 *       Last updated: June 11, 2025, 10:51 AM +06.
 *     tags: [Submeters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: number
 *         schema:
 *           type: string
 *         description: Submeter number
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, maintenance, retired]
 *         description: Submeter status
 *       - in: query
 *         name: meterId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Meter ID
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unit ID
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
 *         description: Sort by query in the form of field:desc/asc (ex. number:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of submeters
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
 *         description: Comma-separated list of associations and their attributes (ex. meter:id,number|unit:id,name)
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
 *     summary: Get a submeter by ID
 *     description: |
 *       Only admins can fetch any submeter. Account owners can fetch submeters for their units.
 *       Last updated: June 11, 2025, 10:51 AM +06.
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
 *         description: Submeter ID
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         description: Comma-separated list of associations and their attributes (ex. meter:id,number|unit:id,name)
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
 *     summary: Update a submeter by ID
 *     description: |
 *       Only admins can update any submeter. Account owners can update submeters for their units.
 *       Last updated: June 11, 2025, 10:51 AM +06.
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
 *         description: Submeter ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               number:
 *                 type: string
 *                 description: Unique identifier or serial number of the submeter
 *               meterId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the main meter to which this submeter is connected
 *               unitId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the unit to which this submeter is installed
 *               status:
 *                 type: string
 *                 enum: [active, inactive, maintenance, retired]
 *                 description: Current operational status of the submeter
 *               installedDate:
 *                 type: string
 *                 format: date
 *                 description: Date the submeter was installed
 *                 nullable: true
 *             example:
 *               number: SUB123456-UPDATED
 *               meterId: 123e4567-e89b-12d3-a456-426614174000
 *               unitId: 789c1234-d56e-78f9-g012-345678901234
 *               status: maintenance
 *               installedDate: 2025-01-01
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
 *     summary: Soft delete a submeter by ID
 *     description: |
 *       Marks the submeter as inactive. Only admins can soft delete any submeter. Account owners can soft delete submeters for their units.
 *       Last updated: June 11, 2025, 10:51 AM +06.
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
 *         description: Submeter ID
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
 * /sub-meters/{id}/hard:
 *   delete:
 *     summary: Hard delete a submeter by ID
 *     description: |
 *       Permanently deletes the submeter. Only admins can perform a hard delete.
 *       Last updated: June 11, 2025, 10:51 AM +06.
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
 *         description: Submeter ID
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 * /sub-meters/{id}/restore:
 *   delete:
 *     summary: Restore a submeter by ID
 *     description: |
 *       Restore the submeter. Only admins can perform a Restore.
 *       Last updated: June 11, 2025, 10:51 AM +06.
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
 *         description: Submeter ID
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
  .post(auth('sub_meter:management'), validate(submeterValidation.createSubmeter), submeterController.createSubmeter)
  .get(auth('sub_meter:management'), validate(submeterValidation.getSubmeters), submeterController.getSubmeters);

router
  .route('/:id')
  .get(auth('sub_meter:management'), validate(submeterValidation.getSubmeter), submeterController.getSubmeterById)
  .patch(auth('sub_meter:management'), validate(submeterValidation.updateSubmeter), submeterController.updateSubmeterById)
  .delete(auth('sub_meter:management'), validate(submeterValidation.deleteSubmeter), submeterController.deleteSubmeterById);

router
  .route('/:id/hard')
  .delete(
    auth('sub_meter:management'),
    validate(submeterValidation.deleteSubmeter),
    submeterController.hardDeleteSubmeterById
  );
router
  .route('/:id/restore')
  .delete(
    auth('sub_meter:management'),
    validate(submeterValidation.deleteSubmeter),
    submeterController.restoreSubmeterById
  );

module.exports = router;
