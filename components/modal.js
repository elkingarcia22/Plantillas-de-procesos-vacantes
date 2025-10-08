/* ========================================
   UBITS MODAL COMPONENT - JAVASCRIPT
   ======================================== */

/**
 * UBITS MODAL COMPONENT - DOCUMENTACIÓN COMPLETA
 * =============================================
 * 
 * Este componente proporciona un sistema completo de modales siguiendo
 * el sistema de diseño UBITS oficial.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - Diseño oficial UBITS con tokens de color y tipografía
 * - Soporte para modales de confirmación, alerta y formularios
 * - Integración con componentes UBITS oficiales (inputs, botones)
 * - Dropdowns flotantes con z-index optimizado para modales
 * - Gestión automática de múltiples modales
 * - Eventos de teclado (ESC) y backdrop click
 * 
 * FUNCIONES DISPONIBLES:
 * ====================
 * 
 * 1. showConfirmModal(options) - Modal de confirmación
 * 2. showAlertModal(options) - Modal de información/alerta  
 * 3. showFormModal(options) - Modal con formulario UBITS
 * 4. UBITSModalManager - Gestor de múltiples modales
 * 
 * EJEMPLOS DE USO:
 * ===============
 * 
 * // 1. MODAL DE CONFIRMACIÓN
 * showConfirmModal({
 *     title: 'Eliminar plantilla',
 *     message: '¿Estás seguro de que quieres eliminar esta plantilla?',
 *     confirmText: 'Eliminar',
 *     cancelText: 'Cancelar',
 *     variant: 'primary', // o 'secondary', 'tertiary'
 *     onConfirm: function() {
 *         // Lógica de confirmación
 *         console.log('Usuario confirmó');
 *     },
 *     onCancel: function() {
 *         // Lógica de cancelación
 *         console.log('Usuario canceló');
 *     }
 * });
 * 
 * // 2. MODAL DE ALERTA
 * showAlertModal({
 *     title: 'Información',
 *     message: 'La plantilla se guardó exitosamente',
 *     buttonText: 'Aceptar',
 *     onClose: function() {
 *         // Lógica al cerrar
 *     }
 * });
 * 
 * // 3. MODAL DE FORMULARIO
 * showFormModal({
 *     title: 'Crear nueva plantilla',
 *     message: 'Completa los datos para crear una nueva plantilla',
 *     fields: [
 *         {
 *             id: 'templateName',
 *             label: 'Nombre de la plantilla',
 *             type: 'text',
 *             placeholder: 'Ej: Proceso de contratación',
 *             required: true,
 *             maxLength: 50
 *         },
 *         {
 *             id: 'templateCategory',
 *             label: 'Categoría',
 *             type: 'select',
 *             required: true,
 *             selectOptions: [
 *                 {value: 'contratacion', text: 'Contratación'},
 *                 {value: 'desarrollo', text: 'Desarrollo'},
 *                 {value: 'ventas', text: 'Ventas'}
 *             ]
 *         }
 *     ],
 *     submitText: 'Crear plantilla',
 *     cancelText: 'Cancelar',
 *     onSubmit: function(formData) {
 *         // formData contiene: {templateName: 'valor', templateCategory: 'valor'}
 *         console.log('Datos del formulario:', formData);
 *     },
 *     onCancel: function() {
 *         console.log('Formulario cancelado');
 *     }
 * });
 * 
 * TIPOS DE CAMPOS SOPORTADOS:
 * ===========================
 * 
 * - text: Input de texto básico
 * - email: Input de email con validación
 * - password: Input de contraseña con toggle mostrar/ocultar
 * - number: Input numérico
 * - tel: Input de teléfono
 * - url: Input de URL
 * - select: Dropdown con opciones (selectOptions requerido)
 * - textarea: Área de texto multilínea
 * - search: Input de búsqueda con botón limpiar
 * - autocomplete: Input con sugerencias automáticas
 * - calendar: Input con date picker
 * 
 * CONFIGURACIÓN DE CAMPOS:
 * =======================
 * 
 * Cada campo puede tener estas propiedades:
 * - id: Identificador único (requerido)
 * - label: Etiqueta del campo
 * - type: Tipo de input (ver tipos soportados)
 * - placeholder: Texto placeholder
 * - required: true/false - Campo obligatorio
 * - maxLength: Longitud máxima del texto
 * - size: 'sm', 'md', 'lg' - Tamaño del input
 * - selectOptions: Array de opciones para tipo 'select'
 *   Ejemplo: [{value: 'valor1', text: 'Texto 1'}, {value: 'valor2', text: 'Texto 2'}]
 * 
 * GESTIÓN DE MÚLTIPLES MODALES:
 * ============================
 * 
 * // Cerrar un modal específico
 * UBITSModalManager.close('modal-id');
 * 
 * // Cerrar todos los modales
 * UBITSModalManager.closeAll();
 * 
 * // Destruir un modal específico
 * UBITSModalManager.destroy('modal-id');
 * 
 * // Destruir todos los modales
 * UBITSModalManager.destroyAll();
 * 
 * INTEGRACIÓN CON COMPONENTES UBITS:
 * =================================
 * 
 * El modal automáticamente:
 * - Usa componentes UBITS oficiales (inputs, botones)
 * - Aplica tokens de color UBITS
 * - Usa tipografía UBITS oficial
 * - Maneja dropdowns flotantes con z-index 999999
 * - Integra con el sistema de iconos FontAwesome
 * 
 * REQUISITOS:
 * ===========
 * 
 * Para que funcione correctamente, asegúrate de tener:
 * - components/modal.css - Estilos del modal
 * - components/input.js - Componente de inputs UBITS
 * - components/input.css - Estilos de inputs UBITS
 * - ubits-colors.css - Tokens de color UBITS
 * - ubits-typography.css - Tipografía UBITS
 * - fontawesome-icons.css - Iconos FontAwesome
 * 
 * NOTAS IMPORTANTES:
 * ==================
 * 
 * 1. Los dropdowns de tipo 'select' se posicionan automáticamente
 *    con position: fixed y z-index: 999999 para aparecer sobre modales
 * 
 * 2. Los callbacks se ejecutan automáticamente cuando el usuario
 *    interactúa con los botones del modal
 * 
 * 3. El modal bloquea el scroll del body automáticamente
 * 
 * 4. Se puede cerrar con ESC o click en backdrop (configurable)
 * 
 * 5. Los inputs UBITS se crean dinámicamente después de abrir el modal
 *    para asegurar que estén correctamente inicializados
 */

