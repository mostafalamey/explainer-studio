"""Validate saved selector choices and resolve the production contract (no network calls)."""
import copy

FORMATS = {"16:9": (1920, 1080, 1280, 720), "9:16": (1080, 1920, 720, 1280), "1:1": (1080, 1080, 720, 720)}

def settings(value=None, narration=True):
    v = {} if value is None else value
    if not isinstance(v, dict): raise ValueError("Settings must be an object")
    ratio = v.get("aspectRatio", "16:9")
    if ratio not in FORMATS: raise ValueError("Choose 16:9, 9:16 or 1:1")
    production = v.get("audioProduction", "elevenlabs")
    if production not in ("elevenlabs", "google-ai-studio"): raise ValueError("Invalid audio creation workflow")
    result = {"aspectRatio": ratio}
    for name, default in [("narration", narration), ("music", False), ("soundEffects", True)]:
        item = v.get(name, {})
        if not isinstance(item, dict): raise ValueError(name + " must be an object")
        enabled = item.get("enabled", default)
        if type(enabled) is not bool: raise ValueError(name + ".enabled must be a boolean")
        result[name] = {"enabled": enabled}
        if name in ("narration", "music"):
            provider = item.get("provider", production)
            if provider not in ("elevenlabs", "google-ai-studio", "auto", "user-created"): raise ValueError("Invalid " + name + " source")
            mode = item.get("mode", "user-created" if provider in ("google-ai-studio", "user-created") else "automatic")
            if mode not in ("automatic", "user-created"): raise ValueError("Invalid " + name + " mode")
            service = item.get("service", "ElevenLabs" if ("provider" in item or "audioProduction" in v) and provider=="elevenlabs" else "auto")
            if not isinstance(service,str) or not service.strip() or len(service)>120 or any(ord(c)<32 for c in service):raise ValueError("Invalid " + name + " service")
            result[name].update(mode=mode,service=service.strip(),provider=(provider if provider in ("elevenlabs","google-ai-studio") and ("provider" in item or "audioProduction" in v) and "mode" not in item else "auto" if mode=="automatic" else "user-created"))
    for field, default in [("language", "English"), ("voice", "Auto — suit the story")]:
        text = v.get("narration", {}).get(field, default)
        if not isinstance(text, str) or not text.strip() or len(text) > 200: raise ValueError("Invalid narration " + field)
        result["narration"][field] = text.strip()
    mood = v.get("music", {}).get("mood", "calm")
    if mood not in ("calm", "upbeat", "cinematic"): raise ValueError("Invalid music mood")
    result["music"].update(mood=mood, instrumental=True)
    return result

def normalize_choice(value, catalog):
    if not isinstance(value, dict) or type(value.get("schemaVersion", 1)) is not int or value.get("schemaVersion", 1) not in (1, 2): raise ValueError("Unsupported choice file")
    style = value.get("style")
    if style == "cosmic-star-chart" and "vintage-newsprint" in catalog: style = "vintage-newsprint"
    if style not in catalog: raise ValueError("Unknown style in saved choice")
    return {"schemaVersion": 2, "style": style, "settings": settings(value.get("settings"))}

def resolve(project, choice=None, catalog=None):
    p = copy.deepcopy(project)
    if choice is not None:
        c = normalize_choice(choice, catalog)
        p["style"] = c["style"]
        p["settings"] = c["settings"]
        p["width"], p["height"] = FORMATS[c["settings"]["aspectRatio"]][:2]
    else:
        ratio = next((k for k, dims in FORMATS.items() if abs(p.get("width",1920)/p.get("height",1080)-dims[0]/dims[1]) < .001), None)
        if ratio is None: raise ValueError("Unsupported aspect ratio")
        raw = p.get("settings", {"aspectRatio": ratio})
        p["settings"] = settings(raw, narration=bool(p.get("audio")))
    ratio = p["settings"]["aspectRatio"]
    w,h,lw,lh = FORMATS[ratio]
    p.setdefault("width", w); p.setdefault("height", h)
    if abs(p["width"]/p["height"]-w/h) > .001: raise ValueError("Dimensions conflict with selected aspect ratio")
    p["logicalWidth"], p["logicalHeight"] = lw, lh
    return p
