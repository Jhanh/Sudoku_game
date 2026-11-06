# 🧩 Sudoku Web — Phiên Bản Tối Ưu Hóa 100% Cho PC

<p align="center">
  <b>Trải nghiệm giải đố trí tuệ kinh điển với giao diện chuyên biệt cho máy tính (PC / Laptop), mượt mà và tối giản.</b>
  <br>
  <i>Xây dựng 100% bằng HTML5, CSS3 và Vanilla JavaScript — Tinh gọn, thuần khiết, Web Audio procedural SFX, không phụ thuộc bất kỳ thư viện ngoài nào.</i>
</p>

<p align="center">
  <a href="https://github.com/Jhanh/Sudoku_game/releases/tag/v1.1">
    <img src="https://img.shields.io/badge/Release-v1.1-10B981?style=for-the-badge&logo=tag&logoColor=white" alt="Release">
  </a>
  &nbsp;
  <a href="https://jhanh.github.io/Sudoku_game/">
    <img src="https://img.shields.io/badge/🎮%20Chơi%20Online-Click%20To%20Play-2563EB?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Play Online">
  </a>
  &nbsp;
  <a href="https://github.com/Jhanh/Sudoku_game/archive/refs/heads/main.zip">
    <img src="https://img.shields.io/badge/📥%20Tải%20Bản%20Offline-Download%20ZIP-6366F1?style=for-the-badge&logo=windows&logoColor=white" alt="Download ZIP">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Pure%20JS-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/HTML5-Semantic-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-Modern%20Design-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/PC%20Optimized-100%25-0284C7?style=flat-square" alt="PC Optimized">
  <img src="https://img.shields.io/badge/Dependencies-0-brightgreen?style=flat-square" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="MIT License">
</p>

---

## 🌟 Trải Nghiệm Hình Ảnh (Showcase)

<p align="center">
  <img src="screenshots/2-lobby-home.png" alt="Sảnh chính với thanh điều hướng Dock Desktop" width="48%">
  &nbsp;
  <img src="screenshots/6-gameplay.png" alt="Màn hình bàn đấu Sudoku 9x9 với Chế độ Chọn số trước ⚡" width="48%">
</p>
<p align="center">
  <img src="screenshots/5-profile.png" alt="Dashboard Hồ sơ cá nhân & Hệ thống 9 Cấp Bậc Danh Hiệu" width="48%">
  &nbsp;
  <img src="screenshots/4-variants.png" alt="Khám phá 4 biến thể Sudoku nổi tiếng thế giới" width="48%">
</p>

---

## ⚡ Điểm Khác Biệt & Độc Đáo So Với Các Web Sudoku Khác

Không giống như các trang web Sudoku thông thường sao chép giao diện di động thô sơ hay sử dụng thuật toán đào lỗ ngẫu nhiên, **Sudoku Web v2.0** được kiến tạo từ đầu nhằm mang lại trải nghiệm thi đấu trí tuệ đỉnh cao trên máy tính:

* 🧠 **Thuật Toán Sinh Đề Phân Loại Bằng Tư Duy Con Người (Human-Solving Logical Grader):**
  * **Không đào lỗ theo số lượng ô ngẫu nhiên:** Thay vì chỉ đếm số ô trống đơn thuần, bộ động cơ thẩm định câu đố dựa trên chính kỹ thuật giải thực tế của con người:
    * **Dễ (Easy - 36-40 ô gợi ý):** Đảm bảo giải được 100% chỉ bằng *Naked Singles* (ô có 1 ứng viên duy nhất) và *Hidden Singles* (chữ số có 1 vị trí duy nhất trong hàng/cột/khối).
    * **Trung bình (Medium - 30-34 ô gợi ý):** Đòi hỏi kỹ thuật loại trừ cấp trung như *Pointing Pairs / Box-Line Reduction* và *Naked Pairs* (cặp ô đôi).
    * **Khó (Hard - 24-28 ô gợi ý):** Cực hạn bài toán Sudoku quốc tế, duy nhất 1 nghiệm (Unique Solution), đòi hỏi chuỗi tư duy nâng cao (*Hidden Pairs, Naked Triples, X-Wing*).
  * **Tốc độ sinh đề tức thì:** < 50ms nhờ cấu trúc bitmask tăng tốc, không gây đơ lag trình duyệt.

