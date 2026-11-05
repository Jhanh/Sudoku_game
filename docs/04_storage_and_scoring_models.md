# 💾 Sơ Đồ 04: Mô Hình Dữ Liệu & Hệ Thống Chấm Điểm (Storage & Scoring)

Tài liệu này mô hình hóa cấu trúc dữ liệu lưu trữ bền vững trong `localStorage` và đường ống giải thuật tính toán điểm số (**Scoring Pipeline**).

---

## 🗄️ 1. Cấu Trúc Dữ Liệu Lưu Trữ (LocalStorage Schema)

Hệ thống sử dụng các khóa độc lập trong `localStorage` để phân tách rõ ràng giữa trạng thái ván chơi, hồ sơ thành tích và tùy chọn cài đặt:

```mermaid
erDiagram
    SAVED_GAME ||--o{ UNDO_STACK : contains
    USER_PROFILE ||--|{ DIFFICULTY_STATS : tracks

    SAVED_GAME {
        string difficulty "easy | medium | hard"
        int_array current "Mảng 81 số hiện tại (0..9)"
        int_array solution "Mảng 81 số đáp án chuẩn"
        bool_array given "Mảng 81 cờ boolean ô cố định"
        object notes "Ghi chú theo key 'row,col': [1..9]"
        int timer "Thời gian chơi tính bằng giây"
        int score "Điểm số tích lũy hiện tại"
        int mistakes "Tổng số lỗi đã phạm"
        int correctStreak "Chuỗi điền đúng liên tiếp"
        int wrongStreak "Chuỗi điền sai liên tiếp"
        bool fastFillMode "Trạng thái bật/tắt Tia chớp"
        int fastFillDigit "Số đang ghim trong Tia chớp (null | 1..9)"
    }

    UNDO_STACK {
        string type "value | note | erase"
        int row "Chỉ số dòng (0..8)"
        int col "Chỉ số cột (0..8)"
        int oldValue "Giá trị trước khi sửa"
        array oldNotes "Ghi chú trước khi sửa"
        bool error "Nước đi đó có bị lỗi không"
        int pointsEarned "Điểm đã nhận ở lượt đó"
    }

    USER_PROFILE {
        string name "Tên người chơi hiển thị"
        int gamesPlayed "Tổng số ván đã tham gia"
        int gamesWon "Tổng số ván chiến thắng"
        int totalScore "Tổng điểm toàn bộ lịch sử"
        int totalTime "Tổng thời gian chơi (giây)"
    }

    DIFFICULTY_STATS {
        string difficulty "easy | medium | hard"
        int played "Số ván đã chơi"
        int won "Số ván thắng"
        int bestTime "Thời gian thắng nhanh nhất (giây)"
        int bestScore "Điểm số kỷ lục cao nhất"
    }

    APP_SETTINGS {
        bool soundEnabled "Bật/Tắt hiệu ứng âm thanh SFX"
        bool autoClearNotes "Tự động xóa ghi chú liên quan"
        bool highlightSame "Làm nổi bật các ô cùng số"
        bool highlightMistakes "Đổi màu đỏ khi điền sai"
        bool fastFillDefault "Mặc định mở chế độ Tia chớp"
        string language "Ngôn ngữ giao diện (vi | en)"
    }
```

---

## 🏆 2. Đường Ống Tính Toán Điểm Số (Scoring Pipeline)

Điểm số cuối cùng của ván chơi được tổng hợp qua công thức:

$$\text{Final Score} = \Big(\sum \text{Base Points} \times \text{Streak Mult} - \text{Mistake Penalties} - \text{Hint Penalties} + \text{Perfect Bonus}\Big) \times \text{Time Mult}$$

