/**
 * Geometry Utilities for Free-Flow Area Capture
 * Handles GPS calculations, polygon operations, and area computations
 */

/**
 * Calculate distance between two GPS coordinates (Haversine formula)
 * @param {Object} point1 - {latitude, longitude}
 * @param {Object} point2 - {latitude, longitude}
 * @returns {number} Distance in meters
 */
export const calculateDistance = (point1, point2) => {
  const R = 6371000; // Earth radius in meters
  const lat1 = (point1.latitude * Math.PI) / 180;
  const lat2 = (point2.latitude * Math.PI) / 180;
  const deltaLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const deltaLng = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Smooth GPS path using moving average to reduce GPS jitter
 * @param {Array} points - Array of {latitude, longitude} points
 * @param {number} windowSize - Number of points to average (default: 3)
 * @returns {Array} Smoothed points
 */
export const smoothPath = (points, windowSize = 3) => {
  if (points.length < windowSize) return points;

  const smoothed = [];
  for (let i = 0; i < points.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(points.length, i + Math.ceil(windowSize / 2));
    const slice = points.slice(start, end);

    const avgLat = slice.reduce((sum, p) => sum + p.latitude, 0) / slice.length;
    const avgLng =
      slice.reduce((sum, p) => sum + p.longitude, 0) / slice.length;

    smoothed.push({ latitude: avgLat, longitude: avgLng });
  }
  return smoothed;
};

/**
 * Douglas-Peucker algorithm for path simplification
 * Reduces number of points while preserving shape
 * @param {Array} points - Array of {latitude, longitude} points
 * @param {number} tolerance - Distance tolerance in meters (default: 5)
 * @returns {Array} Simplified points
 */
export const simplifyPath = (points, tolerance = 5) => {
  if (points.length <= 2) return points;

  const toMeters = (lat, lng) => ({
    x: lng * 111320 * Math.cos((lat * Math.PI) / 180),
    y: lat * 110540,
  });

  const perpendicularDistance = (point, lineStart, lineEnd) => {
    const p = toMeters(point.latitude, point.longitude);
    const start = toMeters(lineStart.latitude, lineStart.longitude);
    const end = toMeters(lineEnd.latitude, lineEnd.longitude);

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const mag = Math.sqrt(dx * dx + dy * dy);

    if (mag === 0) {
      return Math.sqrt(Math.pow(p.x - start.x, 2) + Math.pow(p.y - start.y, 2));
    }

    const u = ((p.x - start.x) * dx + (p.y - start.y) * dy) / (mag * mag);
    const closest = {
      x: start.x + u * dx,
      y: start.y + u * dy,
    };

    return Math.sqrt(
      Math.pow(p.x - closest.x, 2) + Math.pow(p.y - closest.y, 2)
    );
  };

  const douglasPeucker = (pts, tol) => {
    if (pts.length <= 2) return pts;

    let maxDist = 0;
    let maxIndex = 0;
    const start = pts[0];
    const end = pts[pts.length - 1];

    for (let i = 1; i < pts.length - 1; i++) {
      const dist = perpendicularDistance(pts[i], start, end);
      if (dist > maxDist) {
        maxDist = dist;
        maxIndex = i;
      }
    }

    if (maxDist > tol) {
      const left = douglasPeucker(pts.slice(0, maxIndex + 1), tol);
      const right = douglasPeucker(pts.slice(maxIndex), tol);
      return [...left.slice(0, -1), ...right];
    }

    return [start, end];
  };

  return douglasPeucker(points, tolerance);
};

/**
 * Detect if path forms a closed loop
 * @param {Array} path - Array of {latitude, longitude} points
 * @param {number} minDistance - Minimum path distance before checking closure (meters)
 * @param {number} closureThreshold - Distance to consider loop closed (meters)
 * @returns {boolean} True if loop is detected
 */
export const detectLoop = (path, minDistance = 50, closureThreshold = 15) => {
  if (path.length < 4) return false;

  // Calculate total path distance
  let totalDist = 0;
  for (let i = 1; i < path.length; i++) {
    totalDist += calculateDistance(path[i - 1], path[i]);
  }

  if (totalDist < minDistance) return false;

  // Check if current position is close to start
  const start = path[0];
  const current = path[path.length - 1];
  const distToStart = calculateDistance(current, start);

  return distToStart < closureThreshold;
};

/**
 * Check if two line segments intersect (self-intersection detection)
 * @param {Object} p1 - Start of segment 1
 * @param {Object} p2 - End of segment 1
 * @param {Object} p3 - Start of segment 2
 * @param {Object} p4 - End of segment 2
 * @returns {boolean} True if segments intersect
 */
export const doSegmentsIntersect = (p1, p2, p3, p4) => {
  const ccw = (A, B, C) => {
    return (
      (C.longitude - A.longitude) * (B.latitude - A.latitude) >
      (B.longitude - A.longitude) * (C.latitude - A.latitude)
    );
  };

  return (
    ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4)
  );
};

