# 🔄 Sơ đồ 02: Vòng đời & máy trạng thái (Game state lifecycle)

Tài liệu này mô hình hóa vòng đời chuyển đổi trạng thái trong toàn bộ ứng dụng, bao gồm:
1. **Luồng điều hướng màn hình & 4 tab sảnh chính**
2. **Máy trạng thái chế độ nhập liệu & công cụ trong ván đấu**
3. **Cơ chế giới hạn 3 mạng lỗi sai, Hồi sinh bù điểm & Đổi gợi ý**

---

## 🧭 1. Luồng điều hướng màn hình & 4 tab sảnh chính

```mermaid
flowchart TD
    classDef screen fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0369A1;
    classDef tabNode fill:#E0E7FF,stroke:#4F46E5,stroke-width:2px,color:#312E81;
    classDef modal fill:#F3E8FF,stroke:#9333EA,stroke-width:2px,color:#6B21A8;
    classDef game fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#92400E;
    classDef endNode fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#15803D;

    START(("Mở index.html")) --> SCR_SPLASH["Màn hình chào mừng (Splash)<br/>(Logo 3x3 động & giới thiệu)"]
    SCR_SPLASH -->|"Bấm 'Khám phá ngay'"| SCR_LOBBY["Sảnh chính (Lobby) & thanh Dock kính mờ"]
    class SCR_SPLASH,SCR_LOBBY screen;

    subgraph SUB_TABS ["4 tab chức năng trên thanh điều hướng đáy"]
        TAB_HOME["1. Trang chủ<br/>(3 thẻ chơi nhanh HOẶC thẻ tiếp tục ván dở)"]
        TAB_DAILY["2. Thử thách ngày<br/>(Lịch tháng, 5 cúp tiến hóa & 4 dấu ấn mùa)"]
        TAB_VAR["3. Biến thể<br/>(Killer, Đường chéo, Samurai, Jigsaw)"]
        TAB_PROF["4. Hồ sơ<br/>(9 cấp bậc danh hiệu, tỉ lệ thắng & kỷ lục)"]
    end
    class TAB_HOME,TAB_DAILY,TAB_VAR,TAB_PROF tabNode;

    SCR_LOBBY --- TAB_HOME
    SCR_LOBBY --- TAB_DAILY
    SCR_LOBBY --- TAB_VAR
    SCR_LOBBY --- TAB_PROF

    subgraph SUB_MODALS ["Hộp thoại thông tin & hệ thống"]
        MOD_TUT["Hộp thoại Cách chơi (3 bước)"]
        MOD_INFO["Hộp thoại Luật chơi một nút bấm<br/>(App.showInfoModal - Đã hiểu)"]
        MOD_SET["Hộp thoại Cài đặt & Sao lưu JSON"]
    end
    class MOD_TUT,MOD_INFO,MOD_SET modal;

    TAB_HOME <-->|"Bấm 'Cách chơi'"| MOD_TUT
    TAB_DAILY <-->|"Xem luật thử thách"| MOD_INFO
    TAB_VAR <-->|"Bấm 'Xem luật chơi'"| MOD_INFO
    TAB_PROF <-->|"Bấm nút bánh răng"| MOD_SET

    TAB_HOME -->|"Chọn thẻ Dễ / Trung bình / Khó<br/>hoặc Tiếp tục ván đang chơi"| IN_GAME["Màn hình ván đấu (Gameplay)<br/>(Bàn cờ sứ 9x9, Numpad 3x3, 6 công cụ)"]
    TAB_DAILY -->|"Bấm 'Chơi' trên ngày được chọn"| IN_GAME
    class IN_GAME game;

    PAUSE_OVERLAY["Trạng thái Tạm dừng (Space / nút Pause)<br/>(Ẩn toàn bộ số & khóa cụm điều khiển)"]
    MOD_BUY_HINT["Hộp thoại Đổi thêm gợi ý<br/>(Tiêu hao điểm Hồ sơ vĩnh viễn)"]
    class PAUSE_OVERLAY,MOD_BUY_HINT modal;

    IN_GAME <-->|"Phím Space / nút Tạm dừng"| PAUSE_OVERLAY
    IN_GAME <-->|"Bấm Gợi ý / phím H khi hết lượt miễn phí"| MOD_BUY_HINT

    IN_GAME -->|"Điền đúng trọn vẹn 81 ô"| MOD_VICTORY["Hộp thoại Chiến thắng<br/>(Confetti, tổng điểm & lưu cúp ngày)"]
    IN_GAME -->|"Từ bỏ tại mốc 3/3 lỗi hoặc bấm Bỏ cuộc"| MOD_GAMEOVER["Hộp thoại Kết thúc ván<br/>(Tổng kết điểm & điều hướng thông minh)"]
    class MOD_VICTORY,MOD_GAMEOVER endNode;

    MOD_VICTORY -->|"Ván mới (Classic) / Về lịch thử thách (Daily)"| SCR_LOBBY
    MOD_GAMEOVER -->|"Ván mới / Thử lại ngày này"| IN_GAME
    MOD_GAMEOVER -->|"Về sảnh chính / Về lịch thử thách"| SCR_LOBBY
```

