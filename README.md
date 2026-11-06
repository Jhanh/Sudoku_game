# 🧩 Sudoku Web - Phiên bản tối ưu hóa 100% cho PC

<p align="center">
  <b>Trải nghiệm giải đố trí tuệ kinh điển với giao diện chuyên biệt cho máy tính (PC / Laptop), mượt mà, tĩnh lặng và đẳng cấp.</b>
  <br>
  <i>Xây dựng 100% bằng HTML5, CSS3 và Pure Vanilla JavaScript ES6+ - Tinh gọn, thuần khiết, Web Audio procedural SFX, Zero Dependencies, không phụ thuộc bất kỳ thư viện ngoài nào.</i>
</p>

<p align="center">
  <a href="https://jhanh.github.io/Sudoku_game/">
    <img src="https://img.shields.io/badge/🎮%20Chơi%20Online-Click%20To%20Play-2563EB?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Play Online">
  </a>
  &nbsp;
  <a href="https://github.com/Jhanh/Sudoku_game/releases/latest">
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

## 🌟 Trải nghiệm hình ảnh (Showcase)

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

## 💎 Điểm mạnh vượt trội so với các trang web Sudoku khác

Hầu hết các trang web Sudoku hiện nay trên thị trường thường mắc phải các nhược điểm: giao diện co cụm sao chép từ mobile, đào lỗ ngẫu nhiên tạo câu đố nhiều nghiệm, gợi ý máy móc điền bừa đáp án không giải thích, hoặc ngập tràn quảng cáo và âm thanh gây xao nhãng.

**Sudoku Web** được thiết kế lại hoàn toàn từ con số 0 nhằm khắc phục triệt để các vấn đề trên và mang đến một không gian thi đấu trí tuệ đẳng cấp:

### 1. 💡 Gợi ý thông minh kèm giải thích logic (Smart Hint with Explanations)
* **Không điền bừa:** Thay vì chọn ngẫu nhiên một ô trống bất kỳ và hiện đáp án cụt lủn, hệ thống phân tích bàn cờ theo đúng trình tự tư duy của các kiện tướng Sudoku:
  * **Naked Single:** Tìm ô duy nhất chỉ còn 1 ứng viên hợp lệ.
  * **Hidden Single:** Tìm chữ số duy nhất chỉ còn 1 ô có thể đặt được trong hàng, cột hoặc khối 3x3.
  * **Candidate Elimination:** Loại trừ các ứng viên xung quanh để xác định ô tối ưu nhất.
* **Banner giải thích trực quan:** Xuất hiện tinh gọn ngay phía trên bàn cờ kèm tên kỹ thuật trong ngoặc đơn, ví dụ:
  * `Ô hàng 1, cột 3 chỉ còn duy nhất số 4 hợp lệ (Naked Single)`
  * `Trong hàng 2, chỉ ô cột 5 có thể chứa số 8 (Hidden Single)`
* Giúp người chơi không chỉ giải được ván cờ mà còn thực sự học hỏi và nâng cao tư duy logic sau mỗi lần bấm gợi ý.

### 2. ⚡ Bút chì nhanh (Auto-Candidates) & ghi chú thông minh
* **Bút chì nhanh (Phím tắt `A`):**
  * Tự động tính toán và điền toàn bộ ứng viên hợp lệ cho tất cả ô trống trên bàn cờ.
  * Bật ON để hỗ trợ suy luận nâng cao, tắt OFF để xóa sạch màn hình giúp thoáng mắt và tập trung. Bật lại sẽ tự động tính toán lại mà không trừ điểm thêm.
  * Phạt điểm chiến lược: Dễ -100đ, Trung bình -200đ, Khó -300đ (chỉ trừ 1 lần duy nhất vào bảng tổng kết kết thúc ván, bảo toàn điểm thi đấu thời gian thực).
* **Cơ chế chống xung đột ghi chú thủ công độc quyền:**
  * Khi người chơi ghi chú một con số đã xuất hiện trên cùng hàng, cùng cột hoặc cùng khối 3x3, hệ thống lập tức ngăn chặn và kích hoạt hiệu ứng nhấp nháy đỏ 2 giây trên các ô xung đột để người chơi nhận diện ngay sai lầm.
