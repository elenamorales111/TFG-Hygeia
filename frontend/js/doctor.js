const realDoctorForm = document.getElementById("realDoctorForm");
const message = document.getElementById("message");

const doctorSelect = document.getElementById("doctor");
const appointmentsList = document.getElementById("realDoctorAppointmentsList");

const patientSelectContainer = document.getElementById("patientSelectContainer");

const patientSelect = document.getElementById("patientSelect");

const addRealDoctorAppointmentBtn = document.getElementById("addRealDoctorAppointmentBtn");

const role = (localStorage.getItem("role") || "").toUpperCase();

const patientId = localStorage.getItem("patient_id");
const doctorId = localStorage.getItem("doctor_id");

const startSearchDate = document.getElementById("startSearchDate");
const searchAvailableSlotsBtn = document.getElementById("searchAvailableSlotsBtn");
const availableSlotsContainer = document.getElementById("availableSlotsContainer");
const availableSlot = document.getElementById("availableSlot");

let doctors = [];
let patients = [];
let appointments = [];
let appointmentIdToDelete = null;

const doctorDescription = document.getElementById("doctorDescription");
const appointmentButtonText = document.getElementById("appointmentButtonText");

if (doctorDescription && appointmentButtonText) {

  if (role === "DOCTOR") {

    doctorDescription.textContent =
      "Esta sección de la web te será muy útil para tener citas por videollamada con tus pacientes";

    appointmentButtonText.textContent =
      "Solicitar cita con paciente";

  } else {

    doctorDescription.textContent =
      "Esta sección de la web te será muy útil para pedir citas médicas a los doctores dados de alta en Hygeia";

    appointmentButtonText.textContent =
      "Solicitar cita con médico real";

  }

}


//Limpiar formulario cuando se quiere crear una cita nueva
addRealDoctorAppointmentBtn.addEventListener("click", () => {

  realDoctorForm.reset();

  document.getElementById("realDoctorAppointmentId").value = "";

  document.getElementById("modalTitle").textContent =
    "Cita con médico real";

  message.className = "alert mt-4 d-none";
  message.textContent = "";

});

window.addEventListener("DOMContentLoaded", async () => {
	


  await loadDoctors();

	if (role === "DOCTOR") {

	  await loadPatients();

	}

	configurePageByRole();
  
  //Buscar próximas citas disponibles
	searchAvailableSlotsBtn.addEventListener("click", async () => {

	  const selectedDoctorId =
		  role === "DOCTOR"
			? doctorId
			: doctorSelect.value;
	  const startDate = startSearchDate.value;

	  if (!selectedDoctorId) {

		message.className = "alert alert-danger mt-4";
		message.textContent = "Selecciona un médico";
		return;

	  }

	  if (!startDate) {

		message.className = "alert alert-danger mt-4";
		message.textContent = "Selecciona una fecha";
		return;

	  }

	await loadAvailableSlots(
	  selectedDoctorId,
	  startDate
	);

});

  await loadAppointments();

  renderAppointmentsList();

});

/*Función para configurar el funcionamiento de la página según el tipo 
de usuario que entre*/
function configurePageByRole() {

  if (role === "DOCTOR") {

    patientSelectContainer
      .classList
      .remove("d-none");

    doctorSelect.required = false;

    doctorSelect
      .parentElement
      .classList
      .add("d-none");

  }

  if (role === "PATIENT") {

    patientSelect.required = false;
    patientSelect.disabled = true;

  }

}

