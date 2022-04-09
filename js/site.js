mapboxgl.accessToken = 'pk.eyJ1IjoiZXJpY2JyaWFuIiwiYSI6ImNreXJobHN3eTB1MnoydXBla2lzOXFtOGQifQ.f2fiVNRwiVNqpi_RjeGEBg';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [4.764904234141426, 16.065578903225898],
    zoom: 2
});

for (const feature of geoJsonMerged.features) {
    // create a HTML element for each feature
    const el = document.createElement('div');
    el.classList.add('marker', `marker-${feature.properties.placeType}`);

    // make a marker for each feature and add to the map
    new mapboxgl
        .Marker(el)
        .setLngLat(feature.geometry.coordinates)
        .setPopup(
            new mapboxgl.Popup({
                offset: 25
            }) // add popups
            .setHTML(
                `<h3>${feature.properties.place}</h3><p>${feature.properties.description}</p>`
            )
        )
        .addTo(map);
}
