# 📐 Tài Liệu Kiến Trúc & Sơ Đồ Hệ Thống (Sudoku Game)

Chào mừng bạn đến với tài liệu kiến trúc toàn diện của dự án **Sudoku Game Web** (Vanilla JavaScript). 

Thư mục này cung cấp hệ thống sơ đồ trực quan được chuẩn hóa bằng **Mermaid.js**, giúp các lập trình viên, cộng tác viên và nhà phát triển nhanh chóng nắm bắt bức tranh toàn cảnh cũng như các luồng xử lý chi tiết bên trong trò chơi.

---

## 🗺️ 1. Sơ Đồ Tổng Thể Hệ Thống (Master System Map)

Sơ đồ tổng quan dưới đây mô phỏng sự tương tác giữa **4 phân hệ chính** của trò chơi mà không đi sâu vào chi tiết nội bộ. Bạn có thể bấm vào từng phân hệ để xem sơ đồ chuyên sâu tương ứng.

```mermaid
flowchart TB
    %% Định nghĩa màu sắc phân hệ
    classDef domainUI fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0369A1;
    classDef domainLogic fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#92400E;
    classDef domainState fill:#F3E8FF,stroke:#9333EA,stroke-width:2px,color:#6B21A8;
    classDef domainService fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#15803D;

    subgraph SUB_UI ["🖥️ 1. Phân Hệ Giao Diện và Tương Tác (UI / UX)"]
        UI_BOX["Hiển thị Bảng 9x9, Bàn Phím Số, Thanh Công Cụ và Modal<br/>(UIBoard, UIControls, Screen Navigation)"]
    end
    class SUB_UI,UI_BOX domainUI;

    subgraph SUB_LOGIC ["⚙️ 2. Phân Hệ Logic Cốt Lõi và Sinh Đề (Game Logic và Engine)"]
        LOGIC_BOX["Quy tắc Sudoku, Thuật toán Sinh đề duy nhất nghiệm,<br/>Kiểm tra đúng/sai và Tính điểm Combo<br/>(Game.js, SudokuEngine.js)"]
    end
    class SUB_LOGIC,LOGIC_BOX domainLogic;

    subgraph SUB_STATE ["🔄 3. Phân Hệ Vòng Đời và Trạng Thái (State và Lifecycle)"]
        STATE_BOX["Quản lý Luồng Màn Hình, Chế độ Chơi (Thường, Tia chớp),<br/>Cảnh báo nguy hiểm 3 cấp và Điều kiện Thắng/Thua<br/>(State Machine, Danger Overlay)"]
    end
    class SUB_STATE,STATE_BOX domainState;

    subgraph SUB_SERV ["💾 4. Phân Hệ Dịch Vụ Nền và Lưu Trữ (Services và Data)"]
        SERV_BOX["Lưu ván chơi, Hồ sơ cá nhân, Âm thanh Web Audio,<br/>Đa ngôn ngữ và Công cụ QA DevTools<br/>(Storage, Sound, I18n, DevTools)"]
    end
    class SUB_SERV,SERV_BOX domainService;

    %% Luồng liên kết giữa các phân hệ
    UI_BOX ==>|"Gửi thao tác người chơi (Click ô, bấm số, đổi chế độ)"| LOGIC_BOX
    LOGIC_BOX ==>|"Cập nhật dữ liệu và thông báo render lại"| UI_BOX

    LOGIC_BOX <-->|"Kích hoạt chuyển trạng thái (Pause, Danger, Finish)"| STATE_BOX
    STATE_BOX ==>|"Cập nhật hiệu ứng và điều hướng màn hình"| UI_BOX

    LOGIC_BOX ==>|"Lưu trạng thái ván, Ghi nhận điểm số và lịch sử"| SERV_BOX
    SERV_BOX ==>|"Phát âm thanh SFX, Cung cấp cấu hình và ngôn ngữ"| UI_BOX
    SERV_BOX -. "Kiểm thử và can thiệp trạng thái (QA HUD)" .-> LOGIC_BOX
```

---

## 📚 2. Danh Mục Các Sơ Đồ Chi Tiết (Detailed Diagrams)

Để tránh các đường nét bị chồng chéo và đảm bảo tính mạch lạc, toàn bộ chi tiết nội bộ được chia tách vào 4 tài liệu chuyên đề dưới đây:

| STT | Tài liệu chuyên sâu | Nội dung mô hình hóa | Liên kết |
|:---:|:---|:---|:---:|
| **01** | **Kiến trúc Phân tầng Module** | Phân tầng Presentation, Business Logic và Infrastructure theo chuẩn Module Pattern (IIFE), danh sách API công khai và quan hệ phụ thuộc. | [Xem sơ đồ 01](01_component_architecture.md) |
| **02** | **Vòng đời & Máy trạng thái** | Sơ đồ chuyển đổi trạng thái (State Machine): Splash $\rightarrow$ Lobby $\rightarrow$ In-Game, các chế độ (Thường $\leftrightarrow$ Tia chớp $\leftrightarrow$ Notes) và cấp độ cảnh báo nguy hiểm (Stages 1-3). | [Xem sơ đồ 02](02_game_state_lifecycle.md) |
| **03** | **Luồng Dữ Liệu & Trình Tự** | Trình tự các bước (Sequence Diagram) khi: Điền số vào ô, Kích hoạt chế độ Tia chớp, và Thuật toán sinh đề duy nhất nghiệm có kiểm tra Backtracking. | [Xem sơ đồ 03](03_data_flow_and_sequences.md) |
| **04** | **Mô hình Dữ liệu & Chấm điểm** | Cấu trúc Schema lưu trữ trong LocalStorage (Game state, User profile, Settings) và đường ống tính toán điểm số (Base + Streak + Time - Penalties). | [Xem sơ đồ 04](04_storage_and_scoring_models.md) |

---

## 🛠️ 3. Quy Ước Thiết Kế Hệ Thống (Key Design Principles)

1. **Pure Vanilla JS (No Frameworks):** Toàn bộ ứng dụng chạy trực tiếp trên trình duyệt mà không cần webpack, npm build hay framework phụ thuộc nào.
2. **Module Pattern & Encapsulation:** Mỗi module đóng gói trong một IIFE closure, bảo vệ biến nội bộ và chỉ xuất ra các phương thức public cần thiết.
3. **Single Source of Truth:** `Game.js` đóng vai trò trung tâm lưu giữ trạng thái ván chơi (`state`), mọi thay đổi đều thông qua hàm tác vụ của `Game` và thông báo tới `UIBoard` / `UIControls` qua cơ chế Observer (`_notify`).
4. **Resilient Data Persistence:** Tự động lưu tiến trình sau mỗi nước đi vào `localStorage`, khôi phục nguyên vẹn khi tải lại trang hoặc đổi thiết bị.
