// ========================================
// DASHBOARD DE PLANTILLAS UBITS
// Funcionalidad completa del dashboard usando componentes UBITS
// ========================================

// Sistema sin plantillas por defecto - usuarios crean las suyas
const TEMPLATES = [];

// Estado global
let currentTemplates = [];
let filteredTemplates = [];
let currentSort = 'recent';
let isSearching = false;

// Estado de filtros
let activeFilters = {
    status: [],
    dateFrom: null,
    dateTo: null,
    hasAgents: null // null = todos, true = con agentes, false = sin agentes
};

// Opciones de ordenamiento
const SORT_OPTIONS = [
    { value: 'recent', text: 'Más reciente primero' },
    { value: 'oldest', text: 'Más antiguo primero' },
    { value: 'name-asc', text: 'Alfabético A - Z' },
    { value: 'name-desc', text: 'Alfabético Z - A' }
];

// ========================================
// INICIALIZACIÓN
// ========================================

function initializeDashboard() {
    try {
        loadTemplatesFromStorage();
        setupEventListeners();
        
        // Inicializar filtros globales
        if (typeof window.activeFilters === 'undefined') {
            window.activeFilters = {
                status: [],
                dateFrom: null,
                dateTo: null,
                hasAgents: null
            };
        }
        
        renderTemplates();
        updateTemplatesCount();
    } catch (error) {
        console.error('Error en initializeDashboard:', error);
    }
}

// ========================================
// GESTIÓN DE DATOS
// ========================================

function loadTemplatesFromStorage() {
    const stored = localStorage.getItem('templates');
    if (stored) {
        currentTemplates = JSON.parse(stored);
        console.log('📋 [loadTemplatesFromStorage] Plantillas cargadas:', currentTemplates.length);
        
        // Actualizar nombres y estados de plantillas por defecto si tienen valores antiguos
        let needsUpdate = false;
        currentTemplates.forEach(template => {
            if (template.isDefault) {
                // Actualizar nombres antiguos
                if (template.id === 'default-template-ia' && (template.name === 'Plantilla por defecto – Flujo estándar de selección con IA' || template.name === 'Plantilla estándar de selección con IA')) {
                    template.name = 'Estándar de selección con IA';
                    needsUpdate = true;
                } else if (template.id === 'default-template-standard' && (template.name === 'Plantilla por defecto – Flujo estándar de selección' || template.name === 'Plantilla flujo estándar de selección' || template.name === 'Flujo estándar de selección')) {
                    template.name = 'Estándar de selección';
                    needsUpdate = true;
                }
                
                // Actualizar estado 'active' a 'available' en plantillas por defecto
                if (template.status === 'active') {
                    template.status = 'available';
                    needsUpdate = true;
                }
            }
            
            // Actualizar estado 'active' a 'available' en todas las plantillas
            if (template.status === 'active') {
                console.log('🔄 [loadTemplatesFromStorage] Actualizando estado de plantilla:', template.id, 'de "active" a "available"');
                template.status = 'available';
                needsUpdate = true;
            }
            
            // Debug: Verificar estado de plantilla por defecto IA
            if (template.id === 'default-template-ia') {
                console.log('🔍 [loadTemplatesFromStorage] Plantilla IA encontrada:', {
                    id: template.id,
                    name: template.name,
                    status: template.status,
                    isDefault: template.isDefault
                });
            }
        });
        
        if (needsUpdate) {
            saveTemplatesToStorage();
            console.log('📋 [loadTemplatesFromStorage] Nombres y estados de plantillas actualizados');
        }
        
        // Verificar si ya existen las plantillas por defecto
        const hasDefaultTemplates = currentTemplates.some(t => t.isDefault === true);
        console.log('📋 [loadTemplatesFromStorage] ¿Tiene plantillas por defecto?', hasDefaultTemplates);
        
        // Verificar que las plantillas por defecto tengan el estado correcto
        const defaultTemplateIA = currentTemplates.find(t => t.id === 'default-template-ia');
        if (defaultTemplateIA) {
            console.log('📋 [loadTemplatesFromStorage] Plantilla IA encontrada, estado actual:', defaultTemplateIA.status);
            if (defaultTemplateIA.status !== 'available') {
                console.log('🔄 [loadTemplatesFromStorage] Corrigiendo estado de plantilla IA a "available"');
                defaultTemplateIA.status = 'available';
                needsUpdate = true;
            }
        }
        
        const defaultTemplateStandard = currentTemplates.find(t => t.id === 'default-template-standard');
        if (defaultTemplateStandard) {
            console.log('📋 [loadTemplatesFromStorage] Plantilla Standard encontrada, estado actual:', defaultTemplateStandard.status);
            if (defaultTemplateStandard.status !== 'available') {
                console.log('🔄 [loadTemplatesFromStorage] Corrigiendo estado de plantilla Standard a "available"');
                defaultTemplateStandard.status = 'available';
                needsUpdate = true;
            }
        }
        
        if (needsUpdate) {
            saveTemplatesToStorage();
            console.log('📋 [loadTemplatesFromStorage] Estados de plantillas por defecto actualizados');
        }
        
        if (!hasDefaultTemplates) {
            console.log('📋 [loadTemplatesFromStorage] Creando plantillas por defecto...');
            // Agregar plantillas por defecto si no existen
            const defaultTemplates = createDefaultTemplates();
            console.log('📋 [loadTemplatesFromStorage] Plantillas por defecto creadas:', defaultTemplates.length);
            currentTemplates = [...defaultTemplates, ...currentTemplates];
            saveTemplatesToStorage();
            console.log('📋 [loadTemplatesFromStorage] Plantillas guardadas. Total:', currentTemplates.length);
        }
    } else {
        console.log('📋 [loadTemplatesFromStorage] No hay plantillas guardadas. Creando plantillas por defecto...');
        // Crear plantillas por defecto
        currentTemplates = createDefaultTemplates();
        console.log('📋 [loadTemplatesFromStorage] Plantillas por defecto creadas:', currentTemplates.length);
        saveTemplatesToStorage();
        console.log('📋 [loadTemplatesFromStorage] Plantillas guardadas.');
    }
    
    filteredTemplates = [...currentTemplates];
    console.log('📋 [loadTemplatesFromStorage] Plantillas filtradas:', filteredTemplates.length);
}

