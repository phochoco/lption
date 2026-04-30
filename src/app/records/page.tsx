'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, Map as MapIcon, MapPin } from 'lucide-react';
import styles from './page.module.css';
import { LIGHT_TYPES } from '@/lib/standards/criteria';

interface RecordItem {
  id: string;
  result: { avgLuminance: number; maxLuminance: number; qualityScore: number; heatmapDataUrl: string };
  lightType: string;
  location: { lat: number; lng: number } | null;
  timestamp: string;
  originalImage: string;
  savedAt: string;
}

export default function RecordsPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [view, setView] = useState<'list' | 'map'>('list');

  useEffect(() => {
    const stored = localStorage.getItem('lption_records');
    if (stored) {
      try {
        setRecords(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm('이 기록을 삭제하시겠습니까?')) return;
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    localStorage.setItem('lption_records', JSON.stringify(updated));
  };

  return (
    <div className={styles.records}>
      <div className={styles.header}>
        <h2>측정 기록</h2>
        <span className="badge badge-accent">{records.length}건</span>
      </div>

      {/* View Toggle */}
      <div className={styles.viewToggle}>
        <button
          className={`${styles.toggleBtn} ${view === 'list' ? styles.toggleActive : ''}`}
          onClick={() => setView('list')}
        >
          <ClipboardList size={16} className="inline mr-1" /> 목록
        </button>
        <button
          className={`${styles.toggleBtn} ${view === 'map' ? styles.toggleActive : ''}`}
          onClick={() => setView('map')}
        >
          <MapIcon size={16} className="inline mr-1" /> 지도
        </button>
      </div>

      {records.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}><ClipboardList size={32} /></span>
          <p>아직 저장된 측정 기록이 없습니다</p>
          <Link href="/measure" className="btn btn-primary mt-lg">
            첫 측정 시작하기
          </Link>
        </div>
      ) : view === 'list' ? (
        <div className={styles.list}>
          {records.map((record) => {
            const lightInfo = LIGHT_TYPES.find(t => t.id === record.lightType);
            return (
              <div key={record.id} className={`card ${styles.recordCard}`}>
                <div className={styles.recordHeader}>
                  <div className={styles.recordMeta}>
                    {lightInfo && (
                      <span className="badge badge-accent">{lightInfo.icon} {lightInfo.label}</span>
                    )}
                    <span className="text-xs text-tertiary">
                      {new Date(record.timestamp).toLocaleString('ko-KR', {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(record.id)}
                    aria-label="삭제"
                  >
                    ×
                  </button>
                </div>

                <div className={styles.recordBody}>
                  {record.originalImage && (
                    <div className={styles.recordThumb}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={record.originalImage} alt="측정 이미지" />
                    </div>
                  )}
                  <div className={styles.recordStats}>
                    <div className={styles.recordStat}>
                      <span className={styles.recordStatLabel}>평균</span>
                      <span className={styles.recordStatValue}>{record.result.avgLuminance.toFixed(1)}</span>
                    </div>
                    <div className={styles.recordStat}>
                      <span className={styles.recordStatLabel}>최대</span>
                      <span className={styles.recordStatValue}>{record.result.maxLuminance.toFixed(1)}</span>
                    </div>
                    <div className={styles.recordStat}>
                      <span className={styles.recordStatLabel}>품질</span>
                      <span className={`${styles.recordStatValue} ${
                        record.result.qualityScore >= 70 ? styles.scoreGood :
                        record.result.qualityScore >= 40 ? styles.scoreOk : styles.scoreBad
                      }`}>{record.result.qualityScore}</span>
                    </div>
                  </div>
                </div>

                {record.location && (
                  <div className={styles.recordLocation}>
                    <MapPin size={14} className="inline mr-1" /> {record.location.lat.toFixed(4)}, {record.location.lng.toFixed(4)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`card ${styles.mapPlaceholder}`}>
          <span className={styles.emptyIcon}><MapIcon size={32} /></span>
          <p>지도 뷰는 위치 데이터가 있는 기록을 표시합니다</p>
          <p className="text-xs text-tertiary mt-sm">
            {records.filter(r => r.location).length}건의 위치 데이터 보유
          </p>
        </div>
      )}
    </div>
  );
}
