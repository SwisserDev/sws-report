return {
    -- Général
    ["report_system"] = "Système de signalement",
    ["reports"] = "Signalements",
    ["report"] = "Signalement",
    ["close"] = "Fermer",
    ["cancel"] = "Annuler",
    ["confirm"] = "Confirmer",
    ["submit"] = "Envoyer",
    ["delete"] = "Supprimer",
    ["save"] = "Enregistrer",
    ["search"] = "Rechercher",
    ["filter"] = "Filtrer",
    ["all"] = "Tous",
    ["none"] = "Aucun",
    ["loading"] = "Chargement...",
    ["no_results"] = "Aucun résultat",

    -- Statut des signalements
    ["status_open"] = "Ouvert",
    ["status_claimed"] = "Pris en charge",
    ["status_resolved"] = "Résolu",

    -- Catégories de signalement
    ["category_general"] = "Général",
    ["category_bug"] = "Rapport de bug",
    ["category_player"] = "Signalement de joueur",
    ["category_question"] = "Question",
    ["category_other"] = "Autre",

    -- Créer un signalement
    ["create_report"] = "Créer un signalement",
    ["report_subject"] = "Sujet",
    ["report_subject_placeholder"] = "Résumé rapide de votre problème",
    ["report_category"] = "Catégorie",
    ["report_category_placeholder"] = "Sélectionner une catégorie",
    ["report_description"] = "Description",
    ["report_description_placeholder"] = "Donnez plus de détails sur votre problème...",
    ["report_created"] = "Signalement créé avec succès",
    ["report_creation_failed"] = "Échec de la création du signalement",

    -- Voir les signalements
    ["my_reports"] = "Mes signalements",
    ["active_reports"] = "Signalements actifs",
    ["resolved_reports"] = "Signalements résolus",
    ["no_reports"] = "Aucun signalement",
    ["no_active_reports"] = "Vous n’avez aucun signalement actif",
    ["report_details"] = "Détails du signalement",
    ["created_at"] = "Créé",
    ["updated_at"] = "Mis à jour",
    ["resolved_at"] = "Résolu",

    -- Actions sur un signalement
    ["claim_report"] = "Prendre en charge",
    ["unclaim_report"] = "Ne plus prendre en charge",
    ["resolve_report"] = "Résoudre",
    ["delete_report"] = "Supprimer le signalement",
    ["delete_report_confirm"] = "Êtes-vous sûr de vouloir supprimer ce signalement ?",
    ["report_claimed"] = "Signalement pris en charge",
    ["report_unclaimed"] = "Signalement non pris en charge",
    ["report_resolved"] = "Signalement résolu",
    ["report_deleted"] = "Signalement supprimé",

    -- Actions admin
    ["admin_actions"] = "Actions admin",
    ["teleport_to"] = "Se téléporter",
    ["bring_player"] = "Amener le joueur",
    ["heal_player"] = "Soigner",
    ["revive_player"] = "Réanimer",
    ["freeze_player"] = "Geler",
    ["spectate_player"] = "Observer",
    ["kick_player"] = "Expulser",
    ["ragdoll_player"] = "Ragdoll",
    ["screenshot_player"] = "Capture d’écran",
    ["teleported_to_player"] = "Téléporté vers le joueur",
    ["teleported_by_admin"] = "Vous avez été téléporté par un admin",
    ["player_brought"] = "Joueur amené",
    ["player_healed"] = "Joueur soigné",
    ["healed_by_admin"] = "Vous avez été soigné par un admin",
    ["player_revived"] = "Joueur réanimé",
    ["revived_by_admin"] = "Vous avez été réanimé par un admin",
    ["player_frozen"] = "Joueur gelé",
    ["player_unfrozen"] = "Joueur dégelé",
    ["you_were_frozen"] = "Vous avez été gelé par un admin",
    ["you_were_unfrozen"] = "Vous avez été dégelé",
    ["player_kicked"] = "Joueur expulsé",
    ["kicked_reason"] = "Vous avez été expulsé par un admin : %s",
    ["player_ragdolled"] = "Joueur mis en ragdoll",
    ["spectating_player"] = "Observation de %s",
    ["spectate_stopped"] = "Observation arrêtée",
    ["screenshot_requested"] = "Capture demandée",
    ["screenshot_received"] = "Capture reçue de %s",
    ["screenshot_unavailable"] = "Système de capture indisponible",
    ["screenshot_requires_discord"] = "La capture nécessite qu’un webhook Discord soit configuré",
    ["screenshot_upload_failed"] = "Échec de l’envoi de la capture sur Discord",
    ["screenshot_failed"] = "Échec de la capture d’écran",
    ["screenshot_uploaded"] = "Capture envoyée",
    ["take_screenshot"] = "Prendre une capture",
    ["player_offline"] = "Le joueur est hors ligne",

    -- Chat
    ["chat"] = "Chat",
    ["send_message"] = "Envoyer",
    ["type_message"] = "Écrire un message...",
    ["message_sent"] = "Message envoyé",
    ["new_message"] = "Nouveau message dans le signalement #%d",

    -- Panneau admin
    ["admin_panel"] = "Panneau admin",
    ["staff_overview"] = "Aperçu du staff",
    ["filter_by_status"] = "Filtrer par statut",
    ["filter_by_category"] = "Filtrer par catégorie",
    ["search_by_id"] = "Rechercher par ID",
    ["search_by_player"] = "Rechercher par joueur",
    ["claimed_by"] = "Pris en charge par",
    ["assigned_to"] = "Assigné à",
    ["no_one"] = "Personne",

    -- Notifications
    ["new_report"] = "Nouveau signalement",
    ["new_report_from"] = "Nouveau signalement de %s",
    ["report_updated"] = "Signalement mis à jour",
    ["report_status_changed"] = "Le statut du signalement #%d est passé à %s",

    -- Messages vocaux
    ["voice_message"] = "Message vocal",
    ["pause"] = "Pause",
    ["resume"] = "Reprendre",
    ["no_messages"] = "Aucun message pour le moment",
    ["error_voice_disabled"] = "Les messages vocaux sont désactivés",
    ["error_voice_too_long"] = "Le message vocal dépasse la durée maximale",
    ["error_voice_too_large"] = "Le fichier du message vocal est trop volumineux",
    ["error_voice_upload_failed"] = "Échec de l’envoi du message vocal",

    -- Erreurs
    ["error_generic"] = "Une erreur est survenue",
    ["error_cooldown"] = "Veuillez attendre %d secondes avant de créer un nouveau signalement",
    ["error_max_reports"] = "Vous avez atteint le nombre maximum de signalements actifs (%d)",
    ["error_invalid_category"] = "Catégorie sélectionnée invalide",
    ["error_subject_required"] = "Le sujet est obligatoire",
    ["error_subject_too_long"] = "Le sujet est trop long (max %d caractères)",
    ["error_description_too_long"] = "La description est trop longue (max %d caractères)",
    ["error_not_found"] = "Signalement introuvable",
    ["error_no_permission"] = "Vous n’avez pas la permission de faire ça",
    ["error_already_claimed"] = "Ce signalement est déjà pris en charge",
    ["error_not_claimed"] = "Ce signalement n’est pas pris en charge",
    ["error_cannot_delete"] = "Vous ne pouvez pas supprimer ce signalement",
    ["error_message_empty"] = "Le message ne peut pas être vide",

    -- Groupes d’actions
    ["teleport"] = "Téléportation",
    ["health"] = "Santé",
    ["moderation"] = "Modération",

    -- Thème
    ["theme"] = "Thème",
    ["theme_dark"] = "Sombre",
    ["theme_light"] = "Clair",

    -- Divers
    ["online"] = "En ligne",
    ["offline"] = "Hors ligne",
    ["player"] = "Joueur",
    ["admin"] = "Admin",
    ["priority"] = "Priorité",
    ["low"] = "Faible",
    ["normal"] = "Normale",
    ["high"] = "Élevée",
    ["urgent"] = "Urgente",

    -- Libellés de priorité
    ["priority_low"] = "Faible",
    ["priority_normal"] = "Normale",
    ["priority_high"] = "Élevée",
    ["priority_urgent"] = "Urgente",
    ["priority_updated"] = "Priorité mise à jour",

    -- Notes admin
    ["admin_notes"] = "Notes admin",
    ["player_notes"] = "Notes joueur",
    ["internal_only"] = "interne uniquement",
    ["no_notes"] = "Aucune note pour le moment",
    ["add_note_placeholder"] = "Ajouter une note...",
    ["add_player_note_placeholder"] = "Ajouter une note sur ce joueur...",
    ["note_added"] = "Note ajoutée",
    ["note_deleted"] = "Note supprimée",
    ["error_note_empty"] = "La note ne peut pas être vide",
    ["error_note_too_long"] = "La note est trop longue (max %d caractères)",

    -- Historique joueur
    ["report_history"] = "Historique des signalements",
    ["total_reports"] = "Total des signalements",
    ["open_reports"] = "Ouverts",
    ["resolved_reports"] = "Résolus",
    ["notes"] = "Notes",
    ["no_report_history"] = "Aucun historique de signalements",
    ["no_player_notes"] = "Aucune note pour ce joueur",
    ["view_player_info"] = "Voir les infos joueur",
    ["show_resolved"] = "Afficher les résolus",

    -- Messages système (actions admin)
    ["action_teleport_to"] = "%s s’est téléporté vers le joueur",
    ["action_bring_player"] = "%s a amené le joueur",
    ["action_heal_player"] = "%s a soigné le joueur",
    ["action_revive_player"] = "%s a réanimé le joueur",
    ["action_freeze_player"] = "%s a (dés)activé le gel sur le joueur",
    ["action_kick_player"] = "%s a expulsé le joueur",
    ["action_ragdoll_player"] = "%s a mis le joueur en ragdoll",
    ["action_spectate_player"] = "%s a commencé à observer le joueur",
    ["action_screenshot_player"] = "%s a pris une capture d’écran du joueur",

    -- Statistiques
    ["statistics"] = "Statistiques",
    ["total_reports"] = "Total des signalements",
    ["reports_by_status"] = "Signalements par statut",
    ["reports_by_category"] = "Signalements par catégorie",
    ["reports_by_priority"] = "Signalements par priorité",
    ["admin_leaderboard"] = "Classement des admins",
    ["recent_activity"] = "Activité récente (7 derniers jours)",
    ["avg_time"] = "Moy.",
    ["resolved"] = "résolus",
    ["no_data"] = "Aucune donnée disponible",

    -- Identifiants joueur
    ["identifier_license"] = "Licence",
    ["identifier_steam"] = "Steam",
    ["identifier_discord"] = "Discord",
    ["identifier_fivem"] = "FiveM",
    ["copied"] = "Copié !",
    ["copy_hint"] = "Ctrl+C pour copier",

    -- Gestion d'inventaire
    ["inventory"] = "Inventaire",
    ["inventory_management"] = "Gestion d'inventaire",
    ["inventory_items"] = "Objets",
    ["inventory_empty"] = "L'inventaire du joueur est vide",
    ["inventory_loading"] = "Chargement de l'inventaire...",
    ["inventory_unavailable"] = "Système d'inventaire non disponible",
    ["inventory_player_offline"] = "Impossible de voir l'inventaire - joueur hors ligne",
    ["inventory_system"] = "Système d'inventaire",
    ["inventory_refresh"] = "Actualiser",

    -- Actions sur les objets
    ["item_add"] = "Ajouter un objet",
    ["item_remove"] = "Retirer un objet",
    ["item_set_count"] = "Définir la quantité",
    ["item_edit_metadata"] = "Modifier les métadonnées",
    ["item_name"] = "Nom de l'objet",
    ["item_label"] = "Libellé",
    ["item_count"] = "Quantité",
    ["item_slot"] = "Emplacement",
    ["item_weight"] = "Poids",
    ["item_metadata"] = "Métadonnées",
    ["item_durability"] = "Durabilité",
    ["item_serial"] = "Numéro de série",
    ["item_select"] = "Sélectionner un objet",
    ["item_search"] = "Rechercher des objets...",

    -- Résultats des actions d'inventaire
    ["inventory_item_added"] = "%dx %s ajouté à l'inventaire du joueur",
    ["inventory_item_removed"] = "%dx %s retiré de l'inventaire du joueur",
    ["inventory_item_set"] = "Quantité de %s définie à %d",
    ["inventory_metadata_updated"] = "Métadonnées de %s mises à jour",
    ["inventory_action_failed"] = "Action d'inventaire échouée : %s",
    ["inventory_action_success"] = "Action d'inventaire terminée",

    -- Journal des actions d'inventaire
    ["inventory_action_log"] = "Journal des actions",
    ["inventory_recent_actions"] = "Actions récentes",
    ["inventory_no_actions"] = "Aucune action récente",

    -- Erreurs d'inventaire
    ["error_inventory_disabled"] = "La gestion d'inventaire est désactivée",
    ["error_invalid_item"] = "Nom d'objet invalide",
    ["error_invalid_count"] = "Quantité invalide",
    ["error_invalid_slot"] = "Numéro d'emplacement invalide",
    ["error_item_not_found"] = "Objet non trouvé dans l'inventaire",
    ["error_insufficient_items"] = "Le joueur n'a pas assez d'objets",
    ["error_inventory_full"] = "L'inventaire du joueur est plein",
    ["error_metadata_not_supported"] = "La modification des métadonnées n'est pas prise en charge par ce système d'inventaire",
    ["error_max_item_count"] = "Impossible d'ajouter plus de %d objets à la fois",

    -- Confirmation d'inventaire
    ["confirm_add_item"] = "Ajouter %dx %s à l'inventaire de %s ?",
    ["confirm_remove_item"] = "Retirer %dx %s de l'inventaire de %s ?",
    ["confirm_set_item"] = "Définir la quantité de %s de %s à %d ?",

    -- Messages système d'inventaire
    ["action_add_item"] = "%s a ajouté %dx %s à l'inventaire du joueur",
    ["action_remove_item"] = "%s a retiré %dx %s de l'inventaire du joueur",
    ["action_set_item"] = "%s a défini la quantité de %s du joueur à %d",
    ["action_edit_metadata"] = "%s a modifié les métadonnées de %s",

    -- Inventaire Discord
    ["discord_inventory_action"] = "Action d'inventaire",
    ["discord_action_type"] = "Action",
    ["discord_item_details"] = "Détails de l'objet",
    ["discord_count_change"] = "Changement de quantité"
}
