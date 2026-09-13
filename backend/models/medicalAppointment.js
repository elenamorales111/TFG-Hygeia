const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const medicalAppointment = sequelize.define('medicalAppointment', {
    medicalAppointment_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    medicalCenter: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    doctor: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reasonForAppointment: {
      type: DataTypes.STRING,
	  /*Campo no obligatorio*/
      allowNull: true,
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
	doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  return medicalAppointment;
};