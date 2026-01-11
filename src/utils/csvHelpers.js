export const generateCSVTemplate = () => {
    const headers = ['Date (YYYY-MM-DD)', 'Type (INCOME/EXPENSE)', 'Amount', 'Account Name', 'Category Name', 'Note'];
    const rows = [
        ['2025-01-01', 'INCOME', '5000', 'Bank', 'Salary', 'January Salary'],
        ['2025-01-02', 'EXPENSE', '50', 'Cash', 'Food', 'Lunch'],
        ['2025-01-03', 'EXPENSE', '20', 'Bank', 'Transport', 'Uber']
    ];

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'wealth_tracker_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportJSON = (data) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wealth_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\n');
            const data = lines.slice(1).map(line => {
                const [date, type, amount, accountName, categoryName, note] = line.split(',').map(item => item?.trim());
                if (!date || !amount) return null;
                return { date, type, amount, accountName, categoryName, note };
            }).filter(Boolean);
            resolve(data);
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
};

export const parseJSON = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                resolve(json);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
};
