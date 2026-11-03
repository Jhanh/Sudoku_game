# 🔄 Sơ Đồ 02: Vòng Đời & Máy Trạng Thái (Game State Lifecycle)

Tài liệu này mô hình hóa toàn bộ vòng đời chuyển trạng thái của người chơi, bao gồm:
1. **Luồng điều hướng màn hình (Screen Navigation Flow)**
2. **Máy trạng thái trong ván chơi (In-Game Modes & Interactions)**
3. **Cơ chế leo thang cảnh báo lỗi 3 cấp (Danger & Mistake Escalation Lifecycle)**

---

## 🧭 1. Luồng Điều Hướng Màn Hình (Screen Navigation Flow)

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

## ⚡ 2. Máy Trạng Thái Trong Ván Chơi (In-Game Modes)

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

## 🚨 3. Cơ Chế Leo Thang Cảnh Báo Lỗi 3 Cấp (Danger Escalation)

Hệ thống tính toán nguy hiểm dựa trên hai tiêu chí: **Tổng số lỗi lũy kế** (`mistakes`) và **Chuỗi sai liên tiếp** (`wrongStreak`).

```mermaid
flowchart LR
    classDef safe fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#15803D;
    classDef stage1 fill:#FEF9C3,stroke:#CA8A04,stroke-width:2px,color:#854D0E;
    classDef stage2 fill:#FFEDD5,stroke:#EA580C,stroke-width:2px,color:#9A3412;
    classDef stage3 fill:#FEE2E2,stroke:#DC2626,stroke-width:2px,color:#991B1B;
    classDef finish fill:#1E293B,stroke:#0F172A,stroke-width:2px,color:#F8FAFC;

    ST_SAFE["🟢 CẤP 0: AN TOÀN<br/>- Không có lỗi vi phạm<br/>- Giao diện bình thường<br/>- Không trừ điểm bổ sung"]
    
    ST_MILD["🟡 CẤP 1: NHẮC NHỞ<br/>- Bắt đầu có lỗi (1-4 lỗi)<br/>- Chớp viền nhẹ màn hình<br/>- Thông báo trừ điểm cơ bản"]
    
    ST_WARN["🟠 CẤP 2: NGUY HIỂM NHẸ<br/>- Sai 5-9 lỗi HOẶC chuỗi sai 2 lượt<br/>- Banner cảnh báo màu cam<br/>- Nhịp tim cảnh báo phát ra"]
    
    ST_CRIT["🔴 CẤP 3: NGUY HIỂM CẤP BÁO<br/>- Đạt ngưỡng sát giới hạn thua<br/>(Dễ/Vừa: 10-15 lỗi, Khó: 10 lỗi)<br/>- Chuỗi sai sát nút (2/3 hoặc 4/5)<br/>- Màn hình thở đỏ rực và còi báo động"]

    ST_DEAD["💀 GAME OVER<br/>- Vượt quá tổng lỗi cho phép<br/>HOẶC vượt chuỗi sai tối đa<br/>- Dừng tính giờ và lưu thất bại"]

    ST_SAFE ==>|"Phạm lỗi đầu tiên"| ST_MILD
    ST_MILD ==>|"Tiếp tục sai"| ST_WARN
    ST_WARN ==>|"Tiếp tục sai hoặc chuỗi sai dài"| ST_CRIT
    ST_CRIT ==>|"Sai thêm 1 lần nữa"| ST_DEAD

    ST_WARN -. "Điền đúng 1 số (Khử chuỗi sai về 0)" .-> ST_MILD
    ST_CRIT -. "Điền đúng 1 số (Khử chuỗi sai về 0)" .-> ST_WARN
    ST_MILD -. "Undo lượt sai" .-> ST_SAFE

    class ST_SAFE safe;
    class ST_MILD stage1;
    class ST_WARN stage2;
    class ST_CRIT stage3;
    class ST_DEAD finish;
```
