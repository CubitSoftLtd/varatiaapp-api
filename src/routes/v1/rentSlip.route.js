const express = require('express');
const validate = require('../../middlewares/validate');
const rentSlipValidation = require('../../validations/rentSlip.validation');
const rentSlipController = require('../../controllers/rentSlip.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: RentSlips
 *   description: Rent slip management and retrieval
 */

/**
 * @swagger
 * /rent-slips:
 *   post:
 *     summary: Create a new rent slip
 *     tags: [RentSlips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rentId
 *               - tenantId
 *               - amountPaid
 *               - paymentDate
 *             properties:
 *               rentId:
 *                 type: string
 *                 description: ID of the rent
 *               tenantId:
 *                 type: string
 *                 description: ID of the tenant
 *               amountPaid:
 *                 type: number
 *               paymentDate:
 *                 type: string
 *                 format: date
 *             example:
 *               rentId: "663e8a81b1d3cd001ee4fb90"
 *               tenantId: "663e8a96b1d3cd001ee4fb91"
 *               amountPaid: 1000
 *               paymentDate: "2025-05-31"
 *     responses:
 *       "201":
 *         description: Created
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /rent-slips:
 *   get:
 *     summary: Get all rent slips
 *     tags: [RentSlips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *       - in: query
 *         name: rentId
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         default: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         default: 1
 *     responses:
 *       "200":
 *         description: OK
 */

/**
 * @swagger
 * /rent-slips/{id}:
 *   get:
 *     summary: Get a rent slip by ID
 *     tags: [RentSlips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /rent-slips/{id}:
 *   patch:
 *     summary: Update a rent slip
 *     tags: [RentSlips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amountPaid:
 *                 type: number
 *               paymentDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       "200":
 *         description: OK
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 */

/**
 * @swagger
 * /rent-slips/{id}:
 *   delete:
 *     summary: Delete a rent slip
 *     tags: [RentSlips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "204":
 *         description: No Content
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

router
  .route('/')
  .post(validate(rentSlipValidation.createRentSlip), rentSlipController.createRentSlip)
  .get(validate(rentSlipValidation.getAllRentSlips), rentSlipController.getAllRentSlips);

router
  .route('/:id')
  .get(validate(rentSlipValidation.getRentSlipById), rentSlipController.getRentSlipById)
  .patch(validate(rentSlipValidation.updateRentSlip), rentSlipController.updateRentSlip)
  .delete(validate(rentSlipValidation.deleteRentSlip), rentSlipController.deleteRentSlip);

module.exports = router;
