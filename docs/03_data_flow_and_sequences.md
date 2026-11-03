# ⚡ Sơ Đồ 03: Luồng Dữ Liệu & Trình Tự Tương Tác (Data Flow & Sequences)

Tài liệu này mô hình hóa chi tiết các luồng dữ liệu tương tác theo thời gian thực (Sequence Diagrams) cho 3 tác vụ quan trọng nhất của trò chơi.

---

## 🔢 1. Trình Tự Điền Số & Kiểm Tra Kết Quả (Cell Placement Flow)

Quy trình tuần tự từ lúc người chơi chọn ô, bấm số trên bàn phím, kiểm tra tính đúng/sai, cộng điểm streak, phát âm thanh và lưu trạng thái:

```mermaid
sequenceDiagram
    autonumber
    actor Player as 👤 Người chơi
    participant UI as 🖥️ UI (UIBoard / UIControls)
    participant Game as ⚙️ Game (Game.js)
    participant Engine as 🧮 SudokuEngine
    participant Sound as 🔊 Sound.js
    participant Storage as 💾 Storage.js

    Player->>UI: Click vào một ô trống (Row r, Col c)
    UI->>Game: Game.selectCell(r, c)
    Game-->>UI: _notify() -> Cập nhật highlight hàng/cột/khối & cùng số

    Player->>UI: Bấm số n trên Numpad (ví dụ: số 4)
    UI->>Game: Game.placeNumber(n)
    
    rect rgb(240, 249, 255)
        Note over Game, Engine: Xác thực tính hợp lệ của số
        Game->>Game: Kiểm tra ô có phải ô đề bài (given) không?
        alt Ô là đề bài
            Game-->>UI: Bỏ qua (không cho phép sửa ô đề bài)
        else Ô trống hợp lệ
            Game->>Engine: So sánh n với solution[i]
            
            alt Điền ĐÚNG (val == solution[i])
                Game->>Game: correctStreak = prevStreak + 1
                Game->>Game: wrongStreak = 0 (khử chuỗi sai)
                Game->>Game: Tính điểm = Base * streakMultiplier
                Game->>Game: Tự động xóa ghi chú số n cùng hàng/cột/khối
                Game->>Game: Đẩy vào UndoStack (type: 'value', error: false)
                Game->>Sound: Sound.playCorrect(correctStreak)
                Game->>Storage: Storage.saveGame(state)
            else Điền SAI (val != solution[i])
                Game->>Game: mistakes = mistakes + 1
                Game->>Game: wrongStreak = wrongStreak + 1
                Game->>Game: correctStreak = 0 (mất chuỗi đúng)
                Game->>Game: Tính phạt trừ điểm (-10đ / -20đ / -30đ)
                Game->>Game: Đẩy vào UndoStack (type: 'value', error: true)
                Game->>Sound: Sound.playError()
                Game->>Game: Đánh giá Danger Stage (Cấp 1 / 2 / 3)
            end
        end
    end

    Game->>UI: _notify(state)
    UI->>UI: UIBoard.render() (Hiển thị số xanh/đỏ, font-weight 500)
    UI->>UI: UIControls.update() (Cập nhật điểm, timer, lỗi, banner)
```

---

## ⚡ 2. Vòng Lặp Chế Độ Tia Chớp (Lightning / Fast-Fill Mode Loop)

Quy trình người chơi kích hoạt chế độ Tia chớp, ghim 1 số và điền liên tục cho đến khi hoàn tất đủ 9 ô:

