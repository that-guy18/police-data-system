// API configuration
const API_BASE_URL = 'http://localhost:5000/api';

// State management
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// DOM Elements
const authSection = document.getElementById('auth-section');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-btn');
const loginSpinner = document.getElementById('login-spinner');
const resetDemoBtn = document.getElementById('reset-demo-btn');

// API functions
// API functions - Enhanced Version
class PoliceAPI {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };

        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }

        console.log(`🔄 API Request: ${config.method || 'GET'} ${url}`);

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            console.log(`📡 API Response: ${response.status} ${url}`, data);

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`❌ API Error (${url}):`, error.message);
            
            // More specific error messages
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Cannot connect to server. Please check if the backend is running.');
            }
            
            throw error;
        }
    }

    // Auth endpoints
    static async login(username, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }

    static async getCurrentUser() {
        return this.request('/auth/me');
    }

    static async resetDemo() {
        return this.request('/auth/reset-demo', {
            method: 'POST'
        });
    }

    // Name endpoints
    static async searchNames(query, algorithm = 'combined', threshold = 0.5) {
        return this.request('/names/search', {
            method: 'POST',
            body: JSON.stringify({ query, algorithm, threshold })
        });
    }

    static async addNameRecord(recordData) {
        return this.request('/names', {
            method: 'POST',
            body: JSON.stringify(recordData)
        });
    }

    static async standardizeName(name) {
        return this.request('/names/standardize', {
            method: 'POST',
            body: JSON.stringify({ name })
        });
    }

    // Admin endpoints
    static async getStats() {
        return this.request('/admin/stats');
    }

    static async testMatching(name1, name2) {
        return this.request('/admin/test-matching', {
            method: 'POST',
            body: JSON.stringify({ name1, name2 })
        });
    }

    // Debug endpoints
    static async testSingleMatch(name1, name2) {
        return this.request('/names/test-match', {
            method: 'POST',
            body: JSON.stringify({ name1, name2, algorithm: 'combined' })
        });
    }

    static async get(endpoint) {
        return this.request(endpoint);
    }
}

// UI Manager
// UI Manager - Enhanced Version
class UIManager {
    static showElement(element) {
        if (element) {
            element.classList.remove('hidden');
            console.log(`✅ Showing element: ${element.id || element.className}`);
        } else {
            console.error('❌ Cannot show undefined element');
        }
    }

    static hideElement(element) {
        if (element) {
            element.classList.add('hidden');
            console.log(`✅ Hiding element: ${element.id || element.className}`);
        } else {
            console.error('❌ Cannot hide undefined element');
        }
    }

    static showLoading(button = null) {
        console.log('⏳ Showing loading...');
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            this.showElement(overlay);
        } else {
            console.error('❌ Loading overlay element not found');
        }
        
