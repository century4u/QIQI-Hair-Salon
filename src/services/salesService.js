// Service quản lý bán hàng sản phẩm
class SalesService {
  constructor() {
    this.STORAGE_KEY = 'salonSales';
  }

  // Lấy tất cả giao dịch bán hàng
  getSales() {
    try {
      const sales = localStorage.getItem(this.STORAGE_KEY);
      return sales ? JSON.parse(sales) : [];
    } catch (error) {
      console.error('Error loading sales:', error);
      return [];
    }
  }

  // Lưu giao dịch bán hàng
  saveSales(sales) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sales));
      return true;
    } catch (error) {
      console.error('Error saving sales:', error);
      return false;
    }
  }

  // Thêm giao dịch bán hàng mới
  addSale(saleData) {
    try {
      const sales = this.getSales();
      const newSale = {
        id: Date.now(),
        ...saleData,
        totalAmount: parseFloat(saleData.totalAmount),
        items: saleData.items.map(item => ({
          ...item,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
          total: parseFloat(item.price) * parseInt(item.quantity)
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      sales.unshift(newSale); // Thêm vào đầu danh sách
      this.saveSales(sales);
      return newSale;
    } catch (error) {
      console.error('Error adding sale:', error);
      return null;
    }
  }

  // Cập nhật giao dịch bán hàng
  updateSale(saleId, updateData) {
    try {
      const sales = this.getSales();
      const index = sales.findIndex(s => s.id === saleId);
      
      if (index !== -1) {
        sales[index] = {
          ...sales[index],
          ...updateData,
          totalAmount: parseFloat(updateData.totalAmount),
          items: updateData.items.map(item => ({
            ...item,
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price),
            total: parseFloat(item.price) * parseInt(item.quantity)
          })),
          updatedAt: new Date().toISOString()
        };
        
        this.saveSales(sales);
        return sales[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating sale:', error);
      return null;
    }
  }

  // Xóa giao dịch bán hàng
  deleteSale(saleId) {
    try {
      const sales = this.getSales();
      const filteredSales = sales.filter(s => s.id !== saleId);
      this.saveSales(filteredSales);
      return true;
    } catch (error) {
      console.error('Error deleting sale:', error);
      return false;
    }
  }

  // Lấy giao dịch theo ID
  getSaleById(saleId) {
    try {
      const sales = this.getSales();
      return sales.find(s => s.id === saleId);
    } catch (error) {
      console.error('Error getting sale by ID:', error);
      return null;
    }
  }

  // Lấy giao dịch theo ngày
  getSalesByDate(date) {
    try {
      const sales = this.getSales();
      const targetDate = new Date(date).toDateString();
      return sales.filter(sale => {
        const saleDate = new Date(sale.createdAt).toDateString();
        return saleDate === targetDate;
      });
    } catch (error) {
      console.error('Error getting sales by date:', error);
      return [];
    }
  }

  // Lấy giao dịch theo tháng
  getSalesByMonth(year, month) {
    try {
      const sales = this.getSales();
      return sales.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        return saleDate.getFullYear() === year && saleDate.getMonth() === month - 1;
      });
    } catch (error) {
      console.error('Error getting sales by month:', error);
      return [];
    }
  }

  // Lấy giao dịch theo khoảng thời gian
  getSalesByDateRange(startDate, endDate) {
    try {
      const sales = this.getSales();
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return sales.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= start && saleDate <= end;
      });
    } catch (error) {
      console.error('Error getting sales by date range:', error);
      return [];
    }
  }

  // Thống kê doanh thu theo ngày
  getDailyRevenue(date) {
    try {
      const dailySales = this.getSalesByDate(date);
      return {
        totalSales: dailySales.length,
        totalRevenue: dailySales.reduce((sum, sale) => sum + sale.totalAmount, 0),
        totalItems: dailySales.reduce((sum, sale) => 
          sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
        ),
        sales: dailySales
      };
    } catch (error) {
      console.error('Error getting daily revenue:', error);
      return {
        totalSales: 0,
        totalRevenue: 0,
        totalItems: 0,
        sales: []
      };
    }
  }

  // Thống kê doanh thu theo tháng
  getMonthlyRevenue(year, month) {
    try {
      const monthlySales = this.getSalesByMonth(year, month);
      return {
        totalSales: monthlySales.length,
        totalRevenue: monthlySales.reduce((sum, sale) => sum + sale.totalAmount, 0),
        totalItems: monthlySales.reduce((sum, sale) => 
          sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
        ),
        sales: monthlySales
      };
    } catch (error) {
      console.error('Error getting monthly revenue:', error);
      return {
        totalSales: 0,
        totalRevenue: 0,
        totalItems: 0,
        sales: []
      };
    }
  }

  // Thống kê sản phẩm bán chạy
  getTopSellingProducts(limit = 10) {
    try {
      const sales = this.getSales();
      const productStats = {};
      
      sales.forEach(sale => {
        sale.items.forEach(item => {
          if (!productStats[item.productId]) {
            productStats[item.productId] = {
              productId: item.productId,
              productName: item.productName,
              totalQuantity: 0,
              totalRevenue: 0,
              salesCount: 0
            };
          }
          
          productStats[item.productId].totalQuantity += item.quantity;
          productStats[item.productId].totalRevenue += item.total;
          productStats[item.productId].salesCount += 1;
        });
      });
      
      return Object.values(productStats)
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top selling products:', error);
      return [];
    }
  }

  // Thống kê tổng quan
  getOverallStats() {
    try {
      const sales = this.getSales();
      const today = new Date();
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      
      const todaySales = this.getDailyRevenue(today.toISOString().split('T')[0]);
      const thisMonthSales = this.getMonthlyRevenue(today.getFullYear(), today.getMonth() + 1);
      const lastMonthSales = this.getMonthlyRevenue(lastMonth.getFullYear(), lastMonth.getMonth() + 1);
      
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const totalItems = sales.reduce((sum, sale) => 
        sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
      );
      
      return {
        totalSales: sales.length,
        totalRevenue,
        totalItems,
        todayRevenue: todaySales.totalRevenue,
        todayItems: todaySales.totalItems,
        thisMonthRevenue: thisMonthSales.totalRevenue,
        thisMonthItems: thisMonthSales.totalItems,
        lastMonthRevenue: lastMonthSales.totalRevenue,
        monthlyGrowth: lastMonthSales.totalRevenue > 0 
          ? ((thisMonthSales.totalRevenue - lastMonthSales.totalRevenue) / lastMonthSales.totalRevenue * 100)
          : 0
      };
    } catch (error) {
      console.error('Error getting overall stats:', error);
      return {
        totalSales: 0,
        totalRevenue: 0,
        totalItems: 0,
        todayRevenue: 0,
        todayItems: 0,
        thisMonthRevenue: 0,
        thisMonthItems: 0,
        lastMonthRevenue: 0,
        monthlyGrowth: 0
      };
    }
  }

  // Xuất dữ liệu bán hàng
  exportSales() {
    try {
      const sales = this.getSales();
      return {
        sales,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
    } catch (error) {
      console.error('Error exporting sales:', error);
      return null;
    }
  }

  // Nhập dữ liệu bán hàng
  importSales(data) {
    try {
      if (data && data.sales && Array.isArray(data.sales)) {
        this.saveSales(data.sales);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing sales:', error);
      return false;
    }
  }

  // Xóa tất cả dữ liệu bán hàng
  clearAllSales() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing sales:', error);
      return false;
    }
  }

  // Tạo dữ liệu mẫu
  createSampleData() {
    const sampleSales = [
      {
        id: 1,
        customerName: 'Nguyễn Thị A',
        customerPhone: '0123456789',
        items: [
          {
            productId: 1,
            productName: 'Shampoo Keratin Repair',
            quantity: 2,
            price: 250000,
            total: 500000
          },
          {
            productId: 2,
            productName: 'Conditioner Hydrating',
            quantity: 1,
            price: 200000,
            total: 200000
          }
        ],
        totalAmount: 700000,
        paymentMethod: 'cash',
        notes: 'Khách hàng VIP',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 ngày trước
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        customerName: 'Trần Văn B',
        customerPhone: '0987654321',
        items: [
          {
            productId: 3,
            productName: 'Hair Mask Deep Repair',
            quantity: 1,
            price: 350000,
            total: 350000
          }
        ],
        totalAmount: 350000,
        paymentMethod: 'card',
        notes: '',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 ngày trước
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        customerName: 'Lê Thị C',
        customerPhone: '0369852147',
        items: [
          {
            productId: 5,
            productName: 'Hair Color Ash Brown',
            quantity: 3,
            price: 180000,
            total: 540000
          },
          {
            productId: 1,
            productName: 'Shampoo Keratin Repair',
            quantity: 1,
            price: 250000,
            total: 250000
          }
        ],
        totalAmount: 790000,
        paymentMethod: 'cash',
        notes: 'Mua combo',
        createdAt: new Date().toISOString(), // Hôm nay
        updatedAt: new Date().toISOString()
      }
    ];

    try {
      this.saveSales(sampleSales);
      return sampleSales;
    } catch (error) {
      console.error('Error creating sample data:', error);
      return [];
    }
  }
}

// Tạo instance duy nhất
const salesService = new SalesService();

export default salesService;