//Cargar médicos humanos
async function loadDoctors() {

  try {

    const response = await fetch("/api/human-doctors");

    const data = await response.json();

    if (!response.ok) {

      message.className = "alert alert-danger mt-4";
      message.textContent = data.message || "Error al cargar médicos";
      return;

    }

    doctors = data.humanDoctors || [];


    doctorSelect.innerHTML = `
      <option value="">Selecciona un médico</option>
    `;

    doctors.forEach((humanDoctor) => {

      const doctorBase = humanDoctor.Doctor || humanDoctor.doctor;

      const option = document.createElement("option");

      option.value = humanDoctor.doctor_id;

      option.textContent =
        `${doctorBase.name} ${humanDoctor.surnames} - ${humanDoctor.speciality}`;

      doctorSelect.appendChild(option);

    });

  } catch (error) {

    console.error("Error cargando médicos:", error);

    message.className = "alert alert-danger mt-4";
    message.textContent = "No se ha podido conectar con el servidor";

  }

}

//Función para cargar pacientes
async function loadPatients() {

  try {

	const response =
	  await fetch(`/api/doctors/${doctorId}/patients`);

    const data =
      await response.json();

    if (!response.ok) {

      return;

    }

    patients =
      data.patients || [];

    patientSelect.innerHTML = `
      <option value="">
        Selecciona un paciente
      </option>
    `;

    patients.forEach((patient) => {

      patientSelect.innerHTML += `
        <option value="${patient.patient_id}">
          ${patient.name} ${patient.surnames}
        </option>
      `;

    });

  } catch (error) {

    console.error(
      "Error cargando pacientes:",
      error
    );

  }

}


//Cargar citas de telemedicina del paciente
async function loadAppointments() {

  try {

	let response;

	if (role === "DOCTOR") {

	  response = await fetch(
		`/api/doctors/${doctorId}/real-doctor-appointments`
	  );

	} else {

	  response = await fetch(
		`/api/patients/${patientId}/real-doctor-appointments`
	  );

	}

    const data = await response.json();

    if (!response.ok) {

      message.className = "alert alert-danger mt-4";
      message.textContent = data.message || "Error al cargar citas";
      return;

    }

    appointments = data.appointments || [];

  } catch (error) {

    console.error("Error cargando citas:", error);

    message.className = "alert alert-danger mt-4";
    message.textContent = "No se ha podido conectar con el servidor";

  }

}

//Crear o editar cita con médico real
realDoctorForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  const realDoctorAppointmentId =
    document.getElementById("realDoctorAppointmentId").value;

  const doctor_id = document.getElementById("doctor").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const reason = document.getElementById("reason").value;
  
  const finalPatientId =
    role === "DOCTOR"
      ? patientSelect.value
      : patientId;

  const finalDoctorId =
    role === "DOCTOR"
      ? doctorId
      : doctor_id;
	  
	if (role === "PATIENT" && !doctor_id) {

	  message.className = "alert alert-danger mt-4";
	  message.textContent = "Debes seleccionar un médico";

	  return;

	}

	if (role === "DOCTOR" && !patientSelect.value) {

	  message.className = "alert alert-danger mt-4";
	  message.textContent = "Debes seleccionar un paciente";

	  return;

	}  

  try {

    const url = realDoctorAppointmentId
      ? `/api/real-doctor-appointments/${realDoctorAppointmentId}`
      : "/api/real-doctor-appointments";

    const method =
      realDoctorAppointmentId ? "PUT" : "POST";

    const response = await fetch(url, {

      method,

      headers: {
        "Content-Type": "application/json"
      },

	body: JSON.stringify({
	  patient_id: finalPatientId,
	  doctor_id: finalDoctorId,
	  date,
	  time,
	  reason
	})

    });

    const data = await response.json();

    if (!response.ok) {

      message.className = "alert alert-danger mt-4";
      message.textContent =
        data.message || "El médico no está disponible";
      return;

    }

    message.className = "alert alert-success mt-4";

    if (realDoctorAppointmentId) {

      message.textContent = "Cita actualizada correctamente";

    } else {

      message.textContent =
        "Cita creada correctamente";

    }

    realDoctorForm.reset();

    document.getElementById("realDoctorAppointmentId").value = "";

    const modalElement = document.getElementById("realDoctorModal");
    const modal = bootstrap.Modal.getInstance(modalElement);

    modal.hide();

    await loadAppointments();

    renderAppointmentsList();

  } catch (error) {

    console.error("Error guardando cita con médico real:", error);

    message.className = "alert alert-danger mt-4";
    message.textContent = "No se ha podido conectar con el servidor";

  }

});