---

## ⚡ 2. Máy trạng thái chế độ nhập liệu trong ván đấu

Trong quá trình giải đố, người chơi chuyển đổi tức thì giữa **Chế độ thường**, **Chế độ Tia chớp (`F`)**, **Ghi chú thủ công (`N`)** và **Bút chì nhanh (`A`)**, kết hợp quy tắc bảo vệ ô đúng khi **Xóa (`Backspace`)** và khấu trừ điểm công bằng khi **Hoàn tác (`Ctrl + Z`)**.

```mermaid
flowchart TD
    classDef normal fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0369A1;
    classDef fast fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#92400E;
    classDef note fill:#F3E8FF,stroke:#9333EA,stroke-width:2px,color:#6B21A8;
    classDef guard fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#15803D;

    subgraph MODE_NORMAL ["🎮 1. Chế độ thường (Chọn ô trước - điền số sau)"]
        direction TB
        NORM_SEL["Chọn ô trên bàn cờ (selectedCell)"]
        NORM_INP["Bấm phím số 1 - 9"]
        NORM_RES["Xác thực nghiệm chuẩn & cập nhật điểm"]
        NORM_HIDE["Khi đủ 9/9 ô của một chữ số:<br/>Ẩn phím đó nhưng giữ nguyên vị trí vật lý"]
        NORM_SEL --> NORM_INP --> NORM_RES --> NORM_HIDE
    end
    class MODE_NORMAL,NORM_SEL,NORM_INP,NORM_RES,NORM_HIDE normal;

    subgraph MODE_FAST ["⚡ 2. Chế độ Tia chớp (Phím F - khóa số điền liên tiếp)"]
        direction TB
        FAST_ON["Bật Tia chớp & chọn chữ số muốn khóa (fastFillDigit)"]
        FAST_CLICK["Nhấp liên tục vào các ô trống để điền (hoặc ghi chú)"]
        FAST_DONE["Khi đủ 9/9 ô của chữ số đó:<br/>Tự động nhả khóa số & chờ chọn số tiếp theo"]
        FAST_ON --> FAST_CLICK --> FAST_DONE
    end
    class MODE_FAST,FAST_ON,FAST_CLICK,FAST_DONE fast;

    subgraph MODE_NOTES ["✏️ 3. Ghi chú thủ công (Phím N) & Bút chì nhanh (Phím A)"]
        direction TB
        NOTE_MANUAL["Ghi chú thủ công (N): thêm/bớt ứng viên 1 - 9;<br/>chặn & nhấp nháy xanh 1.2s nếu trùng số hàng/cột/khối"]
        NOTE_AUTO["Bút chì nhanh (A): điền toàn bộ ứng viên hợp lệ (ON)<br/>hoặc dọn sạch ghi chú (OFF), phạt điểm 1 lần cuối ván"]
        NOTE_CLEAR["Tự động xóa ứng viên liên quan khi điền đúng<br/>(tùy chỉnh bật/tắt qua cài đặt autoClearNotes)"]
        NOTE_MANUAL --> NOTE_CLEAR
        NOTE_AUTO --> NOTE_CLEAR
    end
    class MODE_NOTES,NOTE_MANUAL,NOTE_AUTO,NOTE_CLEAR note;

    subgraph GUARD_RULES ["🛡️ 4. Quy tắc bảo vệ ô đúng & chống khai thác điểm"]
        direction TB
        RULE_ERASE["Xóa (Backspace): chỉ xóa số điền sai hoặc ghi chú nháp;<br/>bảo vệ tuyệt đối ô đề bài và ô đã giải đúng"]
        RULE_UNDO["Hoàn tác (Ctrl + Z): lùi nước đúng sẽ trừ lại điểm combo;<br/>lùi nước sai chỉ xóa số trên ô, giữ nguyên số lỗi đã mắc"]
    end
    class GUARD_RULES,RULE_ERASE,RULE_UNDO guard;

    MODE_NORMAL <-->|"Phím F"| MODE_FAST
    MODE_NORMAL <-->|"Phím N / A"| MODE_NOTES
    MODE_FAST <-->|"Kết hợp ghi chú nhanh"| MODE_NOTES
```

