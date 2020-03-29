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
    locations.forEach((location, x) => {
        console.log(location[3]);
        const el = document.createElement('div');
        el.id = "marker-" + x;
        el.className = "marker marker-" + location[3].toLowerCase();
        el.title = location[0];

        /**
         * Create a marker using the div element
         * defined above and add it to the map.
         **/
        new mapboxgl.Marker(el, {})
            .setLngLat([location[2], location[1]])
            .addTo(map);
    });
}
addMarkers();