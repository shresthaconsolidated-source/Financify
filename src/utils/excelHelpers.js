import * as XLSX from 'xlsx';

export const generateSmartTemplate = (accounts, categories) => {
    // 1. Prepare Data
    const headers = ['Date (YYYY-MM-DD)', 'Type (INCOME/EXPENSE/TRANSFER)', 'Amount', 'Account Name', 'Category Name', 'Note'];
    // Safe check for accounts/categories existence
    const accName = accounts && accounts.length > 0 ? accounts[0].name : 'Bank';
    const catName = categories && categories.length > 0 ? categories[0].name : 'Salary';

    const exampleRow = ['2025-01-01', 'INCOME', '5000', accName, catName, 'Example Entry'];

    // 2. Create Workbook
    const wb = XLSX.utils.book_new();

    // 3. Create Transactions Sheet (Main)
    const wsData = [headers, exampleRow];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // 4. Create Validation Sheet (Hidden lists)
    // We list Accounts in Col A, Categories in Col B
    const accountNames = (accounts || []).map(a => a.name);
    const categoryNames = (categories || []).map(c => c.name);
    const maxRows = Math.max(accountNames.length, categoryNames.length);

    const validationData = [];
    for (let i = 0; i < maxRows; i++) {
        validationData.push([
            accountNames[i] || '', // Col A
            categoryNames[i] || '' // Col B
        ]);
    }
    const wsValidation = XLSX.utils.aoa_to_sheet(validationData);

    // Append Sheets
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.utils.book_append_sheet(wb, wsValidation, "Valid_Values_DO_NOT_EDIT");

    // 5. Download using Blob method (More reliable for modern browsers than writeFile sometimes)
    // Using write to array type
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'wealth_tracker_smart_template.xlsx');
    document.body.appendChild(link);
    link.click();

    // Cleanup
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
                    return {
                        date: String(date).trim(),
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
