/* area — 정적 데이터 & 시드 */

const CATS = ['상의', '하의', '아우터', '원피스', '신발', '가방', '기타'];

const SUBS = {
  '상의': ['반팔 티셔츠', '긴팔 티셔츠', '민소매', '셔츠', '블라우스', '니트', '맨투맨', '후드'],
  '하의': ['슬랙스', '청바지', '면바지', '반바지', '스커트', '트레이닝'],
  '아우터': ['재킷', '블레이저', '코트', '패딩', '카디건', '점퍼'],
  '원피스': ['미니 원피스', '롱 원피스', '셔츠 원피스'],
  '신발': ['스니커즈', '로퍼', '부츠', '샌들', '구두'],
  '가방': ['토트백', '크로스백', '백팩', '클러치'],
  '기타': ['모자', '목걸이', '스카프', '벨트', '안경'],
};

const DEFAULT_SUB = { '상의': '반팔 티셔츠', '하의': '슬랙스', '아우터': '재킷', '원피스': '미니 원피스', '신발': '스니커즈', '가방': '크로스백', '기타': '모자' };

const SHAPE_OF = {
  '반팔 티셔츠': 'tee', '긴팔 티셔츠': 'long', '민소매': 'tank', '셔츠': 'shirt', '블라우스': 'shirt', '니트': 'knit', '맨투맨': 'knit', '후드': 'hoodie',
  '슬랙스': 'pants', '청바지': 'jeans', '면바지': 'pants', '반바지': 'shorts', '스커트': 'skirt', '트레이닝': 'pants',
  '재킷': 'jacket', '블레이저': 'jacket', '코트': 'coat', '패딩': 'padding', '카디건': 'cardigan', '점퍼': 'jacket',
  '미니 원피스': 'dress', '롱 원피스': 'dress', '셔츠 원피스': 'dress',
  '스니커즈': 'sneaker', '로퍼': 'loafer', '부츠': 'boots', '샌들': 'loafer', '구두': 'loafer',
  '토트백': 'tote', '크로스백': 'cross', '백팩': 'backpack', '클러치': 'cross',
  '모자': 'cap', '목걸이': 'necklace', '스카프': 'scarf', '벨트': 'belt', '안경': 'glasses',
};
const CAT_SHAPE = { '상의': 'tee', '하의': 'pants', '아우터': 'jacket', '원피스': 'dress', '신발': 'sneaker', '가방': 'tote', '기타': 'cap' };
const CAT_ICON = { '상의': 'shirtI', '하의': 'pantsI', '아우터': 'coatI', '원피스': 'dressI', '신발': 'shoe', '가방': 'bag', '기타': 'more' };

const COLORS = [
  { name: '검정', hex: '#1A1A1A' }, { name: '흰색', hex: '#FFFFFF' }, { name: '회색', hex: '#9CA3AF' },
  { name: '베이지', hex: '#D9C2A0' }, { name: '아이보리', hex: '#F1EADB' }, { name: '갈색', hex: '#7A4E2D' },
  { name: '네이비', hex: '#24345C' }, { name: '하늘색', hex: '#9EC1E6' }, { name: '파랑', hex: '#2563EB' },
  { name: '연청', hex: '#8DAFD6' }, { name: '진청', hex: '#2F4A78' }, { name: '빨강', hex: '#E03131' },
  { name: '분홍', hex: '#F4A6C0' }, { name: '주황', hex: '#F08C3A' }, { name: '노랑', hex: '#F2C94C' },
  { name: '초록', hex: '#3F7D4E' }, { name: '카키', hex: '#6B6B3A' }, { name: '보라', hex: '#8B5CF6' },
];
const NEUTRALS = ['검정', '흰색', '회색', '베이지', '아이보리', '갈색', '네이비', '연청', '진청', '카키'];

const SEASONS = ['봄', '여름', '가을', '겨울'];
const SEASON_ICON = { '봄': '🌸', '여름': '☀️', '가을': '🍂', '겨울': '❄️' };
const STATUSES = ['사용 가능', '세탁 중', '수선 중', '사용 불가'];
const ITEM_STYLES = ['데일리', '출근', '데이트', '운동', '여행', '하객', '경조사'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'FREE'];
const THICKNESS = ['얇음', '보통', '두꺼움'];
const LININGS = ['없음', '기모', '누빔', '퍼', '메쉬'];
const OWNERSHIP = ['내 옷', '빌린 옷', '공용'];

