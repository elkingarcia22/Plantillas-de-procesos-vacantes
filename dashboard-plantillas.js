// ========================================
// DASHBOARD DE PLANTILLAS UBITS
// Funcionalidad completa del dashboard usando componentes UBITS
// ========================================

// Datos de ejemplo para las plantillas
const TEMPLATES = [
    {
        id: 'template-1',
        name: 'Flujo de contratación general',
        category: 'Contratación General',
        author: 'María Alexandra Patiño Castillo',
        avatar: 'images/Profile-image.jpg',
        version: 1,
        stages: 5,
        agents: 5,
        lastModified: '2024-01-15',
        status: 'active',
        description: 'Proceso estándar para contratación de personal en cualquier área de la empresa',
        stageDetails: [
            { name: 'Recepción de CVs', agents: 1 },
            { name: 'Evaluación inicial', agents: 1 },
            { name: 'Entrevista técnica', agents: 1 },
            { name: 'Entrevista cultural', agents: 1 },
            { name: 'Decisión final', agents: 1 }
        ]
    }
];

// Estado global
let currentTemplates = [];
let filteredTemplates = [];
let currentSort = 'recent';

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
    loadTemplatesFromStorage();
    setupEventListeners();
    renderTemplates();
    updateTemplatesCount();
}

// ========================================
// GESTIÓN DE DATOS
// ========================================

function loadTemplatesFromStorage() {
    const stored = localStorage.getItem('templates');
    if (stored) {
        currentTemplates = JSON.parse(stored);
    } else {
        // Si no hay plantillas guardadas, usar las de ejemplo
        currentTemplates = [...TEMPLATES];
        
        // Actualizar contadores basándose en realContent si existe
        currentTemplates.forEach(template => {
            if (template.id === 'template-1' && !template.realContent) {
                // Generar el contenido real para template-1
                template.realContent = generateRealContractingFlow();
            }
            
            // Calcular stages y agents desde realContent
            if (template.realContent && template.realContent.stages) {
                template.stages = template.realContent.stages.length;
                template.agents = template.realContent.stages.reduce((total, stage) => {
                    return total + (stage.agents ? stage.agents.length : 0);
                }, 0);
            }
        });
        
        saveTemplatesToStorage();
    }
    
    filteredTemplates = [...currentTemplates];
}

function saveTemplatesToStorage() {
    localStorage.setItem('templates', JSON.stringify(currentTemplates));
}

function generateRealContractingFlow() {
    return {
        stages: [
            {
                id: 'stage-1',
                name: 'Recepción de CVs',
                agents: [{ id: 'agent-1', name: 'Reclutador inicial' }]
            },
            {
                id: 'stage-2',
                name: 'Evaluación inicial',
                agents: [{ id: 'agent-2', name: 'Evaluador técnico' }]
            },
            {
                id: 'stage-3',
                name: 'Entrevista técnica',
                agents: [{ id: 'agent-3', name: 'Entrevista Serena' }]
            },
            {
                id: 'stage-4',
                name: 'Entrevista cultural',
                agents: [{ id: 'agent-4', name: 'Analista de salario' }]
            },
            {
                id: 'stage-5',
                name: 'Decisión final',
                agents: [{ id: 'agent-5', name: 'Gerente de RRHH' }]
            }
        ]
    };
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
        filteredTemplates = [...currentTemplates];
    } else {
        filteredTemplates = currentTemplates.filter(template => 
            template.name.toLowerCase().includes(query) ||
            template.category.toLowerCase().includes(query) ||
            template.author.toLowerCase().includes(query) ||
            template.description.toLowerCase().includes(query)
        );
    }
    
    applySorting();
    renderTemplates();
    updateTemplatesCount();
}

