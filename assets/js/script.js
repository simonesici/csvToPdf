function FormViewManager() {
    var self = this;
    self.id = ko.observable('');
    self.selectedId = ko.observable('');
    self.file = ko.observable(null);
    self.csvData = ko.observableArray([]);
    self.showInfo = ko.observable(false);
    self.currentDate = ko.observable('');
    self.headers = ko.observableArray([]);
    self.contents = ko.observableArray([]);

    self.fileChanged = function(element, event) {
        var file = event.target.files[0];
        self.file(file);
    };

    self.submitForm = function() {
        var id = self.id();
        var file = self.file();
        var currentDate = new Date().toLocaleString();

        if (file) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var text = e.target.result;
                var rows = text.split('\n').filter(row => row.trim() !== '');
                var headers = rows[0].split(',');

                var data = rows.slice(1).map(row => {
                    var values = row.split(',');
                    self.contents.push(new CustomerModel(values));

                    return headers.reduce((obj, header, index) => {
                        obj[header.trim()] = values[index].trim();
                        return obj;
                    }, {});
                });

                self.csvData(data);
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
}