const CODI_STYLES = [
  { k: '정장', icon: 'suit' }, { k: '캐주얼', icon: 'shirtI' }, { k: '스포츠', icon: 'run' },
  { k: '스트릿', icon: 'capI' }, { k: '미니멀', icon: 'leaf' }, { k: '기타', icon: 'more' },
];
const MOODS = [
  { k: '예식장', e: '💐' }, { k: '카페', e: '☕' }, { k: '데이트', e: '💕' }, { k: '출근', e: '💼' },
  { k: '여행', e: '✈️' }, { k: '캠핑', e: '⛺' }, { k: '파티', e: '🎉' }, { k: '운동', e: '🏃' }, { k: '캠퍼스', e: '📚' },
];
const LOOKS = ['데일리룩', '데이트룩', '오피스룩', '여행룩', '편안룩'];
const MY_STYLE_OPTIONS = ['미니멀', '데일리', '캐주얼', '클래식', '스트릿', '스포티', '러블리', '빈티지', '봄', '여름', '가을', '겨울'];

/* AI가 옷장 밖에서 추가로 제안하는 아이템 (미보유) */
const VIRTUAL_ITEMS = {
  outer: [
    { name: '베이지 트렌치 코트', cat: '아우터', sub: '코트', color: '#C9A87C', f: 2, warm: 2 },
    { name: '네이비 블레이저', cat: '아우터', sub: '블레이저', color: '#24345C', f: 3, warm: 1 },
    { name: '라이트 데님 재킷', cat: '아우터', sub: '재킷', color: '#8DAFD6', f: -1, warm: 1 },
    { name: '그레이 숏 패딩', cat: '아우터', sub: '패딩', color: '#9CA3AF', f: -1, warm: 3 },
  ],
  shoes: [
    { name: '화이트 레더 스니커즈', cat: '신발', sub: '스니커즈', color: '#FFFFFF', f: 0 },
    { name: '블랙 더비 슈즈', cat: '신발', sub: '구두', color: '#1A1A1A', f: 3 },
    { name: '그레이 러닝화', cat: '신발', sub: '스니커즈', color: '#9CA3AF', f: -3 },
  ],
  bag: [
    { name: '블랙 레더 숄더백', cat: '가방', sub: '토트백', color: '#1A1A1A', f: 2 },
    { name: '캔버스 에코백', cat: '가방', sub: '토트백', color: '#F1EADB', f: -1 },
  ],
  acc: [
    { name: '실버 체인 목걸이', cat: '기타', sub: '목걸이', color: '#C0C4CC', f: 1 },
    { name: '블랙 볼캡', cat: '기타', sub: '모자', color: '#1A1A1A', f: -2 },
    { name: '체크 울 스카프', cat: '기타', sub: '스카프', color: '#B5651D', f: 1, cold: true },
    { name: '브라운 가죽 벨트', cat: '기타', sub: '벨트', color: '#7A4E2D', f: 2 },
  ],
};

function colorHex(name) { return (COLORS.find(c => c.name === name) || COLORS[2]).hex; }

