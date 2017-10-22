var map;
var infoWindow;
var bounds;

function initMap() {
    var rourkela = {
      "lat": 22.260067,
      "lng": 84.854809
    };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 3,
        center: rourkela,
        mapTypeControl: false
    });
    infoWindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();
    ko.applyBindings(new ViewModel());
}

function onError() {
    alert('An error occurred with Google Maps!');
}

var LocationMarker = function(data) {
    var self = this;

    this.title = data.title;
    this.position = data.location;
    this.street = '',
    this.city = '',
    this.phone = '';

    this.visible = ko.observable(true);

    var icon = markerIcon('1191ff');
    var highlightedIcon = markerIcon('BBBB24');
    var id = '0FGZHSJJQZ52CWQ2NFDXZNRECQ0YHODVLQIEGF1DXC1VG4NM';
    var secret = 'C01R0AI41I0OSFXJBSGZODPGSXHSYBQYBWXI0W3AAK4WJ4YE';
    var url = 'https://api.foursquare.com/v2/venues/search?ll=' + this.position.lat + ',' + this.position.lng + '&client_id=' + id + '&client_secret=' + secret + '&v=20171021' + '&query=' + this.title;

    $.getJSON(url).done(function(data) {
		var results = data.response.venues[0];
        self.street = results.location.formattedAddress[0] ? results.location.formattedAddress[0]: 'N/A';
        self.city = results.location.formattedAddress[1] ? results.location.formattedAddress[1]: 'N/A';
        self.phone = results.contact.formattedPhone ? results.contact.formattedPhone : 'N/A';
    }).fail(function() {
        alert('Something went wrong with foursquare');
    });

    this.marker = new google.maps.Marker({
        position: this.position,
        title: this.title,
        animation: google.maps.Animation.DROP,
        icon: icon
    });

    self.filterMarkers = ko.computed(function () {
        if(self.visible() === true) {
            self.marker.setMap(map);
            bounds.extend(self.marker.position);
            map.fitBounds(bounds);
        } else {
            self.marker.setMap(null);
        }
    });

    this.marker.addListener('click', function() {
        populate(this, self.street, self.city, self.phone, infoWindow);
        toggle(this);
        map.panTo(this.getPosition());
    });

    this.show = function(location) {
        google.maps.event.trigger(self.marker, 'click');
    };

    this.bounce = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};

};

var ViewModel = function() {
    var self = this;
    this.searchItem = ko.observable('');
    this.mapList = ko.observableArray([]);
    locations.forEach(function(location) {
        self.mapList.push( new LocationMarker(location) );
    });

    this.locationList = ko.computed(function() {
        var searchFilter = self.searchItem().toLowerCase();
        if (searchFilter) {
            return ko.utils.arrayFilter(self.mapList(), function(location) {
                var str = location.title.toLowerCase();
                var result = str.includes(searchFilter);
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
function populate(marker, street, city, phone, info) {
    if (info.marker != marker) {
        info.setContent('');
        info.marker = marker;
        info.addListener('closeclick', function() {
            info.marker = null;
        });
        var streetViewService = new google.maps.StreetViewService();
        var radius = 40;

        var windowContent = '<h3>' + marker.title + '</h3>' +
            '<p>' + street + "<br>" + city + '<br>' + phone + "</p>";
        var getStreetView = function (data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                infowindow.setContent(windowContent + '<div id="pano"></div>');
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 20
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent(windowContent + '<div style="color: red">No Street View Found</div>');
            }
        };
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        infowindow.open(map, marker);
    }
}

function toggle(marker) {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        marker.setAnimation(null);
    }, 1000);
  }
}

function markerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(15, 21),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}
