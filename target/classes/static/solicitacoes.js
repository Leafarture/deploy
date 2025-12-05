
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






class SolicitacoesApp {
    constructor() {
        this.currentUser = null;
        this.myRequests = [];
        this.currentFilter = 'todas'; // todas, solicitadas, em_andamento, concluidas, canceladas
        this.init();
    }

    async init() {
        await this.checkAuth();
        if (this.currentUser) {
            this.setupEventListeners();
            await this.loadRequests();
            this.calculateStats();
        } else {
            // Se não estiver autenticado, não fazer nada além de mostrar o modal
            // O modal já foi mostrado em checkAuth()
        }
    }

    async checkAuth() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch('/api/user/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    this.currentUser = await response.json();
                    this.showAuthenticatedContent();
                } else {
                    localStorage.removeItem('token');
                    this.showAuthRequiredModal();
                }
            } catch (error) {
                console.error('Erro ao verificar autenticação:', error);
                localStorage.removeItem('token');
                this.showAuthRequiredModal();
            }
        } else {
            this.showAuthRequiredModal();
        }
    }

    showAuthenticatedContent() {
        // Esconder mensagem de autenticação
        const authRequired = document.getElementById('auth-required');
        if (authRequired) authRequired.style.display = 'none';
        
        // Mostrar conteúdo autenticado
        const authenticatedContent = document.getElementById('authenticated-content');
        if (authenticatedContent) authenticatedContent.style.display = 'block';
        
        const userName = document.getElementById('user-name');
        if (userName && this.currentUser) {
            userName.textContent = this.currentUser.nome;
        }
    }

    showAuthRequired() {
        // Mostrar mensagem de autenticação
        const authRequired = document.getElementById('auth-required');
        if (authRequired) authRequired.style.display = 'block';
        
        // Esconder conteúdo autenticado
        const authenticatedContent = document.getElementById('authenticated-content');
        if (authenticatedContent) authenticatedContent.style.display = 'none';
    }

    showAuthRequiredModal() {
        // Esconder todo o conteúdo da página
        const authenticatedContent = document.getElementById('authenticated-content');
        if (authenticatedContent) authenticatedContent.style.display = 'none';
        
        const authRequired = document.getElementById('auth-required');
        if (authRequired) authRequired.style.display = 'none';
        
        // Usar o modal do AuthManager se disponível
        if (window.authManager && typeof window.authManager.showAuthRequired === 'function') {
            window.authManager.showAuthRequired('Você precisa estar logado para ver suas solicitações.');
            
            // Adicionar listener para fechar o modal e redirecionar
            const modal = document.getElementById('auth-modal');
            if (modal) {
                const cancelBtn = modal.querySelector('.btn-auth-modal-cancel');
                if (cancelBtn) {
                    const originalCancel = cancelBtn.onclick;
                    cancelBtn.onclick = (e) => {
                        if (originalCancel) originalCancel.call(cancelBtn, e);
                        // Redirecionar para a página anterior ou index
                        if (document.referrer && document.referrer !== window.location.href) {
                            window.history.back();
                        } else {
                            window.location.href = 'index.html';
                        }
                    };
                }
                
                // Fechar modal ao clicar no overlay
                const overlay = modal.querySelector('.auth-modal-overlay');
                if (overlay) {
                    overlay.addEventListener('click', (e) => {
                        if (e.target === overlay) {
                            modal.remove();
                            if (document.referrer && document.referrer !== window.location.href) {
                                window.history.back();
                            } else {
                                window.location.href = 'index.html';
                            }
                        }
                    });
                }
            }
        } else {
            // Fallback: mostrar o conteúdo de auth-required
            this.showAuthRequired();
        }
    }

    setupEventListeners() {
        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('token');
                this.currentUser = null;
                this.showAuthRequired();
            });
        }

        // Filtros
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.setFilter(filter);
            });
        });
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Atualizar botões ativos
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        // Filtrar e renderizar
        this.renderRequests();
    }

    async loadRequests() {
        const loading = document.getElementById('loading');
        const container = document.getElementById('requests-container');
        const noRequests = document.getElementById('no-requests');

        if (loading) loading.style.display = 'block';
        if (container) container.innerHTML = '';
        if (noRequests) noRequests.style.display = 'none';

        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                this.showAuthRequired();
                return;
            }

            // Tentar diferentes endpoints possíveis para buscar solicitações
            const endpoints = [
                '/doacoes/minhas-solicitacoes',
                '/doacoes/solicitacoes',
                '/solicitacoes/minhas',
                '/api/solicitacoes'
            ];

            let response = null;
            let lastError = null;

            // Tentar cada endpoint até encontrar um que funcione
            for (const endpoint of endpoints) {
                try {
                    response = await fetch(endpoint, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        // Verificar se é um array
                        if (Array.isArray(data)) {
                            this.myRequests = data;
                            this.renderRequests();
                            if (loading) loading.style.display = 'none';
                            return;
                        } else if (data.solicitacoes && Array.isArray(data.solicitacoes)) {
                            this.myRequests = data.solicitacoes;
                            this.renderRequests();
                            if (loading) loading.style.display = 'none';
                            return;
                        }
                    } else if (response.status === 401) {
                        localStorage.removeItem('token');
                        this.showAuthRequired();
                        if (loading) loading.style.display = 'none';
                        return;
                    } else if (response.status !== 404) {
                        // Se não for 404, pode ser um erro diferente, mas continuamos tentando
                        lastError = `Erro ${response.status}: ${response.statusText}`;
                    }
                } catch (err) {
                    lastError = err.message;
                    continue; // Tentar próximo endpoint
                }
            }

            // Se nenhum endpoint funcionou, mostrar mensagem de que não há solicitações
            console.log('Nenhum endpoint de solicitações encontrado ou não há solicitações');
            this.myRequests = [];
            this.renderRequests();

        } catch (error) {
            console.error('Erro ao carregar solicitações:', error);
            this.myRequests = [];
            this.renderRequests();
        } finally {
            if (loading) loading.style.display = 'none';
        }
    }

    getFilteredRequests() {
        if (this.currentFilter === 'todas') {
            return this.myRequests;
        }
        return this.myRequests.filter(req => req.status === this.currentFilter);
    }

    renderRequests() {
        const container = document.getElementById('requests-container');
        const noRequests = document.getElementById('no-requests');

        if (!container) return;

        container.innerHTML = '';

        const filteredRequests = this.getFilteredRequests();

        if (filteredRequests.length === 0) {
            if (noRequests) noRequests.style.display = 'block';
            return;
        }

        if (noRequests) noRequests.style.display = 'none';

        // Animação escalonada para os cards
        filteredRequests.forEach((request, index) => {
            const card = this.createRequestCard(request);
            
            // Configurar animação inicial
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            container.appendChild(card);
            
            // Animação de entrada escalonada
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    createRequestCard(request) {
        const card = document.createElement('div');
        card.className = 'doacao-card';
        const requestStatus = request.status || 'solicitada';
        card.classList.add(`status-${requestStatus}`);

        const doacao = request.doacao;
        const status = requestStatus;

        // Formatação de datas
        let dataFormatada = 'Não informado';
        let diasRestantes = null;
        let statusClass = 'status-available';
        let statusText = 'Disponível';
        
        if (doacao.dataValidade) {
            const dataValidade = new Date(doacao.dataValidade + 'T00:00:00');
            dataFormatada = dataValidade.toLocaleDateString('pt-BR');
            
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const dataVal = new Date(doacao.dataValidade + 'T00:00:00');
            dataVal.setHours(0, 0, 0, 0);
            
            diasRestantes = Math.ceil((dataVal - hoje) / (1000 * 60 * 60 * 24));
            
            if (diasRestantes < 0) {
                statusClass = 'status-expired';
                statusText = 'Vencido';
            } else if (diasRestantes <= 3) {
                statusClass = 'status-urgent';
                statusText = 'Urgente';
            }
        }

        // Mapeamento de tipos de alimento
        const tipoLabels = {
            'INDUSTRIALIZADO': 'Industrializado',
            'COZIDO': 'Refeição Pronta',
            'CRU': 'Matéria-prima',
            'FRUTAS_VERDURAS': 'Frutas e Verduras',
            'LATICINIOS': 'Laticínios',
            'BEBIDAS': 'Bebidas',
            'PERECIVEL': 'Perecível',
            'NAO_PERECIVEL': 'Não Perecível',
            'PREPARADO': 'Preparado'
        };
        
        const tipoLabel = tipoLabels[doacao.tipoAlimento] || doacao.tipoAlimento || 'Alimento';

        // Status da solicitação
        const statusLabels = {
            'solicitada': { text: 'Solicitada', class: 'status-solicitada', icon: 'fa-clock' },
            'em_andamento': { text: 'Em Andamento', class: 'status-em-andamento', icon: 'fa-spinner' },
            'concluida': { text: 'Concluída', class: 'status-concluida', icon: 'fa-check-circle' },
            'cancelada': { text: 'Cancelada', class: 'status-cancelada', icon: 'fa-times-circle' }
        };
        
        const statusInfo = statusLabels[status] || statusLabels['solicitada'];
        const statusBadge = `<span class="request-status-badge ${statusInfo.class}">
            <i class="fas ${statusInfo.icon}"></i>
            ${statusInfo.text}
        </span>`;

        // Data da solicitação
        const dataSolicitacao = request.dataSolicitacao 
            ? new Date(request.dataSolicitacao).toLocaleDateString('pt-BR')
            : 'Data não informada';

        // Estrutura HTML do card
        card.innerHTML = `
            <!-- Imagem do Alimento -->
            <div class="doacao-image-container">
                ${doacao.imagem ? 
                    `<img src="${doacao.imagem}" alt="${doacao.titulo || 'Alimento'}" class="doacao-image">` :
                    `<div class="doacao-image-placeholder">
                        <i class="fas fa-utensils"></i>
                    </div>`
                }
            </div>
            
            <!-- Header com Categoria e Status -->
            <div class="doacao-header">
                <div class="doacao-type">
                    <i class="fas fa-tag"></i>
                    <span>${tipoLabel}</span>
                </div>
                <div class="${statusClass}">${statusText}</div>
            </div>
            
            <!-- Corpo do Card -->
            <div class="doacao-body">
                <h3 class="doacao-title">${doacao.titulo || 'Alimento para Doação'}</h3>
                <p class="doacao-description">${doacao.descricao || 'Descrição não disponível'}</p>
                
                <!-- Status da Solicitação -->
                <div class="request-status-container">
                    <div class="status-badge-wrapper">
                        ${statusBadge}
                    </div>
                    <div class="status-date">
                        <i class="fas fa-calendar"></i> Solicitado em: ${dataSolicitacao}
                    </div>
                </div>
                
                <!-- Doador -->
                <div class="donor-info">
                    <div class="donor-name">
                        <i class="fas fa-user"></i> Doador: ${doacao.doador?.nome || 'Não informado'}
                    </div>
                </div>
                
                <!-- Detalhes do Alimento -->
                <div class="doacao-details">
                    <div class="detail-item">
                        <i class="fas fa-balance-scale"></i>
                        <div>
                            <span class="detail-label">Quantidade</span>
                            <span class="detail-value">${doacao.quantidade || 'N/A'}${doacao.unidade ? ' ' + doacao.unidade : ''}</span>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-calendar-alt"></i>
                        <div>
                            <span class="detail-label">Validade</span>
                            <span class="detail-value">${dataFormatada}</span>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <div>
                            <span class="detail-label">Restam</span>
                            <span class="detail-value">${diasRestantes !== null ? (diasRestantes >= 0 ? diasRestantes + ' dias' : 'Vencido') : 'Não informado'}</span>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <div>
                            <span class="detail-label">Local</span>
                            <span class="detail-value">${doacao.cidade || 'Não informado'}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Footer com Ações -->
            <div class="doacao-footer">
                <div class="donation-actions">
                    ${status === 'em_andamento' ? `
                        <button class="btn-chat" onclick="event.stopPropagation(); openChat(${doacao.doador?.id || 'null'}, ${request.id})" title="Abrir chat">
                            <i class="fas fa-comments"></i>
                            Chat
                        </button>
                        <button class="btn-collect" onclick="event.stopPropagation(); confirmCollection(${request.id}, event)" title="Confirmar coleta">
                            <i class="fas fa-check-circle"></i>
                            Confirmar Coleta
                        </button>
                        <button class="btn-cancel" onclick="event.stopPropagation(); cancelRequest(${request.id}, event)" title="Cancelar solicitação">
                            <i class="fas fa-times-circle"></i>
                            Cancelar
                        </button>
                    ` : status === 'solicitada' ? `
                        <button class="btn-cancel" onclick="event.stopPropagation(); cancelRequest(${request.id}, event)" title="Cancelar solicitação">
                            <i class="fas fa-times-circle"></i>
                            Cancelar Solicitação
                        </button>
                    ` : ''}
                    <button class="btn-view" onclick="event.stopPropagation(); viewDonation(${doacao.id})" title="Ver detalhes">
                        <i class="fas fa-eye"></i>
                        Ver Detalhes
                    </button>
                </div>
            </div>
        `;

        // Adicionar evento de clique para ver detalhes (exceto nos botões)
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.btn-view') && !e.target.closest('.btn-cancel')) {
                window.location.href = `detalhes-alimento.html?id=${doacao.id}`;
            }
        });

        return card;
    }

    calculateStats() {
        const totalRequests = this.myRequests.length;
        const solicitadas = this.myRequests.filter(r => r.status === 'solicitada').length;
        const emAndamento = this.myRequests.filter(r => r.status === 'em_andamento').length;
        const concluidas = this.myRequests.filter(r => r.status === 'concluida').length;
        const canceladas = this.myRequests.filter(r => r.status === 'cancelada').length;

        const totalEl = document.getElementById('total-requests');
        const pendingEl = document.getElementById('pending-requests');
        const approvedEl = document.getElementById('approved-requests');

        if (totalEl) totalEl.textContent = totalRequests;
        if (pendingEl) pendingEl.textContent = solicitadas + emAndamento;
        if (approvedEl) approvedEl.textContent = concluidas;
    }

    showError(message) {
        const container = document.getElementById('requests-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${message}</p>
                </div>
            `;
        }
    }
}

// Funções globais
function viewDonation(donationId) {
    window.location.href = `detalhes-alimento.html?id=${donationId}`;
}

async function cancelRequest(requestId, event) {
    const confirmed = confirm('Tem certeza que deseja cancelar esta solicitação?');
    if (!confirmed) return;

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Você precisa estar logado para cancelar uma solicitação.');
            return;
        }

        // Mostrar loading
        const cancelBtn = event.target.closest('.btn-cancel');
        const originalContent = cancelBtn ? cancelBtn.innerHTML : '';
        if (cancelBtn) {
            cancelBtn.disabled = true;
            cancelBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cancelando...';
        }

        // Chamar endpoint para cancelar
        const response = await fetch(`/doacoes/solicitacoes/${requestId}/cancelar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok || response.status === 204) {
            alert('Solicitação cancelada com sucesso!');
            
            // Recarregar solicitações
            if (window.solicitacoesApp) {
                await window.solicitacoesApp.loadRequests();
                window.solicitacoesApp.calculateStats();
            }
        } else {
            const error = await response.text();
            alert(`Erro ao cancelar solicitação: ${error}`);
            if (cancelBtn) {
                cancelBtn.disabled = false;
                cancelBtn.innerHTML = originalContent;
            }
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao cancelar solicitação. Tente novamente.');
        const cancelBtn = event.target.closest('.btn-cancel');
        if (cancelBtn) {
            cancelBtn.disabled = false;
            cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancelar';
        }
    }
}