/* ---------- 시드 데이터 ---------- */
function seedItems() {
  const C = colorHex;
  const all = ['봄', '여름', '가을', '겨울'];
  const raw = [
    ['t1', '스트라이프 티셔츠', '상의', '긴팔 티셔츠', '#4A5546', ['봄', '가을'], '안방 옷장', ['데일리', '여행'], { fav: true, pattern: 'stripe', colorName: '카키' }],
    ['t2', '아이보리 니트', '상의', '니트', C('아이보리'), ['가을', '겨울'], '안방 옷장', ['데일리', '데이트'], { fav: true, thickness: '두꺼움' }],
    ['t3', '블루 셔츠', '상의', '셔츠', C('하늘색'), ['봄', '가을'], '드레스룸', ['출근', '데일리'], { thickness: '얇음' }],
    ['t4', '화이트 티셔츠', '상의', '반팔 티셔츠', C('흰색'), ['봄', '여름', '가을'], '서랍장', ['데일리', '운동', '여행'], { thickness: '얇음' }],
    ['t5', '코튼 반팔 셔츠', '상의', '셔츠', C('아이보리'), ['여름'], '드레스룸', ['데일리', '데이트'], { thickness: '얇음', daysAgo: 0 }],
    ['t6', '오버핏 코튼 셔츠', '상의', '셔츠', '#B7CDEA', ['봄', '가을'], '드레스룸', ['데일리', '출근'], { daysAgo: 1, colorName: '하늘색' }],
    ['t7', '블랙 후드', '상의', '후드', C('검정'), ['가을', '겨울'], '서랍장', ['데일리', '운동'], { thickness: '두꺼움', lining: '기모' }],
    ['t8', '그레이 맨투맨', '상의', '맨투맨', C('회색'), ['봄', '가을', '겨울'], '서랍장', ['데일리', '여행']],
    ['t9', '블랙 반팔 티셔츠', '상의', '반팔 티셔츠', C('검정'), ['여름'], '서랍장', ['데일리'], { thickness: '얇음' }],
    ['t10', '핑크 블라우스', '상의', '블라우스', C('분홍'), ['봄', '여름'], '드레스룸', ['데이트', '하객'], { thickness: '얇음' }],
    ['b1', '네이비 슬랙스', '하의', '슬랙스', C('네이비'), ['봄', '가을', '겨울'], '드레스룸', ['출근', '하객']],
    ['b2', '플리츠 스커트', '하의', '스커트', C('베이지'), ['봄', '가을'], '드레스룸', ['데이트', '하객']],
    ['b3', '와이드 데님 팬츠', '하의', '청바지', C('진청'), ['봄', '가을', '겨울'], '서랍장', ['데일리', '여행'], { daysAgo: 0 }],
    ['b4', '연청 청바지', '하의', '청바지', C('연청'), ['봄', '여름', '가을'], '서랍장', ['데일리', '데이트']],
    ['b5', '베이지 치노 팬츠', '하의', '면바지', C('베이지'), ['봄', '가을'], '서랍장', ['데일리', '출근']],
    ['b6', '블랙 트레이닝 팬츠', '하의', '트레이닝', C('검정'), all, '서랍장', ['운동']],
    ['b7', '린넨 반바지', '하의', '반바지', '#E9E2D0', ['여름'], '서랍장', ['여행', '데일리'], { thickness: '얇음', colorName: '아이보리' }],
    ['o1', '네이비 재킷', '아우터', '재킷', C('네이비'), ['봄', '가을'], '드레스룸', ['출근', '데이트']],
    ['o2', '베이지 재킷', '아우터', '재킷', '#CDB596', ['봄', '가을'], '드레스룸', ['데일리', '데이트'], { status: '세탁 중', colorName: '베이지' }],
    ['o3', '트렌치 코트', '아우터', '코트', '#C9A87C', ['봄', '가을'], '드레스룸', ['출근', '데이트', '하객'], { colorName: '베이지' }],
    ['o4', '블랙 블레이저', '아우터', '블레이저', C('검정'), ['봄', '가을', '겨울'], '드레스룸', ['출근', '하객', '경조사']],
    ['o5', '아이보리 카디건', '아우터', '카디건', C('아이보리'), ['봄', '가을'], '안방 옷장', ['데일리', '데이트'], { thickness: '얇음' }],
    ['o6', '블랙 롱패딩', '아우터', '패딩', C('검정'), ['겨울'], '안방 옷장', ['데일리'], { thickness: '두꺼움', lining: '누빔' }],
    ['d1', '블랙 원피스', '원피스', '롱 원피스', C('검정'), ['봄', '가을'], '드레스룸', ['하객', '데이트', '경조사']],
    ['s1', '화이트 스니커즈', '신발', '스니커즈', C('흰색'), all, '신발장', ['데일리', '여행', '운동'], { daysAgo: 1, size: '260' }],
    ['s2', '브라운 로퍼', '신발', '로퍼', C('갈색'), ['봄', '가을', '겨울'], '신발장', ['출근', '데이트', '하객'], { size: '260' }],
    ['s3', '블랙 첼시 부츠', '신발', '부츠', C('검정'), ['가을', '겨울'], '신발장', ['데일리', '데이트'], { size: '260' }],
    ['g1', '브라운 토트백', '가방', '토트백', C('갈색'), all, '드레스룸', ['출근', '데이트'], { size: 'FREE' }],
    ['g2', '블랙 크로스백', '가방', '크로스백', C('검정'), all, '드레스룸', ['데일리', '여행'], { size: 'FREE' }],
    ['a1', '실버 목걸이', '기타', '목걸이', '#C0C4CC', all, '서랍장', ['데이트', '하객'], { size: 'FREE', colorName: '회색' }],
    // 가족 옷
    ['f1', '그레이 후드 집업', '아우터', '점퍼', C('회색'), ['봄', '가을'], '안방 옷장', ['데일리'], { owner: 'bro', size: 'L' }],
    ['f2', '블랙 슬랙스', '하의', '슬랙스', C('검정'), ['봄', '가을', '겨울'], '드레스룸', ['출근'], { owner: 'bro', size: 'L' }],
    ['f3', '네이비 니트', '상의', '니트', C('네이비'), ['가을', '겨울'], '안방 옷장', ['데일리', '데이트'], { owner: 'bro', size: 'L' }],
    ['f4', '화이트 옥스포드 셔츠', '상의', '셔츠', C('흰색'), ['봄', '가을'], '드레스룸', ['출근'], { owner: 'bro', size: 'L' }],
    ['f5', '블랙 볼캡', '기타', '모자', C('검정'), all, '서랍장', ['데일리'], { owner: 'bro', size: 'FREE' }],
    ['f6', '옐로 카디건', '아우터', '카디건', C('노랑'), ['봄'], '안방 옷장', ['데일리', '데이트'], { owner: 'sis', size: 'S' }],
    ['f7', '데님 스커트', '하의', '스커트', C('연청'), ['봄', '여름'], '서랍장', ['데일리'], { owner: 'sis', size: 'S' }],
    ['f8', '핑크 맨투맨', '상의', '맨투맨', C('분홍'), ['봄', '가을'], '서랍장', ['데일리'], { owner: 'sis', size: 'S' }],
    ['f9', '화이트 미니 원피스', '원피스', '미니 원피스', C('흰색'), ['여름'], '드레스룸', ['데이트', '여행'], { owner: 'sis', size: 'S' }],
    ['f10', '카키 점퍼', '아우터', '점퍼', C('카키'), ['가을', '겨울'], '안방 옷장', ['데일리', '여행'], { owner: 'dad', size: 'XL' }],
    ['f11', '베이지 면바지', '하의', '면바지', C('베이지'), ['봄', '가을'], '서랍장', ['데일리', '출근'], { owner: 'dad', size: 'XL' }],
    ['f12', '네이비 셔츠', '상의', '셔츠', C('네이비'), ['봄', '가을'], '드레스룸', ['출근'], { owner: 'dad', size: 'XL' }],
    ['f13', '블랙 구두', '신발', '구두', C('검정'), all, '신발장', ['출근', '경조사'], { owner: 'dad', size: '270' }],
    ['f14', '브라운 가죽 벨트', '기타', '벨트', C('갈색'), all, '서랍장', ['출근'], { owner: 'dad', size: 'FREE' }],
  ];
  const now = Date.now();
  return raw.map((r, i) => {
    const [id, name, cat, sub, color, seasons, loc, styles, extra = {}] = r;
    const daysAgo = extra.daysAgo ?? (3 + i);
    const it = {
      id, name, cat, sub, color, colorName: extra.colorName || nearestColor(color).name, seasons, loc, styles,
      owner: 'me', status: '사용 가능', thickness: '보통', lining: '없음', size: 'M', ownership: '내 옷',
      memo: '', fav: false, pattern: null, photos: [], wear: Math.max(0, 12 - i % 13),
      createdAt: now - daysAgo * 864e5 - i * 6e4,
    };
    delete extra.daysAgo;
    return Object.assign(it, extra);
  });
}

