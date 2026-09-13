const appointmentForm = document.getElementById("appointmentForm");
const message = document.getElementById("message");

const calendarBody = document.getElementById("calendarBody");
const monthTitle = document.getElementById("monthTitle");

const previousMonthBtn = document.getElementById("previousMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");

const appointmentsList = document.getElementById("appointmentsList");

const addAppointmentBtn = document.getElementById("addAppointmentBtn");

const role = (localStorage.getItem("role") || "").toUpperCase();

const patientId = localStorage.getItem("patient_id");
const doctorId = localStorage.getItem("doctor_id");

const startSearchDate = document.getElementById("startSearchDate");
const searchAvailableSlotsBtn = document.getElementById("searchAvailableSlotsBtn");
const availableSlotsContainer = document.getElementById("availableSlotsContainer");
const availableSlot = document.getElementById("availableSlot");

const medicalCenterInput = document.getElementById("medicalCenter");

const doctorSelect = document.getElementById("doctor");
  
const patientSelectContainer = document.getElementById("patientSelectContainer");
const patientSelect = document.getElementById("patientSelect");


let appointmentIdToDelete = null;

//Limpiar formulario cuando se quiere crear una cita nueva
addAppointmentBtn.addEventListener("click", () => {

  appointmentForm.reset();

  document.getElementById("appointmentId").value = "";

  message.className = "alert mt-4 d-none";
  message.textContent = "";

});

medicalCenterInput.addEventListener("change", () => {

  const hospital = medicalCenterInput.value.trim().toLowerCase();

  doctorSelect.innerHTML = "";

  if (hospital === "") {

    doctorSelect.disabled = true;

    doctorSelect.innerHTML = `
      <option value="">Primero escribe un hospital</option>
    `;

    return;
  }

  const filteredDoctors = doctors.filter((doctor) => {

    const doctorHospital =
      doctor.medicalCenter ||
      doctor.medical_center ||
      doctor.hospital ||
      "";

    return doctorHospital.toLowerCase().includes(hospital);

  });

  if (filteredDoctors.length === 0) {

    doctorSelect.disabled = true;

    doctorSelect.innerHTML = `
      <option value="">No hay médicos registrados en ese hospital</option>
    `;

    return;
  }

  doctorSelect.disabled = false;

  doctorSelect.innerHTML = `
    <option value="">Selecciona un médico</option>
  `;

  filteredDoctors.forEach((doctor) => {

    const doctorBase = doctor.Doctor || doctor.doctor;

    doctorSelect.innerHTML += `
      <option value="${doctor.doctor_id}">
        ${doctorBase.name} ${doctor.surnames} - ${doctor.speciality}
      </option>
    `;

  });

});

doctorSelect.addEventListener("change", () => {

  availableSlotsContainer.classList.add("d-none");

  availableSlot.innerHTML = `
    <option value="">Selecciona una cita disponible</option>
  `;

  document.getElementById("date").value = "";
  document.getElementById("time").value = "";

});

//Fecha actual para saber qué mes mostrar
let currentDate = new Date();

//Array donde se guardarán las citas de la DDBB
let appointments = [];

//Array donde se guardarán los doctores de la DDBB
let doctors = [];
//Array donde se guardarán los pacientes de la DDBB
let patients = [];

//Cuando carga la página, primero se cargan las citas y después se hace el calendario
window.addEventListener("DOMContentLoaded", async () => {

  await loadDoctors();
  
  if (role === "DOCTOR") {
  await loadPatients();
  }
  
  configurePageByRole();

  searchAvailableSlotsBtn.addEventListener("click", async () => {

    const selectedDoctorId =
	  role === "DOCTOR"
		? doctorId
		: doctorSelect.value;
    const startDate = startSearchDate.value;

    if (!selectedDoctorId) {
	  message.className = "alert alert-danger mt-4";
	  message.textContent =
		role === "DOCTOR"
		  ? "No se ha encontrado el id del médico"
		  : "Selecciona un médico";
	  return;
	}

    if (!startDate) {
      message.className = "alert alert-danger mt-4";
      message.textContent = "Selecciona una fecha";
      return;
    }

    await loadAvailableSlots(selectedDoctorId, startDate);

  });

  await loadAppointments();

  renderCalendar();
  renderAppointmentsList();

});

