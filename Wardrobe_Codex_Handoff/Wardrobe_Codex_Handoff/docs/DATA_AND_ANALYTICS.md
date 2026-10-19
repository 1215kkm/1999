# 데이터와 통계 초기 계약
아래는 구현을 위한 초안이다. 실제 SQL migration은 아직 없다.

## 주요 엔터티
- profiles: user_id, locale, timezone, preferences, consent_versions
- locations: id, owner_id, parent_id, name, version
- items: id, owner_id, location_id, category, colors, seasons, status, ownership, price/ currency(optional), version, deleted_at
- item_images: item_id, storage_path, kind(original/cutout/thumbnail), checksum
- outfits/outfit_items: owner_id, item_ids, layers, fixed_item_ids, occasion
- wear_logs: user_id, outfit_id, local_date, confirmed_at; 중복 착용 확정 방지
- ai_jobs: owner_id, kind, status, input_refs, model_version, settings_hash, attempts, error_code
- events/daily_metrics/acquisition: 이벤트와 집계 분리
- family_shares/loans: 후속 단계, 기본 개인 옷장과 권한 분리

## 상태
옷: available / laundry / lent / archived. 소유 구분: owned / wishlist.
AI: queued / processing / succeeded / failed / cancelled. 중복 요청 idempotency key 사용.
시간은 서버 UTC 저장, 착용 날짜와 통계는 사용자/운영 시간대 기준을 명시한다. 다른 통화를 환율 확인 없이 합산하지 않는다.

## 권한
개인 테이블 owner_id 기반 RLS. Storage도 동일한 소유 권한을 적용하고 공개 URL로 얼굴/원본 사진을 노출하지 않는다. 관리자 역할은 서버가 검증한다. worker는 허가된 job만 가져와 입력 이미지를 제한적으로 읽는다. 권한 상승 키는 앱/확장에 포함하지 않는다.

## 이벤트
app_open, sign_up_completed, item_upload_started, item_created, background_remove_completed, outfit_requested, outfit_saved, wear_confirmed, share_opened, tryon_requested, tryon_completed, sync_failed.
공통: event_id, event_name, occurred_at, received_at, anonymous_id, user_id(nullable), session_id, platform, app_version, source, medium, campaign, properties.
event_id 중복 제거. 서버에서 확인 가능한 성공은 서버 성공 뒤 기록. share_opened는 SNS 실제 게시 완료가 아니다.

## 대시보드
기간·국가·플랫폼·버전·채널·신규/기존 필터. DAU/WAU/MAU, 가입, 첫 옷 등록, 10벌 등록, 첫 코디 저장, 착용 확정, D1/D7/D30 재방문, 최근 5분 활동 사용자, AI 대기열/실패율/지연 p50·p95, 업로드/동기화 오류, DB/파일/트래픽 한도.
퍼널 분모와 기간을 표시한다. 코호트 D1은 가입일 다음 달력일 활동으로 정의하는 등 계산 기준을 문서화한다. 결제 전에는 매출을 미연결로 표시한다.

## 유입
utm_source/medium/campaign/content, 최초 유입, 최근 비직접 유입, referrer를 구분한다. 민감한 쿼리 전체를 저장하지 않는다. 웹→앱스토어→설치 과정은 자동 연계되지 않을 수 있다. 확인되지 않은 출처는 unknown. 추천 코드/설문은 관측한 추적값과 구분한다.

## 보관
원시 이벤트 초기 30일 제안, 일별 집계 별도. 실제 보관 기간은 개인정보 정책과 함께 확정한다. 사진/토큰/비밀번호/개인 메모는 로그 제외. 샘플 데이터 제외 필터. 모든 클릭을 저장하지 않아 무료 DB가 로그로 차지 않게 한다.