function seedCodis() {
  const day = n => dayKey(Date.now() - n * 864e5);
  const now = Date.now();
  return [
    { id: 'c1', name: '출근 기본 코디', items: ['t3', 'b1', 'o4', 's2', 'g1'], virtual: [], date: day(1), fav: true, source: 'manual', tags: ['#오피스룩', '#출근'], sharedWith: [], from: null, createdAt: now - 1 * 864e5 },
    { id: 'c2', name: '주말 카페룩', items: ['t2', 'b3', 's1', 'g2'], virtual: [], date: day(3), fav: false, source: 'ai', tags: ['#데일리룩', '#카페'], sharedWith: [], from: null, createdAt: now - 3 * 864e5 },
    { id: 'c3', name: '봄 데이트룩', items: ['t5', 'b2', 'o5', 's2', 'a1'], virtual: [], date: day(6), fav: true, source: 'manual', tags: ['#데이트룩'], sharedWith: ['sis'], from: null, createdAt: now - 6 * 864e5 },
    { id: 'c4', name: '여행 편한 코디', items: ['t8', 'b4', 's1', 'g2'], virtual: [], date: day(11), fav: false, source: 'ai', tags: ['#여행룩'], sharedWith: [], from: null, createdAt: now - 11 * 864e5 },
    { id: 'c5', name: '형이 골라준 코디', items: ['t4', 'b3', 'o1', 's1'], virtual: [], date: null, fav: false, source: 'shared', tags: ['#데일리룩'], sharedWith: [], from: 'bro', createdAt: now - 2 * 864e5 },
  ];
}

