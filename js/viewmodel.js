var ViewModel = function() {
    var self = this;
    this.items = ko.observable('');
    this.mapList = ko.observableArray([]);
    locations.forEach(function(location) {
        self.mapList.push( new LocationMarker(location) );
    });

    this.locationList = ko.computed(function() {
        var filter = self.items().toLowerCase();
        if (filter) {
            return ko.utils.arrayFilter(self.mapList(), function(location) {
                var str = location.title.toLowerCase();
                var result = str.includes(filter);
                location.visible(result);
				return result;
			});
        }
        self.mapList().forEach(function(location) {
            location.visible(true);
        });
        return self.mapList();
    }, self);
};
