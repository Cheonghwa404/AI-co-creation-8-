import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, TextInput, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, Compass, RotateCcw, Filter, AlertTriangle, ShieldCheck } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useCafeState } from '@/hooks/use-cafe-state';
import { Cafe } from '@/libs/mockData';
import { Spacing, BottomTabInset } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const theme = useTheme();
  const { cafes, user } = useCafeState();

  // 검색어 및 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOutlet, setSelectedOutlet] = useState<boolean>(false);
  const [selectedNoise, setSelectedNoise] = useState<boolean>(false);
  const [selectedWifi, setSelectedWifi] = useState<boolean>(false);
  
  // 선택된 카페 (하단 시트용)
  const [selectedCafeId, setSelectedCafeId] = useState<string | null>('cafe-1');

  // 필터링 적용된 카페 목록
  const filteredCafes = useMemo(() => {
    return cafes.filter(cafe => {
      // 검색어 매칭
      const matchesSearch = cafe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            cafe.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 필터 매칭
      const matchesOutlet = !selectedOutlet || cafe.outletDensity === '풍부';
      const matchesNoise = !selectedNoise || cafe.noiseLevel === '조용함';
      const matchesWifi = !selectedWifi || cafe.wifiSpeed === '빠름';

      return matchesSearch && matchesOutlet && matchesNoise && matchesWifi;
    });
  }, [cafes, searchQuery, selectedOutlet, selectedNoise, selectedWifi]);

  // 선택된 카페 객체
  const selectedCafe = useMemo(() => {
    return cafes.find(c => c.id === selectedCafeId) || null;
  }, [cafes, selectedCafeId]);

  // 실시간 좌석 상태 라벨 헬퍼
  const getStatusBadge = (status: Cafe['seatStatus']) => {
    switch (status) {
      case 'EMPTY':
        return { label: '여유', bg: theme.statusEmptyBg, text: theme.statusEmptyText };
      case 'NORMAL':
        return { label: '보통', bg: theme.statusNormalBg, text: theme.statusNormalText };
      case 'FULL':
        return { label: '만석', bg: theme.statusFullBg, text: theme.statusFullText };
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* 상단 헤더 영역 */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <ThemedText type="subtitle" style={[styles.appName, { color: theme.primary }]}>
              Cafe-Lit ☕
            </ThemedText>
            <View style={styles.locationSelector}>
              <MapPin size={14} color={theme.primary} />
              <ThemedText type="smallBold" style={{ color: theme.primary, marginLeft: 4 }}>
                신촌/연세대 인근
              </ThemedText>
            </View>
          </View>
          
          {/* 검색 바 */}
          <View style={[styles.searchBar, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
            <Search size={18} color={theme.textSecondary} />
            <TextInput
              placeholder="카페 명, 주소 또는 키워드 검색"
              placeholderTextColor={theme.textSecondary}
              style={[styles.searchInput, { color: theme.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>취소</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* 카공 환경 필터 칩 */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
            <TouchableOpacity 
              onPress={() => setSelectedOutlet(!selectedOutlet)}
              style={[
                styles.filterChip, 
                { backgroundColor: selectedOutlet ? theme.primary : theme.backgroundElement },
                selectedOutlet && { borderColor: theme.primary }
              ]}
            >
              <ThemedText type="smallBold" style={{ color: selectedOutlet ? theme.background : theme.text }}>
                🔌 콘센트 풍부
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setSelectedNoise(!selectedNoise)}
              style={[
                styles.filterChip, 
                { backgroundColor: selectedNoise ? theme.primary : theme.backgroundElement },
                selectedNoise && { borderColor: theme.primary }
              ]}
            >
              <ThemedText type="smallBold" style={{ color: selectedNoise ? theme.background : theme.text }}>
                🔇 조용한 공간
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setSelectedWifi(!selectedWifi)}
              style={[
                styles.filterChip, 
                { backgroundColor: selectedWifi ? theme.primary : theme.backgroundElement },
                selectedWifi && { borderColor: theme.primary }
              ]}
            >
              <ThemedText type="smallBold" style={{ color: selectedWifi ? theme.background : theme.text }}>
                ⚡ 빠른 와이파이
              </ThemedText>
            </TouchableOpacity>

            {(selectedOutlet || selectedNoise || selectedWifi) && (
              <TouchableOpacity 
                onPress={() => {
                  setSelectedOutlet(false);
                  setSelectedNoise(false);
                  setSelectedWifi(false);
                }}
                style={styles.resetFilterChip}
              >
                <RotateCcw size={14} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* 대화형 지도 뷰포트 (Nordic Aesthetic Minimal Map) */}
        <View style={[styles.mapViewport, { backgroundColor: '#F0EEE7' }]}>
          {/* 캠퍼스 장식 그래픽 */}
          <View style={styles.gridMapBg}>
            <View style={[styles.mapRoad, { top: '40%', height: 40, width: '100%', transform: [{ rotate: '-5deg' }] }]} />
            <View style={[styles.mapRoad, { left: '45%', width: 35, height: '100%', transform: [{ rotate: '15deg' }] }]} />
            <View style={[styles.mapPark, { top: '10%', left: '10%', width: 100, height: 80, borderRadius: 30 }]} />
            <View style={[styles.mapPark, { bottom: '15%', right: '8%', width: 120, height: 100, borderRadius: 40 }]} />
            <ThemedText type="smallBold" style={styles.mapGeoLabel}>YONSEI UNIV.</ThemedText>
            <ThemedText type="smallBold" style={styles.mapGeoLabelSinchon}>SINCHON STN.</ThemedText>
          </View>

          {/* 실시간 카페 핀(Pins) 렌더링 */}
          {filteredCafes.map((cafe) => {
            // 좌표를 2D 맵 상의 % 위치로 매칭하여 아늑한 시각화
            // 신촌 좌표 기준 오프셋 맵핑
            const leftPct = `${((cafe.longitude - 126.920) / 0.025) * 100}%`;
            const topPct = `${(1.0 - (cafe.latitude - 37.548) / 0.016) * 100}%`;

            const isSelected = cafe.id === selectedCafeId;
            const badge = getStatusBadge(cafe.seatStatus);

            return (
              <TouchableOpacity
                key={cafe.id}
                onPress={() => setSelectedCafeId(cafe.id)}
                style={[
                  styles.mapPinContainer,
                  { left: leftPct as any, top: topPct as any }
                ]}
              >
                <View style={[
                  styles.mapPinBubble,
                  { backgroundColor: isSelected ? theme.primary : theme.backgroundElement },
                  styles.shadow
                ]}>
                  {/* 신호등 상태 링 */}
                  <View style={[styles.statusIndicator, { backgroundColor: badge.bg, borderColor: badge.text }]} />
                  <ThemedText 
                    type="smallBold" 
                    style={[styles.pinText, { color: isSelected ? theme.background : theme.text }]}
                    numberOfLines={1}
                  >
                    {cafe.name.split(' ')[1] || cafe.name}
                  </ThemedText>
                </View>
                <View style={[styles.pinTriangle, { borderTopColor: isSelected ? theme.primary : theme.backgroundElement }]} />
              </TouchableOpacity>
            );
          })}

          {filteredCafes.length === 0 && (
            <View style={[styles.emptyAlert, { backgroundColor: theme.backgroundElement }, styles.shadow]}>
              <AlertTriangle size={18} color={theme.statusFullText} />
              <ThemedText type="smallBold" style={{ marginLeft: 6 }}>조건에 맞는 카페가 없습니다.</ThemedText>
            </View>
          )}
        </View>

        {/* 하단 선택 카페 정보 패널 슬라이드 */}
        {selectedCafe && (
          <View style={[styles.detailsPanel, { backgroundColor: theme.backgroundElement }, styles.shadow]}>
            <View style={styles.panelHeader}>
              <View style={styles.panelTitleRow}>
                <ThemedText type="subtitle" style={styles.panelTitle} numberOfLines={1}>
                  {selectedCafe.name}
                </ThemedText>
                
                {/* 실시간 좌석 상태 배지 */}
                {(() => {
                  const badge = getStatusBadge(selectedCafe.seatStatus);
                  return (
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <View style={[styles.statusDot, { backgroundColor: badge.text }]} />
                      <ThemedText type="smallBold" style={{ color: badge.text, fontSize: 12 }}>
                        좌석 {badge.label}
                      </ThemedText>
                    </View>
                  );
                })()}
              </View>
              
              <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: 8 }} numberOfLines={1}>
                📍 {selectedCafe.address}
              </ThemedText>

              {/* 제보 정보 출처 */}
              <View style={styles.updatedRow}>
                {selectedCafe.updatedByType === 'OWNER' ? (
                  <View style={styles.ownerBadge}>
                    <ShieldCheck size={12} color={theme.primary} />
                    <ThemedText type="smallBold" style={[styles.ownerBadgeText, { color: theme.primary }]}>
                      점주 공식 인증
                    </ThemedText>
                  </View>
                ) : (
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    👥 유저 영수증 제보
                  </ThemedText>
                )}
                <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 8 }}>
                  ({selectedCafe.lastUpdatedAt} 업데이트됨)
                </ThemedText>
              </View>
            </View>

            {/* 카페 디테일 메타 정보 */}
            <View style={styles.metaGrid}>
              <View style={[styles.metaItem, { backgroundColor: theme.background }]}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>🔌 콘센트</ThemedText>
                <ThemedText type="smallBold" style={{ color: theme.text, marginTop: 2 }}>{selectedCafe.outletDensity}</ThemedText>
              </View>
              <View style={[styles.metaItem, { backgroundColor: theme.background }]}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>🔇 소음도</ThemedText>
                <ThemedText type="smallBold" style={{ color: theme.text, marginTop: 2 }}>{selectedCafe.noiseLevel}</ThemedText>
              </View>
              <View style={[styles.metaItem, { backgroundColor: theme.background }]}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>⚡ 와이파이</ThemedText>
                <ThemedText type="smallBold" style={{ color: theme.text, marginTop: 2 }}>{selectedCafe.wifiSpeed}</ThemedText>
              </View>
            </View>

            {/* 태그 리스트 */}
            <View style={styles.tagContainer}>
              {selectedCafe.tags.map((tag, i) => (
                <View key={i} style={[styles.tagBadge, { backgroundColor: theme.backgroundSelected }]}>
                  <ThemedText type="small" style={{ color: theme.primary, fontSize: 11 }}>#{tag}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingBottom: BottomTabInset,
  },
  header: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    gap: Spacing.two,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE5D8',
    backgroundColor: '#FFFDF9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.OS === 'ios' ? Spacing.two : 4,
    borderRadius: 20,
    borderWidth: 1,
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
  },
  filterScroll: {
    marginTop: 2,
  },
  filterContent: {
    gap: Spacing.two,
    alignItems: 'center',
    paddingRight: Spacing.five,
  },
  filterChip: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAE5D8',
  },
  resetFilterChip: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: '#EAE5D8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapViewport: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  gridMapBg: {
    ...StyleSheet.absoluteFill,
  },
  mapRoad: {
    position: 'absolute',
    backgroundColor: '#E5E2D9',
  },
  mapPark: {
    position: 'absolute',
    backgroundColor: '#DFE5DB',
  },
  mapGeoLabel: {
    position: 'absolute',
    top: '15%',
    left: '12%',
    color: '#B0ADA0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  mapGeoLabelSinchon: {
    position: 'absolute',
    bottom: '20%',
    left: '48%',
    color: '#B0ADA0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  mapPinContainer: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -40 }, { translateY: -35 }],
  },
  mapPinBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 16,
    gap: 6,
    maxWidth: 120,
  },
  pinText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pinTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  emptyAlert: {
    position: 'absolute',
    top: '40%',
    left: '15%',
    right: '15%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
    borderRadius: 16,
  },
  detailsPanel: {
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
    borderRadius: 24,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: '#EAE5D8',
  },
  panelHeader: {
    marginBottom: Spacing.two,
  },
  panelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  updatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E2F4E7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  ownerBadgeText: {
    fontSize: 10,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  metaItem: {
    flex: 1,
    padding: Spacing.two,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0EFEA',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#1C2A1E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 4px 20px rgba(28, 42, 30, 0.06)',
      }
    }),
  },
});
