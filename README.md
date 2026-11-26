# 🧩 Sudoku Web - Phiên bản tối ưu hóa chuyên biệt cho PC

<p align="center">
  <b>Trải nghiệm giải đố trí tuệ kinh điển với giao diện sứ xúc giác êm dịu chuyên biệt cho máy tính (PC / Laptop), mượt mà, tĩnh lặng và sâu sắc.</b>
  <br>
  <i>Xây dựng 100% bằng HTML5, CSS3 và Pure Vanilla JavaScript ES6+ - Tinh gọn, thuần khiết, âm thanh Web Audio procedural SFX, Zero Dependencies, không phụ thuộc bất kỳ thư viện ngoài nào.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Pure%20JS-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/HTML5-Semantic-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-Serene%20Porcelain-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/PC%20Optimized-100%25-0284C7?style=flat-square" alt="PC Optimized">
  <img src="https://img.shields.io/badge/Dependencies-0-brightgreen?style=flat-square" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/License-PolyForm%20Noncommercial-blue?style=flat-square" alt="PolyForm Noncommercial 1.0.0">
</p>

---

## 🎮 Các tính năng nổi bật dành cho người chơi

### 1. 📅 Thử thách hàng ngày & bộ sưu tập cúp tháng theo mùa
* Mỗi ngày hệ thống tạo một câu đố chung duy nhất bằng thuật toán hạt giống định sẵn (tỉ lệ cân bằng: 30% Dễ, 50% Trung bình, 20% Khó) hoàn toàn không cần máy chủ.
* Hoàn thành thử thách để thu thập đồng xu sao vàng trên lịch tháng và mở khóa **5 hình thái cúp nghệ thuật SVG** tiến hóa theo các mốc 7 ngày, 14 ngày, 21 ngày và trọn tháng (tự động thích ứng tháng 28, 29, 30 hoặc 31 ngày), kết hợp **4 dấu ấn mùa** (Xuân, Hạ, Thu, Đông).
* Toàn bộ lịch sử huy chương được lưu trữ vĩnh viễn và cho phép giải bổ sung các ngày trước đó trong tháng.

### 2. 💡 Gợi ý thông minh kèm giải thích logic (Smart Hint)
* Không đơn thuần điền hộ con số, hệ thống phân tích bàn cờ theo tư duy con người và hiển thị banner giải thích ngắn gọn ngay phía trên bàn cờ:
  * Chỉ rõ vì sao ô đó mang giá trị tương ứng (ví dụ: *Naked Single* - ô duy nhất chỉ còn 1 ứng viên, hoặc *Hidden Single* - số duy nhất chỉ còn 1 vị trí hợp lệ trong hàng/cột/khối).
* Mỗi ván có sẵn 3 lượt gợi ý miễn phí đầu tiên; từ lượt thứ 4 trở đi, bạn có thể dùng **điểm Hồ sơ vĩnh viễn** (Mastery Points) để đổi thêm gợi ý theo cấp số nhân ($\text{BaseCost} \times 2^{k-1}$) mà không trừ điểm trận đang đấu.

### 3. ⚡ Bút chì nhanh (Fast Notes / phím `A`) & chống ghi chú trùng
* Nhấn phím `A` để tự động tính toán và điền toàn bộ ứng viên hợp lệ vào các ô trống còn lại; nhấn lại để dọn sạch ghi chú giúp thoáng mắt và tập trung suy luận.
* Khi ghi chú thủ công một số đã xuất hiện trên cùng hàng, cột hoặc khối 3x3, hệ thống lập tức ngăn chặn và làm nhấp nháy xanh dương 2 lần trong 1.2 giây tại các ô xung đột để định hướng trực quan.
* Khi chọn một con số hoặc khóa số Tia chớp, toàn bộ ghi chú tương ứng trên khắp 81 ô đều được tô sáng đồng bộ.

### 4. 🛡️ Hệ thống 3 mạng lỗi sai (0/3), hồi sinh bù điểm & chống khai thác điểm
* Giới hạn 3 cơ hội sai cho mỗi ván đấu. Mỗi lần điền sai sẽ trừ điểm theo độ khó và đặt lại chuỗi combo.
* Khi chạm ngưỡng 3/3 lỗi, ván đấu tự động tạm dừng và mở hộp thoại Hồi sinh: bạn có thể dùng điểm tích lũy trong ván để bù điểm theo bảng cửu chương ($k \times \text{BaseCost}$), giảm lỗi về 2/3 và xóa ô vừa điền sai để tiếp tục.
* Cơ chế `Xóa` (`Backspace`) tự động bảo vệ các ô đã điền đúng (chỉ xóa số điền sai hoặc ghi chú nháp) nhằm ngăn bấm nhầm; cơ chế `Hoàn tác` (`Ctrl + Z`) cho phép lùi lại nước đi đúng kèm khấu trừ chính xác điểm combo đã nhận, trong khi lỗi sai đã mắc là bất khả đảo ngược.

