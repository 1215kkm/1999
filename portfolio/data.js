/* 수정 기록 데이터 — 차수(round)마다 화면별로 [수정 전 · 요청 · 수정 후]
   before/after: 버전 폴더(v/0 = 초기, v/1 = 1차 후, v/2 = 2차 후 …), route = 앱 화면, setup = 그 화면을 연 뒤 실행할 코드 */
const ROUNDS = [
  {
    n: 1, date: '2026.10.20', title: '1차 수정', from: 0, to: 1,
    summary: '첫 시안을 직접 써 보고 받은 피드백 35개 + 하단 메뉴 · 실사 이미지 요청을 반영했어요.',
    rows: [
      { id: 'home', page: '홈', route: 'home', prompts: ['홈화면은 맨상단에 전체, 상의, 하의, 아우터 수를 보여주고 그아래부터는 한줄에 7개 의류만 가득보이게 해줘', '상단 전체·상의·하의·아우터는 처음에 숨겨주고 화면을 아래로 쓸면 나타나게', '로고옆에 정렬버튼으로 볼수있는 개수 정할수 있게, 두손가락으로 확대·축소하면 정렬수가 줄거나 늘게 (아이폰 갤러리처럼)'] },
      { id: 'dock', page: '하단 독바', route: 'home', after: 'A.navShow()', prompts: ['하단 독바에서 등록버튼을 라운드사각형으로, 배경은 글라스효과에 선택한메뉴는 배경진하게, 등록버튼은 아이콘만', '독바는 숨기고 진한 가운데 선으로 표시, 화면을 아래로 쓸면 나타나게', '등록버튼 +표시 빼고 살짝 위로, 테두리의 무지개색이 살짝 묻어나게 · 애니메이션으로 색이 움직이게'] },
      { id: 'closet', page: '옷장', route: 'closet', prompts: ['홈화면에 있는 내용들을 옷장에 적용, 가족이 보낸 코디가 있으면 상단에 보여주고 꺼도 마이페이지에서 다시 볼 수 있게', '우측상단 선택버튼 빼고, 추천코디더보기 영역은 일단 숨김, 색상 검색은 상세 옵션으로', '즐겨찾기 하트를 우측상단으로 조금 크게', '화면 밖 탭을 눌러도 맨 왼쪽으로 돌아가지 않게, 추가버튼은 우측에 고정'] },
      { id: 'item', page: '옷 상세', route: 'closet', setup: "A.openItem('t2')", prompts: ['옷 선택하면 올라오는 창이 잘 안 내려감 — 모달배경 터치, 상단 손잡이(–)를 아래로 드래그하거나 터치하면 내려가게'] },
      { id: 'board', page: '코디 조합 이미지', route: 'ai', setup: "document.querySelector('#aiGrid').scrollIntoView()", prompts: ['코디조합은 위아래말고 이미지처럼 (상의 왼쪽 위 · 하의 오른쪽 · 가방 왼쪽 아래 · 신발 오른쪽 아래)', '사진(상하복) 비율이 달라서 밸런스가 좋지 않음, 위에는 상의 아래는 삐딱한 하의'] },
      { id: 'ai', page: 'AI 코디', route: 'ai', prompts: ['맨상단 날씨부분을 메인처럼 우측상단 작게', 'AI 추천코디를 끄면 추천코디 미리보기 영역이 직접코디 화면으로', '고정할 옷처럼 제외할 옷 선택도'] },
      { id: 'weather', page: '날씨', route: 'ai', setup: 'A.weatherSheet()', prompts: ['날씨를 클릭하면 온도조절버튼은 빼고, 최대 10일 뒤 날씨예보에 맞는 옷으로 AI코디페이지에 적용'] },
      { id: 'manual', page: '직접 조합', route: 'manual', setup: { 0: "manualPreload(['t3','b1','s2']); render()", 1: "manualPreload(['t3','b1','sh6','g1']); render()" }, prompts: ['상단 봄·여름·가을·겨울은 빼고, 날씨는 우측상단으로', '예식장·카페·데이트 등 분류는 코디완료 눌렀을 때 적는 정보로', '상의·하의 등 버튼은 위로, 우측 옷 목록만 스크롤 · 상단메뉴와 좌측 코디는 고정', '엄마 옷 버튼이 잘려서 슬라이드가 안 됨'] },
      { id: 'shop', page: '코디북 · SHOP', route: 'codibook', setup: { 0: "A.cbTab('둘러보기')", 1: "A.cbTab('코디SHOP')" }, prompts: ['둘러보기를 ‘코디SHOP’으로', '사고싶다고 요청 보내는 것 취소도 되게', '구매하기에서 주소 적을 때 배송받기와 선물하기 나눠서'] },
      { id: 'history', page: '코디 히스토리', route: 'history', setup: "ui.hist.view = 'cal'; render()", prompts: ['코디히스토리 달력에 숫자가 옷이미지에 가려짐'] },
      { id: 'reg', page: '새 옷 등록', route: 'regForm', setup: { 0: 'ui.reg = newDraft(); render()', 1: 'ui.reg = newDraft(); A.regDetailT()' }, prompts: ['맨아래 상세정보 입력이 중복 — 정리하고, 새창 말고 아래로 펼쳐지게, 상세정보인 게 티나게', '우측상단 닫기버튼을 화면에 고정', '옷촬영할 때 16:9, 9:16 빼고 그냥 찍을 수 있게'] },
      { id: 'my', page: '마이페이지', route: 'my', prompts: ['프로필사진 누르면 마이페이지 — 요청내역, 거래내역(구매·환불·취소), 메시지, 사진설정', '가족옷장은 개인이 추가하는 게 아니라 가족이 공유하면 보이게', '내가 보낸 코디도 나와서 수정·취소·삭제, 아빠 옷장에서 코디해서 아빠한테 보내기', '내 성별 선택'] },
      { id: 'photo', page: '실사 이미지', route: 'closet', setup: "A.closetCat('신발'); document.querySelector('#closetResults').scrollIntoView()", prompts: ['신발이미지 3, 모자 2, 가방 1, 시계 실사이미지를 보낼게 적용해주고 가짜 이미지는 빼줘'] },
      { id: 'all', page: '전체 분위기', route: 'closet', setup: "document.querySelector('#closetResults').scrollIntoView()", prompts: ['기본글씨는 16, 보조글자는 14로', '전체적으로 터치 효과가 없어서 딱딱함, 뽈롱뽈롱 느낌', '스크린 화면 올릴 때 하단 바가 같이 올라가서 불편함'] },
    ],
  },
  {
    n: 2, date: '2026.10.21', title: '2차 수정', from: 1, to: 2,
    summary: '1차 결과물을 다시 써 보고 받은 피드백 50여 개 — 깜빡임 · 부드러운 움직임 · 쇼핑/거래 흐름을 다듬었어요.',
    rows: [
      { id: 'home', page: '홈', route: 'home', prompts: ['확대·축소할 때 부드럽게', '가방사진이 잘려보이는 게 있음 — 제품 잘리지 않게', '우측상단 날씨에 오늘, 내일, 날짜와 요일 표시'] },
      { id: 'dock', page: '하단 독바', route: 'closet', prompts: ['메인에서 하단 검은선(독바) 터치하면 독바 보이고 아래로 쓸면 다시 한줄, 메인만 그렇게 · 다른 페이지는 항상 보이게', '새옷등록 버튼 테두리 조금 더 두껍게 (색 돌아가는 게 얇아서 안 보임)', '독바 메뉴 선택 시 배경표시가 부드럽게 이동되는 효과'] },
      { id: 'closet', page: '옷장', route: 'closet', prompts: ['‘오늘의 추천’은 제휴된 쇼핑몰 랜덤 또는 광고자리로, 보이는 순서에 따라 가격 차등', '상세옵션의 소유자를 클릭하면 화면위치가 계속 바뀜', '옷 목록도 메인처럼 손가락으로 부드럽게 확대·축소', '즐겨찾기 하트 클릭하면 목록이 깜빡임'] },
      { id: 'bell', page: '알림', route: 'closet', after: 'A.bellOpen()', prompts: ['상단 가족이 보낸 코디를 빼고, 가족이 코디를 보내면 화면상단 알림종 아이콘 딸랑딸랑, 누르면 작은 팝업, 터치하면 그 페이지로'] },
      { id: 'item', page: '옷 상세', route: 'closet', setup: "A.openItem('t2')", prompts: ['상세정보 화면에서 위치(예: 서랍장)를 클릭해서 수정, 상태도 클릭해서 수정, 바로 아래 상태변경 영역은 빼기'] },
      { id: 'guide', page: '촬영 가이드', route: 'regForm', setup: 'ui.reg = newDraft(); render(); A.guideSheet()', prompts: ['‘누끼가 잘 따지는 촬영가이드’를 샘플 이미지 형식으로 — 지금은 글이 너무 많음', '대표색상을 내 옷장 상세옵션 색상과 동기화'] },
      { id: 'ai', page: 'AI 코디', route: 'ai', setup: { 1: "ui.ai.fixed = ['t1', 't3']; genAI(); render()", 2: "ui.ai.fixed = ['t1', 't3']; ui.ai.dirty = true; render()" }, prompts: ['고정할 옷·제외할 옷 선택 후 ‘AI 추천 보기’ 버튼 → 그럴듯한 로딩효과, 아래에 그럴듯하게 나타나게', '고정할 옷 상의 두 개 이상 선택하면 AI가 한 개만 추천함', '여러 벌 선택 후 썸네일 크기가 제각각', '고정·제외할 옷 선택할 때, 탭메뉴 터치할 때 깜빡임'] },
      { id: 'model', page: 'AI 코디 · 모델', route: 'ai', setup: { 1: "document.querySelector('#aiGrid').scrollIntoView()", 2: "A.modelPick('mdl-w'); closeAllSheets(); document.querySelector('#aiGrid').scrollIntoView()" }, prompts: ['모델사진 사용하기 — 촬영사진 등록(여러 개) 또는 등록된 가상모델 사진에 입혀진 모습 보여주기', '추천코디 미리보기 보는 개수 필터도 3개로', '좌우로 넘길 때 중간에 멈추는 현상', '정장을 골랐는데 운동용 바지가 나옴'] },
      { id: 'manual', page: '직접 조합', route: 'ai', setup: { 1: "ui.ai.aiExtra = false; manualPreload(['t3','b1','sh6','g1']); render(); document.querySelector('#screen .scroll').scrollTop = 99999", 2: "ui.ai.aiExtra = false; manualPreload(['t3','b1','sh6','g1']); render(); document.querySelector('#screen .scroll').scrollTop = 99999" }, prompts: ['스크롤 내려서 ‘직접조합하기’ 제목이 화면 상단에 닿으면 고정, 탭메뉴·좌측 미리보기도 고정, 우측 옷 목록만 스크롤 + 스크롤바', '좌측 미리보기에 크게보기 아이콘 → 우측 목록 한 줄에 한 개, 미리보기 더 크게', '‘전체화면’ 버튼은 빼기', '코디 만들 때 옷 위치를 움직여서 저장'] },
      { id: 'book', page: '코디북', route: 'codibook', setup: { 1: '', 2: 'A.cbManual()' }, prompts: ['직접조합은 조합된 목록이 보이고 작게 ‘조합하기’ 버튼', '가족옷 섞어입기 — 내옷·형옷 등 분류 터치하면 화면이 아래에서 위로 부드럽게, 누구 옷인지 눈에 띄게', '2개만 코디할 수 있는데 더 추가할 수 있게'] },
      { id: 'shop', page: '코디SHOP', route: 'codibook', setup: { 1: "A.cbTab('코디SHOP')", 2: "A.cbTab('코디SHOP')" }, prompts: ['다른 사람 코디를 한 화면에 2.3개 보이게 해서 옆에 더 있음을 알리기', '‘이 옷 저한테 팔 수 있나요’를 ‘거래문의’로, 누르면 메시지', '개인판매 → ‘내가 올린 코디’, 내 상품만, 썸네일 아래 문의한 사람 프로필 3개', '하트 작동 안 됨, 거래문의 버튼 정렬 안 맞음'] },
      { id: 'prod', page: '상품 상세', route: 'codibook', setup: { 1: "A.cbTab('코디SHOP'); document.querySelectorAll('.market-zone')[0].scrollIntoView()", 2: "A.cbTab('코디SHOP'); A.openProd('sale|g6')" }, prompts: ['각 상품 클릭해서 상세설명 화면이 부드럽게 우측에서 나오게', '상세 안에서 판매수정·판매취소 버튼을 아이콘으로', '메시지 보내면 자동답변 안 나오게, 읽었는지 안 읽었는지 표시'] },
      { id: 'my', page: '마이페이지', route: 'my', setup: "document.querySelector('.fam-list').scrollIntoView()", prompts: ['성별 ‘선택안함’ 빼고, 하단메뉴 설정 빼기', '공유받은 가족옷장 → 그 옷장 화면에 나가기 화살표, 가족별 AI코디 추천 버튼', '구매요청·메시지는 최근 3개 + 더보기 → 최근 1년·2년 탭', '전체삭제 버튼은 확인 단어를 써야 지워지게, 모든 삭제 버튼에 확인'] },
    ],
  },
  {
    n: 3, date: '2026.10.21', title: '3차 수정', from: 2, to: 3,
    summary: '2차 결과물을 쓰면서 눈에 걸린 작은 불편 3가지를 다듬었어요.',
    rows: [
      { id: 'ad', page: '옷장 · 오늘의 추천', route: 'closet', setup: "const t = document.querySelector('#heroTrack'); t.scrollLeft = 4 * t.clientWidth", prompts: ['오늘의 추천쪽에 슬라이드하다가 높은 이미지가 있으면 영역 높이가 높아짐 — 모두 같게, 이미지 높이는 하나로 통일'] },
      { id: 'share', page: '추천 코디 상세', route: 'ai', setup: "A.openAIRec(0); setTimeout(() => document.querySelector('#detInfo').scrollIntoView(), 100)", prompts: ['추천코디 보다가 가족공유하기 버튼 눌러서 공유할 수 있게'] },
      { id: 'wipe', page: '마이페이지', route: 'my', setup: "document.querySelector('[data-act=wipeAll]').scrollIntoView({ block: 'center' })", prompts: ['옷 · 코디 · 설정 전체 삭제를 빨강 말고 다른 글자처럼 색을 바꿔줘'] },
    ],
  },
  {
    n: 4, date: '2026.10.21', title: '4차 수정', from: 3, to: 4,
    summary: 'AI 추천 버튼을 항상 쓸 수 있게 하고, 가족 옷장으로 받은 코디를 그 가족에게 바로 보내는 흐름을 만들었어요.',
    rows: [
      { id: 'aibtn', page: 'AI 코디', route: 'ai', setup: "document.querySelector('[data-act=aiPickExclude]').scrollIntoView({ block: 'start' })", prompts: ['고정할 옷, 제외할 옷을 선택 안 해도 AI추천보기 버튼은 보여야 하고 작동돼야 해'] },
      { id: 'famlist', page: '가족 AI 코디 · 목록', route: 'ai', setup: "A.famAI('bro'); setTimeout(() => document.querySelector('#aiGrid').scrollIntoView(), 120)", prompts: ['마이페이지 형 - AI 코디 누르면 형의 옷장에서 코디를 해주는데, 추천코디 목록에도 ‘형한테 공유하기’ 버튼'] },
      { id: 'famdetail', page: '가족 AI 코디 · 완성', route: 'ai', setup: "A.famAI('bro'); setTimeout(() => { A.openAIRec(0); setTimeout(() => document.querySelector('#detInfo').scrollIntoView(), 150); }, 120)", prompts: ['코디 완성 후에도 형한테 바로 공유하기 버튼 기능이 있어야 해'] },
    ],
  },
  {
    n: 5, date: '2026.10.21', title: '5차 수정', from: 4, to: 5,
    summary: '가족 옷 섞어입기에서 옷을 고르는 창이 비어 보이던 오류를 고쳤어요.',
    rows: [
      { id: 'mixpick', page: '가족 옷 섞어입기 · 옷 선택', route: 'codibook', setup: "document.querySelectorAll('.mix-slot')[0].click()", prompts: ['코디북 - 가족옷 섞어입기에서 옷선택 + 추가버튼 누르면 옷선택하기 화면에서 옷이 기본적으로 아무것도 안 뜨고 있음, 떠야 함'] },
    ],
  },
  {
    n: 6, date: '2026.10.21', title: '6차 수정', from: 5, to: 6,
    summary: '홈 상단 정렬 아이콘이 고르는 열 수를 2 · 3 · 5칸으로 바꿨어요.',
    rows: [
      { id: 'homecols', page: '홈 · 정렬 아이콘', route: 'home', after: "A.homeColsSet('2')", prompts: ['메인 상단에 정렬 아이콘 누르면 차례대로 한 줄에 2칸, 3칸, 5칸으로 보이게'] },
    ],
  },
  {
    n: 7, date: '2026.10.21', title: '7차 수정', from: 6, to: 7,
    summary: '내 옷장의 정렬 기능을 홈과 같은 2 · 3 · 5칸으로 맞추고, 바뀔 때 부드럽게 움직이게 했어요.',
    rows: [
      { id: 'closetcols', page: '옷장 · 정렬', route: 'closet', setup: "document.querySelector('.toolbar').scrollIntoView()", prompts: ['내 옷장의 정렬 기능도 홈처럼 맞춰주고 홈처럼 부드럽게 효과줘'] },
    ],
  },
  {
    n: 8, date: '2026.10.21', title: '8차 수정', from: 7, to: 8,
    summary: '전체 여백과 섹션 배경색을 다듬어 화면이 덜 빽빽하고 구역이 더 잘 보이게 했어요.',
    rows: [
      { id: 'space-ai', page: 'AI 코디 · 여백', route: 'ai', prompts: ['상단 제목 아래 패딩을 20으로 모두 수정', '각 화면들의 섹션 간격을 12에서 20으로 모두 수정'] },
      { id: 'space-closet', page: '옷장 · 배경색', route: 'closet', prompts: ['각 섹션의 배경색이 너무 연한데 아주 살짝만 진하게 (예: #f3f5f9 → #edf0f7)'] },
    ],
  },
  {
    n: 9, date: '2026.10.21', title: '9차 수정', from: 8, to: 9,
    summary: '내가 올린 상품에 문의한 사람들과의 대화를 좌우로 밀어서 바로 이어 볼 수 있게 했어요.',
    rows: [
      { id: 'thread', page: '코디SHOP · 문의 대화', route: 'codibook', setup: "A.cbTab('코디SHOP'); document.querySelector('.inq-av').click()", prompts: ['코디북 - 내가 올린 코디 - 대화한 사람들 클릭해서 나온 대화창에서 좌우 슬라이드로 다른 사람과 바로 이어서 대화 가능하게'] },
    ],
  },
  {
    n: 10, date: '2026.10.21', title: '10차 수정', from: 9, to: 10,
    summary: '내가 올린 코디에 정렬을 넣고, 새로 올린 상품이 바로 보이지 않던 오류와 거래문의 중 표시를 고쳤어요.',
    rows: [
      { id: 'salesort', page: '코디SHOP · 내가 올린 코디', route: 'codibook', setup: "A.cbTab('코디SHOP'); document.querySelector('.market-zone').scrollIntoView()", prompts: ['내가 올린 코디에 최신 등록순, 최신 대화순, 최다 조회순 정렬 버튼', '새로 등록하면 바로 안 뜨고 새로고침해야 뜸'] },
      { id: 'asking', page: '코디SHOP · 거래문의 중', route: 'codibook', setup: "A.cbTab('코디SHOP'); A.codiAsk('m1'); closeAllSheets()", prompts: ['거래문의 중 색상 티나게 바꿔줘'] },
    ],
  },
];
