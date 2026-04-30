'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Lightbulb, ClipboardList, Camera, Image as ImageIcon, Ruler, Palette, CheckCircle2, Check } from 'lucide-react';
import styles from './page.module.css';
import { LIGHT_TYPES, PURPOSE_TAGS } from '@/lib/standards/criteria';

type Step = 'location' | 'type' | 'guide' | 'capture' | 'analyzing' | 'complete';

export default function MeasurePage() {
  const [step, setStep] = useState<Step>('location');
  const [lightType, setLightType] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [locationReady, setLocationReady] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const steps: { key: Step; label: string }[] = [
    { key: 'location', label: '위치' },
    { key: 'type', label: '유형' },
    { key: 'guide', label: '가이드' },
    { key: 'capture', label: '촬영' },
    { key: 'analyzing', label: '분석' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);
  const progress = step === 'complete' ? 100 : ((currentStepIndex + 1) / steps.length) * 100;

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('이 기기에서는 위치 서비스를 사용할 수 없습니다');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationReady(true);
        setLocationError('');
      },
      (err) => {
        if (err.code === 1) {
          setLocationError('위치 접근이 거부되었습니다. 브라우저 설정에서 허용해 주세요');
        } else {
          setLocationError('위치를 가져올 수 없습니다. 수동으로 입력해 주세요');
        }
        // 위치 없이도 진행 가능
        setLocationReady(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCapture = () => {
    // 파일 입력 트리거
    const input = document.getElementById('camera-input') as HTMLInputElement;
    if (input) input.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStep('analyzing');

    // 분석 데이터를 세션에 저장하고 결과 페이지로 이동
    try {
      const { extractExif, getDeviceInfo } = await import('@/lib/camera/exif');
      const exifData = await extractExif(file);
      const deviceInfo = getDeviceInfo();

      // 이미지를 Canvas에 로드하여 분석
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200; // 분석용 최대 크기
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        canvas.width = Math.floor(img.width * scale);
        canvas.height = Math.floor(img.height * scale);
        
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const { analyzeImage, regenerateHeatmapOnMain } = await import('@/lib/analysis/luminance');
        const result = analyzeImage(imageData);
        
        // 히트맵이 비어있으면 메인 스레드에서 재생성
        if (!result.heatmapDataUrl) {
          result.heatmapDataUrl = regenerateHeatmapOnMain(imageData);
        }

        // 원본 이미지 DataURL
        const origCanvas = document.createElement('canvas');
        origCanvas.width = img.width;
        origCanvas.height = img.height;
        const origCtx = origCanvas.getContext('2d')!;
        origCtx.drawImage(img, 0, 0);
        const originalDataUrl = origCanvas.toDataURL('image/jpeg', 0.85);
        
        URL.revokeObjectURL(url);

        // 세션 스토리지에 저장
        const measurementData = {
          result,
          exif: exifData,
          device: deviceInfo,
          location: coords,
          lightType,
          purpose,
          originalImage: originalDataUrl,
          timestamp: new Date().toISOString(),
        };

        try {
          sessionStorage.setItem('lption_measurement', JSON.stringify(measurementData));
        } catch {
          // 이미지가 너무 큰 경우 축소
          const smallCanvas = document.createElement('canvas');
          smallCanvas.width = Math.floor(img.width * 0.3);
          smallCanvas.height = Math.floor(img.height * 0.3);
          const smallCtx = smallCanvas.getContext('2d')!;
          smallCtx.drawImage(img, 0, 0, smallCanvas.width, smallCanvas.height);
          measurementData.originalImage = smallCanvas.toDataURL('image/jpeg', 0.5);
          sessionStorage.setItem('lption_measurement', JSON.stringify(measurementData));
        }

        setStep('complete');
        window.location.href = '/measure/result';
      };
      
      img.src = url;
    } catch (err) {
      console.error('분석 오류:', err);
      setStep('capture');
      alert('이미지 분석 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <div className={styles.measure}>
      {/* Progress Bar */}
      <div className={styles.progressSection}>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.stepIndicators}>
          {steps.map((s, i) => (
            <span
              key={s.key}
              className={`${styles.stepDot} ${i <= currentStepIndex ? styles.stepActive : ''}`}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Step 1: Location */}
      {step === 'location' && (
        <div className={`${styles.stepContent} animate-fade-in`}>
          <div className={styles.stepHeader}>
            <span className={styles.stepIcon}><MapPin size={32} /></span>
            <h2>측정 위치 확인</h2>
            <p className="text-secondary">
              정확한 기록을 위해 현재 위치를 확인합니다
            </p>
          </div>

          {!locationReady ? (
            <button
              type="button"
              className="btn btn-primary btn-full btn-lg"
              onClick={handleGetLocation}
              id="btn-get-location"
            >
              <MapPin size={20} className="inline mr-2" /> 현재 위치 가져오기
            </button>
          ) : (
            <div className={styles.locationConfirm}>
              {coords ? (
                <div className={`card ${styles.locationCard}`}>
                  <div className="badge badge-success"><Check size={14} className="mr-1" /> 위치 확인됨</div>
                  <p className="text-sm text-secondary mt-sm">
                    위도 {coords.lat.toFixed(6)}, 경도 {coords.lng.toFixed(6)}
                  </p>
                </div>
              ) : (
                <div className={`card ${styles.locationCard}`}>
                  <div className="badge badge-warning">위치 미확인</div>
                  <p className="text-sm text-secondary mt-sm">
                    위치 없이도 측정을 진행할 수 있습니다
                  </p>
                </div>
              )}
            </div>
          )}

          {locationError && (
            <p className={styles.errorText}>{locationError}</p>
          )}

          {locationReady && (
            <button
              type="button"
              className="btn btn-primary btn-full btn-lg mt-lg"
              onClick={() => setStep('type')}
              id="btn-next-type"
            >
              다음 →
            </button>
          )}

          <button
            type="button"
            className="btn btn-ghost btn-full mt-md"
            onClick={() => { setLocationReady(true); setStep('type'); }}
          >
            위치 없이 진행
          </button>
        </div>
      )}

      {/* Step 2: Light Type */}
      {step === 'type' && (
        <div className={`${styles.stepContent} animate-fade-in`}>
          <div className={styles.stepHeader}>
            <span className={styles.stepIcon}><Lightbulb size={32} /></span>
            <h2>조명 유형 선택</h2>
            <p className="text-secondary">
              측정하려는 빛공해의 종류를 선택해 주세요
            </p>
          </div>

          <div className={styles.typeGrid}>
            {LIGHT_TYPES.map((type) => (
              <button
                type="button"
                key={type.id}
                className={`card card-interactive ${styles.typeCard} ${lightType === type.id ? styles.typeSelected : ''}`}
                onClick={() => setLightType(type.id)}
                id={`type-${type.id}`}
              >
                <span className={styles.typeIcon}>{type.icon}</span>
                <span className={styles.typeLabel}>{type.label}</span>
              </button>
            ))}
          </div>

          <div className={styles.purposeSection}>
            <h3 className="text-sm font-semibold text-secondary mb-sm">측정 목적 (선택)</h3>
            <div className={styles.purposeGrid}>
              {PURPOSE_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag.id}
                  className={`${styles.purposeTag} ${purpose === tag.id ? styles.purposeSelected : ''}`}
                  onClick={() => setPurpose(purpose === tag.id ? '' : tag.id)}
                >
                  {tag.icon} {tag.label}
                </button>
              ))}
            </div>
          </div>

          <div className={`flex gap-md ${styles.navButtons}`}>
            <button type="button" className="btn btn-secondary flex-1" onClick={() => setStep('location')}>
              ← 이전
            </button>
            <button
              type="button"
              className="btn btn-primary flex-1"
              onClick={() => setStep('guide')}
              disabled={!lightType}
              id="btn-next-guide"
            >
              다음 →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Guide */}
      {step === 'guide' && (
        <div className={`${styles.stepContent} animate-fade-in`}>
          <div className={styles.stepHeader}>
            <span className={styles.stepIcon}><ClipboardList size={32} /></span>
            <h2>촬영 가이드</h2>
            <p className="text-secondary">
              정확한 측정을 위해 아래 사항을 확인해 주세요
            </p>
          </div>

          <div className={styles.guideList}>
            <div className={styles.guideItem}>
              <span className={styles.guideCheck}><Check size={18} /></span>
              <div>
                <strong>플래시 OFF</strong>
                <p>카메라 플래시를 반드시 꺼주세요</p>
              </div>
            </div>
            <div className={styles.guideItem}>
              <span className={styles.guideCheck}><Check size={18} /></span>
              <div>
                <strong>야간모드 OFF</strong>
                <p>자동 야간모드/나이트모드를 꺼주세요</p>
              </div>
            </div>
            <div className={styles.guideItem}>
              <span className={styles.guideCheck}><Check size={18} /></span>
              <div>
                <strong>기기 고정</strong>
                <p>삼각대 또는 안정된 곳에 고정해 주세요</p>
              </div>
            </div>
            <div className={styles.guideItem}>
              <span className={styles.guideCheck}><Check size={18} /></span>
              <div>
                <strong>빛공해 원인을 포함</strong>
                <p>간판, 가로등 등 빛 원인이 화면에 포함되도록 구도를 잡아주세요</p>
              </div>
            </div>
            <div className={styles.guideItem}>
              <span className={styles.guideCheck}><Check size={18} /></span>
              <div>
                <strong>HDR OFF (가능한 경우)</strong>
                <p>HDR 촬영이 켜져 있으면 꺼주세요</p>
              </div>
            </div>
          </div>

          <div className="disclaimer mt-lg">
            촬영된 이미지의 밝기값은 기기에 따라 차이가 있을 수 있으며, 보정되지 않은 참고값입니다.
          </div>

          <div className={`flex gap-md ${styles.navButtons}`}>
            <button type="button" className="btn btn-secondary flex-1" onClick={() => setStep('type')}>
              ← 이전
            </button>
            <button
              type="button"
              className="btn btn-primary flex-1"
              onClick={() => setStep('capture')}
              id="btn-next-capture"
            >
              촬영하기 →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Capture */}
      {step === 'capture' && (
        <div className={`${styles.stepContent} animate-fade-in`}>
          <div className={styles.stepHeader}>
            <span className={styles.stepIcon}><Camera size={32} /></span>
            <h2>현장 촬영</h2>
            <p className="text-secondary">
              빛공해 현장을 촬영하거나 기존 사진을 선택하세요
            </p>
          </div>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            id="camera-input"
            className={styles.hiddenInput}
            onChange={handleFileSelected}
          />

          <div className={styles.captureButtons}>
            <button
              type="button"
              className={`btn btn-primary btn-full btn-lg ${styles.captureBtn}`}
              onClick={handleCapture}
              id="btn-capture"
            >
              <Camera size={20} className="inline mr-2" /> 카메라로 촬영
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-full"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => handleFileSelected(e as unknown as React.ChangeEvent<HTMLInputElement>);
                input.click();
              }}
              id="btn-gallery"
            >
              <ImageIcon size={20} className="inline mr-2" /> 갤러리에서 선택
            </button>
          </div>

          <button type="button" className="btn btn-ghost btn-full mt-lg" onClick={() => setStep('guide')}>
            ← 촬영 가이드 다시 보기
          </button>
        </div>
      )}

      {/* Step 5: Analyzing */}
      {step === 'analyzing' && (
        <div className={`${styles.stepContent} ${styles.analyzingContent} animate-fade-in`}>
          <div className={styles.analyzingSpinner}>
            <div className={styles.spinner} />
          </div>
          <h2>분석 중...</h2>
          <p className="text-secondary">
            이미지를 분석하고 있습니다.<br />
            잠시만 기다려 주세요.
          </p>
          <div className={styles.analyzingSteps}>
            <span className="animate-pulse"><Ruler size={16} className="inline mr-2" /> 밝기 분석 중</span>
            <span className="animate-pulse"><Palette size={16} className="inline mr-2" /> 히트맵 생성 중</span>
            <span className="animate-pulse"><CheckCircle2 size={16} className="inline mr-2" /> 품질 검증 중</span>
          </div>
        </div>
      )}

      {/* Guide Link */}
      {step !== 'analyzing' && step !== 'complete' && (
        <div className={styles.guideLink}>
          <Link href="/guide" className="text-sm text-accent">
            <Lightbulb size={16} className="inline mr-1" /> 빛공해 기준과 측정 방법 알아보기 →
          </Link>
        </div>
      )}
    </div>
  );
}
