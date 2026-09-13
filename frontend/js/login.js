//Obtener formulario de login y contenedor de correcto/error del HTML
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

//Escucha cuando el usuario envía el formulario
loginForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  /*Obtener valores de email y contraseña de los contenedores
  con ese id del HTML*/
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {

    //Enviar datos al backend
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    //Esperar respuesta del backend
    const data = await response.json();

    if (!response.ok) {

      message.className = "alert alert-danger mt-4";
      message.textContent = data.message || "Error al iniciar sesión";
      return;

    }

	//Limpiar sesiones anteriores
	localStorage.clear();

	//Guardar datos del paciente logueado
	localStorage.setItem("patient_id", data.patient_id);
	localStorage.setItem("role", data.role);
	localStorage.setItem("patient_name", data.name);
	localStorage.setItem("patient_email", data.email);
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

//Si el usuario desea loggearse como doctor
const goDoctorLogin = document.getElementById("goDoctorLogin");

if (goDoctorLogin) {

  goDoctorLogin.addEventListener("click", () => {

    window.location.href =
      "/frontend/pages/doctorLogin.html";

  });

}