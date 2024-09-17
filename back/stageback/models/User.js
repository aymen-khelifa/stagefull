const {Sequelize, DataTypes} = require('sequelize')
const db = require('../config/db.js')

module.exports = db.sequelize.define(
  'users',
  {
    UUid: {
     type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull:false,
      validate:{ 
        notEmpty:true ,
        len:[3,50]
      }  
    },
   
    email: {
      type: Sequelize.STRING,
      allowNull:false,
      isEmail:true,validate:{
        notEmpty:true,
        isEmail:true
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull:false,
      
      validate:{
        notEmpty:true
      }

    },
   
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    isVerified: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0
      

    },
   
  activationCode: {
    type: Sequelize.STRING,
    allowNull:true
  },
 
  
  
    
  image: {
    type: Sequelize.STRING,
  },
  url1: {
    type: Sequelize.STRING,
  },
 
  genre: {
    type: Sequelize.STRING,
    
  },
  tel: {
    type: Sequelize.INTEGER,
    

  }, 
  


    
  },
  {
    timestamps: false
  }
)
