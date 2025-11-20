// =========================================
// JAVASCRIPT - PRATO JUSTO
// Funcionalidades completas e interatividade


// Animação de scroll para as seções
document.addEventListener('DOMContentLoaded', function() {
    // Animação de entrada das seções
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    // Observar todos os elementos com data-animate
    document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
    });

    // Smooth scroll para a próxima seção
    const scrollIndicator = document.querySelector('.scroll-indicator-premium');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const nextSection = document.querySelector('.missao-section-premium');
            if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Botão "Seja Parceiro"
    const sejaParceiroBtn = document.getElementById('sejaParceiroBtn');
    if (sejaParceiroBtn) {
        sejaParceiroBtn.addEventListener('click', function() {
            alert('Obrigado pelo interesse em ser nosso parceiro! Em breve entraremos em contato.');
        });
    }

    // Menu mobile
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const headerActions = document.getElementById('header-actions');
    const mobileOverlay = document.getElementById('mobile-overlay');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
            headerActions.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            document.body.style.overflow = isExpanded ? 'auto' : 'hidden';
        });
    }

    // Fechar menu ao clicar no overlay
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', function() {
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
            headerActions.classList.remove('active');
            this.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.getElementById('main-header');
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Prato Justo - Site carregado com sucesso!');

    // ===== MENU MOBILE =====
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelectorAll('.nav__link');

    // Abrir/Fechar menu mobile
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show-menu');
            navToggle.innerHTML = navMenu.classList.contains('show-menu')
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
        });
    }

    // Fechar menu ao clicar em um link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('show-menu');
            navToggle.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });

    // ===== HEADER SCROLL EFFECT =====
    const header = document.getElementById('header');

    function scrollHeader() {
        if (window.scrollY >= 50) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    }
    window.addEventListener('scroll', scrollHeader);

    // ===== ANIMAÇÃO DOS NÚMEROS =====
    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);

            // Formatar números grandes
            let displayValue;
            if (end >= 1000) {
                displayValue = value.toLocaleString('pt-BR');
            } else if (element.textContent.includes('R$')) {
                displayValue = `R$ ${value} Bi`;
            } else {
                displayValue = value;
            }

            element.textContent = displayValue;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Observar elementos com números para animação
    const numberElements = document.querySelectorAll('[data-count]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const finalValue = parseInt(element.getAttribute('data-count'));
                animateValue(element, 0, finalValue, 2000);
                observer.unobserve(element);
            }
        });
    }, { threshold: 0.5 });

    numberElements.forEach(element => {
        observer.observe(element);
    });

    // ===== ANIMAÇÕES AOS =====
    // Inicializar AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }

    // ===== BOTÕES INTERATIVOS =====
    const buttons = document.querySelectorAll('.button--primary, .button--secondary');

    buttons.forEach(button => {
        // Efeito de ripple
        button.addEventListener('click', function(e) {
            // Criar elemento ripple
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 600ms linear;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
            `;

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            // Remover após animação
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });

        // Efeito de hover para botões secundários
        if (button.classList.contains('button--secondary')) {
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
            });

            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        }
    });

    // ===== ANIMAÇÃO DOS ELEMENTOS FLUTUANTES =====
    const floatingItems = document.querySelectorAll('.floating-item');

    floatingItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.2) translateY(-10px)';
            this.style.background = 'rgba(255, 255, 255, 0.2)';
        });

        item.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) translateY(0)';
            this.style.background = 'rgba(255, 255, 255, 0.1)';
        });
    });

    // ===== CONTADOR DE IMPACTO EM TEMPO REAL =====
    function updateLiveStats() {
        const stats = [
            { element: '.impact__item:nth-child(1) h3', current: 12500, increment: 23 },
            { element: '.impact__item:nth-child(2) h3', current: 25000, increment: 45 },
            { element: '.impact__item:nth-child(3) h3', current: 3500, increment: 6 },
            { element: '.impact__item:nth-child(4) h3', current: 280, increment: 1 }
        ];

        stats.forEach(stat => {
            const element = document.querySelector(stat.element);
            if (element) {
                // Simular aumento gradual (apenas visual)
                setInterval(() => {
                    const currentValue = parseInt(element.textContent.replace(/\D/g, ''));
                    const newValue = currentValue + Math.floor(Math.random() * stat.increment);
                    element.textContent = newValue.toLocaleString('pt-BR');
                }, 30000); // Atualizar a cada 30 segundos
            }
        });
    }

    // Iniciar contadores quando a seção de impacto estiver visível
    const impactObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                updateLiveStats();
                impactObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const impactSection = document.querySelector('.impact');
    if (impactSection) {
        impactObserver.observe(impactSection);
    }

    // ===== VALIDAÇÃO DE FORMULÁRIOS (para páginas futuras) =====
    function initializeFormValidation() {
        const forms = document.querySelectorAll('form');

        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                const requiredFields = this.querySelectorAll('[required]');
                let isValid = true;

                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        isValid = false;
                        field.style.borderColor = 'var(--crisis-red)';

                        // Resetar cor após 2 segundos
                        setTimeout(() => {
                            field.style.borderColor = '';
                        }, 2000);
                    }
                });

                if (!isValid) {
                    e.preventDefault();
                    showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
                }
            });
        });
    }

    // ===== SISTEMA DE NOTIFICAÇÕES =====
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check-circle'}"></i>
            <span>${message}</span>
            <button class="notification__close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Estilos da notificação
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? 'var(--crisis-red)' : 'var(--hope-green)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: var(--z-modal);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Botão fechar
        const closeBtn = notification.querySelector('.notification__close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        });

        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
    }

    // ===== ANIMAÇÕES CSS DINÂMICAS =====
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }

        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }

        .notification__close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 0.25rem;
            transition: background 0.3s;
        }

        .notification__close:hover {
            background: rgba(255, 255, 255, 0.2);
        }
    `;
    document.head.appendChild(style);

    // ===== DETECÇÃO DE PREFERÊNCIAS DO USUÁRIO =====
    // Reduzir animações se o usuário preferir
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--animation-duration', '0.1s');
    }

    // ===== CARREGAMENTO DE RECURSOS =====
    function loadExternalResources() {
        // Verificar se Font Awesome está carregado
        if (!document.querySelector('.fa')) {
            console.warn('Font Awesome não carregado. Carregando fallback...');
            // Aqui você poderia carregar um fallback
        }

        // Verificar se AOS está disponível
        if (typeof AOS === 'undefined') {
            console.warn('AOS não carregado. Implementando fallback...');
            implementSimpleAnimations();
        }
    }

    // Fallback para animações caso AOS não carregue
    function implementSimpleAnimations() {
        const animatedElements = document.querySelectorAll('[data-aos]');
        const simpleObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.8s ease';
            simpleObserver.observe(el);
        });
    }

    // ===== INICIALIZAÇÃO FINAL =====
    function initializeApp() {
        loadExternalResources();
        initializeFormValidation();
        scrollHeader(); // Executar uma vez no carregamento

        console.log('✅ Prato Justo - Todas as funcionalidades inicializadas!');
    }

    // Inicializar aplicação
    initializeApp();

    // ===== TRATAMENTO DE ERROS =====
    window.addEventListener('error', function(e) {
        console.error('Erro capturado:', e.error);
        // Aqui você poderia enviar o erro para um serviço de monitoramento
    });

    // ===== PERFORMANCE MONITORING =====
    window.addEventListener('load', function() {
        // Medir tempo de carregamento
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`📊 Tempo de carregamento: ${loadTime}ms`);

        if (loadTime > 3000) {
            console.warn('⚠️  Tempo de carregamento alto. Considere otimizar recursos.');
        }
    });
});

// ===== FUNÇÕES GLOBAIS PARA REUTILIZAÇÃO =====
window.PratoJusto = {
    showNotification: function(message, type) {
        // Reutilizar a função de notificação em outras páginas
        const event = new CustomEvent('showNotification', {
            detail: { message, type }
        });
        document.dispatchEvent(event);
    },

    formatNumber: function(number) {
        return new Intl.NumberFormat('pt-BR').format(number);
    },

    // Função para simular login (para demonstração)
    simulateLogin: function() {
        localStorage.setItem('userLoggedIn', 'true');
        window.showNotification('Login realizado com sucesso!', 'success');
    },

    // Função para verificar autenticação
    isAuthenticated: function() {
        return localStorage.getItem('userLoggedIn') === 'true';
    }
};

// Listener global para notificações
document.addEventListener('showNotification', function(e) {
    const { message, type } = e.detail;
    // Reimplementar showNotification aqui ou usar um sistema global
    console.log(`Notification: ${message} (${type})`);
});