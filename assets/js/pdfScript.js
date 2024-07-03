async function generatePdf() {
    if (formViewManager.contents().length > 0) {
        // Crea un nuovo documento PDF
        const pdfDoc = await PDFLib.PDFDocument.create();

        // Dimensioni della pagina A4 in punti (595.28 x 841.89)
        let page = pdfDoc.addPage([595.28, 841.89]);

        // Definisci i dati della tabella
        const tableData = [
            ['ASSET ID', 'ASSET LOCATION', 'ASSET SERIAL NUMBER', 'STATE CONDITION']
        ];

        //carico i dati nella dataTable presi dal csv
        $.each(formViewManager.contents(), function (ix, item) {
            let t = item.selectedCondition() != undefined && item.selectedCondition() != null ? item.selectedCondition() : { text: '', color: 'white' };
            let o = [item.assetId(), item.location(), item.upsSerialNumber(), t];
            tableData.push(o);
        });

        const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
        buildTable(pdfDoc, page, tableData, font);

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

function buildTable(pdfDoc, page, tableData, font) {
    // Impostazioni per la tabella
    const cellPadding = 5;
    const cellHeight = 35;
    const cellWidth = [85, 165, 185, 150]; // Larghezze personalizzate per le colonne
    const startX = 5;
    const startY = 820; // Riduci lo spazio tra l'inizio della pagina e la tabella
    let y = startY;


    // Aggiungi celle della tabella al PDF
    tableData.forEach((row, rowIndex) => {
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
                    color: PDFLib.rgb(0.1, 0.29, 0.49) // Colore grigio chiaro per l'header
                });
            }

            // Calcola la posizione Y corretta per il testo
            const textY = y - (rowIndex * cellHeight) - cellPadding - 2;

            // Disegna il testo nella cella
            drawTextInCell(cell, x, textY, width - 2 * cellPadding, rowIndex === 0, font, page, cellPadding);

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
                y: y - (rowIndex * cellHeight),
                width: width,
                height: -cellHeight,
                borderColor: PDFLib.rgb(0, 0, 0),
                borderWidth: 0.6
            });
            x += width;
        });

        // Controlla se la tabella fuoriesce dalla pagina
        if (y - (rowIndex + 1) * cellHeight < 0) {
            // Se sì, aggiungi una nuova pagina e resetta Y
            y = startY;
            page = pdfDoc.addPage([595.28, 841.89]);
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
function drawTextInCell(text, x, y, width, isHeader = false, font = null, page, cellPadding) {
    const fontSize = 9;
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
                y: y - cellPadding - (index * (fontSize + 2)) - 7,
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

$(document).ready(function () {

    document.getElementById('generatePdfBtn').addEventListener('click', generatePdf);

});