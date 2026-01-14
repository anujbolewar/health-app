/**
 * GPS Path Optimizer
 *
 * Advanced GPS filtering and optimization for production use
 * - Kalman filtering for GPS noise reduction
 * - Adaptive smoothing based on movement speed
 * - Battery-efficient location tracking
 */

import { calculateDistance } from "./geometryUtils";

/**
 * Simple Kalman Filter for GPS coordinates
 * Reduces GPS jitter and provides smooth position estimates
 */
export class GPSKalmanFilter {
  constructor(processNoise = 0.001, measurementNoise = 3) {
    this.processNoise = processNoise; // Q
    this.measurementNoise = measurementNoise; // R
    this.reset();
  }

  reset() {
    this.latEstimate = null;
    this.lngEstimate = null;
    this.latError = 1;
    this.lngError = 1;
  }

  filter(latitude, longitude, accuracy = 10) {
    // Initialize on first measurement
    if (this.latEstimate === null) {
      this.latEstimate = latitude;
      this.lngEstimate = longitude;
      this.latError = accuracy;
      this.lngError = accuracy;
      return { latitude, longitude };
    }

    // Prediction step
    const predictedLatError = this.latError + this.processNoise;
    const predictedLngError = this.lngError + this.processNoise;

    // Update step
    const latKalmanGain =
      predictedLatError / (predictedLatError + this.measurementNoise);
    const lngKalmanGain =
      predictedLngError / (predictedLngError + this.measurementNoise);

    this.latEstimate =
      this.latEstimate + latKalmanGain * (latitude - this.latEstimate);
    this.lngEstimate =
      this.lngEstimate + lngKalmanGain * (longitude - this.lngEstimate);

    this.latError = (1 - latKalmanGain) * predictedLatError;
    this.lngError = (1 - lngKalmanGain) * predictedLngError;

    return {
      latitude: this.latEstimate,
      longitude: this.lngEstimate,
    };
  }
}

/**
 * Adaptive Path Smoother
 * Adjusts smoothing intensity based on movement characteristics
 */
export class AdaptivePathSmoother {
  constructor() {
    this.recentPoints = [];
    this.maxPoints = 10;
    this.kalmanFilter = new GPSKalmanFilter();
  }

  addPoint(point, accuracy, speed = 0) {
    // Apply Kalman filter first
    const filtered = this.kalmanFilter.filter(
      point.latitude,
      point.longitude,
      accuracy
    );

    this.recentPoints.push({
      ...filtered,
      accuracy,
      speed,
      timestamp: Date.now(),
    });

    // Keep only recent points
    if (this.recentPoints.length > this.maxPoints) {
      this.recentPoints.shift();
    }

    // Adaptive smoothing based on speed
    const windowSize = this._getAdaptiveWindowSize(speed, accuracy);
    return this._smoothWithWindow(windowSize);
  }

  _getAdaptiveWindowSize(speed, accuracy) {
    // Stationary or slow: more smoothing
    if (speed < 0.5) return 5;

    // Walking speed: moderate smoothing
    if (speed < 2) return 3;

    // Running: less smoothing for responsiveness
    if (speed < 4) return 2;

    // Fast movement: minimal smoothing
    return 1;
  }

  _smoothWithWindow(windowSize) {
    const points = this.recentPoints.slice(-windowSize);

    // Weighted average (more weight to recent points)
    let totalWeight = 0;
    let weightedLat = 0;
    let weightedLng = 0;

    points.forEach((point, index) => {
      const weight = index + 1; // Linear weight increase
      const accuracyFactor = 1 / Math.max(point.accuracy, 1);
      const finalWeight = weight * accuracyFactor;

      weightedLat += point.latitude * finalWeight;
      weightedLng += point.longitude * finalWeight;
      totalWeight += finalWeight;
    });

    return {
      latitude: weightedLat / totalWeight,
      longitude: weightedLng / totalWeight,
    };
  }

  reset() {
    this.recentPoints = [];
    this.kalmanFilter.reset();
  }
}

/**
 * Battery-Efficient Location Tracker
 * Adjusts GPS update frequency based on activity
 */
export class BatteryEfficientTracker {
  constructor() {
    this.currentMode = "balanced";
    this.lastMovementTime = Date.now();
    this.lastPosition = null;
  }