function createDefaultTemplates() {
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    
    // Plantilla 1: Flujo estándar de selección con IA
    const template1 = {
        id: 'default-template-ia',
        name: 'Estándar de selección con IA',
        category: 'reclutamiento',
        status: 'available',
        createdAt: now,
        lastModified: today,
        author: 'Sistema',
        avatar: 'images/Profile-image.jpg',
        version: 1,
        stages: 8,
        agents: 5,
        isDefault: true,
        realContent: {
            stages: [
                {
                    id: 'stage-1',
                    type: 'agent',
                    agentId: 'cv-analyzer',
                    name: 'Analizador de CV',
                    category: 'evaluacion-inicial',
                    config: {
                        salaryPercentage: 25,
                        minScore: 70,
                        acceptExEmployees: 'si'
                    }
                },
                {
                    id: 'stage-2',
                    type: 'custom',
                    name: 'Preguntas de filtro / formulario',
                    category: 'evaluacion-inicial',
                    description: 'Knockout questions simples: disponibilidad, ubicación, experiencia mínima, etc.',
                    templateId: 'default-pre-filter-requirements'
                },
                {
                    id: 'stage-3',
                    type: 'agent',
                    agentId: 'psychometric-analyst',
                    name: 'Analista psicométrico',
                    category: 'evaluacion-psicometrica',
                    config: {
                        minScore: 0,
                        tests: []
                    }
                },
                {
                    id: 'stage-4',
                    type: 'agent',
                    agentId: 'interview-ia',
                    name: 'Entrevista Serena',
                    category: 'entrevistas',
                    config: {
                        interviewType: 'telefonica',
                        voice: 'colombia',
                        expirationDays: 0,
                        minScore: 0
                    }
                },
                {
                    id: 'stage-5',
                    type: 'custom',
                    name: 'Entrevista con el reclutador',
                    category: 'entrevistas',
                    description: 'Etapa manual para las personas que pasaron todos los filtros automáticos.',
                    templateId: 'default-interview-recruiter'
                },
                {
                    id: 'stage-6',
                    type: 'custom',
                    name: 'Entrevista con el hiring manager',
                    category: 'entrevistas',
                    description: 'Validación final del área.',
                    templateId: 'default-interview-hiring-manager'
                },
                {
                    id: 'stage-7',
                    type: 'agent',
                    agentId: 'background-check',
                    name: 'Verificación de antecedentes judiciales',
                    category: 'verificacion'
                },
                {
                    id: 'stage-8',
                    type: 'custom',
                    name: 'Cierre del proceso',
                    category: 'decision-final',
                    description: 'Última etapa para registrar la decisión final sobre el candidato: aprobado, no aprobado o en espera.',
                    templateId: 'default-final-review'
                }
            ]
        }
    };
    
    // Plantilla 2: Flujo estándar de selección (sin IA)
    const template2 = {
        id: 'default-template-standard',
        name: 'Estándar de selección',
        category: 'reclutamiento',
        status: 'available',
        createdAt: now,
        lastModified: today,
        author: 'Sistema',
        avatar: 'images/Profile-image.jpg',
        version: 1,
        stages: 8,
        agents: 0,
        isDefault: true,
        realContent: {
            stages: [
                {
                    id: 'stage-1',
                    type: 'custom',
                    name: 'Revisión de CV',
                    category: 'evaluacion-inicial',
                    description: 'Revisión inicial del currículum para validar requisitos clave y rango salarial esperado.',
                    templateId: 'default-review-cv'
                },
                {
                    id: 'stage-2',
                    type: 'custom',
                    name: 'Preguntas de filtro / formulario inicial',
                    category: 'evaluacion-inicial',
                    description: 'Cuestionario con preguntas knockout: disponibilidad, ubicación, experiencia mínima, etc.',
                    templateId: 'default-pre-filter-requirements'
                },
                {
                    id: 'stage-3',
                    type: 'custom',
                    name: 'Evaluación psicométrica',
                    category: 'evaluacion-psicometrica',
                    description: 'Aplicación y revisión de pruebas psicométricas según el tipo de rol.',
                    templateId: 'default-psychometric-general'
                },
                {
                    id: 'stage-4',
                    type: 'custom',
                    name: 'Entrevista inicial',
                    category: 'entrevistas',
                    description: 'Primera entrevista estructurada para evaluar motivación y competencias básicas.',
                    templateId: 'default-interview-pre-screening'
                },
                {
                    id: 'stage-5',
                    type: 'custom',
                    name: 'Entrevista con el reclutador',
                    category: 'entrevistas',
                    description: 'Entrevista más profunda para validar encaje con la empresa y el proceso.',
                    templateId: 'default-interview-recruiter'
                },
                {
                    id: 'stage-6',
                    type: 'custom',
                    name: 'Entrevista con el hiring manager / área',
                    category: 'entrevistas',
                    description: 'Entrevista técnica o funcional para evaluar el ajuste al rol específico.',
                    templateId: 'default-interview-hiring-manager'
                },
                {
                    id: 'stage-7',
                    type: 'custom',
                    name: 'Verificación de antecedentes judiciales',
                    category: 'verificacion',
                    description: 'Revisión de antecedentes del candidato según la normativa vigente y las políticas internas.',
                    templateId: 'default-verify-background'
                },
                {
                    id: 'stage-8',
                    type: 'custom',
                    name: 'Cierre del proceso',
                    category: 'decision-final',
                    description: 'Registro de la decisión final sobre el candidato: aprobado, no aprobado o en espera.',
                    templateId: 'default-final-review'
                }
            ]
        }
    };
    
    return [template1, template2];
}

