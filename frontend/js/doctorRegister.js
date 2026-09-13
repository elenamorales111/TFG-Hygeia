//Obtener formulario de register y contenedor de correcto/error del HTML
const doctorRegisterForm = document.getElementById("doctorRegisterForm");
const message = document.getElementById("message");

//Registro de médico
doctorRegisterForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  const name = document.getElementById("name").value;
  const surnames = document.getElementById("surnames").value;
  const dni = document.getElementById("dni").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const speciality = document.getElementById("speciality").value;
  const medicalCenter = document.getElementById("medicalCenter").value;
  
  //Registro de horarios del médico
  const days = ["L", "M", "X", "J", "V", "S", "D"];

	const schedules = [];

	days.forEach((day) => {

	  if (document.getElementById(day).checked) {

		schedules.push({
		  dayOfWeek: day,
		  startTime: document.getElementById(`${day}_start`).value,
		  endTime: document.getElementById(`${day}_end`).value
		});

	  }

	});
	
	//Comprobar que el médico ha seleccionado al menos un día de trabajo
		if (schedules.length === 0) {

		  message.className = "alert alert-danger mt-4";
		  message.textContent = "Debes seleccionar al menos un día de trabajo";

		  return;
		}

  try {

    const response = await fetch("/api/doctor-register", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        name,
        surnames,
        dni,
        email,
        password,
        speciality,
        medicalCenter,
		schedules
      })

    });

    const data = await response.json();

    if (!response.ok) {

      message.className = "alert alert-danger mt-4";
      message.textContent =
        data.message || "Error al registrar médico";
      return;

    }

    localStorage.clear();

    localStorage.setItem("doctor_id", data.doctor_id);
    localStorage.setItem("humanDoctor_id", data.humanDoctor_id);
    localStorage.setItem("doctor_name", data.name);
    localStorage.setItem("doctor_email", data.email);
    localStorage.setItem("role", data.role);
    localStorage.setItem("isLoggedIn", "true");

    message.className = "alert alert-success mt-4";
    message.textContent = "Registro correcto. Redirigiendo a la pantalla de inicio ...";

    setTimeout(() => {

      window.location.href = "/home.html";

    }, 1200);

  } catch (error) {

    console.error("Error en registro médico:", error);

    message.className = "alert alert-danger mt-4";
    message.textContent =
      "No se ha podido conectar con el servidor";

  }

});
