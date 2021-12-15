const express = require("express");
const { getEmployee, createEmployee,staffLogin,getLogs,getStaffProfile} = require("../controllers/employee");
const Employee = require("../models/Employee");
const advancedResults = require("../middleware/advancedResults");
const { protects } = require("../middleware/auth");
const router = express.Router();

router
  .route("/")
  .post(createEmployee)
  .get(advancedResults(Employee), getEmployee);

  router
  .route("/login")
  .post(staffLogin)
    router
  .route("/logs")
  .post(protects, getLogs)
      router
  .route("/me")
  .get(protects, getStaffProfile)

module.exports = router;
