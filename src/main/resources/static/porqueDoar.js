// =========================================
// JS ESPECÍFICO PARA A PÁGINA "POR QUE DOAR"
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Página "Por Que Doar" carregada');

    // ===== ANIMAÇÕES DE SCROLL PARA ELEMENTOS =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Animação em cascata para elementos filhos
                const children = entry.target.querySelectorAll('[data-animate-child]');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('animate');
                    }, index * 150);
                });
            }
        });
    }, observerOptions);

    // Observar todos os elementos com data-animate
    document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
    });

    // ===== CONTADOR ANIMADO PARA ESTATÍSTICAS =====
    const statNumbers = document.querySelectorAll('.stat-number');
    let counted = false;

    function animateNumbers() {
        if (counted) return;

        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            const suffix = stat.getAttribute('data-suffix') || '';
            let current = 0;
            const duration = 2500;
            const startTime = performance.now();

            function updateNumber(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function para animação suave
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                current = Math.floor(target * easeOutQuart);
                
                stat.textContent = current.toLocaleString('pt-BR') + suffix;

                if (progress < 1) {
                    requestAnimationFrame(updateNumber);
                } else {
                    stat.textContent = target.toLocaleString('pt-BR') + suffix;
                    // Efeito de comemoração
                    stat.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        stat.style.transform = 'scale(1)';
                    }, 300);
                }
            }

            requestAnimationFrame(updateNumber);
        });
        counted = true;
    }

    // Observar seção de estatísticas
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(animateNumbers, 500);
                }
            });
        }, { threshold: 0.5 });

        statsObserver.observe(statsSection);
    }

    // ===== EFEITOS HOVER AVANÇADOS =====
    const interactiveElements = document.querySelectorAll('.benefit-card, .impact-card, .testimonial-card, .reason-item');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        });

        element.addEventListener('mouseleave', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });

    // ===== ANIMAÇÃO DE CARDS EM CASCATA =====
    function animateCardsInSequence() {
        const cards = document.querySelectorAll('.benefit-card, .impact-card, .testimonial-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            }, index * 100);
        });
    }

    // Observar seções para animar cards
    const sections = document.querySelectorAll('.benefits-section, .impact-section, .testimonials-section');
    sections.forEach(section => {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCardsInSequence();
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        sectionObserver.observe(section);
    });

    // ===== EFEITO PARALLAX SUAVE NO HERO =====
    const hero = document.querySelector('.porque-doar-hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroContent = hero.querySelector('.hero-content-wrapper');
            if (heroContent && scrolled < hero.offsetHeight) {
                heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                heroContent.style.opacity = 1 - (scrolled / hero.offsetHeight) * 0.5;
            }
        });
    }

    // ===== ANIMAÇÃO DE SHAPES FLUTUANTES =====
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach((shape, index) => {
        const randomDelay = Math.random() * 2;
        const randomDuration = 6 + Math.random() * 4;
        shape.style.animationDelay = `${randomDelay}s`;
        shape.style.animationDuration = `${randomDuration}s`;
    });

    // ===== BOTÕES INTERATIVOS =====
    const ctaButtons = document.querySelectorAll('.cta-section .btn');
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
        });
    });

    // Adicionar estilos dinâmicos para ripple
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // ===== VALIDAÇÃO DE AUTENTICAÇÃO PARA BOTÕES =====
    const authRequiredButtons = document.querySelectorAll('.require-auth');
    
    authRequiredButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Verificar se authManager está disponível
            if (window.authManager && !window.authManager.isAuthenticated()) {
                e.preventDefault();
                if (confirm('Você precisa estar logado para fazer uma doação.\n\nDeseja fazer login agora?')) {
                    window.location.href = 'login.html';
                }
            }
        });
    });

    // ===== SMOOTH SCROLL PARA LINKS INTERNOS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ===== HEADER SCROLL EFFECT =====
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        lastScrollY = window.scrollY;
    });

    // ===== MENU MOBILE =====
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const mobileOverlay = document.getElementById('mobile-overlay');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            const isActive = mobileMenuBtn.classList.toggle('open');
            navMenu.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            mobileMenuBtn.setAttribute('aria-expanded', isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        mobileOverlay.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('open');
            navMenu.classList.remove('active');
            mobileOverlay.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    }

    // ===== DROPDOWN INTERAÇÕES =====
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        const dropdown = toggle.parentElement;
        const menu = dropdown.querySelector('.dropdown-menu');

        dropdown.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                toggle.setAttribute('aria-expanded', 'true');
                menu.classList.add('show');
            }
        });

        dropdown.addEventListener('mouseleave', () => {
            if (window.innerWidth > 768) {
                toggle.setAttribute('aria-expanded', 'false');
                menu.classList.remove('show');
            }
        });

        toggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                toggle.setAttribute('aria-expanded', !isExpanded);
                menu.classList.toggle('show');
            }
        });
    });

    // Fechar dropdowns ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
                menu.previousElementSibling.setAttribute('aria-expanded', 'false');
            });
        }
    });

    console.log('✅ Página "Por Que Doar" totalmente inicializada!');
});

