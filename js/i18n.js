/* =========================================================
   i18n.js — Bilingual Internationalization Engine (VI & EN)
   Pure Vanilla JS, Zero Dependencies, Real-time Reactive
   ========================================================= */
const I18n = (() => {

  const translations = {
    vi: {
      // General & Common
      app_title: 'Sudoku — Rèn luyện tư duy',
      brand_name: 'Sudoku Web',
      btn_cancel: 'Hủy',
      btn_confirm: 'Xác nhận',
      btn_close: 'Đóng',
      btn_save: 'Lưu',
      btn_back: 'Quay lại',
      btn_next: 'Tiếp theo',
      btn_resume: 'Tiếp tục',
      btn_new_game: 'Ván Chơi Mới',
      btn_give_up: 'Bỏ cuộc',
      confirm_title: 'Xác nhận',
      confirm_default_msg: 'Bạn có chắc chắn muốn thực hiện?',

      // Splash Screen
      splash_title_welcome: 'Chào mừng bạn đến với<br>thế giới <span class="gradient-text">Sudoku</span>',
      splash_subtitle: 'Rèn luyện tư duy & sự tập trung mỗi ngày',
      splash_btn_explore: 'Khám phá ngay',

      // Lobby / Home
      home_title: 'Sudoku Cổ Điển',
      home_desc: 'Trò chơi trí tuệ kinh điển — điền số, rèn logic, chinh phục mọi thử thách',
      home_btn_how_to_play: 'Cách chơi',
      home_btn_start: 'Bắt Đầu Thử Thách',
      home_btn_continue: 'Tiếp Tục Ván Đang Chơi',
      home_btn_abandon: 'Bỏ Cuộc / Hủy Ván',
      home_abandon_confirm_title: 'Bỏ Cuộc',
      home_abandon_confirm_msg: 'Ván đang chơi sẽ bị xóa. Bạn có chắc chắn muốn bỏ cuộc?',

      // Navigation Dock
      nav_home: 'Trang chủ',
      nav_variants: 'Biến thể',
      nav_profile: 'Hồ sơ',

      // Variants Tab
      variants_title: 'Khám Phá Biến Thể',
      variants_desc: 'Các phiên bản nâng cao dành cho những kỳ thủ đam mê thử thách',
      variants_badge_coming_soon: 'Sắp ra mắt',
      variant_killer_name: 'Killer Sudoku',
      variant_killer_desc: 'Lồng nét đứt với tổng ở góc. Kết hợp Sudoku và phép cộng!',
      variant_diagonal_name: 'Sudoku Đường Chéo',
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
      profile_rank_title: 'Cấp Bậc Danh Hiệu',
      profile_rank_1: 'Nhập Môn',
      profile_rank_2: 'Tập Sự',
      profile_rank_3: 'Sơ Cấp',
      profile_rank_4: 'Thấu Suốt',
      profile_rank_5: 'Tinh Anh',
      profile_rank_6: 'Chuyên Gia',
      profile_rank_7: 'Bậc Thầy',
      profile_rank_8: 'Kiện Tướng',
      profile_rank_9: 'Huyền Thoại Sudoku',
      profile_rank_apprentice: 'Tập sự',
      profile_rank_skilled: 'Thạo việc',
      profile_rank_expert: 'Cao thủ',
      profile_rank_grandmaster: 'Đại kiện tướng',
      profile_rank_pts: 'điểm',
      profile_rank_wins: '{count} trận thắng',
      profile_rank_target: 'Mục tiêu: {target}',
      profile_rank_max: 'Đỉnh Cao Danh Vọng • Đạt Cấp Tối Đa',
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
      diff_modal_title: 'Chọn Độ Khó',
      diff_easy_clues: '38 – 45 ô cho trước',
      diff_easy_sub: 'Phù hợp người mới bắt đầu',
      diff_medium_clues: '30 – 35 ô cho trước',
      diff_medium_sub: 'Thử thách vừa phải',
      diff_hard_clues: '24 – 28 ô cho trước',
      diff_hard_sub: 'Dành cho kỳ thủ thực thụ',

      // Gameplay Screen
      game_label_difficulty: 'Độ khó',
      game_label_score: 'Điểm',
      game_label_mistakes: 'Lỗi',
      game_label_time: 'Thời gian',
      game_label_give_up: 'Bỏ cuộc',
      game_paused_title: 'Đã Tạm Dừng',
      game_streak_warning: 'Cảnh báo chuỗi sai',
      tool_undo: 'Hoàn tác',
      tool_erase: 'Xóa',
      tool_notes: 'Ghi chú',
      tool_hint: 'Gợi ý',
      in_game_new_game_confirm_title: 'Ván Chơi Mới',
      in_game_new_game_confirm_msg: 'Bạn có muốn bắt đầu ván mới không? (Ván hiện tại sẽ bị hủy)',
      in_game_give_up_confirm_title: 'Bỏ Cuộc',
      in_game_give_up_confirm_msg: 'Ván này sẽ được tính là thua. Bạn có chắc chắn?',

      // Game Over / Victory Modal
      gameover_win_title: 'Chiến Thắng!',
      gameover_win_subtitle: 'Chúc mừng bạn đã hoàn thành trọn vẹn ván cờ Sudoku!',
      gameover_giveup_title: 'Đã Bỏ Cuộc',
      gameover_giveup_subtitle: 'Ván đấu đã kết thúc. Dưới đây là bảng điểm chi tiết bạn đã tích lũy:',
      gameover_streak_title: 'Hết Lượt Sai Liên Tiếp!',
      gameover_streak_subtitle: 'Bạn đã chọn sai {maxStreak} lần liên tiếp ở mức {diff}. Ván đấu đã kết thúc!',
      gameover_lose_title: 'Thất Bại!',
      gameover_lose_subtitle: 'Bạn đã đạt giới hạn lỗi cho phép trong ván đấu.',
      breakdown_base_score: 'Điểm cơ bản',
      breakdown_combo_bonus: 'Thưởng combo',
      breakdown_perfect_bonus: 'Thắng hoàn hảo',
      breakdown_time_multiplier: 'Hệ số thời gian',
      breakdown_hint_penalty: 'Trừ điểm gợi ý',
      breakdown_wrong_penalty: 'Trừ điểm chuỗi sai',
      breakdown_final_score: 'Tổng điểm đạt được',
      breakdown_time: 'Thời gian hoàn thành',
      breakdown_mistakes: 'Số lỗi vi phạm',
      btn_play_again: 'Ván Mới',
      btn_back_lobby: 'Về Sảnh Chính',

      // Tutorial Modal
      tut_title: 'Cách Chơi Sudoku',
      tut_step1_title: 'Quy tắc Hàng & Cột',
      tut_step1_desc: 'Mỗi <strong>hàng ngang</strong> và mỗi <strong>cột dọc</strong> phải chứa đầy đủ các số từ 1 đến 9 — không có số nào được lặp lại.',
      tut_step2_title: 'Quy tắc Khối 3×3',
      tut_step2_desc: 'Bảng Sudoku được chia thành 9 <strong>khối 3×3</strong>. Mỗi khối cũng phải chứa đúng các số từ 1 đến 9, không trùng lặp.',
      tut_step3_title: 'Suy luận & Ghi chú',
      tut_step3_desc: 'Dùng <strong>giao điểm</strong> giữa hàng, cột và khối để loại trừ. Bật chế độ <strong>Ghi chú</strong> (✏️) để đánh dấu các số có thể điền vào ô trống.',
      tut_btn_start_play: 'Bắt đầu chơi!',

      // Settings Modal
      settings_title: 'Cài Đặt Hệ Thống',
      settings_grp_appearance: 'Giao Diện & Ngôn Ngữ',
      settings_lang_title: 'Ngôn ngữ',
      settings_lang_desc: 'Lựa chọn ngôn ngữ hiển thị hệ thống',
      settings_theme_title: 'Chế độ giao diện',
      settings_theme_desc: 'Chuyển đổi giao diện Sáng / Tối dịu mắt',
      settings_theme_light: 'Sáng',
      settings_theme_dark: 'Tối',
      settings_grp_audio: 'Âm Thanh & Hiệu Ứng',
      settings_sound_title: 'Hiệu ứng âm thanh',
      settings_sound_desc: 'Âm thanh phản hồi khi điền số, combo, gợi ý và thắng',
      settings_grp_gameplay: 'Hỗ Trợ Giải Đố',
      settings_autoclear_title: 'Tự động xóa ghi chú',
      settings_autoclear_desc: 'Xóa số tương ứng trong ghi chú hàng, cột & khối khi điền đúng',
      settings_same_num_title: 'Làm nổi bật số giống nhau',
      settings_same_num_desc: 'Làm sáng các ô có cùng số với ô đang được chọn',
      settings_mistakes_title: 'Cảnh báo lỗi ngay lập tức',
      settings_mistakes_desc: 'Hiển thị viền đỏ cảnh báo khi điền số không chính xác',
      settings_grp_danger: 'Vùng Nguy Hiểm & Dữ Liệu',
      settings_reset_title: 'Đặt lại toàn bộ dữ liệu',
      settings_reset_desc: 'Xóa mọi lịch sử ván đấu, chuỗi thắng, thời gian và đưa game về trạng thái ban đầu',
      settings_reset_btn: 'Xóa Dữ Liệu',
      settings_reset_confirm_title: 'Xóa Dữ Liệu',
      settings_reset_confirm_msg: 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử đấu, thời gian chơi và đưa game về trạng thái ban đầu?',

      // Toast Notifications & Sound Prompts
      toast_sound_on: '🔔 Đã bật âm thanh',
      toast_sound_off: '🔇 Đã tắt âm thanh',
      toast_name_saved: '✨ Đổi tên thành công!',
      toast_data_reset: '🔄 Đã xóa toàn bộ dữ liệu thành công!',
      toast_settings_saved: '⚙️ Đã lưu cài đặt',
      toast_no_hints: '⚠️ Không còn gợi ý nào!',
      toast_hint_used: '💡 Đã tự động điền 1 số gợi ý',
      sound_mute: 'Tắt âm thanh',
      sound_unmute: 'Bật âm thanh',

      // Mobile Notice
      mobile_notice_badge: '🖥️ Tối ưu hóa 100% cho PC',
      mobile_notice_title: 'Trải Nghiệm Tốt Nhất Trên Máy Tính',
      mobile_notice_desc: '<strong>Sudoku Cổ Điển</strong> được thiết kế chuyên biệt và tối ưu hóa hoàn toàn cho màn hình máy tính (PC / Laptop) nhằm mang lại không gian giải đố logic rộng rãi cùng thao tác phím số và chuột chuẩn xác nhất.',
      mobile_notice_note: 'Trò chơi hiện chưa hỗ trợ tối ưu trên điện thoại di động. Rất mong bạn thông cảm và vui lòng mở game trên máy tính để tận hưởng trọn vẹn mọi tính năng!',
      mobile_notice_spec: 'Độ phân giải khuyến nghị: 1280 × 720 trở lên',
      mobile_notice_dismiss: 'Tôi hiểu rồi, vẫn tiếp tục xem'
    },

    en: {
      // General & Common
      app_title: 'Sudoku — Brain Training & Logic',
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
      home_desc: 'The timeless logic puzzle — fill digits, sharpen reasoning, conquer every challenge',
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
      diff_easy_clues: '38 – 45 given clues',
      diff_easy_sub: 'Great for beginners',
      diff_medium_clues: '30 – 35 given clues',
      diff_medium_sub: 'Balanced challenge',
      diff_hard_clues: '24 – 28 given clues',
      diff_hard_sub: 'For experienced masters',

      // Gameplay Screen
      game_label_difficulty: 'Difficulty',
      game_label_score: 'Score',
      game_label_mistakes: 'Mistakes',
      game_label_time: 'Time',
      game_label_give_up: 'Give Up',
      game_paused_title: 'Game Paused',
      game_streak_warning: 'Mistake Streak Warning',
      tool_undo: 'Undo',
      tool_erase: 'Erase',
      tool_notes: 'Notes',
      tool_hint: 'Hint',
      in_game_new_game_confirm_title: 'New Game',
      in_game_new_game_confirm_msg: 'Do you want to start a new game? (Current game will be abandoned)',
      in_game_give_up_confirm_title: 'Give Up',
      in_game_give_up_confirm_msg: 'This game will count as a loss. Are you sure?',

      // Game Over / Victory Modal
      gameover_win_title: 'Victory!',
      gameover_win_subtitle: 'Congratulations on completing the entire Sudoku board!',
      gameover_giveup_title: 'Game Abandoned',
      gameover_giveup_subtitle: 'The game has ended. Here is your accumulated score breakdown:',
      gameover_streak_title: 'Max Consecutive Mistakes!',
      gameover_streak_subtitle: 'You made {maxStreak} consecutive mistakes on {diff} level. Game over!',
      gameover_lose_title: 'Game Over!',
      gameover_lose_subtitle: 'You reached the maximum mistake allowance.',
      breakdown_base_score: 'Base Score',
      breakdown_combo_bonus: 'Combo Bonus',
      breakdown_perfect_bonus: 'Perfect Win Bonus',
      breakdown_time_multiplier: 'Time Multiplier',
      breakdown_hint_penalty: 'Hint Penalty',
      breakdown_wrong_penalty: 'Mistake Streak Penalty',
      breakdown_final_score: 'Final Score',
      breakdown_time: 'Completion Time',
      breakdown_mistakes: 'Total Mistakes',
      btn_play_again: 'New Game',
      btn_back_lobby: 'Back to Lobby',

      // Tutorial Modal
      tut_title: 'How to Play Sudoku',
      tut_step1_title: 'Row & Column Rules',
      tut_step1_desc: 'Every <strong>row</strong> and <strong>column</strong> must contain digits 1 through 9 — no repeated numbers allowed.',
      tut_step2_title: '3×3 Box Rule',
      tut_step2_desc: 'The board is divided into nine <strong>3×3 boxes</strong>. Each box must also contain numbers 1 to 9 without duplicates.',
      tut_step3_title: 'Logic & Notes',
      tut_step3_desc: 'Use intersections of rows, columns, and boxes to eliminate candidates. Turn on <strong>Notes</strong> (✏️) to mark potential candidates.',
      tut_btn_start_play: 'Start Playing!',

      // Settings Modal
      settings_title: 'Game Settings',
      settings_grp_appearance: 'Appearance & Language',
      settings_lang_title: 'Language',
      settings_lang_desc: 'Choose your interface language',
      settings_theme_title: 'Theme Mode',
      settings_theme_desc: 'Switch between Light and eye-friendly Dark mode',
      settings_theme_light: 'Light',
      settings_theme_dark: 'Dark',
      settings_grp_audio: 'Audio & Effects',
      settings_sound_title: 'Sound Effects',
      settings_sound_desc: 'Feedback for cell inputs, combos, hints and victory',
      settings_grp_gameplay: 'Gameplay Helpers',
      settings_autoclear_title: 'Auto-Clear Notes',
      settings_autoclear_desc: 'Remove filled digit from notes in matching row, column & box',
      settings_same_num_title: 'Highlight Duplicate Numbers',
      settings_same_num_desc: 'Highlight all cells sharing the same number as the selected cell',
      settings_mistakes_title: 'Highlight Mistakes Immediately',
      settings_mistakes_desc: 'Show a red outline when placing an invalid digit',
      settings_grp_danger: 'Danger Zone & Data',
      settings_reset_title: 'Reset All Data',
      settings_reset_desc: 'Clear all match history, win streaks, play time and return game to initial state',
      settings_reset_btn: 'Reset Data',
      settings_reset_confirm_title: 'Reset All Data',
      settings_reset_confirm_msg: 'Are you sure you want to delete all match history, play time, and restore the game to initial state?',

      // Toast Notifications & Sound Prompts
      toast_sound_on: '🔔 Sound enabled',
      toast_sound_off: '🔇 Sound muted',
      toast_name_saved: '✨ Name updated successfully!',
      toast_data_reset: '🔄 All data has been reset successfully!',
      toast_settings_saved: '⚙️ Settings saved',
      toast_no_hints: '⚠️ No hints remaining!',
      toast_hint_used: '💡 1 hint cell revealed',
      sound_mute: 'Mute sound',
      sound_unmute: 'Unmute sound',

      // Mobile Notice
      mobile_notice_badge: '🖥️ 100% PC Desktop Optimized',
      mobile_notice_title: 'Best Experienced on Desktop PC',
      mobile_notice_desc: '<strong>Sudoku Web</strong> is specially designed and fully optimized for PC / Laptop screens to provide an expansive puzzle board with accurate mouse and numeric keypad controls.',
      mobile_notice_note: 'Mobile device layouts are not currently optimized. We appreciate your understanding and encourage opening the game on a computer for the full experience!',
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

