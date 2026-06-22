/* PrintHub 印模库 - Core JavaScript */
const BUILT_IN_I18N = {
  zh: {
    brand: 'PrintHub',
    nav: { home: '首页', market: '市场', search: '搜索', upload: '上传', user: '用户', admin: '管理' },
    hero: {
      title: '让创意触手可及',
      subtitle: '高质量 3D 模型下载平台',
      desc: '10,000+ 精选模型，覆盖玩具、工具、家居、机械等全品类。支持 STL / OBJ / 3MF 格式，即刻下载打印。',
      searchPlaceholder: '搜索模型、创作者、标签...',
      ctaBrowse: '浏览模型',
      ctaLearn: '了解更多'
    },
    quick: { toy: '玩具', home: '家居', tools: '工具', parts: '机械' },
    cats: {
      toyModels: '玩具模型', homeGoods: '家居用品', toolParts: '工具配件', mechanical: '机械零件',
      desktop: '桌面摆件', holiday: '节日主题', diy: 'DIY改装', electronics: '电子配件'
    },
    sections: {
      about: '关于我们', hotModels: '热门模型', freeModels: '免费模型', newModels: '新品上架',
      vipModels: '会员专享', features: '核心功能', related: '相关推荐'
    },
    home: {
      title: '发现无限3D创意',
      desc: '10,000+ 精选高质量模型，覆盖玩具、工具、家居、机械等全品类。支持 STL / OBJ / 3MF 格式。',
      free: '免费模型', license: '商业授权', printing: '代打印服务'
    },
    search: {
      price: '价格', category: '分类', fileFormat: '文件格式', tags: '标签', difficulty: '打印难度',
      free: '免费', newest: '新品', vip: '会员专享', beginner: '入门', intermediate: '中级', advanced: '高级',
      apply: '应用筛选', reset: '重置', foundPrefix: '共找到', foundSuffix: '个模型',
      sortHot: '热门排序', sortNew: '最新上传', sortDownloads: '下载量', sortPriceLow: '价格从低到高',
      sortPriceHigh: '价格从高到低', sortRating: '评分最高', prev: '上一页', next: '下一页'
    },
    model: {
      free: '免费', hot: '热门', downloads: '次下载', reviews: '条评论', follow: '关注', freeLimited: '限时免费',
      download: '立即下载', licenseInfo: '授权信息', licenseType: '授权类型', personalLicense: '个人使用授权',
      commercialLicense: '商用授权', commercialPrice: '¥58 / 商业打印授权', fileFormat: '文件格式',
      printSize: '打印尺寸', printParams: '推荐打印参数', layerHeight: '层高', infill: '填充密度',
      wall: '壁厚', support: '支撑', noSupport: '不需要', nozzleTemp: '打印温度', bedTemp: '热床温度',
      printTime: '打印时间', filament: '耗材用量', tabDesc: '模型描述', tabVersions: '版本记录',
      tabReviews: '用户评价'
    },
    footer: {
      models: '模型', services: '服务', support: '支持', legal: '法律',
      desc: '高质量 3D 模型下载平台。',
      copyright: '© 2026 PrintHub 印模库. 保留所有权利.',
      tagline: '让 3D 模型更容易获得，让创意更快落地。'
    },
    theme: { dark: '切换黑色主题', light: '切换白色主题' }
  },
  en: {
    brand: 'PrintHub',
    nav: { home: 'Home', market: 'Market', search: 'Search', upload: 'Upload', user: 'User', admin: 'Admin' },
    hero: {
      title: 'Make Ideas Touchable',
      subtitle: 'High-quality 3D model marketplace',
      desc: '10,000+ curated models across toys, tools, home goods and mechanical parts. STL / OBJ / 3MF ready.',
      searchPlaceholder: 'Search models, creators, tags...',
      ctaBrowse: 'Browse Models',
      ctaLearn: 'Learn More'
    },
    quick: { toy: 'Toys', home: 'Home', tools: 'Tools', parts: 'Parts' },
    cats: {
      toyModels: 'Toy Models', homeGoods: 'Home Goods', toolParts: 'Tool Parts', mechanical: 'Mechanical Parts',
      desktop: 'Desk Decor', holiday: 'Holiday', diy: 'DIY Mods', electronics: 'Electronics'
    },
    sections: {
      about: 'About Us', hotModels: 'Hot Models', freeModels: 'Free Models', newModels: 'New Arrivals',
      vipModels: 'VIP Picks', features: 'Core Features', related: 'Related Picks'
    },
    home: {
      title: 'Discover Endless 3D Ideas',
      desc: '10,000+ curated high-quality models across toys, tools, home goods and mechanical parts. STL / OBJ / 3MF supported.',
      free: 'Free Models', license: 'Commercial License', printing: 'Print Service'
    },
    search: {
      price: 'Price', category: 'Category', fileFormat: 'File Format', tags: 'Tags', difficulty: 'Print Difficulty',
      free: 'Free', newest: 'New', vip: 'VIP Only', beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced',
      apply: 'Apply Filters', reset: 'Reset', foundPrefix: 'Found', foundSuffix: 'models',
      sortHot: 'Popular', sortNew: 'Newest', sortDownloads: 'Downloads', sortPriceLow: 'Price Low to High',
      sortPriceHigh: 'Price High to Low', sortRating: 'Top Rated', prev: 'Previous', next: 'Next'
    },
    model: {
      free: 'Free', hot: 'Hot', downloads: 'downloads', reviews: 'reviews', follow: 'Follow', freeLimited: 'Limited Free',
      download: 'Download Now', licenseInfo: 'License Info', licenseType: 'License Type', personalLicense: 'Personal Use',
      commercialLicense: 'Commercial License', commercialPrice: '$8 / commercial printing license', fileFormat: 'File Format',
      printSize: 'Print Size', printParams: 'Recommended Print Settings', layerHeight: 'Layer Height', infill: 'Infill',
      wall: 'Wall Thickness', support: 'Support', noSupport: 'Not needed', nozzleTemp: 'Nozzle Temp', bedTemp: 'Bed Temp',
      printTime: 'Print Time', filament: 'Filament', tabDesc: 'Description', tabVersions: 'Versions', tabReviews: 'Reviews'
    },
    footer: {
      models: 'Models', services: 'Services', support: 'Support', legal: 'Legal',
      desc: 'High-quality 3D model marketplace.',
      copyright: '© 2026 PrintHub. All rights reserved.',
      tagline: 'Make 3D models easier to get and ideas faster to print.'
    },
    theme: { dark: 'Switch to dark theme', light: 'Switch to light theme' }
  },
  ja: {
    brand: 'PrintHub',
    nav: { home: 'ホーム', market: 'マーケット', search: '検索', upload: 'アップロード', user: 'ユーザー', admin: '管理' },
    hero: {
      title: 'アイデアを形に',
      subtitle: '高品質3Dモデルマーケット',
      desc: '10,000以上の厳選モデル。玩具、工具、生活用品、機械部品まで対応。STL / OBJ / 3MFをすぐに印刷できます。',
      searchPlaceholder: 'モデル、クリエイター、タグを検索...',
      ctaBrowse: 'モデルを見る',
      ctaLearn: '詳しく見る'
    },
    quick: { toy: '玩具', home: '生活用品', tools: '工具', parts: '機械' },
    cats: {
      toyModels: '玩具モデル', homeGoods: '生活用品', toolParts: '工具パーツ', mechanical: '機械部品',
      desktop: 'デスク飾り', holiday: '季節テーマ', diy: 'DIY改造', electronics: '電子アクセサリ'
    },
    sections: {
      about: '私たちについて', hotModels: '人気モデル', freeModels: '無料モデル', newModels: '新着モデル',
      vipModels: 'VIP限定', features: '主な機能', related: '関連おすすめ'
    },
    home: {
      title: '無限の3Dアイデアを発見',
      desc: '10,000以上の高品質モデル。玩具、工具、生活用品、機械部品など幅広く対応。STL / OBJ / 3MFをサポート。',
      free: '無料モデル', license: '商用ライセンス', printing: '印刷代行'
    },
    search: {
      price: '価格', category: 'カテゴリ', fileFormat: 'ファイル形式', tags: 'タグ', difficulty: '印刷難易度',
      free: '無料', newest: '新着', vip: 'VIP限定', beginner: '入門', intermediate: '中級', advanced: '上級',
      apply: 'フィルター適用', reset: 'リセット', foundPrefix: '合計', foundSuffix: '件のモデル',
      sortHot: '人気順', sortNew: '新着順', sortDownloads: 'ダウンロード数', sortPriceLow: '価格の安い順',
      sortPriceHigh: '価格の高い順', sortRating: '評価順', prev: '前へ', next: '次へ'
    },
    model: {
      free: '無料', hot: '人気', downloads: 'ダウンロード', reviews: 'レビュー', follow: 'フォロー', freeLimited: '期間限定無料',
      download: '今すぐダウンロード', licenseInfo: 'ライセンス情報', licenseType: 'ライセンス種類', personalLicense: '個人利用',
      commercialLicense: '商用ライセンス', commercialPrice: '¥58 / 商用印刷ライセンス', fileFormat: 'ファイル形式',
      printSize: '印刷サイズ', printParams: '推奨印刷設定', layerHeight: 'レイヤー高', infill: 'インフィル',
      wall: '壁厚', support: 'サポート', noSupport: '不要', nozzleTemp: 'ノズル温度', bedTemp: 'ベッド温度',
      printTime: '印刷時間', filament: '材料使用量', tabDesc: 'モデル説明', tabVersions: 'バージョン', tabReviews: 'レビュー'
    },
    footer: {
      models: 'モデル', services: 'サービス', support: 'サポート', legal: '法律',
      desc: '高品質3Dモデルマーケット。',
      copyright: '© 2026 PrintHub. All rights reserved.',
      tagline: '3Dモデルをもっと手軽に、アイデアをもっと早く形に。'
    },
    theme: { dark: '黒テーマへ切替', light: '白テーマへ切替' }
  },
  ko: {
    brand: 'PrintHub',
    nav: { home: '홈', market: '마켓', search: '검색', upload: '업로드', user: '사용자', admin: '관리' },
    hero: {
      title: '창의력을 현실로',
      subtitle: '고품질 3D 모델 마켓',
      desc: '10,000개 이상의 엄선 모델. 장난감, 도구, 생활용품, 기계 부품까지 STL / OBJ / 3MF 지원.',
      searchPlaceholder: '모델, 크리에이터, 태그 검색...',
      ctaBrowse: '모델 보기',
      ctaLearn: '자세히'
    },
    quick: { toy: '장난감', home: '생활', tools: '도구', parts: '기계' },
    cats: {
      toyModels: '장난감 모델', homeGoods: '생활용품', toolParts: '도구 부품', mechanical: '기계 부품',
      desktop: '데스크 장식', holiday: '시즌 테마', diy: 'DIY 개조', electronics: '전자 액세서리'
    },
    sections: {
      about: '소개', hotModels: '인기 모델', freeModels: '무료 모델', newModels: '신규 모델',
      vipModels: 'VIP 전용', features: '핵심 기능', related: '관련 추천'
    },
    home: {
      title: '무한한 3D 아이디어 발견',
      desc: '10,000개 이상의 고품질 모델. 장난감, 도구, 생활용품, 기계 부품 등 STL / OBJ / 3MF 지원.',
      free: '무료 모델', license: '상업 라이선스', printing: '출력 대행'
    },
    search: {
      price: '가격', category: '카테고리', fileFormat: '파일 형식', tags: '태그', difficulty: '출력 난이도',
      free: '무료', newest: '신규', vip: 'VIP 전용', beginner: '입문', intermediate: '중급', advanced: '고급',
      apply: '필터 적용', reset: '초기화', foundPrefix: '총', foundSuffix: '개 모델',
      sortHot: '인기순', sortNew: '최신순', sortDownloads: '다운로드순', sortPriceLow: '낮은 가격순',
      sortPriceHigh: '높은 가격순', sortRating: '평점순', prev: '이전', next: '다음'
    },
    model: {
      free: '무료', hot: '인기', downloads: '다운로드', reviews: '리뷰', follow: '팔로우', freeLimited: '한정 무료',
      download: '바로 다운로드', licenseInfo: '라이선스 정보', licenseType: '라이선스 유형', personalLicense: '개인 사용',
      commercialLicense: '상업 라이선스', commercialPrice: '¥58 / 상업 출력 라이선스', fileFormat: '파일 형식',
      printSize: '출력 크기', printParams: '추천 출력 설정', layerHeight: '레이어 높이', infill: '채움 밀도',
      wall: '벽 두께', support: '서포트', noSupport: '필요 없음', nozzleTemp: '노즐 온도', bedTemp: '베드 온도',
      printTime: '출력 시간', filament: '필라멘트', tabDesc: '모델 설명', tabVersions: '버전 기록', tabReviews: '사용자 리뷰'
    },
    footer: {
      models: '모델', services: '서비스', support: '지원', legal: '법률',
      desc: '고품질 3D 모델 마켓.',
      copyright: '© 2026 PrintHub. All rights reserved.',
      tagline: '3D 모델을 더 쉽게 얻고 아이디어를 더 빠르게 출력하세요.'
    },
    theme: { dark: '검은 테마로 전환', light: '흰 테마로 전환' }
  }
};

