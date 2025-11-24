// =========================================
// JAVASCRIPT SUPER INTERATIVO - COMO DOAR
// =========================================

class InteractiveExperience {
	constructor() {
		this.currentStep = 1;
		this.totalSteps = 4;
		this.simulationData = {
			type: 'fruits',
			quantity: 5,
			frequency: 1,
			multiplier: 3
		};
		this.init();
	}

	init() {
		this.initLoading();
		this.initNavigation();
		this.initSimulator();
		this.initJourney();
		this.initAnimations();
		this.initParticles();
		this.initTypewriter();
		this.initCounters();
		this.initScrollAnimations();

		console.log('🚀 Experiência interativa carregada!');
	}

	// Loading Screen
	initLoading() {
		const loadingScreen = document.getElementById('loading-screen');
		const loadingProgress = document.getElementById('loading-progress');

		if (!loadingScreen || !loadingProgress) return;

		let progress = 0;
		const interval = setInterval(() => {
			progress += Math.random() * 15;
			if (progress >= 100) {
				progress = 100;
				clearInterval(interval);

				setTimeout(() => {
					loadingScreen.style.opacity = '0';
					setTimeout(() => {
						loadingScreen.style.display = 'none';
						this.startMainAnimations();
					}, 500);
				}, 500);
			}
			loadingProgress.style.width = `${progress}%`;
		}, 100);
	}

