
import { SidebarHeader } from '../ui/sidebar'
import { BarChart3 } from 'lucide-react'

const sidebarBrand = () => {
  return (
    <SidebarHeader className="p-3 border-b border-slate-100 flex items-center justify-center group-data-[collapsible=icon]:p-2 transition-all">
        <div className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
          <BarChart3 className="h-5 w-5" />
        </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-base font-black tracking-wider text-slate-900 leading-tight">
              PFT
            </span>
            <span className="text-[9px] font-bold text-blue-600 tracking-widest uppercase">
              SMART FINANCE
            </span>
          </div>
        </div>
      </SidebarHeader>
  )
}

export default sidebarBrand
