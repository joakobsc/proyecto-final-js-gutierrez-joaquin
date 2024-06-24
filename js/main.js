document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const resultadoDeBusqueda = document.getElementById("resultadoDeBusqueda");
    const modal = document.getElementById("modal");
    const closeModal = document.getElementsByClassName("close")[0];
    const turnoForm = document.getElementById("turnoForm");
    const nombrePacienteInput = document.getElementById("nombrePaciente");
    const obraSocialInput = document.getElementById("obraSocial");
    const fechaTurnoInput = document.getElementById("fechaTurno");
    const medicoNombreInput = document.getElementById("medicoNombre");
    const ahora = new Date();

    // Obtener turnos guardados desde localStorage o inicializar una lista vacía si no existen
    let turnosGuardados = localStorage.getItem("turnos") || "[]";
    if (turnosGuardados === "[]") localStorage.setItem("turnos", JSON.stringify([]));
    let listaDeTurnos = JSON.parse(turnosGuardados);

    class Medico {
        constructor(nombre, especialidad, turnos) {
            this.nombre = nombre;
            this.especialidad = especialidad;
            this.turnos = turnos;
        }
    }


    let listaMedicos = [];

    // Cargar médicos desde medicos.json usando fetch
    fetch('json/medicos.json')
        .then(response => response.json())
        .then(data => {
            listaMedicos = data.map(medico => new Medico(medico.nombre, medico.especialidad, medico.turnos));
            console.log('Lista de médicos cargada:', listaMedicos);


            searchButton.addEventListener("click", () => {
                const ingreso = searchInput.value.trim().toLowerCase();
                buscarMedico(ingreso);
            });


            searchInput.addEventListener("keyup", event => {
                if (event.key === "Enter") {
                    const ingreso = searchInput.value.trim().toLowerCase();
                    buscarMedico(ingreso);
                }
            });
        })
        .catch(error => console.error('Error al cargar médicos desde medicos.json:', error));

    // Función para buscar médicos según el ingreso del usuario
    const buscarMedico = ingreso => {
        resultadoDeBusqueda.innerHTML = "";
        if (!ingreso) return;

        const resultados = listaMedicos.filter(medico =>
            medico.nombre.toLowerCase().includes(ingreso) ||
            medico.especialidad.toLowerCase().includes(ingreso)
        );

        mostrarResultados(resultados);
    };

    // Función para mostrar resultados de búsqueda en la página
    const mostrarResultados = resultados => {
        resultados.length > 0
            ? resultadoDeBusqueda.innerHTML = resultados.map(medico => `
                <div class="card">
                    <p><strong>Nombre:</strong> ${medico.nombre}</p>
                    <p><strong>Especialidad:</strong> ${medico.especialidad}</p>
                    <p><strong>Turnos:</strong> ${medico.turnos.join(', ')}</p>
                    <button onclick="abrirModal('${medico.nombre}')">Sacar Turno</button>
                </div>
            `).join('')
            : (resultadoDeBusqueda.innerHTML = '', Swal.fire({
                icon: 'warning',
                title: 'No hay coincidencias con su busqueda',
                text: 'intente nuevamente.'
            }));
    };
    
    // Función para abrir el modal de reserva de turno
    window.abrirModal = nombreMedico => {
        medicoNombreInput.value = nombreMedico;
        modal.style.display = "block";
    };

    // Función para cerrar el modal
    closeModal.onclick = () => modal.style.display = "none";

    // Cerrar el modal si se hace clic fuera de él
    window.onclick = event => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    // Guardar y mostrar el turno confirmado
    const guardarTurnoConfirmado = turnoConfirmado => {
        listaDeTurnos.push(turnoConfirmado);
        localStorage.setItem("turnos", JSON.stringify(listaDeTurnos));
        mostrarPopupTurnoConfirmado(turnoConfirmado);
    };

    // Función para obtener el día de la semana
    const obtenerDiaSemana = fecha => {
        const dias = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];
        return dias[fecha.getDay()];
    };

    // Formulario de turno
    turnoForm.addEventListener("submit", e => {
        e.preventDefault();
    
        const nombrePaciente = nombrePacienteInput.value.trim();
        const obraSocial = obraSocialInput.value.trim();
        const fechaTurno = fechaTurnoInput.value.trim();
    
        if (!nombrePaciente || !obraSocial || !fechaTurno) {
            Swal.fire('', 'Por favor, complete todos los campos correctamente.', 'error');
            return;
        }
    
        const fechaSeleccionada = new Date(fechaTurnoInput.value);
        fechaSeleccionada.setHours(fechaSeleccionada.getHours() + (fechaSeleccionada.getTimezoneOffset() / 60));
        const diaSemanaSeleccionado = obtenerDiaSemana(fechaSeleccionada);
    
        const medicoSeleccionado = listaMedicos.find(medico => medico.nombre === medicoNombreInput.value);
    
        ahora > fechaSeleccionada 
            ? Swal.fire('', 'Elija una fecha próxima por favor.', 'error')
            : !medicoSeleccionado?.turnos.includes(diaSemanaSeleccionado)
                ? Swal.fire('Error', `El médico ${medicoNombreInput.value} no atiende los ${diaSemanaSeleccionado.toLowerCase()}.`, 'error')
                : (guardarTurnoConfirmado({
                    nombreMedico: medicoSeleccionado.nombre,
                    especialidad: medicoSeleccionado.especialidad,
                    turnos: medicoSeleccionado.turnos.join(', '),
                    nombreUsuario: nombrePaciente,
                    obraSocial: obraSocial,
                    fecha: fechaSeleccionada.toLocaleDateString()
                }), turnoForm.reset(), modal.style.display = "none");
    });
    

    // Función para mostrar detalles del turno confirmado
    const mostrarPopupTurnoConfirmado = turnoConfirmado => {
        resultadoDeBusqueda.innerHTML = "";

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
                <p><strong>Fecha del Turno:</strong> ${turnoConfirmado.fecha}</p>
                <button onclick="cerrarPopup()">Cerrar</button>
            </div>
        `;
        document.body.appendChild(popupContainer);
    };

    // Función para cerrar el popup
    window.cerrarPopup = () => {
        const popupContainer = document.querySelector(".popup-container");
        if (popupContainer) {
            popupContainer.remove();
        }
    };

    // Verifica si la lista de médicos está en localStorage y guardarla si no está
    if (!localStorage.getItem('medicos')) {
        localStorage.setItem('medicos', JSON.stringify(listaMedicos));
    }
});
