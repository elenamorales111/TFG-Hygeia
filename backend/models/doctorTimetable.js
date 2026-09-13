const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {

  const DoctorTimetable = sequelize.define("DoctorTimetable", {

    doctorSchedule_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },

    dayOfWeek: {
      type: DataTypes.STRING,
      allowNull: false
    },

    startTime: {
      type: DataTypes.TIME,
      allowNull: false
    },

    endTime: {
      type: DataTypes.TIME,
      allowNull: false
    },

    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }

  });

  return DoctorTimetable;

};