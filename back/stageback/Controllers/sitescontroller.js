"use strict";

var express = require("express");

var cors = require("cors");

var jwt = require("jsonwebtoken");
//L
var bcrypt = require("bcrypt"); //const EmailSender =require ('../nodemailer');


var nodemailer = require("nodemailer");
//Ll

var Site = require("../models/sites");

var multer = require("multer");

var upload = multer({
  dest: "uploads/"
});

var path = require("path");

var fs = require("fs");

var SitesController = {
  getallsites :async (req, res) =>{
    try {
      let response;
      
          response = await Site.findAll({
              attributes:['uuid','productUrl','name','restricted','scrape'],
             /* include:[{
                model: User,
                attributes:['name','email','url1','image','status']
            }],
            where: {
              status :"publié",accept:"accepté",'$User.status$':"activé"
          }*/
              
          });
      
      res.json(response);
  } catch (error) {
      res.json({msg: error.message});
  }
},
updatesite: async (req, res) => {
  const { uuid } = req.params;console.log("aa");console.log(uuid)
  const user = await Site.findOne({
    where: {
      uuid: uuid,
    },
  });
  if (!user) return res.json({ msg: "utilisateur non trouvé" });
 
  const { titre, description,technicalDetails,price,userReviews,imageUrl,productUrl,country,bloc } = req.body;
  try {const jsonData = JSON.stringify({  titre, description,technicalDetails,price,userReviews,imageUrl,productUrl,country,bloc });

  
  // Mettre à jour l'attribut JSON dans la base de données
  await Site.update(
    { scrape: jsonData },
    { where: { uuid: uuid } }
  );

    res.json({ msg: "profile modifié" });
  } catch (error) {
    res.json({ msg: error.message });
  }
},
getjsonallsites :async (req, res) =>{
  try {
    let response;
    
        response = await Site.findAll({
            attributes:['uuid','scrape'],
           
            
        });
    
    res.json(response);
} catch (error) {
    res.json({msg: error.message});
}
}
,
updatestatussite: async (req, res) => {
  const { uuid } = req.params;console.log("aa");console.log(uuid)
  const user = await Site.findOne({
    where: {
      uuid: uuid,
    },
  });
  if (!user) return res.json({ msg: "utilisateur non trouvé" });
  
 
  try {

  
  // Mettre à jour l'attribut JSON dans la base de données
  await Site.update(
    { restricted: true },
    { where: { uuid: uuid } }
  );

    res.json({ msg: "status modifié" });
  } catch (error) {
    res.json({ msg: error.message });
  }
},
};
module.exports = SitesController;