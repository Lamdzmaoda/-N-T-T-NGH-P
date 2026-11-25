package org.example.backend.service.report;

import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.example.backend.entity.Transaction;
import org.example.backend.enums.TransactionType;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
public class ExcelExportService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public byte[] exportTransactions(List<Transaction> transactions, String username) throws IOException {
        try(Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()){
            Sheet sheet = workbook.createSheet("Sao kê giao dịch");

            CellStyle titleStyle = createTitleStyle(workbook);
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook, false);
            CellStyle dateStyle = createDataStyle(workbook, true);
            CellStyle currencyStyle = createCurrencyStyle(workbook, null);
            CellStyle incomeStyle = createCurrencyStyle(workbook, IndexedColors.GREEN);
            CellStyle expenseStyle = createCurrencyStyle(workbook, IndexedColors.RED);

            int rowIdx = 0;

            Row titleRow = sheet.createRow(rowIdx++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("FINFLOW - BÁO CÁO SAO KÊ GIAO DỊCH");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 7));

            Row userRow = sheet.createRow(rowIdx++);
            userRow.createCell(0).setCellValue("Tài khoản: " + username + " | Tổng số giao dịch: " + transactions.size());
            rowIdx++;

            BigDecimal totalIncome = BigDecimal.ZERO;
            BigDecimal totalExpense = BigDecimal.ZERO;
            for (Transaction t : transactions) {
                if (t.getType() == TransactionType.INCOME) {
                    totalIncome = totalIncome.add(t.getAmount());
                } else if (t.getType() == TransactionType.EXPENSE) {
                    totalExpense = totalExpense.add(t.getAmount());
                }
            }

            Row summaryRow = sheet.createRow(rowIdx++);
            summaryRow.createCell(0).setCellValue("Tổng Thu: " + String.format("%,.0f VND", totalIncome)
                    + "   |   Tổng Chi: " + String.format("%,.0f VND", totalExpense)
                    + "   |   Chênh lệch: " + String.format("%,.0f VND", totalIncome.subtract(totalExpense)));
            rowIdx++;

            String[] headers = {"STT", "Thời gian", "Loại", "Danh mục", "Ví thanh toán", "Ví đích", "Số tiền (VND)", "Ghi chú"};

            Row headerRow = sheet.createRow(rowIdx++);
            for(int col = 0; col < headers.length; col++){
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(headers[col]);
                cell.setCellStyle(headerStyle);
            }
            int stt = 1;
            for (Transaction t : transactions) {
                Row row = sheet.createRow(rowIdx++);

                Cell c0 = row.createCell(0);
                c0.setCellValue(stt++);
                c0.setCellStyle(dataStyle);

                Cell c1 = row.createCell(1);
                c1.setCellValue(t.getTransactionDate() != null ? t.getTransactionDate().format(DATE_FORMATTER) : "");
                c1.setCellStyle(dataStyle);

                Cell c2 = row.createCell(2);
                String typeStr = t.getType() == TransactionType.INCOME ? "Thu nhập"
                        : t.getType() == TransactionType.EXPENSE ? "Chi tiêu" : "Chuyển khoản";
                c2.setCellValue(typeStr);
                c2.setCellStyle(dataStyle);

                Cell c3 = row.createCell(3);
                c3.setCellValue(t.getCategory() != null ? t.getCategory().getName() : "-");
                c3.setCellStyle(dataStyle);

                Cell c4 = row.createCell(4);
                c4.setCellValue(t.getWallet() != null ? t.getWallet().getName() : "-");
                c4.setCellStyle(dataStyle);

                Cell c5 = row.createCell(5);
                c5.setCellValue(t.getDestinationWallet() != null ? t.getDestinationWallet().getName() : "-");
                c5.setCellStyle(dataStyle);

                Cell c6 = row.createCell(6);
                c6.setCellValue(t.getAmount().doubleValue());
                if (t.getType() == TransactionType.INCOME) {
                    c6.setCellStyle(incomeStyle);
                } else if (t.getType() == TransactionType.EXPENSE) {
                    c6.setCellStyle(expenseStyle);
                } else {
                    c6.setCellStyle(currencyStyle);
                }

                Cell c7 = row.createCell(7);
                c7.setCellValue(t.getNote() != null ? t.getNote() : "");
                c7.setCellStyle(dataStyle);
            }
            for (int col = 0; col < headers.length; col++) {
                sheet.autoSizeColumn(col);
                sheet.setColumnWidth(col, Math.max(sheet.getColumnWidth(col), 3500));
            }
            workbook.write(out);
            log.info("✅ Xuất báo cáo Excel thành công cho user: {}", username);
            return out.toByteArray();
        } catch (IOException e) {
            log.error("🔴 Lỗi khi tạo file Excel: {}", e.getMessage());
            throw new RuntimeException("Không thể tạo file Excel báo cáo giao dịch!");
        }
    }

    private CellStyle createTitleStyle(Workbook wb){
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setFontHeightInPoints((short) 16);
        font.setBold(true);
        font.setColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        return  style;
    }
    private CellStyle createHeaderStyle(Workbook wb){
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillBackgroundColor(IndexedColors.ROYAL_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorders(style);
        return  style;
    }
    private CellStyle createDataStyle(Workbook wb, boolean center){
        CellStyle style = wb.createCellStyle();
        setBorders(style);
        if(center){
            style.setAlignment(HorizontalAlignment.CENTER);
        }
        return style;
    }
    private CellStyle createCurrencyStyle(Workbook wb, IndexedColors color){
        CellStyle style = wb.createCellStyle();
        DataFormat format = wb.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0"));
        setBorders(style);
        style.setAlignment(HorizontalAlignment.RIGHT);

        if(color != null){
            Font font = wb.createFont();
            font.setColor(color.getIndex());
            font.setBold(true);
            style.setFont(font);
        }
        return style;
    }
    private  void setBorders(CellStyle style){
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }
}
