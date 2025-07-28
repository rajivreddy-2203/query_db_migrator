from flask import Flask, render_template, request, flash
from migrator import migrate_query_result
from db_config import ORACLE_DBS, get_pg_connection

app = Flask(__name__)
app.secret_key = "your_secret_key_here"  # Change this in production

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        oracle_db_key = request.form.get("oracle_db")
        query = request.form.get("query")
        pg_table = request.form.get("pg_table")

        try:
            pg_conn = get_pg_connection()
            result = migrate_query_result(oracle_db_key, query, pg_table, pg_conn)
            flash(f"✅ Migration complete: {result['rows_migrated']} rows inserted into '{pg_table}'", "success")
        except Exception as e:
            flash(f"❌ Error: {str(e)}", "danger")

    return render_template("index.html", oracle_dbs=ORACLE_DBS.keys())
