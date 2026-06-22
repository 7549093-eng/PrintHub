#!/usr/bin/env python3
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
import sqlite3
import time
import urllib.parse
from http import cookies
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
DB_PATH = DATA_DIR / "printhub.db"
UPLOAD_DIR = DATA_DIR / "uploads"
ALLOWED_EXTS = {".stl", ".obj", ".3mf", ".zip", ".step", ".stp"}
MAX_UPLOAD_SIZE = 100 * 1024 * 1024  # 100MB
SESSION_COOKIE = "printhub_admin_session"
USER_SESSION_COOKIE = "printhub_session"
SESSION_TTL = 60 * 60 * 12

ADMIN_USERNAME = os.environ.get("PRINTHUB_ADMIN_USER", "admin")
ADMIN_PASSWORD = os.environ.get("PRINTHUB_ADMIN_PASSWORD", "PrintHub2026!")


def json_response(handler: SimpleHTTPRequestHandler, payload, status=200):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def hash_password(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120_000)
    return f"{salt}${base64.b64encode(digest).decode('ascii')}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt, digest = stored.split("$", 1)
    except ValueError:
        return False
    expected = hash_password(password, salt).split("$", 1)[1]
    return hmac.compare_digest(expected, digest)


def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    DATA_DIR.mkdir(exist_ok=True)
    with db() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS admins (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              username TEXT UNIQUE NOT NULL,
              password_hash TEXT NOT NULL,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS sessions (
              token TEXT PRIMARY KEY,
              admin_id INTEGER NOT NULL,
              expires_at INTEGER NOT NULL,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY(admin_id) REFERENCES admins(id)
            );
            CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              username TEXT UNIQUE NOT NULL,
              email TEXT NOT NULL DEFAULT '',
              password_hash TEXT NOT NULL,
              avatar TEXT NOT NULL DEFAULT 'U',
              bio TEXT NOT NULL DEFAULT '',
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS user_sessions (
              token TEXT PRIMARY KEY,
              user_id INTEGER NOT NULL,
              expires_at INTEGER NOT NULL,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY(user_id) REFERENCES users(id)
            );
            CREATE TABLE IF NOT EXISTS models (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              title TEXT NOT NULL,
              category TEXT NOT NULL,
              price REAL NOT NULL DEFAULT 0,
              file_format TEXT NOT NULL DEFAULT 'STL',
              downloads INTEGER NOT NULL DEFAULT 0,
              status TEXT NOT NULL DEFAULT 'on',
              image TEXT NOT NULL DEFAULT '',
              file_path TEXT NOT NULL DEFAULT '',
              author TEXT NOT NULL DEFAULT '未知作者',
              description TEXT NOT NULL DEFAULT '',
              rating REAL NOT NULL DEFAULT 4.5,
              rating_count INTEGER NOT NULL DEFAULT 0,
              tags TEXT NOT NULL DEFAULT '',
              license_type TEXT NOT NULL DEFAULT 'personal',
              print_params TEXT NOT NULL DEFAULT '{}',
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        # Migrate old tables that may lack new columns
        for col, col_def in [
            ("author", "TEXT NOT NULL DEFAULT '未知作者'"),
            ("description", "TEXT NOT NULL DEFAULT ''"),
            ("rating", "REAL NOT NULL DEFAULT 4.5"),
            ("rating_count", "INTEGER NOT NULL DEFAULT 0"),
            ("tags", "TEXT NOT NULL DEFAULT ''"),
            ("license_type", "TEXT NOT NULL DEFAULT 'personal'"),
            ("print_params", "TEXT NOT NULL DEFAULT '{}'"),
            ("file_path", "TEXT NOT NULL DEFAULT ''"),
        ]:
            try:
                conn.execute(f"ALTER TABLE models ADD COLUMN {col} {col_def}")
            except sqlite3.OperationalError:
                pass  # column already exists

        admin = conn.execute("SELECT id FROM admins WHERE username = ?", (ADMIN_USERNAME,)).fetchone()
        if not admin:
            conn.execute(
                "INSERT INTO admins (username, password_hash) VALUES (?, ?)",
                (ADMIN_USERNAME, hash_password(ADMIN_PASSWORD)),
            )
        # Seed test user
        test_user = conn.execute("SELECT id FROM users WHERE username = ?", ("user",)).fetchone()
        if not test_user:
            conn.execute(
                "INSERT INTO users (username, email, password_hash, avatar, bio) VALUES (?, ?, ?, ?, ?)",
                ("user", "user@printhub.com", hash_password("user123"), "U", "3D打印爱好者"),
            )
        count = conn.execute("SELECT COUNT(*) AS n FROM models").fetchone()["n"]
        if count == 0:
            conn.executemany(
                """
                INSERT INTO models (title, category, price, file_format, downloads, status, image,
                                    author, description, rating, rating_count, tags, license_type, print_params)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    ("可活动关节小熊", "玩具", 0, "STL", 3240, "on", "🧸",
                     "ArtMaker", "精心设计的多关节可活动小熊模型，无需支撑即可打印，14处可活动关节包括头部、四肢、尾巴。优化壁厚，保证强度同时节省耗材。已验证打印成功率98%。", 4.9, 86,
                     "免费,热门,关节", "personal",
                     '{"layer_height":"0.2mm","infill":"15%-20%","wall":"0.8mm","support":"不需要","nozzle_temp":"200°C-210°C","bed_temp":"60°C","print_time":"约4小时","filament":"约45g","size":"120×80×95mm"}'),
                    ("模块化桌面收纳盒", "家居", 12, "STL", 1890, "on", "🏠",
                     "DesignLab", "模块化设计，自由组合拼接。包含笔筒、手机支架、小物件托盘三个模块，可单独使用或拼接成完整收纳系统。打印简单，适合新手。", 4.8, 52,
                     "新品,模块化,收纳", "personal",
                     '{"layer_height":"0.2mm","infill":"10%-15%","wall":"1.2mm","support":"不需要","nozzle_temp":"200°C","bed_temp":"60°C","print_time":"约6小时","filament":"约120g","size":"180×120×100mm"}'),
                    ("多功能手机支架", "工具", 0, "STL", 5120, "on", "🛠️",
                     "PrintMaster", "可调节角度手机支架，支持横竖屏切换，底部预留充电线槽。结构简单，打印无需支撑，30分钟即可完成。", 4.6, 128,
                     "免费,手机,支架", "personal",
                     '{"layer_height":"0.2mm","infill":"20%","wall":"1.6mm","support":"不需要","nozzle_temp":"200°C","bed_temp":"50°C","print_time":"约30分钟","filament":"约25g","size":"80×60×15mm"}'),
                    ("行星齿轮减速箱", "机械", 35, "STL", 2560, "on", "⚙️",
                     "EngineerX", "全3D打印行星齿轮减速箱，减速比5:1，无需额外零件。包含太阳轮、行星轮、齿圈和输出轴，装配后即可运转。适合STEM教育和机械爱好者。", 4.9, 73,
                     "新品,齿轮,机械", "commercial",
                     '{"layer_height":"0.15mm","infill":"30%","wall":"2mm","support":"不需要","nozzle_temp":"210°C","bed_temp":"60°C","print_time":"约8小时","filament":"约180g","size":"100×100×60mm"}'),
                    ("几何艺术花瓶", "摆件", 18, "OBJ", 980, "on", "🎨",
                     "MakerJoe", "几何切割面设计花瓶，现代简约风格。内置防水内胆槽，可放置试管或小玻璃瓶盛水插花。也适合作为笔筒或桌面装饰。", 4.5, 31,
                     "花瓶,几何,装饰", "personal",
                     '{"layer_height":"0.2mm","infill":"10%","wall":"1.2mm","support":"不需要","nozzle_temp":"200°C","bed_temp":"55°C","print_time":"约5小时","filament":"约95g","size":"90×90×180mm"}'),
                    ("AirPods 充电座", "电子", 0, "STL", 4310, "on", "📱",
                     "Tech3D", "AirPods Pro/普通版通用充电座，底部预留线槽，支持MagSafe充电线穿过。圆润设计不伤耳机，放在桌面整洁美观。", 4.7, 105,
                     "免费,AirPods,充电", "personal",
                     '{"layer_height":"0.2mm","infill":"15%","wall":"1.2mm","support":"不需要","nozzle_temp":"200°C","bed_temp":"60°C","print_time":"约1.5小时","filament":"约35g","size":"55×50×30mm"}'),
                    ("Voron 2.4 改装件", "DIY", 58, "3MF", 1450, "on", "🔧",
                     "VoronCN", "专为Voron 2.4设计的工具头改装件套装，优化气流通道提升零件冷却效率。包含冷却风扇导管、BL-Touch支架和线缆管理夹。需ABS/ASA打印。", 4.8, 42,
                     "新品,Voron,改装", "commercial",
                     '{"layer_height":"0.2mm","infill":"40%","wall":"2.4mm","support":"部分需要","nozzle_temp":"250°C","bed_temp":"110°C","print_time":"约3小时","filament":"约65g","size":"多种尺寸"}'),
                    ("圣诞树旋转音乐盒", "节日", 28, "STL", 760, "on", "🎄",
                     "Holiday3D", "发条驱动旋转圣诞树音乐盒，打印后装入标准发条音乐机芯即可播放。带雪花装饰和小礼盒，浓浓的节日氛围。", 4.4, 18,
                     "圣诞,音乐盒,节日", "personal",
                     '{"layer_height":"0.2mm","infill":"15%","wall":"1.2mm","support":"部分需要","nozzle_temp":"200°C","bed_temp":"60°C","print_time":"约6小时","filament":"约140g","size":"120×120×150mm"}'),
                    # --- 补充种子数据 ---
                    ("机械小恐龙", "玩具", 0, "STL", 8920, "on", "🧸",
                     "Dino3D", "关节可动的机械小恐龙模型，无需支撑打印。12处关节灵活可动，站立稳固。孩子们的最爱，也是桌面摆件的绝佳选择。", 4.9, 210,
                     "免费,热门,关节,恐龙", "personal",
                     '{"layer_height":"0.2mm","infill":"15%","wall":"1mm","support":"不需要","nozzle_temp":"200°C","bed_temp":"60°C","print_time":"约3.5小时","filament":"约60g","size":"140×90×70mm"}'),
                    ("壁挂式花盆", "家居", 0, "STL", 3450, "on", "🏠",
                     "Garden3D", "壁挂式设计花盆，带自动灌溉槽。无需支撑打印，安装简单。适合多肉植物、小型绿植，为墙面增添一抹绿色。", 4.6, 88,
                     "免费,花盆,家居,植物", "personal",
                     '{"layer_height":"0.2mm","infill":"10%","wall":"1.2mm","support":"不需要","nozzle_temp":"200°C","bed_temp":"55°C","print_time":"约4小时","filament":"约80g","size":"110×100×120mm"}'),
                    ("SD卡收纳盒", "工具", 0, "3MF", 6120, "on", "🛠️",
                     "Organize3D", "小巧实用的SD卡和MicroSD收纳盒，可容纳12张SD卡+16张MicroSD卡。卡扣式开合，防尘防摔。打印无需支撑。", 4.8, 156,
                     "免费,收纳,SD卡,实用", "personal",
                     '{"layer_height":"0.15mm","infill":"20%","wall":"1.2mm","support":"不需要","nozzle_temp":"200°C","bed_temp":"60°C","print_time":"约2小时","filament":"约40g","size":"80×55×20mm"}'),
                    ("棘轮扳手", "工具", 0, "STL", 2780, "on", "⚙️",
                     "ToolSmith", "全3D打印棘轮扳手，带3个可更换套筒头（8mm/10mm/12mm）。轻量级家用维修工具，实际可用。", 4.5, 65,
                     "免费,扳手,工具,实用", "personal",
                     '{"layer_height":"0.2mm","infill":"40%","wall":"2.4mm","support":"不需要","nozzle_temp":"210°C","bed_temp":"60°C","print_time":"约5小时","filament":"约110g","size":"180×30×25mm"}'),
                    ("螺旋无限花瓶", "摆件", 22, "STL", 320, "on", "🎨",
                     "ArtFlow", "数学之美——螺旋无限花瓶。斐波那契螺旋线设计，任意角度看都有不同的视觉效果。极简白色打印效果最佳。", 5.0, 28,
                     "新品,花瓶,数学,艺术", "personal",
                     '{"layer_height":"0.15mm","infill":"10%","wall":"1.2mm","support":"不需要","nozzle_temp":"200°C","bed_temp":"55°C","print_time":"约5小时","filament":"约85g","size":"100×100×160mm"}'),
                    ("MagSafe 磁吸支架", "电子", 15, "STL", 580, "on", "📱",
                     "iPhone3D", "MagSafe磁吸手机支架，支持iPhone 12-16全系列。可旋转360度，仰角可调。桌面稳固不晃动。", 4.7, 42,
                     "新品,MagSafe,支架,苹果", "personal",
                     '{"layer_height":"0.2mm","infill":"25%","wall":"2mm","support":"不需要","nozzle_temp":"200°C","bed_temp":"55°C","print_time":"约2小时","filament":"约50g","size":"90×70×100mm"}'),
                    ("可变形机甲战士", "玩具", 45, "STL", 890, "on", "🧸",
                     "RobotStudio", "可变形的3D打印机甲战士！人形态与战机形态自由切换。25处关节可动，无需胶水组装。仿真机械细节，机甲迷必备。", 4.9, 56,
                     "新品,机甲,变形,收藏", "commercial",
                     '{"layer_height":"0.2mm","infill":"20%","wall":"1.6mm","support":"部分需要","nozzle_temp":"210°C","bed_temp":"60°C","print_time":"约12小时","filament":"约250g","size":"180×150×120mm"}'),
                    ("折叠笔记本支架", "家居", 28, "3MF", 410, "on", "🏠",
                     "WorkSpace3D", "可折叠的笔记本散热支架，人体工学角度提升屏幕高度。折叠后仅厚5mm方便携带。兼容13-17寸笔记本。", 4.6, 33,
                     "新品,笔记本,支架,便携", "personal",
                     '{"layer_height":"0.2mm","infill":"25%","wall":"2mm","support":"不需要","nozzle_temp":"200°C","bed_temp":"60°C","print_time":"约4小时","filament":"约100g","size":"250×200×15mm"}'),
                    ("精密机械钟表套件", "机械", 68, "STL", 1200, "on", "⚙️",
                     "ClockMaster", "全3D打印机械钟表机芯，摆轮擒纵机构完整还原。无需电池，上发条即可走时。极佳的STEM教学模型和桌面艺术品。", 5.0, 89,
                     "VIP,钟表,机械,收藏", "commercial",
                     '{"layer_height":"0.1mm","infill":"30%","wall":"2mm","support":"不需要","nozzle_temp":"210°C","bed_temp":"60°C","print_time":"约20小时","filament":"约350g","size":"200×150×80mm"}'),
                    ("分形艺术灯具", "摆件", 38, "OBJ", 890, "on", "🎨",
                     "LightArt3D", "分形几何设计桌面灯具外壳，预留LED灯带安装槽。光影效果惊艳，投射出复杂分形图案。现代极简家居必备。", 4.9, 42,
                     "VIP,灯具,分形,艺术", "commercial",
                     '{"layer_height":"0.2mm","infill":"15%","wall":"1.6mm","support":"不需要","nozzle_temp":"200°C","bed_temp":"55°C","print_time":"约7小时","filament":"约130g","size":"150×150×200mm"}'),
                    ("1:24跑车全可动模型", "玩具", 88, "STL", 650, "on", "🚗",
                     "Race3D", "1:24比例超级跑车静态模型，车门/前盖/尾翼可开合，车轮可转动，方向盘联动前轮转向。极致的机械细节还原。", 4.8, 38,
                     "VIP,跑车,模型,收藏", "commercial",
                     '{"layer_height":"0.15mm","infill":"20%","wall":"1.6mm","support":"部分需要","nozzle_temp":"210°C","bed_temp":"60°C","print_time":"约24小时","filament":"约450g","size":"220×100×60mm"}'),
                    ("电动螺丝刀全套配件", "DIY", 48, "STL", 430, "on", "🔧",
                     "ToolKing", "适配通用电动螺丝刀的批头收纳盒+延长杆+90度转角头。全3D打印结构，实测可承受5Nm扭矩。DIY玩家的终极配件套装。", 4.7, 25,
                     "VIP,螺丝刀,工具,DIY", "commercial",
                     '{"layer_height":"0.2mm","infill":"35%","wall":"2.4mm","support":"不需要","nozzle_temp":"210°C","bed_temp":"60°C","print_time":"约6小时","filament":"约150g","size":"150×80×40mm"}'),
                ],
            )


def parse_multipart(handler: SimpleHTTPRequestHandler):
    """Minimal multipart/form-data parser. Returns {field: value_or_bytes}."""
    content_type = handler.headers.get("Content-Type", "")
    if "multipart/form-data" not in content_type:
        return None
    # Extract boundary
    import re
    match = re.search(r"boundary=([^;\s]+)", content_type)
    if not match:
        return None
    boundary = match[1].encode("utf-8")
    length = int(handler.headers.get("Content-Length", "0"))
    raw = handler.rfile.read(length)
    parts = raw.split(b"--" + boundary)
    result = {}
    for part in parts:
        if b"Content-Disposition" not in part:
            continue
        header_end = part.find(b"\r\n\r\n")
        if header_end == -1:
            continue
        headers_section = part[:header_end].decode("utf-8", errors="replace")
        body = part[header_end + 4:]
        # Trim trailing \r\n and boundary markers
        body = body.rstrip(b"\r\n")
        if body.endswith(b"--"):
            body = body[:-2]
        # Parse field name and filename
        disp_match = re.search(r'name="([^"]+)"', headers_section)
        if not disp_match:
            continue
        field_name = disp_match[1]
        file_match = re.search(r'filename="([^"]*)"', headers_section)
        if file_match and file_match[1]:
            result[field_name] = {
                "filename": file_match[1],
                "data": body,
            }
        else:
            result[field_name] = body.decode("utf-8", errors="replace").strip()
    return result


def read_json(handler: SimpleHTTPRequestHandler):
    try:
        length = int(handler.headers.get("Content-Length", "0"))
        raw = handler.rfile.read(length).decode("utf-8")
        return json.loads(raw) if raw else {}
    except Exception:
        return None


def get_cookie_token(handler: SimpleHTTPRequestHandler) -> str | None:
    raw = handler.headers.get("Cookie", "")
    jar = cookies.SimpleCookie()
    jar.load(raw)
    morsel = jar.get(SESSION_COOKIE)
    return morsel.value if morsel else None


def current_admin(handler: SimpleHTTPRequestHandler):
    token = get_cookie_token(handler)
    if not token:
        return None
    now = int(time.time())
    with db() as conn:
        row = conn.execute(
            """
            SELECT admins.id, admins.username
            FROM sessions
            JOIN admins ON admins.id = sessions.admin_id
            WHERE sessions.token = ? AND sessions.expires_at > ?
            """,
            (token, now),
        ).fetchone()
    return dict(row) if row else None


def require_admin(handler: SimpleHTTPRequestHandler):
    admin = current_admin(handler)
    if not admin:
        json_response(handler, {"ok": False, "error": "未登录"}, 401)
        return None
    return admin


def set_session_cookie(handler: SimpleHTTPRequestHandler, token: str, max_age: int = SESSION_TTL):
    handler.send_header(
        "Set-Cookie",
        f"{SESSION_COOKIE}={token}; Path=/; Max-Age={max_age}; SameSite=Lax; HttpOnly",
    )


# ---- user auth helpers ----

def get_user_cookie_token(handler: SimpleHTTPRequestHandler) -> str | None:
    raw = handler.headers.get("Cookie", "")
    jar = cookies.SimpleCookie()
    jar.load(raw)
    morsel = jar.get(USER_SESSION_COOKIE)
    return morsel.value if morsel else None


def current_user(handler: SimpleHTTPRequestHandler):
    token = get_user_cookie_token(handler)
    if not token:
        return None
    now = int(time.time())
    with db() as conn:
        row = conn.execute(
            """
            SELECT users.id, users.username, users.email, users.avatar, users.bio
            FROM user_sessions
            JOIN users ON users.id = user_sessions.user_id
            WHERE user_sessions.token = ? AND user_sessions.expires_at > ?
            """,
            (token, now),
        ).fetchone()
    return dict(row) if row else None


def set_user_session_cookie(handler: SimpleHTTPRequestHandler, token: str, max_age: int = SESSION_TTL):
    handler.send_header(
        "Set-Cookie",
        f"{USER_SESSION_COOKIE}={token}; Path=/; Max-Age={max_age}; SameSite=Lax; HttpOnly",
    )


class PrintHubHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        path = urllib.parse.urlparse(path).path
        path = path.lstrip("/")
        return str((ROOT / path).resolve())

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        # --- public API ---
        if parsed.path == "/api/models":
            return self.handle_public_list_models()
        if parsed.path.startswith("/api/models/") and parsed.path.count("/") == 3:
            model_id = parsed.path.split("/")[-1]
            return self.handle_public_get_model(model_id)
        if parsed.path.startswith("/api/models/") and parsed.path.endswith("/download"):
            model_id = parsed.path.split("/")[-2]
            return self.handle_download_model(model_id)
        # --- user API ---
        if parsed.path == "/api/user/me":
            return self.handle_user_me()
        # --- admin API ---
        if parsed.path == "/api/admin/me":
            admin = current_admin(self)
            return json_response(self, {"ok": True, "admin": admin})
        if parsed.path == "/api/admin/models":
            if not require_admin(self):
                return
            return self.handle_list_models()
        if parsed.path.startswith("/admin/") and parsed.path != "/admin/index.html":
            if not current_admin(self):
                self.send_response(302)
                self.send_header("Location", "/admin/index.html")
                self.end_headers()
                return
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        # --- user API ---
        if parsed.path == "/api/user/register":
            return self.handle_user_register()
        if parsed.path == "/api/user/login":
            return self.handle_user_login()
        if parsed.path == "/api/user/logout":
            return self.handle_user_logout()
        # --- admin API ---
        if parsed.path == "/api/admin/login":
            return self.handle_login()
        if parsed.path == "/api/admin/logout":
            return self.handle_logout()
        if parsed.path == "/api/admin/models":
            if not require_admin(self):
                return
            return self.handle_create_model()
        if parsed.path.startswith("/api/admin/models/") and parsed.path.endswith("/status"):
            if not require_admin(self):
                return
            model_id = parsed.path.split("/")[-2]
            return self.handle_update_status(model_id)
        if parsed.path.startswith("/api/admin/models/") and parsed.path.endswith("/upload"):
            if not require_admin(self):
                return
            model_id = parsed.path.split("/")[-2]
            return self.handle_upload_file(model_id)
        return json_response(self, {"ok": False, "error": "接口不存在"}, 404)

    def handle_login(self):
        payload = read_json(self)
        if payload is None:
            return json_response(self, {"ok": False, "error": "请求格式错误"}, 400)
        username = str(payload.get("username", "")).strip()
        password = str(payload.get("password", ""))
        with db() as conn:
            admin = conn.execute("SELECT * FROM admins WHERE username = ?", (username,)).fetchone()
            if not admin or not verify_password(password, admin["password_hash"]):
                return json_response(self, {"ok": False, "error": "账号或密码不正确"}, 401)
            token = secrets.token_urlsafe(32)
            expires_at = int(time.time()) + SESSION_TTL
            conn.execute(
                "INSERT INTO sessions (token, admin_id, expires_at) VALUES (?, ?, ?)",
                (token, admin["id"], expires_at),
            )
        body = json.dumps({"ok": True, "admin": {"username": username}}, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        set_session_cookie(self, token)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def handle_logout(self):
        token = get_cookie_token(self)
        if token:
            with db() as conn:
                conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
        body = json.dumps({"ok": True}, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        set_session_cookie(self, "", max_age=0)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def handle_list_models(self):
        query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        keyword = (query.get("q", [""])[0] or "").strip()
        status = (query.get("status", [""])[0] or "").strip()
        where = []
        args = []
        if keyword:
            where.append("title LIKE ?")
            args.append(f"%{keyword}%")
        if status in {"on", "off"}:
            where.append("status = ?")
            args.append(status)
        sql = "SELECT * FROM models"
        if where:
            sql += " WHERE " + " AND ".join(where)
        sql += " ORDER BY id DESC"
        with db() as conn:
            rows = [dict(r) for r in conn.execute(sql, args).fetchall()]
        return json_response(self, {"ok": True, "models": rows, "count": len(rows)})

    def handle_create_model(self):
        payload = read_json(self)
        if payload is None:
            return json_response(self, {"ok": False, "error": "请求格式错误"}, 400)
        title = str(payload.get("title", "")).strip()
        if not title:
            return json_response(self, {"ok": False, "error": "请填写模型名称"}, 400)
        category = str(payload.get("category", "未分类")).strip() or "未分类"
        file_format = str(payload.get("file_format", "STL")).strip().upper() or "STL"
        image = str(payload.get("image", "📦")).strip() or "📦"
        try:
            price = float(payload.get("price", 0) or 0)
        except ValueError:
            price = 0
        with db() as conn:
            cur = conn.execute(
                """
                INSERT INTO models (title, category, price, file_format, downloads, status, image)
                VALUES (?, ?, ?, ?, 0, 'on', ?)
                """,
                (title, category, price, file_format, image),
            )
            row = conn.execute("SELECT * FROM models WHERE id = ?", (cur.lastrowid,)).fetchone()
        return json_response(self, {"ok": True, "model": dict(row)})

    def handle_update_status(self, model_id):
        payload = read_json(self)
        if payload is None:
            return json_response(self, {"ok": False, "error": "请求格式错误"}, 400)
        status = str(payload.get("status", "")).strip()
        if status not in {"on", "off"}:
            return json_response(self, {"ok": False, "error": "状态无效"}, 400)
        with db() as conn:
            conn.execute("UPDATE models SET status = ? WHERE id = ?", (status, model_id))
            row = conn.execute("SELECT * FROM models WHERE id = ?", (model_id,)).fetchone()
        if not row:
            return json_response(self, {"ok": False, "error": "模型不存在"}, 404)
        return json_response(self, {"ok": True, "model": dict(row)})

    # ============ PUBLIC API ============

    def _parse_query(self):
        return urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)

    def handle_public_list_models(self):
        q = self._parse_query()
        keyword = (q.get("q", [""])[0] or "").strip()
        category = (q.get("category", [""])[0] or "").strip()
        price_min = q.get("price_min", [""])[0]
        price_max = q.get("price_max", [""])[0]
        fmt = (q.get("format", [""])[0] or "").strip().upper()
        sort = (q.get("sort", ["hot"])[0] or "hot").strip()
        page = int(q.get("page", ["1"])[0] or 1)
        page_size = int(q.get("page_size", ["12"])[0] or 12)
        tag = (q.get("tag", [""])[0] or "").strip()

        where = ["status = 'on'"]
        args = []

        if keyword:
            where.append("(title LIKE ? OR author LIKE ? OR description LIKE ?)")
            kw = f"%{keyword}%"
            args.extend([kw, kw, kw])
        if category:
            where.append("category = ?")
            args.append(category)
        if price_min:
            try:
                args.append(float(price_min))
                where.append("price >= ?")
            except ValueError:
                pass
        if price_max:
            try:
                args.append(float(price_max))
                where.append("price <= ?")
            except ValueError:
                pass
        if fmt:
            where.append("file_format = ?")
            args.append(fmt)
        if tag:
            where.append("tags LIKE ?")
            args.append(f"%{tag}%")

        order_map = {
            "hot": "downloads DESC",
            "newest": "created_at DESC",
            "downloads": "downloads DESC",
            "price_asc": "price ASC",
            "price_desc": "price DESC",
            "rating": "rating DESC",
        }
        order = order_map.get(sort, "downloads DESC")

        offset = max(0, (page - 1) * page_size)

        with db() as conn:
            count_row = conn.execute(
                f"SELECT COUNT(*) AS n FROM models WHERE {' AND '.join(where)}", args
            ).fetchone()
            total = count_row["n"] if count_row else 0

            rows = [
                dict(r)
                for r in conn.execute(
                    f"SELECT * FROM models WHERE {' AND '.join(where)} ORDER BY {order} LIMIT ? OFFSET ?",
                    args + [page_size, offset],
                ).fetchall()
            ]

        return json_response(self, {
            "ok": True,
            "models": rows,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, (total + page_size - 1) // page_size) if total > 0 else 1,
        })

    def handle_public_get_model(self, model_id):
        try:
            model_id = int(model_id)
        except ValueError:
            return json_response(self, {"ok": False, "error": "模型不存在"}, 404)
        with db() as conn:
            row = conn.execute(
                "SELECT * FROM models WHERE id = ? AND status = 'on'", (model_id,)
            ).fetchone()
        if not row:
            return json_response(self, {"ok": False, "error": "模型不存在"}, 404)
        return json_response(self, {"ok": True, "model": dict(row)})

    # ============ USER API ============

    def handle_user_register(self):
        payload = read_json(self)
        if payload is None:
            return json_response(self, {"ok": False, "error": "请求格式错误"}, 400)
        username = str(payload.get("username", "")).strip()
        email = str(payload.get("email", "")).strip()
        password = str(payload.get("password", ""))
        if not username or len(username) < 2:
            return json_response(self, {"ok": False, "error": "用户名至少2个字符"}, 400)
        if not password or len(password) < 4:
            return json_response(self, {"ok": False, "error": "密码至少4个字符"}, 400)
        with db() as conn:
            exist = conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
            if exist:
                return json_response(self, {"ok": False, "error": "用户名已被注册"}, 409)
            pwd_hash = hash_password(password)
            cur = conn.execute(
                "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
                (username, email, pwd_hash),
            )
            token = secrets.token_urlsafe(32)
            expires_at = int(time.time()) + SESSION_TTL
            conn.execute(
                "INSERT INTO user_sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
                (token, cur.lastrowid, expires_at),
            )
        body = json.dumps({"ok": True, "user": {"id": cur.lastrowid, "username": username}}, ensure_ascii=False).encode("utf-8")
        self.send_response(201)
        set_user_session_cookie(self, token)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def handle_user_login(self):
        payload = read_json(self)
        if payload is None:
            return json_response(self, {"ok": False, "error": "请求格式错误"}, 400)
        username = str(payload.get("username", "")).strip()
        password = str(payload.get("password", ""))
        with db() as conn:
            user = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
            if not user or not verify_password(password, user["password_hash"]):
                return json_response(self, {"ok": False, "error": "用户名或密码不正确"}, 401)
            token = secrets.token_urlsafe(32)
            expires_at = int(time.time()) + SESSION_TTL
            conn.execute(
                "INSERT INTO user_sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
                (token, user["id"], expires_at),
            )
        user_data = {"id": user["id"], "username": user["username"], "email": user["email"], "avatar": user["avatar"]}
        body = json.dumps({"ok": True, "user": user_data}, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        set_user_session_cookie(self, token)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def handle_user_logout(self):
        token = get_user_cookie_token(self)
        if token:
            with db() as conn:
                conn.execute("DELETE FROM user_sessions WHERE token = ?", (token,))
        body = json.dumps({"ok": True}, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Set-Cookie", f"{USER_SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly")
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def handle_user_me(self):
        user = current_user(self)
        if not user:
            return json_response(self, {"ok": False, "error": "未登录"}, 401)
        return json_response(self, {"ok": True, "user": user})

    # ============ FILE UPLOAD / DOWNLOAD ============

    def handle_upload_file(self, model_id):
        """Upload a 3D model file to a specific model record."""
        try:
            model_id = int(model_id)
        except ValueError:
            return json_response(self, {"ok": False, "error": "模型不存在"}, 404)
        parts = parse_multipart(self)
        if not parts or "file" not in parts:
            return json_response(self, {"ok": False, "error": "请选择要上传的文件"}, 400)
        file_info = parts["file"]
        if isinstance(file_info, str):
            return json_response(self, {"ok": False, "error": "请选择文件"}, 400)
        filename = file_info["filename"]
        ext = Path(filename).suffix.lower()
        if ext not in ALLOWED_EXTS:
            return json_response(self, {"ok": False, "error": f"不支持的文件格式: {ext}，仅支持 STL/OBJ/3MF/ZIP/STEP"}, 400)
        if len(file_info["data"]) > MAX_UPLOAD_SIZE:
            return json_response(self, {"ok": False, "error": "文件超过100MB限制"}, 400)

        # Check model exists
        with db() as conn:
            model = conn.execute("SELECT * FROM models WHERE id = ?", (model_id,)).fetchone()
            if not model:
                return json_response(self, {"ok": False, "error": "模型不存在"}, 404)

        # Save file
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        safe_name = f"{model_id}_{int(time.time())}_{filename}"
        file_path = UPLOAD_DIR / safe_name
        file_path.write_bytes(file_info["data"])

        # Update database
        rel_path = f"data/uploads/{safe_name}"
        with db() as conn:
            conn.execute("UPDATE models SET file_path = ? WHERE id = ?", (rel_path, model_id))

        return json_response(self, {"ok": True, "file_path": rel_path, "filename": filename, "size": len(file_info["data"])})

    def handle_download_model(self, model_id):
        """Download a model file. Increments download count."""
        try:
            model_id = int(model_id)
        except ValueError:
            return json_response(self, {"ok": False, "error": "模型不存在"}, 404)
        with db() as conn:
            model = conn.execute(
                "SELECT * FROM models WHERE id = ? AND status = 'on'", (model_id,)
            ).fetchone()
        if not model:
            return json_response(self, {"ok": False, "error": "模型不存在"}, 404)
        if not model["file_path"]:
            return json_response(self, {"ok": False, "error": "文件尚未上传"}, 404)

        full_path = ROOT / model["file_path"]
        if not full_path.exists():
            return json_response(self, {"ok": False, "error": "文件不存在或已被删除"}, 404)

        # Increment download count
        with db() as conn:
            conn.execute("UPDATE models SET downloads = downloads + 1 WHERE id = ?", (model_id,))

        # Get file extension for MIME
        ext = full_path.suffix.lower()
        mime_map = {".stl": "application/sla", ".obj": "application/object", ".3mf": "application/vnd.ms-package.3dmanufacturing-3dmodel+xml", ".zip": "application/zip", ".step": "application/step", ".stp": "application/step"}
        content_type = mime_map.get(ext, "application/octet-stream")

        file_data = full_path.read_bytes()
        # Use ASCII-safe filename to avoid encoding issues
        safe_filename = f"model_{model_id}{ext}"
        encoded_filename = urllib.parse.quote(model["title"] + ext, safe="")
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(file_data)))
        self.send_header("Content-Disposition", f'attachment; filename="{safe_filename}"; filename*=UTF-8\'\'{encoded_filename}')
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(file_data)


if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", "8787"))
    print(f"PrintHub running: http://127.0.0.1:{port}/")
    print(f"Admin login: {ADMIN_USERNAME} / {ADMIN_PASSWORD}")
    ThreadingHTTPServer(("0.0.0.0", port), PrintHubHandler).serve_forever()
