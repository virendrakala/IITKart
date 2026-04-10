import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/app/contexts/AppContext';
import { HomePage } from '@/app/components/HomePage';
import { AuthPage } from '@/app/components/AuthPage';
import { UserInterface } from '@/app/components/UserInterfaceNew';
import { VendorInterface } from '@/app/components/VendorInterfaceNew';
import { CourierInterface } from '@/app/components/CourierInterface';
import { AdminInterface } from '@/app/components/AdminInterface';
import { Toaster } from '@/app/components/ui/sonner';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          {/* Issue #78: Add parameterized routes for tab navigation */}
          <Route path="/user" element={<UserInterface />} />
          <Route path="/user/:tab" element={<UserInterface />} />
          <Route path="/vendor" element={<VendorInterface />} />
          <Route path="/vendor/:tab" element={<VendorInterface />} />
          <Route path="/courier" element={<CourierInterface />} />
          <Route path="/courier/:tab" element={<CourierInterface />} />
          <Route path="/admin" element={<AdminInterface />} />
          <Route path="/admin/:tab" element={<AdminInterface />} />
        </Routes>
        <Toaster position="top-right" />
      </AppProvider>
    </BrowserRouter>
  );
}