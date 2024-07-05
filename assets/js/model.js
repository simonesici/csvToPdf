function CustomerModel(props){
    var self = this;

    if(props===undefined){
        props={}
    }

    self.constructorType = "CustomerModel";

    self.assetId = ko.observable(props.AssetID);
    self.assetType = ko.observable(props.AssetType);
    self.location = ko.observable(props.Location);
    self.upsSerialNumber = ko.observable(props.UPSFrameserialnumber);
    self.equipmentBrand = ko.observable(props.EquipmentBrand);
    self.equipmentModel = ko.observable(props.EquipmentModel);
    self.currentCapacity = ko.observable(props.CurrentCapacitykva);
    self.assetNumber = ko.observable(props.Customerassetnumber);
    self.upsType = ko.observable(props.UPSType);
    self.coldStart = ko.observable(props.ColdStart);
    self.serviceLevel = ko.observable(props.ServiceLevel);
    self.result = ko.observable(props.Result);
    self.note = ko.observable('');
    self.selectedCondition = ko.observable('');
    self.conditions = [
        { text: 'Urgent/Critical', color: 'red', code: 3 },
        { text: 'Improvement Required', color: 'yellow', code: 2 },
        { text: 'Non Urgent', color: 'orange', code: 1 },
        { text: 'No action required', color: 'green', code: 0 }
    ];

    self.test = ko.computed(function(){
        var n = 100;
        return n+" %";
    });

    self.errors = ko.observable({
        selectedCondition: ko.observable("")
    });

    self.isValid = function(callback){
        var e = [];
        self.errors().selectedCondition("");

        if ($.trim(self.selectedCondition()) == "") {
            var fieldNome = "selectedCondition";
            self.errors().descrizione('must be selected');
            e.push(fieldNome);
            callback(e.length == 0);
        }

        callback(e.length == 0);
    }

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