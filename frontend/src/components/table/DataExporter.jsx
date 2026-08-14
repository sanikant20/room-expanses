import React from 'react';
import { IconButton, Tooltip, Menu, MenuItem, useTheme } from '@mui/material';
import { PictureAsPdfRounded, GridOnRounded, TableChartRounded, DownloadRounded } from '@mui/icons-material';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';

const DataExporter = ({
    columns = [],
    data = [],
    fileName = 'exported-data',
    excludeColumns = [],
}) => {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const getFilteredColumns = () => {
        return excludeColumns.length > 0
            ? columns.filter(col => !excludeColumns.includes(col.key))
            : columns;
    };

    const capitalizeFileName = (name) => {
        return name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const checkDataBeforeExport = () => {
        if (!data || data.length === 0) {
            toast.error('No data available to export');
            return false;
        }
        return true;
    };

    // Helper function to extract text from React elements
    const extractTextFromReactElement = (element) => {
        if (typeof element === 'string' || typeof element === 'number') {
            return element.toString();
        }

        if (React.isValidElement(element)) {
            // Check for props.children
            if (element.props && element.props.children) {
                if (Array.isArray(element.props.children)) {
                    return element.props.children
                        .map(child => extractTextFromReactElement(child))
                        .join('');
                } else {
                    return extractTextFromReactElement(element.props.children);
                }
            }

            // Check for other props that might contain text
            if (element.props && element.props.title) {
                return element.props.title;
            }

            if (element.props && element.props.label) {
                return element.props.label;
            }

            if (element.props && element.props.value) {
                return element.props.value;
            }

            return ''; // Return empty string if no text can be extracted
        }

        return element !== undefined && element !== null ? element.toString() : '';
    };

    const prepareData = async () => {
        setIsLoading(true);

        try {
            if (!checkDataBeforeExport()) return null;

            const exportData = data;
            const filteredColumns = getFilteredColumns();

            // Prepare headers
            const headers = ['S.No.', ...filteredColumns.map(col => col.label || col.key)];

            // Prepare rows with serial numbers
            const rows = exportData.map((row, index) => [
                index + 1,
                ...filteredColumns.map(col => {
                    // Handle rendered values
                    if (col.render) {
                        const renderedValue = col.render(row, index);
                        return extractTextFromReactElement(renderedValue);
                    }
                    return row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : '';
                })
            ]);

            return { headers, rows };
        } finally {
            setIsLoading(false);
        }
    };

    const downloadCSV = async () => {
        const preparedData = await prepareData();
        if (!preparedData) return;

        try {
            const { headers, rows } = preparedData;
            const capitalizedFileName = capitalizeFileName(fileName);

            // Convert data to CSV format
            let csvContent = headers.join(',') + '\n';
            rows.forEach(row => {
                csvContent += row.map(field => {
                    // Convert to string and handle special characters
                    const stringValue = String(field).replace(/"/g, '""');
                    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                        return `"${stringValue}"`;
                    }
                    return stringValue;
                }).join(',') + '\n';
            });

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, `${capitalizedFileName}.csv`);
        } catch (error) {
            console.error('CSV export error:', error);
            toast.error('Failed to export CSV');
        } finally {
            handleMenuClose();
        }
    };

    const downloadExcel = async () => {
        const preparedData = await prepareData();
        if (!preparedData) return;

        try {
            const { headers, rows } = preparedData;
            const capitalizedFileName = capitalizeFileName(fileName);
            const XLSX = await import('xlsx');

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

            const colWidths = headers.map((header, i) => {
                const maxContentLength = Math.max(
                    header.toString().length,
                    ...rows.map(row => (row[i] ? row[i].toString().length : 0))
                );
                return { wch: Math.min(Math.max(maxContentLength, 10), 50) };
            });
            ws['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
            XLSX.writeFile(wb, `${capitalizedFileName}.xlsx`);
        } catch (error) {
            console.error('Excel export error:', error);
            toast.error('Failed to export Excel');
        } finally {
            handleMenuClose();
        }
    };

    const downloadPDF = async (orientation = 'portrait') => {
        const preparedData = await prepareData();
        if (!preparedData) return;

        try {
            const { headers, rows } = preparedData;
            const capitalizedFileName = capitalizeFileName(fileName);
            const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
                import('jspdf'),
                import('jspdf-autotable')
            ]);
            const doc = new jsPDF({ orientation });

            doc.setFontSize(16);
            doc.text(capitalizedFileName, 14, 15);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

            autoTable(doc, {
                head: [headers],
                body: rows,
                startY: 30,
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                    halign: 'left',
                    valign: 'middle'
                },
                headStyles: {
                    fillColor: theme.palette.primary.main,
                    textColor: theme.palette.primary.contrastText,
                    fontStyle: 'bold',
                    halign: 'left',
                },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 'auto' },
                },
                margin: { top: 30 },
                theme: 'grid',
                tableWidth: 'auto',
                horizontalPageBreak: true,
            });

            doc.save(`${capitalizedFileName}.pdf`);
        } catch (error) {
            console.error('PDF export error:', error);
            toast.error('Failed to export PDF');
        } finally {
            handleMenuClose();
        }
    };

    return (
        <>
            <Tooltip title="Export data" arrow>
                <IconButton
                    onClick={handleMenuOpen}
                    size="small"
                    aria-label="export data"
                    disabled={isLoading}
                >
                    <DownloadRounded color="primary" />
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={downloadCSV} disabled={isLoading}>
                    <TableChartRounded fontSize="small" sx={{ mr: 1, color: theme.palette.primary.light }} /> Export CSV
                </MenuItem>
                <MenuItem onClick={downloadExcel} disabled={isLoading}>
                    <GridOnRounded fontSize="small" sx={{ mr: 1, color: theme.palette.primary.dark }} /> Export Excel
                </MenuItem>
                <MenuItem onClick={() => downloadPDF('portrait')} disabled={isLoading}>
                    <PictureAsPdfRounded fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} /> PDF (Portrait)
                </MenuItem>
                <MenuItem onClick={() => downloadPDF('landscape')} disabled={isLoading}>
                    <PictureAsPdfRounded fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} /> PDF (Landscape)
                </MenuItem>
            </Menu>
        </>
    );
};

export default DataExporter;