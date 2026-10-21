# area 날씨 서버 설정 (기상청 API)

앱이 기상청 API를 바로 부르지 않고, 이 작은 서버(Cloudflare Worker)를 거쳐 부르는 이유는 두 가지예요.

- 인증키가 앱 코드에 드러나지 않게 숨기려고
- 기상청 API는 웹 브라우저에서 바로 부를 수 없어서 (CORS 막힘)

한국은 **기상청**, 해외는 **MET Norway**(무료, 상업 사용 가능) 예보를 써요. 30분 동안 캐시해서 기상청 하루 호출 한도(1만 회)를 아껴요.

## 1. 기상청 인증키 받기 (공공데이터포털, 무료)
1. https://www.data.go.kr 에 회원가입하고 로그인해요.
2. 다음 두 서비스를 검색해서 각각 **[활용신청]** 해요. 자동 승인돼요.
   - `기상청_단기예보 ((구)_동네예보) 조회서비스`: 오늘~3일 뒤 예보와 지금 날씨
   - `기상청_중기예보 조회서비스`: 4~10일 뒤 예보
3. 활용 목적은 "날씨 맞춤 코디 추천 앱"처럼 적으면 돼요.
4. 마이페이지 → 데이터 활용 → **일반 인증키 (Decoding)** 를 복사해요.
   - 승인 직후에는 키가 동작하기까지 1~2시간 걸릴 수 있어요.
   - 개발계정은 하루 1만 회까지 호출할 수 있어요. 이용자가 많아지면 '활용사례 등록'으로 운영계정을 신청하면 한도가 늘어나요.

## 2. Cloudflare Worker 만들기 (무료: 하루 10만 회)
1. https://dash.cloudflare.com 에 가입해요.
2. **Workers & Pages → Create → Create Worker** 를 눌러요. 이름은 `area-weather` 로 정하고 Deploy 해요.
3. **Edit code** 를 누르고, 이 폴더의 `weather-worker.js` 내용을 전부 붙여 넣은 다음 **Deploy** 해요.
4. **Settings → Variables and Secrets** 에서 다음 세 가지를 추가해요.

   | 이름 | 종류 | 값 |
   |---|---|---|
   | `KMA_KEY` | **Secret** | 1단계에서 복사한 Decoding 인증키 |
   | `CONTACT` | Text | 연락받을 이메일 (MET Norway 이용 규칙) |
   | `ORIGINS` | Text | `https://1215kkm.github.io` (나중에 도메인을 바꾸면 그 주소) |

5. 브라우저에서 아래 주소를 열어 확인해요. 결과에 `"source":"기상청"` 이 보이면 성공이에요.

   `https://area-weather.<내계정>.workers.dev/?lat=37.5665&lon=126.978`

## 3. 앱에 연결
Worker 주소를 알려 주면, 개발 쪽에서 `js/engine.js` 의 `WEATHER_API` 에 넣고 배포해요.
주소를 넣기 전까지 앱은 테스트용 Open-Meteo 예보를 써요(비상업용).

## 출처 표기
앱의 날씨 창 아래에 `출처: 기상청`, `출처: MET Norway` 가 자동으로 표시돼요.
- 기상청: 공공누리 출처표시
- MET Norway: CC BY 4.0
