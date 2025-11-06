// Módulo de cliente API para backend real
const apiClient = {
	// Configuração da API
	baseURL: 'http://localhost:8080/api/chat', // Altere para sua URL
	headers: {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
	},

	// Buscar histórico de mensagens do backend
	fetchHistory: async (chatId) => {
		try {
			console.log(`[API] Buscando histórico para chat ${chatId}`);

			const response = await fetch(`${apiClient.baseURL}/chats/${chatId}/messages`, {
				method: 'GET',
				headers: apiClient.headers
			});

			if (!response.ok) {
				throw new Error(`Erro ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			console.log('[API] Histórico carregado:', data);
			return data.messages || [];

		} catch (error) {
			console.error('[API] Erro ao carregar histórico:', error);

			// Fallback para dados mockados se o backend estiver offline
			return getMockHistory(chatId);
		}
	},

	// Enviar mensagem para o backend
	sendMessage: async (chatId, message) => {
		try {
			console.log(`[API] Enviando mensagem para chat ${chatId}: ${message}`);

			const response = await fetch(`${apiClient.baseURL}/chats/${chatId}/messages`, {
				method: 'POST',
				headers: apiClient.headers,
				body: JSON.stringify({
					text: message,
					sender: 'user'
				})
			});

			if (!response.ok) {
				throw new Error(`Erro ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			console.log('[API] Mensagem enviada:', data);
			return data.message;

		} catch (error) {
			console.error('[API] Erro ao enviar mensagem:', error);

			// Fallback local se o backend estiver offline
			return createLocalMessage(message, 'user');
		}
	},

	// Buscar lista de conversas do backend
	fetchChats: async () => {
		try {
			console.log('[API] Buscando lista de conversas');

			const response = await fetch(`${apiClient.baseURL}/chats`, {
				method: 'GET',
				headers: apiClient.headers
			});

			if (!response.ok) {
				throw new Error(`Erro ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			console.log('[API] Conversas carregadas:', data);
			return data.chats || [];

		} catch (error) {
			console.error('[API] Erro ao carregar conversas:', error);

			// Fallback para dados mockados
			return getMockChats();
		}
	},

	// Conectar via WebSocket para mensagens em tempo real
	connectWS: (onMessage, onStatusChange) => {
		let ws = null;
		let reconnectAttempts = 0;
		const maxReconnectAttempts = 5;
		const reconnectDelay = 3000;

		const connect = () => {
			try {
				// Altere para seu endpoint WebSocket
				const wsUrl = 'ws://localhost:8080/ws/chat';
				ws = new WebSocket(wsUrl);

				ws.onopen = () => {
					console.log('[WebSocket] Conectado com sucesso');
					reconnectAttempts = 0;
					if (onStatusChange) onStatusChange('connected');

					// Autenticar no WebSocket se necessário
					const token = localStorage.getItem('jwtToken');
					if (token) {
						ws.send(JSON.stringify({
							type: 'auth',
							token: token
						}));
					}
				};

				ws.onmessage = (event) => {
					try {
						const message = JSON.parse(event.data);
						console.log('[WebSocket] Mensagem recebida:', message);

						if (onMessage) onMessage(message);
					} catch (error) {
						console.error('[WebSocket] Erro ao processar mensagem:', error);
					}
				};

				ws.onclose = (event) => {
					console.log(`[WebSocket] Conexão fechada: ${event.code} - ${event.reason}`);
					if (onStatusChange) onStatusChange('disconnected');

					// Tentar reconectar
					if (reconnectAttempts < maxReconnectAttempts) {
						setTimeout(() => {
							reconnectAttempts++;
							console.log(`[WebSocket] Tentativa de reconexão ${reconnectAttempts}`);
							connect();
						}, reconnectDelay);
					}
				};

				ws.onerror = (error) => {
					console.error('[WebSocket] Erro:', error);
					if (onStatusChange) onStatusChange('error');
				};

			} catch (error) {
				console.error('[WebSocket] Erro na conexão:', error);
				if (onStatusChange) onStatusChange('error');
			}
		};

		// Iniciar conexão
		connect();

		// Retornar objeto com controle do WebSocket
		return {
			disconnect: () => {
				if (ws) {
					ws.close();
					ws = null;
				}
			},
			reconnect: () => {
				if (ws) {
					ws.close();
				}
				reconnectAttempts = 0;
				connect();
			},
			send: (message) => {
				if (ws && ws.readyState === WebSocket.OPEN) {
					ws.send(JSON.stringify(message));
					return true;
				}
				return false;
			},
			getStatus: () => {
				if (!ws) return 'disconnected';
				switch (ws.readyState) {
					case WebSocket.CONNECTING: return 'connecting';
					case WebSocket.OPEN: return 'connected';
					case WebSocket.CLOSING: return 'closing';
					case WebSocket.CLOSED: return 'disconnected';
					default: return 'unknown';
				}
			}
		};
	},

	// Marcar mensagens como lidas
	markAsRead: async (chatId, messageIds) => {
		try {
			const response = await fetch(`${apiClient.baseURL}/chats/${chatId}/read`, {
				method: 'POST',
				headers: apiClient.headers,
				body: JSON.stringify({ messageIds })
			});

			if (!response.ok) {
				throw new Error(`Erro ${response.status}: ${response.statusText}`);
			}

			console.log('[API] Mensagens marcadas como lidas');
		} catch (error) {
			console.error('[API] Erro ao marcar mensagens como lidas:', error);
		}
	},

	// Buscar informações do usuário/contato
	fetchUserInfo: async (userId) => {
		try {
			const response = await fetch(`${apiClient.baseURL}/users/${userId}`, {
				method: 'GET',
				headers: apiClient.headers
			});

			if (!response.ok) {
				throw new Error(`Erro ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			return data.user;
		} catch (error) {
			console.error('[API] Erro ao buscar informações do usuário:', error);
			return null;
		}
	}
};

// Funções auxiliares para fallback
function getMockHistory(chatId) {
	const mockHistories = {
		1: [
			{
				id: 1,
				text: "Olá! Gostaria de saber mais sobre as doações de hoje.",
				sender: "user",
				timestamp: new Date(Date.now() - 3600000).toISOString(),
				status: "delivered"
			},
			{
				id: 2,
				text: "Oi! Temos várias opções disponíveis hoje. Pão integral, frutas da estação e legumes orgânicos.",
				sender: "contact",
				timestamp: new Date(Date.now() - 3500000).toISOString(),
				status: "read"
			},
			{
				id: 3,
				text: "Que ótimo! Posso reservar alguns pães e legumes?",
				sender: "user",
				timestamp: new Date(Date.now() - 3400000).toISOString(),
				status: "delivered"
			},
			{
				id: 4,
				text: "Claro! Pode vir buscar entre 14h e 18h. Temos bastante disponibilidade hoje.",
				sender: "contact",
				timestamp: new Date(Date.now() - 3300000).toISOString(),
				status: "read"
			},
			{
				id: 5,
				text: "Perfeito! Muito obrigado pela iniciativa 😊",
				sender: "user",
				timestamp: new Date(Date.now() - 3200000).toISOString(),
				status: "read"
			}
		],
		2: [
			{
				id: 1,
				text: "Precisamos de voluntários para sábado",
				sender: "contact",
				timestamp: new Date(Date.now() - 86400000).toISOString(),
				status: "read"
			},
			{
				id: 2,
				text: "Posso ajudar! Que horas?",
				sender: "user",
				timestamp: new Date(Date.now() - 86000000).toISOString(),
				status: "delivered"
			}
		]
	};

	return mockHistories[chatId] || [];
}

function getMockChats() {
	return [
		{
			id: 1,
			name: "Restaurante Jardim",
			avatar: "RJ",
			lastMessage: "Temos pães e legumes disponíveis hoje",
			timestamp: new Date(Date.now() - 3000000).toISOString(),
			unread: 0,
			type: "restaurant",
			online: true
		},
		{
			id: 2,
			name: "ONG Comida Para Todos",
			avatar: "CT",
			lastMessage: "Precisamos de voluntários para sábado",
			timestamp: new Date(Date.now() - 86400000).toISOString(),
			unread: 2,
			type: "ong",
			online: false
		},
		{
			id: 3,
			name: "Mercado Saúde",
			avatar: "MS",
			lastMessage: "As frutas chegaram, venham buscar!",
			timestamp: new Date(Date.now() - 172800000).toISOString(),
			unread: 0,
			type: "market",
			online: true
		},
		{
			id: 4,
			name: "Ana Silva",
			avatar: "AS",
			lastMessage: "Obrigada pelas doações da semana passada!",
			timestamp: new Date(Date.now() - 259200000).toISOString(),
			unread: 0,
			type: "user",
			online: true
		}
	];
}

function createLocalMessage(text, sender) {
	return {
		id: 'local-' + Date.now(),
		text: text,
		sender: sender,
		timestamp: new Date().toISOString(),
		status: 'sent'
	};
}

// Estado da aplicação
const state = {
	currentChatId: null,
	messages: [],
	chats: [],
	isTyping: false,
	isOnline: true,
	theme: 'light',
	wsConnection: null,
	currentUser: null
};

// Elementos DOM
const elements = {
	sidebar: document.getElementById('sidebar'),
	chatsList: document.getElementById('chatsList'),
	messagesContainer: document.getElementById('messagesContainer'),
	messageInput: document.getElementById('messageInput'),
	sendBtn: document.getElementById('sendBtn'),
	emojiBtn: document.getElementById('emojiBtn'),
	contactName: document.getElementById('contactName'),
	contactAvatar: document.getElementById('contactAvatar'),
	contactStatus: document.getElementById('contactStatus'),
	typingIndicator: document.getElementById('typingIndicator'),
	connectionStatus: document.getElementById('connectionStatus'),
	themeToggle: document.getElementById('themeToggle'),
	menuToggle: document.getElementById('menuToggle')
};

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
	await initializeApp();
});

async function initializeApp() {
	// Carregar configurações do usuário
	await loadUserSettings();

	// Carregar lista de conversas
	await loadChats();

	// Conectar WebSocket
	connectWebSocket();

	// Configurar event listeners
	setupEventListeners();

	// Carregar primeira conversa se existir
	if (state.chats.length > 0) {
		await loadChat(state.chats[0].id);
	}

	console.log('[App] Aplicação inicializada');
}

async function loadUserSettings() {
	// Carregar tema salvo
	const savedTheme = localStorage.getItem('pratoJustoTheme');
	if (savedTheme) {
		setTheme(savedTheme);
	}

	// Carregar token de autenticação (simulado)
	const token = localStorage.getItem('jwtToken');
	if (!token) {
		// Em uma aplicação real, isso redirecionaria para login
		console.log('[Auth] Usuário não autenticado');
		// Simular um token para demonstração
		localStorage.setItem('jwtToken', 'demo-token-' + Date.now());
	}

	// Atualizar headers da API com o token
	apiClient.headers.Authorization = `Bearer ${localStorage.getItem('jwtToken')}`;
}

async function loadChats() {
	try {
		state.chats = await apiClient.fetchChats();
		renderChatList();
	} catch (error) {
		console.error('[App] Erro ao carregar conversas:', error);
		showError('Erro ao carregar conversas');
	}
}

function renderChatList() {
	elements.chatsList.innerHTML = '';

	if (state.chats.length === 0) {
		elements.chatsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-light); text-align: center;">Nenhuma conversa encontrada</p>
            </div>
        `;
		return;
	}

	state.chats.forEach(chat => {
		const chatElement = document.createElement('div');
		chatElement.className = `chat-item ${chat.id === state.currentChatId ? 'active' : ''} ${chat.unread > 0 ? 'unread' : ''}`;
		chatElement.setAttribute('role', 'button');
		chatElement.setAttribute('tabindex', '0');
		chatElement.setAttribute('aria-label', `Conversa com ${chat.name}. ${chat.lastMessage}`);

		const time = formatTime(chat.timestamp);
		const unreadBadge = chat.unread > 0 ? `<span class="unread-badge">${chat.unread}</span>` : '';
		const onlineIndicator = chat.online ? '<span class="online-dot"></span>' : '';

		chatElement.innerHTML = `
            <div class="chat-avatar">${chat.avatar}</div>
            <div class="chat-info">
                <div class="chat-info-header">
                    <div class="chat-name">${chat.name} ${unreadBadge}</div>
                    <div class="chat-time">${time}</div>
                </div>
                <div class="chat-preview">${chat.lastMessage} ${onlineIndicator}</div>
            </div>
        `;

		chatElement.addEventListener('click', () => {
			loadChat(chat.id);
			if (window.innerWidth < 769) {
				elements.sidebar.classList.remove('active');
			}
		});

		// Suporte a teclado para acessibilidade
		chatElement.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				loadChat(chat.id);
				if (window.innerWidth < 769) {
					elements.sidebar.classList.remove('active');
				}
			}
		});

		elements.chatsList.appendChild(chatElement);
	});
}

async function loadChat(chatId) {
	if (state.currentChatId === chatId) return;

	state.currentChatId = chatId;
	state.messages = [];

	// Atualizar informações do contato
	const chat = state.chats.find(c => c.id === chatId);
	if (chat) {
		elements.contactName.textContent = chat.name;
		elements.contactAvatar.textContent = chat.avatar;
		updateContactStatus(chat.online ? 'online' : 'offline');

		// Atualizar lista de conversas para destacar a ativa
		document.querySelectorAll('.chat-item').forEach(item => {
			item.classList.remove('active');
		});
		const chatIndex = state.chats.findIndex(c => c.id === chatId);
		if (chatIndex !== -1) {
			document.querySelectorAll('.chat-item')[chatIndex].classList.add('active');
		}

		// Marcar mensagens como lidas
		if (chat.unread > 0) {
			await apiClient.markAsRead(chatId, []);
			// Atualizar estado local
			chat.unread = 0;
			renderChatList();
		}
	}

	// Limpar área de mensagens
	elements.messagesContainer.innerHTML = '';
	elements.typingIndicator = document.createElement('div');
	elements.typingIndicator.className = 'typing-indicator';
	elements.typingIndicator.id = 'typingIndicator';
	elements.typingIndicator.innerHTML = `
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
	elements.messagesContainer.appendChild(elements.typingIndicator);

	// Mostrar indicador de carregamento
	const loadingMessage = document.createElement('div');
	loadingMessage.className = 'message received loading';
	loadingMessage.innerHTML = `
        <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <div class="message-time">Carregando...</div>
    `;
	elements.messagesContainer.appendChild(loadingMessage);

	try {
		// Carregar histórico de mensagens
		const messages = await apiClient.fetchHistory(chatId);
		state.messages = messages;

		// Remover mensagem de carregamento
		loadingMessage.remove();

		renderMessages();
		scrollToBottom();

	} catch (error) {
		console.error('[App] Erro ao carregar chat:', error);
		loadingMessage.innerHTML = `
            <div class="message-text">Erro ao carregar mensagens</div>
            <div class="message-time">Tente novamente</div>
        `;
		loadingMessage.classList.remove('loading');
	}
}

function renderMessages() {
	// Limpar mensagens existentes (exceto o indicador de digitação)
	const existingMessages = elements.messagesContainer.querySelectorAll('.message');
	existingMessages.forEach(msg => {
		if (!msg.classList.contains('typing-indicator')) {
			msg.remove();
		}
	});

	// Adicionar mensagens ao container
	state.messages.forEach(message => {
		const messageElement = createMessageElement(message);
		elements.messagesContainer.insertBefore(messageElement, elements.typingIndicator);
	});
}

function createMessageElement(message) {
	const messageElement = document.createElement('div');
	messageElement.className = `message ${message.sender === 'user' ? 'sent' : 'received'} ${message.status || 'sent'}`;
	messageElement.setAttribute('role', 'article');
	messageElement.setAttribute('aria-label', `Mensagem ${message.sender === 'user' ? 'enviada' : 'recebida'}: ${message.text}`);
	messageElement.setAttribute('data-message-id', message.id);

	const time = formatTime(message.timestamp);
	const statusIcon = message.sender === 'user' ? getStatusIcon(message.status) : '';

	messageElement.innerHTML = `
        <div class="message-text">${message.text}</div>
        <div class="message-time">${time} ${statusIcon}</div>
    `;

	return messageElement;
}

function getStatusIcon(status) {
	switch (status) {
		case 'sent':
			return '<i class="fas fa-check" style="margin-left: 4px; opacity: 0.6;"></i>';
		case 'delivered':
			return '<i class="fas fa-check-double" style="margin-left: 4px; opacity: 0.6;"></i>';
		case 'read':
			return '<i class="fas fa-check-double" style="margin-left: 4px; color: #4CAF50;"></i>';
		default:
			return '<i class="fas fa-clock" style="margin-left: 4px; opacity: 0.6;"></i>';
	}
}

async function sendMessage() {
	const text = elements.messageInput.value.trim();

	if (!text || !state.currentChatId) return;

	// Limpar campo de entrada
	elements.messageInput.value = '';
	adjustTextareaHeight();

	// Desabilitar botão de envio temporariamente
	elements.sendBtn.disabled = true;

	// Criar mensagem temporária
	const tempMessage = {
		id: 'temp-' + Date.now(),
		text: text,
		sender: 'user',
		timestamp: new Date().toISOString(),
		status: 'sending'
	};

	state.messages.push(tempMessage);
	renderMessages();
	scrollToBottom();

	try {
		// Enviar mensagem via API
		const sentMessage = await apiClient.sendMessage(state.currentChatId, text);

		// Atualizar mensagem temporária com dados reais
		const index = state.messages.findIndex(m => m.id === tempMessage.id);
		if (index !== -1) {
			state.messages[index] = sentMessage;
			renderMessages();
		}

		// Tentar enviar via WebSocket também
		if (state.wsConnection && state.wsConnection.send) {
			state.wsConnection.send({
				type: 'new_message',
				chatId: state.currentChatId,
				message: sentMessage
			});
		}

		// Atualizar última mensagem na lista de chats
		updateChatPreview(state.currentChatId, text);

		// Simular resposta automática após um tempo (apenas em modo demo)
		if (state.chats.find(c => c.id === state.currentChatId)?.type !== 'user') {
			simulateAutoReply();
		}

	} catch (error) {
		console.error('[App] Erro ao enviar mensagem:', error);

		// Marcar mensagem como falha
		const index = state.messages.findIndex(m => m.id === tempMessage.id);
		if (index !== -1) {
			state.messages[index].status = 'error';
			state.messages[index].text = `${text} (falha no envio)`;
			renderMessages();
		}

		showError('Erro ao enviar mensagem');

	} finally {
		elements.sendBtn.disabled = false;
		elements.messageInput.focus();
	}
}

function simulateAutoReply() {
	// Mostrar indicador de digitação
	showTypingIndicator();

	// Simular tempo de digitação
	setTimeout(() => {
		hideTypingIndicator();

		// Adicionar resposta automática
		const autoReplies = [
			"Olá! Recebemos sua mensagem 😊 Em breve retornaremos com mais informações sobre as doações disponíveis.",
			"Obrigado pelo seu interesse! Nossas doações estão disponíveis para retirada das 14h às 18h.",
			"Perfeito! Anotamos seu pedido. Pode vir buscar amanhã a partir das 14h.",
			"Temos disponíveis hoje: pães integrais, frutas da estação e legumes orgânicos. Interessado em algum?",
			"Vamos verificar a disponibilidade e retornamos em alguns minutos! 📝"
		];

		const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];

		const autoReply = {
			id: Date.now(),
			text: randomReply,
			sender: "contact",
			timestamp: new Date().toISOString(),
			status: "delivered"
		};

		state.messages.push(autoReply);
		renderMessages();
		scrollToBottom();

		// Atualizar preview do chat
		updateChatPreview(state.currentChatId, randomReply);

	}, 2000 + Math.random() * 2000); // Tempo aleatório entre 2-4 segundos
}

function updateChatPreview(chatId, lastMessage) {
	const chat = state.chats.find(c => c.id === chatId);
	if (chat) {
		chat.lastMessage = lastMessage;
		chat.timestamp = new Date().toISOString();
		renderChatList();
	}
}

function connectWebSocket() {
	state.wsConnection = apiClient.connectWS(
		// Callback para novas mensagens
		(message) => {
			handleWebSocketMessage(message);
		},
		// Callback para mudanças de status
		(status) => {
			handleWebSocketStatus(status);
		}
	);
}

function handleWebSocketMessage(message) {
	switch (message.type) {
		case 'new_message':
			if (message.data.chatId === state.currentChatId) {
				// Adicionar mensagem ao chat atual
				state.messages.push(message.data);
				renderMessages();
				scrollToBottom();
			} else {
				// Atualizar preview do chat
				updateChatPreview(message.data.chatId, message.data.text);

				// Incrementar contador de não lidas
				const chat = state.chats.find(c => c.id === message.data.chatId);
				if (chat) {
					chat.unread = (chat.unread || 0) + 1;
					renderChatList();
				}
			}
			break;

		case 'typing_start':
			if (message.chatId === state.currentChatId) {
				showTypingIndicator();
			}
			break;

		case 'typing_stop':
			if (message.chatId === state.currentChatId) {
				hideTypingIndicator();
			}
			break;

		case 'user_online':
			updateUserStatus(message.userId, true);
			break;

		case 'user_offline':
			updateUserStatus(message.userId, false);
			break;

		case 'message_status_update':
			// Atualizar status de uma mensagem (entregue/lida)
			const messageIndex = state.messages.findIndex(m => m.id === message.messageId);
			if (messageIndex !== -1) {
				state.messages[messageIndex].status = message.status;
				renderMessages();
			}
			break;

		default:
			console.log('[WebSocket] Mensagem desconhecida:', message);
	}
}

function handleWebSocketStatus(status) {
	state.isOnline = status === 'connected';
	updateConnectionStatus();

	if (status === 'connected') {
		console.log('[WebSocket] Conectado com sucesso');
		showNotification('Conectado', 'success');
	} else if (status === 'disconnected') {
		console.log('[WebSocket] Desconectado');
		showNotification('Conexão perdida', 'warning');
	} else if (status === 'error') {
		showNotification('Erro de conexão', 'error');
	}
}

function showTypingIndicator() {
	state.isTyping = true;
	elements.typingIndicator.classList.add('active');
	updateContactStatus('typing');
	scrollToBottom();
}

function hideTypingIndicator() {
	state.isTyping = false;
	elements.typingIndicator.classList.remove('active');

	// Restaurar status online do contato
	const chat = state.chats.find(c => c.id === state.currentChatId);
	if (chat) {
		updateContactStatus(chat.online ? 'online' : 'offline');
	}
}

function updateUserStatus(userId, online) {
	// Atualizar status na lista de chats
	const chat = state.chats.find(c => c.userId === userId);
	if (chat) {
		chat.online = online;
		renderChatList();
	}

	// Atualizar status no header se for o chat atual
	if (state.currentChatId && chat && chat.id === state.currentChatId) {
		updateContactStatus(online ? 'online' : 'offline');
	}
}

function updateContactStatus(status) {
	let statusElement = elements.contactStatus.querySelector('span');

	if (!statusElement) {
		statusElement = document.createElement('span');
		elements.contactStatus.appendChild(statusElement);
	}

	if (status === 'online') {
		statusElement.textContent = 'online';
		statusElement.className = 'status-online';
	} else if (status === 'offline') {
		statusElement.textContent = 'offline';
		statusElement.className = 'status-offline';
	} else if (status === 'typing') {
		statusElement.textContent = 'digitando...';
		statusElement.className = 'status-typing';
	}
}

function updateConnectionStatus() {
	if (state.isOnline) {
		elements.connectionStatus.className = 'connection-status online';
		elements.connectionStatus.innerHTML = '<i class="fas fa-wifi"></i><span>Conectado</span>';
		elements.connectionStatus.style.opacity = '1';

		// Ocultar após alguns segundos
		setTimeout(() => {
			elements.connectionStatus.style.opacity = '0';
		}, 3000);
	} else {
		elements.connectionStatus.className = 'connection-status offline';
		elements.connectionStatus.innerHTML = '<i class="fas fa-wifi-slash"></i><span>Offline</span>';
		elements.connectionStatus.style.opacity = '1';
	}
}

function setTheme(theme) {
	state.theme = theme;

	if (theme === 'dark') {
		document.body.classList.add('dark-theme');
		elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
		elements.themeToggle.setAttribute('aria-label', 'Alternar para tema claro');
	} else {
		document.body.classList.remove('dark-theme');
		elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
		elements.themeToggle.setAttribute('aria-label', 'Alternar para tema escuro');
	}

	// Salvar preferência
	localStorage.setItem('pratoJustoTheme', theme);
}

function formatTime(timestamp) {
	const date = new Date(timestamp);
	const now = new Date();
	const diff = now - date;

	// Se for hoje, mostrar apenas a hora
	if (diff < 86400000) {
		return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
	}

	// Se for esta semana, mostrar dia da semana
	if (diff < 604800000) {
		return date.toLocaleDateString('pt-BR', { weekday: 'short' });
	}

	// Caso contrário, mostrar data completa
	return date.toLocaleDateString('pt-BR');
}

function adjustTextareaHeight() {
	const textarea = elements.messageInput;
	textarea.style.height = 'auto';
	textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

function scrollToBottom() {
	setTimeout(() => {
		elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
	}, 100);
}

function setupEventListeners() {
	// Enviar mensagem ao clicar no botão
	elements.sendBtn.addEventListener('click', sendMessage);

	// Enviar mensagem ao pressionar Enter (mas não Shift+Enter)
	elements.messageInput.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	});

	// Ajustar altura do textarea
	elements.messageInput.addEventListener('input', adjustTextareaHeight);

	// Alternar tema
	elements.themeToggle.addEventListener('click', () => {
		setTheme(state.theme === 'light' ? 'dark' : 'light');
	});

	// Alternar menu em dispositivos móveis
	elements.menuToggle.addEventListener('click', () => {
		elements.sidebar.classList.toggle('active');
	});

	// Fechar menu ao clicar fora (em mobile)
	document.addEventListener('click', (e) => {
		if (window.innerWidth < 769 &&
			!elements.sidebar.contains(e.target) &&
			!elements.menuToggle.contains(e.target)) {
			elements.sidebar.classList.remove('active');
		}
	});

	// Botão de emoji (funcionalidade básica)
	elements.emojiBtn.addEventListener('click', () => {
		// Em uma implementação real, isso abriria um seletor de emojis
		const emojis = ['😊', '👍', '❤️', '🍎', '🥦', '🍞', '🥕', '🍇', '🌽', '🥬'];
		const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

		const textarea = elements.messageInput;
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const text = textarea.value;

		textarea.value = text.substring(0, start) + randomEmoji + text.substring(end);
		textarea.focus();
		textarea.selectionStart = textarea.selectionEnd = start + randomEmoji.length;

		adjustTextareaHeight();
	});

	// Habilitar/desabilitar botão de envio baseado no conteúdo
	elements.messageInput.addEventListener('input', () => {
		elements.sendBtn.disabled = elements.messageInput.value.trim() === '';
	});

	// Inicialmente desabilitar botão de envio
	elements.sendBtn.disabled = true;

	// Simular mudança de status de conexão para demonstração
	setInterval(() => {
		// Em uma implementação real, isso verificaria o status real da conexão
		if (Math.random() > 0.98) { // 2% de chance de mudança
			state.isOnline = !state.isOnline;
			updateConnectionStatus();

			// Simular reconexão automática
			if (!state.isOnline) {
				setTimeout(() => {
					state.isOnline = true;
					updateConnectionStatus();
					if (state.wsConnection && state.wsConnection.reconnect) {
						state.wsConnection.reconnect();
					}
				}, 3000);
			}
		}
	}, 10000);

	// Focar no campo de mensagem ao carregar
	setTimeout(() => {
		elements.messageInput.focus();
	}, 500);
}