/**
 * CLASE PRINCIPAL DEL MODAL UBITS
 * ===============================
 * 
 * Clase que representa un modal individual del sistema UBITS.
 * Maneja la creación, renderizado y comportamiento de un modal específico.
 * 
 * PROPIEDADES:
 * ===========
 * @property {string} id - Identificador único del modal
 * @property {string} title - Título del modal
 * @property {string} content - Contenido HTML del modal
 * @property {Array} footerLeft - Botones del pie izquierdo
 * @property {Array} footerRight - Botones del pie derecho
 * @property {Function} onClose - Callback al cerrar
 * @property {Function} onConfirm - Callback al confirmar
 * @property {boolean} showCloseButton - Mostrar botón X
 * @property {boolean} closeOnBackdrop - Cerrar al hacer click fuera
 * @property {boolean} closeOnEscape - Cerrar con tecla ESC
 * @property {string} maxWidth - Ancho máximo del modal
 * @property {HTMLElement} element - Elemento DOM del modal
 * @property {boolean} isOpen - Estado de apertura
 * 
 * MÉTODOS PRINCIPALES:
 * ===================
 * @method create() - Crear el elemento DOM del modal
 * @method open() - Abrir el modal
 * @method close() - Cerrar el modal
 * @method destroy() - Destruir el modal del DOM
 * @method updateContent(content) - Actualizar contenido
 * @method updateTitle(title) - Actualizar título
 * 
 * @example
 * const modal = new UBITSModal({
 *     id: 'mi-modal',
 *     title: 'Mi Modal',
 *     content: '<p>Contenido del modal</p>',
 *     footerRight: [
 *         {
 *             text: 'Cerrar',
 *             variant: 'secondary',
 *             onclick: 'UBITSModalManager.close("mi-modal")'
 *         }
 *     ]
 * });
 * 
 * modal.create();
 * modal.open();
 */
