const {
  sequelize,
  Patient,
  MedicalRecord,
  Medication,
  Doctor,
  HumanDoctor,
  AIDoctor,
  Question,
  DoctorTimetable,
  MedicalAppointment,
  RealDoctorAppointment,
} = require("./sequelize");

const bcrypt = require("bcrypt");

//Limpiar base de datos
async function clearDatabase() {
  try {
    await Question.destroy({ where: {} });
    await Medication.destroy({ where: {} });
    await MedicalRecord.destroy({ where: {} });
	await DoctorTimetable.destroy({ where: {} });
	await RealDoctorAppointment.destroy({ where: {} });
    await MedicalAppointment.destroy({ where: {} });
    await HumanDoctor.destroy({ where: {} });
    await AIDoctor.destroy({ where: {} });
    await Doctor.destroy({ where: {} });
    await Patient.destroy({ where: {} });

    await sequelize.query("DELETE FROM sqlite_sequence");

    console.log("Base de datos limpiada correctamente");
  } catch (error) {
    console.error("Error limpiando la base de datos:", error);
  }
}

//Crear pacientes de prueba
async function seedPatients() {
  const encryptedPassword1 = await bcrypt.hash("1111", 10);
  const encryptedPassword2 = await bcrypt.hash("1111", 10);
  const encryptedPassword3 = await bcrypt.hash("1111", 10);

  const patient1 = await Patient.create({
    name: "Avelina",
    surnames: "Lucas Velasco",
    dateOfBirth: "1945-04-26",
    dni: "7777777A",
    email: "avelina@gmail.com",
    password: encryptedPassword1,
    phoneNumber: "666666667",
    address: "Plaza Mayor",
    postalCode: "28770",
    province: "Madrid",
	aiMedicalConsent: null,
  });

  const patient2 = await Patient.create({
    name: "Pilar",
    surnames: "Velasco Lucas",
    dateOfBirth: "1972-11-02",
    dni: "7777778B",
    email: "pilar@gmail.com",
    password: encryptedPassword2,
    phoneNumber: "666666668",
    address: "Plaza Menor",
    postalCode: "28770",
    province: "Madrid",
	aiMedicalConsent: null,
  });
  
  const patient3 = await Patient.create({
	  name: "María",
	  surnames: "Casar Aguayo",
	  dateOfBirth: "2003-02-17",
	  dni: "7777779C",
	  email: "maria@gmail.com",
	  password: encryptedPassword3,
	  phoneNumber: "666666669",
	  address: "Calle de las Rosas",
	  postalCode: "28770",
	  province: "Madrid",
	  aiMedicalConsent: null,
	});

  console.log(
    "Pacientes de prueba creados con ids:",
    patient1.patient_id,
    patient2.patient_id,
	patient3.patient_id
  );

	return {
	  patient1Id: patient1.patient_id,
	  patient2Id: patient2.patient_id,
	  patient3Id: patient3.patient_id,
	};
}

//Crear ficha médica
async function seedMedicalRecord(patientId, familyDoctorName, familyDoctorId) {

  const medicalRecord = await MedicalRecord.create({
    illness: "Diabetes",
    status: "Controlada",
    medicalHistory: "",
    allergies: "",
    bloodtype: "B-",
    medication: "Insulina",
    healthInsurance: "Mapfre",
    familyDoctor: familyDoctorName,
    familyDoctor_id: familyDoctorId,
    patient_id: patientId,
  });

  console.log("Ficha médica creada con id:", medicalRecord.medicalRecord_id);
}


//Crear medicación
async function seedMedications(patientId) {
  const medication1 = await Medication.create({
    medicine: "Humalog",
    dailyDose: "10 UI",
    time: "12:30",
    frequency: "FRECUENCIA_DIARIA",
    weekDays: null,
    specificDate: null,
    patient_id: patientId,
  });

  const medication2 = await Medication.create({
    medicine: "NovoRapid",
    dailyDose: "5 UI",
    time: "21:00",
    frequency: "FRECUENCIA_MEDIA",
    weekDays: "L,M,V",
    specificDate: null,
    patient_id: patientId,
  });

  const medication3 = await Medication.create({
    medicine: "Vacuna del COVID",
    dailyDose: "1",
    time: "17:00",
    frequency: "FRECUENCIA_BAJA",
    weekDays: null,
    specificDate: "2026-09-28",
    patient_id: patientId,
  });

  console.log(
    "Medicación creada con ids:",
    medication1.medication_id,
    medication2.medication_id,
    medication3.medication_id
  );
}

