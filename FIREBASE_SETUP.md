# Firebase 리더보드 설정 가이드

현재 미니게임들은 로컬 스토리지에 점수를 저장합니다. Firebase를 설정하면 모든 사용자가 공유하는 글로벌 리더보드를 사용할 수 있습니다.

## 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속합니다
2. "프로젝트 추가" 버튼을 클릭합니다
3. 프로젝트 이름을 입력합니다 (예: `my-games-leaderboard`)
4. Google Analytics는 선택사항입니다 (필요하지 않으면 비활성화)
5. "프로젝트 만들기"를 클릭합니다

## 2. Realtime Database 설정

1. 왼쪽 메뉴에서 "빌드" > "Realtime Database"를 선택합니다
2. "데이터베이스 만들기" 버튼을 클릭합니다
3. 위치를 선택합니다 (아시아의 경우 `asia-southeast1` 권장)
4. 보안 규칙을 선택합니다:
   - 개발 중: "테스트 모드에서 시작" 선택
   - 프로덕션: "잠금 모드에서 시작" 선택 후 아래 규칙 적용

### 프로덕션 보안 규칙 (권장)

데이터베이스 규칙 탭에서 다음 규칙을 적용합니다:

\`\`\`json
{
  "rules": {
    "leaderboards": {
      "$gameId": {
        ".read": true,
        ".write": true,
        "$scoreId": {
          ".validate": "newData.hasChildren(['name', 'score', 'timestamp', 'date'])",
          "name": {
            ".validate": "newData.isString() && newData.val().length <= 20"
          },
          "score": {
            ".validate": "newData.isNumber()"
          },
          "timestamp": {
            ".validate": "newData.isNumber()"
          },
          "date": {
            ".validate": "newData.isString()"
          }
        }
      }
    }
  }
}
\`\`\`

이 규칙은:
- 모든 사용자가 리더보드를 읽을 수 있습니다
- 모든 사용자가 점수를 제출할 수 있습니다
- 점수 데이터 형식을 검증합니다
- 닉네임은 최대 20자로 제한됩니다

## 3. Firebase 설정 정보 가져오기

1. Firebase 프로젝트 설정 (⚙️ 아이콘)으로 이동합니다
2. "일반" 탭에서 아래로 스크롤합니다
3. "내 앱" 섹션에서 웹 앱 (</>) 아이콘을 클릭합니다
4. 앱 닉네임을 입력합니다 (예: `games-website`)
5. "Firebase Hosting 설정" 체크박스는 선택하지 않아도 됩니다
6. "앱 등록"을 클릭합니다
7. Firebase SDK 설정 정보가 표시됩니다

## 4. 설정 정보 적용

`assets/js/leaderboard.js` 파일을 열고 상단의 `FIREBASE_CONFIG` 객체를 업데이트합니다:

\`\`\`javascript
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY_HERE",                    // Firebase에서 복사
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",  // Firebase에서 복사
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com", // Firebase에서 복사
  projectId: "YOUR_PROJECT_ID",                   // Firebase에서 복사
  storageBucket: "YOUR_PROJECT_ID.appspot.com",   // Firebase에서 복사
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",  // Firebase에서 복사
  appId: "YOUR_APP_ID"                            // Firebase에서 복사
};
\`\`\`

### 예시:
\`\`\`javascript
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz123456",
  authDomain: "my-games-123456.firebaseapp.com",
  databaseURL: "https://my-games-123456-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "my-games-123456",
  storageBucket: "my-games-123456.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
\`\`\`

## 5. 변경사항 적용

1. 파일을 저장합니다
2. GitHub에 커밋하고 푸시합니다:
   \`\`\`bash
   git add assets/js/leaderboard.js
   git commit -m "Configure Firebase for global leaderboard"
   git push
   \`\`\`
3. GitHub Pages가 자동으로 배포됩니다 (몇 분 소요)

## 6. 테스트

1. 웹사이트의 게임 중 하나를 플레이합니다
2. 게임이 끝나면 "Submit Score" 버튼을 클릭합니다
3. 닉네임을 입력하고 제출합니다
4. "🏆 Leaderboard" 버튼을 클릭하여 점수가 표시되는지 확인합니다
5. Firebase Console의 Realtime Database 탭에서도 데이터를 확인할 수 있습니다

## 문제 해결

### 리더보드가 작동하지 않을 때

1. **브라우저 콘솔 확인**:
   - F12를 눌러 개발자 도구를 엽니다
   - Console 탭에서 오류 메시지를 확인합니다

2. **Firebase 설정 확인**:
   - `assets/js/leaderboard.js`의 설정 정보가 정확한지 확인합니다
   - 특히 `databaseURL`이 올바른지 확인합니다

3. **보안 규칙 확인**:
   - Firebase Console > Realtime Database > 규칙 탭
   - 위의 권장 규칙이 적용되었는지 확인합니다

4. **로컬 스토리지는 계속 작동**:
   - Firebase가 설정되지 않아도 로컬 스토리지에 점수가 저장됩니다
   - Firebase 설정 후에는 글로벌 리더보드와 로컬 기록 모두 유지됩니다

## 비용 정보

Firebase 무료 플랜(Spark Plan)에는 다음이 포함됩니다:
- **Realtime Database**: 1GB 저장공간, 10GB/월 다운로드
- **대부분의 개인 프로젝트에 충분**합니다
- 리더보드 데이터는 매우 작기 때문에 무료 한도를 초과하기 어렵습니다

사용량 모니터링:
- Firebase Console > 사용량 및 결제
- 무료 한도의 80%에 도달하면 이메일 알림을 받을 수 있습니다

## 추가 기능 (선택사항)

### 1. 부적절한 닉네임 필터링

Firebase Functions를 사용하여 부적절한 닉네임을 자동으로 필터링할 수 있습니다.

### 2. 리더보드 크기 제한

각 게임당 상위 100개 점수만 유지하도록 Firebase Functions를 설정할 수 있습니다.

### 3. 일별/주별 리더보드

기간별 리더보드를 만들어 더 많은 사용자에게 기회를 줄 수 있습니다.

이러한 기능이 필요하면 Firebase의 유료 플랜(Blaze Plan)으로 업그레이드해야 할 수 있습니다.

## 지원

문제가 발생하면:
1. [Firebase 문서](https://firebase.google.com/docs/database) 참조
2. [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)에서 검색
3. GitHub Issues에 문의

즐거운 게임 되세요! 🎮
