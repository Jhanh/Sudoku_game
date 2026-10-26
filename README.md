# 🧩 Sudoku Web App

> **Trò chơi trí tuệ kinh điển.**

Một ứng dụng web Sudoku hoàn chỉnh được xây dựng thuần túy bằng **HTML5, CSS3 và JavaScript (ES6+)**, không phụ thuộc vào bất kỳ thư viện hay framework bên thứ ba nào, không cần cài đặt `node_modules`, có thể khởi chạy trực tiếp trên mọi trình duyệt hiện đại hoặc máy tính bảng / điện thoại.

---

## Trọng tâm dự án

### Sảnh chính
Thanh điều hướng cố định gồm 3 mục:
* **Trang chủ (Cổ điển):**
  * Thiết kế tối giản, tập trung vào trải nghiệm cốt lõi.
  * Tích hợp nút **"(?) Cách chơi"** mở hướng dẫn tương tác.
  * **Xử lý lưu tạm ván dở:** Tự động phát hiện ván chơi chưa kết thúc từ phiên trước, ưu tiên hiển thị nút **"Tiếp Tục Ván Đang Chơi"** kèm nút **"Bỏ Cuộc / Hủy Ván"** có hộp thoại xác nhận an toàn.
* **Biến thể (Khám phá):**
  * 4 thẻ minh họa các biến thể Sudoku nổi tiếng thế giới: **Killer Sudoku**, **Sudoku Đường Chéo (Sudoku X)**, **Samurai Sudoku (5 bảng chồng)**, và **Jigsaw Sudoku**.
  * Tương tác mượt mà với Custom Toast thông báo trạng thái cập nhật thân thiện.
* **Hồ sơ cá nhân & Thành tích (Profile & Stats):**
  * Avatar tự vẽ bằng SVG, cho phép đổi tên người chơi trực tiếp và lưu vĩnh viễn.
  * Bộ lọc 3 tab: **Dễ** | **Trung bình** | **Khó**.
  * **Biểu đồ vòng tròn:** Thể hiện trực quan Tỉ lệ thắng (%) và Tỉ lệ thắng hoàn hảo (0 lỗi).
  * **8 thẻ chỉ số chi tiết:** Số trận đã chơi, Số trận thắng, Thắng hoàn hảo, Tỉ lệ thắng, Chuỗi thắng hiện tại, Chuỗi thắng tốt nhất, Thời gian thắng nhanh nhất, Thời gian hoàn thành trung bình.

### Hoạt Ảnh Hướng Dẫn Tương Tác
Hướng dẫn 3 bước với hoạt ảnh chuyển động mô phỏng trực tiếp trên lưới:
* **Bước 1 (Quy tắc Hàng & Cột):** Chiếu sáng một hàng ngang và một cột dọc cắt nhau trên bảng 9x9, các số còn thiếu tự động nảy vào ô trống với hiệu ứng bounce.
* **Bước 2 (Quy tắc Khối 3×3):** Khối 3x3 zoom to nhẹ, số 9 còn thiếu tự động nhảy vào ô với màu xanh lá nổi bật.
* **Bước 3 (Suy luận & Ghi chú):** Lưới giao điểm hiển thị cách bật bút chì nháp các số tiềm năng, sau đó suy luận giải ra đáp án chính xác.

### Thuật Toán Sinh Đề Chuẩn Quốc Tế
* Đảm bảo **CÓ DUY NHẤT 1 LỜI GIẢI** cho mọi đề bài.
* Tối ưu hóa bằng giải thuật Backtracking kết hợp **Bitmask Acceleration**, thời gian tạo đề cực nhanh (< 25ms):
  * **Dễ (Easy):** 38 – 45 ô cho trước (cần điền 36 – 43 ô).
  * **Trung bình (Medium):** 30 – 35 ô cho trước (cần điền 46 – 51 ô).
  * **Khó (Hard):** 24 – 28 ô cho trước (cần điền 53 – 57 ô).

### Giao Diện & Tính Năng
* Bố cục chuẩn mực: Bảng Sudoku 9x9 bên trái, Thanh công cụ và Bàn phím số 3x3 bên phải (tự co giãn linh hoạt trên thiết bị di động).
* **Hiệu ứng Highlight thông minh:**
  * Chọn một ô: Tự động tô màu nhạt toàn bộ Hàng, Cột và Khối 3x3.
  * Làm nổi bật (Highlight đậm) tất cả các ô có cùng con số trên toàn bảng.
* **Thanh thông tin trận đấu:**
  * Hiển thị Độ khó, Điểm số, Bộ đếm thời gian (Timer).
  * Nút Tạm dừng (Pause): Che mờ bàn cờ và dừng đồng hồ bấm giờ.
  * Giới hạn lỗi (Mistakes): Tối đa `3 lỗi`. Có hiệu ứng cảnh báo vàng ở lỗi 1, rung lắc đỏ ở lỗi 2, và kết thúc ván khi đạt lỗi thứ 3.
