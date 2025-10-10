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
        // Sistema en blanco - sin plantillas por defecto
        currentTemplates = [];
    }
    
    filteredTemplates = [...currentTemplates];
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
    const controls = document.querySelector('.templates-controls');
    
    if (filteredTemplates.length === 0) {
        grid.innerHTML = getEmptyStateHTML();
        // Ocultar controles cuando no hay plantillas
        if (controls) {
            controls.style.display = 'none';
        }
        return;
    }
    
    grid.innerHTML = filteredTemplates.map(template => createTemplateCardHTML(template)).join('');
    
    // Mostrar controles cuando hay plantillas
    if (controls) {
        controls.style.display = 'flex';
    }
    
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
            <img src="images/empty-states/No-templates-img.svg" alt="Sin plantillas">
            <div class="empty-state-content">
                <h1 class="ubits-heading-h1" style="color: var(--ubits-fg-2-high);">Crea tu primera plantilla personalizada</h1>
                <p class="ubits-body-md-regular" style="color: var(--ubits-fg-2-medium);">Transforma la forma en que reclutas talento. Automatiza procesos, optimiza tiempos y encuentra a los mejores candidatos.</p>
                <button class="ubits-button ubits-button--secondary ubits-button--md" onclick="openCreateTemplateModal()">
                    <i class="far fa-plus"></i>
                    <span>Crear mi primera plantilla</span>
                </button>
            </div>
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

// Sistema entregado en blanco - sin datos de migración necesarios
