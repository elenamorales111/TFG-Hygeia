const express = require("express");
const router = express.Router();

const {
  Patient,
  MedicalRecord,
  Doctor,
  HumanDoctor,
  MedicalAppointment,
  RealDoctorAppointment
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

//Obtener todos los médicos IA
router.get("/ai-doctors", async (req, res) => {

  try {

    const aiDoctors = await AIDoctor.findAll({
      include: [
        Doctor,
        Question
      ]
    });

    res.json({
      ok: true,
      aiDoctors
    });

  } catch (err) {

    console.error("Ha ocurrido un error al obtener los médicos IA:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Crear doctor
router.post("/doctors", async (req, res) => {

  try {

    const doctor = await Doctor.create(req.body);

    res.status(201).json({
      ok: true,
      message: "Doctor creado correctamente",
      doctor
    });

  } catch (err) {

    console.error("Ha ocurrido un error al crear el doctor:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Crear médico humano
router.post("/human-doctors", async (req, res) => {

  try {

    const {
		  role,
		  surnames,
		  password,
		  speciality,
		  medicalCenter,
		  email,
		  dni,
		  doctor_id
		} = req.body;

		const humanDoctor = await HumanDoctor.create({

		  role,
		  surnames,
		  password,
		  speciality,
		  medicalCenter,
		  email,
		  dni,
		  doctor_id

		});

    res.status(201).json({
      ok: true,
      message: "Médico humano creado correctamente",
      humanDoctor
    });

  } catch (err) {

    console.error("Ha ocurrido un error al crear el médico humano:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Crear médico IA
router.post("/ai-doctors", async (req, res) => {

  try {

    const aiDoctor = await AIDoctor.create(req.body);

    res.status(201).json({
      ok: true,
      message: "Médico IA creado correctamente",
      aiDoctor
    });

  } catch (err) {

    console.error("Ha ocurrido un error al crear el médico IA:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Eliminar doctor
router.delete("/doctors/:id", async (req, res) => {

  try {

    const doctor = await Doctor.findByPk(req.params.id);

    if (!doctor) {

      return res.status(404).json({
        ok: false,
        message: "Doctor no encontrado"
      });

    }

    await doctor.destroy();

    res.json({
      ok: true,
      message: "Doctor eliminado correctamente"
    });

  } catch (err) {

    console.error("Ha ocurrido un error al eliminar el doctor:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

// Obtener datos de un médico por id
router.get("/doctors/:id", async (req, res) => {

  try {

    const humanDoctor = await HumanDoctor.findOne({

      where: {
        doctor_id: req.params.id
      },

      include: [
	  {
		model: Doctor
	  }
	]

    });
	

    if (!humanDoctor) {

      return res.status(404).json({

        ok: false,
        message: "Médico no encontrado"

      });

    }
	
	   const doctorBase =
      humanDoctor.Doctor || humanDoctor.doctor;

    res.json({

      ok: true,

      doctor: {

        doctor_id: humanDoctor.doctor_id,

        humanDoctor_id:
          humanDoctor.humanDoctor_id,

        name: doctorBase ? doctorBase.name : "",

        surnames:
          humanDoctor.surnames,

        dni:
          humanDoctor.dni,

        email:
          humanDoctor.email,

        speciality:
          humanDoctor.speciality,

        medicalCenter:
          humanDoctor.medicalCenter

      }

    });

  } catch (err) {

    console.error(
      "Error obteniendo médico:",
      err
    );

    res.status(500).json({

      ok: false,
      error: err.message

    });

  }

});

//Editar doctor y doctor humano
router.put("/doctors/:id", async (req, res) => {

  try {

    const {
      name,
      surnames,
      dni,
      email,
      speciality,
      medicalCenter
    } = req.body;

    const doctor = await Doctor.findByPk(req.params.id);

    const humanDoctor = await HumanDoctor.findOne({
      where: {
        doctor_id: req.params.id
      }
    });

    if (!doctor || !humanDoctor) {

      return res.status(404).json({
        ok: false,
        message: "Médico no encontrado"
      });

    }

    await doctor.update({
      name
    });

    await humanDoctor.update({
      surnames,
      dni,
      email,
      speciality,
      medicalCenter
    });

    res.json({
      ok: true,
      message: "Médico actualizado correctamente",
      doctor: {
        doctor_id: doctor.doctor_id,
        humanDoctor_id: humanDoctor.humanDoctor_id,
        name: doctor.name,
        surnames: humanDoctor.surnames,
        dni: humanDoctor.dni,
        email: humanDoctor.email,
        speciality: humanDoctor.speciality,
        medicalCenter: humanDoctor.medicalCenter
      }
    });

  } catch (err) {

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Obtener pacientes asociados a un médico de cabecera
router.get("/doctors/:id/patients", async (req, res) => {

  try {

    const doctorId = req.params.id;

    const humanDoctor = await HumanDoctor.findOne({
      where: {
        doctor_id: doctorId
      }
    });

    if (!humanDoctor) {

      return res.status(404).json({
        ok: false,
        message: "Médico no encontrado"
      });

    }

    let patients = [];

    //Médico de cabecera
    if (
      humanDoctor.speciality &&
      humanDoctor.speciality.toLowerCase().includes("cabecera")
    ) {

      patients = await Patient.findAll({
        include: [
          {
            model: MedicalRecord,
            where: {
              familyDoctor_id: doctorId
            }
          }
        ]
      });

    }

    //Especialista
    else {

      const medicalAppointments =
        await MedicalAppointment.findAll({
          where: {
            doctor_id: doctorId
          },
          include: [Patient]
        });

      const realDoctorAppointments =
        await RealDoctorAppointment.findAll({
          where: {
            doctor_id: doctorId
          },
          include: [Patient]
        });

      const patientMap = new Map();

      medicalAppointments.forEach((appointment) => {

        const patient =
          appointment.Patient || appointment.patient;

        if (patient) {

          patientMap.set(
            patient.patient_id,
            patient
          );

        }

      });

      realDoctorAppointments.forEach((appointment) => {

        const patient =
          appointment.Patient || appointment.patient;

        if (patient) {

          patientMap.set(
            patient.patient_id,
            patient
          );

        }

      });

      patients =
        Array.from(patientMap.values());

    }

    res.json({
      ok: true,
      patients
    });

  } catch (err) {

    console.error(
      "Error obteniendo pacientes del médico:",
      err
    );

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

module.exports = router;

