// console.log(JSON.parse(locations));
export function displayMap(locations) {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoiam9uYXNzY2htZWR0bwFubiIsImEiOiJjam54ZmM5N3gwNjAzM3dtZDNxYTVlMnd2In0.ytpI7V7w7cyT1Kq5rT9Z1A';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/jonasschmedtmann/cjvi9q8jd04mi1cpgmg7ev3dy',
    scrollZoom: false,
    // center: [-118.113491, 34.111745],
    //   zoom: 10,
    //   interactive: false,//
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create Marker
    const el = document.createElement('div');
    el.className = 'marker';
    // Add Marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
    // Add Popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Extends map bounds to include current location
    bounds.extends(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
}
