// ========================================
// EDITOR DE PLANTILLAS UBITS
// Funcionalidad completa del editor usando componentes UBITS
// ========================================

// Agentes disponibles
const AGENTS = [
    { id: 'cv-analyzer', name: 'Analizador CV', icon: 'fa-file-alt', description: 'Analiza CV y asigna puntaje' },
    { id: 'interview-ia', name: 'Entrevista Serena', icon: 'fa-comments', description: 'Genera preguntas y analiza respuestas' },
    { id: 'tech-test', name: 'Prueba técnica', icon: 'fa-code', description: 'Evalúa habilidades técnicas' },
    { id: 'auto-filter', name: 'Analista psicométrico', icon: 'fa-filter', description: 'Descarta por pruebas psicométricas' },
    { id: 'ref-check', name: 'Verificación referencias', icon: 'fa-phone', description: 'Valida referencias' },
    { id: 'salary-analyst', name: 'Analista de salario', icon: 'fa-dollar-sign', description: 'Analiza y valida expectativas salariales' }
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
    
    // Click en nombre de plantilla para editar
    const templateName = document.getElementById('templateName');
    if (templateName) {
        templateName.addEventListener('click', editTemplateName);
    }
    
    // Funcionalidad de tabs
    setupTabs();
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

// ========================================
// RENDERIZADO
// ========================================

function renderEditor() {
    renderAgents();
    renderStages();
    renderAvailableStages();
    updateTemplateInfo();
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
                <div class="agent-icon"><i class="far ${agent.icon}"></i></div>
                <div class="agent-name">${agent.name}</div>
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
    
    if (availableStages.length === 0) {
        stagesList.innerHTML = `
            <div class="empty-stages-message">
                <i class="far fa-sitemap"></i>
                <p>No hay etapas creadas</p>
                <small>Crea tu primera etapa para comenzar</small>
            </div>
        `;
        return;
    }
    
    stagesList.innerHTML = availableStages.map(stage => {
        const category = STAGE_CATEGORIES.find(cat => cat.id === stage.category);
        return `
            <div class="stage-item" 
                 draggable="true" 
                 data-stage-id="${stage.id}"
                 data-stage-name="${stage.name}"
                 data-stage-category="${stage.category}">
                <div class="stage-header">
                    <div class="stage-icon"><i class="far ${category ? category.icon : 'fa-sitemap'}"></i></div>
                    <div class="stage-info">
                        <div class="stage-name">${stage.name}</div>
                        <div class="stage-category">${category ? category.name : stage.category}</div>
                    </div>
                </div>
                <div class="stage-actions">
                    <button class="stage-action-btn" onclick="editStageTemplate('${stage.id}')" title="Editar">
                        <i class="far fa-edit"></i>
                    </button>
                    <button class="stage-action-btn" onclick="deleteStageTemplate('${stage.id}')" title="Eliminar">
                        <i class="far fa-trash"></i>
                    </button>
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
    const emptyState = document.getElementById('emptyState');
    if (!stagesContainer || !emptyState) return;
    
    // Siempre mantener el stagesContainer visible para drag and drop
    stagesContainer.style.display = 'block';
    
    // Mostrar empty state si no hay etapas
    if (!currentTemplate.realContent.stages || currentTemplate.realContent.stages.length === 0) {
        emptyState.style.display = 'flex';
        stagesContainer.innerHTML = ''; // Limpiar contenido pero mantener el contenedor
        return;
    }
    
    // Ocultar empty state y mostrar etapas
    emptyState.style.display = 'none';
    
    stagesContainer.innerHTML = currentTemplate.realContent.stages.map((stage, index) => {
        const category = STAGE_CATEGORIES.find(cat => cat.id === stage.category);
        return `
            <div class="stage-item" draggable="true" data-stage-id="${stage.id}" data-stage-index="${index}">
                <i class="far fa-grip-vertical stage-drag-handle"></i>
                <div class="stage-content">
                    <div class="stage-header">
                        <h4 class="stage-name">${stage.name}</h4>
                        ${category ? `<span class="stage-category-badge">${category.name}</span>` : ''}
                    </div>
                    <div class="stage-agents">
                        ${stage.agents ? stage.agents.map(agent => `
                            <div class="stage-agent">
                                <i class="far ${agent.icon || 'fa-user'}"></i>
                                <span>${agent.name}</span>
                            </div>
                        `).join('') : ''}
                    </div>
                </div>
                <div class="stage-actions">
                    <button class="stage-action-btn" onclick="editStageName('${stage.id}')" title="Editar nombre">
                        <i class="far fa-edit"></i>
                    </button>
                    <button class="stage-action-btn" onclick="removeAgentFromStage('${stage.id}')" title="Quitar agente">
                        <i class="far fa-times"></i>
                    </button>
                    <button class="stage-action-btn" onclick="deleteStage('${stage.id}')" title="Eliminar etapa">
                        <i class="far fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Agregar event listeners para drag and drop
    stagesContainer.querySelectorAll('.stage-item').forEach(item => {
        item.addEventListener('dragstart', handleStageDragStart);
        item.addEventListener('dragover', handleStageDragOver);
        item.addEventListener('drop', handleStageDrop);
        item.addEventListener('dragend', handleStageDragEnd);
    });
    
    // Hacer el contenedor droppable para agentes
    makeBoardDroppable();
}

function makeBoardDroppable() {
    const stagesContainer = document.getElementById('stagesContainer');
    if (!stagesContainer) return;
    
    stagesContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // Agregar clase visual para indicar drop zone
        stagesContainer.classList.add('drag-over');
    });
    
    stagesContainer.addEventListener('dragleave', (e) => {
        // Solo remover la clase si realmente salimos del contenedor
        if (!stagesContainer.contains(e.relatedTarget)) {
            stagesContainer.classList.remove('drag-over');
        }
    });
    
    stagesContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        stagesContainer.classList.remove('drag-over');
        
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
    });
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
    
    // Re-renderizar todo PRIMERO
    renderEditor();
    
    // DESPUÉS remover de las etapas disponibles
    availableStages = availableStages.filter(stage => stage.id !== id);
    saveAvailableStages();
    
    // Re-renderizar solo las etapas disponibles
    renderAvailableStages();
    
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

