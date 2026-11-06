# 🔄 Sơ đồ 02: Vòng đời & máy trạng thái (Game State Lifecycle)

Tài liệu này mô hình hóa toàn bộ vòng đời chuyển trạng thái của người chơi, bao gồm:
1. **Luồng điều hướng màn hình (Screen Navigation Flow)**
2. **Máy trạng thái trong ván chơi (In-Game Modes & Interactions)**
3. **Cơ chế giới hạn 3 mạng lỗi sai & Hồi sinh bù điểm (3-Mistake Limit & Revive Lifecycle)**

---

## 🧭 1. Luồng điều hướng màn hình (Screen Navigation Flow)

```mermaid
flowchart TD
    classDef screen fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0369A1;
    classDef modal fill:#F3E8FF,stroke:#9333EA,stroke-width:2px,color:#6B21A8;
    classDef game fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#92400E;
    classDef endNode fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#15803D;

    START(("Khởi động web")) --> SCR_SPLASH["Màn hình Splash<br/>(Logo và Giới thiệu)"]
    
    SCR_SPLASH -->|Bấm 'Khám phá ngay'| SCR_LOBBY["Sảnh chính (Lobby)<br/>(Chọn độ khó, Biến thể, Tiếp tục)"]

    subgraph SUB_MODALS ["Hộp thoại chức năng (Modals)"]
        MOD_TUT["Modal Cách chơi"]
        MOD_PROF["Modal Hồ sơ"]
        MOD_VAR["Modal Biến thể"]
    end
    class SUB_MODALS,MOD_TUT,MOD_PROF,MOD_VAR modal;

    SCR_LOBBY <-->|Xem hướng dẫn| MOD_TUT
    SCR_LOBBY <-->|Xem thành tích| MOD_PROF
    SCR_LOBBY <-->|Xem biến thể| MOD_VAR

    SCR_LOBBY -->|Bấm 'Chơi mới' hoặc 'Tiếp tục'| IN_GAME["Màn hình ván chơi (In-Game)<br/>(Bàn cờ 9x9, Numpad, Công cụ)"]
    class IN_GAME game;

    subgraph SUB_INGAME_ACTIONS ["Tác vụ trong ván"]
        PAUSE_OVERLAY["Lớp Tạm dừng (Pause Overlay)"]
        MOD_ABANDON["Hộp thoại Bỏ cuộc"]
    end

    IN_GAME <-->|Bấm Tạm dừng / Tiếp tục| PAUSE_OVERLAY
    PAUSE_OVERLAY -->|Bấm Về sảnh| SCR_LOBBY
    IN_GAME <-->|Bấm Bỏ cuộc| MOD_ABANDON
    MOD_ABANDON -->|Xác nhận bỏ cuộc| SCR_LOBBY

    IN_GAME -->|Điền đúng 81 ô| MOD_VICTORY["Modal Chiến Thắng (Victory)"]
    IN_GAME -->|Vượt quá giới hạn lỗi| MOD_GAMEOVER["Modal Thất Bại (Game Over)"]
    class MOD_VICTORY,MOD_GAMEOVER endNode;

    MOD_VICTORY -->|Chơi ván mới| IN_GAME
    MOD_VICTORY -->|Về sảnh| SCR_LOBBY
    MOD_GAMEOVER -->|Thử lại| IN_GAME
    MOD_GAMEOVER -->|Về sảnh| SCR_LOBBY
```

---

## ⚡ 2. Máy trạng thái trong ván chơi (In-Game Modes)

Trong lúc chơi, người dùng có thể linh hoạt chuyển đổi qua lại giữa **Chế độ Thường (Normal Mode)**, **Chế độ Tia chớp (Fast-Fill Mode)** và **Chế độ Ghi chú (Notes Mode)**.

```mermaid
flowchart TD
    classDef normal fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0369A1;
    classDef fast fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#92400E;
    classDef note fill:#F3E8FF,stroke:#9333EA,stroke-width:2px,color:#6B21A8;

    subgraph MODE_NORMAL ["🎮 1. Chế độ Thường (Normal Input)"]
        direction TB
        NORM_SEL["Chọn ô trống (selectedCell)"]
        NORM_INP["Bấm số trên Numpad (1 - 9)"]
        NORM_CHK{"Kiểm tra số"}
        NORM_OK["Điền số vào ô và kiểm tra 81 ô"]
        
        NORM_SEL --> NORM_INP --> NORM_CHK
        NORM_CHK -->|"Đủ 9/9 số"| NORM_HIDE["Ẩn phím số đó trên Numpad<br/>(Giữ cố định vị trí các phím khác)"]
        NORM_CHK --> NORM_OK
    end
    class MODE_NORMAL,NORM_SEL,NORM_INP,NORM_CHK,NORM_OK,NORM_HIDE normal;

    subgraph MODE_FAST ["⚡ 2. Chế độ Tia Chớp (Fast-Fill Mode)"]
        direction TB
        FAST_TOGGLE["Bật nút Tia Chớp (ON)"]
        FAST_DIGIT["Chọn 1 số cố định (fastFillDigit)"]
        FAST_TAP["Click liên tục vào các ô trống"]
        FAST_CHK{"Đã điền đủ 9 ô?"}
        FAST_RESET["Tự động tạm thoát số đó,<br/>chờ người chơi chọn số tiếp theo"]

        FAST_TOGGLE --> FAST_DIGIT --> FAST_TAP --> FAST_CHK
        FAST_CHK -->|"Đủ 9 ô"| FAST_RESET
        FAST_CHK -->|"Chưa đủ"| FAST_TAP
        FAST_RESET --> FAST_DIGIT
    end
    class MODE_FAST,FAST_TOGGLE,FAST_DIGIT,FAST_TAP,FAST_CHK,FAST_RESET fast;

    subgraph MODE_NOTES ["✏️ 3. Chế độ Ghi Chú (Notes Mode)"]
        direction TB
        NOTE_TOGGLE["Bật nút Ghi Chú (ON)"]
        NOTE_INP["Bấm số 1 - 9 để thêm/bớt ghi chú mini"]
        NOTE_AUTO["Tự động xóa ghi chú liên quan<br/>(khi một ô cùng hàng/cột/khối được điền đúng)"]

        NOTE_TOGGLE --> NOTE_INP --> NOTE_AUTO
    end
    class MODE_NOTES,NOTE_TOGGLE,NOTE_INP,NOTE_AUTO note;

    %% Chuyển đổi hai chiều giữa các chế độ
    MODE_NORMAL <-->|"Bấm nút Tia chớp"| MODE_FAST
    MODE_NORMAL <-->|"Bấm nút Ghi chú"| MODE_NOTES
    MODE_FAST <-->|"Tắt Tia chớp hoặc Bật Ghi chú"| MODE_NOTES
```

