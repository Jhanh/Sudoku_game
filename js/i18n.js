/* =========================================================
   i18n.js - Bilingual Internationalization Engine (VI & EN)
   Pure Vanilla JS, Zero Dependencies, Real-time Reactive
   ========================================================= */
const I18n = (() => {

  const translations = {
    vi: {
      // General & Common
      app_title: 'Sudoku - Rèn luyện tư duy',
      brand_name: 'Sudoku Web',
      btn_cancel: 'Hủy',
      btn_confirm: 'Xác nhận',
      btn_close: 'Đóng',
      btn_save: 'Lưu',
      btn_back: 'Quay lại',
      btn_next: 'Tiếp theo',
      btn_resume: 'Tiếp tục',
      btn_new_game: 'Ván chơi mới',
      btn_give_up: 'Bỏ cuộc',
      confirm_title: 'Xác nhận',
      confirm_default_msg: 'Bạn có chắc chắn muốn thực hiện?',

      // Splash Screen
      splash_title_welcome: 'Chào mừng bạn đến với<br>thế giới <span class="gradient-text">Sudoku</span>',
      splash_subtitle: 'Rèn luyện tư duy & sự tập trung mỗi ngày',
      splash_btn_explore: 'Khám phá ngay',

      // Lobby / Home
      home_title: 'Sudoku cổ điển',
      home_desc: 'Trò chơi trí tuệ kinh điển - điền số, rèn logic, chinh phục mọi thử thách',
      home_btn_how_to_play: 'Cách chơi',
      home_btn_start: 'Bắt đầu thử thách',
      home_btn_continue: 'Tiếp tục ván đang chơi',
      home_btn_abandon: 'Bỏ cuộc / hủy ván',
      home_abandon_confirm_title: 'Bỏ cuộc',
      home_abandon_confirm_msg: 'Ván đang chơi sẽ bị xóa. Bạn có chắc chắn muốn bỏ cuộc?',

      // Navigation Dock
      nav_home: 'Trang chủ',
      nav_variants: 'Biến thể',
      nav_profile: 'Hồ sơ',

      // Variants Tab
      variants_title: 'Khám phá biến thể',
      variants_desc: 'Các phiên bản nâng cao dành cho những kỳ thủ đam mê thử thách',
      variants_badge_coming_soon: 'Sắp ra mắt',
      variant_killer_name: 'Killer Sudoku',
      variant_killer_desc: 'Lồng nét đứt với tổng ở góc. Kết hợp Sudoku và phép cộng!',
      variant_diagonal_name: 'Sudoku đường chéo',
      variant_diagonal_desc: 'Hai đường chéo chính cũng phải chứa 1-9 không trùng lặp.',
      variant_samurai_name: 'Samurai Sudoku',
      variant_samurai_desc: '5 bảng Sudoku chồng lên nhau tạo hình chữ thập khổng lồ.',
      variant_jigsaw_name: 'Jigsaw Sudoku',
      variant_jigsaw_desc: 'Các vùng có hình dạng bất quy tắc thay vì khối 3×3 tiêu chuẩn.',

      // Profile Tab
      profile_default_name: 'Kỳ thủ Sudoku',
      profile_btn_edit_name: 'Đổi tên',
      profile_btn_settings: 'Cài đặt',
      profile_name_placeholder: 'Nhập tên mới…',
      profile_total_time: 'Tổng thời gian: ',
      profile_rank_title: 'Cấp bậc danh hiệu',
      profile_rank_1: 'Nhập môn',
      profile_rank_2: 'Tập sự',
      profile_rank_3: 'Sơ cấp',
      profile_rank_4: 'Thấu suốt',
      profile_rank_5: 'Tinh anh',
      profile_rank_6: 'Chuyên gia',
      profile_rank_7: 'Bậc thầy',
      profile_rank_8: 'Kiện tướng',
      profile_rank_9: 'Huyền thoại Sudoku',
      profile_rank_apprentice: 'Tập sự',
      profile_rank_skilled: 'Thạo việc',
      profile_rank_expert: 'Cao thủ',
      profile_rank_grandmaster: 'Đại kiện tướng',
      profile_rank_pts: 'điểm',
      profile_rank_wins: '{count} trận thắng',
      profile_rank_target: 'Mục tiêu: {target}',
      profile_rank_max: 'Đỉnh cao danh vọng • Đạt cấp tối đa',
      stat_win_rate: 'Tỉ lệ thắng',
      stat_games_won: 'Số trận đã thắng',
      stat_games_played: 'Số trận đã chơi',
      stat_best_score: 'Điểm cao nhất',
      stat_perfect_wins: 'Thắng hoàn hảo',
      stat_current_streak: 'Chuỗi thắng hiện tại',
      stat_best_streak: 'Chuỗi thắng tốt nhất',
      stat_best_time: 'Thời gian nhanh nhất',
      stat_avg_time: 'Thời gian trung bình',

      // Difficulties
      diff_easy: 'Dễ',
      diff_medium: 'Trung bình',
      diff_hard: 'Khó',
      diff_modal_title: 'Chọn độ khó',
      diff_easy_clues: '38 - 45 ô cho trước',
      diff_easy_sub: 'Phù hợp người mới bắt đầu',
      diff_medium_clues: '30 - 35 ô cho trước',
      diff_medium_sub: 'Thử thách vừa phải',
      diff_hard_clues: '24 - 28 ô cho trước',
      diff_hard_sub: 'Độ khó cao, ít ô cho trước',

      // Gameplay Screen
      game_label_difficulty: 'Độ khó',
      game_label_score: 'Điểm',
      game_label_mistakes: 'Lỗi',
      game_label_time: 'Thời gian',
      game_label_give_up: 'Bỏ cuộc',
      game_paused_title: 'Tạm dừng',
      game_paused_instruction: 'Nhấn Space để tiếp tục',
      btn_pause_tooltip: 'Tạm dừng [Space]',
      btn_resume_tooltip: 'Tiếp tục [Space]',
      game_streak_warning: 'Cảnh báo chuỗi sai',
      tool_undo: 'Hoàn tác',
      tool_undo_title: 'Hoàn tác (Ctrl+Z)',
      tool_erase: 'Xóa',
      tool_erase_title: 'Xóa (Backspace)',
      tool_fast_fill: 'Tia chớp',
      tool_fast_fill_title: 'Chế độ Tia chớp (F)',
      tool_auto_notes: 'Bút chì nhanh',
      tool_auto_notes_title: 'Bút chì nhanh (A)',
      tool_notes: 'Ghi chú',
      tool_notes_title: 'Ghi chú (N)',
      tool_hint: 'Gợi ý',
      tool_hint_title: 'Gợi ý thông minh (H)',
      in_game_new_game_confirm_title: 'Ván chơi mới',
      in_game_new_game_confirm_msg: 'Bạn có muốn bắt đầu ván mới không? (Ván hiện tại sẽ bị hủy)',
      in_game_give_up_confirm_title: 'Bỏ cuộc',
      in_game_give_up_confirm_msg: 'Ván này sẽ được tính là thua. Bạn có chắc chắn?',

      // Game Over / Victory Modal
      gameover_win_title: 'Chiến thắng!',
      gameover_win_subtitle: 'Bạn đã hoàn thành bảng Sudoku!',
      gameover_giveup_title: 'Đã bỏ cuộc',
      gameover_giveup_subtitle: 'Bảng tổng kết điểm ván đấu:',
      gameover_streak_title: 'Hết lượt sai liên tiếp!',
      gameover_streak_subtitle: 'Ván đấu kết thúc do mắc {maxStreak} lỗi sai liên tiếp.',
      gameover_lose_title: 'Thất bại!',
      gameover_lose_subtitle: 'Đã vượt quá giới hạn 3 lỗi sai cho phép.',
      breakdown_base_score: 'Điểm cơ bản',
      breakdown_combo_bonus: 'Thưởng combo',
      breakdown_perfect_bonus: 'Thắng hoàn hảo',
      breakdown_time_multiplier: 'Hệ số thời gian',
      breakdown_hint_penalty: 'Trừ điểm gợi ý',
      breakdown_wrong_penalty: 'Trừ điểm chuỗi sai',
      breakdown_auto_notes_penalty: 'Trừ điểm bút chì nhanh',
      breakdown_final_score: 'Tổng điểm đạt được',
      breakdown_time: 'Thời gian hoàn thành',
      breakdown_mistakes: 'Số lỗi vi phạm',
      btn_play_again: 'Ván mới',
      btn_back_lobby: 'Về sảnh chính',

      // Revive Modal (3 Mistakes)
      revive_title: 'Bạn đã mắc 3 lỗi!',
      revive_desc: 'Dùng điểm trận đấu để giảm lỗi về 2/3 và chơi tiếp.',
      revive_current_score: 'Điểm trận hiện có:',
      revive_cost: 'Chi phí tiếp tục:',
      revive_remaining_score: 'Điểm còn lại:',
      revive_note: 'Sau khi bù điểm, lỗi sai giảm về 2/3 (thêm 1 cơ hội).',
      revive_btn_continue: 'Bù điểm & chơi tiếp',
      revive_btn_giveup: 'Chấp nhận thua',
      revive_insufficient: 'Không đủ điểm trận đấu để tiếp tục.',

      // Buy Hint Modal (Mastery Points)
      buy_hint_title: 'Đổi thêm gợi ý',
      buy_hint_desc: 'Dùng Điểm Hồ Sơ vĩnh viễn để mở thêm 1 ô gợi ý.',
      buy_hint_current_points: 'Điểm Hồ Sơ hiện có:',
      buy_hint_cost: 'Chi phí đổi:',
      buy_hint_remaining_points: 'Điểm còn lại:',
      buy_hint_btn_confirm: 'Đổi gợi ý',
      buy_hint_btn_cancel: 'Hủy',
      buy_hint_insufficient: 'Không đủ điểm Hồ Sơ để đổi thêm gợi ý.',

      // Tutorial Modal (3 Trang Tĩnh Trực Quan)
      tut_title: 'Cách chơi Sudoku',
      tut_step1_title: '1. Quy tắc cơ bản (Hàng, Cột & Khối 3×3)',
      tut_step1_desc: 'Mỗi <strong>hàng ngang</strong>, <strong>cột dọc</strong> và mỗi <strong>khối 3×3</strong> đều phải chứa đủ các chữ số từ 1 đến 9 mà <strong>không được trùng lặp</strong>.',
      tut_step2_title: '2. Chế độ Tia chớp (Lightning / Fast-Fill)',
      tut_step2_desc: 'Phím tắt <code>F</code>. Chọn 1 chữ số trên bàn phím số để khóa số đó, sau đó nhấp chuột liên tục vào các ô trống trên bàn cờ để điền nhanh mà không cần chọn lại số nhiều lần. Khi đã điền đủ 9 số, phím số sẽ tự động ẩn đi để bạn thuận tiện chọn số tiếp theo.',
      tut_step3_title: '3. Bút chì nhanh (Auto Notes)',
      tut_step3_desc: 'Phím tắt <code>A</code>. Tự động tính toán và điền tất cả các con số khả dĩ (ứng viên) vào từng ô trống trên bàn cờ, giúp bạn nhanh chóng phát hiện các ô chỉ còn 1 khả năng duy nhất để suy luận dễ dàng hơn. Bạn có thể bấm lại nút này để tắt và xóa sạch ghi chú bất kỳ lúc nào.',
      tut_btn_start_play: 'Bắt đầu chơi!',

      // Settings Modal
      settings_title: 'Cài đặt hệ thống',
      settings_grp_appearance: 'Giao diện & ngôn ngữ',
      settings_lang_title: 'Ngôn ngữ',
      settings_lang_desc: 'Chọn ngôn ngữ hiển thị',
      settings_theme_title: 'Chế độ giao diện',
      settings_theme_desc: 'Chuyển đổi giao diện Sáng / Tối',
      settings_theme_light: 'Sáng',
      settings_theme_dark: 'Tối',
      settings_grp_audio: 'Âm thanh & hiệu ứng',
      settings_sound_title: 'Hiệu ứng âm thanh',
      settings_sound_desc: 'Bật hoặc tắt âm thanh trò chơi',
      settings_grp_gameplay: 'Hỗ trợ giải đố',
      settings_autoclear_title: 'Tự động xóa ghi chú',
      settings_autoclear_desc: 'Tự động xóa số ghi chú ở hàng, cột và khối khi điền đúng',
      settings_same_num_title: 'Làm nổi bật số giống nhau',
      settings_same_num_desc: 'Làm nổi bật các ô có cùng chữ số',
      settings_mistakes_title: 'Cảnh báo lỗi ngay lập tức',
      settings_mistakes_desc: 'Báo đỏ khi điền số sai',
      settings_fastfill_title: 'Tự động bật chế độ Tia chớp',
      settings_fastfill_desc: 'Luôn bật Tia chớp khi bắt đầu ván mới',
      settings_grp_data: 'Sao lưu & khôi phục dữ liệu',
      settings_export_title: 'Xuất dữ liệu trò chơi',
      settings_export_desc: 'Tải tệp sao lưu dữ liệu (.json) về máy',
      settings_export_btn: 'Xuất dữ liệu',
      settings_import_title: 'Nhập dữ liệu trò chơi',
      settings_import_desc: 'Khôi phục dữ liệu từ tệp sao lưu (.json)',
      settings_import_btn: 'Nhập tệp',
      settings_import_confirm_title: 'Khôi phục dữ liệu',
      settings_import_confirm_msg: 'Nhập dữ liệu từ tệp này sẽ ghi đè toàn bộ tiến trình, lịch sử đấu và cài đặt hiện tại trên máy. Bạn có chắc chắn muốn tiếp tục?',
      settings_grp_danger: 'Vùng nguy hiểm & dữ liệu',
      settings_reset_title: 'Đặt lại toàn bộ dữ liệu',
      settings_reset_desc: 'Xóa toàn bộ tiến trình, thống kê và đưa game về mặc định',
      settings_reset_btn: 'Xóa dữ liệu',
      settings_reset_confirm_title: 'Xóa dữ liệu',
      settings_reset_confirm_msg: 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử đấu, thời gian chơi và đưa game về trạng thái ban đầu?',

      // Toast Notifications & Sound Prompts
      toast_sound_on: 'Đã bật âm thanh',
      toast_sound_off: 'Đã tắt âm thanh',
      toast_name_saved: 'Đổi tên thành công!',
      toast_data_reset: 'Đã xóa toàn bộ dữ liệu thành công!',
      toast_export_success: 'Đã xuất dữ liệu sao lưu thành công!',
      toast_export_failed: 'Có lỗi khi tạo tệp sao lưu!',
      toast_import_success: 'Đã khôi phục dữ liệu thành công!',
      toast_import_invalid: 'Tệp dữ liệu không hợp lệ hoặc bị lỗi định dạng!',
      toast_import_failed: 'Lỗi khi đọc tệp sao lưu!',
      toast_settings_saved: 'Đã lưu cài đặt',
      toast_no_hints: 'Không còn gợi ý nào!',
      toast_hint_used: 'Đã tự động điền 1 số gợi ý',
      toast_undo_penalty: 'Hoàn tác sẽ trừ điểm combo hiện tại!',
      sound_mute: 'Tắt âm thanh',
      sound_unmute: 'Bật âm thanh',

      // Mobile Notice
      mobile_notice_badge: '🖥️ Tối ưu hóa 100% cho PC',
      mobile_notice_title: 'Trải nghiệm tốt nhất trên máy tính',
      mobile_notice_desc: 'Trò chơi được tối ưu hóa cho màn hình máy tính (PC / Laptop) với thao tác chuột và bàn phím.',
      mobile_notice_note: 'Giao diện chưa hỗ trợ tốt trên điện thoại. Vui lòng mở game trên máy tính để có trải nghiệm tốt nhất.',
      mobile_notice_spec: 'Độ phân giải khuyến nghị: 1280 × 720 trở lên',
      mobile_notice_dismiss: 'Tôi hiểu rồi, vẫn tiếp tục xem'
    },

    en: {
      // General & Common
      app_title: 'Sudoku - Brain Training & Logic',
      brand_name: 'Sudoku Web',
      btn_cancel: 'Cancel',
      btn_confirm: 'Confirm',
      btn_close: 'Close',
      btn_save: 'Save',
      btn_back: 'Back',
      btn_next: 'Next',
      btn_resume: 'Resume',
      btn_new_game: 'New Game',
      btn_give_up: 'Give Up',
      confirm_title: 'Confirm',
      confirm_default_msg: 'Are you sure you want to proceed?',

      // Splash Screen
      splash_title_welcome: 'Welcome to the world of<br><span class="gradient-text">Sudoku</span>',
      splash_subtitle: 'Sharpen your logic & daily focus',
      splash_btn_explore: 'Explore Now',

      // Lobby / Home
      home_title: 'Classic Sudoku',
      home_desc: 'The timeless logic puzzle - fill digits, sharpen reasoning, conquer every challenge',
      home_btn_how_to_play: 'How to Play',
      home_btn_start: 'Start Challenge',
      home_btn_continue: 'Continue Game',
      home_btn_abandon: 'Abandon Game',
      home_abandon_confirm_title: 'Abandon Game',
      home_abandon_confirm_msg: 'The current game will be lost. Are you sure you want to abandon?',

      // Navigation Dock
      nav_home: 'Home',
      nav_variants: 'Variants',
      nav_profile: 'Profile',

      // Variants Tab
      variants_title: 'Explore Variants',
      variants_desc: 'Advanced editions tailored for passionate puzzle solvers',
      variants_badge_coming_soon: 'Coming Soon',
      variant_killer_name: 'Killer Sudoku',
      variant_killer_desc: 'Dotted cages with corner sums. A fusion of Sudoku and arithmetic!',
      variant_diagonal_name: 'Diagonal Sudoku',
      variant_diagonal_desc: 'Both main diagonals must also contain 1-9 without duplicates.',
      variant_samurai_name: 'Samurai Sudoku',
      variant_samurai_desc: '5 overlapping Sudoku grids forming a giant cross puzzle.',
      variant_jigsaw_name: 'Jigsaw Sudoku',
      variant_jigsaw_desc: 'Irregular nonomino shapes instead of standard 3×3 blocks.',

      // Profile Tab
      profile_default_name: 'Sudoku Player',
      profile_btn_edit_name: 'Edit name',
      profile_btn_settings: 'Settings',
      profile_name_placeholder: 'Enter new name…',
      profile_total_time: 'Total Play Time: ',
      profile_rank_title: 'Player Rank',
      profile_rank_1: 'Novice',
      profile_rank_2: 'Apprentice',
      profile_rank_3: 'Adept',
      profile_rank_4: 'Skilled',
      profile_rank_5: 'Tactician',
      profile_rank_6: 'Expert',
      profile_rank_7: 'Master',
      profile_rank_8: 'Grandmaster',
      profile_rank_9: 'Sudoku Legend',
      profile_rank_apprentice: 'Apprentice',
      profile_rank_skilled: 'Skilled',
      profile_rank_expert: 'Expert',
      profile_rank_grandmaster: 'Grandmaster',
      profile_rank_pts: 'pts',
      profile_rank_wins: '{count} wins',
      profile_rank_target: 'Target: {target}',
      profile_rank_max: 'Peak of Mastery • Max Rank Achieved',
      stat_win_rate: 'Win Rate',
      stat_games_won: 'Games Won',
      stat_games_played: 'Games Played',
      stat_best_score: 'High Score',
      stat_perfect_wins: 'Perfect Wins',
      stat_current_streak: 'Current Streak',
      stat_best_streak: 'Best Streak',
      stat_best_time: 'Best Time',
      stat_avg_time: 'Average Time',

      // Difficulties
      diff_easy: 'Easy',
      diff_medium: 'Medium',
      diff_hard: 'Hard',
      diff_modal_title: 'Select Difficulty',
      diff_easy_clues: '38 - 45 given clues',
      diff_easy_sub: 'Great for beginners',
      diff_medium_clues: '30 - 35 given clues',
      diff_medium_sub: 'Balanced challenge',
      diff_hard_clues: '24 - 28 given clues',
      diff_hard_sub: 'High difficulty with fewer given clues',

      // Gameplay Screen
      game_label_difficulty: 'Difficulty',
      game_label_score: 'Score',
      game_label_mistakes: 'Mistakes',
      game_label_time: 'Time',
      game_label_give_up: 'Give Up',
      game_paused_title: 'Paused',
      game_paused_instruction: 'Press Space to resume',
      btn_pause_tooltip: 'Pause [Space]',
      btn_resume_tooltip: 'Resume [Space]',
      game_streak_warning: 'Mistake Streak Warning',
      tool_undo: 'Undo',
      tool_undo_title: 'Undo (Ctrl+Z)',
      tool_erase: 'Erase',
      tool_erase_title: 'Erase (Backspace)',
      tool_fast_fill: 'Lightning',
      tool_fast_fill_title: 'Lightning Mode (F)',
      tool_auto_notes: 'Fast Notes',
      tool_auto_notes_title: 'Auto Notes (A)',
      tool_notes: 'Notes',
      tool_notes_title: 'Pencil Notes (N)',
      tool_hint: 'Hint',
      tool_hint_title: 'Smart Hint (H)',
      in_game_new_game_confirm_title: 'New Game',
      in_game_new_game_confirm_msg: 'Do you want to start a new game? (Current game will be abandoned)',
      in_game_give_up_confirm_title: 'Give Up',
      in_game_give_up_confirm_msg: 'This game will count as a loss. Are you sure?',

      // Game Over / Victory Modal
      gameover_win_title: 'Victory!',
      gameover_win_subtitle: 'You have completed the Sudoku board!',
      gameover_giveup_title: 'Game Abandoned',
      gameover_giveup_subtitle: 'Game score breakdown:',
      gameover_streak_title: 'Max Consecutive Mistakes!',
      gameover_streak_subtitle: 'Game over due to {maxStreak} consecutive mistakes.',
      gameover_lose_title: 'Game Over!',
      gameover_lose_subtitle: 'Exceeded the 3-mistake limit.',
      breakdown_base_score: 'Base Score',
      breakdown_combo_bonus: 'Combo Bonus',
      breakdown_perfect_bonus: 'Perfect Win Bonus',
      breakdown_time_multiplier: 'Time Multiplier',
      breakdown_hint_penalty: 'Hint Penalty',
      breakdown_wrong_penalty: 'Mistake Streak Penalty',
      breakdown_auto_notes_penalty: 'Fast Notes Penalty',
      breakdown_final_score: 'Final Score',
      breakdown_time: 'Completion Time',
      breakdown_mistakes: 'Total Mistakes',
      btn_play_again: 'New Game',
      btn_back_lobby: 'Back to Lobby',

      // Revive Modal (3 Mistakes)
      revive_title: '3 Mistakes Reached!',
      revive_desc: 'Spend match points to reduce mistakes to 2/3 and continue.',
      revive_current_score: 'Current match score:',
      revive_cost: 'Cost to continue:',
      revive_remaining_score: 'Remaining score:',
      revive_note: 'Mistakes reduced to 2/3 (giving you 1 more chance).',
      revive_btn_continue: 'Spend & Continue',
      revive_btn_giveup: 'Accept Defeat',
      revive_insufficient: 'Not enough match points to continue.',

      // Buy Hint Modal (Mastery Points)
      buy_hint_title: 'Get Extra Hint',
      buy_hint_desc: 'Spend Profile points to reveal 1 hint cell.',
      buy_hint_current_points: 'Current Profile points:',
      buy_hint_cost: 'Cost to exchange:',
      buy_hint_remaining_points: 'Remaining points:',
      buy_hint_btn_confirm: 'Exchange Hint',
      buy_hint_btn_cancel: 'Cancel',
      buy_hint_insufficient: 'Not enough Profile points to exchange for a hint.',

      // Tutorial Modal (3 Static Visual Steps)
      tut_title: 'How to Play Sudoku',
      tut_step1_title: '1. Basic Rules (Row, Column & 3×3 Box)',
      tut_step1_desc: 'Every <strong>row</strong>, <strong>column</strong>, and <strong>3×3 box</strong> must contain digits 1 through 9 with <strong>no duplicates</strong>.',
      tut_step2_title: '2. Lightning Mode (Fast-Fill)',
      tut_step2_desc: 'Shortcut <code>F</code>. Select and lock a digit on the keypad, then rapidly click empty cells to place it without re-selecting each time. Once all 9 cells are filled, the button automatically fades away so you can focus on other digits.',
      tut_step3_title: '3. Auto Notes (Fast Candidates)',
      tut_step3_desc: 'Shortcut <code>A</code>. Automatically calculates and fills all valid candidate numbers into every empty cell, helping you quickly identify single-candidate cells for faster reasoning. Toggle it off anytime to wipe all notes and keep the board clean.',
      tut_btn_start_play: 'Start Playing!',

      // Settings Modal
      settings_title: 'Game Settings',
      settings_grp_appearance: 'Appearance & Language',
      settings_lang_title: 'Language',
      settings_lang_desc: 'Choose interface language',
      settings_theme_title: 'Theme Mode',
      settings_theme_desc: 'Switch between Light and Dark mode',
      settings_theme_light: 'Light',
      settings_theme_dark: 'Dark',
      settings_grp_audio: 'Audio & Effects',
      settings_sound_title: 'Sound Effects',
      settings_sound_desc: 'Enable or disable game audio',
      settings_grp_gameplay: 'Gameplay Helpers',
      settings_autoclear_title: 'Auto-Clear Notes',
      settings_autoclear_desc: 'Remove filled digit from notes in matching row, column & box',
      settings_same_num_title: 'Highlight Duplicate Numbers',
      settings_same_num_desc: 'Highlight all cells sharing the same number',
      settings_mistakes_title: 'Highlight Mistakes Immediately',
      settings_mistakes_desc: 'Show a red outline when placing an invalid digit',
      settings_fastfill_title: 'Auto-enable Lightning Mode',
      settings_fastfill_desc: 'Always activate Lightning Mode when starting a new game',
      settings_grp_data: 'Data Backup & Transfer',
      settings_export_title: 'Export Game Data',
      settings_export_desc: 'Download backup file (.json) to your computer',
      settings_export_btn: 'Export Data',
      settings_import_title: 'Import Game Data',
      settings_import_desc: 'Restore game progress from a backup file (.json)',
      settings_import_btn: 'Import File',
      settings_import_confirm_title: 'Restore Game Data',
      settings_import_confirm_msg: 'Importing data will overwrite your current progress, match history, and settings on this device. Are you sure you want to proceed?',
      settings_grp_danger: 'Danger Zone & Data',
      settings_reset_title: 'Reset All Data',
      settings_reset_desc: 'Clear all progress, stats and reset game to default',
      settings_reset_btn: 'Reset Data',
      settings_reset_confirm_title: 'Reset All Data',
      settings_reset_confirm_msg: 'Are you sure you want to delete all match history, play time, and restore the game to initial state?',

      // Toast Notifications & Sound Prompts
      toast_sound_on: 'Sound enabled',
      toast_sound_off: 'Sound muted',
      toast_name_saved: 'Name updated successfully!',
      toast_data_reset: 'All data has been reset successfully!',
      toast_export_success: 'Game data exported successfully!',
      toast_export_failed: 'Failed to create backup file!',
      toast_import_success: 'Game data restored successfully!',
      toast_import_invalid: 'Invalid or corrupted backup file format!',
      toast_import_failed: 'Failed to read backup file!',
      toast_settings_saved: 'Settings saved',
      toast_no_hints: 'No hints remaining!',
      toast_hint_used: '1 hint cell revealed',
      toast_undo_penalty: 'Undo will reset your current combo streak!',
      sound_mute: 'Mute sound',
      sound_unmute: 'Unmute sound',

      // Mobile Notice
      mobile_notice_badge: '🖥️ 100% PC Desktop Optimized',
      mobile_notice_title: 'Best Experienced on Desktop PC',
      mobile_notice_desc: 'Optimized for desktop computers (PC / Laptop) with mouse and keyboard controls.',
      mobile_notice_note: 'Mobile layouts are not yet supported. Please open the game on a computer for the best experience.',
      mobile_notice_spec: 'Recommended resolution: 1280 × 720 or higher',
      mobile_notice_dismiss: 'I understand, continue anyway'
    }
  };

  let currentLang = 'vi';

  function init() {
    if (typeof Storage !== 'undefined' && Storage.getLanguage) {
      currentLang = Storage.getLanguage() || 'vi';
    } else {
      currentLang = 'vi';
    }
    document.documentElement.setAttribute('lang', currentLang);
    apply();
  }

  function t(key, params = {}) {
    const dict = translations[currentLang] || translations.vi;
    let str = dict[key] !== undefined ? dict[key] : (translations.vi[key] !== undefined ? translations.vi[key] : key);
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return str;
  }

  function setLanguage(lang) {
    if (lang !== 'vi' && lang !== 'en') return;
    currentLang = lang;
    if (typeof Storage !== 'undefined' && Storage.setLanguage) {
      Storage.setLanguage(lang);
    }
    document.documentElement.setAttribute('lang', lang);
    apply();

    // Re-render components that have dynamic content
    if (typeof Profile !== 'undefined' && Profile.render) Profile.render();
    if (typeof Variants !== 'undefined' && Variants.init) Variants.init();
    if (typeof Tutorial !== 'undefined' && Tutorial.updateLanguage) Tutorial.updateLanguage();
    if (typeof UIControls !== 'undefined' && UIControls.updateLanguage) UIControls.updateLanguage();
    if (typeof Sound !== 'undefined' && Sound.updateUI) Sound.updateUI();

    // Update document title
    document.title = t('app_title');
  }

  function getLanguage() {
    return currentLang;
  }

  function apply() {
    // 1. Text / HTML elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val !== undefined) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.value = val;
        } else {
          el.innerHTML = val;
        }
      }
    });

    // 2. Placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = t(key);
      if (val !== undefined) el.placeholder = val;
    });

    // 3. Title / aria-label attributes
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const val = t(key);
      if (val !== undefined) {
        el.title = val;
        el.setAttribute('aria-label', val);
      }
    });
  }

  return {
    init,
    t,
    setLanguage,
    getLanguage,
    apply,
    translations
  };
})();

