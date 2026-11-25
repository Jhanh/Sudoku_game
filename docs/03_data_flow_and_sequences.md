# ⚡ Sơ đồ 03: Luồng dữ liệu & trình tự tương tác (Data flow & sequences)

Tài liệu này mô hình hóa trình tự tương tác thời gian thực (**Sequence Diagrams**) và đường ống thuật toán cho các nghiệp vụ cốt lõi của trò chơi.

---

## 🔢 1. Trình tự điền số, xóa an toàn & kiểm tra kết quả

Quy trình tuần tự khi người chơi chọn ô, điền chữ số, tự động dọn ghi chú theo cài đặt `autoClearNotes`, xử lý lỗi sai hoặc bảo vệ ô đã giải đúng khi bấm `Xóa`:

```mermaid
sequenceDiagram
    autonumber
    actor Player as 👤 Người chơi
    participant UI as 🖥️ UI (UIBoard / UIControls)
    participant Game as ⚙️ Game.js
    participant Storage as 💾 Storage.js
    participant Sound as 🔊 Sound.js

    Player->>UI: Nhấp chọn ô (hàng r, cột c)
    UI->>Game: Game.selectCell(r, c)
    Game-->>UI: onUpdate(state) -> Tô sáng hàng, cột, khối, cùng số & ứng viên

    Player->>UI: Bấm chữ số n (1 - 9)
    UI->>Game: Game.placeNumber(n)

    alt Ô đề bài (given) hoặc đã giải đúng (current[i] == solution[i])
        Game-->>UI: Giữ nguyên giá trị an toàn, không ghi đè
    else Ô trống hoặc đang chứa số sai
        alt Điền đúng (n == solution[i])
            Game->>Game: Tăng correctStreak, cộng Base * streakMultiplier
            Game->>Storage: Đọc getSettings().autoClearNotes
            opt autoClearNotes !== false
                Game->>Game: removeRelatedNotes(r, c, n) trong hàng, cột & khối 3x3
            end
            Game->>Game: pushUndo({ type: 'value', error: false, pointsEarned })
            Game->>Sound: playCorrect(streak) hoặc playDigitComplete()
            Game->>Storage: saveGame(serializeState())
        else Điền sai (n != solution[i])
            Game->>Game: Tăng mistakes (+1), đặt correctStreak = 0
            Game->>Game: Trừ điểm phạt (-5 / -7 / -10đ, sàn 0)
            Game->>Game: pushUndo({ type: 'value', error: true })
            Game->>Sound: playError()
            Game->>Storage: saveGame(serializeState())
            opt mistakes >= 3
                Game->>Game: stopTimer() & isPaused = true
                Game-->>UI: onThreeMistakes(state) -> Mở hộp thoại Hồi sinh
            end
        end
        Game-->>UI: onUpdate(state) -> Cập nhật bàn cờ sứ & thanh thông số
    end

    opt Người chơi bấm nút Xóa / phím Backspace
        Player->>UI: Yêu cầu xóa ô đang chọn
        UI->>Game: Game.erase()
        alt Ô đề bài HOẶC ô đã điền đúng (current[i] == solution[i])
            Game-->>UI: Trả về false (bảo vệ ô đúng, chống mất điểm hoặc cày lại combo)
        else Ô đang chứa số sai HOẶC ghi chú nháp
            Game->>Game: Xóa số sai / xóa mảng ghi chú & đẩy vào undoStack
            Game->>Sound: playErase()
            Game-->>UI: onUpdate(state)
        end
    end
```

---

## ⚡ 2. Vòng lặp chế độ Tia chớp (Lightning / Fast-Fill mode)

Quy trình người chơi bật chế độ Tia chớp (`F`), khóa một chữ số và nhấp liên tục lên các ô trống cho tới khi hoàn tất trọn vẹn 9 ô của chữ số đó:

