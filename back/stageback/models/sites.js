const {Sequelize, DataTypes} = require('sequelize')
const db = require('../config/db.js')
const sequelize = new Sequelize('stage', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});
module.exports = db.sequelize.define('yachtsales', {
  UUid: {
    type: Sequelize.UUID,auto_increment:[1,1000],
    primaryKey: true,unique:true,
    defaultValue:DataTypes.UUIDV4,
    allowNull:false,
    validate:{
      notEmpty:true
    }
  },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    technicalDetails: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    price: {
        type: Sequelize.STRING,
        allowNull: true
    },
    userReviews: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    imageUrl: {
        type: Sequelize.STRING,
        allowNull: true
    },
    productUrl: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    country: {
        type: Sequelize.STRING,
        allowNull: true
    },
    restricted: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: 0
    },
     scrape: {
        type: Sequelize.JSON,
        allowNull: true,
       
    },
}, {
    timestamps: true
});

// Synchronisation du modèle avec la base de données
sequelize.sync().then(() => {
    console.log('Tables synchronisées');
}).catch(err => {
    console.error('Erreur de synchronisation:', err);
});