import { Link, useLocation } from "react-router"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Target, PiggyBank, BarChart3, Sparkles } from "lucide-react"

const projectNavItems = [
  { title: "Ngân sách", url: "/budgets", icon: Target },
  { title: "Tiết kiệm & Sổ nợ", url: "/savings", icon: PiggyBank },
  { title: "Báo cáo", url: "/reports", icon: BarChart3 },
  { title: "Trợ lý PFT AI", url: "/ai-assistant", icon: Sparkles, badge: "AI" },
]
const sidebarProjectMenu = () => {
    const location = useLocation()
  return (
    <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-bold text-slate-400 tracking-wider uppercase px-2">
            Kế hoạch & Phân tích
          </SidebarGroupLabel>
          <SidebarMenu className="mt-1 space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location.pathname === "/budgets"}
                className={
                  location.pathname === "/budgets"
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                }
              >
                <Target className="h-4 w-4 text-slate-500" />
                <Link to="/budgets" className="flex-1">
                  Ngân sách
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location.pathname === "/savings"}
                className={
                  location.pathname === "/savings"
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                }
              >
                <PiggyBank className="h-4 w-4 text-slate-500" />
                <Link to="/savings" className="flex-1">
                  Tiết kiệm & Sổ nợ
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location.pathname === "/reports"}
                className={
                  location.pathname === "/reports"
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                }
              >
                <BarChart3 className="h-4 w-4 text-slate-500" />
                <Link to="/reports" className="flex-1">
                  Báo cáo
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location.pathname === "/ai-assistant"}
                className={
                  location.pathname === "/ai-assistant"
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                }
              >
                <Sparkles className="h-4 w-4 text-purple-600" />
                <Link to="/ai-assistant" className="flex-1">
                  Trợ lý PFT AI
                </Link>
                <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[9px] font-bold text-purple-700">
                  AI
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
  )
}

export default sidebarProjectMenu
