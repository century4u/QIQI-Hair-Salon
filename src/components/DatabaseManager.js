import React, { useState, useEffect } from 'react';
import { Database, Download, Upload, Trash2, Info, RefreshCw, FileSpreadsheet } from 'lucide-react';
import db from '../database/db';
import ExcelExportService from '../services/excelExport';

const DatabaseManager = ({ isOpen, onClose, employees, transactions }) => {
  const [dbInfo, setDbInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDatabaseInfo();
    }
  }, [isOpen]);

  const loadDatabaseInfo = async () => {
    setLoading(true);
    try {
      const info = await db.getDatabaseInfo();
      setDbInfo(info);
    } catch (error) {
      console.error('Error loading database info:', error);
    }
    setLoading(false);
  };

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3000);
  };

  const handleExportExcel = async () => {
    setLoading(true);
    try {
      const result = await ExcelExportService.exportEmployeeRevenue(employees, transactions);
      if (result.success) {
        showMessage(`✅ Đã xuất báo cáo Excel: ${result.fileName}`, 'success');
      } else {
        showMessage(`❌ Lỗi xuất Excel: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Excel export error:', error);
      showMessage('❌ Lỗi khi xuất file Excel!', 'error');
    }
    setLoading(false);
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const data = await db.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `salon-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showMessage('✅ Dữ liệu đã được xuất thành công!', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showMessage('❌ Lỗi khi xuất dữ liệu!', 'error');
    }
    setLoading(false);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      setLoading(true);
      try {
        const data = JSON.parse(e.target.result);
        const success = await db.importData(data);
        if (success) {
          showMessage('✅ Dữ liệu đã được nhập thành công!', 'success');
          loadDatabaseInfo();
        } else {
          showMessage('❌ Lỗi khi nhập dữ liệu!', 'error');
        }
      } catch (error) {
        console.error('Import error:', error);
        showMessage('❌ File không hợp lệ!', 'error');
      }
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (window.confirm('⚠️ Bạn có chắc chắn muốn XÓA TẤT CẢ dữ liệu? Hành động này không thể hoàn tác!')) {
      if (window.confirm('⚠️ Xác nhận lần cuối: XÓA TẤT CẢ dữ liệu?')) {
        setLoading(true);
        db.clearAllData().then(() => {
          showMessage('✅ Đã xóa tất cả dữ liệu!', 'success');
          loadDatabaseInfo();
          setLoading(false);
        });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            <Database size={24} style={{ marginRight: '10px' }} />
            Quản Lý Database
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {message && (
          <div style={{
            padding: '10px 15px',
            borderRadius: '6px',
            marginBottom: '20px',
            background: message.type === 'success' ? '#d1fae5' : message.type === 'error' ? '#fee2e2' : '#dbeafe',
            color: message.type === 'success' ? '#065f46' : message.type === 'error' ? '#dc2626' : '#1e40af',
            border: `1px solid ${message.type === 'success' ? '#a7f3d0' : message.type === 'error' ? '#fecaca' : '#bfdbfe'}`
          }}>
            {message.text}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <RefreshCw size={24} className="animate-spin" />
            <p>Đang xử lý...</p>
          </div>
        )}

        {dbInfo && !loading && (
          <div>
            {/* Database Info */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '15px', color: '#4a5568' }}>
                <Info size={20} style={{ marginRight: '8px' }} />
                Thông Tin Database
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>VERSION</div>
                  <div style={{ fontWeight: '600', color: '#4a5568' }}>{dbInfo.version}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>GIAO DỊCH</div>
                  <div style={{ fontWeight: '600', color: '#4a5568' }}>{dbInfo.stats.totalTransactions}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>NHÂN VIÊN</div>
                  <div style={{ fontWeight: '600', color: '#4a5568' }}>{dbInfo.stats.totalEmployees}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>CHỜ DUYỆT</div>
                  <div style={{ fontWeight: '600', color: '#4a5568' }}>{dbInfo.stats.pendingCount}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>DUNG LƯỢNG</div>
                  <div style={{ fontWeight: '600', color: '#4a5568' }}>
                    {(dbInfo.storageUsed / 1024).toFixed(2)} KB
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '15px', color: '#4a5568' }}>
                📊 Thống Kê Tài Chính
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>TỔNG THU</div>
                  <div style={{ fontWeight: '600', color: '#10b981' }}>
                    {dbInfo.stats.totalIncome.toLocaleString('vi-VN')}₫
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>TỔNG CHI</div>
                  <div style={{ fontWeight: '600', color: '#ef4444' }}>
                    {dbInfo.stats.totalExpense.toLocaleString('vi-VN')}₫
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>LỢI NHUẬN</div>
                  <div style={{ fontWeight: '600', color: dbInfo.stats.netProfit >= 0 ? '#10b981' : '#ef4444' }}>
                    {dbInfo.stats.netProfit.toLocaleString('vi-VN')}₫
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card">
              <h3 style={{ marginBottom: '15px', color: '#4a5568' }}>
                🛠️ Thao Tác
              </h3>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-success"
                  onClick={handleExportExcel}
                  disabled={loading}
                  style={{ background: '#10b981', borderColor: '#10b981' }}
                >
                  <FileSpreadsheet size={16} />
                  Xuất Excel Doanh Thu
                </button>
                
                <button 
                  className="btn btn-primary"
                  onClick={handleExport}
                  disabled={loading}
                >
                  <Download size={16} />
                  Backup JSON
                </button>
                
                <label className="btn btn-info" style={{ cursor: 'pointer' }}>
                  <Upload size={16} />
                  Restore JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    style={{ display: 'none' }}
                    disabled={loading}
                  />
                </label>
                
                <button 
                  className="btn btn-warning"
                  onClick={loadDatabaseInfo}
                  disabled={loading}
                >
                  <RefreshCw size={16} />
                  Làm Mới
                </button>
                
                <button 
                  className="btn btn-danger"
                  onClick={handleClearAll}
                  disabled={loading}
                >
                  <Trash2 size={16} />
                  Xóa Tất Cả
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '25px' }}>
          <button className="btn btn-primary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatabaseManager;
