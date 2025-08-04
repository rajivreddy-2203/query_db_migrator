import mysql.connector

def map_mysql_dtype(dtype):
    dtype = dtype.lower()
    if 'int' in dtype:
        return 'INT'
    elif 'float' in dtype:
        return 'FLOAT'
    elif 'bool' in dtype:
        return 'BOOLEAN'
    elif 'datetime' in dtype or 'date' in dtype:
        return 'DATETIME'
    else:
        return 'VARCHAR(255)'

def insert_data(connection_details, df, table_name, type_mapping=None, create_table=False):
    """
    Insert a batch DataFrame to MySQL table, creating table if requested.
    type_mapping: dict of {col: mysql_type}
    create_table: if True, create the table using columns/types
    """
    conn = mysql.connector.connect(
        user=connection_details["user"],
        password=connection_details["password"],
        host=connection_details["host"],
        port=int(connection_details["port"]),
        database=connection_details["database"]
    )
    cursor = conn.cursor()
    try:
        # Create table if first batch and requested
        if create_table:
            columns_with_types = ', '.join(
                f'`{col}` {type_mapping.get(col, map_mysql_dtype(str(dtype)))}'
                if type_mapping else
                f'`{col}` {map_mysql_dtype(str(dtype))}'
                for col, dtype in zip(df.columns, df.dtypes)
            )
            create_stmt = f'CREATE TABLE IF NOT EXISTS `{table_name}` ({columns_with_types});'
            cursor.execute(create_stmt)
        # Insert data
        cols = ','.join(f'`{col}`' for col in df.columns)
        values_template = ','.join(['%s'] * len(df.columns))
        sql = f"INSERT INTO `{table_name}` ({cols}) VALUES ({values_template})"
        cursor.executemany(sql, df.values.tolist())
        conn.commit()
    finally:
        cursor.close()
        conn.close()
