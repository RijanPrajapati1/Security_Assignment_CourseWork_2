const express = require("express");
const { save, findAll, findById, update, deleteById } = require("../controller/car_controller");
const { authenticateToken, authorizeRole } = require("../security/auth");

const router = express.Router();
const multer = require("multer");
const path = require("path");

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../car_images"));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });

// Routes
router.get("/findAll", findAll);
router.get("/:id", findById);


router.post("/", authenticateToken, authorizeRole("admin"), upload.single("image"), save);
router.put("/:id", authenticateToken, authorizeRole("admin"), upload.single("image"), update);
router.delete("/:id", authenticateToken, authorizeRole("admin"), deleteById);

module.exports = router;
