import {create} from 'zustand';
import {toast} from 'sonner';
import { authService } from '@/services/authService';
import type { AuthState } from '@/types/store';
import { getErrorMessage } from '@/lib/errorHandler';

export const useAuthStore = create<AuthState>((set, get) =>({
    token:  null,
    user: null,
    loading: false,

    clearState: () =>{
        set({token: null, user: null, loading: false})
    },

    setAccessToken: (accessToken) =>{
        set({token: accessToken})
    },

    signUp: async (username, password, email, phone, full_name) =>{
        try{
            set({loading: true})

            await authService.signUp(username, password, email, phone, full_name)

            toast.success("đăng ký thành công! Bạn sẽ được chuyển sang trang chủ")
        }catch(error){
            console.error(error);
            toast.error(getErrorMessage(error, "Đăng ký thất bại"));
            throw error; 
        }finally{
            set({ loading: false})
        }
    },
    signIn: async(username, password) =>{
        try{
            set({loading: true})
            const res = await authService.signIn(username, password);
            const token = res.result?.token;

            
            get().setAccessToken(token)
            await get().fetchMe();
            toast.success("đăng nhập thành công! Bạn sẽ được chuyển sang trang chủ")
        }catch(error){
            console.error(error);
            toast.error(getErrorMessage(error, "Đăng nhập thất bại"));  
            throw error;
        }finally{
            set({loading: false})
        }
    },

    signOut: async () => {
        try {
            
            await authService.signOut();
            get().clearState();
            localStorage.removeItem("token");
        
        toast.success("Đăng xuất thành công!");
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, "Đăng xuất thất bại")); 
        } 
    },

    fetchMe: async () =>{
        try {
            set({loading: true})
            const user = await authService.fetchMe();

            set({user});
        }catch(error){
            console.error(error);
            set({user: null, token: null})
            toast.error("Lỗi xảy ra khi lấy giữ liệu nguời dùng.Hãy thử lại")
        }finally{
            set({loading: false});
        }
    },
    refresh: async(token?: string | null) =>{
        try {
            set({loading: true});
            const {user, fetchMe, setAccessToken} = get()
            const accessToken = await authService.refresh(token);
            setAccessToken(accessToken)
            if(!user){
                await fetchMe();
            }
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error,"Phiên đăng nhập đã hết, hãy đăng nhập lại"))
            get().clearState();
            
        } finally{
            set({loading: false})
        }
    }
}))