from flask import Flask, render_template, request, jsonify
from db_router import get_all_connections, save_connection, delete_connection
from migrator import (
    migrate_data,
    get_column_info,
    get_history,
)
import threading
import time
import uuid
import os
import json
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.base import JobLookupError
from datetime import datetime, timedelta

app = Flask(__name__)

jobs = {}

# === CONFIGURATION PATHS ===
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "config", "db_connections.json")
SCHEDULES_PATH = os.path.join(os.path.dirname(__file__), "config", "schedules.json")
DEFAULT_SETTINGS = {"batch_size": 100000}

# === SCHEDULE MANAGEMENT ===
def load_schedules():
    """Load schedules from config file"""
    if not os.path.exists(SCHEDULES_PATH):
        return []
    try:
        with open(SCHEDULES_PATH, "r") as f:
            schedules = json.load(f)
            return schedules if isinstance(schedules, list) else []
    except Exception:
        return []

def save_schedules(schedules):
    """Save schedules to config file"""
    os.makedirs(os.path.dirname(SCHEDULES_PATH), exist_ok=True)
    with open(SCHEDULES_PATH, "w") as f:
        json.dump(schedules, f, indent=4)

def get_schedules():
    """Get all scheduled jobs from persistent storage"""
    return load_schedules()

def add_schedule(sched):
    """Add a schedule to persistent storage"""
    schedules = load_schedules()
    schedules.append(sched)
    save_schedules(schedules)

def remove_schedule(job_id):
    """Remove a schedule from persistent storage"""
    schedules = load_schedules()
    schedules = [j for j in schedules if j.get('job_id') != job_id]
    save_schedules(schedules)
    return True

def get_config():
    """Get the entire configuration including connections and settings"""
    if not os.path.exists(CONFIG_PATH):
        return {
            "oracle": {},
            "postgresql": {},
            "mysql": {},
            "sqlserver": {},
            "settings": DEFAULT_SETTINGS.copy()
        }
    
    with open(CONFIG_PATH, "r") as f:
        config = json.load(f)
    
    # Ensure settings exist with defaults
    if "settings" not in config:
        config["settings"] = DEFAULT_SETTINGS.copy()
    else:
        # Merge with defaults to ensure all settings exist
        for key, value in DEFAULT_SETTINGS.items():
            if key not in config["settings"]:
                config["settings"][key] = value
    
    return config

def save_config(config):
    """Save the entire configuration"""
    with open(CONFIG_PATH, "w") as f:
        json.dump(config, f, indent=4)

def get_settings():
    """Get application settings"""
    config = get_config()
    return config.get("settings", DEFAULT_SETTINGS.copy())

def update_settings(settings_updates):
    """Update specific settings"""
    config = get_config()
    if "settings" not in config:
        config["settings"] = DEFAULT_SETTINGS.copy()
    
    config["settings"].update(settings_updates)
    save_config(config)
    return config["settings"]

def get_batch_size():
    """Get the configured batch size for data migration"""
    settings = get_settings()
    return settings.get("batch_size", DEFAULT_SETTINGS["batch_size"])

def set_batch_size(batch_size):
    """Set the batch size for data migration"""
    try:
        batch_size = int(batch_size)
        if batch_size <= 0:
            raise ValueError("Batch size must be positive")
        
        return update_settings({"batch_size": batch_size})
    except (ValueError, TypeError) as e:
        raise ValueError(f"Invalid batch size: {e}")

# === INITIALIZE CONFIG FILES ON STARTUP ===
def initialize_config():
    """Ensure config folder and all required files exist with default settings"""
    from cryptography.fernet import Fernet
    
    config_dir = os.path.join(os.path.dirname(__file__), "config")
    
    # Create config directory if it doesn't exist
    if not os.path.exists(config_dir):
        os.makedirs(config_dir)
        print(f"✓ Created config directory: {config_dir}")
    
    # Define all required config files with their default content
    config_files = {
        "db_connections.json": {
            "oracle": {},
            "postgresql": {},
            "mysql": {},
            "sqlserver": {},
            "settings": {
                "batch_size": 100000
            }
        },
        "migration_history.json": [],
        "schedules.json": []
    }
    
    # Initialize each config file if missing or empty
    for filename, default_content in config_files.items():
        file_path = os.path.join(config_dir, filename)
        
        if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
            with open(file_path, "w") as f:
                json.dump(default_content, f, indent=4)
            print(f"✓ Initialized {filename}")
        else:
            # Special handling for db_connections.json to ensure settings exist
            if filename == "db_connections.json":
                try:
                    with open(file_path, "r") as f:
                        config = json.load(f)
                    
                    if "settings" not in config or "batch_size" not in config.get("settings", {}):
                        if "settings" not in config:
                            config["settings"] = {}
                        config["settings"]["batch_size"] = 100000
                        
                        with open(file_path, "w") as f:
                            json.dump(config, f, indent=4)
                        print(f"✓ Added default settings to {filename}")
                except Exception as e:
                    print(f"⚠ Warning: Could not verify {filename}: {e}")
    
    # Initialize encryption key file
    encryption_key_path = os.path.join(config_dir, ".encryption_key")
    if not os.path.exists(encryption_key_path):
        try:
            key = Fernet.generate_key()
            with open(encryption_key_path, "wb") as f:
                f.write(key)
            print(f"✓ Generated encryption key: .encryption_key")
        except Exception as e:
            print(f"⚠ Warning: Could not create encryption key: {e}")

# Initialize config when module loads
initialize_config()

# === APSCHEDULER BACKGROUND SCHEDULER ===
scheduler = BackgroundScheduler()
scheduler.start()

