type TranslationMap = Record<string, string | Record<string, string>>;

function flatten(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v != null && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v as Record<string, unknown>, key));
    } else if (typeof v === 'string') {
      out[key] = v;
    }
  }
  return out;
}

const en = flatten({
  profile: {
    email: 'Email',
    logout: 'Log out',
    deleteAccount: 'Delete account',
    plansPricing: 'Plans & Pricing',
    notSignedIn: 'Not signed in',
    notSignedInSub: 'Sign in or create an account to access your gallery and profile.',
    tagline: 'Your photobooth strips, your way. Create and save memories with custom templates.',
    version: 'Version 1.0.0',
    language: 'Language',
    deleteConfirmTitle: 'Delete account',
    deleteConfirmMessage: 'This will permanently delete your account and data. This action cannot be undone.',
    deletePasswordPlaceholder: 'Enter your password to confirm.',
    cancel: 'Cancel',
    continue: 'Continue',
  },
  tabs: { home: 'Home', gallery: 'Gallery', profile: 'Profile' },
  auth: { back: 'Back', login: 'Log in', register: 'Register', email: 'Email', password: 'Password', displayName: 'Display name', forgotPassword: 'Forgot password?' },
  pricing: { title: 'Plans & Pricing', sub: 'Choose the plan that fits you. Payment via Apple In-App Purchase.', selectPlan: 'Select plan', currentPlan: 'Current plan' },
  templateBadge: { free: 'Free', paid: 'Paid' },
  result: {
    saveToGallery: 'Save to gallery',
    saving: 'Saving…',
    saved: 'Saved!',
    loading: 'Loading…',
    savedHint: 'Strip saved to your gallery.',
    upgradeToSave: 'Upgrade to a paid plan to save this strip.',
    upgradeTitle: 'Paid template',
  },
  common: { back: 'Back', cancel: 'Cancel', ok: 'OK' },
});

const vi = flatten({
  profile: {
    email: 'Email',
    logout: 'Đăng xuất',
    deleteAccount: 'Xóa tài khoản',
    plansPricing: 'Gói dịch vụ / Giá',
    notSignedIn: 'Chưa đăng nhập',
    notSignedInSub: 'Đăng nhập hoặc tạo tài khoản để truy cập thư viện và hồ sơ.',
    tagline: 'Ảnh photobooth theo cách của bạn. Tạo và lưu kỷ niệm với template tùy chọn.',
    version: 'Phiên bản 1.0.0',
    language: 'Ngôn ngữ',
    deleteConfirmTitle: 'Xóa tài khoản',
    deleteConfirmMessage: 'Thao tác này sẽ xóa vĩnh viễn tài khoản và dữ liệu. Không thể hoàn tác.',
    deletePasswordPlaceholder: 'Nhập mật khẩu để xác nhận.',
    cancel: 'Hủy',
    continue: 'Tiếp tục',
  },
  tabs: { home: 'Trang chủ', gallery: 'Thư viện', profile: 'Hồ sơ' },
  auth: { back: 'Quay lại', login: 'Đăng nhập', register: 'Đăng ký', email: 'Email', password: 'Mật khẩu', displayName: 'Tên hiển thị', forgotPassword: 'Quên mật khẩu?' },
  pricing: { title: 'Gói dịch vụ', sub: 'Chọn gói phù hợp với bạn. Thanh toán qua Apple In-App Purchase.', selectPlan: 'Chọn gói', currentPlan: 'Gói hiện tại' },
  templateBadge: { free: 'Miễn phí', paid: 'Trả phí' },
  result: { saveToGallery: 'Lưu vào thư viện', saving: 'Đang lưu…', saved: 'Đã lưu!', loading: 'Đang tải…', savedHint: 'Đã lưu strip vào thư viện.', upgradeToSave: 'Nâng cấp gói trả phí để lưu strip này.', upgradeTitle: 'Template trả phí' },
  common: { back: 'Quay lại', cancel: 'Hủy', ok: 'OK' },
});