### 5. ⚡ Chế độ Tia chớp (Lightning Mode / phím `F`)
* Cho phép khóa một chữ số trên bàn phím số (hoặc nhấp vào ô đã có số trên bàn cờ) rồi nhấp liên tục vào các ô trống để điền nhanh trong chớp mắt.
* Khi một chữ số đã hoàn thành đủ 9 ô, phím số đó tự động ẩn đi nhưng **vẫn giữ nguyên vị trí vật lý cố định** trên bàn phím 3x3 nhằm bảo toàn phản xạ trí nhớ cơ bắp.

### 6. 🎨 Ngôn ngữ thiết kế sứ xúc giác (Serene Sky & Tactile Porcelain) & âm thanh Web Audio
* Không gian thị giác bầu trời dịu nhẹ (Light mode) và hoàng hôn sâu lắng (Dark mode) kết hợp khung bàn cờ sứ nổi khối, phím bấm 3D êm ái, biểu tượng vector Lucide sắc nét và hệ thống 9 bậc danh hiệu kỳ thủ trên trang Hồ sơ 1 màn hình không cuộn.
* Toàn bộ 10 hiệu ứng âm thanh (tiếng gõ gỗ, đàn Marimba tăng cao độ theo chuỗi Combo, chuông gợi ý, khải hoàn ca chiến thắng) được tổng hợp thời gian thực bằng Web Audio API với dung lượng tệp âm thanh ngoài bằng 0.

### 7. 📁 Sao lưu & khôi phục tiến trình chuẩn bản địa (JSON Backup)
* Ứng dụng File System Access API mở trực tiếp hộp thoại "Save As..." để bạn chọn thư mục lưu tệp `.json` sao lưu toàn bộ hồ sơ, thống kê, bộ sưu tập thử thách ngày, cài đặt và ván cờ đang chơi dở giữa các máy tính khác nhau.

---

## 🚀 Cách bắt đầu chơi ngay

