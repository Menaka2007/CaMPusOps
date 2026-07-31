from agents.base import BaseAgent
from typing import Dict, Any
import datetime

class LostFoundAgent(BaseAgent):
    def handle(self, query: str, context: Dict[str, Any]) -> str:
        q = query.lower()
        roll_no = context.get("roll_no", "717721L101")
        student_name = context.get("student_name", "Aravind Swamy")
        dept = context.get("dept", "CSE")
        
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        # 1. Report a new item
        # Example: "I lost my ID card in library", "found a blue water bottle"
        is_lost_report = "lost" in q or "missing" in q or "misplaced" in q
        is_found_report = "found" in q or "recovered" in q or "picked up" in q
        
        # If reporting lost or found
        if (is_lost_report or is_found_report) and ("in" in q or "at" in q or "near" in q or "key" in q or "card" in q or "phone" in q or "charger" in q or "bottle" in q or "bag" in q):
            status = "lost" if is_lost_report else "found"
            
            # Simple item parsing
            item_name = "College Item"
            for word in ["id card", "water bottle", "charger", "laptop", "keys", "phone", "bag", "calculator"]:
                if word in q:
                    item_name = word.title()
                    break
                    
            today = datetime.date.today().strftime("%Y-%m-%d")
            # Default phone number
            contact = "9876543210" if status == "lost" else "0422-262728 (Security Desk)"
            
            # Save reporter with all details: Name (Roll No, Dept)
            reporter_details = f"{student_name} ({roll_no}, {dept})"
            
            cursor.execute(
                "INSERT INTO lost_found (item_name, description, status, reported_by, contact, date) VALUES (?, ?, ?, ?, ?, ?)",
                (item_name, query, status, reporter_details, contact, today)
            )
            
            # Send notification to admin/bulletin board when any submission occurs
            notif_title = f"{status.title()} Item Alert: {item_name}"
            notif_content = (
                f"A new report has been filed for a {status} item:\n"
                f"- **Item**: {item_name}\n"
                f"- **Reporter Name**: {student_name}\n"
                f"- **Register Number/ID**: {roll_no}\n"
                f"- **Department**: {dept}\n"
                f"- **Details/Location**: \"{query}\"\n"
                f"- **Contact Number**: {contact}\n"
                f"Please take necessary actions."
            )
            sender_role = "student" if roll_no.startswith("7177") else "staff"
            cursor.execute(
                "INSERT INTO notifications (title, content, date, category, sender_name, sender_role) VALUES (?, ?, ?, ?, ?, ?)",
                (notif_title, notif_content, today, "lost_found", student_name, sender_role)
            )
            
            conn.commit()
            
            return (
                f"### 🎒 Lost & Found Item Logged!\n\n"
                f"Your report has been submitted to the Smart Campus Lost & Found Registry:\n"
                f"- **Item Category**: {item_name}\n"
                f"- **Type**: **{status.upper()}**\n"
                f"- **Details**: \"{query}\"\n"
                f"- **Reported By**: {reporter_details}\n"
                f"- **Contact Details**: {contact}\n"
                f"- **Date**: {today}\n\n"
                f"We will notify you if there's a match."
            )
            
        # 2. Search for items
        else:
            cursor.execute("SELECT item_name, description, status, reported_by, contact, date FROM lost_found ORDER BY date DESC")
            records = cursor.fetchall()
            if not records:
                return "No items registered in the Lost & Found database."
            
            res = "### 🎒 Campus Lost & Found Registry\n"
            for r in records:
                status_emoji = "🔍 Lost" if r['status'] == 'lost' else "🎁 Found"
                res += f"- **{status_emoji} - {r['item_name']}**: \"{r['description']}\" | Reported by: {r['reported_by']} ({r['date']}) | Contact: {r['contact']}\n"
            return res
