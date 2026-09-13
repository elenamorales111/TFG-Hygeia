const medicationForm = document.getElementById("medicationForm");
const message = document.getElementById("message");
const medicationIdInput = document.getElementById("medicationId");
const openMedicationModalBtn = document.getElementById("openMedicationModalBtn");

const doctorPatientSearchContainer = document.getElementById("doctorPatientSearchContainer");
const showPatientMedicinesBtn = document.getElementById("showPatientMedicinesBtn");
const doctorPatientSelectContainer = document.getElementById("doctorPatientSelectContainer");
const doctorPatientSelect = document.getElementById("doctorPatientSelect");
const patientMedicationContent = document.getElementById("patientMedicationContent");
const medicationsListContainer = document.getElementById("medicationsListContainer");
const medicationSubtitle = document.getElementById("medicationSubtitle");

const medicationsList = document.getElementById("medicationsList");


const dailyCount = document.getElementById("dailyCount");
const mediumCount = document.getElementById("mediumCount");
const lowCount = document.getElementById("lowCount");

/*Para elegir fecha según el tipo de frecuencia con la que se tome la medicación*/
const frequencyInput = document.getElementById("frequency");
const weekDaysContainer = document.getElementById("weekDaysContainer");
const specificDateContainer = document.getElementById("specificDateContainer");

const patientId = localStorage.getItem("patient_id");
const doctorId = localStorage.getItem("doctor_id");


//Array donde se guardarán las medicinas recibidas desde el backend
let medications = [];
let medicationIdToDelete = null;
let canManageMedications = false;

const role = (localStorage.getItem("role") || "").toUpperCase();


//Si no hay usuario logueado, se redirige al login
if (role === "PATIENT" && !patientId) {
  window.location.href = "login.html";
}

if (role === "DOCTOR" && !doctorId) {
  window.location.href = "login.html";
}


openMedicationModalBtn.addEventListener("click", () => {

  medicationForm.reset();

  medicationIdInput.value = "";

  weekDaysContainer.classList.add("d-none");

  specificDateContainer.classList.add("d-none");

  document.querySelectorAll(".week-day")
  .forEach((checkbox) => {

    checkbox.checked = false;

  });

});

//Mostrar campos extra según frecuencia elegida
frequencyInput.addEventListener("change", () => {

  const frequency = frequencyInput.value;

  //Ocultar ambos bloques primero
  weekDaysContainer.classList.add("d-none");
  specificDateContainer.classList.add("d-none");

  //Mostrar días de la semana
  if (frequency === "FRECUENCIA_MEDIA") {

    weekDaysContainer.classList.remove("d-none");

  }

  //Mostrar fecha exacta
  if (frequency === "FRECUENCIA_BAJA") {

    specificDateContainer.classList.remove("d-none");

  }

});


//Cuando carga la página, primero se cargan las medicinas y después se hace el dashboard
window.addEventListener("DOMContentLoaded", async () => {

  configurePageByRole();

  if (role === "DOCTOR") {
    await loadDoctorPatients();
    return;
  }

  await loadMedications();

  renderDashboard();

  renderMedicationsList();

});


showPatientMedicinesBtn.addEventListener("click", () => {

  doctorPatientSelectContainer.classList.remove("d-none");

});

doctorPatientSelect.addEventListener("change", async () => {

  if (!doctorPatientSelect.value) {

    patientMedicationContent.classList.add("d-none");
    medicationsListContainer.classList.add("d-none");

    medications = [];
    canManageMedications = false;

    openMedicationModalBtn.classList.add("d-none");

    renderDashboard();
    renderMedicationsList();

    return;

  }

  const selectedOption =
    doctorPatientSelect.options[doctorPatientSelect.selectedIndex];

  canManageMedications =
    selectedOption.dataset.canManage === "true";

  if (canManageMedications) {
    openMedicationModalBtn.classList.remove("d-none");
  } else {
    openMedicationModalBtn.classList.add("d-none");
  }

  patientMedicationContent.classList.remove("d-none");
  medicationsListContainer.classList.remove("d-none");

  await loadMedications();

  renderDashboard();
  renderMedicationsList();

});

