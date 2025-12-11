fx_version "cerulean"
game "gta5"
lua54 "yes"

author "SwisserDev"
description "Standalone Report System for FiveM"
version "1.0.2"

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
    "server/module/**/*.lua"
}

ui_page "web/out/index.html"

files {
    "web/out/**/*",
    "locales/*.lua"
}

dependencies {
    "oxmysql"
}
