const express = require("express");
const { findAll, save, findById, deleteById, update } = require("../controller/user_controller");
const UserValidation = require("../validation/user_validation");

const router = express.Router();


router.get("/", findAll)
router.post("/", UserValidation, save)
router.get("/:id", findById)
router.delete("/:id", deleteById)
router.put("/:id", update)


module.exports = router;