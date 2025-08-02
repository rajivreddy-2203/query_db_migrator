from flask import Flask, render_template, request, jsonify
from db_router import get_all_connections, save_connection, delete_connection
from migrator import migrate_data
import time

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/manage-connections')
def manage_connections():
    return render_template('manage_connections.html')

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

@app.route('/api/migrate', methods=['POST'])
def api_migrate():
    data = request.json
    src_name = data['source']
    dst_name = data['destination']
    query = data['query']
    target_table = data['target_table']
    try:
        start_time=time.time()
        count = migrate_data(src_name, dst_name, query, target_table)
        end_time=time.time()
        elapsed=end_time-start_time
        return jsonify({"success": True, "rows": count, "elapsed":elapsed})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
