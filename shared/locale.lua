---@type table<string, table<string, string>>
Locales = {}

---@type table<string, string>
CurrentLocale = {}

---Load a locale file
---@param locale string Locale code (e.g., "en", "de")
local function loadLocale(locale)
    local localeFile = LoadResourceFile(GetCurrentResourceName(), ("locales/%s.lua"):format(locale))

    if not localeFile then
        print(("^1[sws-report] Locale file not found: %s^0"):format(locale))
        return false
    end

    local fn, err = load(localeFile)
    if not fn then
        print(("^1[sws-report] Error loading locale %s: %s^0"):format(locale, err))
        return false
    end

    local success, localeData = pcall(fn)
    if not success then
        print(("^1[sws-report] Error executing locale %s: %s^0"):format(locale, localeData))
        return false
    end

    Locales[locale] = localeData
    return true
end

---Initialize the locale system
function InitLocale()
    local defaultLocale = Config.Locale or "en"

    loadLocale("en")

    if defaultLocale ~= "en" then
        loadLocale(defaultLocale)
    end

    CurrentLocale = Locales[defaultLocale] or Locales["en"] or {}

    if Config.Debug then
        print(("^2[sws-report] Locale initialized: %s^0"):format(defaultLocale))
    end
end

---Get a translated string
---@param key string Translation key
---@param ... any Format arguments
---@return string
function Locale(key, ...)
    local str = CurrentLocale[key] or Locales["en"][key] or key

    if select("#", ...) > 0 then
        local success, result = pcall(string.format, str, ...)
        if success then
            return result
        end
    end

    return str
end

---Alias for Locale function
---@param key string Translation key
---@param ... any Format arguments
---@return string
function L(key, ...)
    return Locale(key, ...)
end
