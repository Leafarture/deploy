/**
 * Notification Badge Manager - Prato Justo
 * Gerencia o badge de notificações no dropdown "Minhas Doações"
 */
class NotificationBadgeManager {
    constructor() {
        this.badgeElement = null;
        this.updateInterval = null;
        this.init();
    }

    init() {
        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.findAndInitBadge());
        } else {
            this.findAndInitBadge();
        }
    }

    findAndInitBadge() {
        // Encontrar o badge em todas as páginas
        this.badgeElement = document.getElementById('donations-badge');
        
        if (!this.badgeElement) {
            // Tentar encontrar em outros locais possíveis
            const dropdownToggle = document.querySelector('.dropdown-toggle');
            if (dropdownToggle) {
                let badge = dropdownToggle.querySelector('.notification-badge');
                if (!badge) {
                    // Criar badge se não existir
                    badge = document.createElement('span');
                    badge.className = 'notification-badge';
                    badge.id = 'donations-badge';
                    badge.textContent = '0';
                    badge.style.display = 'none';
                    dropdownToggle.appendChild(badge);
                }
                this.badgeElement = badge;
            }
        }

        // Inicialmente esconder o badge e o status do dropdown
        if (this.badgeElement) {
            this.hideBadge();
        }
        this.updateDropdownStatus(0);

        // Verificar autenticação e atualizar badge após um pequeno delay
        setTimeout(() => {
            this.checkAuthAndUpdate();
        }, 1000);
        
        // Atualizar a cada 30 segundos
        this.updateInterval = setInterval(() => {
            this.updateBadge();
        }, 30000);
        
        // Escutar eventos de mudança de solicitações
        window.addEventListener('solicitacoesUpdated', () => {
            setTimeout(() => this.updateBadge(), 500);
        });
        
        // Escutar eventos de nova solicitação
        window.addEventListener('novaSolicitacao', () => {
            setTimeout(() => this.updateBadge(), 1000);
        });
        
        // Escutar quando doações são carregadas
        window.addEventListener('doacoesCarregadas', () => {
            setTimeout(() => this.updateBadge(), 500);
        });
    }

    async checkAuthAndUpdate() {
        const token = localStorage.getItem('token');
        if (token) {
            await this.updateBadge();
        } else {
            this.hideBadge();
        }
    }

    async updateBadge() {
        const token = localStorage.getItem('token');
        if (!token) {
            this.hideBadge();
            this.updateDropdownStatus(0);
            return;
        }

        try {
            // Buscar solicitações pendentes
            const pendingCount = await this.getPendingRequestsCount();
            
            // Atualizar badge
            if (pendingCount > 0) {
                this.showBadge(pendingCount);
            } else {
                this.hideBadge();
            }
            
            // Atualizar status no dropdown menu
            this.updateDropdownStatus(pendingCount);
        } catch (error) {
            console.error('Erro ao atualizar badge de notificações:', error);
            // Em caso de erro, manter o badge oculto
            this.hideBadge();
            this.updateDropdownStatus(0);
        }
    }

    updateDropdownStatus(count) {
        // Atualizar o status "X pendentes" no dropdown menu
        // Buscar por ID primeiro, depois por classe
        let statusElements = document.querySelectorAll('#dropdown-pending-status');
        
        // Se não encontrou por ID, buscar por classe
        if (statusElements.length === 0) {
            statusElements = document.querySelectorAll('.item-status.pending');
        }
        
        statusElements.forEach(element => {
            if (count > 0) {
                element.textContent = `${count} ${count === 1 ? 'pendente' : 'pendentes'}`;
                element.style.display = 'inline-block';
                element.style.visibility = 'visible';
                element.style.opacity = '1';
            } else {
                // Esconder completamente quando não houver solicitações
                element.style.display = 'none';
                element.style.visibility = 'hidden';
                element.style.opacity = '0';
            }
        });
        
        // Log para debug
        if (statusElements.length > 0) {
            console.log(`Status do dropdown atualizado: ${count} solicitações pendentes`);
        }
    }

    async getPendingRequestsCount() {
        const token = localStorage.getItem('token');
        if (!token) return 0;

        try {
            // Tentar diferentes endpoints para buscar solicitações pendentes
            const endpoints = [
                '/doacoes/minhas-solicitacoes',
                '/doacoes/solicitacoes',
                '/solicitacoes/minhas',
                '/api/solicitacoes'
            ];

            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const solicitacoes = await response.json();
                        
                        // Filtrar apenas solicitações pendentes
                        const pending = solicitacoes.filter(s => {
                            const status = s.status?.toLowerCase() || s.status?.valor?.toLowerCase() || '';
                            return status === 'pendente' || status === 'pending' || status === 'aguardando';
                        });

                        return pending.length;
                    }
                } catch (err) {
                    // Tentar próximo endpoint
                    continue;
                }
            }

            // Se nenhum endpoint funcionou, tentar buscar pelas doações do usuário
            return await this.getPendingFromDonations(token);
        } catch (error) {
            console.error('Erro ao buscar solicitações pendentes:', error);
            return 0;
        }
    }

    async getPendingFromDonations(token) {
        try {
            // Buscar doações do usuário
            const response = await fetch('/doacoes/minhas', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) return 0;

            const doacoes = await response.json();
            let totalPending = 0;

            // Para cada doação, buscar solicitações pendentes
            for (const doacao of doacoes) {
                try {
                    const solicitacoesResponse = await fetch(`/doacoes/${doacao.id}/solicitacoes`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (solicitacoesResponse.ok) {
                        const solicitacoes = await solicitacoesResponse.json();
                        const pending = solicitacoes.filter(s => {
                            const status = s.status?.toLowerCase() || s.status?.valor?.toLowerCase() || '';
                            return status === 'pendente' || status === 'pending' || status === 'aguardando';
                        });
                        totalPending += pending.length;
                    }
                } catch (err) {
                    // Continuar com próxima doação
                    continue;
                }
            }

            return totalPending;
        } catch (error) {
            console.error('Erro ao buscar solicitações das doações:', error);
            return 0;
        }
    }

    showBadge(count) {
        if (!this.badgeElement) return;
        
        // Só mostrar se houver solicitações
        if (count <= 0) {
            this.hideBadge();
            return;
        }

        this.badgeElement.textContent = count > 99 ? '99+' : count.toString();
        this.badgeElement.style.display = 'flex';
        this.badgeElement.style.visibility = 'visible';
        this.badgeElement.style.opacity = '1';
        
        // Adicionar animação de pulso
        this.badgeElement.classList.add('pulse');
        
        // Disparar evento customizado
        window.dispatchEvent(new CustomEvent('badgeUpdated', { 
            detail: { count } 
        }));
    }

    hideBadge() {
        if (!this.badgeElement) return;

        this.badgeElement.style.display = 'none';
        this.badgeElement.style.visibility = 'hidden';
        this.badgeElement.style.opacity = '0';
        this.badgeElement.classList.remove('pulse');
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Inicialização automática
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.notificationBadgeManager = new NotificationBadgeManager();
    });
} else {
    window.notificationBadgeManager = new NotificationBadgeManager();
}

