//Comprobar si el paciente tiene ya una sesión iniciada
const authenticationPatientId = localStorage.getItem("patient_id");
const authenticationDoctorId = localStorage.getItem("doctor_id");

//Si no hay sesión iniciada, volver a index
if (!authenticationPatientId && !authenticationDoctorId) {

  window.location.href = "/index.html";

}