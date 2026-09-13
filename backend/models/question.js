const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const question = sequelize.define('question', {
    question_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
	answer: {
	  type: DataTypes.TEXT,
	  allowNull: true
	},
    dateTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    humanDoctor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    aiDoctor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  });

  return question;
};