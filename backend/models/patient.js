const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const patient = sequelize.define('patient', {
    patient_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
	
	role: {
	  type: DataTypes.STRING,
	  allowNull: false,
	  defaultValue: "PATIENT"
	},
	
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    surnames: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    dni: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
	password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
	  /*Campo no obligatorio*/
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING,
	  /*Campo no obligatorio*/
      allowNull: true,
    },
    province: {
      type: DataTypes.STRING,
      allowNull: false,
    },
	//null: Aparece el banner ya que el paciente todavía no ha decidido
	//true: Acepta banner
	//false: Rechaza banner
	aiMedicalConsent: {
	  type: DataTypes.BOOLEAN,
	  allowNull: true
	},
  });

  return patient;
};