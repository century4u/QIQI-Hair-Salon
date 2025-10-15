import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, Users, DollarSign, Edit, Trash2, Calendar, BarChart3, LogOut, Check, X, Clock, AlertCircle, Database, User, Package, ShoppingCart } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, isSameMonth, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import MonthlyReport from './components/MonthlyReport';
import Login from './components/Login';
import DatabaseManager from './components/DatabaseManager';
import ProductManagement from './components/ProductManagement';
import SalesManagement from './components/SalesManagement';
import authService from './services/authService';
import db from './database/db';
import productService from './services/productService';
import salesService from './services/salesService';

// Dữ liệu mẫu nhân viên với login key
const initialEmployees = [
  { id: 1, name: 'Nguyễn Văn A', position: 'Thợ cắt tóc chính', percentage: 40, loginKey: 'NV001' },
  { id: 2, name: 'Trần Thị B', position: 'Thợ cắt tóc', percentage: 30, loginKey: 'NV002' },
  { id: 3, name: 'Lê Văn C', position: 'Thợ nhuộm', percentage: 20, loginKey: 'NV003' },
  { id: 4, name: 'Phạm Thị D', position: 'Thợ gội đầu', percentage: 10, loginKey: 'NV004' }
];

// Key chủ sở hữu
const OWNER_KEY = 'OWNER2024';

