import psycopg2
import psycopg2.extensions

def get_column_types(cursor_description):
    """
    Extract PostgreSQL column types from cursor description.
    Returns list of formatted type strings.
    """
    type_map = {
        16: 'BOOLEAN',
        17: 'BYTEA',
        20: 'BIGINT',
        21: 'SMALLINT',
        23: 'INTEGER',
        25: 'TEXT',
        700: 'REAL',
        701: 'DOUBLE PRECISION',
        1043: 'VARCHAR',
        1082: 'DATE',
        1083: 'TIME',
        1114: 'TIMESTAMP',
        1184: 'TIMESTAMP WITH TIME ZONE',
        1700: 'NUMERIC',
        2950: 'UUID',
        3802: 'JSONB',
        114: 'JSON'
    }
    
    types = []
    for desc in cursor_description:
        type_code = desc[1]
        size = desc[3] if len(desc) > 3 and desc[3] else None
        type_name = type_map.get(type_code, 'TEXT')
        
        # Add size for VARCHAR
        if type_code == 1043 and size and size > 0:
            types.append(f"VARCHAR({size - 4})")
        else:
            types.append(type_name)
    
    return types

def fetch_data(query, connection_details, batch_size=1000):
    """
    Yields (columns, rows) for each batch from PostgreSQL.
    Columns are only yielded on the first batch.
    """
    conn = None
    try:
        conn = psycopg2.connect(
            dbname=connection_details["database"],
            user=connection_details["user"],
            password=connection_details["password"],
            host=connection_details["host"],
            port=int(connection_details["port"])
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
        print(f"PostgreSQL fetch_data error: {e}")
        raise
    finally:
        if conn:
            conn.close()

def get_column_metadata(query, connection_details):
    """
    Get column names and their actual database types.
    Returns (columns, types) tuple.
    """
    conn = None
    try:
        conn = psycopg2.connect(
            dbname=connection_details["database"],
            user=connection_details["user"],
            password=connection_details["password"],
            host=connection_details["host"],
            port=int(connection_details["port"])
        )
        cursor = conn.cursor()
        cursor.execute(query)
        columns = [desc[0] for desc in cursor.description]
        types = get_column_types(cursor.description)
        cursor.fetchone()  # Fetch one row to ensure query executed
        return columns, types
    except Exception as e:
        print(f"PostgreSQL get_column_metadata error: {e}")
        raise
    finally:
        if conn:
            conn.close()