* **Highlight ứng viên đồng bộ:**
  * Khi chọn bất kỳ con số nào, toàn bộ các ứng viên ghi chú tương ứng trên khắp bàn cờ sẽ được viền/nền xanh nổi bật (`.note-highlighted`), hỗ trợ quan sát tổng thể tức thì như trên các ứng dụng Sudoku cao cấp nhất.

### 3. 🛡️ Hệ thống 3 mạng lỗi sai & hồi sinh bù điểm lũy tiến
* **Giới hạn 3 cơ hội sai chuẩn mực (0/3):** Mỗi lần điền sai trừ điểm theo độ khó (Dễ -5đ, TB -7đ, Khó -10đ) và reset chuỗi streak.
* **Hồi sinh lũy tiến theo bảng cửu chương:** Khi phạm lỗi thứ 3 (3/3), trận đấu tạm dừng và mở Hộp thoại Hồi sinh. Người chơi có thể dùng chính số điểm kiếm được trong trận để đổi lấy thêm 1 cơ hội thi đấu:
  * Chi phí: $k \times \text{BaseCost}$ (Dễ 50đ, TB 100đ, Khó 150đ với $k$ là số lần hồi sinh).
  * Hồi sinh thành công: Lỗi sai giảm từ 3/3 về **2/3** (KHÔNG reset về 0/3) và ô số điền sai thứ 3 được tự động xóa để người chơi suy nghĩ lại.
* **Hoàn tác (Undo) chống gian lận nghiêm ngặt:**
  * Hoàn tác nước đi SAI: Giữ nguyên số lỗi và điểm phạt (lỗi sai là vĩnh viễn, chỉ cứu được bằng Hồi sinh).
  * Hoàn tác nước đi ĐÚNG: Khấu trừ lại điểm đã cộng để chống gian lận điểm số.

### 4. ⚡ Chế độ Tia chớp (Lightning Mode - Digit-First / Phím tắt `F`)
* Cho phép chọn 1 con số và click liên tục vào các ô trống trên bàn cờ để điền siêu tốc.
* Bấm vào bất kỳ số nào trên bàn cờ để chuyển ngay sang số đó.
* Khi đủ 9 ô của con số, phím số trên Numpad được ẩn đi nhưng **vẫn bảo toàn nguyên vẹn vị trí vật lý** để bảo vệ trí nhớ cơ bắp (muscle memory).

### 5. 🎯 Đổi gợi ý bằng Điểm Hồ Sơ vĩnh viễn (Mastery Points Exchange)
* Cấp sẵn 3 gợi ý miễn phí ban đầu (trừ điểm trận đấu).
* Từ lượt thứ 4 trở đi, người chơi có thể đổi thêm gợi ý bằng **Điểm Hồ Sơ vĩnh viễn** lũy tiến theo bảng cửu chương ($k \times \text{BaseCost}$) mà không làm ảnh hưởng đến điểm số của trận đấu đang chơi.

### 6. 🔊 Âm thanh procedural Web Audio API thuần khiết (Zero Audio Files)
* 100% âm thanh được tổng hợp thời gian thực bằng sóng âm Web Audio API (tiếng gõ gỗ thanh lịch, đàn Marimba thăng hoa theo chuỗi Combo, khải hoàn ca chiến thắng...).
* 0 byte tải về, không phụ thuộc file mp3 ngoài, độ trễ phản hồi bằng 0ms.

### 7. 📁 Sao lưu & khôi phục đa thiết bị chuẩn native (JSON Backup & Restore)
* Tích hợp File System Access API (`showSaveFilePicker`), mở hộp thoại "Save As..." của Windows để người chơi tự do chọn thư mục lưu trữ file `.json`.
* Trình duyệt tự động ghi nhớ vị trí lưu cho các lần xuất dữ liệu tiếp theo. Dễ dàng chuyển tiến trình và kỷ lục giữa máy tính cơ quan và máy tính cá nhân ở nhà.

### 8. 🖥️ Không gian thi đấu tĩnh lặng & tinh gọn (UI/UX Conciseness)
* Thiết kế chuyên biệt cho màn hình PC, hiển thị toàn bộ bàn cờ, thông số và bảng điều khiển trong **đúng 1 màn hình duy nhất, tuyệt đối không cần cuộn trang**.
* Giữ giao diện tĩnh lặng, thanh lịch, thông báo ngắn gọn dễ hiểu trong 1 giây, nói không với các hiệu ứng chớp đỏ giật cục hay âm thanh khó chịu.

