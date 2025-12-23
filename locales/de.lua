return {
    -- General
    ["report_system"] = "Report System",
    ["reports"] = "Reports",
    ["report"] = "Report",
    ["close"] = "Schließen",
    ["cancel"] = "Abbrechen",
    ["confirm"] = "Bestätigen",
    ["submit"] = "Absenden",
    ["delete"] = "Löschen",
    ["save"] = "Speichern",
    ["search"] = "Suchen",
    ["filter"] = "Filter",
    ["all"] = "Alle",
    ["none"] = "Keine",
    ["loading"] = "Laden...",
    ["no_results"] = "Keine Ergebnisse gefunden",

    -- Report Status
    ["status_open"] = "Offen",
    ["status_claimed"] = "In Bearbeitung",
    ["status_resolved"] = "Gelöst",

    -- Report Categories
    ["category_general"] = "Allgemein",
    ["category_bug"] = "Bug Report",
    ["category_player"] = "Spieler Report",
    ["category_question"] = "Frage",
    ["category_other"] = "Sonstiges",

    -- Create Report
    ["create_report"] = "Report erstellen",
    ["report_subject"] = "Betreff",
    ["report_subject_placeholder"] = "Kurze Zusammenfassung deines Problems",
    ["report_category"] = "Kategorie",
    ["report_category_placeholder"] = "Wähle eine Kategorie",
    ["report_description"] = "Beschreibung",
    ["report_description_placeholder"] = "Beschreibe dein Problem genauer...",
    ["report_created"] = "Report erfolgreich erstellt",
    ["report_creation_failed"] = "Report konnte nicht erstellt werden",

    -- View Reports
    ["my_reports"] = "Meine Reports",
    ["active_reports"] = "Aktive Reports",
    ["resolved_reports"] = "Gelöste Reports",
    ["no_reports"] = "Keine Reports gefunden",
    ["no_active_reports"] = "Du hast keine aktiven Reports",
    ["report_details"] = "Report Details",
    ["created_at"] = "Erstellt",
    ["updated_at"] = "Aktualisiert",
    ["resolved_at"] = "Gelöst",

    -- Report Actions
    ["claim_report"] = "Übernehmen",
    ["unclaim_report"] = "Freigeben",
    ["resolve_report"] = "Lösen",
    ["delete_report"] = "Report löschen",
    ["delete_report_confirm"] = "Bist du sicher, dass du diesen Report löschen möchtest?",
    ["report_claimed"] = "Report übernommen",
    ["report_unclaimed"] = "Report freigegeben",
    ["report_resolved"] = "Report gelöst",
    ["report_deleted"] = "Report gelöscht",

    -- Admin Actions
    ["admin_actions"] = "Admin Aktionen",
    ["teleport_to"] = "Teleportieren",
    ["bring_player"] = "Herholen",
    ["heal_player"] = "Heilen",
    ["revive_player"] = "Wiederbeleben",
    ["freeze_player"] = "Einfrieren",
    ["spectate_player"] = "Beobachten",
    ["kick_player"] = "Kicken",
    ["ragdoll_player"] = "Ragdoll",
    ["screenshot_player"] = "Screenshot",
    ["teleported_to_player"] = "Zum Spieler teleportiert",
    ["teleported_by_admin"] = "Du wurdest von einem Admin teleportiert",
    ["player_brought"] = "Spieler zu dir geholt",
    ["player_healed"] = "Spieler geheilt",
    ["healed_by_admin"] = "Du wurdest von einem Admin geheilt",
    ["player_revived"] = "Spieler wiederbelebt",
    ["revived_by_admin"] = "Du wurdest von einem Admin wiederbelebt",
    ["player_frozen"] = "Spieler eingefroren",
    ["player_unfrozen"] = "Spieler aufgetaut",
    ["you_were_frozen"] = "Du wurdest von einem Admin eingefroren",
    ["you_were_unfrozen"] = "Du wurdest aufgetaut",
    ["player_kicked"] = "Spieler gekickt",
    ["kicked_reason"] = "Du wurdest von Admin %s gekickt",
    ["player_ragdolled"] = "Spieler zu Boden geworfen",
    ["spectating_player"] = "Beobachte %s",
    ["spectate_stopped"] = "Beobachtung beendet",
    ["screenshot_requested"] = "Screenshot angefordert",
    ["screenshot_received"] = "Screenshot von %s erhalten",
    ["screenshot_unavailable"] = "Screenshot-System nicht verfügbar",
    ["screenshot_requires_discord"] = "Die Screenshot-Funktion erfordert eine konfigurierte Discord-Webhook",
    ["screenshot_upload_failed"] = "Fehler beim Hochladen des Screenshots zu Discord",
    ["screenshot_failed"] = "Screenshot konnte nicht erstellt werden",
    ["screenshot_uploaded"] = "Screenshot hochgeladen",
    ["take_screenshot"] = "Screenshot aufnehmen",
    ["player_offline"] = "Spieler ist offline",

    -- Chat
    ["chat"] = "Chat",
    ["send_message"] = "Senden",
    ["type_message"] = "Nachricht eingeben...",
    ["message_sent"] = "Nachricht gesendet",
    ["new_message"] = "Neue Nachricht in Report #%d",

    -- Admin Panel
    ["admin_panel"] = "Admin Panel",
    ["staff_overview"] = "Staff Übersicht",
    ["filter_by_status"] = "Nach Status filtern",
    ["filter_by_category"] = "Nach Kategorie filtern",
    ["search_by_id"] = "Nach ID suchen",
    ["search_by_player"] = "Nach Spieler suchen",
    ["claimed_by"] = "Übernommen von",
    ["assigned_to"] = "Zugewiesen an",
    ["no_one"] = "Niemand",

    -- Notifications
    ["new_report"] = "Neuer Report",
    ["new_report_from"] = "Neuer Report von %s",
    ["report_updated"] = "Report aktualisiert",
    ["report_status_changed"] = "Report #%d Status geändert zu %s",

    -- Voice Messages
    ["voice_message"] = "Sprachnachricht",
    ["pause"] = "Pause",
    ["resume"] = "Fortsetzen",
    ["no_messages"] = "Noch keine Nachrichten",
    ["error_voice_disabled"] = "Sprachnachrichten sind deaktiviert",
    ["error_voice_too_long"] = "Sprachnachricht überschreitet maximale Dauer",
    ["error_voice_too_large"] = "Sprachnachricht ist zu groß",
    ["error_voice_upload_failed"] = "Sprachnachricht konnte nicht hochgeladen werden",

    -- Errors
    ["error_generic"] = "Ein Fehler ist aufgetreten",
    ["error_cooldown"] = "Bitte warte %d Sekunden bevor du einen weiteren Report erstellst",
    ["error_max_reports"] = "Du hast die maximale Anzahl aktiver Reports erreicht (%d)",
    ["error_invalid_category"] = "Ungültige Kategorie ausgewählt",
    ["error_subject_required"] = "Betreff ist erforderlich",
    ["error_subject_too_long"] = "Betreff ist zu lang (max %d Zeichen)",
    ["error_description_too_long"] = "Beschreibung ist zu lang (max %d Zeichen)",
    ["error_not_found"] = "Report nicht gefunden",
    ["error_no_permission"] = "Du hast keine Berechtigung dafür",
    ["error_already_claimed"] = "Dieser Report ist bereits übernommen",
    ["error_not_claimed"] = "Dieser Report ist nicht übernommen",
    ["error_cannot_delete"] = "Du kannst diesen Report nicht löschen",
    ["error_message_empty"] = "Nachricht darf nicht leer sein",

    -- Action Groups
    ["teleport"] = "Teleport",
    ["health"] = "Gesundheit",
    ["moderation"] = "Moderation",

    -- Theme
    ["theme"] = "Design",
    ["theme_dark"] = "Dunkel",
    ["theme_light"] = "Hell",

    -- Misc
    ["online"] = "Online",
    ["offline"] = "Offline",
    ["player"] = "Spieler",
    ["admin"] = "Admin",
    ["priority"] = "Priorität",
    ["low"] = "Niedrig",
    ["normal"] = "Normal",
    ["high"] = "Hoch",
    ["urgent"] = "Dringend",

    -- Priority Labels
    ["priority_low"] = "Niedrig",
    ["priority_normal"] = "Normal",
    ["priority_high"] = "Hoch",
    ["priority_urgent"] = "Dringend",
    ["priority_updated"] = "Priorität aktualisiert",

    -- Admin Notes
    ["admin_notes"] = "Admin Notizen",
    ["player_notes"] = "Spieler Notizen",
    ["internal_only"] = "nur intern sichtbar",
    ["no_notes"] = "Noch keine Notizen",
    ["add_note_placeholder"] = "Notiz hinzufügen...",
    ["add_player_note_placeholder"] = "Notiz über diesen Spieler hinzufügen...",
    ["note_added"] = "Notiz hinzugefügt",
    ["note_deleted"] = "Notiz gelöscht",
    ["error_note_empty"] = "Notiz darf nicht leer sein",
    ["error_note_too_long"] = "Notiz ist zu lang (max %d Zeichen)",

    -- Player History
    ["report_history"] = "Report Historie",
    ["total_reports"] = "Gesamt Reports",
    ["open_reports"] = "Offen",
    ["resolved_reports"] = "Gelöst",
    ["notes"] = "Notizen",
    ["no_report_history"] = "Keine Report Historie",
    ["no_player_notes"] = "Keine Notizen zu diesem Spieler",
    ["view_player_info"] = "Spieler Info anzeigen",
    ["show_resolved"] = "Gelöste anzeigen",

    -- System Messages (Admin Actions)
    ["action_teleport_to"] = "%s hat sich zum Spieler teleportiert",
    ["action_bring_player"] = "%s hat den Spieler hergeholt",
    ["action_heal_player"] = "%s hat den Spieler geheilt",
    ["action_revive_player"] = "%s hat den Spieler wiederbelebt",
    ["action_freeze_player"] = "%s hat den Spieler eingefroren/aufgetaut",
    ["action_kick_player"] = "%s hat den Spieler gekickt",
    ["action_ragdoll_player"] = "%s hat Ragdoll beim Spieler ausgelöst",
    ["action_spectate_player"] = "%s beobachtet jetzt den Spieler",
    ["action_screenshot_player"] = "%s hat Screenshot vom Spieler gemacht",

    -- Statistics
    ["statistics"] = "Statistiken",
    ["total_reports"] = "Gesamt Reports",
    ["reports_by_status"] = "Reports nach Status",
    ["reports_by_category"] = "Reports nach Kategorie",
    ["reports_by_priority"] = "Reports nach Priorität",
    ["admin_leaderboard"] = "Admin Rangliste",
    ["recent_activity"] = "Letzte Aktivität (7 Tage)",
    ["avg_time"] = "Durchschn.",
    ["resolved"] = "gelöst",
    ["no_data"] = "Keine Daten verfügbar",

    -- Player Identifiers
    ["identifier_license"] = "Lizenz",
    ["identifier_steam"] = "Steam",
    ["identifier_discord"] = "Discord",
    ["identifier_fivem"] = "FiveM",
    ["copied"] = "Kopiert!",
    ["copy_hint"] = "Strg+C zum Kopieren",

    -- Inventory Management
    ["inventory"] = "Inventar",
    ["inventory_management"] = "Inventarverwaltung",
    ["inventory_items"] = "Gegenstände",
    ["inventory_empty"] = "Spielerinventar ist leer",
    ["inventory_loading"] = "Inventar wird geladen...",
    ["inventory_unavailable"] = "Inventarsystem nicht verfügbar",
    ["inventory_player_offline"] = "Inventar kann nicht angezeigt werden - Spieler ist offline",
    ["inventory_system"] = "Inventarsystem",
    ["inventory_refresh"] = "Aktualisieren",

    -- Inventory Item Actions
    ["item_add"] = "Item hinzufügen",
    ["item_remove"] = "Item entfernen",
    ["item_set_count"] = "Anzahl setzen",
    ["item_edit_metadata"] = "Metadata bearbeiten",
    ["item_name"] = "Item-Name",
    ["item_label"] = "Bezeichnung",
    ["item_count"] = "Anzahl",
    ["item_slot"] = "Slot",
    ["item_weight"] = "Gewicht",
    ["item_metadata"] = "Metadata",
    ["item_durability"] = "Haltbarkeit",
    ["item_serial"] = "Seriennummer",
    ["item_select"] = "Item auswählen",
    ["item_search"] = "Items suchen...",

    -- Inventory Action Results
    ["inventory_item_added"] = "%dx %s zum Spielerinventar hinzugefügt",
    ["inventory_item_removed"] = "%dx %s aus Spielerinventar entfernt",
    ["inventory_item_set"] = "%s Anzahl auf %d gesetzt",
    ["inventory_metadata_updated"] = "Metadata für %s aktualisiert",
    ["inventory_action_failed"] = "Inventaraktion fehlgeschlagen: %s",
    ["inventory_action_success"] = "Inventaraktion abgeschlossen",

    -- Inventory Action Log
    ["inventory_action_log"] = "Aktionsprotokoll",
    ["inventory_recent_actions"] = "Letzte Aktionen",
    ["inventory_no_actions"] = "Keine Aktionen vorhanden",

    -- Inventory Errors
    ["error_inventory_disabled"] = "Inventarverwaltung ist deaktiviert",
    ["error_invalid_item"] = "Ungültiger Item-Name",
    ["error_invalid_count"] = "Ungültige Anzahl",
    ["error_invalid_slot"] = "Ungültige Slotnummer",
    ["error_item_not_found"] = "Item nicht im Inventar gefunden",
    ["error_insufficient_items"] = "Spieler hat nicht genug Items",
    ["error_inventory_full"] = "Spielerinventar ist voll",
    ["error_metadata_not_supported"] = "Metadata-Bearbeitung wird von diesem Inventarsystem nicht unterstützt",
    ["error_max_item_count"] = "Maximal %d Items auf einmal möglich",

    -- Inventory Confirmation
    ["confirm_add_item"] = "%dx %s zu %s's Inventar hinzufügen?",
    ["confirm_remove_item"] = "%dx %s aus %s's Inventar entfernen?",
    ["confirm_set_item"] = "%s's %s Anzahl auf %d setzen?",

    -- Inventory System Messages
    ["action_add_item"] = "%s hat %dx %s zum Spielerinventar hinzugefügt",
    ["action_remove_item"] = "%s hat %dx %s aus dem Spielerinventar entfernt",
    ["action_set_item"] = "%s hat %s Anzahl des Spielers auf %d gesetzt",
    ["action_edit_metadata"] = "%s hat Metadata für %s bearbeitet",

    -- Inventory Discord
    ["discord_inventory_action"] = "Inventaraktion",
    ["discord_action_type"] = "Aktion",
    ["discord_item_details"] = "Item-Details",
    ["discord_count_change"] = "Anzahländerung"
}
