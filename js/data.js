/* area — 정적 데이터 & 시드 */

const CATS = ['상의', '하의', '아우터', '원피스', '신발', '가방', '모자', '시계', '기타'];

const SUBS = {
  '상의': ['반팔 티셔츠', '긴팔 티셔츠', '민소매', '셔츠', '블라우스', '니트', '맨투맨', '후드'],
  '하의': ['슬랙스', '청바지', '면바지', '반바지', '스커트', '트레이닝'],
  '아우터': ['재킷', '블레이저', '코트', '패딩', '카디건', '점퍼'],
  '원피스': ['미니 원피스', '롱 원피스', '셔츠 원피스'],
  '신발': ['스니커즈', '로퍼', '부츠', '샌들', '구두', '힐', '플랫', '슬립온'],
  '가방': ['토트백', '크로스백', '숄더백', '백팩', '더플백', '힙색', '클러치', '캐리어'],
  '모자': ['볼캡', '비니', '버킷햇', '페도라', '베레모', '헌팅캡', '썬햇'],
  '시계': ['메탈 시계', '가죽 시계', '스마트워치', '전자시계'],
  '기타': ['목걸이', '스카프', '벨트', '안경', '모자'],
};

const DEFAULT_SUB = { '상의': '반팔 티셔츠', '하의': '슬랙스', '아우터': '재킷', '원피스': '미니 원피스', '신발': '스니커즈', '가방': '크로스백', '모자': '볼캡', '시계': '메탈 시계', '기타': '목걸이' };

const SHAPE_OF = {
  '반팔 티셔츠': 'tee', '긴팔 티셔츠': 'long', '민소매': 'tank', '셔츠': 'shirt', '블라우스': 'shirt', '니트': 'knit', '맨투맨': 'knit', '후드': 'hoodie',
  '슬랙스': 'pants', '청바지': 'jeans', '면바지': 'pants', '반바지': 'shorts', '스커트': 'skirt', '트레이닝': 'pants',
  '재킷': 'jacket', '블레이저': 'jacket', '코트': 'coat', '패딩': 'padding', '카디건': 'cardigan', '점퍼': 'jacket',
  '미니 원피스': 'dress', '롱 원피스': 'dress', '셔츠 원피스': 'dress',
  '스니커즈': 'sneaker', '로퍼': 'loafer', '부츠': 'boots', '샌들': 'loafer', '구두': 'loafer',
  '토트백': 'tote', '크로스백': 'cross', '숄더백': 'cross', '백팩': 'backpack', '더플백': 'tote', '힙색': 'cross', '클러치': 'cross', '캐리어': 'backpack',
  '힐': 'loafer', '플랫': 'loafer', '슬립온': 'sneaker',
  '볼캡': 'cap', '비니': 'cap', '버킷햇': 'cap', '페도라': 'cap', '베레모': 'cap', '헌팅캡': 'cap', '썬햇': 'cap',
  '메탈 시계': 'necklace', '가죽 시계': 'necklace', '스마트워치': 'necklace', '전자시계': 'necklace',
  '모자': 'cap', '목걸이': 'necklace', '스카프': 'scarf', '벨트': 'belt', '안경': 'glasses',
};
const CAT_SHAPE = { '상의': 'tee', '하의': 'pants', '아우터': 'jacket', '원피스': 'dress', '신발': 'sneaker', '가방': 'tote', '모자': 'cap', '시계': 'necklace', '기타': 'necklace' };
const CAT_ICON = { '상의': 'shirtI', '하의': 'pantsI', '아우터': 'coatI', '원피스': 'dressI', '신발': 'shoe', '가방': 'bag', '모자': 'capI', '시계': 'watch', '기타': 'more' };

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

/* AI가 옷장 밖에서 추가로 제안하는 아이템 (미보유 · 실사 이미지) */
const VIRTUAL_ITEMS = {
  outer: [],
  shoes: [
    { name: '화이트 레더 스니커즈', cat: '신발', sub: '스니커즈', color: '#FFFFFF', f: 0, img: 'shoec-14' },
    { name: '블랙 페이턴트 로퍼', cat: '신발', sub: '로퍼', color: '#1A1A1A', f: 3, img: 'shoeb-12' },
    { name: '그레이 러닝화', cat: '신발', sub: '스니커즈', color: '#9CA3AF', f: -3, img: 'shoec-27' },
  ],
  bag: [
    { name: '블랙 레더 호보백', cat: '가방', sub: '숄더백', color: '#1A1A1A', f: 2, img: 'bagb-41' },
    { name: '아이보리 보스턴백', cat: '가방', sub: '토트백', color: '#F1EADB', f: 1, img: 'bagb-44' },
  ],
  acc: [
    { name: '블랙 볼캡', cat: '모자', sub: '볼캡', color: '#1A1A1A', f: -2, img: 'hatb-11' },
    { name: '네이비 다이얼 메탈 시계', cat: '시계', sub: '메탈 시계', color: '#C0C4CC', f: 1.5, img: 'watch-11' },
    { name: '그레이 케이블 비니', cat: '모자', sub: '비니', color: '#9CA3AF', f: -1, cold: true, img: 'hatb-25' },
  ],
};

