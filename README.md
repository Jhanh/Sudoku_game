# 🧩 Sudoku Web - Phiên bản tối ưu hóa 100% cho PC

<p align="center">
  <b>Trải nghiệm giải đố trí tuệ kinh điển với giao diện chuyên biệt cho máy tính (PC / Laptop), mượt mà, tĩnh lặng và đẳng cấp.</b>
  <br>
  <i>Xây dựng 100% bằng HTML5, CSS3 và Pure Vanilla JavaScript ES6+ - Tinh gọn, thuần khiết, Web Audio procedural SFX, Zero Dependencies, không phụ thuộc bất kỳ thư viện ngoài nào.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Pure%20JS-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/HTML5-Semantic-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-Modern%20Design-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/PC%20Optimized-100%25-0284C7?style=flat-square" alt="PC Optimized">
  <img src="https://img.shields.io/badge/Dependencies-0-brightgreen?style=flat-square" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/License-PolyForm%20Noncommercial-blue?style=flat-square" alt="PolyForm Noncommercial 1.0.0">
</p>

---

## 🎮 Các tính năng nổi bật dành cho người chơi

### 1. 💡 Gợi ý thông minh kèm giải thích logic (Smart Hint)
Không đơn thuần là điền hộ một con số, hệ thống phân tích logic và hiển thị một banner giải thích ngắn gọn ngay trên bàn cờ:
* Hướng dẫn bạn vì sao ô đó phải là con số đó (ví dụ: *Naked Single* - ô duy nhất chỉ còn 1 khả năng, hoặc *Hidden Single* - số duy nhất chỉ còn 1 vị trí trong hàng/cột/khối).
* Giúp bạn vừa chơi vừa nâng cao tư duy giải đố thực thụ sau mỗi ván cờ.

### 2. ⚡ Bút chì nhanh (Fast Notes / Phím `A`) & Chống ghi chú trùng
* Nhấn phím `A` để tự động điền tất cả các ứng viên hợp lệ vào các ô trống còn lại. Nhấn lại để xóa sạch màn hình giúp thoáng mắt và tập trung suy nghĩ.
* Khi bạn tự tay ghi chú một con số đã có sẵn trên cùng hàng, cột hoặc khối 3x3, hệ thống lập tức ngăn chặn và làm nhấp nháy màu các ô xung đột để định hướng bạn ngay lập tức.
* Khi chọn 1 con số, toàn bộ các số ghi chú tương ứng trên khắp bàn cờ đều được highlight xanh đồng bộ.

### 3. 🛡️ Hệ thống 3 mạng lỗi sai (0/3) & Hồi sinh bù điểm
* Giới hạn 3 cơ hội sai cho mỗi ván đấu. Mỗi lần điền sai sẽ bị trừ điểm theo độ khó và đặt lại chuỗi đúng.
* Nếu lỡ mắc đủ 3/3 lỗi, ván đấu tạm dừng và mở Hộp thoại Hồi sinh: Bạn có thể dùng chính số điểm tích lũy được trong ván để chuộc lại 1 cơ hội tiếp tục (lỗi giảm về 2/3 và xóa ô vừa điền sai).
* Cơ chế Hoàn tác (`Ctrl + Z`): Hoàn tác nước đi đúng sẽ khấu trừ lại điểm thưởng để chống gian lận điểm; hoàn tác nước đi sai chỉ xóa số trên ô mà không hoàn lại số lỗi (lỗi sai là bất khả đảo ngược).

### 4. ⚡ Chế độ Tia chớp (Lightning Mode / Phím `F`)
* Cho phép chọn 1 con số và nhấp liên tục vào các ô trống trên bàn cờ để hoàn thành con số đó trong chớp mắt.
* Khi một con số đã điền đủ 9 ô, phím số trên bàn phím sẽ được ẩn đi nhưng **vẫn giữ nguyên vị trí vật lý** nhằm bảo toàn trí nhớ cơ bắp cho người chơi.

### 5. 🎯 Đổi gợi ý bằng Điểm Hồ Sơ vĩnh viễn (Mastery Points)
* Mỗi ván được cấp sẵn 3 gợi ý miễn phí đầu tiên (chỉ trừ điểm ván đấu).
* Từ lượt thứ 4 trở đi, bạn có thể dùng **Điểm Hồ Sơ vĩnh viễn** tích lũy qua các ván thắng để đổi thêm gợi ý theo cấp số nhân ($BaseCost \times 2^{k-1}$) mà không làm ảnh hưởng đến điểm số của ván đang chơi.

### 6. 🔊 Âm thanh Web Audio procedural SFX thuần khiết
* Toàn bộ hiệu ứng âm thanh được tổng hợp thời gian thực bằng sóng âm Web Audio API (tiếng gõ gỗ thanh lịch, đàn Marimba biến tấu cao độ theo chuỗi Combo, khải hoàn ca chiến thắng).
* Hoàn toàn không tải file mp3 bên ngoài, dung lượng 0 byte, không giật lag.

### 7. 📁 Sao lưu & khôi phục tiến trình chuẩn native (JSON Backup)
* Tích hợp File System Access API hiện đại, mở trực tiếp hộp thoại "Save As..." của Windows để bạn chọn thư mục lưu trữ file `.json`.
* Dễ dàng sao lưu kỷ lục, thành tích và ván đấu dở dang để chuyển đổi giữa máy tính cá nhân và máy tính làm việc.

---

## 🚀 Cách bắt đầu chơi ngay

