import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, TextInput, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, SlidersHorizontal, ChevronRight, MessageSquareCode } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useCafeState } from '@/hooks/use-cafe-state';
import { Cafe } from '@/libs/mockData';
import { Spacing, BottomTabInset, MaxContentWidth } from '@/constants/theme';

export default function ExploreScreen() {
  const theme = useTheme();
  const { cafes } = useCafeState();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterOutlet, setFilterOutlet] = useState<'전체' | '풍부'>('전체');
  const [filterNoise, setFilterNoise] = useState<'전체' | '조용함'>('전체');

  // 카페 필터링 로직
  const filteredCafes = useMemo(() => {
    return cafes.filter(cafe => {
      const matchesSearch = cafe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            cafe.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            cafe.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesOutlet = filterOutlet === '전체' || cafe.outletDensity === '풍부';
      const matchesNoise = filterNoise === '전체' || cafe.noiseLevel === '조용함';

      return matchesSearch && matchesOutlet && matchesNoise;
    });
  }, [cafes, searchQuery, filterOutlet, filterNoise]);

  // 실시간 좌석 상태 라벨 헬퍼
  const getStatusBadge = (status: Cafe['seatStatus']) => {
    switch (status) {
      case 'EMPTY':
        return { label: '여유 있음', bg: theme.statusEmptyBg, text: theme.statusEmptyText };
      case 'NORMAL':
        return { label: '보통', bg: theme.statusNormalBg, text: theme.statusNormalText };
      case 'FULL':
        return { label: '만석', bg: theme.statusFullBg, text: theme.statusFullText };
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* 상단 검색 헤더 */}
        <View style={styles.header}>
          <ThemedText type="subtitle" style={{ color: theme.primary, marginBottom: Spacing.one }}>
            카페 검색
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.two }}>
            학습 효율과 좌석 현황을 기반으로 카공 장소를 탐색해보세요.
          </ThemedText>

          {/* 검색 입력 */}
          <View style={[styles.searchBar, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
            <Search size={18} color={theme.textSecondary} />
            <TextInput
              placeholder="카페 이름, 해시태그(#북카페) 검색"
              placeholderTextColor={theme.textSecondary}
              style={[styles.searchInput, { color: theme.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* 필터 퀵 패널 */}
        <View style={styles.filterBar}>
          <View style={styles.filterGroup}>
            <SlidersHorizontal size={14} color={theme.textSecondary} style={{ marginRight: 6 }} />
            
            {/* 콘센트 필터 버튼 */}
            <TouchableOpacity 
              onPress={() => setFilterOutlet(prev => prev === '전체' ? '풍부' : '전체')}
              style={[
                styles.filterPill, 
                { backgroundColor: filterOutlet === '풍부' ? theme.primary : theme.backgroundElement },
                filterOutlet === '풍부' && { borderColor: theme.primary }
              ]}
            >
              <ThemedText type="small" style={{ color: filterOutlet === '풍부' ? theme.background : theme.text, fontSize: 12 }}>
                🔌 콘센트 풍부
              </ThemedText>
            </TouchableOpacity>

            {/* 소음도 필터 버튼 */}
            <TouchableOpacity 
              onPress={() => setFilterNoise(prev => prev === '전체' ? '조용함' : '전체')}
              style={[
                styles.filterPill, 
                { backgroundColor: filterNoise === '조용함' ? theme.primary : theme.backgroundElement },
                filterNoise === '조용함' && { borderColor: theme.primary }
              ]}
            >
              <ThemedText type="small" style={{ color: filterNoise === '조용함' ? theme.background : theme.text, fontSize: 12 }}>
                🔇 조용한 곳
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 12 }}>
            검색 결과 {filteredCafes.length}건
          </ThemedText>
        </View>

        {/* 카페 리스트 스크롤 뷰 */}
        <ScrollView 
          style={styles.scrollList} 
          contentContainerStyle={styles.scrollListContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredCafes.map((cafe) => {
            const badge = getStatusBadge(cafe.seatStatus);
            return (
              <ThemedView key={cafe.id} type="backgroundElement" style={[styles.cafeCard, styles.shadow]}>
                <Image source={{ uri: cafe.image }} style={styles.cafeImage} />
                
                <View style={styles.cardInfo}>
                  <View style={styles.cardHeader}>
                    <ThemedText type="smallBold" style={[styles.cafeName, { color: theme.text }]} numberOfLines={1}>
                      {cafe.name}
                    </ThemedText>
                    
                    {/* 상태 배지 */}
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <ThemedText type="smallBold" style={{ color: badge.text, fontSize: 11 }}>
                        {badge.label}
                      </ThemedText>
                    </View>
                  </View>

                  <ThemedText type="small" style={[styles.cafeAddress, { color: theme.textSecondary }]} numberOfLines={1}>
                    {cafe.address}
                  </ThemedText>

                  {/* 세부 카공 메타 태그 */}
                  <View style={styles.metaRow}>
                    <ThemedText type="small" style={[styles.metaText, { color: theme.textSecondary }]}>
                      🔌 콘센트 <ThemedText type="smallBold" style={{ color: theme.text }}>{cafe.outletDensity}</ThemedText>
                    </ThemedText>
                    <ThemedText type="small" style={[styles.metaText, { color: theme.textSecondary }]}>
                      🔇 소음 <ThemedText type="smallBold" style={{ color: theme.text }}>{cafe.noiseLevel}</ThemedText>
                    </ThemedText>
                    <ThemedText type="small" style={[styles.metaText, { color: theme.textSecondary }]}>
                      ⚡ 와이파이 <ThemedText type="smallBold" style={{ color: theme.text }}>{cafe.wifiSpeed}</ThemedText>
                    </ThemedText>
                  </View>

                  {/* 해시태그 */}
                  <View style={styles.tagRow}>
                    {cafe.tags.map((tag, idx) => (
                      <ThemedText key={idx} type="small" style={[styles.tagText, { color: theme.primary }]}>
                        #{tag}
                      </ThemedText>
                    ))}
                  </View>

                  {/* 업데이트 내역 및 보상 안내 */}
                  <View style={styles.footerRow}>
                    <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 11 }}>
                      {cafe.lastUpdatedAt} ({cafe.updatedByType === 'OWNER' ? '점주 인증' : '유저 제보'})
                    </ThemedText>
                    <View style={[styles.rewardBadge, { backgroundColor: theme.backgroundSelected }]}>
                      <ThemedText type="smallBold" style={{ color: theme.primary, fontSize: 11 }}>
                        영수증 제보시 +{cafe.pointsReward}p
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </ThemedView>
            );
          })}

          {filteredCafes.length === 0 && (
            <View style={styles.emptyContainer}>
              <ThemedText type="smallBold" style={{ color: theme.textSecondary, marginTop: Spacing.four }}>
                검색 조건에 맞는 카페가 없습니다.
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 4 }}>
                다른 검색어를 입력하거나 필터를 해제해보세요.
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingBottom: BottomTabInset,
  },
  header: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.OS === 'ios' ? Spacing.two : 4,
    borderRadius: 20,
    borderWidth: 1,
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EFEA',
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  filterPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE5D8',
  },
  scrollList: {
    flex: 1,
  },
  scrollListContent: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  cafeCard: {
    borderRadius: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#EAE5D8',
  },
  cafeImage: {
    width: 100,
    height: '100%',
    minHeight: 140,
  },
  cardInfo: {
    flex: 1,
    padding: Spacing.two,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  cafeName: {
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  cafeAddress: {
    fontSize: 12,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: Spacing.two,
    rowGap: 2,
    marginTop: 6,
  },
  metaText: {
    fontSize: 11,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F7F6F2',
  },
  rewardBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
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
        elevation: 2,
      },
      web: {
        boxShadow: '0 4px 20px rgba(28, 42, 30, 0.06)',
      }
    }),
  },
});
