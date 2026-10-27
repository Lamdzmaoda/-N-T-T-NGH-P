import { ArrowRight, Sparkles } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router'

const sidebarTipCard = () => {
  return (
    <div className="mx-2 mt-auto rounded-2xl bg-blue-50/80 border border-blue-100/80 p-3.5 group-data-[collapsible=icon]:hidden">
      <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
        <Sparkles className="h-3.5 w-3.5 text-blue-600" />
        <span>Mẹo tài chính</span>
      </div>
      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
        Bạn đã tiết kiệm tốt hơn 12% so với tháng trước!
      </p>
      <Link
        to="/reports"
        className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 mt-2 flex items-center gap-1 transition"
      >
        <span>Xem phân tích</span>
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}

export default sidebarTipCard