function showError(message) {
	const errorDiv = document.createElement('div');
	errorDiv.className = 'error-notification';
	errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
    `;
	errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
    `;

	document.body.appendChild(errorDiv);

	setTimeout(() => {
		errorDiv.remove();
	}, 5000);
}

function showNotification(message, type = 'info') {
	const colors = {
		info: '#2196F3',
		success: '#4CAF50',
		warning: '#FF9800',
		error: '#f44336'
	};

	const icons = {
		info: 'info-circle',
		success: 'check',
		warning: 'exclamation-triangle',
		error: 'exclamation-circle'
	};

	const notification = document.createElement('div');
	notification.className = 'notification';
	notification.innerHTML = `
        <i class="fas fa-${icons[type]}"></i>
        <span>${message}</span>
    `;
	notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
        animation: slideInRight 0.3s ease;
    `;

	document.body.appendChild(notification);

	setTimeout(() => {
		notification.style.animation = 'slideOutRight 0.3s ease';
		setTimeout(() => {
			notification.remove();
		}, 300);
	}, 3000);
}

// Adicionar estilos CSS dinâmicos para animações
const style = document.createElement('style');
style.textContent = `
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
    
    .online-dot {
        display: inline-block;
        width: 6px;
        height: 6px;
        background: #4CAF50;
        border-radius: 50%;
        margin-left: 4px;
    }
`;
document.head.appendChild(style);

// Exportar para uso externo
if (typeof module !== 'undefined' && module.exports) {
	module.exports = { apiClient, state, initializeApp };
}