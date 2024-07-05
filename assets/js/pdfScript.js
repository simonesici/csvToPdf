async function generatePdf() {
    if (formViewManager.contents().length > 0) {
        // Crea un nuovo documento PDF
        const pdfDoc = await PDFLib.PDFDocument.create();
        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const pageMargin = 6;

        // Dimensioni della pagina A4 in punti (595.28 x 841.89)
        let page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Definisci i dati delle tabelle
        const tableData = generateTableData();
        const secondTable = generateSecondTableData();

        const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);

        let y = buildTable(pdfDoc, page, tableData, font, pageWidth, pageHeight, pageMargin);

        // Spazio tra le tabelle
        y -= 30;

        if (y < pageMargin + 35) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - pageMargin;
        }

        buildSecondTable(pdfDoc, page, secondTable, font, pageWidth, pageHeight, pageMargin, y);

        // Serializza il documento PDF in un blob
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });

        // Crea un URL per il blob
        const url = URL.createObjectURL(blob);

        // Crea un link per scaricare il PDF
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tabella.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

function generateTableData() {
    const tableData = [
        ['ASSET ID', 'ASSET LOCATION', 'ASSET SERIAL NUMBER', 'STATE CONDITION']
    ];

    $.each(formViewManager.contents(), function (ix, item) {
        let t = item.selectedCondition() != undefined && item.selectedCondition() != null ? item.selectedCondition() : { text: '', color: 'white' };
        let o = [item.assetId(), item.location(), item.upsSerialNumber(), t];
        tableData.push(o);
    });

    return tableData;
}

function generateSecondTableData() {
    const secondTable = [
        ['ASSET ID', 'ASSET LOCATION', 'Equipment Electronics Status', 'Battery Status', 'Overall Status', 'Recommendation']
    ];

    $.each(formViewManager.contents(), function (ix, item) {
        let o2 = [item.assetId(), item.location(), '', '', '', item.note()];
        secondTable.push(o2);
    });

    return secondTable;
}

function buildTable(pdfDoc, page, tableData, font, pageWidth, pageHeight, pageMargin) {
    const cellPadding = 5;
    const cellHeight = 35;
    const cellWidth = [85, 165, 185, 150]; // Larghezze personalizzate per le colonne
    const startX = pageMargin;
    let y = pageHeight - pageMargin;
    const rowsPerPage = Math.floor((pageHeight - 2 * pageMargin) / cellHeight);

    tableData.forEach((row, rowIndex) => {
        if (rowIndex % rowsPerPage === 0 && rowIndex !== 0) {
            y = pageHeight - pageMargin;
            page = pdfDoc.addPage([pageWidth, pageHeight]);
        }

        let x = startX;
        row.forEach((cell, cellIndex) => {
            const width = cellWidth[cellIndex];

            if (rowIndex === 0) {
                page.drawRectangle({
                    x: x,
                    y: y - cellHeight,
                    width: width,
                    height: cellHeight,
                    color: PDFLib.rgb(0.1, 0.29, 0.49) // Colore blu chiaro per l'header
                });
            }

            const textY = y - cellPadding - 2;

            drawTextInCell(cell, x, textY, width - 2 * cellPadding, rowIndex === 0, font, page, cellPadding, 9);

            if (rowIndex > 0 && cellIndex === 3) {
                let circleColor = PDFLib.rgb(1, 1, 1);

                if (cell.color === "red") {
                    circleColor = PDFLib.rgb(1, 0, 0);
                }
                if (cell.color === "orange") {
                    circleColor = PDFLib.rgb(1, 0.5, 0);
                }
                if (cell.color === "yellow") {
                    circleColor = PDFLib.rgb(1, 1, 0);
                }
                if (cell.color === "green") {
                    circleColor = PDFLib.rgb(0, 0.4, 0);
                }

                const circleX = x + width - cellPadding - 10;
                const circleY = textY;
                drawColoredCircle(circleX, circleY, circleColor, page);
            }

            page.drawRectangle({
                x: x,
                y: y - cellHeight,
                width: width,
                height: cellHeight,
                borderColor: PDFLib.rgb(0, 0, 0),
                borderWidth: 0.6
            });
            x += width;
        });
        y -= cellHeight;
    });

    return y;
}

