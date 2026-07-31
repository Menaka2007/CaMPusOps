import os
import sqlite3
import hashlib
import uuid

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "admin.db")

def init_admin_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password_hash TEXT,
        salt TEXT
    )
    """)
    conn.commit()
    return conn

def main():
    print("==========================================")
    print(" CampusOps Admin Initializer Setup ")
    print("==========================================")
    
    conn = init_admin_db()
    cursor = conn.cursor()
    
    # Check if admin already exists
    cursor.execute("SELECT COUNT(*) FROM admin")
    count = cursor.fetchone()[0]
    
    if count > 0:
        print("\n[ERROR] An administrator account already exists in admin.db.")
        print("Setup refused. You cannot create multiple admin accounts.\n")
        conn.close()
        return

    username = input("Enter Admin Username: ").strip()
    if not username:
        print("[ERROR] Username cannot be empty.")
        conn.close()
        return

    password = input("Enter Admin Password: ").strip()
    if not password:
        print("[ERROR] Password cannot be empty.")
        conn.close()
        return

    # Generate salt and hash password
    salt = uuid.uuid4().hex
    hashed = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

    try:
        cursor.execute(
            "INSERT INTO admin (username, password_hash, salt) VALUES (?, ?, ?)",
            (username, hashed, salt)
        )
        conn.commit()
        print(f"\n[SUCCESS] Admin account '{username}' successfully created!")
    except Exception as e:
        print(f"\n[ERROR] Failed to save admin: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
