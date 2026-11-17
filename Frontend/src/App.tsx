import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import SigninPage from "./pages/User/SigninPage";
import SignupPage from "./pages/User/SignupPage";
import HomePage from "./pages/User/DashboardPage";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminUserListPage from "./pages/Admin/AdminUserListPage";
import AdminLayout from "./components/layout/AdminLayout";
function App() {
  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          {/* public routes */}
          <Route path="/signin" element={<SigninPage />} />

          <Route path="/signup" element={<SignupPage />} />

          {/* private routes */}
          <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/users" replace />} />
                <Route path="users" element={<AdminUserListPage />} />
                <Route path="user/list" element={<AdminUserListPage />} />
              
              </Route>
          </Route> 
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
