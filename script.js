'use strict';

//Global variables 

var map;

var infowindow;

//part of an attempt to move my bounds variable, not succesful
var bounds;

//var myLatLng;

//gets our articles from wikiepedia
var wikiApi = function(name) {

    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + name +
        '&format=json&callback=wikiCallback';

    //in case we do not get anything back from wikipedia in a timely manner
    var wikiRequestTimeout = setTimeout(function() {
        infowindow.setContent('<h3>' + name + '</h3>' + " Failed the wiki");
    }, 8000);

    $.ajax({
            url: wikiUrl,
            dataType: "jsonp",
            // jsponp: "callback",
        }).done(function(response) {
            //should know what that [1] does 
            var articleList = response[1];
            //console.log(articleList);

            var length = articleList.length;

            //console.log(articleList.length);
            for (var i = 0; i < length; i++) {
                var articleStr = articleList[i];
                var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                var urlLink = ('<p> From our friends at Wikipedia ' + '<a href="' + url + '">' + articleStr + '</a></p>');
                infowindow.setContent('<h3>' + name + '</h3>' + " " + urlLink);

            }

            clearTimeout(wikiRequestTimeout);
        });


};

//the markers, the basic structure is taken from premium cat clicker 
// again would prefer to use names and geoloc
var initialMarkers = [

    {
        position: {
            lat: 40.7806,
            lng: -73.9747
        },
        title: 'American Museum of Natural History'
    },


    {
        position: {
            lat: 40.7931,
            lng: -73.9514
        },
        title: 'El Museo del Barrio'
    },

    {
        position: {
            lat: 40.8631,
            lng: -73.8945
        },
        title: 'Bronx Library Center'
    },

    {
        position: {
            lat: 40.8506,
            lng: -73.8754
        },
        title: 'Bronx Zoo'
    },

    {
        position: {
            lat: 40.8292,
            lng: -73.9264
        },
        title: 'Yankee Stadium'
    },

];


//taken from cat function from premium cat clicker I was hoping to simplfy it, but does not 
//seem like a way to pass data straight into google.maps.Maker functiom
var Marker = function(data) {

    var self = this;
    this.position = ko.observable(data.position);
    this.title = ko.observable(data.title);
    this.shouldShowMessage = ko.observable(true);

    //I was able to part part of the bounds portion here 
    var myLatLng = new google.maps.LatLng(self.position().lat, self.position().lng);
    console.log(myLatLng);
    bounds.extend(myLatLng);

    this.marker = new google.maps.Marker({
            position: self.position(),
            map: map,
            title: self.title()

        });

    //console.log(this.position().lng);

    this.marker.addListener('click', function() {

        //get some wikiepdia articles
        wikiApi(self.title());

        //would prefer if it closed window as well
        infowindow.open(map, self.marker);

        //makes marker bounce twice 
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 1400);

    });
};

var ViewModel = function() {

    this.error = ko.observable("error error");

    var self = this;

    this.markerList = ko.observableArray([]);

    this.Search = ko.observable("");

    //takes all marker information puts them in an observable array 
    bounds = new google.maps.LatLngBounds();

    //var i = 0;
    initialMarkers.forEach(function(markerItem) {
        self.markerList.push(new Marker(markerItem));
    });

    map.fitBounds(bounds);

    this.toggleBounce = function(clickedMarker) {

        google.maps.event.trigger(clickedMarker.marker, 'click');
    };

    //gets data from search box and filters results 
    this.filter = function() {

        //closes infowindow so we don't have it hovering over a non existant marker
        infowindow.close();
        //so Bronx and bronx are equal
        self.Search(self.Search().toLowerCase());
        //console.log(self.Search());

        //check search word against the markers
        for (var i = 0; i < self.markerList().length; i++) {
            var check = self.markerList()[i].title().toLowerCase();
            //if the search term is found to be part of the string keep item
            if (check.includes(self.Search())) {
                self.markerList()[i].shouldShowMessage(true);
                self.markerList()[i].marker.setVisible(true);
                //it is part of the search nothing need to be done

            } else {
                //need to remove it from array or at least hide it 
                self.markerList()[i].shouldShowMessage(false);
                self.markerList()[i].marker.setVisible(false);
            }

        }
    };

};

    function mapInitialize() {

        // would prefer to use name and have geoloc get lat and long but not sure how    
        var myLatLng = {
            lat: 40.7903,
            lng: -73.9597
        };

        map = new google.maps.Map(document.getElementById('map'), {
                zoom: 11,
                center: myLatLng
            });


        infowindow = new google.maps.InfoWindow({
                //content set in wiki api    
            });

        //I have two separte ko view models I hope this is acceptable
        ko.applyBindings(new ViewModel(), document.getElementById('container1'))
    }

var ViewModelError = {

    error: ko.observable("error error")
};

    function googleError() {

        console.log("google failed");
        //I have two separte ko view models I hope this is acceptable
        ko.applyBindings(ViewModelError, document.getElementById('container2'));

    }