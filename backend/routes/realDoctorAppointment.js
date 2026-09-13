const express = require("express");
const router = express.Router();

const {
  Patient,
  Doctor,
  HumanDoctor,
  RealDoctorAppointment,
  MedicalAppointment,
  DoctorTimetable
} = require("../sequelize");

// Obtener citas con médico real por id de paciente
router.get("/patients/:id/real-doctor-appointments", async (req, res) => {

  try {

    const appointments = await RealDoctorAppointment.findAll({
      where: {
        patient_id: req.params.id
      },
	include: [
	  Patient,
	  {
		model: Doctor,
		include: [HumanDoctor]
	  }
	],
      order: [
        ["date", "ASC"],
        ["time", "ASC"]
      ]
    });
	
	  const formattedAppointments = appointments.map((appointment) => {

	  const plainAppointment = appointment.toJSON();
	  
	  console.log(JSON.stringify(plainAppointment, null, 2));

	  const doctor =
		plainAppointment.Doctor ||
		plainAppointment.doctor;

		const humanDoctor =
		  doctor?.HumanDoctor ||
		  doctor?.humanDoctor;

		plainAppointment.doctorName =
		  `${doctor?.name || ""} ${humanDoctor?.surnames || humanDoctor?.surname || ""}`.trim();

			  return plainAppointment;

			});

	res.json({
	  ok: true,
	  appointments: formattedAppointments
	});

  } catch (err) {

    console.error("Error obteniendo citas del paciente:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

// Crear cita con médico real
router.post("/real-doctor-appointments", async (req, res) => {

  try {

    const {
      patient_id,
      doctor_id,
      date,
      time,
      reason
    } = req.body;

    if (!patient_id || !doctor_id || !date || !time) {

      return res.status(400).json({
        ok: false,
        message: "Paciente, médico, fecha y hora son obligatorios"
      });

    }

    const normalizedTime = time.substring(0, 5);

    const patient = await Patient.findByPk(patient_id);

    if (!patient) {

      return res.status(404).json({
        ok: false,
        message: "Paciente no encontrado"
      });

    }

    const doctor = await Doctor.findByPk(doctor_id);

    if (!doctor) {

      return res.status(404).json({
        ok: false,
        message: "Médico no encontrado"
      });

    }

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
        message: "Ese médico ya tiene una cita programada para esa fecha y hora"
      });

    }

/*Generar un número aleatorio de cuatro dígitos para añadirlo al código de la sala
para que sea más difícil de adivinar*/
	const randomNumber = Math.floor(1000 + Math.random() * 9000);

	const videocall = (
	  `doctor${doctor_id}` +
	  `patient${patient_id}` +
	  `date${date}` +
	  `time${normalizedTime}` +
	  `code${randomNumber}`
	).replace(/[^a-zA-Z0-9]/g, "");

    const appointment = await RealDoctorAppointment.create({
      patient_id,
      doctor_id,
      date,
      time: normalizedTime,
      reason,
      status: "CONFIRMADA",
      videocall
    });

    res.status(201).json({
      ok: true,
      message: "Cita creada correctamente",
      appointment
    });

  } catch (err) {

    console.error("Error creando cita con médico real:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

// Actualizar cita con médico real
router.put("/real-doctor-appointments/:id", async (req, res) => {

  try {

    const appointment =
      await RealDoctorAppointment.findByPk(req.params.id);

    if (!appointment) {

      return res.status(404).json({
        ok: false,
        message: "Cita no encontrada"
      });

    }

    const {
      patient_id,
      doctor_id,
      date,
      time,
      reason
    } = req.body;

    if (!patient_id || !doctor_id || !date || !time) {

      return res.status(400).json({
        ok: false,
        message: "Paciente, médico, fecha y hora son obligatorios"
      });

    }

    const normalizedTime = time.substring(0, 5);

    const medicalAppointmentExists = await MedicalAppointment.findOne({
      where: {
        doctor_id,
        date,
        time: normalizedTime
      }
    });

    const realDoctorAppointments = await RealDoctorAppointment.findAll({
      where: {
        doctor_id,
        date,
        time: normalizedTime
      }
    });

    const realDoctorAppointmentExists =
      realDoctorAppointments.find((realAppointment) => {
        return realAppointment.realDoctorAppointment_id != req.params.id;
      });

    if (medicalAppointmentExists || realDoctorAppointmentExists) {

      return res.status(400).json({
        ok: false,
        message: "Ese médico ya tiene una cita programada a esa fecha y hora"
      });

    }

    await appointment.update({
      patient_id,
      doctor_id,
      date,
      time: normalizedTime,
      reason
    });

    res.json({
      ok: true,
      message: "Cita actualizada correctamente",
      appointment
    });

  } catch (err) {

    console.error("Error actualizando cita con médico real:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

// Eliminar cita con médico real
router.delete("/real-doctor-appointments/:id", async (req, res) => {

  try {

    const appointment =
      await RealDoctorAppointment.findByPk(req.params.id);

    if (!appointment) {

      return res.status(404).json({
        ok: false,
        message: "Cita no encontrada"
      });

    }

    await appointment.destroy();

    res.json({
      ok: true,
      message: "Cita eliminada correctamente"
    });

  } catch (err) {

    console.error("Error eliminando cita con médico real:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

// Obtener citas con médico real por id de médico
router.get("/doctors/:id/real-doctor-appointments", async (req, res) => {

  try {

    const appointments = await RealDoctorAppointment.findAll({
      where: {
        doctor_id: req.params.id
      },
		include: [
		  Patient,
		  {
			model: Doctor,
			include: [HumanDoctor]
		  }
		],
      order: [
        ["date", "ASC"],
        ["time", "ASC"]
      ]
    });

    res.json({
      ok: true,
      appointments
    });

  } catch (err) {

    console.error("Error obteniendo citas del médico:", err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

//Obtener próximas citas disponibles de un médico
router.get("/doctors/:id/available-slots", async (req, res) => {

  try {

    const doctorId = req.params.id;
	//Fecha a partir de la que se quiere una cita elegida en frontend
    const startDate = req.query.startDate;

    if (!startDate) {

      return res.status(400).json({
        ok: false,
        message: "La fecha inicial es obligatoria"
      });

    }

    const medicalAppointments = await MedicalAppointment.findAll({
      where: {
        doctor_id: doctorId
      }
    });

    const realDoctorAppointments = await RealDoctorAppointment.findAll({
      where: {
        doctor_id: doctorId
      }
    });

    //... : Concatenar medicalAppointments y realDoctorAppointments
    const busyAppointments = [
      ...medicalAppointments,
      ...realDoctorAppointments
    ];

    //Recorrer las citas ocupadas con map para devolver su fecha y hora
    const busySlots = busyAppointments.map((appointment) => {
      return `${appointment.date}|${appointment.time.substring(0, 5)}`;
    });

   //Obtener el horario del médico
    const doctorTimetables = await DoctorTimetable.findAll({
      where: {
        doctor_id: doctorId
      }
    });

    /*Si el médico no tuviese horario no devuelve 
	huecos (array de huecos vacío)*/
    if (doctorTimetables.length === 0) {

      return res.json({
        ok: true,
        slots: []
      });

    }

    //Huecos
    const slots = [];

    //Para contar a partir de la fecha elegida en frontend (startDate)
    let currentDate = new Date(`${startDate}T00:00:00`);

    //Para poder sacar los próximos 30 huecos
    while (slots.length < 30) {

      const year = currentDate.getFullYear();

      const month =
        String(currentDate.getMonth() + 1).padStart(2, "0");

      const day =
        String(currentDate.getDate()).padStart(2, "0");

      const dateString =
        `${year}-${month}-${day}`;

      //Creada más adelante para convertir por ejemplo 0 a D, 1 a L ...
      const dayOfWeek = getDayLetter(currentDate.getDay());

      //Recorrer el horario del médico y quedarme con el día actual
      const timetablesForDay =
        doctorTimetables.filter((timetable) => {
          return timetable.dayOfWeek === dayOfWeek;
        });

      //Recorrer todas las horas de ese día disponibles
      timetablesForDay.forEach((timetable) => {

        //Generar fechas disponibles
        const availableTimes = generateTimes(
          timetable.startTime,
          timetable.endTime
        );

        availableTimes.forEach((time) => {

          const normalizedTime = time.substring(0, 5);

          const slotKey =
            `${dateString}|${normalizedTime}`;

		  //Comprobar si está ocupado ese hueco
          if (
            !busySlots.includes(slotKey) &&
            slots.length < 30
          ) {

            //Si no lo está, añadir como hueco libre
            slots.push({
              date: dateString,
              time: normalizedTime
            });

          }

        });

      });

      currentDate.setDate(currentDate.getDate() + 1);

    }

    //Devolver huecos a frontend
    res.json({
      ok: true,
      slots
    });

  } catch (err) {

    console.error("Error obteniendo citas disponibles:", err);

    res.status(500).json({
      ok: false,
      message: "Error obteniendo citas disponibles",
      error: err.message
    });

  }

});








//FUNCIONES

//Convierte por ejemplo 0 a D, 1 a L ...
function getDayLetter(dayNumber) {

  const days = {
    0: "D",
    1: "L",
    2: "M",
    3: "X",
    4: "J",
    5: "V",
    6: "S"
  };

  return days[dayNumber];

}

function generateTimes(startTime, endTime) {

  const times = [];

  const startParts = startTime.split(":");
  const endParts = endTime.split(":");

  let currentMinutes =
    Number(startParts[0]) * 60 + Number(startParts[1]);

  const endMinutes =
    Number(endParts[0]) * 60 + Number(endParts[1]);

  while (currentMinutes < endMinutes) {

    const hour =
      String(Math.floor(currentMinutes / 60)).padStart(2, "0");

    const minutes =
      String(currentMinutes % 60).padStart(2, "0");

    times.push(`${hour}:${minutes}`);

    currentMinutes += 30;

  }

  return times;

}

module.exports = router;