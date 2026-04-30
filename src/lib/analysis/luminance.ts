/* 이미지 분석 엔진 - 휘도 계산, 품질 검증, 히트맵 생성 */

export interface AnalysisResult {
  /* 휘도 통계 */
  avgLuminance: number;
  maxLuminance: number;
  minLuminance: number;
  luminanceStd: number;
  
  /* 품질 판정 */
  qualityScore: number; // 0~100
  qualityIssues: QualityIssue[];
  isValid: boolean;
  
  /* 분포 데이터 */
  histogram: number[]; // 256 bins
  overexposedPct: number; // 과노출 픽셀 비율 (%)
  underexposedPct: number; // 저노출 픽셀 비율 (%)
  
  /* 히트맵 이미지 데이터 */
  heatmapDataUrl: string;
  
  /* 처리 시간 */
  processingTimeMs: number;
}

export interface QualityIssue {
  type: 'overexposed' | 'underexposed' | 'blur' | 'noise' | 'low_contrast';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
}

export interface ROIResult {
  avgLuminance: number;
  maxLuminance: number;
  minLuminance: number;
  pixelCount: number;
}

/* ── 휘도 계산 ── */
// 스마트폰 픽셀값(0~255)을 대략적인 cd/m² 스케일로 매핑하기 위한 임시 보정값
// 실제 측정 시 EXIF의 ISO, 셔터스피드, 조리개값을 이용한 광도 교정(Photometric Calibration)이 필요합니다.
const LUMINANCE_CALIBRATION_FACTOR = 3.5; // 최대 255픽셀 * 3.5 = 892.5 cd/m²

export function calculateLuminance(r: number, g: number, b: number): number {
  // ITU-R BT.709 표준 (0~255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/* ── 전체 이미지 분석 ── */
export function analyzeImage(imageData: ImageData): AnalysisResult {
  const startTime = performance.now();
  const { data, width, height } = imageData;
  const pixelCount = width * height;
  
  // 휘도 배열 생성
  const luminances = new Float32Array(pixelCount);
  const histogram = new Array(256).fill(0);
  
  let sum = 0;
  let max = 0;
  let min = 255;
  let overexposedCount = 0;
  let underexposedCount = 0;
  
  for (let i = 0; i < pixelCount; i++) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const lum = calculateLuminance(r, g, b);
    
    luminances[i] = lum;
    sum += lum;
    if (lum > max) max = lum;
    if (lum < min) min = lum;
    
    const lumBin = Math.min(255, Math.round(lum));
    histogram[lumBin]++;
    
    // 과노출: R,G,B 모두 245 이상
    if (r > 245 && g > 245 && b > 245) overexposedCount++;
    // 저노출: R,G,B 모두 10 이하
    if (r < 10 && g < 10 && b < 10) underexposedCount++;
  }
  
  const avg = sum / pixelCount;
  
  // 표준편차 계산
  let varianceSum = 0;
  for (let i = 0; i < pixelCount; i++) {
    const diff = luminances[i] - avg;
    varianceSum += diff * diff;
  }
  const std = Math.sqrt(varianceSum / pixelCount);
  
  const overexposedPct = (overexposedCount / pixelCount) * 100;
  const underexposedPct = (underexposedCount / pixelCount) * 100;
  
  // 품질 검증
  const qualityIssues = assessQuality(avg, overexposedPct, underexposedPct, std, imageData);
  const qualityScore = calculateQualityScore(qualityIssues);
  
  // 히트맵 생성
  const heatmapDataUrl = generateHeatmap(luminances, width, height);
  
  const processingTimeMs = performance.now() - startTime;
  
  return {
    avgLuminance: Math.round((avg * LUMINANCE_CALIBRATION_FACTOR) * 10) / 10,
    maxLuminance: Math.round((max * LUMINANCE_CALIBRATION_FACTOR) * 10) / 10,
    minLuminance: Math.round((min * LUMINANCE_CALIBRATION_FACTOR) * 10) / 10,
    luminanceStd: Math.round((std * LUMINANCE_CALIBRATION_FACTOR) * 10) / 10,
    qualityScore,
    qualityIssues,
    isValid: qualityScore >= 40,
    histogram,
    overexposedPct: Math.round(overexposedPct * 100) / 100,
    underexposedPct: Math.round(underexposedPct * 100) / 100,
    heatmapDataUrl,
    processingTimeMs: Math.round(processingTimeMs),
  };
}

