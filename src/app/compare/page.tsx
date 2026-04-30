'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Pin, MapPin, CircleCheck, CircleMinus, CircleX } from 'lucide-react';
import styles from './page.module.css';

interface RecordItem {
  id: string;
  result: { avgLuminance: number; maxLuminance: number; qualityScore: number; heatmapDataUrl: string };
  lightType: string;
  location: { lat: number; lng: number } | null;
  timestamp: string;
  originalImage: string;
}

export default function ComparePage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [selectedA, setSelectedA] = useState<string>('');
  const [selectedB, setSelectedB] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('lption_records');
    if (stored) {
      try { setRecords(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const recordA = records.find(r => r.id === selectedA);
  const recordB = records.find(r => r.id === selectedB);

  const formatDate = (ts: string) =>
    new Date(ts).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (records.length < 2) {
    return (
      <div className={styles.compare}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon}><RefreshCw size={32} /></span>
          <h2>비교하기</h2>
          <p>비교하려면 최소 2개의 측정 기록이 필요합니다</p>
          <p className="text-sm text-tertiary mt-sm">
            현재 {records.length}건의 기록이 있습니다
          </p>
          <Link href="/measure" className="btn btn-primary mt-lg">
            측정하러 가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.compare}>
      <h2 className={styles.title}>전/후 비교</h2>
      <p className="text-secondary text-sm mb-lg">
        비교할 두 측정 기록을 선택하세요
      </p>

      {/* Selection */}
      <div className={styles.selectionGrid}>
        <div className={styles.selectionCol}>
          <label className={styles.selectionLabel}><Pin size={14} className="inline mr-1" /> 기준 (Before)</label>
          <select
            className="input"
            value={selectedA}
            onChange={(e) => setSelectedA(e.target.value)}
          >
            <option value="">선택하세요</option>
            {records.map(r => (
              <option key={r.id} value={r.id} disabled={r.id === selectedB}>
                {formatDate(r.timestamp)} (평균 {r.result.avgLuminance.toFixed(1)})
              </option>
            ))}
          </select>
        </div>
        <div className={styles.selectionCol}>
          <label className={styles.selectionLabel}><MapPin size={14} className="inline mr-1" /> 비교 (After)</label>
          <select
            className="input"
            value={selectedB}
            onChange={(e) => setSelectedB(e.target.value)}
          >
            <option value="">선택하세요</option>
            {records.map(r => (
              <option key={r.id} value={r.id} disabled={r.id === selectedA}>
                {formatDate(r.timestamp)} (평균 {r.result.avgLuminance.toFixed(1)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Result */}
      {recordA && recordB && (
        <div className={`${styles.comparisonResult} animate-fade-in`}>
          {/* Images */}
          <div className={styles.imageCompare}>
            <div className={styles.imageCol}>
              <span className={styles.imageLabel}>Before</span>
              {recordA.originalImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={recordA.originalImage} alt="Before" className={styles.compareImg} />
              )}
              <span className="text-xs text-tertiary">{formatDate(recordA.timestamp)}</span>
            </div>
            <div className={styles.imageCol}>
              <span className={styles.imageLabel}>After</span>
              {recordB.originalImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={recordB.originalImage} alt="After" className={styles.compareImg} />
              )}
              <span className="text-xs text-tertiary">{formatDate(recordB.timestamp)}</span>
            </div>
          </div>

          {/* Stats Comparison */}
          <div className={`card ${styles.statsCompare}`}>
            <h3 className="section-title">수치 비교</h3>
            {[
              { label: '평균 밝기', a: recordA.result.avgLuminance, b: recordB.result.avgLuminance },
              { label: '최대 밝기', a: recordA.result.maxLuminance, b: recordB.result.maxLuminance },
              { label: '품질 점수', a: recordA.result.qualityScore, b: recordB.result.qualityScore },
            ].map((stat) => {
              const diff = stat.b - stat.a;
              const pctChange = stat.a > 0 ? ((diff / stat.a) * 100) : 0;
              return (
                <div key={stat.label} className={styles.compareRow}>
                  <span className={styles.compareLabel}>{stat.label}</span>
                  <span className="text-mono">{stat.a.toFixed(1)}</span>
                  <span className={styles.compareArrow}>→</span>
                  <span className="text-mono">{stat.b.toFixed(1)}</span>
                  <span className={`badge ${diff > 0 ? 'badge-danger' : diff < 0 ? 'badge-success' : 'badge-info'}`}>
                    {diff > 0 ? '↑' : diff < 0 ? '↓' : '='}{Math.abs(pctChange).toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Delta Summary */}
          <div className={`card ${styles.deltaCard}`}>
            {(() => {
              const lumDiff = recordB.result.avgLuminance - recordA.result.avgLuminance;
              const improved = lumDiff < 0;
              return (
                <>
                  <span className={styles.deltaIcon}>{improved ? <CircleCheck size={24} className="text-green-500" /> : lumDiff === 0 ? <CircleMinus size={24} className="text-blue-500" /> : <CircleX size={24} className="text-red-500" />}</span>
                  <div>
                    <strong>
                      {improved ? '밝기가 감소했습니다' : lumDiff === 0 ? '변화 없음' : '밝기가 증가했습니다'}
                    </strong>
                    <p className="text-sm text-secondary mt-sm">
                      평균 밝기 {Math.abs(lumDiff).toFixed(1)} {improved ? '감소' : '증가'}
                      {improved && ' (빛공해 개선 방향)'}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
