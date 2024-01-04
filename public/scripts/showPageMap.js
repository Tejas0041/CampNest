const campGeometry= JSON.parse(campgroundGeometry); //just to avoid some syntax error in the EJS template
const campTitle= JSON.parse(campgroundTitle);
const campLocation= JSON.parse(campgroundLocation);

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/standard', // style URL
  center: campGeometry.coordinates, // starting position [lng, lat]
  zoom: 9, // starting zoom
});

const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'bottom-right');


new  mapboxgl.Marker({
  color: '#ea4335',
}).setPopup(
  new mapboxgl.Popup({offset: 25})
  .setHTML(`<h5><b>${campTitle}</b></h5> <p><b>${campLocation}</b></p>`)
)
.setLngLat(campGeometry.coordinates)
.addTo(map)

