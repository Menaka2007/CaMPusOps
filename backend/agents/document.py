from agents.base import BaseAgent
from typing import Dict, Any
import datetime

class DocumentRequestAgent(BaseAgent):
    def handle(self, query: str, context: Dict[str, Any]) -> str:
        q = query.lower()
        roll_no = context.get("roll_no", "717721L101")
        
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        # Types of documents supported
        doc_types = {
            "bonafide": "Bonafide Certificate",
            "study": "Study Certificate",
            "transfer": "Transfer Certificate",
            "conduct": "Conduct Certificate",
            "hall ticket": "Hall Ticket",
            "no due": "No Due Certificate",
            "degree": "Degree Certificate",
            "id card": "ID Card Request"
        }
        
        # Check if requesting a document
        is_requesting = "request" in q or "need" in q or "apply" in q or "want" in q or "get" in q
        requested_type = None
        for key, val in doc_types.items():
            if key in q:
                requested_type = val
                break
                
        if is_requesting and requested_type:
            today = datetime.date.today().strftime("%Y-%m-%d")
            cursor.execute(
                "INSERT INTO documents (roll_no, type, status, requested_date) VALUES (?, ?, 'Submitted', ?)",
                (roll_no, requested_type, today)
            )
            conn.commit()
            
            cursor.execute("SELECT last_insert_rowid() as id")
            req_id = cursor.fetchone()["id"]
            
            return f"### 📄 Document Request Submitted\n\nYour request has been successfully recorded:\n- **Request ID**: #{req_id}\n- **Document**: {requested_type}\n- **Status**: **Submitted**\n- **Date**: {today}\n\nYou can track the processing status directly in this assistant."
            
        # Check document status
        elif "status" in q or "track" in q or "documents" in q or "my requests" in q:
            cursor.execute("SELECT id, type, status, requested_date FROM documents WHERE roll_no = ?", (roll_no,))
            records = cursor.fetchall()
            if not records:
                return "You have no active document requests."
            
            res = "### 📄 Your Document Requests\n"
            for row in records:
                status_emoji = "⏳" if row["status"] in ["Submitted", "Pending"] else "⚙️" if "Pending" in row["status"] else "✅"
                res += f"- **#{row['id']}** {row['type']}: Status: **{status_emoji} {row['status']}** (Requested: {row['requested_date']})\n"
            return res
            
        else:
            return "### 📄 Document Request Hub\nI can help you apply for documents or check your active requests. Examples:\n- *\"I need a Bonafide Certificate\"*\n- *\"Request a Hall Ticket\"*\n- *\"Check status of my certificates\"*"
