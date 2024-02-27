declare module "onvif" {
  export class Cam {
    constructor(params: any, callback: (err: any) => void);
    gotoPreset(params: any, callback: (err: any) => void);
    getPresets(params: any, callback: (err: any) => void);
    getStatus(params: any, callback: (err: any) => void);
  }
}
