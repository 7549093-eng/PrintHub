-- PrintHub Database Schema
-- Run this in Supabase SQL Editor (https://app.supabase.com → SQL Editor)

-- ════════════════════════════════════════════════════════════
-- 1. Profiles (extends Supabase Auth users)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ════════════════════════════════════════════════════════════
-- 2. Products
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('restaurant', 'party', 'desk')),
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image TEXT,
  title_zh TEXT, title_en TEXT, title_ja TEXT, title_ko TEXT,
  meta_zh TEXT, meta_en TEXT, meta_ja TEXT, meta_ko TEXT,
  stats_zh TEXT, stats_en TEXT, stats_ja TEXT, stats_ko TEXT,
  tag TEXT DEFAULT 'STL',
  formats TEXT[] DEFAULT '{stl,3mf}',
  difficulty TEXT DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium')),
  file_paths TEXT[] DEFAULT '{}',  -- paths in Supabase Storage
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 3. Bundles
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.bundles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image TEXT,
  title_zh TEXT, title_en TEXT, title_ja TEXT, title_ko TEXT,
  description_zh TEXT, description_en TEXT, description_ja TEXT, description_ko TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 4. Orders
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
  payment_provider TEXT,
  payment_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id),
  bundle_id UUID REFERENCES public.bundles(id),
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER DEFAULT 1
);

-- ════════════════════════════════════════════════════════════
-- 5. Downloads
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.user_downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  order_id UUID REFERENCES public.orders(id) NOT NULL,
  product_id UUID REFERENCES public.products(id),
  file_path TEXT NOT NULL,
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 6. Leads (email capture for free models)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  source TEXT DEFAULT 'free_download',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 7. Service Requests (custom STL quotes)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  request_type TEXT,
  budget TEXT,
  project_details TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'quoted', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════
-- 8. Admin Settings (UI content override)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  lang TEXT NOT NULL CHECK (lang IN ('zh', 'en', 'ja', 'ko')),
  value TEXT,
  UNIQUE(key, lang)
);

-- ════════════════════════════════════════════════════════════
-- RLS (Row Level Security)
-- ════════════════════════════════════════════════════════════
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Products: anyone can read published
CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT USING (is_published = true);

-- Products: only admins can insert/update/delete
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Bundles: anyone can read
CREATE POLICY "Bundles are viewable by everyone" ON public.bundles
  FOR SELECT USING (true);

-- Bundles: admins only for write
CREATE POLICY "Admins can manage bundles" ON public.bundles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Orders: users can view their own
CREATE POLICY "Users view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- Orders: insert for authenticated users
CREATE POLICY "Users create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order Items: read through orders
CREATE POLICY "Users view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid())
  );

-- Downloads: users view their own
CREATE POLICY "Users view own downloads" ON public.user_downloads
  FOR SELECT USING (auth.uid() = user_id);

-- Leads: insert for everyone (for email capture)
CREATE POLICY "Anyone can submit lead" ON public.leads
  FOR INSERT WITH CHECK (true);

-- Service Requests: insert for everyone
CREATE POLICY "Anyone can submit request" ON public.service_requests
  FOR INSERT WITH CHECK (true);

-- Admin Settings: anyone can read
CREATE POLICY "Admin settings viewable" ON public.admin_settings
  FOR SELECT USING (true);

-- Profiles: users can read their own, admins can read all
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- ════════════════════════════════════════════════════════════
-- Storage Buckets (run separately in Supabase Dashboard → Storage)
-- ════════════════════════════════════════════════════════════
-- 1. Create bucket: stl-files (private - only accessible via signed URLs)
-- 2. Create bucket: product-images (public - for product thumbnails)
-- 3. Create bucket: site-assets (public - for logo, etc.)