### 🌐 Cách 1: Chơi trực tiếp trên trình duyệt web
Bạn có thể mở và trải nghiệm ngay lập tức không cần cài đặt tại:
👉 **[https://jhanh.github.io/Sudoku_game/](https://jhanh.github.io/Sudoku_game/)**

### 💻 Cách 2: Chơi ngoại tuyến trên máy tính cá nhân
1. Tải mã nguồn hoặc gói phát hành `.zip` từ mục **Releases** của kho lưu trữ.
2. Giải nén thư mục ra máy tính.
3. Mở trực tiếp tệp **`index.html`** bằng bất kỳ trình duyệt web hiện đại nào (Chrome, Edge, Firefox, Brave, Opera, Safari...). Không cần kết nối mạng hay cài đặt môi trường phụ trợ.

---

## ⌨️ Bảng phím tắt thao tác nhanh trên PC

| Phím tắt | Chức năng |
| :--- | :--- |
| `1` - `9` | Điền số vào ô đang chọn (hoặc chọn/đổi số khóa trong chế độ Tia chớp) |
| `F` | Bật / tắt chế độ Tia chớp - điền số liên tiếp (Lightning Mode) |
| `A` | Bật / tắt chế độ Bút chì nhanh - tự động điền ứng viên hợp lệ (Fast Notes) |
| `N` | Bật / tắt chế độ Ghi chú thủ công (Pencil Notes) |
| `H` | Nhận Gợi ý thông minh (hoặc mở hộp thoại đổi thêm gợi ý khi hết lượt miễn phí) |
| `Backspace` / `Delete` | Xóa số điền sai hoặc ghi chú nháp trong ô đang chọn (bảo vệ ô đã điền đúng) |
| `Ctrl + Z` | Hoàn tác nước đi trước đó (khấu trừ điểm combo nếu lùi nước đúng) |
| `Space` | Tạm dừng / tiếp tục ván đấu đang diễn ra |
| `↑` `↓` `←` `→` | Di chuyển ô chọn trên bàn cờ 9x9 |

---

## 📁 Cấu trúc thư mục dự án

```text
Sudoku_game/
├── index.html                 # Khung giao diện SPA: 4 sảnh điều hướng, bàn cờ, bàn phím & hộp thoại
├── README.md                  # Tài liệu giới thiệu sản phẩm & hướng dẫn sử dụng
├── LICENSE                    # Giấy phép bản quyền mã nguồn PolyForm Noncommercial 1.0.0
├── .gitignore                 # Cấu hình loại trừ các tệp tạm và tài nguyên nội bộ
├── docs/                      # Tài liệu kiến trúc hệ thống, sơ đồ Mermaid & cẩm nang tra cứu
│   ├── Sudoku.docx                     # Cẩm nang tra cứu luật chơi, cấp bậc danh hiệu & tính điểm
│   ├── README.md                       # Sơ đồ tổng thể 4 phân hệ chính (Master System Map)
│   ├── 01_component_architecture.md    # Kiến trúc 3 tầng & 12 module JavaScript IIFE
│   ├── 02_game_state_lifecycle.md      # Máy trạng thái màn hình, chế độ chơi & vòng đời 3 mạng lỗi
│   ├── 03_data_flow_and_sequences.md   # Sơ đồ tuần tự điền số, Tia chớp & thuật toán sinh đề
│   └── 04_storage_and_scoring_models.md # Sơ đồ thực thể LocalStorage, công thức điểm & sao lưu JSON
├── css/                       # Hệ thống 7 module CSS thuần khiết (Serene Sky & Tactile Porcelain)
│   ├── main.css               # Design tokens Sáng/Tối, nền bầu trời pastel, nút xúc giác & thông báo PC
│   ├── splash.css             # Giao diện & hoạt ảnh màn hình chào mừng khởi đầu
│   ├── lobby.css              # Sảnh Trang chủ 3D Isometric, thẻ chọn nhanh, Biến thể & thanh Dock kính mờ
│   ├── daily.css              # Sảnh Thử thách ngày 2 cột, đài trưng bày 5 cúp tháng & lịch sao vàng
│   ├── gameplay.css           # Bàn cờ sứ 9x9, phím bấm 3D Numpad 3x3, 6 công cụ & huy hiệu combo
│   ├── profile.css            # Sảnh Hồ sơ 1 màn hình: thẻ kỳ thủ gradient, 9 cấp bậc & thống kê nhóm
│   └── modals.css             # Hộp thoại Hướng dẫn, Cài đặt, Hồi sinh, Đổi gợi ý, Luật chơi & Kết quả
└── js/                        # Hệ thống 12 module JavaScript IIFE độc lập
    ├── icons.js               # Động cơ biểu tượng vector chuẩn Lucide tập trung thích ứng chủ đề
    ├── sudoku-engine.js       # Thuật toán sinh đề duy nhất nghiệm, chấm độ khó logic & PRNG theo ngày
    ├── game.js                # Trung tâm trạng thái ván đấu, tính điểm, 3 lỗi sai, hồi sinh & hoàn tác
    ├── storage.js             # Quản trị LocalStorage bền vững, lịch sử ngày, điểm Hồ sơ & sao lưu JSON
    ├── sound.js               # Bộ tổng hợp âm thanh Web Audio API thời gian thực (10 hiệu ứng SFX)
    ├── i18n.js                # Động cơ bản địa hóa song ngữ tức thì (Tiếng Việt / English)
    ├── ui-board.js            # Hiển thị 81 ô bàn cờ, tô sáng liên đới, ghi chú & sóng mở màn
    ├── ui-controls.js         # Điều khiển Numpad 3x3, đồng hồ, thanh thông số, 6 công cụ & banner gợi ý
    ├── profile.js             # Hiển thị hồ sơ kỳ thủ, 9 bậc danh hiệu, biểu đồ tỉ lệ thắng & kỷ lục
    ├── tutorial.js            # Hướng dẫn trực quan 3 bước cốt lõi không gây xao nhãng
    ├── variants.js            # Giới thiệu đặc trưng & tra cứu luật chơi của 4 biến thể Sudoku
    └── app.js                 # Điều phối trung tâm, điều hướng 4 tab sảnh, lịch ngày & phím tắt toàn cục
```

---

## 📄 Bản quyền & giấy phép

Dự án được phân phối dưới giấy phép **PolyForm Noncommercial License 1.0.0**. Bạn được tự do học tập, nghiên cứu, sửa đổi và giải trí cá nhân phi thương mại. Mọi hành vi thương mại hóa hoặc kinh doanh thu lợi nhuận đều bị nghiêm cấm khi chưa có sự đồng ý bằng văn bản của tác giả.
