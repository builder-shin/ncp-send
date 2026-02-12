# @builder-shin/ncp-send

NCP(Naver Cloud Platform)의 SENS(SMS/알림톡) 및 Cloud Outbound Mailer(이메일) API를 래핑하는 TypeScript npm 패키지입니다.

[![npm version](https://img.shields.io/npm/v/@builder-shin/ncp-send.svg)](https://www.npmjs.com/package/@builder-shin/ncp-send)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 특징

- **Zero Dependencies**: Node.js 내장 fetch와 crypto만 사용
- **TypeScript 완전 지원**: 모든 타입 정의 포함
- **ESM + CJS 듀얼 빌드**: 다양한 환경에서 사용 가능
- **Gov/Standard 환경 지원**: isGov 옵션으로 손쉽게 전환
- **완전한 API 커버리지**: SMS, LMS, MMS, 알림톡, 이메일 발송 지원

## 설치

```bash
npm install @builder-shin/ncp-send
```

**요구사항**: Node.js >= 18

## 빠른 시작

```typescript
import { NcpSend } from '@builder-shin/ncp-send';

// 클라이언트 초기화
const client = new NcpSend({
  accessKey: 'YOUR_ACCESS_KEY',
  secretKey: 'YOUR_SECRET_KEY',
  smsServiceId: 'YOUR_SMS_SERVICE_ID',
  alimtalkServiceId: 'YOUR_ALIMTALK_SERVICE_ID',
  isGov: true, // Gov 환경 사용 시 (기본값: false)
});

// SMS 발송
const smsResult = await client.sms.send({
  type: 'SMS',
  from: '01012345678',
  content: '안녕하세요, 테스트 메시지입니다.',
  messages: [
    { to: '01098765432' }
  ],
});

// 알림톡 발송
const alimtalkResult = await client.alimtalk.send({
  plusFriendId: '@your-channel',
  templateCode: 'TEMPLATE_001',
  messages: [
    {
      to: '01098765432',
      content: '안녕하세요, 알림톡 메시지입니다.',
    },
  ],
});

// 이메일 발송
const mailResult = await client.mail.send({
  senderAddress: 'noreply@example.com',
  senderName: '발신자',
  title: '메일 제목',
  body: '<h1>메일 본문</h1>',
  recipients: [
    { address: 'user@example.com', type: 'R' }
  ],
});
```

## 설정 옵션

### NcpConfig

| 옵션 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `accessKey` | `string` | Yes | - | NCP API Access Key |
| `secretKey` | `string` | Yes | - | NCP API Secret Key |
| `smsServiceId` | `string` | No | - | SENS SMS 서비스 ID (SMS 사용 시 필수) |
| `alimtalkServiceId` | `string` | No | - | SENS 알림톡 서비스 ID (알림톡 사용 시 필수) |
| `isGov` | `boolean` | No | `false` | Gov 환경 여부 (gov-ntruss.com vs ntruss.com) |

## SMS API 사용법

### SMS/LMS/MMS 발송

```typescript
const result = await client.sms.send({
  type: 'SMS', // 'SMS' | 'LMS' | 'MMS'
  contentType: 'COMM', // 'COMM' (일반) | 'AD' (광고) - 기본값: COMM
  countryCode: '82', // 기본값: "82"
  from: '01012345678', // 사전 등록된 발신번호
  content: '기본 메시지 내용',
  messages: [
    {
      to: '01098765432',
      content: '개별 메시지 내용 (선택)',
    },
  ],
});
```

### LMS/MMS 발송 (제목 포함)

```typescript
const result = await client.sms.send({
  type: 'LMS',
  from: '01012345678',
  subject: '메시지 제목', // 최대 40byte
  content: '긴 메시지 내용 (최대 2000byte)',
  messages: [
    { to: '01098765432' }
  ],
});
```

### MMS 발송 (파일 첨부)

```typescript
// 1. 파일 업로드
const uploadResult = await client.sms.uploadFile({
  fileName: 'image.jpg',
  fileBody: 'base64EncodedImageData',
});

// 2. MMS 발송
const result = await client.sms.send({
  type: 'MMS',
  from: '01012345678',
  subject: '이미지 메시지',
  content: '이미지가 첨부된 메시지입니다.',
  messages: [{ to: '01098765432' }],
  files: [{ fileId: uploadResult.fileId }],
});
```

### 예약 발송

```typescript
const result = await client.sms.send({
  type: 'SMS',
  from: '01012345678',
  content: '예약 메시지입니다.',
  messages: [{ to: '01098765432' }],
  reserveTime: '2024-12-31 23:59', // yyyy-MM-dd HH:mm
  reserveTimeZone: 'Asia/Seoul', // 기본값: Asia/Seoul
});
```

### 발송 요청 조회

```typescript
const result = await client.sms.getRequest({
  requestId: 'REQUEST_ID',
});

console.log(result.statusCode); // "202"
console.log(result.messages); // 메시지 목록
```

### 개별 메시지 결과 조회

```typescript
const result = await client.sms.getMessage('MESSAGE_ID');

console.log(result.status); // "COMPLETED"
console.log(result.completeTime); // 완료 시간
```

### 예약 상태 조회

```typescript
const status = await client.sms.getReserveStatus('RESERVE_ID');

console.log(status.reserveStatus); // "READY" | "PROCESSING" | "CANCELED"
```

### 예약 취소

```typescript
await client.sms.cancelReserve('RESERVE_ID');
```

### SendSmsRequest 타입

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `type` | `'SMS'` \| `'LMS'` \| `'MMS'` | Yes | - | 메시지 타입 |
| `contentType` | `'COMM'` \| `'AD'` | No | `'COMM'` | 일반/광고 구분 |
| `countryCode` | `string` | No | `"82"` | 국가 코드 |
| `from` | `string` | Yes | - | 발신번호 (사전 등록 필수) |
| `subject` | `string` | No | - | 제목 (LMS/MMS용, 최대 40byte) |
| `content` | `string` | Yes | - | 기본 내용 (SMS: 90byte, LMS/MMS: 2000byte) |
| `messages` | `SmsMessage[]` | Yes | - | 수신자 목록 (최대 100개) |
| `files` | `{ fileId: string }[]` | No | - | 첨부 파일 (MMS 전용) |
| `reserveTime` | `string` | No | - | 예약 시간 (yyyy-MM-dd HH:mm) |
| `reserveTimeZone` | `string` | No | `"Asia/Seoul"` | 예약 시간대 |

## 알림톡 API 사용법

### 알림톡 발송

```typescript
const result = await client.alimtalk.send({
  plusFriendId: '@your-channel', // 카카오톡 채널명
  templateCode: 'TEMPLATE_001', // 템플릿 코드
  messages: [
    {
      to: '01098765432',
      content: '템플릿에 맞는 메시지 내용',
      title: '알림톡 제목 (선택)',
      buttons: [
        {
          type: 'WL', // 웹링크
          name: '자세히 보기',
          linkMobile: 'https://example.com',
          linkPc: 'https://example.com',
        },
      ],
    },
  ],
});
```

### SMS 대체 발송 설정

```typescript
const result = await client.alimtalk.send({
  plusFriendId: '@your-channel',
  templateCode: 'TEMPLATE_001',
  messages: [
    {
      to: '01098765432',
      content: '알림톡 메시지',
      useSmsFailover: true, // SMS 대체 발송 사용
      failoverConfig: {
        type: 'LMS', // 'SMS' | 'LMS'
        from: '01012345678',
        subject: 'SMS 제목',
        content: 'SMS 대체 메시지',
      },
    },
  ],
});
```

### 아이템 리스트 형식

```typescript
const result = await client.alimtalk.send({
  plusFriendId: '@your-channel',
  templateCode: 'ITEM_LIST_TEMPLATE',
  messages: [
    {
      to: '01098765432',
      content: '주문 내역입니다.',
      item: {
        list: [
          { title: '상품 A', description: '10,000원' },
          { title: '상품 B', description: '20,000원' },
        ],
        summary: {
          title: '총 금액',
          description: '30,000원',
        },
      },
    },
  ],
});
```

### 채널 조회

```typescript
const channels = await client.alimtalk.getChannels();

channels.forEach(channel => {
  console.log(channel.channelId);
  console.log(channel.channelName);
});
```

### 템플릿 조회

```typescript
// 전체 템플릿 조회
const templates = await client.alimtalk.getTemplates({
  channelId: 'CHANNEL_ID',
});

// 특정 템플릿 조회
const template = await client.alimtalk.getTemplates({
  channelId: 'CHANNEL_ID',
  templateCode: 'TEMPLATE_001',
});
```

### 발송 요청 조회

```typescript
const result = await client.alimtalk.getRequest({
  requestId: 'REQUEST_ID',
});
```

### 개별 메시지 결과 조회

```typescript
const result = await client.alimtalk.getMessage('MESSAGE_ID');
```

### 예약 발송

```typescript
const result = await client.alimtalk.send({
  plusFriendId: '@your-channel',
  templateCode: 'TEMPLATE_001',
  messages: [
    {
      to: '01098765432',
      content: '예약 알림톡입니다.',
    },
  ],
  reserveTime: '2024-12-31 23:59',
  reserveTimeZone: 'Asia/Seoul',
});
```

### AlimtalkButton 타입

| 타입 | 설명 | 필수 필드 |
|------|------|-----------|
| `'DS'` | 배송 조회 | `name` |
| `'WL'` | 웹링크 | `name`, `linkMobile`, `linkPc` |
| `'AL'` | 앱링크 | `name`, `schemeIos`, `schemeAndroid` |
| `'BK'` | 봇키워드 | `name` |
| `'MD'` | 메시지 전달 | `name` |
| `'AC'` | 채널 추가 | `name` |

### SendAlimtalkRequest 타입

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `plusFriendId` | `string` | Yes | 카카오톡 채널명 |
| `templateCode` | `string` | Yes | 템플릿 코드 |
| `messages` | `AlimtalkMessage[]` | Yes | 수신자 목록 (최대 100개) |
| `reserveTime` | `string` | No | 예약 시간 (yyyy-MM-dd HH:mm) |
| `reserveTimeZone` | `string` | No | 예약 시간대 |

## 메일 API 사용법

### 기본 메일 발송

```typescript
const result = await client.mail.send({
  senderAddress: 'noreply@example.com',
  senderName: '발신자명',
  title: '메일 제목 (최대 500byte)',
  body: '<h1>HTML 메일 본문</h1><p>최대 500KB</p>',
  recipients: [
    {
      address: 'user@example.com',
      name: '수신자명',
      type: 'R', // 'R': 수신자, 'C': 참조, 'B': 숨은참조
    },
  ],
});
```

### 템플릿 메일 발송

```typescript
const result = await client.mail.send({
  senderAddress: 'noreply@example.com',
  templateSid: 12345, // 템플릿 ID
  title: '메일 제목',
  body: '템플릿 본문',
  parameters: {
    name: '홍길동',
    orderId: 'ORDER_001',
  },
  recipients: [
    {
      address: 'user@example.com',
      type: 'R',
      parameters: {
        personalCode: 'PERSONAL_001', // 개인별 치환 변수
      },
    },
  ],
});
```

### 개별 발송 vs 일괄 발송

```typescript
// 개별 발송 (기본값: true)
// 각 수신자가 다른 수신자를 볼 수 없음
const result1 = await client.mail.send({
  senderAddress: 'noreply@example.com',
  title: '제목',
  body: '본문',
  individual: true,
  recipients: [
    { address: 'user1@example.com', type: 'R' },
    { address: 'user2@example.com', type: 'R' },
  ],
});

// 일괄 발송
// 모든 수신자가 TO/CC/BCC에 표시됨
const result2 = await client.mail.send({
  senderAddress: 'noreply@example.com',
  title: '제목',
  body: '본문',
  individual: false,
  recipients: [
    { address: 'user1@example.com', type: 'R' },
    { address: 'user2@example.com', type: 'C' },
  ],
});
```

### 광고성 메일

```typescript
const result = await client.mail.send({
  senderAddress: 'noreply@example.com',
  title: '(광고) 프로모션 안내',
  body: '광고 메일 본문',
  advertising: true,
  useBasicUnsubscribeMsg: true, // 기본 수신거부 메시지 사용
  recipients: [
    { address: 'user@example.com', type: 'R' }
  ],
});

// 커스텀 수신거부 메시지
const result2 = await client.mail.send({
  senderAddress: 'noreply@example.com',
  title: '(광고) 프로모션 안내',
  body: '광고 메일 본문',
  advertising: true,
  unsubscribeMessage: '수신거부: unsubscribe@example.com',
  recipients: [
    { address: 'user@example.com', type: 'R' }
  ],
});
```

### 예약 발송

```typescript
// UTC 타임스탬프 사용
const result1 = await client.mail.send({
  senderAddress: 'noreply@example.com',
  title: '예약 메일',
  body: '본문',
  reservationUtc: 1735660740000, // Unix timestamp (milliseconds)
  recipients: [
    { address: 'user@example.com', type: 'R' }
  ],
});

// DateTime 문자열 사용 (UTC+9)
const result2 = await client.mail.send({
  senderAddress: 'noreply@example.com',
  title: '예약 메일',
  body: '본문',
  reservationDateTime: '2024-12-31 23:59', // yyyy-MM-dd HH:mm
  recipients: [
    { address: 'user@example.com', type: 'R' }
  ],
});
```

### SendMailRequest 타입

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `senderAddress` | `string` | Yes | - | 발송자 이메일 |
| `senderName` | `string` | No | - | 발송자명 |
| `templateSid` | `number` | No | - | 템플릿 ID |
| `title` | `string` | Yes | - | 메일 제목 (최대 500byte) |
| `body` | `string` | Yes | - | 메일 본문 (최대 500KB) |
| `individual` | `boolean` | No | `true` | 개별 발송 여부 |
| `advertising` | `boolean` | No | `false` | 광고성 메일 여부 |
| `parameters` | `Record<string, string>` | No | - | 템플릿 치환 변수 |
| `reservationUtc` | `number` | No | - | 예약 시간 (Unix timestamp) |
| `reservationDateTime` | `string` | No | - | 예약 시간 (yyyy-MM-dd HH:mm, UTC+9) |
| `attachFileIds` | `string[]` | No | - | 첨부 파일 ID 목록 |
| `recipients` | `MailRecipient[]` | Yes | - | 수신자 목록 |
| `useBasicUnsubscribeMsg` | `boolean` | No | - | 기본 수신거부 메시지 사용 |
| `unsubscribeMessage` | `string` | No | - | 커스텀 수신거부 메시지 |

### MailRecipient 타입

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `address` | `string` | Yes | 수신자 이메일 |
| `name` | `string` | No | 수신자명 |
| `type` | `'R'` \| `'C'` \| `'B'` | Yes | R: 수신자, C: 참조, B: 숨은참조 |
| `parameters` | `Record<string, string>` | No | 개인별 템플릿 치환 변수 |

## 에러 처리

모든 API 호출은 실패 시 `NcpError`를 발생시킵니다.

```typescript
import { NcpError } from '@builder-shin/ncp-send';

try {
  await client.sms.send({
    type: 'SMS',
    from: '01012345678',
    content: '메시지',
    messages: [{ to: '01098765432' }],
  });
} catch (error) {
  if (error instanceof NcpError) {
    console.error('HTTP 상태:', error.statusCode);
    console.error('에러 코드:', error.errorCode);
    console.error('에러 메시지:', error.errorMessage);

    // 특정 에러 처리
    if (error.statusCode === 401) {
      console.error('인증 실패: API Key를 확인하세요');
    } else if (error.statusCode === 400) {
      console.error('잘못된 요청:', error.errorMessage);
    }
  }
}
```

### NcpError 속성

| 속성 | 타입 | 설명 |
|------|------|------|
| `statusCode` | `number` | HTTP 상태 코드 |
| `errorCode` | `string?` | NCP API 에러 코드 (있는 경우) |
| `errorMessage` | `string?` | NCP API 에러 메시지 |

### 서비스 ID 미설정 에러

SMS나 알림톡을 사용하려면 반드시 해당 서비스 ID를 설정해야 합니다.

```typescript
// ❌ 잘못된 예시
const client = new NcpSend({
  accessKey: 'KEY',
  secretKey: 'SECRET',
  // smsServiceId 미설정
});

await client.sms.send({...}); // Error: smsServiceId is required. Provide it in NcpConfig.

// ✅ 올바른 예시
const client = new NcpSend({
  accessKey: 'KEY',
  secretKey: 'SECRET',
  smsServiceId: 'SMS_SERVICE_ID',
  alimtalkServiceId: 'ALIMTALK_SERVICE_ID',
});
```

## Gov vs Standard 환경

NCP는 두 가지 환경을 제공합니다:

| 환경 | `isGov` 값 | SENS API URL | Mail API URL |
|------|-----------|--------------|--------------|
| **Gov** | `true` | `sens.apigw.gov-ntruss.com` | `mail.apigw.gov-ntruss.com` |
| **Standard** (기본) | `false` | `sens.apigw.ntruss.com` | `mail.apigw.ntruss.com` |

```typescript
// Gov 환경
const govClient = new NcpSend({
  accessKey: 'KEY',
  secretKey: 'SECRET',
  smsServiceId: 'SERVICE_ID',
  isGov: true,
});

// Standard 환경 (기본값)
const stdClient = new NcpSend({
  accessKey: 'KEY',
  secretKey: 'SECRET',
  smsServiceId: 'SERVICE_ID',
  isGov: false, // 또는 생략
});
```

## 타입 내보내기

이 패키지는 다음 타입들을 내보냅니다:

### Core Types
- `NcpConfig` - 클라이언트 설정
- `NcpError` - 에러 객체

### SMS Types
- `SendSmsRequest` - SMS 발송 요청
- `SmsMessage` - SMS 수신자 정보
- `SendSmsResponse` - SMS 발송 응답
- `FileUploadRequest` - 파일 업로드 요청
- `FileUploadResponse` - 파일 업로드 응답
- `GetSmsRequestParams` - SMS 요청 조회 파라미터
- `GetSmsMessagesResponse` - SMS 메시지 목록 응답
- `SmsMessageResult` - SMS 메시지 결과
- `GetSmsMessageResponse` - SMS 메시지 조회 응답
- `SmsReserveStatus` - SMS 예약 상태

### Alimtalk Types
- `AlimtalkButtonType` - 버튼 타입 (`'DS'` | `'WL'` | `'AL'` | `'BK'` | `'MD'` | `'AC'`)
- `AlimtalkButton` - 버튼 정보
- `SendAlimtalkRequest` - 알림톡 발송 요청
- `AlimtalkMessage` - 알림톡 메시지
- `SendAlimtalkResponse` - 알림톡 발송 응답
- `AlimtalkChannel` - 알림톡 채널 정보
- `GetAlimtalkTemplatesParams` - 템플릿 조회 파라미터
- `AlimtalkTemplate` - 템플릿 정보
- `GetAlimtalkRequestParams` - 알림톡 요청 조회 파라미터
- `GetAlimtalkMessagesResponse` - 알림톡 메시지 목록 응답
- `AlimtalkMessageResult` - 알림톡 메시지 결과
- `GetAlimtalkMessageResponse` - 알림톡 메시지 조회 응답
- `AlimtalkReserveStatus` - 알림톡 예약 상태

### Mail Types
- `SendMailRequest` - 메일 발송 요청
- `MailRecipient` - 메일 수신자 정보
- `SendMailResponse` - 메일 발송 응답

### Client Types
- `SmsClient` - SMS 클라이언트
- `AlimtalkClient` - 알림톡 클라이언트
- `MailClient` - 메일 클라이언트
- `NcpSend` - 메인 클라이언트

```typescript
import type {
  NcpConfig,
  NcpError,
  SendSmsRequest,
  SendAlimtalkRequest,
  SendMailRequest,
  // ... 기타 타입들
} from '@builder-shin/ncp-send';
```

## 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 기여

이슈와 PR은 언제든지 환영합니다!

## 참고 자료

- [NCP SENS API 문서](https://api.ncloud-docs.com/docs/ai-application-service-sens-smsv2)
- [NCP Cloud Outbound Mailer API 문서](https://api.ncloud-docs.com/docs/management-cloudoutboundmailer)
