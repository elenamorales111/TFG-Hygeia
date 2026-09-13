const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const medicalRecord = sequelize.define('medicalRecord', {
    medicalRecord_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    illness: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    medicalHistory: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    allergies: {
      type: DataTypes.STRING,
      allowNull: true,
    },
	bloodType: {
	  type: DataTypes.STRING,
	  allowNull: true,
	},
    medication: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    healthInsurance: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    familyDoctor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
	familyDoctor_id: {
	  type: DataTypes.INTEGER,
	  allowNull: true
	},
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  return medicalRecord;
};