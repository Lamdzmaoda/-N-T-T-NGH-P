import api from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { toast } from "sonner";
import { SidebarInset } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DashboardGreeting from "@/components/layout/DashboardGreeting";
import StatCards from "@/components/dashboard/StatCards";
import CashFlowChart from "@/components/dashboard/CashFlowChart";
import ExpenseStructureChart from "@/components/dashboard/ExpenseStructureChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import BudgetProgress from "@/components/dashboard/BudgetProgress";

const HomePage = () => {
  return (
    <SidebarProvider>
      {/* 1. Thanh Sidebar bên trái */}
      <AppSidebar />
      {/* 2. Toàn bộ phần nội dung bên phải (Header + Ruột trang) */}
      <SidebarInset className="bg-slate-50/60">
        {/* Top Header */}
        <DashboardHeader />
        <main className="flex-1 p-6 lg:p-8 space-y-6">
          <DashboardGreeting />
          <StatCards />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <CashFlowChart />
            <ExpenseStructureChart />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <RecentTransactions />
            <BudgetProgress />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default HomePage;
