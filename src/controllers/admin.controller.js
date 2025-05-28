const httpStatus = require('http-status');
const { adminService } = require('../services');
const ApiError = require('../utils/ApiError');

const createAdmin = async (req, res) => {
  const adminData = req.body;
  const admin = await adminService.createAdmin(adminData);
  res.status(httpStatus.CREATED).send(admin);
};

const getAdmins = async (req, res) => {
  const filter = { role: req.query.role };
  const options = {
    sortBy: req.query.sortBy,
    limit: req.query.limit,
    page: req.query.page,
  };
  const result = await adminService.getAdmins(filter, options);
  res.status(httpStatus.OK).send(result);
};

const getAdminById = async (req, res) => {
  const admin = await adminService.getAdminById(req.params.id);
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }
  res.status(httpStatus.OK).send(admin);
};

const updateAdminById = async (req, res) => {
  const admin = await adminService.updateAdminById(req.params.id, req.body);
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }
  res.status(httpStatus.OK).send(admin);
};

const deleteAdminById = async (req, res) => {
  await adminService.deleteAdminById(req.params.id);
  res.status(httpStatus.OK).send();
};

module.exs = {
  createAdmin,
  getAdmins,
  getAdminById,
  updateAdminById,
  deleteAdminById,
};
