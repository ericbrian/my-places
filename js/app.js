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
        var x = myplaces[i][0],
          y = myplaces[i][1],
          line1 = myplaces[i][4],
          line2 = myplaces[i][5],
          line =
            line2 != null && line2.length > 0
              ? line1 + "<br />(" + line2 + ")"
              : line1;

        var marker = new google.maps.Marker({
          position: { lat: x, lng: y },
          map: map,
          title: line
        });
      }
    })
    .fail((jqXHR, textStatus, errorThrown) => {
      console.error(textStatus, errorThrown);
    });
});
