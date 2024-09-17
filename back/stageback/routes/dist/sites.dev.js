"use strict";

var express = require("express");

var SitesController = require("../Controllers/sitescontroller");

var router = express.Router();
router.get('/getallsites', SitesController.getallsites);
router.patch('/update/:uuid', SitesController.updatesite);
router.patch('/updatestatus/:uuid', SitesController.updatestatussite);
module.exports = router;