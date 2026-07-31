from agents.base import BaseAgent
from typing import Dict, Any
import datetime

class ComplaintAgent(BaseAgent):
    def handle(self, query: str, context: Dict[str, Any]) -> str:
        q = query.lower()
        roll_no = context.get("roll_no", "717721L101")
        
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        # Check if they want to file/register a complaint
        # Examples: "register complaint", "file complaint", "fan not working", "ac broken", "complaint about hostel"
        keywords = ["not working", "broken", "issue", "complaint", "repair", "fix", "missing", "faulty", "leak", "dirty"]
        is_submitting = any(k in q for k in keywords) and ("classroom" in q or "hostel" in q or "bus" in q or "fan" in q or "light" in q or "lab" in q or "maintenance" in q or "eee" in q or "ac" in q or "water" in q)
        
        if is_submitting:
            # Figure out category
            category = "Classroom Complaint"
            if "hostel" in q:
                category = "Hostel Complaint"
            elif "bus" in q:
                category = "Bus Complaint"
            elif "lab" in q:
                category = "Laboratory Complaint"
            elif "staff" in q:
                category = "Staff Complaint"
            elif "fan" in q or "light" in q or "ac" in q or "maintenance" in q:
                category = "Maintenance Complaint"
                
            # Log the new complaint in DB
            today = datetime.date.today().strftime("%Y-%m-%d")
            photo = context.get("photo", None)
            cursor.execute(
                "INSERT INTO complaints (roll_no, category, description, status, date, photo) VALUES (?, ?, ?, 'Pending', ?, ?)",
                (roll_no, category, query, today, photo)
            )
            conn.commit()
            
            # Fetch the ID
            cursor.execute("SELECT last_insert_rowid() as id")
            complaint_id = cursor.fetchone()["id"]
            
            return f"### 🛠️ Complaint Registered Successfully!\n\nYour complaint has been logged in the college database:\n- **Complaint ID**: #{complaint_id}\n- **Category**: {category}\n- **Description**: \"{query}\"\n- **Status**: **Pending**\n- **Date**: {today}\n\nOur maintenance team will address this shortly."
            
        # Or checking status
        elif "status" in q or "track" in q or "my complaints" in q or "list" in q:
            cursor.execute("SELECT id, category, description, status, date FROM complaints WHERE roll_no = ?", (roll_no,))
            records = cursor.fetchall()
            if not records:
                return "You have not registered any complaints yet."
            
            res = "### 📋 Your Registered Complaints & Status\n"
            for row in records:
                status_emoji = "⏳" if row["status"] == "Pending" else "⚙️" if row["status"] == "In Progress" else "✅"
                res += f"- **#{row['id']}** [{row['category']}]: \"{row['description']}\" | Status: **{status_emoji} {row['status']}** ({row['date']})\n"
            return res
            
        else:
            return "### 🛠️ Complaint Agent Help Desk\nI can help you file complaints and check their status. Here are things you can say:\n- *\"Fan not working in Room 302\"*\n- *\"Water leakage in Hostel Block C\"*\n- *\"Track my complaints\"*"
