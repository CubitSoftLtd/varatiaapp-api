const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const leaseValidation = require('../../validations/lease.validation');
const leaseController = require('../../controllers/lease.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Leases
 *   description: Lease management and retrieval
 */

/**
 * @swagger
 * /leases:
 *   post:
 *     summary: Create a new lease
 *     description: Only admins and owners can create leases.
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
 *                 description: Start date of the lease
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of the lease
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
 *               $ref: '#/components/schemas/Lease'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all leases
 *     description: Admins and owners can retrieve all leases. Tenants can retrieve their own leases.
 *     tags: [Leases]
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
 *         description: Maximum number of leases
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
 *                     $ref: '#/components/schemas/Lease'
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
 * /leases/{id}:
 *   get:
 *     summary: Get a lease
 *     description: Admins and owners can fetch any lease. Tenants can fetch their own leases.
 *     tags: [Leases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lease id
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
 *     summary: Update a lease
 *     description: Only admins and owners can update leases.
 *     tags: [Leases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lease id
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
 *                 description: Start date of the lease
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of the lease
 *               rentAmount:
 *                 type: number
 *                 description: Monthly rent amount
 *               status:
 *                 type: string
 *                 enum: [active, terminated, expired]
 *                 description: Lease status
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
 *               $ref: '#/components/schemas/Lease'
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
 *     summary: Delete a lease
 *     description: Only admins and owners can delete leases.
 *     tags: [Leases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lease id
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
  .post(auth('manageLeases'), validate(leaseValidation.createLease), leaseController.createLease)
  .get(auth('getLeases'), validate(leaseValidation.getLeases), leaseController.getLeases);

router
  .route('/:id')
  .get(auth('getLeases'), validate(leaseValidation.getLease), leaseController.getLease)
  .patch(auth('manageLeases'), validate(leaseValidation.updateLease), leaseController.updateLease)
  .delete(auth('manageLeases'), validate(leaseValidation.deleteLease), leaseController.deleteLease);

module.exports = router;
