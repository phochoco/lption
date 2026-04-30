'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, CheckSquare, Square, Loader } from 'lucide-react';
import styles from './page.module.css';
import { LIGHT_TYPES, LEGAL_DISCLAIMER } from '@/lib/standards/criteria';

interface RecordItem {
  id: string;
  result: { avgLuminance: number; maxLuminance: number; minLuminance: number; luminanceStd: number; qualityScore: number; overexposedPct: number; heatmapDataUrl: string };
  exif: { iso: number | null; shutterSpeed: string | null; aperture: number | null; dateTime: string | null; make: string | null; model: string | null };
  device: { model: string; os: string };
  lightType: string;
  purpose: string;
  location: { lat: number; lng: number } | null;
  timestamp: string;
  originalImage: string;
}

export default function ReportPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [title, setTitle] = useState('빛공해 측정 리포트');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('lption_records');
    if (stored) {
      try { setRecords(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const handleGenerate = async () => {
    if (selected.size === 0) return;
    setGenerating(true);

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // 한글 지원을 위한 기본 폰트
      doc.setFont('helvetica');
      
      let y = 20;

      // Title
      doc.setFontSize(18);
      doc.text(title, 105, y, { align: 'center' });
      y += 10;

      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(`Generated: ${new Date().toLocaleString('ko-KR')}`, 105, y, { align: 'center' });
      y += 15;

      // Each measurement
      const selectedRecords = records.filter(r => selected.has(r.id));
      for (const record of selectedRecords) {
        if (y > 240) { doc.addPage(); y = 20; }

        const lightInfo = LIGHT_TYPES.find(t => t.id === record.lightType);

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Measurement - ${new Date(record.timestamp).toLocaleString('ko-KR')}`, 20, y);
        y += 8;

        doc.setFontSize(9);
        doc.setTextColor(80);

        const info = [
          `Light Type: ${lightInfo?.label || record.lightType}`,
          `Device: ${record.exif?.make || record.device?.model || 'N/A'} / ${record.device?.os || 'N/A'}`,
          `Location: ${record.location ? `${record.location.lat.toFixed(4)}, ${record.location.lng.toFixed(4)}` : 'N/A'}`,
          `Avg Luminance: ${record.result.avgLuminance.toFixed(1)} (ref)`,
          `Max Luminance: ${record.result.maxLuminance.toFixed(1)} (ref)`,
          `Quality Score: ${record.result.qualityScore}/100`,
          `ISO: ${record.exif?.iso || 'N/A'}`,
          `Shutter: ${record.exif?.shutterSpeed || 'N/A'}`,
        ];

        for (const line of info) {
          doc.text(line, 20, y);
          y += 5;
        }

        // Add image if available
        if (record.originalImage) {
          try {
            doc.addImage(record.originalImage, 'JPEG', 20, y, 80, 60);
            y += 65;
          } catch { y += 5; }
        }

        if (record.result.heatmapDataUrl) {
          try {
            doc.addImage(record.result.heatmapDataUrl, 'PNG', 110, y - 65, 80, 60);
          } catch { /* ignore */ }
        }

        y += 10;
        doc.setDrawColor(200);
        doc.line(20, y, 190, y);
        y += 10;
      }

      // Memo
      if (memo) {
        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text('Notes:', 20, y);
        y += 6;
        doc.setFontSize(9);
        doc.setTextColor(80);
        const lines = doc.splitTextToSize(memo, 170);
        doc.text(lines, 20, y);
        y += lines.length * 5 + 10;
      }

      // Disclaimer
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(7);
      doc.setTextColor(150);
      const disclaimer = doc.splitTextToSize(
        'DISCLAIMER: This service is not a legally certified measuring instrument. For official legal or administrative decisions, please use certified measurement equipment and follow official procedures.',
        170
      );
      doc.text(disclaimer, 20, y);

      doc.save(`lption-report-${Date.now()}.pdf`);
    } catch (err) {
      console.error('PDF 생성 실패:', err);
      alert('리포트 생성 중 오류가 발생했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  if (records.length === 0) {
    return (
      <div className={styles.report}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon}><FileText size={32} /></span>
          <h2>리포트</h2>
          <p>리포트를 만들려면 먼저 측정 기록이 필요합니다</p>
          <Link href="/measure" className="btn btn-primary mt-lg">
            측정하러 가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.report}>
      <h2 className={styles.title}>리포트 생성</h2>
      <p className="text-secondary text-sm mb-lg">
        리포트에 포함할 측정 기록을 선택하세요
      </p>

      {/* Title Input */}
      <div className="input-group mb-lg">
        <label className="input-label">리포트 제목</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="빛공해 측정 리포트"
        />
      </div>

      {/* Record Selection */}
      <div className={styles.recordList}>
        {records.map((record) => {
          const isSelected = selected.has(record.id);
          const lightInfo = LIGHT_TYPES.find(t => t.id === record.lightType);
          return (
            <button
              key={record.id}
              className={`card card-interactive ${styles.selectCard} ${isSelected ? styles.selectCardActive : ''}`}
              onClick={() => toggleSelect(record.id)}
            >
              <div className={styles.selectCheck}>
                {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
              </div>
              <div className={styles.selectInfo}>
                <span className="text-sm font-medium">
                  {new Date(record.timestamp).toLocaleString('ko-KR', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
                <span className="text-xs text-tertiary">
                  {lightInfo?.icon} {lightInfo?.label} · 평균 {record.result.avgLuminance.toFixed(1)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Memo */}
      <div className="input-group mt-lg">
        <label className="input-label">메모 (선택)</label>
        <textarea
          className="input"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="민원 내용, 상황 설명 등을 기록하세요..."
          rows={3}
        />
      </div>

      {/* Disclaimer */}
      <div className="disclaimer mt-lg">
        {LEGAL_DISCLAIMER}
      </div>

      {/* Generate Button */}
      <button
        className="btn btn-primary btn-full btn-lg mt-lg"
        onClick={handleGenerate}
        disabled={selected.size === 0 || generating}
        id="btn-generate-report"
      >
        {generating ? <><Loader size={20} className="mr-2 animate-spin" /> 생성 중...</> : <><FileText size={20} className="mr-2" /> 리포트 생성 ({selected.size}건 선택)</>}
      </button>
    </div>
  );
}
