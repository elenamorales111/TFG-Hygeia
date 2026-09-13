const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const medication = sequelize.define('medication', {
    medication_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    medicine: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dailyDose: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
	
	/*Frecuencia con código de colores: Medicina que el paciente toma mucho,
	Medicina que el paciente toma menos o Medicina que el paciente no toma casi*/
	frequency: {
      type: DataTypes.STRING,
      allowNull: false
    },
	
	weekDays: {
	  type: DataTypes.STRING,
      allowNull: true
	},

	specificDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
	},
	
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  return medication;
};