class UBITSModal {
    constructor(options = {}) {
        this.id = options.id || `ubits-modal-${Date.now()}`;
        this.title = options.title || 'Modal';
        this.content = options.content || '';
        this.footerLeft = options.footerLeft || [];
        this.footerRight = options.footerRight || [];
        this.onClose = options.onClose || null;
        this.onConfirm = options.onConfirm || null;
        this.showCloseButton = options.showCloseButton !== false;
        this.closeOnBackdrop = options.closeOnBackdrop !== false;
        this.closeOnEscape = options.closeOnEscape !== false;
        this.maxWidth = options.maxWidth || '440px';
        
        this.element = null;
        this.isOpen = false;
    }

    create() {
        const modalHTML = `
            <div class="ubits-modal" id="${this.id}">
                <div class="ubits-modal__container" style="max-width: ${this.maxWidth}">
                    ${this.createHeader()}
                    ${this.createBody()}
                    ${this.createFooter()}
                </div>
            </div>
        `;

        // Crear elemento temporal para parsear HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHTML;
        this.element = tempDiv.firstElementChild;

        // Agregar al DOM
        document.body.appendChild(this.element);

        // Agregar event listeners
        this.addEventListeners();

        return this.element;
    }

    createHeader() {
        const closeButton = this.showCloseButton ? `
            <button class="ubits-modal__close" onclick="UBITSModalManager.close('${this.id}')">
                <i class="far fa-times"></i>
            </button>
        ` : '';

        return `
            <div class="ubits-modal__header">
                <h3 class="ubits-modal__title">${this.title}</h3>
                ${closeButton}
            </div>
        `;
    }

    createBody() {
        return `
            <div class="ubits-modal__body">
                ${this.content}
            </div>
        `;
    }

    createFooter() {
        const leftButtons = this.footerLeft.map(button => this.createButton(button)).join('');
        const rightButtons = this.footerRight.map(button => this.createButton(button)).join('');

        return `
            <div class="ubits-modal__footer">
                ${leftButtons ? `<div class="ubits-modal__footer-left">${leftButtons}</div>` : ''}
                ${rightButtons ? `<div class="ubits-modal__footer-right">${rightButtons}</div>` : ''}
            </div>
        `;
    }

    createButton(buttonConfig) {
        const {
            text,
            variant = 'secondary',
            size = 'md',
            icon = null,
            onclick = null,
            id = null,
            disabled = false,
            type = 'button'
        } = buttonConfig;

        const iconHTML = icon ? `<i class="${icon}"></i>` : '';
        const textHTML = text ? `<span>${text}</span>` : '';
        const iconOnlyClass = !text && icon ? ' ubits-button--icon-only' : '';
        const disabledAttr = disabled ? ' disabled' : '';
        const idAttr = id ? ` id="${id}"` : '';
        const onclickAttr = onclick ? ` onclick="${onclick}"` : '';

        return `
            <button class="ubits-button ubits-button--${variant} ubits-button--${size}${iconOnlyClass}"${idAttr}${onclickAttr}${disabledAttr} type="${type}">
                ${iconHTML}
                ${textHTML}
            </button>
        `;
    }

