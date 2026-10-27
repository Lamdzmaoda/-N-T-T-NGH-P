import { Link, useLocation } from "react-router"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { House, Wallet, ArrowLeftRight, LayoutGrid } from "lucide-react"

const mainNavItems = [
  { title: "Tổng quan", url: "/", icon: House },
  { title: "Ví của tôi", url: "/wallets", icon: Wallet },
  { title: "Giao dịch", url: "/transactions", icon: ArrowLeftRight },
  { title: "Danh mục", url: "/categories", icon: LayoutGrid },
]
const sidebarMainMenu = () => {
    const location = useLocation()
  return (
    <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-bold text-slate-400 tracking-wider uppercase px-2">
            Không gian của bạn
          </SidebarGroupLabel>
          <SidebarMenu className="mt-1 space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location.pathname === "/"}
                className={
                  location.pathname === "/"
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                }
              >
                <House className="h-4 w-4" />
                <Link to="/" className="flex-1">
                  Tổng quan
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location.pathname === "/wallets"}
                className={
                  location.pathname === "/wallets"
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                }
              >
                <Wallet className="h-4 w-4" />
                <Link to="/wallets" className="flex-1">
                  Ví của tôi
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location.pathname === "/transactions"}
                className={
                  location.pathname === "/transactions"
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                }
              >
                <ArrowLeftRight className="h-4 w-4" />
                <Link to="/transactions" className="flex-1">
                  Giao dịch
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location.pathname === "/categories"}
                className={
                  location.pathname === "/categories"
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                }
              >
                <LayoutGrid className="h-4 w-4" />
                <Link to="/categories" className="flex-1">
                  Danh mục
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
  )
}

export default sidebarMainMenu