function handleStageDragStart(e) {
    draggedElement = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
}

function handleStageDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleStageDrop(e) {
    e.preventDefault();
    
    if (draggedElement && draggedElement.classList.contains('stage-item')) {
        const draggedStageId = draggedElement.dataset.stageId;
        const targetStageId = e.target.closest('.stage-item')?.dataset.stageId;
        
        if (targetStageId && draggedStageId !== targetStageId) {
            reorderStages(draggedStageId, targetStageId);
        }
    }
}

function handleStageDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedElement = null;
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
        title: 'Editar nombre de etapa',
        message: 'Modifica el nombre de la etapa en el área de trabajo',
        fields: [
            {
                id: 'stageName',
                label: 'Nombre de la etapa',
                type: 'text',
                placeholder: 'Ej: Entrevista técnica',
                required: true,
                maxLength: 50,
                value: stage.name
            }
        ],
        confirmText: 'Guardar cambios',
        cancelText: 'Cancelar',
        variant: 'primary',
        onConfirm: (formData) => {
            const newName = formData.stageName;
            if (newName && newName.trim()) {
                stage.name = newName.trim();
                markAsUnsaved();
                renderEditor();
            }
        },
        onCancel: () => {
            // No hacer nada
        }
    });
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
            // Si la etapa tiene templateId, devolverla a la lista de disponibles
            if (stage.templateId) {
                const originalStage = availableStages.find(s => s.id === stage.templateId);
                if (!originalStage) {
                    // Si no existe en la lista de disponibles, recrearla
                    const category = STAGE_CATEGORIES.find(cat => cat.id === stage.category);
                    availableStages.push({
                        id: stage.templateId,
                        name: stage.name,
                        category: stage.category,
                        createdAt: new Date().toISOString()
                    });
                }
                saveAvailableStages();
            }
            
            // Remover de la plantilla actual
            currentTemplate.realContent.stages = currentTemplate.realContent.stages.filter(s => s.id !== stageId);
            
            // Actualizar agentes disponibles
            updateAvailableAgents();
            
            // Re-renderizar todo
            renderEditor();
            
            // Marcar como cambios sin guardar
            markAsUnsaved();
        },
        onCancel: () => {
            console.log('Eliminación de etapa cancelada');
        }
    });
}

function reorderStages(draggedStageId, targetStageId) {
    const stages = currentTemplate.realContent.stages;
    const draggedIndex = stages.findIndex(s => s.id === draggedStageId);
    const targetIndex = stages.findIndex(s => s.id === targetStageId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
        const draggedStage = stages[draggedIndex];
        stages.splice(draggedIndex, 1);
        stages.splice(targetIndex, 0, draggedStage);
        renderEditor();
    }
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
    console.log('openCreateStageModal llamada');
    
    // Verificar que showAlertModal esté disponible
    if (typeof showAlertModal !== 'function') {
        console.error('showAlertModal no está disponible');
        alert('Error: showAlertModal no está disponible');
        return;
    }
    
    console.log('showAlertModal está disponible, creando modal...');
    
    // Usar modal simple para probar
    showAlertModal({
        title: 'Crear nueva etapa',
        message: 'Esta es una prueba del modal. ¿Funciona?',
        variant: 'info'
    });
    
    console.log('Modal creado');
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
    
    showFormModal({
        title: 'Editar etapa',
        message: 'Modifica los datos de la etapa',
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
                options: STAGE_CATEGORIES.map(cat => ({
                    value: cat.id,
                    text: cat.name
                })),
                value: stage.category
            }
        ],
        confirmText: 'Guardar cambios',
        cancelText: 'Cancelar',
        variant: 'primary',
        onConfirm: (formData) => {
            updateStageTemplate(stageId, formData);
        },
        onCancel: () => {
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

function editTemplateName() {
    if (currentTemplate) {
        const newName = prompt('Nuevo nombre de la plantilla:', currentTemplate.name);
        if (newName && newName.trim()) {
            currentTemplate.name = newName.trim();
            updateTemplateInfo();
        }
    }
}

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

