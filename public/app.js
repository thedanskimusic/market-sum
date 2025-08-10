// API Configuration
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Global state
let currentNewsCategory = 'all';
let allNews = [];

// Utility functions
function formatNumber(num) {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(2) + 'M';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(2) + 'K';
    }
    return num.toLocaleString();
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatPercentage(value) {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

function showError(message, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<div class="error">${message}</div>`;
}

function showSuccess(message, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<div class="success">${message}</div>`;
}

// API Functions
async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Market Data Functions
async function loadMarketIndices() {
    try {
        const response = await fetchAPI('/market/indices');
        const indices = response.data;
        
        const indicesGrid = document.getElementById('indicesGrid');
        indicesGrid.innerHTML = indices.map(index => `
            <div class="index-card">
                <div class="index-name">${index.name}</div>
                <div class="index-value">${index.value.toFixed(2)}</div>
                <div class="index-change ${index.changePercent >= 0 ? 'positive' : 'negative'}">
                    <i class="fas fa-${index.changePercent >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
                    ${formatCurrency(Math.abs(index.change))} (${formatPercentage(index.changePercent)})
                </div>
            </div>
        `).join('');
    } catch (error) {
        showError('Failed to load market indices', 'indicesGrid');
    }
}

async function loadTopGainers() {
    try {
        const response = await fetchAPI('/market/gainers?limit=10');
        const gainers = response.data;
        
        const gainersGrid = document.getElementById('gainersGrid');
        gainersGrid.innerHTML = gainers.map(stock => createStockCard(stock)).join('');
    } catch (error) {
        showError('Failed to load top gainers', 'gainersGrid');
    }
}

async function loadTopLosers() {
    try {
        const response = await fetchAPI('/market/losers?limit=10');
        const losers = response.data;
        
        const losersGrid = document.getElementById('losersGrid');
        losersGrid.innerHTML = losers.map(stock => createStockCard(stock)).join('');
    } catch (error) {
        showError('Failed to load top losers', 'losersGrid');
    }
}

async function loadMostActive() {
    try {
        const response = await fetchAPI('/market/summary');
        const summary = response.data;
        
        const activeGrid = document.getElementById('activeGrid');
        activeGrid.innerHTML = summary.mostActive.map(stock => createStockCard(stock)).join('');
    } catch (error) {
        showError('Failed to load most active stocks', 'activeGrid');
    }
}

function createStockCard(stock) {
    const changeClass = stock.changePercent >= 0 ? 'positive' : 'negative';
    const changeIcon = stock.changePercent >= 0 ? 'arrow-up' : 'arrow-down';
    
    return `
        <div class="stock-card">
            <div class="stock-header">
                <div class="stock-symbol">${stock.symbol}</div>
                <div class="stock-price">${formatCurrency(stock.price)}</div>
            </div>
            <div class="stock-change ${changeClass}">
                <i class="fas fa-${changeIcon}"></i>
                ${formatCurrency(Math.abs(stock.change))} (${formatPercentage(stock.changePercent)})
            </div>
            <div class="stock-details">
                <div class="stock-detail">
                    <span>Volume:</span>
                    <span>${formatNumber(stock.volume)}</span>
                </div>
                <div class="stock-detail">
                    <span>Market Cap:</span>
                    <span>${formatNumber(stock.marketCap)}</span>
                </div>
                <div class="stock-detail">
                    <span>High:</span>
                    <span>${formatCurrency(stock.high)}</span>
                </div>
                <div class="stock-detail">
                    <span>Low:</span>
                    <span>${formatCurrency(stock.low)}</span>
                </div>
            </div>
        </div>
    `;
}

// News Functions
async function loadNews() {
    try {
        const response = await fetchAPI('/news?limit=20');
        allNews = response.data;
        displayNews(allNews);
    } catch (error) {
        showError('Failed to load news', 'newsGrid');
    }
}

function displayNews(news) {
    const newsGrid = document.getElementById('newsGrid');
    newsGrid.innerHTML = news.map(article => `
        <div class="news-card">
            <div class="news-title">
                <a href="${article.url}" target="_blank" rel="noopener noreferrer">
                    ${article.title}
                </a>
            </div>
            <div class="news-summary">${article.summary}</div>
            <div class="news-meta">
                <div class="news-source">${article.source}</div>
                <div class="news-sentiment ${article.sentiment}">${article.sentiment}</div>
            </div>
            <div class="news-meta">
                <div>${formatDate(article.publishedAt)}</div>
                ${article.tags && article.tags.length > 0 ? 
                    `<div>Tags: ${article.tags.slice(0, 3).join(', ')}</div>` : ''}
            </div>
        </div>
    `).join('');
}

async function searchNews(query) {
    try {
        const response = await fetchAPI(`/news/search?query=${encodeURIComponent(query)}&limit=20`);
        displayNews(response.data);
    } catch (error) {
        showError('Failed to search news', 'newsGrid');
    }
}

async function loadNewsByCategory(category) {
    try {
        const response = await fetchAPI(`/news/category/${category}?limit=20`);
        displayNews(response.data);
    } catch (error) {
        showError(`Failed to load ${category} news`, 'newsGrid');
    }
}

// Stock Search Functions
async function searchStock() {
    const symbol = document.getElementById('stockSearch').value.trim().toUpperCase();
    if (!symbol) {
        showError('Please enter a stock symbol', 'stockResult');
        return;
    }
    
    try {
        showLoading();
        const response = await fetchAPI(`/market/stock/${symbol}`);
        const stock = response.data;
        
        const stockResult = document.getElementById('stockResult');
        stockResult.innerHTML = createStockCard(stock);
    } catch (error) {
        showError(`Failed to find stock: ${symbol}`, 'stockResult');
    } finally {
        hideLoading();
    }
}

function handleStockSearch(event) {
    if (event.key === 'Enter') {
        searchStock();
    }
}

// UI Functions
function showTab(tabName) {
    // Hide all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab pane
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

function filterNews(category) {
    currentNewsCategory = category;
    
    // Update filter button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load news based on category
    if (category === 'all') {
        displayNews(allNews);
    } else {
        loadNewsByCategory(category);
    }
}

async function refreshAllData() {
    showLoading();
    try {
        await Promise.all([
            loadMarketIndices(),
            loadTopGainers(),
            loadTopLosers(),
            loadMostActive(),
            loadNews()
        ]);
        
        // Update last updated timestamp
        document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();
    } catch (error) {
        console.error('Error refreshing data:', error);
    } finally {
        hideLoading();
    }
}

// Auto-refresh functionality
function startAutoRefresh() {
    // Refresh data every 5 minutes
    setInterval(refreshAllData, 5 * 60 * 1000);
}

// Initialize the application
async function init() {
    try {
        showLoading();
        await refreshAllData();
        startAutoRefresh();
    } catch (error) {
        console.error('Failed to initialize application:', error);
    } finally {
        hideLoading();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', init);

// Global functions for HTML onclick handlers
window.refreshAllData = refreshAllData;
window.showTab = showTab;
window.filterNews = filterNews;
window.searchStock = searchStock;
window.handleStockSearch = handleStockSearch;
