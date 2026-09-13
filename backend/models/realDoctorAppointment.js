const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {

  const RealDoctorAppointment = sequelize.define("realDoctorAppointment", {

    realDoctorAppointment_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },

    time: {
      type: DataTypes.TIME,
      allowNull: false
    },

    reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "CONFIRMADA"
    },
	
	videocall: {
	  type: DataTypes.STRING,
	  allowNull: true
	},

    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }

  });

  return RealDoctorAppointment;

};