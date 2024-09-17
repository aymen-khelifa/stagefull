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
  getyachts: function getyachts(req, res) {
    var response;
    return regeneratorRuntime.async(function getyachts$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return regeneratorRuntime.awrap(Yacht.findAll({
              attributes: ['uuid', 'name', 'description', 'technicalDetails', 'price', 'imageUrl', 'country', 'productUrl']
              /* include:[{
                 model: User,
                 attributes:['name','email','url1','image','status']
              }],
              where: {
               status :"publié",accept:"accepté",'$User.status$':"activé"
              }*/

            }));

          case 3:
            response = _context.sent;
            res.json(response);
            _context.next = 10;
            break;

          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](0);
            res.json({
              msg: _context.t0.message
            });

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, null, null, [[0, 7]]);
  }
};
module.exports = yachtController;