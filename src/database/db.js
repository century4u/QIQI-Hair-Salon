// Database Manager cho Salon Thu Chi App
class DatabaseManager {
  constructor() {
    this.DB_VERSION = 1;
    this.DB_NAME = 'SalonThuChiDB';
    this.STORAGE_PREFIX = 'salon_db_';
  }

  // Khởi tạo database
  async init() {
    try {
      console.log('🗄️ Initializing database...');
      
      // Kiểm tra version database
      const currentVersion = localStorage.getItem(`${this.STORAGE_PREFIX}version`);
      if (!currentVersion || parseInt(currentVersion) < this.DB_VERSION) {
        await this.migrate();
      }

      // Khởi tạo tables nếu chưa có
      await this.initTables();
      
      console.log('✅ Database initialized successfully!');
      return true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      return false;
    }
  }

  // Migrate database
  async migrate() {
    console.log('🔄 Migrating database...');
    
    // Backup dữ liệu cũ nếu có
    await this.backupOldData();
    
    // Tạo database mới
    localStorage.setItem(`${this.STORAGE_PREFIX}version`, this.DB_VERSION.toString());
    
    console.log('✅ Database migration completed!');
  }

  // Backup dữ liệu cũ từ localStorage
  async backupOldData() {
    const oldTransactions = localStorage.getItem('salonTransactions');
    const oldEmployees = localStorage.getItem('salonEmployees');
    
    if (oldTransactions) {
      try {
        const transactions = JSON.parse(oldTransactions);
        if (Array.isArray(transactions)) {
          await this.saveTable('transactions', transactions);
          console.log('✅ Migrated transactions:', transactions.length);
        }
      } catch (error) {
        console.error('❌ Error migrating transactions:', error);
      }
    }
    
    if (oldEmployees) {
      try {
        const employees = JSON.parse(oldEmployees);
        if (Array.isArray(employees)) {
          await this.saveTable('employees', employees);
          console.log('✅ Migrated employees:', employees.length);
        }
      } catch (error) {
        console.error('❌ Error migrating employees:', error);
      }
    }
  }

  // Khởi tạo các bảng
  async initTables() {
    const tables = ['transactions', 'employees', 'users', 'settings'];
    
    for (const table of tables) {
      const existingData = this.getTable(table);
      if (!existingData) {
        this.saveTable(table, []);
        console.log(`✅ Initialized table: ${table}`);
      }
    }
  }

  // Lưu dữ liệu vào bảng
  saveTable(tableName, data) {
    try {
      const key = `${this.STORAGE_PREFIX}${tableName}`;
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`❌ Error saving table ${tableName}:`, error);
      return false;
    }
  }

  // Lấy dữ liệu từ bảng
  getTable(tableName) {
    try {
      const key = `${this.STORAGE_PREFIX}${tableName}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`❌ Error getting table ${tableName}:`, error);
      return null;
    }
  }

  // ===== TRANSACTIONS =====
  async getTransactions() {
    return this.getTable('transactions') || [];
  }

  async saveTransactions(transactions) {
    return this.saveTable('transactions', transactions);
  }

  async addTransaction(transaction) {
    const transactions = await this.getTransactions();
    const newTransaction = {
      ...transaction,
      id: transaction.id || Date.now(),
      createdAt: transaction.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    transactions.unshift(newTransaction);
    await this.saveTransactions(transactions);
    return newTransaction;
  }

  async updateTransaction(id, updates) {
    const transactions = await this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = {
        ...transactions[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await this.saveTransactions(transactions);
      return transactions[index];
    }
    return null;
  }

  async deleteTransaction(id) {
    const transactions = await this.getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    await this.saveTransactions(filtered);
    return true;
  }

  // ===== EMPLOYEES =====
  async getEmployees() {
    return this.getTable('employees') || [];
  }

  async saveEmployees(employees) {
    return this.saveTable('employees', employees);
  }

  async addEmployee(employee) {
    const employees = await this.getEmployees();
    const newEmployee = {
      ...employee,
      id: employee.id || Date.now(),
      createdAt: new Date().toISOString()
    };
    employees.push(newEmployee);
    await this.saveEmployees(employees);
    return newEmployee;
  }

  async updateEmployee(id, updates) {
    const employees = await this.getEmployees();
    const index = employees.findIndex(e => e.id === id);
    if (index !== -1) {
      employees[index] = {
        ...employees[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await this.saveEmployees(employees);
      return employees[index];
    }
    return null;
  }

  async deleteEmployee(id) {
    const employees = await this.getEmployees();
    const filtered = employees.filter(e => e.id !== id);
    await this.saveEmployees(filtered);
    return true;
  }

  // ===== USERS =====
  async getUsers() {
    return this.getTable('users') || [];
  }

  async saveUsers(users) {
    return this.saveTable('users', users);
  }

  // ===== SETTINGS =====
  async getSettings() {
    return this.getTable('settings') || {};
  }

  async saveSettings(settings) {
    return this.saveTable('settings', settings);
  }

  async updateSetting(key, value) {
    const settings = await this.getSettings();
    settings[key] = value;
    await this.saveSettings(settings);
    return true;
  }

  // ===== STATISTICS =====
  async getStatistics() {
    const transactions = await this.getTransactions();
    const employees = await this.getEmployees();
    
    const totalIncome = transactions
      .filter(t => t.type === 'income' && t.status === 'approved')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense' && t.status === 'approved')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const pendingCount = transactions.filter(t => t.status === 'pending').length;
    
    return {
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      pendingCount,
      totalTransactions: transactions.length,
      totalEmployees: employees.length
    };
  }

  // ===== BACKUP & RESTORE =====
  async exportData() {
    return {
      transactions: await this.getTransactions(),
      employees: await this.getEmployees(),
      users: await this.getUsers(),
      settings: await this.getSettings(),
      version: this.DB_VERSION,
      exportedAt: new Date().toISOString()
    };
  }

  async importData(data) {
    try {
      if (data.transactions) await this.saveTransactions(data.transactions);
      if (data.employees) await this.saveEmployees(data.employees);
      if (data.users) await this.saveUsers(data.users);
      if (data.settings) await this.saveSettings(data.settings);
      
      console.log('✅ Data imported successfully!');
      return true;
    } catch (error) {
      console.error('❌ Error importing data:', error);
      return false;
    }
  }

  // ===== UTILITIES =====
  async clearAllData() {
    const tables = ['transactions', 'employees', 'users', 'settings'];
    for (const table of tables) {
      localStorage.removeItem(`${this.STORAGE_PREFIX}${table}`);
    }
    localStorage.removeItem(`${this.STORAGE_PREFIX}version`);
    console.log('✅ All data cleared!');
  }

  async getDatabaseInfo() {
    const stats = await this.getStatistics();
    const version = localStorage.getItem(`${this.STORAGE_PREFIX}version`);
    
    return {
      version: version || 'Unknown',
      stats,
      tables: ['transactions', 'employees', 'users', 'settings'],
      storageUsed: this.getStorageSize()
    };
  }

  getStorageSize() {
    let totalSize = 0;
    for (let key in localStorage) {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        totalSize += localStorage[key].length;
      }
    }
    return totalSize;
  }
}

// Tạo instance duy nhất
const db = new DatabaseManager();

export default db;