* ⚡ **Chế Độ Điền Nhanh "Tia Chớp" (Lightning Mode - Digit-First):**
  * Thao tác thần tốc cho kỳ thủ giải tốc độ: Chọn một chữ số để khóa, sau đó nhấp điền liên tục vào nhiều ô trống trên bàn cờ. Bấm vào bất kỳ số nào trên bàn cờ để chuyển ngay sang số đó. Khi đủ 9 ô, hệ thống tự động hoàn tất và chờ chọn số kế tiếp.
  * **Giao diện trực quan:** Phím số được chọn giữ màu sắc chuẩn (`.locked-digit`), các phím còn lại tự động mờ nhẹ (`.dimmed`), các số đã điền đủ 9 ô giữ màu xám hoàn thành (`.completed`) và được bảo vệ chống bấm nhầm.
  * Bật/tắt linh hoạt bằng nút Tia chớp ⚡ trên thanh công cụ hoặc phím tắt `F`.

* 🔊 **Hệ Thống Âm Thanh Procedural SFX Thuần Khiết (Zero Audio Files):**
  * Khác biệt hoàn toàn với các web Sudoku tĩnh lặng hoặc phải tải hàng megabyte file mp3: 100% âm thanh được tổng hợp sóng âm trực tiếp thời gian thực qua **Web Audio API** (10 âm thanh xúc giác: tiếng gõ gỗ thanh mảnh, đàn Marimba thăng hoa theo chuỗi Combo, khải hoàn ca chiến thắng...).
  * 0 byte dung lượng nạp ngoài, độ trễ bằng 0, phản hồi tức thì theo từng mili-giây.

* 🏆 **Thang 9 Cấp Bậc Danh Hiệu Chuẩn Mực (Mastery Points - Không Lạm Phát Cày Cuốc):**
  * Tôn vinh kỳ thủ thực thụ từ 🥋 **Nhập Môn** đến 🌟 **Huyền Thoại Sudoku** dựa trên điểm tích lũy thi đấu thực chất (kỹ năng giải đúng, chuỗi combo, thưởng tốc độ, thưởng thắng hoàn hảo 0 lỗi).
  * Thiết kế Dashboard Hồ sơ 2 cột chuyên biệt cho PC, hiển thị toàn bộ biểu đồ Donut tỷ lệ thắng, kỷ lục và tiến trình cấp bậc trong **đúng 1 màn hình duy nhất — Tuyệt đối không cần cuộn trang**.

* 🛡️ **Kiến Trúc Thuần Khiết 100% & Trải Nghiệm Máy Tính Tối Đa (Zero Dependencies):**
  * Thuần khiết HTML5, CSS3, Vanilla ES6+ — không React/Vue nặng nề, không bundler, mở lên là chạy ngay trong chớp mắt.
  * Tích hợp Song ngữ tức thì (**Tiếng Việt 🇻🇳 / English 🇬🇧**), Chế độ Tối dịu mắt (**Dark Mode Slate Navy**) và bộ cảnh báo thân thiện khi vô tình mở trên màn hình điện thoại.

---

## 📦 Lịch Sử Phiên Bản (Release Notes)

* **🚀 v2.0 — Kỷ Nguyên Đột Phá Cốt Lõi & Trải Nghiệm Kỳ Thủ (Phiên Bản Hiện Tại):**
  * **Động cơ sinh đề Logic Grader:** Phân loại độ khó theo kỹ thuật giải đố của con người (Singles, Pairs, Box-Line, X-Wing) thay vì đếm số ô ngẫu nhiên.
  * **Chế độ Điền nhanh Chọn số trước (⚡ Digit-First Mode):** Khóa số điền liên tục, hỗ trợ phím tắt `F`, numpad mờ/sáng thông minh, tùy chọn mặc định trong Settings.
  * **Hệ thống 3 mạng lỗi sai & Hồi sinh bù điểm:** Giới hạn 3 cơ hội sai chuẩn quốc tế (hiển thị 0/3). Phạt điểm trực tiếp theo độ khó (Dễ -5đ, Trung bình -7đ, Khó -10đ). Khi chạm mốc 3/3 lỗi, ván chơi tạm dừng và mở Hộp thoại Hồi Sinh (Revive Modal) cho phép bù điểm trận theo cấp số nhân ($k \times \text{BaseCost}$) để giảm lỗi về 2/3 và tiếp tục thi đấu.
  * **Đổi gợi ý bằng Điểm Hồ Sơ tích lũy:** Cung cấp sẵn 3 gợi ý miễn phí đầu tiên; từ lượt thứ 4 trở đi, người chơi có thể đổi bằng Điểm vĩnh viễn trong Hồ Sơ (Mastery Points) theo cấp số nhân lũy tiến ($k \times \text{BaseCost}$: Dễ 50đ, TB 100đ, Khó 150đ) mà không trừ điểm trận đấu.
  * **Không gian thi đấu thanh lịch & tĩnh lặng:** Duy trì độ tập trung tối đa với chỉ số lỗi trực quan 0/3, không hiệu ứng gây xao nhãng.
  * **Tính năng Sao lưu & Nhập/Xuất tiến trình đa máy:** Xuất/Nhập file `.json` tiện lợi, hỗ trợ hộp thoại Windows "Save As..." ghi nhớ vị trí lưu.
  * **Màn hình kết thúc ván tinh gọn & trang trọng:** Tập trung làm nổi bật Tổng Điểm Đạt Được và các hành động thi đấu.
  * **Tái cân bằng 9 Cấp Bậc Danh Hiệu:** Ngưỡng điểm chuẩn mực (tối đa 3.000.000 điểm cho bậc Huyền Thoại ~1.000 ván đỉnh cao).
