// === JAVASCRIPT PARA PÁGINA SOBRE ===

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Prato Justo - Página Sobre Inicializando...');

    // ===== ANIMAÇÕES DE SCROLL =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';

                // Efeito adicional para cards de impacto
                if (entry.target.classList.contains('impacto-card')) {
                    entry.target.style.animation = 'cardReveal 0.8s ease-out';
                }
            }
        });
    }, observerOptions);

    // Observar elementos animáveis
    const animatableElements = document.querySelectorAll(
        '.stat-item, .impacto-card, .membro-card'
    );

    animatableElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });

    // ===== SCROLL INDICATOR =====
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });
        });

        // Esconder indicador quando scrollar
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.pointerEvents = 'none';
            } else {
                scrollIndicator.style.opacity = '1';
                scrollIndicator.style.pointerEvents = 'auto';
            }
        });
    }

    // ===== INTERAÇÃO COM CARDS =====
    const impactoCards = document.querySelectorAll('.impacto-card');

    impactoCards.forEach((card, index) => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transition = 'all 0.3s ease';
        });

        card.addEventListener('click', function() {
            const messages = [
                '🌟 5.000 famílias já transformaram suas realidades através da solidariedade!',
                '🚚 20.000kg de alimentos resgatados do desperdício e transformados em esperança!',
                '📖 150 histórias de superação escritas por pessoas comuns fazendo o extraordinário!'
            ];
            showNotification(messages[index], 'info', 4000);
        });
    });

    // ===== BOTÕES CTA =====
    const ctaButtons = document.querySelectorAll('.cta-btn');

    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Efeito de ripple
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
                animation: ripple 0.6s linear;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
            `;

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);

            // Ações específicas para cada botão
            if (this.classList.contains('primary')) {
                setTimeout(() => {
                    window.location.href = 'cadastro_alimento.html';
                }, 300);
            } else {
                setTimeout(() => {
                    showNotification('Em breve: formulário para parcerias corporativas!', 'info', 4000);
                }, 300);
            }
        });
    });

    // ===== SOCIAL LINKS =====
    const socialLinks = document.querySelectorAll('.membro-social a');
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.stopPropagation(); // Impedir que o clique no link dispare o evento do card

            const platform = this.querySelector('i').className.includes('linkedin') ? 'LinkedIn' : 'GitHub';
            const memberName = this.closest('.membro-card').querySelector('h3').textContent;

            showNotification(`Abrindo ${platform} de ${memberName}...`, 'info', 2000);
        });
    });

    // ===== SISTEMA DE NOTIFICAÇÕES =====
    function showNotification(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: '💡'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icons[type]}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">×</button>
            </div>
            <div class="notification-progress"></div>
        `;

        document.body.appendChild(notification);

        // Animação de entrada
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Botão de fechar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            closeNotification(notification);
        });

        // Auto-remover
        const timeout