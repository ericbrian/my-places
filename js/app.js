var map;

function initMap() {
  console.log("Init Map.");
  map = new google.maps.Map(document.getElementById("mapid"), {
    center: { lat: 36.5, lng: 36.0 },
    zoom: 2
  });
}
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
          popupinfo = myplaces[i][5];
        var marker = new google.maps.Marker({
          position: { lat: x, lng: y },
          map: map,
          title: title
        });
      }
    })
    .fail((jqXHR, textStatus, errorThrown) => {
      console.error(textStatus, errorThrown);
    });
});
