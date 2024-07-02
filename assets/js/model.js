function CustomerModel(props){
    var self = this;

    if(props===undefined){
        props={}
    }

    self.constructorType = "CustomerModel";

    self.assetId = ko.observable(props[1]);
    self.assetType = ko.observable(props[0]);
    self.location = ko.observable(props[2]);
    self.upsSerialNumber = ko.observable(props[3]);
    self.equipmentBrand = ko.observable(props[4]);
    self.equipmentModel = ko.observable(props[5]);
    self.currentCapacity = ko.observable(props[6]);
    self.assetNumber = ko.observable(props[7]);
    self.upsType = ko.observable(props[8]);
    self.coldStart = ko.observable(props[9]);
    self.serviceLevel = ko.observable(props[10]);
    self.result = ko.observable(props[11]);
    self.note = ko.observable('');
    self.selectedCondition = ko.observable('');
    self.conditions = [
        { text: 'POOR CONDITION', color: 'red' },
        { text: 'AVERAGE CONDITION', color: 'orange' },
        { text: 'GOOD CONDITION', color: 'yellow' },
        { text: 'EXCELLENT CONDITION', color: 'green' }
    ];

    self.test = ko.computed(function(){
        var n = 100;
        return n+" %";
    });

    self.getModelData = function() {
        var data = {
            assetId: self.assetId(),
            assetType: self.assetType(),
            location: self.location(),
            upsSerialNumber: self.upsSerialNumber(),
            equipmentBrand: self.equipmentBrand(),
            equipmentModel: self.equipmentModel(),
            currentCapacity: self.currentCapacity(),
            assetNumber: self.assetNumber(),
            upsType: self.upsType(),
            coldStart: self.coldStart(),
            serviceLevel: self.serviceLevel(),
            result: self.result()
        };
        return data;
    };
}