-- ════════════════════════════════════════════════════════════
-- Seed Data: Insert default products from MVP
-- ════════════════════════════════════════════════════════════
INSERT INTO public.products (code, category, price, image, title_zh, title_en, title_ja, title_ko, meta_zh, meta_en, meta_ja, meta_ko, stats_zh, stats_en, stats_ja, stats_ko, tag, formats, difficulty) VALUES
('R001', 'restaurant', 0, '/assets/thumb-restaurant.png', '简约桌号牌 1-5', 'Simple Table Number Sign 1-5', 'シンプル卓番サイン 1-5', '심플 테이블 번호 사인 1-5', '适合餐厅和咖啡店的免支撑 PLA 桌号牌。', 'No-support PLA table signs for restaurants and cafes.', 'レストランやカフェ向けのサポート不要PLA卓番サイン。', '레스토랑과 카페용 서포트 없는 PLA 테이블 번호 사인.', '可编辑商品', 'Editable product', '編集可能な商品', '수정 가능한 상품', 'freePrice', '{stl,3mf}', 'easy'),
('R003', 'restaurant', 0, '/assets/thumb-restaurant.png', '二维码桌牌', 'QR Code Table Sign', 'QRコード卓上サイン', 'QR 코드 테이블 사인', '适合菜单、点餐和促销链接的小型桌面支架。', 'Small counter-friendly holder for menus, ordering, and promos.', 'メニュー、注文、プロモーション用の小型スタンド。', '메뉴, 주문, 프로모션 링크용 소형 테이블 홀더.', '可编辑商品', 'Editable product', '編集可能な商品', '수정 가능한 상품', 'freePrice', '{stl,3mf}', 'easy'),
('R002', 'restaurant', 4.99, '/assets/thumb-restaurant.png', '现代桌号套装 1-50', 'Modern Table Number Set 1-50', 'モダン卓番セット 1-50', '모던 테이블 번호 세트 1-50', '完整数字套装，适合低成本批量打印。', 'Complete printable number set with clean modern styling.', 'すっきりした現代的な番号セット。', '깔끔한 스타일의 전체 번호 출력 세트.', '可编辑商品', 'Editable product', '編集可能な商品', '수정 가능한 상품', 'sortFeatured', '{stl,3mf}', 'easy'),
('R004', 'restaurant', 4.99, '/assets/thumb-restaurant.png', '高级二维码支架包', 'Premium QR Code Holder Pack', 'プレミアムQRホルダーパック', '프리미엄 QR 코드 홀더 팩', '菜单、支付、评价链接等多种支架样式。', 'Multiple holder styles for menus, payment, and review links.', 'メニュー、決済、レビューリンク向けの複数スタイル。', '메뉴, 결제, 리뷰 링크용 다양한 홀더 스타일.', '可编辑商品', 'Editable product', '編集可能な商品', '수정 가능한 상품', 'STL', '{stl,3mf}', 'easy'),
('R005', 'restaurant', 2.99, '/assets/thumb-restaurant.png', '菜单展示架', 'Menu Stand', 'メニュースタンド', '메뉴 스탠드', '稳定、快速、低成本打印的菜单支架。', 'A stable menu stand designed for quick low-cost printing.', '短時間・低コストで印刷できる安定したスタンド。', '빠르고 저렴하게 출력할 수 있는 안정적인 메뉴 스탠드.', '可编辑商品', 'Editable product', '編集可能な商品', '수정 가능한 상품', 'STL', '{stl,3mf}', 'easy'),
('B001', 'party', 0, '/assets/thumb-party.png', '简约生日蛋糕插牌', 'Simple Happy Birthday Cake Topper', 'シンプル誕生日ケーキトッパー', '심플 생일 케이크 토퍼', '适合家庭和派对布置的易打印插牌。', 'Easy printable topper for party decorators and families.', '家庭やパーティー装飾向けの印刷しやすいトッパー。', '가족과 파티 장식에 쓰기 쉬운 출력용 토퍼.', '可编辑商品', 'Editable product', '編集可能な商品', '수정 가능한 상품', 'freePrice', '{stl,3mf}', 'easy'),
('B003', 'party', 3.99, '/assets/thumb-party.png', '数字蛋糕插牌 0-9', 'Number Cake Topper 0-9', '数字ケーキトッパー 0-9', '숫자 케이크 토퍼 0-9', '生日和纪念日可复用的数字套装。', 'Reusable number set for birthday and anniversary cakes.', '誕生日や記念日ケーキに使える数字セット。', '생일과 기념일 케이크용 재사용 숫자 세트.', '可编辑商品', 'Editable product', '編集可能な商品', '수정 가능한 상품', 'catParty', '{stl,3mf}', 'easy'),
('B004', 'party', 0, '/assets/thumb-party.png', '派对杯姓名牌', 'Party Cup Name Tag', 'パーティーカップ名札', '파티 컵 이름표', '适合杯子、伴手礼和餐桌布置的快速打印标签。', 'Fast-print tags for party cups, favors, and table settings.', 'カップ、ギフト、テーブル用の短時間印刷タグ。', '컵, 답례품, 테이블 세팅용 빠른 출력 태그.', '可编辑商品', 'Editable product', '編集可能な商品', '수정 가능한 상품', 'freePrice', '{stl,3mf}', 'easy'),
('B010', 'party', 9.99, '/assets/thumb-party.png', '派对装饰套装', 'Party Decoration Pack', 'パーティー装飾パック', '파티 장식 팩', '蛋糕插牌、桌牌、礼品标签和拍照道具。', 'Cake toppers, signs, favor tags, and photo booth props.', 'ケーキトッパー、サイン、タグ、撮影小物。', '케이크 토퍼, 사인, 선물 태그, 포토 부스 소품.', '可编辑商品', 'Editable product', '編集可能な商品', '수정 가능한 상품', 'bundleLabel', '{stl,3mf}', 'easy'),
('D001', 'desk', 0, '/assets/thumb-desk.png', '简约手机支架', 'Simple Phone Stand', 'シンプルスマホスタンド', '심플 폰 스탠드', '适合手机和平板的紧凑桌面支架。', 'Compact desktop phone stand for phones and small tablets.', 'スマホや小型タブレット向けのコンパクトスタンド。', '휴대폰과 소형 태블릿용 컴팩트 데스크 스탠드.', '可编辑商品', 'Editable product', '編集可能な商品', '수정 가능한 상품', 'freePrice', '{stl,3mf}', 'easy'),
('D003', 'desk', 0, '/assets/thumb-desk.png', '线夹套装', 'Cable Clip Set', 'ケーブルクリップセット', '케이블 클립 세트', '多种尺寸桌面线夹，适合 PLA 快速打印。', 'Desk cable clips in multiple sizes for quick PLA printing.', '複数サイズのデスク用ケーブルクリップ。', '빠른 PLA 출력용 다양한 크기의 케이블 클립.', '可编辑商品', 'Editable product', '編集可能な商品', '수정 가능한 상품', 'freePrice', '{stl,3mf}', 'easy'),
('D002', 'desk', 4.99, '/assets/thumb-desk.png', '高级可调手机支架', 'Premium Adjustable Phone Stand', 'プレミアム調整式スマホスタンド', '프리미엄 조절식 폰 스탠드', '角度可调升级款，可选择商业授权。', 'Upgraded stand with adjustable angle and commercial license option.', '角度調整可能な上位版、商用オプションあり。', '각도 조절이 가능한 업그레이드 스탠드, 상업용 옵션 포함.', '可编辑商品', 'Editable product', '編集可能な商品', '수정 가능한 상품', 'sortFeatured', '{stl,3mf}', 'easy'),
('D004', 'desk', 3.99, '/assets/thumb-desk.png', '耳机支架', 'Headphone Stand', 'ヘッドホンスタンド', '헤드폰 스탠드', '适合游戏桌和办公室的立式耳机支架。', 'Clean vertical headphone stand for gaming and office desks.', 'ゲームデスクやオフィス向けの縦型スタンド。', '게임 및 사무용 데스크에 어울리는 세로형 헤드폰 스탠드.', '可编辑商品', 'Editable product', '編集可能な商品', '수정 가능한 상품', 'STL', '{stl,3mf}', 'easy'),
('D007', 'desk', 2.99, '/assets/thumb-desk.png', '产品展示架', 'Product Display Stand', '商品ディスプレイスタンド', '제품 디스플레이 스탠드', '适合卡片、商品和价格标签的小商家展示架。', 'Small business display stand for cards, products, and pricing.', 'カード、商品、価格表示に使える小規模店舗向けスタンド。', '카드, 제품, 가격표에 쓰는 소상공인용 디스플레이 스탠드.', '可编辑商品', 'Editable product', '編集可能な商品', '수정 가능한 상품', 'catDesk', '{stl,3mf}', 'easy');

