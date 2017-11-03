//locations which we want to display on the map
var locations = [{
        title: 'Shimla',
        location: {
            lat: 31.104814,
            lng: 77.173403
        }
    },
    {
        title: 'Ooty',
        location: {
            lat: 11.406414,
            lng: 76.693244
        }
    },
    {
        title: 'Kodaikanal',
        location: {
            lat: 10.238114,
            lng: 77.489182
        }
    },
    {
        title: 'Darjeeling',
        location: {
            lat: 27.036007,
            lng: 88.262675
        }
    },
    {
        title: 'Binsar',
        location: {
            lat: 29.704386,
            lng: 79.757212
        }
    },
    {
        title: 'Shillong',
        location: {
            lat: 25.578773,
            lng: 91.893254
        }
    }
];

var marker;
var infowindow;
var streetViewService;
var radius;
var getStreetView;

//if there is any error in running the application error message occurs
function mapLoadError() {
    alert('There is an error in loading the map!!!');
}

function initMap() {
    //used for custom styling of the map
    var styles = [{
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#ffffff"
            }]
        },
        {
            "featureType": "all",
            "elementType": "labels.text.stroke",
            "stylers": [{
                    "color": "#000000"
                },
                {
                    "lightness": 13
                }
            ]
        },
        {
            "featureType": "administrative",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#000000"
            }]
        },
        {
            "featureType": "administrative",
            "elementType": "geometry.stroke",
            "stylers": [{
                    "color": "#144b53"
                },
                {
                    "lightness": 14
                },
                {
                    "weight": 1.4
                }
            ]
        },
        {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{
                "color": "#08304b"
            }]
        },
        {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [{
                    "color": "#0c4152"
                },
                {
                    "lightness": 5
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#000000"
            }]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [{
                    "color": "#0b434f"
                },
                {
                    "lightness": 25
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#000000"
            }]
        },
        {
            "featureType": "road.arterial",
            "elementType": "geometry.stroke",
            "stylers": [{
                    "color": "#0b3d51"
                },
                {
                    "lightness": 16
                }
            ]
        },
        {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }]
        },
        {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [{
                "color": "#146474"
            }]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{
                "color": "#021019"
            }]
        }
    ];

    var map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 31.104814,
            lng: 77.173403
        },
        zoom: 15,
        styles: styles
    });

    var markers = [];
    infowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    locations.forEach(function(locations, i) {
        // Get the position from the location array.
        var position = locations.location;
        var title = locations.title;
        // Create a marker per location, and put into markers array.
        marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: 'https://www.google.com/mapfiles/marker_orange.png',
            i: i
        });

        //used for hiding the marker when the user inputs in the search box
        view.locationList()[i].marker = marker;

        // Push the marker to our array of markers.
        markers.push(marker);

        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function() {
            populateInfoWindow(this, infowindow);
        });

        //change the color of the marker when mouse is kept over
        marker.addListener('mouseover', function() {
            this.setIcon('https://www.google.com/mapfiles/marker_green.png');
        });

        //changing the marker color to default when mouse moves away from marker
        marker.addListener('mouseout', function() {
            this.setIcon('https://www.google.com/mapfiles/marker_orange.png');
        });

        bounds.extend(markers[i].position);
    });
    map.fitBounds(bounds);
}

//making the marker to bounce when the user clicks on the marker
function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 1400);
    }
}

var addArticles;
var error;

function populateInfoWindow(marker, infowindow) {
    let htmlContent = '';
    if (infowindow.marker != marker) {
        infowindow.setContent('');
        infowindow.marker = marker;

        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
        });

        streetViewService = new google.maps.StreetViewService();
        radius = 50;

        toggleBounce(marker);

        //ajax with xhr method for retrieving the data asynchronously
        const articleRequest = new XMLHttpRequest();
        articleRequest.open('GET', 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + marker.title + '&api-key=8eb3b7e7d3e146e6bed585f225c61dd1');
        articleRequest.send();

        addArticles = function() {
            const data = JSON.parse(this.responseText);

            if (data.response && data.response.docs && data.response.docs.length > 1) {
                htmlContent = '<ul>' + data.response.docs.map(article => `<li class='article'>
                <h2><a href='${article.web_url}'>${article.headline.main}</a></h2>
                </li>`).join('') + '</ul>';
                infowindow.setContent('<div id="header">' + marker.title + '</div><div id="pano"></div>' + '<div id="pano">' + '<b>New york times article says:</b>' + htmlContent + '</div>');
                streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
                infowindow.open(map, marker);
            } else {
                infowindow.setContent('<div id="header">' + marker.title + '</div><div id="pano"></div>' + alert('No articles available'));
                streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
                infowindow.open(map, marker);
            }
        };

        //error function when the data is not able to be retrieved due to some reasons
        error = function() {
            alert('Something went wrong');
        };

        articleRequest.onload = addArticles;
        articleRequest.onerror = error;

        //getting panoramic view in the infowindow popup
        var getStreetView = function(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent('<div>' + marker.title + '</div>' +
                    '<div>No Street View Found</div>');
            }
        };
    }
}

var Location = function(val) {
    this.title = val.title;
    this.position = val.location;
};

var ViewModel = function() {
    var self = this;

    this.locationList = ko.observableArray([]);

    this.locationInput = ko.observable('');


    //pushing locations details into an array
    locations.forEach(function(loc) {
        self.locationList.push(new Location(loc));
    });

    //filter function used in search box
    this.filter = ko.computed(function() {
        var input = self.locationInput().toLowerCase();
        return ko.utils.arrayFilter(self.locationList(), function(location) {
            var fil = location.title.toLowerCase().indexOf(input) >= 0;
            if (location.marker) {
                location.marker.setVisible(fil);
            }
            return fil;
        });
    });


    //open an infowindow when the user clicks on the location in list view
    this.viewByList = function(location, marker) {
        google.maps.event.trigger(location.marker, 'click');
    };
};

var view = new ViewModel();

ko.applyBindings(view);