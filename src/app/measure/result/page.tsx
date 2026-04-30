'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Camera, Thermometer, Lightbulb, Save, ClipboardList, CheckCircle2, AlertTriangle, XCircle, Info, Zap } from 'lucide-react';
import styles from './page.module.css';
import type { AnalysisResult } from '@/lib/analysis/luminance';
import type { ExifData } from '@/lib/camera/exif';
import { LIGHT_TYPES, PURPOSE_TAGS, LEGAL_DISCLAIMER } from '@/lib/standards/criteria';

interface MeasurementData {
  result: AnalysisResult;
  exif: ExifData;
  device: { model: string; os: string };
  location: { lat: number; lng: number } | null;
  lightType: string;
  purpose: string;
  originalImage: string;
  timestamp: string;
}

export default function ResultPage() {
  const [data, setData] = useState<MeasurementData | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('lption_measurement');
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        console.error('측정 데이터 파싱 실패');
      }
    }
  }, []);

  if (!data) {
    return (
      <div className={styles.empty}>
        <p>분석 결과가 없습니다</p>
        <Link href="/measure" className="btn btn-primary mt-lg">
          측정하러 가기
        </Link>
      </div>
    );
  }

  const { result, exif, device, location, lightType, purpose } = data;
  const lightTypeInfo = LIGHT_TYPES.find(t => t.id === lightType);
  const purposeInfo = PURPOSE_TAGS.find(t => t.id === purpose);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'success';
    if (score >= 40) return 'warning';
    return 'danger';
  };

  const handleSave = () => {
    // 로컬 저장 (IndexedDB 대신 localStorage로 MVP)
    const records = JSON.parse(localStorage.getItem('lption_records') || '[]');
    const record = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      ...data,
      savedAt: new Date().toISOString(),
    };
    records.unshift(record);
    
    try {
      localStorage.setItem('lption_records', JSON.stringify(records));
      setSaved(true);
    } catch {
      // 용량 초과 시 이미지 제거하고 재시도
      const lightRecord = { ...record, originalImage: '', result: { ...record.result, heatmapDataUrl: '' } };
      records[0] = lightRecord;
      localStorage.setItem('lption_records', JSON.stringify(records));
      setSaved(true);
    }
  };

  return (
    <div className={styles.result}>
      {/* Quality Score */}
      <div className={`card ${styles.scoreCard}`}>
        <div className={styles.scoreCircle}>
          <svg viewBox="0 0 100 100" className={styles.scoreSvg}>
            <circle cx="50" cy="50" r="42" className={styles.scoreTrack} />
            <circle
              cx="50" cy="50" r="42"
              className={styles.scoreFill}
              style={{
                strokeDasharray: `${(result.qualityScore / 100) * 264} 264`,
                stroke: result.qualityScore >= 70 ? 'var(--color-success)' :
                        result.qualityScore >= 40 ? 'var(--color-warning)' : 'var(--color-danger)',
              }}
            />
          </svg>
          <span className={styles.scoreValue}>{result.qualityScore}</span>
        </div>
        <div className={styles.scoreInfo}>
          <h2>촬영 품질</h2>
          <span className={`badge badge-${getScoreColor(result.qualityScore)}`}>
            {result.qualityScore >= 70 ? <><CheckCircle2 size={14} /> 분석 적합</> :
             result.qualityScore >= 40 ? <><AlertTriangle size={14} /> 참고용 사용 가능</> : <><XCircle size={14} /> 재촬영 권장</>}
          </span>
        </div>
      </div>

      {/* Quality Issues */}
      {result.qualityIssues.length > 0 && (
        <div className={styles.issuesSection}>
          <h3 className="section-title">품질 이슈</h3>
          {result.qualityIssues.map((issue, i) => (
            <div key={i} className={`card ${styles.issueCard}`}>
              <div className={`badge badge-${issue.severity === 'high' ? 'danger' : issue.severity === 'medium' ? 'warning' : 'info'}`}>
                {issue.severity === 'high' ? <><AlertTriangle size={14} /> 심각</> : issue.severity === 'medium' ? <><Zap size={14} /> 주의</> : <><Info size={14} /> 참고</>}
              </div>
              <p className={styles.issueMessage}>{issue.message}</p>
              <p className={styles.issueSuggestion}><Lightbulb size={16} className="inline mr-1" /> {issue.suggestion}</p>
            </div>
          ))}
        </div>
      )}

      {/* Image Toggle */}
      <div className={styles.imageSection}>
        <div className={styles.imageToggle}>
          <button
            className={`${styles.toggleBtn} ${!showHeatmap ? styles.toggleActive : ''}`}
            onClick={() => setShowHeatmap(false)}
          >
            <Camera size={18} className="inline mr-1" /> 원본
          </button>
          <button
            className={`${styles.toggleBtn} ${showHeatmap ? styles.toggleActive : ''}`}
            onClick={() => setShowHeatmap(true)}
          >
            <Thermometer size={18} className="inline mr-1" /> 히트맵
          </button>
        </div>
        <div className={styles.imageContainer}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={showHeatmap ? result.heatmapDataUrl : data.originalImage}
            alt={showHeatmap ? '밝기 히트맵' : '원본 이미지'}
            className={styles.analysisImage}
          />
          {showHeatmap && (
            <div className={styles.heatmapLegend}>
              <span>어두움</span>
              <div className={styles.legendGradient} />
              <span>밝음</span>
            </div>
          )}
        </div>
      </div>

      {/* Luminance Stats */}
      <div className={styles.statsSection}>
        <h3 className="section-title">밝기 분석 결과</h3>
        <div className={styles.statsGrid}>
          <div className={`card ${styles.statCard}`}>
            <span className={styles.statLabel}>평균 밝기</span>
            <span className={styles.statValue}>{result.avgLuminance.toFixed(1)}</span>
            <span className={styles.statUnit}>cd/m² (참고)</span>
          </div>
          <div className={`card ${styles.statCard}`}>
            <span className={styles.statLabel}>최대 밝기</span>
            <span className={styles.statValue}>{result.maxLuminance.toFixed(1)}</span>
            <span className={styles.statUnit}>cd/m² (참고)</span>
          </div>
          <div className={`card ${styles.statCard}`}>
            <span className={styles.statLabel}>최소 밝기</span>
            <span className={styles.statValue}>{result.minLuminance.toFixed(1)}</span>
            <span className={styles.statUnit}>cd/m² (참고)</span>
          </div>
          <div className={`card ${styles.statCard}`}>
            <span className={styles.statLabel}>표준편차</span>
            <span className={styles.statValue}>{result.luminanceStd.toFixed(1)}</span>
            <span className={styles.statUnit}>밝기 분산도</span>
          </div>
        </div>

        <div className={`card ${styles.distributionCard}`}>
          <div className={styles.distRow}>
            <span>과노출 영역</span>
            <div className={styles.distBar}>
              <div
                className={styles.distFill}
                style={{
                  width: `${Math.min(100, result.overexposedPct)}%`,
                  background: 'var(--color-danger)',
                }}
              />
            </div>
            <span className="text-mono text-sm">{result.overexposedPct.toFixed(1)}%</span>
          </div>
          <div className={styles.distRow}>
            <span>저노출 영역</span>
            <div className={styles.distBar}>
              <div
                className={styles.distFill}
                style={{
                  width: `${Math.min(100, result.underexposedPct)}%`,
                  background: 'var(--color-info)',
                }}
              />
            </div>
            <span className="text-mono text-sm">{result.underexposedPct.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className={styles.metaSection}>
        <h3 className="section-title">촬영 정보</h3>
        <div className={`card ${styles.metaCard}`}>
          <div className={styles.metaRow}>
            <span>촬영 시각</span>
            <span>{exif.dateTime || new Date(data.timestamp).toLocaleString('ko-KR')}</span>
          </div>
          {location && (
            <div className={styles.metaRow}>
              <span>위치</span>
              <span>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
            </div>
          )}
          {lightTypeInfo && (
            <div className={styles.metaRow}>
              <span>조명 유형</span>
              <span>{lightTypeInfo.icon} {lightTypeInfo.label}</span>
            </div>
          )}
          {purposeInfo && (
            <div className={styles.metaRow}>
              <span>측정 목적</span>
              <span>{purposeInfo.icon} {purposeInfo.label}</span>
            </div>
          )}
          <div className={styles.metaRow}>
            <span>기기</span>
            <span>{exif.make || device.model} / {device.os}</span>
          </div>
          {exif.iso && (
            <div className={styles.metaRow}>
              <span>ISO</span>
              <span>{exif.iso}</span>
            </div>
          )}
          {exif.shutterSpeed && (
            <div className={styles.metaRow}>
              <span>셔터속도</span>
              <span>{exif.shutterSpeed}s</span>
            </div>
          )}
          {exif.aperture && (
            <div className={styles.metaRow}>
              <span>조리개</span>
              <span>f/{exif.aperture}</span>
            </div>
          )}
          <div className={styles.metaRow}>
            <span>분석 소요</span>
            <span>{result.processingTimeMs}ms</span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer">
        {LEGAL_DISCLAIMER}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {!saved ? (
          <button className="btn btn-primary btn-full btn-lg" onClick={handleSave} id="btn-save">
            <Save size={20} className="mr-2" /> 결과 저장하기
          </button>
        ) : (
          <div className={styles.savedConfirm}>
            <span className="badge badge-success"><CheckCircle2 size={16} className="mr-1" /> 저장 완료</span>
          </div>
        )}
        <Link href="/measure" className="btn btn-secondary btn-full" id="btn-remeasure">
          <Camera size={20} className="mr-2" /> 다시 측정하기
        </Link>
        {saved && (
          <Link href="/records" className="btn btn-ghost btn-full">
            <ClipboardList size={20} className="mr-2" /> 기록 보기
          </Link>
        )}
      </div>
    </div>
  );
}
