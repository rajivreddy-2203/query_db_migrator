import json
import os

CONNECTIONS_PATH = os.path.join(os.path.dirname(__file__), "config", "db_connections.json")

def get_all_connections():
    if not os.path.exists(CONNECTIONS_PATH):
        return {"oracle": {}, "postgresql": {}, "mysql": {}, "sqlserver": {}}
    with open(CONNECTIONS_PATH, "r") as f:
        return json.load(f)

def save_connection(name, db_type, details):
    all_conns = get_all_connections()
    if db_type not in all_conns:
        all_conns[db_type] = {}
    all_conns[db_type][name] = details
    with open(CONNECTIONS_PATH, "w") as f:
        json.dump(all_conns, f, indent=4)

def delete_connection(name):
    all_conns = get_all_connections()
    modified = False
    for db_type in all_conns:
        if name in all_conns[db_type]:
            del all_conns[db_type][name]
            modified = True
    if modified:
        with open(CONNECTIONS_PATH, "w") as f:
            json.dump(all_conns, f, indent=4)

def get_connection_by_name(name):
    all_conns = get_all_connections()
    for db_type, dbs in all_conns.items():
        if name in dbs:
            db_details = dbs[name].copy()
            db_details["type"] = db_type
            return db_details
    raise Exception("No such connection: %s" % name)
