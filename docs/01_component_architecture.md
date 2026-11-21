# 🏛️ Sơ đồ 01: Kiến trúc phân tầng module (Component Architecture)

Tài liệu này mô tả chi tiết kiến trúc 3 tầng (**3-Tier Architecture**) của game Sudoku, danh sách các module theo chuẩn **Module Pattern (IIFE)**, trách nhiệm và mối quan hệ phụ thuộc giữa chúng.

---

## 🏗️ 1. Sơ đồ phân tầng tổng thể

```mermaid
flowchart TD
    classDef presLayer fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0369A1;
    classDef logicLayer fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#92400E;
    classDef infraLayer fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#15803D;

    subgraph L1 ["🖥️ TẦNG TRÌNH DIỄN (Presentation Layer)"]
        direction TB
        subgraph L1_Screens ["Màn hình chính"]
            SCR_SPLASH["Splash Screen<br/>(Intro và Khám phá)"]
            SCR_LOBBY["Lobby Screen<br/>(Chọn độ khó, Biến thể, Tiếp tục)"]
            SCR_GAME["Game Play Screen<br/>(Bàn cờ, Thanh trạng thái, Bàn phím)"]
        end
        subgraph L1_UI ["Module Giao diện Bàn cờ và Điều khiển"]
            UI_BOARD["UIBoard<br/>- Render 81 ô cờ<br/>- Highlight hàng/cột/khối & ứng viên trùng<br/>- Cảnh báo xung đột ghi chú 2s"]
            UI_CTRL["UIControls<br/>- Bàn phím số 3x3<br/>- Giữ vị trí ô hoàn thành<br/>- Thanh trạng thái và bộ đếm lỗi 0/3<br/>- Banner gợi ý logic & 6 nút công cụ"]
        end
        subgraph L1_Modals ["Hộp thoại chức năng (Modals)"]
            MOD_TUT["Tutorial.js<br/>(Hướng dẫn luật chơi)"]
            MOD_PROF["Profile.js<br/>(Hồ sơ và Thành tích)"]
            MOD_VAR["Variants.js<br/>(Biến thể Sudoku)"]
            MOD_RES["Victory / Game Over / Pause<br/>(Kết quả và Tạm dừng)"]
        end
    end
    class L1,SCR_SPLASH,SCR_LOBBY,SCR_GAME,UI_BOARD,UI_CTRL,MOD_TUT,MOD_PROF,MOD_VAR,MOD_RES presLayer;

    subgraph L2 ["⚙️ TẦNG LOGIC VÀ TRẠNG THÁI (Business Logic và State Layer)"]
        direction TB
        APP_CORE["App.js (Router và Orchestrator)<br/>- Khởi tạo hệ thống<br/>- Quản lý chuyển đổi màn hình và modal<br/>- Lắng nghe sự kiện bàn phím toàn cục"]
        GAME_CORE["Game.js (State Machine và Rules)<br/>- Quản lý Game State (81 ô, nghiệm, ô đề)<br/>- Xác thực nước đi, Tia chớp, Bút chì nhanh<br/>- Hệ thống 3 mạng lỗi, Hồi sinh & Hoàn tác nghiêm ngặt<br/>- Gợi ý thông minh & Đổi gợi ý cấp số nhân"]
        ENGINE["SudokuEngine.js (Algorithms)<br/>- Thuật toán Backtracking giải Sudoku<br/>- Đảm bảo duy nhất 1 nghiệm<br/>- Gợi ý thông minh & Quét ứng viên hợp lệ"]
    end
    class L2,APP_CORE,GAME_CORE,ENGINE logicLayer;

    subgraph L3 ["💾 TẦNG DỊCH VỤ VÀ HẠ TẦNG (Infrastructure và Services)"]
        direction TB
        STORAGE["Storage.js<br/>- Lưu ván đấu dở dang & sao lưu/khôi phục file<br/>- Lưu thống kê hồ sơ cá nhân & Điểm vĩnh viễn<br/>- Lưu cấu hình cài đặt"]
        SOUND["Sound.js<br/>- Bộ tổng hợp âm Web Audio API<br/>- SFX: Tap, Correct Combo, Victory, Error, Erase, Hint"]
        I18N["I18n.js<br/>- Hỗ trợ đa ngôn ngữ (vi / en)<br/>- Cập nhật chuỗi giao diện tức thì"]
    end
    class L3,STORAGE,SOUND,I18N infraLayer;

    GAME_CORE ==>|"Lưu trạng thái và thành tích"| STORAGE
    GAME_CORE ==>|"Kích hoạt âm thanh theo tình huống"| SOUND
    APP_CORE ==>|"Áp dụng ngôn ngữ"| I18N
```

