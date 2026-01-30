import oracledb

def map_oracle_dtype(dtype):
    """Map pandas dtype to Oracle-specific data types"""
    dtype = dtype.lower()
    if 'int64' in dtype:
        return 'NUMBER(19)'  # 64-bit int
    elif 'int32' in dtype:
        return 'NUMBER(10)'  # 32-bit int
    elif 'int16' in dtype:
        return 'NUMBER(5)'   # 16-bit int
    elif 'int8' in dtype:
        return 'NUMBER(3)'   # 8-bit int
    elif 'int' in dtype:
        return 'NUMBER(19)'
    elif 'float64' in dtype:
        return 'BINARY_DOUBLE'  # 64-bit floating point
    elif 'float32' in dtype:
        return 'BINARY_FLOAT'   # 32-bit floating point
    elif 'float' in dtype:
        return 'BINARY_DOUBLE'
    elif 'bool' in dtype:
        return 'NUMBER(1)'
    elif 'datetime64' in dtype:
        return 'TIMESTAMP'  # More precise than DATE
    elif 'datetime' in dtype:
        return 'TIMESTAMP'
    elif 'date' in dtype:
        return 'DATE'
    elif 'time' in dtype:
        return 'TIMESTAMP'
    elif 'object' in dtype:
        return 'CLOB'  # Use CLOB for large text objects
    else:
        return 'CLOB'

def insert_data(connection_details, df, table_name, type_mapping=None, create_table=False):
    """
    Insert a batch DataFrame into Oracle table, creating table if requested.
    type_mapping: dict of {col: oracle_type}
    create_table: if True, (re-)create table using columns/types
    """
    conn = oracledb.connect(
        user=connection_details["user"],
        password=connection_details["password"],
        dsn=connection_details["dsn"],
        encoding="UTF-8",
        nencoding="UTF-8"
    )
    cursor = conn.cursor()
    try:
        if create_table:
            columns_with_types = ', '.join(
                f'"{col}" {map_oracle_dtype(type_mapping.get(col, str(dtype)))}'
                for col, dtype in zip(df.columns, df.dtypes)
            )

            sql_create = f'CREATE TABLE "{table_name}" ({columns_with_types})'
            try:
                cursor.execute(sql_create)
            except oracledb.DatabaseError as e:
                error_obj, = e.args
                # ORA-00955: name is already used by an existing object
                if error_obj.code != 955:
                    raise
        # Insert rows
        cols = ','.join(f'"{col}"' for col in df.columns)
        placeholder = ",".join(f":{i+1}" for i in range(len(df.columns)))
        sql_insert = f'INSERT INTO "{table_name}" ({cols}) VALUES ({placeholder})'
        cursor.executemany(sql_insert, df.values.tolist())
        conn.commit()
    finally:
        cursor.close()
        conn.close()