/**
 * Check for self-intersections in path
 * @param {Array} path - Array of coordinate points
 * @returns {boolean} True if path intersects itself
 */
export const hasSelfIntersection = (path) => {
  if (path.length < 4) return false;

  for (let i = 0; i < path.length - 1; i++) {
    for (let j = i + 2; j < path.length - 1; j++) {
      // Skip adjacent segments
      if (Math.abs(i - j) <= 1) continue;

      if (doSegmentsIntersect(path[i], path[i + 1], path[j], path[j + 1])) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Calculate area of polygon using Shoelace formula
 * @param {Array} polygon - Array of {latitude, longitude} points
 * @returns {number} Area in square meters
 */
export const calculatePolygonArea = (polygon) => {
  if (polygon.length < 3) return 0;

  // Convert to meters using approximate projection
  const toMeters = (lat, lng) => ({
    x: lng * 111320 * Math.cos((lat * Math.PI) / 180),
    y: lat * 110540,
  });

  const points = polygon.map((p) => toMeters(p.latitude, p.longitude));

  // Shoelace formula
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }

  return Math.abs(area / 2);
};

/**
 * Close the loop by connecting current position to start
 * @param {Array} path - Current path
 * @returns {Array} Closed polygon
 */
export const closePath = (path) => {
  if (path.length < 3) return path;

  // Check if already closed
  const start = path[0];
  const end = path[path.length - 1];
  const dist = calculateDistance(start, end);

  if (dist < 1) return path; // Already closed

  // Add start point to close the loop
  return [...path, start];
};

/**
 * Validate if captured area meets minimum requirements
 * @param {Array} polygon - Polygon coordinates
 * @param {number} minArea - Minimum area in square meters (default: 100)
 * @param {number} maxArea - Maximum area in square meters (default: 500000)
 * @returns {Object} {valid: boolean, area: number, reason: string}
 */
export const validateCapturedArea = (
  polygon,
  minArea = 100,
  maxArea = 500000
) => {
  if (polygon.length < 3) {
    return { valid: false, area: 0, reason: "Not enough points" };
  }

  if (hasSelfIntersection(polygon)) {
    return { valid: false, area: 0, reason: "Path cannot cross itself" };
  }

  const area = calculatePolygonArea(polygon);

  if (area < minArea) {
    return { valid: false, area, reason: "Area too small" };
  }

  if (area > maxArea) {
    return { valid: false, area, reason: "Area too large" };
  }

  return { valid: true, area, reason: "Valid" };
};

/**
 * Check if a point is inside a polygon (Ray casting algorithm)
 * @param {Object} point - {latitude, longitude}
 * @param {Array} polygon - Array of {latitude, longitude} points
 * @returns {boolean} True if point is inside polygon
 */
export const isPointInPolygon = (point, polygon) => {
  let inside = false;
  const x = point.longitude;
  const y = point.latitude;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].longitude;
    const yi = polygon[i].latitude;
    const xj = polygon[j].longitude;
    const yj = polygon[j].latitude;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
};

/**
 * Calculate polygon centroid (center point)
 * @param {Array} polygon - Array of {latitude, longitude} points
 * @returns {Object} {latitude, longitude}
 */
export const getPolygonCentroid = (polygon) => {
  if (polygon.length === 0) return null;

  let latSum = 0;
  let lngSum = 0;

  polygon.forEach((point) => {
    latSum += point.latitude;
    lngSum += point.longitude;
  });

  return {
    latitude: latSum / polygon.length,
    longitude: lngSum / polygon.length,
  };
};

/**
 * Check if two polygons overlap
 * @param {Array} polygon1 - First polygon
 * @param {Array} polygon2 - Second polygon
 * @returns {boolean} True if polygons overlap
 */
export const doPolygonsOverlap = (polygon1, polygon2) => {
  // Check if any vertex of polygon1 is inside polygon2
  for (const point of polygon1) {
    if (isPointInPolygon(point, polygon2)) return true;
  }

  // Check if any vertex of polygon2 is inside polygon1
  for (const point of polygon2) {
    if (isPointInPolygon(point, polygon1)) return true;
  }

  return false;
};
