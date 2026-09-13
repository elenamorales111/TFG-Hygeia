//Obtener formulario de login y contenedor de correcto/error del HTML
const doctorLoginForm = document.getElementById("doctorLoginForm");
const message = document.getElementById("message");

doctorLoginForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
	  
    const response = await fetch("/api/doctor-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {

      message.className = "alert alert-danger mt-4";
      message.textContent = data.message || "Error al iniciar sesión";
      return;

    }

	//Limpiar sesiones anteriores
	localStorage.clear();

	//Guardar datos del médico logueado
	localStorage.setItem("doctor_id", data.doctor_id);
	localStorage.setItem("humanDoctor_id", data.humanDoctor_id);
	localStorage.setItem("doctor_name", data.name);
	localStorage.setItem("doctor_surnames", data.surnames);
	localStorage.setItem("doctor_email", data.email);
	localStorage.setItem("role", data.role);
	localStorage.setItem("isLoggedIn", "true");

    message.className = "alert alert-success mt-4";
    message.textContent = "Login correcto. Redirigiendo a la pantalla de inicio ...";

    setTimeout(() => {
      window.location.href = "/home.html";
    }, 1000);

  } catch (error) {

    console.error("Error en login:", error);

    message.className = "alert alert-danger mt-4";
    message.textContent = "No se ha podido conectar con el servidor";

  }

});