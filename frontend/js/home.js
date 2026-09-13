document.addEventListener("DOMContentLoaded", async () => {

  loadNavbarUserName();
  
  const patientName =
  localStorage.getItem("patient_name");

	const welcomeMessage =
	  document.getElementById("welcomeMessage");

	if (welcomeMessage && patientName) {

	  welcomeMessage.textContent =
		`¡Bienvenido a Hygeia, ${patientName}!`;

	}

	const role = localStorage.getItem("role");
	const patientId = localStorage.getItem("patient_id");
	const doctorId = localStorage.getItem("doctor_id");

	if (role === "DOCTOR" && doctorId) {

	  document
		.getElementById("doctorDashboard")
		.classList.remove("d-none");

	  const doctorName =
		localStorage.getItem("doctor_surnames");

	  const doctorWelcomeMessage =
		document.getElementById("doctorWelcomeMessage");

	  if (doctorWelcomeMessage && doctorName) {
		doctorWelcomeMessage.textContent =
		  `¡Bienvenido a Hygeia, ${doctorName}!`;
	  }

	  await loadTodayDoctorAppointments(doctorId);
	  await loadMonthDoctorAppointments(doctorId);

	  return;

	}

	if (role !== "PATIENT" || !patientId) {
	  return;
	}

  document
    .getElementById("patientDashboard")
    .classList.remove("d-none");

  await loadTodayMedications(patientId);
  await loadMonthAppointments(patientId);
  await loadMedicalRecordAlert(patientId);

});

function loadNavbarUserName() {

  const userNameElement =
    document.getElementById("navbarUserName");

  if (!userNameElement) {
    return;
  }

  const role =
    localStorage.getItem("role");

  if (role === "DOCTOR") {

    userNameElement.textContent =
      localStorage.getItem("doctor_surnames") ||
      "Mi Usuario";

  } else {

    userNameElement.textContent =
      localStorage.getItem("patient_name") ||
      "Mi Usuario";

  }

}

async function loadTodayMedications(patientId) {

  const alertElement =
    document.getElementById("todayMedicationsAlert");

  try {

    const response =
      await fetch(`/api/patients/${patientId}/medications`);

    const data = await response.json();

    const medications = data.medications || [];

    const today = new Date();

    const weekDayMap = [
      "D", // Domingo
      "L", // Lunes
      "M", // Martes
      "X", // Miércoles
      "J", // Jueves
      "V", // Viernes
      "S"  // Sábado
    ];

    const todayWeekDay =
      weekDayMap[today.getDay()];

    const todayDate =
      getLocalDateString(today);

    const todayMedications = medications
      .filter((medication) => {

        if (medication.frequency === "FRECUENCIA_DIARIA") {
          return true;
        }

        if (medication.frequency === "FRECUENCIA_MEDIA") {

          if (!medication.weekDays) {
            return false;
          }

          return medication.weekDays
            .split(",")
            .includes(todayWeekDay);

        }

        if (medication.frequency === "FRECUENCIA_BAJA") {
          return medication.specificDate === todayDate;
        }

        return false;

      })
      .sort((a, b) => {
        return a.time.localeCompare(b.time);
      });

    if (todayMedications.length === 0) {
      alertElement.innerHTML =
        "No tienes medicinas programadas para hoy.";
      return;
    }

    alertElement.innerHTML = todayMedications
      .map((medication) => {
        return `${medication.time} · ${medication.medicine}`;
      })
      .join("<br>");

  } catch (error) {

    console.error("Error cargando medicinas:", error);

    alertElement.textContent =
      "No se han podido cargar tus medicinas.";

  }

}

//Cargar citas mensuales
async function loadMonthAppointments(patientId) {

  const alertElement =
    document.getElementById("monthAppointmentsAlert");

  try {

	const appointmentsResponse =
	  await fetch(`/api/patients/${patientId}/appointments`);

	const appointmentsData =
	  await appointmentsResponse.json();

	const appointments =
	  appointmentsData.appointments || [];

	const realAppointmentsResponse =
	  await fetch(`/api/patients/${patientId}/real-doctor-appointments`);

	const realAppointmentsData =
	  await realAppointmentsResponse.json();

	const realAppointments =
	  realAppointmentsData.appointments || [];

	const allAppointments = [

	  ...appointments,
	  ...realAppointments

	];

    const now = new Date();

    const today = getLocalDateString(now);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthAppointments = allAppointments
      .map((appointment) => {

        const appointmentDate =
          new Date(`${appointment.date}T${appointment.time}`);

        return {
          ...appointment,
          appointmentDate
        };

      })
      .filter((appointment) => {
	  return (
		appointment.date >= today &&
		appointment.appointmentDate.getMonth() === currentMonth &&
		appointment.appointmentDate.getFullYear() === currentYear
	  );
	})
     
      .sort((a, b) => {
        return a.appointmentDate - b.appointmentDate;
      });

    if (monthAppointments.length === 0) {
      alertElement.innerHTML =
        "No tienes citas este mes.";
      return;
    }

    alertElement.innerHTML = monthAppointments
      .map((appointment) => {
		  
		let doctorName = "Médico";

			if (appointment.doctorName) {

			  doctorName = appointment.doctorName;

			} else if (
			  typeof appointment.doctor === "string"
			) {

			  doctorName = appointment.doctor;

			} else if (
			  appointment.doctor?.name
			) {

			  doctorName = appointment.doctor.name;

			}
		
		console.log(appointment);

		return `${appointment.date} · ${appointment.time} · ${doctorName}`;
      })
      .join("<br>");

  } catch (error) {

    console.error("Error cargando citas:", error);

    alertElement.textContent =
      "No se han podido cargar tus citas.";

  }

}

