import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Image as ImageIcon, CheckCircle, AlertCircle, Sparkles, Award } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useCafeState } from '@/hooks/use-cafe-state';
import { Spacing, BottomTabInset, MaxContentWidth } from '@/constants/theme';

export default function ReportScreen() {
  const theme = useTheme();
  const { cafes, submitReceiptReport } = useCafeState();

  // 입력 필드 상태
  const [selectedCafeId, setSelectedCafeId] = useState<string>('cafe-1');
  const [seatStatus, setSeatStatus] = useState<'EMPTY' | 'NORMAL' | 'FULL'>('EMPTY');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  
  // OCR 프로세스 상태
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    cafeName: string;
    timestamp: string;
    points: number;
  } | null>(null);

  // 영수증 사진 촬영/선택 핸들러
  const handlePickImage = async (useCamera: boolean) => {
    let result;
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    };

    try {
      if (useCamera) {
        // 카메라 권한 확인
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('권한 오류', '카메라 접근 권한이 필요합니다.');
          return;
        }
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        // 갤러리 권한 확인
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('권한 오류', '사진 갤러리 접근 권한이 필요합니다.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setReceiptImage(result.assets[0].uri);
        // 새로운 영수증 업로드 시 이전 검증 결과 초기화
        setVerificationResult(null);
      }
    } catch (error) {
      console.log('이미지 선택 에러: ', error);
      // 웹 등 환경 대비 Mock 이미지 세팅
      setReceiptImage('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=300&q=80');
    }
  };

  // 실시간 영수증 제보 제출 (Gemini OCR 연동 시뮬레이션)
  const handleSubmitReport = () => {
    if (!receiptImage) {
      Alert.alert('경고', '영수증 인증 사진을 첨부해 주세요.');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    const cafe = cafes.find(c => c.id === selectedCafeId);
    if (!cafe) return;

    // Supabase Edge Function + Gemini OCR 처리 시뮬레이션 (2초 대기)
    setTimeout(() => {
      setIsVerifying(false);
      
      // 모의 파싱 결과 생성 (선택한 카페와 일치하는 영수증으로 검증 성공 유도)
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const parsedResult = {
        success: true,
        cafeName: cafe.name, // Gemini OCR이 영수증에서 찾아낸 카페명
        timestamp: `오늘 ${timeStr}`, // 영수증 내 결제 시각
        points: 100
      };

      setVerificationResult(parsedResult);
      
      // 전역 카페 상태 갱신 및 유저 포인트 적립 처리
      submitReceiptReport(selectedCafeId, seatStatus, parsedResult.points);
      
      // 업로드 이미지 초기화
      setReceiptImage(null);
    }, 2000);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* 타이틀 및 팁 */}
          <View style={styles.header}>
            <ThemedText type="subtitle" style={{ color: theme.primary, marginBottom: Spacing.one }}>
              실시간 좌석 제보
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              인증 영수증 사진을 첨부하여 실시간 좌석을 제보하고 카페릿 포인트를 적립하세요!
            </ThemedText>
          </View>

          {/* 1단계: 카페 선택 */}
          <ThemedView type="backgroundElement" style={[styles.sectionCard, styles.shadow]}>
            <View style={styles.stepTitleRow}>
              <View style={[styles.stepNum, { backgroundColor: theme.primary }]}>
                <ThemedText type="smallBold" style={{ color: theme.background, fontSize: 12 }}>1</ThemedText>
              </View>
              <ThemedText type="smallBold" style={{ color: theme.text }}>제보할 카페 선택</ThemedText>
            </View>

            <View style={styles.dropdownContainer}>
              {cafes.map(cafe => (
                <TouchableOpacity
                  key={cafe.id}
                  onPress={() => {
                    setSelectedCafeId(cafe.id);
                    setVerificationResult(null);
                  }}
                  style={[
                    styles.cafeOption,
                    { 
                      backgroundColor: selectedCafeId === cafe.id ? theme.backgroundSelected : theme.background,
                      borderColor: selectedCafeId === cafe.id ? theme.primary : '#EAE5D8'
                    }
                  ]}
                >
                  <ThemedText type="smallBold" style={{ color: selectedCafeId === cafe.id ? theme.primary : theme.text }}>
                    {cafe.name}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>
                    {cafe.address}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ThemedView>

          {/* 2단계: 좌석 상태 입력 */}
          <ThemedView type="backgroundElement" style={[styles.sectionCard, styles.shadow]}>
            <View style={styles.stepTitleRow}>
              <View style={[styles.stepNum, { backgroundColor: theme.primary }]}>
                <ThemedText type="smallBold" style={{ color: theme.background, fontSize: 12 }}>2</ThemedText>
              </View>
              <ThemedText type="smallBold" style={{ color: theme.text }}>현재 좌석 현황 제보</ThemedText>
            </View>

            <View style={styles.statusGroup}>
              {/* 여유 */}
              <TouchableOpacity
                onPress={() => setSeatStatus('EMPTY')}
                style={[
                  styles.statusSelector,
                  { backgroundColor: seatStatus === 'EMPTY' ? theme.statusEmptyBg : theme.background, borderColor: seatStatus === 'EMPTY' ? theme.statusEmptyText : '#EAE5D8' }
                ]}
              >
                <View style={[styles.statusDot, { backgroundColor: theme.statusEmptyText }]} />
                <ThemedText type="smallBold" style={{ color: theme.statusEmptyText }}>여유 있음</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>공석 50% 이상</ThemedText>
              </TouchableOpacity>

              {/* 보통 */}
              <TouchableOpacity
                onPress={() => setSeatStatus('NORMAL')}
                style={[
                  styles.statusSelector,
                  { backgroundColor: seatStatus === 'NORMAL' ? theme.statusNormalBg : theme.background, borderColor: seatStatus === 'NORMAL' ? theme.statusNormalText : '#EAE5D8' }
                ]}
              >
                <View style={[styles.statusDot, { backgroundColor: theme.statusNormalText }]} />
                <ThemedText type="smallBold" style={{ color: theme.statusNormalText }}>보통</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>공석 20%~50%</ThemedText>
              </TouchableOpacity>

              {/* 만석 */}
              <TouchableOpacity
                onPress={() => setSeatStatus('FULL')}
                style={[
                  styles.statusSelector,
                  { backgroundColor: seatStatus === 'FULL' ? theme.statusFullBg : theme.background, borderColor: seatStatus === 'FULL' ? theme.statusFullText : '#EAE5D8' }
                ]}
              >
                <View style={[styles.statusDot, { backgroundColor: theme.statusFullText }]} />
                <ThemedText type="smallBold" style={{ color: theme.statusFullText }}>만석</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>공석 20% 이하</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>

          {/* 3단계: 영수증 사진 인증 */}
          <ThemedView type="backgroundElement" style={[styles.sectionCard, styles.shadow]}>
            <View style={styles.stepTitleRow}>
              <View style={[styles.stepNum, { backgroundColor: theme.primary }]}>
                <ThemedText type="smallBold" style={{ color: theme.background, fontSize: 12 }}>3</ThemedText>
              </View>
              <ThemedText type="smallBold" style={{ color: theme.text }}>매장 결제 영수증 첨부</ThemedText>
            </View>

            {receiptImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: receiptImage }} style={styles.receiptPreview} />
                <TouchableOpacity onPress={() => setReceiptImage(null)} style={styles.removeImageButton}>
                  <ThemedText type="smallBold" style={{ color: theme.statusFullText }}>사진 재선택</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imagePickerGrid}>
                <TouchableOpacity onPress={() => handlePickImage(true)} style={[styles.pickerButton, { backgroundColor: theme.background }]}>
                  <Camera size={24} color={theme.primary} />
                  <ThemedText type="smallBold" style={{ color: theme.text, marginTop: 8 }}>카메라 촬영</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handlePickImage(false)} style={[styles.pickerButton, { backgroundColor: theme.background }]}>
                  <ImageIcon size={24} color={theme.primary} />
                  <ThemedText type="smallBold" style={{ color: theme.text, marginTop: 8 }}>앨범에서 선택</ThemedText>
                </TouchableOpacity>
              </View>
            )}

            <View style={[styles.alertTip, { backgroundColor: theme.background }]}>
              <AlertCircle size={14} color={theme.textSecondary} />
              <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 11, flex: 1 }}>
                영수증 내 카페 이름 및 결제 일시 정보가 정확하게 노출되어야 정상 검증됩니다.
              </ThemedText>
            </View>
          </ThemedView>

          {/* 제출 버튼 */}
          <TouchableOpacity
            onPress={handleSubmitReport}
            disabled={isVerifying || !receiptImage}
            style={[
              styles.submitButton, 
              { backgroundColor: !receiptImage ? theme.backgroundSelected : theme.primary },
              styles.shadow
            ]}
          >
            {isVerifying ? (
              <View style={styles.loaderRow}>
                <ActivityIndicator size="small" color={theme.background} />
                <ThemedText type="smallBold" style={[styles.submitBtnText, { color: theme.background, marginLeft: 8 }]}>
                  Gemini OCR 실시간 검증 중...
                </ThemedText>
              </View>
            ) : (
              <ThemedText type="smallBold" style={[styles.submitBtnText, { color: !receiptImage ? theme.textSecondary : theme.background }]}>
                영수증 제출 및 좌석 갱신
              </ThemedText>
            )}
          </TouchableOpacity>

          {/* Gemini OCR 실시간 분석 검증 결과 모달 카드 */}
          {verificationResult && (
            <ThemedView type="backgroundElement" style={[styles.ocrResultCard, styles.shadow, { borderColor: theme.primary }]}>
              <View style={styles.ocrHeader}>
                <Sparkles size={18} color={theme.primary} />
                <ThemedText type="smallBold" style={[styles.ocrTitle, { color: theme.primary }]}>
                  Gemini OCR 영수증 분석 결과
                </ThemedText>
              </View>

              <View style={[styles.ocrRow, { borderBottomColor: theme.background }]}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>추출된 카페명</ThemedText>
                <View style={styles.successValue}>
                  <ThemedText type="smallBold" style={{ color: theme.text }}>{verificationResult.cafeName}</ThemedText>
                  <CheckCircle size={14} color={theme.statusEmptyText} style={{ marginLeft: 6 }} />
                </View>
              </View>

              <View style={[styles.ocrRow, { borderBottomColor: theme.background }]}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>인증 결제 일시</ThemedText>
                <View style={styles.successValue}>
                  <ThemedText type="small" style={{ color: theme.text }}>{verificationResult.timestamp}</ThemedText>
                  <CheckCircle size={14} color={theme.statusEmptyText} style={{ marginLeft: 6 }} />
                </View>
              </View>

              <View style={[styles.ocrSuccessFooter, { backgroundColor: theme.backgroundSelected }]}>
                <Award size={18} color={theme.primary} />
                <ThemedText type="smallBold" style={{ color: theme.primary, marginLeft: 6 }}>
                  영수증 실시간 매칭 성공! {verificationResult.points}p가 적립되었습니다.
                </ThemedText>
              </View>
            </ThemedView>
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
  sectionCard: {
    borderRadius: 20,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: '#EAE5D8',
    gap: Spacing.two,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.one,
  },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownContainer: {
    gap: Spacing.two,
  },
  cafeOption: {
    padding: Spacing.two,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusGroup: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statusSelector: {
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
  imagePickerGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  pickerButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.four,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE5D8',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  receiptPreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  removeImageButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
  },
  alertTip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.two,
    borderRadius: 10,
    gap: 6,
  },
  submitButton: {
    paddingVertical: Spacing.three,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '800',
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ocrResultCard: {
    borderRadius: 20,
    padding: Spacing.three,
    borderWidth: 1,
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  ocrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  ocrTitle: {
    fontSize: 15,
  },
  ocrRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  successValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ocrSuccessFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.two,
    borderRadius: 10,
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