//Mostrar lista de citas
function renderAppointmentsList() {

  appointmentsList.innerHTML = "";

  if (appointments.length === 0) {

    appointmentsList.innerHTML = `
      <div class="list-group-item text-muted">
        Aún no tienes citas de telemedicina registradas.
      </div>
    `;

    return;

  }

  appointments.sort((a, b) => {

    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);

    return dateA - dateB;

  });

  appointments.forEach((appointment) => {

	console.log("CITA TELEMEDICINA:", appointment);

    const item = document.createElement("div");

    item.className =
      "list-group-item appointment-item d-flex justify-content-between align-items-center";

	let title = "";
	let subtitle = "";

	if (role === "DOCTOR") {

	const patient = patients.find((patient) => {
	  return String(patient.patient_id) === String(appointment.patient_id);
	});

	title =
	  patient
		? `${patient.name} ${patient.surnames || ""}`
		: "Paciente";

	} else {

	  const doctorBase =
		appointment.Doctor || appointment.doctor;

	  const humanDoctor =
		doctorBase?.HumanDoctor || doctorBase?.humanDoctor;

	  title =
		`${doctorBase?.name || "Médico"} ${humanDoctor?.surnames || ""}`;

	  subtitle =
		humanDoctor?.speciality || "Sin especialidad";

	}

    item.innerHTML = `

      <div>

        <h5 class="mb-1 text-primary">
		  ${title}
		</h5>

		${subtitle ? `
		  <p class="mb-1">
			${subtitle}
		  </p>
		` : ""}

        <small class="text-muted">
          ${appointment.date} · ${appointment.time} · ${appointment.status}
        </small>

      </div>

      <div class="d-flex gap-2">

		<button
		  class="btn btn-outline-primary btn-sm"
		  onclick="startVideoCall('${appointment.videocall}')"
		>
		  <i class="bi bi-camera-video"></i>
		</button>

        <button
          class="btn btn-outline-primary btn-sm"
          onclick="editAppointment(${appointment.realDoctorAppointment_id})"
        >
          <i class="bi bi-pencil-square"></i>
        </button>

        <button
          class="btn btn-outline-danger btn-sm"
          onclick="deleteAppointment(${appointment.realDoctorAppointment_id})"
        >
          <i class="bi bi-trash"></i>
        </button>

      </div>

    `;

    appointmentsList.appendChild(item);

  });

}

//Editar cita con médico real
function editAppointment(id) {

  const appointment = appointments.find((appointment) => {
    return appointment.realDoctorAppointment_id === id;
  });

  if (!appointment) {

    message.className = "alert alert-danger mt-4";
    message.textContent = "Cita no encontrada";
    return;

  }

  document.getElementById("realDoctorAppointmentId").value =
    appointment.realDoctorAppointment_id;

  document.getElementById("doctor").value =
    appointment.doctor_id;

  document.getElementById("date").value =
    appointment.date;

  document.getElementById("time").value =
    appointment.time;

  document.getElementById("reason").value =
    appointment.reason || "";

  document.getElementById("modalTitle").textContent =
    "Editar cita con médico real";

  const modalElement = document.getElementById("realDoctorModal");

  const modal = new bootstrap.Modal(modalElement);

  modal.show();

}

//Eliminar cita con médico real
async function deleteAppointment(id) {

  appointmentIdToDelete = id;

  const deleteModalElement =
    document.getElementById("deleteAppointmentModal");

  const deleteModal =
    new bootstrap.Modal(deleteModalElement);

  deleteModal.show();

}



