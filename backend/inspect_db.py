import sys
from pathlib import Path
import sqlite3

# Add current directory to path
CURRENT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(CURRENT_DIR))

def inspect_database():
    # Connect to SQLite database
    db_path = CURRENT_DIR / "database" / "app.db"

    if not db_path.exists():
        print(f"Database not found at: {db_path}")
        return

    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()

    # Get all table names
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()

    print("=== DATABASE INSPECTION ===")
    print(f"Database: {db_path}")
    print(f"Tables found: {[table[0] for table in tables]}")
    print()

    # Inspect each table
    for table_name, in tables:
        print(f"=== TABLE: {table_name.upper()} ===")

        # Get table info
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        print("Columns:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]}) {'PRIMARY KEY' if col[5] else ''}")
        print()

        # Get row count
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"Total rows: {count}")

        if count > 0:
            # Show first 5 rows
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 5")
            rows = cursor.fetchall()

            print("Sample data (first 5 rows):")
            # Get column names
            cursor.execute(f"PRAGMA table_info({table_name})")
            col_names = [col[1] for col in cursor.fetchall()]

            for row in rows:
                row_data = {}
                for i, col_name in enumerate(col_names):
                    row_data[col_name] = row[i]
                print(f"  {row_data}")
        print("-" * 50)
        print()

    conn.close()

if __name__ == "__main__":
    inspect_database()