/* 둘러보기(마켓) — 데모용 시드 */
const MARKET = {
  codis: [
    { id: 'm1', user: '민지', likes: 128, title: '가을 미니멀 코디', items: [
      { name: '크림 니트', cat: '상의', sub: '니트', color: '#F1EADB' }, { name: '블랙 슬랙스', cat: '하의', sub: '슬랙스', color: '#1A1A1A' },
      { name: '카멜 코트', cat: '아우터', sub: '코트', color: '#B98A55' }, { name: '블랙 로퍼', cat: '신발', sub: '로퍼', color: '#1A1A1A' }] },
    { id: 'm2', user: '지후', likes: 96, title: '데님 온 데님', items: [
      { name: '데님 셔츠', cat: '상의', sub: '셔츠', color: '#8DAFD6' }, { name: '진청 와이드', cat: '하의', sub: '청바지', color: '#2F4A78' },
      { name: '화이트 스니커즈', cat: '신발', sub: '스니커즈', color: '#FFFFFF' }, { name: '캔버스 백', cat: '가방', sub: '토트백', color: '#F1EADB' }] },
    { id: 'm3', user: '서연', likes: 211, title: '하객룩 정석', items: [
      { name: '라벤더 원피스', cat: '원피스', sub: '롱 원피스', color: '#B9A6E8' }, { name: '아이보리 카디건', cat: '아우터', sub: '카디건', color: '#F1EADB' },
      { name: '베이지 구두', cat: '신발', sub: '구두', color: '#D9C2A0' }, { name: '미니 클러치', cat: '가방', sub: '클러치', color: '#FFFFFF' }] },
    { id: 'm4', user: '도윤', likes: 74, title: '주말 스트릿', items: [
      { name: '오버핏 후드', cat: '상의', sub: '후드', color: '#6B6B3A' }, { name: '카고 팬츠', cat: '하의', sub: '면바지', color: '#1A1A1A' },
      { name: '볼캡', cat: '기타', sub: '모자', color: '#1A1A1A' }, { name: '하이탑', cat: '신발', sub: '스니커즈', color: '#FFFFFF' }] },
  ],
  used: [
    { id: 'u1', name: '울 블렌드 코트', cat: '아우터', sub: '코트', color: '#7A4E2D', price: 45000, seller: '옷장정리중', cond: '상태 좋음 · 2회 착용' },
    { id: 'u2', name: '체크 셔츠', cat: '상의', sub: '셔츠', color: '#C0392B', price: 12000, seller: '하늘바다', cond: '거의 새것', pattern: 'stripe' },
    { id: 'u3', name: '레더 첼시 부츠', cat: '신발', sub: '부츠', color: '#5B3A22', price: 38000, seller: '슈즈러버', cond: '사이즈 250' },
    { id: 'u4', name: '미니 숄더백', cat: '가방', sub: '크로스백', color: '#D9C2A0', price: 22000, seller: '정리왕', cond: '사용감 적음' },
  ],
  fresh: [
    { id: 'n1', brand: 'AREA BASIC', name: '코튼 오버핏 셔츠', cat: '상의', sub: '셔츠', color: '#FFFFFF', price: 39000 },
    { id: 'n2', brand: 'AREA BASIC', name: '세미 와이드 슬랙스', cat: '하의', sub: '슬랙스', color: '#9CA3AF', price: 49000 },
    { id: 'n3', brand: 'NORDIC', name: '라이트 다운 패딩', cat: '아우터', sub: '패딩', color: '#24345C', price: 129000 },
    { id: 'n4', brand: 'WALKIN', name: '레더 스니커즈', cat: '신발', sub: '스니커즈', color: '#F1EADB', price: 89000 },
  ],
};
