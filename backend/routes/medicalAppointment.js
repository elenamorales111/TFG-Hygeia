const express = require("express");
const router = express.Router();

const {
  MedicalAppointment,
  RealDoctorAppointment,
  Patient,
  HumanDoctor,
  Doctor
} = require("../sequelize");

//Obtener todos los doctores guardados en la base de datos
router.get("/doctors", async (req, res) => {

  try {

    const doctors = await Doctor.findAll({
      include: [
        HumanDoctor,
        AIDoctor
      ]
    });

    res.json({
      ok: true,
      doctors
    });

  } catch (err) {

    console.error("Ha ocurrido un error al obtener los doctores:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Obtener todos los médicos humanos
router.get("/human-doctors", async (req, res) => {

  try {

    const humanDoctors = await HumanDoctor.findAll({

      include: [
        {
          model: Doctor
        }
      ]

    });

    res.json({
      ok: true,
      humanDoctors
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      message: "Error cargando médicos humanos"
    });

  }

});

// Obtener todos los pacientes
router.get("/patients", async (req, res) => {

  try {

    const patients = await Patient.findAll();

    res.json({
      ok: true,
      patients
    });

  } catch (err) {

    console.error("Error al obtener pacientes:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Obtener todas las citas médicas guardadas en la base de datos
router.get("/appointments", async (req, res) => {

  try {

    const appointments = await MedicalAppointment.findAll({
      include: [Patient]
    });

    res.json({
      ok: true,
      appointments
    });

  } catch (err) {

    console.error("Ha ocurrido un error al obtener las citas médicas:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Obtener citas médicas por id de paciente
router.get("/patients/:id/appointments", async (req, res) => {

  try {

    const appointments = await MedicalAppointment.findAll({
      where: {
        patient_id: req.params.id
      }
    });

    res.json({
      ok: true,
      appointments
    });

  } catch (err) {

    console.error("Ha ocurrido un error al obtener las citas médicas:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Obtener citas reales por id de doctor
router.get("/doctors/:id/real-appointments", async (req, res) => {

  try {

    const appointments = await RealDoctorAppointment.findAll({
      where: {
        doctor_id: req.params.id
      },
      include: [Patient]
    });

    res.json({
      ok: true,
      appointments
    });

  } catch (err) {

    console.error("Error al obtener las citas reales del doctor:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Obtener citas médicas por id de doctor
router.get("/doctors/:id/appointments", async (req, res) => {

  try {

    const appointments = await MedicalAppointment.findAll({
      where: {
        doctor_id: req.params.id
      },
      include: [Patient]
    });

	console.log(JSON.stringify(appointments, null, 2));

	res.json({
	  ok: true,
	  appointments
	});

  } catch (err) {

    console.error("Error al obtener las citas del doctor:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Crear cita médica
router.post("/appointments", async (req, res) => {

  try {

    const {
      date,
      time,
      medicalCenter,
      doctor,
      reasonForAppointment,
      patient_id,
      doctor_id
    } = req.body;
	
	const normalizedTime = time.substring(0, 5);


    const medicalAppointmentExists = await MedicalAppointment.findOne({
      where: {
        doctor_id,
        date,
        time: normalizedTime
      }
    });

    const realDoctorAppointmentExists = await RealDoctorAppointment.findOne({
      where: {
        doctor_id,
        date,
        time: normalizedTime
      }
    });


    if (medicalAppointmentExists || realDoctorAppointmentExists) {

      return res.status(400).json({
        ok: false,
        message: "Ese médico ya tiene una cita programada a esa fecha y hora"
      });

    }

    const appointment = await MedicalAppointment.create({
      date,
      time: normalizedTime,
      medicalCenter,
      doctor,
      reasonForAppointment,
      patient_id,
      doctor_id
    });

    res.status(201).json({
      ok: true,
      message: "Cita médica creada correctamente",
      appointment
    });

  } catch (err) {

    console.error("Ha ocurrido un error al crear la cita médica:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Editar cita médica
router.put("/appointments/:id", async (req, res) => {

  try {

    const {
      date,
      time,
      medicalCenter,
      doctor,
      reasonForAppointment,
      patient_id,
      doctor_id
    } = req.body;
	
	const normalizedTime = time.substring(0, 5);

    const appointment = await MedicalAppointment.findByPk(req.params.id);

    if (!appointment) {

      return res.status(404).json({
        ok: false,
        message: "Cita médica no encontrada"
      });

    }

    const medicalAppointments = await MedicalAppointment.findAll({
      where: {
        doctor_id,
        date,
        time: normalizedTime
      }
    });

    const medicalAppointmentExists = medicalAppointments.find((medicalAppointment) => {
      return medicalAppointment.medicalAppointment_id != req.params.id;
    });

    const realDoctorAppointmentExists = await RealDoctorAppointment.findOne({
      where: {
        doctor_id,
        date,
        time: normalizedTime
      }
    });

    if (medicalAppointmentExists || realDoctorAppointmentExists) {

      return res.status(400).json({
        ok: false,
        message: "Ese médico ya tiene una cita programada a esa fecha y hora"
      });

    }

    await appointment.update({
      date,
      time: normalizedTime,
      medicalCenter,
      doctor,
      reasonForAppointment,
      patient_id,
      doctor_id
    });

    res.json({
      ok: true,
      message: "Cita médica actualizada correctamente",
      appointment
    });

  } catch (err) {

    console.error("Ha ocurrido un error al editar la cita médica:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Eliminar cita médica
router.delete("/appointments/:id", async (req, res) => {

  try {

    const appointment = await MedicalAppointment.findByPk(req.params.id);

    if (!appointment) {

      return res.status(404).json({
        ok: false,
        message: "Cita médica no encontrada"
      });

    }

    await appointment.destroy();

    res.json({
      ok: true,
      message: "Cita médica eliminada correctamente"
    });

  } catch (err) {

    console.error("Ha ocurrido un error al eliminar la cita médica:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

module.exports = router;