const I18n = {
  currentLang: 'zh',
  data: { ...BUILT_IN_I18N },
  async load(lang) {
    try {
      const res = await fetch(`assets/i18n/${lang}.json`);
      if (res.ok) this.data[lang] = { ...BUILT_IN_I18N[lang], ...(await res.json()) };
    } catch (e) {
      console.info('i18n fallback in use:', e?.message || e);
    } finally {
      this.currentLang = lang;
      this.apply();
      document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang === 'en' ? 'en' : lang === 'ja' ? 'ja' : 'ko';
    }
  },
  apply() {
    const t = this.data[this.currentLang];
    if (!t) return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const val = this.getValue(t, el.getAttribute('data-i18n'));
      if (val) el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const val = this.getValue(t, el.getAttribute('data-i18n-placeholder'));
      if (val) el.placeholder = val;
    });
    this.applyCommon(t);
    Theme.updateLabel();
  },
  getValue(obj, path) { return path.split('.').reduce((o, p) => o?.[p], obj); },
  setLang(lang) {
    this.load(lang);
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
    document.querySelectorAll('.lang-dropdown-item').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
    document.getElementById('langDropdown')?.classList.remove('show');
    const globe = document.querySelector('.lang-btn-globe');
    globe?.classList.remove('active');
    globe?.setAttribute('aria-expanded', 'false');
    localStorage.setItem('printhub-lang', lang);
  },
  applyCommon(t) {
    const set = (selector, value) => document.querySelectorAll(selector).forEach(el => { if (value) el.textContent = value; });
    const placeholder = (selector, value) => document.querySelectorAll(selector).forEach(el => { if (value) el.placeholder = value; });

    set('.left-nav-item[href="index.html"] .label', t.nav.home);
    set('.left-nav-item[href="home.html"] .label', t.nav.market);
    set('.left-nav-item[href="search.html"] .label', t.nav.search);
    const userLinks = document.querySelectorAll('.left-nav-item[href="user.html"] .label');
    userLinks.forEach((el, index) => { el.textContent = index === 0 ? t.nav.upload : t.nav.user; });
    placeholder('.top-bar-search', t.hero.searchPlaceholder);
    set('.search-cat-tag[href*="cat=toy"]', t.quick.toy);
    set('.search-cat-tag[href*="cat=home"]', t.quick.home);
    set('.search-cat-tag[href*="cat=tools"]', t.quick.tools);
    set('.search-cat-tag[href*="cat=parts"]', t.quick.parts);

    set('.footer-desc', t.footer.desc);
    document.querySelectorAll('.footer-title').forEach((el, index) => {
      const values = [t.footer.models, t.footer.services, t.footer.support, t.footer.legal];
      if (values[index - 1]) el.textContent = values[index - 1];
    });
    const footers = document.querySelectorAll('.footer-copyright');
    if (footers[0]) footers[0].textContent = t.footer.copyright;
    if (footers[1]) footers[1].textContent = t.footer.tagline;

    setByText({
      '玩具模型': t.cats.toyModels, '家居用品': t.cats.homeGoods, '工具配件': t.cats.toolParts,
      '机械零件': t.cats.mechanical, '桌面摆件': t.cats.desktop, '节日主题': t.cats.holiday,
      'DIY改装': t.cats.diy, '电子配件': t.cats.electronics, '热门模型': t.sections.hotModels,
      '免费模型': t.sections.freeModels, '新品上架': t.sections.newModels, '会员专享': t.sections.vipModels,
      '核心功能': t.sections.features, '相关推荐': t.sections.related, '价格': t.search.price,
      '分类': t.search.category, '文件格式': t.search.fileFormat, '标签': t.search.tags,
      '打印难度': t.search.difficulty, '新品': t.search.newest, '入门': t.search.beginner,
      '中级': t.search.intermediate, '高级': t.search.advanced, '应用筛选': t.search.apply,
      '重置': t.search.reset, '热门排序': t.search.sortHot, '最新上传': t.search.sortNew,
      '下载量': t.search.sortDownloads, '价格从低到高': t.search.sortPriceLow,
      '价格从高到低': t.search.sortPriceHigh, '评分最高': t.search.sortRating,
      '上一页': t.search.prev, '下一页': t.search.next, '关注': t.model.follow,
      '限时免费': t.model.freeLimited, '立即下载': t.model.download, '授权信息': t.model.licenseInfo,
      '授权类型': t.model.licenseType, '个人使用授权': t.model.personalLicense,
      '商用授权': t.model.commercialLicense, '文件格式': t.model.fileFormat, '打印尺寸': t.model.printSize,
      '推荐打印参数': t.model.printParams, '层高': t.model.layerHeight, '填充密度': t.model.infill,
      '壁厚': t.model.wall, '支撑': t.model.support, '不需要': t.model.noSupport,
      '打印温度': t.model.nozzleTemp, '热床温度': t.model.bedTemp, '打印时间': t.model.printTime,
      '耗材用量': t.model.filament, '模型描述': t.model.tabDesc, '版本记录': t.model.tabVersions,
      '用户评价': t.model.tabReviews
    });

    const heroTitle = document.querySelector('.hero-text h1');
    if (heroTitle) heroTitle.innerHTML = t.home.title.replace('3D', '<span class="accent">3D</span>');
    const heroDesc = document.querySelector('.hero-text p');
    if (heroDesc) heroDesc.textContent = t.home.desc;
    const heroBadges = document.querySelectorAll('.hero-badge');
    [t.home.free, t.home.license, t.home.printing].forEach((value, index) => {
      if (heroBadges[index]) heroBadges[index].lastChild.textContent = value;
    });
  },
  init() { this.load(localStorage.getItem('printhub-lang') || 'zh'); }
};

