const express = require('express');
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
 * components:
 *   schemas:
 *     Tenant:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the tenant
 *         firstName:
 *           type: string
 *           description: First name of the tenant
 *         lastName:
 *           type: string
 *           description: Last name of the tenant
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the tenant
 *         phoneNumber:
 *           type: string
 *           description: Phone number of the tenant
 *         emergencyContact:
 *           type: string
 *           nullable: true
 *           description: Emergency contact phone number
 *         unitId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID of the unit the tenant is assigned to
 *         leaseStartDate:
 *           type: string
 *           format: date-time
 *           description: Start date of the lease
 *         leaseEndDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: End date of the lease
 *         depositAmount:
 *           type: number
 *           format: float
 *           description: Deposit amount paid by the tenant
 *         status:
 *           type: string
 *           enum: [active, inactive, evicted]
 *           description: Status of the tenant
 *         nationalId:
 *           type: string
 *           description: National ID of the tenant
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     TenancyHistory:
 *       type: object
 *       properties:
 *         tenantId:
 *           type: string
 *           format: uuid
 *           description: ID of the tenant
 *         firstName:
 *           type: string
 *           description: First name of the tenant
 *         lastName:
 *           type: string
 *           description: Last name of the tenant
 *         unitId:
 *           type: string
 *           format: uuid
 *           description: ID of the unit
 *         leaseStartDate:
 *           type: string
 *           format: date-time
 *           description: Start date of the lease
 *         leaseEndDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: End Astrophel’s Atreides
 *         status:
 *           type: string
 *           description: Status of the tenant during tenancy
 */

/**
 * @swagger
 * /tenants:
 *   post:
 *     summary: Create a new tenant
 *     description: Only admins and owners can create tenants.
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
 *               - nationalId
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: First name of the tenant
 *               lastName:
 *                 type: string
 *                 description: Last name of the tenant
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the tenant
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number of the tenant
 *               emergencyContact:
 *                 type: string
 *                 nullable: true
 *                 description: Emergency contact phone number
 *               unitId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: ID of the unit the tenant is assigned to
 *               leaseStartDate:
 *                 type: string
 *                 format: date-time
 *                 description: Start date of the lease
 *               leaseEndDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: End date of the lease
 *               depositAmount:
 *                 type: number
 *                 format: float
 *                 description: Deposit amount paid by the tenant
 *               status:
 *                 type: string
 *                 enum: [active, inactive, evicted]
 *                 description: Status of the tenant
 *               nationalId:
 *                 type: string
 *                 description: National ID of the tenant
 *             example:
 *               firstName: "John"
 *               lastName: "Doe"
 *               email: "john.doe@example.com"
 *               phoneNumber: "+1234567890"
 *               emergencyContact: "+0987654321"
 *               unitId: "987fcdeb-1234-5678-9abc-def123456789"
 *               leaseStartDate: "2025-06-01T00:00:00Z"
 *               leaseEndDate: "2026-05-31T00:00:00Z"
 *               depositAmount: 1000.00
 *               status: "active"
 *               nationalId: "ABC123-456"
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
 *     description: Admins and owners can retrieve all tenants. Tenants can retrieve their own details.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: firstName
 *         schema:
 *           type: string
 *         description: Filter by first name
 *       - in: query
 *         name: lastName
 *         schema:
 *           type: string
 *         description: Filter by last name
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         description: Filter by email
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
 *           default: 10
 *         description: Maximum number of tenants
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
 *     summary: Get a tenant
 *     description: Admins and owners can fetch any tenant. Tenants can fetch their own details.
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
 *     summary: Update a tenant
 *     description: Only admins and owners can update tenant details.
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
 *                 description: First name of the tenant
 *               lastName:
 *                 type: string
 *                 description: Last name of the tenant
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the tenant
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number of the tenant
 *               emergencyContact:
 *                 type: string
 *                 nullable: true
 *                 description: Emergency contact phone number
 *               unitId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: ID of the unit the tenant is assigned to
 *               leaseStartDate:
 *                 type: string
 *                 format: date-time
 *                 description: Start date of the lease
 *               leaseEndDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: End date of the lease
 *               depositAmount:
 *                 type: number
 *                 format: float
 *                 description: Deposit amount paid by the tenant
 *               status:
 *                 type: string
 *                 enum: [active, inactive, evicted]
 *                 description: Status of the tenant
 *               nationalId:
 *                 type: string
 *                 description: National ID of the tenant
 *             example:
 *               firstName: "John"
 *               lastName: "Doe Updated"
 *               email: "john.doe.updated@example.com"
 *               phoneNumber: "+1234567890"
 *               emergencyContact: "+0987654321"
 *               unitId: "987fcdeb-1234-5678-9abc-def123456789"
 *               leaseStartDate: "2025-06-01T00:00:00Z"
 *               leaseEndDate: "2026-05-31T00:00:00Z"
 *               depositAmount: 1200.00
 *               status: "active"
 *               nationalId: "XYZ789-012"
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
 *     summary: Delete a tenant
 *     description: Only admins and owners can delete tenants.
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
 */

/**
 * @swagger
 * /tenants/property/{propertyId}/unit/{unitId}:
 *   get:
 *     summary: Get tenants by unit and property
 *     description: Admins and owners can fetch tenants assigned to a specific unit in a property.
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
 */

/**
 * @swagger
 * /tenants/history/unit/{unitId}:
 *   get:
 *     summary: Get historical tenants for a unit
 *     description: Admins and owners can fetch historical tenants for a unit within a date range.
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
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the tenancy history (e.g., 2024-01-01)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the tenancy history (e.g., 2025-12-31)
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
 *                     $ref: '#/components/schemas/TenancyHistory'
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
  .post(validate(tenantValidation.createTenant), tenantController.createTenant)
  .get(validate(tenantValidation.getTenants), tenantController.getAllTenants);

router
  .route('/:id')
  .get(validate(tenantValidation.getTenant), tenantController.getTenantById)
  .patch(validate(tenantValidation.updateTenant), tenantController.updateTenantById)
  .delete(validate(tenantValidation.deleteTenant), tenantController.deleteTenantById);

router
  .route('/property/:propertyId/unit/:unitId')
  .get(validate(tenantValidation.getTenantsByUnitAndProperty), tenantController.getTenantsByUnitAndProperty);

router
  .route('/history/unit/:unitId')
  .get(validate(tenantValidation.getHistoricalTenantsByUnit), tenantController.getHistoricalTenantsByUnit);

module.exports = router;
