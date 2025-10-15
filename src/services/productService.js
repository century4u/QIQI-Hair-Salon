// Service quản lý sản phẩm làm tóc
class ProductService {
  constructor() {
    this.STORAGE_KEY = 'salonProducts';
  }

  // Lấy tất cả sản phẩm
  getProducts() {
    try {
      const products = localStorage.getItem(this.STORAGE_KEY);
      return products ? JSON.parse(products) : [];
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  }

  // Lưu sản phẩm
  saveProducts(products) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products));
      return true;
    } catch (error) {
      console.error('Error saving products:', error);
      return false;
    }
  }

  // Thêm sản phẩm mới
  addProduct(productData) {
    try {
      const products = this.getProducts();
      const newProduct = {
        id: Date.now(),
        ...productData,
        price: parseFloat(productData.price),
        cost: parseFloat(productData.cost) || 0,
        stock: parseInt(productData.stock),
        minStock: parseInt(productData.minStock) || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      products.push(newProduct);
      this.saveProducts(products);
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      return null;
    }
  }

  // Cập nhật sản phẩm
  updateProduct(productId, updateData) {
    try {
      const products = this.getProducts();
      const index = products.findIndex(p => p.id === productId);
      
      if (index !== -1) {
        products[index] = {
          ...products[index],
          ...updateData,
          price: parseFloat(updateData.price),
          cost: parseFloat(updateData.cost) || 0,
          stock: parseInt(updateData.stock),
          minStock: parseInt(updateData.minStock) || 0,
          updatedAt: new Date().toISOString()
        };
        
        this.saveProducts(products);
        return products[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating product:', error);
      return null;
    }
  }

  // Xóa sản phẩm
  deleteProduct(productId) {
    try {
      const products = this.getProducts();
      const filteredProducts = products.filter(p => p.id !== productId);
      this.saveProducts(filteredProducts);
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  // Tìm sản phẩm theo ID
  getProductById(productId) {
    try {
      const products = this.getProducts();
      return products.find(p => p.id === productId);
    } catch (error) {
      console.error('Error getting product by ID:', error);
      return null;
    }
  }

  // Lọc sản phẩm theo danh mục
  getProductsByCategory(category) {
    try {
      const products = this.getProducts();
      return products.filter(p => p.category === category);
    } catch (error) {
      console.error('Error getting products by category:', error);
      return [];
    }
  }

  // Tìm kiếm sản phẩm
  searchProducts(searchTerm) {
    try {
      const products = this.getProducts();
      const term = searchTerm.toLowerCase();
      
      return products.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.brand?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  // Lấy sản phẩm sắp hết hàng
  getLowStockProducts() {
    try {
      const products = this.getProducts();
      return products.filter(p => p.stock <= p.minStock);
    } catch (error) {
      console.error('Error getting low stock products:', error);
      return [];
    }
  }

  // Cập nhật số lượng tồn kho
  updateStock(productId, newStock) {
    try {
      const products = this.getProducts();
      const index = products.findIndex(p => p.id === productId);
      
      if (index !== -1) {
        products[index].stock = parseInt(newStock);
        products[index].updatedAt = new Date().toISOString();
        this.saveProducts(products);
        return products[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating stock:', error);
      return null;
    }
  }

  // Tăng số lượng tồn kho (nhập hàng)
  increaseStock(productId, amount) {
    try {
      const products = this.getProducts();
      const index = products.findIndex(p => p.id === productId);
      
      if (index !== -1) {
        products[index].stock += parseInt(amount);
        products[index].updatedAt = new Date().toISOString();
        this.saveProducts(products);
        return products[index];
      }
      return null;
    } catch (error) {
      console.error('Error increasing stock:', error);
      return null;
    }
  }

  // Giảm số lượng tồn kho (bán hàng)
  decreaseStock(productId, amount) {
    try {
      const products = this.getProducts();
      const index = products.findIndex(p => p.id === productId);
      
      if (index !== -1) {
        const newStock = products[index].stock - parseInt(amount);
        if (newStock >= 0) {
          products[index].stock = newStock;
          products[index].updatedAt = new Date().toISOString();
          this.saveProducts(products);
          return products[index];
        }
      }
      return null;
    } catch (error) {
      console.error('Error decreasing stock:', error);
      return null;
    }
  }

  // Thống kê sản phẩm
  getProductStats() {
    try {
      const products = this.getProducts();
      
      const stats = {
        totalProducts: products.length,
        totalValue: 0,
        lowStockCount: 0,
        categories: {},
        topProducts: []
      };

      products.forEach(product => {
        // Tính tổng giá trị tồn kho
        stats.totalValue += product.stock * product.cost;
        
        // Đếm sản phẩm sắp hết hàng
        if (product.stock <= product.minStock) {
          stats.lowStockCount++;
        }
        
        // Thống kê theo danh mục
        if (!stats.categories[product.category]) {
          stats.categories[product.category] = 0;
        }
        stats.categories[product.category]++;
      });

      // Sắp xếp sản phẩm theo giá trị tồn kho
      stats.topProducts = products
        .sort((a, b) => (b.stock * b.cost) - (a.stock * a.cost))
        .slice(0, 5);

      return stats;
    } catch (error) {
      console.error('Error getting product stats:', error);
      return {
        totalProducts: 0,
        totalValue: 0,
        lowStockCount: 0,
        categories: {},
        topProducts: []
      };
    }
  }

  // Xuất dữ liệu sản phẩm
  exportProducts() {
    try {
      const products = this.getProducts();
      return {
        products,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
    } catch (error) {
      console.error('Error exporting products:', error);
      return null;
    }
  }

  // Nhập dữ liệu sản phẩm
  importProducts(data) {
    try {
      if (data && data.products && Array.isArray(data.products)) {
        this.saveProducts(data.products);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing products:', error);
      return false;
    }
  }

  // Xóa tất cả sản phẩm
  clearAllProducts() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing products:', error);
      return false;
    }
  }

  // Tạo dữ liệu mẫu
  createSampleData() {
    const sampleProducts = [
      {
        id: 1,
        name: 'Shampoo Keratin Repair',
        category: 'shampoo',
        price: 250000,
        cost: 150000,
        stock: 50,
        minStock: 10,
        brand: 'L\'Oréal',
        supplier: 'Công ty TNHH Mỹ phẩm ABC',
        description: 'Shampoo phục hồi keratin cho tóc hư tổn',
        image: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Conditioner Hydrating',
        category: 'conditioner',
        price: 200000,
        cost: 120000,
        stock: 30,
        minStock: 5,
        brand: 'Schwarzkopf',
        supplier: 'Công ty TNHH Mỹ phẩm XYZ',
        description: 'Dầu xả cấp ẩm cho tóc khô',
        image: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Hair Mask Deep Repair',
        category: 'treatment',
        price: 350000,
        cost: 200000,
        stock: 15,
        minStock: 3,
        brand: 'Wella',
        supplier: 'Công ty TNHH Mỹ phẩm DEF',
        description: 'Mặt nạ ủ sâu phục hồi tóc hư tổn',
        image: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 4,
        name: 'Hair Dryer Professional',
        category: 'tools',
        price: 1500000,
        cost: 1000000,
        stock: 5,
        minStock: 1,
        brand: 'Dyson',
        supplier: 'Công ty TNHH Thiết bị GHI',
        description: 'Máy sấy tóc chuyên nghiệp',
        image: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 5,
        name: 'Hair Color Ash Brown',
        category: 'coloring',
        price: 180000,
        cost: 100000,
        stock: 8,
        minStock: 2,
        brand: 'Garnier',
        supplier: 'Công ty TNHH Mỹ phẩm JKL',
        description: 'Thuốc nhuộm màu nâu tro',
        image: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    try {
      this.saveProducts(sampleProducts);
      return sampleProducts;
    } catch (error) {
      console.error('Error creating sample data:', error);
      return [];
    }
  }
}

// Tạo instance duy nhất
const productService = new ProductService();

export default productService;