```mermaid
sequenceDiagram
    autonumber
    actor Player as 👤 Người chơi
    participant UI as 🖥️ UIControls / UIBoard
    participant Game as ⚙️ Game.js
    participant Sound as 🔊 Sound.js

    Player->>UI: Bấm nút "Tia chớp" hoặc phím F
    UI->>Game: Game.toggleFastFill()
    Game->>Game: state.fastFillMode = true
    Game-->>UI: Bật huy hiệu Tia chớp = "ON"

    Player->>UI: Chọn chữ số n trên Numpad (hoặc nhấp ô đã có số n trên bàn cờ)
    UI->>Game: Game.selectFastFillDigit(n) / selectCell(r, c)
    Game->>Game: state.fastFillDigit = n
    Game-->>UI: Viền sáng phím số n (.locked-digit), làm dịu nhẹ các phím khác (.dimmed),<br/>tô sáng toàn bộ ứng viên ghi chú số n trên bàn cờ (.note-highlighted)

    loop Điền liên tiếp các ô trống
        Player->>UI: Nhấp vào một ô trống (r, c)
        UI->>Game: Game.selectCell(r, c) -> tự động gọi _placeValue / _placeNote
        Game->>Game: Kiểm tra số lượng còn lại getRemaining(n)

        alt Còn ô chưa điền (Remaining > 0)
            Game-->>UI: Duy trì khóa số n để nhấp ô tiếp theo ngay lập tức
        else Đã hoàn thành đủ 9/9 ô (Remaining == 0)
            Game->>Game: Đặt fastFillDigit = null & selectedCell = null
            Game->>Sound: Sound.playDigitComplete()
            Game-->>UI: Ẩn phím số n (visibility: hidden; opacity: 0)<br/>nhưng giữ nguyên ô lưới vật lý cho 8 phím còn lại
        end
    end
```

---

## 🧮 3. Đường ống sinh đề duy nhất nghiệm & Thử thách ngày (SudokuEngine pipeline)

Module `SudokuEngine` hỗ trợ đồng thời hai luồng khởi tạo câu đố: **ngẫu nhiên thời gian thực** cho ván cổ điển (`generate`) và **tất định theo hạt giống ngày** bằng bộ sinh số giả ngẫu nhiên **Mulberry32 PRNG** cho sảnh Thử thách ngày (`generateFromSeed`):

```mermaid
flowchart TD
    classDef start fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0369A1;
    classDef process fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#92400E;
    classDef decision fill:#F3E8FF,stroke:#9333EA,stroke-width:2px,color:#6B21A8;
    classDef success fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#15803D;

    START_CLASSIC["Ván chơi cổ điển<br/>generate(difficulty)"]
    START_DAILY["Thử thách hàng ngày<br/>generateFromSeed(dateStr)<br/>- Băm chuỗi YYYY-MM-DD -> độ khó (30% Dễ, 50% TB, 20% Khó)<br/>- Khởi tạo bộ sinh số Mulberry32 PRNG cố định"]
    class START_CLASSIC,START_DAILY start;

    GEN_FULL["1. Sinh bàn cờ nghiệm chuẩn 81 ô (Full Solution)<br/>- Đệ quy quay lui (Backtracking) kết hợp xáo trộn dãy 1..9"]

    GEN_TARGET["2. Xác định ngưỡng ô đề cho trước:<br/>- Dễ: 38 - 45 ô cho trước<br/>- Trung bình: 30 - 35 ô cho trước<br/>- Khó: 24 - 28 ô cho trước"]

    GEN_DIG["3. Đục lỗ từng vị trí theo thứ tự xáo trộn:<br/>- Tạm đặt puzzle[pos] = 0<br/>- Kiểm tra countSolutions(puzzle, 2) bằng bitmask Uint16Array"]

    GEN_UNIQUE{"Đảm bảo duy nhất 1 nghiệm?"}
    GEN_REVERT["Khôi phục số vừa gỡ<br/>(tránh phát sinh đa nghiệm)"]
    GEN_GRADE["4. Chấm độ khó bằng bộ giải tư duy con người solveLogical(puzzle):<br/>- Cấp 1 (Dễ): giải trọn 100% bằng Naked & Hidden Singles<br/>- Cấp 2 (TB): cần Pointing Pairs / Box-Line hoặc Naked Pairs<br/>- Cấp 3 (Khó): đòi hỏi phân tích tập con nâng cao"]

    GEN_MATCH{"Đạt chuẩn độ khó mục tiêu?"}
    GEN_DONE["Hoàn tất dưới 50ms:<br/>Trả về { puzzle, solution, difficulty }"]

    START_CLASSIC --> GEN_FULL
    START_DAILY --> GEN_FULL
    GEN_FULL --> GEN_TARGET --> GEN_DIG --> GEN_UNIQUE
    GEN_UNIQUE -->|"Từ 2 nghiệm trở lên"| GEN_REVERT --> GEN_DIG
    GEN_UNIQUE -->|"Đúng 1 nghiệm duy nhất"| GEN_GRADE --> GEN_MATCH
    GEN_MATCH -->|"Chưa khớp (thử lại tối đa 30 vòng)"| GEN_FULL
    GEN_MATCH -->|"Khớp tiêu chuẩn"| GEN_DONE

    class GEN_FULL,GEN_TARGET,GEN_DIG,GEN_REVERT,GEN_GRADE process;
    class GEN_UNIQUE,GEN_MATCH decision;
    class GEN_DONE success;
```
