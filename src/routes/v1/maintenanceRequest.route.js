const express = require('express');
const validate = require('../../middlewares/validate');
const maintenanceRequestValidation = require('../../validations/maintenanceRequest.validation');
const maintenanceRequestController = require('../../controllers/maintenanceRequest.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: MaintenanceRequests
 *   description: Maintenance request management and retrieval
 */

/**
 * @swagger
 * /units/{unitId}/maintenance-requests:
 *   post:
 *     summary: Create a new maintenance request
 *     description: Tenants can create maintenance requests for their units. Admins and owners can create requests for any unit.
 *     tags: [MaintenanceRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unitId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unit ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - requestDate
 *             properties:
 *               description:
 *                 type: string
 *                 description: Description of the maintenance issue
 *               requestDate:
 *                 type: string
 *                 format: date
 *                 description: Date of the request
 *             example:
 *               description: Leaky faucet in the kitchen
 *               requestDate: 2025-05-27
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MaintenanceRequest'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all maintenance requests for a unit
 *     description: Admins and owners can retrieve all maintenance requests. Tenants can retrieve requests for their units.
 *     tags: [MaintenanceRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unitId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unit ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by query in the form of field:desc/asc (ex. requestDate:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of maintenance requests
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
 *                     $ref: '#/components/schemas/MaintenanceRequest'
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
 * /maintenance-requests/{id}:
 *   get:
 *     summary: Get a maintenance request by ID
 *     description: Admins and owners can fetch any maintenance request. Tenants can fetch requests for their units.
 *     tags: [MaintenanceRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Maintenance Request ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MaintenanceRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a maintenance request by ID
 *     description: Only admins and owners can update maintenance requests.
 *     tags: [MaintenanceRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Maintenance Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, in-progress, closed]
 *                 description: Status of the maintenance request
 *               description:
 *                 type: string
 *                 description: Description of the maintenance issue
 *             example:
 *               status: in-progress
 *               description: Leaky faucet in the kitchen - plumber scheduled
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MaintenanceRequest'
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
 *     summary: Delete a maintenance request by ID
 *     description: Only admins and owners can delete maintenance requests.
 *     tags: [MaintenanceRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Maintenance Request ID
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
  .route('/units/:unitId/maintenance-requests')
  .post(
    validate(maintenanceRequestValidation.createMaintenanceRequest),
    maintenanceRequestController.createMaintenanceRequest
  )
  .get(validate(maintenanceRequestValidation.getMaintenanceRequests), maintenanceRequestController.getMaintenanceRequests);

router
  .route('/maintenance-requests/:id')
  .get(validate(maintenanceRequestValidation.getMaintenanceRequest), maintenanceRequestController.getMaintenanceRequestById)
  .patch(
    validate(maintenanceRequestValidation.updateMaintenanceRequest),
    maintenanceRequestController.updateMaintenanceRequestById
  )
  .delete(
    validate(maintenanceRequestValidation.deleteMaintenanceRequest),
    maintenanceRequestController.deleteMaintenanceRequestById
  );

module.exports = router;