function saveTemplatesToStorage() {
    localStorage.setItem('templates', JSON.stringify(currentTemplates));
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Búsqueda
    const searchInput = document.getElementById('searchTemplates');
    const clearSearchBtn = document.getElementById('clearSearchTemplates');
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchEvent);
    }
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearSearch);
    }
}

function handleSearchEvent(event) {
    const value = event.target.value;
    handleSearch(value);
    
    // Mostrar/ocultar botón limpiar
    const clearBtn = document.getElementById('clearSearchTemplates');
    if (clearBtn) {
        clearBtn.style.display = value.length > 0 ? 'block' : 'none';
    }
}

function handleSearch(value) {
    const query = value.toLowerCase().trim();
    
    if (query === '') {
        isSearching = false;
    } else {
        isSearching = true;
    }
    
    // Aplicar filtros combinados (búsqueda + filtros)
    applyTemplateFilters();
}

// Función para aplicar todos los filtros (búsqueda + filtros del drawer)
function applyTemplateFilters() {
    const searchInput = document.getElementById('searchTemplates');
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    // Empezar con todas las plantillas
    let templates = [...currentTemplates];
    
    // Aplicar búsqueda
    if (searchQuery) {
        templates = templates.filter(template => 
            template.name.toLowerCase().includes(searchQuery) ||
            template.category.toLowerCase().includes(searchQuery) ||
            template.author.toLowerCase().includes(searchQuery) ||
            (template.description && template.description.toLowerCase().includes(searchQuery))
        );
    }
    
    // Aplicar filtros del drawer
    if (typeof window.activeFilters !== 'undefined' && window.activeFilters) {
        const filters = window.activeFilters;
        
        // Filtro de estado
        if (filters.status && filters.status.length > 0) {
            templates = templates.filter(template => filters.status.includes(template.status));
        }
        
        // Filtro de rango de fecha
        if (filters.dateFrom) {
            templates = templates.filter(template => {
                const templateDate = new Date(template.lastModified);
                const fromDate = new Date(filters.dateFrom);
                return templateDate >= fromDate;
            });
        }
        
        if (filters.dateTo) {
            templates = templates.filter(template => {
                const templateDate = new Date(template.lastModified);
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999); // Incluir todo el día
                return templateDate <= toDate;
            });
        }
        
        // Filtro de agentes
        if (filters.hasAgents !== null) {
            templates = templates.filter(template => {
                const agentsCount = template.agents || 0;
                if (filters.hasAgents === true) {
                    return agentsCount > 0;
                } else {
                    return agentsCount === 0;
                }
            });
        }
    }
    
    // Actualizar plantillas filtradas
    filteredTemplates = templates;
    
    // Aplicar ordenamiento y renderizar
    applySorting();
    renderTemplates();
    updateTemplatesCount();
}

