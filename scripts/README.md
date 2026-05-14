# Seed Script

Firestore에 토폴로지 가짜 데이터를 적재한다.

## 적재되는 데이터

| 컬렉션 | 개수 | 설명 |
|---|---|---|
| `network_zones` | 7 | 네트워크 구역 (DMZ, 업무, 사무실, 개발, DB, 보안, 인프라) |
| `server_farms` | 6 | 서버팜 |
| `firewalls` | 5 | 방화벽 |
| `zone_connections` | 8 | Zone 간 인접 관계 (어떤 방화벽이 사이에 있는지) |
| `systems` | 24 | 시스템 (IP-시스템명 매핑) |
| `firewall_rules` | 11 | 방화벽 룰 (Allow / Block) |

## 실행 방법 (Windows PowerShell)

```powershell
cd C:\Users\user\firewall-request-pilot\scripts
npm install
npm run seed
```

성공 시 출력:
```
🔥 Firestore Seed 시작

📦 network_zones       7개 적재 중... ✓
📦 server_farms        6개 적재 중... ✓
📦 firewalls           5개 적재 중... ✓
📦 zone_connections    8개 적재 중... ✓
📦 systems             24개 적재 중... ✓
📦 firewall_rules      11개 적재 중... ✓

🎉 모든 Seed 데이터 적재 완료!
```

## 확인

Firebase Console → Firestore Database 에서 6개 컬렉션이 생성되었는지 확인:
https://console.firebase.google.com/project/firewall-request-pilot/firestore

## 멱등성

`setDoc(id, data)`를 사용하므로 같은 스크립트를 여러 번 실행해도 안전하다 (덮어쓰기).
데이터를 갈아엎고 싶으면 Firebase Console에서 컬렉션을 삭제 후 재실행.

## 주의

- Firestore가 **테스트 모드**여야 한다 (스크립트는 인증 없이 클라이언트 SDK로 쓰기). 30일 후 만료되니, 본 개발 시 Security Rules + Admin SDK 전환 필요.
- `firebaseConfig`가 `seed.mjs`에 하드코딩되어 있다. 파일럿이라 OK이고, 본 개발 시 `.env`로 분리한다.
