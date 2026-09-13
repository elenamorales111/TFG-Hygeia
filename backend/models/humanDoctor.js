const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {

  const HumanDoctor = sequelize.define("humanDoctor", {

    humanDoctor_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
	
	role: {
	  type: DataTypes.STRING,
	  allowNull: false,
	  defaultValue: "DOCTOR"
	},


    surnames: {
      type: DataTypes.STRING,
      allowNull: false
    },

	password: {
	  type: DataTypes.STRING,
	  allowNull: false
	},

    speciality: {
      type: DataTypes.STRING,
      allowNull: false
    },

    medicalCenter: {
      type: DataTypes.STRING,
      allowNull: false
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false
    },

    dni: {
      type: DataTypes.STRING,
      allowNull: false
    },

    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }

  });

  return HumanDoctor;

};