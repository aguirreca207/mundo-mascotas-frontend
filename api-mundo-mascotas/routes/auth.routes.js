const express = require("express");
const router = express.Router();

const {
  getAuthStatus,
  login,
  updatePassword,
  logout
} = require("../controllers/auth.controller");

router.get("/status", getAuthStatus);
router.post("/login", login);
router.put("/password/:id", updatePassword);
router.delete("/logout", logout);

module.exports = router;