# 💾 Sơ đồ 04: Mô hình dữ liệu & hệ thống tính điểm (Storage & scoring)

Tài liệu này mô hình hóa cấu trúc **8 khóa dữ liệu bền vững** trong `localStorage`, đường ống tính toán điểm số (**Scoring Pipeline**) và cơ chế sao lưu / khôi phục tệp JSON giữa các thiết bị.

---

## 🗄️ 1. Cấu trúc dữ liệu lưu trữ (LocalStorage schema)

Module `Storage` phân tách rạch ròi trạng thái ván đang chơi, hồ sơ cá nhân, thống kê 3 độ khó, lịch sử Thử thách ngày trọn đời và các tùy chọn cài đặt:

```mermaid
erDiagram
    SAVED_GAME ||--o{ UNDO_ACTION : contains
    USER_PROFILE ||--|{ DIFFICULTY_STATS : tracks
    USER_PROFILE ||--o{ DAILY_RECORD : collects

    SAVED_GAME {
        string difficulty "easy | medium | hard"
        int_array puzzle "Mảng 81 ô đề bài gốc"
        int_array current "Mảng 81 ô người chơi đang điền (0..9)"
        int_array solution "Mảng 81 ô đáp án chuẩn"
        bool_array given "Mảng 81 cờ đánh dấu ô cố định"
        object notes "Ghi chú nháp theo khóa 'row,col': [1..9]"
        int timer "Thời gian thi đấu (giây)"
        int score "Điểm trận đấu hiện tại"
        int mistakes "Số lỗi đã mắc (0..3)"
        int reviveCount "Số lần đã hồi sinh trong ván"
        int hints "Số lượt gợi ý miễn phí còn lại (0..3)"
        int hintsUsed "Tổng số gợi ý đã dùng"
        int hintsBought "Số lượt gợi ý đã đổi bằng điểm Hồ sơ"
        int correctStreak "Chuỗi điền đúng liên tiếp hiện tại"
        int maxStreak "Chuỗi đúng dài nhất trong ván"
        bool autoNotesMode "Trạng thái bật/tắt Bút chì nhanh"
        int autoNotesPenalty "Điểm phạt Bút chì nhanh (0 | 100 | 200 | 300)"
        bool fastFillMode "Trạng thái bật/tắt Tia chớp"
        int fastFillDigit "Chữ số đang khóa (null | 1..9)"
        bool isDaily "Cờ đánh dấu ván Thử thách ngày"
        string dailyDateStr "Chuỗi ngày YYYY-MM-DD (nếu là ván ngày)"
    }

    UNDO_ACTION {
        string type "value | note | erase"
        int row "Chỉ số hàng (0..8)"
        int col "Chỉ số cột (0..8)"
        int oldValue "Giá trị trước thao tác"
        array oldNotes "Mảng ghi chú trước thao tác"
        bool error "Đánh dấu nước đi sai bất khả đảo ngược"
        int pointsEarned "Điểm cộng của nước đi đúng (để khấu trừ khi hoàn tác)"
    }

    USER_PROFILE {
        string name "Tên kỳ thủ hiển thị"
        int totalPlayTime "Tổng thời gian chơi lũy kế (giây)"
    }

    DIFFICULTY_STATS {
        string difficulty "easy | medium | hard"
        int played "Tổng số ván đã chơi"
        int won "Tổng số ván chiến thắng"
        int perfectWins "Số ván thắng hoàn hảo (0 lỗi)"
        int currentStreak "Chuỗi thắng hiện tại"
        int bestStreak "Kỷ lục chuỗi thắng dài nhất"
        int bestTime "Thời gian thắng nhanh nhất (giây)"
        int totalWinTime "Tổng thời gian các ván thắng (tính trung bình)"
        int bestScore "Điểm số cao nhất từng đạt"
        int totalScore "Điểm tích lũy vĩnh viễn (Mastery Points)"
    }

    DAILY_RECORD {
        string dateStr "Khóa ngày YYYY-MM-DD trong sudoku_daily"
        string result "win | lose (không bao giờ ghi đè win bằng lose)"
        string difficulty "easy | medium | hard"
        int score "Điểm số cao nhất đạt được trong ngày đó"
        int time "Thời gian giải nhanh nhất (giây)"
        int mistakes "Số lỗi mắc phải"
    }

    APP_SETTINGS {
        bool autoClearNotes "Tự động xóa ghi chú liên quan khi điền đúng"
        bool highlightSame "Làm nổi bật các ô có cùng chữ số"
        bool highlightMistakes "Báo màu đỏ ngay khi điền sai"
        bool fastFillDefault "Tự động bật Tia chớp khi mở ván mới"
        bool soundEnabled "Trạng thái âm thanh (sudoku_sound_enabled)"
        string language "Ngôn ngữ vi | en (sudoku_language)"
        string theme "Chủ đề light | dark (sudoku_theme)"
    }
```

---

## 🏆 2. Đường ống tính toán điểm số (Scoring pipeline)

Điểm số chung cuộc của mỗi ván đấu được tổng hợp chính xác qua công thức:

$$\text{Final Score} = \text{round}\Big(\max\big(0,\; \text{InMatchScore} - \text{AutoNotesPenalty}\big) \times \text{TimeMultiplier}\Big)$$

Trong đó $\text{InMatchScore}$ là điểm số trực tiếp trong ván (đã cộng từng ô nhân hệ số chuỗi đúng, cộng thưởng hoàn hảo nếu 0 lỗi, trừ phạt lỗi sai, trừ phạt 3 gợi ý đầu và trừ chi phí bù điểm hồi sinh, luôn giữ sàn $\ge 0$).