    addEventListeners() {
        if (!this.element) return;

        // Cerrar con ESC
        if (this.closeOnEscape) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });
        }

        // Cerrar al hacer click en backdrop
        if (this.closeOnBackdrop) {
            this.element.addEventListener('click', (e) => {
                if (e.target === this.element) {
                    this.close();
                }
            });
        }
    }

    open() {
        if (!this.element) {
            this.create();
        }

        this.element.classList.add('show');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
    }

    close() {
        if (!this.element || !this.isOpen) return;

        this.element.classList.remove('show');
        this.isOpen = false;
        document.body.style.overflow = '';

        if (this.onClose) {
            this.onClose();
        }
    }

    destroy() {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
        this.isOpen = false;
    }

    updateContent(content) {
        if (this.element) {
            const body = this.element.querySelector('.ubits-modal__body');
            if (body) {
                body.innerHTML = content;
            }
        }
    }

    updateTitle(title) {
        if (this.element) {
            const titleElement = this.element.querySelector('.ubits-modal__title');
            if (titleElement) {
                titleElement.textContent = title;
            }
        }
    }
}

/**
 * GESTOR DE MODALES UBITS
 * =======================
 * 
 * Clase estática que gestiona múltiples instancias de modales UBITS.
 * Permite crear, abrir, cerrar y destruir modales de forma centralizada.
 * 
 * MÉTODOS DISPONIBLES:
 * ===================
 * 
 * @static UBITSModalManager.create(options) - Crear un nuevo modal
 * @static UBITSModalManager.open(id) - Abrir un modal específico
 * @static UBITSModalManager.close(id) - Cerrar un modal específico
 * @static UBITSModalManager.destroy(id) - Destruir un modal específico
 * @static UBITSModalManager.closeAll() - Cerrar todos los modales
 * @static UBITSModalManager.destroyAll() - Destruir todos los modales
 * 
 * @example
 * // Crear un modal personalizado
 * const modal = UBITSModalManager.create({
 *     id: 'mi-modal',
 *     title: 'Mi Modal',
 *     content: '<p>Contenido personalizado</p>',
 *     footerRight: [
 *         {
 *             text: 'Cerrar',
 *             variant: 'secondary',
 *             onclick: 'UBITSModalManager.close("mi-modal")'
 *         }
 *     ]
 * });
 * 
 * // Abrir el modal
 * UBITSModalManager.open('mi-modal');
 * 
 * // Cerrar todos los modales
 * UBITSModalManager.closeAll();
 */
class UBITSModalManager {
    static modals = new Map();

    static create(options = {}) {
        const modal = new UBITSModal(options);
        this.modals.set(modal.id, modal);
        return modal;
    }

    static open(id) {
        const modal = this.modals.get(id);
        if (modal) {
            modal.open();
        }
    }

    static close(id) {
        const modal = this.modals.get(id);
        if (modal) {
            modal.close();
        }
    }

    static destroy(id) {
        const modal = this.modals.get(id);
        if (modal) {
            modal.destroy();
            this.modals.delete(id);
        }
    }

    static closeAll() {
        this.modals.forEach(modal => modal.close());
    }

    static destroyAll() {
        this.modals.forEach(modal => modal.destroy());
        this.modals.clear();
    }
}

// ========================================
// FUNCIONES HELPER PARA CASOS COMUNES
// ========================================

/**
 * MODAL DE CONFIRMACIÓN
 * =====================
 * 
 * Muestra un modal de confirmación con botones de "Confirmar" y "Cancelar".
 * Ideal para confirmar acciones destructivas o importantes.
 * 
 * @param {Object} options - Opciones del modal
 * @param {string} options.title - Título del modal (default: 'Confirmar acción')
 * @param {string} options.message - Mensaje a mostrar (default: '¿Estás seguro?')
 * @param {string} options.confirmText - Texto del botón confirmar (default: 'Confirmar')
 * @param {string} options.cancelText - Texto del botón cancelar (default: 'Cancelar')
 * @param {string} options.variant - Variante del botón confirmar: 'primary', 'secondary', 'tertiary' (default: 'primary')
 * @param {Function} options.onConfirm - Callback ejecutado al confirmar
 * @param {Function} options.onCancel - Callback ejecutado al cancelar
 * 
 * @returns {UBITSModal} Instancia del modal creado
 * 
 * @example
 * showConfirmModal({
 *     title: 'Eliminar plantilla',
 *     message: '¿Estás seguro de que quieres eliminar esta plantilla? Esta acción no se puede deshacer.',
 *     confirmText: 'Eliminar',
 *     cancelText: 'Cancelar',
 *     variant: 'primary',
 *     onConfirm: function() {
 *         deleteTemplate(templateId);
 *     },
 *     onCancel: function() {
 *         console.log('Eliminación cancelada');
 *     }
 * });
 */
