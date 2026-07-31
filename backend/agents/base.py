import sqlite3
from typing import Dict, Any

class BaseAgent:
    def __init__(self, db_path: str):
        self.db_path = db_path

    def get_db_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def handle(self, query: str, context: Dict[str, Any]) -> str:
        raise NotImplementedError("Each specialist agent must implement the handle method.")
