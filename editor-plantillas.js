// ========================================
// EDITOR DE PLANTILLAS UBITS
// Funcionalidad completa del editor usando componentes UBITS
// ========================================

// Agentes disponibles (ahora son etapas por defecto automatizadas)
const AGENTS = [
    { 
        id: 'cv-analyzer', 
        name: 'Analizador CV', 
        icon: 'fa-file-alt', 
        description: 'Analiza CV y asigna puntaje',
        category: 'evaluacion-inicial',
        hasConfig: true,
        config: {
            salaryPercentage: { 
                label: 'Margen sobre salario', 
                type: 'number', 
                default: 25, 
                suffix: '%',
                tooltip: 'Define qué tanto puede superar el candidato el salario máximo del puesto y seguir siendo considerado. Ejemplo: si el tope es $1.000 y pones 10%, se aceptan candidatos hasta $1.100.'
            },
            minScore: { 
                label: 'Puntaje mínimo del CV', 
                type: 'number', 
                default: 70, 
                suffix: 'pts',
                tooltip: 'Puntaje mínimo que el CV debe obtener para pasar a la siguiente etapa. Si lo dejas en 0, todos los candidatos avanzan sin filtro por puntaje.'
            },
            acceptExEmployees: {
                label: 'Acepta ex colaboradores',
                type: 'radio',
                default: 'si',
                options: [
                    { value: 'si', text: 'Sí' },
                    { value: 'no', text: 'No' }
                ]
            }
        }
    },
    { 
        id: 'interview-ia', 
        name: 'Entrevista Serena', 
        icon: 'fa-comments', 
        description: 'Genera preguntas y analiza respuestas',
        category: 'entrevistas',
        hasConfig: true,
        config: {
            interviewType: {
                label: 'Tipo de entrevista',
                type: 'radio',
                default: 'telefonica',
                options: [
                    { value: 'telefonica', text: 'Telefónica' },
                    { value: 'virtual', text: 'Virtual' }
                ]
            },
            voice: {
                label: 'Voz de Serena',
                type: 'select',
                default: 'colombia',
                options: [
                    { value: 'peru', text: 'Perú 🇵🇪' },
                    { value: 'costa-rica', text: 'Costa Rica 🇨🇷' },
                    { value: 'honduras', text: 'Honduras 🇭🇳' },
                    { value: 'argentina', text: 'Argentina 🇦🇷' },
                    { value: 'chile', text: 'Chile 🇨🇱' },
                    { value: 'mexico', text: 'México 🇲🇽' },
                    { value: 'colombia', text: 'Colombia 🇨🇴' }
                ]
            },
            expirationDays: { 
                label: 'Días para que expire la entrevista', 
                type: 'number', 
                default: 0, 
                suffix: 'días',
                tooltip: 'Cantidad de días que el candidato tiene para completar la entrevista desde que recibe la invitación. Si no responde dentro de ese plazo, la entrevista vence y ya no podrá realizarla.'
            },
            minScore: { 
                label: 'Puntaje mínimo de la entrevista', 
                type: 'number', 
                default: 0, 
                suffix: 'pts',
                tooltip: 'Puntaje mínimo que el candidato debe obtener en la entrevista para avanzar a la siguiente etapa del proceso.'
            }
        },
        // Voces disponibles con información adicional
        voices: [
            { id: 'peru', name: 'Perú', flag: '🇵🇪', code: 'es-PE' },
            { id: 'costa-rica', name: 'Costa Rica', flag: '🇨🇷', code: 'es-CR' },
            { id: 'honduras', name: 'Honduras', flag: '🇭🇳', code: 'es-HN' },
            { id: 'argentina', name: 'Argentina', flag: '🇦🇷', code: 'es-AR' },
            { id: 'chile', name: 'Chile', flag: '🇨🇱', code: 'es-CL' },
            { id: 'mexico', name: 'México', flag: '🇲🇽', code: 'es-MX' },
            { id: 'colombia', name: 'Colombia', flag: '🇨🇴', code: 'es-CO' }
        ]
    },
    { 
        id: 'psychometric-analyst', 
        name: 'Analista psicométrico', 
        icon: 'fa-brain', 
        description: 'Evalúa mediante pruebas psicométricas',
        category: 'evaluacion-psicometrica',
        hasConfig: true,
        config: {
            minScore: { 
                label: 'Puntaje mínimo global', 
                type: 'number', 
                default: 0, 
                suffix: 'pts',
                tooltip: 'Puntaje mínimo global que el candidato debe lograr en todas las pruebas psicométricas para considerarse aprobado en esta etapa. Si es 0, no se aplica filtro global.'
            },
            tests: {
                label: 'Pruebas psicotécnicas',
                type: 'psychometric-tests-manager',
                default: []
            }
        },
        // Opciones disponibles para las pruebas
        testTypes: [
            { value: 'cognicion', text: 'Cognición (inteligencia)' },
            { value: 'perfil-motivacion', text: 'Perfil de motivación' },
            { value: 'dominancia-cerebral', text: 'Dominancia Cerebral' },
            { value: 'estilo-social', text: 'Estilo Social' },
            { value: 'inventario-valores', text: 'Inventario de valores organizacionales (Corta)' },
            { value: 'personalidad-16', text: 'Personalidad 16' }
        ],
        testLanguages: [
            { value: 'es', text: 'Español' },
            { value: 'en', text: 'Inglés' },
            { value: 'pt', text: 'Portugués' }
        ]
    },
    { 
        id: 'background-check', 
        name: 'Antecedentes judiciales', 
        icon: 'fa-shield-check', 
        description: 'Verifica certificado de antecedentes judiciales',
        category: 'verificacion',
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

// Etapas por defecto que siempre deben estar disponibles
const DEFAULT_STAGES = [
    // Categoría: Evaluación inicial
    {
        id: 'default-review-cv',
        name: 'Revisión de CV',
        category: 'evaluacion-inicial',
        type: 'custom',
        description: 'Revisión del currículum para validar experiencia, formación y requisitos mínimos del cargo.',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    {
        id: 'default-pre-filter-requirements',
        name: 'Pre-filtro de requisitos mínimos',
        category: 'evaluacion-inicial',
        type: 'custom',
        description: 'Validación rápida de criterios excluyentes: años de experiencia, nivel educativo, idioma, país/ciudad, etc.',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    // Categoría: Entrevistas
    {
        id: 'default-interview-pre-screening',
        name: 'Entrevista de pre-screening',
        category: 'entrevistas',
        type: 'custom',
        description: 'Primera conversación breve (teléfono o videollamada) para validar interés, motivación y puntos clave del perfil.',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    {
        id: 'default-interview-recruiter',
        name: 'Entrevista con reclutador',
        category: 'entrevistas',
        type: 'custom',
        description: 'Entrevista más profunda para evaluar competencias blandas, expectativas y encaje general con la empresa.',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    {
        id: 'default-interview-hiring-manager',
        name: 'Entrevista con el área / hiring manager',
        category: 'entrevistas',
        type: 'custom',
        description: 'Entrevista técnica o funcional con el responsable del área para evaluar ajuste al rol.',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    {
        id: 'default-interview-technical',
        name: 'Entrevista técnica',
        category: 'entrevistas',
        type: 'custom',
        description: 'Conversación enfocada en conocimientos técnicos, metodologías de trabajo y experiencia práctica.',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    {
        id: 'default-interview-final',
        name: 'Entrevista final',
        category: 'entrevistas',
        type: 'custom',
        description: 'Última entrevista con dirección o stakeholders clave antes de la decisión definitiva.',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    // Categoría: Evaluación psicométrica
    {
        id: 'default-psychometric-general',
        name: 'Evaluación psicométrica general',
        category: 'evaluacion-psicometrica',
        type: 'custom',
        description: 'Batería estándar de pruebas para medir habilidades cognitivas y rasgos de personalidad relevantes.',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    {
        id: 'default-test-cognitive',
        name: 'Test de habilidades cognitivas',
        category: 'evaluacion-psicometrica',
        type: 'custom',
        description: 'Mide razonamiento lógico, numérico, verbal u otras capacidades cognitivas.',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    {
        id: 'default-test-personality',
        name: 'Test de personalidad laboral',
        category: 'evaluacion-psicometrica',
        type: 'custom',
        description: 'Evalúa rasgos de personalidad vinculados al estilo de trabajo, liderazgo y trabajo en equipo.',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    {
        id: 'default-test-soft-skills',
        name: 'Test de competencias blandas',
        category: 'evaluacion-psicometrica',
        type: 'custom',
        description: 'Mide competencias como comunicación, resolución de problemas, organización, manejo del estrés, etc.',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    // Categoría: Pruebas técnicas
    {
        id: 'default-technical-general',
        name: 'Prueba técnica general',
        category: 'pruebas-tecnicas',
        type: 'custom',
        description: 'Evaluación de conocimientos técnicos básicos requeridos para el rol.',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    {
        id: 'default-case-practical',
        name: 'Caso práctico / Challenge',
        category: 'pruebas-tecnicas',
        type: 'custom',
        description: 'Ejercicio aplicado (ej. resolver un caso, diseñar una solución, elaborar una propuesta) para ver cómo trabaja la persona.',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    {
        id: 'default-test-specific-skills',
        name: 'Prueba de habilidades específicas',
        category: 'pruebas-tecnicas',
        type: 'custom',
        description: 'Prueba focalizada en una herramienta o skill concreta (por ejemplo: Excel avanzado, un CRM, un lenguaje de programación).',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    {
        id: 'default-test-languages',
        name: 'Prueba de idiomas',
        category: 'pruebas-tecnicas',
        type: 'custom',
        description: 'Evaluación de comprensión y expresión oral/escrita en el idioma requerido por el puesto.',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    // Categoría: Verificación
    {
        id: 'default-verify-references',
        name: 'Verificación de referencias laborales',
        category: 'verificacion',
        type: 'custom',
        description: 'Contacto y validación de referencias con jefes o empleadores anteriores.',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    {
        id: 'default-verify-background',
        name: 'Verificación de antecedentes judiciales',
        category: 'verificacion',
        type: 'custom',
        description: 'Revisión de antecedentes según la normativa del país y las políticas internas.',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    {
        id: 'default-verify-studies',
        name: 'Verificación de estudios y certificados',
        category: 'verificacion',
        type: 'custom',
        description: 'Confirmación de títulos académicos, cursos y certificaciones declaradas.',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    {
        id: 'default-verify-documents',
        name: 'Verificación de documentación',
        category: 'verificacion',
        type: 'custom',
        description: 'Revisión de documentos de identidad, permisos de trabajo u otros requisitos legales.',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    // Categoría: Decisión final
    {
        id: 'default-final-review',
        name: 'Revisión final de candidatura',
        category: 'decision-final',
        type: 'custom',
        description: 'Etapa donde se consolidan evaluaciones y se define si el candidato avanza a oferta o se descarta.',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    {
        id: 'default-approval-offer',
        name: 'Aprobación para oferta',
        category: 'decision-final',
        type: 'custom',
        description: 'Marca al candidato como aprobado internamente y listo para recibir una propuesta.',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    {
        id: 'default-offer-sent',
        name: 'Oferta laboral enviada',
        category: 'decision-final',
        type: 'custom',
        description: 'Registro de que se envió la oferta formal (contrato, condiciones, salario, etc.).',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    {
        id: 'default-offer-accepted',
        name: 'Oferta aceptada',
        category: 'decision-final',
        type: 'custom',
        description: 'Candidato acepta la oferta y se confirma su incorporación.',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    {
        id: 'default-process-closed',
        name: 'Proceso cerrado – no seleccionado',
        category: 'decision-final',
        type: 'custom',
        description: 'Cierre formal de candidatos descartados en cualquier etapa.',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    {
        id: 'default-talent-pool',
        name: 'Banco de talento',
        category: 'decision-final',
        type: 'custom',
        description: 'Candidatos que no fueron seleccionados para esta vacante, pero quedan guardados como potenciales para futuras posiciones.',
        createdAt: new Date().toISOString(),
        isDefault: true
    },
    {
        id: 'default-hired',
        name: 'Contratado',
        category: 'decision-final',
        type: 'custom',
        description: 'Candidato ha sido contratado y se ha incorporado exitosamente a la empresa.',
        createdAt: new Date().toISOString(),
        isDefault: true
    }
];

// Estado global del editor
let currentTemplate = null;
let hasUnsavedChanges = false;
let lastSavedTime = null;
let availableAgents = [...AGENTS];
let availableStages = []; // Etapas creadas disponibles para arrastrar
let draggedElement = null;
let agentConfigStates = {}; // Guardar estados de expandido/contraído de agentes

// ========================================
// INICIALIZACIÓN
// ========================================

window.initializeEditor = function() {
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
    document.addEventListener('click', handleLinkClick, true); // Usar capture phase
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

// Migrar configuración antigua del analista psicométrico a la nueva estructura
function migratePsychometricAnalystConfig(stage) {
    if (stage.agentId !== 'psychometric-analyst') return;
    
    // Si ya tiene la nueva estructura (tests array), no migrar
    if (stage.config && stage.config.tests && Array.isArray(stage.config.tests)) {
        return;
    }
    
    // Si tiene la estructura antigua (minIQ, testType, testLanguage), migrar
    if (stage.config && (stage.config.minIQ !== undefined || stage.config.testType !== undefined || stage.config.testLanguage !== undefined)) {
        const agentData = AGENTS.find(a => a.id === 'psychometric-analyst');
        if (!agentData) return;
        
        // Crear array de tests con la prueba antigua
        const oldTest = {
            id: 'test-' + Date.now(),
            type: stage.config.testType || agentData.testTypes[0].value,
            language: stage.config.testLanguage || agentData.testLanguages[0].value,
            minScore: stage.config.minIQ || 0
        };
        
        // Crear nueva estructura
        const newConfig = {
            minScore: stage.config.minIQ || 0,
            tests: [oldTest]
        };
        
        // Eliminar campos antiguos
        delete stage.config.minIQ;
        delete stage.config.testType;
        delete stage.config.testLanguage;
        
        // Actualizar con nueva estructura
        stage.config = { ...stage.config, ...newConfig };
        
        console.log('✅ Migración completada para analista psicométrico:', stage.id);
    }
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
            
            // Migrar configuraciones antiguas del analista psicométrico
            if (currentTemplate.realContent.stages) {
                currentTemplate.realContent.stages.forEach(stage => {
                    migratePsychometricAnalystConfig(stage);
                });
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
        // Función para ajustar el ancho del input según el contenido
        function adjustInputWidth() {
            const text = templateName.value || templateName.placeholder || 'Nueva plantilla';
            
            // Crear elemento temporal para medir el ancho exacto del texto
            const tempSpan = document.createElement('span');
            tempSpan.style.visibility = 'hidden';
            tempSpan.style.position = 'absolute';
            tempSpan.style.whiteSpace = 'nowrap';
            tempSpan.style.fontFamily = 'Noto Sans';
            tempSpan.style.fontSize = '24px';
            tempSpan.style.fontWeight = '600';
            tempSpan.style.padding = '0';
            tempSpan.style.margin = '0';
            tempSpan.style.border = 'none';
            tempSpan.style.left = '-9999px';
            tempSpan.textContent = text;
            document.body.appendChild(tempSpan);
            
            const textWidth = tempSpan.getBoundingClientRect().width;
            document.body.removeChild(tempSpan);
            
            // Verificar si está en focus para agregar padding si es necesario
            const isFocused = document.activeElement === templateName;
            
            // Cuando está en focus, el CSS agrega padding: 4px 8px (16px total)
            // Cuando NO está en focus, el CSS tiene padding: 0
            // Como usamos box-sizing: content-box, el padding se suma al ancho
            const paddingWidth = isFocused ? 16 : 0; // 8px izquierdo + 8px derecho
            
            // Usar el ancho exacto del texto + padding si está en focus
            const exactWidth = Math.ceil(textWidth);
            const minWidth = 50;
            const maxWidth = 600;
            const finalWidth = Math.max(minWidth, Math.min(maxWidth, exactWidth + paddingWidth));
            
            console.log('🔍 adjustInputWidth:');
            console.log('  - Texto:', text);
            console.log('  - Ancho del texto:', textWidth);
            console.log('  - Está en focus:', isFocused);
            console.log('  - Padding a agregar:', paddingWidth);
            console.log('  - Ancho exacto (ceil):', exactWidth);
            console.log('  - Ancho final aplicado:', finalWidth);
            console.log('  - Ancho real del elemento:', templateName.getBoundingClientRect().width);
            
            templateName.style.width = finalWidth + 'px';
        }
        
        // Ajustar ancho inicial después de un pequeño delay
        setTimeout(() => {
            adjustInputWidth();
        }, 50);
        
        templateName.addEventListener('input', function() {
            if (currentTemplate) {
                currentTemplate.name = this.value.trim();
                markAsUnsaved();
            }
            // Ajustar ancho inmediatamente al escribir
            adjustInputWidth();
        });
        
        templateName.addEventListener('focus', function() {
            // Asegurar color cuando se enfoca
            this.style.color = 'var(--ubits-fg-1-high)';
            adjustInputWidth();
        });
        
        templateName.addEventListener('blur', function() {
            adjustInputWidth();
        });
        
        templateName.addEventListener('blur', function() {
            if (currentTemplate && this.value.trim() === '') {
                this.value = currentTemplate.name || 'Nueva plantilla';
                adjustInputWidth();
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
    try {
        const searchInput = document.getElementById('stageSearch');
        const clearButton = document.getElementById('clearStageSearch');
        const stagesList = document.getElementById('stagesList');
        const emptyState = document.getElementById('stagesEmptyState');
        const emptyStateText = document.getElementById('stagesEmptyStateText');
        
        if (!searchInput || !clearButton || !stagesList) {
            console.warn('setupStageSearch: Elementos no encontrados, reintentando más tarde');
            return;
        }
        
        // Asegurar que el empty state esté oculto al inicio
        if (emptyState) {
            emptyState.classList.remove('show');
            emptyState.style.display = 'none';
        }
        
        // Si emptyState no existe, crear uno temporal
        if (!emptyState || !emptyStateText) {
            console.warn('setupStageSearch: Empty state no encontrado, continuando sin él');
        }
    
    // Función para aplicar filtros (búsqueda + categoría) y mostrar empty state
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        // Obtener categorías seleccionadas del dropdown
        let selectedCategories = [];
        const categoryFilterContainer = document.getElementById('stageCategoryFilterContainer');
        if (categoryFilterContainer && categoryFilterContainer.dataset.selectedCategories) {
            try {
                selectedCategories = JSON.parse(categoryFilterContainer.dataset.selectedCategories);
            } catch (e) {
                selectedCategories = [];
            }
        }
        
        const stageItems = stagesList.querySelectorAll('.stage-item');
        let visibleCount = 0;
        
        // Mostrar/ocultar botón de limpiar
        clearButton.style.display = searchTerm ? 'block' : 'none';
        
        // Filtrar etapas
        stageItems.forEach(item => {
            const stageName = item.getAttribute('data-stage-name').toLowerCase();
            const stageCategory = item.getAttribute('data-stage-category');
            
            // Filtro por búsqueda
            const matchesSearch = !searchTerm || 
                stageName.includes(searchTerm) || 
                stageCategory.toLowerCase().includes(searchTerm);
            
            // Filtro por categoría (múltiple)
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(stageCategory);
            
            // Mostrar si cumple ambos filtros
            if (matchesSearch && matchesCategory) {
                item.style.display = 'flex';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });
        
        // Mostrar/ocultar empty state SOLO cuando hay búsqueda/filtro activo y no hay resultados
        if (visibleCount === 0 && (searchTerm || selectedCategories.length > 0)) {
            // Hay filtros activos pero no hay resultados - mostrar empty state
            if (emptyState) {
                emptyState.classList.add('show');
                emptyState.style.display = 'flex';
            }
            if (stagesList) {
                stagesList.style.display = 'none';
            }
            
            // Texto según el tipo de filtro
            if (emptyStateText) {
                if (searchTerm && selectedCategory) {
                    emptyStateText.textContent = 'No se encontraron etapas con esa búsqueda y categoría';
                } else if (searchTerm) {
                    emptyStateText.textContent = 'No se encontraron etapas con esa búsqueda';
                } else if (selectedCategory) {
                    emptyStateText.textContent = 'No hay etapas en esta categoría';
                }
            }
        } else {
            // Hay resultados o no hay filtros activos - ocultar empty state
            if (emptyState) {
                emptyState.classList.remove('show');
                emptyState.style.display = 'none';
            }
            if (stagesList) {
                stagesList.style.display = 'flex';
            }
        }
    }
    
        // Función de búsqueda
        searchInput.addEventListener('input', applyFilters);
        
        // Botón limpiar búsqueda
        clearButton.addEventListener('click', function() {
            searchInput.value = '';
            this.style.display = 'none';
            applyFilters();
            searchInput.focus();
        });
        
        // Exponer función para que pueda ser llamada desde el filtro de categorías
        window.applyStageFilters = applyFilters;
        
        // Aplicar filtros inicialmente para asegurar estado correcto
        applyFilters();
    } catch (e) {
        console.error('Error en setupStageSearch:', e);
    }
}

// Función para toggle del dropdown de categorías
window.toggleCategoryDropdown = function(event) {
    event.stopPropagation();
    event.preventDefault();
    const menu = document.getElementById('categoryFilterMenu');
    const button = document.getElementById('categoryFilterButton');
    
    if (menu && button) {
        const isOpen = menu.classList.contains('show');
        if (isOpen) {
            menu.classList.remove('show');
            button.classList.remove('active');
        } else {
            // Calcular posición del dropdown usando position fixed
            const buttonRect = button.getBoundingClientRect();
            menu.style.top = (buttonRect.bottom + 8) + 'px';
            menu.style.left = buttonRect.left + 'px';
            
            menu.classList.add('show');
            button.classList.add('active');
        }
    }
    return false;
}

// Función para manejar click en el item (ya no necesaria, el label maneja el click)

// Función para actualizar el filtro de categorías
window.updateCategoryFilter = function() {
    const categoryFilterContainer = document.getElementById('stageCategoryFilterContainer');
    if (!categoryFilterContainer) return;
    
    // Obtener todas las categorías seleccionadas
    const checkboxes = categoryFilterContainer.querySelectorAll('input[type="checkbox"]:checked');
    const selectedCategories = Array.from(checkboxes).map(cb => cb.value);
    
    // Guardar en el dataset
    categoryFilterContainer.dataset.selectedCategories = JSON.stringify(selectedCategories);
    
    // Actualizar badge y estado del botón
    const badge = document.getElementById('categoryFilterBadge');
    const button = document.getElementById('categoryFilterButton');
    
    console.log('🔍 [updateCategoryFilter] Badge encontrado:', badge);
    console.log('🔍 [updateCategoryFilter] Button encontrado:', button);
    console.log('🔍 [updateCategoryFilter] Categorías seleccionadas:', selectedCategories.length);
    
    if (badge && button) {
        if (selectedCategories.length > 0) {
            const count = selectedCategories.length;
            badge.textContent = count;
            badge.style.display = 'inline-flex';
            
            // Forzar color blanco directamente en el estilo
            badge.style.color = '#ffffff';
            badge.style.background = 'var(--ubits-button-badge)';
            
            // Obtener estilos computados
            const computedStyle = window.getComputedStyle(badge);
            const computedColor = computedStyle.color;
            const computedBackground = computedStyle.background;
            
            console.log('✅ [updateCategoryFilter] Badge actualizado:', {
                textContent: badge.textContent,
                display: badge.style.display,
                inlineColor: badge.style.color,
                inlineBackground: badge.style.background,
                computedColor: computedColor,
                computedBackground: computedBackground,
                classes: badge.className,
                parentElement: badge.parentElement?.tagName,
                parentClasses: badge.parentElement?.className
            });
            
            // Verificar si el color computado no es blanco
            if (computedColor !== 'rgb(255, 255, 255)' && computedColor !== '#ffffff') {
                console.warn('⚠️ [updateCategoryFilter] El color computado NO es blanco:', computedColor);
                console.warn('⚠️ [updateCategoryFilter] Intentando forzar color blanco con !important...');
                
                // Intentar con !important en el estilo
                badge.setAttribute('style', badge.getAttribute('style') + ' color: #ffffff !important;');
                
                // Verificar nuevamente
                const newComputedColor = window.getComputedStyle(badge).color;
                console.log('🔍 [updateCategoryFilter] Color después de !important:', newComputedColor);
            }
            
            // Para números de un solo dígito, hacer el badge perfectamente circular
            if (count < 10) {
                badge.style.width = '18px';
                badge.style.padding = '0';
            } else {
                badge.style.width = 'auto';
                badge.style.padding = '0 4px';
            }
            button.classList.add('has-filters');
            button.classList.add('ubits-button--active');
        } else {
            badge.style.display = 'none';
            button.classList.remove('has-filters');
            button.classList.remove('ubits-button--active');
        }
    } else {
        console.error('❌ [updateCategoryFilter] Badge o button no encontrado');
    }
    
    // Aplicar filtros
    if (window.applyStageFilters && typeof window.applyStageFilters === 'function') {
        window.applyStageFilters();
    } else {
        // Si no existe applyStageFilters, llamar directamente a la función de filtrado
        const searchInput = document.getElementById('stageSearch');
        const stagesList = document.getElementById('stagesList');
        
        if (searchInput && stagesList) {
            const searchTerm = searchInput.value.toLowerCase().trim();
            const stageItems = stagesList.querySelectorAll('.stage-item');
            
            stageItems.forEach(item => {
                const stageName = item.getAttribute('data-stage-name').toLowerCase();
                const stageCategory = item.getAttribute('data-stage-category');
                
                // Filtro por búsqueda
                const matchesSearch = !searchTerm || 
                    stageName.includes(searchTerm) || 
                    stageCategory.toLowerCase().includes(searchTerm);
                
                // Filtro por categoría (múltiple)
                const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(stageCategory);
                
                // Mostrar si cumple ambos filtros
                if (matchesSearch && matchesCategory) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        }
    }
}

// ========================================
// RENDERIZADO
// ========================================

function renderEditor() {
    updateAvailableAgents();  // Actualizar lista de agentes disponibles primero
    renderAgents();
    renderStages();
    renderAvailableStages();
    updateTemplateInfo();
    
    // Fijar el ancho del board-container después de renderizar
    fixBoardContainerWidth();
    
    // Configurar drag and drop DESPUÉS de renderizar
    makeBoardDroppable();
    
    // Logs para debug del layout y centrado
    setTimeout(() => {
        console.log('📐 Layout Debug Info - CENTRADO:');
        const editorLayout = document.querySelector('.editor-layout');
        const agentsSidebar = document.querySelector('.agents-sidebar');
        const boardMain = document.querySelector('.board-main');
        const editorContainer = document.querySelector('.editor-container');
        const contentArea = document.querySelector('.content-area');
        const mainContent = document.querySelector('.main-content');
        const dashboardContainer = document.querySelector('.dashboard-container');
        
        // Verificar dashboard-container
        if (dashboardContainer) {
            const rect = dashboardContainer.getBoundingClientRect();
            const style = window.getComputedStyle(dashboardContainer);
            console.log('  .dashboard-container:');
            console.log('    width:', Math.round(rect.width), 'px');
            console.log('    left:', Math.round(rect.left), 'px');
            console.log('    right:', Math.round(rect.right), 'px');
            console.log('    padding-left:', style.paddingLeft);
            console.log('    margin-left:', style.marginLeft);
            console.log('    centerX:', Math.round(rect.left + rect.width / 2), 'px');
        }
        
        // Verificar main-content
        if (mainContent) {
            const rect = mainContent.getBoundingClientRect();
            const style = window.getComputedStyle(mainContent);
            console.log('  .main-content:');
            console.log('    width:', Math.round(rect.width), 'px');
            console.log('    left:', Math.round(rect.left), 'px');
            console.log('    right:', Math.round(rect.right), 'px');
            console.log('    padding-left:', style.paddingLeft);
            console.log('    padding-right:', style.paddingRight);
            console.log('    margin-left:', style.marginLeft);
            console.log('    margin-right:', style.marginRight);
            console.log('    centerX:', Math.round(rect.left + rect.width / 2), 'px');
            console.log('    window.innerWidth:', window.innerWidth, 'px');
            console.log('    window center:', Math.round(window.innerWidth / 2), 'px');
            console.log('    offset from window center:', Math.round((rect.left + rect.width / 2) - (window.innerWidth / 2)), 'px');
        }
        
        // Verificar content-area
        if (contentArea) {
            const rect = contentArea.getBoundingClientRect();
            const style = window.getComputedStyle(contentArea);
            console.log('  .content-area:');
            console.log('    width:', Math.round(rect.width), 'px');
            console.log('    left:', Math.round(rect.left), 'px');
            console.log('    right:', Math.round(rect.right), 'px');
            console.log('    padding-left:', style.paddingLeft);
            console.log('    padding-right:', style.paddingRight);
            console.log('    margin-left:', style.marginLeft);
            console.log('    margin-right:', style.marginRight);
            console.log('    justify-content:', style.justifyContent);
            console.log('    centerX:', Math.round(rect.left + rect.width / 2), 'px');
        }
        
        // Verificar editor-container
        if (editorContainer) {
            const rect = editorContainer.getBoundingClientRect();
            const style = window.getComputedStyle(editorContainer);
            console.log('  .editor-container:');
            console.log('    width:', Math.round(rect.width), 'px');
            console.log('    computedWidth:', style.width);
            console.log('    max-width:', style.maxWidth);
            console.log('    left:', Math.round(rect.left), 'px');
            console.log('    right:', Math.round(rect.right), 'px');
            console.log('    margin-left:', style.marginLeft);
            console.log('    margin-right:', style.marginRight);
            console.log('    centerX:', Math.round(rect.left + rect.width / 2), 'px');
            if (contentArea) {
                const contentAreaRect = contentArea.getBoundingClientRect();
                const contentAreaCenter = contentAreaRect.left + contentAreaRect.width / 2;
                console.log('    offset from content-area center:', Math.round((rect.left + rect.width / 2) - contentAreaCenter), 'px');
            }
        }
        
        if (editorLayout) {
            const rect = editorLayout.getBoundingClientRect();
            const style = window.getComputedStyle(editorLayout);
            console.log('  .editor-layout:');
            console.log('    width:', Math.round(rect.width), 'px');
            console.log('    computedWidth:', style.width);
            console.log('    max-width:', style.maxWidth);
            console.log('    scrollWidth:', editorLayout.scrollWidth, 'px');
            console.log('    clientWidth:', editorLayout.clientWidth, 'px');
            console.log('    left:', Math.round(rect.left), 'px');
            console.log('    right:', Math.round(rect.right), 'px');
            console.log('    margin-left:', style.marginLeft);
            console.log('    margin-right:', style.marginRight);
            console.log('    gap:', style.gap);
            console.log('    centerX:', Math.round(rect.left + rect.width / 2), 'px');
            if (editorContainer) {
                const editorContainerRect = editorContainer.getBoundingClientRect();
                const editorContainerCenter = editorContainerRect.left + editorContainerRect.width / 2;
                console.log('    offset from editor-container center:', Math.round((rect.left + rect.width / 2) - editorContainerCenter), 'px');
            }
        }
        
        if (agentsSidebar) {
            const rect = agentsSidebar.getBoundingClientRect();
            const style = window.getComputedStyle(agentsSidebar);
            console.log('  .agents-sidebar:');
            console.log('    width:', Math.round(rect.width), 'px');
            console.log('    computedWidth:', style.width);
            console.log('    flex:', style.flex);
            console.log('    scrollWidth:', agentsSidebar.scrollWidth, 'px');
            console.log('    clientWidth:', agentsSidebar.clientWidth, 'px');
            console.log('    left:', Math.round(rect.left), 'px');
            console.log('    right:', Math.round(rect.right), 'px');
            console.log('    percentage of editor-layout:', Math.round((rect.width / (editorLayout ? editorLayout.getBoundingClientRect().width : 1)) * 100), '%');
        }
        
        if (boardMain) {
            const rect = boardMain.getBoundingClientRect();
            const style = window.getComputedStyle(boardMain);
            console.log('  .board-main:');
            console.log('    width:', Math.round(rect.width), 'px');
            console.log('    computedWidth:', style.width);
            console.log('    flex:', style.flex);
            console.log('    scrollWidth:', boardMain.scrollWidth, 'px');
            console.log('    clientWidth:', boardMain.clientWidth, 'px');
            console.log('    left:', Math.round(rect.left), 'px');
            console.log('    right:', Math.round(rect.right), 'px');
            console.log('    percentage of editor-layout:', Math.round((rect.width / (editorLayout ? editorLayout.getBoundingClientRect().width : 1)) * 100), '%');
        }
        
        // Calcular espacios disponibles
        if (mainContent && editorContainer) {
            const mainContentRect = mainContent.getBoundingClientRect();
            const editorContainerRect = editorContainer.getBoundingClientRect();
            const spaceLeft = editorContainerRect.left - mainContentRect.left;
            const spaceRight = mainContentRect.right - editorContainerRect.right;
            console.log('  📏 Espacios disponibles:');
            console.log('    Espacio a la izquierda del editor-container:', Math.round(spaceLeft), 'px');
            console.log('    Espacio a la derecha del editor-container:', Math.round(spaceRight), 'px');
            console.log('    Diferencia (debería ser 0 para estar centrado):', Math.round(spaceLeft - spaceRight), 'px');
        }
        
        if (editorContainer) {
            const rect = editorContainer.getBoundingClientRect();
            const style = window.getComputedStyle(editorContainer);
            console.log('  .editor-container:');
            console.log('    width:', Math.round(rect.width), 'px');
            console.log('    computedWidth:', style.width);
            console.log('    scrollWidth:', editorContainer.scrollWidth, 'px');
            console.log('    clientWidth:', editorContainer.clientWidth, 'px');
            console.log('    left:', Math.round(rect.left), 'px');
            console.log('    right:', Math.round(rect.right), 'px');
        }
        
        if (contentArea) {
            const rect = contentArea.getBoundingClientRect();
            const style = window.getComputedStyle(contentArea);
            console.log('  .content-area:');
            console.log('    width:', Math.round(rect.width), 'px');
            console.log('    computedWidth:', style.width);
            console.log('    scrollWidth:', contentArea.scrollWidth, 'px');
            console.log('    clientWidth:', contentArea.clientWidth, 'px');
            console.log('    left:', Math.round(rect.left), 'px');
            console.log('    right:', Math.round(rect.right), 'px');
        }
        
        if (mainContent) {
            const rect = mainContent.getBoundingClientRect();
            const style = window.getComputedStyle(mainContent);
            console.log('  .main-content:');
            console.log('    width:', Math.round(rect.width), 'px');
            console.log('    computedWidth:', style.width);
            console.log('    scrollWidth:', mainContent.scrollWidth, 'px');
            console.log('    clientWidth:', mainContent.clientWidth, 'px');
            console.log('    left:', Math.round(rect.left), 'px');
            console.log('    right:', Math.round(rect.right), 'px');
        }
        
        console.log('  Window:');
        console.log('    innerWidth:', window.innerWidth, 'px');
        console.log('    outerWidth:', window.outerWidth, 'px');
        console.log('    documentWidth:', document.documentElement.scrollWidth, 'px');
        console.log('    bodyWidth:', document.body.scrollWidth, 'px');
        
        // Verificar estilos calculados del main-content
        if (mainContent) {
            const style = window.getComputedStyle(mainContent);
            const rect = mainContent.getBoundingClientRect();
            console.log('  .main-content computed styles:');
            console.log('    width:', style.width);
            console.log('    max-width:', style.maxWidth);
            console.log('    margin-left:', style.marginLeft);
            console.log('    margin-right:', style.marginRight);
            console.log('    padding-left:', style.paddingLeft);
            console.log('    padding-right:', style.paddingRight);
            console.log('    padding-left (parsed):', parseInt(style.paddingLeft) || 0, 'px');
            console.log('    box-sizing:', style.boxSizing);
            console.log('    position:', style.position);
            console.log('    padding-left:', style.paddingLeft);
            console.log('    Actual left (getBoundingClientRect):', Math.round(rect.left), 'px');
            console.log('    Expected left (padding-left):', parseInt(style.paddingLeft) || 143, 'px');
            console.log('    Difference:', Math.round(rect.left - (parseInt(style.paddingLeft) || 143)), 'px');
            
            // Verificar contenedor padre y todos los ancestros
            let current = mainContent.parentElement;
            let level = 1;
            while (current && level <= 5) {
                const parentStyle = window.getComputedStyle(current);
                const parentRect = current.getBoundingClientRect();
                console.log(`  Parent level ${level} (${current.className || current.id || current.tagName}):`);
                console.log('    left:', Math.round(parentRect.left), 'px');
                console.log('    width:', Math.round(parentRect.width), 'px');
                console.log('    right:', Math.round(parentRect.right), 'px');
                console.log('    padding-left:', parentStyle.paddingLeft);
                console.log('    padding-right:', parentStyle.paddingRight);
                console.log('    margin-left:', parentStyle.marginLeft);
                console.log('    margin-right:', parentStyle.marginRight);
                console.log('    position:', parentStyle.position);
                console.log('    display:', parentStyle.display);
                current = current.parentElement;
                level++;
            }
            
            // Verificar sidebar
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                const sidebarRect = sidebar.getBoundingClientRect();
                const sidebarStyle = window.getComputedStyle(sidebar);
                console.log('  #sidebar:');
                console.log('    left:', Math.round(sidebarRect.left), 'px');
                console.log('    width:', Math.round(sidebarRect.width), 'px');
                console.log('    right:', Math.round(sidebarRect.right), 'px');
                console.log('    position:', sidebarStyle.position);
            }
            
            // Verificar sidebar-container específicamente
            const sidebarContainer = document.getElementById('sidebar-container');
            if (sidebarContainer) {
                const containerRect = sidebarContainer.getBoundingClientRect();
                const containerStyle = window.getComputedStyle(sidebarContainer);
                console.log('  🔍 #sidebar-container (CRÍTICO):');
                console.log('    left:', Math.round(containerRect.left), 'px');
                console.log('    width:', Math.round(containerRect.width), 'px');
                console.log('    right:', Math.round(containerRect.right), 'px');
                console.log('    height:', Math.round(containerRect.height), 'px');
                console.log('    position:', containerStyle.position);
                console.log('    display:', containerStyle.display);
                console.log('    margin-left:', containerStyle.marginLeft);
                console.log('    margin-right:', containerStyle.marginRight);
                console.log('    padding-left:', containerStyle.paddingLeft);
                console.log('    padding-right:', containerStyle.paddingRight);
                console.log('    z-index:', containerStyle.zIndex);
                console.log('    ¿Ocupa espacio en layout?', containerStyle.position === 'static' || containerStyle.position === 'relative' ? 'SÍ' : 'NO');
            }
            
            // Verificar TODOS los hijos directos del dashboard-container
            if (dashboardContainer) {
                const children = Array.from(dashboardContainer.children);
                console.log('  🔍 Hijos directos de .dashboard-container:');
                children.forEach((child, index) => {
                    const rect = child.getBoundingClientRect();
                    const style = window.getComputedStyle(child);
                    console.log(`    Hijo ${index + 1} (${child.className || child.id || child.tagName}):`);
                    console.log('      left:', Math.round(rect.left), 'px');
                    console.log('      width:', Math.round(rect.width), 'px');
                    console.log('      right:', Math.round(rect.right), 'px');
                    console.log('      position:', style.position);
                    console.log('      display:', style.display);
                    console.log('      margin-left:', style.marginLeft);
                    console.log('      margin-right:', style.marginRight);
                    console.log('      ¿Ocupa espacio?', (style.position === 'static' || style.position === 'relative') && style.display !== 'none' ? 'SÍ' : 'NO');
                });
            }
            
            // Calcular el espacio ocupado por elementos antes del main-content
            if (dashboardContainer && mainContent) {
                const children = Array.from(dashboardContainer.children);
                let spaceBeforeMainContent = 0;
                const mainContentIndex = children.indexOf(mainContent);
                
                console.log('  🔍 Cálculo de espacio antes de .main-content:');
                for (let i = 0; i < mainContentIndex; i++) {
                    const child = children[i];
                    const style = window.getComputedStyle(child);
                    const rect = child.getBoundingClientRect();
                    
                    if (style.position === 'static' || style.position === 'relative') {
                        if (style.display !== 'none') {
                            const childWidth = rect.width + parseFloat(style.marginLeft || 0) + parseFloat(style.marginRight || 0);
                            spaceBeforeMainContent += childWidth;
                            console.log(`    ${child.className || child.id || child.tagName}: +${Math.round(childWidth)}px (total acumulado: ${Math.round(spaceBeforeMainContent)}px)`);
                        }
                    }
                }
                
                // Verificar padding y border del dashboard-container
                const dashboardStyle = window.getComputedStyle(dashboardContainer);
                const dashboardPaddingLeft = parseFloat(dashboardStyle.paddingLeft || 0);
                const dashboardBorderLeft = parseFloat(dashboardStyle.borderLeftWidth || 0);
                const dashboardMarginLeft = parseFloat(dashboardStyle.marginLeft || 0);
                
                console.log('    📊 Dashboard-container padding-left:', dashboardPaddingLeft, 'px');
                console.log('    📊 Dashboard-container border-left:', dashboardBorderLeft, 'px');
                console.log('    📊 Dashboard-container margin-left:', dashboardMarginLeft, 'px');
                
                // Calcular posición esperada del main-content
                const dashboardRect = dashboardContainer.getBoundingClientRect();
                const expectedLeft = dashboardRect.left + dashboardPaddingLeft + dashboardBorderLeft + dashboardMarginLeft + 143; // margin-left del main-content
                const actualLeft = mainContent.getBoundingClientRect().left;
                
                console.log('    📊 Dashboard-container left:', Math.round(dashboardRect.left), 'px');
                console.log('    📊 Espacio total antes de .main-content:', Math.round(spaceBeforeMainContent), 'px');
                console.log('    📊 Expected left de .main-content:', Math.round(expectedLeft), 'px (dashboard.left + padding + border + margin + 143px)');
                console.log('    📊 Actual left de .main-content:', Math.round(actualLeft), 'px');
                console.log('    📊 Diferencia:', Math.round(actualLeft - expectedLeft), 'px');
                console.log('    📊 ¿Coincide con espacio antes?', Math.abs(spaceBeforeMainContent - (actualLeft - expectedLeft)) < 5 ? 'SÍ ✅' : 'NO ❌');
                
                // Verificar si hay algún elemento invisible o con width 0 que esté ocupando espacio
                console.log('  🔍 Verificando elementos con width 0 pero que podrían ocupar espacio:');
                for (let i = 0; i < mainContentIndex; i++) {
                    const child = children[i];
                    const style = window.getComputedStyle(child);
                    const rect = child.getBoundingClientRect();
                    
                    if ((style.position === 'static' || style.position === 'relative') && style.display !== 'none') {
                        const hasWidth = parseFloat(style.width || 0) > 0 || rect.width > 0;
                        const hasMargin = parseFloat(style.marginLeft || 0) > 0 || parseFloat(style.marginRight || 0) > 0;
                        const hasPadding = parseFloat(style.paddingLeft || 0) > 0 || parseFloat(style.paddingRight || 0) > 0;
                        
                        if (!hasWidth && (hasMargin || hasPadding)) {
                            console.log(`    ⚠️ ${child.className || child.id || child.tagName}: width=0 pero tiene margin/padding`);
                            console.log(`      margin-left: ${style.marginLeft}, margin-right: ${style.marginRight}`);
                            console.log(`      padding-left: ${style.paddingLeft}, padding-right: ${style.paddingRight}`);
                        }
                    }
                }
            }
            
            // Calcular el desplazamiento esperado
            const mainStyle = window.getComputedStyle(mainContent);
            const expectedLeft = parseInt(mainStyle.paddingLeft) || 143; // padding-left del main-content
            const actualLeft = Math.round(mainContent.getBoundingClientRect().left);
            const offset = actualLeft - expectedLeft;
            console.log('  📊 Cálculo de desplazamiento:');
            console.log('    Expected left (padding-left):', expectedLeft, 'px');
            console.log('    Actual left (getBoundingClientRect):', actualLeft, 'px');
            console.log('    Offset (diferencia):', offset, 'px');
            console.log('    Sidebar right:', 24 + 96, 'px (24px left + 96px width)');
            console.log('    Gap esperado:', expectedLeft - (24 + 96), 'px');
            
            // Verificar si hay algún elemento con position: fixed o absolute que esté causando el desplazamiento
            const allFixedElements = document.querySelectorAll('*');
            let foundFixed = false;
            allFixedElements.forEach(el => {
                const style = window.getComputedStyle(el);
                if (style.position === 'fixed' || style.position === 'absolute') {
                    const rect = el.getBoundingClientRect();
                    if (rect.left > 0 && rect.left < 300 && rect.width > 0 && rect.height > 0) {
                        if (!foundFixed) {
                            console.log('  🔍 Elementos con position fixed/absolute en el rango 0-300px:');
                            foundFixed = true;
                        }
                        console.log(`    ${el.className || el.id || el.tagName}: left=${Math.round(rect.left)}px, width=${Math.round(rect.width)}px`);
                    }
                }
            });
        }
        
        // Verificar si hay overflow
        const body = document.body;
        const html = document.documentElement;
        const bodyOverflow = body.scrollWidth - window.innerWidth;
        const htmlOverflow = html.scrollWidth - window.innerWidth;
        const maxOverflow = Math.max(bodyOverflow, htmlOverflow);
        
        // Verificar también elementos que se salen visualmente
        let visualOverflow = 0;
        let visualCulprit = null;
        
        if (mainContent) {
            const rect = mainContent.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                visualOverflow = rect.right - window.innerWidth;
                visualCulprit = mainContent;
            }
        }
        
        if (maxOverflow > 0 || visualOverflow > 0) {
            console.warn('⚠️ OVERFLOW DETECTADO:');
            console.warn('    bodyScrollWidth:', body.scrollWidth, 'px');
            console.warn('    htmlScrollWidth:', html.scrollWidth, 'px');
            console.warn('    windowInnerWidth:', window.innerWidth, 'px');
            console.warn('    documentOverflow:', maxOverflow, 'px');
            
            if (visualOverflow > 0) {
                console.warn('    🔴 OVERFLOW VISUAL:', visualOverflow, 'px');
                console.warn('    Elemento:', visualCulprit?.className || visualCulprit?.id || visualCulprit?.tagName);
                if (visualCulprit) {
                    const rect = visualCulprit.getBoundingClientRect();
                    console.warn('    left:', Math.round(rect.left), 'px');
                    console.warn('    right:', Math.round(rect.right), 'px');
                    console.warn('    width:', Math.round(rect.width), 'px');
                    console.warn('    computedWidth:', window.getComputedStyle(visualCulprit).width);
                    console.warn('    margin-left:', window.getComputedStyle(visualCulprit).marginLeft);
                    console.warn('    margin-right:', window.getComputedStyle(visualCulprit).marginRight);
                }
            }
            
            // Buscar el elemento que causa el overflow
            const allElements = document.querySelectorAll('*');
            let maxScrollWidth = 0;
            let culpritElement = null;
            
            allElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.right > window.innerWidth && el.scrollWidth > maxScrollWidth) {
                    maxScrollWidth = el.scrollWidth;
                    culpritElement = el;
                }
            });
            
            if (culpritElement && !visualCulprit) {
                console.warn('    🔴 Elemento que causa overflow:', culpritElement.className || culpritElement.id || culpritElement.tagName);
                console.warn('    scrollWidth:', culpritElement.scrollWidth, 'px');
                console.warn('    right:', Math.round(culpritElement.getBoundingClientRect().right), 'px');
            }
        } else {
            console.log('✅ No hay overflow detectado');
        }
        
        // ========================================
        // LOGS ESPECÍFICOS PARA BOARD Y BOTÓN GUARDAR
        // ========================================
        console.log('\n📦 ANÁLISIS BOARD vs BOTÓN GUARDAR:');
        
        // Buscar botón Guardar (puede estar en el header)
        const saveButton = document.querySelector('button.ubits-button--primary') || 
                          document.querySelector('.editor-header .ubits-button--primary') ||
                          Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Guardar'));
        let saveButtonRight = null;
        
        if (saveButton) {
            const saveRect = saveButton.getBoundingClientRect();
            const saveStyle = window.getComputedStyle(saveButton);
            saveButtonRight = saveRect.right;
            
            console.log('  🔘 Botón Guardar:');
            console.log('    left:', Math.round(saveRect.left), 'px');
            console.log('    right:', Math.round(saveButtonRight), 'px');
            console.log('    width:', Math.round(saveRect.width), 'px');
            console.log('    margin-right:', saveStyle.marginRight);
            console.log('    padding-right:', saveStyle.paddingRight);
        } else {
            console.warn('  ⚠️ No se encontró el botón Guardar');
        }
        
        // Analizar board-container
        const boardContainer = document.querySelector('.board-container');
        if (boardContainer) {
            const boardRect = boardContainer.getBoundingClientRect();
            const boardStyle = window.getComputedStyle(boardContainer);
            
            console.log('  📦 .board-container:');
            console.log('    left:', Math.round(boardRect.left), 'px');
            console.log('    right:', Math.round(boardRect.right), 'px');
            console.log('    width:', Math.round(boardRect.width), 'px');
            console.log('    computedWidth:', boardStyle.width);
            console.log('    max-width:', boardStyle.maxWidth);
            console.log('    padding-left:', boardStyle.paddingLeft);
            console.log('    padding-right:', boardStyle.paddingRight);
            console.log('    margin-left:', boardStyle.marginLeft);
            console.log('    margin-right:', boardStyle.marginRight);
            console.log('    box-sizing:', boardStyle.boxSizing);
            
            if (saveButtonRight) {
                const overflow = boardRect.right - saveButtonRight;
                console.log('    🔴 Overflow respecto al botón:', Math.round(overflow), 'px');
                if (overflow > 0) {
                    console.warn('    ⚠️ El board se sale', Math.round(overflow), 'px más allá del botón Guardar');
                } else {
                    console.log('    ✅ El board está dentro del límite del botón');
                }
            }
        } else {
            console.warn('  ⚠️ No se encontró .board-container');
        }
        
        // Analizar board-main
        if (boardMain) {
            const boardMainRect = boardMain.getBoundingClientRect();
            const boardMainStyle = window.getComputedStyle(boardMain);
            
            console.log('  📦 .board-main:');
            console.log('    left:', Math.round(boardMainRect.left), 'px');
            console.log('    right:', Math.round(boardMainRect.right), 'px');
            console.log('    width:', Math.round(boardMainRect.width), 'px');
            console.log('    computedWidth:', boardMainStyle.width);
            console.log('    max-width:', boardMainStyle.maxWidth);
            console.log('    flex:', boardMainStyle.flex);
            console.log('    padding-left:', boardMainStyle.paddingLeft);
            console.log('    padding-right:', boardMainStyle.paddingRight);
            console.log('    margin-left:', boardMainStyle.marginLeft);
            console.log('    margin-right:', boardMainStyle.marginRight);
            
            if (saveButtonRight) {
                const overflow = boardMainRect.right - saveButtonRight;
                console.log('    🔴 Overflow respecto al botón:', Math.round(overflow), 'px');
            }
        }
        
        // Analizar editor-layout (padre del board-main)
        if (editorLayout) {
            const editorLayoutRect = editorLayout.getBoundingClientRect();
            const editorLayoutStyle = window.getComputedStyle(editorLayout);
            
            console.log('  📦 .editor-layout (padre):');
            console.log('    left:', Math.round(editorLayoutRect.left), 'px');
            console.log('    right:', Math.round(editorLayoutRect.right), 'px');
            console.log('    width:', Math.round(editorLayoutRect.width), 'px');
            console.log('    computedWidth:', editorLayoutStyle.width);
            console.log('    max-width:', editorLayoutStyle.maxWidth);
            console.log('    padding-left:', editorLayoutStyle.paddingLeft);
            console.log('    padding-right:', editorLayoutStyle.paddingRight);
            console.log('    margin-left:', editorLayoutStyle.marginLeft);
            console.log('    margin-right:', editorLayoutStyle.marginRight);
            
            if (saveButtonRight) {
                const overflow = editorLayoutRect.right - saveButtonRight;
                console.log('    🔴 Overflow respecto al botón:', Math.round(overflow), 'px');
            }
        }
        
        // Analizar main-content (padre del editor-layout)
        if (mainContent) {
            const mainContentRect = mainContent.getBoundingClientRect();
            const mainContentStyle = window.getComputedStyle(mainContent);
            
            console.log('  📦 .main-content (padre del editor-layout):');
            console.log('    left:', Math.round(mainContentRect.left), 'px');
            console.log('    right:', Math.round(mainContentRect.right), 'px');
            console.log('    width:', Math.round(mainContentRect.width), 'px');
            console.log('    computedWidth:', mainContentStyle.width);
            console.log('    max-width:', mainContentStyle.maxWidth);
            console.log('    padding-left:', mainContentStyle.paddingLeft);
            console.log('    padding-right:', mainContentStyle.paddingRight);
            console.log('    margin-left:', mainContentStyle.marginLeft);
            console.log('    margin-right:', mainContentStyle.marginRight);
            
            if (saveButtonRight) {
                const overflow = mainContentRect.right - saveButtonRight;
                console.log('    🔴 Overflow respecto al botón:', Math.round(overflow), 'px');
                
                // Calcular el ancho máximo que debería tener el board
                const maxBoardWidth = saveButtonRight - mainContentRect.left - parseFloat(mainContentStyle.paddingLeft || 0);
                console.log('    📏 Ancho máximo permitido para el board:', Math.round(maxBoardWidth), 'px');
                
                if (boardContainer) {
                    const boardRect = boardContainer.getBoundingClientRect();
                    const boardActualWidth = boardRect.width;
                    const boardMaxWidth = maxBoardWidth - parseFloat(window.getComputedStyle(boardMain).width.replace('px', '')) * 0.4; // 40% para agents-sidebar
                    console.log('    📏 Ancho actual del board:', Math.round(boardActualWidth), 'px');
                    console.log('    📏 Ancho máximo calculado para board:', Math.round(boardMaxWidth), 'px');
                }
            }
        }
        
        // Verificar si hay algún padding o margin que esté causando el overflow
        console.log('\n  🔍 Verificando padding/margin en cadena:');
        if (mainContent && editorLayout && boardMain && boardContainer) {
            const mainPaddingRight = parseFloat(window.getComputedStyle(mainContent).paddingRight || 0);
            const editorPaddingRight = parseFloat(window.getComputedStyle(editorLayout).paddingRight || 0);
            const boardMainPaddingRight = parseFloat(window.getComputedStyle(boardMain).paddingRight || 0);
            const boardContainerPaddingRight = parseFloat(window.getComputedStyle(boardContainer).paddingRight || 0);
            
            console.log('    .main-content padding-right:', mainPaddingRight, 'px');
            console.log('    .editor-layout padding-right:', editorPaddingRight, 'px');
            console.log('    .board-main padding-right:', boardMainPaddingRight, 'px');
            console.log('    .board-container padding-right:', boardContainerPaddingRight, 'px');
            console.log('    Total padding-right acumulado:', mainPaddingRight + editorPaddingRight + boardMainPaddingRight + boardContainerPaddingRight, 'px');
        }
        
        // ========================================
        // AJUSTE DINÁMICO DEL ANCHO DEL BOARD
        // ========================================
        // El ajuste del ancho ahora se hace en fixBoardContainerWidth()
        // para evitar conflictos y múltiples ajustes
    }, 100);
}

function renderAgents() {
    const agentsList = document.getElementById('agentsList');
    if (!agentsList) return;
    
    // Mostrar empty state si todos los agentes están en uso
    if (availableAgents.length === 0) {
        agentsList.innerHTML = `
            <div class="empty-stages-visual">
                <div class="empty-icon">
                    <i class="far fa-check-circle"></i>
                </div>
                <p class="empty-text">Todas las etapas con IA están en uso en esta plantilla</p>
            </div>
        `;
        return;
    }
    
    const agentsHTML = availableAgents.map(agent => {
        // Obtener descripción del agente para el tooltip
        const descriptions = {
            'cv-analyzer': 'Este agente revisa automáticamente los CV, evalúa la experiencia del candidato y verifica que su expectativa salarial esté alineada con el rango de la vacante.',
            'interview-ia': 'Esta IA realiza entrevistas automáticas por teléfono o entrevista virtual, analiza las respuestas del candidato y asigna un puntaje según sus competencias y forma de responder.',
            'psychometric-analyst': 'Este agente aplica pruebas psicométricas al candidato y calcula un puntaje que refleja sus capacidades cognitivas y/o rasgos relevantes para el puesto.',
            'background-check': 'Permite generar y verificar el certificado de antecedentes judiciales del candidato para validar su historial legal de forma segura.'
        };
        const agentDescription = descriptions[agent.id] || agent.description;
        
        return `
        <div class="agent-item" 
             draggable="true" 
             data-agent-id="${agent.id}"
             data-agent-name="${agent.name}"
             data-agent-icon="${agent.icon}">
            <div class="agent-header">
                <div class="agent-title-section">
                    <div class="agent-icon"><i class="far ${agent.icon}"></i></div>
                    <div class="agent-name">${agent.name} (IA)</div>
                </div>
                <div class="agent-actions">
                    <button class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only" 
                            onclick="addAgentToFlowFromMenu('${agent.id}')" 
                            title="Agregar al flujo">
                        <i class="far fa-plus"></i>
                    </button>
                    <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only agent-info-btn" 
                            data-agent-id="${agent.id}"
                            data-agent-name="${agent.name}"
                            data-agent-description="${agentDescription.replace(/"/g, '&quot;')}"
                            title="Ver más información">
                        <i class="far fa-circle-info"></i>
                    </button>
                </div>
            </div>
            <div class="agent-help">${agent.description}</div>
        </div>
    `;
    }).join('');
    
    agentsList.innerHTML = agentsHTML + '<div class="library-scroll-spacer"></div>';
    
    // Logs para debuggear el scroll de agents-list
    setTimeout(() => {
        const agentsListEl = document.getElementById('agentsList');
        if (agentsListEl) {
            console.log('🔍 [Agents List Scroll Debug - Editor] ============================================');
            console.log('📦 agentsList.scrollHeight:', agentsListEl.scrollHeight, 'px');
            console.log('📦 agentsList.clientHeight:', agentsListEl.clientHeight, 'px');
            console.log('📦 agentsList.scrollTop:', agentsListEl.scrollTop, 'px');
            console.log('📦 agentsList.maxHeight (computed):', window.getComputedStyle(agentsListEl).maxHeight);
            console.log('📦 Diferencia (scrollHeight - clientHeight):', agentsListEl.scrollHeight - agentsListEl.clientHeight, 'px');
            console.log('📦 ¿Tiene scroll?', agentsListEl.scrollHeight > agentsListEl.clientHeight ? '✅ SÍ' : '❌ NO');
            
            const lastAgent = agentsListEl.querySelector('.agent-item:last-child');
            const spacer = agentsListEl.querySelector('.library-scroll-spacer');
            if (lastAgent) {
                const lastAgentRect = lastAgent.getBoundingClientRect();
                const containerRect = agentsListEl.getBoundingClientRect();
                console.log('📦 Último agent-item:');
                console.log('   - bottom:', lastAgentRect.bottom, 'px');
                console.log('   - container bottom:', containerRect.bottom, 'px');
                console.log('   - Diferencia:', containerRect.bottom - lastAgentRect.bottom, 'px');
                console.log('   - ¿Está visible?', lastAgentRect.bottom <= containerRect.bottom ? '✅ SÍ' : '❌ NO (cortado)');
            }
            if (spacer) {
                const spacerRect = spacer.getBoundingClientRect();
                const containerRect = agentsListEl.getBoundingClientRect();
                console.log('📦 Spacer:');
                console.log('   - bottom:', spacerRect.bottom, 'px');
                console.log('   - container bottom:', containerRect.bottom, 'px');
            }
            console.log('✅ [Agents List Scroll Debug - Editor] ============================================');
        }
    }, 200);
    
    // Agregar event listeners para drag and drop
    agentsList.querySelectorAll('.agent-item').forEach(item => {
        item.addEventListener('dragstart', handleAgentDragStart);
        item.addEventListener('dragend', handleAgentDragEnd);
    });
    
    // Agregar event listeners para tooltips de información
    agentsList.querySelectorAll('.agent-info-btn').forEach(btn => {
        btn.addEventListener('mouseenter', handleAgentInfoHover);
        btn.addEventListener('mouseleave', handleAgentInfoLeave);
    });
}

function renderAvailableStages() {
    console.log('🎨 [renderAvailableStages] Iniciando renderizado...');
    console.log('🔍 [renderAvailableStages] availableStages.length:', availableStages.length);
    
    const stagesList = document.getElementById('stagesList');
    if (!stagesList) {
        console.error('❌ [renderAvailableStages] stagesList no encontrado');
        return;
    }
    
    // Verificar consistencia (solo para logging, NO sincronizar automáticamente)
    const stored = localStorage.getItem('availableStages');
    if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length !== availableStages.length) {
            console.warn('⚠️ [renderAvailableStages] INCONSISTENCIA detectada:');
            console.warn('   Variable availableStages:', availableStages.length);
            console.warn('   localStorage:', parsed.length);
            console.warn('   NO sincronizando - usando variable actual');
        } else {
            console.log('✅ [renderAvailableStages] Consistencia verificada');
        }
    }
    
    // Filtrar etapas que ya están en uso en esta plantilla
    const usedStageIds = currentTemplate.realContent.stages.map(stage => stage.templateId);
    const availableStagesForThisTemplate = availableStages.filter(stage => !usedStageIds.includes(stage.id));
    
    console.log('🔍 [renderAvailableStages] Etapas disponibles para esta plantilla:', availableStagesForThisTemplate.length);
    
    // Obtener referencias a elementos que se mostrarán/ocultarán
    const createStageBtn = document.getElementById('createStageBtn');
    const searchWrapper = document.getElementById('stageSearchWrapper');
    const categoryFilterContainer = document.getElementById('stageCategoryFilterContainer');
    
    // Crear filtro de categorías con componente Input UBITS (solo si hay etapas disponibles)
    // Verificar primero si hay etapas antes de crear el filtro
    const hasStages = availableStages.length > 0;
    
    try {
        if (categoryFilterContainer && hasStages) {
            // Limpiar contenedor primero
            categoryFilterContainer.innerHTML = '';
            
            // Estado de categorías seleccionadas (almacenado en el contenedor)
            if (!categoryFilterContainer.dataset.selectedCategories) {
                categoryFilterContainer.dataset.selectedCategories = JSON.stringify([]);
            }
            
            // Crear el dropdown de categorías
            const dropdownHTML = `
                <div class="category-filter-dropdown">
                    <button type="button" class="category-filter-button ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only" id="categoryFilterButton" onclick="toggleCategoryDropdown(event)" title="Filtrar por categorías">
                        <i class="far fa-filter"></i>
                        <span class="category-filter-badge" id="categoryFilterBadge" style="display: none;">0</span>
                    </button>
                    <div class="category-filter-dropdown-menu" id="categoryFilterMenu">
                        ${STAGE_CATEGORIES.map(cat => `
                            <label class="category-filter-item" for="category-${cat.id}">
                                <input type="checkbox" id="category-${cat.id}" value="${cat.id}" onchange="updateCategoryFilter()">
                                <span class="category-filter-item-label">
                                    <span>${cat.name}</span>
                                </span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
            
            categoryFilterContainer.innerHTML = dropdownHTML;
            
            // Cerrar dropdown al hacer clic fuera
            // Usar un solo listener global para evitar múltiples listeners
            if (!window.categoryDropdownCloseHandler) {
                window.categoryDropdownCloseHandler = function(e) {
                    const categoryFilterContainer = document.getElementById('stageCategoryFilterContainer');
                    if (!categoryFilterContainer) return;
                    
                    const dropdown = categoryFilterContainer.querySelector('.category-filter-dropdown');
                    const menu = categoryFilterContainer.querySelector('.category-filter-dropdown-menu');
                    const button = categoryFilterContainer.querySelector('.category-filter-button');
                    
                    // No cerrar si el click es dentro del dropdown
                    if (dropdown && dropdown.contains(e.target)) {
                        return;
                    }
                    
                    // Cerrar si está abierto y el click es fuera
                    if (menu && menu.classList.contains('show')) {
                        menu.classList.remove('show');
                        if (button) button.classList.remove('active');
                    }
                };
                
                // Agregar listener solo una vez
                document.addEventListener('click', window.categoryDropdownCloseHandler);
            }
        } else if (categoryFilterContainer && !hasStages) {
            // Si no hay etapas, ocultar el contenedor del filtro
            categoryFilterContainer.innerHTML = '';
            categoryFilterContainer.style.display = 'none';
        }
    } catch (e) {
        console.error('Error creando filtro de categorías:', e);
    }
    
    // Si no hay etapas disponibles, mostrar empty state según el caso
    if (availableStagesForThisTemplate.length === 0) {
        // Caso 1: No hay etapas creadas en absoluto
        if (availableStages.length === 0) {
            stagesList.innerHTML = `
                <div class="empty-stages-visual">
                    <div class="empty-icon">
                        <i class="far fa-timeline-arrow"></i>
                    </div>
                    <p class="empty-text">Crea tu primera etapa y empieza a diseñar el recorrido de tu candidato.</p>
                    <button class="ubits-button ubits-button--secondary ubits-button--md" onclick="openCreateStageModal();">
                        <i class="far fa-plus"></i>
                        <span>Crear etapa</span>
                    </button>
                </div>
            `;
            
            // Ocultar botón crear etapa cuando no hay etapas
            if (createStageBtn) createStageBtn.style.display = 'none';
            // Ocultar buscador y filtro cuando no hay etapas creadas
            if (searchWrapper) searchWrapper.style.display = 'none';
            const categoryFilterContainer = document.getElementById('stageCategoryFilterContainer');
            if (categoryFilterContainer) {
                categoryFilterContainer.style.display = 'none';
            }
            // Ocultar el contenedor completo de controles para eliminar el espacio
            const controlsRow = document.querySelector('.stages-controls-row');
            if (controlsRow) {
                controlsRow.style.display = 'none';
            }
            // Agregar clase al tab-content para reducir el gap
            const stagesTab = document.getElementById('stages-tab');
            if (stagesTab) {
                stagesTab.classList.add('no-controls');
            }
        } else {
            // Caso 2: Todas las etapas están en uso en esta plantilla
            stagesList.innerHTML = `
                <div class="empty-stages-visual">
                    <div class="empty-icon">
                        <i class="far fa-check-circle"></i>
                    </div>
                    <p class="empty-text">Todas las etapas están en uso en esta plantilla</p>
                </div>
            `;
            
            // Mostrar botón crear etapa cuando todas están en uso
            if (createStageBtn) createStageBtn.style.display = 'flex';
            // Mostrar buscador y filtro cuando hay etapas (aunque estén todas en uso)
            if (searchWrapper) searchWrapper.style.display = 'flex';
            const categoryFilterContainer2 = document.getElementById('stageCategoryFilterContainer');
            if (categoryFilterContainer2) {
                categoryFilterContainer2.style.display = 'block';
            }
            // Mostrar el contenedor completo de controles
            const controlsRow2 = document.querySelector('.stages-controls-row');
            if (controlsRow2) {
                controlsRow2.style.display = 'flex';
            }
            // Remover clase del tab-content para restaurar el gap normal
            const stagesTab2 = document.getElementById('stages-tab');
            if (stagesTab2) {
                stagesTab2.classList.remove('no-controls');
            }
        }
        
        return;
    }
    
    // Si hay etapas, mostrar botón, buscador y filtro
    if (createStageBtn) createStageBtn.style.display = 'flex';
    
    // El buscador siempre está visible cuando hay etapas
    if (searchWrapper) {
        searchWrapper.style.display = 'flex';
    }
    
    // El filtro siempre está visible cuando hay etapas
    const categoryFilterContainer3 = document.getElementById('stageCategoryFilterContainer');
    if (categoryFilterContainer3) {
        categoryFilterContainer3.style.display = 'block';
    }
    
    // Mostrar el contenedor completo de controles
    const controlsRow3 = document.querySelector('.stages-controls-row');
    if (controlsRow3) {
        controlsRow3.style.display = 'flex';
    }
    
    // Remover clase del tab-content para restaurar el gap normal
    const stagesTab3 = document.getElementById('stages-tab');
    if (stagesTab3) {
        stagesTab3.classList.remove('no-controls');
    }
    
    // Ocultar empty state inicialmente
    try {
        const emptyState = document.getElementById('stagesEmptyState');
        if (emptyState) emptyState.classList.remove('show');
        if (stagesList) stagesList.style.display = 'flex';
    } catch (e) {
        console.warn('Error ocultando empty state:', e);
    }
    
    // Verificar que stagesList existe antes de renderizar
    if (!stagesList) {
        console.error('stagesList no encontrado');
        return;
    }
    
    // Renderizar etapas disponibles
    try {
        const stagesHTML = availableStagesForThisTemplate.map(stage => {
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
                        <button class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only" 
                                onclick="addStageToBoard('${stage.id}')" 
                                title="Agregar al flujo">
                            <i class="far fa-plus"></i>
                        </button>
                        <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" 
                                onclick="toggleStageTemplateMenu(event, '${stage.id}')" 
                                title="Opciones">
                            <i class="far fa-ellipsis-vertical"></i>
                        </button>
                        <div class="stage-menu-dropdown" id="stage-template-menu-${stage.id}">
                            <button class="stage-menu-item" onclick="editStageTemplate('${stage.id}')">
                                <i class="far fa-pencil"></i>
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
        
        stagesList.innerHTML = stagesHTML + '<div class="library-scroll-spacer"></div>';
        
        // Logs para debuggear el scroll de stages-list
        setTimeout(() => {
            const stagesListEl = document.getElementById('stagesList');
            if (stagesListEl) {
                console.log('🔍 [Stages List Scroll Debug - Editor] ============================================');
                console.log('📦 stagesList.scrollHeight:', stagesListEl.scrollHeight, 'px');
                console.log('📦 stagesList.clientHeight:', stagesListEl.clientHeight, 'px');
                console.log('📦 stagesList.scrollTop:', stagesListEl.scrollTop, 'px');
                console.log('📦 stagesList.maxHeight (computed):', window.getComputedStyle(stagesListEl).maxHeight);
                console.log('📦 Diferencia (scrollHeight - clientHeight):', stagesListEl.scrollHeight - stagesListEl.clientHeight, 'px');
                console.log('📦 ¿Tiene scroll?', stagesListEl.scrollHeight > stagesListEl.clientHeight ? '✅ SÍ' : '❌ NO');
                
                const lastStage = stagesListEl.querySelector('.stage-item:last-child');
                const spacer = stagesListEl.querySelector('.library-scroll-spacer');
                if (lastStage) {
                    const lastStageRect = lastStage.getBoundingClientRect();
                    const containerRect = stagesListEl.getBoundingClientRect();
                    console.log('📦 Último stage-item:');
                    console.log('   - bottom:', lastStageRect.bottom, 'px');
                    console.log('   - container bottom:', containerRect.bottom, 'px');
                    console.log('   - Diferencia:', containerRect.bottom - lastStageRect.bottom, 'px');
                    console.log('   - ¿Está visible?', lastStageRect.bottom <= containerRect.bottom ? '✅ SÍ' : '❌ NO (cortado)');
                }
                if (spacer) {
                    const spacerRect = spacer.getBoundingClientRect();
                    const containerRect = stagesListEl.getBoundingClientRect();
                    console.log('📦 Spacer:');
                    console.log('   - bottom:', spacerRect.bottom, 'px');
                    console.log('   - container bottom:', containerRect.bottom, 'px');
                }
                console.log('✅ [Stages List Scroll Debug - Editor] ============================================');
            }
        }, 200);
        
        // Agregar event listeners para drag and drop
        if (stagesList) {
            stagesList.querySelectorAll('.stage-item').forEach(item => {
                item.addEventListener('dragstart', handleStageTemplateDragStart);
                item.addEventListener('dragend', handleStageTemplateDragEnd);
            });
        }
        
        // Re-inicializar el setup de búsqueda después de renderizar
        setTimeout(() => {
            try {
                setupStageSearch();
            } catch (e) {
                console.error('Error inicializando búsqueda:', e);
            }
        }, 100);
    } catch (e) {
        console.error('Error renderizando etapas:', e);
    }
}

// ========================================
// RENDERIZADO DE ETAPAS AGENTE
// ========================================

function renderAgentStageCard(stage, index) {
    // Buscar datos completos del agente
    const agentData = AGENTS.find(a => a.id === stage.agentId);
    if (!agentData) {
        return '';
    }
    
    // Obtener descripción del agente para el tooltip (misma que en renderAgents)
    const agentDescriptions = {
        'cv-analyzer': 'Este agente revisa automáticamente los CV, evalúa la experiencia del candidato y verifica que su expectativa salarial esté alineada con el rango de la vacante.',
        'interview-ia': 'Esta IA realiza entrevistas automáticas por teléfono o entrevista virtual, analiza las respuestas del candidato y asigna un puntaje según sus competencias y forma de responder.',
        'psychometric-analyst': 'Este agente aplica pruebas psicométricas al candidato y calcula un puntaje que refleja sus capacidades cognitivas y/o rasgos relevantes para el puesto.',
        'background-check': 'Permite generar y verificar el certificado de antecedentes judiciales del candidato para validar su historial legal de forma segura.'
    };
    const agentDescription = agentDescriptions[stage.agentId] || agentData.description;
    
    // Obtener categoría
    const category = STAGE_CATEGORIES.find(cat => cat.id === stage.category);
    const categoryName = category ? category.name : 'Sin categoría';
    
    // Estado de expandido/contraído
    const isExpanded = stage.expanded || false;
    const configDisplay = isExpanded ? 'block' : 'none';
    
    // Renderizar configuración si el agente tiene config
    let configHTML = '';
    if (agentData.hasConfig && agentData.config) {
        // Caso especial: Analista psicométrico - NO mostrar configuración desplegable
        if (stage.agentId === 'psychometric-analyst') {
            // No mostrar configuración desplegable para analista psicométrico
            configHTML = '';
        } else {
            // Renderizado normal para otros agentes
            configHTML = `
                ${isExpanded ? '<div class="agent-stage-divider"></div>' : ''}
                <div class="agent-stage-config" id="agent-config-${stage.id}" style="display: ${configDisplay};">
                    ${Object.entries(agentData.config).map(([key, field]) => {
                        // Asegurar que el campo tenga todas las propiedades necesarias
                        if (!field.options && field.type === 'select') {
                            console.warn('⚠️ Campo select sin opciones:', key, field);
                        }
                        const value = stage.config?.[key] ?? field.default;
                        
                        if (field.type === 'number') {
                        return `
                            <div class="config-field">
                                <label class="config-label">
                                    ${field.label}
                                    ${field.tooltip ? `
                                        <button type="button" class="config-info-btn" 
                                                data-tooltip="${field.tooltip.replace(/"/g, '&quot;')}"
                                                title="${field.tooltip.replace(/"/g, '&quot;')}"
                                                aria-label="Información sobre ${field.label}">
                                            <i class="far fa-circle-info"></i>
                                        </button>
                                    ` : ''}
                                </label>
                                <div class="config-input-group">
                                    <input 
                                        type="number" 
                                        class="config-input" 
                                        value="${value}"
                                        min="0"
                                        onchange="updateAgentStageConfig('${stage.id}', '${key}', this.value)"
                                    >
                                    ${field.suffix ? `<span class="config-suffix">${field.suffix}</span>` : ''}
                                </div>
                            </div>
                        `;
                    } else if (field.type === 'select') {
                        // Usar componente Input UBITS para todos los selects
                        const containerId = `config-${stage.id}-${key}`;
                        console.log('🔧 Renderizando campo select:', {
                            stageId: stage.id,
                            configKey: key,
                            containerId: containerId,
                            label: field.label,
                            hasOptions: !!field.options,
                            optionsCount: field.options ? field.options.length : 0
                        });
                        return `
                            <div class="config-field">
                                <label class="config-label">
                                    ${field.label}
                                    ${field.tooltip ? `
                                        <button type="button" class="config-info-btn" 
                                                data-tooltip="${field.tooltip.replace(/"/g, '&quot;')}"
                                                title="${field.tooltip.replace(/"/g, '&quot;')}"
                                                aria-label="Información sobre ${field.label}">
                                            <i class="far fa-circle-info"></i>
                                        </button>
                                    ` : ''}
                                </label>
                                <div id="${containerId}" class="config-input-container" data-stage-id="${stage.id}" data-config-key="${key}"></div>
                            </div>
                        `;
                    } else if (field.type === 'radio') {
                        return `
                            <div class="config-field config-field-radio">
                                <label class="config-label">
                                    ${field.label}
                                    ${field.tooltip ? `
                                        <button type="button" class="config-info-btn" 
                                                data-tooltip="${field.tooltip.replace(/"/g, '&quot;')}"
                                                title="${field.tooltip.replace(/"/g, '&quot;')}"
                                                aria-label="Información sobre ${field.label}">
                                            <i class="far fa-circle-info"></i>
                                        </button>
                                    ` : ''}
                                </label>
                                <div class="config-radio-group">
                                    ${field.options.map(opt => `
                                        <label class="config-radio-label">
                                            <input 
                                                type="radio" 
                                                name="config-${stage.id}-${key}"
                                                value="${opt.value}"
                                                ${value === opt.value ? 'checked' : ''}
                                                onchange="updateAgentStageConfig('${stage.id}', '${key}', this.value)"
                                            >
                                            <span>${opt.text}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        `;
                    }
                    return '';
                }).join('')}
            </div>
        `;
        }
    }
    
    console.log('🎨 Renderizando card de agente:', {
        stageId: stage.id,
        agentId: stage.agentId,
        agentName: agentData.name,
        hasConfig: agentData.hasConfig,
        configFields: agentData.config ? Object.keys(agentData.config) : [],
        configHTML: configHTML ? configHTML.substring(0, 200) : 'vacío'
    });
    
    return `
        <div class="stage-item agent-stage-item" draggable="true" data-stage-id="${stage.id}" data-stage-index="${index}" data-stage-type="agent">
            <i class="far fa-grip-vertical stage-drag-handle"></i>
            <div class="stage-content">
                <div class="stage-header agent-stage-header">
                    <div class="stage-title-section">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div class="stage-number">${index + 1}</div>
                            <div>
                                <h4 class="stage-name">${stage.name} (IA)</h4>
                                <span class="stage-category-badge">Categoría de etapa: ${categoryName}</span>
                            </div>
                        </div>
                    </div>
                    <div class="stage-actions">
                        ${agentData.hasConfig && stage.agentId === 'psychometric-analyst' ? `
                            <button class="ubits-button ubits-button--secondary ubits-button--sm" onclick="openPsychometricTestsDrawer('${stage.id}')" title="Pruebas psicotécnicas">
                                <i class="far fa-list"></i>
                                <span>Pruebas (${stage.config?.tests?.length || 0})</span>
                            </button>
                        ` : agentData.hasConfig && stage.agentId === 'interview-ia' ? `
                            <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" onclick="openSerenaConfigDrawer('${stage.id}')" title="Configurar entrevista Serena">
                                <i class="far fa-gear"></i>
                            </button>
                        ` : agentData.hasConfig && stage.agentId !== 'psychometric-analyst' && stage.agentId !== 'interview-ia' ? `
                            <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only ${isExpanded ? 'ubits-button--active' : ''}" onclick="toggleAgentStageConfig('${stage.id}')" title="Expandir/Contraer configuración">
                                <i class="far fa-gear" id="chevron-${stage.id}"></i>
                            </button>
                        ` : ''}
                        ${index > 0 ? `
                            <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" onclick="moveAgentStageUp('${stage.id}')" title="Subir">
                                <i class="far fa-arrow-up"></i>
                            </button>
                        ` : ''}
                        ${index < currentTemplate.realContent.stages.length - 1 ? `
                            <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" onclick="moveAgentStageDown('${stage.id}')" title="Bajar">
                                <i class="far fa-arrow-down"></i>
                            </button>
                        ` : ''}
                        <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" onclick="deleteAgentStage('${stage.id}')" title="Quitar agente" style="color: var(--ubits-feedback-accent-error);">
                            <i class="far fa-trash"></i>
                        </button>
                        <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only agent-info-btn"
                                data-agent-id="${stage.agentId}"
                                data-agent-name="${agentData.name}"
                                data-agent-description="${agentDescription.replace(/"/g, '&quot;')}"
                                title="Ver más información">
                            <i class="far fa-circle-info"></i>
                        </button>
                    </div>
                </div>
                ${configHTML}
            </div>
        </div>
    `;
}

function renderStages() {
    const stagesContainer = document.getElementById('stagesContainer');
    if (!stagesContainer) return;
    
    // Mostrar header y drop slot si no hay etapas
    if (!currentTemplate.realContent.stages || currentTemplate.realContent.stages.length === 0) {
        stagesContainer.innerHTML = `
            <div class="board-header-section">
                <h3 class="board-empty-title">Flujo del candidato</h3>
                <p class="board-empty-instruction">Arrastra aquí las etapas y etapas con IA en el orden en que el candidato las irá completando.</p>
            </div>
            <div class="board-drop-slots">
                <div class="board-drop-slot" data-slot-number="1">
                    <div class="slot-number">1</div>
                    <div class="slot-placeholder">Arrastra una etapa o agente IA desde la biblioteca</div>
                </div>
            </div>
        `;
        return;
    }
    
    // Crear HTML de las etapas (distinguir entre agent y custom)
    const stagesHTML = currentTemplate.realContent.stages.map((stage, index) => {
        // Si es etapa de agente, usar renderizado específico
        if (stage.type === 'agent') {
            return renderAgentStageCard(stage, index);
        }
        
        // Si es etapa personalizada (custom), renderizar con expand/collapse si tiene descripción
        const category = STAGE_CATEGORIES.find(cat => cat.id === stage.category);
        const hasDescription = stage.description && stage.description.trim();
        const isExpanded = stage.expanded || false;
        const chevronIcon = isExpanded ? 'fa-chevron-up' : 'fa-chevron-down';
        const descriptionDisplay = isExpanded ? 'block' : 'none';
        
        return `
            <div class="stage-item custom-stage-item" draggable="true" data-stage-id="${stage.id}" data-stage-index="${index}" data-stage-type="custom">
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
                            ${hasDescription ? `
                                <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" onclick="toggleCustomStageDescription('${stage.id}')" title="Expandir/Contraer descripción">
                                    <i class="far ${chevronIcon}" id="chevron-custom-${stage.id}"></i>
                                </button>
                            ` : ''}
                            <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" onclick="editStageName('${stage.id}')" title="Editar">
                                <i class="far fa-pencil"></i>
                            </button>
                            ${index > 0 ? `
                                <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" onclick="moveStageUp('${stage.id}')" title="Subir">
                                    <i class="far fa-arrow-up"></i>
                                </button>
                            ` : ''}
                            ${index < currentTemplate.realContent.stages.length - 1 ? `
                                <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" onclick="moveStageDown('${stage.id}')" title="Bajar">
                                    <i class="far fa-arrow-down"></i>
                                </button>
                            ` : ''}
                            <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" onclick="deleteStage('${stage.id}')" title="Quitar etapa" style="color: var(--ubits-feedback-accent-error);">
                                <i class="far fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    ${hasDescription ? `
                        ${isExpanded ? '<div class="custom-stage-divider"></div>' : ''}
                        <div class="custom-stage-description" id="custom-description-${stage.id}" style="display: ${descriptionDisplay};">
                            <p class="description-text">${stage.description}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    // Calcular el número del siguiente slot
    const nextSlotNumber = currentTemplate.realContent.stages.length + 1;
    
    // Crear el slot adicional para la siguiente etapa
    const nextSlotHTML = `
        <div class="board-drop-slots">
            <div class="board-drop-slot" data-slot-number="${nextSlotNumber}">
                <div class="slot-number">${nextSlotNumber}</div>
                <div class="slot-placeholder">Arrastra una etapa o agente IA desde la izquierda</div>
            </div>
        </div>
    `;
    
    // Mostrar las etapas con el slot adicional
    // Agregar header y luego las etapas
    stagesContainer.innerHTML = `
        <div class="board-header-section">
            <h3 class="board-empty-title">Flujo del candidato</h3>
            <p class="board-empty-instruction">Arrastra aquí las etapas y agentes de IA en el orden en que el candidato las irá completando.</p>
        </div>
        ${stagesHTML}
        ${nextSlotHTML}
    `;
    
    // Configurar drag and drop para las etapas del board (REORDENAR)
    stagesContainer.querySelectorAll('.stage-item').forEach(item => {
        item.addEventListener('dragstart', handleBoardStageDragStart);
        item.addEventListener('dragover', handleBoardStageDragOver);
        item.addEventListener('drop', handleBoardStageDrop);
        item.addEventListener('dragend', handleBoardStageDragEnd);
        item.addEventListener('dragleave', handleBoardStageDragLeave);
    });
    
    // Agregar event listeners para tooltips de información de agentes en el board
    stagesContainer.querySelectorAll('.agent-info-btn').forEach(btn => {
        btn.addEventListener('mouseenter', handleAgentInfoHover);
        btn.addEventListener('mouseleave', handleAgentInfoLeave);
    });
    
    // Agregar event listeners para tooltips de campos de configuración
    stagesContainer.querySelectorAll('.config-info-btn').forEach(btn => {
        btn.addEventListener('mouseenter', handleConfigInfoHover);
        btn.addEventListener('mouseleave', handleConfigInfoLeave);
    });
    
    // Crear inputs UBITS para campos select después de renderizar
    // Usar setTimeout con mayor delay para asegurar que el DOM esté completamente renderizado
    console.log('🚀 Iniciando creación de inputs UBITS para selects...');
    setTimeout(() => {
        console.log('🔍 Verificando disponibilidad de createInput:', typeof createInput);
        
        if (typeof createInput === 'function') {
            // Buscar contenedores en todo el documento, no solo en stagesContainer
            const containers = document.querySelectorAll('.config-input-container');
            console.log('📦 Contenedores encontrados:', containers.length);
            
            if (containers.length === 0) {
                console.warn('⚠️ No se encontraron contenedores .config-input-container');
                // Intentar buscar de otra manera
                const allContainers = document.querySelectorAll('[id^="config-"]');
                console.log('🔍 Contenedores con ID que empiezan con "config-":', allContainers.length);
            }
            
            containers.forEach((container, index) => {
                console.log(`\n📋 Procesando contenedor ${index + 1}/${containers.length}:`);
                const containerId = container.id;
                const dataStageId = container.getAttribute('data-stage-id');
                const dataConfigKey = container.getAttribute('data-config-key');
                
                console.log('  - ID:', containerId);
                console.log('  - data-stage-id:', dataStageId);
                console.log('  - data-config-key:', dataConfigKey);
                console.log('  - Visible:', container.offsetParent !== null);
                console.log('  - Display:', window.getComputedStyle(container).display);
                console.log('  - Width:', container.offsetWidth);
                
                if (!containerId) {
                    console.warn('  ⚠️ Contenedor sin ID:', container);
                    return;
                }
                
                // Usar data attributes si están disponibles (método preferido)
                let stageId, configKey;
                if (dataStageId && dataConfigKey) {
                    stageId = dataStageId;
                    configKey = dataConfigKey;
                    console.log('  ✅ Usando data attributes:', { stageId, configKey });
                } else {
                    // Fallback: Extraer del ID usando regex mejorado
                    // El regex busca el último guion para separar stageId y configKey
                    // Formato: config-{stageId}-{configKey}
                    // Usamos un regex que captura todo hasta el último guion como stageId
                    const parts = containerId.split('-');
                    if (parts.length >= 3 && parts[0] === 'config') {
                        // Reconstruir: config-{stageId}-{configKey}
                        // parts[0] = 'config', parts[1..n-1] = stageId, parts[n] = configKey
                        configKey = parts[parts.length - 1]; // Último elemento es configKey
                        stageId = parts.slice(1, -1).join('-'); // Todo lo demás es stageId
                        console.log('  ✅ Usando regex del ID:', { stageId, configKey });
                    } else {
                        console.warn('  ⚠️ ID de contenedor no coincide con patrón:', containerId);
                        return;
                    }
                }
                
                // Verificar si ya tiene un input creado
                const existingInput = container.querySelector('.ubits-input');
                if (existingInput) {
                    console.log('  ✅ Input ya existe para:', containerId);
                    return;
                }
                
                // Buscar el stage y el campo de configuración
                const stage = currentTemplate.realContent.stages.find(s => s.id === stageId);
                if (!stage) {
                    console.warn('  ⚠️ No se encontró stage con ID:', stageId);
                    console.log('  📋 Stages disponibles:', currentTemplate.realContent.stages.map(s => s.id));
                    return;
                }
                
                console.log('  ✅ Stage encontrado:', stage.id, 'agentId:', stage.agentId);
                
                const agentData = AGENTS.find(a => a.id === stage.agentId);
                if (!agentData) {
                    console.warn('  ⚠️ No se encontró agente con ID:', stage.agentId);
                    console.log('  📋 Agentes disponibles:', AGENTS.map(a => a.id));
                    return;
                }
                
                if (!agentData.config || !agentData.config[configKey]) {
                    console.warn('  ⚠️ No se encontró configuración para:', configKey, 'en agente:', stage.agentId);
                    console.log('  📋 Configuraciones disponibles:', Object.keys(agentData.config || {}));
                    return;
                }
                
                const field = agentData.config[configKey];
                console.log('  ✅ Campo encontrado:', {
                    type: field.type,
                    label: field.label,
                    hasOptions: !!field.options,
                    optionsCount: field.options ? field.options.length : 0
                });
                
                if (field.type === 'select' && field.options && field.options.length > 0) {
                    const currentValue = stage.config && stage.config[configKey] ? stage.config[configKey] : field.default;
                    
                    console.log('  📝 Creando input UBITS:', {
                        containerId: containerId,
                        currentValue: currentValue,
                        optionsCount: field.options.length,
                        options: field.options.map(opt => opt.text)
                    });
                    
                    // Limpiar contenedor antes de crear
                    container.innerHTML = '';
                    
                    // Asegurar que el contenedor sea visible
                    container.style.display = 'block';
                    container.style.width = '100%';
                    container.style.maxWidth = '100%';
                    container.style.position = 'relative';
                    container.style.minHeight = '40px'; // Altura mínima para que sea visible
                    
                    // Crear el input UBITS
                    try {
                        console.log('  🔨 Llamando a createInput...');
                        createInput({
                            containerId: containerId,
                            type: 'select',
                            placeholder: 'Selecciona una opción...',
                            selectOptions: field.options,
                            size: 'md',
                            showLabel: false,
                            value: currentValue || '',
                            onChange: function(value) {
                                console.log('  🔄 onChange llamado para', containerId, 'con valor:', value);
                                updateAgentStageConfig(stageId, configKey, value);
                            }
                        });
                        console.log('  ✅ createInput llamado para:', containerId);
                        
                        // Verificar que se creó correctamente después de un breve delay
                        setTimeout(() => {
                            const input = container.querySelector('.ubits-input');
                            const inputWrapper = container.querySelector('[style*="position: relative"]');
                            console.log('  🔍 Verificando creación del input para:', containerId);
                            console.log('    - Input encontrado:', !!input);
                            console.log('    - Wrapper encontrado:', !!inputWrapper);
                            console.log('    - Contenedor HTML:', container.innerHTML.substring(0, 200));
                            
                            if (input) {
                                console.log('  ✅ Input creado exitosamente para:', containerId);
                                // Asegurar que el input sea visible
                                input.style.display = 'block';
                                input.style.width = '100%';
                            } else {
                                console.error('  ❌ Input no se creó para:', containerId);
                                console.error('    - HTML del contenedor:', container.innerHTML);
                            }
                        }, 200);
                    } catch (e) {
                        console.error('  ❌ Error creando input para', containerId, ':', e);
                        console.error('    - Stack:', e.stack);
                    }
                } else {
                    console.warn('  ⚠️ Campo select sin opciones o inválido:', {
                        configKey: configKey,
                        type: field.type,
                        hasOptions: !!field.options,
                        optionsCount: field.options ? field.options.length : 0
                    });
                }
    });
        } else {
            console.error('❌ createInput no está disponible');
            console.log('  - typeof createInput:', typeof createInput);
            console.log('  - window.createInput:', typeof window.createInput);
        }
    }, 300);
    
    // ========================================
    // LOGS DETALLADOS PARA DETECTAR EXPANSIÓN HORIZONTAL
    // ========================================
    setTimeout(() => {
        console.log('\n📦 ANÁLISIS DE EXPANSIÓN HORIZONTAL DESPUÉS DE AÑADIR ETAPAS/AGENTES:');
        
        const boardContainer = document.querySelector('.board-container');
        const stagesContainerEl = document.getElementById('stagesContainer');
        const boardMain = document.querySelector('.board-main');
        const stageItems = stagesContainerEl ? stagesContainerEl.querySelectorAll('.stage-item') : [];
        
        // Analizar contenedores principales
        if (boardContainer) {
            const rect = boardContainer.getBoundingClientRect();
            const style = window.getComputedStyle(boardContainer);
            console.log('  📦 .board-container:');
            console.log('    width:', Math.round(rect.width), 'px');
            console.log('    computedWidth:', style.width);
            console.log('    max-width:', style.maxWidth);
            console.log('    padding-left:', style.paddingLeft);
            console.log('    padding-right:', style.paddingRight);
            console.log('    left:', Math.round(rect.left), 'px');
            console.log('    right:', Math.round(rect.right), 'px');
            console.log('    scrollWidth:', boardContainer.scrollWidth, 'px');
            console.log('    clientWidth:', boardContainer.clientWidth, 'px');
            console.log('    overflow-x:', style.overflowX);
            console.log('    overflow-y:', style.overflowY);
            
            // Verificar overflow
            const containerOverflow = boardContainer.scrollWidth - boardContainer.clientWidth;
            if (containerOverflow > 0) {
                console.warn('    🔴 OVERFLOW HORIZONTAL DETECTADO:', containerOverflow, 'px');
            } else {
                console.log('    ✅ No hay overflow horizontal');
            }
        }
        
        if (stagesContainerEl) {
            const rect = stagesContainerEl.getBoundingClientRect();
            const style = window.getComputedStyle(stagesContainerEl);
            console.log('  📦 .stages-container:');
            console.log('    width:', Math.round(rect.width), 'px');
            console.log('    computedWidth:', style.width);
            console.log('    max-width:', style.maxWidth);
            console.log('    left:', Math.round(rect.left), 'px');
            console.log('    right:', Math.round(rect.right), 'px');
            console.log('    scrollWidth:', stagesContainerEl.scrollWidth, 'px');
            console.log('    clientWidth:', stagesContainerEl.clientWidth, 'px');
            console.log('    overflow-x:', style.overflowX);
            
            // Verificar overflow
            const containerOverflow = stagesContainerEl.scrollWidth - stagesContainerEl.clientWidth;
            if (containerOverflow > 0) {
                console.warn('    🔴 OVERFLOW HORIZONTAL DETECTADO:', containerOverflow, 'px');
            } else {
                console.log('    ✅ No hay overflow horizontal');
            }
        }
        
        if (boardMain) {
            const rect = boardMain.getBoundingClientRect();
            const style = window.getComputedStyle(boardMain);
            console.log('  📦 .board-main:');
            console.log('    width:', Math.round(rect.width), 'px');
            console.log('    computedWidth:', style.width);
            console.log('    max-width:', style.maxWidth);
            console.log('    left:', Math.round(rect.left), 'px');
            console.log('    right:', Math.round(rect.right), 'px');
            console.log('    scrollWidth:', boardMain.scrollWidth, 'px');
            console.log('    clientWidth:', boardMain.clientWidth, 'px');
            console.log('    overflow-x:', style.overflowX);
            
            // Verificar overflow
            const mainOverflow = boardMain.scrollWidth - boardMain.clientWidth;
            if (mainOverflow > 0) {
                console.warn('    🔴 OVERFLOW HORIZONTAL DETECTADO:', mainOverflow, 'px');
            } else {
                console.log('    ✅ No hay overflow horizontal');
            }
        }
        
        // Analizar cada stage-item
        console.log('  📋 Análisis de stage-items (' + stageItems.length + ' items):');
        stageItems.forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            const style = window.getComputedStyle(item);
            const isAgent = item.classList.contains('agent-stage-item');
            const isCustom = item.classList.contains('custom-stage-item');
            
            console.log(`    📦 Stage-item ${index + 1} (${isAgent ? 'AGENT' : isCustom ? 'CUSTOM' : 'UNKNOWN'}):`);
            console.log('      width:', Math.round(rect.width), 'px');
            console.log('      computedWidth:', style.width);
            console.log('      max-width:', style.maxWidth);
            console.log('      left:', Math.round(rect.left), 'px');
            console.log('      right:', Math.round(rect.right), 'px');
            console.log('      scrollWidth:', item.scrollWidth, 'px');
            console.log('      clientWidth:', item.clientWidth, 'px');
            console.log('      padding-left:', style.paddingLeft);
            console.log('      padding-right:', style.paddingRight);
            console.log('      box-sizing:', style.boxSizing);
            
            // Verificar si el item se sale del contenedor
            if (boardContainer) {
                const boardRect = boardContainer.getBoundingClientRect();
                const boardPaddingRight = parseFloat(window.getComputedStyle(boardContainer).paddingRight || 0);
                const boardRight = boardRect.right - boardPaddingRight;
                
                if (rect.right > boardRight) {
                    const overflow = rect.right - boardRight;
                    console.warn('      🔴 SE SALE DEL CONTENEDOR:', Math.round(overflow), 'px');
                } else {
                    console.log('      ✅ Dentro del contenedor');
                }
            }
            
            // Analizar elementos internos que podrían causar expansión
            const stageContent = item.querySelector('.stage-content');
            const stageHeader = item.querySelector('.stage-header');
            const stageName = item.querySelector('.stage-name');
            const stageActions = item.querySelector('.stage-actions');
            
            if (stageContent) {
                const contentRect = stageContent.getBoundingClientRect();
                const contentStyle = window.getComputedStyle(stageContent);
                console.log('      📦 .stage-content:');
                console.log('        width:', Math.round(contentRect.width), 'px');
                console.log('        computedWidth:', contentStyle.width);
                console.log('        flex:', contentStyle.flex);
                console.log('        min-width:', contentStyle.minWidth);
                console.log('        max-width:', contentStyle.maxWidth);
            }
            
            if (stageHeader) {
                const headerRect = stageHeader.getBoundingClientRect();
                const headerStyle = window.getComputedStyle(stageHeader);
                console.log('      📦 .stage-header:');
                console.log('        width:', Math.round(headerRect.width), 'px');
                console.log('        computedWidth:', headerStyle.width);
                console.log('        min-width:', headerStyle.minWidth);
                console.log('        max-width:', headerStyle.maxWidth);
            }
            
            if (stageName) {
                const nameRect = stageName.getBoundingClientRect();
                const nameStyle = window.getComputedStyle(stageName);
                console.log('      📦 .stage-name:');
                console.log('        width:', Math.round(nameRect.width), 'px');
                console.log('        computedWidth:', nameStyle.width);
                console.log('        text:', stageName.textContent.substring(0, 30));
                console.log('        white-space:', nameStyle.whiteSpace);
                console.log('        word-wrap:', nameStyle.wordWrap);
            }
            
            if (stageActions) {
                const actionsRect = stageActions.getBoundingClientRect();
                const actionsStyle = window.getComputedStyle(stageActions);
                console.log('      📦 .stage-actions:');
                console.log('        width:', Math.round(actionsRect.width), 'px');
                console.log('        computedWidth:', actionsStyle.width);
                console.log('        flex-shrink:', actionsStyle.flexShrink);
            }
            
            // Verificar agent-card si es un agente
            if (isAgent) {
                const agentCard = item.querySelector('.agent-card');
                if (agentCard) {
                    const cardRect = agentCard.getBoundingClientRect();
                    const cardStyle = window.getComputedStyle(agentCard);
                    console.log('      📦 .agent-card:');
                    console.log('        width:', Math.round(cardRect.width), 'px');
                    console.log('        computedWidth:', cardStyle.width);
                    console.log('        max-width:', cardStyle.maxWidth);
                    console.log('        padding-left:', cardStyle.paddingLeft);
                    console.log('        padding-right:', cardStyle.paddingRight);
                    console.log('        box-sizing:', cardStyle.boxSizing);
                    
                    // Verificar si la card se sale del stage-item
                    if (rect.width > 0 && cardRect.width > rect.width) {
                        const overflow = cardRect.width - rect.width;
                        console.warn('        🔴 LA CARD SE SALE DEL STAGE-ITEM:', Math.round(overflow), 'px');
                    }
                }
            }
        });
        
        // Verificar overflow global del documento
        const body = document.body;
        const html = document.documentElement;
        const bodyOverflow = body.scrollWidth - window.innerWidth;
        const htmlOverflow = html.scrollWidth - window.innerWidth;
        const maxOverflow = Math.max(bodyOverflow, htmlOverflow);
        
        console.log('  🌐 Overflow global del documento:');
        console.log('    body.scrollWidth:', body.scrollWidth, 'px');
        console.log('    html.scrollWidth:', html.scrollWidth, 'px');
        console.log('    window.innerWidth:', window.innerWidth, 'px');
        console.log('    maxOverflow:', maxOverflow, 'px');
        
        if (maxOverflow > 0) {
            console.warn('    🔴 OVERFLOW GLOBAL DETECTADO:', maxOverflow, 'px');
            
            // Buscar el elemento que causa el overflow
            const allElements = document.querySelectorAll('*');
            let maxScrollWidth = 0;
            let culpritElement = null;
            
            allElements.forEach(el => {
                const elRect = el.getBoundingClientRect();
                if (elRect.right > window.innerWidth && el.scrollWidth > maxScrollWidth) {
                    maxScrollWidth = el.scrollWidth;
                    culpritElement = el;
                }
            });
            
            if (culpritElement) {
                const culpritRect = culpritElement.getBoundingClientRect();
                const culpritStyle = window.getComputedStyle(culpritElement);
                console.warn('    🔴 Elemento que causa overflow:', culpritElement.className || culpritElement.id || culpritElement.tagName);
                console.warn('      scrollWidth:', culpritElement.scrollWidth, 'px');
                console.warn('      clientWidth:', culpritElement.clientWidth, 'px');
                console.warn('      right:', Math.round(culpritRect.right), 'px');
                console.warn('      width (computed):', culpritStyle.width);
                console.warn('      max-width:', culpritStyle.maxWidth);
                console.warn('      padding-right:', culpritStyle.paddingRight);
                console.warn('      margin-right:', culpritStyle.marginRight);
            }
        } else {
            console.log('    ✅ No hay overflow global');
        }
        
        console.log('📦 ANÁLISIS DE EXPANSIÓN HORIZONTAL - FIN\n');
    }, 100);
}

/**
 * Fija el ancho del board-container para evitar que cambie de tamaño
 * cuando se agregan etapas o agentes
 */
function fixBoardContainerWidth() {
    const boardMain = document.querySelector('.board-main');
    const boardContainer = document.querySelector('.board-container');
    const editorLayout = document.querySelector('.editor-layout');
    const mainContent = document.querySelector('.main-content');
    const saveButton = document.querySelector('.save-template-button');
    
    if (!boardMain || !boardContainer) return;
    
    // Usar setTimeout para asegurar que el DOM se haya actualizado
    setTimeout(() => {
        // NO aplicar max-width al board-main - dejar que flex: 1 haga su trabajo
        // El board-main debe expandirse completamente usando flex: 1
        boardMain.style.removeProperty('max-width');
        boardMain.style.setProperty('transition', 'none', 'important'); // Remover transición para evitar brincos
        
        // El board-container debe usar 100% del ancho del board-main (sin limitaciones)
        // Solo asegurar que no haya overflow horizontal
        boardContainer.style.removeProperty('max-width');
        boardContainer.style.setProperty('width', '100%', 'important');
        boardContainer.style.setProperty('box-sizing', 'border-box', 'important');
        boardContainer.style.setProperty('overflow-x', 'hidden', 'important');
        boardContainer.style.setProperty('transition', 'none', 'important'); // Remover transición para evitar brincos
        
        // Asegurar que el stages-container también respete el ancho
        const stagesContainer = document.getElementById('stagesContainer');
        if (stagesContainer) {
            stagesContainer.style.setProperty('max-width', '100%', 'important');
            stagesContainer.style.setProperty('width', '100%', 'important');
            stagesContainer.style.setProperty('box-sizing', 'border-box', 'important');
            stagesContainer.style.setProperty('overflow-x', 'hidden', 'important');
        }
        
        // Asegurar que todos los stage-items respeten el ancho
        const stageItems = document.querySelectorAll('.stage-item');
        stageItems.forEach(item => {
            item.style.setProperty('max-width', '100%', 'important');
            item.style.setProperty('width', '100%', 'important');
            item.style.setProperty('box-sizing', 'border-box', 'important');
            item.style.setProperty('overflow-x', 'hidden', 'important');
            
            // Asegurar que el contenido interno también respete el ancho
            const stageContent = item.querySelector('.stage-content');
            if (stageContent) {
                stageContent.style.setProperty('max-width', '100%', 'important');
                stageContent.style.setProperty('box-sizing', 'border-box', 'important');
                stageContent.style.setProperty('overflow-x', 'hidden', 'important');
            }
            
            const stageHeader = item.querySelector('.stage-header');
            if (stageHeader) {
                stageHeader.style.setProperty('max-width', '100%', 'important');
                stageHeader.style.setProperty('box-sizing', 'border-box', 'important');
                stageHeader.style.setProperty('overflow-x', 'hidden', 'important');
            }
            
            const stageName = item.querySelector('.stage-name');
            if (stageName) {
                stageName.style.setProperty('max-width', '100%', 'important');
                stageName.style.setProperty('box-sizing', 'border-box', 'important');
                stageName.style.setProperty('overflow-wrap', 'break-word', 'important');
                stageName.style.setProperty('word-wrap', 'break-word', 'important');
            }
            
            // Asegurar que el stage-number mantenga su forma circular
            const stageNumber = item.querySelector('.stage-number');
            if (stageNumber) {
                stageNumber.style.setProperty('width', '32px', 'important');
                stageNumber.style.setProperty('height', '32px', 'important');
                stageNumber.style.setProperty('min-width', '32px', 'important');
                stageNumber.style.setProperty('max-width', '32px', 'important');
                stageNumber.style.setProperty('flex-shrink', '0', 'important');
                stageNumber.style.setProperty('border-radius', '50%', 'important');
                stageNumber.style.setProperty('box-sizing', 'border-box', 'important');
            }
            
            // Asegurar que la configuración del agente no cause expansión horizontal
            const agentConfig = item.querySelector('.agent-stage-config');
            if (agentConfig) {
                agentConfig.style.setProperty('max-width', '100%', 'important');
                agentConfig.style.setProperty('width', '100%', 'important');
                agentConfig.style.setProperty('box-sizing', 'border-box', 'important');
                agentConfig.style.setProperty('overflow-x', 'hidden', 'important');
            }
            
            const agentCardConfig = item.querySelector('.agent-card-config');
            if (agentCardConfig) {
                agentCardConfig.style.setProperty('max-width', '100%', 'important');
                agentCardConfig.style.setProperty('width', '100%', 'important');
                agentCardConfig.style.setProperty('box-sizing', 'border-box', 'important');
                agentCardConfig.style.setProperty('overflow-x', 'hidden', 'important');
            }
            
            // Asegurar que los campos de configuración respeten el ancho
            const configFields = item.querySelectorAll('.config-field');
            configFields.forEach(field => {
                field.style.setProperty('max-width', '100%', 'important');
                field.style.setProperty('width', '100%', 'important');
                field.style.setProperty('box-sizing', 'border-box', 'important');
                field.style.setProperty('overflow-x', 'hidden', 'important');
            });
        });
        
        // Asegurar que los slot-number también mantengan su forma circular
        const slotNumbers = document.querySelectorAll('.slot-number');
        slotNumbers.forEach(slotNumber => {
            slotNumber.style.setProperty('width', '24px', 'important');
            slotNumber.style.setProperty('height', '24px', 'important');
            slotNumber.style.setProperty('min-width', '24px', 'important');
            slotNumber.style.setProperty('max-width', '24px', 'important');
            slotNumber.style.setProperty('flex-shrink', '0', 'important');
            slotNumber.style.setProperty('border-radius', '50%', 'important');
            slotNumber.style.setProperty('box-sizing', 'border-box', 'important');
        });
        
        console.log('🔧 Ancho del board-container: sin limitación (flex: 1)');
        
        // Liberar el flag después de completar
        isFixingWidth = false;
    }, 50);
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

window.addStageToBoard = function(stageTemplateId) {
    // Buscar la etapa en availableStages
    const stageTemplate = availableStages.find(s => s.id === stageTemplateId);
    if (!stageTemplate) return;
    
    // Verificar que la etapa no esté ya en uso
    const existingStage = currentTemplate.realContent.stages.find(stage => stage.templateId === stageTemplateId);
    if (existingStage) {
        showToast('info', 'Esta etapa ya está en la plantilla');
        return;
    }
    
    // Crear nueva etapa en el área de trabajo (mantener tipo y descripción)
    const newStage = {
        id: 'work-stage-' + Date.now(),
        templateId: stageTemplateId,
        name: stageTemplate.name,
        category: stageTemplate.category,
        type: stageTemplate.type || 'custom',
        description: stageTemplate.description || ''
    };
    
    // Agregar al final de la plantilla
    currentTemplate.realContent.stages.push(newStage);
    
    // Re-renderizar todo
    renderEditor();
    
    // Marcar como cambios sin guardar
    markAsUnsaved();
    
    // Cerrar menús
    closeStageTemplateMenus();
    
    // Mostrar toast de éxito
    showToast('success', `Etapa "${stageTemplate.name}" agregada a la plantilla`);
}

function handleStageTemplateDrop(data) {
    const { id, name, category } = data;
    
    // Verificar que la etapa no esté ya en uso
    const existingStage = currentTemplate.realContent.stages.find(stage => stage.templateId === id);
    if (existingStage) {
        return;
    }
    
    // Buscar template de etapa para obtener tipo y descripción
    const stageTemplate = availableStages.find(s => s.id === id);
    
    // Crear nueva etapa en el área de trabajo
    const newStage = {
        id: 'work-stage-' + Date.now(),
        templateId: id,
        name: name,
        category: category,
        type: stageTemplate?.type || 'custom',
        description: stageTemplate?.description || ''
    };
    
    // Fijar el ancho ANTES de agregar la etapa para evitar expansión temporal
    fixBoardContainerWidth();
    
    // Fijar el ancho ANTES de agregar la etapa para evitar expansión temporal
    fixBoardContainerWidth();
    
    // Agregar a la plantilla actual
    currentTemplate.realContent.stages.push(newStage);
    
    // Re-renderizar todo
    renderEditor();
    
    // Si es analista psicométrico, abrir drawer automáticamente
    if (agentId === 'psychometric-analyst') {
        setTimeout(() => {
            openPsychometricTestsDrawer(newAgentStage.id);
            // Mostrar vista de creación automáticamente
            showCreateTestView();
        }, 300);
    }
    
    // Fijar el ancho del board-container después de renderizar
    // Usar doble requestAnimationFrame para asegurar que se ejecute después del render completo
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            fixBoardContainerWidth();
        });
    });
    
    // Marcar como cambios sin guardar
    markAsUnsaved();
}

// Flag para evitar múltiples ejecuciones del drop
let isProcessingDrop = false;

function handleAgentDrop(data) {
    const { id, name, icon } = data;
    
    // Evitar múltiples ejecuciones simultáneas
    if (isProcessingDrop) {
        return;
    }
    isProcessingDrop = true;
    
    // Buscar datos completos del agente
    const agentData = AGENTS.find(a => a.id === id);
    if (!agentData) {
        isProcessingDrop = false;
        return;
    }
    
    // Verificar que este agente no esté ya en el flujo
    const existingAgentStage = currentTemplate.realContent.stages.find(stage => 
        stage.type === 'agent' && stage.agentId === id
    );
    
    if (existingAgentStage) {
        showToast('info', 'Este agente ya está en el flujo');
        isProcessingDrop = false;
        return;
    }
    
    // Crear configuración por defecto del agente si tiene config
    let defaultConfig = {};
    if (agentData.hasConfig && agentData.config) {
        Object.entries(agentData.config).forEach(([key, field]) => {
            if (key === 'tests' && field.type === 'psychometric-tests-manager') {
                // Para analista psicométrico, inicializar con array vacío
                defaultConfig[key] = [];
            } else {
                defaultConfig[key] = field.default;
            }
        });
    }
    
    // Crear nueva etapa tipo 'agent' (etapa automatizada)
    const newAgentStage = {
        id: 'agent-stage-' + Date.now(),
        type: 'agent',
        agentId: id,
        name: agentData.name,
        icon: agentData.icon,
        category: agentData.category,
        hasConfig: agentData.hasConfig,
        config: defaultConfig,
        expanded: false  // Por defecto contraído
    };
    
    // Fijar el ancho ANTES de agregar el agente para evitar expansión temporal
    fixBoardContainerWidth();
    
    // Agregar al final del flujo
    currentTemplate.realContent.stages.push(newAgentStage);
    
    // Actualizar agentes disponibles
    updateAvailableAgents();
    
    // Re-renderizar todo
    renderEditor();
    
    // Si es analista psicométrico, abrir drawer automáticamente
    if (id === 'psychometric-analyst') {
        setTimeout(() => {
            openPsychometricTestsDrawer(newAgentStage.id);
            // Mostrar vista de creación automáticamente
            showCreateTestView();
        }, 300);
    }
    
    // Si es entrevista Serena, abrir drawer de configuración automáticamente
    if (id === 'interview-ia') {
        setTimeout(() => {
            openSerenaConfigDrawer(newAgentStage.id);
        }, 300);
    }
    
    // Fijar el ancho del board-container después de renderizar
    // Usar doble requestAnimationFrame para asegurar que se ejecute después del render completo
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            fixBoardContainerWidth();
        });
    });
    
    // Marcar como cambios sin guardar
    markAsUnsaved();
    
    // Mostrar toast de éxito
    showToast('success', `Agente "${agentData.name}" agregado al flujo`);
    
    // Reset del flag después de un breve delay
    setTimeout(() => {
        isProcessingDrop = false;
    }, 500);
}

function updateTemplateInfo() {
    const templateName = document.getElementById('templateName');
    const templateCategoryName = document.getElementById('templateCategoryName');
    const templateLastModified = document.getElementById('templateLastModified');
    const templateVersion = document.getElementById('templateVersion');
    const templateStatusBadge = document.getElementById('templateStatusBadge');
    
    if (currentTemplate) {
        // Actualizar nombre
        if (templateName) {
            templateName.value = currentTemplate.name;
            
            // Ajustar ancho del input al tamaño exacto del texto
            const text = templateName.value || 'Nueva plantilla';
            
            // Crear elemento temporal para medir el ancho exacto
            const tempSpan = document.createElement('span');
            tempSpan.style.visibility = 'hidden';
            tempSpan.style.position = 'absolute';
            tempSpan.style.whiteSpace = 'nowrap';
            tempSpan.style.fontFamily = 'Noto Sans';
            tempSpan.style.fontSize = '24px';
            tempSpan.style.fontWeight = '600';
            tempSpan.style.padding = '0';
            tempSpan.style.margin = '0';
            tempSpan.style.border = 'none';
            tempSpan.style.left = '-9999px';
            tempSpan.textContent = text;
            document.body.appendChild(tempSpan);
            
            const textWidth = tempSpan.getBoundingClientRect().width;
            document.body.removeChild(tempSpan);
            
            // Verificar si está en focus para agregar padding si es necesario
            const isFocused = document.activeElement === templateName;
            const paddingWidth = isFocused ? 16 : 0; // 8px izquierdo + 8px derecho
            
            // Usar el ancho exacto del texto + padding si está en focus
            const exactWidth = Math.ceil(textWidth);
            const minWidth = 50;
            const maxWidth = 600;
            const finalWidth = Math.max(minWidth, Math.min(maxWidth, exactWidth + paddingWidth));
            
            console.log('🔍 updateTemplateInfo - Ajuste de ancho:');
            console.log('  - Texto:', text);
            console.log('  - Ancho del texto:', textWidth);
            console.log('  - Está en focus:', isFocused);
            console.log('  - Padding a agregar:', paddingWidth);
            console.log('  - Ancho final aplicado:', finalWidth);
            
            templateName.style.width = finalWidth + 'px';
            templateName.style.color = 'var(--ubits-fg-1-high)';
        }
        
        // Actualizar estado (ocultar si no hay status)
        if (templateStatusBadge) {
            const status = currentTemplate.status;
            if (status) {
                const statusText = status === 'available' ? 'Disponible' : 'Borrador';
                templateStatusBadge.innerHTML = `<span>${statusText}</span>`;
                templateStatusBadge.className = 'template-status-badge ' + (status === 'available' ? 'active' : 'draft');
                templateStatusBadge.style.display = 'flex';
            } else {
                // Ocultar la etiqueta si no hay status
                templateStatusBadge.style.display = 'none';
            }
        }
        
        // Ocultar botón "Terminar" y cambiar "Guardar" a primario cuando status === 'available'
        const saveButtonDesktop = document.querySelector('.header-right button[onclick="saveTemplate()"]');
        const finishButtonDesktop = document.querySelector('.header-right button[onclick="finishTemplate()"]');
        const saveButtonMobile = document.querySelector('.header-row-2 button[onclick="saveTemplate()"]');
        const finishButtonMobile = document.querySelector('.header-row-2 button[onclick="finishTemplate()"]');
        
        if (currentTemplate && currentTemplate.status === 'available') {
            // Ocultar botón "Terminar"
            if (finishButtonDesktop) {
                finishButtonDesktop.style.display = 'none';
            }
            if (finishButtonMobile) {
                finishButtonMobile.style.display = 'none';
            }
            
            // Cambiar "Guardar" a primario
            if (saveButtonDesktop) {
                saveButtonDesktop.className = 'ubits-button ubits-button--primary ubits-button--md';
            }
            if (saveButtonMobile) {
                saveButtonMobile.className = 'ubits-button ubits-button--primary ubits-button--md';
            }
        } else {
            // Mostrar botón "Terminar" y cambiar "Guardar" a secundario
            if (finishButtonDesktop) {
                finishButtonDesktop.style.display = 'flex';
            }
            if (finishButtonMobile) {
                finishButtonMobile.style.display = 'flex';
            }
            
            if (saveButtonDesktop) {
                saveButtonDesktop.className = 'ubits-button ubits-button--secondary ubits-button--md';
            }
            if (saveButtonMobile) {
                saveButtonMobile.className = 'ubits-button ubits-button--secondary ubits-button--md';
            }
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
            templateLastModified.textContent = `Modificado: ${formatDate(currentTemplate.lastModified)}`;
        }
        
        // Actualizar versión
        if (templateVersion && currentTemplate.version) {
            templateVersion.textContent = `Versión ${currentTemplate.version}`;
        }
    }
}

function updateAvailableAgents() {
    // Filtrar agentes que ya están en el flujo como etapas
    const assignedAgentIds = new Set();
    currentTemplate.realContent.stages.forEach(stage => {
        if (stage.type === 'agent' && stage.agentId) {
            assignedAgentIds.add(stage.agentId);
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
// FUNCIONES PARA TOOLTIP DE INFORMACIÓN DE CAMPOS DE CONFIGURACIÓN
// ========================================

function handleConfigInfoHover(e) {
    const btn = e.currentTarget;
    const tooltip = document.getElementById('tooltip');
    if (!tooltip) {
        console.warn('⚠️ Tooltip element not found in handleConfigInfoHover');
        return;
    }
    
    const tooltipText = btn.getAttribute('data-tooltip');
    if (!tooltipText) {
        console.warn('⚠️ No tooltip text found on button');
        return;
    }
    
    // Agregar clase específica para tooltip de configuración
    tooltip.classList.add('config-info-tooltip');
    
    // Asegurar que el tooltip esté por encima del drawer (z-index: 10001)
    tooltip.style.zIndex = '10002';
    
    // Crear contenido del tooltip
    tooltip.innerHTML = `
        <div style="font-size: 13px; line-height: 1.4; color: var(--ubits-fg-1-high-static-inverted);">${tooltipText}</div>
    `;
    
    // Mostrar tooltip temporalmente para obtener dimensiones reales
    tooltip.style.opacity = '0';
    tooltip.style.visibility = 'hidden';
    tooltip.style.display = 'block';
    tooltip.style.position = 'fixed';
    
    // Obtener dimensiones reales del tooltip
    const tooltipRect = tooltip.getBoundingClientRect();
    const tooltipWidth = tooltipRect.width;
    const tooltipHeight = tooltipRect.height;
    
    // Obtener posición del botón
    const rect = btn.getBoundingClientRect();
    const btnCenterX = rect.left + (rect.width / 2);
    const btnTop = rect.top;
    
    // Calcular espacio disponible
    const spaceTop = rect.top;
    const spaceBottom = window.innerHeight - rect.bottom;
    const spaceLeft = rect.left;
    const spaceRight = window.innerWidth - rect.right;
    
    // Posicionar tooltip centrado arriba del botón
    let finalLeft = btnCenterX - (tooltipWidth / 2);
    let finalTop = btnTop - tooltipHeight - 8; // 8px de espacio entre botón y tooltip
    
    // Ajustar si se sale por la izquierda
    if (finalLeft < 8) {
        finalLeft = 8;
    }
    
    // Ajustar si se sale por la derecha
    if (finalLeft + tooltipWidth > window.innerWidth - 8) {
        finalLeft = window.innerWidth - tooltipWidth - 8;
    }
    
    // Si no hay espacio arriba, mostrar abajo
    if (spaceTop < tooltipHeight + 8) {
        finalTop = rect.bottom + 8;
    }
    
    // Aplicar posición final
    tooltip.style.left = finalLeft + 'px';
    tooltip.style.top = finalTop + 'px';
    tooltip.style.transform = 'none';
    tooltip.style.visibility = 'visible';
    tooltip.style.opacity = '1';
}

function handleConfigInfoLeave(e) {
    const tooltip = document.getElementById('tooltip');
    if (!tooltip) return;
    
    tooltip.style.opacity = '0';
    tooltip.style.zIndex = '10000'; // Restaurar z-index por defecto
    tooltip.classList.remove('config-info-tooltip');
}

// ========================================
// FUNCIONES PARA TOOLTIP DE INFORMACIÓN DE AGENTES
// ========================================

function handleAgentInfoHover(e) {
    const btn = e.currentTarget;
    const tooltip = document.getElementById('tooltip');
    if (!tooltip) return;
    
    const agentName = btn.getAttribute('data-agent-name');
    const agentDescription = btn.getAttribute('data-agent-description');
    
    // Agregar clase específica para tooltip de agentes
    tooltip.classList.add('agent-info-tooltip');
    
    // Crear contenido del tooltip con título y descripción
    tooltip.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 4px; color: var(--ubits-fg-1-high-static-inverted);">${agentName}</div>
        <div style="font-size: 13px; line-height: 1.4; color: var(--ubits-fg-1-high-static-inverted);">${agentDescription}</div>
    `;
    
    // Mostrar tooltip
    tooltip.style.opacity = '1';
    
    // Posicionar tooltip arriba del botón
    const rect = btn.getBoundingClientRect();
    
    // 🔍 ENCONTRAR LA POSICIÓN EXACTA DEL ICONO DENTRO DEL BOTÓN
    const icon = btn.querySelector('i');
    let iconRect = null;
    let iconCenterX = rect.left + (rect.width / 2); // Centro del botón por defecto
    let iconCenterY = rect.top + (rect.height / 2);
    
    if (icon) {
        iconRect = icon.getBoundingClientRect();
        iconCenterX = iconRect.left + (iconRect.width / 2);
        iconCenterY = iconRect.top + (iconRect.height / 2);
    }
    
    // Detectar si el botón está en una card del board (paso del proceso)
    const isInBoard = btn.closest('.board-container') !== null;
    const isInBoardStage = btn.closest('.agent-stage-item') !== null;
    
    // Calcular espacio disponible a izquierda y derecha
    const spaceLeft = rect.left;
    const spaceRight = window.innerWidth - rect.right;
    
    // Estimar ancho del tooltip (usar max-width como referencia)
    const estimatedTooltipWidth = 400; // max-width del tooltip
    
    console.log('🔍 Tooltip Positioning Debug - INICIO:');
    console.log('  📍 Ubicación:', isInBoard || isInBoardStage ? 'BOARD (paso del proceso)' : 'SIDEBAR (lista de agentes)');
    console.log('  📦 Button Rect:', {
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        centerX: Math.round(rect.left + rect.width / 2),
        centerY: Math.round(rect.top + rect.height / 2)
    });
    
    if (iconRect) {
        console.log('  🎯 Icon Rect:', {
            left: Math.round(iconRect.left),
            right: Math.round(iconRect.right),
            top: Math.round(iconRect.top),
            bottom: Math.round(iconRect.bottom),
            width: Math.round(iconRect.width),
            height: Math.round(iconRect.height),
            centerX: Math.round(iconCenterX),
            centerY: Math.round(iconCenterY)
        });
        console.log('  📏 Distancia icono desde borde izquierdo del botón:', Math.round(iconRect.left - rect.left), 'px');
        console.log('  📏 Distancia icono desde borde derecho del botón:', Math.round(rect.right - iconRect.right), 'px');
    } else {
        console.log('  ⚠️ No se encontró el icono dentro del botón');
    }
    
    console.log('  🌐 Espacios disponibles:');
    console.log('    Space Left:', Math.round(spaceLeft), 'px');
    console.log('    Space Right:', Math.round(spaceRight), 'px');
    console.log('    Window Width:', window.innerWidth, 'px');
    console.log('  📐 Tooltip estimado:');
    console.log('    Estimated Width:', estimatedTooltipWidth, 'px');
    
    // Decidir posición inicial basada en espacio disponible
    let initialLeft, initialTransform, finalLeft, finalTop;
    
    // 🎯 POSICIONAR DESDE EL BORDE DERECHO DEL ICONO (no desde el centro)
    // El tooltip debe estar alineado con el borde derecho del icono para quedar más cerca
    const tooltipOffsetFromIcon = 12; // Distancia entre el icono y el tooltip (en píxeles) - aumentado para que no quede tan arriba
    
    // Calcular posición vertical (arriba del icono)
    // Con translateY(-100%), el tooltip se posiciona desde su bottom, así que necesitamos calcular desde el top del icono
    // Restamos el offset para que quede arriba del icono con la distancia especificada
    const tooltipTop = iconRect ? (iconRect.top - tooltipOffsetFromIcon) : (rect.top - tooltipOffsetFromIcon);
    
    // Usar el borde IZQUIERDO o DERECHO del icono según la ubicación
    const iconLeftEdge = iconRect ? iconRect.left : rect.left;
    const iconRightEdge = iconRect ? iconRect.right : rect.right;
    
    // Si está en el board (paso del proceso), alinear a la derecha del icono
    if (isInBoard || isInBoardStage) {
        // Verificar si hay espacio suficiente a la derecha para el tooltip
        const gapFromIcon = 4; // Gap muy pequeño entre el icono y el tooltip
        
        if (spaceRight >= estimatedTooltipWidth + gapFromIcon) {
            // Si hay espacio suficiente, posicionar desde el borde derecho expandiéndose a la derecha
            initialLeft = (iconRightEdge + gapFromIcon) + 'px';
            initialTransform = 'translateY(-100%)';
            console.log('➡️ Estrategia BOARD: Desde borde derecho del icono +', gapFromIcon, 'px, expandiendo a la derecha');
        } else {
            // Si no hay espacio suficiente, posicionar desde el borde derecho expandiéndose a la izquierda
            initialLeft = iconRightEdge + 'px';
            initialTransform = 'translateX(-100%) translateY(-100%)';
            console.log('⬅️ Estrategia BOARD: Desde borde derecho del icono, expandiendo a la izquierda (poco espacio: ' + Math.round(spaceRight) + 'px disponible)');
        }
        console.log('  📍 Posición calculada:', Math.round(iconRightEdge + (spaceRight >= estimatedTooltipWidth + gapFromIcon ? gapFromIcon : 0)), 'px');
    } else {
        // Si está en el sidebar (lista de agentes), mantener alineado a la izquierda
        // Calcular posición horizontal basada en el borde izquierdo del icono
        // El tooltip debe estar alineado a la izquierda del elemento y expandirse hacia la derecha
        if (spaceRight >= 200) {
            // Si hay suficiente espacio a la derecha, posicionar desde el borde izquierdo del icono hacia la derecha
            initialLeft = iconLeftEdge + 'px';
            initialTransform = 'translateY(-100%)';
            console.log('✅ Estrategia SIDEBAR: Desde borde izquierdo del icono, expandiendo a la derecha');
        } else if (spaceLeft >= 200) {
            // Si hay más espacio a la izquierda, posicionar desde el borde izquierdo del icono expandiéndose a la izquierda
            initialLeft = iconLeftEdge + 'px';
            initialTransform = 'translateX(-100%) translateY(-100%)';
            console.log('⬅️ Estrategia SIDEBAR: Desde borde izquierdo del icono, expandiendo a la izquierda');
        } else {
            // Si hay poco espacio en ambos lados, priorizar expandir hacia la derecha desde el borde izquierdo
            if (spaceRight >= spaceLeft) {
                initialLeft = iconLeftEdge + 'px';
                initialTransform = 'translateY(-100%)';
                console.log('➡️ Estrategia SIDEBAR: Desde borde izquierdo del icono, expandiendo a la derecha (menos espacio disponible)');
            } else {
                initialLeft = iconLeftEdge + 'px';
                initialTransform = 'translateX(-100%) translateY(-100%)';
                console.log('⬅️ Estrategia SIDEBAR: Desde borde izquierdo del icono, expandiendo a la izquierda (menos espacio disponible)');
            }
        }
    }
    
    finalLeft = initialLeft;
    finalTop = tooltipTop + 'px';
    
    console.log('🎯 Posición calculada:');
    console.log('  left (initial):', finalLeft);
    console.log('  top:', finalTop);
    console.log('  transform:', initialTransform);
    console.log('  📏 Distancia vertical desde icono:', tooltipOffsetFromIcon, 'px');
    console.log('  📏 Posición vertical (centro icono):', iconRect ? Math.round(iconRect.top + iconRect.height / 2) : Math.round(rect.top + rect.height / 2), 'px');
    
    tooltip.style.left = finalLeft;
    tooltip.style.top = finalTop;
    tooltip.style.transform = initialTransform;
    
    // Asegurar que el tooltip use position fixed y no cause overflow
    tooltip.style.position = 'fixed';
    
    // Calcular el ancho máximo disponible según la dirección de expansión
    let tooltipMaxWidth = 400; // Ancho máximo por defecto
    
    if (isInBoard || isInBoardStage) {
        const leftPosition = parseFloat(finalLeft.replace('px', ''));
        
        if (initialTransform === 'translateY(-100%)') {
            // Si se expande hacia la derecha, calcular espacio disponible desde la posición left hasta el borde derecho
            const maxAvailableWidth = window.innerWidth - leftPosition - 12; // 12px de margen de seguridad
            tooltipMaxWidth = Math.min(400, Math.max(250, maxAvailableWidth));
            console.log('  📏 Ancho máximo del tooltip (expandiendo a la derecha):', Math.round(tooltipMaxWidth), 'px');
            console.log('    Espacio disponible desde left (', Math.round(leftPosition), 'px) hasta borde derecho:', Math.round(window.innerWidth - leftPosition), 'px');
        } else {
            // Si se expande hacia la izquierda (translateX(-100%)), calcular espacio disponible desde la izquierda
            const maxAvailableWidth = leftPosition - 12; // 12px de margen de seguridad
            tooltipMaxWidth = Math.min(400, Math.max(250, maxAvailableWidth));
            console.log('  📏 Ancho máximo del tooltip (expandiendo a la izquierda):', Math.round(tooltipMaxWidth), 'px');
            console.log('    Espacio disponible desde borde izquierdo hasta left (', Math.round(leftPosition), 'px):', Math.round(leftPosition), 'px');
        }
    }
    
    tooltip.style.maxWidth = tooltipMaxWidth + 'px';
    
    // Ajustar tooltip si se sale de la pantalla después de calcular su tamaño real
    setTimeout(() => {
        const tooltipRect = tooltip.getBoundingClientRect();
        
        console.log('📐 Tooltip tamaño real (después de renderizar):');
        console.log('  📦 Tooltip Rect:', {
            left: Math.round(tooltipRect.left),
            right: Math.round(tooltipRect.right),
            top: Math.round(tooltipRect.top),
            bottom: Math.round(tooltipRect.bottom),
            width: Math.round(tooltipRect.width),
            height: Math.round(tooltipRect.height),
            centerX: Math.round(tooltipRect.left + tooltipRect.width / 2),
            centerY: Math.round(tooltipRect.top + tooltipRect.height / 2)
        });
        
        // Calcular distancia desde el icono al tooltip
        if (iconRect) {
            const iconLeftEdge = iconRect.left;
            const iconRightEdge = iconRect.right;
            const iconVerticalCenter = iconRect.top + iconRect.height / 2;
            
            // Calcular distancia según la ubicación (board o sidebar)
            let horizontalDistance;
            if (isInBoard || isInBoardStage) {
                // En board: distancia desde el borde derecho del icono al borde izquierdo del tooltip
                horizontalDistance = Math.abs(tooltipRect.left - iconRightEdge);
                console.log('  📏 Distancia desde icono (BOARD):');
                console.log('    Horizontal (borde derecho icono a borde izquierdo tooltip):', Math.round(horizontalDistance), 'px');
            } else {
                // En sidebar: distancia desde el borde izquierdo del icono al borde izquierdo del tooltip
                horizontalDistance = Math.abs(tooltipRect.left - iconLeftEdge);
                console.log('  📏 Distancia desde icono (SIDEBAR):');
                console.log('    Horizontal (borde izquierdo icono a borde izquierdo tooltip):', Math.round(horizontalDistance), 'px');
            }
            
            // Calcular distancia vertical desde el centro del icono al centro del tooltip
            const tooltipVerticalCenter = tooltipRect.top + tooltipRect.height / 2;
            const verticalDistance = Math.abs(tooltipVerticalCenter - iconVerticalCenter);
            console.log('    Vertical (centro tooltip a centro icono):', Math.round(verticalDistance), 'px');
            console.log('    Distancia total estimada:', Math.round(Math.sqrt(horizontalDistance * horizontalDistance + verticalDistance * verticalDistance)), 'px');
        }
        
        // Verificar límites del viewport
        const overflowRight = tooltipRect.right - window.innerWidth;
        const overflowLeft = -tooltipRect.left;
        const overflowTop = -tooltipRect.top;
        const overflowBottom = tooltipRect.bottom - window.innerHeight;
        
        console.log('  🚨 Overflow detectado:');
        console.log('    Por la derecha:', overflowRight > 0 ? Math.round(overflowRight) + 'px' : '0px');
        console.log('    Por la izquierda:', overflowLeft > 0 ? Math.round(overflowLeft) + 'px' : '0px');
        console.log('    Por arriba:', overflowTop > 0 ? Math.round(overflowTop) + 'px' : '0px');
        console.log('    Por abajo:', overflowBottom > 0 ? Math.round(overflowBottom) + 'px' : '0px');
        
        // Asegurar que el tooltip no cause overflow horizontal en el body/html
        if (overflowRight > 0 && (isInBoard || isInBoardStage)) {
            // Si se sale por la derecha, reducir el max-width del tooltip o reposicionarlo
            const currentLeft = parseFloat(tooltip.style.left) || 0;
            const currentTransform = tooltip.style.transform;
            
            // Si está expandiéndose hacia la derecha, cambiar a expandirse hacia la izquierda
            if (currentTransform === 'translateY(-100%)') {
                const iconRightEdge = iconRect ? iconRect.right : rect.right;
                tooltip.style.left = iconRightEdge + 'px';
                tooltip.style.transform = 'translateX(-100%) translateY(-100%)';
                // Calcular nuevo max-width para expansión hacia la izquierda
                const newMaxWidth = Math.min(400, Math.max(250, iconRightEdge - 12));
                tooltip.style.maxWidth = newMaxWidth + 'px';
                console.log('  🔄 Reposicionando tooltip expandiéndose hacia la izquierda');
                console.log('  📏 Nuevo max-width:', Math.round(newMaxWidth), 'px');
            } else {
                // Si ya está expandiéndose hacia la izquierda, solo reducir el max-width
                const newMaxWidth = Math.max(250, window.innerWidth - currentLeft - 12);
                tooltip.style.maxWidth = newMaxWidth + 'px';
                console.log('  🔧 Ajustando max-width del tooltip para evitar overflow:', Math.round(newMaxWidth), 'px');
            }
        }
        
        let adjusted = false;
        let adjustmentReason = '';
        
        // Si no cabe arriba, mostrarlo abajo
        if (tooltipRect.top < 0) {
            const iconVerticalCenter = iconRect ? (iconRect.top + iconRect.height / 2) : (rect.top + rect.height / 2);
            const newTop = iconVerticalCenter + tooltipOffsetFromIcon; // Posicionar desde el centro vertical del icono hacia abajo
            tooltip.style.top = newTop + 'px';
            adjustmentReason = '⬇️ Movido abajo (no cabía arriba)';
            console.log(adjustmentReason);
            console.log('  Nueva posición top:', Math.round(newTop), 'px');
            // Mantener el ajuste horizontal según la ubicación (board o sidebar)
            if (isInBoard || isInBoardStage) {
                // En board: mantener alineado a la derecha del icono con gap pequeño
                const iconRightEdge = iconRect ? iconRect.right : rect.right;
                const gapFromIcon = 8;
                if (tooltipRect.right > window.innerWidth) {
                    // Si se sale por la derecha, posicionar desde el borde derecho expandiéndose a la izquierda
                    tooltip.style.left = iconRightEdge + 'px';
                    tooltip.style.transform = 'translateX(-100%) translateY(-100%)';
                    console.log('  ⬅️ Ajuste horizontal BOARD: Desde borde derecho expandiendo a la izquierda (se salía por la derecha)');
                } else {
                    // Mantener alineado con el borde derecho del icono + gap
                    const gapFromIcon = 4;
                    tooltip.style.left = (iconRightEdge + gapFromIcon) + 'px';
                    tooltip.style.transform = 'translateY(-100%)';
                    console.log('  📍 Ajuste horizontal BOARD: Alineado con borde derecho del icono +', gapFromIcon, 'px');
                }
            } else {
                // En sidebar: mantener alineado a la izquierda del icono
                const iconLeftEdge = iconRect ? iconRect.left : rect.left;
                if (tooltipRect.right > window.innerWidth) {
                    tooltip.style.left = iconLeftEdge + 'px';
                    tooltip.style.transform = 'translateX(-100%) translateY(-100%)';
                    console.log('  ⬅️ Ajuste horizontal SIDEBAR: Desde borde izquierdo del icono, expandiendo a la izquierda');
                } else if (tooltipRect.left < 0) {
                    tooltip.style.left = iconLeftEdge + 'px';
                    tooltip.style.transform = 'translateY(-100%)';
                    console.log('  ➡️ Ajuste horizontal SIDEBAR: Desde borde izquierdo del icono, expandiendo a la derecha');
                } else {
                    // Si hay espacio suficiente, mantener alineado con el borde izquierdo del icono
                    tooltip.style.left = iconLeftEdge + 'px';
                    tooltip.style.transform = 'translateY(-100%)'; // Solo ajuste vertical, alineado a la izquierda
                    console.log('  📍 Ajuste horizontal SIDEBAR: Alineado con borde izquierdo del icono');
                }
            }
            adjusted = true;
        }
        // Si se sale por la derecha, ajustar según la ubicación
        else if (tooltipRect.right > window.innerWidth) {
            if (isInBoard || isInBoardStage) {
                // En board: cuando se sale por la derecha, posicionar desde el borde derecho expandiéndose a la izquierda
                const iconRightEdge = iconRect ? iconRect.right : rect.right;
                tooltip.style.left = iconRightEdge + 'px';
                tooltip.style.transform = 'translateX(-100%) translateY(-100%)';
                adjustmentReason = '⬅️ Ajustado BOARD: Desde borde derecho expandiendo a la izquierda (se salía por la derecha)';
                console.log(adjustmentReason);
                console.log('  Posición aplicada (borde derecho icono):', Math.round(iconRightEdge), 'px');
                console.log('  Transform: translateX(-100%) translateY(-100%)');
            } else {
                // En sidebar: ajustar desde el borde izquierdo del icono hacia la izquierda
                const iconLeftEdge = iconRect ? iconRect.left : rect.left;
                const maxLeft = window.innerWidth - tooltipRect.width - 12;
                const preferredLeft = iconLeftEdge;
                const finalLeft = Math.max(12, Math.min(preferredLeft, maxLeft));
                tooltip.style.left = finalLeft + 'px';
                tooltip.style.transform = 'translateX(-100%) translateY(-100%)';
                adjustmentReason = '⬅️ Ajustado SIDEBAR a la izquierda (se salía por la derecha)';
                console.log(adjustmentReason);
                console.log('  Posición preferida (borde izquierdo icono):', Math.round(preferredLeft), 'px');
                console.log('  Posición final aplicada:', Math.round(finalLeft), 'px');
            }
            adjusted = true;
        }
        // Si se sale por la izquierda, ajustar según la ubicación
        else if (tooltipRect.left < 0) {
            if (isInBoard || isInBoardStage) {
                // En board: cuando se sale por la izquierda, intentar posicionar desde el borde derecho expandiéndose a la derecha
                const iconRightEdge = iconRect ? iconRect.right : rect.right;
                const gapFromIcon = 4;
                // Verificar si hay espacio a la derecha
                if (spaceRight >= estimatedTooltipWidth + gapFromIcon) {
                    tooltip.style.left = (iconRightEdge + gapFromIcon) + 'px';
                    tooltip.style.transform = 'translateY(-100%)';
                    adjustmentReason = '➡️ Ajustado BOARD: Desde borde derecho expandiendo a la derecha (se salía por la izquierda)';
                    console.log(adjustmentReason);
                    console.log('  Posición aplicada (borde derecho icono +', gapFromIcon, 'px):', Math.round(iconRightEdge + gapFromIcon), 'px');
                } else {
                    // Si no hay espacio, expandir hacia la izquierda
                    tooltip.style.left = iconRightEdge + 'px';
                    tooltip.style.transform = 'translateX(-100%) translateY(-100%)';
                    adjustmentReason = '⬅️ Ajustado BOARD: Desde borde derecho expandiendo a la izquierda (poco espacio disponible)';
                    console.log(adjustmentReason);
                    console.log('  Posición aplicada (borde derecho icono):', Math.round(iconRightEdge), 'px');
                }
            } else {
                // En sidebar: ajustar desde el borde izquierdo del icono hacia la derecha
                const iconLeftEdge = iconRect ? iconRect.left : rect.left;
                const maxRight = window.innerWidth - tooltipRect.width - 12;
                const preferredLeft = iconLeftEdge;
                const finalLeft = Math.max(12, Math.min(preferredLeft, maxRight));
                tooltip.style.left = finalLeft + 'px';
                tooltip.style.transform = 'translateY(-100%)';
                adjustmentReason = '➡️ Ajustado SIDEBAR a la derecha (se salía por la izquierda)';
                console.log(adjustmentReason);
                console.log('  Posición preferida (borde izquierdo icono):', Math.round(preferredLeft), 'px');
                console.log('  Posición final aplicada:', Math.round(finalLeft), 'px');
            }
            adjusted = true;
        }
        
        // Ajustar verticalmente si se sale por abajo
        if (tooltipRect.bottom > window.innerHeight) {
            const newTop = window.innerHeight - tooltipRect.height - 4;
            tooltip.style.top = newTop + 'px';
            console.log('⬆️ Ajuste: Movido arriba (se salía por abajo)');
            console.log('  Nueva posición top:', Math.round(newTop), 'px');
            // Mantener ajuste horizontal basado en el borde IZQUIERDO del icono (alineado a la izquierda)
            const iconLeftEdge = iconRect ? iconRect.left : rect.left;
            const currentTransform = tooltip.style.transform;
            if (currentTransform.includes('translateX(-100%)')) {
                tooltip.style.left = iconLeftEdge + 'px';
                tooltip.style.transform = 'translateX(-100%) translateY(-100%)';
            } else {
                // Si no hay translateX(-100%), expander hacia la derecha desde el borde izquierdo del icono
                tooltip.style.left = iconLeftEdge + 'px';
                tooltip.style.transform = 'translateY(-100%)';
            }
            adjusted = true;
        }
        
        // Log final con posición final del tooltip
        const finalTooltipRect = tooltip.getBoundingClientRect();
        console.log('🎯 Posición FINAL del tooltip:');
        console.log('  📦 Final Tooltip Rect:', {
            left: Math.round(finalTooltipRect.left),
            right: Math.round(finalTooltipRect.right),
            top: Math.round(finalTooltipRect.top),
            bottom: Math.round(finalTooltipRect.bottom),
            width: Math.round(finalTooltipRect.width),
            height: Math.round(finalTooltipRect.height),
            centerX: Math.round(finalTooltipRect.left + finalTooltipRect.width / 2),
            centerY: Math.round(finalTooltipRect.top + finalTooltipRect.height / 2)
        });
        
        if (iconRect) {
            const iconLeftEdge = iconRect.left;
            const iconRightEdge = iconRect.right;
            const iconVerticalCenter = iconRect.top + iconRect.height / 2;
            
            // Calcular distancia según la ubicación (board o sidebar)
            let finalHorizontalDistance;
            if (isInBoard || isInBoardStage) {
                // En board: distancia desde el borde derecho del icono al borde izquierdo del tooltip
                finalHorizontalDistance = Math.abs(finalTooltipRect.left - iconRightEdge);
                console.log('  📏 Distancia FINAL desde icono (BOARD):');
                console.log('    Horizontal (borde derecho icono a borde izquierdo tooltip):', Math.round(finalHorizontalDistance), 'px');
            } else {
                // En sidebar: distancia desde el borde izquierdo del icono al borde izquierdo del tooltip
                finalHorizontalDistance = Math.abs(finalTooltipRect.left - iconLeftEdge);
                console.log('  📏 Distancia FINAL desde icono (SIDEBAR):');
                console.log('    Horizontal (borde izquierdo icono a borde izquierdo tooltip):', Math.round(finalHorizontalDistance), 'px');
            }
            
            // Calcular distancia vertical desde el centro del icono al centro del tooltip
            const finalTooltipVerticalCenter = finalTooltipRect.top + finalTooltipRect.height / 2;
            const finalVerticalDistance = Math.abs(finalTooltipVerticalCenter - iconVerticalCenter);
            console.log('    Vertical (centro tooltip a centro icono):', Math.round(finalVerticalDistance), 'px');
            console.log('    Distancia total:', Math.round(Math.sqrt(finalHorizontalDistance * finalHorizontalDistance + finalVerticalDistance * finalVerticalDistance)), 'px');
        }
        
        console.log('  🎨 Estilos aplicados:');
        console.log('    left:', tooltip.style.left);
        console.log('    top:', tooltip.style.top);
        console.log('    transform:', tooltip.style.transform);
        
        if (adjusted) {
            console.log('✅ Tooltip ajustado correctamente');
            if (adjustmentReason) {
                console.log('  Razón:', adjustmentReason);
            }
        } else {
            console.log('✅ Tooltip posicionado correctamente sin ajustes');
        }
        
        console.log('🔍 Tooltip Positioning Debug - FIN');
    }, 0);
}

function handleAgentInfoLeave(e) {
    const tooltip = document.getElementById('tooltip');
    if (!tooltip) return;
    
    tooltip.style.opacity = '0';
    tooltip.classList.remove('agent-info-tooltip');
    tooltip.style.transform = '';
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
    // Si NO es reordenamiento del board, dejar que el evento se propague
    // para que el board-container lo maneje (agentes/etapas desde columna izquierda)
    if (!draggedBoardStage) {
        // NO hacer preventDefault() - dejar que llegue al board-container
        return;
    }
    
    // SOLO si es reordenamiento del board, prevenir y manejar
    e.preventDefault();
    e.stopPropagation();
    
    const targetItem = e.target.closest('.stage-item');
    if (!targetItem) return;
    
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
    // Solo restaurar si estamos reordenando etapas del board
    if (!draggedBoardStage) return;
    
    const targetItem = e.target.closest('.stage-item');
    if (!targetItem) return;
    
    // Restaurar estilos originales (aunque ya no los modificamos)
    targetItem.style.background = '';
    targetItem.style.borderColor = '';
}

function handleBoardStageDrop(e) {
    // Si NO es reordenamiento del board, dejar que el evento se propague
    // para que el board-container lo maneje
    if (!draggedBoardStage) {
        // NO hacer preventDefault() - dejar que llegue al board-container
        return;
    }
    
    // SOLO si es reordenamiento, prevenir y manejar
    e.preventDefault();
    e.stopPropagation();
    
    const targetItem = e.target.closest('.stage-item');
    if (!targetItem) return;
    
    // Restaurar estilos
    targetItem.style.background = '';
    targetItem.style.borderColor = '';
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
        type: 'custom',
        description: ''
    };
    
    currentTemplate.realContent.stages.push(newStage);
    markAsUnsaved();
    renderEditor();
}

window.moveStageUp = function(stageId) {
    const stages = currentTemplate.realContent.stages;
    const currentIndex = stages.findIndex(s => s.id === stageId);
    
    if (currentIndex <= 0) return; // Ya está en la primera posición
    
    // Intercambiar con la etapa anterior
    [stages[currentIndex - 1], stages[currentIndex]] = [stages[currentIndex], stages[currentIndex - 1]];
    
    // Re-renderizar
    renderStages();
    
    // Marcar como cambios sin guardar
    markAsUnsaved();
    
    // Cerrar menús
    closeStageMenus();
}

window.moveStageDown = function(stageId) {
    const stages = currentTemplate.realContent.stages;
    const currentIndex = stages.findIndex(s => s.id === stageId);
    
    if (currentIndex < 0 || currentIndex >= stages.length - 1) return; // Ya está en la última posición
    
    // Intercambiar con la etapa siguiente
    [stages[currentIndex], stages[currentIndex + 1]] = [stages[currentIndex + 1], stages[currentIndex]];
    
    // Re-renderizar
    renderStages();
    
    // Marcar como cambios sin guardar
    markAsUnsaved();
    
    // Cerrar menús
    closeStageMenus();
}

function editStageName(stageId) {
    const stage = currentTemplate.realContent.stages.find(s => s.id === stageId);
    if (!stage) return;
    
    // Solo mostrar campo de descripción para etapas personalizadas (custom)
    const fields = [
        {
            id: 'stageName',
            label: 'Nombre de la etapa',
            type: 'text',
            placeholder: 'Ej: Entrevista técnica',
            required: true,
            maxLength: 50,
            size: 'md',
            value: stage.name
        },
        {
            id: 'stageCategory',
            label: 'Categoría',
            type: 'select',
            required: true,
            size: 'md',
            selectOptions: STAGE_CATEGORIES.map(cat => ({
                value: cat.id,
                text: cat.name
            })),
            value: stage.category
        }
    ];
    
    // Añadir campo de descripción solo para etapas custom
    if (stage.type === 'custom') {
        fields.push({
            id: 'stageDescription',
            label: 'Descripción (opcional)',
            type: 'textarea',
            placeholder: 'Describe brevemente esta etapa y qué implica...',
            required: false,
            maxLength: 500,
            size: 'md',
            value: stage.description || ''
        });
    }
    
    // CRITICAL: Establecer callback ANTES de abrir el modal
    window.modalFormCallback = function(formData) {
        const { stageName, stageCategory, stageDescription } = formData;
        
        console.log('Editando etapa con formData:', formData);
        console.log('Stage actual antes:', stage);
        
        if (stageName && stageName.trim()) {
            stage.name = stageName.trim();
            stage.category = stageCategory;
            
            // Actualizar descripción solo si es etapa custom
            if (stage.type === 'custom') {
                stage.description = stageDescription?.trim() || '';
                console.log('Descripción guardada:', stage.description);
            }
            
            // Si tiene templateId, también actualizar en availableStages
            if (stage.templateId) {
                const templateStage = availableStages.find(s => s.id === stage.templateId);
                if (templateStage) {
                    templateStage.name = stageName.trim();
                    templateStage.category = stageCategory;
                    if (templateStage.type === 'custom') {
                        templateStage.description = stageDescription?.trim() || '';
                    }
                    saveAvailableStages();
                }
            }
            
            markAsUnsaved();
            renderEditor();
            
            showToast('success', 'Etapa actualizada exitosamente');
        }
    };
    
    showFormModal({
        title: 'Editar etapa',
        fields: fields,
        submitText: 'Guardar cambios',
        cancelText: 'Cancelar',
        onSubmit: function(formData) {
            window.modalFormCallback(formData);
        },
        onCancel: function() {
            console.log('Modal de edición cancelado');
        }
    });
}

// FUNCIÓN OBSOLETA: Ya no se usan selectores para agregar agentes a etapas
// Los agentes ahora se arrastran y crean etapas independientes
window.addAgentFromSelector = function(stageId, agentId) {
    console.warn('addAgentFromSelector() está obsoleta. Los agentes ahora son etapas independientes.');
    return;
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
        title: 'Quitar etapa',
        message: `¿Estás seguro de que quieres quitar la etapa "${stage.name}" del flujo?`,
        confirmText: 'Quitar etapa',
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

// FUNCIÓN OBSOLETA: Los agentes ya no se agregan dentro de etapas
// Ahora los agentes son etapas independientes (tipo 'agent')
function addAgentToStage(stageId, agentId) {
    // Esta función ya no se usa en el nuevo sistema
    console.warn('addAgentToStage() está obsoleta. Los agentes ahora son etapas independientes.');
    return;
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
        if (field.type === 'number') {
            agent.config[configKey] = parseFloat(value) || 0;
        } else if (field.type === 'radio') {
            agent.config[configKey] = value;
        } else {
            agent.config[configKey] = value;
        }
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
        // El icono de configuración se mantiene igual (fa-gear)
        // Mostrar divider
        if (header) {
            header.style.borderBottom = '1px solid var(--ubits-border-1)';
            header.style.paddingBottom = '8px';
        }
        // Guardar estado
        agentConfigStates[stageId] = 'expanded';
    } else {
        // Contraer
        configDiv.style.display = 'none';
        // El icono de configuración se mantiene igual (fa-gear)
        // Ocultar divider
        if (header) {
            header.style.borderBottom = 'none';
            header.style.paddingBottom = '0';
        }
        // Guardar estado
        agentConfigStates[stageId] = 'collapsed';
    }
}

// ========================================
// GESTIÓN DE ETAPAS
// ========================================

function loadAvailableStages() {
    console.log('🔧 [loadAvailableStages] Iniciando carga de etapas...');
    const stored = localStorage.getItem('availableStages');
    
    if (stored) {
        const parsedStages = JSON.parse(stored);
        console.log('🔧 [loadAvailableStages] Etapas encontradas en localStorage:', parsedStages.length);
        
        // IDs de etapas por defecto que ya no deben existir (eliminadas)
        const removedDefaultStageIds = [
            'default-pre-filter-salary',
            'default-pre-filter-availability',
            'default-interview-culture',
            'default-verify-employment'
        ];
        
        // IDs de etapas por defecto actuales que deben existir
        const currentDefaultStageIds = DEFAULT_STAGES.map(s => s.id);
        
        // Filtrar etapas: eliminar las que ya no deben existir y las personalizadas
        const customStages = parsedStages.filter(s => !s.isDefault);
        const validDefaultStages = parsedStages.filter(s => 
            s.isDefault && 
            !removedDefaultStageIds.includes(s.id) && 
            currentDefaultStageIds.includes(s.id)
        );
        
        // Identificar etapas por defecto que faltan
        const existingDefaultIds = validDefaultStages.map(s => s.id);
        const missingDefaultIds = currentDefaultStageIds.filter(id => !existingDefaultIds.includes(id));
        
        // Verificar si hay etapas obsoletas que eliminar
        const hasObsoleteStages = parsedStages.some(s => 
            s.isDefault && removedDefaultStageIds.includes(s.id)
        );
        
        // Si faltan etapas por defecto o hay etapas obsoletas, actualizar
        if (missingDefaultIds.length > 0 || hasObsoleteStages || parsedStages.length !== (validDefaultStages.length + customStages.length)) {
            if (missingDefaultIds.length > 0) {
                console.log('⚠️ [loadAvailableStages] Faltan etapas por defecto:', missingDefaultIds.length);
            }
            if (hasObsoleteStages) {
                console.log('🔄 [loadAvailableStages] Eliminando etapas obsoletas...');
            }
            
            // Agregar las etapas por defecto que faltan
            const missingDefaultStages = missingDefaultIds.length > 0 
                ? DEFAULT_STAGES.filter(s => missingDefaultIds.includes(s.id))
                : [];
            
            // Combinar: nuevas etapas por defecto + etapas válidas existentes + etapas personalizadas
            availableStages = [...missingDefaultStages, ...validDefaultStages, ...customStages];
            saveAvailableStages();
            console.log('✅ [loadAvailableStages] Etapas actualizadas. Total:', availableStages.length);
        } else {
            availableStages = parsedStages;
            console.log('✅ [loadAvailableStages] Todas las etapas están actualizadas. Total:', availableStages.length);
        }
    } else {
        // Si no hay etapas guardadas, usar las por defecto
        console.log('✅ [loadAvailableStages] No hay etapas en localStorage, inicializando con etapas por defecto...');
        availableStages = [...DEFAULT_STAGES];
        saveAvailableStages();
        console.log('✅ [loadAvailableStages] Etapas por defecto inicializadas. Total:', availableStages.length);
    }
    
    console.log('🔧 [loadAvailableStages] Carga completada. availableStages.length:', availableStages.length);
}

function saveAvailableStages() {
    console.log('💾 [saveAvailableStages] Guardando etapas:', availableStages.length);
    localStorage.setItem('availableStages', JSON.stringify(availableStages));
    
    // Verificar que se guardó correctamente
    const stored = localStorage.getItem('availableStages');
    if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length !== availableStages.length) {
            console.error('❌ [saveAvailableStages] ERROR: Las etapas no se guardaron correctamente');
            console.error('   Esperado:', availableStages.length, 'Guardado:', parsed.length);
        } else {
            console.log('✅ [saveAvailableStages] Etapas guardadas correctamente');
        }
    }
}

function generateStageId() {
    return 'stage-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
}

function openCreateStageModal() {
    console.log('openCreateStageModal llamada');
    console.log('availableStages actual:', availableStages);
    
    // CRITICAL: Establecer callback ANTES de abrir el modal
    window.modalFormCallback = function(formData) {
        console.log('modalFormCallback llamado con formData:', formData);
        try {
            createStageTemplate(formData);
        } catch (error) {
            console.error('Error al crear etapa:', error);
            showToast('error', 'Error al crear la etapa: ' + error.message);
        }
    };
    
    showFormModal({
        title: 'Crear nueva etapa',
        message: 'Las etapas personalizadas son procesos manuales que puedes usar para organizar tu flujo de selección',
        fields: [
            {
                id: 'stageName',
                label: 'Nombre de la etapa',
                type: 'text',
                placeholder: 'Ej: Entrevista técnica',
                required: true,
                maxLength: 50,
                size: 'md'
            },
            {
                id: 'stageCategory',
                label: 'Categoría',
                type: 'select',
                required: true,
                size: 'md',
                placeholder: 'Selecciona una categoría',
                selectOptions: STAGE_CATEGORIES.map(cat => ({
                    value: cat.id,
                    text: cat.name
                }))
            },
            {
                id: 'stageDescription',
                label: 'Descripción (opcional)',
                type: 'textarea',
                placeholder: 'Describe brevemente esta etapa y qué implica...',
                required: false,
                maxLength: 500,
                size: 'md'
            }
        ],
        submitText: 'Crear etapa',
        cancelText: 'Cancelar',
        onSubmit: function(formData) {
            window.modalFormCallback(formData);
        },
        onCancel: function() {
            console.log('Modal cancelado');
        }
    });
}

// Exportar función al objeto window
window.openCreateStageModal = openCreateStageModal;

function createStageTemplate(formData) {
    const { stageName, stageCategory, stageDescription } = formData;
    
    console.log('createStageTemplate llamada con:', formData);
    
    // Validar que el nombre no esté vacío
    if (!stageName || !stageName.trim()) {
        console.error('Nombre vacío');
        showToast('error', 'El nombre de la etapa es obligatorio');
        return;
    }
    
    // Validar que el nombre no esté duplicado
    const existingStage = availableStages.find(stage => 
        stage.name.toLowerCase() === stageName.toLowerCase()
    );
    
    if (existingStage) {
        console.error('Nombre duplicado');
        showToast('error', 'Ya existe una etapa con ese nombre');
        return;
    }
    
    // Crear nueva etapa personalizada (tipo 'custom')
    const newStage = {
        id: generateStageId(),
        name: stageName.trim(),
        category: stageCategory,
        type: 'custom',
        description: stageDescription?.trim() || '',
        createdAt: new Date().toISOString()
    };
    
    console.log('Nueva etapa creada:', newStage);
    
    // Agregar a la lista de etapas disponibles
    availableStages.push(newStage);
    
    // Guardar en localStorage
    saveAvailableStages();
    
    // Re-renderizar la lista de etapas
    renderAvailableStages();
    
    // Marcar como cambios sin guardar
    markAsUnsaved();
    
    // Mostrar toast de éxito
    showToast('success', `Etapa "${stageName}" creada exitosamente`);
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
                size: 'md',
                value: stage.name
            },
            {
                id: 'stageCategory',
                label: 'Categoría',
                type: 'select',
                required: true,
                size: 'md',
                selectOptions: STAGE_CATEGORIES.map(cat => ({
                    value: cat.id,
                    text: cat.name
                })),
                value: stage.category
            },
            {
                id: 'stageDescription',
                label: 'Descripción (opcional)',
                type: 'textarea',
                placeholder: 'Describe brevemente esta etapa y qué implica...',
                required: false,
                maxLength: 500,
                size: 'md',
                value: stage.description || ''
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
    const { stageName, stageCategory, stageDescription } = formData;
    
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
        description: stageDescription?.trim() || '',
        updatedAt: new Date().toISOString()
    };
    
    // Guardar en localStorage
    saveAvailableStages();
    
    // Re-renderizar la lista de etapas
    renderAvailableStages();
    
    // También actualizar en el board si existe
    currentTemplate.realContent.stages.forEach(boardStage => {
        if (boardStage.templateId === stageId) {
            boardStage.name = stageName.trim();
            boardStage.category = stageCategory;
            boardStage.description = stageDescription?.trim() || '';
        }
    });
    
    // Re-renderizar el board
    renderStages();
    
    // Marcar como cambios sin guardar
    markAsUnsaved();
}

function deleteStageTemplate(stageId) {
    console.log('🗑️ [deleteStageTemplate] Iniciando eliminación de etapa:', stageId);
    
    const stage = availableStages.find(s => s.id === stageId);
    if (!stage) {
        console.error('❌ [deleteStageTemplate] Etapa no encontrada:', stageId);
        if (typeof showToast === 'function') {
            showToast('error', 'Etapa no encontrada');
        }
        return;
    }
    
    console.log('🔍 [deleteStageTemplate] Etapa encontrada:', stage.name);
    
    // Verificar si la etapa está siendo usada en una plantilla activa
    const templates = JSON.parse(localStorage.getItem('templates') || '[]');
    const activeTemplates = templates.filter(t => t.status === 'available');
    
    // Buscar si alguna plantilla activa usa esta etapa
    const isUsedInActiveTemplate = activeTemplates.some(template => {
        if (template.realContent && template.realContent.stages) {
            return template.realContent.stages.some(s => s.templateId === stageId);
        }
        return false;
    });
    
    if (isUsedInActiveTemplate) {
        console.log('⚠️ [deleteStageTemplate] Etapa en uso en plantilla activa');
        // Mostrar modal de advertencia
        showConfirmModal({
            title: 'No se puede eliminar',
            message: `Esta etapa no se puede borrar porque se está usando en una vacante activa.`,
            confirmText: 'Entendido',
            cancelText: null,
            variant: 'primary',
            singleButton: true,
            onConfirm: () => {
                // Solo cerrar el modal
            }
        });
        return;
    }
    
    console.log('✅ [deleteStageTemplate] Etapa no está en uso, procediendo con eliminación');
    
    // Si no está en uso, proceder con la confirmación normal
    showConfirmModal({
        title: 'Eliminar etapa',
        message: `¿Estás seguro de que quieres eliminar la etapa "${stage.name}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        variant: 'error',
        onConfirm: () => {
            console.log('✅ [deleteStageTemplate] Usuario confirmó eliminación');
            confirmDeleteStageTemplate(stageId);
        },
        onCancel: () => {
            console.log('❌ [deleteStageTemplate] Usuario canceló eliminación');
        }
    });
}

// Exponer función globalmente para acceso desde HTML
window.deleteStageTemplate = deleteStageTemplate;

function confirmDeleteStageTemplate(stageId) {
    const stage = availableStages.find(s => s.id === stageId);
    if (!stage) {
        console.error('❌ [confirmDeleteStageTemplate] Etapa no encontrada:', stageId);
        if (typeof showToast === 'function') {
            showToast('error', 'Etapa no encontrada');
        }
        return;
    }
    
    // Prevenir eliminación de etapas por defecto
    if (stage.isDefault) {
        console.warn('⚠️ [confirmDeleteStageTemplate] Intento de eliminar etapa por defecto:', stage.name);
        if (typeof showToast === 'function') {
            showToast('warning', 'No se pueden eliminar las etapas por defecto. Se restaurarán automáticamente al recargar la página.');
        }
        // Aún así, permitir eliminación temporal pero se restaurarán al recargar
    }
    
    console.log('🗑️ [confirmDeleteStageTemplate] Eliminando etapa:', stageId, stage.name);
    console.log('🔍 [confirmDeleteStageTemplate] availableStages antes:', availableStages.length);
    
    // Remover de la lista de etapas disponibles
    availableStages = availableStages.filter(s => s.id !== stageId);
    
    console.log('🔍 [confirmDeleteStageTemplate] availableStages después:', availableStages.length);
    
    // Guardar en localStorage
    saveAvailableStages();
    
    // Verificar que se guardó correctamente
    const stored = localStorage.getItem('availableStages');
    if (stored) {
        const parsed = JSON.parse(stored);
        console.log('✅ [confirmDeleteStageTemplate] Verificación - etapas guardadas en localStorage:', parsed.length);
        if (parsed.length !== availableStages.length) {
            console.error('❌ [confirmDeleteStageTemplate] INCONSISTENCIA: Las etapas no se guardaron correctamente');
            console.error('   Esperado:', availableStages.length, 'Guardado:', parsed.length);
            // Forzar guardado de nuevo
            localStorage.setItem('availableStages', JSON.stringify(availableStages));
            console.log('🔄 [confirmDeleteStageTemplate] Reintentando guardado...');
        }
    }
    
    // Re-renderizar la lista de etapas
    renderAvailableStages();
    
    // Marcar como cambios sin guardar
    markAsUnsaved();
    
    // Mostrar toast de éxito (o advertencia si es por defecto)
    if (typeof showToast === 'function') {
        if (stage.isDefault) {
            showToast('info', `Etapa "${stage.name}" eliminada temporalmente. Se restaurará al recargar la página.`);
        } else {
            showToast('success', `Etapa "${stage.name}" eliminada correctamente`);
        }
    }
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
    
    // Si la plantilla está disponible, mostrar modal de confirmación
    if (currentTemplate.status === 'available') {
        showSaveAvailableTemplateModal();
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
    
    // Guardar con estado 'draft' (borrador)
    currentTemplate.status = 'draft';
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

// Función para mostrar modal de guardar plantilla disponible
function showSaveAvailableTemplateModal() {
    if (!currentTemplate) return;
    
    const message = `<p style="margin: 0 0 16px 0; font-family: 'Noto Sans', sans-serif; font-size: 14px; line-height: 20px; color: var(--ubits-fg-1-high);">Estás actualizando una plantilla que ya se está usando en vacantes activas.</p>
<ul style="margin: 0 0 16px 0; padding-left: 20px; list-style-type: disc; font-family: 'Noto Sans', sans-serif; font-size: 14px; line-height: 20px; color: var(--ubits-fg-1-high);">
    <li style="margin-bottom: 8px;">Los cambios no se aplicarán a las vacantes creadas antes de esta edición.</li>
    <li style="margin-bottom: 8px;">Los cambios solo se verán en las nuevas vacantes que crees usando esta plantilla.</li>
    <li style="margin-bottom: 8px;">Las vacantes que ya usan esta plantilla quedarán con la plantilla seleccionada marcada como "Desactualizada", para indicar que existe una versión más reciente.</li>
</ul>
<p style="margin: 0; font-family: 'Noto Sans', sans-serif; font-size: 14px; line-height: 20px; color: var(--ubits-fg-1-high);">Así protegemos la información y los datos ya recolectados en los procesos actuales.</p>`;
    
    showConfirmModal({
        title: 'Guardar cambios en plantilla en uso',
        message: message,
        confirmText: 'Guardar plantilla',
        cancelText: 'Cancelar',
        variant: 'primary',
        onConfirm: () => {
            // Proceder con el guardado
            console.log('Saving available template:', currentTemplate);
            
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
            
            // Mantener estado 'available' (no cambiar a 'draft')
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
            
            // Actualizar UI para reflejar los cambios
            updateTemplateInfo();
            
            // Mostrar toast de éxito
            if (typeof showToast === 'function') {
                showToast('success', 'Plantilla guardada exitosamente');
            } else {
                alert('Plantilla guardada exitosamente');
            }
        },
        onCancel: () => {
            // No hacer nada, solo cerrar el modal
        }
    });
}

// Terminar plantilla (marcar como disponible)
function finishTemplate() {
    console.log('finishTemplate() called');
    
    // Verificar que currentTemplate existe
    if (!currentTemplate) {
        console.log('No currentTemplate found');
        alert('Error: No hay plantilla para terminar');
        return;
    }
    
    // Mostrar modal explicativo antes de terminar
    if (typeof showConfirmModal === 'function') {
        showConfirmModal({
            title: 'Terminar plantilla',
            message: `<p style="margin: 0 0 16px 0; font-family: 'Noto Sans', sans-serif; font-size: 14px; line-height: 20px; color: var(--ubits-fg-1-high);">Una vez que termines esta plantilla, quedará disponible para que puedas usarla en la creación de vacantes.</p>
                     <p style="margin: 0; font-family: 'Noto Sans', sans-serif; font-size: 14px; line-height: 20px; color: var(--ubits-fg-1-medium);">Podrás seleccionarla desde el selector de plantillas al configurar una nueva vacante.</p>`,
            confirmText: 'Terminar plantilla',
            cancelText: 'Cancelar',
            variant: 'primary',
            onConfirm: () => {
                // Proceder a terminar la plantilla
                confirmFinishTemplate();
            },
            onCancel: () => {
                console.log('Terminación de plantilla cancelada');
            }
        });
    } else {
        // Si no hay showConfirmModal disponible, usar confirm nativo
        if (confirm('Una vez que termines esta plantilla, quedará disponible para que puedas usarla en la creación de vacantes.\n\n¿Deseas continuar?')) {
            confirmFinishTemplate();
        }
    }
}

// Función que ejecuta la lógica de terminar la plantilla
function confirmFinishTemplate() {
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
    
    // Guardar con estado 'available' (disponible)
    currentTemplate.status = 'available';
    currentTemplate.lastModified = new Date().toISOString().split('T')[0];
    
    // Guardar en localStorage
    const stored = localStorage.getItem('templates');
    let templates = stored ? JSON.parse(stored) : [];
    
    const existingIndex = templates.findIndex(t => t.id === currentTemplate.id);
    if (existingIndex !== -1) {
        templates[existingIndex] = currentTemplate;
    } else {
        templates.unshift(currentTemplate);
    }
    
    localStorage.setItem('templates', JSON.stringify(templates));
    console.log('Template finished and saved to localStorage');
    
    // Marcar que no hay cambios sin guardar
    markAsSaved();
    
    // Mostrar toast de éxito
    if (typeof showToast === 'function') {
        showToast('success', 'Plantilla terminada exitosamente');
    } else {
        alert('Plantilla terminada exitosamente');
    }
    
    // Redirigir al home después de un breve delay para que se vea el toast
    setTimeout(() => {
        goToDashboard();
    }, 500);
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
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    console.log('Mostrando modal de confirmación...');
    
    // Usar setTimeout para evitar conflictos con otros event listeners
    setTimeout(() => {
        // Mostrar modal UBITS
        const modal = showConfirmModal({
            title: 'Cambios sin guardar',
            message: 'Tienes cambios sin guardar. ¿Qué deseas hacer?',
            confirmText: 'Guardar',
            cancelText: 'Salir sin guardar',
            variant: 'primary',
            onConfirm: () => {
                console.log('Usuario eligió guardar');
                // Guardar la plantilla
                saveTemplate();
                // Marcar como guardado
                hasUnsavedChanges = false;
                // Ir al dashboard después de guardar
                setTimeout(() => {
                    goToDashboard();
                }, 300);
            },
            onCancel: () => {
                console.log('Usuario eligió salir sin guardar - guardando automáticamente como borrador');
                
                // Guardar automáticamente con estado draft antes de salir
                if (currentTemplate) {
                    // Verificar que realContent existe
                    if (!currentTemplate.realContent) {
                        currentTemplate.realContent = { stages: [] };
                    }
                    
                    // Actualizar contadores
                    currentTemplate.stages = currentTemplate.realContent.stages.length;
                    currentTemplate.agents = currentTemplate.realContent.stages.reduce((total, stage) => {
                        return total + (stage.agents ? stage.agents.length : 0);
                    }, 0);
                    
                    // Guardar con estado 'draft' (borrador)
                    currentTemplate.status = 'draft';
                    currentTemplate.lastModified = new Date().toISOString().split('T')[0];
                    
                    // Guardar en localStorage
                    const stored = localStorage.getItem('templates');
                    let templates = stored ? JSON.parse(stored) : [];
                    
                    const existingIndex = templates.findIndex(t => t.id === currentTemplate.id);
                    if (existingIndex !== -1) {
                        templates[existingIndex] = currentTemplate;
                    } else {
                        templates.unshift(currentTemplate);
                    }
                    
                    localStorage.setItem('templates', JSON.stringify(templates));
                    console.log('Template guardado automáticamente como borrador');
                }
                
                hasUnsavedChanges = false;
                goToDashboard();
            }
        });
        
        console.log('Modal creado:', modal);
    }, 10);
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
// FUNCIONES PARA AGENTES (ETAPAS AUTOMATIZADAS)
// ========================================

window.toggleAgentMenu = function(event, agentId) {
    event.stopPropagation();
    
    const menu = document.getElementById(`agent-menu-${agentId}`);
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

window.addAgentToFlowFromMenu = function(agentId) {
    console.log('\n🤖 AÑADIENDO AGENTE AL FLUJO:', agentId);
    
    // Buscar datos completos del agente
    const agentData = AGENTS.find(a => a.id === agentId);
    if (!agentData) return;
    
    // Verificar que este agente no esté ya en el flujo
    const existingAgentStage = currentTemplate.realContent.stages.find(stage => 
        stage.type === 'agent' && stage.agentId === agentId
    );
    
    if (existingAgentStage) {
        showToast('info', 'Este agente ya está en el flujo');
        closeStageMenus();
        return;
    }
    
    // Crear configuración por defecto del agente si tiene config
    let defaultConfig = {};
    if (agentData.hasConfig && agentData.config) {
        Object.entries(agentData.config).forEach(([key, field]) => {
            if (key === 'tests' && field.type === 'psychometric-tests-manager') {
                // Para analista psicométrico, inicializar con array vacío
                defaultConfig[key] = [];
            } else {
                defaultConfig[key] = field.default;
            }
        });
    }

    // Crear nueva etapa tipo 'agent'
    const newAgentStage = {
        id: 'agent-stage-' + Date.now(),
        type: 'agent',
        agentId: agentId,
        name: agentData.name,
        icon: agentData.icon,
        category: agentData.category,
        hasConfig: agentData.hasConfig,
        config: defaultConfig,
        expanded: false
    };
    
    // Log antes de añadir
    const stagesContainerBefore = document.getElementById('stagesContainer');
    if (stagesContainerBefore) {
        const rectBefore = stagesContainerBefore.getBoundingClientRect();
        console.log('  📦 ANTES de añadir agente:');
        console.log('    stagesContainer width:', Math.round(rectBefore.width), 'px');
        console.log('    stagesContainer scrollWidth:', stagesContainerBefore.scrollWidth, 'px');
        console.log('    stagesContainer clientWidth:', stagesContainerBefore.clientWidth, 'px');
    }
    
    // Fijar el ancho ANTES de agregar el agente para evitar expansión temporal
    fixBoardContainerWidth();
    
    // Agregar al final del flujo
    currentTemplate.realContent.stages.push(newAgentStage);
    
    // Actualizar agentes disponibles
    updateAvailableAgents();
    
    // Re-renderizar todo
    renderEditor();
    
    // Si es analista psicométrico, abrir drawer automáticamente
    if (agentId === 'psychometric-analyst') {
        setTimeout(() => {
            openPsychometricTestsDrawer(newAgentStage.id);
            // Mostrar vista de creación automáticamente
            showCreateTestView();
        }, 300);
    }
    
    // Si es entrevista Serena, abrir drawer de configuración automáticamente
    if (agentId === 'interview-ia') {
        setTimeout(() => {
            openSerenaConfigDrawer(newAgentStage.id);
        }, 300);
    }
    
    // Fijar el ancho del board-container después de renderizar
    // Usar doble requestAnimationFrame para asegurar que se ejecute después del render completo
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            fixBoardContainerWidth();
        });
    });
    
    // Log después de añadir (con timeout para que se renderice)
    setTimeout(() => {
        const stagesContainerAfter = document.getElementById('stagesContainer');
        if (stagesContainerAfter) {
            const rectAfter = stagesContainerAfter.getBoundingClientRect();
            console.log('  📦 DESPUÉS de añadir agente:');
            console.log('    stagesContainer width:', Math.round(rectAfter.width), 'px');
            console.log('    stagesContainer scrollWidth:', stagesContainerAfter.scrollWidth, 'px');
            console.log('    stagesContainer clientWidth:', stagesContainerAfter.clientWidth, 'px');
            
            // Verificar si hay expansión
            if (stagesContainerBefore) {
                const rectBefore = stagesContainerBefore.getBoundingClientRect();
                const widthDiff = rectAfter.width - rectBefore.width;
                const scrollWidthDiff = stagesContainerAfter.scrollWidth - stagesContainerBefore.scrollWidth;
                
                if (widthDiff > 0 || scrollWidthDiff > 0) {
                    console.warn('    🔴 EXPANSIÓN DETECTADA:');
                    console.warn('      width aumentó:', widthDiff, 'px');
                    console.warn('      scrollWidth aumentó:', scrollWidthDiff, 'px');
                } else {
                    console.log('    ✅ No hay expansión');
                }
            }
            
            // Analizar el nuevo stage-item de agente
            const agentStageItems = stagesContainerAfter.querySelectorAll('.agent-stage-item');
            agentStageItems.forEach((item, index) => {
                const itemRect = item.getBoundingClientRect();
                const itemStyle = window.getComputedStyle(item);
                console.log(`    📦 Agent stage-item ${index + 1}:`);
                console.log('      width:', Math.round(itemRect.width), 'px');
                console.log('      computedWidth:', itemStyle.width);
                console.log('      scrollWidth:', item.scrollWidth, 'px');
                console.log('      clientWidth:', item.clientWidth, 'px');
                console.log('      left:', Math.round(itemRect.left), 'px');
                console.log('      right:', Math.round(itemRect.right), 'px');
                
                // Verificar elementos internos
                const stageContent = item.querySelector('.stage-content');
                const stageHeader = item.querySelector('.stage-header');
                const stageName = item.querySelector('.stage-name');
                
                if (stageContent) {
                    const contentRect = stageContent.getBoundingClientRect();
                    const contentStyle = window.getComputedStyle(stageContent);
                    console.log('      📦 .stage-content:');
                    console.log('        width:', Math.round(contentRect.width), 'px');
                    console.log('        computedWidth:', contentStyle.width);
                    console.log('        scrollWidth:', stageContent.scrollWidth, 'px');
                    console.log('        clientWidth:', stageContent.clientWidth, 'px');
                    
                    if (stageContent.scrollWidth > stageContent.clientWidth) {
                        console.warn('        🔴 OVERFLOW en stage-content:', stageContent.scrollWidth - stageContent.clientWidth, 'px');
                    }
                }
                
                if (stageHeader) {
                    const headerRect = stageHeader.getBoundingClientRect();
                    const headerStyle = window.getComputedStyle(stageHeader);
                    console.log('      📦 .stage-header:');
                    console.log('        width:', Math.round(headerRect.width), 'px');
                    console.log('        computedWidth:', headerStyle.width);
                    console.log('        scrollWidth:', stageHeader.scrollWidth, 'px');
                    console.log('        clientWidth:', stageHeader.clientWidth, 'px');
                    
                    if (stageHeader.scrollWidth > stageHeader.clientWidth) {
                        console.warn('        🔴 OVERFLOW en stage-header:', stageHeader.scrollWidth - stageHeader.clientWidth, 'px');
                    }
                }
                
                if (stageName) {
                    const nameRect = stageName.getBoundingClientRect();
                    const nameStyle = window.getComputedStyle(stageName);
                    console.log('      📦 .stage-name:');
                    console.log('        width:', Math.round(nameRect.width), 'px');
                    console.log('        computedWidth:', nameStyle.width);
                    console.log('        scrollWidth:', stageName.scrollWidth, 'px');
                    console.log('        clientWidth:', stageName.clientWidth, 'px');
                    console.log('        text:', stageName.textContent.substring(0, 50));
                    
                    if (stageName.scrollWidth > stageName.clientWidth) {
                        console.warn('        🔴 OVERFLOW en stage-name:', stageName.scrollWidth - stageName.clientWidth, 'px');
                    }
                }
            });
        }
        console.log('🤖 FIN ANÁLISIS DESPUÉS DE AÑADIR AGENTE\n');
    }, 200);
    
    // Marcar como cambios sin guardar
    markAsUnsaved();
    
    // Cerrar menús
    closeStageMenus();
    
    // Mostrar toast de éxito
    showToast('success', `Agente "${agentData.name}" agregado al flujo`);
}

window.toggleAgentStageMenu = function(event, stageId) {
    event.stopPropagation();
    
    const menu = document.getElementById(`agent-stage-menu-${stageId}`);
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

window.moveAgentStageUp = function(stageId) {
    const stages = currentTemplate.realContent.stages;
    const currentIndex = stages.findIndex(s => s.id === stageId);
    
    if (currentIndex <= 0) return; // Ya está en la primera posición
    
    // Intercambiar con la etapa anterior
    [stages[currentIndex - 1], stages[currentIndex]] = [stages[currentIndex], stages[currentIndex - 1]];
    
    // Re-renderizar
    renderStages();
    
    // Marcar como cambios sin guardar
    markAsUnsaved();
    
    // Cerrar menús
    closeStageMenus();
}

window.moveAgentStageDown = function(stageId) {
    const stages = currentTemplate.realContent.stages;
    const currentIndex = stages.findIndex(s => s.id === stageId);
    
    if (currentIndex < 0 || currentIndex >= stages.length - 1) return; // Ya está en la última posición
    
    // Intercambiar con la etapa siguiente
    [stages[currentIndex], stages[currentIndex + 1]] = [stages[currentIndex + 1], stages[currentIndex]];
    
    // Re-renderizar
    renderStages();
    
    // Marcar como cambios sin guardar
    markAsUnsaved();
    
    // Cerrar menús
    closeStageMenus();
}

window.deleteAgentStage = function(stageId) {
    const stage = currentTemplate.realContent.stages.find(s => s.id === stageId);
    if (!stage) return;
    
    showConfirmModal({
        title: 'Quitar agente',
        message: `¿Estás seguro de que quieres quitar el agente <strong>${stage.name}</strong> del flujo?`,
        confirmText: 'Quitar',
        cancelText: 'Cancelar',
        variant: 'primary',
        onConfirm: () => {
            // Eliminar etapa del array
            currentTemplate.realContent.stages = currentTemplate.realContent.stages.filter(s => s.id !== stageId);

            // Actualizar agentes disponibles
            updateAvailableAgents();

            // Re-renderizar
            renderEditor();
            markAsUnsaved();

            // Mostrar toast
            showToast('success', `Agente "${stage.name}" quitado del flujo`);
        },
        onCancel: () => {
            // No hacer nada
        }
    });
}

window.toggleAgentStageConfig = function(stageId) {
    const stage = currentTemplate.realContent.stages.find(s => s.id === stageId);
    if (!stage) return;
    
    // Guardar el ancho actual ANTES de cambiar el estado para evitar el "brinco"
    const boardMain = document.querySelector('.board-main');
    const boardContainer = document.querySelector('.board-container');
    const editorLayout = document.querySelector('.editor-layout');
    const saveButton = document.querySelector('.save-template-button');
    
    if (boardMain && boardContainer) {
        // NO aplicar max-width - dejar que flex: 1 haga su trabajo
        // El board-main debe expandirse completamente
        boardMain.style.removeProperty('max-width');
        boardMain.style.setProperty('transition', 'none', 'important');
        
        // El board-container debe usar 100% del ancho del board-main (sin limitaciones)
        boardContainer.style.removeProperty('max-width');
        boardContainer.style.setProperty('width', '100%', 'important');
        boardContainer.style.setProperty('box-sizing', 'border-box', 'important');
        boardContainer.style.setProperty('overflow-x', 'hidden', 'important');
        boardContainer.style.setProperty('transition', 'none', 'important'); // Remover transición para evitar brincos
        
        // Asegurar que el stages-container también respete el ancho
        const stagesContainer = document.getElementById('stagesContainer');
        if (stagesContainer) {
            stagesContainer.style.setProperty('max-width', '100%', 'important');
            stagesContainer.style.setProperty('width', '100%', 'important');
            stagesContainer.style.setProperty('box-sizing', 'border-box', 'important');
            stagesContainer.style.setProperty('overflow-x', 'hidden', 'important');
        }
        
        // Asegurar que todos los stage-items respeten el ancho ANTES de renderizar
        const stageItems = document.querySelectorAll('.stage-item');
        stageItems.forEach(item => {
            item.style.setProperty('max-width', '100%', 'important');
            item.style.setProperty('width', '100%', 'important');
            item.style.setProperty('box-sizing', 'border-box', 'important');
            item.style.setProperty('overflow-x', 'hidden', 'important');
        });
    }
    
    // Toggle estado expandido
    stage.expanded = !stage.expanded;
    
    // Re-renderizar para reflejar el cambio
    renderEditor();
    
    // Fijar el ancho DESPUÉS de renderizar para asegurar que se mantenga
    // Usar doble requestAnimationFrame para asegurar que se ejecute después del render completo
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            // fixBoardContainerWidth() ya calcula el ancho correcto, no necesitamos establecer savedWidth
            fixBoardContainerWidth();
            
            // Recrear inputs UBITS para campos select después de expandir/contraer
            if (typeof createInput === 'function') {
                const stagesContainer = document.getElementById('stagesContainer');
                if (stagesContainer) {
                    setTimeout(() => {
                        const containers = document.querySelectorAll('.config-input-container');
                        console.log('🔄 Recreando inputs UBITS después de expandir/contraer:', containers.length);
                        
                        containers.forEach((container, index) => {
                            console.log(`\n🔄 Procesando contenedor ${index + 1}/${containers.length} después de expandir/contraer:`);
                            const containerId = container.id;
                            const dataStageId = container.getAttribute('data-stage-id');
                            const dataConfigKey = container.getAttribute('data-config-key');
                            
                            console.log('  - ID:', containerId);
                            console.log('  - data-stage-id:', dataStageId);
                            console.log('  - data-config-key:', dataConfigKey);
                            
                            if (!containerId) {
                                console.warn('  ⚠️ Contenedor sin ID');
                                return;
                            }
                            
                            // Usar data attributes si están disponibles (método preferido)
                            let stageId, configKey;
                            if (dataStageId && dataConfigKey) {
                                stageId = dataStageId;
                                configKey = dataConfigKey;
                                console.log('  ✅ Usando data attributes:', { stageId, configKey });
                            } else {
                                // Fallback: Extraer del ID usando split
                                const parts = containerId.split('-');
                                if (parts.length >= 3 && parts[0] === 'config') {
                                    configKey = parts[parts.length - 1]; // Último elemento es configKey
                                    stageId = parts.slice(1, -1).join('-'); // Todo lo demás es stageId
                                    console.log('  ✅ Usando split del ID:', { stageId, configKey });
                                } else {
                                    console.warn('  ⚠️ ID de contenedor no coincide con patrón:', containerId);
                                    return;
                                }
                            }
                            
                            // Verificar si ya tiene un input creado
                            if (container.querySelector('.ubits-input')) {
                                console.log('  ✅ Input ya existe para:', containerId);
                                return;
                            }
                            
                            const stage = currentTemplate.realContent.stages.find(s => s.id === stageId);
                            if (!stage) {
                                console.warn('  ⚠️ No se encontró stage con ID:', stageId);
                                console.log('  📋 Stages disponibles:', currentTemplate.realContent.stages.map(s => s.id));
                                return;
                            }
                            
                            console.log('  ✅ Stage encontrado:', stage.id, 'agentId:', stage.agentId);
                            
                            const agentData = AGENTS.find(a => a.id === stage.agentId);
                            if (!agentData) {
                                console.warn('  ⚠️ No se encontró agente con ID:', stage.agentId);
                                return;
                            }
                            
                            if (!agentData.config || !agentData.config[configKey]) {
                                console.warn('  ⚠️ No se encontró configuración para:', configKey, 'en agente:', stage.agentId);
                                return;
                            }
                            
                            const field = agentData.config[configKey];
                            if (field.type === 'select' && field.options && field.options.length > 0) {
                                const currentValue = stage.config && stage.config[configKey] ? stage.config[configKey] : field.default;

                                console.log('  📝 Creando input UBITS:', {
                                    containerId: containerId,
                                    currentValue: currentValue,
                                    optionsCount: field.options.length
                                });

                                // Limpiar contenedor antes de crear
                                container.innerHTML = '';

                                // Asegurar que el contenedor sea visible
                                container.style.display = 'block';
                                container.style.width = '100%';
                                container.style.maxWidth = '100%';
                                container.style.position = 'relative';
                                container.style.minHeight = '40px';

                                try {
                                    console.log('  🔨 Llamando a createInput...');
                                    createInput({
                                        containerId: containerId,
                                        type: 'select',
                                        placeholder: 'Selecciona una opción...',
                                        selectOptions: field.options,
                                        size: 'md',
                                        showLabel: false,
                                        value: currentValue || '',
                                        onChange: function(value) {
                                            console.log('  🔄 onChange llamado para', containerId, 'con valor:', value);
                                            updateAgentStageConfig(stageId, configKey, value);
                                        }
                                    });
                                    console.log('  ✅ createInput llamado para:', containerId);

                                    // Verificar que se creó correctamente
                                    setTimeout(() => {
                                        const input = container.querySelector('.ubits-input');
                                        if (input) {
                                            console.log('  ✅ Input creado exitosamente para:', containerId);
                                            // Asegurar que el input sea visible
                                            input.style.display = 'block';
                                            input.style.width = '100%';
                                        } else {
                                            console.error('  ❌ Input no se creó para:', containerId);
                                            console.error('    - HTML del contenedor:', container.innerHTML);
                                        }
                                    }, 200);
                                } catch (e) {
                                    console.error('  ❌ Error creando input para', containerId, ':', e);
                                    console.error('    - Stack:', e.stack);
                                }
                            } else {
                                console.warn('  ⚠️ Campo select sin opciones o inválido:', configKey);
                            }
                        });
                    }, 150);
                }
            }
        });
    });
    
    markAsUnsaved();
}

window.updateAgentStageConfig = function(stageId, configKey, value) {
    const stage = currentTemplate.realContent.stages.find(s => s.id === stageId);
    if (!stage) return;

    // Inicializar config si no existe
    if (!stage.config) {
        stage.config = {};
    }

    // Actualizar valor
    const agentData = AGENTS.find(a => a.id === stage.agentId);
    if (agentData && agentData.config && agentData.config[configKey]) {
        const field = agentData.config[configKey];
        
        // Manejar array de tests para analista psicométrico
        if (configKey === 'tests' && Array.isArray(value)) {
            stage.config[configKey] = value;
        } else if (field.type === 'number') {
            stage.config[configKey] = parseInt(value) || 0;
        } else if (field.type === 'radio') {
            stage.config[configKey] = value;
        } else {
            stage.config[configKey] = value;
        }
    }
    
    // Marcar como no guardado
    markAsUnsaved();
}

window.toggleCustomStageDescription = function(stageId) {
    const stage = currentTemplate.realContent.stages.find(s => s.id === stageId);
    if (!stage) return;
    
    // Toggle estado expandido
    stage.expanded = !stage.expanded;
    
    // Re-renderizar para reflejar el cambio
    renderEditor();
    markAsUnsaved();
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
    const isOpening = !menu.classList.contains('show');
    menu.classList.toggle('show');

    // Si se abrió el menú, posicionarlo correctamente con position: fixed
    if (isOpening && menu.classList.contains('show')) {
        const button = event.currentTarget;
        const buttonRect = button.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        
        // Calcular posición: alineado al borde derecho del botón, debajo del botón
        const top = buttonRect.bottom + 4; // 4px de gap
        const right = window.innerWidth - buttonRect.right; // Distancia desde el borde derecho de la ventana
        
        // Aplicar posición fixed
        menu.style.position = 'fixed';
        menu.style.top = top + 'px';
        menu.style.right = right + 'px';
        menu.style.left = 'auto';
        menu.style.bottom = 'auto';
        
        // Verificar si el dropdown se sale por la derecha y ajustar si es necesario
        setTimeout(() => {
            const menuRectAfter = menu.getBoundingClientRect();
            if (menuRectAfter.right > window.innerWidth) {
                // Si se sale por la derecha, posicionarlo desde la izquierda del botón
                menu.style.right = 'auto';
                menu.style.left = buttonRect.left + 'px';
            }
            
            // Verificar si se sale por abajo y ajustar si es necesario
            if (menuRectAfter.bottom > window.innerHeight) {
                // Si se sale por abajo, posicionarlo arriba del botón
                menu.style.top = 'auto';
                menu.style.bottom = (window.innerHeight - buttonRect.top) + 'px';
            }
        }, 0);
    }

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
        // Limpiar estilos inline cuando se cierra
        menu.style.position = '';
        menu.style.top = '';
        menu.style.right = '';
        menu.style.left = '';
        menu.style.bottom = '';
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

// Función para mostrar modal de crear nueva versión
function showCreateNewVersionModal() {
    if (!currentTemplate) return;
    
    const currentVersion = currentTemplate.version || 1;
    const nextVersion = currentVersion + 1;
    
    showConfirmModal({
        title: 'Plantilla activa',
        message: `Esta plantilla no se puede editar porque está en uso en una vacante activa. Puedes crear una nueva versión (v${nextVersion}) para realizar cambios.`,
        confirmText: 'Crear nueva versión',
        cancelText: 'Cancelar',
        variant: 'primary',
        onConfirm: () => {
            createNewVersion();
        },
        onCancel: () => {
            // No hacer nada
        }
    });
}

// Función para crear nueva versión de la plantilla
function createNewVersion() {
    if (!currentTemplate) return;
    
    const currentVersion = currentTemplate.version || 1;
    const nextVersion = currentVersion + 1;
    
    // Crear copia de la plantilla
    const newVersionTemplate = {
        ...currentTemplate,
        id: 'template-' + Date.now(),
        name: currentTemplate.name + ' (Copia)',
        version: nextVersion,
        status: 'draft',
        lastModified: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        realContent: currentTemplate.realContent ? JSON.parse(JSON.stringify(currentTemplate.realContent)) : null
    };
    
    // Guardar en localStorage
    const templates = JSON.parse(localStorage.getItem('templates') || '[]');
    templates.unshift(newVersionTemplate);
    localStorage.setItem('templates', JSON.stringify(templates));
    
    // Redirigir al editor de la nueva versión
    window.location.href = `editor-plantillas.html?id=${newVersionTemplate.id}`;
}

// ========================================
// GESTIÓN DE PRUEBAS PSICOTÉCNICAS - DRAWER
// ========================================

let currentPsychometricStageId = null;
let editingTestId = null;
let currentDrawerView = 'list'; // 'list', 'create', 'edit'

// Abrir drawer de pruebas psicotécnicas
function openPsychometricTestsDrawer(stageId) {
    console.log('🟢 openPsychometricTestsDrawer llamado', { stageId });
    currentPsychometricStageId = stageId;
    editingTestId = null;
    currentDrawerView = 'list';
    
    const drawer = document.getElementById('psychometricTestsDrawer');
    if (drawer) {
        console.log('  ✅ Activando drawer');
        drawer.classList.add('active');
        // Verificar que el drawer esté visible
        const isActive = drawer.classList.contains('active');
        const computedDisplay = window.getComputedStyle(drawer).display;
        console.log('  📊 Drawer estado:', { isActive, computedDisplay });
        renderPsychometricTestsView();
    } else {
        console.log('  ⚠️ Drawer no encontrado');
    }
}

// Mostrar vista de lista
function showListView(event) {
    console.log('🔵 showListView llamado', { event, currentDrawerView, editingTestId });
    
    // Prevenir propagación del evento si existe
    if (event) {
        event.preventDefault();
        event.stopPropagation();
        console.log('  ✅ Evento prevenido y detenido');
    }
    
    currentDrawerView = 'list';
    editingTestId = null;
    
    console.log('  📋 Cambiando a vista de lista');
    
    renderPsychometricTestsView();
    
    // Asegurar que el drawer siga abierto (nunca cerrarlo desde aquí)
    const drawer = document.getElementById('psychometricTestsDrawer');
    console.log('  🔍 Drawer encontrado:', !!drawer);
    if (drawer) {
        const isActive = drawer.classList.contains('active');
        console.log('  📊 Drawer activo antes:', isActive);
        drawer.classList.add('active');
        const isActiveAfter = drawer.classList.contains('active');
        console.log('  📊 Drawer activo después:', isActiveAfter);
    }
    
    return false; // Prevenir cualquier acción por defecto
}

// Mostrar vista de creación
function showCreateTestView() {
    console.log('🟢 showCreateTestView llamado');
    currentDrawerView = 'create';
    editingTestId = null;
    renderPsychometricTestsView();
    
    // Asegurar que el drawer siga abierto
    const drawer = document.getElementById('psychometricTestsDrawer');
    if (drawer) {
        drawer.classList.add('active');
    }
}

// Mostrar vista de edición
function showEditTestView(testId) {
    console.log('🟢 showEditTestView llamado', { testId });
    currentDrawerView = 'edit';
    editingTestId = testId;
    renderPsychometricTestsView();
    
    // Asegurar que el drawer siga abierto
    const drawer = document.getElementById('psychometricTestsDrawer');
    if (drawer) {
        drawer.classList.add('active');
    }
}

// Manejar click en el overlay del drawer
function handleDrawerOverlayClick(event) {
    console.log('🟡 handleDrawerOverlayClick llamado', { 
        target: event.target, 
        targetClass: event.target.className,
        isOverlay: event.target.classList.contains('drawer-overlay'),
        currentTarget: event.currentTarget,
        relatedTarget: event.relatedTarget,
        isInContent: event.target.closest('.drawer-content') !== null
    });
    
    // Si el clic es dentro del drawer-content, NO hacer nada y detener propagación
    if (event.target.closest('.drawer-content')) {
        console.log('  ✅ Clic dentro de drawer-content - ignorando');
        event.stopPropagation();
        event.preventDefault();
        return false;
    }
    
    // Solo cerrar si se hace clic directamente en el overlay (no en contenido)
    if (event.target.classList.contains('drawer-overlay') || event.target === event.currentTarget) {
        console.log('  ❌ Clic en overlay - cerrando drawer');
        event.stopPropagation();
        event.preventDefault();
        closePsychometricTestsDrawer();
        return false;
    }
    
    // Por defecto, detener propagación
    event.stopPropagation();
    event.preventDefault();
    return false;
}

// Manejar clic en el botón de cerrar del drawer
function handleDrawerCloseButton(event) {
    console.log('🟡 handleDrawerCloseButton llamado', { currentDrawerView });
    event.stopPropagation();
    event.preventDefault();
    
    // Si estamos en la vista de lista, cerrar el drawer
    if (currentDrawerView === 'list') {
        console.log('  ❌ En vista de lista - cerrando drawer');
        closePsychometricTestsDrawer();
    } else {
        // Si estamos en creación o edición, volver a la lista
        console.log('  📋 En vista de creación/edición - volviendo a lista');
        showListView(event);
    }
    
    return false;
}

// Cerrar drawer de pruebas psicotécnicas
function closePsychometricTestsDrawer() {
    console.log('🔴 closePsychometricTestsDrawer llamado');
    console.trace('  📍 Stack trace:');
    
    const drawer = document.getElementById('psychometricTestsDrawer');
    if (drawer) {
        console.log('  ❌ Cerrando drawer');
        drawer.classList.remove('active');
    } else {
        console.log('  ⚠️ Drawer no encontrado');
    }
    currentPsychometricStageId = null;
    editingTestId = null;
    currentDrawerView = 'list';
}

// Renderizar vista actual del drawer
function renderPsychometricTestsView() {
    console.log('🟣 renderPsychometricTestsView llamado', { 
        currentDrawerView, 
        editingTestId, 
        currentPsychometricStageId 
    });
    
    const listContainer = document.getElementById('psychometricTestsList');
    const drawerTitle = document.getElementById('drawerTitle');
    const drawerFooterActions = document.getElementById('drawerFooterActions');
    
    console.log('  🔍 Elementos encontrados:', {
        listContainer: !!listContainer,
        drawerTitle: !!drawerTitle,
        drawerFooterActions: !!drawerFooterActions,
        currentPsychometricStageId: !!currentPsychometricStageId
    });
    
    if (!listContainer || !currentPsychometricStageId) {
        console.log('  ⚠️ Faltan elementos requeridos, retornando');
        return;
    }
    
    // Buscar el stage en el template
    const stage = currentTemplate.realContent.stages.find(s => s.id === currentPsychometricStageId);
    if (!stage) return;
    
    const agentData = AGENTS.find(a => a.id === 'psychometric-analyst');
    if (!agentData) return;
    
    const tests = stage.config?.tests || [];
    
    // Limpiar contenedor
    listContainer.innerHTML = '';
    
    // Renderizar según la vista actual
    // Obtener el footer completo para controlar su visibilidad
    const drawerFooter = document.querySelector('.drawer-footer');
    
    if (currentDrawerView === 'create') {
        console.log('  📝 Renderizando vista de CREACIÓN');
        // Actualizar título
        if (drawerTitle) drawerTitle.textContent = 'Nueva prueba psicotécnica';
        
        // Generar testId único para esta creación
        const newTestId = 'test-' + Date.now();
        console.log('  🆔 TestId generado:', newTestId);
        
        // Renderizar formulario sin botones
        listContainer.innerHTML = renderTestForm(null, newTestId);
        
        // Asegurar que el footer esté visible en creación
        if (drawerFooter) {
            drawerFooter.style.display = 'flex';
        }
        
        // Renderizar botones en el footer
        if (drawerFooterActions) {
            console.log('  🔘 Renderizando botones en footer (creación)');
            drawerFooterActions.innerHTML = `
                <button class="ubits-button ubits-button--secondary ubits-button--md" onclick="(function(e){console.log('🟢 Botón Cancelar clickeado'); e.stopPropagation(); e.preventDefault(); showListView(e); return false;})(event)">
                    <span>Cancelar</span>
                </button>
                <button class="ubits-button ubits-button--primary ubits-button--md" onclick="(function(e){console.log('🟢 Botón Guardar clickeado'); e.stopPropagation(); e.preventDefault(); savePsychometricTest('${newTestId}'); return false;})(event)">
                    <i class="far fa-check"></i>
                    <span>Guardar</span>
                </button>
            `;
        }
        
        setTimeout(() => {
            initializeTestFormInputs(newTestId);
            
            // Agregar event listeners para tooltips de información
            const drawer = document.getElementById('psychometricTestsDrawer');
            if (drawer) {
                drawer.querySelectorAll('.test-form-info-btn').forEach(btn => {
                    // Remover listeners previos si existen para evitar duplicados
                    btn.removeEventListener('mouseenter', handleConfigInfoHover);
                    btn.removeEventListener('mouseleave', handleConfigInfoLeave);
                    // Agregar nuevos listeners
                    btn.addEventListener('mouseenter', handleConfigInfoHover);
                    btn.addEventListener('mouseleave', handleConfigInfoLeave);
                });
            }
        }, 100);
    } else if (currentDrawerView === 'edit' && editingTestId !== null) {
        console.log('  ✏️ Renderizando vista de EDICIÓN', { editingTestId });
        // Actualizar título
        if (drawerTitle) drawerTitle.textContent = 'Editar prueba psicotécnica';
        
        const testToEdit = tests.find(t => t.id === editingTestId);
        if (testToEdit) {
            console.log('  ✅ Prueba encontrada para editar');
            // Renderizar formulario sin botones
            listContainer.innerHTML = renderTestForm(testToEdit);
            
            // Asegurar que el footer esté visible en edición
            if (drawerFooter) {
                drawerFooter.style.display = 'flex';
            }
            
            // Renderizar botones en el footer
            if (drawerFooterActions) {
                console.log('  🔘 Renderizando botones en footer (edición)');
                drawerFooterActions.innerHTML = `
                    <button class="ubits-button ubits-button--secondary ubits-button--md" onclick="(function(e){console.log('🟢 Botón Cancelar (edición) clickeado'); e.stopPropagation(); e.preventDefault(); showListView(e); return false;})(event)">
                        <span>Cancelar</span>
                    </button>
                    <button class="ubits-button ubits-button--primary ubits-button--md" onclick="(function(e){console.log('🟢 Botón Guardar (edición) clickeado'); e.stopPropagation(); e.preventDefault(); savePsychometricTest('${testToEdit.id}'); return false;})(event)">
                        <i class="far fa-check"></i>
                        <span>Guardar</span>
                    </button>
                `;
            }
            
            setTimeout(() => {
                initializeTestFormInputs(testToEdit.id);
                
                // Agregar event listeners para tooltips de información
                const drawer = document.getElementById('psychometricTestsDrawer');
                if (drawer) {
                    drawer.querySelectorAll('.test-form-info-btn').forEach(btn => {
                        // Remover listeners previos si existen para evitar duplicados
                        btn.removeEventListener('mouseenter', handleConfigInfoHover);
                        btn.removeEventListener('mouseleave', handleConfigInfoLeave);
                        // Agregar nuevos listeners
                        btn.addEventListener('mouseenter', handleConfigInfoHover);
                        btn.addEventListener('mouseleave', handleConfigInfoLeave);
                    });
                }
            }, 200);
        } else {
            console.log('  ⚠️ Prueba no encontrada, volviendo a lista');
            // Si no se encuentra la prueba, volver a lista
            showListView();
        }
    } else {
        console.log('  📋 Renderizando vista de LISTA');
        // Vista de lista
        // Actualizar título
        if (drawerTitle) drawerTitle.textContent = 'Pruebas psicotécnicas';
        
        // Obtener tests para verificar si hay pruebas
        const hasTests = tests && tests.length > 0;
        
        // Renderizar botón de agregar en el footer SOLO si hay pruebas
        // Si no hay pruebas, el empty state ya tiene su propio botón
        if (drawerFooterActions) {
            if (hasTests) {
                console.log('  🔘 Renderizando botón agregar en footer (lista con pruebas)');
                drawerFooterActions.innerHTML = `
                    <button class="ubits-button ubits-button--primary ubits-button--md" onclick="addPsychometricTest()">
                        <i class="far fa-plus"></i>
                        <span>Agregar prueba</span>
                    </button>
                `;
                // Mostrar el footer cuando hay pruebas
                if (drawerFooter) {
                    drawerFooter.style.display = 'flex';
                }
            } else {
                console.log('  🔘 Ocultando footer (empty state visible)');
                drawerFooterActions.innerHTML = '';
                // Ocultar el footer completo SOLO cuando no hay pruebas (empty state)
                if (drawerFooter) {
                    drawerFooter.style.display = 'none';
                }
            }
        }
        
        renderTestsList(tests, agentData);
    }
    
    console.log('  ✅ renderPsychometricTestsView completado');
}

// Renderizar lista de pruebas
function renderTestsList(tests, agentData) {
    const listContainer = document.getElementById('psychometricTestsList');
    if (!listContainer) return;
    
    // Si no hay pruebas, mostrar empty state con el mismo estilo que los otros empty states
    if (tests.length === 0) {
        listContainer.innerHTML = `
            <div class="board-empty-state-full">
                <div class="empty-icon-circle">
                    <i class="far fa-clipboard-list"></i>
                </div>
                <h3 class="empty-title">No hay pruebas psicotécnicas configuradas</h3>
                <p class="empty-description">Crea tu primera prueba psicotécnica para comenzar a evaluar candidatos con inteligencia artificial.</p>
                <button class="ubits-button ubits-button--primary ubits-button--md" onclick="addPsychometricTest()">
                    <i class="far fa-plus"></i>
                    <span>Agregar prueba</span>
                </button>
            </div>
        `;
        return;
    }
    
    // Renderizar lista de pruebas
    tests.forEach((test, index) => {
        const testTypeOption = agentData.testTypes.find(opt => opt.value === test.type);
        const testLanguageOption = agentData.testLanguages.find(opt => opt.value === test.language);
        
        const testItem = document.createElement('div');
        testItem.className = 'test-item';
        testItem.innerHTML = `
            <div class="test-item-header">
                <div class="test-item-info">
                    <div class="test-item-title">${testTypeOption ? testTypeOption.text : test.type}</div>
                    <div class="test-item-subtitle">Idioma: ${testLanguageOption ? testLanguageOption.text : test.language}${test.minScore ? ` • Puntaje mínimo: ${test.minScore} pts` : ''}</div>
                </div>
                <div class="test-item-actions">
                    ${index > 0 ? `
                        <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" 
                                onclick="movePsychometricTestUp('${test.id}')" 
                                title="Subir">
                            <i class="far fa-arrow-up"></i>
                        </button>
                    ` : ''}
                    ${index < tests.length - 1 ? `
                        <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" 
                                onclick="movePsychometricTestDown('${test.id}')" 
                                title="Bajar">
                            <i class="far fa-arrow-down"></i>
                        </button>
                    ` : ''}
                    <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" 
                            onclick="showEditTestView('${test.id}')" 
                            title="Editar">
                        <i class="far fa-pencil"></i>
                    </button>
                    <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" 
                            onclick="deletePsychometricTest('${test.id}')" 
                            title="Eliminar"
                            style="color: var(--ubits-feedback-accent-error);">
                        <i class="far fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        listContainer.appendChild(testItem);
    });
}

// Renderizar formulario de prueba
function renderTestForm(test = null, testId = null) {
    const agentData = AGENTS.find(a => a.id === 'psychometric-analyst');
    if (!agentData) return '';
    
    const finalTestId = testId || (test ? test.id : 'test-' + Date.now());
    
    return `
        <div class="test-form" data-test-id="${finalTestId}">
            <div class="test-form-fields">
                <div class="test-form-field">
                    <label class="test-form-field-label-wrapper">
                        <span>Tipo de prueba (CI/CA)</span>
                        <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only test-form-info-btn" 
                                data-tooltip="Selecciona el tipo de prueba psicométrica que se aplicará al candidato. Cada opción evalúa habilidades o aspectos distintos según la configuración de tu plataforma."
                                title="Información">
                            <i class="far fa-circle-info"></i>
                        </button>
                    </label>
                    <div id="test-form-type-${finalTestId}" class="config-input-container"></div>
                </div>
                <div class="test-form-field">
                    <label>Idioma de la prueba</label>
                    <div id="test-form-language-${finalTestId}" class="config-input-container"></div>
                </div>
                <div class="test-form-field">
                    <label class="test-form-field-label-wrapper">
                        <span>Puntaje CI mínimo</span>
                        <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only test-form-info-btn" 
                                data-tooltip="Puntaje mínimo que el candidato debe lograr en la prueba psicométrica para considerarse aprobado en esta etapa."
                                title="Información">
                            <i class="far fa-circle-info"></i>
                        </button>
                    </label>
                    <div id="test-form-minscore-${finalTestId}" class="config-input-container"></div>
                </div>
            </div>
        </div>
    `;
}

// Inicializar inputs del formulario
function initializeTestFormInputs(testId = null) {
    if (!currentPsychometricStageId) return;
    
    const stage = currentTemplate.realContent.stages.find(s => s.id === currentPsychometricStageId);
    if (!stage) return;
    
    const agentData = AGENTS.find(a => a.id === 'psychometric-analyst');
    if (!agentData) return;
    
    // Obtener testId del formulario renderizado o del parámetro
    let finalTestId = testId;
    if (!finalTestId) {
        const form = document.querySelector('.test-form');
        if (form) {
            finalTestId = form.getAttribute('data-test-id');
        }
    }
    
    if (!finalTestId) {
        // Buscar el testId en los IDs de los contenedores
        const typeContainer = document.querySelector('[id^="test-form-type-"]');
        if (typeContainer) {
            finalTestId = typeContainer.id.replace('test-form-type-', '');
        }
    }
    
    if (!finalTestId) return;
    
    // Obtener valores por defecto o del test existente
    let testType = agentData.testTypes[0].value;
    let testLanguage = agentData.testLanguages[0].value;
    let minScore = 0;
    
    if (editingTestId && editingTestId === finalTestId) {
        const test = stage.config?.tests?.find(t => t.id === editingTestId);
        if (test) {
            testType = test.type;
            testLanguage = test.language;
            minScore = test.minScore || 0;
        }
    }
    
    // Crear select de tipo de prueba con componente UBITS
    const typeContainer = document.getElementById(`test-form-type-${finalTestId}`);
    if (typeContainer && typeof createInput !== 'undefined') {
        // Limpiar contenedor antes de crear
        typeContainer.innerHTML = '';
        
        createInput({
            containerId: `test-form-type-${finalTestId}`,
            type: 'select',
            label: '',
            placeholder: 'Selecciona el tipo de prueba...',
            value: testType,
            selectOptions: agentData.testTypes.map(opt => ({
                value: opt.value,
                text: opt.text
            }))
        });
        
    }
    
    // Crear select de idioma con componente UBITS
    const languageContainer = document.getElementById(`test-form-language-${finalTestId}`);
    if (languageContainer && typeof createInput !== 'undefined') {
        // Limpiar contenedor antes de crear
        languageContainer.innerHTML = '';
        
        createInput({
            containerId: `test-form-language-${finalTestId}`,
            type: 'select',
            label: '',
            placeholder: 'Selecciona el idioma...',
            value: testLanguage,
            selectOptions: agentData.testLanguages.map(opt => ({
                value: opt.value,
                text: opt.text
            }))
        });
        
        // Asegurar que el texto se establezca después de crear el select
        setTimeout(() => {
            const input = languageContainer.querySelector('.ubits-input');
            if (input && testLanguage) {
                // Buscar el texto correspondiente al valor
                const option = agentData.testLanguages.find(opt => opt.value === testLanguage);
                if (option) {
                    input.value = option.text;
                    input.dataset.selectedValue = testLanguage;
                }
            }
        }, 500);
    }
    
    // Crear input de puntaje mínimo con componente UBITS
    const minScoreContainer = document.getElementById(`test-form-minscore-${finalTestId}`);
    if (minScoreContainer && typeof createInput !== 'undefined') {
        // Limpiar contenedor antes de crear
        minScoreContainer.innerHTML = '';
        
        createInput({
            containerId: `test-form-minscore-${finalTestId}`,
            type: 'number',
            label: '',
            placeholder: '0',
            value: minScore.toString(),
            helperText: 'Opcional: puntaje mínimo que debe obtener el candidato en esta prueba'
        });
    }
}

// Agregar nueva prueba
function addPsychometricTest() {
    showCreateTestView();
}

// Editar prueba (mantener para compatibilidad)
function editPsychometricTest(testId) {
    showEditTestView(testId);
}

// Guardar prueba
function savePsychometricTest(testId) {
    if (!currentPsychometricStageId) return;
    
    const stage = currentTemplate.realContent.stages.find(s => s.id === currentPsychometricStageId);
    if (!stage) return;
    
    if (!stage.config) {
        stage.config = {};
    }
    if (!stage.config.tests) {
        stage.config.tests = [];
    }
    
    // Si no se proporciona testId, intentar obtenerlo del formulario
    if (!testId || testId === 'undefined') {
        const form = document.querySelector('.test-form');
        if (form) {
            testId = form.getAttribute('data-test-id');
        }
        if (!testId) {
            // Buscar en los contenedores
            const typeContainer = document.querySelector('[id^="test-form-type-"]');
            if (typeContainer) {
                testId = typeContainer.id.replace('test-form-type-', '');
            }
        }
        if (!testId) {
            testId = 'test-' + Date.now();
        }
    }
    
    // Obtener valores del formulario (componentes UBITS)
    // Para selects UBITS, el valor está en dataset.selectedValue
    const typeContainer = document.getElementById(`test-form-type-${testId}`);
    const languageContainer = document.getElementById(`test-form-language-${testId}`);
    const minScoreContainer = document.getElementById(`test-form-minscore-${testId}`);
    
    if (!typeContainer || !languageContainer || !minScoreContainer) {
        showToast('error', 'Error: No se encontraron los campos del formulario');
        return;
    }
    
    // Obtener input elements de los contenedores
    const typeInput = typeContainer.querySelector('.ubits-input');
    const languageInput = languageContainer.querySelector('.ubits-input');
    const minScoreInput = minScoreContainer.querySelector('.ubits-input');
    
    if (!typeInput || !languageInput || !minScoreInput) {
        showToast('error', 'Error: No se encontraron los inputs UBITS');
        return;
    }
    
    // Para selects, obtener el valor de dataset.selectedValue, si no existe usar value
    const testType = typeInput.dataset.selectedValue || typeInput.value || '';
    const testLanguage = languageInput.dataset.selectedValue || languageInput.value || '';
    const minScore = parseInt(minScoreInput.value) || 0;
    
    // Validar que los valores requeridos estén presentes
    if (!testType || !testLanguage) {
        showToast('error', 'Por favor completa todos los campos requeridos');
        return;
    }
    
    const testData = {
        id: testId,
        type: testType,
        language: testLanguage,
        minScore: minScore
    };
    
    // Buscar si la prueba ya existe
    const testIndex = stage.config.tests.findIndex(t => t.id === testId);
    
    if (testIndex !== -1) {
        // Actualizar prueba existente
        stage.config.tests[testIndex] = testData;
    } else {
        // Agregar nueva prueba
        stage.config.tests.push(testData);
    }
    
    // Guardar cambios
    updateAgentStageConfig(currentPsychometricStageId, 'tests', stage.config.tests);
    
    // Cerrar edición y volver a lista
    editingTestId = null;
    currentDrawerView = 'list';
    
    // Re-renderizar
    renderPsychometricTestsView();
    
    // Re-renderizar el stage card para actualizar el contador
    renderStages();
    
    showToast('success', 'Prueba guardada correctamente');
}

// Eliminar prueba
function deletePsychometricTest(testId) {
    if (!currentPsychometricStageId) return;
    
    const stage = currentTemplate.realContent.stages.find(s => s.id === currentPsychometricStageId);
    if (!stage || !stage.config || !stage.config.tests) return;
    
    const testIndex = stage.config.tests.findIndex(t => t.id === testId);
    if (testIndex === -1) return;
    
    stage.config.tests.splice(testIndex, 1);
    
    // Guardar cambios
    updateAgentStageConfig(currentPsychometricStageId, 'tests', stage.config.tests);
    
    // Re-renderizar
    renderPsychometricTestsView();
    
    // Re-renderizar el stage card para actualizar el contador
    renderStages();
    
    showToast('success', 'Prueba eliminada correctamente');
}

// Mover prueba hacia arriba
function movePsychometricTestUp(testId) {
    if (!currentPsychometricStageId) return;
    
    const stage = currentTemplate.realContent.stages.find(s => s.id === currentPsychometricStageId);
    if (!stage || !stage.config || !stage.config.tests) return;
    
    const testIndex = stage.config.tests.findIndex(t => t.id === testId);
    if (testIndex <= 0) return;
    
    // Intercambiar posiciones
    const temp = stage.config.tests[testIndex];
    stage.config.tests[testIndex] = stage.config.tests[testIndex - 1];
    stage.config.tests[testIndex - 1] = temp;
    
    // Guardar cambios
    updateAgentStageConfig(currentPsychometricStageId, 'tests', stage.config.tests);
    
    // Re-renderizar
    renderPsychometricTestsView();
}

// Mover prueba hacia abajo
function movePsychometricTestDown(testId) {
    if (!currentPsychometricStageId) return;
    
    const stage = currentTemplate.realContent.stages.find(s => s.id === currentPsychometricStageId);
    if (!stage || !stage.config || !stage.config.tests) return;
    
    const testIndex = stage.config.tests.findIndex(t => t.id === testId);
    if (testIndex === -1 || testIndex >= stage.config.tests.length - 1) return;
    
    // Intercambiar posiciones
    const temp = stage.config.tests[testIndex];
    stage.config.tests[testIndex] = stage.config.tests[testIndex + 1];
    stage.config.tests[testIndex + 1] = temp;
    
    // Guardar cambios
    updateAgentStageConfig(currentPsychometricStageId, 'tests', stage.config.tests);
    
    // Re-renderizar
    renderPsychometricTestsList();
}

// ========================================
// GESTIÓN DE CONFIGURACIÓN SERENA AI - DRAWER
// ========================================

let currentSerenaStageId = null;

// Abrir drawer de configuración de Serena
function openSerenaConfigDrawer(stageId) {
    console.log('🟢 openSerenaConfigDrawer llamado', { stageId });
    currentSerenaStageId = stageId;
    
    const drawer = document.getElementById('serenaConfigDrawer');
    if (drawer) {
        drawer.classList.add('active');
        renderSerenaConfigView();
    }
}

// Cerrar drawer de configuración de Serena
function closeSerenaConfigDrawer() {
    console.log('🔴 closeSerenaConfigDrawer llamado');
    const drawer = document.getElementById('serenaConfigDrawer');
    if (drawer) {
        drawer.classList.remove('active');
    }
    currentSerenaStageId = null;
}

// Manejar click en el overlay del drawer de Serena
function handleSerenaDrawerOverlayClick(event) {
    if (event.target.closest('.drawer-content')) {
        event.stopPropagation();
        event.preventDefault();
        return false;
    }
    closeSerenaConfigDrawer();
}

// Renderizar vista de configuración de Serena
function renderSerenaConfigView() {
    if (!currentSerenaStageId) return;
    
    const contentContainer = document.getElementById('serenaConfigContent');
    const footerActions = document.getElementById('serenaDrawerFooterActions');
    
    if (!contentContainer) return;
    
    // Buscar el stage en el template
    const stage = currentTemplate.realContent.stages.find(s => s.id === currentSerenaStageId);
    if (!stage) return;
    
    const agentData = AGENTS.find(a => a.id === 'interview-ia');
    if (!agentData) return;
    
    // Obtener valores actuales
    const interviewType = stage.config?.interviewType || agentData.config.interviewType.default;
    const voice = stage.config?.voice || agentData.config.voice.default;
    const expirationDays = stage.config?.expirationDays ?? agentData.config.expirationDays.default;
    const minScore = stage.config?.minScore ?? agentData.config.minScore.default;
    
    // Renderizar contenido
    contentContainer.innerHTML = `
        <!-- Sección: Tipo de entrevista -->
        <div class="serena-section">
            <h4 class="serena-section-title">Tipo de entrevista</h4>
            <p class="serena-section-description">Elige cómo prefieres que Serena interactúe con tus candidatos:</p>
            <div class="interview-type-cards">
                <div class="interview-type-card ${interviewType === 'telefonica' ? 'selected' : ''}" 
                     onclick="selectInterviewType('telefonica')">
                    <label class="config-radio-label" onclick="event.stopPropagation();">
                        <input 
                            type="radio" 
                            name="serena-interview-type-${currentSerenaStageId}"
                            value="telefonica"
                            ${interviewType === 'telefonica' ? 'checked' : ''}
                            onchange="selectInterviewType('telefonica')"
                        >
                        <span></span>
                    </label>
                    <div class="interview-type-card-content">
                        <i class="far fa-phone interview-type-card-icon"></i>
                        <span class="interview-type-card-label">Telefónica</span>
                    </div>
                </div>
                <div class="interview-type-card ${interviewType === 'virtual' ? 'selected' : ''}" 
                     onclick="selectInterviewType('virtual')">
                    <label class="config-radio-label" onclick="event.stopPropagation();">
                        <input 
                            type="radio" 
                            name="serena-interview-type-${currentSerenaStageId}"
                            value="virtual"
                            ${interviewType === 'virtual' ? 'checked' : ''}
                            onchange="selectInterviewType('virtual')"
                        >
                        <span></span>
                    </label>
                    <div class="interview-type-card-content">
                        <i class="far fa-laptop interview-type-card-icon"></i>
                        <span class="interview-type-card-label">Virtual</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Sección: Voces de Serena -->
        <div class="serena-section">
            <h4 class="serena-section-title">Voz de Serena</h4>
            <p class="serena-section-description">Selecciona la voz que utilizará Serena durante la entrevista:</p>
            <div id="serena-voice-select-container"></div>
            <div class="serena-voice-preview" id="serena-voice-preview" style="display: none;">
                <div class="serena-voice-preview-icon-wrapper">
                    <div class="serena-voice-waves">
                        <div class="serena-voice-wave"></div>
                        <div class="serena-voice-wave"></div>
                        <div class="serena-voice-wave"></div>
                        <div class="serena-voice-wave"></div>
                        <div class="serena-voice-wave"></div>
                    </div>
                    <div class="serena-voice-preview-icon">
                        <i class="far fa-waveform"></i>
                    </div>
                </div>
                <div class="serena-voice-preview-info">
                    <div class="serena-voice-preview-name">
                        <span id="serena-voice-preview-name">-</span>
                        <span class="serena-voice-preview-flag" id="serena-voice-preview-flag"></span>
                    </div>
                    <div class="serena-voice-preview-hint">Haz clic en el botón para escuchar una muestra de esta voz</div>
                </div>
                <div class="serena-voice-preview-controls">
                    <button class="ubits-button ubits-button--primary ubits-button--md ubits-button--icon-only" id="serena-voice-preview-play-btn" onclick="toggleSerenaVoicePreview()" title="Reproducir/Pausar voz">
                        <i class="far fa-play" id="serena-voice-preview-icon"></i>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Sección: Configuración adicional -->
        <div class="serena-section">
            <h4 class="serena-section-title">Configuración adicional</h4>
            <div class="serena-config-fields">
                <div class="serena-config-field">
                    <div class="serena-config-field-label-wrapper">
                        <label class="serena-config-field-label">Días para que expire la entrevista</label>
                        <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only config-info-btn" data-tooltip="Cantidad de días que el candidato tiene para completar la entrevista desde que recibe la invitación. Si no responde dentro de ese plazo, la entrevista vence y ya no podrá realizarla." title="Información">
                            <i class="far fa-info-circle"></i>
                        </button>
                    </div>
                    <div id="serena-expiration-days-container"></div>
                </div>
                <div class="serena-config-field">
                    <div class="serena-config-field-label-wrapper">
                        <label class="serena-config-field-label">Puntaje mínimo de la entrevista</label>
                        <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only config-info-btn" data-tooltip="Puntaje mínimo que el candidato debe obtener en la entrevista para avanzar a la siguiente etapa del proceso." title="Información">
                            <i class="far fa-info-circle"></i>
                        </button>
                    </div>
                    <div id="serena-min-score-container"></div>
                </div>
            </div>
        </div>
    `;
    
    // Renderizar botones en el footer
    if (footerActions) {
        footerActions.innerHTML = `
            <button class="ubits-button ubits-button--secondary ubits-button--md" onclick="closeSerenaConfigDrawer(); return false;">
                <span>Cancelar</span>
            </button>
            <button class="ubits-button ubits-button--primary ubits-button--md" onclick="saveSerenaConfig(); return false;">
                <i class="far fa-save"></i>
                <span>Guardar</span>
            </button>
        `;
    }
    
    // Inicializar inputs UBITS
    setTimeout(() => {
        // Select de voz de Serena
        const voiceSelectContainer = document.getElementById('serena-voice-select-container');
        if (voiceSelectContainer) {
            createInput({
                containerId: 'serena-voice-select-container',
                type: 'select',
                label: '',
                placeholder: 'Selecciona una voz...',
                selectOptions: agentData.voices.map(v => ({
                    value: v.id,
                    text: `${v.flag} ${v.name}`
                })),
                value: voice
            });
            
            // Agregar listener para actualizar preview cuando cambie la selección
            setTimeout(() => {
                const voiceSelectInput = voiceSelectContainer.querySelector('input');
                if (voiceSelectInput) {
                    // Usar MutationObserver para detectar cambios en dataset.selectedValue
                    const observer = new MutationObserver(function(mutations) {
                        mutations.forEach(function(mutation) {
                            if (mutation.type === 'attributes' && mutation.attributeName === 'data-selected-value') {
                                const newValue = voiceSelectInput.dataset.selectedValue || voiceSelectInput.value;
                                if (newValue) {
                                    updateSerenaVoicePreview(newValue);
                                }
                            }
                        });
                    });
                    
                    observer.observe(voiceSelectInput, {
                        attributes: true,
                        attributeFilter: ['data-selected-value']
                    });
                    
                    // También escuchar clicks en el dropdown
                    voiceSelectContainer.addEventListener('click', function(e) {
                        setTimeout(() => {
                            const newValue = voiceSelectInput.dataset.selectedValue || voiceSelectInput.value;
                            if (newValue) {
                                updateSerenaVoicePreview(newValue);
                            }
                        }, 100);
                    });
                }
            }, 300);
        }
        
        // Actualizar preview inicial
        updateSerenaVoicePreview(voice);
        
        // Input de días de expiración
        const expirationContainer = document.getElementById('serena-expiration-days-container');
        if (expirationContainer) {
            createInput({
                containerId: 'serena-expiration-days-container',
                type: 'number',
                placeholder: '0',
                value: expirationDays,
                min: 0
            });
        }
        
        // Input de puntaje mínimo
        const minScoreContainer = document.getElementById('serena-min-score-container');
        if (minScoreContainer) {
            createInput({
                containerId: 'serena-min-score-container',
                type: 'number',
                placeholder: '0',
                value: minScore,
                min: 0
            });
        }
        
        // Agregar event listeners para tooltips de información de configuración
        const contentContainer = document.getElementById('serenaConfigContent');
        
        if (contentContainer) {
            const infoButtons = contentContainer.querySelectorAll('.config-info-btn');
            infoButtons.forEach(btn => {
                // Agregar listeners
                btn.addEventListener('mouseenter', handleConfigInfoHover);
                btn.addEventListener('mouseleave', handleConfigInfoLeave);
            });
        }
    }, 300);
}

// Seleccionar tipo de entrevista
function selectInterviewType(type) {
    if (!currentSerenaStageId) return;
    
    const stage = currentTemplate.realContent.stages.find(s => s.id === currentSerenaStageId);
    if (!stage) return;
    
    if (!stage.config) stage.config = {};
    stage.config.interviewType = type;
    
    // Re-renderizar para actualizar selección visual
    renderSerenaConfigView();
}

// Actualizar preview de voz de Serena
function updateSerenaVoicePreview(voiceId) {
    if (!voiceId) return;
    
    // Detener reproducción si está activa
    if (serenaVoicePlaying) {
        stopSerenaVoicePreview();
    }
    
    const agentData = AGENTS.find(a => a.id === 'interview-ia');
    if (!agentData) return;
    
    const voiceOption = agentData.voices.find(v => v.id === voiceId);
    if (!voiceOption) return;
    
    const preview = document.getElementById('serena-voice-preview');
    const previewName = document.getElementById('serena-voice-preview-name');
    const previewFlag = document.getElementById('serena-voice-preview-flag');
    
    if (preview && previewName && previewFlag) {
        previewName.textContent = voiceOption.name;
        previewFlag.textContent = voiceOption.flag;
        preview.style.display = 'flex';
        
        // Actualizar el valor en el stage
        if (currentSerenaStageId) {
            const stage = currentTemplate.realContent.stages.find(s => s.id === currentSerenaStageId);
            if (stage) {
                if (!stage.config) stage.config = {};
                stage.config.voice = voiceId;
            }
        }
    }
}

// Estado de reproducción de voz
let serenaVoicePlaying = false;
let serenaVoiceTimeout = null;

// Toggle play/pause del preview de voz de Serena
function toggleSerenaVoicePreview() {
    if (!currentSerenaStageId) return;
    
    const stage = currentTemplate.realContent.stages.find(s => s.id === currentSerenaStageId);
    if (!stage) return;
    
    const voiceId = stage.config?.voice;
    if (!voiceId) {
        showToast('warning', 'Primero selecciona una voz');
        return;
    }
    
    const agentData = AGENTS.find(a => a.id === 'interview-ia');
    if (!agentData) return;
    
    const voiceOption = agentData.voices.find(v => v.id === voiceId);
    if (!voiceOption) return;
    
    const preview = document.getElementById('serena-voice-preview');
    const playButton = document.getElementById('serena-voice-preview-play-btn');
    
    if (!preview || !playButton) return;
    
    // Toggle estado de reproducción
    serenaVoicePlaying = !serenaVoicePlaying;
    
    // Obtener el icono y cambiar su clase
    const icon = document.getElementById('serena-voice-preview-icon');
    
    if (serenaVoicePlaying) {
        // Iniciar reproducción
        preview.classList.add('playing');
        playButton.classList.add('playing');
        
        // Cambiar icono a pausa
        if (icon) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
        }
        
        console.log('🎵 Reproduciendo voz:', voiceId, voiceOption.name);
        
        // Simular reproducción por 5 segundos (aquí se conectaría con el audio real)
        serenaVoiceTimeout = setTimeout(() => {
            stopSerenaVoicePreview();
        }, 5000);
        
        showToast('info', `Reproduciendo voz de ${voiceOption.name}...`);
    } else {
        // Pausar reproducción
        stopSerenaVoicePreview();
    }
}

// Detener reproducción de voz
function stopSerenaVoicePreview() {
    const preview = document.getElementById('serena-voice-preview');
    const playButton = document.getElementById('serena-voice-preview-play-btn');
    const icon = document.getElementById('serena-voice-preview-icon');
    
    if (preview) {
        preview.classList.remove('playing');
    }
    
    if (playButton) {
        playButton.classList.remove('playing');
    }
    
    // Cambiar icono a play
    if (icon) {
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
    }
    
    if (serenaVoiceTimeout) {
        clearTimeout(serenaVoiceTimeout);
        serenaVoiceTimeout = null;
    }
    
    serenaVoicePlaying = false;
}

// Guardar configuración de Serena
function saveSerenaConfig() {
    console.log('💾 saveSerenaConfig llamado', { currentSerenaStageId });
    
    if (!currentSerenaStageId) {
        showToast('error', 'Error: No se encontró el stage ID');
        console.error('❌ currentSerenaStageId es null o undefined');
        return;
    }
    
    const stage = currentTemplate.realContent.stages.find(s => s.id === currentSerenaStageId);
    if (!stage) {
        showToast('error', 'Error: No se encontró el stage');
        console.error('❌ Stage no encontrado con ID:', currentSerenaStageId);
        return;
    }
    
    if (!stage.config) stage.config = {};
    
    // Obtener valor del select de voz (componente UBITS)
    const voiceContainer = document.getElementById('serena-voice-select-container');
    console.log('🔍 Buscando contenedor de voz:', voiceContainer);
    
    if (!voiceContainer) {
        showToast('error', 'Error: No se encontró el selector de voz');
        console.error('❌ Contenedor de voz no encontrado');
        return;
    }
    
    // Buscar el input de diferentes formas
    let voiceInput = voiceContainer.querySelector('input.ubits-input');
    if (!voiceInput) {
        voiceInput = voiceContainer.querySelector('.ubits-input');
    }
    if (!voiceInput) {
        voiceInput = voiceContainer.querySelector('input');
    }
    
    console.log('🔍 Input de voz encontrado:', voiceInput);
    console.log('🔍 Contenedor HTML:', voiceContainer.innerHTML.substring(0, 200));
    
    if (voiceInput) {
        // Para selects UBITS, el valor está en dataset.selectedValue
        const selectedVoice = voiceInput.dataset.selectedValue || voiceInput.value || '';
        console.log('🔍 Valor de voz:', {
            datasetSelectedValue: voiceInput.dataset.selectedValue,
            inputValue: voiceInput.value,
            finalValue: selectedVoice
        });
        
        if (selectedVoice) {
            stage.config.voice = selectedVoice;
            console.log('✅ Voz guardada:', selectedVoice);
        } else {
            console.warn('⚠️ No se encontró valor de voz, usando valor por defecto');
            // Usar valor por defecto si no hay selección
            const agentData = AGENTS.find(a => a.id === 'interview-ia');
            if (agentData && agentData.config.voice) {
                stage.config.voice = agentData.config.voice.default;
            }
        }
    } else {
        console.error('❌ No se encontró input de voz en el contenedor');
        showToast('error', 'Error: No se encontró el selector de voz');
        return;
    }
    
    // Obtener valores de los inputs UBITS numéricos
    const expirationContainer = document.getElementById('serena-expiration-days-container');
    const minScoreContainer = document.getElementById('serena-min-score-container');
    
    console.log('🔍 Contenedores encontrados:', {
        expiration: !!expirationContainer,
        minScore: !!minScoreContainer
    });
    
    if (expirationContainer) {
        let expirationInput = expirationContainer.querySelector('input.ubits-input');
        if (!expirationInput) {
            expirationInput = expirationContainer.querySelector('.ubits-input');
        }
        if (!expirationInput) {
            expirationInput = expirationContainer.querySelector('input');
        }
        
        if (expirationInput) {
            stage.config.expirationDays = parseFloat(expirationInput.value) || 0;
            console.log('✅ Días de expiración guardados:', stage.config.expirationDays);
        } else {
            console.warn('⚠️ No se encontró input de expiración, usando 0');
            stage.config.expirationDays = 0;
        }
    } else {
        console.warn('⚠️ Contenedor de expiración no encontrado, usando 0');
        stage.config.expirationDays = 0;
    }
    
    if (minScoreContainer) {
        let minScoreInput = minScoreContainer.querySelector('input.ubits-input');
        if (!minScoreInput) {
            minScoreInput = minScoreContainer.querySelector('.ubits-input');
        }
        if (!minScoreInput) {
            minScoreInput = minScoreContainer.querySelector('input');
        }
        
        if (minScoreInput) {
            stage.config.minScore = parseFloat(minScoreInput.value) || 0;
            console.log('✅ Puntaje mínimo guardado:', stage.config.minScore);
        } else {
            console.warn('⚠️ No se encontró input de puntaje mínimo, usando 0');
            stage.config.minScore = 0;
        }
    } else {
        console.warn('⚠️ Contenedor de puntaje mínimo no encontrado, usando 0');
        stage.config.minScore = 0;
    }
    
    // El tipo de entrevista ya se guarda automáticamente cuando se selecciona
    // Verificar que esté presente
    if (!stage.config.interviewType) {
        console.warn('⚠️ No se encontró tipo de entrevista, usando valor por defecto');
        const agentData = AGENTS.find(a => a.id === 'interview-ia');
        if (agentData && agentData.config.interviewType) {
            stage.config.interviewType = agentData.config.interviewType.default;
        }
    }
    
    console.log('📋 Configuración final guardada:', stage.config);
    
    // Guardar cambios directamente en el stage (más eficiente que llamar updateAgentStageConfig múltiples veces)
    // La función updateAgentStageConfig verifica si la plantilla está activa y muestra modal,
    // pero nosotros ya tenemos el stage, así que actualizamos directamente
    
    
    // Actualizar directamente en el stage (ya lo hicimos arriba, pero asegurémonos)
    stage.config.interviewType = stage.config.interviewType || 'telefonica';
    stage.config.voice = stage.config.voice || 'colombia';
    stage.config.expirationDays = stage.config.expirationDays || 0;
    stage.config.minScore = stage.config.minScore || 0;
    
    console.log('✅ Configuración actualizada en stage:', stage.config);
    
    // Marcar como cambios sin guardar
    markAsUnsaved();
    
    // Actualizar la vista del board (re-renderizar las stages)
    renderStages();
    
    // Cerrar drawer
    closeSerenaConfigDrawer();
    
    showToast('success', 'Configuración de Serena guardada correctamente');
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

