/**
 * 网络管理器 - 处理客户端与服务端的通信
 */
class NetworkManager {
    constructor() {
        this.socket = null;
        this._isConnected = false;
        this._isAuthenticated = false;
        this.token = localStorage.getItem('gameToken');
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.syncInterval = null;
        this.lastSyncTime = 0;
        this.syncCooldown = 5000; // 5秒同步冷却时间
        
        // 动态检测服务器地址
        this.serverUrl = this.detectServerUrl();
        
        // 事件监听器
        this.eventListeners = new Map();
        
        // 初始化连接
        this.connect();
    }
    
    /**
     * 检测服务器URL
     */
    detectServerUrl() {
        if (typeof window !== 'undefined') {
            const currentHost = window.location.host;
            const protocol = window.location.protocol;
            
            // 如果是通过Vercel部署访问
            if (currentHost.includes('vercel.app') || currentHost.includes('vercel.com')) {
                // Vercel部署环境，使用静态模式（无后端服务器）
                return null; // 静态模式，不需要后端连接
            }
            // 如果是通过ngrok或bore访问
            else if (currentHost.includes('ngrok-free.app') || currentHost.includes('bore.pub')) {
                // 通过同一个隧道访问后端API
                return `${protocol}//${currentHost}`;
            }
            // 如果是本地访问
            else if (currentHost.includes('localhost') || currentHost.includes('127.0.0.1')) {
                return 'http://localhost:8081';
            }
            // 如果是局域网IP访问
            else {
                const host = currentHost.split(':')[0];
                return `${protocol}//${host}:8081`;
            }
        }
        // 默认返回localhost
        return 'http://localhost:8081';
    }
    
    /**
     * 连接到服务器
     */
    connect() {
        // 如果是Vercel静态部署，跳过Socket.IO连接
        if (this.serverUrl === null) {
            console.log('🌐 Vercel静态部署模式 - 使用本地存储');
            this._isConnected = false;
            this._isAuthenticated = true; // 静态模式下直接认证
            return;
        }
        
        try {
            // 连接到Socket.io服务器
            this.socket = io(this.serverUrl, {
                transports: ['websocket', 'polling']
            });
            
            this.setupEventHandlers();
        } catch (error) {
            console.error('连接服务器失败:', error);
            this.scheduleReconnect();
        }
    }
    
    /**
     * 设置Socket事件处理器
     */
    setupEventHandlers() {
        // 连接成功
        this.socket.on('connect', () => {
            console.log('已连接到服务器');
            this._isConnected = true;
            this.reconnectAttempts = 0;
            
            // 如果有token，自动认证
            if (this.token) {
                this.authenticate(this.token);
            }
            
            this.emit('connected');
        });
        
        // 连接断开
        this.socket.on('disconnect', (reason) => {
            console.log('与服务器断开连接:', reason);
            this._isConnected = false;
            this._isAuthenticated = false;
            
            this.emit('disconnected', reason);
            
            // 自动重连
            if (reason !== 'io client disconnect') {
                this.scheduleReconnect();
            }
        });
        
        // 认证成功
        this.socket.on('authenticated', (data) => {
            console.log('认证成功');
            this._isAuthenticated = true;
            this.startAutoSync();
            this.emit('authenticated', data);
        });
        
        // 认证失败
        this.socket.on('auth_error', (data) => {
            console.error('认证失败:', data.message);
            this.token = null;
            localStorage.removeItem('gameToken');
            this.emit('auth_error', data);
        });
        
        // 强制断开连接
        this.socket.on('force_disconnect', (data) => {
            console.warn('被强制断开连接:', data.message);
            this.emit('force_disconnect', data);
        });
        
        // 同步成功
        this.socket.on('sync_success', (data) => {
            this.lastSyncTime = Date.now();
            this.emit('sync_success', data);
        });
        
        // 在线玩家列表
        this.socket.on('online_players', (data) => {
            this.emit('online_players', data);
        });
        
        // 错误处理
        this.socket.on('error', (data) => {
            console.error('服务器错误:', data.message);
            this.emit('error', data);
        });
        
        // 连接错误
        this.socket.on('connect_error', (error) => {
            console.error('连接错误:', error);
            this.scheduleReconnect();
        });
    }
    
    /**
     * 用户认证
     */
    authenticate(token) {
        if (!this.isConnected) {
            console.warn('未连接到服务器，无法认证');
            return;
        }
        
        this.token = token;
        localStorage.setItem('gameToken', token);
        this.socket.emit('authenticate', { token });
    }
    
