function mostrarRegistro() {
  document.getElementById("formLogin").classList.remove("activo");

  document.getElementById("formRegistro").classList.add("activo");
}

function mostrarLogin() {
  document.getElementById("formRegistro").classList.remove("activo");

  document.getElementById("formLogin").classList.add("activo");
}

function mostrarPassword(id, boton) {
  const input = document.getElementById(id);
  const icono = boton.querySelector("i");

  if (input.type === "password") {
    input.type = "text";

    icono.classList.remove("fa-eye");
    icono.classList.add("fa-eye-slash");
  } else {
    input.type = "password";

    icono.classList.remove("fa-eye-slash");
    icono.classList.add("fa-eye");
  }
}

const parametros = new URLSearchParams(window.location.search);

if (parametros.get("registro") === "true") {
  mostrarRegistro();
}