//Función para cargar las medicinas del paciente desde el backend
async function loadMedications() {

  try {

    let finalPatientId = patientId;

	if (role === "DOCTOR") {
	  finalPatientId = doctorPatientSelect.value;
	}

	if (!finalPatientId) {
	  medications = [];
	  return;
	}

	const response = await fetch(`/api/patients/${finalPatientId}/medications`);

    const data = await response.json();

    if (!response.ok) {

      message.className = "alert alert-danger mt-4";
      message.textContent = data.message || "Error al cargar las medicinas";
      return;

    }

    medications = data.medications || [];

  } catch (error) {

    console.error("Error cargando medicinas:", error);

    message.className = "alert alert-danger mt-4";
    message.textContent = "No se ha podido conectar con el servidor";

  }

}

//Función para cargar pacientes
async function loadDoctorPatients() {

  try {

    await fetch("/api/medical-records/fill-family-doctor-ids", {
      method: "PUT"
    });

    const familyDoctorResponse =
      await fetch(`/api/doctors/${doctorId}/family-doctor-patients`);

    const familyDoctorData = await familyDoctorResponse.json();

    const familyDoctorPatients =
      familyDoctorData.patients || [];

    const appointmentsResponse =
      await fetch(`/api/doctors/${doctorId}/appointments`);

    const appointmentsData = await appointmentsResponse.json();

    const appointments =
      appointmentsData.appointments || [];
	  
	const realAppointmentsResponse =
	  await fetch(`/api/doctors/${doctorId}/real-appointments`);

	const realAppointmentsData =
	  await realAppointmentsResponse.json();

	const realAppointments =
	  realAppointmentsData.appointments || [];

    const patientsMap = new Map();

    familyDoctorPatients.forEach((patient) => {

      patientsMap.set(patient.patient_id, {
        ...patient,
        canManageMedications: true
      });

    });

    appointments.forEach((appointment) => {

      const patient =
        appointment.patient ||
        appointment.Patient;

      if (patient && !patientsMap.has(patient.patient_id)) {

        patientsMap.set(patient.patient_id, {
          ...patient,
          canManageMedications: false
        });

      }

    });
	
	realAppointments.forEach((appointment) => {

	  const patient =
		appointment.patient ||
		appointment.Patient;

	  if (patient && !patientsMap.has(patient.patient_id)) {

		patientsMap.set(patient.patient_id, {
		  ...patient,
		  canManageMedications: false
		});

	  }

	});

    doctorPatientSelect.innerHTML = `
      <option value="">Selecciona un paciente</option>
    `;

    patientsMap.forEach((patient) => {

      doctorPatientSelect.innerHTML += `
		  <option
			value="${patient.patient_id}"
			data-can-manage="${patient.canManageMedications}"
		  >
			${patient.name || ""} ${patient.surnames || ""}
		  </option>
		`;

    });

  } catch (error) {

    console.error("Error cargando pacientes del médico:", error);

    message.className = "alert alert-danger mt-4";
    message.textContent = "No se ha podido conectar con el servidor";

  }

}

//Función para actualizar los números del dashboard
function renderDashboard() {

  const dailyFrequencyMedications = medications.filter((medication) => {
    return medication.frequency === "FRECUENCIA_DIARIA";
  });

  const mediumFrequencyMedications = medications.filter((medication) => {
    return medication.frequency === "FRECUENCIA_MEDIA";
  });

  const lowFrequencyMedications = medications.filter((medication) => {
    return medication.frequency === "FRECUENCIA_BAJA";
  });

  dailyCount.textContent = dailyFrequencyMedications.length;
  mediumCount.textContent = mediumFrequencyMedications.length;
  lowCount.textContent = lowFrequencyMedications.length;

}

