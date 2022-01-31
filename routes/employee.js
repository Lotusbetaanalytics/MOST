const express = require("express");
const {
  createEmployee,
  login,
  getMe,
  getEmployees,
  forgotPassword,
  resetPassword,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employee");
const Employee = require("../models/Employee");
const { protects, protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router
  .route("/")
  .post(createEmployee)
  .get(advancedResults(Employee), getEmployees);
router.route("/login").post(login);
router.route("/me").get(protects, getMe);
router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword").post(resetPassword);
router
  .route("/:id")
  .put(protect, authorize("SuperAdmin"), updateEmployee)
  .delete(protect, authorize("SuperAdmin"), deleteEmployee);

module.exports = router;
