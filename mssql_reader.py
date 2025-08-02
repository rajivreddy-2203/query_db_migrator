import pyodbc

def fetch_data(query, connection_details, batch_size=1000):
    conn_str = (
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={connection_details['host']},{connection_details['port']};"
        f"DATABASE={connection_details['database']};"
        f"UID={connection_details['user']};"
        f"PWD={connection_details['password']};"
    )
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    cursor.execute(query)
    columns = [desc[0] for desc in cursor.description]
    while True:
        rows = cursor.fetchmany(batch_size)
        if not rows:
            break
        yield columns, rows
    cursor.close()
    conn.close()
