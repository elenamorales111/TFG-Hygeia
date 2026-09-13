const message = document.getElementById("message");

const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const logoutBtn = document.getElementById("logoutBtn");

const role = localStorage.getItem("role");

const patientId = localStorage.getItem("patient_id");
const doctorId = localStorage.getItem("doctor_id");

const patientFields = document.getElementById("patientFields");
const doctorFields = document.getElementById("doctorFields");
const DoctorTimetableFields = document.getElementById("DoctorTimetableFields");

const nameInput = document.getElementById("name");
const surnamesInput = document.getElementById("surnames");
const dateOfBirthInput = document.getElementById("dateOfBirth");
const dniInput = document.getElementById("dni");
const emailInput = document.getElementById("email");
const phoneNumberInput = document.getElementById("phoneNumber");
const addressInput = document.getElementById("address");
const postalCodeInput = document.getElementById("postalCode");
const provinceInput = document.getElementById("province");

let medicalRecordId = null;

const medicalRecordFields = document.getElementById("medicalRecordFields");
const illnessInput = document.getElementById("illness");
const statusInput = document.getElementById("status");
const medicalHistoryInput = document.getElementById("medicalHistory");
const bloodTypeInput = document.getElementById("bloodType");
const allergiesInput = document.getElementById("allergies");
const medicationInput = document.getElementById("medication");
const healthInsuranceInput = document.getElementById("healthInsurance");
const familyDoctorInput = document.getElementById("familyDoctor");

let doctors = [];

//Si entra un doctor se le ocultan los campos del paciente y su historial médico
if (role === "DOCTOR") {

  patientFields.classList.add("d-none");
  doctorFields.classList.remove("d-none");
  DoctorTimetableFields.classList.remove("d-none");
  medicalRecordFields.classList.add("d-none");

}

// Obtener datos del usuario al cargar la página
window.addEventListener("DOMContentLoaded", async () => {

  try {

	let response;

	if (role === "DOCTOR") {

	  response = await fetch(
		`/api/doctors/${doctorId}`
	  );

	} else {

	  response = await fetch(
		`/api/patients/${patientId}`
	  );

	}

	const data = await response.json();

	if (!response.ok) {

	  message.className = "alert alert-danger mt-4";
	  message.textContent =
		data.message || "Error al cargar usuario";
	  return;

	}

	const user =
	  role === "DOCTOR"
		? data.doctor
		: data.patient;

	// Rellenar formulario
	nameInput.value = user.name || "";
	surnamesInput.value = user.surnames || "";
	dniInput.value = user.dni || "";
	emailInput.value = user.email || "";

	if (role === "DOCTOR") {

	  document.getElementById("speciality").value =
		user.speciality || "";

	  document.getElementById("medicalCenter").value =
		user.medicalCenter || "";
		
		await loadDoctorTimetables();

	} else {

	  dateOfBirthInput.value =
		user.dateOfBirth || "";

	  phoneNumberInput.value =
		user.phoneNumber || "";

	  addressInput.value =
		user.address || "";

	  postalCodeInput.value =
		user.postalCode || "";

	  provinceInput.value =
		user.province || "";
		
	await loadDoctors();
	
	const medicalRecordResponse =
	  await fetch(
		`/api/patients/${patientId}/medical-record`
	  );

	if (medicalRecordResponse.ok) {

		  const medicalRecordData =
			await medicalRecordResponse.json();

		  const medicalRecord =
			medicalRecordData.medicalRecord;
			
			medicalRecordId = medicalRecord.medicalRecord_id;

		illnessInput.value = medicalRecord.illness || "";
		statusInput.value = medicalRecord.status || "";
		medicalHistoryInput.value = medicalRecord.medicalHistory || "";
		bloodTypeInput.value = medicalRecord.bloodType || "";
		allergiesInput.value = medicalRecord.allergies || "";
		medicationInput.value = medicalRecord.medication || "";
		healthInsuranceInput.value = medicalRecord.healthInsurance || "";
		familyDoctorInput.value = medicalRecord.familyDoctor_id || "";

	}

	}
	
	} catch (error) {

  console.error("Error cargando usuario:", error);

  message.className = "alert alert-danger mt-4";
  message.textContent =
    "No se ha podido conectar con el servidor";

}

});

