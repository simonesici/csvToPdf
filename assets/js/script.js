function FormViewManager() {
    var self = this;
    self.id = ko.observable('');
    self.selectedId = ko.observable('');
    self.file = ko.observable(null);
    self.csvData = ko.observableArray([]);
    self.csvDataFromatt = ko.observableArray([]);
    self.showInfo = ko.observable(false);
    self.currentDate = ko.observable('');
    self.headers = ko.observableArray([]);
    self.contents = ko.observableArray([]);

    self.scrollToInput = function(inputId) {
        var inputElement = document.getElementById(inputId);
        if (inputElement) {
            inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            inputElement.focus();
        }
    };

    self.validateForm = function(){
        let flagOk = true;
        let flagOut = true;
        var id;
        let i = 0;

        if(formViewManager.contents().length > 0){
            $.each(self.contents(), function(ix, item){
                
            });

            while (i < self.contents().length && flagOut) {
                if(self.contents()[i].selectedCondition() == undefined){
                    flagOk = false;
                    flagOut = false;
                    id=self.contents()[i].assetId();
                }
                i = i + 1;
            }

            if(flagOk){
                generatePdf();
            } else {
                self.scrollToInput('conditionSelect'+id);
            }
        }
    };

    self.fileChanged = function (element, event) {
        var file = event.target.files[0];
        self.file(file);
    };

    self.submitForm = function () {
        var id = self.id();
        var file = self.file();
        var currentDate = new Date().toLocaleString();

        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var text = e.target.result;

                var rows = text.split('\n').filter(row => row.trim() !== '');
                var headers = rows[0].split(',');
/*
                var data = rows.slice(1).map(row => {
                    
                    var values = row.split(',');
                    self.contents.push(new CustomerModel(values));

                    return headers.reduce((obj, header, index) => {
                        obj[header.trim()] = values[index].trim();
                        return obj;
                    }, {});
                });
*/
                var t = self.csvToJson(text);

                $.each(t, function(ix, item) {
                    self.contents.push(new CustomerModel(item));
                }); 

                self.csvData(t);
                self.showInfo(true);
                self.headers(headers);
                self.currentDate(currentDate);
                self.selectedId(self.id());

                document.getElementById('csvForm').reset();
                self.id('');
                self.file(null);
            };
            reader.readAsText(file);
        } else {
            alert('Per favore, seleziona un file CSV.');
        }
    };

    self.csvToJson = function(text, quoteChar = '"', delimiter = ","){
        text = text.trim()
        let rows = text.split("\n")
        let headers = rows[0].split(",")

        $.each(headers, function(ix, item) {
            headers[ix]=item.replaceAll(' ','').replaceAll('/','').replaceAll('"','').replaceAll('(','').replaceAll(')','')
        });

        const regex = new RegExp(`\\s*(${quoteChar})?(.*?)\\1\\s*(?:${delimiter}|$)`, "gs")
        const match = (line) => {
            const matches = [...line.matchAll(regex)].map((m) => m[2])
            // Ensure matches length matches headers length by padding with null values
            const paddedMatches = Array.from({ length: headers.length }, (_, i) => matches[i] ?? null)
            return paddedMatches
        }
        let lines = text.split("\n")
        const heads = headers ?? match(lines.shift())
        lines = lines.slice(1)

        return lines.map((line) => {
            return match(line).reduce((acc, cur, i) => {
                // replace blank matches with `null`
                const val = cur === null || cur.length <= 0 ? null : Number(cur) || cur
                const key = heads[i] ?? `{i}`
                return { ...acc, [key]: val }
            }, {})
        })
    };
}


/*start test
let x =row;
let regex = /"(.*?)(?<!\\)"/g;
let y = [];
let match;
while ((match = regex.exec(x)) !== null) {
    y.push(match[1]);
}
end test */