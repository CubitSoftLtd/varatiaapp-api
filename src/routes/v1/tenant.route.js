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
 *               - name
 *               - contactInfo
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the tenant
 *               contactInfo:
 *                 type: string
 *                 description: Contact information of the tenant (e.g., email or phone)
 *               unitId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the unit the tenant is assigned to
 *             example:
 *               name: John Doe
 *               contactInfo: john.doe@example.com
 *               unitId: 987fcdeb-1234-5678-9abc-def123456789
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
 *         name: filter
 *         schema:
 *           type: string
 *         description: JSON string of filter conditions (e.g., {"name":"John"})
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
 *               name:
 *                 type: string
 *                 description: Name of the tenant
 *               contactInfo:
 *                 type: string
 *                 description: Contact information of the tenant (e.g., email or phone)
 *               unitId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the unit the tenant is assigned to
 *             example:
 *               name: John Doe Updated
 *               contactInfo: john.doe.updated@example.com
 *               unitId: 987fcdeb-1234-5678-9abc-def123456789
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
  .patch(validate(tenantValidation.updateTenant), tenantController.updateTenant)
  .delete(validate(tenantValidation.deleteTenant), tenantController.deleteTenant);

router
  .route('/property/:propertyId/unit/:unitId')
  .get(validate(tenantValidation.getTenantsByUnitAndProperty), tenantController.getTenantsByUnitAndProperty);

router
  .route('/history/unit/:unitId')
  .get(validate(tenantValidation.getHistoricalTenantsByUnit), tenantController.getHistoricalTenantsByUnit);

module.exports = router;