-- Seed bundles
INSERT INTO public.bundles (price, image, title_zh, title_en, title_ja, title_ko, description_zh, description_en, description_ja, description_ko) VALUES
(9.99, '/assets/thumb-bundle.png', '餐厅启动套装', 'Restaurant Starter Pack', 'レストランスターターパック', '레스토랑 스타터 팩', '桌号、二维码支架、预留牌和菜单架，适合咖啡店和小餐厅。', 'Table numbers, QR holders, reserved signs, and menu stands for cafes and small restaurants.', '卓番、QRホルダー、予約席サイン、メニュースタンドのセット。', '테이블 번호, QR 홀더, 예약 사인, 메뉴 스탠드 구성.'),
(14.99, '/assets/thumb-party.png', '生日派对套装', 'Birthday Party Pack', '誕生日パーティーパック', '생일 파티 팩', '蛋糕插牌、杯子标签、数字插牌、礼品标签和派对钥匙扣模板。', 'Cake toppers, cup tags, number toppers, gift tags, and party favor keychain templates.', 'ケーキトッパー、カップタグ、数字トッパー、ギフトタグ。', '케이크 토퍼, 컵 태그, 숫자 토퍼, 선물 태그 구성.'),
(19.99, '/assets/thumb-desk.png', '桌面商业展示套装', 'Desk Setup Business Pack', 'デスク・店舗展示パック', '데스크 비즈니스 디스플레이 팩', '手机支架、线夹、产品展示架、价格牌和收纳模型。', 'Phone stands, cable clips, product display stands, price holders, and organizer files.', 'スマホスタンド、クリップ、商品スタンド、価格札ホルダー。', '폰 스탠드, 케이블 클립, 제품 스탠드, 가격표 홀더 구성.');
