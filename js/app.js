// Controlador SAMGY con Bootstrap 5
document.addEventListener('DOMContentLoaded', () => {
    updateLiveTimestamp();
    setInterval(updateLiveTimestamp, 30000);
    loadSection('inicio');
});

function updateLiveTimestamp() {
    const now = new Date();
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true };
    const formatted = now.toLocaleString('es-CO', options);
    
    const dateBadge = document.getElementById('current-date-badge');
    if (dateBadge) dateBadge.innerHTML = `<i class="bi bi-calendar-event me-1"></i> ${formatted}`;
    
    const liveStamp = document.getElementById('live-timestamp-preview');
    if (liveStamp) liveStamp.textContent = formatted;
}

// Carga Dinámica Modular mediante Fetch API
async function loadSection(sectionName) {
    const mainContainer = document.getElementById('main-dynamic-container');
    
    // Activar ítem de navegación
    document.querySelectorAll('#sidebar-wrapper .list-group-item').forEach(el => el.classList.remove('active-nav'));
    const activeNav = document.getElementById(`nav-${sectionName}`);
    if (activeNav) activeNav.classList.add('active-nav');

    try {
        const response = await fetch(`secciones/${sectionName}.html`);
        if (!response.ok) throw new Error('Error al cargar la sección');
        const html = await response.text();
        mainContainer.innerHTML = html;

        const titles = {
            'inicio': 'Inicio — Panel Principal',
            'estudiantes': 'Base de Datos — Mis Estudiantes',
            'ficha': 'Ficha Médica & Historia Clínica',
            'atenciones': 'Atenciones y Registro Diario',
            'configuracion': 'Configuración del Sistema'
        };
        document.getElementById('page-title').textContent = titles[sectionName] || 'SAMGY';

        if (sectionName === 'inicio') {
            renderStats();
        } else if (sectionName === 'estudiantes') {
            renderStudentsTable(students);
        } else if (sectionName === 'ficha') {
            populateStudentDropdowns();
            renderFicha(selectedStudentIdForFicha);
        } else if (sectionName === 'atenciones') {
            populateStudentDropdowns();
            renderVisitasHistory();
        }
    } catch (error) {
        console.error(error);
        mainContainer.innerHTML = `<div class="alert alert-danger m-3">No se pudo cargar la sección ${sectionName}.</div>`;
    }
}

function renderStats() {
    const totalEst = document.getElementById('stat-total-estudiantes');
    const totalAte = document.getElementById('stat-total-atenciones');
    const totalRec = document.getElementById('stat-recurrentes');

    if (totalEst) totalEst.textContent = students.length;
    if (totalAte) totalAte.textContent = visitas.length;
    if (totalRec) totalRec.textContent = students.filter(s => s.visitasCount >= 3).length;
}

