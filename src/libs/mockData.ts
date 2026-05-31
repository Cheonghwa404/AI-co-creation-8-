export interface Cafe {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  outletDensity: '부족' | '보통' | '풍부';
  noiseLevel: '조용함' | '보통' | '활기참';
  wifiSpeed: '느림' | '보통' | '빠름';
  seatStatus: 'EMPTY' | 'NORMAL' | 'FULL'; // EMPTY: 여유, NORMAL: 보통, FULL: 만석
  lastUpdatedAt: string;
  updatedByType: 'OWNER' | 'USER';
  pointsReward: number;
  image: string;
  tags: string[];
}

export const MOCK_CAFES: Cafe[] = [
  {
    id: 'cafe-1',
    name: '포레스트 스터디랩 신촌점',
    latitude: 37.5598,
    longitude: 126.9358,
    address: '서울특별시 서대문구 연세로 12길 4 2층',
    phone: '02-123-4567',
    outletDensity: '풍부',
    noiseLevel: '조용함',
    wifiSpeed: '빠름',
    seatStatus: 'EMPTY',
    lastUpdatedAt: '5분 전',
    updatedByType: 'OWNER',
    pointsReward: 100,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=300&q=80',
    tags: ['독서실분위기', '개인스탠드', '24시간']
  },
  {
    id: 'cafe-2',
    name: '에이바웃커피 연세대점',
    latitude: 37.5582,
    longitude: 126.9372,
    address: '서울특별시 서대문구 신촌로 109',
    phone: '02-987-6543',
    outletDensity: '풍부',
    noiseLevel: '보통',
    wifiSpeed: '빠름',
    seatStatus: 'NORMAL',
    lastUpdatedAt: '12분 전',
    updatedByType: 'USER',
    pointsReward: 100,
    image: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=300&q=80',
    tags: ['가성비', '넓은좌석', '콘센트지옥']
  },
  {
    id: 'cafe-3',
    name: '카페 우드브릭 홍대점',
    latitude: 37.5528,
    longitude: 126.9248,
    address: '서울특별시 마포구 와우산로 21길 19',
    phone: '02-555-8888',
    outletDensity: '보통',
    noiseLevel: '활기참',
    wifiSpeed: '보통',
    seatStatus: 'FULL',
    lastUpdatedAt: '2분 전',
    updatedByType: 'OWNER',
    pointsReward: 100,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=300&q=80',
    tags: ['베이커리맛집', '인테리어예쁜', '테라스']
  },
  {
    id: 'cafe-4',
    name: '아이보리 플랫 서강대점',
    latitude: 37.5512,
    longitude: 126.9389,
    address: '서울특별시 마포구 백범로 35 1층',
    phone: '02-333-1111',
    outletDensity: '풍부',
    noiseLevel: '조용함',
    wifiSpeed: '빠름',
    seatStatus: 'EMPTY',
    lastUpdatedAt: '32분 전',
    updatedByType: 'USER',
    pointsReward: 100,
    image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=300&q=80',
    tags: ['재즈음악', '핸드드립', '조용한학습']
  },
  {
    id: 'cafe-5',
    name: '북앤드로잉 신촌본점',
    latitude: 37.5562,
    longitude: 126.9342,
    address: '서울특별시 서대문구 연세로5가길 8 3층',
    phone: '02-777-9999',
    outletDensity: '보통',
    noiseLevel: '보통',
    wifiSpeed: '보통',
    seatStatus: 'NORMAL',
    lastUpdatedAt: '1시간 전',
    updatedByType: 'USER',
    pointsReward: 100,
    image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=300&q=80',
    tags: ['북카페', '작업하기좋은', '커피무한리필']
  }
];

export interface Gifticon {
  id: string;
  brand: string;
  name: string;
  price: number;
  image: string;
}

export const MOCK_GIFTICONS: Gifticon[] = [
  {
    id: 'g-1',
    brand: '스타벅스',
    name: '아이스 카페 아메리카노 T',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'g-2',
    brand: '투썸플레이스',
    name: '떠먹는 아메리칸 믹스드베리',
    price: 6500,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'g-3',
    brand: '이디야커피',
    name: '아메리카노 L',
    price: 3200,
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'g-4',
    brand: '네이버페이',
    name: '네이버페이 포인트 5,000원권',
    price: 5000,
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=200&q=80'
  }
];

export interface UserProfile {
  nickname: string;
  role: 'USER' | 'OWNER';
  points: number;
  reportedCount: number;
  isRegisteredOwner: boolean;
  registeredCafeId?: string;
  hasPendingApplication: boolean;
}

export const INITIAL_USER: UserProfile = {
  nickname: '도서관탈출러',
  role: 'USER',
  points: 1250,
  reportedCount: 8,
  isRegisteredOwner: false,
  hasPendingApplication: false
};