```mermaid
flowchart TD
    classDef base fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0369A1;
    classDef mult fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#92400E;
    classDef penalty fill:#FEE2E2,stroke:#DC2626,stroke-width:2px,color:#991B1B;
    classDef total fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#15803D;

    P_BASE["1. Điểm cơ bản từng ô đúng (Base Score):<br/>- Dễ: 10đ/ô<br/>- Vừa: 15đ/ô<br/>- Khó: 20đ/ô"]

    P_STREAK["2. Hệ số chuỗi đúng (Streak Multiplier):<br/>- 11 - 20 ô liên tiếp: x1.2<br/>- 21 - 30 ô liên tiếp: x1.5<br/>- 31 - 40 ô liên tiếp: x1.7<br/>- 41+ ô liên tiếp: x2.0"]

    P_PENALTY["3. Trừ điểm vi phạm và Gợi ý:<br/>- Phạt sai lũy tiến: -10đ, -20đ, -30đ...<br/>- Phạt dùng gợi ý: -50đ, -100đ, -150đ..."]

    P_BONUS["4. Thưởng ván hoàn hảo (Perfect Bonus):<br/>- 0 Lỗi: +100đ (Dễ), +200đ (Vừa), +300đ (Khó)"]

    P_TIME["5. Hệ số tốc độ khi thắng (Time Multiplier):<br/>- Dưới 01:30: x2.0<br/>- Dưới 05:00: x1.5<br/>- Trên 05:00: x1.0"]

    P_FINAL["🏁 ĐIỂM SỐ CHUNG CUỘC (Final Score)<br/>Hiển thị trên Victory Modal và lưu vào Bảng Kỷ Lục"]

    P_BASE --> P_STREAK
    P_STREAK --> P_PENALTY
    P_PENALTY --> P_BONUS
    P_BONUS --> P_TIME
    P_TIME --> P_FINAL

    class P_BASE base;
    class P_STREAK,P_TIME,P_BONUS mult;
    class P_PENALTY penalty;
    class P_FINAL total;
```

---

## 🔄 3. Cơ Chế Sao Lưu & Chuyển Đổi Tiến Trình Trò Chơi (Backup & Cross-Device Transfer)

Để hỗ trợ người chơi chuyển đổi giữa các thiết bị máy tính hoặc trình duyệt khác nhau mà không làm mất hàng trăm trận đấu và kỷ lục (do trò chơi vận hành phía client tĩnh trên GitHub Pages), hệ thống cung cấp tính năng **Xuất (Export)** và **Nhập (Import)** dữ liệu an toàn dưới chuẩn JSON:

```mermaid
flowchart TD
    classDef client fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0369A1;
    classDef file fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#92400E;
    classDef system fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#15803D;

    subgraph EXPORT_FLOW ["📤 1. Quy Trình Xuất Dữ Liệu (Export Flow)"]
        E_ACT["Người chơi bấm 'Xuất Dữ Liệu'"]
        E_PKG["Thu thập: Profile, Stats, Settings, Saved Game, Sound, Theme"]
        E_BLOB["Đóng gói Blob JSON và tải tệp sudoku_backup_YYYY-MM-DD.json"]
        E_ACT --> E_PKG --> E_BLOB
    end

    subgraph BACKUP_FILE ["📦 Tệp Sao Lưu An Toàn (.json)"]
        F_CONTENT["Chứa metadata (phiên bản, ngày giờ) & toàn bộ trạng thái LocalStorage"]
    end

    subgraph IMPORT_FLOW ["📥 2. Quy Trình Nhập Dữ Liệu (Import Flow)"]
        I_ACT["Người chơi bấm 'Nhập Tệp' & chọn file .json"]
        I_CONFIRM["Hộp thoại cảnh báo ghi đè xác nhận từ người chơi"]
        I_PARSE["FileReader đọc nội dung & Storage.importData xác thực"]
        I_HYDRATE["Ghi đè LocalStorage & làm mới giao diện ngay lập tức"]
        I_ACT --> I_CONFIRM --> I_PARSE --> I_HYDRATE
    end

    E_BLOB -->|Lưu về máy| BACKUP_FILE
    BACKUP_FILE -->|Tải lên máy mới| I_ACT

    class E_ACT,I_ACT client;
    class F_CONTENT file;
    class E_PKG,E_BLOB,I_CONFIRM,I_PARSE,I_HYDRATE system;
```

