fx_version "cerulean"
game "gta5"
lua54 "yes"

author "SwisserDev"
description "Standalone Report System for FiveM"
version "1.0.6"

shared_scripts {
    "config/main.lua",
    "shared/enum.lua",
    "shared/class.lua",
    "shared/locale.lua",
    "shared/main.lua"
}

client_scripts {
    "client/main.lua",
    "client/module/**/*.lua"
}

server_scripts {
    "@oxmysql/lib/MySQL.lua",
    "server/main.lua",
    -- Inventory module: load adapters first, then factory, then main logic
    "server/module/inventory/adapters/*.lua",
    "server/module/inventory/adapter.lua",
    "server/module/inventory/discord.lua",
    "server/module/inventory/main.lua",
    -- Other modules
    "server/module/admin/*.lua",
    "server/module/chat/*.lua",
    "server/module/discord/*.lua",
    "server/module/history/*.lua",
    "server/module/notes/*.lua",
    "server/module/report/*.lua",
    "server/module/statistics/*.lua",
    "server/module/voice/*.lua",
    "server/module/admin/discord-screenshot.js",
    "server/module/voice/discord-upload.js"
}

ui_page "web/out/index.html"

files {
    "web/out/**/*",
    "locales/*.lua"
}

dependencies {
    "oxmysql"
}