function buildSecondTable(pdfDoc, page, secondTable, font, pageWidth, pageHeight, pageMargin, startY) {
    const cellPadding = 5;
    const cellHeight = 35;
    const cellWidthSecondTable = [85, 165, 100, 100, 100, 200]; // Larghezze personalizzate per le colonne della seconda tabella
    const startX = pageMargin;
    let y = startY;
    const rowsPerPage = Math.floor((pageHeight - 2 * pageMargin) / cellHeight);

    secondTable.forEach((row, rowIndex) => {
        if (rowIndex % rowsPerPage === 0 && rowIndex !== 0) {
            y = pageHeight - pageMargin;
            page = pdfDoc.addPage([pageWidth, pageHeight]);
        }

        let x = startX;
        let rowHeight = cellHeight;
        row.forEach((cell, cellIndex) => {
            if (cellIndex != 5) {
                const width = cellWidthSecondTable[cellIndex];

                if (rowIndex === 0) {
                    page.drawRectangle({
                        x: x,
                        y: y - cellHeight,
                        width: width,
                        height: cellHeight,
                        color: PDFLib.rgb(0.1, 0.29, 0.49) // Colore blu per l'header
                    });
                }

                const textY = y - cellPadding - 2;

                drawTextInCell(cell, x, textY, width - 2 * cellPadding, rowIndex === 0, font, page, cellPadding, 9);

                const textHeight = getTextWidth(cell, 12, font) / width * 12;
                if (textHeight > rowHeight) {
                    rowHeight = textHeight;
                }

                if (rowIndex > 0 && (cellIndex === 2 || cellIndex === 3 || cellIndex === 4)) {
                    const options = ['POOR', 'AVERAGE', 'GOOD', 'EXCELLENT'];
                    const fieldWidth = width - 2 * cellPadding;
                    const fieldHeight = cellHeight - 2 * cellPadding;
                    const fieldX = x + cellPadding;
                    const fieldY = textY + 8;

                    const form = pdfDoc.getForm();
                    const dropdown = form.createDropdown('form.' + cellIndex + '.' + rowIndex)
                    dropdown.setOptions(options)
                    dropdown.select('POOR')

                    dropdown.addToPage(page, {
                        x: fieldX,
                        y: textY - 20,
                        width: fieldWidth + 2,
                        height: fieldHeight - 13,
                        textColor: PDFLib.rgb(0, 0, 0),
                        backgroundColor: PDFLib.rgb(1, 1, 1),
                        borderColor: PDFLib.rgb(0, 0, 0),
                        borderWidth: 1,
                        rotate: PDFLib.degrees(0),
                        font: font
                    })
                }

                page.drawRectangle({
                    x: x,
                    y: y - cellHeight,
                    width: width,
                    height: cellHeight,
                    borderColor: PDFLib.rgb(0, 0, 0),
                    borderWidth: 0.6
                });

                x += width;
            }
        });

        if (rowIndex > 0) {
            let recommendation = row[5];
            y -= rowHeight + cellPadding;
            const textHeight = drawBulletList(recommendation, startX, y - cellPadding, pageWidth - 2 * pageMargin, font, page, cellPadding);
            y -= textHeight + cellPadding;
        } else {
            y -= rowHeight;
        }
    });
}

function drawColoredCircle(x, y, color, page) {
    page.drawCircle({
        x: x,
        y: y,
        size: 5,
        color: color,
    });
}

function getTextWidth(text, fontSize) {
    const averageCharWidth = fontSize * 0.5;
    return text.length * averageCharWidth;
}

function drawTextInCell(text, x, y, width, isHeader = false, font = null, page, cellPadding, fontSize) {
    text = typeof text === 'number' ? '' + text : text;
    const words = typeof text === 'object' ? text.text : text.split(' ');
    let line = '';
    const lines = [];

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        if (testWidth > width && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    lines.forEach((line, index) => {
        let textX = x + cellPadding;
        if (isHeader) {
            textX = x + (width - font.widthOfTextAtSize(line.trim(), fontSize)) / 2;
        }
        page.drawText(line.trim(), {
            x: textX,
            y: y - cellPadding - (index * (fontSize + 2)),
            size: fontSize,
            color: isHeader ? PDFLib.rgb(1, 1, 1) : PDFLib.rgb(0, 0, 0),
            font: font
        });
    });
}

function drawBulletList(text, x, y, width, font, page, cellPadding) {
    const fontSize = 9;
    let lines = text.split('\n');

    // Wrap lines if necessary
    const wrappedLines = [];
    lines.forEach(line => {
        let currentLine = '';
        line.split(' ').forEach(word => {
            const testLine = currentLine + word + ' ';
            const testWidth = font.widthOfTextAtSize(testLine, fontSize);
            if (testWidth > width - 2 * cellPadding) {
                wrappedLines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        });
        wrappedLines.push(currentLine.trim());
    });

    let textY = y;
    wrappedLines.forEach((line) => {
        page.drawText(line, {
            x: x + cellPadding,
            y: textY,
            size: fontSize,
            color: PDFLib.rgb(0, 0, 0),
            font: font
        });
        textY -= fontSize + 2;
    });

    return wrappedLines.length * (fontSize + 2);
}

$(document).ready(function () {
    document.getElementById('generatePdfBtn').addEventListener('click', generatePdf);
});