function App() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    description: '',
    employeeId: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });
  const [employeeFormData, setEmployeeFormData] = useState({
    name: '',
    position: '',
    percentage: '',
    loginKey: ''
  });
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [sessionWarning, setSessionWarning] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);

  // Khởi tạo database và load dữ liệu
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🔄 Initializing app...');
        
        // Khởi tạo database
        const dbSuccess = await db.init();
        if (!dbSuccess) {
          console.error('❌ Database initialization failed');
          return;
        }
        setDbInitialized(true);
        
        // Load dữ liệu từ database
        const [transactions, employees] = await Promise.all([
          db.getTransactions(),
          db.getEmployees()
        ]);
        
        // Load sản phẩm từ productService
        const productsData = productService.getProducts();
        if (productsData.length === 0) {
          // Tạo dữ liệu mẫu nếu chưa có
          productService.createSampleData();
          setProducts(productService.getProducts());
        } else {
          setProducts(productsData);
        }
        
        // Load dữ liệu bán hàng từ salesService
        const salesData = salesService.getSales();
        if (salesData.length === 0) {
          // Tạo dữ liệu mẫu nếu chưa có
          salesService.createSampleData();
          setSales(salesService.getSales());
        } else {
          setSales(salesData);
        }
        
        // Nếu chưa có employees, tạo dữ liệu mặc định
        if (!employees || employees.length === 0) {
          await db.saveEmployees(initialEmployees);
          setEmployees(initialEmployees);
        } else {
          setEmployees(employees);
        }
        
        setTransactions(transactions || []);
        
        // Load current user session
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setCurrentUser(currentUser);
          setShowLogin(false);
          console.log('✅ Loaded current user from session:', currentUser.name);
          authService.extendSession();
        } else {
          console.log('ℹ️ No valid session found, showing login');
          setShowLogin(true);
        }
        
        console.log('🎉 App initialized successfully!');
      } catch (error) {
        console.error('❌ Error initializing app:', error);
        setTransactions([]);
        setEmployees(initialEmployees);
        setShowLogin(true);
      }
    };

    initializeApp();
  }, []);

  // Save dữ liệu vào database
  useEffect(() => {
    const saveTransactions = async () => {
      if (dbInitialized && transactions !== null) {
        try {
          await db.saveTransactions(transactions);
          console.log('💾 Saved transactions to database:', transactions.length);
        } catch (error) {
          console.error('❌ Error saving transactions:', error);
        }
      }
    };

    saveTransactions();
  }, [transactions, dbInitialized]);

  useEffect(() => {
    const saveEmployees = async () => {
      if (dbInitialized && employees !== null && employees.length > 0) {
        try {
          await db.saveEmployees(employees);
          console.log('💾 Saved employees to database:', employees.length);
        } catch (error) {
          console.error('❌ Error saving employees:', error);
        }
      }
    };

    saveEmployees();
  }, [employees, dbInitialized]);

  // Save products
  useEffect(() => {
    if (products.length >= 0) {
      productService.saveProducts(products);
    }
  }, [products]);

  // Save sales
  useEffect(() => {
    if (sales.length >= 0) {
      salesService.saveSales(sales);
    }
  }, [sales]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description || !formData.employeeId) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Kiểm tra số tiền hợp lệ
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Số tiền phải lớn hơn 0!');
      return;
    }

    const transaction = {
      id: editingTransaction ? editingTransaction.id : Date.now(),
      ...formData,
      amount: amount,
      date: formData.date,
      employeeId: parseInt(formData.employeeId),
      employee: employees.find(emp => emp.id === parseInt(formData.employeeId)),
      status: isOwner() ? 'approved' : 'pending', // Admin tự động duyệt, nhân viên cần duyệt
      createdAt: new Date().toISOString(),
      approvedBy: isOwner() ? currentUser.name : null,
      approvedAt: isOwner() ? new Date().toISOString() : null
    };

    if (editingTransaction) {
      setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? transaction : t));
    } else {
      setTransactions(prev => [transaction, ...prev]);
    }

    setShowModal(false);
    setEditingTransaction(null);
    setFormData({
      type: 'income',
      amount: '',
      description: '',
      employeeId: currentUser?.id?.toString() || '',
      date: format(new Date(), 'yyyy-MM-dd')
    });

    // Thông báo cho nhân viên
    if (!isOwner()) {
      alert('✅ Giao dịch đã được gửi chờ duyệt từ admin!');
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      employeeId: transaction.employeeId.toString(),
      date: transaction.date
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleEmployeeInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmployeeSubmit = (e) => {
    e.preventDefault();
    
    if (!employeeFormData.name || !employeeFormData.position || !employeeFormData.percentage || !employeeFormData.loginKey) {
      alert('Vui lòng điền đầy đủ thông tin nhân viên!');
      return;
    }

    const percentage = parseFloat(employeeFormData.percentage);
    if (percentage < 0 || percentage > 100) {
      alert('Phần trăm phải từ 0% đến 100%!');
      return;
    }

    // Kiểm tra key trùng lặp
    const existingEmployee = employees.find(emp => 
      emp.loginKey === employeeFormData.loginKey && emp.id !== (editingEmployee?.id)
    );
    if (existingEmployee) {
      alert('Mã key đã tồn tại! Vui lòng chọn mã key khác.');
      return;
    }

    const employee = {
      id: editingEmployee ? editingEmployee.id : Date.now(),
      name: employeeFormData.name,
      position: employeeFormData.position,
      percentage: percentage,
      loginKey: employeeFormData.loginKey
    };

    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? employee : emp));
    } else {
      setEmployees(prev => [...prev, employee]);
    }

    setShowEmployeeModal(false);
    setEditingEmployee(null);
    setEmployeeFormData({
      name: '',
      position: '',
      percentage: ''
    });
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setEmployeeFormData({
      name: employee.name,
      position: employee.position,
      percentage: employee.percentage.toString(),
      loginKey: employee.loginKey || ''
    });
    setShowEmployeeModal(true);
  };

  const handleDeleteEmployee = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này? Tất cả giao dịch liên quan sẽ bị ảnh hưởng.')) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      setTransactions(prev => prev.filter(t => t.employeeId !== id));
    }
  };

  const closeEmployeeModal = () => {
    setShowEmployeeModal(false);
    setEditingEmployee(null);
    setEmployeeFormData({
      name: '',
      position: '',
      percentage: '',
      loginKey: ''
    });
  };

  // Xử lý đăng nhập
  const handleLogin = (user) => {
    setCurrentUser(user);
    setShowLogin(false);
    
    // Lưu session bằng AuthService
    authService.saveUserSession(user);
    
    // Tự động set employeeId cho form nếu là nhân viên
    if (user.id && user.id !== 'owner') {
      setFormData(prev => ({
        ...prev,
        employeeId: user.id.toString()
      }));
    }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    setCurrentUser(null);
    setShowLogin(true);
    
    // Xóa session bằng AuthService
    authService.clearSession();
  };

  // Kiểm tra quyền chủ sở hữu
  const isOwner = () => {
    return currentUser && currentUser.loginKey === OWNER_KEY;
  };

  // Kiểm tra quyền chỉnh sửa nhân viên
  const canManageEmployees = () => {
    return isOwner();
  };

  // Kiểm tra quyền xem báo cáo
  const canViewReports = () => {
    return isOwner();
  };

  // Lọc giao dịch theo quyền
  const getFilteredTransactions = () => {
    if (isOwner()) {
      return transactions; // Chủ sở hữu xem tất cả
    } else if (currentUser) {
      return transactions.filter(t => t.employeeId === currentUser.id); // Nhân viên chỉ xem của mình
    }
    return [];
  };

  // Duyệt giao dịch
  const handleApproveTransaction = (transactionId) => {
    setTransactions(prev => prev.map(t => 
      t.id === transactionId 
        ? { 
            ...t, 
            status: 'approved',
            approvedBy: currentUser.name,
            approvedAt: new Date().toISOString()
          }
        : t
    ));
  };

  // Từ chối giao dịch
  const handleRejectTransaction = (transactionId) => {
    setTransactions(prev => prev.map(t => 
      t.id === transactionId 
        ? { 
            ...t, 
            status: 'rejected',
            approvedBy: currentUser.name,
            approvedAt: new Date().toISOString()
          }
        : t
    ));
  };

  // Xóa giao dịch (chỉ admin)
  const handleDeleteTransaction = (transactionId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
    }
  };

  // Đếm giao dịch chờ duyệt
  const getPendingCount = () => {
    return transactions.filter(t => t.status === 'pending').length;
  };

  // Debug function để kiểm tra localStorage
  const debugLocalStorage = () => {
    console.log('🔍 Debug localStorage:');
    console.log('salonTransactions:', localStorage.getItem('salonTransactions'));
    console.log('salonEmployees:', localStorage.getItem('salonEmployees'));
    console.log('salonCurrentUser:', localStorage.getItem('salonCurrentUser'));
    console.log('Current state - transactions:', transactions.length);
    console.log('Current state - employees:', employees.length);
    console.log('Current state - currentUser:', currentUser);
  };

  // Expose debug function to window for testing
  useEffect(() => {
    window.debugSalonApp = debugLocalStorage;
  }, [transactions, employees, currentUser]);

  // Kiểm tra session timeout
  useEffect(() => {
    if (currentUser) {
      const checkSession = () => {
        const timeLeft = authService.getSessionTimeLeft();
        
        // Cảnh báo khi còn 10 phút
        if (timeLeft <= 10 && timeLeft > 0) {
          setSessionWarning(true);
        }
        
        // Tự động đăng xuất khi hết hạn
        if (timeLeft <= 0) {
          alert('⏰ Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại.');
          handleLogout();
        }
      };

      // Kiểm tra mỗi phút
      const interval = setInterval(checkSession, 60000);
      checkSession(); // Kiểm tra ngay lập tức

      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const closeModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
    setFormData({
      type: 'income',
      amount: '',
      description: '',
      employeeId: '',
      date: format(new Date(), 'yyyy-MM-dd')
    });
  };

  // Tính toán thống kê theo quyền người dùng
  const filteredTransactions = getFilteredTransactions();
  
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  // Tính phần trăm cho từng nhân viên
  const calculateEmployeeShare = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return 0;
    
    const employeeIncome = transactions
      .filter(t => t.type === 'income' && t.employeeId === employeeId)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return (employeeIncome * employee.percentage / 100).toLocaleString('vi-VN');
  };

  const getEmployeeTotalIncome = (employeeId) => {
    return transactions
      .filter(t => t.type === 'income' && t.employeeId === employeeId)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Hiển thị màn hình đăng nhập nếu chưa đăng nhập
  if (showLogin) {
    return <Login onLogin={handleLogin} employees={employees} />;
  }

  return (
    <div className="container">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ flex: '1', minWidth: '250px' }}>
            <h1> Quản Lý Thu Chi Salon Tóc</h1>
            <p>Hệ thống quản lý tài chính chuyên nghiệp cho cửa hàng tóc</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {sessionWarning && (
              <div style={{
                background: '#fbbf24',
                color: '#92400e',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexWrap: 'wrap'
              }}>
                <Clock size={14} />
                <span>Phiên sắp hết hạn ({authService.getSessionTimeLeft()} phút)</span>
                <button 
                  onClick={() => {
                    authService.extendSession();
                    setSessionWarning(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#92400e',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textDecoration: 'underline'
                  }}
                >
                  Gia hạn
                </button>
              </div>
            )}
            <div style={{ textAlign: 'right', minWidth: '120px' }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#4a5568' }}>
                {isOwner() ? ' Chủ Sở Hữu' : currentUser?.name}
              </div>
              <div style={{ fontSize: '12px', color: '#718096' }}>
                {currentUser?.position || 'Quản lý toàn bộ'}
              </div>
            </div>
            <button 
              className="btn btn-danger"
              onClick={handleLogout}
              style={{ padding: '8px 12px' }}
            >
              <LogOut size={16} />
            </button>
            
            {/* Debug button - tạm thời */}
            <button 
              className="btn"
              onClick={debugLocalStorage}
              style={{ 
                padding: '8px 12px',
                background: '#e2e8f0',
                color: '#4a5568',
                border: '1px solid #cbd5e0'
              }}
              title="Debug localStorage"
            >
              🔍
            </button>
          </div>
        </div>
      </div>

      {/* Thống kê tổng quan */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value positive">
            <DollarSign size={32} />
            {totalIncome.toLocaleString('vi-VN')}₫
          </div>
          <div className="stat-label">Tổng Thu Nhập</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value negative">
            <TrendingDown size={32} />
            {totalExpense.toLocaleString('vi-VN')}₫
          </div>
          <div className="stat-label">Tổng Chi Phí</div>
        </div>
        
        <div className="stat-card">
          <div className={`stat-value ${netProfit >= 0 ? 'positive' : 'negative'}`}>
            <TrendingUp size={32} />
            {netProfit.toLocaleString('vi-VN')}₫
          </div>
          <div className="stat-label">Lợi Nhuận Ròng</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">
            <Users size={32} />
            {employees.length}
          </div>
          <div className="stat-label">Nhân Viên</div>
        </div>
      </div>

      {/* Danh sách nhân viên và phần trăm - chỉ hiển thị cho chủ sở hữu */}
      {canManageEmployees() && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#4a5568' }}>📊 Phân Bổ Thu Nhập Theo Nhân Viên</h2>
            <button 
              className="btn btn-success"
              onClick={() => setShowEmployeeModal(true)}
            >
              <Plus size={20} />
              Thêm Nhân Viên
            </button>
          </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Tên Nhân Viên</th>
                <th>Chức Vụ</th>
                <th>Phần Trăm (%)</th>
                <th>Tổng Thu Nhập</th>
                <th>Phần Được Chia</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(employee => {
                const totalIncome = getEmployeeTotalIncome(employee.id);
                const share = totalIncome * employee.percentage / 100;
                
                return (
                  <tr key={employee.id}>
                    <td style={{ fontWeight: '600' }}>{employee.name}</td>
                    <td>{employee.position}</td>
                    <td>
                      <span className="percentage-display">
                        {employee.percentage}%
                      </span>
                    </td>
                    <td className="amount-display amount-positive">
                      {totalIncome.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="amount-display amount-positive">
                      {share.toLocaleString('vi-VN')}₫
                    </td>
                    <td>
                      <button 
                        className="btn btn-warning"
                        style={{ marginRight: '8px', padding: '6px 12px' }}
                        onClick={() => handleEditEmployee(employee)}
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        className="btn btn-danger"
                        style={{ padding: '6px 12px' }}
                        onClick={() => handleDeleteEmployee(employee.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {/* Nút thêm giao dịch và báo cáo */}
      <div className="card">
        <div className="btn-group" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={20} />
            Thêm Giao Dịch Mới
          </button>
          
          {canViewReports() && (
            <button 
              className="btn btn-success"
              onClick={() => setShowMonthlyReport(true)}
            >
              <BarChart3 size={20} />
              Báo Cáo Theo Tháng
            </button>
          )}
          
          {isOwner() && getPendingCount() > 0 && (
            <button 
              className="btn btn-warning"
              onClick={() => setShowPendingModal(true)}
              style={{ position: 'relative' }}
            >
              <Clock size={20} />
              Duyệt Giao Dịch
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#e53e3e',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {getPendingCount()}
              </span>
            </button>
          )}
          
          {isOwner() && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowDatabaseModal(true)}
            >
              <Database size={20} />
              Quản Lý DB
            </button>
          )}
          
          {isOwner() && (
            <button 
              className="btn btn-success"
              onClick={() => setShowProductModal(true)}
            >
              <Package size={20} />
              Quản Lý Sản Phẩm
            </button>
          )}
          
          {isOwner() && (
            <button 
              className="btn btn-warning"
              onClick={() => setShowSalesModal(true)}
            >
              <ShoppingCart size={20} />
              Bán Hàng & Doanh Thu
            </button>
          )}
        </div>
      </div>

      {/* Bảng giao dịch */}
      <div className="card">
        <h2 style={{ marginBottom: '20px', color: '#4a5568' }}>📋 Lịch Sử Giao Dịch</h2>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Loại</th>
                <th>Mô Tả</th>
                <th>Nhân Viên</th>
                <th>Số Tiền</th>
                <th>Phần Chia</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                    Chưa có giao dịch nào. Hãy thêm giao dịch đầu tiên!
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(transaction => {
                  const share = transaction.type === 'income' 
                    ? transaction.amount * transaction.employee.percentage / 100 
                    : 0;
                  
                  return (
                    <tr key={transaction.id}>
                      <td>{format(new Date(transaction.date), "'Ngày' dd 'tháng' MM 'năm' yyyy", { locale: vi })}</td>
                      <td>
                        <span className={`percentage-display ${transaction.type === 'income' ? 'btn-success' : 'btn-danger'}`}>
                          {transaction.type === 'income' ? '📈 Thu' : '📉 Chi'}
                        </span>
                      </td>
                      <td>{transaction.description}</td>
                      <td>{transaction.employee.name}</td>
                      <td className={`amount-display ${transaction.type === 'income' ? 'amount-positive' : 'amount-negative'}`}>
                        {transaction.amount.toLocaleString('vi-VN')}₫
                      </td>
                      <td className="amount-display amount-positive">
                        {transaction.type === 'income' ? `${share.toLocaleString('vi-VN')}₫` : '-'}
                      </td>
                      <td>
                        {transaction.status === 'pending' && (
                          <span style={{
                            background: '#fbbf24',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            width: 'fit-content'
                          }}>
                            <Clock size={12} />
                            Chờ duyệt
                          </span>
                        )}
                        {transaction.status === 'approved' && (
                          <span style={{
                            background: '#10b981',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            width: 'fit-content'
                          }}>
                            <Check size={12} />
                            Đã duyệt
                          </span>
                        )}
                        {transaction.status === 'rejected' && (
                          <span style={{
                            background: '#ef4444',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            width: 'fit-content'
                          }}>
                            <X size={12} />
                            Đã từ chối
                          </span>
                        )}
                      </td>
                      <td>
                        {transaction.status === 'pending' && isOwner() ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button 
                              className="btn btn-success"
                              style={{ padding: '6px 12px' }}
                              onClick={() => handleApproveTransaction(transaction.id)}
                            >
                              <Check size={14} />
                            </button>
                            <button 
                              className="btn btn-danger"
                              style={{ padding: '6px 12px' }}
                              onClick={() => handleRejectTransaction(transaction.id)}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button 
                              className="btn btn-warning"
                              style={{ padding: '6px 12px' }}
                              onClick={() => handleEdit(transaction)}
                            >
                              <Edit size={14} />
                            </button>
                            {(isOwner() || transaction.status === 'pending') && (
                              <button 
                                className="btn btn-danger"
                                style={{ padding: '6px 12px' }}
                                onClick={() => handleDeleteTransaction(transaction.id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal thêm/sửa giao dịch */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingTransaction ? '✏️ Sửa Giao Dịch' : '➕ Thêm Giao Dịch Mới'}
              </h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Loại Giao Dịch</label>
                  <select 
                    name="type" 
                    value={formData.type} 
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="income">📈 Thu Nhập</option>
                    <option value="expense">📉 Chi Phí</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Số Tiền (₫)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Nhập số tiền..."
                    min="0"
                    step="0.01"
                    required
                  />
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[100000, 200000, 300000, 500000, 1000000].map(amount => (
                      <button
                        key={amount}
                        type="button"
                        className="btn"
                        style={{ 
                          padding: '4px 8px', 
                          fontSize: '11px',
                          background: '#e2e8f0',
                          border: '1px solid #cbd5e0',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        onClick={() => setFormData(prev => ({ ...prev, amount: amount.toString() }))}
                      >
                        {amount.toLocaleString('vi-VN')}₫
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label>Mô Tả</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Mô tả giao dịch..."
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Nhân Viên</label>
                  {isOwner() ? (
                    <select 
                      name="employeeId" 
                      value={formData.employeeId} 
                      onChange={handleInputChange}
                      className="form-control"
                    >
                      <option value="">Chọn nhân viên...</option>
                      {employees.map(employee => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name} ({employee.percentage}%)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{
                      padding: '12px',
                      background: '#f7fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      color: '#4a5568',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <User size={16} />
                      <span>{currentUser?.name} - {currentUser?.position}</span>
                      <span style={{
                        marginLeft: 'auto',
                        fontSize: '12px',
                        background: '#e2e8f0',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        color: '#718096'
                      }}>
                        Tự động
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Ngày</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '25px' }}>
                <button type="button" className="btn btn-danger" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-success">
                  {editingTransaction ? 'Cập Nhật' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal thêm/sửa nhân viên */}
      {showEmployeeModal && (
        <div className="modal-overlay" onClick={closeEmployeeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingEmployee ? '✏️ Sửa Nhân Viên' : '➕ Thêm Nhân Viên Mới'}
              </h2>
              <button className="close-btn" onClick={closeEmployeeModal}>×</button>
            </div>
            
            <form onSubmit={handleEmployeeSubmit}>
              <div className="form-group">
                <label>Tên Nhân Viên</label>
                <input
                  type="text"
                  name="name"
                  value={employeeFormData.name}
                  onChange={handleEmployeeInputChange}
                  className="form-control"
                  placeholder="Nhập tên nhân viên..."
                />
              </div>
              
              <div className="form-group">
                <label>Chức Vụ</label>
                <input
                  type="text"
                  name="position"
                  value={employeeFormData.position}
                  onChange={handleEmployeeInputChange}
                  className="form-control"
                  placeholder="Nhập chức vụ..."
                />
              </div>
              
              <div className="form-group">
                <label>Phần Trăm Chia (%)</label>
                <input
                  type="number"
                  name="percentage"
                  value={employeeFormData.percentage}
                  onChange={handleEmployeeInputChange}
                  className="form-control"
                  placeholder="Nhập phần trăm (0-100)..."
                  min="0"
                  max="100"
                  step="0.1"
                />
                <small style={{ color: '#718096', fontSize: '12px' }}>
                  💡 Ví dụ: 25.5 cho 25.5%
                </small>
              </div>
              
              <div className="form-group">
                <label>Mã Key Đăng Nhập</label>
                <input
                  type="text"
                  name="loginKey"
                  value={employeeFormData.loginKey}
                  onChange={handleEmployeeInputChange}
                  className="form-control"
                  placeholder="Nhập mã key (ví dụ: NV005)..."
                  style={{ fontFamily: 'monospace' }}
                />
                <small style={{ color: '#718096', fontSize: '12px' }}>
                  💡 Mã key để nhân viên đăng nhập vào hệ thống
                </small>
              </div>
              
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '25px' }}>
                <button type="button" className="btn btn-danger" onClick={closeEmployeeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-success">
                  {editingEmployee ? 'Cập Nhật' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Component báo cáo theo tháng */}
      <MonthlyReport 
        employees={employees}
        transactions={transactions}
        isOpen={showMonthlyReport}
        onClose={() => setShowMonthlyReport(false)}
      />

      {/* Database Manager */}
      <DatabaseManager 
        isOpen={showDatabaseModal}
        onClose={() => setShowDatabaseModal(false)}
        employees={employees}
        transactions={transactions}
      />

      {/* Product Management */}
      <ProductManagement 
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        products={products}
        onProductsChange={setProducts}
      />

      {/* Sales Management */}
      <SalesManagement 
        isOpen={showSalesModal}
        onClose={() => setShowSalesModal(false)}
        products={products}
        onProductsChange={setProducts}
        sales={sales}
        onSalesChange={setSales}
      />

      {/* Modal duyệt giao dịch cho admin */}
      {showPendingModal && (
        <div className="modal-overlay" onClick={() => setShowPendingModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '80vh' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                <AlertCircle size={24} style={{ marginRight: '10px' }} />
                Duyệt Giao Dịch Chờ Xử Lý ({getPendingCount()})
              </h2>
              <button className="close-btn" onClick={() => setShowPendingModal(false)}>×</button>
            </div>
            
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {transactions.filter(t => t.status === 'pending').length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                  <Check size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
                  <p>Không có giao dịch nào chờ duyệt!</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Ngày</th>
                        <th>Nhân Viên</th>
                        <th>Loại</th>
                        <th>Mô Tả</th>
                        <th>Số Tiền</th>
                        <th>Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions
                        .filter(t => t.status === 'pending')
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .map(transaction => (
                          <tr key={transaction.id}>
                            <td>{format(new Date(transaction.date), "'Ngày' dd 'tháng' MM 'năm' yyyy", { locale: vi })}</td>
                            <td style={{ fontWeight: '600' }}>{transaction.employee.name}</td>
                            <td>
                              <span className={`percentage-display ${transaction.type === 'income' ? 'btn-success' : 'btn-danger'}`}>
                                {transaction.type === 'income' ? '📈 Thu' : '📉 Chi'}
                              </span>
                            </td>
                            <td>{transaction.description}</td>
                            <td className={`amount-display ${transaction.type === 'income' ? 'amount-positive' : 'amount-negative'}`}>
                              {transaction.amount.toLocaleString('vi-VN')}₫
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  className="btn btn-success"
                                  style={{ padding: '8px 12px' }}
                                  onClick={() => {
                                    handleApproveTransaction(transaction.id);
                                    alert('✅ Đã duyệt giao dịch!');
                                  }}
                                >
                                  <Check size={16} />
                                  Duyệt
                                </button>
                                <button 
                                  className="btn btn-danger"
                                  style={{ padding: '8px 12px' }}
                                  onClick={() => {
                                    if (window.confirm('Bạn có chắc chắn muốn từ chối giao dịch này?')) {
                                      handleRejectTransaction(transaction.id);
                                      alert('❌ Đã từ chối giao dịch!');
                                    }
                                  }}
                                >
                                  <X size={16} />
                                  Từ Chối
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '25px' }}>
              <button className="btn btn-primary" onClick={() => setShowPendingModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
