/* ========================================
   TAB BAR RECLUTAMIENTO COMPONENT - RESPONSIVE
   ======================================== */

/**
 * Genera el HTML del tab-bar de reclutamiento
 * @returns {string} HTML del tab-bar
 */
function getTabBarReclutamientoHTML() {
    return `
        <div class="tab-bar" id="tab-bar-reclutamiento">
            <div class="tab-bar-content">
                <div class="tab-bar-item" data-tab="menu" onclick="navigateToTabReclutamiento('menu')">
                    <i class="far fa-bars tab-bar-icon"></i>
                    <span class="tab-bar-text">Menu</span>
                </div>
                <div class="tab-bar-item" data-tab="perfil" onclick="navigateToTabReclutamiento('perfil')">
                    <img src="images/Profile-image.jpg" alt="Mi perfil" class="tab-bar-avatar">
                    <span class="tab-bar-text">Mi perfil</span>
                </div>
                <div class="tab-bar-item" data-tab="modo-oscuro" onclick="navigateToTabReclutamiento('modo-oscuro')">
                    <i class="far fa-moon tab-bar-icon"></i>
                    <span class="tab-bar-text">Modo oscuro</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Carga el tab-bar de reclutamiento en el contenedor especificado
 * @param {string} containerId - ID del contenedor donde cargar el tab-bar
 */
function loadTabBarReclutamiento(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Contenedor '${containerId}' no encontrado`);
        return;
    }

    // Cargar el componente HTML
    fetch('components/tab-bar-reclutamiento.html')
        .then(response => response.text())
        .then(html => {
            container.innerHTML = html;
            
            // Agregar event listeners
            addTabBarReclutamientoEventListeners();
            
            // Activar el tab correcto basado en la página actual
            activateCurrentPageTabReclutamiento();
            
            console.log('Tab bar reclutamiento component loaded successfully');
        })
        .catch(error => {
            console.error('Error loading tab-bar-reclutamiento component:', error);
            // Fallback al HTML generado
            container.innerHTML = getTabBarReclutamientoHTML();
            addTabBarReclutamientoEventListeners();
            activateCurrentPageTabReclutamiento();
        });
}

/**
 * Agrega event listeners a los items del tab-bar de reclutamiento
 */
function addTabBarReclutamientoEventListeners() {
    const tabItems = document.querySelectorAll('#tab-bar-reclutamiento .tab-bar-item');
    
    tabItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const tabId = this.getAttribute('data-tab');
            console.log('Tab reclutamiento clicked:', tabId);
            
            // Si es modo oscuro, cerrar cualquier floating menu y cambiar tema
            if (tabId === 'modo-oscuro') {
                e.stopPropagation();
                // Cerrar cualquier floating menu abierto
                if (typeof hideFloatingMenu === 'function') {
                    hideFloatingMenu();
                }
                if (typeof hideProfileMenu === 'function') {
                    hideProfileMenu();
                }
                // Cambiar tema
                if (typeof toggleDarkMode === 'function') {
                    toggleDarkMode();
                }
                return;
            }
            
            // Si es menu, toggle floating menu de reclutamiento
            if (tabId === 'menu') {
                e.stopPropagation();
                const reclutamientoMenu = document.getElementById('floating-menu-reclutamiento');
                if (reclutamientoMenu) {
                    if (reclutamientoMenu.classList.contains('show')) {
                        reclutamientoMenu.classList.remove('show');
                    } else {
                        reclutamientoMenu.classList.add('show');
                    }
                }
                return;
            }
            
            // Si es perfil, toggle profile menu
            if (tabId === 'perfil') {
                e.stopPropagation();
                const perfilMenu = document.getElementById('profile-menu');
                if (perfilMenu) {
                    if (perfilMenu.classList.contains('show')) {
                        perfilMenu.classList.remove('show');
                    } else {
                        perfilMenu.classList.add('show');
                    }
                }
                return;
            }
            
            // Navegación normal para otros tabs
            const result = navigateToTabReclutamiento(tabId);
            
            // Si navigateToTabReclutamiento retorna false, no activar el tab
            if (result === false) {
                return;
            }
        });
    });
}

/**
 * Navega a la página correspondiente en el contexto de reclutamiento
 * @param {string} tabId - ID del tab clickeado
 */
function navigateToTabReclutamiento(tabId) {
    console.log('Navegando a tab de reclutamiento:', tabId);
    
    switch(tabId) {
        case 'dashboard':
            // Navegar al dashboard de reclutamiento (deshabilitado por ahora)
            console.log('Dashboard de reclutamiento - deshabilitado');
            return false;
        case 'vacantes':
            // Navegar a vacantes (deshabilitado por ahora)
            console.log('Vacantes - deshabilitado');
            return false;
        case 'plantillas':
            // Ya estamos en plantillas, no hacer nada
            console.log('Ya estamos en plantillas');
            return false;
        case 'perfil':
            // Navegar al perfil
            window.location.href = 'profile.html';
            return true;
        default:
            console.log('Tab no reconocido:', tabId);
            return false;
    }
}

/**
 * Activa el tab correcto basado en la página actual para reclutamiento
 */
function activateCurrentPageTabReclutamiento() {
    // Obtener la URL actual
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop().replace('.html', '');
    
    console.log('Current page detected for reclutamiento:', currentPage);
    
    // Remover clase active de todos los tabs de reclutamiento
    const allTabs = document.querySelectorAll('#tab-bar-reclutamiento .tab-bar-item');
    allTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Activar el tab correspondiente a la página actual
    let tabToActivate = null;
    
    switch(currentPage) {
        case 'index':
        case 'editor-plantillas':
            // Páginas de plantillas activan el tab de menu
            tabToActivate = document.querySelector('#tab-bar-reclutamiento [data-tab="menu"]');
            break;
        case '':
            // Página principal - activar menu
            tabToActivate = document.querySelector('#tab-bar-reclutamiento [data-tab="menu"]');
            break;
        default:
            console.log('Página no reconocida para activación de tab reclutamiento:', currentPage);
            break;
    }
    
    // Activar el tab si se encontró
    if (tabToActivate) {
        tabToActivate.classList.add('active');
        console.log('Tab reclutamiento activado:', tabToActivate.getAttribute('data-tab'));
    }
}

// Exportar funciones para uso global
window.getTabBarReclutamientoHTML = getTabBarReclutamientoHTML;
window.loadTabBarReclutamiento = loadTabBarReclutamiento;
window.addTabBarReclutamientoEventListeners = addTabBarReclutamientoEventListeners;
window.navigateToTabReclutamiento = navigateToTabReclutamiento;
window.activateCurrentPageTabReclutamiento = activateCurrentPageTabReclutamiento;