function colorHex(name) { return (COLORS.find(c => c.name === name) || COLORS[2]).hex; }

/* ---------- 시드 데이터 (모두 img/items/*.webp 실사 이미지) ---------- */
const SEED_VERSION = 4;
function seedItems() {
  const C = colorHex;
  const all = ['봄', '여름', '가을', '겨울'];
  const fw = ['가을', '겨울'], sf = ['봄', '가을'], ss = ['봄', '여름'], nw = ['봄', '여름', '가을'];
  const raw = [
    // 상의
    ['t1', '스트라이프 긴팔 티셔츠', '상의', '긴팔 티셔츠', C('흰색'), sf, '안방 옷장', ['데일리', '여행'], { fav: true, img: 'top-32' }],
    ['t2', '아이보리 케이블 니트', '상의', '니트', C('아이보리'), fw, '안방 옷장', ['데일리', '데이트'], { fav: true, thickness: '두꺼움', img: 'top-21' }],
    ['t3', '블루 스트라이프 셔츠', '상의', '셔츠', C('하늘색'), sf, '드레스룸', ['출근', '데일리'], { thickness: '얇음', img: 'top-15' }],
    ['t4', '화이트 반팔 티셔츠', '상의', '반팔 티셔츠', C('흰색'), nw, '서랍장', ['데일리', '운동', '여행'], { thickness: '얇음', img: 'top-11' }],
    ['t5', '블루 오픈카라 셔츠', '상의', '셔츠', C('하늘색'), ['여름'], '드레스룸', ['데일리', '데이트'], { thickness: '얇음', daysAgo: 0, img: 'top-44' }],
    ['t6', '브라운 코듀로이 셔츠', '상의', '셔츠', C('갈색'), fw, '드레스룸', ['데일리', '데이트'], { daysAgo: 1, img: 'top-41' }],
    ['t7', '그레이 후드', '상의', '후드', C('회색'), fw, '서랍장', ['데일리', '운동'], { thickness: '두꺼움', lining: '기모', img: 'top-13' }],
    ['t8', '라이트 그레이 맨투맨', '상의', '맨투맨', C('회색'), ['봄', '가을', '겨울'], '서랍장', ['데일리', '여행'], { img: 'top-34' }],
    ['t9', '블랙 반팔 티셔츠', '상의', '반팔 티셔츠', C('검정'), ['여름'], '서랍장', ['데일리'], { thickness: '얇음', img: 'top-12' }],
    ['t11', '블랙 피케 폴로', '상의', '반팔 티셔츠', C('검정'), ss, '서랍장', ['데일리', '출근'], { thickness: '얇음', img: 'top-31' }],
    ['t13', '그린 크루넥 니트', '상의', '니트', C('초록'), fw, '안방 옷장', ['데일리', '데이트'], { img: 'top-22' }],
    ['t14', '블랙 니트 카라 셔츠', '상의', '니트', C('검정'), sf, '드레스룸', ['데이트', '출근'], { img: 'top-35' }],
    ['t15', '블랙 나시', '상의', '민소매', C('검정'), ['여름'], '서랍장', ['운동', '데일리'], { thickness: '얇음', img: 'top-43' }],
    // 하의
    ['b1', '차콜 투턱 슬랙스', '하의', '슬랙스', '#3F4045', ['봄', '가을', '겨울'], '드레스룸', ['출근', '하객'], { colorName: '회색', img: 'bottom-44' }],
    ['b3', '와이드 데님 팬츠', '하의', '청바지', '#5E82B3', ['봄', '가을', '겨울'], '서랍장', ['데일리', '여행'], { daysAgo: 0, colorName: '진청', img: 'bottom-43' }],
    ['b4', '연청 청바지', '하의', '청바지', C('연청'), nw, '서랍장', ['데일리', '데이트'], { img: 'bottom-11' }],
    ['b5', '베이지 투턱 슬랙스', '하의', '슬랙스', C('베이지'), sf, '드레스룸', ['데일리', '출근'], { img: 'bottom-13' }],
    ['b6', '블랙 트랙 팬츠', '하의', '트레이닝', C('검정'), all, '서랍장', ['운동'], { img: 'bottom-45' }],
    ['b8', '블랙 조거 팬츠', '하의', '트레이닝', C('검정'), ['봄', '가을', '겨울'], '서랍장', ['운동', '데일리'], { img: 'bottom-21' }],
    ['b10', '데님 반바지', '하의', '반바지', '#5E82B3', ['여름'], '서랍장', ['데일리', '여행'], { thickness: '얇음', colorName: '진청', img: 'bottom-23' }],
    ['b11', '베이지 치노 반바지', '하의', '반바지', C('베이지'), ['여름'], '서랍장', ['데일리', '여행'], { thickness: '얇음', img: 'bottom-24' }],
    ['b12', '블랙 나일론 반바지', '하의', '반바지', C('검정'), ['여름'], '서랍장', ['운동'], { thickness: '얇음', img: 'bottom-25' }],
    ['b13', '네이비 카고 반바지', '하의', '반바지', C('네이비'), ['여름'], '서랍장', ['데일리', '여행'], { thickness: '얇음', img: 'bottom-31' }],
    ['b14', '카키 데님 반바지', '하의', '반바지', C('카키'), ['여름'], '서랍장', ['데일리'], { thickness: '얇음', img: 'bottom-33' }],
    ['b15', '스트라이프 반바지', '하의', '반바지', C('하늘색'), ['여름'], '서랍장', ['데이트', '여행'], { thickness: '얇음', img: 'bottom-34' }],
    ['b16', '네이비 턱 반바지', '하의', '반바지', C('네이비'), ['여름'], '서랍장', ['데이트', '출근'], { thickness: '얇음', img: 'bottom-35' }],
    // 아우터
    ['o2', '베이지 해링턴 재킷', '아우터', '점퍼', C('베이지'), sf, '드레스룸', ['데일리', '데이트'], { status: '세탁 중', img: 'top-24' }],
    ['o7', '블랙 집업 블루종', '아우터', '점퍼', C('검정'), sf, '안방 옷장', ['데일리', '여행'], { daysAgo: 2, img: 'top-23' }],
    ['o8', '데님 트러커 재킷', '아우터', '재킷', '#4F72A3', sf, '드레스룸', ['데일리', '여행'], { colorName: '진청', img: 'top-25' }],
    // 신발
    ['sh1', '아이보리 러닝화', '신발', '스니커즈', C('아이보리'), all, '신발장', ['데일리', '여행'], { daysAgo: 1, size: '260', img: 'shoea-11' }],
    ['sh2', '블랙 화이트 로우 스니커즈', '신발', '스니커즈', C('검정'), all, '신발장', ['데일리'], { size: '260', img: 'shoea-12' }],
    ['sh3', '화이트 청키 스니커즈', '신발', '스니커즈', C('흰색'), all, '신발장', ['데일리', '여행'], { size: '260', img: 'shoea-13' }],
    ['sh4', '블랙 하이탑 캔버스', '신발', '스니커즈', C('검정'), nw, '신발장', ['데일리'], { size: '260', img: 'shoea-14' }],
    ['sh5', '블랙 레이스업 워커', '신발', '부츠', C('검정'), fw, '신발장', ['데일리', '데이트'], { size: '260', img: 'shoea-21' }],
    ['sh6', '블랙 홀스빗 로퍼', '신발', '로퍼', C('검정'), ['봄', '가을', '겨울'], '신발장', ['출근', '하객', '데이트'], { size: '260', img: 'shoea-24' }],
    ['sh7', '체커보드 슬립온', '신발', '슬립온', C('검정'), nw, '신발장', ['데일리', '여행'], { size: '260', img: 'shoea-34' }],
    ['sh8', '베이지 스웨이드 왈라비', '신발', '로퍼', C('베이지'), sf, '신발장', ['데일리', '데이트'], { size: '260', img: 'shoea-35' }],
    ['sh9', '실버 러닝화', '신발', '스니커즈', C('회색'), all, '신발장', ['운동', '여행'], { size: '260', img: 'shoea-42' }],
    ['sh10', '블랙 페니 로퍼', '신발', '로퍼', C('검정'), ['봄', '가을', '겨울'], '신발장', ['출근', '하객'], { size: '260', img: 'shoea-43' }],
    ['sh11', '블랙 8홀 부츠', '신발', '부츠', C('검정'), fw, '신발장', ['데일리'], { size: '260', img: 'shoea-44' }],
    ['sh12', '화이트 스타 스니커즈', '신발', '스니커즈', C('흰색'), all, '신발장', ['데일리', '데이트'], { size: '260', img: 'shoea-45' }],
    ['sh13', '화이트 레더 스니커즈', '신발', '스니커즈', C('흰색'), all, '신발장', ['데일리', '출근'], { size: '260', img: 'shoec-11' }],
    ['sh14', '그레이 러닝화', '신발', '스니커즈', C('회색'), all, '신발장', ['운동'], { size: '260', img: 'shoec-13' }],
    ['sh15', '화이트 블랙 러닝화', '신발', '스니커즈', C('흰색'), all, '신발장', ['운동', '여행'], { size: '260', img: 'shoec-17' }],
    ['sh16', '화이트 검솔 스니커즈', '신발', '스니커즈', C('흰색'), all, '신발장', ['데일리'], { size: '260', img: 'shoec-28' }],
    ['sh17', '브라운 페니 로퍼', '신발', '로퍼', C('갈색'), sf, '신발장', ['출근', '데이트'], { size: '260', img: 'shoec-35' }],
    ['sh18', '브라운 피셔맨 샌들', '신발', '샌들', C('갈색'), ['여름'], '신발장', ['데일리', '여행'], { size: '260', img: 'shoec-53' }],
    ['sh19', '블랙 버클 슬라이드', '신발', '샌들', C('검정'), ['여름'], '신발장', ['데일리'], { size: '260', img: 'shoec-58' }],
    ['sh20', '블랙 첼시 부츠', '신발', '부츠', C('검정'), fw, '신발장', ['데일리', '데이트'], { size: '260', img: 'shoec-64' }],
    ['sh21', '브라운 스웨이드 앵클부츠', '신발', '부츠', C('갈색'), fw, '신발장', ['데이트'], { size: '260', img: 'shoec-65' }],
    ['sh22', '블랙 스포츠 샌들', '신발', '샌들', C('검정'), ['여름'], '신발장', ['여행', '운동'], { size: '260', img: 'shoec-54' }],
    // 가방
    ['g1', '블랙 레더 브리프케이스', '가방', '토트백', C('검정'), all, '드레스룸', ['출근'], { size: 'FREE', img: 'bag-22' }],
    ['g2', '블랙 크로스백', '가방', '크로스백', C('검정'), all, '드레스룸', ['데일리', '여행'], { size: 'FREE', img: 'bag-35' }],
    ['g3', '블랙 백팩', '가방', '백팩', C('검정'), all, '드레스룸', ['데일리', '여행'], { size: 'FREE', img: 'bag-11' }],
    ['g4', '캔버스 토트백', '가방', '토트백', C('아이보리'), all, '드레스룸', ['데일리', '여행'], { size: 'FREE', img: 'bag-12' }],
    ['g5', '블랙 메신저백', '가방', '크로스백', C('검정'), all, '드레스룸', ['데일리', '출근'], { size: 'FREE', img: 'bag-13' }],
    ['g6', '브라운 레더 보스턴백', '가방', '더플백', C('갈색'), all, '드레스룸', ['여행', '데이트'], { size: 'FREE', img: 'bag-14' }],
    ['g7', '아이보리 호보백', '가방', '숄더백', C('아이보리'), all, '드레스룸', ['데이트', '하객'], { size: 'FREE', img: 'bag-15' }],
    ['g8', '블랙 호보백', '가방', '숄더백', C('검정'), all, '드레스룸', ['데이트', '출근'], { size: 'FREE', img: 'bag-24' }],
    ['g9', '블랙 웨이스트백', '가방', '힙색', C('검정'), all, '서랍장', ['여행', '운동'], { size: 'FREE', img: 'bag-25' }],
    ['g10', '베이지 캔버스 크로스백', '가방', '크로스백', C('베이지'), all, '드레스룸', ['데일리', '여행'], { size: 'FREE', img: 'bag-32' }],
    ['g12', '아이보리 하프문백', '가방', '숄더백', C('아이보리'), all, '드레스룸', ['데일리', '데이트'], { size: 'FREE', img: 'bag-42' }],
    ['g13', '블랙 데이팩', '가방', '백팩', C('검정'), all, '서랍장', ['데일리', '여행'], { size: 'FREE', img: 'bag-43' }],
    ['g14', '네이비 토트백', '가방', '토트백', C('네이비'), all, '드레스룸', ['출근', '데일리'], { size: 'FREE', img: 'bag-44' }],
    ['g15', '블랙 레더 백팩', '가방', '백팩', C('검정'), all, '드레스룸', ['데일리', '여행'], { size: 'FREE', img: 'bagb-21' }],
    ['g16', '블랙 나일론 카메라백', '가방', '크로스백', C('검정'), all, '드레스룸', ['데일리', '여행'], { size: 'FREE', img: 'bagb-33' }],
    // 모자
    ['h1', '베이지 볼캡', '모자', '볼캡', C('베이지'), nw, '서랍장', ['데일리', '여행'], { size: 'FREE', img: 'hatb-12' }],
    ['h2', '올리브 볼캡', '모자', '볼캡', C('카키'), nw, '서랍장', ['데일리', '여행'], { size: 'FREE', img: 'hatb-14' }],
    ['h3', '블랙 버킷햇', '모자', '버킷햇', C('검정'), nw, '서랍장', ['데일리', '여행'], { size: 'FREE', img: 'hatb-32' }],
    ['h4', '차콜 비니', '모자', '비니', '#4A4C52', fw, '서랍장', ['데일리'], { size: 'FREE', colorName: '회색', img: 'hatb-21' }],
    ['h5', '차콜 뉴스보이캡', '모자', '헌팅캡', '#4A4C52', fw, '서랍장', ['데이트'], { size: 'FREE', colorName: '회색', img: 'hatb-51' }],
    ['h6', '브라운 헌팅캡', '모자', '헌팅캡', C('갈색'), fw, '서랍장', ['데이트', '여행'], { size: 'FREE', img: 'hata-35' }],
    // 시계
    ['w1', '블랙 크로노그래프 시계', '시계', '메탈 시계', C('회색'), all, '서랍장', ['출근', '하객', '데이트'], { size: 'FREE', img: 'watch-14' }],
    ['w2', '블랙 다이버 시계', '시계', '메탈 시계', C('회색'), all, '서랍장', ['데일리', '여행'], { size: 'FREE', img: 'watch-41' }],
    ['w3', '블랙 디지털 시계', '시계', '전자시계', C('검정'), all, '서랍장', ['데일리', '운동'], { size: 'FREE', img: 'watch-43' }],
    // 가족: 형
    ['f4', '네이비 옥스포드 셔츠', '상의', '셔츠', C('네이비'), sf, '드레스룸', ['출근'], { owner: 'bro', size: 'L', img: 'top-14' }],
    ['t12', '차콜 포켓 티셔츠', '상의', '반팔 티셔츠', '#4A4C52', ['여름'], '서랍장', ['데일리', '여행'], { owner: 'bro', size: 'L', thickness: '얇음', colorName: '회색', img: 'top-33' }],
    ['b9', '그레이 스웨트 팬츠', '하의', '트레이닝', C('회색'), ['봄', '가을', '겨울'], '서랍장', ['운동', '데일리'], { owner: 'bro', size: 'L', img: 'bottom-22' }],
    ['f22', '블랙 러닝화', '신발', '스니커즈', C('검정'), all, '신발장', ['운동'], { owner: 'bro', size: '275', img: 'shoec-15' }],
    ['f23', '화이트 로우 스니커즈', '신발', '스니커즈', C('흰색'), all, '신발장', ['데일리'], { owner: 'bro', size: '275', img: 'shoec-24' }],
    ['f24', '블랙 워커 부츠', '신발', '부츠', C('검정'), fw, '신발장', ['데일리'], { owner: 'bro', size: '275', img: 'shoec-66' }],
    ['f25', '네이비 메쉬캡', '모자', '볼캡', C('네이비'), ss, '서랍장', ['운동'], { owner: 'bro', size: 'FREE', img: 'hatb-13' }],
    ['f26', '블랙 방울 비니', '모자', '비니', C('검정'), ['겨울'], '서랍장', ['데일리'], { owner: 'bro', size: 'FREE', img: 'hatb-23' }],
    ['f27', '블랙 디지털 손목시계', '시계', '전자시계', C('검정'), all, '서랍장', ['운동'], { owner: 'bro', size: 'FREE', img: 'watch-25' }],
    ['f15', '네이비 아웃도어 백팩', '가방', '백팩', C('네이비'), all, '안방 옷장', ['여행'], { owner: 'bro', size: 'FREE', img: 'bag-31' }],
    ['f16', '블랙 휠 더플백', '가방', '더플백', C('검정'), all, '안방 옷장', ['여행', '운동'], { owner: 'bro', size: 'FREE', img: 'bag-41' }],
    ['f17', '블랙 스포츠 더플백', '가방', '더플백', C('검정'), all, '안방 옷장', ['운동'], { owner: 'bro', size: 'FREE', img: 'bag-45' }],
    // 가족: 동생
    ['t10', '아이보리 니트 폴로', '상의', '반팔 티셔츠', C('아이보리'), ss, '드레스룸', ['데이트', '하객'], { owner: 'sis', size: 'S', thickness: '얇음', img: 'top-42' }],
    ['b7', '아이보리 이지 쇼츠', '하의', '반바지', C('아이보리'), ['여름'], '서랍장', ['여행', '데일리'], { owner: 'sis', size: 'S', thickness: '얇음', img: 'bottom-32' }],
    ['f30', '아이보리 메리제인', '신발', '플랫', C('아이보리'), nw, '신발장', ['데이트'], { owner: 'sis', size: '235', img: 'shoea-15' }],
    ['f31', '아이보리 발레 플랫', '신발', '플랫', C('아이보리'), nw, '신발장', ['데일리', '데이트'], { owner: 'sis', size: '235', img: 'shoea-22' }],
    ['f32', '핑크 러닝화', '신발', '스니커즈', C('분홍'), all, '신발장', ['데일리', '운동'], { owner: 'sis', size: '235', img: 'shoea-23' }],
    ['f33', '아이보리 미들 부츠', '신발', '부츠', C('아이보리'), fw, '신발장', ['데이트'], { owner: 'sis', size: '235', img: 'shoea-25' }],
    ['f34', '블랙 앵클 힐 부츠', '신발', '부츠', C('검정'), fw, '신발장', ['출근', '데이트'], { owner: 'sis', size: '235', img: 'shoea-32' }],
    ['f35', '블랙 스트랩 힐', '신발', '힐', C('검정'), ss, '신발장', ['하객', '파티'], { owner: 'sis', size: '235', img: 'shoea-41' }],
    ['f36', '아이보리 펌프스', '신발', '힐', C('아이보리'), sf, '신발장', ['하객', '출근'], { owner: 'sis', size: '235', img: 'shoeb-11' }],
    ['f37', '베이지 리본 플랫', '신발', '플랫', C('베이지'), ss, '신발장', ['출근', '데이트'], { owner: 'sis', size: '235', img: 'shoec-47' }],
    ['f38', '블랙 메리제인 플랫', '신발', '플랫', C('검정'), sf, '신발장', ['데일리'], { owner: 'sis', size: '235', img: 'shoeb-32' }],
    ['f39', '아이보리 롱부츠', '신발', '부츠', C('아이보리'), ['겨울'], '신발장', ['데이트'], { owner: 'sis', size: '235', img: 'shoeb-33' }],
    ['f40', '핑크 리본 플랫', '신발', '플랫', C('분홍'), ss, '신발장', ['데이트'], { owner: 'sis', size: '235', img: 'shoec-43' }],
    ['f41', '아이보리 스트랩 샌들', '신발', '샌들', C('아이보리'), ['여름'], '신발장', ['데이트', '여행'], { owner: 'sis', size: '235', img: 'shoec-51' }],
    ['f42', '아이보리 베레모', '모자', '베레모', C('아이보리'), fw, '서랍장', ['데이트'], { owner: 'sis', size: 'FREE', img: 'hatb-54' }],
    ['f43', '블랙 플로피햇', '모자', '썬햇', C('검정'), ss, '서랍장', ['여행', '데이트'], { owner: 'sis', size: 'FREE', img: 'hatb-43' }],
    ['f44', '아이보리 플리스 버킷햇', '모자', '버킷햇', C('아이보리'), ['겨울'], '서랍장', ['데일리'], { owner: 'sis', size: 'FREE', img: 'hatb-34' }],
    ['f45', '로즈골드 메탈 시계', '시계', '메탈 시계', '#E2B8A6', all, '서랍장', ['데이트', '하객'], { owner: 'sis', size: 'FREE', colorName: '분홍', img: 'watch-13' }],
    ['f46', '로즈골드 메쉬 시계', '시계', '메탈 시계', '#E2B8A6', all, '서랍장', ['출근'], { owner: 'sis', size: 'FREE', colorName: '분홍', img: 'watch-42' }],
    ['f47', '핑크 스마트워치', '시계', '스마트워치', C('분홍'), all, '서랍장', ['운동', '데일리'], { owner: 'sis', size: 'FREE', img: 'watch-21' }],
    ['f48', '아이보리 하트 숄더백', '가방', '숄더백', C('아이보리'), all, '드레스룸', ['데이트'], { owner: 'sis', size: 'FREE', img: 'bagb-11' }],
    ['f49', '라벤더 숄더백', '가방', '숄더백', C('보라'), ss, '드레스룸', ['데이트'], { owner: 'sis', size: 'FREE', img: 'bagb-13' }],
    ['f50', '아이보리 버킷백', '가방', '숄더백', C('아이보리'), all, '드레스룸', ['데일리'], { owner: 'sis', size: 'FREE', img: 'bagb-14' }],
    ['f51', '세이지 숄더백', '가방', '숄더백', '#9AA88E', all, '드레스룸', ['데일리'], { owner: 'sis', size: 'FREE', colorName: '초록', img: 'bagb-45' }],
    ['f18', '아이보리 캔버스 백팩', '가방', '백팩', C('아이보리'), all, '드레스룸', ['데일리', '여행'], { owner: 'sis', size: 'FREE', img: 'bag-23' }],
    ['f19', '블랙 레더 토트백', '가방', '토트백', C('검정'), all, '드레스룸', ['출근', '하객'], { owner: 'sis', size: 'FREE', img: 'bag-33' }],
    ['f20', '카키 버킷백', '가방', '숄더백', C('카키'), all, '드레스룸', ['데일리'], { owner: 'sis', size: 'FREE', img: 'bag-34' }],
    // 가족: 아빠
    ['t16', '그린 체크 셔츠', '상의', '셔츠', C('카키'), sf, '드레스룸', ['데일리', '여행'], { owner: 'dad', size: 'XL', img: 'top-45' }],
    ['b17', '베이지 코듀로이 팬츠', '하의', '면바지', C('베이지'), fw, '서랍장', ['데일리', '데이트'], { owner: 'dad', size: 'XL', thickness: '두꺼움', img: 'bottom-42' }],
    ['f60', '브라운 홀스빗 로퍼', '신발', '로퍼', C('갈색'), ['봄', '가을', '겨울'], '신발장', ['출근', '하객'], { owner: 'dad', size: '270', img: 'shoeb-31' }],
    ['f61', '블랙 페니 로퍼', '신발', '구두', C('검정'), all, '신발장', ['출근', '경조사'], { owner: 'dad', size: '270', img: 'shoec-34' }],
    ['f62', '블랙 레더 스니커즈', '신발', '스니커즈', C('검정'), all, '신발장', ['데일리'], { owner: 'dad', size: '270', img: 'shoec-25' }],
    ['f63', '버건디 태슬 로퍼', '신발', '로퍼', '#5A2A2A', sf, '신발장', ['출근'], { owner: 'dad', size: '270', colorName: '갈색', img: 'shoec-38' }],
    ['f64', '아이보리 페도라', '모자', '페도라', C('아이보리'), ss, '서랍장', ['여행'], { owner: 'dad', size: 'FREE', img: 'hata-52' }],
    ['f65', '그레이 헤링본 헌팅캡', '모자', '헌팅캡', C('회색'), fw, '서랍장', ['데일리'], { owner: 'dad', size: 'FREE', img: 'hata-42' }],
    ['f66', '투톤 크로노그래프 시계', '시계', '메탈 시계', '#D4B46A', all, '서랍장', ['출근', '하객'], { owner: 'dad', size: 'FREE', colorName: '노랑', img: 'watch-35' }],
    ['f67', '네이비 가죽 시계', '시계', '가죽 시계', C('네이비'), all, '서랍장', ['출근'], { owner: 'dad', size: 'FREE', img: 'watch-12' }],
    ['f21', '그린 캐리어', '가방', '캐리어', C('초록'), all, '드레스룸', ['여행'], { owner: 'dad', size: '20인치', img: 'bag-21' }],
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
    { id: 'c1', name: '출근 기본 코디', items: ['t3', 'b1', 'sh6', 'g1', 'w1'], virtual: [], date: day(1), fav: true, source: 'manual', tags: ['#오피스룩', '#출근'], sharedWith: [], from: null, createdAt: now - 1 * 864e5 },
    { id: 'c2', name: '주말 카페룩', items: ['t2', 'b3', 'sh1', 'g2'], virtual: [], date: day(3), fav: false, source: 'ai', tags: ['#데일리룩', '#카페'], sharedWith: [], from: null, createdAt: now - 3 * 864e5 },
    { id: 'c3', name: '봄 데이트룩', items: ['t5', 'b5', 'sh8', 'g7', 'h1'], virtual: [], date: day(6), fav: true, source: 'manual', tags: ['#데이트룩'], sharedWith: ['sis'], from: null, createdAt: now - 6 * 864e5 },
    { id: 'c4', name: '여행 편한 코디', items: ['t4', 'b4', 'sh3', 'g3', 'h3'], virtual: [], date: day(11), fav: false, source: 'ai', tags: ['#여행룩'], sharedWith: [], from: null, createdAt: now - 11 * 864e5 },
    { id: 'c5', name: '형이 골라준 코디', items: ['t1', 'b3', 'o8', 'sh12'], virtual: [], date: null, fav: false, source: 'shared', tags: ['#데일리룩'], sharedWith: [], from: 'bro', createdAt: now - 2 * 864e5 },
  ];
}