//Crear doctores
async function seedDoctors() {
	
  const encryptedPassword1 = await bcrypt.hash("1111", 10);
  const encryptedPassword2 = await bcrypt.hash("1111", 10);
  
  const doctor1 = await Doctor.create({
    name: "Pablo",
    doctorType: "HUMAN",
  });

  const humanDoctor1 = await HumanDoctor.create({
    surnames: "Hierro",
	password: encryptedPassword1,
    speciality: "Médico de cabecera",
    medicalCenter: "Hospital Universitario La Paz",
    email: "hierro@gmail.com",
    dni: "12345678A",
    doctor_id: doctor1.doctor_id,
  });
  
  await DoctorTimetable.bulkCreate([
  {
    doctor_id: doctor1.doctor_id,
    dayOfWeek: "L",
    startTime: "10:00",
    endTime: "14:00"
  },
  {
    doctor_id: doctor1.doctor_id,
    dayOfWeek: "M",
    startTime: "10:00",
    endTime: "14:00"
  },
  {
    doctor_id: doctor1.doctor_id,
    dayOfWeek: "X",
    startTime: "10:00",
    endTime: "14:00"
  },
  {
    doctor_id: doctor1.doctor_id,
    dayOfWeek: "J",
    startTime: "10:00",
    endTime: "14:00"
  },
  {
    doctor_id: doctor1.doctor_id,
    dayOfWeek: "V",
    startTime: "10:00",
    endTime: "14:00"
  },
  {
    doctor_id: doctor1.doctor_id,
    dayOfWeek: "S",
    startTime: "10:00",
    endTime: "14:00"
  },
  {
    doctor_id: doctor1.doctor_id,
    dayOfWeek: "D",
    startTime: "10:00",
    endTime: "14:00"
  }
]);

  const doctor2 = await Doctor.create({
    name: "Patricia",
    doctorType: "HUMAN",
  });

  const humanDoctor2 = await HumanDoctor.create({
    surnames: "Salas",
	password: encryptedPassword2,
    speciality: "Traumatología",
    medicalCenter: "Hospital Gregorio Marañón",
    email: "salas@gmail.com",
    dni: "55555555A",
    doctor_id: doctor2.doctor_id,
  });

  await DoctorTimetable.bulkCreate([
  {
    doctor_id: doctor2.doctor_id,
    dayOfWeek: "L",
    startTime: "14:00",
    endTime: "18:00"
  },
  {
    doctor_id: doctor2.doctor_id,
    dayOfWeek: "M",
    startTime: "14:00",
    endTime: "18:00"
  },
  {
    doctor_id: doctor2.doctor_id,
    dayOfWeek: "X",
    startTime: "14:00",
    endTime: "18:00"
  },
  {
    doctor_id: doctor2.doctor_id,
    dayOfWeek: "J",
    startTime: "14:00",
    endTime: "18:00"
  },
  {
    doctor_id: doctor2.doctor_id,
    dayOfWeek: "V",
    startTime: "14:00",
    endTime: "18:00"
  },
  {
    doctor_id: doctor2.doctor_id,
    dayOfWeek: "S",
    startTime: "14:00",
    endTime: "18:00"
  },
  {
    doctor_id: doctor2.doctor_id,
    dayOfWeek: "D",
    startTime: "14:00",
    endTime: "18:00"
  }
]);

const doctor4 = await Doctor.create({
    name: "Naiara",
    doctorType: "HUMAN",
  });

  const humanDoctor3 = await HumanDoctor.create({
    surnames: "Pozo",
	password: encryptedPassword1,
    speciality: "Médico de cabecera",
    medicalCenter: "Hospital Puerta de Hierro",
    email: "pozo@gmail.com",
    dni: "12345678B",
    doctor_id: doctor4.doctor_id,
  });
  
  await DoctorTimetable.bulkCreate([
  {
    doctor_id: doctor4.doctor_id,
    dayOfWeek: "L",
    startTime: "10:00",
    endTime: "14:00"
  },
  {
    doctor_id: doctor4.doctor_id,
    dayOfWeek: "M",
    startTime: "10:00",
    endTime: "14:00"
  },
  {
    doctor_id: doctor4.doctor_id,
    dayOfWeek: "X",
    startTime: "10:00",
    endTime: "14:00"
  },
  {
    doctor_id: doctor4.doctor_id,
    dayOfWeek: "J",
    startTime: "10:00",
    endTime: "14:00"
  },
  {
    doctor_id: doctor4.doctor_id,
    dayOfWeek: "V",
    startTime: "10:00",
    endTime: "14:00"
  },
  {
    doctor_id: doctor4.doctor_id,
    dayOfWeek: "S",
    startTime: "10:00",
    endTime: "14:00"
  },
  {
    doctor_id: doctor4.doctor_id,
    dayOfWeek: "D",
    startTime: "10:00",
    endTime: "14:00"
  }
]);
  const doctor3 = await Doctor.create({
    name: "Hygeia IA",
    doctorType: "AI",
  });

  const aiDoctor1 = await AIDoctor.create({
    url: "https://aidoctor1.com",
    version: "1.0",
    token: "aiycaiuwyo-iecuaow",
    doctor_id: doctor3.doctor_id,
  });

  console.log(
    "Doctores creados correctamente:",
    humanDoctor1.humanDoctor_id,
    humanDoctor2.humanDoctor_id,
	humanDoctor3.humanDoctor_id,
    aiDoctor1.aiDoctor_id
  );
  
	return {
	  doctor1Id: doctor1.doctor_id,
	  doctor2Id: doctor2.doctor_id,
	  doctor4Id: doctor4.doctor_id
	};
}