    /**
     * 用户登录
     */
    async login(username, password) {
        // Vercel静态模式下，模拟登录成功
        if (this.serverUrl === null) {
            const mockToken = 'static_mode_token_' + Date.now();
            this.token = mockToken;
            localStorage.setItem('gameToken', mockToken);
            this._isAuthenticated = true;
            return { success: true, data: { token: mockToken, username } };
        }
        
        try {
            const response = await fetch(`${this.serverUrl}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.authenticate(data.token);
                return { success: true, data };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('登录请求失败:', error);
            return { success: false, error: '网络连接失败' };
        }
    }
    
    /**
     * 用户注册
     */
    async register(username, password) {
        // Vercel静态模式下，模拟注册成功
        if (this.serverUrl === null) {
            const mockToken = 'static_mode_token_' + Date.now();
            this.token = mockToken;
            localStorage.setItem('gameToken', mockToken);
            this._isAuthenticated = true;
            return { success: true, data: { token: mockToken, username } };
        }
        
        try {
            const response = await fetch(`${this.serverUrl}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.authenticate(data.token);
                return { success: true, data };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('注册请求失败:', error);
            return { success: false, error: '网络连接失败' };
        }
    }
    
    /**
     * 同步游戏状态到服务器
     */
    syncGameState(gameState) {
        // Vercel静态模式下，直接保存到本地存储
        if (this.serverUrl === null) {
            localStorage.setItem('gameState', JSON.stringify(gameState));
            return;
        }
        
        if (!this._isAuthenticated) {
            console.warn('未认证，无法同步游戏状态');
            return;
        }
        
        // 检查同步冷却时间
        const now = Date.now();
        if (now - this.lastSyncTime < this.syncCooldown) {
            return;
        }
        
        this.socket.emit('sync_game_state', { gameState });
    }
    
    /**
     * 发送战斗结果
     */
    sendBattleResult(result) {
        // Vercel静态模式下，不需要发送到服务器
        if (this.serverUrl === null) {
            return;
        }
        
        if (!this._isAuthenticated) return;
        this.socket.emit('battle_result', result);
    }

    /**
     * 发送任务完成
     */
    sendQuestCompleted(questData) {
        // Vercel静态模式下，不需要发送到服务器
        if (this.serverUrl === null) {
            return;
        }
        
        if (!this._isAuthenticated) return;
        this.socket.emit('quest_completed', questData);
    }

    /**
     * 发送物品合成
     */
    sendItemCrafted(itemData) {
        // Vercel静态模式下，不需要发送到服务器
        if (this.serverUrl === null) {
            return;
        }
        
        if (!this._isAuthenticated) return;
        this.socket.emit('item_crafted', itemData);
    }
    
    /**
     * 获取排行榜
     */
    async getRankings(type = 'level', limit = 50) {
        // Vercel静态模式下，返回空排行榜
        if (this.serverUrl === null) {
            return { success: true, rankings: [], total: 0 };
        }
        
        try {
            const response = await fetch(`${this.serverUrl}/api/rankings?type=${type}&limit=${limit}`);
            const data = await response.json();
            
            if (response.ok) {
                // 服务器返回格式: {success: true, rankings: [...], total: number}
                return data;
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('获取排行榜失败:', error);
            return { success: false, error: '网络连接失败' };
        }
    }
    
    /**
     * 获取在线玩家列表
     */
    getOnlinePlayers() {
        // Vercel静态模式下，不需要获取在线玩家
        if (this.serverUrl === null) {
            return;
        }
        
        if (!this._isAuthenticated) return;
        this.socket.emit('get_online_players');
    }
    
    /**
     * 开始自动同步
     */
    startAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        // 每30秒自动同步一次
        this.syncInterval = setInterval(() => {
            if (window.gameState && this._isAuthenticated) {
                this.syncGameState(window.gameState);
            }
        }, 30000);
    }
    
    /**
     * 停止自动同步
     */
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }
    
    /**
     * 计划重连
     */
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('达到最大重连次数，停止重连');
            this.emit('max_reconnect_attempts');
            return;
        }
        
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        
        console.log(`${delay}ms后尝试第${this.reconnectAttempts}次重连`);
        
        setTimeout(() => {
            if (!this.isConnected) {
                this.connect();
            }
        }, delay);
    }
    
    /**
     * 添加事件监听器
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }
    
    /**
     * 移除事件监听器
     */
    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
    
    /**
     * 移除指定事件的所有监听器
     */
    removeAllListeners(event) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
    }
    
    /**
     * 触发事件
     */
    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`事件处理器错误 (${event}):`, error);
                }
            });
        }
    }
    
    /**
     * 登出
     */
    logout() {
        this.token = null;
        localStorage.removeItem('gameToken');
        this._isAuthenticated = false;
        this.stopAutoSync();
        
        if (this.socket) {
            this.socket.disconnect();
        }
        
        this.emit('logout');
    }
    
    /**
     * 断开连接
     */
    disconnect() {
        this.stopAutoSync();
        
        if (this.socket) {
            this.socket.disconnect();
        }
    }
    
    /**
     * 获取连接状态
     */
    /**
     * 检查是否已连接
     */
    isConnected() {
        return this.socket && this.socket.connected;
    }
    
    /**
     * 检查是否已认证
     */
    isAuthenticated() {
        return this._isAuthenticated && this.socket && this.socket.connected;
    }
    
    getStatus() {
        return {
            isConnected: this._isConnected,
            isAuthenticated: this._isAuthenticated,
            reconnectAttempts: this.reconnectAttempts
        };
    }
}

// 创建全局网络管理器实例
if (typeof window !== 'undefined') {
    window.networkManager = new NetworkManager();
}