import mysql.connector

def map_mysql_dtype(dtype):
    if 'int' in dtype:
        return 'INT'
    elif 'float' in dtype:
        return 'FLOAT'
    elif 'bool' in dtype:
        return 'BOOLEAN'
    elif 'datetime' in dtype:
        return 'DATETIME'
    else:
        return 'VARCHAR(255)'

def insert_data(connection_details, df, table_name):
    conn = mysql.connector.connect(
        user=connection_details["user"],
        password=connection_details["password"],
        host=connection_details["host"],
        port=connection_details["port"],
        database=connection_details["database"]
    )
    cursor = conn.cursor()
    # 1. CREATE TABLE IF NOT EXISTS
    columns_with_types = ', '.join(
        f'`{col}` {map_mysql_dtype(str(dtype))}'
        for col, dtype in zip(df.columns, df.dtypes)
    )
    create_stmt = f'CREATE TABLE IF NOT EXISTS `{table_name}` ({columns_with_types});'
    cursor.execute(create_stmt)
    # 2. Insert data
    cols = ','.join(f'`{col}`' for col in df.columns)
    values_template = ','.join(['%s'] * len(df.columns))
    sql = f"INSERT INTO `{table_name}` ({cols}) VALUES ({values_template})"
    cursor.executemany(sql, df.values.tolist())
    conn.commit()
    cursor.close()
    conn.close()