	// Navegação Corrigida
	initNavigation() {
		const mobileBtn = document.getElementById('mobile-menu-btn');
		const navMenu = document.querySelector('.nav-menu');
		const headerButtons = document.querySelector('.header-buttons');

		if (mobileBtn && navMenu) {
			mobileBtn.addEventListener('click', () => {
				const isActive = mobileBtn.classList.toggle('active');
				navMenu.classList.toggle('active');
				if (headerButtons) headerButtons.classList.toggle('active');

				// Animar ícones do menu mobile
				const spans = mobileBtn.querySelectorAll('span');
				if (isActive) {
					spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
					spans[1].style.opacity = '0';
					spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
				} else {
					spans[0].style.transform = 'none';
					spans[1].style.opacity = '1';
					spans[2].style.transform = 'none';
				}
			});
		}

		// Scroll suave
		document.querySelectorAll('.scroll-to').forEach(link => {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				const targetId = link.getAttribute('href');
				const targetElement = document.querySelector(targetId);
				if (targetElement) {
					targetElement.scrollIntoView({
						behavior: 'smooth',
						block: 'start'
					});
				}
			});
		});

		// Fechar menu ao clicar em links (mobile)
		document.querySelectorAll('.nav-link').forEach(link => {
			link.addEventListener('click', () => {
				if (window.innerWidth <= 768) {
					if (mobileBtn) mobileBtn.classList.remove('active');
					if (navMenu) navMenu.classList.remove('active');
					if (headerButtons) headerButtons.classList.remove('active');
				}
			});
		});
	}

	// Simulador de Impacto
	initSimulator() {
		this.setupFoodSelector();
		this.setupQuantitySlider();
		this.setupFrequencySelector();
		this.updateSimulation();
	}

	setupFoodSelector() {
		const foodOptions = document.querySelectorAll('.food-option');

		foodOptions.forEach(option => {
			option.addEventListener('click', () => {
				// Remover active de todos
				foodOptions.forEach(opt => opt.classList.remove('active'));

				// Adicionar active ao clicado
				option.classList.add('active');

				// Atualizar dados
				this.simulationData.type = option.getAttribute('data-type');
				this.simulationData.multiplier = parseFloat(option.getAttribute('data-multiplier'));

				// Atualizar animação
				this.updateFoodAnimation();
				this.updateSimulation();

				// Efeito de clique
				this.createClickEffect(option);
			});
		});
	}

	setupQuantitySlider() {
		const slider = document.getElementById('quantity-slider');
		const quantityValue = document.getElementById('quantity-value');

		if (slider && quantityValue) {
			slider.addEventListener('input', () => {
				this.simulationData.quantity = parseInt(slider.value);
				quantityValue.textContent = `${slider.value}kg`;
				this.updateSimulation();

				// Efeito visual no slider
				this.animateSlider(slider);
			});
		}
	}

	setupFrequencySelector() {
		const frequencyOptions = document.querySelectorAll('.frequency-option');

		frequencyOptions.forEach(option => {
			option.addEventListener('click', () => {
				frequencyOptions.forEach(opt => opt.classList.remove('active'));
				option.classList.add('active');
				this.simulationData.frequency = parseInt(option.getAttribute('data-frequency'));
				this.updateSimulation();

				// Efeito de clique
				this.createClickEffect(option);
			});
		});
	}

	updateFoodAnimation() {
		const animatedFood = document.getElementById('animated-food');
		const foodIcons = {
			fruits: '🍎',
			vegetables: '🥕',
			grains: '🍞',
			protein: '🍗'
		};

		if (animatedFood) {
			animatedFood.textContent = foodIcons[this.simulationData.type] || '🍎';

			// Adicionar animação de bounce
			animatedFood.style.transform = 'scale(1.3)';
			setTimeout(() => {
				animatedFood.style.transform = 'scale(1)';
			}, 300);
		}
	}

	updateSimulation() {
		const totalMeals = Math.floor(this.simulationData.quantity * this.simulationData.multiplier * this.simulationData.frequency);
		const families = Math.floor(totalMeals / 5);
		const co2 = Math.floor(this.simulationData.quantity * 2.5 * this.simulationData.frequency);

		// Atualizar números
		this.animateCounter('meals-result', totalMeals);
		this.animateCounter('families-result', families);
		this.animateCounter('co2-result', co2);

		// Atualizar medidor
		const meterFill = document.getElementById('meter-fill');
		const totalImpact = document.getElementById('total-impact');
		const fillPercentage = Math.min((totalMeals / 150) * 100, 100);

		if (meterFill) {
			meterFill.style.width = `${fillPercentage}%`;

			// Efeito de brilho no medidor
			this.animateMeterGlow(meterFill);
		}

		if (totalImpact) {
			this.animateTextChange(totalImpact, `${totalMeals} refeições`);
		}

		// Atualizar animação de pessoas
		this.updatePeopleAnimation(families);

		// Efeito de confete para grandes impactos
		if (totalMeals > 100) {
			this.createConfettiEffect();
		}
	}

	animateCounter(elementId, targetValue) {
		const element = document.getElementById(elementId);
		if (!element) return;

		const currentValue = parseInt(element.textContent) || 0;

		// Se o valor não mudou, não animar
		if (currentValue === targetValue) return;

		const difference = targetValue - currentValue;
		const duration = 800;
		const steps = 30;
		const increment = difference / steps;
		let currentStep = 0;

		const timer = setInterval(() => {
			currentStep++;
			const value = Math.floor(currentValue + (increment * currentStep));

			// Formatar números grandes
			if (value >= 1000) {
				element.textContent = `${(value / 1000).toFixed(1)}k`;
			} else {
				element.textContent = value;
			}

			// Efeito de pulso nos números
			if (currentStep % 5 === 0) {
				element.style.transform = 'scale(1.1)';
				setTimeout(() => {
					element.style.transform = 'scale(1)';
				}, 100);
			}

			if (currentStep >= steps) {
				if (targetValue >= 1000) {
					element.textContent = `${(targetValue / 1000).toFixed(1)}k`;
				} else {
					element.textContent = targetValue;
				}
				clearInterval(timer);
			}
		}, duration / steps);
	}

	updatePeopleAnimation(families) {
		const peopleContainer = document.querySelector('.people-benefited');
		if (!peopleContainer) return;

		const currentPeople = peopleContainer.querySelectorAll('.person').length;
		const targetPeople = Math.min(families, 5);

		// Se o número de pessoas não mudou, não fazer nada
		if (currentPeople === targetPeople) return;

		// Limpar pessoas existentes
		peopleContainer.innerHTML = '';

		// Adicionar novas pessoas baseado no número de famílias
		const peopleIcons = ['👨‍👩‍👧', '👴', '🧒', '👩‍👦', '👨‍👧'];

		for (let i = 0; i < targetPeople; i++) {
			const person = document.createElement('div');
			person.className = 'person';
			person.style.setProperty('--delay', i * 0.3);
			person.textContent = peopleIcons[i] || '👤';
			person.style.animationDelay = `${i * 0.3}s`;

			// Efeito de entrada
			person.style.opacity = '0';
			person.style.transform = 'translateY(20px)';

			peopleContainer.appendChild(person);

			// Animação de entrada
			setTimeout(() => {
				person.style.transition = 'all 0.5s ease';
				person.style.opacity = '1';
				person.style.transform = 'translateY(0)';
			}, i * 100);
		}
	}

	// Jornada Interativa
	initJourney() {
		this.setupJourneyNavigation();
		this.setupStepInteractions();
		this.setupConnectionInteractions();
	}

	setupJourneyNavigation() {
		const nextBtn = document.getElementById('next-step');
		const prevBtn = document.getElementById('prev-step');

		if (nextBtn && prevBtn) {
			nextBtn.addEventListener('click', () => {
				if (this.currentStep < this.totalSteps) {
					this.currentStep++;
					this.updateJourney();
					this.animateStepTransition('next');
				} else {
					// Finalizar jornada
					this.completeJourney();
				}
			});

			prevBtn.addEventListener('click', () => {
				if (this.currentStep > 1) {
					this.currentStep--;
					this.updateJourney();
					this.animateStepTransition('prev');
				}
			});
		}
	}

	setupStepInteractions() {
		// Interação do Step 1 - Cards de Recomendação
		const recommendationCards = document.querySelectorAll('.recommendation-card');
		recommendationCards.forEach(card => {
			card.addEventListener('click', () => {
				recommendationCards.forEach(c => c.classList.remove('active'));
				card.classList.add('active');

				// Efeito visual
				this.createClickEffect(card);
			});
		});

		// Interação do Step 2 - Guia de Preparo
		const guideSteps = document.querySelectorAll('.guide-step');
		guideSteps.forEach((step, index) => {
			step.addEventListener('click', () => {
				if (index === 1) { // Apenas o passo atual é clicável
					guideSteps.forEach(s => s.classList.remove('current'));
					step.classList.add('current');

					// Simular progresso
					setTimeout(() => {
						if (index < guideSteps.length - 1) {
							guideSteps[index + 1].classList.remove('completed');
							guideSteps[index + 1].classList.add('current');
							step.classList.remove('current');
							step.classList.add('completed');

							// Efeito de conclusão
							this.createCompletionEffect(step);
						}
					}, 800);
				}
			});
		});
	}

	setupConnectionInteractions() {
		const connectionItems = document.querySelectorAll('.connection-item');
		connectionItems.forEach(item => {
			item.addEventListener('click', () => {
				connectionItems.forEach(i => i.classList.remove('active'));
				item.classList.add('active');

				// Efeito visual
				this.createClickEffect(item);

				// Simular conexão
				this.simulateConnection(item);
			});
		});
	}

	updateJourney() {
		// Atualizar progresso
		const progressFill = document.getElementById('journey-progress');
		const progressPercentage = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;

		if (progressFill) {
			progressFill.style.width = `${progressPercentage}%`;
		}

		// Atualizar steps
		document.querySelectorAll('.progress-step').forEach((step, index) => {
			if (index + 1 <= this.currentStep) {
				step.classList.add('active');
			} else {
				step.classList.remove('active');
			}
		});

		// Atualizar conteúdo dos steps
		document.querySelectorAll('.journey-step').forEach((step, index) => {
			if (index + 1 === this.currentStep) {
				step.classList.add('active');
			} else {
				step.classList.remove('active');
			}
		});

		// Atualizar botões de navegação
		const prevBtn = document.getElementById('prev-step');
		const nextBtn = document.getElementById('next-step');

		if (prevBtn) {
			prevBtn.disabled = this.currentStep === 1;
			prevBtn.style.opacity = this.currentStep === 1 ? '0.5' : '1';
		}

		if (nextBtn) {
			if (this.currentStep === this.totalSteps) {
				nextBtn.innerHTML = '<i class="fas fa-check"></i> Finalizar';
				nextBtn.classList.add('btn-success');
			} else {
				nextBtn.innerHTML = 'Continuar <i class="fas fa-arrow-right"></i>';
				nextBtn.classList.remove('btn-success');
			}
		}
	}

	// Animações Especiais
	initAnimations() {
		this.createFloatingIcons();
		this.initScrollAnimations();
	}

	createFloatingIcons() {
		const container = document.querySelector('.hero-particles');
		if (!container) return;

		const icons = ['🍎', '🥕', '🍞', '🍗', '🥛', '🥚', '🍌', '🍊'];

		for (let i = 0; i < 12; i++) {
			const icon = document.createElement('div');
			icon.className = 'floating-food-icon';
			icon.textContent = icons[Math.floor(Math.random() * icons.length)];
			icon.style.left = `${Math.random() * 100}%`;
			icon.style.animationDelay = `${Math.random() * 10}s`;
			icon.style.fontSize = `${Math.random() * 1 + 1.5}rem`;
			icon.style.opacity = `${Math.random() * 0.5 + 0.3}`;
			container.appendChild(icon);
		}
	}

	initScrollAnimations() {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('animate-in');

					// Animar stats quando visíveis
					if (entry.target.classList.contains('stat-item')) {
						const counter = entry.target.querySelector('.counter');
						if (counter) {
							const target = parseInt(entry.target.getAttribute('data-value'));
							const speed = parseInt(entry.target.getAttribute('data-speed')) || 50;
							this.animateValue(counter, 0, target, speed);
						}
					}
				}
			});
		}, { threshold: 0.1 });

		// Observar elementos para animação
		document.querySelectorAll('.stat-item, .reward-card, .journey-step, .simulator-container, .section-header, .step-card').forEach(el => {
			observer.observe(el);
		});
	}

	// Partículas Interativas
	initParticles() {
		this.createHeroParticles();
	}

	createHeroParticles() {
		const container = document.getElementById('hero-particles');
		if (!container) return;

		for (let i = 0; i < 25; i++) {
			const particle = document.createElement('div');
			particle.className = 'particle';
			particle.style.left = `${Math.random() * 100}%`;
			particle.style.top = `${Math.random() * 100}%`;
			particle.style.animationDelay = `${Math.random() * 12}s`;
			particle.style.width = `${Math.random() * 3 + 1}px`;
			particle.style.height = particle.style.width;
			particle.style.opacity = `${Math.random() * 0.5 + 0.1}`;

			// Cores aleatórias
			const colors = [
				'rgba(220, 38, 38, 0.3)', // Vermelho
				'rgba(245, 158, 11, 0.3)', // Laranja
				'rgba(16, 185, 129, 0.3)', // Verde
				'rgba(59, 130, 246, 0.3)'  // Azul
			];
			particle.style.background = colors[Math.floor(Math.random() * colors.length)];

			container.appendChild(particle);
		}
	}

	// Efeito Digitação
	initTypewriter() {
		const titleElement = document.getElementById('typed-title');
		if (!titleElement) return;

		const texts = [
			"Como Doar no Prato Justo",
			"Transforme Alimentos em Esperança",
			"Faça a Diferença Hoje"
		];

		let textIndex = 0;
		let charIndex = 0;
		let isDeleting = false;
		let isPaused = false;

		function type() {
			if (isPaused) return;

			const currentText = texts[textIndex];

			if (isDeleting) {
				titleElement.innerHTML = currentText.substring(0, charIndex - 1) + '<span class="typed-cursor">|</span>';
				charIndex--;
			} else {
				titleElement.innerHTML = currentText.substring(0, charIndex + 1) + '<span class="typed-cursor">|</span>';
				charIndex++;
			}

			if (!isDeleting && charIndex === currentText.length) {
				isPaused = true;
				setTimeout(() => {
					isPaused = false;
					isDeleting = true;
				}, 2000);
			} else if (isDeleting && charIndex === 0) {
				isDeleting = false;
				textIndex = (textIndex + 1) % texts.length;
			}

			setTimeout(type, isDeleting ? 50 : 100);
		}

		// Iniciar após um delay
		setTimeout(type, 1000);
	}

	// Contadores Animados
	initCounters() {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const statItem = entry.target;
					const counter = statItem.querySelector('.counter');
					if (counter) {
						const target = parseInt(statItem.getAttribute('data-value'));
						const speed = parseInt(statItem.getAttribute('data-speed')) || 50;
						this.animateValue(counter, 0, target, speed);
					}
					observer.unobserve(statItem);
				}
			});
		}, { threshold: 0.5 });

		document.querySelectorAll('.stat-item[data-value]').forEach(stat => {
			observer.observe(stat);
		});
	}

	animateValue(element, start, end, duration) {
		let startTimestamp = null;
		const step = (timestamp) => {
			if (!startTimestamp) startTimestamp = timestamp;
			const progress = Math.min((timestamp - startTimestamp) / duration, 1);
			const value = Math.floor(progress * (end - start) + start);

			// Formatar números grandes
			if (value >= 1000) {
				element.textContent = `${(value / 1000).toFixed(1)}k`;
			} else {
				element.textContent = value;
			}

			if (progress < 1) {
				window.requestAnimationFrame(step);
			}
		};
		window.requestAnimationFrame(step);
	}

	// Efeitos Visuais Avançados
	createClickEffect(element) {
		const rect = element.getBoundingClientRect();
		const effect = document.createElement('div');
		effect.className = 'click-effect';
		effect.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: rgba(220, 38, 38, 0.6);
            border-radius: 50%;
            pointer-events: none;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            transform: translate(-50%, -50%);
            animation: clickExpand 0.6s ease-out forwards;
            z-index: 10000;
        `;

		document.body.appendChild(effect);

		setTimeout(() => {
			effect.remove();
		}, 600);
	}

	animateSlider(slider) {
		slider.style.transform = 'scale(1.02)';
		setTimeout(() => {
			slider.style.transform = 'scale(1)';
		}, 150);
	}

	animateMeterGlow(meterFill) {
		const glow = meterFill.querySelector('.meter-glow');
		if (glow) {
			glow.style.animation = 'none';
			setTimeout(() => {
				glow.style.animation = 'shimmer 2s infinite';
			}, 10);
		}
	}

	animateTextChange(element, newText) {
		element.style.transform = 'scale(1.1)';
		element.style.color = '#f59e0b';

		setTimeout(() => {
			element.textContent = newText;
			element.style.transform = 'scale(1)';
			element.style.color = '';
		}, 300);
	}

	animateStepTransition(direction) {
		const currentStep = document.querySelector('.journey-step.active');
		if (currentStep) {
			currentStep.style.transform = direction === 'next' ? 'translateX(-100%)' : 'translateX(100%)';
			currentStep.style.opacity = '0';

			setTimeout(() => {
				const newStep = document.querySelector('.journey-step.active');
				if (newStep) {
					newStep.style.transform = 'translateX(0)';
					newStep.style.opacity = '1';
				}
			}, 300);
		}
	}

	simulateConnection(connectionItem) {
		const statusBadge = connectionItem.querySelector('.status-badge');
		if (statusBadge) {
			statusBadge.textContent = 'Conectando...';
			statusBadge.style.background = '#f59e0b';

			setTimeout(() => {
				statusBadge.textContent = 'Conectado!';
				statusBadge.style.background = '#10b981';

				// Efeito de sucesso
				this.createSuccessEffect(connectionItem);
			}, 1500);
		}
	}

	createCompletionEffect(element) {
		element.style.background = 'rgba(16, 185, 129, 0.1)';
		element.style.borderColor = '#10b981';

		setTimeout(() => {
			element.style.background = '';
			element.style.borderColor = '';
		}, 1000);
	}

	createSuccessEffect(element) {
		const successIcon = document.createElement('div');
		successIcon.innerHTML = '✓';
		successIcon.style.cssText = `
            position: absolute;
            top: -10px;
            right: -10px;
            width: 20px;
            height: 20px;
            background: #10b981;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            animation: popIn 0.3s ease-out;
        `;

		element.style.position = 'relative';
		element.appendChild(successIcon);

		setTimeout(() => {
			successIcon.remove();
		}, 2000);
	}

	createConfettiEffect() {
		const confettiCount = 30;
		const colors = ['#dc2626', '#f59e0b', '#10b981', '#3b82f6'];

		for (let i = 0; i < confettiCount; i++) {
			const confetti = document.createElement('div');
			confetti.className = 'confetti';
			confetti.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: -10px;
                left: ${Math.random() * 100}%;
                animation: confettiFall ${Math.random() * 2 + 1}s linear forwards;
                z-index: 10000;
                pointer-events: none;
            `;

			document.body.appendChild(confetti);

			setTimeout(() => {
				confetti.remove();
			}, 2000);
		}
	}

	completeJourney() {
		const journeyContainer = document.querySelector('.journey-container');
		if (journeyContainer) {
			journeyContainer.innerHTML = `
                <div class="journey-complete" style="text-align: center; padding: 4rem 2rem;">
                    <div class="completion-icon" style="font-size: 4rem; color: #10b981; margin-bottom: 2rem;">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <h3 style="font-size: 2rem; margin-bottom: 1rem; color: #10b981;">Jornada Concluída!</h3>
                    <p style="font-size: 1.2rem; margin-bottom: 2rem; color: #6b7280;">
                        Você está pronto para fazer sua primeira doação e transformar vidas!
                    </p>
                    <a href="cadastro_alimento.html" class="btn btn-primary btn-large">
                        <i class="fas fa-box-open"></i>
                        Fazer Minha Primeira Doação
                    </a>
                </div>
            `;

			this.createConfettiEffect();
		}
	}

	// Iniciar Animações Principais
	startMainAnimations() {
		document.body.classList.add('loaded');

		// Animar elementos do hero com delay
		const heroElements = document.querySelectorAll('.hero-content > *');
		heroElements.forEach((el, index) => {
			el.style.animationDelay = `${index * 0.2}s`;
		});

		// Iniciar observadores
		this.initCounters();
	}
}

