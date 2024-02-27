import * as onvif from "onvif";

const Cam = onvif.Cam;

const cameraLock = {};

export class CameraUtils {
  constructor() {}

  static lockCamera = (hostname) => {
    cameraLock[hostname] = true;
  };

  static unlockCamera = (hostname) => {
    cameraLock[hostname] = false;
  };

  static gotoPreset = async ({ camParams, preset }) =>
    new Promise((resolve, reject) => {
      new Cam(camParams, function (err) {
        if (err) {
          return reject(err);
        }

        if (cameraLock[camParams.hostname]) {
          return reject({ error: "Camera is locked" });
        }

        this.gotoPreset({ preset }, (data) => resolve(data));
      });
    });

  static getPreset = async ({ camParams }) =>
    new Promise(
      (resolve, reject) =>
        new Cam(camParams, function (err) {
          if (err) return reject(err);

          this.getPresets({}, (error, presets) => {
            if (error) return reject(error);
            if (presets) return resolve(presets);
          });
        }),
    );

  static getStatus = async ({ camParams }) =>
    new Promise(
      (resolve, reject) =>
        new Cam({ ...camParams, timeout: 5000 }, function (err) {
          if (err) return reject(err);
          this.getStatus({}, (error, status) => {
            if (error) return reject(error);
            if (status) return resolve(status);
          });
        }),
    );

  static absoluteMove = async ({ camParams, x, y, zoom }) =>
    new Promise((resolve, reject) => {
      new Cam(camParams, function (err) {
        if (err) {
          return reject(err);
        }

        if (cameraLock[camParams.hostname]) {
          return reject({ error: "Camera is locked" });
        }

        try {
          const result = this.absoluteMove({ x, y, zoom });
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

  static relativeMove = async ({ camParams, x, y, zoom }) =>
    new Promise((resolve, reject) => {
      new Cam(camParams, function (err) {
        if (err) {
          return reject(err);
        }

        if (cameraLock[camParams.hostname]) {
          return reject({ error: "Camera is locked" });
        }

        try {
          const result = this.relativeMove({ x, y, zoom });
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

  static setPreset = async ({ camParams, presetName }) =>
    new Promise((resolve, reject) => {
      new Cam(camParams, function (err) {
        if (err) return reject(err);
        try {
          const result = this.setPreset({ presetName }, () => {});
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

  static getSnapshotUri = async ({ camParams }) =>
    new Promise((resolve, reject) => {
      new Cam(camParams, function (err) {
        if (err) return reject(err);
        try {
          const result = this.getSnapshotUri({}, (error, snapshotUri) => {
            if (error) return reject(error);
            if (snapshotUri) return resolve(snapshotUri);
          });
        } catch (error) {
          reject(error);
        }
      });
    });
}