* **4 Nút công cụ tròn:**
  * **Hoàn tác (Undo):** Quay lại nước đi trước đó (bao gồm cả hoàn tác lỗi và điểm số).
  * **Xóa (Erase):** Xóa số hoặc ghi chú đã điền.
  * **Ghi chú (Notes / Pencil):** Có nhãn `ON` / `OFF`. Khi bật `ON`, người chơi điền các số nháp nhỏ theo lưới 3x3 bên trong ô. Khi điền số chính thức, hệ thống **tự động loại bỏ các số nháp trùng** trên cùng hàng, cột và khối 3x3.
  * **Gợi ý (Hint):** Mặc định 3 lượt/ván kèm hiệu ứng phát sáng ô được trợ giúp.
* **Bàn phím 9 ô số kèm BỘ ĐẾM CÒN LẠI:**
  * Thiết kế lưới 3x3 trực quan.
  * Dưới mỗi số có nhãn đếm hiển thị số lượng con số còn thiếu trên bàn cờ. Khi người chơi điền đủ 9 số của chữ số đó, phím sẽ tự động mờ đi và bị vô hiệu hóa.
* **Hỗ trợ đầy đủ phím tắt bàn phím vật lý:**
  * Phím số `1` - `9`: Điền số hoặc ghi chú.
  * `Backspace` / `Delete`: Xóa ô.
  * `Ctrl + Z`: Hoàn tác.
  * `N`: Bật/tắt chế độ Ghi chú.
  * `H`: Dùng gợi ý.
  * Phím mũi tên `↑` `↓` `←` `→`: Di chuyển ô chọn trên bàn cờ.

### Lưu Trữ Bền Vững (Zero-loss Persistence)
* Tự động lưu trạng thái vào `LocalStorage` mỗi khi có thay đổi (mỗi nước đi, mỗi giây của bộ đếm giờ, ghi chú nháp, số lỗi).
* Tích hợp tầng đệm **In-Memory Fallback** an toàn tuyệt đối: không bao giờ gây lỗi giao diện ngay cả khi trình duyệt chặn LocalStorage ở chế độ ẩn danh (Private Browsing).

---

## 📁 Cấu Trúc Thư Mục Dự Án (Project Structure)

```text
Sudoku_game/
├── index.html                 # Giao diện chính và cấu trúc DOM ứng dụng
├── server.py                  # Máy chủ tĩnh nội bộ Python (Auto port + No-cache)
├── README.md                  # Tài liệu giới thiệu và hướng dẫn đóng góp
├── .gitignore                 # Danh sách các tệp/thư mục không đưa lên Git
├── css/
│   ├── main.css               # Reset CSS, CSS Variables, chuyển màn hình
│   ├── splash.css             # Giao diện và hoạt ảnh Màn hình Khởi đầu
│   ├── lobby.css              # Giao diện Sảnh chính, Navigation Bar, ván dở dang
│   ├── gameplay.css           # Bảng 9x9, bàn phím 3x3, thanh công cụ, đếm số
│   ├── modals.css             # Hộp thoại Hướng dẫn, Chọn độ khó, Game Over, Toast
│   └── profile.css            # Giao diện Hồ sơ, biểu đồ Donut Chart, Stat cards
└── js/
    ├── storage.js             # Lớp lưu trữ LocalStorage & Fallback Store
    ├── sudoku-engine.js       # Thuật toán sinh đề & giải Sudoku (Unique Solution)
    ├── game.js                # Quản lý trạng thái ván chơi, timer, mistakes, undo
    ├── ui-board.js            # Render bàn cờ 9x9, highlight hàng/cột/khối/số
    ├── ui-controls.js         # Quản lý bàn phím số 3x3, bộ đếm số còn lại
    ├── tutorial.js            # Quản lý hoạt ảnh hướng dẫn 3 bước tương tác
    ├── variants.js            # Quản lý danh sách và thẻ bài 4 biến thể
    ├── profile.js             # Quản lý thống kê hồ sơ và biểu đồ tỉ lệ thắng
    └── app.js                 # Router chính kết nối toàn bộ hệ thống
```

---

## 🚀 Hướng Dẫn Chạy Game (How to Run)

Ứng dụng không cần cài đặt Node.js hay bất kỳ build tools nào (`webpack`, `vite`...). Bạn có thể chạy bằng 1 trong 2 cách:

### Cách 1: Chạy trực tiếp (Nhanh nhất)
* Mở thư mục dự án trên máy tính.
* **Nhấp đúp chuột vào file `index.html`** để mở trên trình duyệt web bất kỳ (Chrome, Edge, Firefox, Cốc Cốc, Safari...).

### Cách 2: Chạy qua máy chủ nội bộ Python
Nếu máy tính của bạn đã cài đặt Python:
```bash
# Mở Terminal / PowerShell tại thư mục dự án và chạy:
python server.py
```
* Máy chủ sẽ tự động dò tìm cổng trống (mặc định thử cổng `3000`, nếu bận sẽ tự nhảy lên `3001`, `3002`...) và tự động mở trình duyệt web lên địa chỉ `http://localhost:3000`.
* Nhấn `Ctrl + C` trên cửa sổ Terminal để tắt máy chủ khi muốn dừng.