---

## 🚀 Cách bắt đầu chơi ngay

### 🌐 Cách 1: Chơi trực tiếp trên trình duyệt
Bạn có thể truy cập và chơi ngay không cần cài đặt tại:
👉 **[https://jhanh.github.io/Sudoku_game/](https://jhanh.github.io/Sudoku_game/)**

### 💻 Cách 2: Tải về chơi offline trên máy tính
1. Tải tệp nén **[Sudoku-Game-v2.0.zip](https://github.com/Jhanh/Sudoku_game/releases/latest)** về máy tính.
2. Giải nén thư mục vừa tải về.
3. Mở trực tiếp tệp **`index.html`** bằng trình duyệt web yêu thích (Chrome, Edge, Firefox, Brave, Safari...). Không cần cài đặt bất kỳ phần mềm nào khác!

### 🛠️ Cách 3: Chạy bằng máy chủ nội bộ Python (dành cho lập trình viên)
```bash
python server.py
```
> Trình duyệt sẽ tự động mở trang web tại địa chỉ `http://localhost:3000`.

---

## ⌨️ Bảng phím tắt thao tác nhanh (PC Shortcuts)

| Phím Tắt | Chức Năng |
| :--- | :--- |
| `1` - `9` | Điền số vào ô được chọn (hoặc chọn/khóa số trong chế độ Tia chớp) |
| `F` | Bật / Tắt chế độ Tia chớp - Điền liên tiếp (Lightning Mode) |
| `A` | Bật / Tắt chế độ Bút chì nhanh - Tự động điền ứng viên (Fast Notes) |
| `N` | Bật / Tắt chế độ Ghi chú thủ công (Pencil Notes) |
| `H` | Nhận Gợi ý thông minh kèm giải thích logic (Smart Hint) |
| `Backspace` / `Delete` | Xóa số hoặc ghi chú trong ô |
| `Ctrl + Z` | Hoàn tác nước đi trước đó (Anti-Cheat Undo) |
| `Space` / `P` | Tạm dừng / Tiếp tục ván đấu |
| `↑` `↓` `←` `→` | Di chuyển ô chọn trên bàn cờ 9x9 |

---

## 📁 Cấu trúc thư mục dự án (Project Structure)

```text
Sudoku_game/
├── index.html                 # Giao diện chính, bàn cờ, thanh công cụ 6 nút & banner gợi ý
├── guide.txt                  # Hướng dẫn mở game & phím tắt nhanh cho bản nén
├── server.py                  # Máy chủ tĩnh nội bộ Python (Auto port + No-cache)
├── README.md                  # Tài liệu giới thiệu sản phẩm & hướng dẫn chi tiết
├── LICENSE                    # Giấy phép bản quyền mã nguồn mở MIT
├── .gitignore                 # Danh sách tệp loại trừ không lưu trên Git
├── docs/                      # Hệ thống tài liệu kiến trúc & sơ đồ Mermaid trực quan
│   ├── README.md                       # Sơ đồ tổng thể hệ thống (Master System Map)
│   ├── 01_component_architecture.md    # Sơ đồ kiến trúc 3 lớp (Presentation, Logic, Infra)
│   ├── 02_game_state_lifecycle.md      # Sơ đồ máy trạng thái & vòng đời ván đấu
│   ├── 03_data_flow_and_sequences.md   # Sơ đồ tuần tự điền số, Tia chớp, Bút chì nhanh & giải thuật
│   └── 04_storage_and_scoring_models.md # Sơ đồ ER LocalStorage & đường ống tính điểm
├── forDev/                    # Tài liệu kỹ thuật chi tiết dành riêng cho lập trình viên
├── devtools/                  # Bộ công cụ QA Dev Console & Ghost Answers kiểm thử
├── screenshots/               # Thư viện ảnh chụp giao diện thực tế trên máy tính
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

Dự án được phân phối dưới giấy phép mã nguồn mở **MIT License**. Bạn được tự do học tập, sử dụng và phát triển thêm.
