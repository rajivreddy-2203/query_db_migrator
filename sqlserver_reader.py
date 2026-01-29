import pyodbc

def fetch_data(query, connection_details, batch_size=1000):
    """
    Yields (columns, rows) for each batch from SQL Server.
    Columns yielded on the first batch only.
    """
    conn = None
    try:
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
            # Convert pyodbc Row objects to tuples for proper pandas DataFrame handling
            rows_as_tuples = [tuple(row) for row in rows]
            yield columns, rows_as_tuples
    except Exception as e:
        print(f"SQL Server fetch_data error: {e}")
        raise
    finally:
        if conn:
            conn.close()