  /**
   * Get recommended location tracking settings
   * @param {string} activityState - 'capturing', 'idle', 'background'
   * @param {number} batteryLevel - 0-100
   * @returns {Object} Location tracking configuration
   */
  getTrackingConfig(activityState = "idle", batteryLevel = 100) {
    // High accuracy when actively capturing
    if (activityState === "capturing") {
      return {
        accuracy: "high",
        timeInterval: 2000,
        distanceInterval: 5,
        showsBackgroundLocationIndicator: true,
      };
    }

    // Low power mode when battery is low
    if (batteryLevel < 20) {
      return {
        accuracy: "balanced",
        timeInterval: 10000,
        distanceInterval: 20,
        showsBackgroundLocationIndicator: false,
      };
    }

    // Balanced mode for idle state
    return {
      accuracy: "balanced",
      timeInterval: 5000,
      distanceInterval: 10,
      showsBackgroundLocationIndicator: false,
    };
  }

  /**
   * Determine if location update should be processed
   * @param {Object} newPosition - New GPS position
   * @param {Object} options - Processing options
   * @returns {boolean} Should process this update
   */
  shouldProcessUpdate(newPosition, options = {}) {
    const { accuracy, isCapturing = false } = options;

    // Always process when actively capturing
    if (isCapturing) {
      // But skip if accuracy is very poor
      if (accuracy && accuracy > 50) {
        console.log("Skipping update: poor accuracy", accuracy);
        return false;
      }
      return true;
    }

    // Skip if no previous position
    if (!this.lastPosition) {
      this.lastPosition = newPosition;
      return true;
    }

    // Check if user has moved significantly
    const distance = calculateDistance(this.lastPosition, newPosition);

    // Minimum movement threshold
    if (distance < 3) {
      return false;
    }

    this.lastPosition = newPosition;
    this.lastMovementTime = Date.now();
    return true;
  }

  reset() {
    this.lastPosition = null;
    this.lastMovementTime = Date.now();
  }
}

/**
 * Outlier Detection
 * Filters out GPS spikes and anomalies
 */
export class OutlierDetector {
  constructor(maxSpeed = 15) {
    // Maximum reasonable speed in m/s (15 m/s = 54 km/h)
    this.maxSpeed = maxSpeed;
    this.lastValidPoint = null;
    this.lastValidTime = null;
  }

  isOutlier(point, timestamp = Date.now()) {
    if (!this.lastValidPoint) {
      this.lastValidPoint = point;
      this.lastValidTime = timestamp;
      return false;
    }

    const distance = calculateDistance(this.lastValidPoint, point);
    const timeDiff = (timestamp - this.lastValidTime) / 1000; // seconds

    if (timeDiff === 0) return false;

    const speed = distance / timeDiff;

    // Check if speed is unrealistic
    if (speed > this.maxSpeed) {
      console.log(`Outlier detected: ${speed.toFixed(2)} m/s`);
      return true;
    }

    // Update last valid point
    this.lastValidPoint = point;
    this.lastValidTime = timestamp;
    return false;
  }

  reset() {
    this.lastValidPoint = null;
    this.lastValidTime = null;
  }
}

/**
 * Complete GPS Processing Pipeline
 * Combines all optimization techniques
 */
export class GPSProcessor {
  constructor(config = {}) {
    this.smoother = new AdaptivePathSmoother();
    this.outlierDetector = new OutlierDetector(config.maxSpeed || 15);
    this.batteryTracker = new BatteryEfficientTracker();
  }

  /**
   * Process raw GPS point
   * @param {Object} rawPoint - {latitude, longitude, accuracy, speed, timestamp}
   * @param {Object} context - {isCapturing, batteryLevel}
   * @returns {Object|null} Processed point or null if rejected
   */
  processPoint(rawPoint, context = {}) {
    const { isCapturing = false } = context;

    // Check if we should process this update
    if (
      !this.batteryTracker.shouldProcessUpdate(rawPoint, {
        accuracy: rawPoint.accuracy,
        isCapturing,
      })
    ) {
      return null;
    }

    // Filter outliers
    if (this.outlierDetector.isOutlier(rawPoint, rawPoint.timestamp)) {
      return null;
    }

    // Apply adaptive smoothing
    const processed = this.smoother.addPoint(
      rawPoint,
      rawPoint.accuracy || 10,
      rawPoint.speed || 0
    );

    return {
      ...processed,
      timestamp: rawPoint.timestamp || Date.now(),
      originalAccuracy: rawPoint.accuracy,
    };
  }

  reset() {
    this.smoother.reset();
    this.outlierDetector.reset();
    this.batteryTracker.reset();
  }

  getTrackingConfig(activityState, batteryLevel) {
    return this.batteryTracker.getTrackingConfig(activityState, batteryLevel);
  }
}

// Export singleton
let processorInstance = null;

export const getGPSProcessor = (config) => {
  if (!processorInstance) {
    processorInstance = new GPSProcessor(config);
  }
  return processorInstance;
};

export const resetGPSProcessor = () => {
  processorInstance = null;
};
