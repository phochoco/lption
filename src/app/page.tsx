import Link from 'next/link';
import { Lightbulb, Camera, ClipboardList, RefreshCw, FileText, Home, Wrench, Landmark } from 'lucide-react';
import styles from './page.module.css';

const faqData = [
  {
    question: '스마트폰 카메라로 전문 측정장비(휘도계)를 완전히 대체할 수 있나요?',
    answer: '아니요, 완벽한 대체는 불가능합니다. 스마트폰 카메라는 렌즈 특성과 자동 노출 기능으로 인해 공인 인증된 전문 휘도계나 조도계만큼의 정밀도를 제공할 수 없습니다. 본 서비스는 정식 민원 제기 전 "자가 점검", "기록 보존", "상대적 비교"를 위한 보조 도구로 활용하는 것을 권장합니다.'
  },
  {
    question: '밤에 옆 건물 간판이 너무 밝아서 잠을 못 자겠어요. 빛공해 기준이 뭔가요?',
    answer: '「인공조명에 의한 빛공해 방지법」에 따라, 주거지역(제3종)의 경우 야간 광고조명(간판)의 발광표면 휘도는 400 cd/m², 창문으로 침투하는 연직면 조도는 25 lx(럭스) 이하로 유지되어야 합니다. 앱을 통해 1차적으로 촬영하고 기준 초과가 의심되면 지자체 환경과에 정식 측정을 요청할 수 있습니다.'
  },
  {
    question: '빛공해 측정을 위해 야간 모드나 플래시를 사용해도 되나요?',
    answer: '절대 안 됩니다. 플래시를 터트리거나, 스마트폰의 "야간 모드(Night Mode)", "HDR" 기능이 켜져 있으면 인공지능이 밝기를 강제로 왜곡하여 측정 결과가 완전히 틀려지게 됩니다. 반드시 기본 사진 모드로 야간 모드를 끄고 촬영해 주세요.'
  },
  {
    question: '측정된 결과 리포트를 가지고 바로 구청에 민원을 넣을 수 있나요?',
    answer: '직접적인 법적 효력은 없지만, 강력한 "민원 근거 자료"로 활용할 수 있습니다. 구청 담당자에게 단순히 "눈이 부셔요"라고 말하는 것보다, 이 앱으로 생성된 히트맵과 픽셀 과노출 수치 리포트를 함께 첨부하면 민원 처리의 우선순위가 높아질 수 있습니다.'
  }
];

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <div className={styles.home}>
      {/* SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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

      {/* FAQ / SEO Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>자주 묻는 질문 (FAQ)</h2>
        <div className={styles.faqList}>
          {faqData.map((faq, i) => (
            <details key={i} className={styles.faqItem}>
              <summary className={styles.faqQuestion}>{faq.question}</summary>
              <div className={styles.faqAnswer}>{faq.answer}</div>
            </details>
          ))}
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
