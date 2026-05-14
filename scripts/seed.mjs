// Firestore Seed Script
// 사용법: npm install && npm run seed
//
// 동작: topology-data.json을 읽어 Firestore의 6개 컬렉션에 적재한다.
// 같은 id로 setDoc()을 호출하므로 여러 번 실행해도 안전(멱등).

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const firebaseConfig = {
  apiKey: "AIzaSyCl636CYERP6N2ETNML_50Jx5YRgQZASoY",
  authDomain: "firewall-request-pilot.firebaseapp.com",
  projectId: "firewall-request-pilot",
  storageBucket: "firewall-request-pilot.firebasestorage.app",
  messagingSenderId: "980599472865",
  appId: "1:980599472865:web:1400fd941e2a127285eda0",
  measurementId: "G-TMFM2K40X0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(__dirname, "topology-data.json"), "utf-8"));

const collections = [
  "network_zones",
  "server_farms",
  "firewalls",
  "zone_connections",
  "systems",
  "firewall_rules"
];

console.log("🔥 Firestore Seed 시작\n");

for (const colName of collections) {
  const items = data[colName];
  if (!items) {
    console.warn(`⚠️  ${colName} 데이터 없음, 건너뜀`);
    continue;
  }
  process.stdout.write(`📦 ${colName.padEnd(20)} ${items.length}개 적재 중... `);
  for (const item of items) {
    const { id, ...rest } = item;
    await setDoc(doc(db, colName, id), rest);
  }
  console.log("✓");
}

console.log("\n🎉 모든 Seed 데이터 적재 완료!");
console.log("👉 https://console.firebase.google.com/project/firewall-request-pilot/firestore 에서 확인");

process.exit(0);
