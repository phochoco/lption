/* EXIF 메타데이터 추출 유틸리티 */
import ExifReader from 'exifreader';

export interface ExifData {
  /* 카메라 설정 */
  iso: number | null;
  shutterSpeed: string | null;
  aperture: number | null;
  focalLength: number | null;
  whiteBalance: string | null;
  exposureTime: number | null;
  exposureMode: string | null;
  
  /* GPS */
  latitude: number | null;
  longitude: number | null;
  
  /* 기기 정보 */
  make: string | null;
  model: string | null;
  software: string | null;
  
  /* 시간 */
  dateTime: string | null;
  
  /* 이미지 */
  width: number | null;
  height: number | null;
  orientation: number | null;
}

export async function extractExif(file: File): Promise<ExifData> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const tags = ExifReader.load(arrayBuffer, { expanded: true });
    
    return {
      // 카메라 설정
      iso: getNumericTag(tags, 'ISOSpeedRatings') ?? getNumericTag(tags, 'PhotographicSensitivity'),
      shutterSpeed: getStringTag(tags, 'ExposureTime') ?? getStringTag(tags, 'ShutterSpeedValue'),
      aperture: getNumericTag(tags, 'FNumber') ?? getNumericTag(tags, 'ApertureValue'),
      focalLength: getNumericTag(tags, 'FocalLength'),
      whiteBalance: getStringTag(tags, 'WhiteBalance'),
      exposureTime: getNumericTag(tags, 'ExposureTime'),
      exposureMode: getStringTag(tags, 'ExposureMode'),
      
      // GPS
      latitude: tags.gps?.Latitude ?? null,
      longitude: tags.gps?.Longitude ?? null,
      
      // 기기 정보
      make: getStringTag(tags, 'Make'),
      model: getStringTag(tags, 'Model'),
      software: getStringTag(tags, 'Software'),
      
      // 시간
      dateTime: getStringTag(tags, 'DateTimeOriginal') ?? getStringTag(tags, 'DateTime'),
      
      // 이미지
      width: getNumericTag(tags, 'ImageWidth') ?? getNumericTag(tags, 'PixelXDimension'),
      height: getNumericTag(tags, 'ImageLength') ?? getNumericTag(tags, 'PixelYDimension'),
      orientation: getNumericTag(tags, 'Orientation'),
    };
  } catch (error) {
    console.warn('EXIF 추출 실패:', error);
    return getEmptyExif();
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function getStringTag(tags: any, name: string): string | null {
  // expanded 모드에서 exif/file 등 여러 그룹에서 검색
  for (const group of ['exif', 'file', 'iptc', 'xmp']) {
    if (tags[group]?.[name]?.description) {
      return tags[group][name].description;
    }
    if (tags[group]?.[name]?.value !== undefined) {
      return String(tags[group][name].value);
    }
  }
  return null;
}

function getNumericTag(tags: any, name: string): number | null {
  const str = getStringTag(tags, name);
  if (str === null) return null;
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function getEmptyExif(): ExifData {
  return {
    iso: null, shutterSpeed: null, aperture: null,
    focalLength: null, whiteBalance: null, exposureTime: null,
    exposureMode: null, latitude: null, longitude: null,
    make: null, model: null, software: null,
    dateTime: null, width: null, height: null, orientation: null,
  };
}

/* 기기 정보 자동 수집 (User-Agent 기반) */
export function getDeviceInfo(): { model: string; os: string } {
  if (typeof navigator === 'undefined') {
    return { model: 'Unknown', os: 'Unknown' };
  }
  
  const ua = navigator.userAgent;
  let model = 'Unknown';
  let os = 'Unknown';
  
  // iOS
  const iosMatch = ua.match(/iPhone|iPad/);
  if (iosMatch) {
    model = iosMatch[0];
    const versionMatch = ua.match(/OS (\d+[_\.]\d+)/);
    os = `iOS ${versionMatch ? versionMatch[1].replace('_', '.') : ''}`.trim();
  }
  
  // Android
  const androidMatch = ua.match(/Android (\d+\.?\d*)/);
  if (androidMatch) {
    os = `Android ${androidMatch[1]}`;
    const modelMatch = ua.match(/;\s*([^;)]+)\s*Build/);
    if (modelMatch) model = modelMatch[1].trim();
  }
  
  return { model, os };
}