* **✨ v1.1 — Trợ Năng Giải Đố & Cá Nhân Hóa:**
  * Bổ sung Hộp thoại Cài Đặt hệ thống (Settings Modal) với 4 công tắc trợ năng (Tự xóa nháp, Đánh dấu số trùng, Báo lỗi ngay).
  * Hỗ trợ Song ngữ đa quốc gia (Bilingual i18n Việt - Anh).
  * Chế độ giao diện Tối dịu mắt (Eye-Friendly Dark Mode Slate Navy).
  * Hệ thống âm thanh Web Audio procedural 10 hiệu ứng chuyên biệt.
* **🌱 v1.0 — Bản Phát Hành Nền Tảng Đầu Tiên:**
  * Bàn cờ Sudoku 9×9 tối ưu chuẩn PC với 3 cấp độ khó cơ bản.
  * Hệ thống tính điểm thời gian thực, chuỗi combo liên hoàn và 4 biến thể Sudoku nổi tiếng thế giới.

---

## 🚀 Cách Bắt Đầu Chơi Ngay

### 🌐 Cách 1: Chơi trực tiếp trên trình duyệt
Bạn có thể truy cập và chơi ngay không cần cài đặt tại:
👉 **[https://jhanh.github.io/Sudoku_game/](https://jhanh.github.io/Sudoku_game/)**

### 💻 Cách 2: Tải về chơi Offline trên máy tính
1. Tải tệp nén **[Sudoku-Game-v1.1.zip](https://github.com/Jhanh/Sudoku_game/releases/tag/v1.1)** về máy tính.
2. Giải nén thư mục.
3. Nhấp đúp vào tệp **`ChoiGame.bat`** (trên Windows) hoặc mở trực tiếp tệp **`index.html`** bằng trình duyệt web yêu thích của bạn.

### 🛠️ Cách 3: Chạy bằng máy chủ nội bộ Python (Dành cho Lập trình viên)
```bash
# Mở Terminal tại thư mục dự án và gõ:
python server.py
```
> Trình duyệt sẽ tự động mở trang web tại địa chỉ `http://localhost:3000`.

---

## ⌨️ Phím Tắt Thao Tác Nhanh (Bàn Phím PC)

| Phím Tắt | Chức Năng |
| :--- | :--- |
| `1` – `9` | Điền số vào ô được chọn (hoặc chọn/khóa số trong chế độ Tia chớp) |
| `F` | Bật / Tắt chế độ Tia chớp - Điền liên tiếp (Lightning Mode) |
| `N` | Bật / Tắt chế độ Ghi chú nháp (Pencil Notes) |
| `Backspace` / `Delete` | Xóa số trong ô |
| `Ctrl + Z` | Hoàn tác nước đi trước đó (Undo) |
| `H` | Nhận gợi ý (Hint) cho ô hiện tại |
| `Space` / `P` | Tạm dừng ván đấu |
| `↑` `↓` `←` `→` | Di chuyển ô chọn trên bàn cờ 9x9 |

---

## 📁 Cấu Trúc Thư Mục Dự Án (Project Structure)

```text
Sudoku_game/
├── index.html                 # Giao diện chính và cấu trúc DOM ứng dụng
├── server.py                  # Máy chủ tĩnh nội bộ Python (Auto port + No-cache)
├── README.md                  # Tài liệu giới thiệu sản phẩm & hướng dẫn
├── LICENSE                    # Giấy phép bản quyền mã nguồn mở MIT
├── .gitignore                 # Danh sách tệp loại trừ không lưu trên Git
├── docs/                      # Hệ thống tài liệu kiến trúc & sơ đồ Mermaid trực quan
│   ├── README.md                       # Sơ đồ tổng thể hệ thống (Master System Map) & Chỉ mục
│   ├── 01_component_architecture.md    # Sơ đồ kiến trúc phân tầng 3 lớp (Presentation, Logic, Infra)
│   ├── 02_game_state_lifecycle.md      # Sơ đồ máy trạng thái (Screen flow, In-game modes, 3-Mistake life system)
│   ├── 03_data_flow_and_sequences.md   # Sơ đồ tuần tự điền số, chế độ Tia chớp & thuật toán sinh đề
│   └── 04_storage_and_scoring_models.md # Sơ đồ ER dữ liệu LocalStorage & công thức tính điểm
├── devtools/                  # Bộ công cụ Developer Tools & Cheat kiểm thử (Tách biệt độc lập)
│   ├── devtools.css           # Giao diện Dark Console HUD & Ghost Answers
│   └── devtools.js            # Module xác thực & logic can thiệp game engine
├── screenshots/               # Thư viện ảnh chụp giao diện thực tế (10 màn hình PC)
│   ├── 1-splash.png           # Màn hình mở đầu (Splash Screen) với hiệu ứng số nảy
│   ├── 2-lobby-home.png       # Sảnh chính (Lobby Home) kèm thanh Dock Desktop
│   ├── 3-tutorial.png         # Hướng dẫn tương tác từng bước trực quan
│   ├── 4-variants.png         # Tab thông tin 4 biến thể Sudoku nổi tiếng
│   ├── 5-profile.png          # Hồ sơ thành tích: Dashboard 2 cột không cuộn trang
│   ├── 6-gameplay.png         # Bàn cờ 9x9 với tính điểm, combo, đồng hồ, phím số
│   ├── 7-danger-warning.png   # Màn hình giới hạn lỗi sai & hộp thoại hồi sinh
│   ├── 8-victory-modal.png    # Hộp thoại chiến thắng với bảng tổng kết điểm chi tiết
│   ├── 9-devtools-qa.png      # Bảng điều khiển QA Dev Console & chế độ Ghost Answers
│   └── 10-mobile-notice.png   # Màn hình thông báo thân thiện chỉ dành cho màn hình PC
├── css/
│   ├── main.css               # Reset CSS, hệ thống màu, chuyển màn hình, mobile notice
│   ├── splash.css             # Giao diện & hoạt ảnh Màn hình Khởi đầu
│   ├── lobby.css              # Giao diện Sảnh chính, Menu Dock, thẻ ván dở
│   ├── gameplay.css           # Bảng 9x9, bàn phím số, đếm lỗi 0/3
│   ├── modals.css             # Hộp thoại Hướng dẫn, Cài đặt, Hồi sinh, Đổi gợi ý, Game Over tối giản
│   └── profile.css            # Hồ sơ Dashboard PC: Biểu đồ Donut & 6 thẻ thông số
└── js/
    ├── app.js                 # Điều hướng ứng dụng, router & mobile detection
    ├── game.js                # Quản lý ván chơi, bộ đếm giờ, lỗi 0/3, hồi sinh, điểm
    ├── sudoku-engine.js       # Thuật toán sinh đề & bộ phân loại logic (Logical Grader)
    ├── ui-board.js            # Render bàn cờ, highlight hàng/cột/khối & số trùng
    ├── ui-controls.js         # Bàn phím số, công cụ phụ trợ (5 nút công cụ), đếm lỗi 0/3
    ├── i18n.js                # Từ điển đa ngôn ngữ (Bilingual: Tiếng Việt 🇻🇳 / English 🇬🇧)
    ├── storage.js             # Lớp lưu trữ LocalStorage & Sao lưu JSON đa thiết bị
    ├── sound.js               # Động cơ âm thanh Web Audio procedural SFX (Zero audio files)
    ├── tutorial.js            # Quản lý các bước hướng dẫn động
    ├── variants.js            # Danh sách thông tin 4 biến thể Sudoku
    └── profile.js             # Xử lý thống kê và vẽ biểu đồ tỉ lệ thắng
```

---

## 📄 Bản Quyền & Giấy Phép (License)

Dự án được phân phối dưới giấy phép mã nguồn mở **MIT License**. Bạn được tự do học tập, sử dụng và phát triển thêm.
