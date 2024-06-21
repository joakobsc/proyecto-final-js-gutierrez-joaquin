document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const resultadoDeBusqueda = document.getElementById("resultadoDeBusqueda");
    const modal = document.getElementById("modal");
    const closeModal = document.getElementsByClassName("close")[0];
    const turnoForm = document.getElementById("turnoForm");
    const nombrePacienteInput = document.getElementById("nombrePaciente");
    const obraSocialInput = document.getElementById("obraSocial");
    const medicoNombreInput = document.getElementById("medicoNombre");

    class Medico {
        constructor(nombre, especialidad, turnos) {
            this.nombre = nombre;
            this.especialidad = especialidad;
            this.turnos = turnos;
        }
    }

    const lista = [
        new Medico("JUAN", "CARDIOLOGIA", "LUNES"),
        new Medico("GUSTAVO", "NEUROLOGIA", "LUNES"),
        new Medico("ANA", "CLINICA MÉDICA", "MARTES"),
        new Medico("EMANUEL", "PEDIATRIA", "VIERNES"),
        new Medico("SANDRA", "CARDIOLOGIA", "SABADO"),
        new Medico("JOAQUIN", "TRAUMATOLOGIA", "DOMINGO"),
        new Medico("MAXIMILIANO", "ENDOCRINOLOGIA", "MIERCOLES")
    ];

    const buscarMedico = ingreso => {
        resultadoDeBusqueda.innerHTML = "";
         searchInput.value = "";
        if (!ingreso.trim()) return;

        const resultados = lista.filter(({ nombre, especialidad }) =>
            [nombre, especialidad].some(field =>
                field.toLowerCase().includes(ingreso.toLowerCase())
            )
        );

        mostrarResultados(resultados);
    };

    const mostrarResultados = resultados => {
        resultadoDeBusqueda.innerHTML = resultados.length > 0
            ? resultados.map(medico => `
                <div class="card">
                    <p><strong>Nombre:</strong> ${medico.nombre}</p>
                    <p><strong>Especialidad:</strong> ${medico.especialidad}</p>
                    <p><strong>Turnos:</strong> ${medico.turnos}</p>
                    <button onclick="abrirModal('${medico.nombre}')">Sacar Turno</button>
                </div>
            `).join('')
            : "<p>No se encontraron resultados relacionados, intente nuevamente...</p>";
    };

    searchButton.addEventListener("click", () => buscarMedico(searchInput.value));
    searchInput.addEventListener("keyup", event => {
        if (event.key === "Enter") {
            buscarMedico(searchInput.value);
        }
    });

    window.abrirModal = nombreMedico => {
        medicoNombreInput.value = nombreMedico;
        modal.style.display = "block";
    };

    closeModal.onclick = () => modal.style.display = "none";

    window.onclick = event => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    turnoForm.addEventListener("submit", e => {
        e.preventDefault();

        if (!nombrePacienteInput.value.trim() || !obraSocialInput.value.trim()) {
            alert("Por favor, complete todos los campos del formulario.");
            return;
        }

        const medicoSeleccionado = lista.find(medico => medico.nombre === medicoNombreInput.value);
        if (!medicoSeleccionado) {
            alert("Médico no encontrado.");
            return;
        }

        const turnoConfirmado = {
            nombreMedico: medicoSeleccionado.nombre,
            especialidad: medicoSeleccionado.especialidad,
            turnos: medicoSeleccionado.turnos,
            nombreUsuario: nombrePacienteInput.value,
            obraSocial: obraSocialInput.value,
            fecha: new Date().toLocaleDateString()
        };

        localStorage.setItem("ultimoTurno", JSON.stringify(turnoConfirmado));
        mostrarPopupTurnoConfirmado(turnoConfirmado);
        turnoForm.reset();
        modal.style.display = "none";
    });

    const mostrarPopupTurnoConfirmado = turnoConfirmado => {
        resultadoDeBusqueda.innerHTML = ""; // Limpiar resultados de búsqueda si hubiera
        const popupContainer = document.createElement("div");
        popupContainer.className = "popup-container";
        popupContainer.innerHTML = `
            <div class="popup">
                <h2>Detalles del Turno Confirmado</h2>
                <p><strong>Paciente:</strong> ${turnoConfirmado.nombreUsuario}</p>
                <p><strong>Médico:</strong> Dr./Dra. ${turnoConfirmado.nombreMedico}</p>
                <p><strong>Especialidad:</strong> ${turnoConfirmado.especialidad}</p>
                <p><strong>Día:</strong> ${turnoConfirmado.turnos}</p>
                <p><strong>Obra Social:</strong> ${turnoConfirmado.obraSocial}</p>
                <p><strong>Fecha de Confirmación:</strong> ${turnoConfirmado.fecha}</p>
                <button onclick="cerrarPopup()">Cerrar</button>
            </div>
        `;
        document.body.appendChild(popupContainer);
    };

    window.cerrarPopup = () => {
        const popupContainer = document.querySelector(".popup-container");
        if (popupContainer) {
            popupContainer.remove();
        }
    };

    // Verificar si la lista de médicos está en localStorage y guardarla si no está
    if (!localStorage.getItem('medicos')) {
        localStorage.setItem('medicos', JSON.stringify(lista));
    }
});