//Función para cargar las citas desde el backend
async function loadAppointments() {

  try {

    let url = "";

    if (role === "PATIENT") {
      url = `/api/patients/${patientId}/appointments`;
    } else if (role === "DOCTOR") {
      url = `/api/doctors/${doctorId}/appointments`;
    }
	
	console.log("ROLE:", role);
	console.log("PATIENT ID:", patientId);
	console.log("DOCTOR ID:", doctorId);
	console.log("URL:", url);

    const response = await fetch(url);

    const data = await response.json();

    if (!response.ok) {

      message.className = "alert alert-danger mt-4";
      message.textContent = data.message || "Error al cargar las citas";
      return;

    }

    appointments = data.appointments || [];

  } catch (error) {

    console.error("Error al cargar las citas:", error);

    message.className = "alert alert-danger mt-4";
    message.textContent = "No se ha podido conectar con el servidor";

  }

}

//Función para cargar los médicos humanos de la base de datos
async function loadDoctors() {

  try {

    const response = await fetch("/api/human-doctors");

    const data = await response.json();

    if (!response.ok) {

      return;

    }

    doctors = data.humanDoctors || [];
	
	const hospitals = [];

	doctors.forEach((doctor) => {

	  if (doctor.medicalCenter && !hospitals.includes(doctor.medicalCenter)) {

		hospitals.push(doctor.medicalCenter);

	  }

	});

	medicalCenterInput.innerHTML = `
	  <option value="">Selecciona un hospital</option>
	`;

	hospitals.forEach((hospital) => {

	  medicalCenterInput.innerHTML += `
		<option value="${hospital}">
		  ${hospital}
		</option>
	  `;

	});

  } catch (error) {

    console.error("Error cargando médicos:", error);

  }

}

//Función para cargar los pacientes de la base de datos
async function loadPatients() {

  try {

    const response = await fetch(`/api/doctors/${doctorId}/patients`);

    const data = await response.json();

    if (!response.ok) {
      return;
    }

    patients = data.patients || [];

    patientSelect.innerHTML = `
      <option value="">Selecciona un paciente</option>
    `;

    patients.forEach((patient) => {

      patientSelect.innerHTML += `
        <option value="${patient.patient_id}">
          ${patient.name} ${patient.surnames || ""}
        </option>
      `;

    });

  } catch (error) {

    console.error("Error al cargar los pacientes:", error);

  }

}

//Función para hacer el calendario
function renderCalendar() {

  //Limpiar calendario antes de volver a hacerlo
  calendarBody.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
  ];

  //Mostrar el mes y año actual en el título
  monthTitle.textContent = `${monthNames[month]} ${year}`;

  //Primer día del mes
  const firstDayOfMonth = new Date(year, month, 1);

  //Último día del mes
  const lastDayOfMonth = new Date(year, month + 1, 0);

  //Día de la semana en el que empieza el mes
  let startDay = firstDayOfMonth.getDay();

  //En JavaScript, domingo es 0. Lo convertimos a 7 para que la semana empiece en lunes
  if (startDay === 0) {
    startDay = 7;
  }

  //Número total de días que tiene el mes
  const daysInMonth = lastDayOfMonth.getDate();

  //Último día del mes anterior para poder poner los días grises iniciales
  const previousMonthLastDay = new Date(year, month, 0).getDate();

  let dayNumber = 1;
  let nextMonthDay = 1;

  //El calendario siempre tendrá 6 filas de semanas
  for (let week = 0; week < 6; week++) {

    const row = document.createElement("tr");

    //Cada semana tiene 7 días
    for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {

      const cell = document.createElement("td");

      //Sábado y domingo
      const isWeekend = dayOfWeek === 6 || dayOfWeek === 7;

      if (isWeekend) {
        cell.classList.add("weekend");
      }

      //Días del mes anterior que aparecen al principio en gris
      if (week === 0 && dayOfWeek < startDay) {

        const previousDay = previousMonthLastDay - startDay + dayOfWeek + 1;

        cell.classList.add("other-month");

        cell.innerHTML = `
          <span class="day-number">
            ${previousDay}
          </span>
        `;

      //Días del mes siguiente que aparecen al final en gris
      } else if (dayNumber > daysInMonth) {

        cell.classList.add("other-month");

        cell.innerHTML = `
          <span class="day-number">
            ${nextMonthDay}
          </span>
        `;

        nextMonthDay++;

      //Días reales del mes actual
      } else {

        const dateString = formatDate(year, month, dayNumber);

        //Buscar las citas que coinciden con este día
        const dayAppointments = appointments.filter((appointment) => {
          return appointment.date === dateString;
        });

        let appointmentHtml = "";

        //Crear el texto de cada cita dentro del día correspondiente
        dayAppointments.forEach((appointment) => {

		  const patientName =
			  appointment.patient
				? `${appointment.patient.name} ${appointment.patient.surnames || ""}`
				: "Paciente";

			appointmentHtml += `
			  <div class="appointment-badge">
				${
				  role === "DOCTOR"
					? `${appointment.time} · ${patientName}`
					: `${appointment.time} · ${appointment.doctor}`
				}
			  </div>
			`;

		});

        cell.innerHTML = `
          <span class="day-number">
            ${dayNumber}
          </span>

          ${appointmentHtml}
        `;

        dayNumber++;

      }

      row.appendChild(cell);

    }

    calendarBody.appendChild(row);

  }

}

