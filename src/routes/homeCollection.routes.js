const express = require("express");
const { createHomeCollections, getHomeCollections ,updateStatus, deleteRequest} = require("../controllers/homeCollection.controller");
const router = express.Router();

router.post("/", createHomeCollections);
router.get("/", getHomeCollections);
router.patch("/:id", updateStatus);
router.delete("/:id", deleteRequest);

module.exports = router;