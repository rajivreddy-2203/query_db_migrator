import oracledb

def map_oracle_dtype(dtype):
    dtype = dtype.lower()
    if 'int' in dtype:
        return 'NUMBER'
    elif 'float' in dtype:
        return 'FLOAT'
    elif 'bool' in dtype:
        return 'NUMBER(1)'
    elif 'datetime' in dtype or 'date' in dtype:
        return 'DATE'
    else:
        return 'VARCHAR2(4000)'

def insert_data(connection_details, df, table_name, type_mapping=None, create_table=False):
    """
    Insert a batch DataFrame into Oracle table, creating table if requested.
    type_mapping: dict of {col: oracle_type}
    create_table: if True, (re-)create table using columns/types
    """
    conn = oracledb.connect(
        user=connection_details["user"],
        password=connection_details["password"],
        dsn=connection_details["dsn"]
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