//Función para mostrar la lista de citas médicas debajo del calendario
function renderAppointmentsList() {

  appointmentsList.innerHTML = "";

  //Si no hay citas
  if (appointments.length === 0) {

    appointmentsList.innerHTML = `
      <div class="list-group-item text-muted">
        Aún no tienes citas médicas registradas.
      </div>
    `;

    return;

  }

  //Ordenar citas por fecha y hora
		appointments.sort((a, b) => {

		  const dateA = new Date(`${a.date}T${a.time}`);
		  const dateB = new Date(`${b.date}T${b.time}`);

		  return dateA - dateB;

	});
	
  //Recorrer todas las citas
	appointments.forEach((appointment) => {

    const item = document.createElement("div");

    item.className =
      "list-group-item d-flex justify-content-between align-items-center";

    item.innerHTML = `

      <div>

        <h5 class="mb-1 text-primary">
          ${appointment.medicalCenter}
        </h5>

        <p class="mb-1">
          ${appointment.reasonForAppointment}
        </p>

		<small class="text-muted">
		  ${
			role === "DOCTOR"
			  ? `${appointment.date} · ${appointment.time} · ${appointment.patient?.name || "Paciente"} ${appointment.patient?.surnames || ""}`
			  : `${appointment.date} · ${appointment.time} · ${appointment.doctor}`
		  }
		</small>

      </div>

      <!-- Botones editar y eliminar -->
      <div class="d-flex gap-2">

        <button
          class="btn btn-outline-primary btn-sm"
          onclick="editAppointment(${appointment.medicalAppointment_id})"
        >
          <i class="bi bi-pencil-square"></i>
        </button>

        <button
          class="btn btn-outline-danger btn-sm"
          onclick="deleteAppointment(${appointment.medicalAppointment_id})"
        >
          <i class="bi bi-trash"></i>
        </button>

      </div>

    `;

    appointmentsList.appendChild(item);

  });

}

//Formatear fecha como YYYY-MM-DD para compararla con la BD
function formatDate(year, month, day) {

  const formattedMonth = String(month + 1).padStart(2, "0");
  const formattedDay = String(day).padStart(2, "0");

  return `${year}-${formattedMonth}-${formattedDay}`;

}

//Botón para ir al mes anterior
previousMonthBtn.addEventListener("click", () => {

  currentDate.setMonth(currentDate.getMonth() - 1);

  renderCalendar();
  renderAppointmentsList();

});

//Botón para ir al mes siguiente
nextMonthBtn.addEventListener("click", () => {

  currentDate.setMonth(currentDate.getMonth() + 1);

  renderCalendar();
  renderAppointmentsList();

});

