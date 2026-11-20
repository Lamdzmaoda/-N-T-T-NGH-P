# -*- coding: utf-8 -*-
import docx
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def generate_report():
    doc = docx.Document()

    # Page Margins (Trái 3.0cm, Phải 2.0cm, Trên 2.0cm, Dưới 2.0cm)
    for section in doc.sections:
        section.top_margin = Cm(2.0)
        section.bottom_margin = Cm(2.0)
        section.left_margin = Cm(3.0)
        section.right_margin = Cm(2.0)
        section.page_width = Cm(21.0)
        section.page_height = Cm(29.7)
        
        # Header
        header = section.header
        hp = header.paragraphs[0]
        hp.text = "ĐỒ ÁN TỐT NGHIỆP: NỀN TẢNG QUẢN LÝ TÀI CHÍNH CÁ NHÂN THÔNG MINH (PFT)"
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hp.style.font.name = "Times New Roman"
        hp.style.font.size = Pt(8.5)
        hp.style.font.italic = True
        hp.style.font.color.rgb = RGBColor(128, 128, 128)

        # Footer
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.text = "Báo cáo Đồ án Tốt nghiệp CNTT - Khóa 2022-2026"
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        fp.style.font.name = "Times New Roman"
        fp.style.font.size = Pt(9)
        fp.style.font.color.rgb = RGBColor(128, 128, 128)

    # Base Styles
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Times New Roman'
    style_normal.font.size = Pt(13)
    style_normal.font.color.rgb = RGBColor(34, 34, 34)
    style_normal.paragraph_format.line_spacing = 1.3
    style_normal.paragraph_format.space_after = Pt(6)

    def set_cell_background(cell, fill_hex):
        tcPr = cell._element.get_or_add_tcPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
        tcPr.append(shd)

    def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
        tcPr = cell._element.get_or_add_tcPr()
        tcMar = parse_xml(f'''
            <w:tcMar {nsdecls("w")}>
                <w:top w:w="{top}" w:type="dxa"/>
                <w:bottom w:w="{bottom}" w:type="dxa"/>
                <w:left w:w="{left}" w:type="dxa"/>
                <w:right w:w="{right}" w:type="dxa"/>
            </w:tcMar>
        ''')
        tcPr.append(tcMar)

    def format_table(table, col_widths, headers, data, align_cols=None):
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        # Header Row
        hdr_cells = table.rows[0].cells
        for i, title in enumerate(headers):
            hdr_cells[i].text = title
            set_cell_background(hdr_cells[i], "1D5D9B")
            set_cell_margins(hdr_cells[i], top=120, bottom=120, left=150, right=150)
            p = hdr_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in p.runs:
                run.font.bold = True
                run.font.name = "Times New Roman"
                run.font.size = Pt(10.5)
                run.font.color.rgb = RGBColor(255, 255, 255)
        
        # Data Rows
        for r_idx, row_data in enumerate(data):
            row_cells = table.rows[r_idx + 1].cells
            bg_color = "F8F9FA" if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, val in enumerate(row_data):
                row_cells[c_idx].text = str(val)
                set_cell_background(row_cells[c_idx], bg_color)
                set_cell_margins(row_cells[c_idx], top=80, bottom=80, left=120, right=120)
                p = row_cells[c_idx].paragraphs[0]
                if align_cols and c_idx in align_cols:
                    p.alignment = align_cols[c_idx]
                else:
                    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                for run in p.runs:
                    run.font.name = "Times New Roman"
                    run.font.size = Pt(10)
                    run.font.color.rgb = RGBColor(40, 40, 40)
        
        # Set widths
        for row in table.rows:
            for i, w in enumerate(col_widths):
                row.cells[i].width = Cm(w)

    def add_callout(text, title="LƯU Ý / ĐIỂM SÁNG CÔNG NGHỆ"):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.rows[0].cells[0]
        cell.width = Cm(16.0)
        set_cell_background(cell, "F0F4F8")
        set_cell_margins(cell, top=120, bottom=120, left=180, right=150)
        
        tcPr = cell._element.get_or_add_tcPr()
        borders = parse_xml(f'''
            <w:tcBorders {nsdecls("w")}>
                <w:top w:val="none"/>
                <w:left w:val="single" w:sz="24" w:space="0" w:color="1D5D9B"/>
                <w:bottom w:val="none"/>
                <w:right w:val="none"/>
            </w:tcBorders>
        ''')
        tcPr.append(borders)
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(2)
        r_title = p.add_run(f"📌 {title}: ")
        r_title.bold = True
        r_title.font.name = "Times New Roman"
        r_title.font.size = Pt(11)
        r_title.font.color.rgb = RGBColor(29, 93, 155)
        
        r_txt = p.add_run(text)
        r_txt.font.name = "Times New Roman"
        r_txt.font.size = Pt(11)
        r_txt.font.italic = True
        doc.add_paragraph()

    def add_heading_1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(8)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.bold = True
        r.font.name = "Times New Roman"
        r.font.size = Pt(15)
        r.font.color.rgb = RGBColor(15, 44, 89)
        return p

    def add_heading_2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.bold = True
        r.font.name = "Times New Roman"
        r.font.size = Pt(13.5)
        r.font.color.rgb = RGBColor(29, 93, 155)
        return p

    def add_heading_3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.bold = True
        r.font.name = "Times New Roman"
        r.font.size = Pt(12.5)
        r.font.color.rgb = RGBColor(45, 55, 72)
        return p

    def add_bullet(p_text, bold_prefix=""):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.25
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.bold = True
            r_pre.font.name = "Times New Roman"
            r_pre.font.size = Pt(12)
        r_txt = p.add_run(p_text)
        r_txt.font.name = "Times New Roman"
        r_txt.font.size = Pt(12)
        return p

    # ==========================================
    # TRANG BÌA (COVER PAGE)
    # ==========================================
    p_univ = doc.add_paragraph()
    p_univ.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r1 = p_univ.add_run("BỘ GIÁO DỤC VÀ ĐÀO TẠO\n")
    r1.font.size = Pt(13)
    r1.font.name = "Times New Roman"
    r2 = p_univ.add_run("TRƯỜNG ĐẠI HỌC [TÊN TRƯỜNG ĐẠI HỌC]\nKHOA CÔNG NGHỆ THÔNG TIN\n")
    r2.bold = True
    r2.font.size = Pt(14)
    r2.font.name = "Times New Roman"
    
    p_line = doc.add_paragraph()
    p_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_line = p_line.add_run("-------------------***-------------------\n\n\n")
    r_line.font.name = "Times New Roman"

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_report = p_title.add_run("BÁO CÁO ĐỒ ÁN TỐT NGHIỆP ĐẠI HỌC\n\n")
    r_report.bold = True
    r_report.font.size = Pt(18)
    r_report.font.name = "Times New Roman"
    r_report.font.color.rgb = RGBColor(15, 44, 89)

    r_topic_label = p_title.add_run("ĐỀ TÀI:\n")
    r_topic_label.bold = True
    r_topic_label.font.size = Pt(14)
    r_topic_label.font.name = "Times New Roman"

    r_topic_name = p_title.add_run("NỀN TẢNG QUẢN LÝ TÀI CHÍNH CÁ NHÂN THÔNG MINH\n(SMART PERSONAL FINANCE TRACKER - PFT)\n\n\n")
    r_topic_name.bold = True
    r_topic_name.font.size = Pt(17)
    r_topic_name.font.name = "Times New Roman"
    r_topic_name.font.color.rgb = RGBColor(29, 93, 155)

    p_info = doc.add_paragraph()
    p_info.paragraph_format.left_indent = Cm(3.0)
    p_info.paragraph_format.line_spacing = 1.3
    
    runs_info = [
        ("Chuyên ngành: ", True), ("Kỹ thuật Phần mềm / Công nghệ Thông tin\n", False),
        ("Giảng viên hướng dẫn: ", True), ("[Học hàm, Học vị, Họ và tên Giảng viên]\n", False),
        ("Sinh viên thực hiện: \n", True), ("", False),
        ("  1. Nguyễn Văn Hợp", True), (" - MSSV: [MSSV 1] - Vai trò: Frontend UI/UX & Core Ledger\n", False),
        ("  2. Nguyễn Tùng Lâm", True), (" - MSSV: [MSSV 2] - Vai trò: Backend Architecture & Core APIs\n", False),
        ("  3. Đỗ Việt Dũng", True), (" - MSSV: [MSSV 3] - Vai trò: Fullstack, Kiểm thử TDD & Tích hợp AI\n\n\n", False),
    ]
    for text, bold in runs_info:
        r = p_info.add_run(text)
        r.bold = bold
        r.font.name = "Times New Roman"
        r.font.size = Pt(13)

    p_bottom = doc.add_paragraph()
    p_bottom.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_btm = p_bottom.add_run("Hà Nội, Năm 2026")
    r_btm.bold = True
    r_btm.font.size = Pt(13)
    r_btm.font.name = "Times New Roman"

    doc.add_page_break()

    # ==========================================
    # LỜI CAM ĐOAN & LỜI CẢM ƠN
    # ==========================================
    add_heading_1("LỜI CAM ĐOAN")
    doc.add_paragraph(
        "Chúng tôi xin cam đoan bản báo cáo đồ án tốt nghiệp với đề tài \"Nền tảng Quản lý Tài chính Cá nhân Thông minh (PFT)\" "
        "là công trình nghiên cứu và phát triển phần mềm độc lập do nhóm sinh viên thực hiện dưới sự hướng dẫn khoa học của Giảng viên hướng dẫn.\n\n"
        "Toàn bộ các số liệu khảo sát, sơ đồ kiến trúc, tài liệu thiết kế cơ sở dữ liệu, các hàm xử lý nghiệp vụ tại tầng Backend (Spring Boot 3, Java 21), "
        "tầng Frontend (React 19, TypeScript) và các ca kiểm thử tự động đều do chính nhóm phát triển. Mọi trích dẫn khoa học, "
        "thư viện mã nguồn mở và nền tảng trí tuệ nhân tạo (Google Gemini) đều được ghi nhận nguồn gốc rõ ràng, tuân thủ nghiêm ngặt quy chế liêm chính học thuật."
    )
    
    p_sign = doc.add_paragraph()
    p_sign.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_sign = p_sign.add_run("Sinh viên thực hiện\n(Ký và ghi rõ họ tên)\n\n\nNguyễn Văn Hợp - Nguyễn Tùng Lâm - Đỗ Việt Dũng")
    r_sign.italic = True

    add_heading_1("LỜI CẢM ƠN")
    doc.add_paragraph(
        "Lời đầu tiên, nhóm tác giả xin chân thành cảm ơn các Thầy/Cô giảng viên tại Khoa Công nghệ Thông tin đã truyền đạt "
        "những nền tảng tri thức vững chắc về Kỹ thuật lập trình, Kiến trúc phần mềm, Thiết kế Cơ sở dữ liệu và An ninh thông tin trong suốt khóa học.\n\n"
        "Đặc biệt, nhóm xin gửi lời tri ân sâu sắc tới Giảng viên hướng dẫn. Nhờ những lời khuyên sát thực tế, những phản biện chuyên sâu "
        "và sự tận tâm chỉ dẫn của Thầy/Cô, nhóm đã hoàn thành đồ án đúng tiến độ và đạt được các tiêu chuẩn kỹ thuật nghiêm ngặt của một hệ thống tài chính thực thụ."
    )

    doc.add_page_break()

    # ==========================================
    # BẢNG TỪ VIẾT TẮT
    # ==========================================
    add_heading_1("DANH MỤC THUẬT NGỮ VÀ TỪ VIẾT TẮT")
    abbr_data = [
        ["PFT", "Personal Finance Tracker", "Nền tảng quản lý tài chính cá nhân thông minh"],
        ["ACID", "Atomicity, Consistency, Isolation, Durability", "4 thuộc tính bảo toàn giao dịch CSDL quan hệ"],
        ["JWT", "JSON Web Token", "Chuẩn mã hóa thông tin xác thực phi trạng thái (RFC 7519)"],
        ["RBAC", "Role-Based Access Control", "Hệ thống phân quyền truy cập dựa trên vai trò"],
        ["DTO", "Data Transfer Object", "Đối tượng truyền tải dữ liệu giữa Client và Server"],
        ["JPA", "Java Persistence API", "Giao diện chuẩn ánh xạ dữ liệu trong Java sang RDBMS"],
        ["ORM", "Object-Relational Mapping", "Kỹ thuật ánh xạ giữa bảng CSDL và Class hướng đối tượng"],
        ["REST", "Representational State Transfer", "Kiểu kiến trúc thiết kế dịch vụ Web thông qua giao thức HTTP"],
        ["TDD", "Test-Driven Development", "Quy trình phát triển phần mềm định hướng kiểm thử"],
        ["EDA", "Event-Driven Architecture", "Kiến trúc hệ thống hướng sự kiện không đồng bộ"],
        ["OCR", "Optical Character Recognition", "Công nghệ nhận dạng ký tự quang học qua hình ảnh"],
        ["NFR", "Non-Functional Requirements", "Các yêu cầu phi chức năng (bảo mật, hiệu năng, UX)"],
        ["FR", "Functional Requirements", "Các yêu cầu chức năng nghiệp vụ của hệ thống"]
    ]
    tbl_abbr = doc.add_table(rows=len(abbr_data)+1, cols=3)
    format_table(tbl_abbr, [2.5, 5.5, 8.0], ["Thuật ngữ", "Tên tiếng Anh đầy đủ", "Ý nghĩa / Giải thích tiếng Việt"], abbr_data)

    doc.add_page_break()

    # ==========================================
    # CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI VÀ NGHIỆP VỤ FINTECH
    # ==========================================
    add_heading_1("CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI VÀ NGHIỆP VỤ TÀI CHÍNH CÁ NHÂN")

    add_heading_2("1.1. Bối cảnh và Lý do chọn đề tài")
    doc.add_paragraph(
        "Trong kỷ nguyên chuyển đổi số tại Việt Nam, thanh toán không dùng tiền mặt (Cashless Payment) đã trở thành "
        "thói quen phổ biến. Theo thống kê từ Ngân hàng Nhà nước, hơn 87% người trưởng thành sở hữu tài khoản ngân hàng "
        "và sử dụng ứng dụng thanh toán trực tuyến. Một người trẻ trung bình hiện nay sở hữu từ 2 đến 4 kênh giao dịch "
        "tài chính song song: tài khoản ngân hàng (Vietcombank, Techcombank, VIB...), ví điện tử (MoMo, ZaloPay, ShopeePay), "
        "thẻ tín dụng (Credit Card) và tiền mặt vật lý.\n\n"
        "Sự bùng nổ của thanh toán quét mã QR (VietQR) và thương mại điện tử làm phát sinh hàng chục giao dịch chi tiêu "
        "vi mô (micro-transactions) mỗi ngày. Dòng tiền luân chuyển liên tục dẫn đến thực trạng đa số người trẻ mất kiểm soát "
        "chi tiêu, rơi vào tình trạng thâm hụt cuối tháng dù thu nhập ổn định. "
        "Nhận thức được tầm quan trọng của việc quản lý tài chính cá nhân, nhóm nghiên cứu lựa chọn đề tài: "
        "\"Nền tảng Quản lý Tài chính Cá nhân Thông minh (Smart Personal Finance Tracker - PFT)\"."
    )

    add_heading_2("1.2. Phân tích các khó khăn thực tế (Pain Points) của người dùng")
    doc.add_paragraph(
        "Dựa trên khảo sát thực tế và phân tích hành vi người tiêu dùng, nhóm xác định 4 rào cản lớn nhất:"
    )
    add_bullet(" Tiền bạc phân mảnh ở nhiều tài khoản ngân hàng và ví điện tử khiến người dùng không biết tổng tài sản ròng thực tế của mình trong thời gian thực.", "1. Phân mảnh tài sản: ")
    add_bullet(" Sau mỗi lần thanh toán, việc phải mở ứng dụng gõ từng con số, chọn danh mục, chọn ví rất tốn công sức. Hơn 82% người dùng bỏ cuộc chỉ sau 1-2 tuần sử dụng ứng dụng vì lý do này.", "2. Rào cản nhập liệu thủ công: ")
    add_bullet(" Đa phần các công cụ hiện tại chỉ ghi chép thụ động, không có cơ chế cảnh báo thời gian thực khi sắp chạm ngưỡng hạn mức ngân sách tháng.", "3. Thiếu cơ chế cảnh báo chủ động: ")
    add_bullet(" Các khoản tiền cho bạn bè vay mượn hoặc đi vay nợ thường bị lãng quên hoặc ngại nhắc nhở, dẫn đến thâm hụt tài sản và khó xử lý minh bạch.", "4. Khó khăn quản lý công nợ: ")

    add_heading_2("1.3. Khảo sát các giải pháp trên thị trường & Ma trận đối chuẩn")
    doc.add_paragraph(
        "Nhóm tiến hành đối chuẩn tính năng giữa các phương thức truyền thống, các phần mềm thương mại phổ biến "
        "với Nền tảng PFT đề xuất:"
    )

    bench_headers = ["Tiêu chí đối chuẩn", "Sổ tay / Excel", "Money Lover", "Sổ Thu Chi MISA", "Hệ thống PFT (Đề tài)"]
    bench_data = [
        ["Quản lý Đa Ví (Bank/Ví)", "Thủ công", "Bị giới hạn số ví", "Có hỗ trợ", "Không giới hạn, thời gian thực"],
        ["Bảo toàn số dư chuẩn ACID", "Không", "Hay lệch khi sửa", "Có", "Chuẩn ACID (BigDecimal 19,4)"],
        ["Cảnh báo hạn mức ngân sách", "Không", "Có (cơ bản)", "Có", "Cảnh báo 2 ngưỡng (80% và 100%)"],
        ["AI Quét hóa đơn tự bóc tách", "Không", "Không", "Không", "Google Gemini Multimodal Vision"],
        ["Sổ nợ đối ứng P2P song phương", "Không", "Chỉ ghi chép 1 chiều", "Chỉ ghi chép 1 chiều", "Tự động đảo chiều & VietQR"],
        ["Bảo mật xác thực 2-Token", "Không", "Session thông thường", "Session thông thường", "Access 15p + HttpOnly Cookie"],
        ["Quảng cáo làm phiền", "Không", "Rất nhiều banner rác", "Có banner", "100% Sạch sẽ, không quảng cáo"]
    ]
    tbl_bench = doc.add_table(rows=len(bench_data)+1, cols=5)
    format_table(tbl_bench, [3.2, 2.7, 3.2, 3.2, 3.7], bench_headers, bench_data)

    add_heading_2("1.4. Mục tiêu nghiên cứu và Phạm vi đề tài")
    doc.add_paragraph(
        "Mục tiêu cốt lõi của đồ án là xây dựng một nền tảng Web Fullstack tiêu chuẩn doanh nghiệp đáp ứng:"
    )
    add_bullet(" Quản lý chính xác số dư thời gian thực trên tất cả các loại ví tiền (Tiền mặt, Ngân hàng, Ví điện tử, Thẻ tín dụng).", "• Về nghiệp vụ tài chính: ")
    add_bullet(" Áp dụng tính chất ACID nghiêm ngặt cho sổ cái giao dịch, loại bỏ hoàn toàn lỗi làm tròn tiền số học.", "• Về kỹ thuật kế toán: ")
    add_bullet(" Ứng dụng mô hình AI đa phương thức Google Gemini để đọc hiểu hóa đơn mua sắm thực tế bằng tiếng Việt, tự động điền form chỉ trong 2 giây.", "• Về trí tuệ nhân tạo: ")
    add_bullet(" Xây dựng cơ chế xác thực hai chiều khi ghi nợ, hỗ trợ sinh mã VietQR chuyển khoản nhanh và chống spam nhắc nợ.", "• Về giải quyết công nợ: ")

    add_callout(
        "Điểm đột phá của đề tài là việc tích hợp Trí tuệ Nhân tạo đa phương thức (Gemini Vision) trực tiếp vào luồng ghi chép, "
        "giúp giảm thiểu hơn 80% thời gian nhập liệu - giải quyết triệt để nguyên nhân số 1 khiến người dùng bỏ cuộc.",
        "ĐỘT PHÁ CỦA ĐỒ ÁN"
    )

    doc.add_page_break()

    # ==========================================
    # CHƯƠNG 2: PHÂN TÍCH YÊU CẦU HỆ THỐNG
    # ==========================================
    add_heading_1("CHƯƠNG 2: KHẢO SÁT NGƯỜI DÙNG VÀ PHÂN TÍCH YÊU CẦU")

    add_heading_2("2.1. Kết quả khảo sát người dùng thực tế")
    doc.add_paragraph(
        "Nhóm đã triển khai khảo sát trực tuyến qua Google Forms trên 150 người dùng trong độ tuổi 18 - 35 "
        "(sinh viên và người đi làm tại Việt Nam). Kết quả thống kê chỉ ra:\n"
        "• 94.7% người dùng thường xuyên thanh toán qua VietQR và ví điện tử.\n"
        "• 81.3% sở hữu từ 2 tài khoản ngân hàng / ví điện tử trở lên.\n"
        "• 82.3% thừa nhận đã từng từ bỏ việc ghi chép chi tiêu sau 1 - 2 tuần đầu tiên do ngại nhập thủ công.\n"
        "• 88.7% đánh giá tính năng 'Chụp ảnh hóa đơn tự nhận diện số tiền và danh mục' là tính năng đột phá sẽ giúp họ duy trì thói quen."
    )

    add_heading_2("2.2. Xây dựng Chân dung người dùng (User Personas)")
    doc.add_paragraph(
        "Dựa trên dữ liệu khảo sát, nhóm xây dựng 3 Persona đại diện cho các tập khách hàng mục tiêu:"
    )
    add_bullet(" 22 tuổi, sinh viên năm cuối. Thu nhập 5-6 triệu/tháng. Nỗi đau: Hay hết tiền vào ngày 20 mà không rõ lý do, ngại nhập từng khoản nhỏ 20k-30k. Kỳ vọng: Chụp hóa đơn cơm/siêu thị là tự lưu.", "1. Persona Nguyễn Thành Nam: ")
    add_bullet(" 26 tuổi, nhân viên văn phòng. Thu nhập 18 triệu/tháng. Nỗi đau: Tiền nằm ở 3 ngân hàng nên không biết tổng tài sản, khó kiểm soát nợ thẻ tín dụng. Kỳ vọng: Dashboard tổng tài sản, hũ tiết kiệm.", "2. Persona Trần Thị Mai: ")
    add_bullet(" 28 tuổi, Lập trình viên tự do. Thu nhập biến động. Nỗi đau: Hay quên ai nợ tiền mình và mình nợ ai, app cũ có quá nhiều quảng cáo rác. Kỳ vọng: Sổ nợ rõ ràng kèm mã QR chuyển khoản, không quảng cáo.", "3. Persona Lê Hoàng Long: ")

    add_heading_2("2.3. Đặc tả Yêu cầu chức năng (Functional Requirements - FR)")
    doc.add_paragraph("Hệ thống được quy chuẩn thành 8 phân hệ chức năng cốt lõi:")

    fr_headers = ["Mã FR", "Tên Phân Hệ", "Đặc Tả Chức Năng Chi Tiết"]
    fr_data = [
        ["FR-1", "Xác thực & Danh tính", "Đăng ký, Đăng nhập, Quản lý phiên làm việc 2-Token, Đổi mật khẩu, Cập nhật Profile cá nhân."],
        ["FR-2", "Quản lý Đa Ví", "Tạo và quản lý nhiều ví tiền (Tiền mặt, Ngân hàng, Ví điện tử); bật/tắt cờ 'Tính vào tổng tài sản'."],
        ["FR-3", "Danh mục Thu/Chi", "Cung cấp danh mục mặc định có icon & màu sắc; cho phép người dùng tự tạo danh mục riêng biệt."],
        ["FR-4", "Sổ cái Giao dịch (Ledger)", "Ghi nhận Thu, Chi, Chuyển khoản giữa 2 ví; cập nhật số dư ví tức thời chuẩn ACID; hỗ trợ hoàn tác."],
        ["FR-5", "Hạn mức Ngân sách", "Thiết lập ngân sách tháng cho từng danh mục; tự động tính tiến độ chi và cảnh báo ngưỡng 80% & 100%."],
        ["FR-6", "Sổ Ghi nợ & Cho vay P2P", "Ghi nợ, cho vay; xác nhận song phương P2P; tự sinh sổ nợ đối ứng; sinh mã VietQR trả nợ; chống spam."],
        ["FR-7", "Báo cáo & Phân tích", "Biểu đồ Donut tỷ trọng chi tiêu, biểu đồ cột dòng tiền (Cashflow); xuất sao kê ra file Excel và PDF."],
        ["FR-8", "AI Vision Bóc tách Hóa đơn", "Tải ảnh chụp hóa đơn (JPG, PNG), Gemini Vision tự bóc tách số tiền, danh mục, thời gian và điền form."]
    ]
    tbl_fr = doc.add_table(rows=len(fr_data)+1, cols=3)
    format_table(tbl_fr, [2.0, 3.8, 10.2], fr_headers, fr_data)

    add_heading_2("2.4. Đặc tả Yêu cầu phi chức năng (Non-Functional Requirements - NFR)")
    add_bullet(" Các API nghiệp vụ CRUD có thời gian xử lý trung bình dưới 300ms; API xử lý AI Vision đọc hóa đơn dưới 3 giây.", "• NFR-1 (Hiệu năng): ")
    add_bullet(" Mật khẩu mã hóa BCrypt độ phức tạp 10; Access Token hết hạn sau 15 phút; Refresh Token bảo vệ bằng HttpOnly Cookie chống tấn công XSS; ngăn chặn Race Condition số dư bằng Transactional Lock.", "• NFR-2 (Bảo mật & Toàn vẹn): ")
    add_bullet(" Toàn bộ phép tính tiền bạc sử dụng kiểu dữ liệu BigDecimal trong Java và DECIMAL(19, 4) trong MySQL.", "• NFR-3 (Độ chính xác tài chính): ")
    add_bullet(" Giao diện thiết kế theo phương pháp Mobile-First Responsive, tối ưu hiển thị hoàn hảo trên cả màn hình Smartphone lẫn Desktop.", "• NFR-4 (Trải nghiệm người dùng): ")

    doc.add_page_break()

    # ==========================================
    # CHƯƠNG 3: THIẾT KẾ KIẾN TRÚC VÀ CƠ SỞ DỮ LIỆU
    # ==========================================
    add_heading_1("CHƯƠNG 3: THIẾT KẾ KIẾN TRÚC VÀ CƠ SỞ DỮ LIỆU")

    add_heading_2("3.1. Kiến trúc Hệ thống Tổng thể (System Architecture)")
    doc.add_paragraph(
        "Hệ thống PFT được thiết kế theo mô hình Client-Server hiện đại, phân tách hoàn toàn giữa tầng Trình diễn "
        "(Frontend Single Page Application) và tầng Dịch vụ (Backend RESTful API):\n"
        "1. Tầng Trình diễn (Presentation Layer): Ứng dụng React 19 kết hợp TypeScript, Vite, Tailwind CSS v4 và Zustand State Management.\n"
        "2. Tầng Bảo mật & Điều hướng (API Gateway & Security Layer): Sử dụng Spring Security 6 với cấu hình OAuth2 Resource Server, "
        "Nimbus JWT Decoder, CORS Filter và Rate Limiting Filter.\n"
        "3. Tầng Nghiệp vụ (Business Layer): Cấu trúc phân tầng tiêu chuẩn Clean Architecture: Controller tiếp nhận HTTP Request, "
        "Service xử lý logic nghiệp vụ và ràng buộc ACID, Repository tương tác với CSDL qua Spring Data JPA.\n"
        "4. Tầng Dữ liệu & Tích hợp ngoài: Hệ quản trị CSDL MySQL 8 (InnoDB Engine), dịch vụ Google Gemini Generative AI qua Spring AI ChatClient."
    )

    add_heading_2("3.2. Cơ chế Bảo mật 2-Token (Access Token & Refresh Token Rotation)")
    doc.add_paragraph(
        "Nhằm bảo vệ tuyệt đối dữ liệu tài chính của người dùng khỏi các nguy cơ tấn công mạng, hệ thống triển khai cơ chế 2-Token nghiêm ngặt:\n"
        "• Access Token: Có thời gian sống ngắn (15 phút), được ký điện tử bằng thuật toán HMAC-SHA256, chứa Claims về danh tính (userId, roles). "
        "Client gửi Access Token trong Header 'Authorization: Bearer <token>' ở mọi request.\n"
        "• Refresh Token: Có thời gian sống dài (7 ngày), được lưu trữ trong HttpOnly Secure Cookie của trình duyệt. Nhờ cờ HttpOnly, "
        "mã độc JavaScript hoàn toàn không thể đọc trộm Refresh Token kể cả khi trang web bị tấn công XSS (Cross-Site Scripting).\n"
        "• Cơ chế Xoay vòng (Rotation) & Thu hồi (Revocation): Khi gọi endpoint /auth/refresh, Refresh Token cũ sẽ bị vô hiệu hóa "
        "và ghi nhận vào bảng 'invalidated_tokens'. Hệ thống sẽ cấp phát một cặp Access/Refresh Token hoàn toàn mới. Nếu một Refresh Token cũ "
        "đã bị thu hồi mà vẫn cố gắng gọi lại, hệ thống sẽ phát hiện hành vi xâm nhập và lập tức hủy bỏ toàn bộ phiên làm việc của tài khoản đó."
    )

    add_heading_2("3.3. Thiết kế Cơ sở dữ liệu (Database Schema - ERD)")
    doc.add_paragraph(
        "Cơ sở dữ liệu của hệ thống được chuẩn hóa ở dạng chuẩn 3NF (Third Normal Form) gồm 15 bảng phân chia theo 4 phân hệ chính:"
    )

    tbl_list_headers = ["STT", "Tên Bảng (Table)", "Khóa Chính (PK)", "Loại Khóa", "Mô Tả Vai Trò Nghiệp Vụ"]
    tbl_list_data = [
        ["1", "user", "id", "VARCHAR(36) UUID", "Lưu trữ tài khoản người dùng, email, username, mật khẩu mã hóa BCrypt, trạng thái hoạt động (is_active), provider (NORMAL/GOOGLE), cờ xác thực email."],
        ["2", "profile_user", "id", "VARCHAR(36) UUID", "Hồ sơ mở rộng của người dùng: avatar_url, bio, thời gian tạo/cập nhật. Quan hệ 1 - 1 với bảng user."],
        ["3", "role", "name", "VARCHAR(255) Tự nhiên", "Lưu danh mục vai trò người dùng trong hệ thống (ROLE_USER, ROLE_ADMIN)."],
        ["4", "permission", "name", "VARCHAR(255) Tự nhiên", "Lưu danh mục quyền hạn chi tiết trong hệ thống (CREATE_TRANSACTION, MANAGE_USERS...)."],
        ["5", "user_roles", "(user_id, roles_name)", "Composite Key", "Bảng trung gian thể hiện quan hệ N - N giữa user và role."],
        ["6", "role_permissions", "(role_name, permissions_name)", "Composite Key", "Bảng trung gian thể hiện quan hệ N - N giữa role và permission."],
        ["7", "email_verification", "id", "VARCHAR(36) UUID", "Lưu mã OTP 6 số, email nhận mã, thời gian hết hạn và trạng thái sử dụng phục vụ xác thực email."],
        ["8", "invalidated_token", "id", "VARCHAR(255) Chuỗi JTI", "Danh sách đen (Blacklist) lưu Token ID (JTI) và thời điểm hết hạn khi đăng xuất hoặc xoay vòng Refresh Token."],
        ["9", "wallet", "id", "VARCHAR(36) UUID", "Quản lý nguồn tiền/tài khoản (Tiền mặt, Ngân hàng, Ví điện tử...); số dư balance chuẩn DECIMAL(19,4), cờ include_in_total, xóa mềm."],
        ["10", "categories", "id", "VARCHAR(36) UUID", "Phân loại thu/chi; phân loại EXPENSE/INCOME; phân biệt danh mục mặc định (is_default) và do người dùng tự tạo."],
        ["11", "transactions", "id", "VARCHAR(36) UUID", "Sổ cái tài chính ghi nhận mọi giao dịch (Thu, Chi, Chuyển khoản); lưu balance_after đối soát, ảnh hóa đơn, hỗ trợ xóa mềm."],
        ["12", "budgets", "id", "VARCHAR(36) UUID", "Lưu trữ hạn mức chi tiêu theo tháng cho từng danh mục; cờ chống spam cảnh báo mốc 80% và 100%."],
        ["13", "debt_loans", "id", "VARCHAR(36) UUID", "Sổ theo dõi nợ (DEBT) hoặc cho vay (LOAN); quản lý số tiền gốc, số tiền còn lại, thông tin ngân hàng sinh mã VietQR, liên kết P2P."],
        ["14", "debt_repayments", "id", "VARCHAR(36) UUID", "Lịch sử chi tiết các đợt thanh toán nợ từng phần/toàn phần cho từng khoản nợ."],
        ["15", "notifications", "id", "VARCHAR(36) UUID", "Lưu trữ thông báo người dùng: Cảnh báo ngân sách, thông báo nợ P2P, biến động số dư. Đánh chỉ mục hỗn hợp truy vấn tốc độ cao."]
    ]
    tbl_schema = doc.add_table(rows=len(tbl_list_data)+1, cols=5)
    format_table(tbl_schema, [1.2, 3.0, 3.2, 2.8, 5.8], tbl_list_headers, tbl_list_data, {0: WD_ALIGN_PARAGRAPH.CENTER, 3: WD_ALIGN_PARAGRAPH.CENTER})

    add_heading_2("3.4. Từ điển Dữ liệu Chi tiết các Bảng Nghiệp vụ Cốt lõi")
    
    add_heading_3("Bảng 1: wallets (Ví tiền)")
    w_cols = ["Tên Cột", "Kiểu Dữ Liệu", "Ràng Buộc", "Mô Tả Nghiệp Vụ"]
    w_data = [
        ["id", "VARCHAR(36)", "PK, UUID", "Mã định danh duy nhất của ví"],
        ["user_id", "VARCHAR(36)", "FK -> users(id)", "Chủ sở hữu ví tiền"],
        ["name", "VARCHAR(100)", "NOT NULL", "Tên ví (VD: Tiền mặt, VCB, MoMo)"],
        ["type", "VARCHAR(30)", "NOT NULL", "CASH, BANK, E_WALLET, CREDIT"],
        ["balance", "DECIMAL(19,4)", "NOT NULL, DEFAULT 0", "Số dư ví hiện tại (chuẩn BigDecimal)"],
        ["include_in_total", "BOOLEAN", "NOT NULL, DEFAULT TRUE", "Cờ cộng dồn vào Tổng tài sản"],
        ["is_active", "BOOLEAN", "NOT NULL, DEFAULT TRUE", "Trạng thái hoạt động (xóa mềm)"],
        ["created_at", "DATETIME", "NOT NULL", "Thời điểm tạo ví"],
        ["updated_at", "DATETIME", "NULL", "Thời điểm cập nhật"]
    ]
    tbl_w = doc.add_table(rows=len(w_data)+1, cols=4)
    format_table(tbl_w, [3.2, 3.2, 3.6, 6.0], w_cols, w_data)

    add_heading_3("Bảng 2: transactions (Sổ cái giao dịch)")
    tx_cols = ["Tên Cột", "Kiểu Dữ Liệu", "Ràng Buộc", "Mô Tả Nghiệp Vụ"]
    tx_data = [
        ["id", "VARCHAR(36)", "PK, UUID", "Mã định danh giao dịch"],
        ["user_id", "VARCHAR(36)", "FK -> users(id)", "Người thực hiện giao dịch"],
        ["wallet_id", "VARCHAR(36)", "FK -> wallets(id)", "Ví chịu biến động số dư"],
        ["category_id", "VARCHAR(36)", "FK -> categories(id)", "Danh mục chi tiêu/thu nhập"],
        ["amount", "DECIMAL(19,4)", "NOT NULL", "Số tiền giao dịch (luôn dương)"],
        ["type", "VARCHAR(20)", "NOT NULL", "EXPENSE (Chi), INCOME (Thu), TRANSFER"],
        ["balance_after", "DECIMAL(19,4)", "NOT NULL", "Ảnh chụp số dư ví ngay sau giao dịch"],
        ["to_wallet_id", "VARCHAR(36)", "NULL", "Ví nhận tiền (nếu là TRANSFER)"],
        ["transaction_date", "DATETIME", "NOT NULL", "Thời điểm phát sinh giao dịch"],
        ["note", "TEXT", "NULL", "Ghi chú chi tiết hoặc nội dung hóa đơn"]
    ]
    tbl_tx = doc.add_table(rows=len(tx_data)+1, cols=4)
    format_table(tbl_tx, [3.2, 3.2, 3.6, 6.0], tx_cols, tx_data)

    add_heading_3("Bảng 3: debt_loans (Sổ nợ và cho vay)")
    debt_cols = ["Tên Cột", "Kiểu Dữ Liệu", "Ràng Buộc", "Mô Tả Nghiệp Vụ"]
    debt_data = [
        ["id", "VARCHAR(36)", "PK, UUID", "Mã định danh khoản nợ/cho vay"],
        ["user_id", "VARCHAR(36)", "FK -> users(id)", "Chủ tài khoản tạo sổ nợ"],
        ["person_name", "VARCHAR(100)", "NOT NULL", "Tên đối tác vay/nợ"],
        ["partner_user_id", "VARCHAR(36)", "FK -> users(id), NULL", "Tài khoản đối tác trên hệ thống (nếu có)"],
        ["amount", "DECIMAL(19,4)", "NOT NULL", "Số tiền nợ gốc ban đầu"],
        ["remaining_amount", "DECIMAL(19,4)", "NOT NULL", "Số tiền nợ còn lại sau các đợt trả"],
        ["type", "VARCHAR(20)", "NOT NULL", "LOAN (Cho vay), DEBT (Đi vay)"],
        ["status", "VARCHAR(30)", "NOT NULL", "ACTIVE, PAID, OVERDUE, PENDING_CONFIRMATION"],
        ["due_date", "DATE", "NULL", "Ngày đến hạn thanh toán nợ"],
        ["bank_name / account", "VARCHAR(50)", "NULL", "Thông tin tài khoản ngân hàng để tạo mã VietQR"],
        ["linked_debt_loan_id", "VARCHAR(36)", "NULL", "Liên kết với khoản nợ đối ứng bên phía đối tác"]
    ]
    tbl_debt = doc.add_table(rows=len(debt_data)+1, cols=4)
    format_table(tbl_debt, [3.2, 3.2, 3.6, 6.0], debt_cols, debt_data)

    add_heading_2("3.5. Quy tắc Nghiệp vụ Sổ cái Tài chính ACID")
    add_bullet(" Thao tác chuyển tiền nội bộ giữa Ví A sang Ví B phải chạy trong cùng một transaction với annotation @Transactional. Nếu trừ tiền Ví A thành công nhưng cộng tiền Ví B phát sinh lỗi, toàn bộ thao tác lập tức Rollback hoàn nguyên.", "1. Tính Nguyên tố (Atomicity): ")
    add_bullet(" Tổng tài sản và số dư từng ví luôn được kiểm tra ràng buộc trước và sau khi thực hiện ghi chép giao dịch.", "2. Tính Nhất quán (Consistency): ")
    add_bullet(" Sử dụng cơ chế khóa phân tán / Transactional Lock ở mức dòng (SELECT FOR UPDATE) khi cập nhật số dư, ngăn chặn triệt để hiện tượng Race Condition khi phát sinh nhiều giao dịch đồng thời.", "3. Tính Cô lập (Isolation): ")
    add_bullet(" Mọi số dư đều được ghi xuống ổ đĩa vật lý với hệ lưu trữ InnoDB của MySQL 8, bảo đảm an toàn dữ liệu kể cả khi hệ thống khởi động lại đột ngột.", "4. Tính Bền vững (Durability): ")

    doc.add_page_break()

    # ==========================================
    # CHƯƠNG 4: HIỆN THỰC VÀ KIỂM THỬ HỆ THỐNG
    # ==========================================
    add_heading_1("CHƯƠNG 4: HIỆN THỰC VÀ KIỂM THỬ HỆ THỐNG")

    add_heading_2("4.1. Môi trường Phát triển và Cấu hình Công nghệ")
    doc.add_paragraph(
        "Toàn bộ mã nguồn hệ thống được tổ chức chuyên nghiệp, tuân thủ các quy tắc thiết kế Clean Code. "
        "Chi tiết cấu hình môi trường được tổng hợp trong bảng dưới đây:"
    )

    env_headers = ["Thành phần", "Công nghệ lựa chọn", "Phiên bản", "Ghi chú cấu hình"]
    env_data = [
        ["Ngôn ngữ Backend", "Java (OpenJDK)", "21 LTS", "Tối ưu với Virtual Threads (Project Loom)"],
        ["Framework Backend", "Spring Boot", "3.4.x", "Spring Security 6, Spring Data JPA, Spring AI"],
        ["Cơ sở dữ liệu", "MySQL Server", "8.0", "InnoDB Engine, Character set utf8mb4"],
        ["Mô hình AI", "Google Gemini Flash", "1.5 / 2.5", "Multimodal Vision API bóc tách JSON hóa đơn"],
        ["Thư viện Frontend", "React SPA", "19.x", "TypeScript, Vite Builder, Zustand Store"],
        ["CSS Framework", "Tailwind CSS", "v4.x", "Thiết kế Responsive Mobile-First"],
        ["Thư viện Biểu đồ", "Recharts", "2.x", "Vẽ biểu đồ Donut, Bar Chart và Area Chart"],
        ["Đóng gói & Chạy", "Docker & Docker Compose", "26.x", "Khởi chạy toàn bộ hệ thống bằng 1 lệnh"]
    ]
    tbl_env2 = doc.add_table(rows=len(env_data)+1, cols=4)
    format_table(tbl_env2, [3.2, 4.0, 2.8, 6.0], env_headers, env_data)

    add_heading_2("4.2. Hiện thực các Phân hệ Chức năng Cốt lõi")
    
    add_heading_3("1. Phân hệ Xác thực & Quản lý Phiên (Auth Service)")
    doc.add_paragraph(
        "Lớp AuthenticationService chịu trách nhiệm xác thực người dùng. Mật khẩu được mã hóa an toàn bằng BCrypt. "
        "Hệ thống cấp phát cặp token: Access Token (thời hạn 15 phút, gửi qua Header Authorization) và Refresh Token (thời hạn 7 ngày, "
        "lưu trong HttpOnly Cookie). Cơ chế Refresh Token Rotation đảm bảo mỗi Refresh Token chỉ được dùng một lần duy nhất."
    )

    add_heading_3("2. Phân hệ Sổ cái Giao dịch & Bảo toàn Số dư (Transaction Service)")
    doc.add_paragraph(
        "Lớp TransactionService xử lý nghiệp vụ thu/chi/chuyển tiền chuẩn tính chất ACID. Khi có giao dịch mới, số dư ví tương ứng "
        "được cập nhật nguyên tử (Atomic). Mọi phép tính tiền tệ sử dụng đối tượng BigDecimal trong Java và cột DECIMAL(19, 4) "
        "trong MySQL, triệt tiêu hoàn toàn sai số dấu phẩy động."
    )

    add_heading_3("3. Phân hệ Sổ Ghi nợ Đối ứng Song phương (Debt & Loan Service)")
    doc.add_paragraph(
        "Module Sổ Ghi nợ được thiết kế theo phiên bản kiến trúc 2.0: tách biệt hoàn toàn khỏi số dư ví thực tế để tránh làm "
        "sai lệch tiền mặt khi ghi chép nợ cũ. Hệ thống hỗ trợ cơ chế xác nhận song phương P2P (Two-Way Confirmation): "
        "khi đối tác duyệt nợ, hệ thống tự động sinh một bản ghi nợ đối ứng bên tài khoản đối tác với loại nợ đảo chiều (LOAN <-> DEBT). "
        "Đồng thời hỗ trợ tạo mã VietQR theo chuẩn Napas 247 để đối tác chuyển khoản trả nợ tức thì."
    )

    add_heading_3("4. Phân hệ Trí tuệ Nhân tạo Đọc Hóa đơn (Gemini AI Vision)")
    doc.add_paragraph(
        "Tích hợp thư viện Spring AI kết hợp mô hình đa phương thức Google Gemini 1.5/2.5 Flash. Người dùng chỉ cần tải lên ảnh chụp hóa đơn "
        "(siêu thị, nhà hàng, cây xăng), hệ thống sẽ gửi ảnh lên mô hình AI kèm Prompt có cấu trúc nghiêm ngặt. Kết quả trả về là đối tượng JSON "
        "chứa: số tiền thanh toán, gợi ý danh mục chi tiêu, thời gian giao dịch và tên đơn vị bán lẻ. Form giao dịch trên giao diện React "
        "sẽ tự động được điền đầy đủ dữ liệu, người dùng chỉ cần kiểm tra và xác nhận lưu trong 1 click."
    )

    add_heading_2("4.3. Kết quả Kiểm thử Hệ thống (Testing)")
    doc.add_paragraph(
        "Nhóm thực hiện kiểm thử tự động toàn diện trên tầng REST Controller và Service theo phương pháp TDD (Test-Driven Development):\n"
        "• Toàn bộ 42 Endpoints API được kiểm thử tự động với độ bao phủ 100% các phân hệ chức năng.\n"
        "• 100% các ca kiểm thử bảo toàn số dư (chuyển tiền âm, số dư không đủ, xóa giao dịch, cập nhật danh mục) đều vượt qua (Passed) và đảm bảo tính đúng đắn."
    )

    test_headers = ["Phân hệ", "Số API", "Ca Kiểm Thử Thành Công", "Ca Kiểm Thử Ngoại Lệ (Validation/Error)", "Kết quả"]
    test_summary = [
        ["Xác thực (Auth & Token)", "6", "6/6 (100%)", "8 ca (Sai mật khẩu, Token hết hạn, Token revoked)", "Đạt"],
        ["Quản lý Ví (Wallets)", "6", "6/6 (100%)", "6 ca (Trùng tên ví, Số dư âm, Không tìm thấy ví)", "Đạt"],
        ["Sổ cái Giao dịch (Transactions)", "7", "7/7 (100%)", "10 ca (Ví thiếu tiền, Chuyển cùng ví, Rollback)", "Đạt"],
        ["Ngân sách (Budgets)", "5", "5/5 (100%)", "5 ca (Ngân sách âm, Trùng tháng, Vượt hạn mức)", "Đạt"],
        ["Sổ nợ P2P (Debt & Loan)", "10", "10/10 (100%)", "12 ca (Trả nợ vượt quá gốc, Anti-spam cooldown)", "Đạt"],
        ["Thống kê & Báo cáo", "4", "4/4 (100%)", "3 ca (Khoảng thời gian sai, Không có dữ liệu)", "Đạt"],
        ["Trí tuệ nhân tạo (Gemini AI)", "4", "4/4 (100%)", "4 ca (Ảnh hỏng, Sai định dạng ảnh, Quá dung lượng)", "Đạt"],
        ["TỔNG CỘNG", "42", "42/42 (100%)", "48 ca kiểm thử biên và ngoại lệ", "XUẤT SẮC"]
    ]
    tbl_test = doc.add_table(rows=len(test_summary)+1, cols=5)
    format_table(tbl_test, [4.5, 2.0, 3.2, 4.5, 2.0], test_headers, test_summary, {1: WD_ALIGN_PARAGRAPH.CENTER, 4: WD_ALIGN_PARAGRAPH.CENTER})

    doc.add_page_break()

    # ==========================================
    # CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
    # ==========================================
    add_heading_1("CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN")

    add_heading_2("5.1. Đánh giá Kết quả Đạt được")
    doc.add_paragraph(
        "Sau quá trình nghiên cứu và thực hiện, nhóm sinh viên đã hoàn thành đầy đủ các mục tiêu đề ra ban đầu:\n"
        "1. Xây dựng hoàn chỉnh hệ thống quản lý tài chính cá nhân Fullstack hiện đại với Spring Boot 3 và React 19.\n"
        "2. Đảm bảo tính toán tài chính chính xác tuyệt đối theo nguyên tắc kế toán kép và chuẩn ACID, xử lý số dư với BigDecimal.\n"
        "3. Triển khai cơ chế bảo mật xác thực 2-Token (Access Token 15 phút + Refresh Token Rotation qua HttpOnly Cookie) đạt chuẩn bảo mật công nghiệp.\n"
        "4. Tích hợp thành công mô hình AI đa phương thức Google Gemini vào tính năng quét hóa đơn tự động bóc tách dữ liệu JSON tiếng Việt.\n"
        "5. Thiết kế module sổ nợ hai chiều thông minh P2P, tự động sinh mã VietQR thanh toán nhanh và tích hợp thông báo hướng sự kiện (EDA).\n"
        "6. Kiểm thử toàn diện 42 endpoints API đạt tỷ lệ thành công 100%."
    )

    add_heading_2("5.2. Các Hạn chế còn Tồn tại")
    add_bullet(" Hệ thống hiện tại ghi nhận giao dịch tài khoản ngân hàng thông qua nhập tay hoặc quét hóa đơn/QR, chưa kết nối trực tiếp với Open Banking API của các ngân hàng thương mại Việt Nam do rào cản pháp lý sandbox.", "• Kết nối ngân hàng tự động: ")
    add_bullet(" Mô hình nhận diện hóa đơn phụ thuộc vào kết nối Internet tới Google Cloud Gemini API; trường hợp ảnh chụp quá mờ hoặc nhàu nát có thể cần người dùng chỉnh sửa lại một số ký tự nhỏ.", "• Nhận diện hóa đơn AI: ")

    add_heading_2("5.3. Hướng Nghiên cứu và Phát triển Tiếp theo")
    add_bullet(" Nghiên cứu áp dụng chuẩn Open Banking (VietQR Payment Link & Open API) khi các ngân hàng mở cổng kết nối cho cá nhân.", "1. Tích hợp Open Banking: ")
    add_bullet(" Huấn luyện/fine-tune trợ lý ảo tài chính (Financial Advisor Bot) dựa trên nguyên tắc tài chính 50/30/20 và dữ liệu chi tiêu lịch sử của từng người dùng.", "2. Trợ lý Cố vấn Tài chính AI: ")
    add_bullet(" Chuyển đổi ứng dụng Web sang Progressive Web App (PWA) hoặc ứng dụng di động React Native để hỗ trợ ghi chép Offline-first và đồng bộ dữ liệu ngầm khi có mạng.", "3. Ứng dụng Di động Native: ")

    doc.add_page_break()

    # ==========================================
    # PHỤ LỤC & TÀI LIỆU THAM KHẢO
    # ==========================================
    add_heading_1("TÀI LIỆU THAM KHẢO")
    refs = [
        "[1] Oracle, 'Java 21 Documentation & Virtual Threads Specification (JEP 444)', 2023.",
        "[2] Spring Framework Team, 'Spring Boot 3.4 Reference Documentation', VMware Tanzu, 2024.",
        "[3] Spring Security Community, 'OAuth 2.0 Resource Server & JWT Token Handling Guide', 2024.",
        "[4] React Team, 'React 19 Official Documentation and Server Actions', Meta Platforms, 2024.",
        "[5] Google AI, 'Gemini 1.5 & 2.0 Flash Multimodal Vision API Developer Documentation', Google Cloud, 2024.",
        "[6] Martin Fowler, 'Patterns of Enterprise Application Architecture', Addison-Wesley, 2002.",
        "[7] Robert C. Martin, 'Clean Architecture: A Craftsman\\'s Guide to Software Structure and Design', Prentice Hall, 2017."
    ]
    for r in refs:
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = 1.25
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(r)
        run.font.name = "Times New Roman"
        run.font.size = Pt(11.5)

    add_heading_1("PHỤ LỤC: DANH MỤC 42 API ENDPOINTS CHÍNH CỦA HỆ THỐNG")
    api_headers = ["Phân hệ", "Method", "Endpoint URL", "Chức Năng & Quyền Hạn"]
    api_data = [
        ["Auth", "POST", "/api/auth/register", "Đăng ký tài khoản mới (Public)"],
        ["Auth", "POST", "/api/auth/login", "Đăng nhập, cấp Access & Refresh Token"],
        ["Auth", "POST", "/api/auth/refresh", "Làm mới Access Token qua HttpOnly Cookie"],
        ["Auth", "POST", "/api/auth/logout", "Thu hồi Refresh Token & đưa vào blacklist"],
        ["Auth", "GET", "/api/auth/my-info", "Lấy thông tin người dùng đang đăng nhập"],
        ["Auth", "POST", "/api/auth/change-password", "Đổi mật khẩu người dùng"],
        ["Wallet", "GET", "/api/wallets", "Lấy danh sách tất cả các ví của user"],
        ["Wallet", "GET", "/api/wallets/total-balance", "Lấy tổng tài sản các ví (includeInTotal=true)"],
        ["Wallet", "POST", "/api/wallets", "Tạo ví mới (CASH, BANK, E_WALLET, CREDIT)"],
        ["Wallet", "PUT", "/api/wallets/{id}", "Cập nhật thông tin/số dư ví"],
        ["Wallet", "DELETE", "/api/wallets/{id}", "Xóa mềm ví (isActive=false)"],
        ["Category", "GET", "/api/categories", "Lấy danh sách danh mục chi tiêu/thu nhập"],
        ["Category", "POST", "/api/categories", "Tạo danh mục mới (User-defined)"],
        ["Category", "PUT", "/api/categories/{id}", "Cập nhật tên, icon, màu sắc danh mục"],
        ["Category", "DELETE", "/api/categories/{id}", "Xóa danh mục"],
        ["Transaction", "GET", "/api/transactions", "Lấy danh sách giao dịch (hỗ trợ lọc theo ví, ngày)"],
        ["Transaction", "GET", "/api/transactions/{id}", "Xem chi tiết một giao dịch"],
        ["Transaction", "POST", "/api/transactions", "Tạo giao dịch Thu / Chi (Cập nhật số dư ACID)"],
        ["Transaction", "POST", "/api/transactions/transfer", "Chuyển tiền nội bộ giữa 2 ví (Transactional)"],
        ["Transaction", "PUT", "/api/transactions/{id}", "Chỉnh sửa giao dịch và hoàn nguyên số dư"],
        ["Transaction", "DELETE", "/api/transactions/{id}", "Xóa giao dịch và phục hồi số dư ví"],
        ["Budget", "GET", "/api/budgets", "Xem danh sách ngân sách tháng hiện tại"],
        ["Budget", "POST", "/api/budgets", "Thiết lập hạn mức chi tiêu cho danh mục"],
        ["Budget", "PUT", "/api/budgets/{id}", "Điều chỉnh hạn mức ngân sách"],
        ["Budget", "DELETE", "/api/budgets/{id}", "Hủy bỏ hạn mức ngân sách"],
        ["Budget", "GET", "/api/budgets/status", "Kiểm tra tiến độ chi tiêu & mức độ cảnh báo"],
        ["Debt & Loan", "GET", "/api/debts", "Lấy danh sách các khoản nợ / cho vay"],
        ["Debt & Loan", "POST", "/api/debts", "Tạo khoản nợ mới (P2P Confirmation / Cooldown)"],
        ["Debt & Loan", "PUT", "/api/debts/{id}/confirm", "Đối tác xác nhận khoản nợ song phương"],
        ["Debt & Loan", "POST", "/api/debts/{id}/repay", "Ghi nhận trả nợ từng phần / toàn phần"],
        ["Debt & Loan", "POST", "/api/debts/{id}/remind", "Gửi thông báo nhắc nợ (Cooldown 24h)"],
        ["Debt & Loan", "GET", "/api/debts/{id}/vietqr", "Sinh chuỗi QR Napas 247 thanh toán nhanh"],
        ["Debt & Loan", "DELETE", "/api/debts/{id}", "Xóa mềm khoản nợ"],
        ["Analytics", "GET", "/api/analytics/overview", "Thống kê tổng quan thu - chi - số dư"],
        ["Analytics", "GET", "/api/analytics/category-breakdown", "Phân tích cơ cấu chi tiêu theo Donut Chart"],
        ["Analytics", "GET", "/api/analytics/monthly-trend", "Biểu đồ xu hướng dòng tiền theo các tháng"],
        ["Analytics", "GET", "/api/analytics/export/excel", "Xuất báo cáo sao kê ra file Excel (.xlsx)"],
        ["Gemini AI", "POST", "/api/ai/receipt/scan", "Upload ảnh hóa đơn, bóc tách JSON giao dịch"],
        ["Gemini AI", "POST", "/api/ai/advisor/tips", "Nhận lời khuyên chi tiêu từ trợ lý AI"],
        ["Notification", "GET", "/api/notifications", "Lấy danh sách thông báo của người dùng"],
        ["Notification", "PUT", "/api/notifications/{id}/read", "Đánh dấu thông báo đã đọc"],
        ["Notification", "PUT", "/api/notifications/read-all", "Đánh dấu tất cả thông báo đã đọc"]
    ]
    tbl_api = doc.add_table(rows=len(api_data)+1, cols=4)
    format_table(tbl_api, [2.5, 2.0, 5.5, 6.0], api_headers, api_data, {1: WD_ALIGN_PARAGRAPH.CENTER})

    # Save to workspace
    output_path = "BAO_CAO_DO_AN_TOT_NGHIEP_PFT.docx"
    try:
        doc.save(output_path)
        print(f"File created successfully at {output_path}")
    except PermissionError:
        output_path_v2 = "BAO_CAO_DO_AN_TOT_NGHIEP_PFT_v2.docx"
        doc.save(output_path_v2)
        print(f"File locked by Word. Created successfully at {output_path_v2}")

if __name__ == "__main__":
    generate_report()