const es = flatten({
  profile: {
    email: 'Correo',
    logout: 'Cerrar sesión',
    deleteAccount: 'Eliminar cuenta',
    plansPricing: 'Planes y precios',
    notSignedIn: 'No has iniciado sesión',
    notSignedInSub: 'Inicia sesión o crea una cuenta para acceder a tu galería y perfil.',
    tagline: 'Tus tiras de fotomatón a tu manera. Crea y guarda recuerdos con plantillas personalizadas.',
    version: 'Versión 1.0.0',
    language: 'Idioma',
    deleteConfirmTitle: 'Eliminar cuenta',
    deleteConfirmMessage: 'Esto eliminará permanentemente tu cuenta y datos. No se puede deshacer.',
    deletePasswordPlaceholder: 'Introduce tu contraseña para confirmar.',
    cancel: 'Cancelar',
    continue: 'Continuar',
  },
  tabs: { home: 'Inicio', gallery: 'Galería', profile: 'Perfil' },
  auth: { back: 'Atrás', login: 'Iniciar sesión', register: 'Registrarse', email: 'Correo', password: 'Contraseña', displayName: 'Nombre', forgotPassword: '¿Olvidaste tu contraseña?' },
  pricing: { title: 'Planes y precios', sub: 'Elige el plan que te convenga. Pago vía Apple In-App Purchase.', selectPlan: 'Elegir plan', currentPlan: 'Plan actual' },
  templateBadge: { free: 'Gratis', paid: 'De pago' },
  result: { saveToGallery: 'Guardar en galería', saving: 'Guardando…', saved: '¡Guardado!', loading: 'Cargando…', savedHint: 'Strip guardado en tu galería.', upgradeToSave: 'Actualiza a un plan de pago para guardar este strip.', upgradeTitle: 'Plantilla de pago' },
  common: { back: 'Atrás', cancel: 'Cancelar', ok: 'OK' },
});

const fr = flatten({
  profile: {
    email: 'E-mail',
    logout: 'Déconnexion',
    deleteAccount: 'Supprimer le compte',
    plansPricing: 'Forfaits et tarifs',
    notSignedIn: 'Non connecté',
    notSignedInSub: 'Connectez-vous ou créez un compte pour accéder à votre galerie et profil.',
    tagline: 'Vos bandes photomaton à votre façon. Créez et sauvegardez des souvenirs avec des modèles personnalisés.',
    version: 'Version 1.0.0',
    language: 'Langue',
    deleteConfirmTitle: 'Supprimer le compte',
    deleteConfirmMessage: 'Cela supprimera définitivement votre compte et vos données. Cette action est irréversible.',
    deletePasswordPlaceholder: 'Entrez votre mot de passe pour confirmer.',
    cancel: 'Annuler',
    continue: 'Continuer',
  },
  tabs: { home: 'Accueil', gallery: 'Galerie', profile: 'Profil' },
  auth: { back: 'Retour', login: 'Connexion', register: 'S\'inscrire', email: 'E-mail', password: 'Mot de passe', displayName: 'Nom d\'affichage', forgotPassword: 'Mot de passe oublié ?' },
  pricing: { title: 'Forfaits et tarifs', sub: 'Choisissez le forfait qui vous convient. Paiement via Apple In-App Purchase.', selectPlan: 'Choisir le forfait', currentPlan: 'Forfait actuel' },
  templateBadge: { free: 'Gratuit', paid: 'Payant' },
  result: { saveToGallery: 'Enregistrer dans la galerie', saving: 'Enregistrement…', saved: 'Enregistré !', loading: 'Chargement…', savedHint: 'Strip enregistré dans votre galerie.', upgradeToSave: 'Passez à un forfait payant pour enregistrer ce strip.', upgradeTitle: 'Modèle payant' },
  common: { back: 'Retour', cancel: 'Annuler', ok: 'OK' },
});

