import React from "react";
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from "react-native-maps";

const SafeMapView = (props) => <MapView {...props} />;

export { Marker, Polygon, PROVIDER_GOOGLE };
export default SafeMapView;
