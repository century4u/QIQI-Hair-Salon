import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, ShoppingCart, TrendingUp, TrendingDown, Calendar, BarChart3, Package, DollarSign, Users, Eye } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isSameMonth, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';

const SalesManagement = ({ isOpen, onClose, products, onProductsChange, sales, onSalesChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showStats, setShowStats] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    paymentMethod: 'cash',
    notes: ''
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      paymentMethod: 'cash',
      notes: ''
    });
    setCartItems([]);
    setSelectedProduct('');
    setEditingSale(null);
  };

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = () => {
    if (!selectedProduct) return;
    
    const product = products.find(p => p.id === parseInt(selectedProduct));
    if (!product) return;

    const existingItem = cartItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      setCartItems(prev => prev.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCartItems(prev => [...prev, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        total: product.price
      }]);
    }
  };

  // Cập nhật số lượng trong giỏ hàng
  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => item.productId !== productId));
    } else {
      setCartItems(prev => prev.map(item => 
        item.productId === productId 
          ? { ...item, quantity, total: quantity * item.price }
          : item
      ));
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  // Tính tổng tiền
  const getTotalAmount = () => {
    return cartItems.reduce((sum, item) => sum + item.total, 0);
  };

  // Xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      alert('Vui lòng thêm ít nhất một sản phẩm!');
      return;
    }

    if (!formData.customerName.trim()) {
      alert('Vui lòng nhập tên khách hàng!');
      return;
    }

    // Kiểm tra tồn kho
    for (const item of cartItems) {
      const product = products.find(p => p.id === item.productId);
      if (product && product.stock < item.quantity) {
        alert(`Sản phẩm "${item.productName}" chỉ còn ${product.stock} sản phẩm!`);
        return;
      }
    }

    const newSale = {
      id: editingSale ? editingSale.id : Date.now(),
      ...formData,
      items: cartItems,
      totalAmount: getTotalAmount(),
      createdAt: editingSale ? editingSale.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Cập nhật tồn kho
    let updatedProducts = [...products];
    
    if (editingSale) {
      // Nếu đang sửa giao dịch, cần hoàn trả tồn kho cũ trước
      const oldItems = editingSale.items;
      updatedProducts = updatedProducts.map(product => {
        const oldItem = oldItems.find(item => item.productId === product.id);
        if (oldItem) {
          return {
            ...product,
            stock: product.stock + oldItem.quantity,
            updatedAt: new Date().toISOString()
          };
        }
        return product;
      });
      
      // Sau đó trừ tồn kho mới
      updatedProducts = updatedProducts.map(product => {
        const cartItem = cartItems.find(item => item.productId === product.id);
        if (cartItem) {
          return {
            ...product,
            stock: product.stock - cartItem.quantity,
            updatedAt: new Date().toISOString()
          };
        }
        return product;
      });
      
      onSalesChange(sales.map(s => s.id === editingSale.id ? newSale : s));
    } else {
      // Tạo giao dịch mới - trừ tồn kho
      updatedProducts = updatedProducts.map(product => {
        const cartItem = cartItems.find(item => item.productId === product.id);
        if (cartItem) {
          return {
            ...product,
            stock: product.stock - cartItem.quantity,
            updatedAt: new Date().toISOString()
          };
        }
        return product;
      });
      
      onSalesChange([newSale, ...sales]);
    }
    
    onProductsChange(updatedProducts);
    resetForm();
    setShowModal(false);
  };

  // Xử lý sửa giao dịch
  const handleEdit = (sale) => {
    setFormData({
      customerName: sale.customerName,
      customerPhone: sale.customerPhone,
      paymentMethod: sale.paymentMethod,
      notes: sale.notes
    });
    setCartItems(sale.items);
    setEditingSale(sale);
    setShowModal(true);
  };

  // Xử lý xóa giao dịch
  const handleDelete = (saleId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này? Tồn kho sẽ được hoàn trả.')) {
      const saleToDelete = sales.find(s => s.id === saleId);
      
      if (saleToDelete) {
        // Hoàn trả tồn kho
        const updatedProducts = products.map(product => {
          const saleItem = saleToDelete.items.find(item => item.productId === product.id);
          if (saleItem) {
            return {
              ...product,
              stock: product.stock + saleItem.quantity,
              updatedAt: new Date().toISOString()
            };
          }
          return product;
        });
        
        onProductsChange(updatedProducts);
        onSalesChange(sales.filter(s => s.id !== saleId));
      }
    }
  };

  // Lọc giao dịch
  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customerPhone?.includes(searchTerm);
    const matchesDate = !filterDate || format(new Date(sale.createdAt), 'yyyy-MM-dd') === filterDate;
    
    return matchesSearch && matchesDate;
  });

  // Đóng modal
  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Thống kê
  const today = new Date();
  const todaySales = sales.filter(sale => isSameDay(new Date(sale.createdAt), today));
  const thisMonthSales = sales.filter(sale => isSameMonth(new Date(sale.createdAt), today));
  
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const thisMonthRevenue = thisMonthSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ 
        maxWidth: '1400px', 
        width: '95%', 
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            <ShoppingCart size={24} style={{ marginRight: '10px' }} />
            Quản Lý Bán Hàng & Doanh Thu
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Stats Cards */}
        {showStats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <DollarSign size={24} style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {todayRevenue.toLocaleString('vi-VN')}₫
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Doanh thu hôm nay</div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <Calendar size={24} style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {thisMonthRevenue.toLocaleString('vi-VN')}₫
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Doanh thu tháng này</div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <TrendingUp size={24} style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {totalRevenue.toLocaleString('vi-VN')}₫
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Tổng doanh thu</div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <Package size={24} style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {sales.length}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Tổng giao dịch</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          marginBottom: '20px', 
          flexWrap: 'wrap',
          padding: '15px',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <Search size={16} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#a0aec0'
            }} />
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '150px'
            }}
          />

          <button
            onClick={() => setShowStats(!showStats)}
            style={{
              padding: '10px 15px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              background: showStats ? '#dbeafe' : 'white',
              color: showStats ? '#1e40af' : '#4a5568',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px'
            }}
          >
            <BarChart3 size={16} />
            {showStats ? 'Ẩn thống kê' : 'Hiện thống kê'}
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
            style={{ marginLeft: 'auto' }}
          >
            <Plus size={16} />
            Bán Hàng
          </button>
        </div>

        {/* Sales Table */}
        <div className="card">
          <h3 style={{ marginBottom: '15px', color: '#4a5568' }}>
            📊 Danh Sách Giao Dịch ({filteredSales.length})
          </h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Thời gian</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Khách hàng</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Sản phẩm</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Số lượng</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Tổng tiền</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Thanh toán</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(sale => (
                  <tr key={sale.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>
                        {format(new Date(sale.createdAt), 'dd/MM/yyyy', { locale: vi })}
                      </div>
                      <div style={{ fontSize: '12px', color: '#718096' }}>
                        {format(new Date(sale.createdAt), 'HH:mm', { locale: vi })}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>
                        {sale.customerName}
                      </div>
                      {sale.customerPhone && (
                        <div style={{ fontSize: '12px', color: '#718096' }}>
                          {sale.customerPhone}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '13px' }}>
                        {sale.items.map((item, index) => (
                          <div key={index} style={{ marginBottom: '2px' }}>
                            {item.productName} ({item.quantity}x{item.price.toLocaleString('vi-VN')}₫)
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {sale.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#10b981' }}>
                      {sale.totalAmount.toLocaleString('vi-VN')}₫
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: sale.paymentMethod === 'cash' ? '#d1fae5' : '#dbeafe',
                        color: sale.paymentMethod === 'cash' ? '#065f46' : '#1e40af'
                      }}>
                        {sale.paymentMethod === 'cash' ? 'Tiền mặt' : 'Thẻ'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEdit(sale)}
                          style={{
                            padding: '6px 8px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            background: 'white',
                            color: '#4a5568',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(sale.id)}
                          style={{
                            padding: '6px 8px',
                            border: '1px solid #fed7d7',
                            borderRadius: '4px',
                            background: '#fed7d7',
                            color: '#c53030',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSales.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#718096'
            }}>
              <ShoppingCart size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>Không có giao dịch nào</p>
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary"
                style={{ marginTop: '16px' }}
              >
                <Plus size={16} />
                Tạo giao dịch đầu tiên
              </button>
            </div>
          )}
        </div>

        {/* Modal bán hàng */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
              <div className="modal-header">
                <h2 className="modal-title">
                  {editingSale ? '✏️ Sửa Giao Dịch' : '🛒 Bán Hàng Mới'}
                </h2>
                <button className="close-btn" onClick={closeModal}>×</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tên Khách Hàng *</label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Nhập tên khách hàng..."
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Số Điện Thoại</label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Nhập số điện thoại..."
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phương Thức Thanh Toán</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="form-control"
                    >
                      <option value="cash">Tiền mặt</option>
                      <option value="card">Thẻ</option>
                      <option value="transfer">Chuyển khoản</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Ghi Chú</label>
                    <input
                      type="text"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Ghi chú thêm..."
                    />
                  </div>
                </div>

                {/* Chọn sản phẩm */}
                <div className="form-group">
                  <label>Thêm Sản Phẩm</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="form-control"
                      style={{ flex: '1' }}
                    >
                      <option value="">Chọn sản phẩm...</option>
                      {products.filter(p => p.stock > 0).map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {product.price.toLocaleString('vi-VN')}₫ (Còn: {product.stock})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addToCart}
                      className="btn btn-primary"
                      disabled={!selectedProduct}
                    >
                      <Plus size={16} />
                      Thêm
                    </button>
                  </div>
                </div>

                {/* Giỏ hàng */}
                {cartItems.length > 0 && (
                  <div className="form-group">
                    <label>Giỏ Hàng</label>
                    <div style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '15px',
                      background: '#f8fafc'
                    }}>
                      {cartItems.map(item => (
                        <div key={item.productId} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 0',
                          borderBottom: '1px solid #e2e8f0'
                        }}>
                          <div style={{ flex: '1' }}>
                            <div style={{ fontWeight: '500' }}>{item.productName}</div>
                            <div style={{ fontSize: '12px', color: '#718096' }}>
                              {item.price.toLocaleString('vi-VN')}₫
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                              style={{
                                width: '24px',
                                height: '24px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '4px',
                                background: 'white',
                                cursor: 'pointer'
                              }}
                            >
                              -
                            </button>
                            <span style={{ minWidth: '30px', textAlign: 'center' }}>
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                              style={{
                                width: '24px',
                                height: '24px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '4px',
                                background: 'white',
                                cursor: 'pointer'
                              }}
                            >
                              +
                            </button>
                            <span style={{ 
                              fontWeight: '600', 
                              color: '#10b981',
                              minWidth: '100px',
                              textAlign: 'right'
                            }}>
                              {item.total.toLocaleString('vi-VN')}₫
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.productId)}
                              style={{
                                padding: '4px',
                                border: '1px solid #fed7d7',
                                borderRadius: '4px',
                                background: '#fed7d7',
                                color: '#c53030',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 0 0',
                        borderTop: '2px solid #e2e8f0',
                        marginTop: '10px'
                      }}>
                        <span style={{ fontWeight: '600', fontSize: '16px' }}>Tổng cộng:</span>
                        <span style={{ 
                          fontWeight: 'bold', 
                          fontSize: '18px',
                          color: '#10b981'
                        }}>
                          {getTotalAmount().toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button type="button" onClick={closeModal} className="btn btn-secondary">
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={cartItems.length === 0}>
                    {editingSale ? 'Cập Nhật' : 'Hoàn Thành Bán Hàng'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesManagement;