/* 코디SHOP(마켓) — 데모용 시드 (실사 이미지) */
const MARKET = {
  codis: [
    { id: 'm1', user: '민지', likes: 128, title: '가을 미니멀 코디', items: [
      { name: '크림 니트', cat: '상의', sub: '니트', color: '#F1EADB', img: 'top-21' }, { name: '차콜 슬랙스', cat: '하의', sub: '슬랙스', color: '#3F4045', img: 'bottom-44' },
      { name: '블랙 로퍼', cat: '신발', sub: '로퍼', color: '#1A1A1A', img: 'shoec-31' }, { name: '블랙 호보백', cat: '가방', sub: '숄더백', color: '#1A1A1A', img: 'bagb-41' }] },
    { id: 'm2', user: '지후', likes: 96, title: '데님 온 데님', items: [
      { name: '스트라이프 셔츠', cat: '상의', sub: '셔츠', color: '#8DAFD6', img: 'top-15' }, { name: '진청 와이드', cat: '하의', sub: '청바지', color: '#2F4A78', img: 'bottom-43' },
      { name: '화이트 스니커즈', cat: '신발', sub: '스니커즈', color: '#FFFFFF', img: 'shoec-21' }, { name: '데님 버킷햇', cat: '모자', sub: '버킷햇', color: '#8DAFD6', img: 'hatb-33' }] },
    { id: 'm3', user: '서연', likes: 211, title: '하객룩 정석', items: [
      { name: '니트 폴로', cat: '상의', sub: '반팔 티셔츠', color: '#F1EADB', img: 'top-42' }, { name: '베이지 슬랙스', cat: '하의', sub: '슬랙스', color: '#D9C2A0', img: 'bottom-13' },
      { name: '아이보리 펌프스', cat: '신발', sub: '힐', color: '#F1EADB', img: 'shoec-41' }, { name: '아이보리 체인백', cat: '가방', sub: '숄더백', color: '#F1EADB', img: 'bagb-34' }] },
    { id: 'm4', user: '도윤', likes: 74, title: '주말 스트릿', items: [
      { name: '그레이 후드', cat: '상의', sub: '후드', color: '#9CA3AF', img: 'top-13' }, { name: '블랙 조거', cat: '하의', sub: '트레이닝', color: '#1A1A1A', img: 'bottom-21' },
      { name: '블랙 볼캡', cat: '모자', sub: '볼캡', color: '#1A1A1A', img: 'hatb-11' }, { name: '블랙 하이탑', cat: '신발', sub: '스니커즈', color: '#1A1A1A', img: 'shoec-22' }] },
  ],
  used: [
    { id: 'u1', name: '브라운 미들 부츠', cat: '신발', sub: '부츠', color: '#7A4E2D', img: 'shoec-62', price: 45000, seller: '옷장정리중', cond: '상태 좋음 · 2회 착용' },
    { id: 'u2', name: '브라운 호보백', cat: '가방', sub: '숄더백', color: '#7A4E2D', img: 'bagb-31', price: 32000, seller: '하늘바다', cond: '거의 새것' },
    { id: 'u3', name: '브라운 울 페도라', cat: '모자', sub: '페도라', color: '#7A4E2D', img: 'hatb-42', price: 18000, seller: '모자왕', cond: '사이즈 58' },
    { id: 'u4', name: '올리브 필드 워치', cat: '시계', sub: '가죽 시계', color: '#6B6B3A', img: 'watch-22', price: 52000, seller: '정리왕', cond: '사용감 적음' },
  ],
  fresh: [
    { id: 'n1', brand: 'AREA BASIC', name: '화이트 레더 스니커즈', cat: '신발', sub: '스니커즈', color: '#FFFFFF', img: 'shoeb-22', price: 69000 },
    { id: 'n2', brand: 'AREA BASIC', name: '베이지 러닝화', cat: '신발', sub: '스니커즈', color: '#D9C2A0', img: 'shoec-16', price: 89000 },
    { id: 'n3', brand: 'MOOD', name: '아이보리 홀스빗 로퍼', cat: '신발', sub: '로퍼', color: '#F1EADB', img: 'shoec-33', price: 79000 },
    { id: 'n4', brand: 'MOOD', name: '세이지 발레 플랫', cat: '신발', sub: '플랫', color: '#9AA88E', img: 'shoec-48', price: 59000 },
    { id: 'n5', brand: 'NORDIC', name: '스카이 미니 백팩', cat: '가방', sub: '백팩', color: '#9EC1E6', img: 'bagb-25', price: 99000 },
    { id: 'n6', brand: 'AREA BASIC', name: '그레이 케이블 비니', cat: '모자', sub: '비니', color: '#9CA3AF', img: 'hatb-25', price: 29000 },
    { id: 'n7', brand: 'TIMELINE', name: '스카이 다이얼 메탈 시계', cat: '시계', sub: '메탈 시계', color: '#C0C4CC', img: 'watch-31', price: 189000 },
    { id: 'n8', brand: 'TIMELINE', name: '스퀘어 가죽 시계', cat: '시계', sub: '가죽 시계', color: '#7A4E2D', img: 'watch-15', price: 159000 },
  ],
};