async function confirmCollection(requestId, event) {
    const confirmed = confirm('Confirmar que você coletou/recebeu a doação?');
    if (!confirmed) return;

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Você precisa estar logado.');
            return;
        }

        // Mostrar loading
        const collectBtn = event.target.closest('.btn-collect');
        const originalContent = collectBtn ? collectBtn.innerHTML : '';
        if (collectBtn) {
            collectBtn.disabled = true;
            collectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Confirmando...';
        }

        const response = await fetch(`/doacoes/solicitacoes/${requestId}/marcar-coletada`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert('Coleta confirmada com sucesso!');
            
            // Recarregar solicitações
            if (window.solicitacoesApp) {
                await window.solicitacoesApp.loadRequests();
                window.solicitacoesApp.calculateStats();
            }
            
            // Solicitar avaliação
            setTimeout(() => {
                showEvaluationModal(requestId);
            }, 1500);
        } else {
            const error = await response.text();
            alert(`Erro: ${error}`);
            if (collectBtn) {
                collectBtn.disabled = false;
                collectBtn.innerHTML = originalContent;
            }
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao confirmar coleta. Tente novamente.');
        const collectBtn = event.target.closest('.btn-collect');
        if (collectBtn) {
            collectBtn.disabled = false;
            collectBtn.innerHTML = '<i class="fas fa-check-circle"></i> Confirmar Coleta';
        }
    }
}

function openChat(userId, requestId) {
    if (!userId) {
        alert('Informações do doador não disponíveis.');
        return;
    }
    window.location.href = `chat.html?userId=${userId}&requestId=${requestId}`;
}

function showEvaluationModal(requestId) {
    if (typeof window.showEvaluationModal === 'function') {
        window.showEvaluationModal(requestId);
    } else {
        console.log('Sistema de avaliação não carregado');
    }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.solicitacoesApp = new SolicitacoesApp();
});