function setByText(map) {
  const alternates = Object.fromEntries(
    Object.keys(map).map(source => [source, getI18nAlternates(source)])
  );
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const raw = node.nodeValue;
    const trimmed = raw.trim().replace(/^[^\p{L}\p{N}]+/u, '').trim();
    const source = Object.keys(map).find(key => trimmed === key || alternates[key].includes(trimmed));
    if (!source) return;
    node.nodeValue = raw.replace(trimmed, map[source]);
  });
}

function getI18nAlternates(source) {
  const paths = [];
  const walk = (obj, path = []) => {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'string') {
        if (value === source) paths.push([...path, key]);
      } else if (value && typeof value === 'object') {
        walk(value, [...path, key]);
      }
    });
  };
  walk(BUILT_IN_I18N.zh);
  return paths.flatMap(path => Object.values(BUILT_IN_I18N).map(lang => path.reduce((obj, key) => obj?.[key], lang))).filter(Boolean);
}

const Theme = {
  current: 'light',
  init() {
    this.current = localStorage.getItem('printhub-theme') || 'light';
    this.apply(this.current);
    this.mountButton();
  },
  apply(theme) {
    this.current = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.current);
    localStorage.setItem('printhub-theme', this.current);
    this.updateLogo();
    this.updateLabel();
  },
  toggle() { this.apply(this.current === 'dark' ? 'light' : 'dark'); },
  mountButton() {
    if (document.querySelector('.theme-toggle')) return;
    const topBar = document.querySelector('.top-bar');
    if (!topBar) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    btn.innerHTML = '<span class="theme-toggle-icon" aria-hidden="true"></span>';
    btn.addEventListener('click', () => this.toggle());
    const user = topBar.querySelector('.top-bar-user');
    topBar.insertBefore(btn, user || null);
    this.updateLabel();
  },
  updateLogo() {
    const src = this.current === 'dark' ? 'assets/logo-dark.png' : 'assets/logo.png';
    document.querySelectorAll('img[src*="assets/logo"]').forEach(img => {
      img.src = src;
    });
  },
  updateLabel() {
    const btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    const t = I18n.data[I18n.currentLang] || BUILT_IN_I18N.zh;
    const isDark = this.current === 'dark';
    btn.setAttribute('aria-label', isDark ? t.theme.light : t.theme.dark);
    btn.setAttribute('title', isDark ? t.theme.light : t.theme.dark);
    btn.querySelector('.theme-toggle-icon').textContent = isDark ? '☀' : '☾';
  }
};

