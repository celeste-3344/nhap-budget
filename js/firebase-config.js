/* =====================================================
   js/firebase-config.js
   -----------------------------------------------------
   Khởi tạo Firebase App + Auth + Firestore + App Check và
   export ra cho auth.js / data.js dùng chung.

   LƯU Ý: Nếu bạn đã có sẵn file cấu hình của riêng mình,
   chỉ cần đảm bảo nó export đúng 3 thứ: app, auth, db.
===================================================== */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, setPersistence, browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { initializeAppCheck, ReCaptchaV3Provider } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app-check.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBNG5_UZ7hkp51B2xikdYpp6CXvuK7hb2w',
  authDomain: 'budget-dcebf.firebaseapp.com',
  databaseURL: 'https://budget-dcebf-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'budget-dcebf',
  storageBucket: 'budget-dcebf.firebasestorage.app',
  messagingSenderId: '764645880037',
  appId: '1:764645880037:web:4d262bb5ab1ed1bedfe40c',
  measurementId: 'G-8JE28V51VE',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/* =====================================================
   APP CHECK (chống bot / spam gọi thẳng API, xem README
   mục "App Check" để lấy site key reCAPTCHA v3 và bật
   enforcement trong Firebase Console)
   -----------------------------------------------------
   - THAY 'DÁN_RECAPTCHA_V3_SITE_KEY_VÀO_ĐÂY' bằng site key
     (public key) lấy từ https://www.google.com/recaptcha/admin
   - Khi chạy ở localhost/127.0.0.1, Firebase sẽ in ra Console
     một "debug token" — copy token đó rồi vào Firebase Console
     > App Check > Manage debug tokens để đăng ký, nếu không App
     Check sẽ chặn app khi test ở máy (App Check không nhận diện
     được localhost qua reCAPTCHA).
   - Nếu bạn CHƯA lấy site key, cứ để nguyên placeholder — app
     vẫn chạy bình thường (Firestore sẽ chỉ thực sự chặn khi bạn
     bật "Enforce" trong Firebase Console, xem README).
===================================================== */
const RECAPTCHA_V3_SITE_KEY = '6LcMZMMtAAAAACYP6K9DfhN0yltRHasxVj_aOeMT';

if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  // Chỉ bật debug token khi chạy local — TUYỆT ĐỐI không để dòng này
  // chạy trên bản production (đã được if bao ngoài nên an toàn).
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

export let appCheck = null;
if (RECAPTCHA_V3_SITE_KEY && RECAPTCHA_V3_SITE_KEY !== 'DÁN_RECAPTCHA_V3_SITE_KEY_VÀO_ĐÂY') {
  try {
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(RECAPTCHA_V3_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    console.warn('[Sổ Chi Tiêu] Không khởi tạo được App Check.', err);
  }
} else {
  console.warn('[Sổ Chi Tiêu] App Check chưa được cấu hình — xem hướng dẫn "App Check" trong README.md.');
}

// Giữ phiên đăng nhập ngay cả khi đóng trình duyệt (mặc định của Firebase,
// khai báo tường minh để tránh phụ thuộc vào thay đổi mặc định về sau).
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('[Sổ Chi Tiêu] Không thiết lập được chế độ lưu phiên đăng nhập.', err);
});