/* ── 품질 검증 ── */
function assessQuality(
  avgLum: number,
  overexposedPct: number,
  underexposedPct: number,
  std: number,
  imageData: ImageData
): QualityIssue[] {
  const issues: QualityIssue[] = [];
  
  // 과노출 검사
  if (overexposedPct > 20) {
    issues.push({
      type: 'overexposed',
      severity: 'high',
      message: `과노출 영역 ${overexposedPct.toFixed(1)}%`,
      suggestion: '노출을 낮추거나 더 어두운 환경에서 다시 촬영해 주세요',
    });
  } else if (overexposedPct > 10) {
    issues.push({
      type: 'overexposed',
      severity: 'medium',
      message: `과노출 영역 ${overexposedPct.toFixed(1)}%`,
      suggestion: '일부 밝은 영역이 포화되었습니다. 참고용으로 사용 가능합니다',
    });
  }
  
  // 저노출 검사
  if (avgLum < 5) {
    issues.push({
      type: 'underexposed',
      severity: 'high',
      message: '이미지가 매우 어둡습니다',
      suggestion: '노출 시간을 늘리거나 ISO를 높여 다시 촬영해 주세요',
    });
  } else if (avgLum < 15) {
    issues.push({
      type: 'underexposed',
      severity: 'low',
      message: '이미지가 다소 어둡습니다',
      suggestion: '야간 촬영 시 정상 범위일 수 있습니다',
    });
  }
  
  // 저대비 검사
  if (std < 10) {
    issues.push({
      type: 'low_contrast',
      severity: 'medium',
      message: '이미지 대비가 매우 낮습니다',
      suggestion: '밝기 차이가 거의 없습니다. 촬영 대상을 확인해 주세요',
    });
  }
  
  // 흔들림 검사 (Laplacian Variance)
  const blurScore = calculateBlurScore(imageData);
  if (blurScore < 50) {
    issues.push({
      type: 'blur',
      severity: 'high',
      message: '이미지가 흐릿합니다 (흔들림 의심)',
      suggestion: '삼각대를 사용하거나 기기를 안정적으로 고정하고 다시 촬영해 주세요',
    });
  } else if (blurScore < 100) {
    issues.push({
      type: 'blur',
      severity: 'medium',
      message: '약간의 흔들림이 감지되었습니다',
      suggestion: '가능하면 기기를 고정하여 촬영해 주세요',
    });
  }
  
  return issues;
}

/* ── 흔들림 감지 (Laplacian Variance) ── */
function calculateBlurScore(imageData: ImageData): number {
  const { data, width, height } = imageData;
  
  // 그레이스케일 변환 + 다운샘플링 (성능 최적화)
  const scale = Math.min(1, 800 / Math.max(width, height));
  const sw = Math.floor(width * scale);
  const sh = Math.floor(height * scale);
  
  const gray = new Float32Array(sw * sh);
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const srcX = Math.floor(x / scale);
      const srcY = Math.floor(y / scale);
      const idx = (srcY * width + srcX) * 4;
      gray[y * sw + x] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }
  }
  
  // Laplacian 적용
  let sum = 0;
  let count = 0;
  const mean = gray.reduce((a, b) => a + b, 0) / gray.length;
  
  for (let y = 1; y < sh - 1; y++) {
    for (let x = 1; x < sw - 1; x++) {
      const laplacian =
        gray[(y - 1) * sw + x] +
        gray[(y + 1) * sw + x] +
        gray[y * sw + (x - 1)] +
        gray[y * sw + (x + 1)] -
        4 * gray[y * sw + x];
      sum += laplacian * laplacian;
      count++;
    }
  }
  
  return count > 0 ? sum / count : 0;
}

/* ── 품질 점수 계산 ── */
function calculateQualityScore(issues: QualityIssue[]): number {
  let score = 100;
  for (const issue of issues) {
    switch (issue.severity) {
      case 'high': score -= 30; break;
      case 'medium': score -= 15; break;
      case 'low': score -= 5; break;
    }
  }
  return Math.max(0, Math.min(100, score));
}