### 🌐 Cách 1: Chơi trực tiếp trên trình duyệt web
Bạn có thể mở và chơi ngay lập tức không cần cài đặt tại:
👉 **[https://jhanh.github.io/Sudoku_game/](https://jhanh.github.io/Sudoku_game/)**

### 💻 Cách 2: Chơi offline trên máy tính cá nhân
1. Tải toàn bộ mã nguồn hoặc gói phát hành zip từ mục **Releases** của repo.
2. Giải nén thư mục trên máy tính.
3. Mở trực tiếp tệp **`index.html`** bằng bất kỳ trình duyệt web nào (Chrome, Edge, Firefox, Brave, Opera...). Không cần kết nối internet hay cài đặt môi trường lập trình nào.

---

## ⌨️ Bảng phím tắt thao tác nhanh (PC Shortcuts)

| Phím Tắt | Chức Năng |
| :--- | :--- |
| `1` - `9` | Điền số vào ô được chọn (hoặc chọn/khóa số trong chế độ Tia chớp) |
| `F` | Bật / Tắt chế độ Tia chớp - Điền liên tiếp (Lightning Mode) |
| `A` | Bật / Tắt chế độ Bút chì nhanh - Tự động điền ứng viên (Fast Notes) |
| `N` | Bật / Tắt chế độ Ghi chú thủ công (Pencil Notes) |
| `H` | Nhận Gợi ý thông minh kèm giải thích logic (Smart Hint) |
| `Backspace` | Xóa số hoặc ghi chú trong ô (Erase) |
| `Ctrl + Z` | Hoàn tác nước đi trước đó (Anti-Cheat Undo) |
| `Space` | Tạm dừng / Tiếp tục ván đấu (Pause / Resume) |
| `↑` `↓` `←` `→` | Di chuyển ô chọn trên bàn cờ 9x9 |

---

## 📁 Cấu trúc thư mục dự án (Project Structure)

```text
Sudoku_game/
├── index.html                 # Giao diện chính, bàn cờ, thanh công cụ 6 nút & banner gợi ý
├── README.md                  # Tài liệu giới thiệu sản phẩm & hướng dẫn chi tiết
├── LICENSE                    # Giấy phép bản quyền mã nguồn PolyForm Noncommercial 1.0.0
├── .gitignore                 # Danh sách tệp loại trừ không lưu trên Git
├── docs/                      # Hệ thống tài liệu kiến trúc, sơ đồ Mermaid & cẩm nang Word
│   ├── Sudoku.docx                     # Cẩm nang tra cứu luật chơi, cấp bậc danh hiệu & tính điểm
│   ├── README.md                       # Sơ đồ tổng thể hệ thống (Master System Map)
│   ├── 01_component_architecture.md    # Sơ đồ kiến trúc 3 lớp (Presentation, Logic, Infra)
│   ├── 02_game_state_lifecycle.md      # Sơ đồ máy trạng thái & vòng đời ván đấu
│   ├── 03_data_flow_and_sequences.md   # Sơ đồ tuần tự điền số, Tia chớp, Bút chì nhanh & giải thuật
│   └── 04_storage_and_scoring_models.md # Sơ đồ ER LocalStorage & đường ống tính điểm
├── forDev/                    # Tài liệu kỹ thuật chi tiết dành riêng cho lập trình viên
├── devtools/                  # Bộ công cụ QA Dev Console & Ghost Answers kiểm thử
├── css/
│   ├── main.css               # Reset CSS, màu sắc, chuyển màn hình, mobile notice
│   ├── splash.css             # Giao diện & hoạt ảnh Màn hình Khởi đầu
│   ├── lobby.css              # Giao diện Sảnh chính, Menu Dock, thẻ ván dở
│   ├── gameplay.css           # Bảng 9x9, bàn phím số, đếm lỗi 0/3, highlight ghi chú, banner
│   ├── modals.css             # Hộp thoại Hướng dẫn, Cài đặt, Hồi sinh, Đổi gợi ý, Game Over
│   └── profile.css            # Hồ sơ Dashboard PC: Biểu đồ Donut & 6 thẻ thông số
└── js/
    ├── app.js                 # Điều hướng ứng dụng, router & phím tắt toàn cục
    ├── game.js                # Quản lý ván chơi, 3 lỗi sai, hồi sinh, điểm, auto-notes, undo
    ├── sudoku-engine.js       # Thuật toán sinh đề, Smart Hint & tính toán ứng viên hợp lệ
    ├── ui-board.js            # Render bàn cờ, highlight hàng/cột/khối, số trùng & ghi chú
    ├── ui-controls.js         # Bàn phím số, 6 nút công cụ, banner giải thích logic
    ├── i18n.js                # Từ điển đa ngôn ngữ song ngữ tức thì (Tiếng Việt / English)
    ├── storage.js             # Lớp lưu trữ LocalStorage & Sao lưu/Khôi phục JSON
    ├── sound.js               # Động cơ âm thanh Web Audio procedural SFX (Zero audio files)
    ├── tutorial.js            # Quản lý các bước hướng dẫn giải đố trực quan
    ├── variants.js            # Danh sách thông tin 4 biến thể Sudoku
    └── profile.js             # Xử lý thống kê và vẽ biểu đồ tỉ lệ thắng
```

---

## 📄 Bản quyền & giấy phép (License)

Dự án được phân phối dưới giấy phép **PolyForm Noncommercial License 1.0.0**. Bạn được tự do học tập, nghiên cứu, sửa đổi và giải trí cá nhân phi thương mại. Mọi hành vi thương mại hóa hoặc kinh doanh thu lợi nhuận đều bị nghiêm cấm khi chưa có sự đồng ý bằng văn bản của tác giả.