def run_scheduled_migration(job):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        'status': 'running',
        'progress': 0,
        'rows': 0,
        'error': None,
        'started': time.time(),
        'step': 'scheduled_start'
    }
    def run():
        try:
            count = migrate_data(
                job['source'], job['destination'], job['query'], job['target_table'], job_id,
                type_mapping=job.get('type_mapping'), jobs=jobs, schedule_id=job.get('job_id')
            )
            jobs[job_id]['status'] = 'finished'
            jobs[job_id]['rows'] = count
            jobs[job_id]['step'] = 'finished'
            jobs[job_id]['ended'] = time.time()
        except Exception as e:
            jobs[job_id]['status'] = 'failed'
            jobs[job_id]['error'] = str(e)
            jobs[job_id]['step'] = 'failed'
            jobs[job_id]['ended'] = time.time()
        # REMOVE from persistent storage and APScheduler after run (run once)
        try:
            remove_schedule(job.get('job_id'))
            remove_apscheduler_job(job.get('job_id'))
        except Exception:
            pass
    threading.Thread(target=run).start()

def add_apscheduler_job(sched):
    try:
        scheduler.remove_job(sched['job_id'])
    except JobLookupError:
        pass
    # Parse hour, minute from "HH:MM"
    now = datetime.now()
    hour, minute = map(int, sched['schedule_time'].split(':'))
    run_at = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if run_at <= now:
        run_at += timedelta(days=1)
    scheduler.add_job(
        func=run_scheduled_migration,
        trigger='date',
        run_date=run_at,
        args=[sched],
        id=sched['job_id'],
        replace_existing=True
    )

def remove_apscheduler_job(job_id):
    try:
        scheduler.remove_job(job_id)
    except JobLookupError:
        pass

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/manage-connections')
def manage_connections():
    return render_template('manage_connections.html')

@app.route('/schedules')
def schedules_page():
    return render_template('schedules.html')

@app.route('/api/connections', methods=['GET', 'POST', 'DELETE'])
def api_connections():
    if request.method == 'GET':
        return jsonify(get_all_connections())
    elif request.method == 'POST':
        data = request.json
        save_connection(data['name'], data['db_type'], data['details'])
        return jsonify({"success": True})
    elif request.method == 'DELETE':
        name = request.args.get('name')
        delete_connection(name)
        return jsonify({"success": True})

@app.route('/api/columns', methods=['POST'])
def api_columns():
    data = request.json
    src_name = data['source']
    query = data['query']
    try:
        colnames, coltypes, preview = get_column_info(src_name, query)
        return jsonify({"success": True, "columns": colnames, "types": coltypes, "preview": preview})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/migrate', methods=['POST'])
def api_migrate():
    data = request.json
    src_name = data['source']
    dst_name = data['destination']
    query = data['query']
    target_table = data['target_table']
    type_mapping = data.get('type_mapping', None)

    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        'status': 'running',
        'progress': 0,
        'rows': 0,
        'error': None,
        'started': time.time(),
        'step': 'starting'
    }
    def run_migration():
        try:
            count = migrate_data(
                src_name, dst_name, query, target_table, job_id,
                type_mapping=type_mapping, jobs=jobs
            )
            jobs[job_id]['status'] = 'finished'
            jobs[job_id]['rows'] = count
            jobs[job_id]['step'] = 'finished'
            jobs[job_id]['ended'] = time.time()
        except Exception as e:
            jobs[job_id]['status'] = 'failed'
            jobs[job_id]['error'] = str(e)
            jobs[job_id]['step'] = 'failed'
            jobs[job_id]['ended'] = time.time()
    threading.Thread(target=run_migration).start()
    return jsonify({"job_id": job_id})

@app.route('/api/migration_status')
def api_migration_status():
    job_id = request.args.get('job_id')
    return jsonify(jobs.get(job_id, {}))

@app.route('/api/history', methods=['GET'])
def api_history():
    return jsonify(get_history())

@app.route('/migration-history')
def migration_history_page():
    return render_template('migration_history.html')

history_storage_path = os.path.join(os.path.dirname(__file__), "config", "migration_history.json")

@app.route('/api/history', methods=['DELETE'])
def clear_history():
    try:
        # If you store history in a JSON file:
        with open(history_storage_path, "w") as f:
            f.write("[]")  # Empty list
        # If in database, truncate/clear the relevant table here
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/schedule', methods=['POST', 'GET', 'DELETE'])
def api_schedule():
    if request.method == 'POST':
        data = request.json
        job_id = str(uuid.uuid4())
        sched = dict(data)
        sched['job_id'] = job_id
        add_schedule(sched)
        add_apscheduler_job(sched)
        return jsonify({"success": True, "job_id": job_id})
    elif request.method == 'GET':
        return jsonify({"jobs": get_schedules()})
    elif request.method == 'DELETE':
        job_id = request.args.get('job_id')
        removed = remove_schedule(job_id)
        remove_apscheduler_job(job_id)
        return jsonify({"success": removed})

@app.route('/api/settings', methods=['GET', 'POST'])
def api_settings():
    """Get or update application settings including batch size"""
    if request.method == 'GET':
        return jsonify({"success": True, "settings": get_settings()})
    elif request.method == 'POST':
        try:
            data = request.json
            # Update settings
            if 'batch_size' in data:
                set_batch_size(data['batch_size'])
            else:
                update_settings(data)
            return jsonify({"success": True, "settings": get_settings()})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 400

if __name__ == '__main__':
    # On app start, schedule any jobs from persistent storage
    for sched in get_schedules():
        add_apscheduler_job(sched)
    app.run(debug=True)