```mermaid
flowchart TD
    classDef base fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0369A1;
    classDef mult fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#92400E;
    classDef penalty fill:#FEE2E2,stroke:#DC2626,stroke-width:2px,color:#991B1B;
    classDef total fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#15803D;

    P_BASE["1. Điểm cơ bản mỗi ô điền đúng:<br/>- Dễ: +10đ/ô | Trung bình: +20đ/ô | Khó: +40đ/ô"]

    P_STREAK["2. Nhân hệ số chuỗi đúng liên tiếp (Streak Multiplier):<br/>- Ô 1 - 10: ×1.0 | Ô 11 - 20: ×1.2 | Ô 21 - 30: ×1.5<br/>- Ô 31 - 40: ×1.7 | Ô 41 trở lên: ×2.0"]

    P_INMATCH_PEN["3. Khấu trừ trực tiếp trong ván (sàn tối thiểu 0đ):<br/>- Phạt nước sai: Dễ -5đ, TB -7đ, Khó -10đ<br/>- Phạt 3 gợi ý miễn phí: Dễ (30, 50, 70), TB (50, 70, 90), Khó (50, 100, 150)<br/>- Bù điểm Hồi sinh (khi chạm 3/3 lỗi): k × BaseCost (50 / 100 / 150đ)<br/>- Lưu ý: Đổi gợi ý từ lần 4 trừ vào điểm Hồ sơ vĩnh viễn (BaseCost × 2^(k-1))"]

    P_BONUS["4. Thưởng thắng hoàn hảo (khi giải xong 81 ô với 0 lỗi):<br/>- Dễ: +100đ | Trung bình: +200đ | Khó: +300đ"]

    P_AUTONOTES["5. Khấu trừ công cụ cuối ván:<br/>- Phạt Bút chì nhanh (nếu có bật trong ván, phạt 1 lần duy nhất):<br/>  Dễ -100đ | Trung bình -200đ | Khó -300đ"]

    P_TIME["6. Nhân hệ số tốc độ hoàn thành (Time Multiplier):<br/>- Dễ: <1p30s ×2.0, <5p ×1.5, >=5p ×1.0<br/>- Trung bình: <3p ×2.0, <10p ×1.5, >=10p ×1.0<br/>- Khó: <6p ×2.0, <20p ×1.5, >=20p ×1.0"]

    P_FINAL["🏁 Tổng điểm đạt được (Final Score)<br/>Cộng dồn vào điểm Hồ sơ vĩnh viễn (9 cấp bậc danh hiệu) & lưu kỷ lục"]

    P_BASE --> P_STREAK --> P_INMATCH_PEN --> P_BONUS --> P_AUTONOTES --> P_TIME --> P_FINAL

    class P_BASE base;
    class P_STREAK,P_BONUS,P_TIME mult;
    class P_INMATCH_PEN,P_AUTONOTES penalty;
    class P_FINAL total;
```

---

## 🔄 3. Cơ chế sao lưu & khôi phục tiến trình toàn diện (JSON backup & restore)

Nhằm giúp người chơi dễ dàng chuyển toàn bộ lịch sử thi đấu giữa nhiều máy tính mà không cần tài khoản trực tuyến, hệ thống hỗ trợ xuất và nhập gói dữ liệu `.json` an toàn:

```mermaid
flowchart TD
    classDef client fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0369A1;
    classDef file fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#92400E;
    classDef system fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#15803D;

    subgraph EXPORT_FLOW ["📤 1. Quy trình xuất dữ liệu (Storage.exportData)"]
        E_ACT["Người chơi bấm 'Xuất dữ liệu' trong Cài đặt"]
        E_PKG["Thu thập trọn bộ 8 nguồn: Game đang dở, Profile, Stats,<br/>Daily lịch sử cúp, Settings, Sound, Language & Theme"]
        E_SAVE["Mở hộp thoại Save As (showSaveFilePicker)<br/>hoặc tải xuống tệp sudoku_backup_YYYY-MM-DD.json"]
        E_ACT --> E_PKG --> E_SAVE
    end

    subgraph BACKUP_FILE ["📦 Tệp sao lưu chuẩn (.json)"]
        F_CONTENT["Đóng gói metadata phiên bản cùng dữ liệu JSON có cấu trúc"]
    end

    subgraph IMPORT_FLOW ["📥 2. Quy trình nhập dữ liệu (Storage.importData)"]
        I_ACT["Người chơi bấm 'Nhập tệp' & chọn tệp .json"]
        I_CONFIRM["Hộp thoại xác nhận cảnh báo ghi đè dữ liệu hiện tại"]
        I_VALID["Kiểm tra schema hợp lệ (xác thực mảng current & solution<br/>của ván dở, chuẩn hóa chỉ số thống kê & gộp lịch sử ngày)"]
        I_SYNC["Cập nhật LocalStorage & đồng bộ giao diện tức thì<br/>(Chủ đề, Ngôn ngữ, Âm thanh, Sảnh chính, Lịch ngày & Hồ sơ)"]
        I_ACT --> I_CONFIRM --> I_VALID --> I_SYNC
    end

    E_SAVE -->|"Lưu trữ an toàn"| BACKUP_FILE
    BACKUP_FILE -->|"Khôi phục trên máy khác"| I_ACT

    class E_ACT,I_ACT client;
    class F_CONTENT file;
    class E_PKG,E_SAVE,I_CONFIRM,I_VALID,I_SYNC system;
```