//Editar
editBtn.addEventListener("click", () => {

  //Parámetros de datos del paciente
  nameInput.disabled = false;
  surnamesInput.disabled = false;
  dateOfBirthInput.disabled = false;
  dniInput.disabled = false;
  emailInput.disabled = false;
  phoneNumberInput.disabled = false;
  addressInput.disabled = false;
  postalCodeInput.disabled = false;
  provinceInput.disabled = false;
  
  //Parámetros del historial médico del paciente (El médico no puede editarlos)
	if (role !== "DOCTOR") {

	  illnessInput.disabled = false;
	  statusInput.disabled = false;
	  medicalHistoryInput.disabled = false;
	  bloodTypeInput.disabled = false;
	  allergiesInput.disabled = false;
	  medicationInput.disabled = false;
	  healthInsuranceInput.disabled = false;
	  familyDoctorInput.disabled = false;

	}
  
  if (role === "DOCTOR") {

  document.getElementById("speciality").disabled = false;

  document.getElementById("medicalCenter").disabled = false;
  
  enableDoctorTimetableFields(false);

	}

  editBtn.classList.add("d-none");
  saveBtn.classList.remove("d-none");

});

//Cargar doctores de la base de datos
async function loadDoctors() {

  try {

    const response = await fetch("/api/human-doctors");
    const data = await response.json();

    if (!response.ok) {
      return;
    }

    doctors = data.humanDoctors || [];

    familyDoctorInput.innerHTML = `
      <option value="">Selecciona un médico</option>
    `;

	doctors
	  .filter((doctor) => {
		return doctor.speciality
		  ?.toLowerCase()
		  .includes("cabecera");
	  })
	  .forEach((doctor) => {

		const doctorBase = doctor.Doctor || doctor.doctor;

		familyDoctorInput.innerHTML += `
		  <option value="${doctor.doctor_id}">
			${doctorBase.name} ${doctor.surnames} - ${doctor.speciality}
		  </option>
		`;

	  });

  } catch (error) {

    console.error("Error cargando médicos:", error);

  }

}

