/**
 * Territory Capture Service
 *
 * Core logic for free-flow area capture system:
 * 1. Records GPS trail in real-time
 * 2. Detects loop closure
 * 3. Validates and captures territory
 * 4. Manages captured territories
 *
 * State Management:
 * - activePath: Current movement trail (array of coordinates)
 * - capturedTerritories: All captured areas with metadata
 * - isCapturing: Recording state
 */

import {
  calculateDistance,
  closePath,
  detectLoop,
  doPolygonsOverlap,
  getPolygonCentroid,
  simplifyPath,
  smoothPath,
  validateCapturedArea,
} from "../utils/geometryUtils";

export class TerritoryCaptureService {
  constructor(config = {}) {
    // Configuration
    this.config = {
      minPointDistance: config.minPointDistance || 5, // Minimum meters between points
      gpsAccuracyThreshold: config.gpsAccuracyThreshold || 20, // Max GPS accuracy in meters
      smoothingWindow: config.smoothingWindow || 3, // Points to average for smoothing
      simplificationTolerance: config.simplificationTolerance || 5, // Meters for simplification
      minLoopDistance: config.minLoopDistance || 50, // Min path length before detecting loop
      loopClosureThreshold: config.loopClosureThreshold || 15, // Distance to close loop (meters)
      minCaptureArea: config.minCaptureArea || 100, // Min area in sq meters
      maxCaptureArea: config.maxCaptureArea || 500000, // Max area in sq meters
      pathUpdateInterval: config.pathUpdateInterval || 2000, // GPS update frequency (ms)
    };

    // State
    this.activePath = [];
    this.rawPath = []; // Unprocessed GPS points
    this.capturedTerritories = [];
    this.isCapturing = false;
    this.captureStartTime = null;
    this.userId = config.userId || "user-1";

    // Statistics
    this.stats = {
      totalDistance: 0,
      totalArea: 0,
      captureCount: 0,
    };

    // Callbacks
    this.onPathUpdate = null;
    this.onLoopDetected = null;
    this.onCaptureSuccess = null;
    this.onCaptureFailure = null;
  }

  /**
   * Start capturing territory
   * @param {Object} startPosition - Initial GPS position {latitude, longitude, accuracy}
   */
  startCapture(startPosition) {
    if (this.isCapturing) {
      console.warn("Already capturing");
      return;
    }

    if (!this._isValidGPSPoint(startPosition)) {
      console.warn("Invalid starting position");
      return;
    }

    this.isCapturing = true;
    this.captureStartTime = Date.now();
    this.activePath = [
      { latitude: startPosition.latitude, longitude: startPosition.longitude },
    ];
    this.rawPath = [startPosition];

    console.log("🎯 Capture started at:", startPosition);
    this._notifyPathUpdate();
  }

  /**
   * Add new GPS point to active path
   * @param {Object} position - GPS position {latitude, longitude, accuracy, timestamp}
   * @returns {Object} {added: boolean, loopDetected: boolean, reason: string}
   */
  addPoint(position) {
    if (!this.isCapturing) {
      return { added: false, loopDetected: false, reason: "Not capturing" };
    }

    if (!this._isValidGPSPoint(position)) {
      return { added: false, loopDetected: false, reason: "Low GPS accuracy" };
    }

    const lastPoint = this.activePath[this.activePath.length - 1];
    const distance = calculateDistance(lastPoint, position);

    // Skip if point is too close to last point (reduce noise)
    if (distance < this.config.minPointDistance) {
      return { added: false, loopDetected: false, reason: "Point too close" };
    }

    // Add to raw path
    this.rawPath.push(position);

    // Process and smooth path
    const newPoint = {
      latitude: position.latitude,
      longitude: position.longitude,
    };
    this.activePath.push(newPoint);

    // Apply smoothing if we have enough points
    if (this.activePath.length >= this.config.smoothingWindow) {
      const smoothed = smoothPath(this.activePath, this.config.smoothingWindow);
      this.activePath = smoothed;
    }

    // Update statistics
    this.stats.totalDistance += distance;

    // Check for loop closure
    const loopDetected = detectLoop(
      this.activePath,
      this.config.minLoopDistance,
      this.config.loopClosureThreshold
    );

    this._notifyPathUpdate();

    if (loopDetected) {
      this._handleLoopDetected();
      return { added: true, loopDetected: true, reason: "Loop detected" };
    }

    return { added: true, loopDetected: false, reason: "Point added" };
  }

  /**
   * Manually complete the capture
   * @returns {Object} Capture result
   */
  completeCapture() {
    if (!this.isCapturing) {
      return { success: false, reason: "Not capturing" };
    }

    return this._processCapture();
  }

