const currentRole = localStorage.getItem("role");

if (currentRole === "DOCTOR") {

  document.querySelectorAll(".only-visible-for-patient")
    .forEach((element) => {

      element.classList.add("d-none");

    });

}