// Scroll reveal
const ScrollAnim = {
  observer: null,
  init() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); this.observer.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('.scroll-reveal').forEach(el => this.observer.observe(el));
  }
};

// Counter animation
const CounterAnim = {
  init() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target, target = parseInt(el.dataset.count), dur = 2000, start = performance.now();
          const step = (now) => {
            const p = Math.min((now - start) / dur, 1), v = Math.round(target * (1 - Math.pow(1 - p, 3)));
            el.textContent = v.toLocaleString() + (target === 98 ? '%' : target === 24 ? 'h' : '+');
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step); obs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-count]').forEach(el => obs.observe(el));
  }
};

// Parallax
function initParallax() {
  const grid = document.querySelector('.printer-grid-bg');
  if (!grid) return;
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 8;
    const y = (e.clientY / window.innerHeight - 0.5) * 8;
    grid.style.transform = `translate(${x}px, ${y}px)`;
  });
}

// Smooth scroll
function toggleLangDropdown() {
  const d = document.getElementById('langDropdown');
  if (!d) return;
  d.classList.toggle('show');
  const globe = document.querySelector('.lang-btn-globe');
  globe?.classList.toggle('active', d.classList.contains('show'));
  globe?.setAttribute('aria-expanded', d.classList.contains('show') ? 'true' : 'false');
}