function showConfirmModal(options = {}) {
    const {
        title = 'Confirmar acción',
        message = '¿Estás seguro?',
        confirmText = 'Confirmar',
        cancelText = 'Cancelar',
        onConfirm = null,
        onCancel = null,
        variant = 'primary',
        singleButton = false
    } = options;

    const modalId = `confirm-modal-${Date.now()}`;
    
    // Crear array de botones según la configuración
    let footerButtons = [];
    
    if (singleButton) {
        // Solo botón de confirmar
        footerButtons = [
            {
                text: confirmText,
                variant: variant,
                onclick: `UBITSModalManager.close('${modalId}'); if (window.modalConfirmCallback) window.modalConfirmCallback();`
            }
        ];
    } else {
        // Botones de cancelar y confirmar
        footerButtons = [
            {
                text: cancelText,
                variant: 'secondary',
                onclick: `UBITSModalManager.close('${modalId}'); if (window.modalCancelCallback) window.modalCancelCallback();`
            },
            {
                text: confirmText,
                variant: variant,
                onclick: `UBITSModalManager.close('${modalId}'); if (window.modalConfirmCallback) window.modalConfirmCallback();`
            }
        ];
    }
    
    const modal = UBITSModalManager.create({
        id: modalId,
        title,
        content: `<p class="ubits-modal__content">${message}</p>`,
        footerRight: footerButtons,
        onClose: onCancel
    });

    // Guardar callbacks globalmente
    window.modalCancelCallback = onCancel;
    window.modalConfirmCallback = onConfirm;

    modal.open();
    return modal;
}

/**
 * MODAL DE ALERTA/INFORMACIÓN
 * ===========================
 * 
 * Muestra un modal informativo con un solo botón de "Aceptar".
 * Ideal para mostrar mensajes de éxito, error o información general.
 * 
 * @param {Object} options - Opciones del modal
 * @param {string} options.title - Título del modal (default: 'Información')
 * @param {string} options.message - Mensaje a mostrar (default: '')
 * @param {string} options.buttonText - Texto del botón (default: 'Aceptar')
 * @param {Function} options.onClose - Callback ejecutado al cerrar el modal
 * 
 * @returns {UBITSModal} Instancia del modal creado
 * 
 * @example
 * showAlertModal({
 *     title: 'Éxito',
 *     message: 'La plantilla se guardó correctamente',
 *     buttonText: 'Continuar',
 *     onClose: function() {
 *         console.log('Modal cerrado');
 *     }
 * });
 */
function showAlertModal(options = {}) {
    const {
        title = 'Información',
        message = '',
        buttonText = 'Aceptar',
        onClose = null
    } = options;

    const modal = UBITSModalManager.create({
        title,
        content: `<p class="ubits-modal__content">${message}</p>`,
        footerRight: [
            {
                text: buttonText,
                variant: 'primary',
                onclick: `UBITSModalManager.close('${modal.id}')`
            }
        ],
        onClose
    });

    modal.open();
    return modal;
}

