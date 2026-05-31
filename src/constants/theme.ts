/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1C2A1E',              // 아늑한 다크 올리브 그린
    background: '#FAF9F6',        // 크림 아이보리 베이스
    backgroundElement: '#FFFDF9', // 소프트 알라바스터 (카드 배경)
    backgroundSelected: '#EAE5D8', // 머드/소프트 우드 베이지 (선택됨)
    textSecondary: '#6B7A6E',     // 정제된 세이지 그린 (부제목)
    primary: '#2A4D34',           // 깊고 차분한 포레스트 그린
    secondary: '#D2B48C',         // 내추럴 우드 베이지
    accent: '#8FBC8F',            // 소프트 민트 그린
    
    // 실시간 좌석 상태 컬러
    statusEmptyBg: '#E2F4E7',
    statusEmptyText: '#1B5E20',
    statusNormalBg: '#FFF9C4',
    statusNormalText: '#D17C00',
    statusFullBg: '#FFEBEE',
    statusFullText: '#C62828',
  },
  dark: {
    // 다크 모드도 아늑한 무드에 맞추어 올리브 차콜 톤으로 커스텀
    text: '#F5F6F5',
    background: '#121813',
    backgroundElement: '#1A231C',
    backgroundSelected: '#2A362C',
    textSecondary: '#8B9B8F',
    primary: '#477A55',
    secondary: '#C2A37E',
    accent: '#6E8B7E',
    
    statusEmptyBg: '#1A3322',
    statusEmptyText: '#81C784',
    statusNormalBg: '#332E1A',
    statusNormalText: '#FFD54F',
    statusFullBg: '#3E1C1C',
    statusFullText: '#E57373',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
