const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const {
  Patient,
  Doctor,
  HumanDoctor,
  DoctorTimetable
} = require("../sequelize");

//Inicio de sesión de paciente
router.post("/login", async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;

    if (!email || !password) {

      return res.status(400).json({
        ok: false,
        message: "El email y la contraseña son obligatorios"
      });

    }

    const patient = await Patient.findOne({
      where: {
        email
      }
    });

    if (!patient) {

      return res.status(404).json({
        ok: false,
        message: "El nombre de usuario introducido es incorrecto. Por favor introducelo de nuevo"
      });

    }

    const passwordsMatch = await bcrypt.compare(password, patient.password);

    if (!passwordsMatch) {

      return res.status(400).json({
        ok: false,
        message: "La contraseña introducida es incorrecta. Por favor introducela de nuevo"
      });

    }

    res.json({
      ok: true,
      message: "Login correcto",
      patient_id: patient.patient_id,
	  role: patient.role,
      name: patient.name,
      surnames: patient.surnames,
      email: patient.email
    });

  } catch (err) {

    console.error("Ha ocurrido un error al iniciar sesión:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Inicio de sesión de médico
router.post("/doctor-login", async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;

    if (!email || !password) {

      return res.status(400).json({
        ok: false,
        message: "El email y la contraseña son obligatorios"
      });

    }

    const doctor = await HumanDoctor.findOne({
      where: {
        email
      },
	  
	  //Incluir los datos que tiene la tabla Doctor
	    include: [
    {
      model: Doctor
    }
  ]
    });

    if (!doctor) {

      return res.status(404).json({
        ok: false,
        message: "El nombre de usuario introducido es incorrecto. Por favor introdúcelo de nuevo"
      });

    }

    const passwordsMatch =
      await bcrypt.compare(password, doctor.password);

    if (!passwordsMatch) {

      return res.status(400).json({
        ok: false,
        message: "La contraseña introducida es incorrecta. Por favor introdúcela de nuevo"
      });

    }

    res.json({
      ok: true,
      message: "Login correcto",
      doctor_id: doctor.doctor_id,
      humanDoctor_id: doctor.humanDoctor_id,
      role: doctor.role,
	  name: doctor.surnames,
      surnames: doctor.surnames,
      email: doctor.email
    });

  } catch (err) {

    console.error("Ha ocurrido un error al iniciar sesión:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});


//Registro de paciente
router.post("/register", async (req, res) => {

  try {

    const {
	  role,
      name,
      surnames,
      dateOfBirth,
      dni,
      email,
      password,
      phoneNumber,
      address,
      postalCode,
      province
    } = req.body;

	if (!name || !surnames || !dateOfBirth || !dni || !email || !password || 
	!phoneNumber ||!province) {

	  return res.status(400).json({
		ok: false,
		message: "Todos los campos obligatorios (*) deben rellenarse"
	  });

	}

    const patientExists = await Patient.findOne({
      where: {
        email
      }
    });

    if (patientExists) {

      return res.status(400).json({
        ok: false,
        message: "El correo ya está registrado"
      });

    }

    const encryptedPassword = await bcrypt.hash(password, 10);

	console.log("BODY REGISTER:", req.body);
	console.log("ROLE REGISTER:", role);

    const patient = await Patient.create({
	  role: "PATIENT",
      name,
      surnames,
      dateOfBirth,
      dni,
      email,
      password: encryptedPassword,
      phoneNumber,
      address,
      postalCode,
      province
    });

    res.status(201).json({
      ok: true,
      message: "Usuario registrado correctamente",
	  
      patient_id: patient.patient_id,
	  role: patient.role,
	  name: patient.name,
      email: patient.email
    });

  } catch (err) {

    console.error("Ha ocurrido un error al registrar usuario:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});


//Registro de médico
router.post("/doctor-register", async (req, res) => {

  try {

    const {
      name,
      surnames,
      speciality,
      medicalCenter,
      email,
      password,
      dni,
	  schedules
    } = req.body;

    if (!name || !surnames || !speciality || !medicalCenter || !email || !password || !dni) {

      return res.status(400).json({
        ok: false,
        message: "Todos los campos obligatorios deben rellenarse"
      });

    }

    const doctorExists = await HumanDoctor.findOne({
      where: {
        email
      }
    });

    if (doctorExists) {

      return res.status(400).json({
        ok: false,
        message: "El correo ya está registrado"
      });

    }

    const encryptedPassword =
      await bcrypt.hash(password, 10);

    const doctor = await Doctor.create({
      name,
      doctorType: "HUMAN"
    });

    const humanDoctor = await HumanDoctor.create({
      role: "DOCTOR",
      surnames,
      speciality,
      medicalCenter,
      email,
      password: encryptedPassword,
      dni,
      doctor_id: doctor.doctor_id
    });
	
		if (schedules && schedules.length > 0) {

		  await DoctorTimetable.bulkCreate(

			schedules.map((schedule) => ({
			  doctor_id: doctor.doctor_id,
			  dayOfWeek: schedule.dayOfWeek,
			  startTime: schedule.startTime,
			  endTime: schedule.endTime
			}))

		  );

	    }

    res.status(201).json({
      ok: true,
      message: "Médico registrado correctamente",
      doctor_id: doctor.doctor_id,
      humanDoctor_id: humanDoctor.humanDoctor_id,
      role: humanDoctor.role,
      name: doctor.name,
      surnames: humanDoctor.surnames,
      email: humanDoctor.email
    });

  } catch (err) {

    console.error("Ha ocurrido un error al registrar médico:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

// Obtener horario del médico
router.get("/doctors/:id/schedules", async (req, res) => {

  try {

    const schedules = await DoctorTimetable.findAll({
      where: {
        doctor_id: req.params.id
      }
    });

    res.json({
      ok: true,
      schedules
    });

  } catch (err) {

    console.error("Error obteniendo horario:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});


// Actualizar horario del médico
router.put("/doctors/:id/schedules", async (req, res) => {

  try {

    const { schedules } = req.body;

    await DoctorTimetable.destroy({
      where: {
        doctor_id: req.params.id
      }
    });

    if (schedules && schedules.length > 0) {

      await DoctorTimetable.bulkCreate(
        schedules.map((schedule) => ({
          doctor_id: Number(req.params.id),
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime
        }))
      );

    }

    res.json({
      ok: true,
      message: "Horario actualizado correctamente"
    });

  } catch (err) {

    console.error("Error actualizando horario:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

module.exports = router;
