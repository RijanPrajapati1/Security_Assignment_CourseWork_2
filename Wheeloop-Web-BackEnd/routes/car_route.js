const express = require("express");
const { save, findAll, findById, update, deleteById } = require("../controller/car_controller");
const { authenticateToken, authorizeRole } = require("../security/auth");

const router = express.Router();
const multer = require("multer");
const path = require("path");

// ✅ Configure Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../car_images")); // Store in "car_images" folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); // Unique filename
    }
});
const upload = multer({ storage });

// ✅ Routes
router.get("/findAll", findAll);
router.get("/:id", findById);
router.post("/", upload.single("image"), save);
router.put("/:id", upload.single("image"), update);
router.delete("/:id", deleteById);

module.exports = router;
