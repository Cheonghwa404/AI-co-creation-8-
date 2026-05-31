import { useState, useEffect } from 'react';
import { MOCK_CAFES, Cafe, UserProfile, INITIAL_USER, Gifticon } from '../libs/mockData';

// 전역 싱글톤 상태를 유지하기 위한 변수 (간단한 인메모리 스토어)
let globalCafes: Cafe[] = [...MOCK_CAFES];
let globalUser: UserProfile = { ...INITIAL_USER };
const listeners = new Set<() => void>();

function updateGlobalState() {
  listeners.forEach(listener => listener());
}

export function useCafeState() {
  const [cafes, setCafes] = useState<Cafe[]>(globalCafes);
  const [user, setUser] = useState<UserProfile>(globalUser);

  useEffect(() => {
    const handleUpdate = () => {
      setCafes([...globalCafes]);
      setUser({ ...globalUser });
    };

    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  // 특정 카페 좌석 상태 수동 업데이트 (점주용)
  const updateSeatStatus = (cafeId: string, status: 'EMPTY' | 'NORMAL' | 'FULL', byType: 'OWNER' | 'USER') => {
    globalCafes = globalCafes.map(cafe => {
      if (cafe.id === cafeId) {
        return {
          ...cafe,
          seatStatus: status,
          lastUpdatedAt: '방금 전',
          updatedByType: byType
        };
      }
      return cafe;
    });
    updateGlobalState();
  };

  // 영수증 제보 처리 (OCR 인증 성공 상황)
  const submitReceiptReport = (cafeId: string, status: 'EMPTY' | 'NORMAL' | 'FULL', pointsEarned: number) => {
    // 1. 카페 상태 업데이트
    updateSeatStatus(cafeId, status, 'USER');

    // 2. 유저 포인트 적립 및 제보 횟수 증가
    globalUser = {
      ...globalUser,
      points: globalUser.points + pointsEarned,
      reportedCount: globalUser.reportedCount + 1
    };
    updateGlobalState();
  };

  // 포인트 상점에서 기프티콘 구매
  const buyGifticon = (gifticon: Gifticon): { success: boolean; message: string } => {
    if (globalUser.points < gifticon.price) {
      return { success: false, message: '포인트가 부족합니다.' };
    }

    globalUser = {
      ...globalUser,
      points: globalUser.points - gifticon.price
    };
    updateGlobalState();
    return { success: true, message: `${gifticon.brand} ${gifticon.name} 교환 성공! 마이페이지에서 쿠폰을 확인하세요.` };
  };

  // 점주 회원가입 및 카페 등록 신청
  const applyForOwner = (cafeId: string) => {
    globalUser = {
      ...globalUser,
      hasPendingApplication: true,
      registeredCafeId: cafeId
    };
    updateGlobalState();
  };

  // 점주 신청 승인 모의 처리 (테스트용)
  const approveOwnerRequest = () => {
    if (globalUser.hasPendingApplication) {
      globalUser = {
        ...globalUser,
        role: 'OWNER',
        isRegisteredOwner: true,
        hasPendingApplication: false
      };
      updateGlobalState();
    }
  };

  // 점주 권한 반납 및 유저 리셋 (테스트용)
  const resetUserToRegular = () => {
    globalUser = {
      ...INITIAL_USER
    };
    updateGlobalState();
  };

  return {
    cafes,
    user,
    updateSeatStatus,
    submitReceiptReport,
    buyGifticon,
    applyForOwner,
    approveOwnerRequest,
    resetUserToRegular
  };
}