function clearSearch() {
    const searchInput = document.getElementById('searchTemplates');
    const clearBtn = document.getElementById('clearSearchTemplates');
    
    if (searchInput) {
        searchInput.value = '';
        isSearching = false;
        handleSearch('');
        if (clearBtn) {
            clearBtn.style.display = 'none';
        }
    }
}

// ========================================
// ORDENAMIENTO
// ========================================

function openSortDropdown(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Remover dropdown existente si existe
    const existingDropdown = document.querySelector('.sort-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
        return;
    }
    
    // Crear dropdown dinámico
    const dropdown = document.createElement('div');
    dropdown.className = 'sort-dropdown';
    dropdown.style.cssText = `
        position: absolute;
        top: 100%;
        right: 0;
        background: var(--ubits-bg-1);
        border: 1px solid var(--ubits-border-1);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        min-width: 200px;
        padding: 8px 0;
    `;
    
    SORT_OPTIONS.forEach(option => {
        const item = document.createElement('div');
        item.className = 'sort-option';
        item.style.cssText = `
            padding: 8px 16px;
            cursor: pointer;
            font-family: 'Noto Sans', sans-serif;
            font-size: 14px;
            color: var(--ubits-fg-1-high);
            transition: background 0.2s ease;
        `;
        
        if (option.value === currentSort) {
            item.style.background = 'var(--ubits-bg-2)';
            item.style.fontWeight = '600';
        }
        
        item.textContent = option.text;
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            currentSort = option.value;
            document.getElementById('currentSortText').textContent = option.text;
            applySorting();
            renderTemplates();
            dropdown.remove();
        });
        
        item.addEventListener('mouseenter', () => {
            item.style.background = 'var(--ubits-bg-2)';
        });
        
        item.addEventListener('mouseleave', () => {
            if (option.value !== currentSort) {
                item.style.background = 'transparent';
            }
        });
        
        dropdown.appendChild(item);
    });
    
    // Posicionar dropdown
    const sortContainer = document.querySelector('.sort-container');
    if (sortContainer) {
        sortContainer.style.position = 'relative';
        sortContainer.appendChild(dropdown);
        
        // Cerrar dropdown al hacer click fuera
        setTimeout(() => {
            document.addEventListener('click', function closeDropdown(e) {
                if (!sortContainer.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        }, 0);
    }
}

function applySorting() {
    switch (currentSort) {
        case 'recent':
            filteredTemplates.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
            break;
        case 'oldest':
            filteredTemplates.sort((a, b) => new Date(a.lastModified) - new Date(b.lastModified));
            break;
        case 'name-asc':
            filteredTemplates.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredTemplates.sort((a, b) => b.name.localeCompare(a.name));
            break;
    }
}

// ========================================
// RENDERIZADO
// ========================================

// Variable para prevenir múltiples renderizados
let isRendering = false;

function renderTemplates() {
    if (isRendering) {
        return;
    }
    
    isRendering = true;
    
    try {
        const grid = document.getElementById('templatesGrid');
        const controls = document.querySelector('.templates-controls');
        const createButton = document.querySelector('.dashboard-header button[onclick*="openCreateTemplateModal"]');
        
        if (!grid) {
            isRendering = false;
            return;
        }
        
        if (!filteredTemplates || !Array.isArray(filteredTemplates)) {
            grid.innerHTML = '';
            isRendering = false;
            return;
        }
        
        if (filteredTemplates.length === 0) {
            // Diferenciar entre empty state (sin plantillas) y no results (búsqueda sin resultados)
        if (isSearching && currentTemplates.length > 0) {
            grid.innerHTML = getNoResultsHTML();
        } else {
            grid.innerHTML = getEmptyStateHTML();
        }
        
        // Ocultar controles cuando no hay plantillas (solo en empty state, no en no results)
        if (!isSearching || currentTemplates.length === 0) {
            if (controls) {
                controls.style.display = 'none';
            }
            if (createButton) {
                createButton.style.display = 'none';
            }
        } else {
            // Mostrar controles cuando hay búsqueda sin resultados pero hay plantillas
            if (controls) {
                controls.style.display = 'flex';
            }
            if (createButton) {
                createButton.style.display = 'flex';
            }
            }
            isRendering = false;
            return;
        }
        
        grid.innerHTML = filteredTemplates.map(template => createTemplateCardHTML(template)).join('');
        
        // Renderizar tabla
        renderTemplatesTable();
        
        // Mostrar controles cuando hay plantillas
        if (controls) {
            controls.style.display = 'flex';
        }
        
        // Mostrar botón "Crear plantilla" del header cuando hay plantillas
        if (createButton) {
            createButton.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error en renderTemplates:', error);
    } finally {
        isRendering = false;
    }
    
    // Agregar event listeners a los botones
    addTemplateCardEventListeners();
}

// Función para renderizar la tabla de plantillas
// Variable para prevenir re-renderizados múltiples
let isRenderingTable = false;

function renderTemplatesTable() {
    // Prevenir múltiples renderizados simultáneos
    if (isRenderingTable) {
        return;
    }
    
    isRenderingTable = true;
    
    try {
        const tableBody = document.getElementById('templatesTableBody');
        if (!tableBody) {
            isRenderingTable = false;
            return;
        }
        
        if (!filteredTemplates || !Array.isArray(filteredTemplates)) {
            tableBody.innerHTML = '';
            isRenderingTable = false;
            return;
        }
        
        if (filteredTemplates.length === 0) {
            tableBody.innerHTML = '';
            isRenderingTable = false;
            return;
        }
        
        // Mapear categoría técnica a texto legible
        const categoryMap = {
            'administracion': 'Administración',
            'atencion-cliente': 'Atención al cliente',
            'contratacion-general': 'Contratación general',
            'diseno-creatividad': 'Diseño y creatividad',
            'finanzas-contabilidad': 'Finanzas y contabilidad',
            'ingenieria': 'Ingeniería',
            'operaciones': 'Operaciones',
            'recursos-humanos': 'Recursos humanos',
            'tecnologia-desarrollo': 'Tecnología / Desarrollo',
            'ventas-marketing': 'Ventas y marketing'
        };
        
        tableBody.innerHTML = filteredTemplates.map(template => {
            const hasStatus = template.status !== undefined && template.status !== null && template.status !== '';
            const statusClass = hasStatus ? (template.status === 'available' ? 'available' : 'draft') : 'draft';
            const statusText = hasStatus ? (template.status === 'available' ? 'Disponible' : 'Borrador') : 'Borrador';
            const categoryText = categoryMap[template.category] || template.category || 'Sin categoría';
            
            // Calcular participantes (stages + agents)
            const participants = (template.stages || 0) + (template.agents || 0);
            
            // Calcular avance (por ahora fijo en 50%, luego se puede hacer dinámico)
            const progress = 50;
            
            // Formatear fecha de modificación
            const modifiedDate = template.lastModified ? formatDateForTable(template.lastModified) : 'N/A';
            
            // Obtener número de agentes IA del flujo
            const agentsCount = template.agents || 0;
            
            return `
                <tr data-template-id="${template.id}">
                    <td class="table-checkbox">
                        <input type="checkbox" class="template-checkbox" data-template-id="${template.id}">
                    </td>
                    <td data-column="name" class="table-name column-name">${template.name || 'Sin nombre'}</td>
                    <td data-column="type" class="table-type column-type">${categoryText}</td>
                    <td data-column="status" class="table-status column-status">
                        <span class="table-status-badge ${statusClass}">${statusText}</span>
                    </td>
                    <td data-column="modified" class="table-date column-modified">${modifiedDate}</td>
                    <td data-column="agents" class="table-agents column-agents">${agentsCount}</td>
                    <td data-column="participants" class="table-participants column-participants">${participants}</td>
                    <td data-column="progress" class="table-progress column-progress">
                        <div class="table-progress-container">
                            <div class="table-progress-bar">
                                <div class="table-progress-fill" style="width: ${progress}%"></div>
                            </div>
                            <span class="table-progress-text">${progress}%</span>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    
        // Agregar event listeners para checkboxes
        setupTableCheckboxes();
        
        // Agregar event listeners para ordenamiento
        setupTableSorting();
        
        // Agregar event listeners para clicks en filas
        setupTableRowClicks();
    } catch (error) {
        console.error('Error en renderTemplatesTable:', error);
    } finally {
        isRenderingTable = false;
    }
}

// Función para formatear fecha para la tabla
function formatDateForTable(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            // Si es formato YYYY-MM-DD
            const parts = dateString.split('-');
            if (parts.length === 3) {
                const day = parseInt(parts[2], 10);
                const month = parseInt(parts[1], 10);
                const year = parseInt(parts[0], 10);
                const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
                return `${day} - ${monthNames[month - 1]} - ${year}`;
            }
            return dateString;
        }
        
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                           'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        return `${day} - ${monthNames[month]} - ${year}`;
    } catch (e) {
        return dateString;
    }
}

// Función para configurar checkboxes de la tabla
function setupTableCheckboxes() {
    const selectAllCheckbox = document.getElementById('selectAllTemplates');
    const rowCheckboxes = document.querySelectorAll('.template-checkbox');
    
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            rowCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }
    
    rowCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateSelectAllCheckbox();
        });
    });
}

// Función para actualizar el checkbox "Seleccionar todas"
function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAllTemplates');
    const rowCheckboxes = document.querySelectorAll('.template-checkbox');
    
    if (selectAllCheckbox && rowCheckboxes.length > 0) {
        const allChecked = Array.from(rowCheckboxes).every(checkbox => checkbox.checked);
        selectAllCheckbox.checked = allChecked;
    }
}

// Variables para el ordenamiento de la tabla
let currentTableSortField = null;
let currentTableSortDirection = 'asc'; // 'asc' o 'desc'

// Función para configurar ordenamiento de la tabla
function setupTableSorting() {
    try {
        const sortButtons = document.querySelectorAll('.table-sort-btn');
        
        if (!sortButtons || sortButtons.length === 0) {
            // Los botones aún no existen, no hacer nada
            return;
        }
        
        sortButtons.forEach((button) => {
            if (!button) return;
            
            // Remover event listeners anteriores usando una función nombrada
            const oldHandler = button._sortHandler;
            if (oldHandler) {
                button.removeEventListener('click', oldHandler);
            }
            
            // Crear nuevo handler
            const handler = function(e) {
                e.stopPropagation(); // Evitar que el click se propague al header
                e.preventDefault();
                const field = this.dataset.sort;
                if (field) {
                    sortTableBy(field);
                }
            };
            
            // Guardar referencia al handler para poder removerlo después
            button._sortHandler = handler;
            
            // Agregar nuevo event listener
            button.addEventListener('click', handler);
        });
    } catch (error) {
        console.error('Error en setupTableSorting:', error);
    }
}

// Variable para prevenir bucles infinitos
let isSorting = false;

// Función para ordenar la tabla
function sortTableBy(field) {
    // Prevenir bucles infinitos
    if (isSorting) {
        return;
    }
    
    // Verificar que filteredTemplates esté disponible
    if (!filteredTemplates || !Array.isArray(filteredTemplates)) {
        return;
    }
    
    isSorting = true;
    
    try {
        // Si se hace click en el mismo campo, cambiar dirección
        if (currentTableSortField === field) {
            currentTableSortDirection = currentTableSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            currentTableSortField = field;
            currentTableSortDirection = 'asc';
        }
        
        // Ordenar filteredTemplates
        filteredTemplates.sort((a, b) => {
        let aValue, bValue;
        
        switch(field) {
            case 'name':
                aValue = (a.name || '').toLowerCase();
                bValue = (b.name || '').toLowerCase();
                return currentTableSortDirection === 'asc' 
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            
            case 'category':
                const categoryMap = {
                    'administracion': 'Administración',
                    'atencion-cliente': 'Atención al cliente',
                    'contratacion-general': 'Contratación general',
                    'diseno-creatividad': 'Diseño y creatividad',
                    'finanzas-contabilidad': 'Finanzas y contabilidad',
                    'ingenieria': 'Ingeniería',
                    'operaciones': 'Operaciones',
                    'recursos-humanos': 'Recursos humanos',
                    'tecnologia-desarrollo': 'Tecnología / Desarrollo',
                    'ventas-marketing': 'Ventas y marketing'
                };
                aValue = (categoryMap[a.category] || a.category || '').toLowerCase();
                bValue = (categoryMap[b.category] || b.category || '').toLowerCase();
                return currentTableSortDirection === 'asc' 
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            
            case 'status':
                const statusOrder = { 'available': 1, 'draft': 2 };
                // Si no tiene status definido, tratarlo como draft
                const aStatus = a.status !== undefined && a.status !== null && a.status !== '' ? a.status : 'draft';
                const bStatus = b.status !== undefined && b.status !== null && b.status !== '' ? b.status : 'draft';
                aValue = statusOrder[aStatus] || 3;
                bValue = statusOrder[bStatus] || 3;
                return currentTableSortDirection === 'asc' 
                    ? aValue - bValue
                    : bValue - aValue;
            
            case 'lastModified':
                // Manejar diferentes formatos de fecha
                let aDate, bDate;
                try {
                    aDate = a.lastModified ? new Date(a.lastModified) : new Date(0);
                    bDate = b.lastModified ? new Date(b.lastModified) : new Date(0);
                    // Si la fecha es inválida, usar fecha muy antigua
                    if (isNaN(aDate.getTime())) aDate = new Date(0);
                    if (isNaN(bDate.getTime())) bDate = new Date(0);
                } catch (e) {
                    aDate = new Date(0);
                    bDate = new Date(0);
                }
                aValue = aDate.getTime();
                bValue = bDate.getTime();
                return currentTableSortDirection === 'asc' 
                    ? aValue - bValue
                    : bValue - aValue;
            
            case 'agents':
                aValue = a.agents || 0;
                bValue = b.agents || 0;
                return currentTableSortDirection === 'asc' 
                    ? aValue - bValue
                    : bValue - aValue;
            
            case 'participants':
                aValue = (a.stages || 0) + (a.agents || 0);
                bValue = (b.stages || 0) + (b.agents || 0);
                return currentTableSortDirection === 'asc' 
                    ? aValue - bValue
                    : bValue - aValue;
            
            case 'progress':
                // Por ahora fijo en 50%, luego se puede hacer dinámico
                aValue = 50;
                bValue = 50;
                return 0;
            
            default:
                return 0;
        }
        });
        
        // Actualizar iconos de ordenamiento
        updateSortIcons(field, currentTableSortDirection);
        
        // Re-renderizar la tabla
        renderTemplatesTable();
    } catch (error) {
        console.error('Error en sortTableBy:', error);
    } finally {
        isSorting = false;
    }
}

// Función para actualizar los iconos de ordenamiento
function updateSortIcons(activeField, direction) {
    try {
        const sortButtons = document.querySelectorAll('.table-sort-btn');
        
        if (!sortButtons || sortButtons.length === 0) {
            return;
        }
        
        sortButtons.forEach(button => {
            if (!button) return;
            
            const field = button.dataset.sort;
            const icon = button.querySelector('i');
            
            if (!icon) return;
            
            // Remover clases activas
            button.classList.remove('active', 'asc', 'desc');
            
            // Si es el campo activo, agregar clases y cambiar icono
            if (field === activeField) {
                button.classList.add('active', direction);
                if (direction === 'asc') {
                    icon.className = 'far fa-arrow-up';
                } else {
                    icon.className = 'far fa-arrow-down';
                }
            } else {
                // Icono por defecto
                icon.className = 'far fa-arrow-down-arrow-up';
            }
        });
    } catch (error) {
        console.error('Error en updateSortIcons:', error);
    }
}

// Función para configurar clicks en filas de la tabla
function setupTableRowClicks() {
    const tableRows = document.querySelectorAll('#templatesTableBody tr');
    
    tableRows.forEach(row => {
        row.addEventListener('click', function(e) {
            // Solo abrir si NO se hace click en un checkbox o botón
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                const templateId = this.dataset.templateId;
                if (templateId) {
                    openTemplateEditor(templateId);
                }
            }
        });
    });
}

function createTemplateCardHTML(template) {
    // Determinar status class y text
    // Asegurar que siempre se muestre el badge si hay un estado definido
    const hasStatus = template.status !== undefined && template.status !== null && template.status !== '';
    const statusClass = hasStatus ? (template.status === 'available' ? 'active' : 'draft') : '';
    const statusText = hasStatus ? (template.status === 'available' ? 'Disponible' : 'Borrador') : '';
    
    // Debug: Log para verificar el estado
    if (template.id === 'default-template-ia') {
        console.log('🔍 [createTemplateCardHTML] Plantilla IA:', {
            id: template.id,
            name: template.name,
            status: template.status,
            statusType: typeof template.status,
            hasStatus: hasStatus,
            statusClass: statusClass,
            statusText: statusText
        });
    }
    
    // Mapear categoría técnica a texto legible
    const categoryMap = {
        'administracion': 'Administración',
        'atencion-cliente': 'Atención al cliente',
        'contratacion-general': 'Contratación general',
        'diseno-creatividad': 'Diseño y creatividad',
        'finanzas-contabilidad': 'Finanzas y contabilidad',
        'ingenieria': 'Ingeniería',
        'operaciones': 'Operaciones',
        'recursos-humanos': 'Recursos humanos',
        'tecnologia-desarrollo': 'Tecnología / Desarrollo',
        'ventas-marketing': 'Ventas y marketing'
    };
    const categoryText = categoryMap[template.category] || template.category;
    
    return `
        <div class="template-card${statusClass ? ' ' + statusClass : ''}" data-template-id="${template.id}">
            <div class="template-header">
                ${hasStatus ? `
                <div class="template-status ${statusClass}">
                    <span>${statusText}</span>
                </div>
                ` : ''}
                ${!hasStatus && template.id === 'default-template-ia' ? `
                <!-- Debug: Badge no mostrado para plantilla IA -->
                ` : ''}
                <div class="template-actions">
                    <button class="ubits-button ubits-button--tertiary ubits-button--icon-only ubits-button--sm" onclick="cloneTemplate('${template.id}')" title="Clonar">
                        <i class="far fa-copy"></i>
                    </button>
                    <button class="ubits-button ubits-button--tertiary ubits-button--icon-only ubits-button--sm" onclick="deleteTemplate('${template.id}')" title="Eliminar">
                        <i class="far fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="template-content">
                <h3 class="template-name">${template.name}</h3>
                <div class="template-meta">
                    <div class="meta-item">
                        <img src="${template.avatar}" alt="${template.author}" class="author-avatar">
                        <span>${template.author}</span>
                    </div>
                    <div class="meta-item">
                        <i class="far fa-tag"></i>
                        <span>${categoryText}</span>
                    </div>
                    <div class="meta-item">
                        <i class="far fa-calendar"></i>
                        <span>Modificado ${formatDate(template.lastModified)}</span>
                    </div>
                </div>
            </div>
            
            <div class="template-stats">
                <div class="stat-item">
                    <div class="stat-value">${template.stages}</div>
                    <div class="stat-label">Etapas</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${template.agents}</div>
                    <div class="stat-label">Agentes</div>
                </div>
            </div>
        </div>
    `;
}

function addTemplateCardEventListeners() {
    // Click en la tarjeta para abrir el editor
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Solo abrir si NO se hace click en un botón
            if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                const templateId = card.dataset.templateId;
                openTemplateEditor(templateId);
            }
        });
    });
}

function getEmptyStateHTML() {
    return `
        <div class="board-empty-state-full">
            <div class="empty-icon-circle">
                <i class="far fa-file-lines"></i>
            </div>
            <h3 class="empty-title">Crea tu primera plantilla de proceso</h3>
            <p class="empty-description">Diseña un flujo de reclutamiento que puedas reutilizar en todos tus procesos. Automatiza tareas, ahorra tiempo y evalúa a tus candidatos de forma consistente.</p>
            <button class="ubits-button ubits-button--primary ubits-button--md" onclick="openCreateTemplateModal()">
                <i class="far fa-plus"></i>
                <span>Crear mi primera plantilla</span>
            </button>
        </div>
    `;
}

function getNoResultsHTML() {
    return `
        <div class="no-results-state">
            <img src="images/empty-states/sin-resultados-img.svg" alt="Sin resultados">
            <h3>No se encontraron plantillas</h3>
            <p>Intenta ajustar los criterios de búsqueda o crear una nueva plantilla.</p>
            <button class="ubits-button ubits-button--primary ubits-button--md" onclick="clearSearch()">
                <i class="far fa-search"></i>
                <span>Limpiar búsqueda</span>
            </button>
        </div>
    `;
}


// ========================================
// ACCIONES DE PLANTILLAS
// ========================================

function createNewTemplate() {
    const newTemplate = {
        id: 'template-' + Date.now(),
        name: 'Nueva plantilla',
        category: 'Personalizada',
        author: 'María Alexandra Patiño Castillo',
        avatar: 'images/Profile-image.jpg',
        version: 1,
        stages: 0,
        agents: 0,
        lastModified: new Date().toISOString().split('T')[0],
        status: 'draft',
        description: 'Plantilla personalizada creada por el usuario',
        realContent: {
            stages: []
        }
    };
    
    currentTemplates.unshift(newTemplate);
    filteredTemplates = [...currentTemplates];
    saveTemplatesToStorage();
    renderTemplates();
    updateTemplatesCount();
    
    // Abrir editor inmediatamente
    openTemplateEditor(newTemplate.id);
}

function openTemplateEditor(templateId) {
    // Navegar al editor con el ID de la plantilla
    window.location.href = `editor-plantillas.html?id=${templateId}`;
}

// Funciones activateTemplate y convertToDraft eliminadas
// Ya no se usan botones de activar/editar en las cards

function cloneTemplate(templateId) {
    const template = currentTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    showConfirmModal({
        title: 'Clonar plantilla',
        message: `¿Estás seguro de que quieres clonar la plantilla <strong>${template.name}</strong>? Se creará una copia como borrador.`,
        confirmText: 'Clonar',
        cancelText: 'Cancelar',
        variant: 'primary',
        onConfirm: () => {
            const clonedTemplate = {
                ...template,
                id: 'template-' + Date.now(),
                name: 'Copia de ' + template.name,
                version: 1,
                lastModified: new Date().toISOString().split('T')[0],
                status: 'draft',
                realContent: template.realContent ? JSON.parse(JSON.stringify(template.realContent)) : null
            };
            
            currentTemplates.unshift(clonedTemplate);
            filteredTemplates = [...currentTemplates];
            saveTemplatesToStorage();
            renderTemplates();
            updateTemplatesCount();
            
            // Mostrar toast de éxito
            if (typeof showToast === 'function') {
                showToast('success', `Plantilla "${template.name}" clonada exitosamente`);
            }
        },
        onCancel: () => {
            console.log('Clonación de plantilla cancelada');
        }
    });
}

function deleteTemplate(templateId) {
    const template = currentTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    showConfirmModal({
        title: 'Eliminar plantilla',
        message: `¿Estás seguro de que quieres eliminar la plantilla <strong>${template.name}</strong>? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        variant: 'primary',
        onConfirm: () => {
            const templateName = template.name;
            currentTemplates = currentTemplates.filter(t => t.id !== templateId);
            filteredTemplates = filteredTemplates.filter(t => t.id !== templateId);
            saveTemplatesToStorage();
            renderTemplates();
            updateTemplatesCount();
            
            // Mostrar toast de éxito
            if (typeof showToast === 'function') {
                showToast('success', `Plantilla "${templateName}" eliminada exitosamente`);
            }
        },
        onCancel: () => {
            console.log('Eliminación de plantilla cancelada');
        }
    });
}

// ========================================
// UTILIDADES
// ========================================

function updateTemplatesCount() {
    const countElement = document.getElementById('templatesCount');
    if (countElement) {
        // Mostrar el total de plantillas (no solo las filtradas)
        countElement.textContent = currentTemplates.length;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return 'ayer';
    } else if (diffDays < 7) {
        return `hace ${diffDays} días`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
    } else {
        return date.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

// Sistema entregado en blanco - sin datos de migración necesarios
