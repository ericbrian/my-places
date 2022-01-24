mapboxgl.accessToken =
    'pk.eyJ1IjoiZXJpY2Nvb2wiLCJhIjoiY2s3czdvNGd6MGdkODNlbnI4cnZrNHpxeCJ9._qWghVW-BLTf6lumxxEvlw';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-42.5200714, 39.5876049],
    zoom: 2
});
map.addControl(new mapboxgl.NavigationControl(), "top-left");

const addMarkers = () => {
    geoJson.forEach((location, x) => {
        const el = document.createElement('div');
        el.id = "marker-" + x;
        el.className = "marker marker-" + location.properties.placeType.toLowerCase();
        el.title = location.properties.place;

        /**
         * Create a marker using the div element
         * defined above and add it to the map.
         **/
        const lat = location.geometry.coordinates[1];
        const long = location.geometry.coordinates[0];
        new mapboxgl.Marker(el, {})
            .setLngLat([long, lat])
            .addTo(map);
    });
}
addMarkers();