---

## 💔 3. Cơ chế giới hạn 3 lỗi sai & hồi sinh bù điểm (3-Mistake Limit & Revive Lifecycle)

Trong Sudoku tiêu chuẩn, người chơi được cung cấp tối đa **3 cơ hội sai** (`0/3` $\rightarrow$ `3/3`). Mỗi lần phạm lỗi sẽ bị trừ điểm theo độ khó (Dễ: -5đ, Trung bình: -7đ, Khó: -10đ, điểm số không âm). Khi đạt ngưỡng `3/3`, trận đấu tự động tạm dừng và mở Hộp thoại Hồi sinh.

```mermaid
flowchart TD
    classDef safe fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#15803D;
    classDef warn fill:#FEF9C3,stroke:#CA8A04,stroke-width:2px,color:#854D0E;
    classDef alert fill:#FEE2E2,stroke:#DC2626,stroke-width:2px,color:#991B1B;
    classDef modal fill:#F3E8FF,stroke:#9333EA,stroke-width:2px,color:#6B21A8;
    classDef finish fill:#1E293B,stroke:#0F172A,stroke-width:2px,color:#F8FAFC;

    M0["🟢 KHỞI ĐẦU: 0/3 LỖI<br/>- Trạng thái hoàn hảo<br/>- Chưa bị trừ điểm lỗi"]
    M1["🟡 LỖI THỨ 1: 1/3 LỖI<br/>- Phạt điểm: Dễ -5đ, Vừa -7đ, Khó -10đ<br/>- Reset chuỗi đúng (correctStreak = 0)"]
    M2["🟠 LỖI THỨ 2: 2/3 LỖI<br/>- Cảnh báo cận kề (warning badge)<br/>- Tiếp tục trừ điểm lượt sai"]
    M3["🔴 ĐẠT NGƯỠNG: 3/3 LỖI<br/>- Tự động dừng tính giờ (stopTimer)<br/>- Trạng thái ván chuyển sang isPaused"]

    MODAL_REVIVE["💔 HỘP THOẠI HỒI SINH (Revive Modal)<br/>- Hiển thị điểm trận đấu hiện có<br/>- Chi phí bù điểm: k × BaseCost (50 / 100 / 150)<br/>- Hiển thị điểm trận đấu còn lại"]

    GAME_OVER["💀 GAME OVER (Xử Thua)<br/>- Không đủ điểm bù HOẶC chọn 'Chấp Nhận Thua'<br/>- Lưu kết quả thất bại & Xóa ván dở dang"]

    M0 ==>|"Điền sai lần 1"| M1
    M1 ==>|"Điền sai lần 2"| M2
    M2 ==>|"Điền sai lần 3"| M3
    M3 ==>|"Mở modal"| MODAL_REVIVE

    MODAL_REVIVE ==>|"Chọn 'Bù Điểm & Chơi Tiếp'<br/>(Nếu đủ điểm trận: score >= cost)"| M2
    MODAL_REVIVE ==>|"Chọn 'Chấp Nhận Thua'<br/>HOẶC không đủ điểm bù"| GAME_OVER

    M1 -. "Hoàn tác (Undo)" .-> M0
    M2 -. "Hoàn tác (Undo)" .-> M1

    class M0 safe;
    class M1 warn;
    class M2 warn;
    class M3 alert;
    class MODAL_REVIVE modal;
    class GAME_OVER finish;
```

### 📋 Bảng phạt lỗi & chi phí hồi sinh từng độ khó:

| Độ khó | Điểm trừ mỗi lỗi sai | Chi phí Hồi sinh lần 1 ($1\times$) | Chi phí Hồi sinh lần 2 ($2\times$) | Chi phí Hồi sinh lần $k$ ($k\times$) | Trạng thái sau Hồi sinh |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Dễ (Easy)** | -5 điểm | 50 điểm | 100 điểm | $k \times 50$ điểm | Lỗi giảm về **2/3**, xóa ô số vừa điền sai |
| **Trung bình (Medium)** | -7 điểm | 100 điểm | 200 điểm | $k \times 100$ điểm | Lỗi giảm về **2/3**, xóa ô số vừa điền sai |
| **Khó (Hard)** | -10 điểm | 150 điểm | 300 điểm | $k \times 150$ điểm | Lỗi giảm về **2/3**, xóa ô số vừa điền sai |
