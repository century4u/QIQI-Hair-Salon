import React, { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, Users, DollarSign, X, BarChart3 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isSameMonth, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

const MonthlyReport = ({ employees, transactions, isOpen, onClose }) => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  if (!isOpen) return null;

  // Lọc giao dịch theo tháng được chọn
  const selectedMonthStart = startOfMonth(parseISO(selectedMonth + '-01'));
  const selectedMonthEnd = endOfMonth(selectedMonthStart);

  const monthlyTransactions = transactions.filter(transaction => {
    const transactionDate = parseISO(transaction.date);
    return isSameMonth(transactionDate, selectedMonthStart);
  });

  // Tính toán doanh thu theo từng nhân viên trong tháng
  const employeeStats = employees.map(employee => {
    const employeeTransactions = monthlyTransactions.filter(t => 
      t.type === 'income' && parseInt(t.employeeId) === employee.id
    );
    
    const totalIncome = employeeTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalShare = totalIncome * employee.percentage / 100;
    const transactionCount = employeeTransactions.length;

    return {
      ...employee,
      totalIncome,
      totalShare,
      transactionCount,
      transactions: employeeTransactions
    };
  });

  // Tính tổng doanh thu tháng
  const totalMonthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalMonthlyExpense = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalMonthlyShare = employeeStats.reduce((sum, emp) => sum + emp.totalShare, 0);
  const netProfit = totalMonthlyIncome - totalMonthlyExpense;

  // Debug: Log để kiểm tra dữ liệu
  console.log('Debug Monthly Report:', {
    selectedMonth,
    monthlyTransactions: monthlyTransactions.length,
    totalMonthlyIncome,
    totalMonthlyExpense,
    employeeStats: employeeStats.map(emp => ({
      name: emp.name,
      totalIncome: emp.totalIncome,
      totalShare: emp.totalShare,
      transactionCount: emp.transactionCount
    }))
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            <BarChart3 size={24} style={{ marginRight: '10px' }} />
            Báo Cáo Doanh Thu {format(selectedMonthStart, "'Tháng' MM 'năm' yyyy", { locale: vi })}
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label>Chọn Tháng Báo Cáo</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', maxWidth: '300px' }}>
              <select
                value={selectedMonth.split('-')[1]}
                onChange={(e) => setSelectedMonth(`${selectedMonth.split('-')[0]}-${e.target.value.padStart(2, '0')}`)}
                className="form-control"
                style={{ flex: '1' }}
              >
                <option value="01">Tháng 1</option>
                <option value="02">Tháng 2</option>
                <option value="03">Tháng 3</option>
                <option value="04">Tháng 4</option>
                <option value="05">Tháng 5</option>
                <option value="06">Tháng 6</option>
                <option value="07">Tháng 7</option>
                <option value="08">Tháng 8</option>
                <option value="09">Tháng 9</option>
                <option value="10">Tháng 10</option>
                <option value="11">Tháng 11</option>
                <option value="12">Tháng 12</option>
              </select>
              <select
                value={selectedMonth.split('-')[0]}
                onChange={(e) => setSelectedMonth(`${e.target.value}-${selectedMonth.split('-')[1]}`)}
                className="form-control"
                style={{ flex: '1' }}
              >
                <option value="2020">Năm 2020</option>
                <option value="2021">Năm 2021</option>
                <option value="2022">Năm 2022</option>
                <option value="2023">Năm 2023</option>
                <option value="2024">Năm 2024</option>
                <option value="2025">Năm 2025</option>
                <option value="2026">Năm 2026</option>
                <option value="2027">Năm 2027</option>
                <option value="2028">Năm 2028</option>
                <option value="2029">Năm 2029</option>
                <option value="2030">Năm 2030</option>
              </select>
            </div>
            <small style={{ color: '#718096', fontSize: '12px', marginTop: '5px', display: 'block' }}>
              📅 Hiện tại: {format(selectedMonthStart, "'Tháng' MM 'năm' yyyy", { locale: vi })}
            </small>
            <div style={{ 
              background: '#f7fafc', 
              padding: '10px', 
              borderRadius: '6px', 
              marginTop: '10px',
              fontSize: '12px',
              color: '#4a5568'
            }}>
              <strong>🔍 Thông tin Debug:</strong><br/>
              - Giao dịch trong tháng: {monthlyTransactions.length}<br/>
              - Tổng thu nhập: {totalMonthlyIncome.toLocaleString('vi-VN')}₫<br/>
              - Tổng chi phí: {totalMonthlyExpense.toLocaleString('vi-VN')}₫<br/>
              - Nhân viên có doanh thu: {employeeStats.filter(emp => emp.totalIncome > 0).length}
            </div>
          </div>
        </div>

        {/* Thống kê tổng quan tháng */}
        <div className="stats-grid" style={{ marginBottom: '30px' }}>
          <div className="stat-card">
            <div className="stat-value positive">
              <DollarSign size={32} />
              {totalMonthlyIncome.toLocaleString('vi-VN')}₫
            </div>
            <div className="stat-label">Tổng Doanh Thu Tháng</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value negative">
              <TrendingDown size={32} />
              {totalMonthlyExpense.toLocaleString('vi-VN')}₫
            </div>
            <div className="stat-label">Tổng Chi Phí Tháng</div>
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
              {employeeStats.filter(emp => emp.totalIncome > 0).length}
            </div>
            <div className="stat-label">NV Có Doanh Thu</div>
          </div>
        </div>

        {/* Bảng chi tiết theo nhân viên */}
        <div className="card">
          <h3 style={{ marginBottom: '20px', color: '#4a5568' }}>
            📊 Chi Tiết Doanh Thu Theo Nhân Viên
          </h3>
          
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Nhân Viên</th>
                  <th>Chức Vụ</th>
                  <th>Phần Trăm</th>
                  <th>Số Giao Dịch</th>
                  <th>Tổng Doanh Thu</th>
                  <th>Phần Được Chia</th>
                  <th>Trung Bình/Giao Dịch</th>
                </tr>
              </thead>
              <tbody>
                {employeeStats
                  .sort((a, b) => b.totalIncome - a.totalIncome) // Sắp xếp theo doanh thu giảm dần
                  .map(employee => (
                    <tr key={employee.id}>
                      <td style={{ fontWeight: '600' }}>{employee.name}</td>
                      <td>{employee.position}</td>
                      <td>
                        <span className="percentage-display">
                          {employee.percentage}%
                        </span>
                      </td>
                      <td>
                        <span style={{ 
                          background: employee.transactionCount > 0 ? '#e6fffa' : '#f7fafc',
                          color: employee.transactionCount > 0 ? '#065f46' : '#718096',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {employee.transactionCount} giao dịch
                        </span>
                      </td>
                      <td className="amount-display amount-positive">
                        {employee.totalIncome.toLocaleString('vi-VN')}₫
                      </td>
                      <td className="amount-display amount-positive">
                        {employee.totalShare.toLocaleString('vi-VN')}₫
                      </td>
                      <td className="amount-display amount-positive">
                        {employee.transactionCount > 0 
                          ? (employee.totalIncome / employee.transactionCount).toLocaleString('vi-VN') + '₫'
                          : '0₫'
                        }
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Biểu đồ so sánh */}
        <div className="card">
          <h3 style={{ marginBottom: '20px', color: '#4a5568' }}>
            📈 Biểu Đồ So Sánh Doanh Thu
          </h3>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            {employeeStats
              .filter(emp => emp.totalIncome > 0)
              .sort((a, b) => b.totalIncome - a.totalIncome)
              .map(employee => {
                const percentage = totalMonthlyIncome > 0 
                  ? (employee.totalIncome / totalMonthlyIncome) * 100 
                  : 0;
                
                return (
                  <div key={employee.id} style={{ marginBottom: '15px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>
                        {employee.name}
                      </span>
                      <span style={{ fontSize: '14px', color: '#4a5568' }}>
                        {employee.totalIncome.toLocaleString('vi-VN')}₫ ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '20px',
                      background: '#e2e8f0',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, #667eea 0%, #764ba2 100%)`,
                        borderRadius: '10px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Tóm tắt cuối */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <h3 style={{ marginBottom: '15px' }}>
            💰 Tóm Tắt {format(selectedMonthStart, "'Tháng' MM 'năm' yyyy", { locale: vi })}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>TỔNG DOANH THU</div>
              <div style={{ fontSize: '20px', fontWeight: '700' }}>
                {totalMonthlyIncome.toLocaleString('vi-VN')}₫
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>TỔNG CHIA CHO NV</div>
              <div style={{ fontSize: '20px', fontWeight: '700' }}>
                {totalMonthlyShare.toLocaleString('vi-VN')}₫
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>LỢI NHUẬN RÒNG</div>
              <div style={{ fontSize: '20px', fontWeight: '700' }}>
                {netProfit.toLocaleString('vi-VN')}₫
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '25px' }}>
          <button className="btn btn-primary" onClick={onClose}>
            Đóng Báo Cáo
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
