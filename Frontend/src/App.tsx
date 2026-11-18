import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import SigninPage from "./pages/User/SigninPage";
import SignupPage from "./pages/User/SignupPage";
import HomePage from "./pages/User/DashboardPage";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminUserListPage from "./pages/Admin/AdminUserListPage";
import AdminLayout from "./components/admin/layout/AdminLayout";
import AdminCategoryListPage from "./pages/Admin/AdminCategoryListPage";
import OAuth2CallbackPage from "./pages/auth/OAuth2CallbackPage";
function App() {
  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          {/* public routes */}
          <Route path="/signin" element={<SigninPage />} />

          <Route path="/signup" element={<SignupPage />} />

          <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />

          {/* private routes */}
          <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/users" replace />} />
                <Route path="users" element={<AdminUserListPage />} />
                <Route path="categories" element={<AdminCategoryListPage />} />
                <Route path="user/list" element={<AdminUserListPage />} />

              </Route>
          </Route> 
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
