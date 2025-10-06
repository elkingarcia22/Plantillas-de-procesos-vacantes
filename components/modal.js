/* ========================================
   UBITS MODAL COMPONENT - JAVASCRIPT
   ======================================== */

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

// Funciones helper para casos comunes
function showConfirmModal(options = {}) {
    const {
        title = 'Confirmar acción',
        message = '¿Estás seguro?',
        confirmText = 'Confirmar',
        cancelText = 'Cancelar',
        onConfirm = null,
        onCancel = null,
        variant = 'primary'
    } = options;

    const modalId = `confirm-modal-${Date.now()}`;
    
    const modal = UBITSModalManager.create({
        id: modalId,
        title,
        content: `<p class="ubits-modal__content">${message}</p>`,
        footerRight: [
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
        ],
        onClose: onCancel
    });

    // Guardar callbacks globalmente
    window.modalCancelCallback = onCancel;
    window.modalConfirmCallback = onConfirm;

    modal.open();
    return modal;
}

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
                onclick: `UBITSModalManager.close('${modalId}'); ${onCancel ? onCancel() : ''}`
            },
            {
                text: submitText,
                variant: 'primary',
                onclick: `submitFormModal('${modalId}', ${JSON.stringify(fields).replace(/"/g, '&quot;')}, ${onSubmit ? 'true' : 'false'});`
            }
        ],
        onClose: onCancel
    });

    modal.open();
    
    // Crear inputs UBITS oficiales después de que el modal esté abierto
    setTimeout(() => {
        fields.forEach(field => {
            const { id, label, type, placeholder, required, maxLength, size = 'md', selectOptions } = field;
            
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

// Función auxiliar para enviar el formulario
function submitFormModal(modalId, fields, hasCallback) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const formData = {};
    fields.forEach(field => {
        const { id } = field;
        // Buscar el input dentro del contenedor UBITS
        const input = modal.querySelector(`#field-${id} .ubits-input`);
        if (input) {
            formData[id] = input.value;
        }
    });
    
    UBITSModalManager.close(modalId);
    
    if (hasCallback && window.modalFormCallback) {
        window.modalFormCallback(formData);
    }
}

// Exportar al window global
window.UBITSModal = UBITSModal;
window.UBITSModalManager = UBITSModalManager;
window.showConfirmModal = showConfirmModal;
window.showAlertModal = showAlertModal;
window.showFormModal = showFormModal;
window.submitFormModal = submitFormModal;