const ja = flatten({
  profile: {
    email: 'メール',
    logout: 'ログアウト',
    deleteAccount: 'アカウントを削除',
    plansPricing: 'プランと料金',
    notSignedIn: '未ログイン',
    notSignedInSub: 'ギャラリーとプロフィールにアクセスするにはログインまたはアカウントを作成してください。',
    tagline: 'フォトストリップを自分流に。カスタムテンプレートで思い出を作成・保存。',
    version: 'バージョン 1.0.0',
    language: '言語',
    deleteConfirmTitle: 'アカウントを削除',
    deleteConfirmMessage: 'アカウントとデータが完全に削除されます。元に戻せません。',
    deletePasswordPlaceholder: '確認のためパスワードを入力してください。',
    cancel: 'キャンセル',
    continue: '続ける',
  },
  tabs: { home: 'ホーム', gallery: 'ギャラリー', profile: 'プロフィール' },
  auth: { back: '戻る', login: 'ログイン', register: '新規登録', email: 'メール', password: 'パスワード', displayName: '表示名', forgotPassword: 'パスワードをお忘れですか？' },
  pricing: { title: 'プランと料金', sub: 'ご希望のプランをお選びください。Apple アプリ内課金でお支払い。', selectPlan: 'プランを選択', currentPlan: '現在のプラン' },
  templateBadge: { free: '無料', paid: '有料' },
  result: { saveToGallery: 'ギャラリーに保存', saving: '保存中…', saved: '保存しました！', loading: '読み込み中…', savedHint: 'ストリップをギャラリーに保存しました。', upgradeToSave: 'このストリップを保存するには有料プランにアップグレードしてください。', upgradeTitle: '有料テンプレート' },
  common: { back: '戻る', cancel: 'キャンセル', ok: 'OK' },
});

const zh = flatten({
  profile: {
    email: '邮箱',
    logout: '退出登录',
    deleteAccount: '删除账户',
    plansPricing: '套餐与价格',
    notSignedIn: '未登录',
    notSignedInSub: '登录或注册以访问您的图库和个人资料。',
    tagline: '用自定义模板创建和保存您的照片条回忆。',
    version: '版本 1.0.0',
    language: '语言',
    deleteConfirmTitle: '删除账户',
    deleteConfirmMessage: '此操作将永久删除您的账户和数据，无法撤销。',
    deletePasswordPlaceholder: '请输入密码以确认。',
    cancel: '取消',
    continue: '继续',
  },
  tabs: { home: '首页', gallery: '图库', profile: '个人' },
  auth: { back: '返回', login: '登录', register: '注册', email: '邮箱', password: '密码', displayName: '显示名称', forgotPassword: '忘记密码？' },
  pricing: { title: '套餐与价格', sub: '选择适合您的套餐。通过 Apple 应用内购买支付。', selectPlan: '选择套餐', currentPlan: '当前套餐' },
  templateBadge: { free: '免费', paid: '付费' },
  result: { saveToGallery: '保存到相册', saving: '保存中…', saved: '已保存！', loading: '加载中…', savedHint: '已保存到相册。', upgradeToSave: '升级付费套餐以保存此照片条。', upgradeTitle: '付费模板' },
  common: { back: '返回', cancel: '取消', ok: '好的' },
});

const fil = flatten({
  profile: {
    email: 'Email',
    logout: 'Mag-log out',
    deleteAccount: 'Tanggalin ang account',
    plansPricing: 'Mga plano at presyo',
    notSignedIn: 'Hindi naka-sign in',
    notSignedInSub: 'Mag-sign in o gumawa ng account para ma-access ang iyong gallery at profile.',
    tagline: 'Ang iyong photobooth strips, ayon sa iyong paraan. Gumawa at mag-save ng mga alaala gamit ang custom templates.',
    version: 'Bersyon 1.0.0',
    language: 'Wika',
    deleteConfirmTitle: 'Tanggalin ang account',
    deleteConfirmMessage: 'Permanenteng mabubura ang iyong account at data. Hindi ito mababawi.',
    deletePasswordPlaceholder: 'Ilagay ang iyong password para kumpirmahin.',
    cancel: 'Kanselahin',
    continue: 'Magpatuloy',
  },
  tabs: { home: 'Home', gallery: 'Gallery', profile: 'Profile' },
  auth: { back: 'Bumalik', login: 'Mag-log in', register: 'Magrehistro', email: 'Email', password: 'Password', displayName: 'Pangalan', forgotPassword: 'Nakalimutan ang password?' },
  pricing: { title: 'Mga plano at presyo', sub: 'Piliin ang planong bagay sa iyo. Bayad sa pamamagitan ng Apple In-App Purchase.', selectPlan: 'Piliin ang plano', currentPlan: 'Kasalukuyang plano' },
  templateBadge: { free: 'Libre', paid: 'Bayad' },
  result: { saveToGallery: 'I-save sa gallery', saving: 'Sinesave…', saved: 'Naka-save!', loading: 'Naglo-load…', savedHint: 'Naka-save ang strip sa iyong gallery.', upgradeToSave: 'Mag-upgrade sa paid plan para ma-save ang strip na ito.', upgradeTitle: 'Paid template' },
  common: { back: 'Bumalik', cancel: 'Kanselahin', ok: 'OK' },
});

