const { Sequelize } = require("sequelize");
const path = require("path");

const dbPath = path.join(__dirname, "hygeia.db");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: false,
});

//Importar modelos de las tablas de la base de datos
const Patient = require("./models/patient")(sequelize);
const MedicalRecord = require("./models/medicalRecord")(sequelize);
const MedicalAppointment = require("./models/medicalAppointment")(sequelize);
const Medication = require("./models/medication")(sequelize);
const Doctor = require("./models/doctor")(sequelize);
const HumanDoctor = require("./models/humanDoctor")(sequelize);
const AIDoctor = require("./models/aiDoctor")(sequelize);
const Question = require("./models/question")(sequelize);
const RealDoctorAppointment = require("./models/realDoctorAppointment")(sequelize);
const DoctorTimetable = require("./models/DoctorTimetable")(sequelize);


//Cardinalidades

//Patient 1–1 MedicalRecord
Patient.hasOne(MedicalRecord, { foreignKey: "patient_id" });
MedicalRecord.belongsTo(Patient, { foreignKey: "patient_id" });

//Patient 1–n MedicalAppointment
Patient.hasMany(MedicalAppointment, { foreignKey: "patient_id" });
MedicalAppointment.belongsTo(Patient, { foreignKey: "patient_id" });

//Patient 1–n Medication
Patient.hasMany(Medication, { foreignKey: "patient_id" });
Medication.belongsTo(Patient, { foreignKey: "patient_id" });

//Doctor 1-n MedicalRecord
MedicalRecord.belongsTo(Doctor, { foreignKey: "familyDoctor_id"});
Doctor.hasMany(MedicalRecord, {foreignKey: "familyDoctor_id"});

//Doctor 1–1 HumanDoctor
Doctor.hasOne(HumanDoctor, { foreignKey: "doctor_id" });
HumanDoctor.belongsTo(Doctor, { foreignKey: "doctor_id" });

//Doctor 1–1 AIDoctor
Doctor.hasOne(AIDoctor, { foreignKey: "doctor_id" });
AIDoctor.belongsTo(Doctor, { foreignKey: "doctor_id" });

//Patient 1–n Question
Patient.hasMany(Question, { foreignKey: "patient_id" });
Question.belongsTo(Patient, { foreignKey: "patient_id" });

//HumanDoctor 1–n Question
HumanDoctor.hasMany(Question, { foreignKey: "humanDoctor_id" });
Question.belongsTo(HumanDoctor, { foreignKey: "humanDoctor_id" });

//Patient 1–n RealDoctorAppointments
Patient.hasMany(RealDoctorAppointment, {foreignKey: "patient_id"});
RealDoctorAppointment.belongsTo(Patient, {foreignKey: "patient_id"});

//Doctor 1–n RealDoctorAppointments
Doctor.hasMany(RealDoctorAppointment, {foreignKey: "doctor_id"});
RealDoctorAppointment.belongsTo(Doctor, {foreignKey: "doctor_id"});

//Doctor 1–n Timetables
Doctor.hasMany(DoctorTimetable, {foreignKey: "doctor_id"});
DoctorTimetable.belongsTo(Doctor, {foreignKey: "doctor_id"});

//AIDoctor 1–n Question
AIDoctor.hasMany(Question, { foreignKey: "aiDoctor_id" });
Question.belongsTo(AIDoctor, { foreignKey: "aiDoctor_id" });


module.exports = {
	
  sequelize,
  Patient,
  MedicalRecord,
  MedicalAppointment,
  Medication,
  Doctor,
  HumanDoctor,
  AIDoctor,
  Question,
  RealDoctorAppointment,
  DoctorTimetable,
  
};