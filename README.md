# 💇‍♀️ Quản Lý Thu Chi Salon Tóc

Ứng dụng quản lý tài chính chuyên nghiệp cho cửa hàng tóc với tính năng chia phần trăm cho nhân viên.

## ✨ Tính Năng Chính

### 📊 Quản Lý Thu Chi
- **Thêm/Sửa/Xóa giao dịch**: Quản lý tất cả giao dịch thu chi hàng ngày
- **Phân loại giao dịch**: Thu nhập và chi phí được phân biệt rõ ràng
- **Theo dõi theo nhân viên**: Mỗi giao dịch được gán cho nhân viên cụ thể

### 👥 Quản Lý Nhân Viên & Chia Phần
- **Danh sách nhân viên**: Quản lý thông tin nhân viên và chức vụ
- **Chia phần trăm linh hoạt**: Mỗi nhân viên có tỷ lệ phần trăm riêng
- **Tính toán tự động**: Hệ thống tự động tính phần được chia cho từng nhân viên
- **Báo cáo chi tiết**: Xem tổng thu nhập và phần chia của từng người

### 📈 Thống Kê & Báo Cáo
- **Dashboard tổng quan**: Tổng thu nhập, chi phí, lợi nhuận ròng
- **Báo cáo theo nhân viên**: Thu nhập và phần chia của từng người
- **Lịch sử giao dịch**: Xem toàn bộ giao dịch với đầy đủ thông tin

### 💾 Lưu Trữ Dữ Liệu
- **Lưu trữ local**: Dữ liệu được lưu trong trình duyệt
- **Không mất dữ liệu**: Dữ liệu được bảo toàn khi tải lại trang
- **Dễ dàng backup**: Có thể xuất/import dữ liệu

## 🚀 Cách Sử Dụng

### 1. Cài Đặt
```bash
# Cài đặt dependencies
npm install

# Chạy ứng dụng
npm start
```

### 2. Quản Lý Nhân Viên
- Hệ thống đã có sẵn 4 nhân viên mẫu
- Mỗi nhân viên có phần trăm chia khác nhau:
  - Thợ cắt tóc chính: 40%
  - Thợ cắt tóc: 30%
  - Thợ nhuộm: 20%
  - Thợ gội đầu: 10%

### 3. Thêm Giao Dịch
1. Click nút "Thêm Giao Dịch Mới"
2. Chọn loại: Thu nhập hoặc Chi phí
3. Nhập số tiền và mô tả
4. Chọn nhân viên thực hiện
5. Chọn ngày giao dịch
6. Click "Thêm Mới"

### 4. Xem Báo Cáo
- **Dashboard**: Xem tổng quan thu chi
- **Bảng phân bổ**: Xem phần chia của từng nhân viên
- **Lịch sử**: Xem chi tiết tất cả giao dịch

## 🎨 Giao Diện

- **Thiết kế hiện đại**: Gradient background, glass morphism effects
- **Responsive**: Tương thích với mọi thiết bị
- **Màu sắc trực quan**: Xanh lá cho thu nhập, đỏ cho chi phí
- **Icons đẹp mắt**: Sử dụng Lucide React icons
- **Animation mượt mà**: Hiệu ứng hover và transition

## 🛠️ Công Nghệ Sử Dụng

- **React 18**: Framework chính
- **Lucide React**: Icons
- **date-fns**: Xử lý ngày tháng
- **CSS3**: Styling với gradient và glass effects
- **LocalStorage**: Lưu trữ dữ liệu

## 📱 Responsive Design

Ứng dụng được thiết kế responsive, hoạt động tốt trên:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)

## 🔧 Tùy Chỉnh

### Thay Đổi Phần Trăm Nhân Viên
Chỉnh sửa trong file `src/App.js`:
```javascript
const initialEmployees = [
  { id: 1, name: 'Nguyễn Văn A', position: 'Thợ cắt tóc chính', percentage: 40 },
  // Thay đổi percentage theo ý muốn
];
```

### Thêm Nhân Viên Mới
Thêm vào mảng `initialEmployees`:
```javascript
{ id: 5, name: 'Tên Nhân Viên', position: 'Chức Vụ', percentage: 15 }
```

## 📊 Ví Dụ Sử Dụng

1. **Ngày 1**: Thợ A cắt tóc cho khách, thu 200,000₫ → A được 80,000₫ (40%)
2. **Ngày 2**: Thợ B nhuộm tóc, thu 300,000₫ → B được 90,000₫ (30%)
3. **Ngày 3**: Chi tiền mua hóa chất 150,000₫ → Không chia cho ai

## 🎯 Lợi Ích

- ✅ **Minh bạch**: Mọi nhân viên đều thấy rõ phần chia của mình
- ✅ **Chính xác**: Tính toán tự động, không sai sót
- ✅ **Nhanh chóng**: Giao diện thân thiện, dễ sử dụng
- ✅ **Chuyên nghiệp**: Thiết kế đẹp, phù hợp với salon
- ✅ **Linh hoạt**: Dễ dàng điều chỉnh phần trăm và thêm nhân viên

---

💡 **Lưu ý**: Ứng dụng sử dụng LocalStorage để lưu dữ liệu. Để backup dữ liệu, bạn có thể copy nội dung từ Developer Tools > Application > Local Storage.
