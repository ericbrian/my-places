var map;
var markerGroups;
var bounds;

var icons = {
  Birth:
    "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FFFF00",
  Pleasure:
    "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FF0000",
  Work:
    "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|0000FF",
  Home:
    "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|800080"
};

initMap = () => {
  console.log("Init Map.");
  map = new google.maps.Map(document.getElementById("mapid"), {
    center: { lat: 36.5, lng: 36.0 },
    zoom: 2
  });
  bounds = new google.maps.LatLngBounds();
};

// http://jsfiddle.net/EricBrian/w96a0yrs/
$(document).ready(function() {
  console.log("document is ready");
  $.ajax({
    type: "GET",
    url: "/js/places.json",
    dataType: "json",
    mimeType: "application/json"
  })
    .done(myplaces => {
      console.log(myplaces);
      setMarkerGroups(myplaces);
      setMarkersOnMap(myplaces);
    })
    .fail((jqXHR, textStatus, errorThrown) => {
      console.error(textStatus, errorThrown);
    });
});

setMarkerGroups = myplaces => {
  var uniqueGroup = [];
  for (var i = 0; i < myplaces.length; i++) {
    var groupName = myplaces[i][3];
    if (uniqueGroup.indexOf(groupName) == -1) uniqueGroup.push(groupName);
  }

  markerGroups = new google.maps.MVCObject();
  for (var i = 0; i < uniqueGroup.length; i++) {
    markerGroups.set(uniqueGroup[i], map);
  }
};

setMarkersOnMap = myplaces => {
  for (var i = 0; i < myplaces.length; i++) {
    var x = myplaces[i][1],
      y = myplaces[i][2],
      title = myplaces[i][0],
      activityicon = icons[myplaces[i][3]],
      content = myplaces[i][4];

    var marker = new google.maps.Marker({
      position: { lat: x, lng: y },
      icon: activityicon,
      title: title,
      map: map
    });

    bounds.extend(marker.position);

    var infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(
      marker,
      "click",
      (function(marker, content, infowindow) {
        return function() {
          infowindow.setContent(content);
          infowindow.open(map, marker);
        };
      })(marker, content, infowindow)
    );

    map.fitBounds(bounds);
  }
};