//Crear y editar nueva cita médica
appointmentForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  let medicalCenter = document.getElementById("medicalCenter").value;
  const doctor_id = document.getElementById("doctor").value;
  const reasonForAppointment = document.getElementById("reasonForAppointment").value;
  const appointmentId = document.getElementById("appointmentId").value;
  const finalPatientId =
	  role === "PATIENT"
		? patientId
		: patientSelect.value;

	const finalDoctorId =
	  role === "DOCTOR"
		? doctorId
		: doctor_id;
	
  let doctor = "";
  
	  if (role === "DOCTOR") {

	  const currentDoctor = doctors.find((doctor) => {
		return String(doctor.doctor_id) === String(doctorId);
	  });

	  medicalCenter =
		currentDoctor.medicalCenter;

	}

	if (role === "PATIENT") {

	  const selectedDoctor = doctors.find((doctor) => {
		return String(doctor.doctor_id) === doctor_id;
	  });

	  const doctorBase =
		selectedDoctor.Doctor || selectedDoctor.doctor;

	  doctor =
		`${doctorBase.name} ${selectedDoctor.surnames}`;

	} else if (role === "DOCTOR") {

	  const currentDoctor = doctors.find((doctor) => {
		return String(doctor.doctor_id) === String(doctorId);
	  });

	  const doctorBase =
		currentDoctor.Doctor || currentDoctor.doctor;

	  doctor =
		`${doctorBase.name} ${currentDoctor.surnames}`;

	}


  try {

    const url = appointmentId
		? `/api/appointments/${appointmentId}`
		: "/api/appointments";

	const method =
		appointmentId ? "PUT" : "POST";

	const response = await fetch(url, {

		method,

		headers: {
			"Content-Type": "application/json"
		},

		body: JSON.stringify({
			date,
			time,
			medicalCenter,
			doctor,
			reasonForAppointment,
			patient_id: finalPatientId,
			doctor_id: finalDoctorId
		})

    });

    const data = await response.json();

    if (!response.ok) {

      message.className = "alert alert-danger mt-4";
      message.textContent = data.message || "Error al crear la cita médica";
      return;

    }

    message.className = "alert alert-success mt-4";
	
		if (appointmentId) {

		  message.textContent = "Cita médica actualizada correctamente";

	} else {

		  message.textContent = "Cita médica creada correctamente";

	}

    appointmentForm.reset();
	document.getElementById("appointmentId").value = "";

    //Cerrar el modal después de crear la cita
    const modalElement = document.getElementById("appointmentModal");
    const modal = bootstrap.Modal.getInstance(modalElement);

    modal.hide();
	

    //Volver a cargar las citas desde la BD
    await loadAppointments();

    //Volver a poner el calendario y lista de citas actualizados
    renderCalendar();
	renderAppointmentsList();

  } catch (error) {

    console.error("Error creando cita:", error);

    message.className = "alert alert-danger mt-4";
    message.textContent = "No se ha podido conectar con el servidor";

  }
 
 });
  
 //Editar cita médica
async function editAppointment(id) {

  try {

    //Buscar la cita seleccionada dentro del array appointments
    const appointment = appointments.find(
      (appointment) => appointment.medicalAppointment_id === id
    );

    if (!appointment) {

      message.className = "alert alert-danger mt-4";
      message.textContent = "No se ha encontrado la cita";
      return;

    }

    //Rellenar el formulario automáticamente con los datos de la cita
    document.getElementById("appointmentId").value = appointment.medicalAppointment_id;

    document.getElementById("date").value = appointment.date;
    document.getElementById("time").value = appointment.time;
    document.getElementById("medicalCenter").value = appointment.medicalCenter;
	
	const matchingDoctor = doctors.find((doctor) => {

	  const doctorBase = doctor.Doctor || doctor.doctor;

	  if (!doctorBase) {
		return false;
	  }

	  return `${doctorBase.name} ${doctor.surnames}` === appointment.doctor;

	});
	
	medicalCenterInput.dispatchEvent(new Event("change"));

	if (matchingDoctor) {

	  document.getElementById("doctor").value =
		matchingDoctor.doctor_id;

	}
	
    document.getElementById("reasonForAppointment").value =
      appointment.reasonForAppointment;

    //Abrir modal automáticamente
    const modalElement = document.getElementById("appointmentModal");

    const modal = new bootstrap.Modal(modalElement);

    modal.show();

  } catch (error) {

    console.error("Error editando cita:", error);

    message.className = "alert alert-danger mt-4";
    message.textContent = "No se ha podido cargar la cita";

  }
  
}
  
//Eliminar cita médica
async function deleteAppointment(id) {

  appointmentIdToDelete = id;

  const deleteModalElement =
    document.getElementById("deleteAppointmentModal");

  const deleteModal =
    new bootstrap.Modal(deleteModalElement);

  deleteModal.show();

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
        await fetch(`/api/appointments/${appointmentIdToDelete}`, {

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

//Cargar citas disponibles
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
    message.textContent = "No se ha podido conectar con el servidor";

  }

}

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

//Función para mostrar unas cosas u otras dependiendo del rol que tenga el usuario
function configurePageByRole() {

  if (role === "DOCTOR") {

    patientSelectContainer.classList.remove("d-none");

    doctorSelect.required = false;
    doctorSelect.disabled = true;
    doctorSelect.parentElement.classList.add("d-none");

    medicalCenterInput.parentElement.classList.add("d-none");
    medicalCenterInput.required = false;

  }

  if (role === "PATIENT") {

    patientSelect.required = false;
    patientSelect.disabled = true;

  }

}