import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ShopProvider } from './context/ShopContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import MenuPage from './pages/MenuPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import PaymentPage from './pages/PaymentPage.jsx'
import ConfirmPage from './pages/ConfirmPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import StampsPage from './pages/StampsPage.jsx'
import WalletPage from './pages/WalletPage.jsx'
import FeedbackPage from './pages/FeedbackPage.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import LoginPage from './pages/admin/LoginPage.jsx'
import DashboardPage from './pages/admin/DashboardPage.jsx'
import OrderDetailPage from './pages/admin/OrderDetailPage.jsx'
import MenuManagerPage from './pages/admin/MenuManagerPage.jsx'
import AdminCalendarPage from './pages/admin/CalendarPage.jsx'
import StockPage from './pages/admin/StockPage.jsx'
import BatchPage from './pages/admin/BatchPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { ToastProvider } from './components/Toast.jsx'

export default function App() {
  return (
    <ToastProvider>
    <AuthProvider>
    <ShopProvider>
    <CartProvider>
    <BrowserRouter>
      <Routes>
        {/* Customer */}
        <Route path="/" element={<MenuPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/confirm/:orderId" element={<ConfirmPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/stamps" element={<StampsPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/calendar" element={<CalendarPage />} />

        {/* Admin */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
          <Route path="/admin/menu" element={<MenuManagerPage />} />
          <Route path="/admin/calendar" element={<AdminCalendarPage />} />
          <Route path="/admin/stock" element={<StockPage />} />
          <Route path="/admin/batch" element={<BatchPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </CartProvider>
    </ShopProvider>
    </AuthProvider>
    </ToastProvider>
  )
}