// Mobile nav toggle
function toggleMobileNav() {
  const nav = document.querySelector('.left-nav');
  const btn = document.querySelector('.mobile-nav-toggle');
  if (!nav || !btn) return;
  nav.classList.toggle('open');
  btn.classList.toggle('active');
}

// Close lang dropdown when clicking outside
document.addEventListener('click', (e) => {
  const dd = document.getElementById('langDropdown');
  const btn = document.querySelector('.lang-btn-globe');
  if (dd && btn && !btn.contains(e.target) && !dd.contains(e.target)) {
    dd.classList.remove('show');
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
  }
});

function initTopSearch() {
  const input = document.querySelector('.top-bar-search');
  const button = document.querySelector('.top-bar-search-btn');
  if (!input || !button) return;
  const go = () => {
    const q = input.value.trim();
    window.location.href = q ? `search.html?q=${encodeURIComponent(q)}` : 'search.html';
  };
  button.addEventListener('click', go);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') go();
  });
}

/* ====== PrintHub API & Render Helpers ====== */
const PrintHub = {
  async api(path) {
    const res = await fetch(path);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || '请求失败');
    return data;
  },

  formatPrice(price) {
    const p = Number(price || 0);
    if (p <= 0) return '免费';
    return `¥${p % 1 === 0 ? p : p.toFixed(2)}`;
  },

  categoryEmoji(cat) {
    const map = { '玩具':'🧸', '家居':'🏠', '工具':'🛠️', '机械':'⚙️', '摆件':'🎨', '电子':'📱', 'DIY':'🔧', '节日':'🎄' };
    return map[cat] || '📦';
  },

  renderStars(rating) {
    const r = Math.round(Number(rating || 4.5));
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  },

  renderModelCard(model) {
    const price = Number(model.price || 0);
    const priceClass = price <= 0 ? 'free' : '';
    const priceLabel = this.formatPrice(price);
    const hasSvgImg = model.image && (model.image.startsWith('assets/') || model.image.startsWith('data/'));
        const emoji = (!hasSvgImg) ? (model.image || this.categoryEmoji(model.category)) : '';
    const tags = (model.tags || '').split(',').map(t => t.trim()).filter(Boolean);
    const isFree = price <= 0;
    const isNew = tags.includes('新品');
    const isVip = tags.includes('VIP') || model.license_type === 'commercial';

    return `
      <a href="model.html?id=${model.id}" class="model-card scroll-reveal">
        <div class="img-wrap">
          ${hasSvgImg ? `<img src="${model.image}" style="width:100%;height:100%;object-fit:cover;" alt="">` : `<div class="placeholder">${emoji}</div>`}
          ${(isFree || isNew || isVip) ? `<div class="badges">
            ${isFree ? '<span class="badge badge-free">免费</span>' : ''}
            ${isNew ? '<span class="badge badge-new">新品</span>' : ''}
            ${isVip ? '<span class="badge badge-vip">VIP</span>' : ''}
          </div>` : ''}
          <span class="format-tag">${model.file_format || 'STL'}</span>
        </div>
        <div class="info">
          <div class="title">${model.title}</div>
          <div class="meta">
            <span class="rating">${this.renderStars(model.rating)} ${Number(model.rating || 4.5).toFixed(1)}</span>
            <span class="downloads">⬇ ${Number(model.downloads || 0).toLocaleString()}</span>
          </div>
          <div class="bottom">
            <div class="author">
              <div class="author-avatar">${(model.author || '?')[0]}</div>
              <span class="author-name">${model.author || '未知'}</span>
            </div>
            <div class="price ${priceClass}">${priceLabel}</div>
          </div>
        </div>
      </a>`;
  },

  async loadModelCards(container, params = {}) {
    const query = new URLSearchParams(params).toString();
    const data = await this.api(`/api/models?${query}`);
    if (container) {
      container.innerHTML = data.models.map(m => this.renderModelCard(m)).join('');
    }
    return data;
  },

  getUrlParam(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }
};