//Guardar cambios
saveBtn.addEventListener("click", async () => {

  try {

		let response;

	if (role === "DOCTOR") {

	  response = await fetch(`/api/doctors/${doctorId}`, {

		method: "PUT",

		headers: {
		  "Content-Type": "application/json"
		},

		body: JSON.stringify({
		  name: nameInput.value,
		  surnames: surnamesInput.value,
		  dni: dniInput.value,
		  email: emailInput.value,
		  speciality: document.getElementById("speciality").value,
		  medicalCenter: document.getElementById("medicalCenter").value
		})

	  });
	  
	  await saveDoctorTimetables();

	} else {

	  response = await fetch(`/api/patients/${patientId}`, {

		method: "PUT",

		headers: {
		  "Content-Type": "application/json"
		},

		body: JSON.stringify({
		  name: nameInput.value,
		  surnames: surnamesInput.value,
		  dateOfBirth: dateOfBirthInput.value,
		  dni: dniInput.value,
		  email: emailInput.value,
		  phoneNumber: phoneNumberInput.value,
		  address: addressInput.value,
		  postalCode: postalCodeInput.value,
		  province: provinceInput.value
		})

	  });
	  
	  const selectedDoctor = doctors.find((doctor) => {
		  return String(doctor.doctor_id) === String(familyDoctorInput.value);
		});

		const doctorBase =
		  selectedDoctor?.Doctor || selectedDoctor?.doctor;

		const familyDoctorName = selectedDoctor
		  ? `${doctorBase.name} ${selectedDoctor.surnames}`
		  : "";
	  
		const medicalRecordBody = {
		  illness: illnessInput.value || "No especificado",
		  status: statusInput.value || "No especificado",
		  medicalHistory: medicalHistoryInput.value,
		  bloodType: bloodTypeInput.value,
		  allergies: allergiesInput.value,
		  medication: medicationInput.value,
		  healthInsurance: healthInsuranceInput.value,
		  familyDoctor: familyDoctorName,
		familyDoctor_id: familyDoctorInput.value || null,
		  patient_id: patientId
		};

		if (medicalRecordId) {

		  await fetch(`/api/medical-records/${medicalRecordId}`, {
			method: "PUT",
			headers: {
			  "Content-Type": "application/json"
			},
			body: JSON.stringify(medicalRecordBody)
		  });

		} else {

		  const medicalRecordResponse = await fetch("/api/medical-records", {
			method: "POST",
			headers: {
			  "Content-Type": "application/json"
			},
			body: JSON.stringify(medicalRecordBody)
		  });

		  const medicalRecordData = await medicalRecordResponse.json();

		  if (medicalRecordResponse.ok) {
			medicalRecordId = medicalRecordData.medicalRecord.medicalRecord_id;
		  }

		}

	}

    const data = await response.json();

    if (!response.ok) {

      message.className = "alert alert-danger mt-4";
      message.textContent = data.message || "Error actualizando paciente";
      return;

    }

    //Volver a bloquear inputs
    nameInput.disabled = true;
    surnamesInput.disabled = true;
    dateOfBirthInput.disabled = true;
    dniInput.disabled = true;
    emailInput.disabled = true;
    phoneNumberInput.disabled = true;
    addressInput.disabled = true;
    postalCodeInput.disabled = true;
    provinceInput.disabled = true;
	
	illnessInput.disabled = true;
	statusInput.disabled = true;
	medicalHistoryInput.disabled = true;
	bloodTypeInput.disabled = true;
	allergiesInput.disabled = true;
	medicationInput.disabled = true;
	healthInsuranceInput.disabled = true;
	familyDoctorInput.disabled = true;

    editBtn.classList.remove("d-none");
    saveBtn.classList.add("d-none");


	//Actualizar localStorage
	if (role === "DOCTOR") {

	  localStorage.setItem(
	  "doctor_name",
	  data.doctor.surnames
	);

	  localStorage.setItem(
		"doctor_email",
		data.doctor.email
	  );

	} else {

	  localStorage.setItem(
		"patient_name",
		data.patient.name
	  );

	  localStorage.setItem(
		"patient_email",
		data.patient.email
	  );

	}

    message.className = "alert alert-success mt-4";
    message.textContent = "Datos actualizados correctamente";

  } catch (error) {

    console.error("Error actualizando usuario:", error);

    message.className = "alert alert-danger mt-4";
    message.textContent = "No se ha podido conectar con el servidor";

  }

});

//Liberar campos del horario del doctor
function enableDoctorTimetableFields(disabled) {

  const days = ["L", "M", "X", "J", "V", "S", "D"];

  days.forEach((day) => {

    document.getElementById(`${day}_schedule`).disabled = disabled;
    document.getElementById(`${day}_start`).disabled = disabled;
    document.getElementById(`${day}_end`).disabled = disabled;

  });

}

async function loadDoctorTimetables() {

  const response =
    await fetch(`/api/doctors/${doctorId}/schedules`);

  const data =
    await response.json();

  const schedules =
    data.schedules || [];

  schedules.forEach((schedule) => {

    const day = schedule.dayOfWeek;

    document.getElementById(`${day}_schedule`).checked = true;
    document.getElementById(`${day}_start`).value =
      schedule.startTime.substring(0, 5);
    document.getElementById(`${day}_end`).value =
      schedule.endTime.substring(0, 5);

  });

}

async function saveDoctorTimetables() {

  const days = ["L", "M", "X", "J", "V", "S", "D"];

  const schedules = [];

  days.forEach((day) => {

    if (document.getElementById(`${day}_schedule`).checked) {

      schedules.push({
        dayOfWeek: day,
        startTime: document.getElementById(`${day}_start`).value,
        endTime: document.getElementById(`${day}_end`).value
      });

    }

  });

  await fetch(`/api/doctors/${doctorId}/schedules`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      schedules
    })
  });

}

//Cerrar sesión
if (logoutBtn) {

  logoutBtn.addEventListener("click", () => {

    localStorage.removeItem("patient_id");
    localStorage.removeItem("doctor_id");
    localStorage.removeItem("role");
    localStorage.removeItem("patient_name");
    localStorage.removeItem("patient_email");
    localStorage.removeItem("doctor_name");
    localStorage.removeItem("doctor_email");

    window.location.href = "/index.html";

  });

}