//Función para generar las salas de las videollamadas
function generateVideoCallCode(doctorId, patientId, date, time, code) {
	
  const formattedDate = date.replaceAll("-", "");
  const formattedTime = time.replaceAll(":", "");

  return `doctor${doctorId}patient${patientId}date${formattedDate}time${formattedTime}code${code}`;

}

//Crear citas médicas
async function seedAppointments(patients, doctors) {

	await MedicalAppointment.bulkCreate([
	  {
		date: "2026-09-25",
		time: "10:00",
		medicalCenter: "Hospital Universitario La Paz",
		doctor: "Pablo Hierro",
		reasonForAppointment: "Revisión anual",
		patient_id: patients.patient1Id,
		doctor_id: doctors.doctor1Id
	  },
	  {
		date: "2026-09-25",
		time: "14:00",
		medicalCenter: "Hospital Gregorio Marañón",
		doctor: "Patricia Salas",
		reasonForAppointment: "Esguince de tobillo",
		patient_id: patients.patient2Id,
		doctor_id: doctors.doctor2Id
	  },
	  {
		date: "2026-09-30",
		time: "10:00",
		medicalCenter: "Hospital Puerta de Hierro",
		doctor: "Naiara Pozo",
		reasonForAppointment: "Revisión general",
		patient_id: patients.patient3Id,
		doctor_id: doctors.doctor4Id
	  },
	  {
		date: "2026-09-26",
		time: "16:00",
		medicalCenter: "Hospital Gregorio Marañón",
		doctor: "Patricia Salas",
		reasonForAppointment: "Dolor de espalda",
		patient_id: patients.patient3Id,
		doctor_id: doctors.doctor2Id
	  }
	]);

	await RealDoctorAppointment.bulkCreate([
	  {
		date: "2026-09-24",
		time: "11:00",
		reason: "Consulta por videollamada",
		status: "CONFIRMADA",
		videocall: generateVideoCallCode(
		  doctors.doctor1Id,
		  patients.patient1Id,
		  "2026-09-24",
		  "11:00",
		  //Código generado por mí. En la aplicación se generan con números aleatorios
		  "1234"
		),
		patient_id: patients.patient1Id,
		doctor_id: doctors.doctor1Id
	  },
	  {
		date: "2026-09-24",
		time: "15:00",
		reason: "Seguimiento de esguince",
		status: "CONFIRMADA",
		videocall: generateVideoCallCode(
		  doctors.doctor2Id,
		  patients.patient2Id,
		  "2026-09-24",
		  "15:00",
		  "1234"
		),
		patient_id: patients.patient2Id,
		doctor_id: doctors.doctor2Id
	  },
	  {
		date: "2026-09-24",
		time: "11:00",
		reason: "Consulta para analizar dolor de garganta",
		status: "CONFIRMADA",
		videocall: generateVideoCallCode(
		  doctors.doctor4Id,
		  patients.patient3Id,
		  "2026-09-24",
		  "11:00",
		  "1234"
		),
		patient_id: patients.patient3Id,
		doctor_id: doctors.doctor4Id
	  },
	  {
		date: "2026-09-27",
		time: "17:00",
		reason: "Revisión de moratón por caída",
		status: "CONFIRMADA",
		videocall: generateVideoCallCode(
		  doctors.doctor2Id,
		  patients.patient3Id,
		  "2026-09-27",
		  "17:00",
		  "1234"
		),
		patient_id: patients.patient3Id,
		doctor_id: doctors.doctor2Id
	  }
	]);

  console.log("Citas médicas y citas por videollamada creadas correctamente");

}

//Ejecutar seeds
async function seedAll() {
	
  await clearDatabase();

  const patients = await seedPatients();

  const doctors = await seedDoctors();

	await seedMedicalRecord(
	  patients.patient1Id,
	  "Pablo Hierro",
	  doctors.doctor1Id
	);

	await seedMedicalRecord(
	  patients.patient2Id,
	  "Pablo Hierro",
	  doctors.doctor1Id
	);

	await seedMedicalRecord(
	  patients.patient3Id,
	  "Naiara Pozo",
	  doctors.doctor4Id
	);

	await seedMedications(patients.patient1Id);

	await seedMedications(patients.patient2Id);

	await seedMedications(patients.patient3Id);

	await seedAppointments(patients, doctors);

  console.log("Los datos de prueba se han creado correctamente");
}
module.exports = {
  seedAll,
};
