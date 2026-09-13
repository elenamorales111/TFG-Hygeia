const chatForm = document.getElementById("chatForm");

const chatBox = document.getElementById("chatBox");

const userMessageInput = document.getElementById("userMessage");

const message = document.getElementById("message");

const aiDisclaimer = document.getElementById("aiDisclaimer");

const acceptConsentBtn = document.getElementById("acceptConsentBtn");

const denyConsentBtn = document.getElementById("denyConsentBtn");

let aiMedicalConsent = null;

const aiChatHistory = document.getElementById("aiChatHistory");

const historySection = document.getElementById("historySection");

//Ocultar chat antes de comprobar si el paciente ya aceptó o rechazó los términos y condiciones de uso
chatBox.style.display = "none";
chatForm.style.display = "none";
historySection.style.display = "none";

//Obtener el id del paciente guardado en localStorage
const patientId = localStorage.getItem("patient_id");

//Si no hay paciente logueado, se redirige al index
if (!patientId) {

  window.location.href = "/index.html";

}

//Mostrar chat y ocultar banner
function showChat() {

  aiDisclaimer.classList.add("d-none");

  chatBox.style.display = "block";
  chatForm.style.display = "block";

  //Solo mostrar el historial de conversaciones si el paciente acepta el banner
  if (aiMedicalConsent === true) {

    historySection.style.display = "block";
    loadAiChatHistory();

  } else {

    historySection.style.display = "none";

  }

  if (chatBox.innerHTML.trim() === "") {

    addAIMessage(
      "¡Hola!, soy HygeIA, el asistente virtual de Hygeia. ¿En qué puedo ayudarte? :)"
    );

  }

}

//Ocultar chat y mostrar banner
function hideChat() {

  //Mostrar banner
  aiDisclaimer.classList.remove("d-none");

	//Ocultar chat
	chatBox.style.display = "none";
	chatForm.style.display = "none";
	historySection.style.display = "none";

}

//Comprobar si el paciente ha aceptado o rechazado los términos y condiciones de uso alguna vez
loadAiConsent();

async function loadAiConsent() {

  try {

    const response =
      await fetch(`/api/patients/${patientId}/ai-consent`);

    const data = await response.json();

    aiMedicalConsent = data.aiMedicalConsent;

    //Si todavía no ha aceptado ni rechazado, se muestra el banner
    if (aiMedicalConsent === null || aiMedicalConsent === undefined) {

      hideChat();

    } else {

      //Si ya aceptó o rechazó una vez, se muestra el chat directamente
      showChat();

    }

  } catch (error) {

    console.error("Error al cargar consentimiento IA:", error);

    hideChat();

  }

}

//Aceptar términos y condiciones
acceptConsentBtn.addEventListener("click", async () => {

  await saveAiConsent(true);

});

//Rechazar términos y condiciones
denyConsentBtn.addEventListener("click", async () => {

  await saveAiConsent(false);

});


//Enviar mensaje al chat IA
chatForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  //Texto escrito por el usuario
  const userMessage =
    userMessageInput.value.trim();

  //Evitar mensajes vacíos
  if (!userMessage) {

    return;

  }

  //Mostrar mensaje del usuario en pantalla
  addUserMessage(userMessage);

  //Limpiar input
  userMessageInput.value = "";

  try {

    //Enviar mensaje al backend
    const response = await fetch("/api/ai-chat", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        patient_id: patientId,
        message: userMessage,
        useMedicalData: aiMedicalConsent === true

      })

    });

    const data = await response.json();

    //Si ocurre un error
    if (!response.ok) {

      message.className =
        "alert alert-danger mt-4";

      message.textContent =
        data.message || "Error al consultar la IA";

      return;

    }

    //Mostrar respuesta IA
    addAIMessage(data.answer);

    loadAiChatHistory();

  } catch (error) {

    console.error("Error en chat IA:", error);

    message.className =
      "alert alert-danger mt-4";

    message.textContent =
      "No se ha podido conectar con el servidor";

  }

});

//Función para crear los mensajes del usuario
function addUserMessage(text) {

  const div = document.createElement("div");

  div.className = "message-user";

  div.textContent = text;

  chatBox.appendChild(div);

  //Bajar automáticamente el scroll
  chatBox.scrollTop = chatBox.scrollHeight;

}

//Función para crear las respuestas de la IA
function addAIMessage(text) {

  const div = document.createElement("div");

  div.className = "message-ai";

  //Para que los mensajes de respuesta queden mejor formateados
  div.innerHTML = formatAIMessage(text);

  function formatAIMessage(text) {

    return text

      //Poner en negrita lo que esté entre *
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

      //Párrafos separados
      .replace(/\n/g, "<br><br>")

      //Puntos de una lista
      .replace(/\* /gm, "• ");

  }

  chatBox.appendChild(div);

  //Bajar automáticamente el scroll
  chatBox.scrollTop = chatBox.scrollHeight;

}

//Cargar historial del chat del paciente con la IA
async function loadAiChatHistory() {

  try {

    aiChatHistory.innerHTML = "";

    const response =
      await fetch(`/api/patients/${patientId}/ai-chat-history`);

    const data = await response.json();

    if (!response.ok) {
      return;
    }

    const questions = data.questions || [];

    if (questions.length === 0) {

      aiChatHistory.innerHTML = `
        <div class="list-group-item text-muted">
          Todavía no hay conversaciones guardadas.
        </div>
      `;

      return;

    }

    questions.forEach((question) => {

      const item = document.createElement("div");

      item.className = "list-group-item";

      const conversationDate = new Date(question.createdAt);

      item.innerHTML = `
        <small class="text-muted d-block mb-2">
          ${conversationDate.toLocaleString("es-ES")}
        </small>

        <p class="mb-2">
          <strong>Tú:</strong> ${question.text}
        </p>

        <p class="mb-1">
          <strong>HygeIA:</strong> ${question.answer
		  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
		  .replace(/\*\s+/g, "")}
        </p>
      `;

      aiChatHistory.appendChild(item);

    });

  } catch (error) {

    console.error("Error cargando historial del chat IA:", error);

  }

}

//Guardar consentimiento IA del paciente
async function saveAiConsent(value) {

  try {

    const response =
      await fetch(`/api/patients/${patientId}/ai-consent`, {

        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          aiMedicalConsent: value
        })

      });

    const data = await response.json();

    if (!response.ok) {

      message.className = "alert alert-danger mt-4";

      message.textContent =
        data.message || "Error guardando consentimiento";

      return;

    }

    //Guardar la decisión del paciente en memoria
    aiMedicalConsent = value;

    //Una vez aceptado o rechazado, se oculta el banner y se muestra el chat
    showChat();

  } catch (error) {

    console.error("Error guardando consentimiento IA:", error);

  }

}