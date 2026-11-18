/* CSF Agencia de Futbolistas · menú móvil, cabecera y formulario de contacto */
(function () {
  "use strict";

  /* --- Menú móvil -------------------------------------------------------- */
  var botonMenu = document.querySelector(".boton-menu");
  var menu = document.getElementById("menu");
  if (botonMenu && menu) {
    var cerrar = function () {
      menu.classList.remove("abierto");
      botonMenu.setAttribute("aria-expanded", "false");
    };
    botonMenu.addEventListener("click", function () {
      var abierto = menu.classList.toggle("abierto");
      botonMenu.setAttribute("aria-expanded", abierto ? "true" : "false");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) cerrar();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") cerrar();
    });
  }

  /* --- Sombra de la cabecera al hacer scroll ------------------------------ */
  var cabecera = document.getElementById("cabecera");
  if (cabecera) {
    var marcar = function () { cabecera.classList.toggle("con-sombra", window.scrollY > 8); };
    marcar();
    window.addEventListener("scroll", marcar, { passive: true });
  }

  /* --- Formulario ----------------------------------------------------------- */
  var form = document.getElementById("formulario");
  if (!form) return;

  var inicio = Date.now();
  var aviso = document.getElementById("aviso-form");
  var selectInteres = form.querySelector('[name="interes"]');

  // Los enlaces con data-interes preseleccionan el motivo del formulario
  document.querySelectorAll("[data-interes]").forEach(function (enlace) {
    enlace.addEventListener("click", function () {
      var valor = enlace.getAttribute("data-interes");
      if (selectInteres && selectInteres.querySelector('option[value="' + valor + '"]')) {
        selectInteres.value = valor;
      }
    });
  });

  function mostrar(texto, esError) {
    aviso.textContent = texto;
    aviso.classList.toggle("error", !!esError);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    mostrar("");

    var nombre = form.nombre.value.trim();
    var telefono = form.telefono.value.trim();
    var email = form.email.value.trim();

    if (!nombre || !telefono || !email) {
      mostrar("Rellena tu nombre, teléfono y email.", true);
      (!nombre ? form.nombre : !telefono ? form.telefono : form.email).focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      mostrar("Revisa el email: parece que no es correcto.", true);
      form.email.focus();
      return;
    }
    if (telefono.replace(/\D/g, "").length < 9) {
      mostrar("Revisa el teléfono: necesitamos al menos 9 cifras.", true);
      form.telefono.focus();
      return;
    }
    if (!form.privacidad.checked) {
      mostrar("Para enviar el formulario tienes que aceptar la política de privacidad.", true);
      form.privacidad.focus();
      return;
    }

    // Antispam sin cookies: los robots que no ejecutan JavaScript no rellenan este campo
    form.comprobacion.value = "csf-" + Math.round((Date.now() - inicio) / 1000);

    var boton = form.querySelector('button[type="submit"]');
    var gracias = form.getAttribute("data-gracias") || "/gracias/";
    boton.disabled = true;

    // Vista previa sin PHP (GitHub Pages): no se envía nada, solo se muestra el recorrido
    if (form.hasAttribute("data-demo")) {
      boton.textContent = "Enviando…";
      window.setTimeout(function () { window.location.href = gracias; }, 500);
      return;
    }
    boton.textContent = "Enviando…";

    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(function (r) {
        return r.json().catch(function () { return { ok: false }; });
      })
      .then(function (datos) {
        if (datos && datos.ok) {
          window.location.href = gracias;
          return;
        }
        throw new Error((datos && datos.error) || "error");
      })
      .catch(function (err) {
        var texto = err && err.message && err.message !== "error" && err.message !== "Failed to fetch"
          ? err.message
          : "No hemos podido enviar el formulario. Llámanos o escríbenos por WhatsApp al 689 751 515.";
        mostrar(texto, true);
        boton.disabled = false;
        boton.textContent = "Enviar";
      });
  });
})();
