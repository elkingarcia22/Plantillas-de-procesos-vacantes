// ========================================
// EDITOR DE PLANTILLAS UBITS
// Funcionalidad completa del editor usando componentes UBITS
// ========================================

// Agentes disponibles
const AGENTS = [
    { 
        id: 'cv-analyzer', 
        name: 'Analizador CV', 
        icon: 'fa-file-alt', 
        description: 'Analiza CV y asigna puntaje',
        hasConfig: true,
        config: {
            salaryPercentage: { label: 'Porcentaje sobre el rango salarial', type: 'number', default: 0, suffix: '%' },
            minScore: { label: 'Puntaje mínimo de evaluación', type: 'number', default: 0, suffix: 'pts' }
        }
    },
    { 
        id: 'interview-ia', 
        name: 'Entrevista Serena', 
        icon: 'fa-comments', 
        description: 'Genera preguntas y analiza respuestas',
        hasConfig: true,
        config: {
            expirationDays: { label: 'Días para que expire la entrevista', type: 'number', default: 0, suffix: 'días' },
            minScore: { label: 'Puntaje mínimo de la entrevista', type: 'number', default: 0, suffix: 'pts' }
        }
    },
    { 
        id: 'psychometric-analyst', 
        name: 'Analista psicométrico', 
        icon: 'fa-brain', 
        description: 'Evalúa mediante pruebas psicométricas',
        hasConfig: true,
        config: {
            minIQ: { label: 'Puntaje CI mínimo', type: 'number', default: 0, suffix: 'pts' },
            testType: { 
                label: 'Tipo de prueba', 
                type: 'select', 
                default: 'ci-ca',
                options: [
                    { value: 'ci-ca', text: 'CI/CA' },
                    { value: '16pf', text: '16PF' },
                    { value: 'disc', text: 'DISC' },
                    { value: 'mbti', text: 'MBTI' },
                    { value: 'cleaver', text: 'Cleaver' }
                ]
            },
            testLanguage: { 
                label: 'Idioma de la prueba', 
                type: 'select', 
                default: 'es',
                options: [
                    { value: 'es', text: 'Español' },
                    { value: 'en', text: 'Inglés' },
                    { value: 'pt', text: 'Portugués' }
                ]
            }
        }
    },
    { 
        id: 'background-check', 
        name: 'Antecedentes judiciales', 
        icon: 'fa-shield-check', 
        description: 'Verifica certificado de antecedentes judiciales',
        hasConfig: false
    }
];

// Categorías fijas de etapas
const STAGE_CATEGORIES = [
    { id: 'evaluacion-inicial', name: 'Evaluación inicial', icon: 'fa-clipboard-check' },
    { id: 'entrevistas', name: 'Entrevistas', icon: 'fa-comments' },
    { id: 'evaluacion-psicometrica', name: 'Evaluación psicométrica', icon: 'fa-brain' },
    { id: 'pruebas-tecnicas', name: 'Pruebas técnicas', icon: 'fa-code' },
    { id: 'verificacion', name: 'Verificación', icon: 'fa-shield-check' },
    { id: 'decision-final', name: 'Decisión final', icon: 'fa-gavel' }
];

// Estado global del editor
let currentTemplate = null;
let hasUnsavedChanges = false;
let lastSavedTime = null;
let availableAgents = [...AGENTS];
let availableStages = []; // Etapas creadas disponibles para arrastrar
let draggedElement = null;

// ========================================
// INICIALIZACIÓN
// ========================================

function initializeEditor() {
    // Obtener ID de plantilla de la URL o crear nueva
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = urlParams.get('id');
    
    // Cargar etapas creadas desde localStorage
    loadAvailableStages();
    
    if (templateId) {
        loadTemplate(templateId);
    } else {
        createNewTemplate();
    }
    
    setupEventListeners();
    renderEditor();
    
    // Solo interceptar navegación manual
    document.addEventListener('click', handleLinkClick);
}

function createNewTemplate() {
    currentTemplate = {
        id: 'template-' + Date.now(),
        name: 'Nueva plantilla',
        category: 'Personalizada',
        author: 'María Alexandra Patiño Castillo',
        avatar: 'images/Profile-image.jpg',
        version: 1,
        stages: [],
        agents: 0,
        lastModified: new Date().toISOString().split('T')[0],
        status: 'draft',
        description: 'Plantilla personalizada creada por el usuario',
        realContent: {
            stages: []
        }
    };
}

