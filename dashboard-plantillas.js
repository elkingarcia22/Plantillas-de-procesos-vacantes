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
let isViewingSelected = false; // Estado para ver solo seleccionados

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
        
        // Logs para debuggear espaciado
        setTimeout(() => {
            debugSpacing();
        }, 500);
    } catch (error) {
        console.error('Error en initializeDashboard:', error);
    }
}

// Función para debuggear el espaciado entre subnav y tabla
function debugSpacing() {
    console.log('🔍 ========== DEBUG ESPACIADO ==========');
    
    const subnav = document.querySelector('.sub-nav');
    const topNavContainer = document.getElementById('top-nav-container');
    const contentArea = document.querySelector('.content-area');
    const dashboardPlantillas = document.querySelector('.dashboard-plantillas');
    const templatesTableContainer = document.querySelector('.templates-table-container');
    const mainContent = document.querySelector('.main-content');
    
    console.log('📏 Elementos encontrados:', {
        subnav: !!subnav,
        topNavContainer: !!topNavContainer,
        contentArea: !!contentArea,
        dashboardPlantillas: !!dashboardPlantillas,
        templatesTableContainer: !!templatesTableContainer,
        mainContent: !!mainContent
    });
    
    if (subnav) {
        const subnavRect = subnav.getBoundingClientRect();
        const subnavStyles = window.getComputedStyle(subnav);
        console.log('📐 SubNav:', {
            top: subnavRect.top,
            bottom: subnavRect.bottom,
            height: subnavRect.height,
            marginTop: subnavStyles.marginTop,
            marginBottom: subnavStyles.marginBottom,
            paddingTop: subnavStyles.paddingTop,
            paddingBottom: subnavStyles.paddingBottom
        });
    }
    
    if (topNavContainer) {
        const containerRect = topNavContainer.getBoundingClientRect();
        const containerStyles = window.getComputedStyle(topNavContainer);
        console.log('📐 Top Nav Container:', {
            top: containerRect.top,
            bottom: containerRect.bottom,
            height: containerRect.height,
            marginTop: containerStyles.marginTop,
            marginBottom: containerStyles.marginBottom,
            paddingTop: containerStyles.paddingTop,
            paddingBottom: containerStyles.paddingBottom
        });
    }
    
    if (contentArea) {
        const contentRect = contentArea.getBoundingClientRect();
        const contentStyles = window.getComputedStyle(contentArea);
        console.log('📐 Content Area:', {
            top: contentRect.top,
            bottom: contentRect.bottom,
            height: contentRect.height,
            marginTop: contentStyles.marginTop,
            marginBottom: contentStyles.marginBottom,
            paddingTop: contentStyles.paddingTop,
            paddingBottom: contentStyles.paddingBottom
        });
    }
    
    if (dashboardPlantillas) {
        const dashboardRect = dashboardPlantillas.getBoundingClientRect();
        const dashboardStyles = window.getComputedStyle(dashboardPlantillas);
        console.log('📐 Dashboard Plantillas:', {
            top: dashboardRect.top,
            bottom: dashboardRect.bottom,
            height: dashboardRect.height,
            marginTop: dashboardStyles.marginTop,
            marginBottom: dashboardStyles.marginBottom,
            paddingTop: dashboardStyles.paddingTop,
            paddingBottom: dashboardStyles.paddingBottom,
            gap: dashboardStyles.gap
        });
    }
    
    if (templatesTableContainer) {
        const tableRect = templatesTableContainer.getBoundingClientRect();
        const tableStyles = window.getComputedStyle(templatesTableContainer);
        console.log('📐 Templates Table Container:', {
            top: tableRect.top,
            bottom: tableRect.bottom,
            height: tableRect.height,
            marginTop: tableStyles.marginTop,
            marginBottom: tableStyles.marginBottom,
            paddingTop: tableStyles.paddingTop,
            paddingBottom: tableStyles.paddingBottom
        });
    }
    
    if (mainContent) {
        const mainRect = mainContent.getBoundingClientRect();
        const mainStyles = window.getComputedStyle(mainContent);
        console.log('📐 Main Content:', {
            top: mainRect.top,
            bottom: mainRect.bottom,
            height: mainRect.height,
            marginTop: mainStyles.marginTop,
            marginBottom: mainStyles.marginBottom,
            paddingTop: mainStyles.paddingTop,
            paddingBottom: mainStyles.paddingBottom,
            gap: mainStyles.gap
        });
    }
    
    // Calcular distancia entre subnav y tabla
    if (subnav && templatesTableContainer) {
        const subnavBottom = subnav.getBoundingClientRect().bottom;
        const tableTop = templatesTableContainer.getBoundingClientRect().top;
        const distance = tableTop - subnavBottom;
        console.log('📏 DISTANCIA ENTRE SUBNav Y TABLA:', {
            subnavBottom: subnavBottom,
            tableTop: tableTop,
            distancia: distance + 'px',
            distanciaEsperada: '24px'
        });
    }
    
    console.log('🔍 ======================================');
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
        category: 'contratacion-general',
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
        category: 'contratacion-general',
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

// Variable para prevenir loops infinitos y debounce
let isApplyingFilters = false;
let applyFiltersTimeout = null;

// Función para aplicar todos los filtros (búsqueda + filtros del drawer)
function applyTemplateFilters() {
    // Cancelar timeout anterior si existe
    if (applyFiltersTimeout) {
        clearTimeout(applyFiltersTimeout);
        applyFiltersTimeout = null;
    }
    
    // Prevenir loops infinitos
    if (isApplyingFilters) {
        // Si ya está aplicando, programar una nueva ejecución después
        applyFiltersTimeout = setTimeout(() => {
            applyTemplateFilters();
        }, 150);
        return;
    }
    
    isApplyingFilters = true;
    
    try {
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
            
            console.log('🔍 [applyTemplateFilters] Filtros activos:', filters);
            console.log('🔍 [applyTemplateFilters] Plantillas antes de filtrar:', templates.length);
            
            // Filtro de estado
            if (filters.status && filters.status.length > 0) {
                console.log('🔍 [applyTemplateFilters] Aplicando filtro de estado:', filters.status);
                const beforeCount = templates.length;
                templates = templates.filter(template => {
                    const matches = filters.status.includes(template.status);
                    if (!matches) {
                        console.log(`  - ${template.name}: status="${template.status}", NO coincide con ${filters.status.join(', ')}`);
                    }
                    return matches;
                });
                console.log(`✅ [applyTemplateFilters] Filtrado de estado: ${beforeCount} -> ${templates.length}`);
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
        
        // Si estamos en modo "ver seleccionados", aplicar ese filtro también
        if (isViewingSelected) {
            const selectedIds = getSelectedTemplateIds();
            if (selectedIds.length > 0) {
                filteredTemplates = filteredTemplates.filter(template => selectedIds.includes(template.id));
            } else {
                // Si no hay selección, desactivar modo
                isViewingSelected = false;
            }
        }
        
        // Aplicar ordenamiento y renderizar
        applySorting();
        renderTemplates();
        updateTemplatesCount();
    } finally {
        // Liberar el flag inmediatamente después de completar
        isApplyingFilters = false;
    }
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

// Función para verificar si hay filtros activos (excluyendo búsqueda)
function hasActiveFilters() {
    if (typeof window.activeFilters === 'undefined' || !window.activeFilters) {
        return false;
    }
    
    const filters = window.activeFilters;
    
    // Verificar si hay filtros de estado
    if (filters.status && filters.status.length > 0) {
        return true;
    }
    
    // Verificar si hay filtros de fecha
    if (filters.dateFrom || filters.dateTo) {
        return true;
    }
    
    // Verificar si hay filtro de agentes
    if (filters.hasAgents !== null && filters.hasAgents !== undefined) {
        return true;
    }
    
    return false;
}

// Función para limpiar todos los filtros
function clearAllFilters() {
    // Prevenir múltiples llamadas
    if (isApplyingFilters) {
        console.log('⏸️ [clearAllFilters] Ya está aplicando filtros, saltando...');
        return;
    }
    
    // Limpiar búsqueda
    const searchInput = document.getElementById('searchTemplates');
    if (searchInput) {
        searchInput.value = '';
        isSearching = false;
        const clearBtn = document.getElementById('clearSearchTemplates');
        if (clearBtn) {
            clearBtn.style.display = 'none';
        }
    }
    
    // Limpiar filtros del drawer
    if (typeof window.activeFilters !== 'undefined') {
        window.activeFilters = {
            status: [],
            dateFrom: null,
            dateTo: null,
            hasAgents: null
        };
    }
    
    // Limpiar inputs del drawer si existen
    if (window.filterStatusSelectInstance) {
        try {
            window.filterStatusSelectInstance.setValue('Todos los estados');
        } catch (e) {
            console.warn('Error limpiando select de estado:', e);
        }
    }
    if (window.filterDateFromInstance) {
        try {
            window.filterDateFromInstance.setValue('');
        } catch (e) {
            console.warn('Error limpiando fecha desde:', e);
        }
    }
    if (window.filterDateToInstance) {
        try {
            window.filterDateToInstance.setValue('');
        } catch (e) {
            console.warn('Error limpiando fecha hasta:', e);
        }
    }
    
    // Limpiar radio buttons de agentes
    const agentsYes = document.getElementById('filter-agents-yes');
    const agentsNo = document.getElementById('filter-agents-no');
    if (agentsYes) agentsYes.checked = false;
    if (agentsNo) agentsNo.checked = false;
    
    // Actualizar badge
    if (typeof updateFilterBadge === 'function') {
        updateFilterBadge();
    }
    
    // Cerrar drawer si está abierto
    if (typeof closeFilterDrawer === 'function') {
        closeFilterDrawer();
    }
    
    // Aplicar filtros (ahora sin filtros) - solo una vez
    applyTemplateFilters();
}

// Exponer función globalmente para que index.html pueda usarla
window.clearAllFiltersFromDashboard = clearAllFilters;

// Función para abrir el drawer de filtros
function openFilterDrawer() {
    if (typeof toggleFilterDrawer === 'function') {
        toggleFilterDrawer();
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
        // Verificar qué vista está activa
        const tableView = document.getElementById('tableViewContainer');
        const cardsView = document.getElementById('cardsViewContainer');
        
        // Exponer filteredTemplates globalmente para que renderTemplatesCards pueda acceder
        window.filteredTemplates = filteredTemplates;
        window.currentTemplates = currentTemplates;
        
        // Determinar qué vista está activa
        const isTableViewActive = tableView && (tableView.style.display === '' || tableView.style.display === 'block');
        const isCardsViewActive = cardsView && cardsView.style.display === 'block';
        
        console.log('🔍 Vista activa:', {
            isTableViewActive,
            isCardsViewActive,
            tableViewDisplay: tableView ? tableView.style.display : 'no existe',
            cardsViewDisplay: cardsView ? cardsView.style.display : 'no existe',
            filteredTemplatesCount: filteredTemplates ? filteredTemplates.length : 0
        });
        
        // Verificar si hay plantillas
        const tableContainer = document.getElementById('templatesTableContainer');
        
        // Crear o obtener contenedor de empty state
        let emptyStateContainer = document.getElementById('emptyStateContainer');
        if (!emptyStateContainer) {
            emptyStateContainer = document.createElement('div');
            emptyStateContainer.id = 'emptyStateContainer';
            emptyStateContainer.className = 'empty-state-container';
            const contentArea = document.querySelector('.content-area');
            if (contentArea) {
                contentArea.appendChild(emptyStateContainer);
            }
        }
        
        // Verificar si hay búsqueda o filtros activos
        const searchInput = document.getElementById('searchTemplates');
        const hasSearchQuery = searchInput && searchInput.value.trim().length > 0;
        const hasFilters = hasActiveFilters();
        const hasAnyFilter = hasSearchQuery || hasFilters || isViewingSelected;
        
        if (!filteredTemplates || !Array.isArray(filteredTemplates) || filteredTemplates.length === 0) {
            // Si no hay filtros y no hay plantillas, mostrar empty state fuera del contenedor
            if (!hasAnyFilter && currentTemplates.length === 0) {
                // Ocultar contenedor de tabla y header
                if (tableContainer) {
                    tableContainer.style.display = 'none';
                }
                
                // Mostrar empty state fuera del contenedor
                emptyStateContainer.innerHTML = getEmptyStateHTML();
                emptyStateContainer.style.display = 'block';
                isRendering = false;
                return;
            }
            
            // Hay filtros o búsqueda: mostrar dentro del contenedor (SIEMPRE mostrar tabla cuando hay filtros)
            if (tableContainer) {
                tableContainer.style.display = 'block';
            }
            if (emptyStateContainer) {
                emptyStateContainer.style.display = 'none';
            }
            
            if (isTableViewActive) {
                renderTemplatesTable(); // La tabla maneja su propio empty state
            } else if (isCardsViewActive) {
                // Renderizar empty state en cards
                const cardsContainer = document.getElementById('templatesCardsGrid');
                if (cardsContainer) {
                    if (isSearching && currentTemplates.length > 0) {
                        cardsContainer.innerHTML = getNoResultsHTML();
                    } else {
                        cardsContainer.innerHTML = getEmptyStateHTML();
                    }
                }
            }
            isRendering = false;
            return;
        }
        
        // Hay plantillas: mostrar contenedor y ocultar empty state
        if (tableContainer) {
            tableContainer.style.display = 'block';
        }
        if (emptyStateContainer) {
            emptyStateContainer.style.display = 'none';
        }
        
        // Renderizar según la vista activa
        if (isTableViewActive) {
            // Renderizar tabla
            console.log('📊 Renderizando tabla');
            renderTemplatesTable();
        } else if (isCardsViewActive) {
            // Renderizar cards
            console.log('🎴 Renderizando cards');
            if (typeof window.renderTemplatesCards === 'function') {
                window.renderTemplatesCards();
            } else if (typeof renderTemplatesCards === 'function') {
                renderTemplatesCards();
            } else {
                console.error('❌ renderTemplatesCards no está disponible');
                // Fallback: renderizar tabla si la función no existe
                renderTemplatesTable();
            }
        } else {
            // Por defecto renderizar tabla
            console.log('📊 Vista por defecto: tabla');
            renderTemplatesTable();
        }
        
        // Agregar event listeners a las cards si están visibles
        if (cardsView && cardsView.style.display !== 'none') {
            if (typeof addTemplateCardEventListeners === 'function') {
                addTemplateCardEventListeners();
            }
        }
    } catch (error) {
        console.error('Error en renderTemplates:', error);
    } finally {
        isRendering = false;
    }
}

// Función para renderizar la tabla de plantillas
// Variable para prevenir re-renderizados múltiples
let isRenderingTable = false;

function renderTemplatesTable() {
    // Prevenir múltiples renderizados simultáneos
    if (isRenderingTable) {
        console.log('⏸️ [renderTemplatesTable] Ya está renderizando, saltando...');
        return;
    }
    
    isRenderingTable = true;
    console.log('🔄 [renderTemplatesTable] Iniciando renderizado de tabla');
    
    try {
        const tableBody = document.getElementById('templatesTableBody');
        if (!tableBody) {
            console.error('❌ [renderTemplatesTable] No se encontró templatesTableBody');
            isRenderingTable = false;
            return;
        }
        
        if (!filteredTemplates || !Array.isArray(filteredTemplates)) {
            console.log('⚠️ [renderTemplatesTable] filteredTemplates no es válido');
            tableBody.innerHTML = '';
            isRenderingTable = false;
            return;
        }
        
        console.log('🔍 [renderTemplatesTable] Plantillas filtradas:', filteredTemplates.length);
        
        if (filteredTemplates.length === 0) {
            // Renderizar empty state simple y limpio
            tableBody.innerHTML = renderTableEmptyState();
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
        
        // Guardar IDs de plantillas seleccionadas antes de renderizar
        const selectedIds = getSelectedTemplateIds();
        
        tableBody.innerHTML = filteredTemplates.map(template => {
            const hasStatus = template.status !== undefined && template.status !== null && template.status !== '';
            const statusClass = hasStatus ? (template.status === 'available' ? 'available' : 'draft') : 'draft';
            const statusText = hasStatus ? (template.status === 'available' ? 'Disponible' : 'Borrador') : 'Borrador';
            const categoryText = categoryMap[template.category] || template.category || 'Sin categoría';
            
            // Verificar si esta plantilla está seleccionada
            const isSelected = selectedIds.includes(template.id);
            
            // Calcular etapas (todas las etapas del flujo, incluyendo agentes IA)
            // Usar realContent.stages.length si existe, sino usar template.stages como fallback
            const stagesCount = template.realContent && template.realContent.stages 
                ? template.realContent.stages.length 
                : (template.stages || 0);
            
            // Log para debuggear cálculo de etapas
            if (template.id === 'default-template-ia') {
                console.log('🔍 [Etapas] Plantilla IA:', {
                    id: template.id,
                    name: template.name,
                    realContentStages: template.realContent?.stages?.length || 'no existe',
                    templateStages: template.stages || 0,
                    stagesCount: stagesCount
                });
            }
            
            // Formatear fecha de creación
            const createdDate = template.createdAt ? formatDateForTable(template.createdAt) : 'N/A';
            
            // Formatear fecha de modificación
            const modifiedDate = template.lastModified ? formatDateForTable(template.lastModified) : 'N/A';
            
            // Obtener número de agentes IA del flujo
            const agentsCount = template.agents || 0;
            
            return `
                <tr data-template-id="${template.id}">
                    <td class="table-checkbox">
                        <input type="checkbox" class="template-checkbox" data-template-id="${template.id}" ${isSelected ? 'checked' : ''}>
                    </td>
                    <td data-column="name" class="table-name column-name">${template.name || 'Sin nombre'}</td>
                    <td data-column="category" class="table-category column-category">
                        <span class="table-category-badge" data-template-id="${template.id}" data-current-category="${template.category || 'contratacion-general'}" style="cursor: pointer;" title="Click para cambiar categoría">
                            ${categoryText}
                            <i class="far fa-chevron-down" style="margin-left: 6px; font-size: 10px; opacity: 0.7;"></i>
                        </span>
                    </td>
                    <td data-column="status" class="table-status column-status">
                        <span class="table-status-badge ${statusClass}" data-template-id="${template.id}" data-current-status="${template.status || 'draft'}" style="cursor: pointer;" title="Click para cambiar estado">
                            ${statusText}
                            <i class="far fa-chevron-down" style="margin-left: 6px; font-size: 10px; opacity: 0.7;"></i>
                        </span>
                    </td>
                    <td data-column="created" class="table-date column-created">${createdDate}</td>
                    <td data-column="modified" class="table-date column-modified">${modifiedDate}</td>
                    <td data-column="agents" class="table-agents column-agents">${agentsCount}</td>
                    <td data-column="stages" class="table-stages column-stages">${stagesCount}</td>
                </tr>
            `;
        }).join('');
    
        // Agregar event listeners para checkboxes
        setupTableCheckboxes();
        
        // Actualizar el estado del checkbox del header después de renderizar
        updateSelectAllCheckbox();
        
        // Agregar event listeners para ordenamiento
        setupTableSorting();
        
        // Agregar event listeners para clicks en filas
        setupTableRowClicks();
        
        // Agregar event listeners para cambio de estado
        setupStatusChangeListeners();
        setupCategoryChangeListeners();
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

// Variable para almacenar el handler del checkbox del header
let selectAllCheckboxHandler = null;

// Función para configurar checkboxes de la tabla
function setupTableCheckboxes() {
    const selectAllCheckbox = document.getElementById('selectAllTemplates');
    const rowCheckboxes = document.querySelectorAll('.template-checkbox');
    
    if (selectAllCheckbox) {
        // Remover listener anterior si existe
        if (selectAllCheckboxHandler) {
            selectAllCheckbox.removeEventListener('change', selectAllCheckboxHandler);
        }
        
        // Crear nuevo handler
        selectAllCheckboxHandler = function() {
            // Obtener checkboxes actuales (pueden haber cambiado)
            const currentRowCheckboxes = document.querySelectorAll('.template-checkbox');
            const checkedCount = Array.from(currentRowCheckboxes).filter(checkbox => checkbox.checked).length;
            const totalCount = currentRowCheckboxes.length;
            
            // Si todos están seleccionados o estaba en estado indeterminado, deseleccionar todos
            // Si no todos están seleccionados, seleccionar todos
            const shouldSelectAll = checkedCount < totalCount;
            
            currentRowCheckboxes.forEach(checkbox => {
                checkbox.checked = shouldSelectAll;
            });
            
            // Limpiar estado indeterminado
            this.indeterminate = false;
            
            // Actualizar el estado del checkbox del header
            updateSelectAllCheckbox();
            
            // Si estamos en modo "ver seleccionados", actualizar el filtro
            if (isViewingSelected) {
                const selectedIds = getSelectedTemplateIds();
                if (selectedIds.length === 0) {
                    // Si no hay selección, desactivar modo y mostrar todas
                    isViewingSelected = false;
                    filteredTemplates = [...currentTemplates];
                } else {
                    // Actualizar filtro con las nuevas selecciones
                    filteredTemplates = currentTemplates.filter(template => selectedIds.includes(template.id));
                }
                if (typeof renderTemplates === 'function') {
                    renderTemplates();
                }
            }
            
            updateActionBar();
        };
        
        selectAllCheckbox.addEventListener('change', selectAllCheckboxHandler);
    }
    
    rowCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateSelectAllCheckbox();
            
            // Si estamos en modo "ver seleccionados", actualizar el filtro
            if (isViewingSelected) {
                const selectedIds = getSelectedTemplateIds();
                if (selectedIds.length === 0) {
                    // Si no hay selección, desactivar modo y mostrar todas
                    isViewingSelected = false;
                    filteredTemplates = [...currentTemplates];
                } else {
                    // Actualizar filtro con las nuevas selecciones
                    filteredTemplates = currentTemplates.filter(template => selectedIds.includes(template.id));
                }
                if (typeof renderTemplates === 'function') {
                    renderTemplates();
                }
            }
            
            updateActionBar();
        });
    });
}

// Función para actualizar el checkbox "Seleccionar todas"
function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAllTemplates');
    const rowCheckboxes = document.querySelectorAll('.template-checkbox');
    
    if (selectAllCheckbox && rowCheckboxes.length > 0) {
        const checkedCount = Array.from(rowCheckboxes).filter(checkbox => checkbox.checked).length;
        const totalCount = rowCheckboxes.length;
        
        if (checkedCount === 0) {
            // Ninguno seleccionado
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else if (checkedCount === totalCount) {
            // Todos seleccionados
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else {
            // Algunos seleccionados (estado indeterminado)
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        }
    }
}

// Función para actualizar la barra de acciones
function updateActionBar() {
    const actionBar = document.getElementById('actionBar');
    const selectedCountElement = document.getElementById('selectedCount');
    const viewSelectedButton = document.getElementById('viewSelectedButton');
    const duplicateButton = document.getElementById('duplicateButton');
    const editButton = document.getElementById('editButton');
    const deleteButton = document.getElementById('deleteButton');
    
    const rowCheckboxes = document.querySelectorAll('.template-checkbox');
    const selectedCheckboxes = Array.from(rowCheckboxes).filter(cb => cb.checked);
    const selectedCount = selectedCheckboxes.length;
    
    if (actionBar && selectedCountElement) {
        if (selectedCount > 0) {
            actionBar.style.display = 'flex';
            selectedCountElement.textContent = selectedCount;
            
            // Si hay más de una plantilla seleccionada, mostrar acciones masivas
            if (selectedCount > 1) {
                // Mostrar acciones masivas: Ver seleccionados, Duplicar, Eliminar
                if (viewSelectedButton) viewSelectedButton.style.display = 'flex';
                if (duplicateButton) duplicateButton.style.display = 'flex';
                if (deleteButton) deleteButton.style.display = 'flex';
                // Ocultar Editar (solo funciona con una plantilla)
                if (editButton) editButton.style.display = 'none';
            } else {
                // Si hay solo una plantilla, mostrar todos los botones
                if (viewSelectedButton) viewSelectedButton.style.display = 'flex';
                if (duplicateButton) duplicateButton.style.display = 'flex';
                if (editButton) editButton.style.display = 'flex';
                if (deleteButton) deleteButton.style.display = 'flex';
            }
        } else {
            actionBar.style.display = 'none';
        }
    }
}

// Función para obtener los IDs de las plantillas seleccionadas
function getSelectedTemplateIds() {
    const rowCheckboxes = document.querySelectorAll('.template-checkbox:checked');
    return Array.from(rowCheckboxes).map(cb => cb.getAttribute('data-template-id'));
}

// Función para ver plantillas seleccionadas
// Función para limpiar la vista de seleccionados (usada desde el empty state)
function clearSelectedView() {
    if (isViewingSelected) {
        viewSelectedTemplates();
    }
}

function viewSelectedTemplates() {
    const viewSelectedButton = document.getElementById('viewSelectedButton');
    const viewSelectedIcon = viewSelectedButton ? viewSelectedButton.querySelector('i') : null;
    const viewSelectedText = viewSelectedButton ? viewSelectedButton.querySelector('span') : null;
    
    // Si ya estamos viendo seleccionados, volver a mostrar todas
    if (isViewingSelected) {
        isViewingSelected = false;
        
        // Guardar IDs seleccionados antes de restaurar
        const selectedIds = getSelectedTemplateIds();
        
        // Restaurar todas las plantillas (aplicando filtros existentes)
        applyTemplateFilters();
        
        // Actualizar botón: volver a estado normal
        if (viewSelectedButton) {
            viewSelectedButton.classList.remove('ubits-button--active');
        }
        if (viewSelectedIcon) {
            viewSelectedIcon.className = 'far fa-eye';
        }
        if (viewSelectedText) {
            const selectedCount = selectedIds.length;
            viewSelectedText.innerHTML = `Ver seleccionados (<span id="selectedCount">${selectedCount}</span>)`;
        }
        
        // Renderizar todas las plantillas (los checkboxes se restaurarán automáticamente)
        if (typeof renderTemplates === 'function') {
            renderTemplates();
        }
        if (typeof updateTemplatesCount === 'function') {
            updateTemplatesCount();
        }
        
        // Restaurar checkboxes después de renderizar
        setTimeout(() => {
            selectedIds.forEach(id => {
                const checkbox = document.querySelector(`.template-checkbox[data-template-id="${id}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
            updateSelectAllCheckbox();
            updateActionBar();
        }, 100);
        
        return;
    }
    
    // Activar modo "ver seleccionados"
    const selectedIds = getSelectedTemplateIds();
    if (selectedIds.length === 0) {
        if (typeof showToast === 'function') {
            showToast('warning', 'No hay plantillas seleccionadas');
        }
        return;
    }
    
    isViewingSelected = true;
    
    // Aplicar filtros existentes primero (búsqueda, filtros de estado, etc.)
    // Sin llamar a renderTemplates() todavía
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
                toDate.setHours(23, 59, 59, 999);
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
    
    // Finalmente, filtrar solo las plantillas seleccionadas
    filteredTemplates = templates.filter(template => selectedIds.includes(template.id));
    
    console.log('👁️ Modo "ver seleccionados" activado:', {
        selectedIds: selectedIds,
        filteredTemplatesCount: filteredTemplates.length,
        filteredTemplates: filteredTemplates.map(t => ({ id: t.id, name: t.name }))
    });
    
    // Actualizar botón: estado activo
    if (viewSelectedButton) {
        viewSelectedButton.classList.add('ubits-button--active');
    }
    if (viewSelectedIcon) {
        viewSelectedIcon.className = 'far fa-eye-slash';
    }
    if (viewSelectedText) {
        viewSelectedText.innerHTML = 'Dejar de ver seleccionados';
    }
    
    // Aplicar ordenamiento
    applySorting();
    
    // Renderizar solo las plantillas seleccionadas
    if (typeof renderTemplates === 'function') {
        renderTemplates();
    }
    if (typeof updateTemplatesCount === 'function') {
        updateTemplatesCount();
    }
}

// Función para duplicar plantillas seleccionadas
function duplicateSelectedTemplates() {
    const selectedIds = getSelectedTemplateIds();
    if (selectedIds.length === 0) {
        if (typeof showToast === 'function') {
            showToast('warning', 'No hay plantillas seleccionadas');
        }
        return;
    }
    
    // Obtener plantillas del localStorage
    let templates = JSON.parse(localStorage.getItem('templates') || '[]');
    
    // Buscar las plantillas seleccionadas
    const templatesToClone = templates.filter(template => selectedIds.includes(template.id));
    
    if (templatesToClone.length === 0) {
        if (typeof showToast === 'function') {
            showToast('warning', 'No se encontraron las plantillas seleccionadas');
        }
        return;
    }
    
    // Preparar mensaje de confirmación
    const confirmTitle = templatesToClone.length === 1 
        ? 'Duplicar plantilla'
        : `Duplicar ${templatesToClone.length} plantillas`;
    
    const templateNames = templatesToClone.map(t => t.name).join(', ');
    const confirmMessage = templatesToClone.length === 1
        ? `¿Estás seguro de que quieres duplicar la plantilla <strong>${templateNames}</strong>? Se creará una copia como borrador.`
        : `¿Estás seguro de que quieres duplicar ${templatesToClone.length} plantillas? Se crearán copias como borrador.`;
    
    // Mostrar modal de confirmación UBITS
    if (typeof showConfirmModal === 'function') {
        showConfirmModal({
            title: confirmTitle,
            message: confirmMessage,
            confirmText: 'Duplicar',
            cancelText: 'Cancelar',
            variant: 'primary',
            onConfirm: function() {
                // Duplicar cada plantilla con IDs únicos
                const baseTimestamp = Date.now();
                const clonedTemplates = templatesToClone.map((template, index) => {
                    // Generar ID único para cada plantilla clonada
                    const uniqueId = 'template-' + (baseTimestamp + index) + '-' + Math.random().toString(36).substr(2, 9);
                    return {
                        ...template,
                        id: uniqueId,
                        name: 'Copia de ' + template.name,
                        version: 1,
                        status: 'draft',
                        createdAt: new Date().toISOString(),
                        lastModified: new Date().toISOString().split('T')[0],
                        // Clonar deep copy de realContent si existe
                        realContent: template.realContent ? JSON.parse(JSON.stringify(template.realContent)) : {
                            stages: []
                        }
                    };
                });
                
                // Agregar las plantillas clonadas al inicio del array
                templates.unshift(...clonedTemplates);
                
                // Guardar en localStorage
                localStorage.setItem('templates', JSON.stringify(templates));
                
                // Actualizar variables globales
                currentTemplates = templates;
                filteredTemplates = [...currentTemplates];
                
                // Mostrar confirmación
                if (typeof showToast === 'function') {
                    showToast('success', `${clonedTemplates.length} plantilla(s) duplicada(s) exitosamente`);
                }
                
                // Recargar y renderizar la tabla
                if (typeof loadTemplatesFromStorage === 'function') {
                    loadTemplatesFromStorage();
                }
                if (typeof renderTemplates === 'function') {
                    renderTemplates();
                }
                if (typeof updateTemplatesCount === 'function') {
                    updateTemplatesCount();
                }
                
                // Deseleccionar todos los checkboxes
                const rowCheckboxes = document.querySelectorAll('.template-checkbox');
                rowCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                const selectAllCheckbox = document.getElementById('selectAllTemplates');
                if (selectAllCheckbox) {
                    selectAllCheckbox.checked = false;
                }
                
                // Ocultar la barra de acciones
                updateActionBar();
            },
            onCancel: function() {
                // No hacer nada al cancelar
            }
        });
    } else {
        // Fallback: duplicar sin confirmación si el modal no está disponible
        const baseTimestamp = Date.now();
        const clonedTemplates = templatesToClone.map((template, index) => {
            // Generar ID único para cada plantilla clonada
            const uniqueId = 'template-' + (baseTimestamp + index) + '-' + Math.random().toString(36).substr(2, 9);
            return {
                ...template,
                id: uniqueId,
                name: 'Copia de ' + template.name,
                version: 1,
                status: 'draft',
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString().split('T')[0],
                realContent: template.realContent ? JSON.parse(JSON.stringify(template.realContent)) : {
                    stages: []
                }
            };
        });
        
        templates.unshift(...clonedTemplates);
        localStorage.setItem('templates', JSON.stringify(templates));
        
        // Actualizar variables globales
        currentTemplates = templates;
        filteredTemplates = [...currentTemplates];
        
        if (typeof showToast === 'function') {
            showToast('success', `${clonedTemplates.length} plantilla(s) duplicada(s) exitosamente`);
        }
        
        // Recargar y renderizar la tabla
        if (typeof loadTemplatesFromStorage === 'function') {
            loadTemplatesFromStorage();
        }
        if (typeof renderTemplates === 'function') {
            renderTemplates();
        }
        if (typeof updateTemplatesCount === 'function') {
            updateTemplatesCount();
        }
        
        // Deseleccionar todos los checkboxes
        const rowCheckboxes = document.querySelectorAll('.template-checkbox');
        rowCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        const selectAllCheckbox = document.getElementById('selectAllTemplates');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }
        
        updateActionBar();
    }
}

// Función para editar plantilla seleccionada (solo una)
function editSelectedTemplate() {
    const selectedIds = getSelectedTemplateIds();
    if (selectedIds.length === 0) {
        if (typeof showToast === 'function') {
            showToast('warning', 'No hay plantillas seleccionadas');
        }
        return;
    }
    if (selectedIds.length > 1) {
        if (typeof showToast === 'function') {
            showToast('warning', 'Solo puedes editar una plantilla a la vez');
        }
        return;
    }
    // Redirigir al editor
    window.location.href = `editor-plantillas.html?id=${selectedIds[0]}`;
}

// Función para eliminar plantillas seleccionadas
function deleteSelectedTemplates() {
    const selectedIds = getSelectedTemplateIds();
    if (selectedIds.length === 0) {
        if (typeof showToast === 'function') {
            showToast('warning', 'No hay plantillas seleccionadas');
        }
        return;
    }
    
    // Usar modal de confirmación UBITS
    const confirmTitle = selectedIds.length === 1 
        ? 'Eliminar plantilla'
        : `Eliminar ${selectedIds.length} plantillas`;
    
    const confirmMessage = selectedIds.length === 1 
        ? '¿Estás seguro de que deseas eliminar esta plantilla? Esta acción no se puede deshacer.'
        : `¿Estás seguro de que deseas eliminar ${selectedIds.length} plantillas? Esta acción no se puede deshacer.`;
    
    if (typeof showConfirmModal === 'function') {
        showConfirmModal({
            title: confirmTitle,
            message: confirmMessage,
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            variant: 'primary',
            onConfirm: function() {
                // Obtener plantillas del localStorage
                let templates = JSON.parse(localStorage.getItem('templates') || '[]');
                
                // Filtrar las plantillas seleccionadas
                templates = templates.filter(template => !selectedIds.includes(template.id));
                
                // Guardar en localStorage
                localStorage.setItem('templates', JSON.stringify(templates));
                
                // Actualizar variables globales
                currentTemplates = templates;
                filteredTemplates = [...currentTemplates];
                
                // Actualizar filteredTemplates aplicando filtros actuales
                const searchInput = document.getElementById('searchTemplates');
                const searchQuery = searchInput ? searchInput.value.trim() : '';
                
                if (searchQuery || hasActiveFilters() || isViewingSelected) {
                    // Si hay filtros activos, aplicar la búsqueda para actualizar filteredTemplates
                    if (typeof handleSearch === 'function') {
                        handleSearch(searchQuery);
                    } else {
                        filteredTemplates = [...currentTemplates];
                    }
                } else {
                    // Sin filtros, simplemente copiar todas las plantillas
                    filteredTemplates = [...currentTemplates];
                }
                
                // Mostrar confirmación
                if (typeof showToast === 'function') {
                    showToast('success', `${selectedIds.length} plantilla(s) eliminada(s) exitosamente`);
                }
                
                // Renderizar la tabla con las plantillas actualizadas
                if (typeof renderTemplates === 'function') {
                    renderTemplates();
                }
                if (typeof updateTemplatesCount === 'function') {
                    updateTemplatesCount();
                }
                
                // Deseleccionar todos los checkboxes
                const rowCheckboxes = document.querySelectorAll('.template-checkbox');
                rowCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                const selectAllCheckbox = document.getElementById('selectAllTemplates');
                if (selectAllCheckbox) {
                    selectAllCheckbox.checked = false;
                }
                
                // Ocultar la barra de acciones
                updateActionBar();
            },
            onCancel: function() {
                // No hacer nada al cancelar
            }
        });
    } else {
        // Fallback al confirm nativo si el modal no está disponible
        if (confirm(confirmMessage)) {
            // Obtener plantillas del localStorage
            let templates = JSON.parse(localStorage.getItem('templates') || '[]');
            
            // Filtrar las plantillas seleccionadas
            templates = templates.filter(template => !selectedIds.includes(template.id));
            
            // Guardar en localStorage
            localStorage.setItem('templates', JSON.stringify(templates));
            
            // Actualizar variables globales
            currentTemplates = templates;
            
            // Actualizar filteredTemplates aplicando filtros actuales
            const searchInput = document.getElementById('searchTemplates');
            const searchQuery = searchInput ? searchInput.value.trim() : '';
            
            if (searchQuery || hasActiveFilters() || isViewingSelected) {
                // Si hay filtros activos, aplicar la búsqueda para actualizar filteredTemplates
                if (typeof handleSearch === 'function') {
                    handleSearch(searchQuery);
                } else {
            filteredTemplates = [...currentTemplates];
                }
            } else {
                // Sin filtros, simplemente copiar todas las plantillas
                filteredTemplates = [...currentTemplates];
            }
            
            // Mostrar confirmación
            if (typeof showToast === 'function') {
                showToast('success', `${selectedIds.length} plantilla(s) eliminada(s) exitosamente`);
            }
            
            // Renderizar la tabla con las plantillas actualizadas
            if (typeof renderTemplates === 'function') {
                renderTemplates();
            }
            if (typeof updateTemplatesCount === 'function') {
                updateTemplatesCount();
            }
            
            // Deseleccionar todos los checkboxes
            const rowCheckboxes = document.querySelectorAll('.template-checkbox');
            rowCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            const selectAllCheckbox = document.getElementById('selectAllTemplates');
            if (selectAllCheckbox) {
                selectAllCheckbox.checked = false;
            }
            
            // Ocultar la barra de acciones
            updateActionBar();
        }
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
            
            case 'stages':
                // Contar todas las etapas del flujo (incluyendo agentes IA)
                aValue = a.realContent && a.realContent.stages 
                    ? a.realContent.stages.length 
                    : (a.stages || 0);
                bValue = b.realContent && b.realContent.stages 
                    ? b.realContent.stages.length 
                    : (b.stages || 0);
                return currentTableSortDirection === 'asc' 
                    ? aValue - bValue
                    : bValue - aValue;
            
            case 'createdAt':
                aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return currentTableSortDirection === 'asc' 
                    ? aValue - bValue
                    : bValue - aValue;
            
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
            // Solo abrir si NO se hace click en un checkbox, botón o badge de estado
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON' && !e.target.closest('button') && !e.target.classList.contains('table-status-badge')) {
                const templateId = this.dataset.templateId;
                if (templateId) {
                    openTemplateEditor(templateId);
                }
            }
        });
    });
}

// Función para configurar listeners de cambio de estado
function setupStatusChangeListeners() {
    const statusBadges = document.querySelectorAll('.table-status-badge[data-template-id]');
    
    statusBadges.forEach(badge => {
        badge.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevenir que se abra el editor
            
            const templateId = this.dataset.templateId;
            const currentStatus = this.dataset.currentStatus || 'draft';
            
            if (templateId) {
                showStatusDropdown(this, templateId, currentStatus);
            }
        });
    });
}

// Función para mostrar dropdown de estado
function showStatusDropdown(badgeElement, templateId, currentStatus) {
    // Cerrar otros dropdowns abiertos
    document.querySelectorAll('.status-dropdown-menu').forEach(menu => {
        menu.remove();
    });
    
    // Crear dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'status-dropdown-menu';
    dropdown.style.position = 'fixed';
    dropdown.style.zIndex = '10000';
    
    // Posicionar el dropdown
    const badgeRect = badgeElement.getBoundingClientRect();
    dropdown.style.top = (badgeRect.bottom + 4) + 'px';
    dropdown.style.left = badgeRect.left + 'px';
    dropdown.style.minWidth = badgeRect.width + 'px';
    
    // Opciones de estado
    const statusOptions = [
        { value: 'available', text: 'Disponible', class: 'available' },
        { value: 'draft', text: 'Borrador', class: 'draft' }
    ];
    
    // Crear items del dropdown
    statusOptions.forEach(option => {
        const item = document.createElement('div');
        item.className = 'status-dropdown-item';
        if (option.value === currentStatus) {
            item.classList.add('active');
        }
        
        const badge = document.createElement('span');
        badge.className = `status-dropdown-badge ${option.class}`;
        badge.textContent = option.text;
        
        item.appendChild(badge);
        
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            if (option.value !== currentStatus) {
                toggleTemplateStatus(templateId, currentStatus, option.value);
            }
            dropdown.remove();
        });
        
        dropdown.appendChild(item);
    });
    
    // Agregar al body
    document.body.appendChild(dropdown);
    
    // Cerrar al hacer click fuera
    const closeDropdown = (e) => {
        if (!dropdown.contains(e.target) && !badgeElement.contains(e.target)) {
            dropdown.remove();
            document.removeEventListener('click', closeDropdown);
        }
    };
    
    setTimeout(() => {
        document.addEventListener('click', closeDropdown);
    }, 0);
}

// Función para cambiar el estado de una plantilla
function toggleTemplateStatus(templateId, currentStatus, newStatus) {
    try {
        // Si no se proporciona nuevo estado, alternar
        if (!newStatus) {
            newStatus = currentStatus === 'available' ? 'draft' : 'available';
        }
        
        // Si el estado es el mismo, no hacer nada
        if (newStatus === currentStatus) {
            return;
        }
        
        // Encontrar la plantilla
        const templateIndex = currentTemplates.findIndex(t => t.id === templateId);
        
        if (templateIndex === -1) {
            console.error('Plantilla no encontrada:', templateId);
            return;
        }
        
        const template = currentTemplates[templateIndex];
        
        // Cambiar el estado
        template.status = newStatus;
        
        // Actualizar fecha de modificación
        template.lastModified = new Date().toISOString().split('T')[0];
        
        // Guardar en localStorage
        saveTemplatesToStorage();
        
        // Actualizar filteredTemplates si la plantilla está ahí
        const filteredIndex = filteredTemplates.findIndex(t => t.id === templateId);
        if (filteredIndex !== -1) {
            filteredTemplates[filteredIndex] = template;
        }
        
        // Re-renderizar la tabla
        renderTemplatesTable();
        
        // Mostrar toast de confirmación
        if (typeof showToast === 'function') {
            const statusText = newStatus === 'available' ? 'Disponible' : 'Borrador';
            showToast('success', `Estado cambiado a "${statusText}"`);
        }
        
        console.log(`Estado de plantilla ${templateId} cambiado de ${currentStatus} a ${newStatus}`);
    } catch (error) {
        console.error('Error al cambiar estado de plantilla:', error);
        if (typeof showToast === 'function') {
            showToast('error', 'Error al cambiar el estado');
        }
    }
}

// Función para configurar event listeners de cambio de categoría
function setupCategoryChangeListeners() {
    const categoryBadges = document.querySelectorAll('.table-category-badge[data-template-id]');
    
    categoryBadges.forEach(badge => {
        badge.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevenir que se abra el editor
            
            const templateId = this.dataset.templateId;
            const currentCategory = this.dataset.currentCategory || 'contratacion-general';
            
            if (templateId) {
                showCategoryDropdown(this, templateId, currentCategory);
            }
        });
    });
}

// Función para mostrar dropdown de categoría
function showCategoryDropdown(badgeElement, templateId, currentCategory) {
    // Cerrar otros dropdowns abiertos
    document.querySelectorAll('.category-dropdown-menu').forEach(menu => {
        menu.remove();
    });
    
    // Crear dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'category-dropdown-menu';
    dropdown.style.position = 'fixed';
    dropdown.style.zIndex = '10000';
    
    // Posicionar el dropdown
    const badgeRect = badgeElement.getBoundingClientRect();
    dropdown.style.top = (badgeRect.bottom + 4) + 'px';
    dropdown.style.left = badgeRect.left + 'px';
    dropdown.style.minWidth = Math.max(180, badgeRect.width) + 'px';
    
    // Opciones de categoría
    const categoryOptions = [
        { value: 'administracion', text: 'Administración' },
        { value: 'atencion-cliente', text: 'Atención al cliente' },
        { value: 'contratacion-general', text: 'Contratación general' },
        { value: 'diseno-creatividad', text: 'Diseño y creatividad' },
        { value: 'finanzas-contabilidad', text: 'Finanzas y contabilidad' },
        { value: 'ingenieria', text: 'Ingeniería' },
        { value: 'operaciones', text: 'Operaciones' },
        { value: 'reclutamiento', text: 'Recursos humanos' },
        { value: 'tecnologia-desarrollo', text: 'Tecnología / Desarrollo' },
        { value: 'ventas-marketing', text: 'Ventas y marketing' }
    ];
    
    // Crear items del dropdown
    categoryOptions.forEach(option => {
        const item = document.createElement('div');
        item.className = 'category-dropdown-item';
        if (option.value === currentCategory) {
            item.classList.add('active');
        }
        
        item.textContent = option.text;
        
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            if (option.value !== currentCategory) {
                toggleTemplateCategory(templateId, currentCategory, option.value);
            }
            dropdown.remove();
        });
        
        dropdown.appendChild(item);
    });
    
    // Agregar al body
    document.body.appendChild(dropdown);
    
    // Cerrar al hacer click fuera
    const closeDropdown = (e) => {
        if (!dropdown.contains(e.target) && !badgeElement.contains(e.target)) {
            dropdown.remove();
            document.removeEventListener('click', closeDropdown);
        }
    };
    
    setTimeout(() => {
        document.addEventListener('click', closeDropdown);
    }, 0);
}

// Función para cambiar la categoría de una plantilla
function toggleTemplateCategory(templateId, currentCategory, newCategory) {
    try {
        // Si la categoría es la misma, no hacer nada
        if (newCategory === currentCategory) {
            return;
        }
        
        // Encontrar la plantilla
        const templateIndex = currentTemplates.findIndex(t => t.id === templateId);
        
        if (templateIndex === -1) {
            console.error('Plantilla no encontrada:', templateId);
            return;
        }
        
        const template = currentTemplates[templateIndex];
        
        // Cambiar la categoría
        template.category = newCategory;
        
        // Actualizar fecha de modificación
        template.lastModified = new Date().toISOString().split('T')[0];
        
        // Guardar en localStorage
        saveTemplatesToStorage();
        
        // Actualizar filteredTemplates si la plantilla está ahí
        const filteredIndex = filteredTemplates.findIndex(t => t.id === templateId);
        if (filteredIndex !== -1) {
            filteredTemplates[filteredIndex] = template;
        }
        
        // Re-renderizar la tabla
        renderTemplatesTable();
        
        // Mostrar toast de confirmación
        if (typeof showToast === 'function') {
            const categoryMap = {
                'administracion': 'Administración',
                'atencion-cliente': 'Atención al cliente',
                'contratacion-general': 'Contratación general',
                'diseno-creatividad': 'Diseño y creatividad',
                'finanzas-contabilidad': 'Finanzas y contabilidad',
                'ingenieria': 'Ingeniería',
                'operaciones': 'Operaciones',
                'reclutamiento': 'Recursos humanos',
                'tecnologia-desarrollo': 'Tecnología / Desarrollo',
                'ventas-marketing': 'Ventas y marketing'
            };
            const categoryText = categoryMap[newCategory] || newCategory;
            showToast('success', `Categoría cambiada a "${categoryText}"`);
        }
        
        console.log(`Categoría de plantilla ${templateId} cambiada de ${currentCategory} a ${newCategory}`);
    } catch (error) {
        console.error('Error al cambiar categoría de plantilla:', error);
        if (typeof showToast === 'function') {
            showToast('error', 'Error al cambiar la categoría');
        }
    }
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
            <button class="ubits-button ubits-button--primary ubits-button--md ubits-button--no-hover" onclick="openCreateTemplateModal()" style="background: #0c5bef !important; background-color: #0c5bef !important; border-color: #0c5bef !important; border: 1px solid #0c5bef !important; color: #ffffff !important; transition: none !important;">
                <i class="far fa-plus"></i>
                <span>Crear mi primera plantilla</span>
            </button>
        </div>
    `;
}

function getNoResultsHTML() {
    console.log('🔍 [getNoResultsHTML] Generando HTML de no resultados (cards)');
    const html = `
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
    
    // Aplicar estilos inline para prevenir hover
    setTimeout(() => {
        const emptyState = document.querySelector('.no-results-state');
        if (emptyState) {
            const buttons = emptyState.querySelectorAll('.ubits-button');
            console.log('🔍 [getNoResultsHTML] Aplicando estilos anti-hover a botones:', buttons.length);
            buttons.forEach((btn, index) => {
                const isPrimary = btn.classList.contains('ubits-button--primary');
                const isSecondary = btn.classList.contains('ubits-button--secondary');
                
                // Agregar clase especial para deshabilitar hover
                btn.classList.add('ubits-button--no-hover');
                console.log(`  ✅ Clase 'ubits-button--no-hover' agregada al botón ${index + 1}`);
                
                if (isSecondary) {
                    btn.style.setProperty('background', 'var(--ubits-btn-secondary-bg-default)', 'important');
                    btn.style.setProperty('border-color', 'var(--ubits-btn-secondary-border)', 'important');
                    btn.style.setProperty('color', 'var(--ubits-btn-secondary-fg-default)', 'important');
                } else if (isPrimary) {
                    btn.style.setProperty('background', 'var(--ubits-button-primary-bg-default)', 'important');
                    btn.style.setProperty('border-color', 'var(--ubits-button-primary-bg-default)', 'important');
                    btn.style.setProperty('color', 'var(--ubits-btn-primary-fg)', 'important');
                }
                console.log(`  ✅ Estilos aplicados al botón ${index + 1}`);
                
                // Función para forzar estilos - FORZAR EN CADA FRAME
                const forceStyles = function() {
                    const isSecondary = this.classList.contains('ubits-button--secondary');
                    const isPrimary = this.classList.contains('ubits-button--primary');
                    
                    // Deshabilitar transición completamente
                    this.style.setProperty('transition', 'none', 'important');
                    this.style.setProperty('-webkit-transition', 'none', 'important');
                    this.style.setProperty('-moz-transition', 'none', 'important');
                    this.style.setProperty('-o-transition', 'none', 'important');
                    
                    if (isSecondary) {
                        // Usar valores hardcodeados directamente
                        this.style.setProperty('background', '#ffffff', 'important');
                        this.style.setProperty('background-color', '#ffffff', 'important');
                        this.style.setProperty('border-color', '#d0d2d5', 'important');
                        this.style.setProperty('border', '1px solid #d0d2d5', 'important');
                        this.style.setProperty('color', '#303a47', 'important');
                    } else if (isPrimary) {
                        this.style.setProperty('background', '#0c5bef', 'important');
                        this.style.setProperty('background-color', '#0c5bef', 'important');
                        this.style.setProperty('border-color', '#0c5bef', 'important');
                        this.style.setProperty('border', '1px solid #0c5bef', 'important');
                        this.style.setProperty('color', '#ffffff', 'important');
                    }
                };
                
                // Forzar estilos constantemente mientras está en hover usando requestAnimationFrame
                let hoverInterval = null;
                btn.addEventListener('mouseenter', function() {
                    console.log(`🚨 [HOVER DETECTADO] Botón ${index + 1} - Iniciando loop de forzado...`);
                    // Forzar inmediatamente
                    forceStyles.call(this);
                    
                    // Forzar en cada frame mientras está en hover
                    const forceLoop = () => {
                        forceStyles.call(this);
                        hoverInterval = requestAnimationFrame(forceLoop);
                    };
                    hoverInterval = requestAnimationFrame(forceLoop);
                }, {capture: true, passive: false});
                
                btn.addEventListener('mouseleave', function() {
                    if (hoverInterval) {
                        cancelAnimationFrame(hoverInterval);
                        hoverInterval = null;
                    }
                }, {capture: true, passive: false});
                
                // También agregar mouseover como backup
                btn.addEventListener('mouseover', forceStyles, {capture: true, passive: false});
            });
        }
    }, 100);
    
    return html;
}

// Función para obtener HTML del empty state de la tabla
// Función para obtener HTML del empty state principal (cuando no hay plantillas)

// Función simple para renderizar empty state de la tabla
function renderTableEmptyState() {
    console.log('🔍 [renderTableEmptyState] Iniciando renderizado de empty state');
    
    const searchInput = document.getElementById('searchTemplates');
    const hasSearchQuery = searchInput && searchInput.value.trim().length > 0;
    const hasFilters = hasActiveFilters();
    
    console.log('🔍 [renderTableEmptyState] Estado:', {
        hasSearchQuery,
        hasFilters,
        isViewingSelected,
        searchValue: searchInput ? searchInput.value : 'no input'
    });
    
    let message = 'No se encontraron plantillas';
    let description = 'Intenta ajustar los criterios de búsqueda o filtros.';
    let iconClass = 'far fa-file-lines';
    let buttonHTML = '';
    
    if (hasSearchQuery && hasFilters) {
        message = 'No se encontraron plantillas';
        description = `No hay resultados para "${searchInput.value}" con los filtros aplicados.`;
        iconClass = 'far fa-magnifying-glass';
        buttonHTML = `
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                <button class="ubits-button ubits-button--secondary ubits-button--md" onclick="openFilterDrawer()" style="pointer-events: auto;">
                    <i class="far fa-filter"></i>
                    <span>Ajustar filtros</span>
                </button>
                <button class="ubits-button ubits-button--secondary ubits-button--md" onclick="clearAllFilters()" style="pointer-events: auto;">
                    <i class="far fa-times"></i>
                    <span>Limpiar filtros</span>
                </button>
            </div>
        `;
    } else if (hasSearchQuery) {
        message = 'No se encontraron plantillas';
        description = `No hay resultados para "${searchInput.value}". Intenta con otros términos de búsqueda.`;
        iconClass = 'far fa-magnifying-glass';
        buttonHTML = `
            <button class="ubits-button ubits-button--secondary ubits-button--md" onclick="clearSearch()" style="pointer-events: auto;">
                <i class="far fa-times"></i>
                <span>Limpiar búsqueda</span>
            </button>
        `;
    } else if (hasFilters) {
        message = 'No se encontraron plantillas';
        description = 'No hay resultados con los filtros aplicados. Intenta ajustar los criterios de filtrado.';
        iconClass = 'far fa-filter';
        buttonHTML = `
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                <button class="ubits-button ubits-button--secondary ubits-button--md" onclick="openFilterDrawer()" style="pointer-events: auto;">
                    <i class="far fa-filter"></i>
                    <span>Ajustar filtros</span>
                </button>
                <button class="ubits-button ubits-button--secondary ubits-button--md" onclick="clearAllFilters()" style="pointer-events: auto;">
                    <i class="far fa-times"></i>
                    <span>Limpiar filtros</span>
                </button>
            </div>
        `;
    } else if (isViewingSelected) {
        message = 'No hay plantillas seleccionadas';
        description = 'Selecciona algunas plantillas para verlas aquí.';
        iconClass = 'far fa-eye-slash';
        buttonHTML = `
            <button class="ubits-button ubits-button--secondary ubits-button--md" onclick="clearSelectedView()" style="pointer-events: auto;">
                <i class="far fa-eye"></i>
                <span>Ver todas las plantillas</span>
            </button>
        `;
    } else {
        message = 'No hay plantillas';
        description = 'Crea tu primera plantilla para comenzar.';
        iconClass = 'far fa-file-lines';
        buttonHTML = `
            <button class="ubits-button ubits-button--primary ubits-button--md" onclick="createNewTemplate()" style="pointer-events: auto;">
                <i class="far fa-plus"></i>
                <span>Crear plantilla</span>
            </button>
        `;
    }
    
    const html = `
        <tr class="table-empty-row">
            <td colspan="8" class="table-empty-cell">
                <div class="table-empty-content">
                    <div class="table-empty-icon">
                        <i class="${iconClass}"></i>
                    </div>
                    <h3 class="table-empty-title">${message}</h3>
                    <p class="table-empty-description">${description}</p>
                    ${buttonHTML}
                </div>
            </td>
        </tr>
    `;
    
    // Agregar logs detallados después de renderizar
    setTimeout(() => {
        console.log('🔍 [renderTableEmptyState] Analizando estilos aplicados después de renderizar...');
        
        const emptyRow = document.querySelector('.table-empty-row');
        const emptyCell = document.querySelector('.table-empty-cell');
        const emptyContent = document.querySelector('.table-empty-content');
        
        if (emptyRow) {
            const rowStyles = getComputedStyle(emptyRow);
            console.log('📋 [renderTableEmptyState] Estilos de .table-empty-row:', {
                background: rowStyles.background,
                backgroundColor: rowStyles.backgroundColor,
                transition: rowStyles.transition,
                hoverStyles: 'Verificando...'
            });
            
            // Verificar qué reglas CSS se aplican
            const allStylesheets = Array.from(document.styleSheets);
            console.log('🔍 [renderTableEmptyState] Buscando reglas CSS que afecten .table-empty-row...');
            allStylesheets.forEach((sheet, sheetIndex) => {
                try {
                    const rules = Array.from(sheet.cssRules || []);
                    rules.forEach((rule, ruleIndex) => {
                        if (rule.selectorText && (
                            rule.selectorText.includes('table-empty-row') ||
                            rule.selectorText.includes('tbody tr:hover') ||
                            rule.selectorText.includes('ubits-table tbody tr')
                        )) {
                            console.log(`  📄 Stylesheet ${sheetIndex}, Regla ${ruleIndex}:`, {
                                selector: rule.selectorText,
                                background: rule.style.background,
                                backgroundColor: rule.style.backgroundColor,
                                transition: rule.style.transition
                            });
                        }
                    });
                } catch (e) {
                    // Ignorar errores de CORS
                }
            });
        }
        
        if (emptyCell) {
            const cellStyles = getComputedStyle(emptyCell);
            console.log('📋 [renderTableEmptyState] Estilos de .table-empty-cell:', {
                background: cellStyles.background,
                backgroundColor: cellStyles.backgroundColor,
                transition: cellStyles.transition
            });
        }
        
        if (emptyContent) {
            const contentStyles = getComputedStyle(emptyContent);
            console.log('📋 [renderTableEmptyState] Estilos de .table-empty-content:', {
                background: contentStyles.background,
                backgroundColor: contentStyles.backgroundColor,
                transition: contentStyles.transition,
                boxShadow: contentStyles.boxShadow,
                transform: contentStyles.transform
            });
            
            // Agregar event listener para detectar hover
            emptyContent.addEventListener('mouseenter', function() {
                console.log('🚨 [HOVER DETECTADO] Mouse entró en .table-empty-content');
                const computed = getComputedStyle(this);
                console.log('  📋 Estilos computados EN HOVER:', {
                    background: computed.background,
                    backgroundColor: computed.backgroundColor,
                    boxShadow: computed.boxShadow,
                    transform: computed.transform,
                    transition: computed.transition
                });
                
                // Verificar estilos inline
                console.log('  📝 Estilos inline:', {
                    styleBackground: this.style.background,
                    styleBackgroundColor: this.style.backgroundColor,
                    styleCssText: this.style.cssText.substring(0, 200)
                });
                
                // Verificar elemento padre (td)
                const parent = this.parentElement;
                if (parent) {
                    const parentComputed = getComputedStyle(parent);
                    console.log('  👨‍👩‍👧 Estilos del padre (td):', {
                        background: parentComputed.background,
                        backgroundColor: parentComputed.backgroundColor,
                        transition: parentComputed.transition
                    });
                }
                
                // Verificar elemento abuelo (tr)
                const grandparent = parent ? parent.parentElement : null;
                if (grandparent) {
                    const grandparentComputed = getComputedStyle(grandparent);
                    console.log('  👴 Estilos del abuelo (tr):', {
                        background: grandparentComputed.background,
                        backgroundColor: grandparentComputed.backgroundColor,
                        transition: grandparentComputed.transition,
                        className: grandparent.className
                    });
                }
            }, {capture: true});
        }
    }, 200);
    
    return html;
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
            saveTemplatesToStorage();
            
            // Actualizar filteredTemplates aplicando filtros actuales
            const searchInput = document.getElementById('searchTemplates');
            const searchQuery = searchInput ? searchInput.value.trim() : '';
            
            if (searchQuery || hasActiveFilters() || isViewingSelected) {
                // Si hay filtros activos, aplicar la búsqueda para actualizar filteredTemplates
                if (typeof handleSearch === 'function') {
                    handleSearch(searchQuery);
                } else {
                    filteredTemplates = filteredTemplates.filter(t => t.id !== templateId);
                }
            } else {
                // Sin filtros, simplemente filtrar de filteredTemplates también
                filteredTemplates = filteredTemplates.filter(t => t.id !== templateId);
            }
            
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
