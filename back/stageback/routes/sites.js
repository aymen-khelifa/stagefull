const express = require("express");
const SitesController=require("../Controllers/sitescontroller");


const router = express.Router(); 


router.get('/getallsites',SitesController.getallsites);
router.patch('/update/:uuid',SitesController.updatesite);
router.patch('/updatestatus/:uuid',SitesController.updatestatussite);


module.exports=router