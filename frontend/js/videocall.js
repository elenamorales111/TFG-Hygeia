const params = new URLSearchParams(window.location.search);

const videocall = params.get("room");
const patientName = params.get("patient") || localStorage.getItem("patient_name") || "Paciente Hygeia";
const doctorName = params.get("doctor") || localStorage.getItem("doctor_name") || "Médico Hygeia";
const role = params.get("role") || localStorage.getItem("role");

const jitsiContainer = document.getElementById("jitsi-container");

const videocallMessage = document.getElementById("videocallMessage");

if (videocallMessage) {

  if (role === "DOCTOR") {

    videocallMessage.textContent =
      "Espera a que tu paciente se conecte para realizar una consulta médica";

  } else {

    videocallMessage.textContent =
      "Espera a que tu médico se conecte para realizar una consulta médica";

  }

}

//Comprobar si existe una sala
if (!videocall) {

  alert("No se ha encontrado la sala de videollamada");

  window.location.href = "/home.html";

}

//Obtener nombre del usuario
let userName = "Usuario Hygeia";

if (role === "DOCTOR") {

  userName = doctorName;

} else {

  userName = patientName;

}

const meetingTitle =
  `Hygeia Videocall: ${patientName} - ${doctorName}`;

try {

  //Crear videollamada con Jitsi
  const api = new JitsiMeetExternalAPI("meet.jit.si", {

    //Jitsi Meet espera el parámetro roomName
    roomName: videocall,

    parentNode: jitsiContainer,

    width: "100%",

    height: "100%",

    userInfo: {
      displayName: userName
    },
	
	/*Configurar parámetros de Jitsi para que tanto paciente como médico
	puedan entrar directamente a la videollamada sin tener que iniciar sesión
	en Jitsi Meet*/
	
	configOverwrite: {

	  prejoinPageEnabled: false,

	  subject: meetingTitle

	},

	interfaceConfigOverwrite: {

	  SHOW_JITSI_WATERMARK: false,
	  SHOW_WATERMARK_FOR_GUESTS: false

	}

  });

} catch (error) {

  console.error("Error al iniciar la videollamada:", error);

  alert("No ha sido posible iniciar la videollamada");

  window.location.href = "/home.html";

}























