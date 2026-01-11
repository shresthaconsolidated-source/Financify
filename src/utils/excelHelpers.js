import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

export const generateSmartTemplate = async (accounts, categories) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');

    // 1. Define Columns
    const headers = ['Date (YYYY-MM-DD)', 'Type', 'Amount', 'Account Name', 'Category Name', 'Note'];
    worksheet.addRow(headers);

    // Set widths
    worksheet.getColumn(1).width = 18; // Date
    worksheet.getColumn(2).width = 15; // Type
    worksheet.getColumn(3).width = 15; // Amount
    worksheet.getColumn(4).width = 25; // Account
    worksheet.getColumn(5).width = 25; // Category
    worksheet.getColumn(6).width = 30; // Note

    // 2. Add Example Row
    const accName = accounts && accounts.length > 0 ? accounts[0].name : 'Bank';
    const catName = categories && categories.length > 0 ? categories[0].name : 'Salary';
    worksheet.addRow(['2025-01-01', 'INCOME', 5000, accName, catName, 'Example Entry']);

    // 3. Create Hidden Validation Sheet
    let refSheet = workbook.getWorksheet('DataValidation');
    if (!refSheet) {
        refSheet = workbook.addWorksheet('DataValidation', { state: 'hidden' });
    }

    // Fill Accounts in Col A
    const accLen = Math.max((accounts || []).length, 1);
    (accounts || []).forEach((acc, i) => {
        refSheet.getCell(`A${i + 1}`).value = acc.name;
    });
    if ((accounts || []).length === 0) refSheet.getCell('A1').value = 'Bank';

    // Fill Categories in Col B
    const catLen = Math.max((categories || []).length, 1);
    (categories || []).forEach((cat, i) => {
        refSheet.getCell(`B${i + 1}`).value = cat.name;
    });
    if ((categories || []).length === 0) refSheet.getCell('B1').value = 'Salary';

    // 4. Apply Validation to Main Sheet (Rows 2 to 500)
    const rowsToValidate = 500;

    // Type Validation (Col B)
    for (let i = 2; i <= rowsToValidate; i++) {
        worksheet.getCell(`B${i}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: ['"INCOME,EXPENSE,TRANSFER"']
        };
    }

    // Account Validation (Col D)
    const accRange = `DataValidation!$A$1:$A$${accLen}`;
    for (let i = 2; i <= rowsToValidate; i++) {
        worksheet.getCell(`D${i}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [accRange]
        };
    }

    // Category Validation (Col E)
    const catRange = `DataValidation!$B$1:$B$${catLen}`;
    for (let i = 2; i <= rowsToValidate; i++) {
        worksheet.getCell(`E${i}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [catRange]
        };
    }

    // 5. Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'wealth_tracker_smart_template.xlsx');
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }, 100);
};

export const parseExcel = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Expect first sheet to be transactions
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Array of Arrays

                // Headers: Date, Type, Amount, Account, Category, Note
                // Remove header row
                const rows = jsonData.slice(1).map(row => {
                    // row indexes allow us to map safely even if columns act weird
                    const [date, type, amount, accountName, categoryName, note] = row;
                    if (!date || !amount) return null;

                    // Convert Excel serial date to proper date string
                    let dateStr;
                    if (typeof date === 'number') {
                        // Excel serial date (days since 1900-01-01)
                        const excelDate = XLSX.SSF.parse_date_code(date);
                        dateStr = `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}-${String(excelDate.d).padStart(2, '0')}`;
                    } else {
                        // Already a string, just trim
                        dateStr = String(date).trim();
                    }

                    return {
                        date: dateStr,
                        type: String(type).trim().toUpperCase(),
                        amount: Number(amount),
                        accountName: String(accountName).trim(),
                        categoryName: String(categoryName).trim(),
                        note: note ? String(note).trim() : ''
                    };
                }).filter(Boolean);

                resolve(rows);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};
