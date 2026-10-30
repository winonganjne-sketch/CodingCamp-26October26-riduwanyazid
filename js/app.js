// Expense & Budget Visualizer Application
// LocalStorage key
const STORAGE_KEY = 'expenseTrackerData';
const CATEGORIES_KEY = 'expenseTrackerCategories';

// Global variables
let transactions = [];
let customCategories = [];
let expenseChart = null;

// Dummy data untuk demo
const dummyTransactions = [
    {
        id: 1730275200000,
        itemName: "Nasi Goreng",
        amount: 25000,
        category: "Makanan",
        date: new Date(2026, 9, 15).toISOString()
    },
    {
        id: 1730275201000,
        itemName: "Grab ke Kantor",
        amount: 35000,
        category: "Transport",
        date: new Date(2026, 9, 16).toISOString()
    },
    {
        id: 1730275202000,
        itemName: "Kopi Susu",
        amount: 18000,
        category: "Makanan",
        date: new Date(2026, 9, 18).toISOString()
    },
    {
        id: 1730275203000,
        itemName: "Bioskop",
        amount: 50000,
        category: "Hiburan",
        date: new Date(2026, 9, 20).toISOString()
    },
    {
        id: 1730275204000,
        itemName: "Bensin Motor",
        amount: 40000,
        category: "Transport",
        date: new Date(2026, 9, 22).toISOString()
    },
    {
        id: 1730275205000,
        itemName: "Makan Siang",
        amount: 30000,
        category: "Makanan",
        date: new Date(2026, 9, 25).toISOString()
    },
    {
        id: 1730275206000,
        itemName: "Netflix Subscription",
        amount: 54000,
        category: "Hiburan",
        date: new Date(2026, 9, 1).toISOString()
    },
    {
        id: 1730275207000,
        itemName: "Ayam Geprek",
        amount: 22000,
        category: "Makanan",
        date: new Date(2026, 9, 28).toISOString()
    },
    {
        id: 1730275208000,
        itemName: "Gojek",
        amount: 28000,
        category: "Transport",
        date: new Date(2026, 9, 29).toISOString()
    },
    {
        id: 1730275209000,
        itemName: "Es Teh Manis",
        amount: 8000,
        category: "Makanan",
        date: new Date(2026, 9, 30).toISOString()
    }
];

// DOM Elements
const transactionForm = document.getElementById('transactionForm');
const itemNameInput = document.getElementById('itemName');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const customCategoryGroup = document.getElementById('customCategoryGroup');
const customCategoryInput = document.getElementById('customCategory');
const addCustomCategoryBtn = document.getElementById('addCustomCategoryBtn');
const transactionList = document.getElementById('transactionList');
const totalBalanceEl = document.getElementById('totalBalance');
const chartCanvas = document.getElementById('expenseChart');
const chartEmpty = document.getElementById('chartEmpty');
const sortBySelect = document.getElementById('sortBy');
const filterCategorySelect = document.getElementById('filterCategory');
const toggleSummaryBtn = document.getElementById('toggleSummary');
const monthlySummarySection = document.getElementById('monthlySummary');
const summaryContent = document.getElementById('summaryContent');

// Initialize application
function init() {
    loadFromLocalStorage();
    
    // Load dummy data if no transactions exist
    if (transactions.length === 0) {
        transactions = [...dummyTransactions];
        saveToLocalStorage();
    }
    
    setupEventListeners();
    updateUI();
}

// Setup event listeners
function setupEventListeners() {
    transactionForm.addEventListener('submit', handleAddTransaction);
    addCustomCategoryBtn.addEventListener('click', toggleCustomCategoryInput);
    sortBySelect.addEventListener('change', updateUI);
    filterCategorySelect.addEventListener('change', updateUI);
    toggleSummaryBtn.addEventListener('click', toggleMonthlySummary);
}

// Toggle custom category input
function toggleCustomCategoryInput() {
    const isVisible = customCategoryGroup.style.display === 'block';
    
    if (isVisible) {
        customCategoryGroup.style.display = 'none';
        addCustomCategoryBtn.textContent = '+ Tambah Kategori Custom';
        customCategoryInput.value = '';
    } else {
        customCategoryGroup.style.display = 'block';
        addCustomCategoryBtn.textContent = '- Batal';
        customCategoryInput.focus();
    }
}

