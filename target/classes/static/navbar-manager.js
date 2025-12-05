/**
 * Navbar Manager - Prato Justo
 * Gerencia a navbar de forma centralizada e marca a página ativa automaticamente
 */
class NavbarManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    /**
     * Obtém o nome da página atual
     */
    getCurrentPage() {
        // Tenta obter da URL
        let path = window.location.pathname;
        let page = path.split('/').pop();
        
        // Se não encontrou, tenta do hash ou search
        if (!page || page === '' || page === '/') {
            page = 'index.html';
        }
        
        // Remove query strings e hash
        page = page.split('?')[0].split('#')[0];
        
        // Normaliza para lowercase mas preserva estrutura para comparação
        const normalized = page.toLowerCase();
        
        // Debug
        console.log('Página detectada:', page, '-> Normalizada:', normalized);
        
        return normalized;
    }

    /**
     * Inicializa o gerenciador
     */
    init() {
        this.markActivePage();
        this.setupMobileMenu();
    }

    /**
     * Marca a página ativa na navbar
     */
    markActivePage() {
        // Remove todas as classes active existentes
        const allLinks = document.querySelectorAll('.nav-link');
        allLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });

        // Mapeamento de páginas para links (case-insensitive)
        const pageMap = {
            'index.html': ['index.html', './index.html'],
            'doacoes.html': ['doacoes.html', './doacoes.html', 'alimentos disponíveis'],
            'cadastro_alimento.html': ['cadastro_alimento.html', './cadastro_alimento.html'],
            'minhas-doacoes.html': ['minhas-doacoes.html', './minhas-doacoes.html'],
            'solicitacoes.html': ['solicitacoes.html', './solicitacoes.html'],
            'sobre.html': ['./Sobre.html', 'Sobre.html', './sobre.html'],
            'comodoar.html': ['./Como_Doar.html', 'Como_Doar.html', './comodoar.html', './Como_Doar.html'],
            'como_doar.html': ['./Como_Doar.html', 'Como_Doar.html', './Como_Doar.html'],
            'como-doar.html': ['./Como_Doar.html', 'Como_Doar.html', './Como_Doar.html'],
            'porquedoar.html': ['./porqueDoar.html', 'porqueDoar.html', './porquedoar.html'],
            'paginausuario.html': ['paginaUsuario.html', './paginaUsuario.html'],
            'detalhes-alimento.html': ['detalhes-alimento.html', './detalhes-alimento.html'],
            'chat.html': ['chat.html', './chat.html']
        };

        // Encontra o link correspondente - busca mais flexível
        const targetHrefs = pageMap[this.currentPage];
        if (targetHrefs) {
            let activeLink = null;
            
            // Tenta cada variação do href
            for (const href of targetHrefs) {
                activeLink = document.querySelector(`.nav-link[href="${href}"]`);
                if (activeLink) break;
            }
            
            // Se não encontrou, tenta busca case-insensitive e por nome do arquivo
            if (!activeLink) {
                const allLinks = document.querySelectorAll('.nav-link');
                const currentPageLower = this.currentPage.toLowerCase();
                // Remove extensão e normaliza
                const currentPageName = currentPageLower.replace('.html', '').replace(/_/g, '').replace(/-/g, '');
                
                allLinks.forEach(link => {
                    const linkHref = link.getAttribute('href') || '';
                    const linkHrefLower = linkHref.toLowerCase();
                    const linkFileName = linkHrefLower.split('/').pop().replace('.html', '').replace(/_/g, '').replace(/-/g, '');
                    
                    // Verifica se o href contém o nome da página atual ou se os nomes normalizados coincidem
                    if (linkHrefLower.includes(currentPageLower) || 
                        currentPageLower.includes(linkHrefLower.split('/').pop().replace('.html', '')) ||
                        linkFileName === currentPageName) {
                        activeLink = link;
                    }
                });
            }
            
            if (activeLink) {
                activeLink.classList.add('active');
                activeLink.setAttribute('aria-current', 'page');
                console.log('Página ativa marcada:', activeLink.getAttribute('href'));
            } else {
                console.warn('Link ativo não encontrado para:', this.currentPage);
            }
        }

        // Se estiver em uma página dentro do dropdown "Minhas Doações", marca o dropdown como ativo
        const dropdownPages = ['solicitacoes.html', 'cadastro_alimento.html', 'chat.html', 'minhas-doacoes.html'];
        if (dropdownPages.includes(this.currentPage)) {
            const dropdownToggle = document.querySelector('.dropdown-toggle');
            if (dropdownToggle) {
                dropdownToggle.classList.add('active');
            }
        }
    }

    /**
     * Configura o menu mobile
     */
    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileOverlay = document.getElementById('mobile-overlay');
        const navMenu = document.getElementById('nav-menu');
        const headerButtons = document.querySelector('.header-buttons');

        if (!mobileMenuBtn) return;

        mobileMenuBtn.addEventListener('click', () => {
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            
            mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
            
            if (navMenu) {
                navMenu.classList.toggle('active');
            }
            
            if (headerButtons) {
                headerButtons.classList.toggle('active');
            }
            
            if (mobileOverlay) {
                mobileOverlay.classList.toggle('active');
            }
            
            document.body.style.overflow = !isExpanded ? 'hidden' : '';
        });

        // Fechar menu ao clicar no overlay
        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', () => {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                if (navMenu) navMenu.classList.remove('active');
                if (headerButtons) headerButtons.classList.remove('active');
                mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Fechar menu ao clicar em um link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                    if (navMenu) navMenu.classList.remove('active');
                    if (headerButtons) headerButtons.classList.remove('active');
                    if (mobileOverlay) mobileOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
    }
}

// Inicialização automática
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.navbarManager = new NavbarManager();
    });
} else {
    window.navbarManager = new NavbarManager();
}