//Cargar próximas citas disponibles del médico desde una fecha concreta
async function loadAvailableSlots(doctorId, startDate) {

  try {

    availableSlot.innerHTML = `
      <option value="">Selecciona una cita disponible</option>
    `;

    const response =
      await fetch(`/api/doctors/${doctorId}/available-slots?startDate=${startDate}`);

    const data = await response.json();

    if (!response.ok) {

      message.className = "alert alert-danger mt-4";
      message.textContent =
        data.message || "Error cargando citas disponibles";
      return;

    }

    const slots = data.slots || [];

    if (slots.length === 0) {

      availableSlot.innerHTML = `
        <option value="">No hay citas disponibles</option>
      `;

      availableSlotsContainer.classList.remove("d-none");
      return;

    }

    slots.forEach((slot) => {

      const option = document.createElement("option");

      option.value = `${slot.date}|${slot.time}`;

      option.textContent =
        `${formatSlotDate(slot.date)} disponible a las ${slot.time}`;

      availableSlot.appendChild(option);

    });

    availableSlotsContainer.classList.remove("d-none");

  } catch (error) {

    console.error("Error cargando citas disponibles:", error);

    message.className = "alert alert-danger mt-4";
    message.textContent =
      "No se ha podido conectar con el servidor";

  }

}

//Rellenar fecha y hora al seleccionar una cita disponible
availableSlot.addEventListener("change", () => {

  if (!availableSlot.value) {

    return;

  }

  const [date, time] = availableSlot.value.split("|");

  document.getElementById("date").value = date;
  document.getElementById("time").value = time;

});

//Formatear fecha YYYY-MM-DD a DD/MM/YYYY
function formatSlotDate(date) {

  const parts = date.split("-");

  return `${parts[2]}/${parts[1]}/${parts[0]}`;

}

//Iniciar videollamada entre médico y paciente
function startVideoCall(videocall) {

  if (!videocall) {

    message.className = "alert alert-danger mt-4";
    message.textContent = "No ha sido posible iniciar la videollamada";
    return;

  }

  const appointment = appointments.find((appointment) => {
    return appointment.videocall === videocall;
  });

  const patient =
    appointment?.Patient || appointment?.patient;

  const doctorBase =
    appointment?.Doctor || appointment?.doctor;

  const humanDoctor =
    doctorBase?.HumanDoctor || doctorBase?.humanDoctor;

  const patientName =
    patient
      ? `${patient.name} ${patient.surnames || ""}`
      : "Paciente Hygeia";

  const doctorName =
    doctorBase
      ? `${doctorBase.name} ${humanDoctor?.surnames || ""}`
      : "Médico Hygeia";

  window.location.href =
    `/frontend/pages/videocall.html?room=${videocall}` +
    `&patient=${encodeURIComponent(patientName)}` +
    `&doctor=${encodeURIComponent(doctorName)}` +
    `&role=${role}`;

}


//Confirmar que se quiere eliminar cita
document
  .getElementById("confirmDeleteAppointmentBtn")
  .addEventListener("click", async () => {

    if (!appointmentIdToDelete) {

      return;

    }

    try {

      const response =
        await fetch(`/api/real-doctor-appointments/${appointmentIdToDelete}`, {

          method: "DELETE"

        });

      const data = await response.json();

      if (!response.ok) {

        message.className = "alert alert-danger mt-4";
        message.textContent = data.message || "Error al eliminar la cita";
        return;

      }

      const deleteModalElement =
        document.getElementById("deleteAppointmentModal");

      const deleteModal =
        bootstrap.Modal.getInstance(deleteModalElement);

      deleteModal.hide();

      appointmentIdToDelete = null;

      message.className = "alert alert-success mt-4";
      message.textContent = "Cita eliminada correctamente";

      await loadAppointments();

      renderAppointmentsList();

    } catch (error) {

      console.error("Error eliminando cita:", error);

      message.className = "alert alert-danger mt-4";
      message.textContent = "No se ha podido conectar con el servidor";

    }

  });