async function loadMedicalRecordAlert(patientId) {

  const alertElement =
    document.getElementById("medicalRecordAlert");

  try {

    const response =
      await fetch(`/api/patients/${patientId}/medical-record`);

    if (response.status === 404) {

      alertElement.innerHTML = `
        ¡Te falta completar tu ficha médica!
		Puedes rellenarla en tu pestaña de
        <strong>Mi Usuario</strong>.
      `;

      return;

    }

    const data = await response.json();

    const medicalRecord =
      data.medicalRecord;

    const importantFields = [
      medicalRecord.familyDoctor,
      medicalRecord.bloodType,
      medicalRecord.allergies,
      medicalRecord.healthInsurance
    ];

    const hasIncompleteFields =
      importantFields.some((field) => {
        return !field;
      });

    if (hasIncompleteFields) {

      alertElement.innerHTML = `
        ¡Te falta completar tu ficha médica!
		Puedes rellenarla en tu pestaña de
        <strong>Mi Usuario</strong>.
      `;

    } else {

      alertElement.innerHTML =
        "Tu ficha médica está completa.";

    }

  } catch (error) {

    console.error("Error comprobando ficha médica:", error);

    alertElement.textContent =
      "No se ha podido comprobar tu ficha médica.";

  }

}

async function loadTodayDoctorAppointments(doctorId) {

  const alertElement =
    document.getElementById("todayDoctorAppointmentsAlert");

  try {

    const appointments =
      await loadAllDoctorAppointments(doctorId);

    const now = new Date();

    const today = getLocalDateString(now);

    const todayAppointments = appointments
      .filter((appointment) => {
        return appointment.date === today;
      })
      .sort((a, b) => {
        return a.time.localeCompare(b.time);
      });

    if (todayAppointments.length === 0) {
      alertElement.innerHTML =
        "No tienes citas programadas para hoy.";
      return;
    }

    alertElement.innerHTML = todayAppointments
      .map((appointment) => {

        const patient =
          appointment.patient ||
          appointment.Patient;

        const patientName =
          patient
            ? `${patient.name || ""} ${patient.surnames || ""}`
            : "Paciente";

        return `${appointment.time} · ${patientName}`;

      })
      .join("<br>");

  } catch (error) {

    console.error("Error cargando citas de hoy:", error);

    alertElement.textContent =
      "No se han podido cargar tus citas de hoy.";

  }

}

//Cargar citas de este mes del doctor
async function loadMonthDoctorAppointments(doctorId) {

  const alertElement =
    document.getElementById("monthDoctorAppointmentsAlert");

  try {

    const appointments =
      await loadAllDoctorAppointments(doctorId);

    const now = new Date();

    const today =
      getLocalDateString(now);

    const currentMonth =
      now.getMonth();

    const currentYear =
      now.getFullYear();

    const monthAppointments = appointments
      .map((appointment) => {

        const appointmentDate =
          new Date(`${appointment.date}T${appointment.time}`);

        return {
          ...appointment,
          appointmentDate
        };

      })
      .filter((appointment) => {
        return (
          appointment.date !== today &&
          appointment.appointmentDate >= now &&
          appointment.appointmentDate.getMonth() === currentMonth &&
          appointment.appointmentDate.getFullYear() === currentYear
        );
      })
      .sort((a, b) => {
        return a.appointmentDate - b.appointmentDate;
      });

    if (monthAppointments.length === 0) {
      alertElement.innerHTML =
        "No tienes más citas este mes.";
      return;
    }

    alertElement.innerHTML = monthAppointments
      .map((appointment) => {

        const patient =
          appointment.patient ||
          appointment.Patient;

        const patientName =
          patient
            ? `${patient.name || ""} ${patient.surnames || ""}`
            : "Paciente";

        return `${appointment.date} · ${appointment.time} · ${patientName}`;

      })
      .join("<br>");

  } catch (error) {

    console.error("Error cargando citas del mes:", error);

    alertElement.textContent =
      "No se han podido cargar tus citas del mes.";

  }

}


//Cargar citas del doctor
async function loadAllDoctorAppointments(doctorId) {

  const appointmentsResponse =
    await fetch(`/api/doctors/${doctorId}/appointments`);

  const appointmentsData =
    await appointmentsResponse.json();

  const appointments =
    appointmentsData.appointments || [];

  const realAppointmentsResponse =
    await fetch(`/api/doctors/${doctorId}/real-doctor-appointments`);

  const realAppointmentsData =
    await realAppointmentsResponse.json();

  const realAppointments =
    realAppointmentsData.appointments || [];

  return [
    ...appointments,
    ...realAppointments
  ];

}

function getLocalDateString(date) {

  const year =
    date.getFullYear();

  const month =
    String(date.getMonth() + 1).padStart(2, "0");

  const day =
    String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;

}