        if (button) {
            button.disabled = true;
            const spinner = button.querySelector('.loading-spinner');
            if (spinner) this.showElement(spinner);
        }
    }

    static hideLoading(button = null) {
        console.log('✅ Hiding loading...');
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            this.hideElement(overlay);
        }
        
        if (button) {
            button.disabled = false;
            const spinner = button.querySelector('.loading-spinner');
            if (spinner) this.hideElement(spinner);
        }
    }

    static showMessage(message, type = 'info') {
        console.log(`📢 Showing ${type} message:`, message);
        
        // Remove existing messages
        this.clearMessages();
        
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}-message`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 12px 20px;
            border-radius: 4px;
            font-weight: bold;
            max-width: 400px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        
        // Add specific styles based on type
        if (type === 'error') {
            messageEl.style.backgroundColor = '#f8d7da';
            messageEl.style.color = '#721c24';
            messageEl.style.border = '1px solid #f5c6cb';
        } else if (type === 'success') {
            messageEl.style.backgroundColor = '#d4edda';
            messageEl.style.color = '#155724';
            messageEl.style.border = '1px solid #c3e6cb';
        } else {
            messageEl.style.backgroundColor = '#d1ecf1';
            messageEl.style.color = '#0c5460';
            messageEl.style.border = '1px solid #bee5eb';
        }
        
        document.body.appendChild(messageEl);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);
    }

    static clearMessages() {
        const messages = document.querySelectorAll('.message');
        messages.forEach(msg => msg.remove());
    }
}

// Auth Manager
// Auth Manager - Fixed Version
class AuthManager {
    static async initialize() {
        console.log('🔧 Initializing authentication...');
        
        // Check if user is already logged in
        const token = localStorage.getItem('authToken');
        if (token) {
            console.log('🔑 Found existing token, attempting auto-login...');
            authToken = token;
            try {
                const response = await PoliceAPI.getCurrentUser();
                currentUser = response.user;
                this.showApp();
                console.log('✅ Auto-login successful:', currentUser.username);
            } catch (error) {
                console.log('❌ Auto-login failed:', error.message);
                this.logout();
            }
        } else {
            console.log('🔐 No existing token found, showing login screen');
            this.showAuth();
        }
    }

    static async login(username, password) {
        console.log('🔐 Attempting login for:', username);
        UIManager.clearMessages();
        UIManager.showLoading(loginBtn);

        try {
            const response = await PoliceAPI.login(username, password);
            
            if (response.success) {
                authToken = response.token;
                currentUser = response.user;
                
                localStorage.setItem('authToken', authToken);
                console.log('✅ Login successful, token saved');
                
                // Show the main application
                this.showApp();
                
                UIManager.showMessage('🎉 Login successful! Welcome back.', 'success');
                console.log('🚀 Redirected to main application');
            } else {
                throw new Error(response.message || 'Login failed');
            }
            
        } catch (error) {
            console.error('❌ Login error:', error);
            UIManager.showMessage(`❌ Login failed: ${error.message}`, 'error');
        } finally {
            UIManager.hideLoading(loginBtn);
        }
    }

    static logout() {
        console.log('👋 Logging out...');
        authToken = null;
        currentUser = null;
        localStorage.removeItem('authToken');
        this.showAuth();
        UIManager.showMessage('👋 Logged out successfully', 'info');
    }

    static showAuth() {
        console.log('📱 Showing authentication screen');
        if (authSection) {
            authSection.classList.remove('hidden');
            console.log('✅ Auth section shown');
        } else {
            console.error('❌ Auth section element not found');
        }
        
        if (mainApp) {
            mainApp.classList.add('hidden');
            console.log('✅ Main app hidden');
        }
        
        // Clear any existing messages
        UIManager.clearMessages();
    }

    static showApp() {
        console.log('📱 Showing main application');
        if (authSection) {
            authSection.classList.add('hidden');
            console.log('✅ Auth section hidden');
        }
        
        if (mainApp) {
            mainApp.classList.remove('hidden');
            console.log('✅ Main app shown');
            
            // Update user info
            this.updateUserInfo();
            
            // Initialize any app-specific components
            this.initializeAppComponents();
        } else {
            console.error('❌ Main app element not found');
        }
        
        // Clear any existing messages
        UIManager.clearMessages();
    }

    static updateUserInfo() {
        const userInfo = document.getElementById('user-info');
        if (userInfo && currentUser) {
            userInfo.innerHTML = `
                <div class="user-details">
                    <strong>${currentUser.username}</strong>
                    <small>${currentUser.role} • ${currentUser.department}</small>
                </div>
                <button id="logout-btn" class="logout-btn">Logout</button>
            `;
            
            // Re-attach logout event listener
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    this.logout();
                });
                console.log('✅ Logout button event listener attached');
            }
            
            console.log('✅ User info updated:', currentUser.username);
        } else {
            console.error('❌ User info element not found or no current user');
        }
    }

    static initializeAppComponents() {
        console.log('🔧 Initializing app components...');
        
        // Initialize debug tools
        if (typeof AppManager !== 'undefined' && AppManager.addDebugTools) {
            AppManager.addDebugTools();
        }
        
        // Set up any other app-specific initialization here
        console.log('✅ App components initialized');
    }
}

// Application Manager
// Application Manager - Fixed with Proper Binding
class AppManager {
    static init() {
        console.log('🚀 Starting Police Data System...');
        
        // Initialize auth
        AuthManager.initialize();

        // Setup event listeners with proper binding
        this.setupEventListeners();
        
        // Add debug tools to the admin section
        this.addDebugTools();
        
        console.log('✅ App initialization complete');
    }

    static setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // Login form
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value.trim();
                const password = document.getElementById('password').value;
                
                if (!username || !password) {
                    UIManager.showMessage('Please enter both username and password', 'error');
                    return;
                }
                
                await AuthManager.login(username, password);
            });
        }

        // Reset demo button
        if (resetDemoBtn) {
            resetDemoBtn.addEventListener('click', async () => {
                try {
                    UIManager.showLoading();
                    await PoliceAPI.resetDemo();
                    UIManager.showMessage('✅ Demo data reset successfully!', 'success');
                } catch (error) {
                    UIManager.showMessage(`❌ Reset failed: ${error.message}`, 'error');
                } finally {
                    UIManager.hideLoading();
                }
            });
        }

        // Search functionality - FIXED: Use proper static method reference
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                console.log('🔍 Search button clicked');
                AppManager.performSearch(); // Use AppManager directly instead of this
            });
            console.log('✅ Search button event listener attached');
        }

        // Add record functionality
        const addRecordBtn = document.getElementById('add-record-btn');
        if (addRecordBtn) {
            addRecordBtn.addEventListener('click', () => {
                AppManager.addRecord();
            });
        }

        // Standardize name
        const standardizeBtn = document.getElementById('standardize-btn');
        if (standardizeBtn) {
            standardizeBtn.addEventListener('click', () => {
                AppManager.standardizeName();
            });
        }

        // Test algorithms
        const testAlgorithmBtn = document.getElementById('test-algorithm-btn');
        if (testAlgorithmBtn) {
            testAlgorithmBtn.addEventListener('click', () => {
                AppManager.testAlgorithms();
            });
        }

        // Add keyboard shortcut for search (Ctrl + Enter)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                if (document.getElementById('name-input')) {
                    AppManager.performSearch();
                }
            }
        });
    }

    // FIXED: All methods are static and properly referenced
    static async performSearch() {
        console.log('🔍 Performing search...');
        
        const query = document.getElementById('name-input').value.trim();
        const algorithm = document.getElementById('algorithm-select').value;
        const threshold = document.getElementById('threshold-select').value;

        console.log('📋 Search parameters:', { query, algorithm, threshold });

        if (!query) {
            UIManager.showMessage('Please enter a name to search', 'error');
            return;
        }

        // Show loading state in the results area
        const resultsDiv = document.getElementById('search-results');
        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <div class="search-loading">
                    <div class="loading-spinner"></div>
                    <p>Searching for "${query}"...</p>
                </div>
            `;
        }

        UIManager.showLoading();

        try {
            console.log('🔄 Calling PoliceAPI.searchNames...');
            const response = await PoliceAPI.searchNames(query, algorithm, threshold);
            console.log('✅ API Response received:', response);
            
            // Check if response is valid
            if (!response) {
                throw new Error('No response from server');
            }
            
            if (!response.success) {
                throw new Error(response.message || 'Search failed');
            }
            
            console.log(`🎯 Found ${response.matches_found} matches, displaying...`);
            AppManager.displaySearchResults(response); // FIXED: Use AppManager directly
            
        } catch (error) {
            console.error('❌ Search error:', error);
            
            // Show error in results area
            if (resultsDiv) {
                resultsDiv.innerHTML = `
                    <div class="search-error">
                        <h4>Search Failed</h4>
                        <p>Error: ${error.message}</p>
                        <button onclick="AppManager.performSearch()" class="retry-btn">Retry Search</button>
                    </div>
                `;
            }
            
            UIManager.showMessage(`Search failed: ${error.message}`, 'error');
        } finally {
            UIManager.hideLoading();
        }
    }

    static displaySearchResults(response) {
        console.log('🎯 Displaying search results on webpage...');
        
        const resultsDiv = document.getElementById('search-results');
        if (!resultsDiv) {
            console.error('❌ CRITICAL: search-results div not found!');
            UIManager.showMessage('Error: Cannot display results - page element missing', 'error');
            return;
        }

        console.log('📊 Raw response for display:', response);
        
        // Check if we have matches data
        if (!response.matches) {
            console.error('❌ No matches array in response');
            resultsDiv.innerHTML = `
                <div class="search-error">
                    <h4>Data Error</h4>
                    <p>No matches data received from server</p>
                    <p>Response: ${JSON.stringify(response)}</p>
                </div>
            `;
            return;
        }

        if (response.matches.length === 0) {
            console.log('📭 No matches found, showing empty state');
            resultsDiv.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <h4>No matches found</h4>
                    <p>No records found for "<strong>${response.query}</strong>"</p>
                    <div class="search-tips">
                        <h5>Search Tips:</h5>
                        <ul>
                            <li>Try different spelling variations</li>
                            <li>Lower the match threshold</li>
                            <li>Use "Combined Approach" algorithm</li>
                            <li>Search for shorter name parts</li>
                        </ul>
                    </div>
                </div>
            `;
            return;
        }

        console.log(`🎉 Building HTML for ${response.matches.length} matches...`);

        let html = `
            <div class="results-summary">
                <h3>🔍 Search Results</h3>
                <div class="summary-stats">
                    <span class="matches-count">${response.matches.length} matches found for</span>
                    <span class="search-query">"${response.query}"</span>
                </div>
                <div class="search-settings">
                    <small>Algorithm: <strong>${response.algorithm}</strong> • 
                    Threshold: <strong>${Math.round(response.threshold * 100)}%</strong></small>
                </div>
            </div>
            <div class="results-list">
        `;

        response.matches.forEach((match, index) => {
            console.log(`   📝 Adding match ${index + 1}: ${match.original_name} (${match.match_score}%)`);
            
            const matchLevel = match.match_score >= 80 ? 'high-match' : 
                              match.match_score >= 60 ? 'medium-match' : 'low-match';
            
            const matchIcon = match.match_score >= 80 ? '🎯' : 
                             match.match_score >= 60 ? '✅' : '⚠️';

            html += `
                <div class="result-item ${matchLevel}">
                    <div class="result-header">
                        <div class="match-info">
                            <span class="match-icon">${matchIcon}</span>
                            <div class="name-and-score">
                                <h4 class="original-name">${match.original_name}</h4>
                                <div class="match-details">
                                    <span class="match-score">${match.match_score}% match</span>
                                    <span class="person-type ${match.person_type}">${match.person_type}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="result-content">
                        <div class="result-row">
                            <div class="result-field">
                                <label>Standardized Name:</label>
                                <span class="standardized-name">${match.standardized_name}</span>
                            </div>
                            <div class="result-field">
                                <label>Case Number:</label>
                                <span class="case-number">${match.case_number || 'N/A'}</span>
                            </div>
                        </div>
                        
                        <div class="result-row">
                            <div class="result-field">
                                <label>Department:</label>
                                <span class="department">${match.department}</span>
                            </div>
                            <div class="result-field">
                                <label>Added By:</label>
                                <span class="created-by">${match.created_by}</span>
                            </div>
                        </div>
                        
                        <div class="result-meta">
                            <small>Record ID: ${match.id} • Created: ${new Date(match.created_at).toLocaleDateString()}</small>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div>`; // Close results-list
        
        console.log('📄 Setting innerHTML...');
        resultsDiv.innerHTML = html;
        console.log('✅ Search results should now be visible on webpage!');
        
        // Force a scroll to results
        setTimeout(() => {
            const searchSection = document.getElementById('search');
            if (searchSection) {
                searchSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }

    static async addRecord() {
        console.log('📝 Adding new record...');
        
        const name = document.getElementById('record-name').value.trim();
        const type = document.getElementById('record-type').value;
        const caseNumber = document.getElementById('record-case').value.trim();
        const department = document.getElementById('record-department').value.trim();

        console.log('Record data:', { name, type, caseNumber, department });

        if (!name || !type) {
            UIManager.showMessage('Name and person type are required', 'error');
            return;
        }

        UIManager.showLoading();

        try {
            const response = await PoliceAPI.addNameRecord({
                original_name: name,
                person_type: type,
                case_number: caseNumber,
                department: department
            });

            console.log('Add record response:', response);
            UIManager.showMessage(`✅ Record added successfully! Standardized as: ${response.record.standardized_name}`, 'success');
            
            // Clear form
            document.getElementById('record-name').value = '';
            document.getElementById('record-case').value = '';
            document.getElementById('record-department').value = '';
            
        } catch (error) {
            console.error('Add record error:', error);
            UIManager.showMessage(`❌ Failed to add record: ${error.message}`, 'error');
        } finally {
            UIManager.hideLoading();
        }
    }

    static async standardizeName() {
        console.log('🔄 Standardizing name...');
        
        const name = document.getElementById('standardize-input').value.trim();
        
        console.log('Name to standardize:', name);

        if (!name) {
            UIManager.showMessage('Please enter a name to standardize', 'error');
            return;
        }

        UIManager.showLoading();

        try {
            const response = await PoliceAPI.standardizeName(name);
            console.log('Standardize response:', response);
            
            const resultsDiv = document.getElementById('admin-results');
            if (resultsDiv) {
                resultsDiv.innerHTML = `
                    <div class="standardization-result">
                        <h4>Name Standardization</h4>
                        <div class="result-pair">
                            <label>Original:</label>
                            <span class="original-name">${response.original_name}</span>
                        </div>
                        <div class="result-pair">
                            <label>Standardized:</label>
                            <span class="standardized-name">${response.standardized_name}</span>
                        </div>
                        <div class="standardization-notes">
                            <p><strong>Applied rules:</strong> Spelling correction, transliteration standardization, case normalization</p>
                        </div>
                    </div>
                `;
            }
            
        } catch (error) {
            console.error('Standardize error:', error);
            UIManager.showMessage(`Standardization failed: ${error.message}`, 'error');
        } finally {
            UIManager.hideLoading();
        }
    }

    static async testAlgorithms() {
        console.log('🧪 Testing algorithms...');
        
        const name1 = document.getElementById('algorithm-test').value.trim();
        const name2 = document.getElementById('algorithm-test2').value.trim();

        console.log('Algorithm test names:', { name1, name2 });

        if (!name1 || !name2) {
            UIManager.showMessage('Please enter both names to compare', 'error');
            return;
        }

        UIManager.showLoading();

        try {
            const response = await PoliceAPI.testMatching(name1, name2);
            console.log('Algorithm test response:', response);
            AppManager.displayAlgorithmTest(response.comparison); // FIXED: Use AppManager directly
        } catch (error) {
            console.error('Algorithm test error:', error);
            UIManager.showMessage(`Test failed: ${error.message}`, 'error');
        } finally {
            UIManager.hideLoading();
        }
    }

    static displayAlgorithmTest(comparison) {
        const resultsDiv = document.getElementById('admin-results');
        if (!resultsDiv) {
            console.error('❌ Admin results div not found');
            return;
        }
        
        resultsDiv.innerHTML = `
            <div class="algorithm-test-result">
                <h4>Algorithm Comparison</h4>
                <div class="test-comparison">
                    <div class="name-pair">
                        <span class="test-name">"${comparison.name1}"</span>
                        <span class="vs">vs</span>
                        <span class="test-name">"${comparison.name2}"</span>
                    </div>
                    
                    <div class="algorithm-results">
                        <div class="algorithm-result">
                            <label>Fuzzy Matching:</label>
                            <span class="score fuzzy">${comparison.fuzzy_score}%</span>
                        </div>
                        <div class="algorithm-result">
                            <label>Phonetic Match:</label>
                            <span class="${comparison.phonetic_match ? 'match-yes' : 'match-no'}">
                                ${comparison.phonetic_match ? '✅ Yes' : '❌ No'}
                            </span>
                        </div>
                        <div class="algorithm-result">
                            <label>Combined Score:</label>
                            <span class="score combined">${comparison.combined_score}%</span>
                        </div>
                    </div>
                    
                    <div class="standardized-names">
                        <div class="standardized-pair">
                            <label>Standardized Names:</label>
                            <div class="std-name">${comparison.standardized_name1}</div>
                            <div class="std-name">${comparison.standardized_name2}</div>
                        </div>
                    </div>
                    
                    <div class="recommendation">
                        <strong>Recommendation:</strong>
                        <span class="${comparison.combined_score >= 70 ? 'high-confidence' : 
                                     comparison.combined_score >= 50 ? 'medium-confidence' : 'low-confidence'}">
                            ${comparison.combined_score >= 70 ? 'High confidence match' : 
                             comparison.combined_score >= 50 ? 'Moderate confidence match' : 'Low confidence match'}
                        </span>
                    </div>
                </div>
            </div>
        `;
        
        console.log('✅ Algorithm test results displayed');
    }

    // Debug tools methods
    static addDebugTools() {
        setTimeout(() => {
            const adminSection = document.getElementById('admin');
            if (!adminSection) {
                console.log('⚠️ Admin section not found, retrying...');
                setTimeout(() => AppManager.addDebugTools(), 1000);
                return;
            }

            if (document.getElementById('debug-tools-section')) {
                return;
            }

            console.log('🔧 Adding debug tools to admin section...');

            const debugSection = document.createElement('div');
            debugSection.id = 'debug-tools-section';
            debugSection.className = 'debug-tools card';
            debugSection.innerHTML = `
                <h3>🔧 Debug Tools</h3>
                <p class="debug-description">Use these tools to test and debug the name matching system</p>
                
                <div class="debug-buttons">
                    <button id="test-match-btn" class="debug-btn">
                        🧪 Test Single Match
                    </button>
                    <button id="view-records-btn" class="debug-btn">
                        📋 View All Records
                    </button>
                    <button id="test-search-btn" class="debug-btn">
                        🔍 Test Search
                    </button>
                    <button id="clear-results-btn" class="debug-btn">
                        🗑️ Clear Results
                    </button>
                </div>
                
                <div class="debug-actions">
                    <div class="form-group">
                        <label for="debug-name1">Test Name 1</label>
                        <input type="text" id="debug-name1" value="Suresh Kumar" placeholder="First name to compare">
                    </div>
                    <div class="form-group">
                        <label for="debug-name2">Test Name 2</label>
                        <input type="text" id="debug-name2" value="Sureesh Kumar" placeholder="Second name to compare">
                    </div>
                </div>
                
                <div id="debug-results" class="debug-results">
                    <p class="placeholder">Debug results will appear here</p>
                </div>
            `;

            adminSection.insertBefore(debugSection, adminSection.firstChild);

            // Add event listeners for debug buttons
            document.getElementById('test-match-btn').addEventListener('click', () => {
                AppManager.testSingleMatch();
            });

            document.getElementById('view-records-btn').addEventListener('click', () => {
                AppManager.viewAllRecords();
            });

            document.getElementById('test-search-btn').addEventListener('click', () => {
                AppManager.testSearchFunction();
            });

            document.getElementById('clear-results-btn').addEventListener('click', () => {
                AppManager.clearDebugResults();
            });

            console.log('✅ Debug tools added successfully');
        }, 500);
    }

    static async testSingleMatch() {
        const name1 = document.getElementById('debug-name1')?.value || "Suresh Kumar";
        const name2 = document.getElementById('debug-name2')?.value || "Sureesh Kumar";
        
        UIManager.showLoading();
        
        try {
            const response = await PoliceAPI.testSingleMatch(name1, name2);
            console.log('🧪 Single match test result:', response);
            
            const resultsDiv = document.getElementById('debug-results');
            resultsDiv.innerHTML = `
                <div class="debug-result">
                    <h4>🧪 Single Match Test Results</h4>
                    <div class="test-comparison">
                        <div class="name-pair">
                            <span class="name">"${name1}"</span>
                            <span class="vs">vs</span>
                            <span class="name">"${name2}"</span>
                        </div>
                        
                        <div class="algorithm-results">
                            <div class="algorithm-result">
                                <label>Fuzzy Matching Score:</label>
                                <span class="score ${response.score >= 70 ? 'high' : response.score >= 50 ? 'medium' : 'low'}">
                                    ${response.score}%
                                </span>
                            </div>
                            <div class="algorithm-result">
                                <label>Phonetic Match:</label>
                                <span class="${response.phonetic_match ? 'match-yes' : 'match-no'}">
                                    ${response.phonetic_match ? '✅ Yes' : '❌ No'}
                                </span>
                            </div>
                        </div>
                        
                        <div class="standardized-names">
                            <div class="standardized-pair">
                                <label>Standardized Names:</label>
                                <div><strong>Name 1:</strong> ${response.standardized_name1}</div>
                                <div><strong>Name 2:</strong> ${response.standardized_name2}</div>
                            </div>
                        </div>
                        
                        <div class="recommendation">
                            <strong>Assessment:</strong>
                            <span class="${response.score >= 70 ? 'high-confidence' : response.score >= 50 ? 'medium-confidence' : 'low-confidence'}">
                                ${response.score >= 70 ? 'High confidence match' : 
                                 response.score >= 50 ? 'Moderate confidence match' : 'Low confidence match'}
                            </span>
                        </div>
                    </div>
                </div>
            `;
            
            UIManager.showMessage('Single match test completed successfully', 'success');
        } catch (error) {
            UIManager.showMessage(`❌ Test failed: ${error.message}`, 'error');
            console.error('Test match error:', error);
        } finally {
            UIManager.hideLoading();
        }
    }

    static async viewAllRecords() {
        UIManager.showLoading();
        
        try {
            const response = await PoliceAPI.get('/names/debug/records');
            console.log('📋 All records:', response);
            
            const resultsDiv = document.getElementById('debug-results');
            let html = `
                <div class="debug-result">
                    <h4>📋 All Records in Database</h4>
                    <div class="records-summary">
                        <div class="summary-item">
                            <strong>Total Records:</strong> ${response.total_records}
                        </div>
                        <div class="summary-item">
                            <strong>Active Records:</strong> ${response.active_records}
                        </div>
                    </div>
                    <div class="records-list">
            `;
            
            if (response.records.length === 0) {
                html += `<p class="no-records">No records found in the database</p>`;
            } else {
                response.records.forEach(record => {
                    html += `
                        <div class="record-item">
                            <div class="record-header">
                                <strong class="record-name">${record.original_name}</strong>
                                <span class="record-id">#${record.id}</span>
                            </div>
                            <div class="record-details">
                                <span class="record-type ${record.person_type}">${record.person_type}</span>
                                <span class="record-case">${record.case_number || 'No case number'}</span>
                            </div>
                            <div class="record-standardized">
                                <small>Standardized: ${record.standardized_name}</small>
                            </div>
                        </div>
                    `;
                });
            }
            
            html += `</div></div>`;
            resultsDiv.innerHTML = html;
            
            UIManager.showMessage(`✅ Loaded ${response.active_records} records from database`, 'success');
        } catch (error) {
            UIManager.showMessage(`❌ Failed to load records: ${error.message}`, 'error');
            console.error('View records error:', error);
        } finally {
            UIManager.hideLoading();
        }
    }

    static async testSearchFunction() {
        const testQueries = [
            "Suresh",
            "Sureesh", 
            "Sursh",
            "Ramesh",
            "Priyanka",
            "Anjali"
        ];
        
        UIManager.showLoading();
        
        try {
            const resultsDiv = document.getElementById('debug-results');
            resultsDiv.innerHTML = `
                <div class="debug-result">
                    <h4>🔍 Search Function Test</h4>
                    <p>Testing search with multiple queries...</p>
                    <div id="search-test-results"></div>
                </div>
            `;
            
            const testResults = [];
            
            for (const query of testQueries) {
                try {
                    const response = await PoliceAPI.searchNames(query, 'combined', 0.3);
                    testResults.push({
                        query,
                        success: true,
                        matches: response.matches_found,
                        data: response
                    });
                    
                    // Update results in real-time
                    const resultsContainer = document.getElementById('search-test-results');
                    resultsContainer.innerHTML += `
                        <div class="search-test-result ${response.matches_found > 0 ? 'success' : 'warning'}">
                            <strong>Query:</strong> "${query}" → 
                            <span class="matches">${response.matches_found} matches</span>
                            ${response.matches_found > 0 ? '✅' : '⚠️'}
                        </div>
                    `;
                    
                } catch (error) {
                    testResults.push({
                        query,
                        success: false,
                        error: error.message
                    });
                    
                    const resultsContainer = document.getElementById('search-test-results');
                    resultsContainer.innerHTML += `
                        <div class="search-test-result error">
                            <strong>Query:</strong> "${query}" → 
                            <span class="error">Error: ${error.message}</span> ❌
                        </div>
                    `;
                }
            }
            
            // Summary
            const successfulTests = testResults.filter(r => r.success && r.matches > 0).length;
            const totalTests = testResults.length;
            
            const resultsContainer = document.getElementById('search-test-results');
            resultsContainer.innerHTML += `
                <div class="search-test-summary">
                    <h5>Test Summary</h5>
                    <p><strong>Successful searches:</strong> ${successfulTests}/${totalTests}</p>
                    <p><strong>Success rate:</strong> ${Math.round((successfulTests / totalTests) * 100)}%</p>
                </div>
            `;
            
            UIManager.showMessage(`Search test completed: ${successfulTests}/${totalTests} successful`, 'success');
            
        } catch (error) {
            UIManager.showMessage(`❌ Search test failed: ${error.message}`, 'error');
        } finally {
            UIManager.hideLoading();
        }
    }

    static clearDebugResults() {
        const resultsDiv = document.getElementById('debug-results');
        if (resultsDiv) {
            resultsDiv.innerHTML = '<p class="placeholder">Debug results will appear here</p>';
        }
        UIManager.showMessage('Debug results cleared', 'info');
    }
}

// Make AppManager available globally for debugging
window.AppManager = AppManager;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    AppManager.init()
});


// EMERGENCY TEST: Force display of results
function forceShowResults() {
    console.log('🚨 FORCING RESULTS DISPLAY...');
    
    const testData = {
        success: true,
        query: "Suresh Kumar",
        algorithm: "combined", 
        threshold: 0.3,
        matches_found: 3,
        matches: [
            {
                id: 1,
                original_name: "Suresh Kumar",
                standardized_name: "Suresh Kumar", 
                person_type: "suspect",
                case_number: "CASE-2024-001",
                department: "District 1",
                created_by: "officer1",
                match_score: 95,
                created_at: "2024-01-15T10:30:00.000Z"
            },
            {
                id: 2, 
                original_name: "Sureesh Kumar",
                standardized_name: "Suresh Kumar",
                person_type: "suspect",
                case_number: "CASE-2024-001", 
                department: "District 1",
                created_by: "officer1",
                match_score: 88,
                created_at: "2024-01-15T11:15:00.000Z"
            },
            {
                id: 3,
                original_name: "Sursh Kumar",
                standardized_name: "Suresh Kumar",
                person_type: "witness",
                case_number: "CASE-2024-001",
                department: "District 1",
                created_by: "officer1", 
                match_score: 82,
                created_at: "2024-01-15T12:00:00.000Z"
            }
        ]
    };
    
    AppManager.displaySearchResults(testData);
}

// Make it available in browser console
window.forceShowResults = forceShowResults;
window.debugSearch = AppManager.performSearch;