/* ── 히트맵 생성 (pseudo-color) ── */
function generateHeatmap(luminances: Float32Array, width: number, height: number): string {
  // 브라우저 환경이 아니면 빈 문자열 반환 (SSR 안전)
  if (typeof document === 'undefined') {
    return '';
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const heatmapData = ctx.createImageData(width, height);
  
  // 로컬 min/max로 정규화
  let lMin = 255, lMax = 0;
  for (let i = 0; i < luminances.length; i++) {
    if (luminances[i] < lMin) lMin = luminances[i];
    if (luminances[i] > lMax) lMax = luminances[i];
  }
  const range = lMax - lMin || 1;
  
  for (let i = 0; i < luminances.length; i++) {
    const normalized = (luminances[i] - lMin) / range; // 0~1
    const [r, g, b] = jetColormap(normalized);
    const idx = i * 4;
    heatmapData.data[idx] = r;
    heatmapData.data[idx + 1] = g;
    heatmapData.data[idx + 2] = b;
    heatmapData.data[idx + 3] = 255;
  }
  
  ctx.putImageData(heatmapData, 0, 0);
  return canvas.toDataURL('image/png');
}

/* ── Jet Colormap ── */
function jetColormap(value: number): [number, number, number] {
  // 0=파랑(낮은 밝기) → 1=빨강(높은 밝기)
  const v = Math.max(0, Math.min(1, value));
  let r: number, g: number, b: number;
  
  if (v < 0.125) {
    r = 0; g = 0; b = 0.5 + v * 4;
  } else if (v < 0.375) {
    r = 0; g = (v - 0.125) * 4; b = 1;
  } else if (v < 0.625) {
    r = (v - 0.375) * 4; g = 1; b = 1 - (v - 0.375) * 4;
  } else if (v < 0.875) {
    r = 1; g = 1 - (v - 0.625) * 4; b = 0;
  } else {
    r = 1 - (v - 0.875) * 4 * 0.5; g = 0; b = 0;
  }
  
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/* ── ROI 분석 ── */
export function analyzeROI(
  imageData: ImageData,
  x: number, y: number, w: number, h: number
): ROIResult {
  const { data, width } = imageData;
  let sum = 0;
  let max = 0;
  let min = 255;
  let count = 0;
  
  for (let ry = y; ry < y + h; ry++) {
    for (let rx = x; rx < x + w; rx++) {
      const idx = (ry * width + rx) * 4;
      const lum = calculateLuminance(data[idx], data[idx + 1], data[idx + 2]);
      sum += lum;
      if (lum > max) max = lum;
      if (lum < min) min = lum;
      count++;
    }
  }
  
  return {
    avgLuminance: Math.round(((sum / count) * LUMINANCE_CALIBRATION_FACTOR) * 10) / 10,
    maxLuminance: Math.round((max * LUMINANCE_CALIBRATION_FACTOR) * 10) / 10,
    minLuminance: Math.round((min * LUMINANCE_CALIBRATION_FACTOR) * 10) / 10,
    pixelCount: count,
  };
}

/* ── 히트맵 재생성 (메인 스레드용) ── */
export function regenerateHeatmapOnMain(imageData: ImageData): string {
  const { data, width, height } = imageData;
  const pixelCount = width * height;
  
  const luminances = new Float32Array(pixelCount);
  for (let i = 0; i < pixelCount; i++) {
    const idx = i * 4;
    luminances[i] = calculateLuminance(data[idx], data[idx + 1], data[idx + 2]);
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const heatmapData = ctx.createImageData(width, height);
  
  let lMin = 255, lMax = 0;
  for (let i = 0; i < luminances.length; i++) {
    if (luminances[i] < lMin) lMin = luminances[i];
    if (luminances[i] > lMax) lMax = luminances[i];
  }
  const range = lMax - lMin || 1;
  
  for (let i = 0; i < luminances.length; i++) {
    const normalized = (luminances[i] - lMin) / range;
    const [r, g, b] = jetColormap(normalized);
    const idx = i * 4;
    heatmapData.data[idx] = r;
    heatmapData.data[idx + 1] = g;
    heatmapData.data[idx + 2] = b;
    heatmapData.data[idx + 3] = 255;
  }
  
  ctx.putImageData(heatmapData, 0, 0);
  return canvas.toDataURL('image/png');
}
