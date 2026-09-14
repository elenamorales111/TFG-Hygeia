//Obtener formulario de register y contenedor de correcto/error del HTML
const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");

//Escucha cuando el usuario envía el formulario
registerForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  const role = "PATIENT";
  const name = document.getElementById("name").value;
  const surnames = document.getElementById("surnames").value;
  const dateOfBirth = document.getElementById("dateOfBirth").value;
  const dni = document.getElementById("dni").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const phoneNumber = document.getElementById("phoneNumber").value;
  const address = document.getElementById("address").value || null;
  const postalCode = document.getElementById("postalCode").value || null;
  const province = document.getElementById("province").value;

  try {

    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
		role,
        name,
        surnames,
        dateOfBirth,
        dni,
        email,
        password,
        phoneNumber,
        address,
        postalCode,
        province
      })
    });

	const data = await response.json();

	if (!response.ok) {

	  message.className = "alert alert-danger mt-4";
	  message.textContent = data.message || "Error al registrar paciente";
	  return;

	}

	/*Limpiar todo lo de las sesiones de los pacientes anteriores menos el
	consentimiento de HygeIA*/
	localStorage.removeItem("patient_id");
	localStorage.removeItem("doctor_id");
	localStorage.removeItem("role");
	localStorage.removeItem("patient_name");
	localStorage.removeItem("patient_email");
	localStorage.removeItem("doctor_name");
	localStorage.removeItem("doctor_email");
	localStorage.removeItem("isLoggedIn");


	message.className = "alert alert-success mt-4";
	message.textContent = "Registro correcto. Redirigiendo al inicio de sesión ...";

	setTimeout(() => {
	  window.location.href = "/frontend/pages/login.html";
	}, 1200);

	  } catch (error) {

		console.error("Error en register:", error);

		message.className = "alert alert-danger mt-4";
		message.textContent = "No se ha podido conectar con el servidor";

	  }
});
