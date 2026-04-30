import Link from 'next/link';
import { Lightbulb, Camera, ClipboardList, RefreshCw, FileText, Home, Wrench, Landmark } from 'lucide-react';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroIcon}><Lightbulb size={48} /></div>
        <h1 className={styles.heroTitle}>
          빛공해,<br />
          <span className={styles.heroAccent}>스마트폰으로 측정하세요</span>
        </h1>
        <p className={styles.heroDesc}>
          촬영 한 장으로 밝기 분석, 히트맵 시각화,<br />
          비교 리포트까지. 누구나 쉽게.
        </p>
        <Link href="/measure" className={`btn btn-primary btn-lg ${styles.heroCta}`} id="cta-measure">
          <Camera size={20} className="mr-2" /> 측정 시작하기
        </Link>
      </section>

      {/* Quick Actions */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>빠른 시작</h2>
        <div className={styles.quickGrid}>
          <Link href="/measure" className={`card card-interactive ${styles.quickCard}`} id="quick-measure">
            <span className={styles.quickIcon}><Camera size={24} /></span>
            <span className={styles.quickLabel}>측정하기</span>
            <span className={styles.quickDesc}>촬영 & 분석</span>
          </Link>
          <Link href="/records" className={`card card-interactive ${styles.quickCard}`} id="quick-records">
            <span className={styles.quickIcon}><ClipboardList size={24} /></span>
            <span className={styles.quickLabel}>기록 보기</span>
            <span className={styles.quickDesc}>측정 이력</span>
          </Link>
          <Link href="/compare" className={`card card-interactive ${styles.quickCard}`} id="quick-compare">
            <span className={styles.quickIcon}><RefreshCw size={24} /></span>
            <span className={styles.quickLabel}>비교하기</span>
            <span className={styles.quickDesc}>전/후 비교</span>
          </Link>
          <Link href="/report" className={`card card-interactive ${styles.quickCard}`} id="quick-report">
            <span className={styles.quickIcon}><FileText size={24} /></span>
            <span className={styles.quickLabel}>리포트</span>
            <span className={styles.quickDesc}>PDF 생성</span>
          </Link>
        </div>
      </section>

      {/* Use Cases */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>이런 분들을 위한 서비스입니다</h2>
        <div className={styles.useCases}>
          <div className={`card ${styles.useCaseCard}`}>
            <div className={styles.useCaseIcon}><Home size={32} /></div>
            <h3 className={styles.useCaseTitle}>일반 시민</h3>
            <p className={styles.useCaseDesc}>
              &ldquo;밤마다 창문으로 들어오는 간판 빛&rdquo;<br />
              민원 근거를 직접 기록하세요
            </p>
          </div>
          <div className={`card ${styles.useCaseCard}`}>
            <div className={styles.useCaseIcon}><Wrench size={32} /></div>
            <h3 className={styles.useCaseTitle}>조명 업계</h3>
            <p className={styles.useCaseDesc}>
              설치 전/후 자체 점검.<br />
              고가 장비 없이 1차 셀프 체크
            </p>
          </div>
          <div className={`card ${styles.useCaseCard}`}>
            <div className={styles.useCaseIcon}><Landmark size={32} /></div>
            <h3 className={styles.useCaseTitle}>지자체 담당자</h3>
            <p className={styles.useCaseDesc}>
              현장 사진과 기초 수치를<br />
              함께 구조화해 검토
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>사용 방법</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNum}>1</div>
            <div className={styles.stepContent}>
              <h3>촬영 가이드 확인</h3>
              <p>최적의 측정을 위한 촬영 조건을 안내합니다</p>
            </div>
          </div>
          <div className={styles.stepLine} />
          <div className={styles.step}>
            <div className={styles.stepNum}>2</div>
            <div className={styles.stepContent}>
              <h3>현장 촬영</h3>
              <p>스마트폰 카메라로 빛공해 현장을 촬영합니다</p>
            </div>
          </div>
          <div className={styles.stepLine} />
          <div className={styles.step}>
            <div className={styles.stepNum}>3</div>
            <div className={styles.stepContent}>
              <h3>자동 분석</h3>
              <p>밝기 분포, 히트맵, 품질 판정을 즉시 제공합니다</p>
            </div>
          </div>
          <div className={styles.stepLine} />
          <div className={styles.step}>
            <div className={styles.stepNum}>4</div>
            <div className={styles.stepContent}>
              <h3>기록 & 리포트</h3>
              <p>결과를 저장하고 비교·리포트를 생성합니다</p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className={styles.section}>
        <div className="disclaimer">
          본 서비스는 전문 측정장비를 대체하는 법정 확정 계측기가 아닙니다. 
          현장 기록, 자가 점검, 비교, 민원 보조, 교육 보조 목적으로만 사용해 주세요.
        </div>
      </section>
    </div>
  );
}
