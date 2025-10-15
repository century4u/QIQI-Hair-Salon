import * as XLSX from 'xlsx';
import { format, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { vi } from 'date-fns/locale';

// Service xuất dữ liệu ra Excel
class ExcelExportService {
  
  // Xuất báo cáo tổng hợp doanh thu nhân viên
  static async exportEmployeeRevenue(employees, transactions) {
    try {
      console.log('📊 Generating employee revenue report...');
      
      // Tạo workbook
      const workbook = XLSX.utils.book_new();
      
      // 1. Báo cáo tổng hợp
      const summarySheet = this.createSummarySheet(employees, transactions);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng Hợp Doanh Thu');
      
      // 2. Chi tiết theo nhân viên
      const employeeSheet = this.createEmployeeDetailSheet(employees, transactions);
      XLSX.utils.book_append_sheet(workbook, employeeSheet, 'Chi Tiết Theo Nhân Viên');
      
      // 3. Chi tiết theo tháng
      const monthlySheet = this.createMonthlySheet(employees, transactions);
      XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Chi Tiết Theo Tháng');
      
      // 4. Chi tiết giao dịch
      const transactionSheet = this.createTransactionSheet(transactions, employees);
      XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Chi Tiết Giao Dịch');
      
      // Xuất file
      const fileName = `BaoCaoDoanhThu_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      console.log('✅ Excel file exported successfully:', fileName);
      return { success: true, fileName };
      
    } catch (error) {
      console.error('❌ Error exporting Excel:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Tạo sheet tổng hợp
  static createSummarySheet(employees, transactions) {
    const summaryData = [
      ['BÁO CÁO TỔNG HỢP DOANH THU NHÂN VIÊN'],
      ['Thời gian xuất báo cáo:', format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })],
      [''],
      ['THÔNG TIN TỔNG QUAN'],
      ['Tổng số nhân viên:', employees.length],
      ['Tổng số giao dịch:', transactions.length],
      ['Tổng doanh thu:', this.calculateTotalRevenue(transactions).toLocaleString('vi-VN') + '₫'],
      ['Tổng chi phí:', this.calculateTotalExpense(transactions).toLocaleString('vi-VN') + '₫'],
      ['Lợi nhuận ròng:', this.calculateNetProfit(transactions).toLocaleString('vi-VN') + '₫'],
      [''],
      ['DANH SÁCH NHÂN VIÊN VÀ DOANH THU'],
      ['STT', 'Tên Nhân Viên', 'Vị Trí', 'Phần Trăm (%)', 'Tổng Doanh Thu (₫)', 'Số Giao Dịch', 'Doanh Thu Trung Bình (₫)']
    ];
    
    // Thêm dữ liệu từng nhân viên
    employees.forEach((employee, index) => {
      const employeeTransactions = transactions.filter(t => 
        t.type === 'income' && 
        t.status === 'approved' && 
        parseInt(t.employeeId) === employee.id
      );
      
      const totalRevenue = employeeTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const avgRevenue = employeeTransactions.length > 0 ? totalRevenue / employeeTransactions.length : 0;
      
      summaryData.push([
        index + 1,
        employee.name,
        employee.position,
        employee.percentage + '%',
        totalRevenue.toLocaleString('vi-VN'),
        employeeTransactions.length,
        avgRevenue.toLocaleString('vi-VN')
      ]);
    });
    
    // Tạo worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Thiết lập độ rộng cột
    worksheet['!cols'] = [
      { width: 8 },   // STT
      { width: 25 },  // Tên nhân viên
      { width: 25 },  // Vị trí
      { width: 15 },  // Phần trăm
      { width: 20 },  // Tổng doanh thu
      { width: 15 },  // Số giao dịch
      { width: 25 }   // Doanh thu trung bình
    ];
    
    return worksheet;
  }
  
  // Tạo sheet chi tiết theo nhân viên
  static createEmployeeDetailSheet(employees, transactions) {
    const detailData = [
      ['CHI TIẾT DOANH THU THEO NHÂN VIÊN'],
      [''],
      ['STT', 'Tên Nhân Viên', 'Ngày', 'Loại', 'Mô Tả', 'Số Tiền (₫)', 'Trạng Thái', 'Ngày Tạo']
    ];
    
    let rowIndex = 3;
    let globalIndex = 1;
    
    employees.forEach((employee, empIndex) => {
      const employeeTransactions = transactions.filter(t => parseInt(t.employeeId) === employee.id);
      
      if (employeeTransactions.length > 0) {
        // Thêm header nhân viên
        detailData.push([`--- ${employee.name} (${employee.position}) ---`]);
        rowIndex++;
        
        employeeTransactions.forEach(transaction => {
          detailData.push([
            globalIndex++,
            employee.name,
            format(new Date(transaction.createdAt), 'dd/MM/yyyy', { locale: vi }),
            transaction.type === 'income' ? 'Thu' : 'Chi',
            transaction.description,
            parseFloat(transaction.amount).toLocaleString('vi-VN'),
            this.getStatusText(transaction.status),
            format(new Date(transaction.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })
          ]);
          rowIndex++;
        });
        
        // Thêm tổng kết nhân viên
        const totalRevenue = employeeTransactions
          .filter(t => t.type === 'income' && t.status === 'approved')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        const totalExpense = employeeTransactions
          .filter(t => t.type === 'expense' && t.status === 'approved')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        detailData.push([
          '',
          `TỔNG ${employee.name}:`,
          '',
          '',
          '',
          `Thu: ${totalRevenue.toLocaleString('vi-VN')}₫`,
          `Chi: ${totalExpense.toLocaleString('vi-VN')}₫`,
          `Lãi: ${(totalRevenue - totalExpense).toLocaleString('vi-VN')}₫`
        ]);
        
        detailData.push(['']); // Dòng trống
        rowIndex += 3;
      }
    });
    
    const worksheet = XLSX.utils.aoa_to_sheet(detailData);
    
    // Thiết lập độ rộng cột
    worksheet['!cols'] = [
      { width: 8 },   // STT
      { width: 25 },  // Tên nhân viên
      { width: 15 },  // Ngày
      { width: 10 },  // Loại
      { width: 30 },  // Mô tả
      { width: 20 },  // Số tiền
      { width: 15 },  // Trạng thái
      { width: 20 }   // Ngày tạo
    ];
    
    return worksheet;
  }
  
  // Tạo sheet chi tiết theo tháng
  static createMonthlySheet(employees, transactions) {
    // Lấy danh sách các tháng có giao dịch
    const months = this.getMonthsWithTransactions(transactions);
    
    const monthlyData = [
      ['BÁO CÁO DOANH THU THEO THÁNG'],
      [''],
      ['Tháng/Năm', 'Nhân Viên', 'Doanh Thu (₫)', 'Số Giao Dịch', 'Trung Bình/Giao Dịch (₫)']
    ];
    
    months.forEach(monthYear => {
      const [year, month] = monthYear.split('-');
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.createdAt);
        return isSameMonth(transactionDate, monthStart) && 
               t.type === 'income' && 
               t.status === 'approved';
      });
      
      if (monthTransactions.length > 0) {
        // Thêm header tháng
        const monthName = format(monthStart, 'MMMM yyyy', { locale: vi });
        monthlyData.push([`=== ${monthName} ===`]);
        
        // Thêm dữ liệu từng nhân viên trong tháng
        employees.forEach(employee => {
          const employeeMonthTransactions = monthTransactions.filter(t => 
            parseInt(t.employeeId) === employee.id
          );
          
          if (employeeMonthTransactions.length > 0) {
            const totalRevenue = employeeMonthTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
            const avgRevenue = totalRevenue / employeeMonthTransactions.length;
            
            monthlyData.push([
              format(monthStart, 'MM/yyyy'),
              employee.name,
              totalRevenue.toLocaleString('vi-VN'),
              employeeMonthTransactions.length,
              avgRevenue.toLocaleString('vi-VN')
            ]);
          }
        });
        
        // Thêm tổng tháng
        const monthTotal = monthTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        monthlyData.push([
          '',
          `TỔNG ${monthName}:`,
          monthTotal.toLocaleString('vi-VN'),
          monthTransactions.length,
          monthTransactions.length > 0 ? (monthTotal / monthTransactions.length).toLocaleString('vi-VN') : '0'
        ]);
        
        monthlyData.push(['']); // Dòng trống
      }
    });
    
    const worksheet = XLSX.utils.aoa_to_sheet(monthlyData);
    
    // Thiết lập độ rộng cột
    worksheet['!cols'] = [
      { width: 15 },  // Tháng/Năm
      { width: 25 },  // Nhân viên
      { width: 20 },  // Doanh thu
      { width: 15 },  // Số giao dịch
      { width: 25 }   // Trung bình
    ];
    
    return worksheet;
  }
  
  // Tạo sheet chi tiết giao dịch
  static createTransactionSheet(transactions, employees) {
    const transactionData = [
      ['CHI TIẾT TẤT CẢ GIAO DỊCH'],
      [''],
      ['STT', 'Ngày', 'Nhân Viên', 'Loại', 'Mô Tả', 'Số Tiền (₫)', 'Trạng Thái', 'Người Duyệt', 'Ngày Duyệt']
    ];
    
    transactions.forEach((transaction, index) => {
      const employee = this.getEmployeeName(transaction.employeeId, employees);
      
      transactionData.push([
        index + 1,
        format(new Date(transaction.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi }),
        employee,
        transaction.type === 'income' ? 'Thu' : 'Chi',
        transaction.description,
        parseFloat(transaction.amount).toLocaleString('vi-VN'),
        this.getStatusText(transaction.status),
        transaction.approvedBy || '',
        transaction.approvedAt ? format(new Date(transaction.approvedAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : ''
      ]);
    });
    
    const worksheet = XLSX.utils.aoa_to_sheet(transactionData);
    
    // Thiết lập độ rộng cột
    worksheet['!cols'] = [
      { width: 8 },   // STT
      { width: 20 },  // Ngày
      { width: 25 },  // Nhân viên
      { width: 10 },  // Loại
      { width: 30 },  // Mô tả
      { width: 20 },  // Số tiền
      { width: 15 },  // Trạng thái
      { width: 20 },  // Người duyệt
      { width: 20 }   // Ngày duyệt
    ];
    
    return worksheet;
  }
  
  // Helper methods
  static calculateTotalRevenue(transactions) {
    return transactions
      .filter(t => t.type === 'income' && t.status === 'approved')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  }
  
  static calculateTotalExpense(transactions) {
    return transactions
      .filter(t => t.type === 'expense' && t.status === 'approved')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  }
  
  static calculateNetProfit(transactions) {
    return this.calculateTotalRevenue(transactions) - this.calculateTotalExpense(transactions);
  }
  
  static getStatusText(status) {
    switch (status) {
      case 'pending': return 'Chờ duyệt';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Từ chối';
      default: return status;
    }
  }
  
  static getEmployeeName(employeeId, employees) {
    const employee = employees.find(emp => emp.id === parseInt(employeeId));
    return employee ? employee.name : `Nhân viên ${employeeId}`;
  }
  
  static getMonthsWithTransactions(transactions) {
    const months = new Set();
    transactions.forEach(t => {
      if (t.type === 'income' && t.status === 'approved') {
        const date = new Date(t.createdAt);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.add(monthYear);
      }
    });
    return Array.from(months).sort();
  }
}

export default ExcelExportService;
