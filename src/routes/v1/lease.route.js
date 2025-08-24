/* eslint-disable prettier/prettier */
const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const leaseValidation = require('../../validations/lease.validation');
const { leaseController } = require('../../controllers');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Leases
 *     description: Lease management and retrieval
 */

/**
 * @swagger
 * /leases:
 *   post:
 *     summary: Create a new lease
 *     description: Only admins can create new lease.
 *     tags: [Leases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - unitId
 *               - tenantId
 *               - leaseStartDate
 *               - moveInDate
 *               - startedMeterReading
 *             properties:
 *               tenantId:
 *                 type: string
 *                 format: uuid
 *               propertyId:
 *                 type: string
 *                 format: uuid
 *               unitId:
 *                 type: string
 *                 format: uuid
 *               leaseStartDate:
 *                 type: string
 *                 format: date
 *               leaseEndDate:
 *                 type: string
 *                 format: date
 *               moveInDate:
 *                 type: string
 *                 format: date
 *               moveOutDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [active, terminated]
 *                 default: active
 *               startedMeterReading:
 *                 type: number
 *               notes:
 *                 type: string
 *                 nullable: true
 *             example:
 *               tenantId: 123e4567-e89b-12d3-a456-426614174000
 *               unitId: 223e4567-e89b-12d3-a456-426614174001
 *               propertyId: 223e4567-e89b-12d3-a456-426614174001
 *               leaseStartDate: 2025-06-01
 *               leaseEndDate: 2025-06-30
 *               moveInDate: 2025-06-01
 *               moveOutDate: 2025-06-30
 *               startedMeterReading: 1000.00
 *               deductedAmount: 1000.00
 *               depositAmount: 1000.00
 *               notes: Reliable tenant
 *               status: active
 *     responses:
 *       "201":
 *         description: Created
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all leases
 *     tags: [Leases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, terminated]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of bills
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
 *                     $ref: '#/components/schemas/Lease'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
/**
 * @swagger
 * /leases/{id}:
 *   get:
 *     summary: Get a lease by ID
 *     description: |
 *       Only admins can fetch leases.
 *       Last updated: June 15, 2025, 1:06 PM +06.
 *     tags: [Leases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lease ID
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         description: Comma-separated list of associations and attributes (ex. tenant:id,notes|payments:id,amount)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lease'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a lease by ID
 *     description: |
 *       Only admins can update leases. Total utility amount is recalculated if billing period changes.
 *       Last updated: June 15, 2025, 1:06 PM +06.
 *     tags: [Leases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bill ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - unitId
 *               - tenantId
 *               - leaseStartDate
 *               - moveInDate
 *               - startedMeterReading
 *             properties:
 *               tenantId:
 *                 type: string
 *                 format: uuid
 *               unitId:
 *                 type: string
 *                 format: uuid
 *               propertyId:
 *                 type: string
 *                 format: uuid
 *               leaseStartDate:
 *                 type: string
 *                 format: date
 *               leaseEndDate:
 *                 type: string
 *                 format: date
 *               moveInDate:
 *                 type: string
 *                 format: date
 *               moveOutDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [active, terminated]
 *                 default: active
 *               startedMeterReading:
 *                 type: number
 *               notes:
 *                 type: string
 *                 nullable: true
 *             example:
 *               tenantId: 123e4567-e89b-12d3-a456-426614174000
 *               unitId: 223e4567-e89b-12d3-a456-426614174001
 *               propertyId: 223e4567-e89b-12d3-a456-426614174001
 *               leaseStartDate: 2025-06-01
 *               leaseEndDate: 2025-06-30
 *               moveInDate: 2025-06-01
 *               moveOutDate: 2025-06-30
 *               startedMeterReading: 1000.00
 *               deductedAmount: 1000.00
 *               depositAmount: 1000.00
 *               notes: Reliable tenant
 *               status: active
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bill'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
/**
 * @swagger
 * /leases/{id}:
 *   delete:
 *     summary: Soft delete a lease by ID
 *     tags: [Leases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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

/**
 * @swagger
 * /leases/{id}/hard:
 *   delete:
 *     summary: Hard delete a lease by ID
 *     tags: [Leases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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

/**
 * @swagger
 * /leases/{id}/terminate:
 *   patch:
 *     summary: change status to terminate a lease by ID
 *     tags: [Leases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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

// Route bindings
router
  .route('/')
  .post(auth('lease:management'), validate(leaseValidation.createLease), leaseController.createLease)
  .get(auth('lease:management'), validate(leaseValidation.getLeases), leaseController.getLeases);

router
  .route('/:id')
  .get(auth('lease:management'), validate(leaseValidation.getLease), leaseController.getLeaseById)
  .patch(auth('lease:management'), validate(leaseValidation.updateLease), leaseController.updateLeaseById)
  .delete(auth('lease:management'), validate(leaseValidation.deleteLease), leaseController.deleteLeaseById);

router.route('/:id/hard').delete(auth('lease:management'), validate(leaseValidation.deleteHardLease), leaseController.hardDeleteLeaseById);
router.route('/:id/restore').delete(auth('lease:management'), validate(leaseValidation.deleteLease), leaseController.restoreLeaseById);
router.route('/:id/terminate').patch(auth('lease:management'), validate(leaseValidation.deleteLease), leaseController.terminateLeaseController);

module.exports = router;
