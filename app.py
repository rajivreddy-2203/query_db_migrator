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
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.base import JobLookupError
from datetime import datetime, timedelta

app = Flask(__name__)

jobs = {}
scheduled_jobs = []

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
        # REMOVE from job list and APScheduler after run (run once)
        try:
            scheduled_jobs[:] = [j for j in scheduled_jobs if j['job_id'] != job.get('job_id')]
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
        scheduled_jobs.append(sched)
        add_apscheduler_job(sched)
        return jsonify({"success": True, "job_id": job_id})
    elif request.method == 'GET':
        return jsonify({"jobs": scheduled_jobs})
    elif request.method == 'DELETE':
        job_id = request.args.get('job_id')
        removed = False
        for j in list(scheduled_jobs):
            if j.get('job_id') == job_id:
                scheduled_jobs.remove(j)
                removed = True
        remove_apscheduler_job(job_id)
        return jsonify({"success": removed})

if __name__ == '__main__':
    # On app start, schedule any jobs already present (this only matters if you add persistence)
    for sched in scheduled_jobs:
        add_apscheduler_job(sched)
    app.run(debug=True)
