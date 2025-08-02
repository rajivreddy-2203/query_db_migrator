import psycopg2

def fetch_data(query, connection_details, batch_size=1000):
    conn = psycopg2.connect(
        dbname=connection_details["database"],
        user=connection_details["user"],
        password=connection_details["password"],
        host=connection_details["host"],
        port=connection_details["port"]
    )
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
