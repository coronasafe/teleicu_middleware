-- Update all assets from CAMERA to ONVIF
UPDATE "Asset"
SET type = 'ONVIF'
WHERE type = 'CAMERA';

-- Update all assets from MONITOR to HL7MONITOR
UPDATE "Asset"
SET type = 'HL7MONITOR'
WHERE type = 'MONITOR';