---

## 💔 3. Vòng đời 3 mạng lỗi sai & cơ chế Hồi sinh bù điểm

Mỗi ván đấu có giới hạn tối đa **3 lỗi sai** (`0/3` đến `3/3`). Khi chạm mốc `3/3`, bộ đếm giờ dừng lại, các phím tắt tạm dừng (`Space`, `Escape`) và thao tác nhấp ra ngoài nền tối đều bị khóa bảo vệ để người chơi đưa ra quyết định rõ ràng trên **Hộp thoại Hồi sinh**.

```mermaid
flowchart TD
    classDef safe fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#15803D;
    classDef warn fill:#FEF9C3,stroke:#CA8A04,stroke-width:2px,color:#854D0E;
    classDef alert fill:#FEE2E2,stroke:#DC2626,stroke-width:2px,color:#991B1B;
    classDef modal fill:#F3E8FF,stroke:#9333EA,stroke-width:2px,color:#6B21A8;
    classDef finish fill:#1E293B,stroke:#0F172A,stroke-width:2px,color:#F8FAFC;

    M0["🟢 Khởi đầu: 0/3 lỗi<br/>- Đủ điều kiện nhận thưởng Thắng hoàn hảo (+100 / +200 / +300đ)"]
    M1["🟡 Lỗi thứ 1: 1/3 lỗi<br/>- Trừ điểm trực tiếp: Dễ -5đ, TB -7đ, Khó -10đ (sàn 0)<br/>- Đặt lại chuỗi đúng (correctStreak = 0)"]
    M2["🟠 Lỗi thứ 2: 2/3 lỗi<br/>- Huy hiệu lỗi chuyển màu cam cảnh báo (.mistake-warning)<br/>- Trừ điểm lượt sai & đặt lại chuỗi đúng"]
    M3["🔴 Chạm ngưỡng: 3/3 lỗi<br/>- Tự động dừng đồng hồ (stopTimer) & bật isPaused = true<br/>- Khóa phím Space, Escape và nhấp nền tối"]

    MODAL_REVIVE["💔 Hộp thoại Hồi sinh (#modal-revive)<br/>- Điểm trận hiện có: score<br/>- Chi phí hồi sinh lần k: k × BaseCost (50 / 100 / 150đ)<br/>- Điểm còn lại sau bù: score - cost"]

    GAME_OVER["🏁 Kết thúc ván đấu (Thất bại)<br/>- Lưu thống kê trận đấu & xóa ván đang dở<br/>- Bảo toàn kết quả thắng trước đó nếu chơi lại Thử thách ngày"]

    M0 ==>|"Điền sai lần 1"| M1
    M1 ==>|"Điền sai lần 2"| M2
    M2 ==>|"Điền sai lần 3"| M3
    M3 ==>|"Kích hoạt hộp thoại"| MODAL_REVIVE

    MODAL_REVIVE ==>|"Chọn 'Bù điểm & chơi tiếp' (khi score >= cost):<br/>Trừ điểm trận, giảm lỗi về 2/3 & xóa ô sai thứ 3"| M2
    MODAL_REVIVE ==>|"Chọn 'Chấp nhận thua' HOẶC không đủ điểm bù"| GAME_OVER

    class M0 safe;
    class M1 warn;
    class M2 warn;
    class M3 alert;
    class MODAL_REVIVE modal;
    class GAME_OVER finish;
```

### 📋 Bảng phạt lỗi, chi phí Hồi sinh & chi phí Đổi thêm gợi ý

| Độ khó | Phạt mỗi lỗi sai | Hồi sinh lần $k$ (trừ điểm trận) | Đổi gợi ý thêm lần $k$ (trừ điểm Hồ sơ) | Trạng thái sau Hồi sinh |
|:---|:---:|:---:|:---:|:---|
| **Dễ (Easy)** | -5 điểm | $k \times 50$ điểm (50, 100, 150...) | $50 \times 2^{k-1}$ điểm (50, 100, 200...) | Lỗi giảm về **2/3**, xóa ô số vừa sai |
| **Trung bình (Medium)** | -7 điểm | $k \times 100$ điểm (100, 200, 300...) | $100 \times 2^{k-1}$ điểm (100, 200, 400...) | Lỗi giảm về **2/3**, xóa ô số vừa sai |
| **Khó (Hard)** | -10 điểm | $k \times 150$ điểm (150, 300, 450...) | $150 \times 2^{k-1}$ điểm (150, 300, 600...) | Lỗi giảm về **2/3**, xóa ô số vừa sai |
