from db_router import get_connection_by_name
import importlib
import pandas as pd

def migrate_data(source_conn_name, dest_conn_name, query, target_table):
    src = get_connection_by_name(source_conn_name)
    dst = get_connection_by_name(dest_conn_name)

    reader_mod = importlib.import_module(f"{src['type']}_reader")
    writer_mod = importlib.import_module(f"{dst['type']}_writer")

    all_rows = []
    columns = None
    # Fetch data from source, yielding (columns, rows)
    for cols, rows in reader_mod.fetch_data(query, src):
        if columns is None:
            columns = cols
        all_rows.extend(rows)

    # Data type transformation can be done here if you wish (optionally)
    df = pd.DataFrame(all_rows, columns=columns)
    writer_mod.insert_data(dst, df, target_table)
    return len(df)
