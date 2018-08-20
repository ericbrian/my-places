var map;
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
  var markerGroups = new google.maps.MVCObject();
  markerGroups.set("Home", map);
  markerGroups.set("Pleasure", map);
  markerGroups.set("Birth", map);
  markerGroups.set("Work", map);
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
      for (var i = 0; i < myplaces.length; i++) {
        var x = myplaces[i][1],
          y = myplaces[i][2],
          title = myplaces[i][0],
          activityicon = icons[myplaces[i][3]],
          category = myplaces[i][3],
          popupinfo = myplaces[i][4];
        console.log(x, y, title, activityicon, popupinfo);
        var marker = new google.maps.Marker({
          position: { lat: x, lng: y },
          icon: activityicon,
          title: title,
          map: map
        });
        //marker.bindTo(map, markerGroups, category);
      }
    })
    .fail((jqXHR, textStatus, errorThrown) => {
      console.error(textStatus, errorThrown);
    });
});
