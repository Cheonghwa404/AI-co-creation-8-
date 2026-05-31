import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, ShieldAlert, Award, FileText, CheckCircle, BarChart3, HelpCircle, LogOut } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useCafeState } from '@/hooks/use-cafe-state';
import { Spacing, BottomTabInset, MaxContentWidth } from '@/constants/theme';

export default function ProfileScreen() {
  const theme = useTheme();
  const { 
    cafes, 
    user, 
    updateSeatStatus, 
    applyForOwner, 
    approveOwnerRequest, 
    resetUserToRegular 
  } = useCafeState();

  // 점주 신청용 상태
  const [selectedCafeId, setSelectedCafeId] = useState<string>('cafe-1');
  const [licenseImage, setLicenseImage] = useState<string | null>(null);
  const [isSubmittingLicense, setIsSubmittingLicense] = useState<boolean>(false);

  // 사업자등록증 파일 선택 핸들러
  const handlePickLicense = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 오류', '갤러리 접근 권한이 필요합니다.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLicenseImage(result.assets[0].uri);
      }
    } catch (e) {
      // 폴백 (웹 및 예외 상황)
      setLicenseImage('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=200&q=80');
    }
  };

  // 점주 신청 양식 제출
  const handleSubmitOwnerApplication = () => {
    if (!licenseImage) {
      Alert.alert('경고', '사업자등록증 사진을 첨부해 주세요.');
      return;
    }

    setIsSubmittingLicense(true);
    setTimeout(() => {
      setIsSubmittingLicense(false);
      applyForOwner(selectedCafeId);
      Alert.alert(
        '신청 완료', 
        '점주 신청 서류가 성공적으로 업로드되었습니다. 관리자 승인(최대 24시간 소요) 완료 후 점주용 대시보드가 활성화됩니다.'
      );
    }, 1500);
  };

  // 점주용 카페 객체 찾기
  const registeredCafe = cafes.find(c => c.id === user.registeredCafeId) || cafes[0];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* 1. 공통 유저 기본 정보 헤더 */}
          <ThemedView type="backgroundElement" style={[styles.profileHeaderCard, styles.shadow]}>
            <View style={styles.profileAvatarRow}>
              <View style={[styles.avatarCircle, { backgroundColor: theme.primary }]}>
                <User size={32} color={theme.background} />
              </View>
              <View style={styles.profileInfoText}>
                <View style={styles.nameRow}>
                  <ThemedText type="subtitle" style={[styles.nickname, { color: theme.text }]}>
                    {user.nickname}
                  </ThemedText>
                  <View style={[styles.roleBadge, { backgroundColor: user.role === 'OWNER' ? theme.primary : theme.backgroundSelected }]}>
                    <ThemedText type="smallBold" style={{ color: user.role === 'OWNER' ? theme.background : theme.text, fontSize: 10 }}>
                      {user.role === 'OWNER' ? '점주 회원' : '일반 회원'}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  실시간 카공족 상생 플랫폼 카페릿과 함께하는 중
                </ThemedText>
              </View>
            </View>

            <View style={styles.statsDivider} />

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>보유 포인트</ThemedText>
                <ThemedText type="smallBold" style={[styles.statValue, { color: theme.primary }]}>
                  {user.points.toLocaleString()} p
                </ThemedText>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.statItem}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>영수증 제보</ThemedText>
                <ThemedText type="smallBold" style={[styles.statValue, { color: theme.text }]}>
                  {user.reportedCount} 회
                </ThemedText>
              </View>
            </View>
          </ThemedView>

          {/* 2. 역할 분기 (점주 대시보드 VS 일반 유저 점주 신청) */}
          {user.role === 'OWNER' ? (
            // ================== [점주용 대시보드 화면] ==================
            <View style={{ gap: Spacing.three }}>
              <ThemedText type="smallBold" style={{ color: theme.text, marginTop: Spacing.one }}>
                점주 매장 관리 대시보드
              </ThemedText>

              {/* 매장 상태 퀵 체인저 패널 (REQ-OW-01) */}
              <ThemedView type="backgroundElement" style={[styles.sectionCard, styles.shadow]}>
                <View style={styles.sectionTitleRow}>
                  <CheckCircle size={18} color={theme.primary} />
                  <ThemedText type="smallBold" style={{ color: theme.text }}>실시간 매장 좌석 상태 변경</ThemedText>
                </View>

                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  관리 매장: <ThemedText type="smallBold" style={{ color: theme.primary }}>{registeredCafe?.name}</ThemedText>
                </ThemedText>

                <View style={styles.ownerStatusGroup}>
                  {/* 여유 */}
                  <TouchableOpacity
                    onPress={() => updateSeatStatus(registeredCafe.id, 'EMPTY', 'OWNER')}
                    style={[
                      styles.ownerStatusBtn,
                      { backgroundColor: registeredCafe?.seatStatus === 'EMPTY' ? theme.statusEmptyBg : theme.background, borderColor: registeredCafe?.seatStatus === 'EMPTY' ? theme.statusEmptyText : '#EAE5D8' }
                    ]}
                  >
                    <View style={[styles.statusDot, { backgroundColor: theme.statusEmptyText }]} />
                    <ThemedText type="smallBold" style={{ color: theme.statusEmptyText }}>여유 있음</ThemedText>
                  </TouchableOpacity>

                  {/* 보통 */}
                  <TouchableOpacity
                    onPress={() => updateSeatStatus(registeredCafe.id, 'NORMAL', 'OWNER')}
                    style={[
                      styles.ownerStatusBtn,
                      { backgroundColor: registeredCafe?.seatStatus === 'NORMAL' ? theme.statusNormalBg : theme.background, borderColor: registeredCafe?.seatStatus === 'NORMAL' ? theme.statusNormalText : '#EAE5D8' }
                    ]}
                  >
                    <View style={[styles.statusDot, { backgroundColor: theme.statusNormalText }]} />
                    <ThemedText type="smallBold" style={{ color: theme.statusNormalText }}>보통</ThemedText>
                  </TouchableOpacity>

                  {/* 만석 */}
                  <TouchableOpacity
                    onPress={() => updateSeatStatus(registeredCafe.id, 'FULL', 'OWNER')}
                    style={[
                      styles.ownerStatusBtn,
                      { backgroundColor: registeredCafe?.seatStatus === 'FULL' ? theme.statusFullBg : theme.background, borderColor: registeredCafe?.seatStatus === 'FULL' ? theme.statusFullText : '#EAE5D8' }
                    ]}
                  >
                    <View style={[styles.statusDot, { backgroundColor: theme.statusFullText }]} />
                    <ThemedText type="smallBold" style={{ color: theme.statusFullText }}>만석</ThemedText>
                  </TouchableOpacity>
                </View>

                <View style={[styles.statusBanner, { backgroundColor: theme.background }]}>
                  <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 11, textAlign: 'center' }}>
                    상태를 변경하면 **실시간 지도 탭 마커 및 유저 화면**에 즉각 반영됩니다.
                  </ThemedText>
                </View>
              </ThemedView>

              {/* 매장 피크타임 분석 통계 그래프 (REQ-OW-02) */}
              <ThemedView type="backgroundElement" style={[styles.sectionCard, styles.shadow]}>
                <View style={styles.sectionTitleRow}>
                  <BarChart3 size={18} color={theme.primary} />
                  <ThemedText type="smallBold" style={{ color: theme.text }}>요일별 피크타임 점유율 분석</ThemedText>
                </View>

                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.two }}>
                  지난 1주간 카공 고객들의 유입 분석 통계 데이터입니다.
                </ThemedText>

                {/* 차트 시각화 */}
                <View style={styles.chartContainer}>
                  {/* 각 바 그래프 */}
                  <View style={styles.chartBarCol}>
                    <View style={[styles.chartBarFill, { height: '35%', backgroundColor: theme.secondary }]} />
                    <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 10, marginTop: 4 }}>월</ThemedText>
                  </View>
                  <View style={styles.chartBarCol}>
                    <View style={[styles.chartBarFill, { height: '50%', backgroundColor: theme.secondary }]} />
                    <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 10, marginTop: 4 }}>화</ThemedText>
                  </View>
                  <View style={styles.chartBarCol}>
                    <View style={[styles.chartBarFill, { height: '40%', backgroundColor: theme.secondary }]} />
                    <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 10, marginTop: 4 }}>수</ThemedText>
                  </View>
                  <View style={styles.chartBarCol}>
                    <View style={[styles.chartBarFill, { height: '65%', backgroundColor: theme.primary }]} />
                    <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 10, marginTop: 4 }}>목</ThemedText>
                  </View>
                  <View style={styles.chartBarCol}>
                    <View style={[styles.chartBarFill, { height: '80%', backgroundColor: theme.primary }]} />
                    <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 10, marginTop: 4 }}>금</ThemedText>
                  </View>
                  <View style={styles.chartBarCol}>
                    <View style={[styles.chartBarFill, { height: '95%', backgroundColor: theme.statusFullText }]} />
                    <ThemedText type="smallBold" style={{ color: theme.primary, fontSize: 10, marginTop: 4 }}>토</ThemedText>
                  </View>
                  <View style={styles.chartBarCol}>
                    <View style={[styles.chartBarFill, { height: '70%', backgroundColor: theme.primary }]} />
                    <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 10, marginTop: 4 }}>일</ThemedText>
                  </View>
                </View>
              </ThemedView>

              {/* 테스트용 일반유저 롤 리셋 단추 */}
              <TouchableOpacity
                onPress={() => {
                  resetUserToRegular();
                  Alert.alert('롤 전환', '일반 회원 모드로 안전하게 전환되었습니다.');
                }}
                style={[styles.resetRoleBtn, { borderColor: theme.statusFullText }]}
              >
                <LogOut size={14} color={theme.statusFullText} style={{ marginRight: 6 }} />
                <ThemedText type="smallBold" style={{ color: theme.statusFullText, fontSize: 12 }}>
                  일반 유저(손님) 모드로 복귀
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            // ================== [일반 유저 점주 신청 화면] ==================
            <View style={{ gap: Spacing.three }}>
              {user.hasPendingApplication ? (
                // 대기 중 상태 표시 카드
                <ThemedView type="backgroundElement" style={[styles.sectionCard, styles.shadow, { borderColor: theme.primary }]}>
                  <View style={styles.pendingHeader}>
                    <ActivityIndicator size="small" color={theme.primary} />
                    <ThemedText type="smallBold" style={{ color: theme.primary, marginLeft: 8 }}>
                      점주 가입 심사 대기 중
                    </ThemedText>
                  </View>

                  <ThemedText type="small" style={{ color: theme.text, marginTop: 4 }}>
                    신청 매장: <ThemedText type="smallBold">{registeredCafe?.name}</ThemedText>
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
                    사업자등록증 매칭 확인 작업이 진행 중입니다. 승인 완료 시 점주 대시보드가 자동으로 활성화됩니다.
                  </ThemedText>

                  {/* 개발자 모의 우회 단추 */}
                  <TouchableOpacity
                    onPress={() => {
                      approveOwnerRequest();
                      Alert.alert('승인 성공', '사업자등록이 모의 승인되었습니다! 점주 대시보드가 오픈됩니다.');
                    }}
                    style={[styles.bypassButton, { backgroundColor: theme.primary }]}
                  >
                    <Award size={14} color={theme.background} style={{ marginRight: 6 }} />
                    <ThemedText type="smallBold" style={{ color: theme.background, fontSize: 12 }}>
                      (테스트 우회) 즉시 수동 승인 처리하기
                    </ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              ) : (
                // 점주 가입 서식 작성 카드 (REQ-OW-01 준비)
                <ThemedView type="backgroundElement" style={[styles.sectionCard, styles.shadow]}>
                  <View style={styles.sectionTitleRow}>
                    <ShieldAlert size={18} color={theme.primary} />
                    <ThemedText type="smallBold" style={{ color: theme.text }}>점주 제휴 매장 등록 신청</ThemedText>
                  </View>

                  <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: 8 }}>
                    매장을 등록하고 실시간 공석 유치 마케팅 혜택을 경험하세요.
                  </ThemedText>

                  {/* 카페 선택 목록 */}
                  <ThemedText type="smallBold" style={{ color: theme.text, fontSize: 13, marginBottom: 4 }}>
                    1. 매장 선택
                  </ThemedText>
                  <View style={styles.ownerDropdownContainer}>
                    {cafes.map(cafe => (
                      <TouchableOpacity
                        key={cafe.id}
                        onPress={() => setSelectedCafeId(cafe.id)}
                        style={[
                          styles.ownerCafeOption,
                          { 
                            backgroundColor: selectedCafeId === cafe.id ? theme.backgroundSelected : theme.background,
                            borderColor: selectedCafeId === cafe.id ? theme.primary : '#EAE5D8'
                          }
                        ]}
                      >
                        <ThemedText type="smallBold" style={{ color: selectedCafeId === cafe.id ? theme.primary : theme.text, fontSize: 13 }}>
                          {cafe.name}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* 사업자등록증 첨부 */}
                  <ThemedText type="smallBold" style={{ color: theme.text, fontSize: 13, marginTop: Spacing.two, marginBottom: 4 }}>
                    2. 사업자등록증 이미지 첨부
                  </ThemedText>

                  {licenseImage ? (
                    <View style={styles.licensePreviewRow}>
                      <FileText size={18} color={theme.primary} />
                      <ThemedText type="small" style={{ color: theme.text, flex: 1, marginLeft: 8 }} numberOfLines={1}>
                        사업자등록증_첨부파일.jpg
                      </ThemedText>
                      <TouchableOpacity onPress={() => setLicenseImage(null)}>
                        <ThemedText type="small" style={{ color: theme.statusFullText }}>삭제</ThemedText>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={handlePickLicense} style={[styles.licensePickerBtn, { backgroundColor: theme.background }]}>
                      <FileText size={20} color={theme.textSecondary} />
                      <ThemedText type="smallBold" style={{ color: theme.textSecondary, marginTop: 6 }}>
                        사업자등록증 파일 업로드
                      </ThemedText>
                    </TouchableOpacity>
                  )}

                  {/* 제출 단추 */}
                  <TouchableOpacity
                    onPress={handleSubmitOwnerApplication}
                    disabled={isSubmittingLicense || !licenseImage}
                    style={[
                      styles.ownerSubmitBtn, 
                      { backgroundColor: !licenseImage ? theme.backgroundSelected : theme.primary },
                      styles.shadow
                    ]}
                  >
                    {isSubmittingLicense ? (
                      <ActivityIndicator size="small" color={theme.background} />
                    ) : (
                      <ThemedText type="smallBold" style={{ color: !licenseImage ? theme.textSecondary : theme.background }}>
                        사업자등록증 제출 및 승인 요청
                      </ThemedText>
                    )}
                  </TouchableOpacity>
                </ThemedView>
              )}
            </View>
          )}

          {/* 3. 도움말 및 안내 섹션 */}
          <ThemedView type="backgroundElement" style={[styles.sectionCard, styles.shadow]}>
            <View style={styles.sectionTitleRow}>
              <HelpCircle size={18} color={theme.primary} />
              <ThemedText type="smallBold" style={{ color: theme.text }}>이용 가이드 & FAQ</ThemedText>
            </View>

            <View style={styles.faqList}>
              <View style={styles.faqItem}>
                <ThemedText type="smallBold" style={{ color: theme.text, fontSize: 13 }}>Q. 영수증 제보가 계속 실패합니다.</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
                  영수증에 촬영된 카페 이름과 현재 제보하는 카페의 공식 가맹 명칭이 일치해야 정확하게 자동 검증 처리가 이루어집니다.
                </ThemedText>
              </View>
              <View style={styles.faqItem}>
                <ThemedText type="smallBold" style={{ color: theme.text, fontSize: 13 }}>Q. 기프티콘은 유효기간이 언제까지인가요?</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
                  카페릿 포인트를 활용해 교환한 상품권의 유효기간은 구매 일자 기준 90일입니다.
                </ThemedText>
              </View>
            </View>
          </ThemedView>

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
  profileHeaderCard: {
    borderRadius: 24,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: '#EAE5D8',
  },
  profileAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfoText: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nickname: {
    fontSize: 20,
    fontWeight: '800',
  },
  roleBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statsDivider: {
    height: 1,
    backgroundColor: '#FAF9F6',
    marginVertical: Spacing.two,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 16,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#EAE5D8',
  },
  sectionCard: {
    borderRadius: 20,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: '#EAE5D8',
    gap: Spacing.two,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  ownerStatusGroup: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: 4,
  },
  ownerStatusBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  statusBanner: {
    padding: Spacing.two,
    borderRadius: 10,
    marginTop: 4,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 130,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.two,
  },
  chartBarCol: {
    width: 24,
    alignItems: 'center',
  },
  chartBarFill: {
    width: 14,
    borderRadius: 6,
  },
  resetRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderRadius: 16,
    marginTop: Spacing.two,
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bypassButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: Spacing.two,
  },
  ownerDropdownContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ownerCafeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  licensePickerBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE5D8',
    borderStyle: 'dashed',
  },
  licensePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.two,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE5D8',
  },
  ownerSubmitBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  faqList: {
    gap: Spacing.two,
  },
  faqItem: {
    paddingBottom: Spacing.one,
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