const GENDERS = ['여성', '남성'];
const ORDER_TABS = ['전체', '구매', '환불', '취소'];

/* 메시지함 — 데모용 대화 */
function seedMessages() {
  const now = Date.now();
  return [
    { id: 'ms1', with: '옷장정리중', about: '울 블렌드 코트', at: now - 26 * 36e5, unread: true, msgs: [
      { me: true, text: '코트 아직 판매 중인가요? 어깨 너비가 궁금해요.', at: now - 27 * 36e5 },
      { me: false, text: '네 판매 중이에요! 어깨 46cm, 총장 105cm예요.', at: now - 26 * 36e5 },
    ] },
    { id: 'ms2', with: 'area 고객센터', about: '가입 환영', at: now - 5 * 864e5, msgs: [
      { me: false, text: 'area에 오신 걸 환영해요! 옷을 등록하면 매일 날씨에 맞는 코디를 추천해 드려요.', at: now - 5 * 864e5 },
    ] },
  ];
}

/* 옷장 '오늘의 추천' 광고 자리 — 노출 순서에 따라 광고비 차등 */
const AD_SLOTS = [
  { slot: 1, fee: '월 120만원', desc: '첫 화면 첫 번째' },
  { slot: 2, fee: '월 80만원', desc: '두 번째' },
  { slot: 3, fee: '월 50만원', desc: '세 번째' },
];
const PARTNER_ADS = [
  { id: 'ad1', slot: 1, mall: 'MOOD', prod: 'n3', copy: '가을 로퍼 기획전 최대 30%' },
  { id: 'ad2', slot: 2, mall: 'TIMELINE', prod: 'n7', copy: '첫 구매 시계 스트랩 증정' },
  { id: 'ad3', slot: 3, mall: 'NORDIC', prod: 'n5', copy: '신상 백팩 무료배송' },
  { id: 'ad4', mall: 'AREA BASIC', prod: 'n1', copy: '매일 신는 기본 스니커즈' },
  { id: 'ad5', mall: 'AREA BASIC', prod: 'n6', copy: '겨울 준비 니트 비니' },
  { id: 'ad6', mall: 'MOOD', prod: 'n4', copy: '세이지 컬러 한정' },
  { id: 'ad7', mall: 'TIMELINE', prod: 'n8', copy: '데일리 가죽 시계' },
];