/**
 * MODAL DE FORMULARIO UBITS
 * =========================
 * 
 * Muestra un modal con un formulario usando componentes UBITS oficiales.
 * Soporta múltiples tipos de campos y validación automática.
 * 
 * @param {Object} options - Opciones del modal
 * @param {string} options.title - Título del modal (default: 'Formulario')
 * @param {string} options.message - Mensaje descriptivo (opcional)
 * @param {Array} options.fields - Array de campos del formulario
 * @param {string} options.submitText - Texto del botón enviar (default: 'Guardar')
 * @param {string} options.cancelText - Texto del botón cancelar (default: 'Cancelar')
 * @param {Function} options.onSubmit - Callback ejecutado al enviar (recibe formData)
 * @param {Function} options.onCancel - Callback ejecutado al cancelar
 * 
 * @returns {UBITSModal} Instancia del modal creado
 * 
 * @example
 * showFormModal({
 *     title: 'Crear nueva etapa',
 *     fields: [
 *         {
 *             id: 'stageName',
 *             label: 'Nombre de la etapa',
 *             type: 'text',
 *             placeholder: 'Ej: Entrevista técnica',
 *             required: true,
 *             maxLength: 50
 *         },
 *         {
 *             id: 'stageCategory',
 *             label: 'Categoría',
 *             type: 'select',
 *             required: true,
 *             selectOptions: [
 *                 {value: 'entrevistas', text: 'Entrevistas'},
 *                 {value: 'pruebas', text: 'Pruebas técnicas'}
 *             ]
 *         }
 *     ],
 *     submitText: 'Crear etapa',
 *     cancelText: 'Cancelar',
 *     onSubmit: function(formData) {
 *         // formData = {stageName: 'valor', stageCategory: 'valor'}
 *         createStage(formData.stageName, formData.stageCategory);
 *     },
 *     onCancel: function() {
 *         console.log('Creación cancelada');
 *     }
 * });
 */
function showFormModal(options = {}) {
    const {
        title = 'Formulario',
        message = '',
        fields = [],
        submitText = 'Guardar',
        cancelText = 'Cancelar',
        onSubmit = null,
        onCancel = null
    } = options;

    const modalId = 'modal-' + Date.now();
    
    // Crear contenido del modal con inputs UBITS oficiales
    let formHTML = '';
    if (message) {
        formHTML += `<p class="modal-message">${message}</p>`;
    }
    
    formHTML += '<div class="modal-form">';
    fields.forEach(field => {
        const { id, label, type, placeholder, required, maxLength, size = 'md', selectOptions } = field;
        
        formHTML += `<div class="form-field" id="field-${id}"></div>`;
    });
    formHTML += '</div>';

    const modal = UBITSModalManager.create({
        id: modalId,
        title,
        content: formHTML,
        footerRight: [
            {
                text: cancelText,
                variant: 'secondary',
                onclick: `UBITSModalManager.close('${modalId}'); setTimeout(() => UBITSModalManager.destroy('${modalId}'), 300); ${onCancel ? onCancel() : ''}`
            },
            {
                text: submitText,
                variant: 'primary',
                onclick: `submitFormModal('${modalId}', ${JSON.stringify(fields).replace(/"/g, '&quot;')}, ${onSubmit ? 'true' : 'false'});`
            }
        ],
        onClose: () => {
            // Limpiar todos los dropdowns flotantes antes de destruir el modal
            document.querySelectorAll('.ubits-select-dropdown--floating').forEach(dropdown => {
                dropdown.remove();
            });
            setTimeout(() => UBITSModalManager.destroy(modalId), 300);
            if (onCancel) onCancel();
        }
    });

    modal.open();
    
    // Crear inputs UBITS oficiales después de que el modal esté abierto
    setTimeout(() => {
        fields.forEach(field => {
            const { id, label, type, placeholder, required, maxLength, size = 'md', selectOptions, value } = field;
            
            // Limpiar el contenedor antes de crear el input
            const container = document.getElementById(`field-${id}`);
            if (container) {
                container.innerHTML = '';
            }
            
            const inputOptions = {
                containerId: `field-${id}`,
                label: label,
                placeholder: placeholder || '',
                type: type,
                size: size,
                mandatory: required,
                mandatoryType: 'obligatorio',
                maxLength: maxLength || 50
            };
            
            // Agregar valor inicial si existe
            if (value !== undefined && value !== null) {
                inputOptions.value = value;
            }
            
            // Agregar opciones específicas según el tipo
            if (type === 'select' && selectOptions) {
                inputOptions.selectOptions = selectOptions;
            }
            
            // Crear el input UBITS oficial
            if (typeof createInput === 'function') {
                createInput(inputOptions);
            } else {
                console.error('createInput function not available');
            }
        });
    }, 100);

    return modal;
}