function renderStudentsTable(list) {
    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No se encontraron estudiantes.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(s => {
        let badgeClass = "bg-secondary-subtle text-secondary";
        if (s.visitasCount >= 3) badgeClass = "bg-danger-subtle text-danger fw-bold";
        else if (s.visitasCount > 0) badgeClass = "bg-warning-subtle text-warning-emphasis fw-bold";

        return `
            <tr>
                <td class="fw-bold text-dark">${s.nombre}</td>
                <td class="small font-monospace text-muted">${s.documento}</td>
                <td><span class="badge bg-light text-dark border">${s.curso}</span></td>
                <td class="small text-danger fw-semibold">${s.alergias.join(', ')} / ${s.enfermedades.join(', ')}</td>
                <td class="text-center"><span class="badge ${badgeClass}">${s.visitasCount} visitas</span></td>
                <td class="text-end">
                    <button onclick="openFichaForStudent('${s.id}')" class="btn btn-sm btn-samgy-outline">
                        <i class="bi bi-file-earmark-medical me-1"></i>Ver Ficha
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterStudentsByGrade() {
    const grade = document.getElementById('grade-select').value;
    let filtered = grade === 'TODOS' ? students : students.filter(s => s.curso === grade);
    renderStudentsTable(filtered);
}

function searchStudents() {
    const query = document.getElementById('search-student-input').value.toLowerCase();
    const filtered = students.filter(s => s.nombre.toLowerCase().includes(query) || s.documento.toLowerCase().includes(query));
    renderStudentsTable(filtered);
}

function openFichaForStudent(studentId) {
    selectedStudentIdForFicha = studentId;
    loadSection('ficha').then(() => {
        const select = document.getElementById('ficha-student-select');
        if (select) select.value = studentId;
        renderFicha(studentId);
    });
}

function loadStudentFicha(studentId) {
    selectedStudentIdForFicha = studentId;
    renderFicha(studentId);
}

function renderFicha(studentId) {
    const container = document.getElementById('ficha-container');
    if (!container) return;

    const student = students.find(s => s.id === studentId) || students[0];
    if (!student) return;

    const studentVisitas = visitas.filter(v => v.studentId === student.id);

    container.innerHTML = `
        <div class="col-12 col-lg-4">
            <div class="card card-samgy p-4">
                <div class="text-center border-bottom pb-3 mb-3">
                    <div class="avatar-initials fs-3 mx-auto mb-2">${student.nombre.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                    <h5 class="fw-bold text-dark font-title mb-1">${student.nombre}</h5>
                    <span class="badge bg-primary-subtle text-samgy-primary">${student.curso}</span>
                </div>
                <ul class="list-group list-group-flush small mb-3">
                    <li class="list-group-item d-flex justify-content-between px-0"><span>Documento:</span> <strong class="text-dark">${student.documento}</strong></li>
                    <li class="list-group-item d-flex justify-content-between px-0"><span>Edad:</span> <strong class="text-dark">${student.edad}</strong></li>
                    <li class="list-group-item d-flex justify-content-between px-0"><span>Tutor Legal:</span> <strong class="text-dark">${student.acudiente}</strong></li>
                    <li class="list-group-item d-flex justify-content-between px-0"><span>Contacto:</span> <strong class="text-dark">${student.contacto}</strong></li>
                </ul>
                <div class="alert alert-danger p-2 mb-0 small">
                    <div class="fw-bold"><i class="bi bi-exclamation-triangle-fill me-1"></i>Alergias: ${student.alergias.join(', ')}</div>
                    <div>Enfermedades: ${student.enfermedades.join(', ')}</div>
                </div>
            </div>
        </div>

        <div class="col-12 col-lg-8">
            <div class="card card-samgy p-4">
                <h5 class="fw-bold font-title text-dark border-bottom pb-2 mb-3">Historial de Consultas Recientes</h5>
                <div class="space-y-3" style="max-height: 450px; overflow-y: auto;">
                    ${studentVisitas.length === 0 ? '<p class="text-muted small">Sin consultas registradas.</p>' : studentVisitas.map(v => `
                        <div class="p-3 bg-light rounded border small mb-2">
                            <div class="d-flex justify-content-between fw-bold text-secondary border-bottom pb-1 mb-2">
                                <span><i class="bi bi-clock me-1"></i>${v.fechaHora}</span>
                                <span class="text-samgy-primary">${v.id}</span>
                            </div>
                            <div><strong>Motivo:</strong> ${v.sintomas}</div>
                            <div><strong>Observaciones:</strong> ${v.observaciones}</div>
                            <div class="text-success fw-bold"><strong>Tratamiento:</strong> ${v.tratamiento}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function populateStudentDropdowns() {
    const fichaSelect = document.getElementById('ficha-student-select');
    const visitaSelect = document.getElementById('visita-student-select');
    const options = students.map(s => `<option value="${s.id}">${s.nombre} (${s.curso})</option>`).join('');

    if (fichaSelect) fichaSelect.innerHTML = options;
    if (visitaSelect) visitaSelect.innerHTML = `<option value="">-- Seleccionar --</option>` + options;
}

function handleNuevaVisitaSubmit(e) {
    e.preventDefault();
    const studentId = document.getElementById('visita-student-select').value;
    const sintomas = document.getElementById('visita-sintomas').value;
    const observaciones = document.getElementById('visita-observaciones').value;
    const tratamiento = document.getElementById('visita-tratamiento').value;

    const student = students.find(s => s.id === studentId);
    if (!student) return;

    student.visitasCount++;
    const now = new Date();
    const formattedDate = now.toLocaleString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true });

    visitas.unshift({
        id: `VIS-${Math.floor(100 + Math.random() * 900)}`,
        studentId: student.id,
        studentName: student.nombre,
        curso: student.curso,
        fechaHora: formattedDate,
        sintomas,
        observaciones,
        tratamiento
    });

    saveToLocalStorage();
    document.getElementById('nueva-visita-form').reset();
    alert('¡Atención registrada exitosamente!');
    renderVisitasHistory();
}

function renderVisitasHistory() {
    const container = document.getElementById('visitas-history-container');
    if (!container) return;

    container.innerHTML = visitas.map(v => `
        <div class="p-3 bg-light rounded border small mb-2">
            <div class="d-flex justify-content-between fw-bold text-dark border-bottom pb-1 mb-1">
                <span>${v.studentName} <span class="text-samgy-primary fw-normal">(${v.curso})</span></span>
                <span class="text-muted small"><i class="bi bi-clock me-1"></i>${v.fechaHora}</span>
            </div>
            <div><strong>Motivo:</strong> ${v.sintomas}</div>
            <div><strong>Diagnóstico/Obs:</strong> ${v.observaciones}</div>
            <div class="text-success fw-bold"><strong>Tratamiento:</strong> ${v.tratamiento}</div>
        </div>
    `).join('');
}

function handleSaveProfile(e) {
    e.preventDefault();
    const name = document.getElementById('profile-input-name').value;
    document.getElementById('sidebar-user-name').textContent = name;
    document.getElementById('profile-display-name').textContent = name;
    alert('Perfil actualizado.');
}

function resetDataToDefault() {
    if (confirm('¿Restablecer datos?')) {
        localStorage.clear();
        location.reload();
    }
}

function saveToLocalStorage() {
    localStorage.setItem('samgy_bs_students', JSON.stringify(students));
    localStorage.setItem('samgy_bs_visitas', JSON.stringify(visitas));
}

// Agregar función para crear nuevo estudiante
function handleCrearEstudiante(e) {
    e.preventDefault();
    const nombre = document.getElementById('add-nombre').value;
    const documento = document.getElementById('add-documento').value;
    const curso = document.getElementById('add-curso').value;
    const edad = document.getElementById('add-edad').value;
    const contacto = document.getElementById('add-contacto').value;
    const acudiente = document.getElementById('add-acudiente').value;
    const correo = document.getElementById('add-correo').value || 'Sin correo registrado';
    const alergiasRaw = document.getElementById('add-alergias').value;
    const enfermedadesRaw = document.getElementById('add-enfermedades').value;

    const alergias = alergiasRaw ? alergiasRaw.split(',').map(a => a.trim()) : ['Ninguna'];
    const enfermedades = enfermedadesRaw ? enfermedadesRaw.split(',').map(e => e.trim()) : ['Ninguna'];

    const newStudent = {
        id: `STU-${Math.floor(100 + Math.random() * 900)}`,
        nombre,
        documento,
        edad,
        curso,
        direccion: "Dirección Escolar",
        correo,
        acudiente,
        contacto,
        alergias,
        enfermedades,
        visitasCount: 0
    };

    students.unshift(newStudent);
    saveToLocalStorage();

    // Cerrar modal de Bootstrap
    const modalElement = document.getElementById('modalNuevoEstudiante');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();

    document.getElementById('form-nuevo-estudiante').reset();
    renderStudentsTable(students);
    alert('¡Estudiante registrado exitosamente en la base de datos!');
}
