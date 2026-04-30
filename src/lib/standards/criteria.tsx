import React from 'react';
import { Monitor, Sparkles, Lamp, AppWindow, Moon, ParkingCircle, Construction, Lightbulb, FileText, Search, RefreshCw, BookOpen, BarChart2 } from 'lucide-react';

/* 빛공해 방지법 기반 허용기준 데이터 */

export interface ZoneStandard {
  id: string;
  name: string;
  description: string;
  maxIlluminance: number; // lx (주거지 연직면 최대값)
  examples: string[];
}

export interface LightType {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export interface PurposeTag {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const ZONE_STANDARDS: ZoneStandard[] = [
  {
    id: 'zone1',
    name: '제1종',
    description: '자연환경 보전지역, 녹지지역',
    maxIlluminance: 10,
    examples: ['국립공원', '생태보전지역', '자연녹지'],
  },
  {
    id: 'zone2',
    name: '제2종',
    description: '농림지역, 자연환경 보호 필요 지역',
    maxIlluminance: 10,
    examples: ['농촌', '산림', '어촌'],
  },
  {
    id: 'zone3',
    name: '제3종',
    description: '주거지역',
    maxIlluminance: 25,
    examples: ['아파트 단지', '주택가', '학교 주변'],
  },
  {
    id: 'zone4',
    name: '제4종',
    description: '상업·공업지역',
    maxIlluminance: 25,
    examples: ['상업지구', '공업단지', '역세권'],
  },
];

export const LIGHT_TYPES: LightType[] = [
  { id: 'ad_sign', label: '광고조명', icon: <Monitor size={18} />, description: '간판, 전광판, 네온사인' },
  { id: 'decorative', label: '장식조명', icon: <Sparkles size={18} />, description: '건물 외벽 장식, 경관조명' },
  { id: 'street_light', label: '가로등', icon: <Lamp size={18} />, description: '도로 가로등, 보안등' },
  { id: 'indoor_leak', label: '실내누출광', icon: <AppWindow size={18} />, description: '상가/사무실 내부 빛 누출' },
  { id: 'window_intrusion', label: '창문침투광', icon: <Moon size={18} />, description: '외부 빛이 실내로 침투' },
  { id: 'parking', label: '주차장 조명', icon: <ParkingCircle size={18} />, description: '주차장, 야간 시설 조명' },
  { id: 'construction', label: '공사장 조명', icon: <Construction size={18} />, description: '야간 공사 현장' },
  { id: 'other', label: '기타', icon: <Lightbulb size={18} />, description: '기타 빛공해 원인' },
];

export const PURPOSE_TAGS: PurposeTag[] = [
  { id: 'complaint', label: '민원 기록', icon: <FileText size={18} /> },
  { id: 'inspection', label: '자체 점검', icon: <Search size={18} /> },
  { id: 'before_after', label: '전/후 비교', icon: <RefreshCw size={18} /> },
  { id: 'education', label: '교육/학습', icon: <BookOpen size={18} /> },
  { id: 'monitoring', label: '정기 모니터링', icon: <BarChart2 size={18} /> },
];

export const LEGAL_DISCLAIMER = `본 서비스는 전문 측정장비(휘도계, 조도계)를 대체하는 법정 확정 계측기가 아닙니다. 현장 기록, 자가 점검, 비교, 민원 보조, 교육 보조 목적으로만 사용해 주세요. 법적 판단이나 행정 확정은 별도의 공인 측정기관을 통한 공식 절차가 필요합니다.`;
