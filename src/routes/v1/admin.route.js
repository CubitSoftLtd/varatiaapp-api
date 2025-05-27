const express = require('express');
const catchAsync = require('../../utils/catchAsync');
const { adminService } = require('../../services');
const auth = require('../../middlewares/auth');
const restrictTo = require('../../middlewares/restrictTo');

const router = express.Router();

/**
 * @swagger
 * /v1/admin/users:
 *   get:
 *     summary: Get all users (admin view)
 *     tags: [Admin]
 *     description: Retrieves a detailed list of all users for administrative purposes.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by user role (e.g., "tenant")
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/users', auth(), restrictTo('admin'), catchAsync(async (req, res) => {
  const { role } = req.query;
  const users = await adminService.getAllUsers({ role });
  res.send(users);
}));

/**
 * @swagger
 * /v1/admin/settings:
 *   patch:
 *     summary: Update system settings
 *     tags: [Admin]
 *     description: Updates global system settings (e.g., payment thresholds).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentDueDays:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paymentDueDays:
 *                   type: integer
 *       400:
 *         description: Invalid settings data
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.patch('/settings', auth(), restrictTo('admin'), catchAsync(async (req, res) => {
  const settings = await adminService.updateSettings(req.body);
  res.send(settings);
}));

module.exports = router;
