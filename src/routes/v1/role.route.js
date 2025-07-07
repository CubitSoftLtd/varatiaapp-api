const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const roleValidation = require('../../validations/role.validation');
const roleController = require('../../controllers/role.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role and permission management
 */

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get all roles and their permissions
 *     description: |
 *       Only super_admin with role:management permission can retrieve roles and permissions.
 *       Last updated: June 11, 2025, 03:41 PM +06.
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Role name
 *                       permissions:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: List of permissions for the role
 *                     example:
 *                       name: super_admin
 *                       permissions: ['bill:bill_create', 'bill:view_all', 'role:management']
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

router.route('/').get(auth('role:management'), validate(roleValidation.getRoles), roleController.getRoles);

/**
 * @swagger
 * /roles/me/permissions:
 *   get:
 *     summary: Get permissions for the logged-in user
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

router.route('/me/permissions').get(auth('role:permission'), roleController.getMyPermissions);

module.exports = router;
