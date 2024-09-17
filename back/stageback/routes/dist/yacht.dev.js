"use strict";

var express = require("express");

var YachtController = require("../Controllers/yachtscontroller");

var router = express.Router();
router.get('/getallyachts', YachtController.getyachts);
module.exports = router;