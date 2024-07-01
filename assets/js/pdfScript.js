async function generatePdf() {
    // Crea un nuovo documento PDF
    const pdfDoc = await PDFLib.PDFDocument.create();

    // Aggiungi una pagina al documento
    const page = pdfDoc.addPage([600, 400]);

    // Definisci i dati della tabella
    const tableData = [
        ['Nome', 'Cognome', 'Età'],
        ['Mario', 'Rossi', '30'],
        ['Luigi', 'Bianchi', '25'],
        ['Anna', 'Verdi', '28']
    ];

    // Impostazioni per la tabella
    const cellPadding = 10;
    const cellHeight = 20;
    const startX = 50;
    const startY = 350;
    let y = startY;

    // Aggiungi celle della tabella al PDF
    tableData.forEach((row, rowIndex) => {
        let x = startX;
        row.forEach((cell, cellIndex) => {
            // Disegna il testo
            page.drawText(cell, {
                x: x + cellPadding,
                y: y - cellPadding - (rowIndex * cellHeight),
                size: 12,
                color: PDFLib.rgb(0, 0, 0)
            });

            // Disegna i bordi delle celle
            page.drawRectangle({
                x: x,
                y: y - (rowIndex * cellHeight),
                width: 100,
                height: -cellHeight,
                borderColor: PDFLib.rgb(0, 0, 0),
                borderWidth: 1
            });
            x += 100;
        });
    });

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

$(document).ready(function() {

    document.getElementById('generatePdfBtn').addEventListener('click', generatePdf);

});

