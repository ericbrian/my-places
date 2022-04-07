mapboxgl.accessToken = 'pk.eyJ1IjoiZXJpY2JyaWFuIiwiYSI6ImNreXJobHN3eTB1MnoydXBla2lzOXFtOGQifQ.f2fiVNRwiVNqpi_RjeGEBg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ericbrian/ckyra5pms0f7n14th4d4s3x21',
    center: [-42.5200714, 39.5876049],
    zoom: 2
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

const pastTypes = geoJsonMerged.features.filter(j => j.properties.placeType != 'future');
const geoJsonPast = {
    "type": "FeatureCollection",
    "features": pastTypes
};

const futureTypes = geoJsonMerged.features.filter(j => j.properties.placeType == 'future');
const geoJsonFuture = {
    "type": "FeatureCollection",
    "features": futureTypes
};

map.on('load', () => {
    map.addSource('places', {
        type: 'geojson',
        data: geoJsonPast,
        generateId: true // This ensures that all features have unique IDs
    });

    // Add a layer showing the places.
    map.addLayer({
        'id': 'place-viz',
        'type': 'circle',
        'source': 'places',
        'paint': {
            'circle-stroke-color': '#FFEA00',
            'circle-stroke-width': 1,
            'circle-color': '#f00'
        }
    });

    map.addSource('futurePlaces', {
        type: 'geojson',
        data: geoJsonFuture,
        generateId: true // This ensures that all features have unique IDs
    });

    // Add a layer showing the places.
    map.addLayer({
        'id': 'place-viz-future',
        'type': 'circle',
        'source': 'futurePlaces',
        'paint': {
            'circle-stroke-color': '#000000',
            'circle-stroke-width': 1,
            'circle-color': '#00f'
        }
    });

    // When a click event occurs on a feature in the places layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on('click', 'place-viz', (e) => {
        // Copy coordinates array.
        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = e.features[0].properties.description;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    });

    map.on('click', 'place-viz-future', (e) => {
        // Copy coordinates array.
        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = e.features[0].properties.description;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'places', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'places', () => {
        map.getCanvas().style.cursor = '';
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'futurePlaces', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'futurePlaces', () => {
        map.getCanvas().style.cursor = '';
    });
});
