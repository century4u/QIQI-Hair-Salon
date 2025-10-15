// API Service cho Authentication
class AuthService {
  constructor() {
    this.STORAGE_KEY = 'salonCurrentUser';
    this.SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 giờ
  }

  // Lưu session user
  saveUserSession(user) {
    try {
      const sessionData = {
        user: user,
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.SESSION_TIMEOUT).toISOString()
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData));
      console.log('✅ User session saved:', user.name);
      return true;
    } catch (error) {
      console.error('❌ Error saving user session:', error);
      return false;
    }
  }

  // Lấy session user hiện tại
  getCurrentUser() {
    try {
      const sessionData = localStorage.getItem(this.STORAGE_KEY);
      
      if (!sessionData) {
        return null;
      }

      const parsed = JSON.parse(sessionData);
      
      // Kiểm tra session có hết hạn không
      if (new Date(parsed.expiresAt) < new Date()) {
        this.clearSession();
        return null;
      }

      return parsed.user;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      this.clearSession();
      return null;
    }
  }

  // Kiểm tra session có hợp lệ không
  isSessionValid() {
    const user = this.getCurrentUser();
    return user !== null;
  }

  // Xóa session
  clearSession() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('✅ User session cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing session:', error);
      return false;
    }
  }

  // Gia hạn session
  extendSession() {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      return this.saveUserSession(currentUser);
    }
    return false;
  }

  // Lấy thời gian hết hạn session
  getSessionExpiry() {
    try {
      const sessionData = localStorage.getItem(this.STORAGE_KEY);
      if (!sessionData) return null;
      
      const parsed = JSON.parse(sessionData);
      return new Date(parsed.expiresAt);
    } catch (error) {
      return null;
    }
  }

  // Kiểm tra session còn bao nhiêu phút
  getSessionTimeLeft() {
    const expiry = this.getSessionExpiry();
    if (!expiry) return 0;
    
    const now = new Date();
    const timeLeft = expiry.getTime() - now.getTime();
    
    return Math.max(0, Math.floor(timeLeft / (1000 * 60))); // Trả về số phút
  }
}

// Tạo instance duy nhất
const authService = new AuthService();

export default authService;
