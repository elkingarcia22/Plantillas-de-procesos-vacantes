// ========================================
// DASHBOARD DE VACANTES UBITS
// Funcionalidad completa del dashboard usando componentes UBITS
// ========================================

// Estado global
let currentVacantes = [];
let filteredVacantes = [];

// ========================================
// INICIALIZACIÓN
// ========================================

function initializeVacantesDashboard() {
    try {
        loadVacantesFromStorage();
        setupEventListeners();
        renderVacantesTable();
        updateVacantesCount();
    } catch (error) {
        console.error('Error en initializeVacantesDashboard:', error);
    }
}

// ========================================
// CARGA DE DATOS
// ========================================

function loadVacantesFromStorage() {
    try {
        const stored = localStorage.getItem('vacantes');
        if (stored) {
            currentVacantes = JSON.parse(stored);
            console.log('📋 [loadVacantesFromStorage] Vacantes cargadas:', currentVacantes.length);
        } else {
            currentVacantes = [];
            console.log('📋 [loadVacantesFromStorage] No hay vacantes guardadas');
        }
        filteredVacantes = [...currentVacantes];
    } catch (error) {
        console.error('❌ [loadVacantesFromStorage] Error:', error);
        currentVacantes = [];
        filteredVacantes = [];
    }
}

function saveVacantesToStorage() {
    try {
        localStorage.setItem('vacantes', JSON.stringify(currentVacantes));
        console.log('💾 [saveVacantesToStorage] Vacantes guardadas:', currentVacantes.length);
    } catch (error) {
        console.error('❌ [saveVacantesToStorage] Error:', error);
    }
}

// ========================================
// RENDERIZADO DE TABLA
// ========================================

function renderVacantesTable() {
    try {
        const tableBody = document.getElementById('vacantesTableBody');
        if (!tableBody) {
            console.error('❌ [renderVacantesTable] No se encontró vacantesTableBody');
            return;
        }
        
        if (!filteredVacantes || !Array.isArray(filteredVacantes)) {
            console.log('⚠️ [renderVacantesTable] filteredVacantes no es válido');
            tableBody.innerHTML = renderTableEmptyState();
            return;
        }
        
        console.log('🔍 [renderVacantesTable] Vacantes filtradas:', filteredVacantes.length);
        
        if (filteredVacantes.length === 0) {
            tableBody.innerHTML = renderTableEmptyState();
            return;
        }
        
        tableBody.innerHTML = filteredVacantes.map(vacante => {
            const statusClass = vacante.status === 'activa' ? 'available' : 'draft';
            const statusText = vacante.status === 'activa' ? 'Activa' : 'Borrador';
            const templateName = vacante.templateName || 'Sin plantilla';
            const createdDate = vacante.createdAt ? formatDateForTable(vacante.createdAt) : 'N/A';
            const modifiedDate = vacante.lastModified ? formatDateForTable(vacante.lastModified) : 'N/A';
            
            return `
                <tr data-vacante-id="${vacante.id}">
                    <td class="table-checkbox">
                        <input type="checkbox" class="vacante-checkbox" data-vacante-id="${vacante.id}" onchange="updateSelection()">
                    </td>
                    <td data-column="name" class="table-name column-name">${vacante.name || 'Sin nombre'}</td>
                    <td data-column="template" class="column-template">${templateName}</td>
                    <td data-column="status" class="table-status column-status">
                        <span class="table-status-badge ${statusClass}">${statusText}</span>
                    </td>
                    <td data-column="created" class="table-date column-created">${createdDate}</td>
                    <td data-column="modified" class="table-date column-modified">${modifiedDate}</td>
                    <td data-column="actions" class="column-actions">
                        <button class="ubits-button ubits-button--secondary ubits-button--sm" onclick="editVacante('${vacante.id}')" title="Editar">
                            <i class="far fa-pencil"></i>
                            <span>Editar</span>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        console.log('✅ [renderVacantesTable] Tabla renderizada');
    } catch (error) {
        console.error('❌ [renderVacantesTable] Error:', error);
    }
}

function renderTableEmptyState() {
    return `
        <tr class="table-empty-row">
            <td colspan="7" class="table-empty-cell">
                <div class="table-empty-content">
                    <div class="table-empty-icon">
                        <i class="far fa-briefcase"></i>
                    </div>
                    <h3 class="table-empty-title">No hay vacantes creadas</h3>
                    <p class="table-empty-description">Crea tu primera vacante para comenzar a gestionar procesos de selección.</p>
                    <button class="ubits-button ubits-button--primary ubits-button--md" onclick="createVacante()">
                        <i class="far fa-plus"></i>
                        <span>Crear mi primera vacante</span>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// ========================================
// UTILIDADES
// ========================================

function formatDateForTable(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Hoy';
        } else if (diffDays === 1) {
            return 'Ayer';
        } else if (diffDays < 7) {
            return `Hace ${diffDays} días`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
        } else {
            const years = Math.floor(diffDays / 365);
            return `Hace ${years} ${years === 1 ? 'año' : 'años'}`;
        }
    } catch (error) {
        console.error('Error formateando fecha:', error);
        return 'N/A';
    }
}

function updateVacantesCount() {
    const countElement = document.getElementById('vacantesCount');
    if (countElement) {
        countElement.textContent = filteredVacantes.length;
    }
}

function updateSelection() {
    // Lógica para actualizar selección
    const checkboxes = document.querySelectorAll('.vacante-checkbox:checked');
    console.log('✅ [updateSelection] Vacantes seleccionadas:', checkboxes.length);
}

// ========================================
// ACCIONES
// ========================================

function editVacante(vacanteId) {
    // Redirigir a configurar-vacante.html con el ID de la vacante
    window.location.href = `configurar-vacante.html?id=${vacanteId}`;
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Checkbox "Seleccionar todas"
    const selectAllCheckbox = document.getElementById('selectAllVacantes');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.vacante-checkbox');
            checkboxes.forEach(cb => {
                cb.checked = this.checked;
            });
            updateSelection();
        });
    }
    
    // Botones de ordenamiento
    const sortButtons = document.querySelectorAll('.table-sort-btn');
    sortButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const sortType = this.getAttribute('data-sort');
            console.log('🔍 [setupEventListeners] Ordenar por:', sortType);
            // Implementar lógica de ordenamiento si es necesario
        });
    });
}

// ========================================
// CREAR VACANTES DE EJEMPLO (para testing)
// ========================================

// Crear vacantes de ejemplo automáticamente si no hay vacantes
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (currentVacantes.length === 0) {
            // Crear 2 vacantes de ejemplo
            createExampleVacantes();
        }
    }, 500);
});

// Función para crear vacantes de ejemplo
function createExampleVacantes() {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const exampleVacantes = [
        {
            id: 'vacante-1',
            name: 'Desarrollador Frontend React',
            templateName: 'Estándar de selección con IA',
            templateId: 'default-template-ia',
            status: 'activa',
            createdAt: lastWeek.toISOString(),
            lastModified: yesterday.toISOString()
        },
        {
            id: 'vacante-2',
            name: 'Diseñador UX/UI',
            templateName: 'Estándar de selección',
            templateId: 'default-template-standard',
            status: 'draft',
            createdAt: yesterday.toISOString(),
            lastModified: now.toISOString()
        }
    ];
    
    currentVacantes = [...exampleVacantes];
    saveVacantesToStorage();
    filteredVacantes = [...currentVacantes];
    renderVacantesTable();
    updateVacantesCount();
    
    console.log('✅ [createExampleVacantes] 2 vacantes de ejemplo creadas');
}