/**
 * FUNCIÓN AUXILIAR PARA ENVIAR FORMULARIOS
 * ========================================
 * 
 * Función interna que procesa los datos del formulario y ejecuta el callback.
 * Se ejecuta automáticamente cuando el usuario hace clic en "Enviar".
 * 
 * @param {string} modalId - ID del modal
 * @param {Array} fields - Array de campos del formulario
 * @param {boolean} hasCallback - Si tiene callback de onSubmit
 * 
 * @private
 */
function submitFormModal(modalId, fields, hasCallback) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const formData = {};
    fields.forEach(field => {
        const { id, type } = field;
        // Buscar el input dentro del contenedor UBITS
        const input = modal.querySelector(`#field-${id} .ubits-input`);
        if (input) {
            // Para selects, usar el valor guardado en dataset, no el texto visible
            if (type === 'select' && input.dataset.selectedValue) {
                formData[id] = input.dataset.selectedValue;
            } else {
                formData[id] = input.value;
            }
        }
    });
    
    // Limpiar todos los dropdowns flotantes antes de cerrar el modal
    document.querySelectorAll('.ubits-select-dropdown--floating').forEach(dropdown => {
        dropdown.remove();
    });
    
    UBITSModalManager.close(modalId);
    setTimeout(() => UBITSModalManager.destroy(modalId), 300);
    
    if (hasCallback && window.modalFormCallback) {
        window.modalFormCallback(formData);
    }
}

// ========================================
// EXPORTAR AL WINDOW GLOBAL
// ========================================

