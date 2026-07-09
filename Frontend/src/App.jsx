import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'

import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Home from './pages/Home/Home'
import PlaceList from './pages/Places/PlaceList'
import PlaceDetail from './pages/Places/PlaceDetail'
import CreateTrip from './pages/Trips/CreateTrip'
import TripDetail from './pages/Trips/TripDetail'
import Profile from './pages/Profile/Profile'
import Dashboard from './pages/Admin/Dashboard'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  // Kiểm tra xem trong danh sách roles của user có vai trò 'ADMIN' hay không
  const isAdmin = user?.roles?.some(role => role.name === 'ADMIN')
  
  return isAdmin ? children : <Navigate to="/" />
}

function AppRoutes() {
  const hideNavbar = ['/login', '/register'].includes(window.location.pathname)

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/places" element={<PlaceList />} />
        <Route path="/places/:id" element={<PlaceDetail />} />
        <Route path="/trips/create" element={
          <PrivateRoute><CreateTrip /></PrivateRoute>
        } />
        <Route path="/trips/:id" element={
          <PrivateRoute><TripDetail /></PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute><Profile /></PrivateRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute><Dashboard /></AdminRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}