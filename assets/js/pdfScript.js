async function generatePdf() {
    if (formViewManager.contents().length > 0) {

        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const pageMargin = 6;

        // Crea un nuovo documento PDF
        const pdfDoc = await PDFLib.PDFDocument.create();

        // Dimensioni della pagina A4 in punti (595.28 x 841.89)
        let page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Definisci i dati della tabelle
        const tableData = [
            ['ASSET ID', 'ASSET LOCATION', 'ASSET SERIAL NUMBER', 'STATE CONDITION']
        ];

        const secondTable = [
            ['ASSET ID', 'ASSET LOCATION', 'Equipment Electronics Status', 'Battery Status', 'Overall Status', 'Recommendation']
        ];

        //carico i dati nella dataTable presi dal csv
        $.each(formViewManager.contents(), function (ix, item) {
            let t = item.selectedCondition() != undefined && item.selectedCondition() != null ? item.selectedCondition() : { text: '', color: 'white' };
            let o = [item.assetId(), item.location(), item.upsSerialNumber(), t];
            tableData.push(o);

            let o2 = [item.assetId(), item.location(), '', '', '', item.note()];
            secondTable.push(o2);
        });

        const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);

        buildTable(pdfDoc, page, tableData, font, pageWidth, pageHeight, pageMargin, secondTable);

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

function buildTable(pdfDoc, page, tableData, font, pageWidth, pageHeight, pageMargin, secondTable) {
    // Impostazioni per la tabella
    const cellPadding = 5;
    const cellHeight = 35;
    const cellWidth = [85, 165, 185, 150]; // Larghezze personalizzate per le colonne
    const cellWidthSecondTable = [85, 165, 100, 100, 100]; // Larghezze personalizzate per le colonne della seconda tabella
    const startX = pageMargin;
    const startY = pageHeight - pageMargin;
    const rowsPerPage = Math.floor((pageHeight - 2 * pageMargin) / cellHeight);
    let y = startY;


    // Aggiungi celle della tabella al PDF
    tableData.forEach((row, rowIndex) => {
        if (rowIndex % rowsPerPage === 0 && rowIndex !== 0) {
            y = startY;
            page = pdfDoc.addPage([pageWidth, pageHeight]);
        }

        let x = startX;
        row.forEach((cell, cellIndex) => {
            // Calcola la larghezza della cella
            const width = cellWidth[cellIndex];

            // Se è la prima riga (header), colora lo sfondo
            if (rowIndex === 0) {
                page.drawRectangle({
                    x: x,
                    y: y - cellHeight,
                    width: width,
                    height: cellHeight,
                    color: PDFLib.rgb(0.1, 0.29, 0.49) // Colore blu chiaro per l'header
                });
            }

            // Calcola la posizione Y corretta per il testo
            const textY = y - (rowIndex % rowsPerPage) * cellHeight - cellPadding - 2;

            // Disegna il testo nella cella
            drawTextInCell(cell, x, textY, width - 2 * cellPadding, rowIndex === 0, font, page, cellPadding, 9);

            // Se la cella è nella colonna "State", aggiungi il cerchio colorato
            if (rowIndex > 0 && cellIndex === 3) {
                let circleColor = PDFLib.rgb(1, 1, 1);
                //cell === 'Active' ? PDFLib.rgb(0, 1, 0) : PDFLib.rgb(1, 0, 0);

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

                const circleX = x + width - cellPadding - 10; // Regola la posizione X del cerchio
                const circleY = textY; // Regola la posizione Y del cerchio
                drawColoredCircle(circleX, circleY, circleColor, page);
            }

            // Disegna i bordi delle celle
            page.drawRectangle({
                x: x,
                y: y - (rowIndex % rowsPerPage) * cellHeight,
                width: width,
                height: -cellHeight,
                borderColor: PDFLib.rgb(0, 0, 0),
                borderWidth: 0.6
            });
            x += width;
        });
    });


    // Spazio tra le tabelle
    y -= (tableData.length % rowsPerPage) * cellHeight + 30;

    page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Aggiungi celle della seconda tabella al PDF
    secondTable.forEach((row, rowIndex) => {
        if (rowIndex % rowsPerPage === 0 && rowIndex !== 0) {
            y = startY;
            page = pdfDoc.addPage([pageWidth, pageHeight]);
        }
        let x = startX;

        let rowHeight = cellHeight;
        row.forEach((cell, cellIndex) => {
            if (cellIndex != 5) {
                // Calcola la larghezza della cella
                const width = cellWidthSecondTable[cellIndex];

                // Se è la prima riga (header), colora lo sfondo
                if (rowIndex === 0) {
                    page.drawRectangle({
                        x: x,
                        y: y - cellHeight,
                        width: width,
                        height: cellHeight,
                        color: PDFLib.rgb(0.1, 0.29, 0.49) // Colore blu per l'header
                    });
                }

                // Calcola la posizione Y corretta per il testo
                const textY = y - (rowIndex % rowsPerPage) * cellHeight - cellPadding - 2;

                // Disegna il testo nella cella, centrando l'header
                drawTextInCell(cell, x, textY, width - 2 * cellPadding, rowIndex % rowsPerPage === 0, font, page, cellPadding, 9);

                // Aumenta l'altezza della riga se necessario
                const textHeight = (getTextWidth(cell, 12, font)) / width * 12;
                if (textHeight > rowHeight) {
                    rowHeight = textHeight;
                }

                // Se la cella è una delle colonne di stato, aggiungi un campo di selezione
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

                // Disegna i bordi delle celle
                page.drawRectangle({
                    x: x,
                    y: y - (rowIndex % rowsPerPage) * cellHeight,
                    width: width,
                    height: -cellHeight,
                    borderColor: PDFLib.rgb(0, 0, 0),
                    borderWidth: 1
                });
                x += width;
            }
        });

        // Aggiungi la riga delle raccomandazioni
        if(rowIndex > 0){
            let recommendation = row[5];
            const textHeight = drawBulletList(recommendation, startX, y - (rowHeight ) - cellPadding, pageWidth - 2 * pageMargin, font, page, cellPadding);
            if (textHeight > rowHeight) {
                rowHeight = textHeight;
            }
            y -= rowHeight + cellPadding;
        }
    });
}

// Funzione per disegnare i cerchi colorati
function drawColoredCircle(x, y, color, page) {
    page.drawCircle({
        x: x,
        y: y,
        size: 5,
        color: color,
    });
}

// Funzione per calcolare la larghezza stimata del testo
function getTextWidth(text, fontSize) {
    const averageCharWidth = fontSize * 0.5; // Larghezza media di un carattere
    return text.length * averageCharWidth;
}

// Funzione per gestire il testo in overflow
function drawTextInCell(text, x, y, width, isHeader = false, font = null, page, cellPadding, fontSize) {
    text = typeof text === 'number' ? '' + text : text;
    const words = typeof text === 'object' ? text.text : text.split(' ');
    let line = '';
    const lines = [];

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        if (font) {
            const testWidth = font.widthOfTextAtSize(testLine, fontSize);
            if (testWidth > width && n > 0) {
                lines.push(line);
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        } else {
            const testWidth = getTextWidth(testLine, fontSize, font);
            if (testWidth > width && n > 0) {
                lines.push(line);
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
    }
    lines.push(line);

    lines.forEach((line, index) => {
        let textX = x + cellPadding;

        if (isHeader) {
            textX = x + (width - font.widthOfTextAtSize(line.trim(), fontSize)) / 2;

            page.drawText(line.trim(), {
                x: textX,
                y: y - cellPadding - (index * (fontSize + 2)) - 1,
                size: fontSize,
                color: PDFLib.rgb(1, 1, 1),
                font: font
            });
        } else {
            page.drawText(line.trim(), {
                x: textX,
                y: y - cellPadding - (index * (fontSize + 2)),
                size: fontSize,
                color: PDFLib.rgb(0, 0, 0),
                font: font
            });
        }
    });
}

// Funzione per gestire il testo della colonna 'Recommendation'
function drawBulletList(text, x, y, width, font, page, cellPadding) {
    const fontSize = 9;
    const lines = text.split('\n');
    let textY = y;
    lines.forEach((line) => {
        page.drawText(line, {
            x: x + cellPadding,
            y: textY,
            size: fontSize,
            color: PDFLib.rgb(0, 0, 0),
            font: font
        });
        textY -= fontSize + 2;
    });
    return lines.length * (fontSize + 2);
}

$(document).ready(function () {

    document.getElementById('generatePdfBtn').addEventListener('click', generatePdf);

});