/* ====== User Auth State ====== */
PrintHub.User = {
  _user: null,

  async init() {
    // Try to get user from session cookie
    try {
      const data = await PrintHub.api('/api/user/me');
      this._user = data.user;
    } catch (e) {
      this._user = null;
    }
    this.updateUI();
    return this._user;
  },

  get() { return this._user; },
  isLoggedIn() { return !!this._user; },

  updateUI() {
    const userLink = document.querySelector('.top-bar-user');
    if (userLink) {
      if (this._user) {
        userLink.textContent = (this._user.avatar || this._user.username || 'U')[0].toUpperCase();
        userLink.title = this._user.username;
        userLink.href = 'user.html';
      } else {
        userLink.textContent = '登';
        userLink.title = '登录';
        userLink.href = 'login.html';
      }
    }
  },

  async logout() {
    try {
      await fetch('/api/user/logout', { method: 'POST', credentials: 'same-origin' });
    } catch(e) {}
    this._user = null;
    this.updateUI();
    window.location.href = 'index.html';
  }
};

// Page view tracking
(function() {
  try {
    fetch('/api/track', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({page: location.pathname, referrer: document.referrer}),
    }).catch(function(){});
  } catch(e) {}
})();

document.addEventListener('DOMContentLoaded', () => {
  try { Theme.init(); } catch(e) { console.warn('Theme init error:', e); }
  try { I18n.init(); } catch(e) { console.warn('I18n init error:', e); }
  try { ScrollAnim.init(); } catch(e) { console.warn('ScrollAnim init error:', e); }
  try { CounterAnim.init(); } catch(e) { console.warn('CounterAnim init error:', e); }
  try { initParallax(); } catch(e) { console.warn('Parallax init error:', e); }
  try { initTopSearch(); } catch(e) { console.warn('TopSearch init error:', e); }
  PrintHub.User.init();
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
  window.dispatchEvent(new CustomEvent('printhub-ready'));
});