// Handle adding new transaction
function handleAddTransaction(e) {
    e.preventDefault();
    
    const itemName = itemNameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    let category = categorySelect.value;
    
    // Validation
    if (!itemName || !amount || isNaN(amount)) {
        alert('Mohon isi semua field dengan benar!');
        return;
    }
    
    if (amount <= 0) {
        alert('Jumlah harus lebih dari 0!');
        return;
    }
    
    // Check for custom category
    if (customCategoryGroup.style.display === 'block') {
        const customCategory = customCategoryInput.value.trim();
        if (customCategory) {
            category = customCategory;
            
            // Add to custom categories if not already exists
            if (!customCategories.includes(category)) {
                customCategories.push(category);
                addCategoryToSelects(category);
                saveCategoriesToLocalStorage();
            }
        }
    }
    
    if (!category) {
        alert('Silakan pilih atau masukkan kategori!');
        return;
    }
    
    // Create transaction object
    const transaction = {
        id: Date.now(),
        itemName,
        amount,
        category,
        date: new Date().toISOString()
    };
    
    // Add to transactions array
    transactions.push(transaction);
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Reset form
    transactionForm.reset();
    customCategoryGroup.style.display = 'none';
    addCustomCategoryBtn.textContent = '+ Tambah Kategori Custom';
    
    // Update UI
    updateUI();
}

// Delete transaction
function deleteTransaction(id) {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveToLocalStorage();
        updateUI();
    }
}

// Calculate total balance
function calculateBalance() {
    return transactions.reduce((total, transaction) => total - transaction.amount, 0);
}

// Format number to Rupiah
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(number);
}

// Update total balance display
function updateBalance() {
    const balance = calculateBalance();
    totalBalanceEl.textContent = formatRupiah(Math.abs(balance));
    
    if (balance < 0) {
        totalBalanceEl.classList.add('negative');
    } else {
        totalBalanceEl.classList.remove('negative');
    }
}

// Get sorted and filtered transactions
function getSortedFilteredTransactions() {
    let filtered = [...transactions];
    
    // Apply category filter
    const filterCategory = filterCategorySelect.value;
    if (filterCategory !== 'all') {
        filtered = filtered.filter(t => t.category === filterCategory);
    }
    
    // Apply sorting
    const sortBy = sortBySelect.value;
    
    switch (sortBy) {
        case 'date':
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'amount-desc':
            filtered.sort((a, b) => b.amount - a.amount);
            break;
        case 'amount-asc':
            filtered.sort((a, b) => a.amount - b.amount);
            break;
        case 'category':
            filtered.sort((a, b) => a.category.localeCompare(b.category));
            break;
    }
    
    return filtered;
}

// Render transaction list
function renderTransactions() {
    const filtered = getSortedFilteredTransactions();
    
    if (filtered.length === 0) {
        transactionList.innerHTML = '<p class="empty-state">Tidak ada transaksi ditemukan.</p>';
        return;
    }
    
    transactionList.innerHTML = filtered.map(transaction => {
        const date = new Date(transaction.date);
        const formattedDate = date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        
        const categoryClass = ['Makanan', 'Transport', 'Hiburan'].includes(transaction.category) 
            ? transaction.category 
            : 'custom';
        
        return `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-name">${escapeHtml(transaction.itemName)}</div>
                    <div class="transaction-meta">
                        <span class="transaction-category ${categoryClass}">${escapeHtml(transaction.category)}</span>
                        <span class="transaction-date">${formattedDate}</span>
                    </div>
                </div>
                <div class="transaction-amount">${formatRupiah(transaction.amount)}</div>
                <button class="transaction-delete" onclick="deleteTransaction(${transaction.id})">Hapus</button>
            </div>
        `;
    }).join('');
}

// Calculate category totals for chart
function getCategoryData() {
    const categoryTotals = {};
    
    transactions.forEach(transaction => {
        if (categoryTotals[transaction.category]) {
            categoryTotals[transaction.category] += transaction.amount;
        } else {
            categoryTotals[transaction.category] = transaction.amount;
        }
    });
    
    return categoryTotals;
}