const my = flatten({
  profile: {
    email: 'အီးမေးလ်',
    logout: 'ထွက်မည်',
    deleteAccount: 'အကောင့်ဖျက်မည်',
    plansPricing: 'အစီအစဉ်နှင့်ဈေးနှုန်း',
    notSignedIn: 'မဝင်ရောက်ရသေးပါ',
    notSignedInSub: 'သင့်ပြခန်းနှင့်ပရိုဖိုင်ကိုကြည့်ရန် ဝင်ရောက်ပါ သို့မဟုတ် အကောင့်ဖွင့်ပါ။',
    tagline: 'သင့်ဓာတ်ပုံကြိုးများကို သင့်နည်းနဲ့။ စိတ်ကြိုက်တမ်းပလိတ်များဖြင့် မှတ်တမ်းများဖန်တီးပြီး သိမ်းဆည်းပါ။',
    version: 'ဗားရှင်း 1.0.0',
    language: 'ဘာသာစကား',
    deleteConfirmTitle: 'အကောင့်ဖျက်မည်',
    deleteConfirmMessage: 'သင့်အကောင့်နှင့်ဒေတာကို အပြီးအပိုင်ဖျက်မည်။ ပြန်မရနိုင်ပါ။',
    deletePasswordPlaceholder: 'အတည်ပြုရန် စကားဝှက်ထည့်ပါ။',
    cancel: 'မလုပ်တော့',
    continue: 'ဆက်လက်လုပ်မည်',
  },
  tabs: { home: 'ပင်မစာမျက်နှာ', gallery: 'ပြခန်း', profile: 'ပရိုဖိုင်' },
  auth: { back: 'နောက်ပြန်', login: 'ဝင်မည်', register: 'မှတ်ပုံတင်မည်', email: 'အီးမေးလ်', password: 'စကားဝှက်', displayName: 'ပြသသည့်အမည်', forgotPassword: 'စကားဝှက်မေ့သွားပါသလား?' },
  pricing: { title: 'အစီအစဉ်နှင့်ဈေးနှုန်း', sub: 'သင့်နဲ့ကိုက်ညီတဲ့ အစီအစဉ်ရွေးပါ။ Apple In-App Purchase ဖြင့်ငွေပေးချေပါ။', selectPlan: 'အစီအစဉ်ရွေးမည်', currentPlan: 'လက်ရှိအစီအစဉ်' },
  templateBadge: { free: 'အခမဲ့', paid: 'ငွေပေးချေပါ' },
  result: { saveToGallery: 'ပြခန်းသို့သိမ်းမည်', saving: 'သိမ်းဆည်းနေသည်…', saved: 'သိမ်းပြီး!', loading: 'ဖွင့်နေသည်…', savedHint: 'သင့်ပြခန်းသို့သိမ်းပြီး။', upgradeToSave: 'ဤ strip ကိုသိမ်းရန် ငွေပေးအစီအစဉ်သို့ မြှင့်ပါ။', upgradeTitle: 'ငွေပေးတမ်းပလိတ်' },
  common: { back: 'နောက်ပြန်', cancel: 'မလုပ်တော့', ok: 'အိုကေ' },
});

export const translations: Record<string, Record<string, string>> = {
  en,
  vi,
  es,
  fr,
  ja,
  zh,
  fil,
  my,
};
