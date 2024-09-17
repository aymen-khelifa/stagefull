"use strict";

var express = require("express");

var cors = require("cors");

var jwt = require("jsonwebtoken");

var bcrypt = require("bcrypt"); //const EmailSender =require ('../nodemailer');


var nodemailer = require("nodemailer");

var Yacht = require("../models/yachts");

var multer = require("multer");

var upload = multer({
  dest: "uploads/"
});

var path = require("path");

var fs = require("fs");

var yachtController = {
  getyachts :async (req, res) =>{
    try {
      let response;
      
          response = await Yacht.findAll({
              attributes:['uuid','name','description','technicalDetails','price','imageUrl','country','productUrl'],
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
};
module.exports = yachtController;