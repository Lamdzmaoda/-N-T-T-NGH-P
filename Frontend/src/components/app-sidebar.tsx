"use client";

import * as React from "react";

import { Link, useLocation } from "react-router"; // hoặc "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  House, // Tổng quan
  Wallet, // Ví của tôi
  ArrowLeftRight, // Giao dịch
  LayoutGrid, // Danh mục
  Target, // Ngân sách
  PiggyBank, // Tiết kiệm & Sổ nợ
  BarChart3, // Báo cáo
  Sparkles,
  ArrowRight, // Trợ lý PFT AI
} from "lucide-react";
import SidebarBrand from "./sidebar/sidebarBrand";
import SidebarTipCard from "./sidebar/sidebarTipCard";
import SidebarMainMenu from "./sidebar/sidebarMainMenu";
import SidebarProjectMenu from "./sidebar/sidebarProjectMenu";


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation(); // Lấy đường dẫn URL hiện tại (VD: "/", "/wallets",...)
  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="border-r border-slate-200/80 bg-white"
    >
      {/* 1. Header: Logo PFT */}
      <SidebarBrand/>
      {/* 2. Menu Content */}
      <SidebarContent className="px-2 py-3 space-y-4">
        {/* Nhóm 1: KHÔNG GIAN CỦA BẠN */}
        <SidebarMainMenu/>

        {/* Nhóm 2: KẾ HOẠCH & PHÂN TÍCH */}
        <SidebarProjectMenu/>
        {/* Card dưới cùng: Mẹo tài chính (Chuẩn Figma) */}
        <SidebarTipCard/>
      </SidebarContent>
      {/* 3. Footer: User Profile */}
      <SidebarFooter className="border-t border-slate-100 p-2">
        {/* <NavUser user={userData} /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