// Render chart
function renderChart() {
    if (transactions.length === 0) {
        chartEmpty.style.display = 'block';
        chartCanvas.style.display = 'none';
        if (expenseChart) {
            expenseChart.destroy();
            expenseChart = null;
        }
        return;
    }
    
    chartEmpty.style.display = 'none';
    chartCanvas.style.display = 'block';
    
    const categoryData = getCategoryData();
    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);
    
    // Define colors for categories
    const colorMap = {
        'Makanan': '#e74c3c',
        'Transport': '#3498db',
        'Hiburan': '#f39c12'
    };
    
    const backgroundColors = labels.map(label => {
        if (colorMap[label]) {
            return colorMap[label];
        }
        // Generate random color for custom categories
        return `hsl(${Math.random() * 360}, 70%, 60%)`;
    });
    
    if (expenseChart) {
        expenseChart.destroy();
    }
    
    expenseChart = new Chart(chartCanvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${formatRupiah(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Generate monthly summary
function generateMonthlySummary() {
    if (transactions.length === 0) {
        summaryContent.innerHTML = '<p class="empty-state">Tidak ada transaksi untuk dirangkum.</p>';
        return;
    }
    
    // Group transactions by month
    const monthlyData = {};
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                name: monthName,
                transactions: [],
                total: 0,
                categories: {}
            };
        }
        
        monthlyData[monthKey].transactions.push(transaction);
        monthlyData[monthKey].total += transaction.amount;
        
        if (monthlyData[monthKey].categories[transaction.category]) {
            monthlyData[monthKey].categories[transaction.category] += transaction.amount;
        } else {
            monthlyData[monthKey].categories[transaction.category] = transaction.amount;
        }
    });
    
    // Sort months (newest first)
    const sortedMonths = Object.keys(monthlyData).sort().reverse();
    
    // Generate HTML
    summaryContent.innerHTML = sortedMonths.map(monthKey => {
        const month = monthlyData[monthKey];
        const categoryStats = Object.entries(month.categories)
            .map(([category, amount]) => `
                <div class="summary-stat">
                    <div class="stat-label">${escapeHtml(category)}</div>
                    <div class="stat-value">${formatRupiah(amount)}</div>
                </div>
            `).join('');
        
        return `
            <div class="summary-month">
                <h3>${month.name}</h3>
                <div class="summary-stats">
                    <div class="summary-stat">
                        <div class="stat-label">Total Pengeluaran</div>
                        <div class="stat-value">${formatRupiah(month.total)}</div>
                    </div>
                    <div class="summary-stat">
                        <div class="stat-label">Jumlah Transaksi</div>
                        <div class="stat-value">${month.transactions.length}</div>
                    </div>
                    ${categoryStats}
                </div>
            </div>
        `;
    }).join('');
}

// Toggle monthly summary display
function toggleMonthlySummary() {
    const isVisible = monthlySummarySection.style.display === 'block';
    
    if (isVisible) {
        monthlySummarySection.style.display = 'none';
        toggleSummaryBtn.textContent = 'Tampilkan Ringkasan Bulanan';
    } else {
        generateMonthlySummary();
        monthlySummarySection.style.display = 'block';
        toggleSummaryBtn.textContent = 'Sembunyikan Ringkasan Bulanan';
    }
}

// Add category to select dropdowns
function addCategoryToSelects(category) {
    // Add to category select
    const option1 = document.createElement('option');
    option1.value = category;
    option1.textContent = category;
    categorySelect.appendChild(option1);
    
    // Add to filter select
    const option2 = document.createElement('option');
    option2.value = category;
    option2.textContent = category;
    filterCategorySelect.appendChild(option2);
}

// Load custom categories
function loadCustomCategories() {
    customCategories.forEach(category => {
        addCategoryToSelects(category);
    });
}

// Update entire UI
function updateUI() {
    updateBalance();
    renderTransactions();
    renderChart();
    
    // Update monthly summary if visible
    if (monthlySummarySection.style.display === 'block') {
        generateMonthlySummary();
    }
}

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// Save categories to localStorage
function saveCategoriesToLocalStorage() {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(customCategories));
}

// Load from localStorage
function loadFromLocalStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedCategories = localStorage.getItem(CATEGORIES_KEY);
    
    if (stored) {
        transactions = JSON.parse(stored);
    }
    
    if (storedCategories) {
        customCategories = JSON.parse(storedCategories);
        loadCustomCategories();
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Initialize the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
