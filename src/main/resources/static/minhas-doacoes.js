class MinhasDoacoesApp {
    constructor() {
        this.currentUser = null;
        this.myDonations = [];
        this.init();
    }

    async init() {
        await this.checkAuth();
        if (this.currentUser) {
            this.setupEventListeners();
            await this.loadMyDonations();
            this.calculateStats();
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
                    this.showAuthRequired();
                }
            } catch (error) {
                console.error('Erro ao verificar autenticação:', error);
                localStorage.removeItem('token');
                this.showAuthRequired();
            }
        } else {
            this.showAuthRequired();
        }
    }

    showAuthenticatedContent() {
        document.getElementById('auth-required').style.display = 'none';
        document.getElementById('authenticated-content').style.display = 'block';
        
        const userName = document.getElementById('user-name');
        userName.textContent = this.currentUser.nome;
    }

    showAuthRequired() {
        document.getElementById('auth-required').style.display = 'block';
        document.getElementById('authenticated-content').style.display = 'none';
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
    }

    async loadMyDonations() {
        const loading = document.getElementById('loading');
        const container = document.getElementById('doacoes-container');
        const noDonations = document.getElementById('no-donations');

        loading.style.display = 'block';
        container.innerHTML = '';
        noDonations.style.display = 'none';

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/doacoes/minhas', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                this.myDonations = await response.json();
                this.renderMyDonations();
            } else if (response.status === 401) {
                localStorage.removeItem('token');
                this.showAuthRequired();
                return;
            } else {
                throw new Error('Erro ao carregar suas doações');
            }
        } catch (error) {
            console.error('Erro:', error);
            this.showError('Erro ao carregar suas doações. Tente novamente.');
        } finally {
            loading.style.display = 'none';
        }
    }

    renderMyDonations() {
        const container = document.getElementById('doacoes-container');
        const noDonations = document.getElementById('no-donations');

        container.innerHTML = '';

        if (this.myDonations.length === 0) {
            noDonations.style.display = 'block';
            return;
        }

        noDonations.style.display = 'none';

        // Animação escalonada para os cards
        this.myDonations.forEach((donation, index) => {
            const card = this.createMyDonationCard(donation);
            
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

    createMyDonationCard(donation) {
        const card = document.createElement('div');
        card.className = 'doacao-card';

        // Formatação de datas
        let dataFormatada = 'Não informado';
        let diasRestantes = null;
        let statusClass = 'status-available';
        let statusText = 'Disponível';
        
        if (donation.dataValidade) {
            const dataValidade = new Date(donation.dataValidade + 'T00:00:00');
            dataFormatada = dataValidade.toLocaleDateString('pt-BR');
            
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const dataVal = new Date(donation.dataValidade + 'T00:00:00');
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
        
        const tipoLabel = tipoLabels[donation.tipoAlimento] || donation.tipoAlimento || 'Alimento';
        
        // Status ativo/inativo
        const activeStatus = donation.ativo ? 
            '<span class="status-badge active">Ativa</span>' : 
            '<span class="status-badge inactive">Inativa</span>';

        // Estrutura HTML do card (mesmo estilo de doacoes.js)
        card.innerHTML = `
            <!-- Imagem do Alimento -->
            <div class="doacao-image-container">
                ${donation.imagem ? 
                    `<img src="${donation.imagem}" alt="${donation.titulo || 'Alimento'}" class="doacao-image">` :
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
                <h3 class="doacao-title">${donation.titulo || 'Alimento para Doação'}</h3>
                <p class="doacao-description">${donation.descricao || 'Descrição não disponível'}</p>
                
                <!-- Detalhes do Alimento -->
                <div class="doacao-details">
                    <div class="detail-item">
                        <i class="fas fa-balance-scale"></i>
                        <div>
                            <span class="detail-label">Quantidade</span>
                            <span class="detail-value">${donation.quantidade || 'N/A'}${donation.unidade ? ' ' + donation.unidade : ''}</span>
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
                            <span class="detail-value">${donation.cidade || 'Não informado'}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Footer com Status e Ações -->
            <div class="doacao-footer">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    ${activeStatus}
                </div>
                <div class="donation-actions" style="display: flex; gap: 0.5rem;">
                    <button class="btn-edit" onclick="event.stopPropagation(); editDonation(${donation.id})" title="Editar doação">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                    <button class="btn-delete" onclick="event.stopPropagation(); deleteDonation(${donation.id}, event)" title="Excluir doação">
                        <i class="fas fa-trash"></i>
                        Excluir
                    </button>
                </div>
            </div>
        `;

        // Adicionar evento de clique para ver detalhes (exceto nos botões)
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.btn-edit') && !e.target.closest('.btn-delete')) {
                window.location.href = `detalhes-alimento.html?id=${donation.id}`;
            }
        });

        return card;
    }

    calculateStats() {
        const totalDonations = this.myDonations.length;
        const activeDonations = this.myDonations.filter(d => d.ativo).length;
        const totalQuantity = this.myDonations.reduce((sum, d) => sum + (d.quantidade || 0), 0);

        document.getElementById('total-donations').textContent = totalDonations;
        document.getElementById('active-donations').textContent = activeDonations;
        document.getElementById('total-quantity').textContent = totalQuantity.toFixed(1);
    }

    showError(message) {
        const container = document.getElementById('doacoes-container');
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

// Funções globais para editar e excluir doações
async function editDonation(donationId) {
    // Redirecionar para página de cadastro com parâmetro de edição
    window.location.href = `cadastro_alimento.html?edit=${donationId}`;
}

async function deleteDonation(donationId, event) {
    // Confirmação mais amigável
    const confirmed = await showDeleteConfirmation(donationId);
    if (!confirmed) return;

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Você precisa estar logado para excluir uma doação.', 'error');
            return;
        }

        // Mostrar loading
        const deleteBtn = event ? event.target.closest('.btn-delete') : document.querySelector(`.btn-delete[onclick*="${donationId}"]`);
        const originalContent = deleteBtn ? deleteBtn.innerHTML : '';
        if (deleteBtn) {
            deleteBtn.disabled = true;
            deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Excluindo...';
        }

        const response = await fetch(`/doacoes/${donationId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok || response.status === 204) {
            showNotification('Doação excluída com sucesso!', 'success');
            
            // Remover card da lista sem recarregar página
            const card = deleteBtn.closest('.doacao-card');
            if (card) {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '0';
                card.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    card.remove();
                    // Recarregar doações para atualizar estatísticas
                    if (window.minhasDoacoesApp) {
                        window.minhasDoacoesApp.loadMyDonations();
                        window.minhasDoacoesApp.calculateStats();
                    }
                }, 300);
            } else {
                // Fallback: recarregar página
                setTimeout(() => location.reload(), 1000);
            }
        } else {
            const errorText = await response.text();
            showNotification(`Erro ao excluir doação: ${errorText}`, 'error');
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = originalContent;
        }
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao excluir doação. Tente novamente.', 'error');
        const deleteBtn = event.target.closest('.btn-delete');
        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Excluir';
        }
    }
}

// Função para mostrar confirmação de exclusão
function showDeleteConfirmation(donationId) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.2s ease;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 20px;
                padding: 2rem;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.3s ease;
            ">
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e74c3c; margin-bottom: 1rem;"></i>
                    <h3 style="margin: 0 0 0.5rem 0; color: #1e293b; font-size: 1.5rem;">Confirmar Exclusão</h3>
                    <p style="margin: 0; color: #64748b; line-height: 1.6;">
                        Tem certeza que deseja excluir esta doação? Esta ação não pode ser desfeita.
                    </p>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button id="confirm-delete" style="
                        background: #e74c3c;
                        color: white;
                        border: none;
                        padding: 0.75rem 2rem;
                        border-radius: 10px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                    <button id="cancel-delete" style="
                        background: #64748b;
                        color: white;
                        border: none;
                        padding: 0.75rem 2rem;
                        border-radius: 10px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">
                        Cancelar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#confirm-delete').addEventListener('click', () => {
            modal.remove();
            resolve(true);
        });
        
        modal.querySelector('#cancel-delete').addEventListener('click', () => {
            modal.remove();
            resolve(false);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                resolve(false);
            }
        });
    });
}

// Função auxiliar para mostrar notificações
function showNotification(message, type = 'info', duration = 3000) {
    // Verificar se já existe sistema de notificação
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type, duration);
        return;
    }
    
    // Criar notificação simples
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#e74c3c' : '#667eea';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 2rem;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10001;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;
    
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    notification.innerHTML = `
        <i class="fas ${icon}" style="font-size: 1.5rem;"></i>
        <span style="font-weight: 500;">${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Adicionar estilos de animação
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes slideUp {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
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
`;
document.head.appendChild(style);

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.minhasDoacoesApp = new MinhasDoacoesApp();
});
