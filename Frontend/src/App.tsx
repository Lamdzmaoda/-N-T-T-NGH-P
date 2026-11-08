import { BrowserRouter, Routes, Route } from "react-router";
import SigninPage from "./pages/SigninPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/DashboardPage";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/auth/ProtectedRoute";

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
          </Route> 
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
