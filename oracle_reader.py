import oracledb

def fetch_data(query, connection_details, batch_size=1000):
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
    conn.close()