function clearSearch() {
    const searchInput = document.getElementById('searchTemplates');
    const clearBtn = document.getElementById('clearSearchTemplates');
    
    if (searchInput) {
        searchInput.value = '';
        handleSearch('');
        clearBtn.style.display = 'none';
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

function renderTemplates() {
    const grid = document.getElementById('templatesGrid');
    
    if (filteredTemplates.length === 0) {
        grid.innerHTML = getEmptyStateHTML();
        return;
    }
    
    grid.innerHTML = filteredTemplates.map(template => createTemplateCardHTML(template)).join('');
    
    // Agregar event listeners a los botones
    addTemplateCardEventListeners();
}

function createTemplateCardHTML(template) {
    const statusClass = template.status === 'active' ? 'active' : 'draft';
    const statusText = template.status === 'active' ? 'Activa' : 'Borrador';
    const statusColor = template.status === 'active' ? '#2D5A2D' : 'var(--ubits-fg-info-subtle-static-default)';
    
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
        <div class="template-card ${statusClass}" data-template-id="${template.id}">
            <div class="template-header">
                <div class="template-status ${statusClass}">
                    <div class="status-dot"></div>
                    <span>${statusText}</span>
                </div>
                <div class="template-actions">
                    ${template.status === 'active' ? 
                        `<button class="ubits-button ubits-button--tertiary ubits-button--icon-only ubits-button--sm" onclick="convertToDraft('${template.id}')" title="Convertir a borrador">
                            <i class="far fa-edit"></i>
                        </button>` : 
                        `<button class="ubits-button ubits-button--tertiary ubits-button--icon-only ubits-button--sm" onclick="activateTemplate('${template.id}')" title="Activar">
                            <i class="far fa-play"></i>
                        </button>`
                    }
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
                        <i class="far fa-calendar"></i>
                        <span>Modificado ${formatDate(template.lastModified)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="far fa-tag"></i>
                        <span>${categoryText}</span>
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
                <div class="stat-item">
                    <div class="stat-value">v${template.version}</div>
                    <div class="stat-label">Versión</div>
                </div>
            </div>
        </div>
    `;
}

function getEmptyStateHTML() {
    return `
        <div class="empty-state">
            <img src="images/empty-states/sin-cards.svg" alt="Sin plantillas">
            <h3>No hay plantillas creadas</h3>
            <p>Crea tu primera plantilla de flujo de contratación para comenzar a optimizar tus procesos de selección.</p>
            <button class="ubits-button ubits-button--primary ubits-button--md" onclick="createNewTemplate()">
                <i class="far fa-plus"></i>
                <span>Crear primera plantilla</span>
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

function activateTemplate(templateId) {
    const template = currentTemplates.find(t => t.id === templateId);
    if (template) {
        template.status = 'active';
        template.lastModified = new Date().toISOString().split('T')[0];
        saveTemplatesToStorage();
        renderTemplates();
    }
}

function convertToDraft(templateId) {
    const template = currentTemplates.find(t => t.id === templateId);
    if (template) {
        template.status = 'draft';
        template.lastModified = new Date().toISOString().split('T')[0];
        saveTemplatesToStorage();
        renderTemplates();
    }
}

function cloneTemplate(templateId) {
    const template = currentTemplates.find(t => t.id === templateId);
    if (template) {
        const clonedTemplate = {
            ...template,
            id: 'template-' + Date.now(),
            name: template.name + ' (Copia)',
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
    }
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
            currentTemplates = currentTemplates.filter(t => t.id !== templateId);
            filteredTemplates = filteredTemplates.filter(t => t.id !== templateId);
            saveTemplatesToStorage();
            renderTemplates();
            updateTemplatesCount();
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
        countElement.textContent = filteredTemplates.length;
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

// ========================================
// MIGRACIÓN DE DATOS (para compatibilidad)
// ========================================

// Script de migración para usuarios existentes
function migrateExistingData() {
    const MIGRATION_VERSION = '1.0.0';
    const userVersion = localStorage.getItem('migration_version');
    
    if (!userVersion || userVersion !== MIGRATION_VERSION) {
        // Migrar template-1 si existe
        const stored = localStorage.getItem('templates');
        if (stored) {
            const templates = JSON.parse(stored);
            const template1 = templates.find(t => t.id === 'template-1');
            
            if (template1) {
                // Generar realContent si no existe
                if (!template1.realContent) {
                    template1.realContent = generateRealContractingFlow();
                }
                
                // Actualizar contadores
                if (template1.realContent && template1.realContent.stages) {
                    template1.stages = template1.realContent.stages.length;
                    template1.agents = template1.realContent.stages.reduce((total, stage) => {
                        return total + (stage.agents ? stage.agents.length : 0);
                    }, 0);
                }
                
                // Guardar cambios
                localStorage.setItem('templates', JSON.stringify(templates));
            }
        }
        
        // Marcar migración como completada
        localStorage.setItem('migration_version', MIGRATION_VERSION);
    }
}

// Ejecutar migración al cargar
migrateExistingData();
