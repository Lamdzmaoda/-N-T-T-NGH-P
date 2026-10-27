import { useAuthStore } from '@/stores/useAuthStore'
import React, { useEffect, useRef, useState } from 'react'
import { Navigate, Outlet } from 'react-router';

const ProtectedRoute = () => {

    const {token, user, loading, refresh, fetchMe} = useAuthStore();
    const [starting, setStarting] = useState(true);
    const hasCalledRef = useRef(false);
    
    useEffect(() => {
      if (hasCalledRef.current) return;
      hasCalledRef.current = true;
      const init = async () => {
         try {
          // Luôn gọi refresh khi load trang để khôi phục phiên đăng nhập
          await refresh();
        } catch (error) {
          console.error("Phiên đăng nhập hết hạn:", error);
        } finally {
          setStarting(false);
        }
      };
      init();
    }, []);
    
    if(starting || loading) {
      return <div className='flex h-screen items-center justify-center'>Đang tải ...</div>
    }

    if(!token){
        return(
            <Navigate to="/Signin" replace />
        )
    }
  return (
    <Outlet></Outlet>
  )
}

export default ProtectedRoute