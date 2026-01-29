import importlib
import pandas as pd
import time
import json
import os
from db_router import get_connection_by_name

# Persistent job/migration history log file
HISTORY_LOG = os.path.join(os.path.dirname(__file__), "config", "migration_history.json")

# Import get_batch_size from app to avoid circular imports
def get_batch_size():
    """Get batch size from config file directly"""
    import json
    import os
    config_path = os.path.join(os.path.dirname(__file__), "config", "db_connections.json")
    if os.path.exists(config_path):
        with open(config_path, "r") as f:
            config = json.load(f)
            return config.get("settings", {}).get("batch_size", 100000)
    return 100000

# ============== Helper: Migration History =============================
def append_history(entry):
    try:
        if os.path.exists(HISTORY_LOG):
            with open(HISTORY_LOG, "r") as f:
                data = json.load(f)
        else:
            data = []
        data.append(entry)
        with open(HISTORY_LOG, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error logging migration: {e}")

def get_history():
    if not os.path.exists(HISTORY_LOG):
        return []
    with open(HISTORY_LOG, "r") as f:
        return json.load(f)

# ============== Column/Type Preview for Mapping UI ====================
def get_column_info(source_conn_name, query, preview_rows=10):
    src = get_connection_by_name(source_conn_name)
    reader_mod = importlib.import_module(f"{src['type']}_reader")
    batch_size = get_batch_size()  # Use configured batch size
    for cols, rows in reader_mod.fetch_data(query, src, batch_size=batch_size):
        if not rows:
            raise Exception("Query returned no rows.")
        
        df = pd.DataFrame(rows, columns=cols)
        def to_sql_type(dtype):
            dtype = str(dtype)
            if 'int' in dtype:
                return 'INTEGER'
            elif 'float' in dtype:
                return 'FLOAT'
            elif 'bool' in dtype:
                return 'BOOLEAN'
            elif 'datetime' in dtype or 'date' in dtype:
                return 'DATE'
            else:
                return 'TEXT'
        coltypes = [to_sql_type(dt) for dt in df.dtypes]
        # Convert preview rows to list of lists for proper JSON serialization
        preview = [list(row) for row in rows[:preview_rows]]
        return cols, coltypes, preview
    raise Exception("No data or columns returned.")

# ============== MAIN: BATCH MIGRATION W/ PROGRESS BAR SUPPORT =========
def migrate_data(
    source_conn_name, dest_conn_name, query, target_table, job_id,
    type_mapping=None, jobs=None, schedule_id=None
):
    src = get_connection_by_name(source_conn_name)
    dst = get_connection_by_name(dest_conn_name)
    reader_mod = importlib.import_module(f"{src['type']}_reader")
    writer_mod = importlib.import_module(f"{dst['type']}_writer")

    start_time = time.time()
    total_rows = 0
    columns = None
    is_first = True
    batch_size = get_batch_size()  # Use configured batch size from settings

    for cols, rows in reader_mod.fetch_data(query, src, batch_size=batch_size):  # batch generator
        if columns is None:
            columns = cols
        if not rows:
            continue
        df = pd.DataFrame(rows, columns=columns)
        writer_mod.insert_data(
            dst, df, target_table,
            type_mapping=type_mapping,
            create_table=is_first
        )
        total_rows += len(df)
        is_first = False
        if jobs is not None and job_id in jobs:
            jobs[job_id]['progress'] = total_rows
            jobs[job_id]['rows'] = total_rows
            jobs[job_id]['step'] = "migrating"

    elapsed = time.time() - start_time
    append_history({
        "job_id": job_id,
        "timestamp": time.strftime('%Y-%m-%d %H:%M:%S'),
        "source": source_conn_name,
        "destination": dest_conn_name,
        "query": query,
        "target_table": target_table,
        "rows_migrated": total_rows,
        "duration_sec": elapsed,
        "schedule_id": schedule_id,
        "type_mapping": type_mapping
    })
    return total_rows

# ============== SCHEDULER HOOKS FOR BACKGROUND JOBS ====================
def schedule_background_job(data):
    # Hook for real scheduler integration (APScheduler/etc)
    return {"success": True, "job_id": "SCHEDULED_JOB_ID"}
