import * as exifr from 'exifr';

export interface ExifData {
  cameraMake?: string;
  cameraModel?: string;
  lensMake?: string;
  lensModel?: string;
  iso?: number;
  aperture?: number;
  shutterSpeedDisplay?: string;
  shutterSpeedValue?: number;
  focalLength?: number;
}

export function sanitizeExifString(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

export function parseAperture(raw: string | number | undefined | null): number | null {
  if (raw === undefined || raw === null) return null;
  if (typeof raw === 'number') return raw;
  const cleaned = raw.replace(/^f\/?/i, '').trim();
  const value = parseFloat(cleaned);
  return isNaN(value) ? null : value;
}

export function parseShutterSpeed(
  raw: string | number | undefined | null,
): { display: string; value: number } | null {
  if (raw === undefined || raw === null) return null;

  if (typeof raw === 'number') {
    const display = raw >= 1 ? `${raw}"` : `1/${Math.round(1 / raw)}`;
    return { display, value: raw };
  }

  const str = String(raw).trim();

  const fractionMatch = str.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1], 10);
    const denominator = parseInt(fractionMatch[2], 10);
    if (denominator === 0) return null;
    return { display: str, value: numerator / denominator };
  }

  const value = parseFloat(str.replace(/"$/, ''));
  if (isNaN(value)) return null;
  return { display: value >= 1 ? `${value}"` : str, value };
}

export async function parseExifFromBuffer(buffer: Buffer): Promise<ExifData | null> {
  try {
    const exif = await exifr.parse(buffer, {
      pick: [
        'Make', 'Model', 'LensMake', 'LensModel',
        'ISO', 'FNumber', 'ExposureTime', 'FocalLength',
      ],
    });

    if (!exif) return null;

    const result: ExifData = {};

    if (exif.Make) result.cameraMake = sanitizeExifString(String(exif.Make));
    if (exif.Model) result.cameraModel = sanitizeExifString(String(exif.Model));
    if (exif.LensMake) result.lensMake = sanitizeExifString(String(exif.LensMake));
    if (exif.LensModel) result.lensModel = sanitizeExifString(String(exif.LensModel));
    if (exif.ISO != null) result.iso = Number(exif.ISO);

    if (exif.FNumber != null) {
      const parsed = parseAperture(exif.FNumber);
      if (parsed !== null) result.aperture = parsed;
    }

    if (exif.ExposureTime != null) {
      const parsed = parseShutterSpeed(exif.ExposureTime);
      if (parsed) {
        result.shutterSpeedDisplay = parsed.display;
        result.shutterSpeedValue = parsed.value;
      }
    }

    if (exif.FocalLength != null) result.focalLength = Number(exif.FocalLength);

    return result;
  } catch {
    return null;
  }
}