// Estilos Dinâmicos
const dynamicStyles = `
.floating-food-icon {
    position: absolute;
    animation: float 8s ease-in-out infinite;
    opacity: 0.7;
    pointer-events: none;
    z-index: 1;
}

.particle {
    position: absolute;
    border-radius: 50%;
    animation: float 12s ease-in-out infinite;
    pointer-events: none;
}

@keyframes float {
    0%, 100% { 
        transform: translateY(0px) rotate(0deg); 
    }
    50% { 
        transform: translateY(-20px) rotate(180deg); 
    }
}

.animate-in {
    animation: fadeInUp 0.8s ease-out forwards;
    opacity: 0;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.typed-cursor {
    animation: blink 1s infinite;
    color: #dc2626;
}

@keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
}

/* Efeitos de Clique */
@keyframes clickExpand {
    0% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
    }
    100% {
        transform: translate(-50%, -50%) scale(3);
        opacity: 0;
    }
}

/* Confetti */
@keyframes confettiFall {
    0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
    }
}

/* Pop In */
@keyframes popIn {
    0% {
        transform: scale(0);
    }
    70% {
        transform: scale(1.2);
    }
    100% {
        transform: scale(1);
    }
}

/* Efeitos para elementos interativos */
.recommendation-card {
    transition: all 0.3s ease;
    cursor: pointer;
}

.recommendation-card:hover {
    transform: translateY(-5px);
}

.recommendation-card.active {
    border-color: #dc2626;
    box-shadow: 0 0 20px rgba(220, 38, 38, 0.3);
}

.guide-step {
    transition: all 0.3s ease;
    cursor: pointer;
}

.guide-step.current {
    border-color: #f59e0b;
}

.guide-step.completed .guide-icon {
    background: #10b981;
}

.connection-item {
    cursor: pointer;
    transition: all 0.3s ease;
}

.connection-item.active {
    border-color: #dc2626;
    background: rgba(220, 38, 38, 0.1);
}

/* Botão de sucesso */
.btn-success {
    background: linear-gradient(135deg, #10b981, #059669) !important;
}

.btn-success:hover {
    background: linear-gradient(135deg, #059669, #047857) !important;
}

/* Responsividade adicional */
@media (max-width: 768px) {
    .floating-food-icon {
        display: none;
    }
    
    .particle {
        display: none;
    }
}

/* Efeitos de foco para acessibilidade */
.btn:focus, 
.food-option:focus, 
.frequency-option:focus,
.recommendation-card:focus {
    outline: 2px solid #dc2626;
    outline-offset: 2px;
}

/* Loading states */
.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
}

/* Animações de entrada suaves */
body.loaded .hero-content > * {
    animation: fadeInUp 0.8s ease-out forwards;
}

body.loaded .hero-content > *:nth-child(1) { animation-delay: 0.1s; }
body.loaded .hero-content > *:nth-child(2) { animation-delay: 0.3s; }
body.loaded .hero-content > *:nth-child(3) { animation-delay: 0.5s; }
body.loaded .hero-content > *:nth-child(4) { animation-delay: 0.7s; }
`;

// Adicionar estilos dinâmicos ao documento
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet);

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
	new InteractiveExperience();
});

// Prevenir comportamentos indesejados
document.addEventListener('touchstart', function() { }, { passive: true });

// Handle resize events
window.addEventListener('resize', () => {
	// Fechar menu mobile em telas maiores
	if (window.innerWidth > 768) {
		const mobileBtn = document.getElementById('mobile-menu-btn');
		const navMenu = document.querySelector('.nav-menu');
		const headerButtons = document.querySelector('.header-buttons');

		if (mobileBtn) mobileBtn.classList.remove('active');
		if (navMenu) navMenu.classList.remove('active');
		if (headerButtons) headerButtons.classList.remove('active');
	}
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
	if (!document.hidden) {
		// Página voltou a ser visível - reiniciar animações se necessário
		const experience = document.querySelector('.interactive-experience');
		if (experience) {
			// Reativar animações pausadas
			const animations = document.querySelectorAll('.particle, .floating-food-icon');
			animations.forEach(anim => {
				anim.style.animationPlayState = 'running';
			});
		}
	}
});