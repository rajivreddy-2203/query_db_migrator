import oracledb

def get_column_types(cursor_description):
    """
    Extract Oracle column types from cursor description.
    Returns list of formatted type strings.
    """
    # Oracle type codes from oracledb
    type_map = {
        oracledb.DB_TYPE_VARCHAR: 'VARCHAR2',
        oracledb.DB_TYPE_NVARCHAR: 'NVARCHAR2',
        oracledb.DB_TYPE_CHAR: 'CHAR',
        oracledb.DB_TYPE_NCHAR: 'NCHAR',
        oracledb.DB_TYPE_NUMBER: 'NUMBER',
        oracledb.DB_TYPE_BINARY_FLOAT: 'BINARY_FLOAT',
        oracledb.DB_TYPE_BINARY_DOUBLE: 'BINARY_DOUBLE',
        oracledb.DB_TYPE_DATE: 'DATE',
        oracledb.DB_TYPE_TIMESTAMP: 'TIMESTAMP',
        oracledb.DB_TYPE_TIMESTAMP_TZ: 'TIMESTAMP WITH TIME ZONE',
        oracledb.DB_TYPE_CLOB: 'CLOB',
        oracledb.DB_TYPE_NCLOB: 'NCLOB',
        oracledb.DB_TYPE_BLOB: 'BLOB',
        oracledb.DB_TYPE_RAW: 'RAW',
        oracledb.DB_TYPE_LONG: 'LONG',
        oracledb.DB_TYPE_LONG_RAW: 'LONG RAW'
    }
    
    types = []
    for desc in cursor_description:
        type_code = desc[1]
        size = desc[2] if len(desc) > 2 else None
        precision = desc[4] if len(desc) > 4 else None
        scale = desc[5] if len(desc) > 5 else None
        
        type_name = type_map.get(type_code, 'UNKNOWN')
        
        # Format type with size/precision
        if type_name in ('VARCHAR2', 'NVARCHAR2', 'CHAR', 'NCHAR', 'RAW') and size:
            types.append(f"{type_name}({size})")
        elif type_name == 'NUMBER' and precision is not None:
            if scale and scale > 0:
                types.append(f"NUMBER({precision},{scale})")
            elif precision > 0:
                types.append(f"NUMBER({precision})")
            else:
                types.append('NUMBER')
        else:
            types.append(type_name)
    
    return types

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
            dsn=connection_details["dsn"],
            encoding="UTF-8",
            nencoding="UTF-8"
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

def get_column_metadata(query, connection_details):
    """
    Get column names and their actual database types.
    Returns (columns, types) tuple.
    """
    conn = None
    try:
        conn = oracledb.connect(
            user=connection_details["user"],
            password=connection_details["password"],
            dsn=connection_details["dsn"],
            encoding="UTF-8",
            nencoding="UTF-8"
        )
        cursor = conn.cursor()
        cursor.execute(query)
        columns = [desc[0] for desc in cursor.description]
        types = get_column_types(cursor.description)
        cursor.fetchone()  # Fetch one row to ensure query executed
        return columns, types
    except Exception as e:
        print(f"Oracle get_column_metadata error: {e}")
        raise
    finally:
        if conn:
            conn.close()
