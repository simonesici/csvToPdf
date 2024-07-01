async function generatePdf() {
    // Crea un nuovo documento PDF
    const pdfDoc = await PDFLib.PDFDocument.create();

    // Dimensioni della pagina A4 in punti (595.28 x 841.89)
    let page = pdfDoc.addPage([595.28, 841.89]);

    // Definisci i dati della tabella
    const tableData = [
        ['AssetID', 'Asset Location', 'Asset Serial Number', 'State']
    ];


    if(formViewManager.contents().length>0){
        $.each(formViewManager.contents(), function(ix, item) {
            let t = item.selectedCondition() != undefined && item.selectedCondition() != null?item.selectedCondition():{text:'',color:'white'};
            let o = [item.assetId(),item.location(),item.location(),t];
            tableData.push(o);
        });
    
        // Impostazioni per la tabella
        const cellPadding = 5;
        const cellHeight = 35;
        const cellWidth = [85, 170, 200, 130]; // Larghezze personalizzate per le colonne
        const startX = 5;
        const startY = 820; // Riduci lo spazio tra l'inizio della pagina e la tabella
        let y = startY;
    
        // Funzione per calcolare la larghezza stimata del testo
        function getTextWidth(text, fontSize) {
            const averageCharWidth = fontSize * 0.5; // Larghezza media di un carattere
            return text.length * averageCharWidth;
        }
    
        // Funzione per gestire il testo in overflow
        function drawTextInCell(text, x, y, width) {
            const fontSize = 8;
            const words = typeof text === 'object'? text.text : text.split(' ');
            let line = '';
            const lines = [];
    
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const testWidth = getTextWidth(testLine, fontSize);
                if (testWidth > width && n > 0) {
                    lines.push(line);
                    line = words[n] + ' ';
                } else {
                    line = testLine;
                }
            }
            lines.push(line);
    
            lines.forEach((line, index) => {
                page.drawText(line.trim(), {
                    x: x + cellPadding,
                    y: y - cellPadding - (index * (fontSize + 2)),
                    size: fontSize,
                    color: PDFLib.rgb(0, 0, 0)
                });
            });
        }
    
        // Funzione per disegnare i cerchi colorati
        function drawColoredCircle(x, y, color) {
            page.drawCircle({
                x: x,
                y: y,
                size: 5,
                color: color,
            });
        }
    
        // Aggiungi celle della tabella al PDF
        tableData.forEach((row, rowIndex) => {
            let x = startX;
            row.forEach((cell, cellIndex) => {
                // Calcola la larghezza della cella
                const width = cellWidth[cellIndex];
    
                // Calcola la posizione Y corretta per il testo
                const textY = y - (rowIndex * cellHeight) - cellPadding - 2;
    
                // Disegna il testo nella cella
                drawTextInCell(cell, x, textY, width - 2 * cellPadding);
    
                // Se la cella è nella colonna "State", aggiungi il cerchio colorato
                if (rowIndex > 0 && cellIndex === 3) {
                    let circleColor = PDFLib.rgb(1, 1, 1);
                    //cell === 'Active' ? PDFLib.rgb(0, 1, 0) : PDFLib.rgb(1, 0, 0);
                    
                    if(cell.color==="red"){
                        circleColor = PDFLib.rgb(1, 0, 0);
                    }
                    if(cell.color==="orange"){
                        circleColor = PDFLib.rgb(1, 0.5, 0);
                    }
                    if(cell.color==="yellow"){
                        circleColor = PDFLib.rgb(1, 1, 0);
                    }
                    if(cell.color==="green"){
                        circleColor = PDFLib.rgb(0, 0.4, 0);
                    }
    
                    const circleX = x + width - cellPadding - 10; // Regola la posizione X del cerchio
                    const circleY = textY; // Regola la posizione Y del cerchio
                    drawColoredCircle(circleX, circleY, circleColor);
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


$(document).ready(function() {

    document.getElementById('generatePdfBtn').addEventListener('click', generatePdf);

});