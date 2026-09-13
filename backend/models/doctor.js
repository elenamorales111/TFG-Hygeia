const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {

  const Doctor = sequelize.define("doctor", {

    doctor_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false
    },

  });

  return Doctor;

};