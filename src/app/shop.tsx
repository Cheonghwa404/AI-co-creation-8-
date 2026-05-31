import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Alert, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Coins, Gift, ShoppingBag, ArrowRight } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useCafeState } from '@/hooks/use-cafe-state';
import { MOCK_GIFTICONS, Gifticon } from '@/libs/mockData';
import { Spacing, BottomTabInset, MaxContentWidth } from '@/constants/theme';

export default function ShopScreen() {
  const theme = useTheme();
  const { user, buyGifticon } = useCafeState();

  // 기프티콘 교환 구매 처리 핸들러
  const handleExchange = (gifticon: Gifticon) => {
    Alert.alert(
      '기프티콘 교환',
      `[${gifticon.brand}] ${gifticon.name} 상품을 ${gifticon.price.toLocaleString()}p로 교환하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '교환하기', 
          onPress: () => {
            const result = buyGifticon(gifticon);
            if (result.success) {
              Alert.alert('교환 성공', result.message);
            } else {
              Alert.alert('교환 실패', result.message);
            }
          } 
        }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* 상단 웰컴 배너 */}
          <View style={styles.header}>
            <ThemedText type="subtitle" style={{ color: theme.primary, marginBottom: Spacing.one }}>
              기프티콘 상점
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              카페 좌석 현황 제보를 통해 모은 포인트로 유용한 모바일 상품권을 교환해 보세요!
            </ThemedText>
          </View>

          {/* 유저 보유 포인트 대시보드 카드 */}
          <ThemedView type="backgroundElement" style={[styles.pointsCard, styles.shadow, { borderColor: theme.primary }]}>
            <View style={styles.cardHeader}>
              <View style={styles.brandBadge}>
                <Coins size={14} color={theme.background} />
                <ThemedText type="smallBold" style={{ color: theme.background, fontSize: 11, marginLeft: 4 }}>
                  CAFE-LIT CREDIT
                </ThemedText>
              </View>
              <ShoppingBag size={18} color={theme.primary} />
            </View>

            <View style={styles.pointsDisplay}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>보유 포인트</ThemedText>
              <ThemedText type="subtitle" style={[styles.pointsNumber, { color: theme.primary }]}>
                {user.points.toLocaleString()} <ThemedText style={{ fontSize: 20, color: theme.primary }}>p</ThemedText>
              </ThemedText>
            </View>

            <View style={[styles.pointsFooter, { backgroundColor: theme.background }]}>
              <Gift size={14} color={theme.secondary} />
              <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 6, flex: 1 }}>
                영수증 제보 {user.reportedCount}회 참여함
              </ThemedText>
              <View style={styles.arrowIcon}>
                <ArrowRight size={14} color={theme.primary} />
              </View>
            </View>
          </ThemedView>

          {/* 기프티콘 상품 리스트 */}
          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold" style={{ color: theme.text }}>교환 가능한 상품</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 12 }}>인기 순</ThemedText>
          </View>

          <View style={styles.productGrid}>
            {MOCK_GIFTICONS.map((gifticon) => (
              <ThemedView key={gifticon.id} type="backgroundElement" style={[styles.productCard, styles.shadow]}>
                <Image source={{ uri: gifticon.image }} style={styles.productImage} />
                
                <View style={styles.productInfo}>
                  <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 11 }}>
                    {gifticon.brand}
                  </ThemedText>
                  <ThemedText type="smallBold" style={[styles.productName, { color: theme.text }]} numberOfLines={1}>
                    {gifticon.name}
                  </ThemedText>
                  
                  <View style={styles.productPriceRow}>
                    <ThemedText type="smallBold" style={{ color: theme.primary }}>
                      {gifticon.price.toLocaleString()} p
                    </ThemedText>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleExchange(gifticon)}
                    style={[styles.exchangeButton, { backgroundColor: theme.primary }]}
                  >
                    <ThemedText type="smallBold" style={{ color: theme.background, fontSize: 12 }}>
                      교환하기
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </ThemedView>
            ))}
          </View>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  header: {
    paddingVertical: Spacing.one,
  },
  pointsCard: {
    borderRadius: 24,
    padding: Spacing.three,
    borderWidth: 1.5,
    gap: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A4D34', // Forest Green
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  pointsDisplay: {
    paddingVertical: Spacing.one,
  },
  pointsNumber: {
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  pointsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.two,
    borderRadius: 12,
  },
  arrowIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFDF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  productCard: {
    width: (Dimensions.get('window').width - Spacing.three * 3) / 2 - 2, // 2열 그리드 자동 계산
    maxWidth: 240,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EAE5D8',
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  productInfo: {
    padding: Spacing.two,
    gap: 4,
  },
  productName: {
    fontSize: 13,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  exchangeButton: {
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
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
