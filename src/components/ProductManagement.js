import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Package, Image as ImageIcon, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const ProductManagement = ({ isOpen, onClose, products, onProductsChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'shampoo',
    price: '',
    cost: '',
    stock: '',
    minStock: '',
    description: '',
    image: '',
    brand: '',
    supplier: ''
  });

  // Categories cho sản phẩm làm tóc
  const categories = [
    { value: 'shampoo', label: 'Shampoo & Dầu gội' },
    { value: 'conditioner', label: 'Dầu xả & Conditioner' },
    { value: 'treatment', label: 'Dầu ủ & Treatment' },
    { value: 'styling', label: 'Sản phẩm tạo kiểu' },
    { value: 'coloring', label: 'Thuốc nhuộm' },
    { value: 'tools', label: 'Dụng cụ & Tools' },
    { value: 'accessories', label: 'Phụ kiện' },
    { value: 'other', label: 'Khác' }
  ];

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      category: 'shampoo',
      price: '',
      cost: '',
      stock: '',
      minStock: '',
      description: '',
      image: '',
      brand: '',
      supplier: ''
    });
    setEditingProduct(null);
  };

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.stock) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    const newProduct = {
      id: editingProduct ? editingProduct.id : Date.now(),
      ...formData,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost) || 0,
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock) || 0,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingProduct) {
      onProductsChange(products.map(p => p.id === editingProduct.id ? newProduct : p));
    } else {
      onProductsChange([...products, newProduct]);
    }

    resetForm();
    setShowModal(false);
  };

  // Xử lý sửa sản phẩm
  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      cost: product.cost.toString(),
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      description: product.description || '',
      image: product.image || '',
      brand: product.brand || '',
      supplier: product.supplier || ''
    });
    setEditingProduct(product);
    setShowModal(true);
  };

  // Xử lý xóa sản phẩm
  const handleDelete = (productId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      onProductsChange(products.filter(p => p.id !== productId));
    }
  };

  // Xử lý upload hình ảnh (giả lập)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Tạo URL tạm thời cho hình ảnh
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        image: imageUrl
      }));
    }
  };

  // Lọc sản phẩm
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesLowStock = !showLowStock || product.stock <= product.minStock;
    
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // Đóng modal
  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ 
        maxWidth: '1200px', 
        width: '95%', 
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            <Package size={24} style={{ marginRight: '10px' }} />
            Quản Lý Sản Phẩm Làm Tóc
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

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
              placeholder="Tìm kiếm sản phẩm..."
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
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '150px'
            }}
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <button
            onClick={() => setShowLowStock(!showLowStock)}
            style={{
              padding: '10px 15px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              background: showLowStock ? '#fed7d7' : 'white',
              color: showLowStock ? '#c53030' : '#4a5568',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px'
            }}
          >
            <AlertTriangle size={16} />
            Sắp hết hàng
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
            style={{ marginLeft: 'auto' }}
          >
            <Plus size={16} />
            Thêm Sản Phẩm
          </button>
        </div>

        {/* Products Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {filteredProducts.map(product => (
            <div key={product.id} style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              {/* Product Image */}
              <div style={{
                height: '200px',
                background: product.image ? `url(${product.image})` : '#f7fafc',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid #e2e8f0'
              }}>
                {!product.image && (
                  <ImageIcon size={48} color="#a0aec0" />
                )}
              </div>

              {/* Product Info */}
              <div style={{ padding: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <h3 style={{ 
                    margin: '0', 
                    fontSize: '16px', 
                    fontWeight: '600',
                    color: '#2d3748',
                    flex: '1'
                  }}>
                    {product.name}
                  </h3>
                  <span style={{
                    background: product.stock <= product.minStock ? '#fed7d7' : '#d1fae5',
                    color: product.stock <= product.minStock ? '#c53030' : '#065f46',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginLeft: '8px'
                  }}>
                    {product.stock} {product.stock <= product.minStock ? '⚠️' : '✅'}
                  </span>
                </div>

                <div style={{ 
                  fontSize: '14px', 
                  color: '#718096', 
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{
                    background: '#e2e8f0',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '11px'
                  }}>
                    {categories.find(c => c.value === product.category)?.label || product.category}
                  </span>
                  {product.brand && (
                    <span style={{ fontWeight: '500' }}>{product.brand}</span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#4a5568' }}>
                      Giá bán: <span style={{ fontWeight: '600', color: '#10b981' }}>
                        {product.price.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                    {product.cost > 0 && (
                      <div style={{ fontSize: '12px', color: '#718096' }}>
                        Giá gốc: {product.cost.toLocaleString('vi-VN')}₫
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#718096' }}>
                      Tồn kho: {product.stock}
                    </div>
                    {product.minStock > 0 && (
                      <div style={{ fontSize: '12px', color: '#718096' }}>
                        Tối thiểu: {product.minStock}
                      </div>
                    )}
                  </div>
                </div>

                {product.description && (
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#4a5568',
                    marginBottom: '10px',
                    maxHeight: '40px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {product.description}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEdit(product)}
                    style={{
                      flex: '1',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      background: 'white',
                      color: '#4a5568',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '13px'
                    }}
                  >
                    <Edit size={14} />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #fed7d7',
                      borderRadius: '6px',
                      background: '#fed7d7',
                      color: '#c53030',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '13px'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#718096'
          }}>
            <Package size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>Không tìm thấy sản phẩm nào</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary"
              style={{ marginTop: '16px' }}
            >
              <Plus size={16} />
              Thêm sản phẩm đầu tiên
            </button>
          </div>
        )}

        {/* Modal thêm/sửa sản phẩm */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <div className="modal-header">
                <h2 className="modal-title">
                  {editingProduct ? '✏️ Sửa Sản Phẩm' : '➕ Thêm Sản Phẩm Mới'}
                </h2>
                <button className="close-btn" onClick={closeModal}>×</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tên Sản Phẩm *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Nhập tên sản phẩm..."
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Thương Hiệu</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Nhập thương hiệu..."
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Danh Mục</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="form-control"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nhà Cung Cấp</label>
                    <input
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Nhập nhà cung cấp..."
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Giá Bán (₫) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Nhập giá bán..."
                      min="0"
                      step="1000"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Giá Gốc (₫)</label>
                    <input
                      type="number"
                      name="cost"
                      value={formData.cost}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Nhập giá gốc..."
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Số Lượng Tồn Kho *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Nhập số lượng..."
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Số Lượng Tối Thiểu</label>
                    <input
                      type="number"
                      name="minStock"
                      value={formData.minStock}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Nhập số lượng tối thiểu..."
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Hình Ảnh Sản Phẩm</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  {formData.image && (
                    <div style={{ marginTop: '10px' }}>
                      <img
                        src={formData.image}
                        alt="Preview"
                        style={{
                          width: '100px',
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0'
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Mô Tả</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Nhập mô tả sản phẩm..."
                    rows="3"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button type="button" onClick={closeModal} className="btn btn-secondary">
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingProduct ? 'Cập Nhật' : 'Thêm Sản Phẩm'}
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

export default ProductManagement;
