mapboxgl.accessToken = 'pk.eyJ1IjoiZXJpY2JyaWFuIiwiYSI6ImNsMXNhdnR0OTBqdXEzZG84d3NrcnhvdHcifQ.dyDAz-blS-m8BM3ZPog_dw';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [4.764904234141426, 16.065578903225898],
    zoom: 2
});

map.addControl(new mapboxgl.NavigationControl());

for (const feature of geoJsonMerged.features) {
    // create a HTML element for each feature
    const el = document.createElement('div');
    el.classList.add('marker', `marker-${feature.properties.placeType}`);

    // make a marker for each feature and add to the map

    let html = `<h3>${feature.properties.place}</h3>`;
    if (feature.properties.localname)
        html += `<div>${feature.properties.localname}</div>`;
    html += `<p>${feature.properties.description}</p>`;

    new mapboxgl
        .Marker(el)
        .setLngLat(feature.geometry.coordinates)
        .setPopup(
            new mapboxgl.Popup({
                offset: 25
            }) // add popups
            .setHTML(html)
        )
        .addTo(map);
}
