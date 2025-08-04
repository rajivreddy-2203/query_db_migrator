import oracledb

def fetch_data(query, connection_details, batch_size=1000):
    """
    Yields (columns, rows) for each batch from Oracle.
    Columns are yielded only on the first batch.
    """
    conn = None
    try:
        conn = oracledb.connect(
            user=connection_details["user"],
            password=connection_details["password"],
            dsn=connection_details["dsn"]
        )
        cursor = conn.cursor()
        cursor.execute(query)
        columns = [desc[0] for desc in cursor.description]
        while True:
            rows = cursor.fetchmany(batch_size)
            if not rows:
                break
            yield columns, rows
    except Exception as e:
        print(f"Oracle fetch_data error: {e}")
        raise
    finally:
        if conn:
            conn.close()
