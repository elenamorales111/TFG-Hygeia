const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {

  const AIDoctor = sequelize.define("aiDoctor", {

    aiDoctor_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },

    url: {
      type: DataTypes.STRING,
      allowNull: false
    },

    version: {
      type: DataTypes.STRING,
      allowNull: false
    },

    token: {
      type: DataTypes.STRING,
      allowNull: false
    },

    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }

  });

  return AIDoctor;

};