```mermaid
sequenceDiagram
    autonumber
    actor Player as 👤 Người chơi
    participant UI as 🖥️ UIControls / Numpad
    participant Game as ⚙️ Game.js
    participant Sound as 🔊 Sound.js

    Player->>UI: Bấm nút "Tia chớp"
    UI->>Game: Game.toggleFastFill()
    Game->>Game: state.fastFillMode = true
    Game-->>UI: Cập nhật Badge Tia Chớp = "ON"

    Player->>UI: Chọn số n (ví dụ: số 6)
    UI->>Game: Game.selectFastFillDigit(6)
    Game->>Game: state.fastFillDigit = 6
    Game-->>UI: Khóa phím số 6 (.locked-digit), làm mờ nhẹ các phím khác (.dimmed)

    loop Điền liên tục các ô trống
        Player->>UI: Click ô trống cờ
        UI->>Game: Game.selectCell(r, c) -> Tự động placeNumber(6)
        Game->>Game: getRemaining(6)
        
        alt Chưa đủ 9 ô (Remaining > 0)
            Game-->>UI: Tiếp tục giữ trạng thái khóa số 6
        else ĐÃ ĐỦ 9 Ô (Remaining == 0)
            Game->>Game: state.fastFillDigit = null (Tự động tạm thoát)
            Game->>Sound: Sound.playDigitComplete()
            Game-->>UI: Ẩn phím số 6 trên Numpad (visibility: hidden)<br/>Giữ nguyên vị trí 8 phím còn lại!
        end
    end
```

---

## 🧮 3. Thuật Toán Sinh Đề Duy Nhất Nghiệm (Sudoku Engine Pipeline)

Thuật toán sinh bàn cờ giải hoàn chỉnh và đục lỗ đảm bảo **duy nhất 1 nghiệm (Unique Solution)**:

```mermaid
flowchart TD
    classDef start fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0369A1;
    classDef process fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#92400E;
    classDef decision fill:#F3E8FF,stroke:#9333EA,stroke-width:2px,color:#6B21A8;
    classDef success fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#15803D;

    GEN_START["Bắt đầu sinh đề bài mới<br/>(Tham số: difficulty)"]
    
    GEN_FULL["1. Sinh bàn cờ giải hoàn chỉnh (Full Solution)<br/>- Khởi tạo mảng 81 ô = 0<br/>- Dùng Backtracking kết hợp xáo trộn mảng ngẫu nhiên 1..9"]
    
    GEN_TARGET["2. Xác định số ô cần đục theo độ khó:<br/>- Dễ: 36 - 40 ô gợi ý (đục ~41-45 ô)<br/>- Vừa: 30 - 34 ô gợi ý (đục ~47-51 ô)<br/>- Khó: 24 - 28 ô gợi ý (đục ~53-57 ô)"]

    GEN_DIG["3. Đục lỗ đối xứng (Symmetric Digging):<br/>- Chọn cặp ô đối xứng tâm (r, c) và (8-r, 8-c)<br/>- Tạm gỡ số ở 2 ô này"]

    GEN_TEST{"4. Kiểm tra tính duy nhất nghiệm<br/>(countSolutions <= 1?)"}

    GEN_REVERT["Hoàn lại số cũ<br/>(Vì nếu xóa sẽ xuất hiện đa nghiệm)"]
    GEN_KEEP["Chấp nhận đục lỗ<br/>(Nghiệm vẫn là duy nhất)"]

    GEN_CHECK{"Đã đạt đủ số ô đục mong muốn?"}

    GEN_DONE["Hoàn tất tạo đề:<br/>Trả về object { puzzle, solution, difficulty }"]

    GEN_START --> GEN_FULL --> GEN_TARGET --> GEN_DIG --> GEN_TEST
    GEN_TEST -->|"Có >= 2 nghiệm"| GEN_REVERT --> GEN_DIG
    GEN_TEST -->|"Chính xác 1 nghiệm"| GEN_KEEP --> GEN_CHECK
    GEN_CHECK -->|"Chưa đủ"| GEN_DIG
    GEN_CHECK -->|"Đã đạt ngưỡng"| GEN_DONE

    class GEN_START start;
    class GEN_FULL,GEN_TARGET,GEN_DIG,GEN_REVERT,GEN_KEEP process;
    class GEN_TEST,GEN_CHECK decision;
    class GEN_DONE success;
```

