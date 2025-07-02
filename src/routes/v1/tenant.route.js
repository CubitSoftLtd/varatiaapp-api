const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const tenantValidation = require('../../validations/tenant.validation');
const tenantController = require('../../controllers/tenant.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tenants
 *   description: Tenant management and retrieval
 */

/**
 * @swagger
 * /tenants:
 *   post:
 *     summary: Create a new tenant
 *     description: |
 *       Only admins can create new tenants.
 *       Last updated: June 11, 2025, 11:11 AM +06.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phoneNumber
 *               - leaseStartDate
 *               - depositAmount
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Tenant's first name
 *               lastName:
 *                 type: string
 *                 description: Tenant's last name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Tenant's primary email address
 *               phoneNumber:
 *                 type: string
 *                 description: Tenant's primary phone number
 *               emergencyContactName:
 *                 type: string
 *                 description: Name of the emergency contact person
 *                 nullable: true
 *               emergencyContactPhone:
 *                 type: string
 *                 description: Phone number for the emergency contact
 *                 nullable: true
 *               unitId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the unit the tenant is assigned to
 *                 nullable: true
 *               leaseStartDate:
 *                 type: string
 *                 format: date
 *                 description: Date the tenant's lease agreement started
 *               leaseEndDate:
 *                 type: string
 *                 format: date
 *                 description: Date the tenant's lease agreement ends
 *                 nullable: true
 *               depositAmount:
 *                 type: number
 *                 description: Security deposit amount paid by the tenant
 *               status:
 *                 type: string
 *                 enum: [current, prospective, past, evicted, notice, inactive]
 *                 description: Current status of the tenant
 *                 default: current
 *               nationalId:
 *                 type: string
 *                 description: |
 *                   National identification number matching /^[A-Za-z0-9\\-/]{5,50}$/ (e.g., Bangladesh NID).
 *                 pattern: '^[A-Za-z0-9\\-/]{5,50}$'
 *                 nullable: true
 *               moveInDate:
 *                 type: string
 *                 format: date
 *                 description: Actual date the tenant moved in
 *                 nullable: true
 *               moveOutDate:
 *                 type: string
 *                 format: date
 *                 description: Actual date the tenant moved out
 *                 nullable: true
 *               notes:
 *                 type: string
 *                 description: Additional notes about the tenant
 *                 nullable: true
 *             example:
 *               firstName: "John"
 *               lastName: "Doe"
 *               email: "john.doe@example.com"
 *               phoneNumber: "+8801712345678"
 *               emergencyContactName: "Jane Doe"
 *               emergencyContactPhone: "+8801912345678"
 *               unitId: "123e4567-e89b-12d3-a456-426614174000"
 *               leaseStartDate: "2025-01-01"
 *               leaseEndDate: "2025-12-31"
 *               depositAmount: 1500.00
 *               status: "current"
 *               nationalId: "19901234567890123"
 *               moveInDate: "2025-01-01"
 *               moveOutDate: null
 *               notes: "Reliable tenant"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tenant'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all tenants
 *     description: |
 *       Only admins can retrieve all tenants.
 *       Last updated: June 11, 2025, 11:11 AM +06.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: firstName
 *         schema:
 *           type: string
 *         description: Tenant's first name
 *       - in: query
 *         name: lastName
 *         schema:
 *           type: string
 *         description: Tenant's last name
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Tenant's email
 *       - in: query
 *         name: phoneNumber
 *         schema:
 *           type: string
 *         description: Tenant's phone number
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unit ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [current, prospective, past, evicted, notice, inactive]
 *         description: Tenant status
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
 *         description: Sort by query in the form of field:desc/asc (ex. firstName:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of tenants
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
 *         description: Comma-separated list of associations and their attributes (ex. unit:id,name|bills:id,amount)
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
 *                     $ref: '#/components/schemas/Tenant'
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
 * /tenants/{id}:
 *   get:
 *     summary: Get a tenant by ID
 *     description: |
 *       Only admins can fetch any tenant. Account owners can fetch tenants for their units.
 *       Last updated: June 11, 2025, 11:11 AM +06.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Tenant ID
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         description: Comma-separated list of associations and their attributes (ex. unit:id,name|bills:id,amount)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tenant'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a tenant by ID
 *     description: |
 *       Only admins can update any tenant. Account owners can update tenants for their units.
 *       Last updated: June 11, 2025, 11:11 AM +06.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Tenant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Tenant's first name
 *               lastName:
 *                 type: string
 *                 description: Tenant's last name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Tenant's primary email address
 *               phoneNumber:
 *                 type: string
 *                 description: Tenant's primary phone number
 *               emergencyContactName:
 *                 type: string
 *                 description: Name of the emergency contact person
 *                 nullable: true
 *               emergencyContactPhone:
 *                 type: string
 *                 description: Phone number for the emergency contact
 *                 nullable: true
 *               unitId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the unit the tenant is assigned to
 *                 nullable: true
 *               leaseStartDate:
 *                 type: string
 *                 format: date
 *                 description: Date the tenant's lease agreement started
 *               leaseEndDate:
 *                 type: string
 *                 format: date
 *                 description: Date the tenant's lease agreement ends
 *                 nullable: true
 *               depositAmount:
 *                 type: number
 *                 description: Security deposit amount paid by the tenant
 *               status:
 *                 type: string
 *                 enum: [current, prospective, past, evicted, notice, inactive]
 *                 description: Current status of the tenant
 *               nationalId:
 *                 type: string
 *                 description: |
 *                   National identification number matching /^[A-Za-z0-9\\-/]{5,50}$/ (e.g., Bangladesh NID).
 *                 pattern: '^[A-Za-z0-9\\-/]{5,50}$'
 *                 nullable: true
 *               moveInDate:
 *                 type: string
 *                 format: date
 *                 description: Actual date the tenant moved in
 *                 nullable: true
 *               moveOutDate:
 *                 type: string
 *                 format: date
 *                 description: Actual date the tenant moved out
 *                 nullable: true
 *               notes:
 *                 type: string
 *                 description: Additional notes about the tenant
 *                 nullable: true
 *             example:
 *               firstName: "John"
 *               lastName: "Smith"
 *               email: "john.smith@example.com"
 *               phoneNumber: "+8801712345678"
 *               emergencyContactName: "Jane Doe"
 *               emergencyContactPhone: "+8801912345678"
 *               unitId: "123e4567-e89b-12d3-a456-426614174000"
 *               leaseStartDate: "2025-01-01"
 *               leaseEndDate: "2025-12-31"
 *               depositAmount: 1500.00
 *               status: "notice"
 *               nationalId: "19901234567890123"
 *               moveInDate: "2025-01-01"
 *               moveOutDate: null
 *               notes: "Updated notes"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tenant'
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
 *     summary: Soft delete a tenant by ID
 *     description: |
 *       Marks the tenant as inactive. Only admins can soft delete any tenant. Account owners can soft delete tenants for their units.
 *       Last updated: June 11, 2025, 11:11 AM +06.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Tenant ID
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
 * /tenants/{id}/hard:
 *   delete:
 *     summary: Hard delete a tenant by ID
 *     description: |
 *       Permanently deletes the tenant. Only admins can perform a hard delete.
 *       Last updated: June 11, 2025, 11:11 AM +06.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Tenant ID
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
 * /tenants/property/{propertyId}/unit/{unitId}:
 *   get:
 *     summary: Get tenants by property and unit
 *     description: |
 *       Retrieves tenants assigned to a specific unit within a property.
 *       Last updated: June 11, 2025, 11:11 AM +06.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Property ID
 *       - in: path
 *         name: unitId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unit ID
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         description: Comma-separated list of associations and their attributes (ex. unit:id,name|bills:id,amount)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tenant'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 * /tenants/unit/{unitId}/history:
 *   get:
 *     summary: Get historical tenants for a unit
 *     description: |
 *       Retrieves historical tenants for a unit within a date range.
 *       Last updated: June 11, 2025, 11:11 AM +06.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unitId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unit ID
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date of the range
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date of the range
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         description: Comma-separated list of associations and their attributes (ex. unit:id,name)
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
 *                     $ref: '#/components/schemas/Tenant'
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

router
  .route('/')
  .post(auth('tenant:tenant_create'), validate(tenantValidation.createTenant), tenantController.createTenant)
  .get(auth('tenant:view_all', 'tenant:view_own'), validate(tenantValidation.getTenants), tenantController.getTenants);

router
  .route('/:id')
  .get(auth('tenant:view_all', 'tenant:view_own'), validate(tenantValidation.getTenant), tenantController.getTenantById)
  .patch(auth('tenant:tenant_update'), validate(tenantValidation.updateTenant), tenantController.updateTenantById)
  .delete(auth('tenant:delete'), validate(tenantValidation.deleteTenant), tenantController.deleteTenantById);

router
  .route('/:id/hard')
  .delete(auth('tenant:hard_delete'), validate(tenantValidation.deleteTenant), tenantController.hardDeleteTenantById);

router
  .route('/property/:propertyId/unit/:unitId')
  .get(auth(), validate(tenantValidation.getTenantsByUnitAndProperty), tenantController.getTenantsByUnitAndProperty);

router
  .route('/unit/:unitId/history')
  .get(auth(), validate(tenantValidation.getHistoricalTenantsByUnit), tenantController.getHistoricalTenantsByUnit);

module.exports = router;
