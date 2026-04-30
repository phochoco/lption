'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Camera, ClipboardList, RefreshCw, FileText, Lightbulb } from 'lucide-react';
import styles from './BottomNav.module.css';

const NAV_ITEMS = [
  { href: '/measure', icon: <Camera size={20} />, label: '측정하기' },
  { href: '/records', icon: <ClipboardList size={20} />, label: '기록' },
  { href: '/compare', icon: <RefreshCw size={20} />, label: '비교' },
  { href: '/report', icon: <FileText size={20} />, label: '리포트' },
  { href: '/guide', icon: <Lightbulb size={20} />, label: '가이드' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} id="bottom-nav">
      <div className={styles.inner}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.item} ${isActive ? styles.active : ''}`}
              id={`nav-${item.href.slice(1)}`}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
              {isActive && <span className={styles.indicator} />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
