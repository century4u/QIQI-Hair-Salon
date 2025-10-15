import React, { useState } from 'react';
import { User, Key, Eye, EyeOff } from 'lucide-react';

const Login = ({ onLogin, employees }) => {
  const OWNER_KEY = 'OWNER2024';
  const [showPassword, setShowPassword] = useState(false);
  const [loginKey, setLoginKey] = useState('');
  const [error, setError] = useState('');
  const [matchedEmployee, setMatchedEmployee] = useState(null);

  // Xử lý thay đổi key để hiển thị tên nhân viên
  const handleKeyChange = (e) => {
    const value = e.target.value;
    setLoginKey(value);
    setError('');
    
    // Kiểm tra key admin
    if (value.trim() === OWNER_KEY) {
      setMatchedEmployee({ 
        id: 'owner',
        name: 'Chủ Sở Hữu', 
        position: 'Quản lý toàn bộ',
        percentage: 0,
        loginKey: OWNER_KEY 
      });
      return;
    }
    
    // Tìm nhân viên theo key
    const employee = employees.find(emp => emp.loginKey === value.trim());
    setMatchedEmployee(employee || null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!loginKey.trim()) {
      setError('Vui lòng nhập mã key!');
      return;
    }

    // Kiểm tra key admin trước
    if (loginKey.trim() === OWNER_KEY) {
      onLogin({ 
        id: 'owner',
        name: 'Chủ Sở Hữu', 
        position: 'Quản lý toàn bộ',
        percentage: 0,
        loginKey: OWNER_KEY 
      });
      return;
    }

    // Tìm nhân viên theo key
    const employee = employees.find(emp => emp.loginKey === loginKey.trim());
    
    if (employee) {
      onLogin(employee);
    } else {
      setError('Mã key không hợp lệ!');
    }
  };

  return (
    <div className="modal-overlay" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div className="modal" style={{ 
        maxWidth: '400px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <div className="modal-header" style={{ 
          textAlign: 'center', 
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '20px',
          marginBottom: '25px'
        }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
          }}>
            <User size={40} color="white" />
          </div>
          <h2 className="modal-title" style={{ 
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#4a5568',
            margin: '0'
          }}>
            Salon Tóc
          </h2>
          <p style={{ 
            color: '#718096', 
            margin: '8px 0 0',
            fontSize: '14px'
          }}>
            Đăng nhập để quản lý thu chi
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontWeight: '600',
              color: '#4a5568',
              marginBottom: '8px'
            }}>
              <Key size={16} />
              Mã Key Đăng Nhập
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={loginKey}
                onChange={handleKeyChange}
                className="form-control"
                placeholder="Nhập mã key của bạn..."
                style={{ 
                  paddingRight: '45px',
                  fontSize: '16px',
                  letterSpacing: '1px'
                }}
                autoComplete="off"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#a0aec0',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Hiển thị tên nhân viên khi nhập key */}
            {matchedEmployee && loginKey.trim() && (
              <div style={{
                color: '#059669',
                fontSize: '14px',
                marginTop: '8px',
                background: '#d1fae5',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #a7f3d0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <User size={16} />
                <div>
                  <div style={{ fontWeight: '600' }}>{matchedEmployee.name}</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    {matchedEmployee.position}
                    {matchedEmployee.id !== 'owner' && ` • ${matchedEmployee.percentage}%`}
                  </div>
                </div>
              </div>
            )}
            
            {/* Hiển thị thông báo khi key không khớp */}
            {!matchedEmployee && loginKey.trim() && loginKey.trim() !== '' && (
              <div style={{
                color: '#dc2626',
                fontSize: '12px',
                marginTop: '8px',
                background: '#fee2e2',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #fecaca',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Key size={14} />
                <span>Mã key này không tồn tại trong hệ thống</span>
              </div>
            )}
            
            {error && (
              <div style={{
                color: '#e53e3e',
                fontSize: '12px',
                marginTop: '5px',
                background: '#fed7d7',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #feb2b2'
              }}>
                ⚠️ {error}
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ 
              width: '100%',
              padding: '15px',
              fontSize: '16px',
              fontWeight: '600',
              marginTop: '20px'
            }}
          >
            <User size={20} style={{ marginRight: '8px' }} />
            Đăng Nhập
          </button>
        </form>

        {/* Ẩn danh sách key để bảo mật */}
        {/* 
        <div style={{ 
          marginTop: '25px',
          padding: '15px',
          background: '#f7fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ 
            fontSize: '14px',
            fontWeight: '600',
            color: '#4a5568',
            margin: '0 0 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            🔑 Danh Sách Key
          </h4>
          <div style={{ fontSize: '12px', color: '#718096' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '4px 0',
              borderBottom: '1px solid #e2e8f0',
              background: '#fef3c7'
            }}>
              <span style={{ fontWeight: '600', color: '#92400e' }}>👑 Chủ Sở Hữu</span>
              <span style={{ 
                fontFamily: 'monospace',
                background: '#fbbf24',
                color: '#92400e',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {OWNER_KEY}
              </span>
            </div>
            
            {employees.map(emp => (
              <div key={emp.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '4px 0',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <span>{emp.name}</span>
                <span style={{ 
                  fontFamily: 'monospace',
                  background: '#e2e8f0',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '11px'
                }}>
                  {emp.loginKey}
                </span>
              </div>
            ))}
          </div>
        </div>
        */}

        <div style={{ 
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#a0aec0'
        }}>
          💡 Liên hệ chủ sở hữu để được cấp mã key
        </div>
      </div>
    </div>
  );
};

export default Login;