/* 내가 올린 판매 상품 · 문의 — 데모용 */
function seedSales() {
  const now = Date.now();
  return [
    { itemId: 'g6', price: 38000, createdAt: now - 4 * 864e5, desc: '두세 번 사용했어요. 모서리 까짐 없어요.' },
    { itemId: 'sh7', price: 22000, createdAt: now - 2 * 864e5, desc: '사이즈 260, 깔창 교체했어요.' },
  ];
}
function seedSaleChats() {
  const now = Date.now(), h = 36e5;
  const t = (id, w, about, txt, ago, unread) => ({ id, with: w, about, sale: true, at: now - ago * h, unread, msgs: [{ me: false, text: txt, at: now - ago * h }] });
  return [
    t('sc1', '보리맘', '브라운 레더 보스턴백', '보스턴백 아직 있나요? 직거래 가능할까요?', 3, true),
    t('sc2', '민트초코', '브라운 레더 보스턴백', '혹시 35,000원에 가능할까요?', 9, false),
    t('sc3', '여행가자', '브라운 레더 보스턴백', '내부 사진도 볼 수 있을까요?', 20, false),
    t('sc4', '하늘바다', '브라운 레더 보스턴백', '택배 거래도 되나요?', 40, false),
    t('sc5', '스케이터', '체커보드 슬립온', '실착 몇 번 하셨어요?', 5, true),
  ];
}
