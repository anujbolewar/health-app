import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import {
  Circle as LeafletCircle,
  Marker as LeafletMarker,
  Polygon as LeafletPolygon,
  Polyline as LeafletPolyline,
  MapContainer,
  TileLayer,
  useMap,
} from "react-leaflet";
import { StyleSheet, View } from "react-native";

// Fix Leaflet default marker icon issue
if (typeof window !== "undefined") {
  const L = require("leaflet");
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

// Component to handle map updates
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], zoom);
    }
  }, [center, zoom, map]);

  return null;
};

const SafeMapView = ({ children, region, style, onPress, ...props }) => {
  const mapCenter = region
    ? [region.latitude, region.longitude]
    : [21.1458, 79.0882]; // Default to Nagpur

  const mapZoom = region ? Math.log2(360 / region.longitudeDelta) : 12;

  return (
    <View style={[styles.container, style]}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ width: "100%", height: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater
          center={{ lat: mapCenter[0], lng: mapCenter[1] }}
          zoom={mapZoom}
        />
        {children}
      </MapContainer>
    </View>
  );
};

// Marker component
export const Marker = ({ coordinate, title, children, ...props }) => {
  if (!coordinate) return null;

  return (
    <LeafletMarker
      position={[coordinate.latitude, coordinate.longitude]}
      title={title}
      {...props}
    >
      {children}
    </LeafletMarker>
  );
};

// Polygon component
export const Polygon = ({
  coordinates,
  fillColor,
  strokeColor,
  strokeWidth,
  ...props
}) => {
  if (!coordinates || coordinates.length === 0) return null;

  const positions = coordinates.map((coord) => [
    coord.latitude,
    coord.longitude,
  ]);

  return (
    <LeafletPolygon
      positions={positions}
      pathOptions={{
        fillColor: fillColor || "#4F46E5",
        fillOpacity: 0.3,
        color: strokeColor || "#4F46E5",
        weight: strokeWidth || 2,
      }}
      {...props}
    />
  );
};

// Polyline component
export const Polyline = ({
  coordinates,
  strokeColor,
  strokeWidth,
  ...props
}) => {
  if (!coordinates || coordinates.length === 0) return null;

  const positions = coordinates.map((coord) => [
    coord.latitude,
    coord.longitude,
  ]);

  return (
    <LeafletPolyline
      positions={positions}
      pathOptions={{
        color: strokeColor || "#4F46E5",
        weight: strokeWidth || 3,
      }}
      {...props}
    />
  );
};

// Circle component
export const Circle = ({
  center,
  radius,
  fillColor,
  strokeColor,
  strokeWidth,
  ...props
}) => {
  if (!center) return null;

  return (
    <LeafletCircle
      center={[center.latitude, center.longitude]}
      radius={radius}
      pathOptions={{
        fillColor: fillColor || "#4F46E5",
        fillOpacity: 0.3,
        color: strokeColor || "#4F46E5",
        weight: strokeWidth || 2,
      }}
      {...props}
    />
  );
};

export const PROVIDER_GOOGLE = "google";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

export default SafeMapView;