  /**
   * Cancel current capture
   */
  cancelCapture() {
    if (!this.isCapturing) return;

    this.isCapturing = false;
    this.activePath = [];
    this.rawPath = [];
    this.captureStartTime = null;

    console.log("🚫 Capture cancelled");
    this._notifyPathUpdate();
  }

  /**
   * Get current capture state
   * @returns {Object} Current state
   */
  getState() {
    return {
      isCapturing: this.isCapturing,
      pathLength: this.activePath.length,
      distance: this.stats.totalDistance,
      duration: this.captureStartTime ? Date.now() - this.captureStartTime : 0,
      capturedCount: this.capturedTerritories.length,
    };
  }

  /**
   * Get all captured territories
   * @returns {Array} Captured territories
   */
  getCapturedTerritories() {
    return this.capturedTerritories;
  }

  /**
   * Get active path
   * @returns {Array} Current path
   */
  getActivePath() {
    return this.activePath;
  }

  /**
   * Clear all captured territories (for testing/reset)
   */
  clearTerritories() {
    this.capturedTerritories = [];
    this.stats = {
      totalDistance: 0,
      totalArea: 0,
      captureCount: 0,
    };
  }

  // Private Methods

  _isValidGPSPoint(position) {
    if (!position || !position.latitude || !position.longitude) {
      return false;
    }

    // Check GPS accuracy if available
    if (
      position.accuracy &&
      position.accuracy > this.config.gpsAccuracyThreshold
    ) {
      return false;
    }

    return true;
  }

  _handleLoopDetected() {
    console.log("🔄 Loop detected!");

    if (this.onLoopDetected) {
      this.onLoopDetected(this.activePath);
    }

    // Auto-complete capture
    setTimeout(() => {
      this._processCapture();
    }, 500);
  }

  _processCapture() {
    const closedPath = closePath(this.activePath);

    // Simplify path to reduce points
    const simplifiedPath = simplifyPath(
      closedPath,
      this.config.simplificationTolerance
    );

    // Validate captured area
    const validation = validateCapturedArea(
      simplifiedPath,
      this.config.minCaptureArea,
      this.config.maxCaptureArea
    );

    if (!validation.valid) {
      console.log("❌ Capture failed:", validation.reason);

      if (this.onCaptureFailure) {
        this.onCaptureFailure({
          reason: validation.reason,
          area: validation.area,
          path: this.activePath,
        });
      }

      this.cancelCapture();
      return {
        success: false,
        reason: validation.reason,
        area: validation.area,
      };
    }

    // Check for overlaps with existing territories
    const overlap = this._checkOverlap(simplifiedPath);
    if (overlap) {
      console.log("⚠️ Territory overlaps with existing capture");
      // You can decide how to handle overlaps (allow, reject, or merge)
    }

    // Create territory object
    const territory = {
      id: `territory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: this.userId,
      polygon: simplifiedPath,
      center: getPolygonCentroid(simplifiedPath),
      area: validation.area,
      capturedAt: new Date().toISOString(),
      duration: Date.now() - this.captureStartTime,
      distance: this.stats.totalDistance,
      rawPointCount: this.rawPath.length,
      simplifiedPointCount: simplifiedPath.length,
    };

    // Save territory
    this.capturedTerritories.push(territory);
    this.stats.captureCount++;
    this.stats.totalArea += validation.area;

    console.log("✅ Territory captured!", {
      area: Math.round(validation.area),
      points: simplifiedPath.length,
    });

    if (this.onCaptureSuccess) {
      this.onCaptureSuccess(territory);
    }

    // Reset capture state
    this.isCapturing = false;
    this.activePath = [];
    this.rawPath = [];
    this.captureStartTime = null;
    this.stats.totalDistance = 0;

    this._notifyPathUpdate();

    return { success: true, territory };
  }

  _checkOverlap(polygon) {
    for (const territory of this.capturedTerritories) {
      if (doPolygonsOverlap(polygon, territory.polygon)) {
        return territory;
      }
    }
    return null;
  }

  _notifyPathUpdate() {
    if (this.onPathUpdate) {
      this.onPathUpdate({
        path: this.activePath,
        isCapturing: this.isCapturing,
        stats: this.stats,
      });
    }
  }
}

// Singleton instance for global use
let serviceInstance = null;

export const getTerritoryCaptureService = (config) => {
  if (!serviceInstance) {
    serviceInstance = new TerritoryCaptureService(config);
  }
  return serviceInstance;
};

export const resetTerritoryCaptureService = () => {
  serviceInstance = null;
};