---

## 📋 2. Trách nhiệm chi tiết của từng module

| Module | File nguồn | Trách nhiệm chính | Public API tiêu biểu |
|:---|:---|:---|:---|
| **App** | `js/app.js` | Điều phối toàn cục, quản lý navigation màn hình (`splash`, `lobby`, `gameplay`), quản lý đóng/mở modal, thiết lập theme Sáng/Tối. | `init()`, `showToast(msg)`, `applyLanguage()` |
| **Game** | `js/game.js` | "Single Source of Truth": Quản lý toàn bộ dữ liệu ván đấu, xác nhận nước đi, ngăn điền thừa khi đủ 9 số, xử lý chế độ Tia chớp, tính điểm combo, giới hạn 3 mạng lỗi và cơ chế Hồi sinh bù điểm, đổi gợi ý bằng Điểm Hồ Sơ. | `start()`, `resume()`, `selectCell()`, `placeNumber()`, `toggleFastFill()`, `undo()`, `erase()`, `useHint()`, `buyExtraHint()`, `revive()` |
| **SudokuEngine** | `js/sudoku-engine.js` | Thuật toán sinh bàn cờ giải hoàn chỉnh bằng Backtracking ngẫu nhiên, thuật toán đục lỗ tạo đề bài đảm bảo duy nhất 1 nghiệm, kiểm tra tính hợp lệ của số. | `generate()`, `solve()`, `countSolutions()`, `isValid()` |
| **UIBoard** | `js/ui-board.js` | Khởi tạo DOM 81 ô cờ, render giá trị, ghi chú, áp dụng màu sắc công thái học (số đề in đậm 600 màu đen, số điền in thường 500 màu xanh, highlight hàng/cột/khối và cùng số). | `init()`, `render(state)`, `destroy()` |
| **UIControls** | `js/ui-controls.js` | Điều khiển bàn phím số 3x3 (giữ nguyên vị trí cố định của phím khi số đã hoàn thành), hiển thị đồng hồ bấm giờ, điểm số, badge chuỗi đúng, hiển thị lỗi 0/3. | `init()`, `update(state)` |
| **Storage** | `js/storage.js` | Quản trị lưu trữ `localStorage`, lưu ván chơi dở dang, sao lưu/khôi phục file JSON, quản lý điểm vĩnh viễn (Mastery Points), cài đặt người dùng. | `saveGame()`, `loadGame()`, `clearGame()`, `exportData()`, `importData()`, `getTotalPermanentScore()`, `deductPermanentScore()` |
| **Sound** | `js/sound.js` | Phát âm thanh sinh động trực tiếp từ Web Audio API (không cần tải file audio bên ngoài), âm thanh tap, combo nốt nhạc tăng dần, lỗi, xóa, gợi ý, nhạc thắng cuộc. | `playTap()`, `playCorrect(streak)`, `playError()`, `playErase()`, `playHint()`, `playWin()` |
| **I18n** | `js/i18n.js` | Từ điển đa ngôn ngữ (Tiếng Việt & English), tự động cập nhật toàn bộ nhãn giao diện khi người dùng chuyển đổi ngôn ngữ. | `t(key)`, `getLanguage()`, `setLanguage(lang)` |
