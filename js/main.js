var map;
var infoWindow;
var bounds;

var locations = [{
        title: "The Central Park",
        location: { "lat":22.225206,  "lng": 84.862287 },
        "fs_id": "4eb15f4f9adf1abeffbd2fe4"
    },
];



function getContent(location) {
  console.log("get content called");
  var id = '0FGZHSJJQZ52CWQ2NFDXZNRECQ0YHODVLQIEGF1DXC1VG4NM';
  var secret = 'C01R0AI41I0OSFXJBSGZODPGSXHSYBQYBWXI0W3AAK4WJ4YE';
  var url = 'https://api.foursquare.com/v2/venues/search?ll=' + location.position.lat + ',' + location.position.lng + '&client_id=' + id + '&client_secret=' + secret + '&v=20171021' + '&query=' + location.title;
  $.getJSON(url).done(function(data) {
  var results = data.response.venues[0];
      location.street = results.location.formattedAddress[0] ? results.location.formattedAddress[0]: 'N/A';
      location.city = results.location.formattedAddress[1] ? results.location.formattedAddress[1]: 'N/A';
      location.phone = results.contact.formattedPhone ? results.contact.formattedPhone : 'N/A';
  }).fail(function() {
      alert('foursquare Error');
  });
  console.log("location=========");
  console.log(location);
}


var LocationMarker = function(data) {
    var self = this;
    this.title = data.title;
    this.position = data.location;
    this.street = '',
    this.city = '',
    this.phone = '';
    this.visible = ko.observable(true);
    var icon = marker('1191ff');
    var highlight = marker('BBBB24');
    //get the ajax call
    getContent(this);
    this.marker = new google.maps.Marker({
        position: this.position,
        title: this.title,
        animation: google.maps.Animation.BOUNCE,
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
        map.panTo(this.getPosition());
    });

    this.show = function(location) {
        google.maps.event.trigger(self.marker, 'click');
    };

    this.bounce = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};

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
                infoWindow.setContent(windowContent + '<div id="pano"></div>');
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
                infoWindow.setContent(windowContent + '<div style="color: red">No Street View Found</div>');
            }
        };
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        infoWindow.open(map, marker);
    }
}

function marker(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(15, 21),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}

function initialize() {
    "use strict";
    //console.log("init map is being called");
    var rourkela = {
      "lat": 22.260067,
      "lng": 84.854809
    };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 5,
        center: rourkela,
        mapTypeControl: false,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        }
    });
    infoWindow = new google.maps.InfoWindow({
      maxWidth : 150,
      content : ""
    });
    bounds = new google.maps.LatLngBounds();
    map.addListener("click", function() {
      infoWindow.close(infoWindow);
    });
    window.onresize = function() {
      map.fitBounds(bounds);
    }
    ko.applyBindings(new ViewModel());
}
