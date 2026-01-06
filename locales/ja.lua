return {
    -- General
    ["report_system"] = "レポートシステム",
    ["reports"] = "レポート",
    ["report"] = "レポート",
    ["close"] = "閉じる",
    ["cancel"] = "キャンセル",
    ["confirm"] = "確認",
    ["submit"] = "送信",
    ["delete"] = "削除",
    ["save"] = "保存",
    ["search"] = "検索",
    ["filter"] = "フィルター",
    ["all"] = "すべて",
    ["none"] = "なし",
    ["loading"] = "読み込み中...",
    ["no_results"] = "結果が見つかりません",

    -- Report Status
    ["status_open"] = "未対応",
    ["status_claimed"] = "対応中",
    ["status_resolved"] = "解決済み",

    -- Report Categories
    ["category_general"] = "一般",
    ["category_bug"] = "バグ報告",
    ["category_player"] = "プレイヤー報告",
    ["category_question"] = "質問",
    ["category_other"] = "その他",

    -- Create Report
    ["create_report"] = "レポート作成",
    ["report_subject"] = "件名",
    ["report_subject_placeholder"] = "問題の簡潔な説明",
    ["report_category"] = "カテゴリ",
    ["report_category_placeholder"] = "カテゴリを選択",
    ["report_description"] = "説明",
    ["report_description_placeholder"] = "問題についてより詳しく説明してください...",
    ["report_created"] = "レポートが正常に作成されました",
    ["report_creation_failed"] = "レポートの作成に失敗しました",

    -- View Reports
    ["my_reports"] = "マイレポート",
    ["active_reports"] = "対応中のレポート",
    ["resolved_reports"] = "解決済みレポート",
    ["no_reports"] = "レポートが見つかりません",
    ["no_active_reports"] = "対応中のレポートがありません",
    ["report_details"] = "レポート詳細",
    ["created_at"] = "作成日時",
    ["updated_at"] = "更新日時",
    ["resolved_at"] = "解決日時",

    -- Report Actions
    ["claim_report"] = "対応する",
    ["unclaim_report"] = "対応を解除",
    ["resolve_report"] = "解決",
    ["delete_report"] = "削除",
    ["delete_report_confirm"] = "このレポートを削除してもよろしいですか？",
    ["report_claimed"] = "レポートを対応中にしました",
    ["report_unclaimed"] = "レポートの対応を解除しました",
    ["report_resolved"] = "レポートを解決済みにしました",
    ["report_deleted"] = "レポートを削除しました",

    -- Admin Actions
    ["admin_actions"] = "管理者アクション",
    ["teleport_to"] = "テレポート",
    ["bring_player"] = "プレイヤーを持ってくる",
    ["heal_player"] = "回復",
    ["revive_player"] = "復活",
    ["freeze_player"] = "フリーズ",
    ["spectate_player"] = "スペクテイト",
    ["kick_player"] = "キック",
    ["ragdoll_player"] = "ラグドール",
    ["screenshot_player"] = "スクリーンショット",
    ["teleported_to_player"] = "プレイヤーにテレポートしました",
    ["teleported_by_admin"] = "管理者によってテレポートされました",
    ["player_brought"] = "プレイヤーがあなたのところに来ました",
    ["player_healed"] = "プレイヤーを回復しました",
    ["healed_by_admin"] = "管理者に回復されました",
    ["player_revived"] = "プレイヤーを復活させました",
    ["revived_by_admin"] = "管理者に復活させられました",
    ["player_frozen"] = "プレイヤーをフリーズしました",
    ["player_unfrozen"] = "プレイヤーのフリーズを解除しました",
    ["you_were_frozen"] = "管理者にフリーズされました",
    ["you_were_unfrozen"] = "フリーズが解除されました",
    ["player_kicked"] = "プレイヤーをキックしました",
    ["kicked_reason"] = "管理者によってキックされました：%s",
    ["player_ragdolled"] = "プレイヤーをラグドール状態にしました",
    ["spectating_player"] = "%s をスペクテイト中",
    ["spectate_stopped"] = "スペクテイトを停止しました",
    ["screenshot_requested"] = "スクリーンショットをリクエストしました",
    ["screenshot_received"] = "%s からスクリーンショットを受け取りました",
    ["screenshot_unavailable"] = "スクリーンショット機能は利用できません",
    ["screenshot_requires_discord"] = "スクリーンショット機能には Discord webhook の設定が必要です",
    ["screenshot_upload_failed"] = "Discord へのスクリーンショットアップロードに失敗しました",
    ["screenshot_failed"] = "スクリーンショット撮影に失敗しました",
    ["screenshot_uploaded"] = "スクリーンショットをアップロードしました",
    ["screenshot_cooldown"] = "次のスクリーンショットを撮るまでお待ちください",
    ["auto_screenshot"] = "自動スクリーンショット",
    ["take_screenshot"] = "スクリーンショットを撮影",
    ["player_offline"] = "プレイヤーはオフラインです",

    -- Chat
    ["chat"] = "チャット",
    ["send_message"] = "送信",
    ["type_message"] = "メッセージを入力...",
    ["message_sent"] = "メッセージを送信しました",
    ["new_message"] = "レポート #%d の新しいメッセージ",

    -- Admin Panel
    ["admin_panel"] = "管理者パネル",
    ["staff_overview"] = "スタッフ概要",
    ["filter_by_status"] = "ステータスでフィルター",
    ["filter_by_category"] = "カテゴリでフィルター",
    ["search_by_id"] = "ID で検索",
    ["search_by_player"] = "プレイヤーで検索",
    ["claimed_by"] = "対応者",
    ["assigned_to"] = "割り当て先",
    ["no_one"] = "なし",

    -- Notifications
    ["new_report"] = "新しいレポート",
    ["new_report_from"] = "%s からの新しいレポート",
    ["report_updated"] = "レポートが更新されました",
    ["report_status_changed"] = "レポート #%d のステータスが %s に変更されました",

    -- Errors
    ["error_generic"] = "エラーが発生しました",
    ["error_cooldown"] = "別のレポートを作成するまで %d 秒お待ちください",
    ["error_max_reports"] = "対応中のレポートの最大数 (%d) に達しました",
    ["error_invalid_category"] = "無効なカテゴリが選択されています",
    ["error_subject_required"] = "件名は必須です",
    ["error_subject_too_long"] = "件名が長すぎます（最大 %d 文字）",
    ["error_description_too_long"] = "説明が長すぎます（最大 %d 文字）",
    ["error_not_found"] = "レポートが見つかりません",
    ["error_no_permission"] = "この操作を実行する権限がありません",
    ["error_already_claimed"] = "このレポートは既に対応中です",
    ["error_not_claimed"] = "このレポートは対応中ではありません",
    ["error_cannot_delete"] = "このレポートは削除できません",
    ["error_message_empty"] = "メッセージは空にできません",

    -- Action Groups
    ["teleport"] = "テレポート",
    ["health"] = "ヘルス",
    ["moderation"] = "モデレーション",

    -- Theme
    ["theme"] = "テーマ",
    ["theme_dark"] = "ダーク",
    ["theme_light"] = "ライト",

    -- Misc
    ["online"] = "オンライン",
    ["offline"] = "オフライン",
    ["player"] = "プレイヤー",
    ["admin"] = "管理者",
    ["priority"] = "優先度",
    ["low"] = "低",
    ["normal"] = "中",
    ["high"] = "高",
    ["urgent"] = "緊急",

    -- Priority Labels
    ["priority_low"] = "低",
    ["priority_normal"] = "中",
    ["priority_high"] = "高",
    ["priority_urgent"] = "緊急",
    ["priority_updated"] = "優先度を更新しました",

    -- Admin Notes
    ["admin_notes"] = "管理者メモ",
    ["player_notes"] = "プレイヤーメモ",
    ["internal_only"] = "内部のみ",
    ["no_notes"] = "メモはまだありません",
    ["add_note_placeholder"] = "メモを追加...",
    ["add_player_note_placeholder"] = "このプレイヤーについてのメモを追加...",
    ["note_added"] = "メモを追加しました",
    ["note_deleted"] = "メモを削除しました",
    ["error_note_empty"] = "メモは空にできません",
    ["error_note_too_long"] = "メモが長すぎます（最大 %d 文字）",

    -- Player History
    ["report_history"] = "レポート履歴",
    ["total_reports"] = "総レポート数",
    ["open_reports"] = "未対応",
    ["resolved_reports"] = "解決済み",
    ["notes"] = "メモ",
    ["no_report_history"] = "レポート履歴がありません",
    ["no_player_notes"] = "このプレイヤーのメモはありません",
    ["view_player_info"] = "プレイヤー情報を表示",
    ["show_resolved"] = "解決済みを表示",

    -- System Messages (Admin Actions)
    ["action_teleport_to"] = "%s がプレイヤーにテレポートしました",
    ["action_bring_player"] = "%s がプレイヤーを持ってきました",
    ["action_heal_player"] = "%s がプレイヤーを回復しました",
    ["action_revive_player"] = "%s がプレイヤーを復活させました",
    ["action_freeze_player"] = "%s がプレイヤーのフリーズを切り替えました",
    ["action_kick_player"] = "%s がプレイヤーをキックしました",
    ["action_ragdoll_player"] = "%s がプレイヤーをラグドール状態にしました",
    ["action_spectate_player"] = "%s がプレイヤーのスペクテイトを開始しました",
    ["action_screenshot_player"] = "%s がプレイヤーのスクリーンショットを撮影しました",

    -- Statistics
    ["statistics"] = "統計",
    ["total_reports"] = "総レポート数",
    ["reports_by_status"] = "ステータス別レポート",
    ["reports_by_category"] = "カテゴリ別レポート",
    ["reports_by_priority"] = "優先度別レポート",
    ["admin_leaderboard"] = "管理者ランキング",
    ["recent_activity"] = "最近のアクティビティ（過去7日間）",
    ["avg_time"] = "平均",
    ["resolved"] = "解決済み",
    ["no_data"] = "利用可能なデータがありません",

    -- Player Identifiers
    ["identifier_license"] = "ライセンス",
    ["identifier_steam"] = "Steam",
    ["identifier_discord"] = "Discord",
    ["identifier_fivem"] = "FiveM",
    ["copied"] = "コピーしました！",
    ["copy_hint"] = "Ctrl+C でコピー",

    -- インベントリ管理
    ["inventory"] = "インベントリ",
    ["inventory_management"] = "インベントリ管理",
    ["inventory_items"] = "アイテム",
    ["inventory_empty"] = "プレイヤーのインベントリは空です",
    ["inventory_loading"] = "インベントリを読み込み中...",
    ["inventory_unavailable"] = "インベントリシステムが利用できません",
    ["inventory_player_offline"] = "インベントリを表示できません - プレイヤーはオフラインです",
    ["inventory_system"] = "インベントリシステム",
    ["inventory_refresh"] = "更新",

    -- アイテムアクション
    ["item_add"] = "アイテム追加",
    ["item_remove"] = "アイテム削除",
    ["item_set_count"] = "数量設定",
    ["item_edit_metadata"] = "メタデータ編集",
    ["item_name"] = "アイテム名",
    ["item_label"] = "ラベル",
    ["item_count"] = "数量",
    ["item_slot"] = "スロット",
    ["item_weight"] = "重量",
    ["item_metadata"] = "メタデータ",
    ["item_durability"] = "耐久度",
    ["item_serial"] = "シリアル番号",
    ["item_select"] = "アイテムを選択",
    ["item_search"] = "アイテムを検索...",

    -- インベントリアクション結果
    ["inventory_item_added"] = "%dx %s をプレイヤーのインベントリに追加しました",
    ["inventory_item_removed"] = "%dx %s をプレイヤーのインベントリから削除しました",
    ["inventory_item_set"] = "%s の数量を %d に設定しました",
    ["inventory_metadata_updated"] = "%s のメタデータを更新しました",
    ["inventory_action_failed"] = "インベントリアクションが失敗しました: %s",
    ["inventory_action_success"] = "インベントリアクションが完了しました",

    -- インベントリアクションログ
    ["inventory_action_log"] = "アクションログ",
    ["inventory_recent_actions"] = "最近のアクション",
    ["inventory_no_actions"] = "アクションはありません",

    -- インベントリエラー
    ["error_inventory_disabled"] = "インベントリ管理は無効です",
    ["error_invalid_item"] = "無効なアイテム名",
    ["error_invalid_count"] = "無効な数量",
    ["error_invalid_slot"] = "無効なスロット番号",
    ["error_item_not_found"] = "インベントリにアイテムが見つかりません",
    ["error_insufficient_items"] = "プレイヤーのアイテムが不足しています",
    ["error_inventory_full"] = "プレイヤーのインベントリがいっぱいです",
    ["error_metadata_not_supported"] = "このインベントリシステムではメタデータの編集はサポートされていません",
    ["error_max_item_count"] = "一度に %d 個以上のアイテムは追加できません",

    -- インベントリ確認
    ["confirm_add_item"] = "%dx %s を %s のインベントリに追加しますか？",
    ["confirm_remove_item"] = "%dx %s を %s のインベントリから削除しますか？",
    ["confirm_set_item"] = "%s の %s の数量を %d に設定しますか？",

    -- インベントリシステムメッセージ
    ["action_add_item"] = "%s が %dx %s をプレイヤーのインベントリに追加しました",
    ["action_remove_item"] = "%s が %dx %s をプレイヤーのインベントリから削除しました",
    ["action_set_item"] = "%s がプレイヤーの %s の数量を %d に設定しました",
    ["action_edit_metadata"] = "%s が %s のメタデータを編集しました",

    -- インベントリ Discord
    ["discord_inventory_action"] = "インベントリアクション",
    ["discord_action_type"] = "アクション",
    ["discord_item_details"] = "アイテム詳細",
    ["discord_count_change"] = "数量変更"
}
