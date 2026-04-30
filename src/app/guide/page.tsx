import Link from 'next/link';
import { Thermometer, BarChart2, TrendingUp, CheckCircle2, Camera } from 'lucide-react';
import styles from './page.module.css';
import { ZONE_STANDARDS, LIGHT_TYPES, LEGAL_DISCLAIMER } from '@/lib/standards/criteria';

export default function GuidePage() {
  return (
    <div className={styles.guide}>
      <h2 className={styles.title}>빛공해 가이드</h2>
      <p className="text-secondary text-sm mb-lg">
        빛공해의 기준과 올바른 측정 방법을 안내합니다
      </p>

      {/* What is Light Pollution */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>빛공해란?</h3>
        <div className={`card ${styles.infoCard}`}>
          <p>
            <strong>빛공해</strong>란 인공조명의 부적절한 사용으로 인해
            주거환경, 자연환경, 교통안전 등에 피해를 주는 현상입니다.
          </p>
          <p className="mt-md text-sm text-secondary">
            「인공조명에 의한 빛공해 방지법」에 따라
            지자체는 조명환경관리구역을 지정하고,
            조명기구의 빛방사허용기준을 관리합니다.
          </p>
        </div>
      </section>

      {/* Zone Standards */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>조명환경관리구역 기준</h3>
        <div className={styles.zoneList}>
          {ZONE_STANDARDS.map((zone) => (
            <div key={zone.id} className={`card ${styles.zoneCard}`}>
              <div className={styles.zoneHeader}>
                <span className={`badge badge-accent`}>{zone.name}</span>
                <span className={styles.zoneLimit}>
                  최대 <strong>{zone.maxIlluminance} lx</strong>
                </span>
              </div>
              <p className={styles.zoneDesc}>{zone.description}</p>
              <div className={styles.zoneExamples}>
                {zone.examples.map((ex, i) => (
                  <span key={i} className={styles.zoneExample}>{ex}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-tertiary mt-md">
          * 상세한 기준값은 「인공조명에 의한 빛공해 방지법 시행규칙」 별표1을 참조하세요
        </p>
      </section>

      {/* Light Types */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>빛공해 유형</h3>
        <div className={styles.typeList}>
          {LIGHT_TYPES.map((type) => (
            <div key={type.id} className={`card ${styles.typeCard}`}>
              <span className={styles.typeIcon}>{type.icon}</span>
              <div>
                <strong>{type.label}</strong>
                <p className="text-xs text-secondary">{type.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shooting Guide */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>올바른 촬영 방법</h3>
        <div className={styles.guideSteps}>
          <div className={`card ${styles.guideStep}`}>
            <div className={styles.guideStepNum}>1</div>
            <div>
              <strong>환경 준비</strong>
              <ul className={styles.guideList}>
                <li>플래시 OFF</li>
                <li>야간모드/나이트모드 OFF</li>
                <li>HDR OFF (가능한 경우)</li>
                <li>삼각대 또는 안정적인 고정</li>
              </ul>
            </div>
          </div>
          <div className={`card ${styles.guideStep}`}>
            <div className={styles.guideStepNum}>2</div>
            <div>
              <strong>구도 설정</strong>
              <ul className={styles.guideList}>
                <li>빛공해 원인(간판, 가로등 등)을 화면에 포함</li>
                <li>비교 대상이 있으면 함께 포함</li>
                <li>수평을 맞추어 촬영</li>
              </ul>
            </div>
          </div>
          <div className={`card ${styles.guideStep}`}>
            <div className={styles.guideStepNum}>3</div>
            <div>
              <strong>촬영 주의사항</strong>
              <ul className={styles.guideList}>
                <li>동일 장소를 여러 장 촬영 권장</li>
                <li>비교 시 동일한 구도와 위치 유지</li>
                <li>촬영 시간대를 기록 (예: 밤 10시)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Understanding Results */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>분석 결과 읽기</h3>
        <div className={`card ${styles.infoCard}`}>
          <div className={styles.resultGuide}>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}><Thermometer size={18} className="inline mr-1" /> 히트맵</span>
              <p>파란색(어두움)→빨간색(밝음)으로 밝기 분포를 시각화합니다</p>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}><BarChart2 size={18} className="inline mr-1" /> 평균 밝기</span>
              <p>촬영 이미지 전체의 평균 밝기값입니다 (참고용)</p>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}><TrendingUp size={18} className="inline mr-1" /> 최대 밝기</span>
              <p>가장 밝은 영역의 값입니다. 광원 근처가 높게 나타납니다</p>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}><CheckCircle2 size={18} className="inline mr-1" /> 품질 점수</span>
              <p>촬영 이미지의 분석 적합도입니다. 70점 이상이면 양호합니다</p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className={styles.section}>
        <div className="disclaimer">
          {LEGAL_DISCLAIMER}
        </div>
      </section>

      {/* CTA */}
      <div className={styles.cta}>
        <Link href="/measure" className="btn btn-primary btn-full btn-lg">
          <Camera size={20} className="mr-2" /> 측정 시작하기
        </Link>
      </div>
    </div>
  );
}