//Función para mostrar la lista de medicinas
function renderMedicationsList() {

  medicationsList.innerHTML = "";

  if (medications.length === 0) {

    medicationsList.innerHTML = `
      <div class="list-group-item text-muted">
        Aún no tienes medicinas registradas.
      </div>
    `;

    return;

  }

  //Ordenar medicinas por hora
  medications.sort((a, b) => {

    if (!a.time) return 1;
    if (!b.time) return -1;

    return a.time.localeCompare(b.time);

  });

  medications.forEach((medication) => {

    const item = document.createElement("div");

    const colorClass = getFrequencyClass(medication.frequency);
    const badgeClass = getBadgeClass(medication.frequency);
    const frequencyText = getFrequencyText(medication.frequency);

    item.className =
      `list-group-item medication-item ${colorClass} d-flex justify-content-between align-items-center`;

    item.innerHTML = `

      <div>

        <h5 class="mb-1 text-primary">
          ${medication.medicine}
        </h5>

        <p class="mb-1">
          ${medication.dailyDose}
        </p>

        <small class="text-muted">
          ${medication.time}
        </small>

		${getMedicationExtraInfo(medication)}

        <div class="mt-2">
          <span class="badge ${badgeClass}">
            ${frequencyText}
          </span>
        </div>
		

      </div>

      ${
        role === "DOCTOR" && canManageMedications
          ? `
            <div class="d-flex gap-2">

              <button
                class="btn btn-outline-primary btn-sm"
                onclick="editMedication(${medication.medication_id})"
              >
                <i class="bi bi-pencil-square"></i>
              </button>

              <button
                class="btn btn-outline-danger btn-sm"
                onclick="deleteMedication(${medication.medication_id})"
              >
                <i class="bi bi-trash"></i>
              </button>

            </div>
          `
          : ""
      }

    `;

    medicationsList.appendChild(item);

  });

}

//Crear o editar medicina
medicationForm.addEventListener("submit", async (event) => {

	event.preventDefault();

	const medicationId = document.getElementById("medicationId").value;

	const medicine = document.getElementById("medicine").value;
	const dailyDose = document.getElementById("dailyDose").value;
	const time = document.getElementById("time").value;
	const frequency = document.getElementById("frequency").value;

	let weekDays = null;
	let specificDate = null;

	if (frequency === "FRECUENCIA_MEDIA") {

	  weekDays = Array.from(document.querySelectorAll(".week-day:checked"))
		.map((checkbox) => checkbox.value)
		.join(",");

	}

	if (frequency === "FRECUENCIA_BAJA") {

	  specificDate = document.getElementById("specificDate").value || null;

	}
	
	const finalPatientId =
	  role === "DOCTOR"
		? doctorPatientSelect.value
		: patientId;

	if (!finalPatientId) {
	  message.className = "alert alert-danger mt-4";
	  message.textContent = "Selecciona un paciente";
	  return;
	}

  try {

    const url = medicationId
      ? `/api/medications/${medicationId}`
      : "/api/medications";

    const method =
      medicationId ? "PUT" : "POST";

    const response = await fetch(url, {

      method,

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        medicine,
        dailyDose,
        time,
        frequency,
		weekDays,
		specificDate,
        patient_id: finalPatientId
      })

    });

    const data = await response.json();

    if (!response.ok) {

      message.className = "alert alert-danger mt-4";
      message.textContent = data.message || "Error al guardar la medicina";
      return;

    }

    message.className = "alert alert-success mt-4";

    if (medicationId) {

      message.textContent = "Medicina actualizada correctamente";

    } else {

      message.textContent = "Medicina creada correctamente";

    }

    medicationForm.reset();

    document.getElementById("medicationId").value = "";

    const modalElement = document.getElementById("medicationModal");
    const modal = bootstrap.Modal.getInstance(modalElement);

    modal.hide();

    await loadMedications();

    renderDashboard();

    renderMedicationsList();

  } catch (error) {

    console.error("Error guardando medicina:", error);

    message.className = "alert alert-danger mt-4";
    message.textContent = "No se ha podido conectar con el servidor";

  }

});

//Editar medicina
function editMedication(id) {

  try {

    const medication = medications.find((medication) => {
      return medication.medication_id === id;
    });

    if (!medication) {

      message.className = "alert alert-danger mt-4";
      message.textContent = "Medicina no encontrada";
      return;

    }

    document.getElementById("medicationId").value =
      medication.medication_id;

    document.getElementById("medicine").value =
      medication.medicine;

    document.getElementById("dailyDose").value =
      medication.dailyDose;

    document.getElementById("time").value =
      medication.time;

    document.getElementById("frequency").value =
      medication.frequency;
	  
	document.getElementById("specificDate").value =
	medication.specificDate || "";

	document.querySelectorAll(".week-day").forEach((checkbox) => {
	checkbox.checked = false;
	});

	if (medication.weekDays) {

	  const selectedDays = medication.weekDays.split(",");

	  document.querySelectorAll(".week-day").forEach((checkbox) => {
		checkbox.checked = selectedDays.includes(checkbox.value);
	  });

	}

	frequencyInput.dispatchEvent(new Event("change"));

    const modalElement = document.getElementById("medicationModal");
    const modal = new bootstrap.Modal(modalElement);

    modal.show();

  } catch (error) {

    console.error("Error editando medicina:", error);

    message.className = "alert alert-danger mt-4";
    message.textContent = "No se ha podido cargar la medicina";

  }

}

