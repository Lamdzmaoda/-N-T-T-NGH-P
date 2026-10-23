import Logout from "@/components/auth/Logout"
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore"
import { Button } from "@base-ui/react/button";
import { toast } from "sonner";


const HomePage = () => {
  const user = useAuthStore((s) => s.user);

  const handleOnClick = async ()=>{
    try {
      await api.get("/users/myInfo", {withCredentials: true});
      toast.success("ok")
    } catch (error) {
      toast.error("Thất bại");
      console.error(error)
    }
  }
  return (
    <div>
      {user?.username}
      <Logout/>
      <Button onClick={handleOnClick}>invalid</Button>
    </div>
    
  )
}

export default HomePage