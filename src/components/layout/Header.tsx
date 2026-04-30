'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Lightbulb, ArrowLeft } from 'lucide-react';
import styles from './Header.module.css';

const TITLES: Record<string, string> = {
  '/': 'LPtion',
  '/measure': '측정하기',
  '/measure/guide': '촬영 가이드',
  '/measure/result': '분석 결과',
  '/records': '측정 기록',
  '/compare': '비교 분석',
  '/report': '리포트',
  '/guide': '빛공해 가이드',
  '/guide/standards': '허용 기준',
};

export function Header() {
  const pathname = usePathname();
  
  const getTitle = () => {
    if (TITLES[pathname]) return TITLES[pathname];
    for (const [path, title] of Object.entries(TITLES)) {
      if (pathname.startsWith(path) && path !== '/') return title;
    }
    return 'LPtion';
  };

  const isHome = pathname === '/';

  return (
    <header className={styles.header} id="app-header">
      <div className={styles.inner}>
        {!isHome && (
          <Link href="/" className={styles.backBtn} aria-label="홈으로">
            <ArrowLeft size={20} />
          </Link>
        )}
        <h1 className={`${styles.title} ${isHome ? styles.titleHome : ''}`}>
          {isHome ? (
            <>
              <span className={styles.logo}><Lightbulb size={24} /></span>
              <span>LPtion</span>
            </>
          ) : (
            getTitle()
          )}
        </h1>
        {isHome && (
          <span className={styles.tagline}>빛공해 측정 플랫폼</span>
        )}
      </div>
    </header>
  );
}