//Eliminar medicina
async function deleteMedication(id) {

  medicationIdToDelete = id;

  const deleteModalElement =
    document.getElementById("deleteMedicationModal");

  const deleteModal =
    new bootstrap.Modal(deleteModalElement);

  deleteModal.show();

}

//Confirmar que se quiere eliminar medicina
document
  .getElementById("confirmDeleteMedicationBtn")
  .addEventListener("click", async () => {

    if (!medicationIdToDelete) {

      return;

    }

    try {

      const response = await fetch(`/api/medications/${medicationIdToDelete}`, {

        method: "DELETE"

      });

      const data = await response.json();

      if (!response.ok) {

        message.className = "alert alert-danger mt-4";
        message.textContent = data.message || "Error al eliminar la medicina";
        return;

      }

      const deleteModalElement =
        document.getElementById("deleteMedicationModal");

      const deleteModal =
        bootstrap.Modal.getInstance(deleteModalElement);

      deleteModal.hide();

      medicationIdToDelete = null;

      message.className = "alert alert-success mt-4";
      message.textContent = "Medicina eliminada correctamente";

      await loadMedications();

      renderDashboard();

      renderMedicationsList();

    } catch (error) {

      console.error("Error eliminando medicina:", error);

      message.className = "alert alert-danger mt-4";
      message.textContent = "No se ha podido conectar con el servidor";

    }

  });

//Clase del borde según frecuencia
function getFrequencyClass(frequency) {

  if (frequency === "FRECUENCIA_DIARIA") {
    return "frequency-daily";
  }

  if (frequency === "FRECUENCIA_MEDIA") {
    return "frequency-medium";
  }

  if (frequency === "FRECUENCIA_BAJA") {
    return "frequency-low";
  }

  return "";

}

//Clase del badge según frecuencia
function getBadgeClass(frequency) {

  if (frequency === "FRECUENCIA_DIARIA") {
    return "badge-daily";
  }

  if (frequency === "FRECUENCIA_MEDIA") {
    return "badge-medium";
  }

  if (frequency === "FRECUENCIA_BAJA") {
    return "badge-low";
  }

  return "bg-secondary";

}

//Mostrar días o fecha según frecuencia
function getMedicationExtraInfo(medication) {

  if (medication.frequency === "FRECUENCIA_MEDIA" && medication.weekDays) {

    return `
      <p class="text-muted mt-2 mb-0">
        Días: ${formatWeekDays(medication.weekDays)}
      </p>
    `;

  }

  if (medication.frequency === "FRECUENCIA_BAJA" && medication.specificDate) {

    return `
      <p class="text-muted mt-2 mb-0">
        Fecha: ${medication.specificDate}
      </p>
    `;

  }

  return "";

}

//Formatear días de la semana
function formatWeekDays(days) {

  const daysMap = {
    L: "Lunes",
    M: "Martes",
    X: "Miércoles",
    J: "Jueves",
    V: "Viernes",
	S: "Sábado",
	D: "Domingo"
	
  };

  return days
    .split(",")
    .map((day) => daysMap[day] || day)
    .join(", ");

}

//Texto visible según frecuencia
function getFrequencyText(frequency) {

  if (frequency === "FRECUENCIA_DIARIA") {
    return "Diaria";
  }

  if (frequency === "FRECUENCIA_MEDIA") {
    return "Frecuencia media";
  }

  if (frequency === "FRECUENCIA_BAJA") {
    return "Frecuencia baja o vacuna";
  }

  return "Sin frecuencia";

}

//Función para configurar la página según el rol del usuario
function configurePageByRole() {

  if (role === "DOCTOR") {

    doctorPatientSearchContainer.classList.remove("d-none");

    patientMedicationContent.classList.add("d-none");
    medicationsListContainer.classList.add("d-none");

    medicationSubtitle.textContent =
      "Esta sección web te será muy útil para consultar la medicación de tus pacientes";

  } else {

    openMedicationModalBtn.classList.add("d-none");

    medicationSubtitle.textContent =
      "La agenda de esta sección de la web te será muy útil para organizar tus dosis de medicamentos.";

  }

}