function loadTemplate(templateId) {
    const stored = localStorage.getItem('templates');
    if (stored) {
        const templates = JSON.parse(stored);
        const template = templates.find(t => t.id === templateId);
        
        if (template) {
            currentTemplate = { ...template };
            // Asegurar que realContent existe
            if (!currentTemplate.realContent) {
                currentTemplate.realContent = { stages: [] };
            }
        } else {
            createNewTemplate();
        }
    } else {
        createNewTemplate();
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Drag and drop para agentes
    setupAgentDragAndDrop();
    
    // Drag and drop para etapas
    setupStageDragAndDrop();
    
    // Edición inline del nombre de plantilla
    const templateName = document.getElementById('templateName');
    if (templateName) {
        templateName.addEventListener('input', function() {
            if (currentTemplate) {
                currentTemplate.name = this.value.trim();
                markAsUnsaved();
            }
        });
        
        templateName.addEventListener('blur', function() {
            if (currentTemplate && this.value.trim() === '') {
                this.value = currentTemplate.name || 'Nueva plantilla';
            }
        });
    }
    
    // Funcionalidad de tabs
    setupTabs();
    
    // Funcionalidad del buscador de etapas
    setupStageSearch();
}

function setupAgentDragAndDrop() {
    // Los event listeners se agregan dinámicamente en renderAgents()
}

function setupStageDragAndDrop() {
    // Los event listeners se agregan dinámicamente en renderStages()
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remover clase active de todos los botones y contenidos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Agregar clase active al botón clickeado y su contenido
            button.classList.add('active');
            const targetContent = document.getElementById(targetTab + '-tab');
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

function setupStageSearch() {
    const searchInput = document.getElementById('stageSearch');
    const clearButton = document.getElementById('clearStageSearch');
    const stagesList = document.getElementById('stagesList');
    
    if (!searchInput || !clearButton || !stagesList) return;
    
    // Función de búsqueda
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const stageItems = stagesList.querySelectorAll('.stage-item');
        
        // Mostrar/ocultar botón de limpiar
        clearButton.style.display = searchTerm ? 'block' : 'none';
        
        // Filtrar etapas
        stageItems.forEach(item => {
            const stageName = item.getAttribute('data-stage-name').toLowerCase();
            const stageCategory = item.getAttribute('data-stage-category').toLowerCase();
            
            if (stageName.includes(searchTerm) || stageCategory.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
    
    // Botón limpiar búsqueda
    clearButton.addEventListener('click', function() {
        searchInput.value = '';
        this.style.display = 'none';
        
        // Mostrar todas las etapas
        const stageItems = stagesList.querySelectorAll('.stage-item');
        stageItems.forEach(item => {
            item.style.display = 'flex';
        });
        
        searchInput.focus();
    });
}

// ========================================
// RENDERIZADO
// ========================================

function renderEditor() {
    renderAgents();
    renderStages();
    renderAvailableStages();
    updateTemplateInfo();
    
    // Configurar drag and drop DESPUÉS de renderizar
    makeBoardDroppable();
}

function renderAgents() {
    const agentsList = document.getElementById('agentsList');
    if (!agentsList) return;
    
    agentsList.innerHTML = availableAgents.map(agent => `
        <div class="agent-item" 
             draggable="true" 
             data-agent-id="${agent.id}"
             data-agent-name="${agent.name}"
             data-agent-icon="${agent.icon}">
            <div class="agent-header">
                <div class="agent-title-section">
                    <div class="agent-icon"><i class="far ${agent.icon}"></i></div>
                    <div class="agent-name">${agent.name}</div>
                </div>
                <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" onclick="event.stopPropagation(); showAgentInfo('${agent.id}')" title="Más información">
                    <i class="far fa-circle-info"></i>
                </button>
            </div>
            <div class="agent-help">${agent.description}</div>
        </div>
    `).join('');
    
    // Agregar event listeners para drag and drop
    agentsList.querySelectorAll('.agent-item').forEach(item => {
        item.addEventListener('dragstart', handleAgentDragStart);
        item.addEventListener('dragend', handleAgentDragEnd);
    });
}

function renderAvailableStages() {
    const stagesList = document.getElementById('stagesList');
    if (!stagesList) return;
    
    // Filtrar etapas que ya están en uso en esta plantilla
    const usedStageIds = currentTemplate.realContent.stages.map(stage => stage.templateId);
    const availableStagesForThisTemplate = availableStages.filter(stage => !usedStageIds.includes(stage.id));
    
    // Mostrar/ocultar buscador según cantidad de etapas
    const searchWrapper = document.getElementById('stageSearchWrapper');
    if (searchWrapper) {
        searchWrapper.style.display = availableStagesForThisTemplate.length > 6 ? 'flex' : 'none';
    }
    
    if (availableStagesForThisTemplate.length === 0) {
        stagesList.innerHTML = `
            <div class="empty-stages-message">
                <i class="far fa-sitemap"></i>
                <p>No hay etapas disponibles</p>
                <small>Todas las etapas ya están en uso o crea una nueva</small>
            </div>
        `;
        return;
    }
    
    stagesList.innerHTML = availableStagesForThisTemplate.map(stage => {
        const category = STAGE_CATEGORIES.find(cat => cat.id === stage.category);
        return `
            <div class="stage-item" 
                 draggable="true" 
                 data-stage-id="${stage.id}"
                 data-stage-name="${stage.name}"
                 data-stage-category="${stage.category}">
                <div class="stage-header">
                    <div class="stage-info">
                        <div class="stage-name">${stage.name}</div>
                        <div class="stage-category">Categoría de etapa: ${category ? category.name : stage.category}</div>
                    </div>
                    <div class="stage-menu">
                        <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" 
                                onclick="toggleStageTemplateMenu(event, '${stage.id}')" 
                                title="Opciones">
                            <i class="far fa-ellipsis"></i>
                        </button>
                        <div class="stage-menu-dropdown" id="stage-template-menu-${stage.id}">
                            <button class="stage-menu-item" onclick="editStageTemplate('${stage.id}')">
                                <i class="far fa-edit"></i>
                                <span>Editar</span>
                            </button>
                            <button class="stage-menu-item stage-menu-item--danger" onclick="deleteStageTemplate('${stage.id}')">
                                <i class="far fa-trash"></i>
                                <span>Eliminar</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Agregar event listeners para drag and drop
    stagesList.querySelectorAll('.stage-item').forEach(item => {
        item.addEventListener('dragstart', handleStageTemplateDragStart);
        item.addEventListener('dragend', handleStageTemplateDragEnd);
    });
}

function renderStages() {
    const stagesContainer = document.getElementById('stagesContainer');
    if (!stagesContainer) return;
    
    // Mostrar empty state si no hay etapas
    if (!currentTemplate.realContent.stages || currentTemplate.realContent.stages.length === 0) {
        stagesContainer.innerHTML = `
            <div class="empty-state" style="display: flex;">
                <div class="empty-state-content">
                    <div class="empty-state-icon-circle">
                        <i class="far fa-sitemap"></i>
                    </div>
                    <h3 class="empty-state-title">Construye tu proceso de selección</h3>
                    <p class="empty-state-description">Añade etapas para organizar el proceso de selección y asigna agentes IA que te ayuden a evaluar candidatos.</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Crear HTML de las etapas
    const stagesHTML = currentTemplate.realContent.stages.map((stage, index) => {
        const category = STAGE_CATEGORIES.find(cat => cat.id === stage.category);
        
        // Renderizar agente como card si existe, o mostrar estado empty
        let agentHTML = '';
        if (stage.agents && stage.agents.length > 0) {
            const agent = stage.agents[0];
            const agentData = AGENTS.find(a => a.id === agent.id);
            
            if (agentData) {
                agentHTML = `
                    <div class="agent-card">
                        <div class="agent-card-header">
                            <div class="agent-card-title">
                                <i class="far ${agent.icon || 'fa-user'}"></i>
                                <span>${agent.name}</span>
                            </div>
                            <div class="agent-card-actions">
                                <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" onclick="showAgentInfo('${agent.id}')" title="Más información">
                                    <i class="far fa-circle-info"></i>
                                </button>
                                <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" onclick="removeAgentFromStage('${stage.id}')" title="Quitar agente">
                                    <i class="far fa-trash"></i>
                                </button>
                                ${agentData.hasConfig ? `
                                    <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" onclick="toggleAgentConfig('${stage.id}')" title="Expandir/Contraer configuración">
                                        <i class="far fa-chevron-up" id="chevron-${stage.id}"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                        ${agentData.hasConfig ? `
                            <div class="agent-card-config" id="agent-config-${stage.id}">
                                ${Object.entries(agentData.config).map(([key, field]) => {
                                    const value = agent.config?.[key] ?? field.default;
                                    
                                    if (field.type === 'number') {
                                        return `
                                            <div class="config-field">
                                                <label class="config-label">${field.label}</label>
                                                <div class="config-input-group">
                                                    <input 
                                                        type="number" 
                                                        class="config-input" 
                                                        value="${value}"
                                                        min="0"
                                                        onchange="updateAgentConfig('${stage.id}', '${key}', this.value)"
                                                    >
                                                    ${field.suffix ? `<span class="config-suffix">${field.suffix}</span>` : ''}
                                                </div>
                                            </div>
                                        `;
                                    } else if (field.type === 'select') {
                                        return `
                                            <div class="config-field">
                                                <label class="config-label">${field.label}</label>
                                                <select 
                                                    class="config-select" 
                                                    onchange="updateAgentConfig('${stage.id}', '${key}', this.value)"
                                                >
                                                    ${field.options.map(opt => `
                                                        <option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>
                                                            ${opt.text}
                                                        </option>
                                                    `).join('')}
                                                </select>
                                            </div>
                                        `;
                                    }
                                    return '';
                                }).join('')}
                            </div>
                        ` : ''}
                    </div>
                `;
            }
        } else {
            // Estado empty: mostrar selector de agentes con componente UBITS
            agentHTML = `
                <div class="stage-empty-state" id="empty-state-${stage.id}">
                    <p class="empty-state-text">Puedes dejar la etapa vacía o agregar un agente:</p>
                    <div id="agent-selector-${stage.id}"></div>
                </div>
            `;
        }
        
        return `
            <div class="stage-item" draggable="true" data-stage-id="${stage.id}" data-stage-index="${index}">
                <i class="far fa-grip-vertical stage-drag-handle"></i>
                <div class="stage-content">
                    <div class="stage-header">
                        <div class="stage-title-section">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div class="stage-number">${index + 1}</div>
                                <div>
                                    <h4 class="stage-name">${stage.name}</h4>
                                    ${category ? `<span class="stage-category-badge">Categoría de etapa: ${category.name}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="stage-actions">
                            <div class="stage-menu">
                                <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only stage-menu-trigger" onclick="toggleStageMenu(event, '${stage.id}')" title="Opciones">
                                    <i class="far fa-ellipsis-vertical"></i>
                                </button>
                                <div class="stage-menu-dropdown" id="stage-menu-${stage.id}">
                                    <button class="stage-menu-item" onclick="editStageName('${stage.id}')">
                                        <i class="far fa-edit"></i>
                                        <span>Editar</span>
                                    </button>
                                    <button class="stage-menu-item stage-menu-item--danger" onclick="deleteStage('${stage.id}')">
                                        <i class="far fa-trash"></i>
                                        <span>Eliminar etapa</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="stage-agents">
                        ${agentHTML}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Mostrar las etapas
    stagesContainer.innerHTML = stagesHTML;
    
    // Configurar drag and drop para las etapas del board (REORDENAR)
    stagesContainer.querySelectorAll('.stage-item').forEach(item => {
        item.addEventListener('dragstart', handleBoardStageDragStart);
        item.addEventListener('dragover', handleBoardStageDragOver);
        item.addEventListener('drop', handleBoardStageDrop);
        item.addEventListener('dragend', handleBoardStageDragEnd);
        item.addEventListener('dragleave', handleBoardStageDragLeave);
    });
    
    // Crear selectores UBITS para etapas sin agentes
    currentTemplate.realContent.stages.forEach((stage, index) => {
        if (!stage.agents || stage.agents.length === 0) {
            const containerId = `agent-selector-${stage.id}`;
            const container = document.getElementById(containerId);
            
            if (container && typeof createInput === 'function') {
                const agentOptions = availableAgents.map(agent => ({
                    value: agent.id,
                    text: agent.name
                }));
                
                createInput({
                    containerId: containerId,
                    type: 'select',
                    placeholder: 'Seleccionar agente...',
                    size: 'md',
                    selectOptions: agentOptions,
                    onChange: (value) => {
                        if (value) {
                            addAgentFromSelector(stage.id, value);
                        }
                    }
                });
            }
        }
    });
}

function makeBoardDroppable() {
    const stagesContainer = document.getElementById('stagesContainer');
    const emptyState = document.getElementById('emptyState');
    const boardContainer = document.querySelector('.board-container');
    
    if (!stagesContainer || !boardContainer) return;
    
    // Función para manejar drag over
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        boardContainer.classList.add('drag-over');
    }
    
    // Función para manejar drag leave
    function handleDragLeave(e) {
        if (!boardContainer.contains(e.relatedTarget)) {
            boardContainer.classList.remove('drag-over');
        }
    }
    
    // Función para manejar drop
    function handleDrop(e) {
        e.preventDefault();
        boardContainer.classList.remove('drag-over');
        
        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            
            if (data.type === 'stage-template') {
                handleStageTemplateDrop(data);
            } else if (data.type === 'agent') {
                handleAgentDrop(data);
            }
        } catch (error) {
            console.error('Error al procesar drop:', error);
        }
    }
    
    // Agregar event listeners al board-container (que contiene todo)
    boardContainer.addEventListener('dragover', handleDragOver);
    boardContainer.addEventListener('dragleave', handleDragLeave);
    boardContainer.addEventListener('drop', handleDrop);
}

function handleStageTemplateDrop(data) {
    const { id, name, category } = data;
    
    // Verificar que la etapa no esté ya en uso
    const existingStage = currentTemplate.realContent.stages.find(stage => stage.templateId === id);
    if (existingStage) {
        return;
    }
    
    // Crear nueva etapa en el área de trabajo
    const newStage = {
        id: 'work-stage-' + Date.now(),
        templateId: id,
        name: name,
        category: category,
        agents: []
    };
    
    // Agregar a la plantilla actual
    currentTemplate.realContent.stages.push(newStage);
    
    // Re-renderizar todo
    renderEditor();
    
    // Marcar como cambios sin guardar
    markAsUnsaved();
}

function handleAgentDrop(data) {
    const { id, name, icon } = data;
    
    // Buscar la etapa más cercana al punto de drop
    const stagesContainer = document.getElementById('stagesContainer');
    const stages = stagesContainer.querySelectorAll('.stage-item');
    
    let targetStage = null;
    let minDistance = Infinity;
    
    stages.forEach(stageElement => {
        const rect = stageElement.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const distance = Math.abs(centerY - (draggedElement?.element?.getBoundingClientRect().top || 0));
        
        if (distance < minDistance) {
            minDistance = distance;
            targetStage = stageElement;
        }
    });
    
    if (!targetStage) {
        return;
    }
    
    const stageId = targetStage.getAttribute('data-stage-id');
    const stage = currentTemplate.realContent.stages.find(s => s.id === stageId);
    
    if (!stage) {
        return;
    }
    
    // Verificar que la etapa no tenga ya un agente
    if (stage.agents && stage.agents.length > 0) {
        return;
    }
    
    // Agregar agente a la etapa
    stage.agents = [{ id, name, icon }];
    
    // Actualizar agentes disponibles
    updateAvailableAgents();
    
    // Re-renderizar todo
    renderEditor();
    
    // Marcar como cambios sin guardar
    markAsUnsaved();
}

function updateTemplateInfo() {
    const templateName = document.getElementById('templateName');
    const templateCategoryName = document.getElementById('templateCategoryName');
    const templateLastModified = document.getElementById('templateLastModified');
    const templateVersion = document.getElementById('templateVersion');
    
    if (currentTemplate) {
        // Actualizar nombre
        if (templateName) {
            templateName.value = currentTemplate.name;
        }
        
        // Actualizar categoría
        if (templateCategoryName && currentTemplate.category) {
            // Mapear el valor de la categoría al texto mostrado
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
            
            templateCategoryName.textContent = categoryMap[currentTemplate.category] || currentTemplate.category;
        }
        
        // Actualizar fecha de modificación
        if (templateLastModified && currentTemplate.lastModified) {
            templateLastModified.textContent = `Modificado ${formatDate(currentTemplate.lastModified)}`;
        }
        
        // Actualizar versión
        if (templateVersion && currentTemplate.version) {
            templateVersion.textContent = `Versión ${currentTemplate.version}`;
        }
    }
}

function updateAvailableAgents() {
    // Filtrar agentes que ya están asignados
    const assignedAgentIds = new Set();
    currentTemplate.realContent.stages.forEach(stage => {
        if (stage.agents) {
            stage.agents.forEach(agent => {
                assignedAgentIds.add(agent.id);
            });
        }
    });
    
    availableAgents = AGENTS.filter(agent => !assignedAgentIds.has(agent.id));
}

// ========================================
// DRAG AND DROP HANDLERS
// ========================================

function handleAgentDragStart(e) {
    const agentItem = e.target.closest('.agent-item');
    if (!agentItem) return;
    
    const agentId = agentItem.getAttribute('data-agent-id');
    const agentName = agentItem.getAttribute('data-agent-name');
    const agentIcon = agentItem.getAttribute('data-agent-icon');
    
    // Guardar datos del elemento arrastrado
    draggedElement = {
        type: 'agent',
        id: agentId,
        name: agentName,
        icon: agentIcon,
        element: agentItem
    };
    
    // Agregar clase de arrastre
    agentItem.classList.add('dragging');
    
    // Configurar datos de transferencia
    e.dataTransfer.setData('text/plain', JSON.stringify({
        type: 'agent',
        id: agentId,
        name: agentName,
        icon: agentIcon
    }));
    
    // Configurar efecto de arrastre
    e.dataTransfer.effectAllowed = 'move';
    
    console.log('Iniciando arrastre de agente:', agentName);
}

function handleAgentDragEnd(e) {
    const agentItem = e.target.closest('.agent-item');
    if (agentItem) {
        agentItem.classList.remove('dragging');
    }
    
    // Limpiar datos del elemento arrastrado
    draggedElement = null;
    
    console.log('Finalizando arrastre de agente');
}

// ========================================
// DRAG AND DROP PARA REORDENAR ETAPAS EN EL BOARD
// ========================================

let draggedBoardStage = null;
let currentDropTarget = null;

function handleBoardStageDragStart(e) {
    const stageItem = e.target.closest('.stage-item');
    if (!stageItem) return;
    
    draggedBoardStage = stageItem;
    stageItem.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', 'board-stage-reorder');
    
    console.log('Iniciando arrastre de etapa del board para reordenar');
}

function handleBoardStageDragOver(e) {
    e.preventDefault();
    
    const targetItem = e.target.closest('.stage-item');
    if (!targetItem) return;
    
    // Si estamos arrastrando un agente, mostrar feedback visual
    if (draggedElement && draggedElement.type === 'agent') {
        e.dataTransfer.dropEffect = 'copy';
        targetItem.style.background = 'var(--ubits-feedback-bg-info-subtle)';
        targetItem.style.borderColor = 'var(--ubits-feedback-accent-info)';
        currentDropTarget = targetItem;
        return;
    }
    
    // Si estamos arrastrando una etapa del board, reordenar
    if (!draggedBoardStage) return;
    
    e.dataTransfer.dropEffect = 'move';
    
    // No hacer nada si es el mismo elemento
    if (targetItem === draggedBoardStage) return;
    
    // Obtener el contenedor de etapas
    const container = document.getElementById('stagesContainer');
    if (!container) return;
    
    // Obtener todos los elementos de etapa
    const allStages = [...container.querySelectorAll('.stage-item')];
    const draggedIndex = allStages.indexOf(draggedBoardStage);
    const targetIndex = allStages.indexOf(targetItem);
    
    // Insertar el elemento arrastrado antes o después del objetivo
    if (draggedIndex < targetIndex) {
        targetItem.parentNode.insertBefore(draggedBoardStage, targetItem.nextSibling);
    } else {
        targetItem.parentNode.insertBefore(draggedBoardStage, targetItem);
    }
}

function handleBoardStageDragLeave(e) {
    const targetItem = e.target.closest('.stage-item');
    if (!targetItem) return;
    
    // Restaurar estilos originales
    targetItem.style.background = '';
    targetItem.style.borderColor = '';
    
    if (currentDropTarget === targetItem) {
        currentDropTarget = null;
    }
}

function handleBoardStageDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const targetItem = e.target.closest('.stage-item');
    if (!targetItem) return;
    
    // Restaurar estilos
    targetItem.style.background = '';
    targetItem.style.borderColor = '';
    
    // Si estamos soltando un agente
    try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        
        if (data.type === 'agent') {
            const stageId = targetItem.getAttribute('data-stage-id');
            const stage = currentTemplate.realContent.stages.find(s => s.id === stageId);
            
            if (!stage) {
                console.log('No se encontró la etapa');
                return;
            }
            
            // Verificar que la etapa no tenga ya un agente
            if (stage.agents && stage.agents.length > 0) {
                console.log('La etapa ya tiene un agente');
                
                // Mostrar toast de error
                if (typeof showToast === 'function') {
                    showToast('error', 'Solo se permite un agente por etapa.', {
                        duration: 5000
                    });
                }
                
                return;
            }
            
            // Obtener configuración por defecto del agente
            const agentData = AGENTS.find(a => a.id === data.id);
            const defaultConfig = {};
            
            if (agentData && agentData.hasConfig) {
                Object.entries(agentData.config).forEach(([key, field]) => {
                    defaultConfig[key] = field.default;
                });
            }
            
            // Agregar agente a la etapa con su configuración inicial
            stage.agents = [{ 
                id: data.id, 
                name: data.name, 
                icon: data.icon,
                config: defaultConfig
            }];
            
            console.log('Agente agregado a la etapa:', data.name);
            
            // Actualizar agentes disponibles
            updateAvailableAgents();
            
            // Re-renderizar todo
            renderEditor();
            
            // Marcar como cambios sin guardar
            markAsUnsaved();
        }
    } catch (error) {
        console.log('No es un agente, es reordenamiento de etapas');
    }
    
    currentDropTarget = null;
}

function handleBoardStageDragEnd(e) {
    const stageItem = e.target.closest('.stage-item');
    if (stageItem) {
        stageItem.classList.remove('dragging');
        stageItem.style.background = '';
        stageItem.style.borderColor = '';
    }
    
    // Limpiar todos los estilos de feedback
    const allStages = document.querySelectorAll('.stage-item');
    allStages.forEach(stage => {
        stage.style.background = '';
        stage.style.borderColor = '';
    });
    
    // Actualizar el orden en el modelo de datos si estamos reordenando
    if (draggedBoardStage) {
        updateStageOrder();
    }
    
    draggedBoardStage = null;
    currentDropTarget = null;
    console.log('Finalizando arrastre');
}

function updateStageOrder() {
    const container = document.getElementById('stagesContainer');
    if (!container) return;
    
    const stageElements = [...container.querySelectorAll('.stage-item')];
    const newOrder = stageElements.map(el => el.getAttribute('data-stage-id'));
    
    // Reordenar el array de etapas según el nuevo orden visual
    const reorderedStages = [];
    newOrder.forEach(stageId => {
        const stage = currentTemplate.realContent.stages.find(s => s.id === stageId);
        if (stage) {
            reorderedStages.push(stage);
        }
    });
    
    currentTemplate.realContent.stages = reorderedStages;
    markAsUnsaved();
    
    console.log('Orden de etapas actualizado:', newOrder);
    
    // Re-renderizar para actualizar los números
    renderStages();
}

// ========================================
// ACCIONES DE ETAPAS
// ========================================

function addNewStage() {
    const stageId = 'stage-' + Date.now();
    const stageNumber = currentTemplate.realContent.stages.length + 1;
    
    const newStage = {
        id: stageId,
        name: `Etapa ${stageNumber}`,
        agents: []
    };
    
    currentTemplate.realContent.stages.push(newStage);
    markAsUnsaved();
    renderEditor();
}

function editStageName(stageId) {
    const stage = currentTemplate.realContent.stages.find(s => s.id === stageId);
    if (!stage) return;
    
    showFormModal({
        title: 'Editar etapa',
        fields: [
            {
                id: 'stageName',
                label: 'Nombre de la etapa',
                type: 'text',
                placeholder: 'Ej: Entrevista técnica',
                required: true,
                maxLength: 50,
                value: stage.name
            },
            {
                id: 'stageCategory',
                label: 'Categoría',
                type: 'select',
                required: true,
                selectOptions: STAGE_CATEGORIES.map(cat => ({
                    value: cat.id,
                    text: cat.name
                })),
                value: stage.category
            }
        ],
        submitText: 'Guardar cambios',
        cancelText: 'Cancelar',
        onSubmit: function(formData) {
            const { stageName, stageCategory } = formData;
            if (stageName && stageName.trim()) {
                stage.name = stageName.trim();
                stage.category = stageCategory;
                markAsUnsaved();
                renderEditor();
            }
        },
        onCancel: function() {
            // No hacer nada
        }
    });
}

window.addAgentFromSelector = function(stageId, agentId) {
    if (!agentId) return; // Si no seleccionó nada
    
    const stage = currentTemplate.realContent.stages.find(s => s.id === stageId);
    if (!stage) return;
    
    const agentData = AGENTS.find(a => a.id === agentId);
    if (!agentData) return;
    
    // Obtener configuración por defecto del agente
    const defaultConfig = {};
    if (agentData.hasConfig) {
        Object.entries(agentData.config).forEach(([key, field]) => {
            defaultConfig[key] = field.default;
        });
    }
    
    // Agregar agente a la etapa
    stage.agents = [{ 
        id: agentId,
        name: agentData.name, 
        icon: agentData.icon,
        config: defaultConfig
    }];
    
    // Actualizar agentes disponibles
    updateAvailableAgents();
    
    // Re-renderizar
    renderEditor();
    
    // Marcar como cambios sin guardar
    markAsUnsaved();
}

function removeAgentFromStage(stageId) {
    const stage = currentTemplate.realContent.stages.find(s => s.id === stageId);
    if (!stage || !stage.agents || stage.agents.length === 0) return;
    
    const agent = stage.agents[0];
    
    showConfirmModal({
        title: 'Quitar agente',
        message: `¿Estás seguro de que quieres quitar el agente "${agent.name}" de la etapa "${stage.name}"?`,
        confirmText: 'Quitar agente',
        cancelText: 'Cancelar',
        variant: 'primary',
        onConfirm: () => {
            stage.agents = [];
            updateAvailableAgents();
            renderEditor();
            markAsUnsaved();
        },
        onCancel: () => {
            // No hacer nada
        }
    });
}

function deleteStage(stageId) {
    const stage = currentTemplate.realContent.stages.find(s => s.id === stageId);
    if (!stage) return;
    
    showConfirmModal({
        title: 'Eliminar etapa',
        message: `¿Estás seguro de que quieres eliminar la etapa "${stage.name}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        variant: 'error',
        onConfirm: () => {
            // ELIMINAR DIRECTAMENTE
            currentTemplate.realContent.stages = currentTemplate.realContent.stages.filter(s => s.id !== stageId);
            
            // Si la etapa tenía templateId, devolverla a availableStages
            if (stage.templateId) {
                const originalStage = availableStages.find(s => s.id === stage.templateId);
                if (!originalStage) {
                    availableStages.push({
                        id: stage.templateId,
                        name: stage.name,
                        category: stage.category,
                        createdAt: new Date().toISOString()
                    });
                    saveAvailableStages();
                }
            }
            
            // Actualizar agentes disponibles
            updateAvailableAgents();
            
            // LIMPIAR COMPLETAMENTE EL DOM Y RE-RENDERIZAR
            setTimeout(() => {
                // Limpiar completamente el stages container
                const stagesContainer = document.getElementById('stagesContainer');
                if (stagesContainer) {
                    stagesContainer.innerHTML = '';
                }
                
                // Re-renderizar todo desde cero
                renderEditor();
            }, 100);
            
            // Marcar como cambios sin guardar
            markAsUnsaved();
        },
        onCancel: () => {
            console.log('Eliminación de etapa cancelada');
        }
    });
}


// ========================================
// ACCIONES DE AGENTES
// ========================================

function addAgentToStage(stageId, agentId) {
    const stage = currentTemplate.realContent.stages.find(s => s.id === stageId);
    const agent = AGENTS.find(a => a.id === agentId);
    
    if (stage && agent) {
        // Solo permitir un agente por etapa
        if (!stage.agents || stage.agents.length === 0) {
            stage.agents = [{ ...agent }];
            updateAvailableAgents();
            markAsUnsaved();
            renderEditor();
        }
    }
}

function updateAgentConfig(stageId, configKey, value) {
    const stage = currentTemplate.realContent.stages.find(s => s.id === stageId);
    
    if (!stage || !stage.agents || stage.agents.length === 0) {
        return;
    }
    
    const agent = stage.agents[0];
    
    // Inicializar config si no existe
    if (!agent.config) {
        agent.config = {};
    }
    
    // Actualizar el valor de configuración
    // Convertir a número si es un campo numérico
    const agentData = AGENTS.find(a => a.id === agent.id);
    if (agentData && agentData.config && agentData.config[configKey]) {
        const field = agentData.config[configKey];
        agent.config[configKey] = field.type === 'number' ? parseFloat(value) || 0 : value;
    } else {
        agent.config[configKey] = value;
    }
    
    // Marcar como cambios sin guardar
    markAsUnsaved();
    
    console.log('Configuración actualizada:', { stageId, configKey, value, agentConfig: agent.config });
}

window.toggleAgentConfig = function(stageId) {
    const configDiv = document.getElementById(`agent-config-${stageId}`);
    const chevron = document.getElementById(`chevron-${stageId}`);
    const header = configDiv?.previousElementSibling;
    
    if (!configDiv || !chevron) return;
    
    // Toggle visibility
    if (configDiv.style.display === 'none') {
        // Expandir
        configDiv.style.display = 'flex';
        chevron.classList.remove('fa-chevron-down');
        chevron.classList.add('fa-chevron-up');
        // Mostrar divider
        if (header) {
            header.style.borderBottom = '1px solid var(--ubits-border-1)';
            header.style.paddingBottom = '8px';
        }
    } else {
        // Contraer
        configDiv.style.display = 'none';
        chevron.classList.remove('fa-chevron-up');
        chevron.classList.add('fa-chevron-down');
        // Ocultar divider
        if (header) {
            header.style.borderBottom = 'none';
            header.style.paddingBottom = '0';
        }
    }
}

// ========================================
// GESTIÓN DE ETAPAS
// ========================================

function loadAvailableStages() {
    const stored = localStorage.getItem('availableStages');
    if (stored) {
        availableStages = JSON.parse(stored);
    } else {
        // Crear etapas de ejemplo si no hay ninguna
        availableStages = [
            {
                id: 'stage-ejemplo-1',
                name: 'Entrevista inicial',
                category: 'entrevistas',
                createdAt: new Date().toISOString()
            },
            {
                id: 'stage-ejemplo-2',
                name: 'Evaluación técnica',
                category: 'pruebas-tecnicas',
                createdAt: new Date().toISOString()
            },
            {
                id: 'stage-ejemplo-3',
                name: 'Verificación de referencias',
                category: 'verificacion',
                createdAt: new Date().toISOString()
            }
        ];
        saveAvailableStages();
    }
}

function saveAvailableStages() {
    localStorage.setItem('availableStages', JSON.stringify(availableStages));
}

function generateStageId() {
    return 'stage-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
}

function openCreateStageModal() {
    showFormModal({
        title: 'Crear nueva etapa',
        fields: [
            {
                id: 'stageName',
                label: 'Nombre de la etapa',
                type: 'text',
                placeholder: 'Ej: Entrevista técnica',
                required: true,
                maxLength: 50
            },
            {
                id: 'stageCategory',
                label: 'Categoría',
                type: 'select',
                required: true,
                selectOptions: STAGE_CATEGORIES.map(cat => ({
                    value: cat.id,
                    text: cat.name
                }))
            }
        ],
        submitText: 'Crear etapa',
        cancelText: 'Cancelar',
        onSubmit: function(formData) {
            createStageTemplate(formData);
        },
        onCancel: function() {
            // No hacer nada
        }
    });
}

// Exportar función al objeto window
window.openCreateStageModal = openCreateStageModal;

function createStageTemplate(formData) {
    const { stageName, stageCategory } = formData;
    
    // Validar que el nombre no esté vacío
    if (!stageName || !stageName.trim()) {
        return;
    }
    
    // Validar que el nombre no esté duplicado
    const existingStage = availableStages.find(stage => 
        stage.name.toLowerCase() === stageName.toLowerCase()
    );
    
    if (existingStage) {
        return;
    }
    
    // Crear nueva etapa
    const newStage = {
        id: generateStageId(),
        name: stageName.trim(),
        category: stageCategory,
        createdAt: new Date().toISOString()
    };
    
    // Agregar a la lista de etapas disponibles
    availableStages.push(newStage);
    
    // Guardar en localStorage
    saveAvailableStages();
    
    // Re-renderizar la lista de etapas
    renderAvailableStages();
    
    // Marcar como cambios sin guardar
    markAsUnsaved();
}

function editStageTemplate(stageId) {
    const stage = availableStages.find(s => s.id === stageId);
    if (!stage) return;
    
    const category = STAGE_CATEGORIES.find(cat => cat.id === stage.category);
    
    // Configurar callback global para establecer valores después de crear el modal
    window.modalFormCallback = function(formData) {
        updateStageTemplate(stageId, formData);
    };
    
    showFormModal({
        title: 'Editar etapa',
        fields: [
            {
                id: 'stageName',
                label: 'Nombre de la etapa',
                type: 'text',
                placeholder: 'Ej: Entrevista técnica',
                required: true,
                maxLength: 50,
                value: stage.name
            },
            {
                id: 'stageCategory',
                label: 'Categoría',
                type: 'select',
                required: true,
                selectOptions: STAGE_CATEGORIES.map(cat => ({
                    value: cat.id,
                    text: cat.name
                })),
                value: stage.category
            }
        ],
        submitText: 'Guardar cambios',
        cancelText: 'Cancelar',
        onSubmit: function(formData) {
            window.modalFormCallback(formData);
        },
        onCancel: function() {
            // No hacer nada
        }
    });
}

function updateStageTemplate(stageId, formData) {
    const { stageName, stageCategory } = formData;
    
    // Validar que el nombre no esté vacío
    if (!stageName || !stageName.trim()) {
        return;
    }
    
    // Validar que el nombre no esté duplicado (excluyendo la etapa actual)
    const existingStage = availableStages.find(stage => 
        stage.id !== stageId && 
        stage.name.toLowerCase() === stageName.toLowerCase()
    );
    
    if (existingStage) {
        return;
    }
    
    // Encontrar y actualizar la etapa
    const stageIndex = availableStages.findIndex(s => s.id === stageId);
    if (stageIndex === -1) return;
    
    availableStages[stageIndex] = {
        ...availableStages[stageIndex],
        name: stageName.trim(),
        category: stageCategory,
        updatedAt: new Date().toISOString()
    };
    
    // Guardar en localStorage
    saveAvailableStages();
    
    // Re-renderizar la lista de etapas
    renderAvailableStages();
    
    // Marcar como cambios sin guardar
    markAsUnsaved();
}

function deleteStageTemplate(stageId) {
    const stage = availableStages.find(s => s.id === stageId);
    if (!stage) return;
    
    showConfirmModal({
        title: 'Eliminar etapa',
        message: `¿Estás seguro de que quieres eliminar la etapa "${stage.name}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        variant: 'error',
        onConfirm: () => {
            confirmDeleteStageTemplate(stageId);
        },
        onCancel: () => {
            // No hacer nada
        }
    });
}

function confirmDeleteStageTemplate(stageId) {
    // Remover de la lista de etapas disponibles
    availableStages = availableStages.filter(s => s.id !== stageId);
    
    // Guardar en localStorage
    saveAvailableStages();
    
    // Re-renderizar la lista de etapas
    renderAvailableStages();
    
    // Marcar como cambios sin guardar
    markAsUnsaved();
}

function handleStageTemplateDragStart(event) {
    console.log('handleStageTemplateDragStart called');
    const stageItem = event.target.closest('.stage-item');
    if (!stageItem) {
        console.log('No stage item found');
        return;
    }
    
    const stageId = stageItem.getAttribute('data-stage-id');
    const stageName = stageItem.getAttribute('data-stage-name');
    const stageCategory = stageItem.getAttribute('data-stage-category');
    
    console.log('Dragging stage:', { stageId, stageName, stageCategory });
    
    // Guardar datos del elemento arrastrado
    draggedElement = {
        type: 'stage-template',
        id: stageId,
        name: stageName,
        category: stageCategory,
        element: stageItem
    };
    
    // Agregar clase de arrastre
    stageItem.classList.add('dragging');
    
    // Configurar datos de transferencia
    event.dataTransfer.setData('text/plain', JSON.stringify({
        type: 'stage-template',
        id: stageId,
        name: stageName,
        category: stageCategory
    }));
    
    // Configurar efecto de arrastre
    event.dataTransfer.effectAllowed = 'move';
    
    console.log('Iniciando arrastre de etapa:', stageName);
}

function handleStageTemplateDragEnd(event) {
    const stageItem = event.target.closest('.stage-item');
    if (stageItem) {
        stageItem.classList.remove('dragging');
    }
    
    // Limpiar datos del elemento arrastrado
    draggedElement = null;
    
    console.log('Finalizando arrastre de etapa');
}

// ========================================
// ACCIONES DE PLANTILLA
// ========================================

// Función editTemplateName eliminada - ahora la edición es inline en el input

function saveTemplate() {
    console.log('saveTemplate() called');
    
    // Verificar que currentTemplate existe
    if (!currentTemplate) {
        console.log('No currentTemplate found');
        alert('Error: No hay plantilla para guardar');
        return;
    }
    
    console.log('Saving template:', currentTemplate);
    
    // Verificar que realContent existe
    if (!currentTemplate.realContent) {
        console.log('No realContent found, creating it');
        currentTemplate.realContent = { stages: [] };
    }
    
    // Actualizar contadores
    currentTemplate.stages = currentTemplate.realContent.stages.length;
    currentTemplate.agents = currentTemplate.realContent.stages.reduce((total, stage) => {
        return total + (stage.agents ? stage.agents.length : 0);
    }, 0);
    
    currentTemplate.lastModified = new Date().toISOString().split('T')[0];
    
    // Guardar en localStorage
    const stored = localStorage.getItem('templates');
    let templates = stored ? JSON.parse(stored) : [];
    
    const existingIndex = templates.findIndex(t => t.id === currentTemplate.id);
    if (existingIndex !== -1) {
        templates[existingIndex] = currentTemplate;
        console.log('Template updated in localStorage');
    } else {
        templates.unshift(currentTemplate);
        console.log('Template added to localStorage');
    }
    
    localStorage.setItem('templates', JSON.stringify(templates));
    console.log('Template saved to localStorage successfully');
    
    // Marcar que no hay cambios sin guardar
    markAsSaved();
    
    // Mostrar toast de éxito
    if (typeof showToast === 'function') {
        showToast('success', 'Plantilla guardada exitosamente');
    } else {
        alert('Plantilla guardada exitosamente');
    }
}

// ========================================
// MANEJO DE CAMBIOS SIN GUARDAR
// ========================================

function markAsUnsaved() {
    hasUnsavedChanges = true;
}

function markAsSaved() {
    hasUnsavedChanges = false;
    lastSavedTime = Date.now();
}

function handleLinkClick(event) {
    // Solo interceptar si hay cambios sin guardar
    if (!hasUnsavedChanges) return;
    
    // Solo interceptar botón "Volver"
    const backButton = event.target.closest('button[onclick*="goToDashboard"]');
    if (!backButton) return;
    
    // Interceptar navegación
    event.preventDefault();
    
    // Mostrar modal UBITS
    showConfirmModal({
        title: 'Cambios sin guardar',
        message: 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?',
        confirmText: 'Salir sin guardar',
        cancelText: 'Cancelar',
        variant: 'primary',
        onConfirm: () => {
            hasUnsavedChanges = false;
            goToDashboard();
        },
        onCancel: () => {
            // No hacer nada
        }
    });
}

function getStageById(stageId) {
    return currentTemplate.realContent.stages.find(s => s.id === stageId);
}

function getAgentById(agentId) {
    return AGENTS.find(a => a.id === agentId);
}

// ========================================
// NAVEGACIÓN
// ========================================

function goToDashboard() {
    window.location.href = 'index.html';
}

// ========================================
// MENÚ DESPLEGABLE DE ETAPAS
// ========================================

window.toggleStageMenu = function(event, stageId) {
    event.stopPropagation();
    
    const menu = document.getElementById(`stage-menu-${stageId}`);
    if (!menu) return;
    
    // Cerrar todos los demás menús abiertos
    document.querySelectorAll('.stage-menu-dropdown.show').forEach(m => {
        if (m !== menu) {
            m.classList.remove('show');
        }
    });
    
    // Toggle del menú actual
    menu.classList.toggle('show');
    
    // Si se abrió el menú, agregar listener para cerrar al hacer clic fuera
    if (menu.classList.contains('show')) {
        setTimeout(() => {
            document.addEventListener('click', closeStageMenus);
        }, 0);
    }
}

function closeStageMenus() {
    document.querySelectorAll('.stage-menu-dropdown.show').forEach(menu => {
        menu.classList.remove('show');
    });
    document.removeEventListener('click', closeStageMenus);
}

// ========================================
// MENÚ DESPLEGABLE DE ETAPAS DE PLANTILLA (COLUMNA IZQUIERDA)
// ========================================

window.toggleStageTemplateMenu = function(event, stageId) {
    event.stopPropagation();
    
    const menu = document.getElementById(`stage-template-menu-${stageId}`);
    if (!menu) {
        console.log('Menu not found:', `stage-template-menu-${stageId}`);
        return;
    }
    
    // Cerrar todos los demás menús abiertos
    document.querySelectorAll('.stage-menu-dropdown').forEach(m => {
        if (m !== menu) {
            m.classList.remove('show');
        }
    });
    
    // Toggle del menú actual
    menu.classList.toggle('show');
    
    // Si se abrió el menú, agregar listener para cerrar al hacer clic fuera
    if (menu.classList.contains('show')) {
        setTimeout(() => {
            document.addEventListener('click', closeStageTemplateMenus);
        }, 0);
    }
}

function closeStageTemplateMenus() {
    document.querySelectorAll('.stage-menu-dropdown').forEach(menu => {
        menu.classList.remove('show');
    });
    document.removeEventListener('click', closeStageTemplateMenus);
}

// ========================================
// INFORMACIÓN DE AGENTES
// ========================================

window.showAgentInfo = function(agentId) {
    console.log('showAgentInfo called with:', agentId);
    const agent = AGENTS.find(a => a.id === agentId);
    if (!agent) {
        console.log('Agent not found:', agentId);
        return;
    }
    
    const descriptions = {
        'cv-analyzer': 'Permite analizar automáticamente la hoja de vida del candidato para identificar su experiencia y formación.',
        'interview-ia': 'Permite realizar entrevistas virtuales asistidas por Serena para profundizar en la experiencia y habilidades del candidato.',
        'psychometric-analyst': 'Permite evaluar las competencias y el perfil psicológico del candidato mediante una prueba estructurada.',
        'background-check': 'Permite generar y verificar el certificado de antecedentes judiciales del candidato para validar su historial legal de forma segura.'
    };
    
    const description = descriptions[agentId] || agent.description;
    
    // Usar showConfirmModal con un solo botón
    showConfirmModal({
        title: agent.name,
        message: description,
        confirmText: 'Cerrar',
        variant: 'primary',
        singleButton: true,
        onConfirm: function() {
            // Solo cerrar el modal
        }
    });
}

function editCategory() {
    const categoryText = document.getElementById('categoryText');
    const currentCategory = categoryText.textContent;
    
    showFormModal({
        title: 'Editar categoría',
        content: `
            <div class="form-group">
                <label for="categoryInput">Nombre de la categoría:</label>
                <input type="text" id="categoryInput" value="${currentCategory}" maxlength="50" placeholder="Ingresa el nombre de la categoría">
            </div>
        `,
        confirmText: 'Guardar',
        cancelText: 'Cancelar',
        onConfirm: () => {
            const newCategory = document.getElementById('categoryInput').value.trim();
            if (newCategory) {
                categoryText.textContent = newCategory;
                if (currentTemplate) {
                    currentTemplate.category = newCategory;
                }
            }
        }
    });
}

// Función para abrir el dropdown de categoría de plantilla
function openTemplateCategoryDropdown(event) {
    event.stopPropagation();
    
    // Cerrar cualquier dropdown abierto
    closeAllTemplateCategoryDropdowns();
    
    const categoryElement = event.currentTarget;
    const rect = categoryElement.getBoundingClientRect();
    
    // Crear el dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'template-category-dropdown';
    
    const categories = [
        { value: 'administracion', label: 'Administración' },
        { value: 'atencion-cliente', label: 'Atención al Cliente' },
        { value: 'contratacion-general', label: 'Contratación General' },
        { value: 'diseño-creatividad', label: 'Diseño y Creatividad' },
        { value: 'finanzas-contabilidad', label: 'Finanzas y Contabilidad' },
        { value: 'ingenieria', label: 'Ingeniería' },
        { value: 'operaciones', label: 'Operaciones' },
        { value: 'recursos-humanos', label: 'Recursos Humanos' },
        { value: 'tecnologia-desarrollo', label: 'Tecnología/Desarrollo' },
        { value: 'ventas-marketing', label: 'Ventas y Marketing' }
    ];
    
    categories.forEach(category => {
        const option = document.createElement('div');
        option.className = 'template-category-option';
        if (category.value === (currentTemplate?.category || 'contratacion-general')) {
            option.classList.add('selected');
        }
        option.textContent = category.label;
        option.onclick = () => changeTemplateCategory(category.value);
        dropdown.appendChild(option);
    });
    
    // Posicionar el dropdown
    dropdown.style.top = (rect.bottom + 4) + 'px';
    dropdown.style.left = rect.left + 'px';
    
    // Agregar al DOM
    document.body.appendChild(dropdown);
    
    // Mostrar con animación
    setTimeout(() => {
        dropdown.classList.add('show');
    }, 10);
    
    // Cerrar al hacer clic fuera
    const closeDropdown = (e) => {
        if (!categoryElement.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.remove();
            document.removeEventListener('click', closeDropdown);
        }
    };
    
    setTimeout(() => {
        document.addEventListener('click', closeDropdown);
    }, 100);
}

// Función para cambiar la categoría de la plantilla
function changeTemplateCategory(newCategory) {
    const categoryNameElement = document.getElementById('templateCategoryName');
    const categories = {
        'administracion': 'Administración',
        'atencion-cliente': 'Atención al Cliente',
        'contratacion-general': 'Contratación General',
        'diseño-creatividad': 'Diseño y Creatividad',
        'finanzas-contabilidad': 'Finanzas y Contabilidad',
        'ingenieria': 'Ingeniería',
        'operaciones': 'Operaciones',
        'recursos-humanos': 'Recursos Humanos',
        'tecnologia-desarrollo': 'Tecnología/Desarrollo',
        'ventas-marketing': 'Ventas y Marketing'
    };
    
    if (categoryNameElement) {
        categoryNameElement.textContent = categories[newCategory] || newCategory;
    }
    
    if (currentTemplate) {
        currentTemplate.category = newCategory;
    }
    
    // Cerrar el dropdown
    closeAllTemplateCategoryDropdowns();
}

// Función para cerrar todos los dropdowns de categorías
function closeAllTemplateCategoryDropdowns() {
    const dropdowns = document.querySelectorAll('.template-category-dropdown');
    dropdowns.forEach(dropdown => dropdown.remove());
}

function goBackToDashboard() {
    showConfirmModal({
        title: 'Salir sin guardar',
        message: '¿Estás seguro de que quieres salir sin guardar?',
        confirmText: 'Salir',
        cancelText: 'Cancelar',
        variant: 'primary',
        onConfirm: () => {
            window.location.href = 'index.html';
        },
        onCancel: () => {
            console.log('Salida cancelada');
        }
    });
}

// Función para formatear fechas (copiada del dashboard)
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