/**
 * EXPORTACIÓN GLOBAL
 * ==================
 * 
 * Todas las funciones y clases se exportan al objeto window global
 * para facilitar su uso en cualquier parte de la aplicación.
 * 
 * FUNCIONES DISPONIBLES GLOBALMENTE:
 * =================================
 * - window.showConfirmModal(options) - Modal de confirmación
 * - window.showAlertModal(options) - Modal de alerta/información
 * - window.showFormModal(options) - Modal de formulario UBITS
 * - window.submitFormModal(modalId, fields, hasCallback) - Enviar formulario
 * - window.UBITSModalManager - Gestor de modales
 * - window.UBITSModal - Clase principal del modal
 * 
 * EJEMPLOS PRÁCTICOS DE USO:
 * =========================
 * 
 * // 1. CONFIRMAR ELIMINACIÓN
 * function deleteTemplate(templateId) {
 *     showConfirmModal({
 *         title: 'Eliminar plantilla',
 *         message: '¿Estás seguro de que quieres eliminar esta plantilla? Esta acción no se puede deshacer.',
 *         confirmText: 'Eliminar',
 *         cancelText: 'Cancelar',
 *         variant: 'primary',
 *         onConfirm: function() {
 *             // Lógica de eliminación
 *             removeTemplateFromStorage(templateId);
 *             renderTemplates();
 *             showToast('success', 'Plantilla eliminada correctamente');
 *         }
 *     });
 * }
 * 
 * // 2. MOSTRAR MENSAJE DE ÉXITO
 * function showSuccessMessage(message) {
 *     showAlertModal({
 *         title: 'Éxito',
 *         message: message,
 *         buttonText: 'Continuar',
 *         onClose: function() {
 *             // Opcional: ejecutar acción después de cerrar
 *         }
 *     });
 * }
 * 
 * // 3. CREAR NUEVA PLANTILLA
 * function createNewTemplate() {
 *     showFormModal({
 *         title: 'Crear nueva plantilla',
 *         fields: [
 *             {
 *                 id: 'templateName',
 *                 label: 'Nombre de la plantilla',
 *                 type: 'text',
 *                 placeholder: 'Ej: Proceso de contratación',
 *                 required: true,
 *                 maxLength: 50
 *             },
 *             {
 *                 id: 'templateCategory',
 *                 label: 'Categoría',
 *                 type: 'select',
 *                 required: true,
 *                 selectOptions: [
 *                     {value: 'contratacion', text: 'Contratación'},
 *                     {value: 'desarrollo', text: 'Desarrollo'},
 *                     {value: 'ventas', text: 'Ventas'},
 *                     {value: 'marketing', text: 'Marketing'}
 *                 ]
 *             }
 *         ],
 *         submitText: 'Crear plantilla',
 *         cancelText: 'Cancelar',
 *         onSubmit: function(formData) {
 *             const newTemplate = {
 *                 id: 'template-' + Date.now(),
 *                 name: formData.templateName,
 *                 category: formData.templateCategory,
 *                 createdAt: new Date().toISOString(),
 *                 realContent: {
 *                     stages: [],
 *                     agents: []
 *                 }
 *             };
 *             
 *             saveTemplateToStorage(newTemplate);
 *             renderTemplates();
 *             showSuccessMessage('Plantilla creada exitosamente');
 *         }
 *     });
 * }
 * 
 * // 4. CREAR NUEVA ETAPA
 * function createNewStage() {
 *     showFormModal({
 *         title: 'Crear nueva etapa',
 *         fields: [
 *             {
 *                 id: 'stageName',
 *                 label: 'Nombre de la etapa',
 *                 type: 'text',
 *                 placeholder: 'Ej: Entrevista técnica',
 *                 required: true,
 *                 maxLength: 50
 *             },
 *             {
 *                 id: 'stageCategory',
 *                 label: 'Categoría',
 *                 type: 'select',
 *                 required: true,
 *                 selectOptions: [
 *                     {value: 'evaluacion-inicial', text: 'Evaluación inicial'},
 *                     {value: 'entrevistas', text: 'Entrevistas'},
 *                     {value: 'evaluacion-psicometrica', text: 'Evaluación psicométrica'},
 *                     {value: 'pruebas-tecnicas', text: 'Pruebas técnicas'},
 *                     {value: 'verificacion', text: 'Verificación'},
 *                     {value: 'decision-final', text: 'Decisión final'}
 *                 ]
 *             }
 *         ],
 *         submitText: 'Crear etapa',
 *         cancelText: 'Cancelar',
 *         onSubmit: function(formData) {
 *             const newStage = {
 *                 id: 'stage-' + Date.now(),
 *                 name: formData.stageName,
 *                 category: formData.stageCategory,
 *                 createdAt: new Date().toISOString()
 *             };
 *             
 *             addStageToAvailable(newStage);
 *             renderAvailableStages();
 *             showSuccessMessage('Etapa creada exitosamente');
 *         }
 *     });
 * }
 * 
 * // 5. CONFIRMAR SALIDA SIN GUARDAR
 * function confirmExitWithoutSaving() {
 *     showConfirmModal({
 *         title: 'Cambios sin guardar',
 *         message: 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?',
 *         confirmText: 'Salir sin guardar',
 *         cancelText: 'Cancelar',
 *         variant: 'secondary',
 *         onConfirm: function() {
 *             // Marcar como guardado para evitar el modal del navegador
 *             hasUnsavedChanges = false;
 *             // Navegar a otra página
 *             window.location.href = 'index.html';
 *         }
 *     });
 * }
 */

// Exportar al window global
window.UBITSModal = UBITSModal;
window.UBITSModalManager = UBITSModalManager;
window.showConfirmModal = showConfirmModal;
window.showAlertModal = showAlertModal;
window.showFormModal = showFormModal;
window.submitFormModal = submitFormModal;
