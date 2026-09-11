"""Constants for the Smart Charger integration."""

DOMAIN = "smart_charger"

# Charging States
STATE_IDLE = "idle"
STATE_CHARGING = "charging"
STATE_COOLDOWN = "cooldown"
STATE_SLEEP = "sleep"
STATE_MANUAL_100 = "manual_100"
STATE_GENERIC = "generic"

# Configuration keys
CONF_CHARGERS = "chargers"
CONF_DEVICES = "devices"

CONF_SWITCH = "switch"
CONF_POWER = "power"
CONF_NAME = "name"

CONF_BATTERY_LEVEL = "battery_level"
CONF_BATTERY_STATE = "battery_state"
CONF_CHARGER_TYPE = "charger_type"
CONF_MIN_CHARGE = "min_charge"
CONF_MAX_CHARGE = "max_charge"
CONF_IS_WATCH = "is_watch"
CONF_EXCLUSIVE_SWITCH = "exclusive_switch"

# Defaults
DEFAULT_MIN_PHONE = 70.0
DEFAULT_MAX_PHONE = 90.0
DEFAULT_MIN_WATCH = 40.0
DEFAULT_MAX_WATCH = 75.0

# Thresholds
POWER_JUMP_THRESHOLD = 2.5      # Watts to detect something plugged in
POWER_IDLE_THRESHOLD = 1.5      # Watts to confirm device drawing power
POWER_DROPPED_THRESHOLD = 0.8   # Watts threshold below which device is considered unplugged
POWER_FRESHNESS_WINDOW = 120    # Seconds window to consider a device charging transition fresh

PROBE_COOLDOWN_MINUTES = 15     # Wait before first probe
PROBE_SLEEP_MINUTES = 30        # Wait between subsequent probes
PROBE_TEST_DURATION = 12        # Seconds socket is turned on during probe
IDENTIFICATION_DELAY = 15       # Seconds after power jump to check companion app
SAFETY_TIMEOUT_HOURS = 3        # Safety cutoff for manual 100% mode
