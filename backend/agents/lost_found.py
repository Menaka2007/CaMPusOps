from agents.base import BaseAgent
from typing import Dict, Any
import datetime
import re

class LostFoundAgent(BaseAgent):
    def calculate_ai_similarity(self, desc1: str, desc2: str) -> float:
        """
        AI Similarity Matcher based on token overlap & key attribute alignment.
        Returns confidence score from 0.0 to 1.0 (0% to 100%).
        """
        words1 = set(re.findall(r'\w+', desc1.lower()))
        words2 = set(re.findall(r'\w+', desc2.lower()))
        
        # Stop words filter
        stop_words = {"i", "in", "at", "the", "a", "an", "of", "and", "my", "found", "lost", "is", "was", "near", "by"}
        w1 = words1 - stop_words
        w2 = words2 - stop_words
        
        if not w1 or not w2:
            return 0.0
            
        intersection = w1.intersection(w2)
        union = w1.union(w2)
        
        jaccard_score = len(intersection) / len(union) if union else 0.0
        
        # Bonus weight for exact item category match (e.g. "id card", "water bottle", "keys", "phone")
        key_items = ["id card", "water bottle", "charger", "laptop", "keys", "phone", "bag", "calculator", "watch"]
        for k in key_items:
            if k in desc1.lower() and k in desc2.lower():
                jaccard_score += 0.45
                break

        return min(round(jaccard_score, 2), 0.99)

    def handle(self, query: str, context: Dict[str, Any]) -> str:
        q = query.lower()
        roll_no = context.get("roll_no", "717721L101")
        student_name = context.get("student_name", "Aravind Swamy")
        dept = context.get("dept", "CSE")
        
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        is_lost_report = "lost" in q or "missing" in q or "misplaced" in q
        is_found_report = "found" in q or "recovered" in q or "picked up" in q
        
        # 1. Reporting a Lost or Found item
        if (is_lost_report or is_found_report) and ("in" in q or "at" in q or "near" in q or "key" in q or "card" in q or "phone" in q or "charger" in q or "bottle" in q or "bag" in q):
            status = "lost" if is_lost_report else "found"
            opposite_status = "found" if status == "lost" else "lost"
            
            # Extract item category
            item_name = "College Item"
            for word in ["id card", "water bottle", "charger", "laptop", "keys", "phone", "bag", "calculator"]:
                if word in q:
                    item_name = word.title()
                    break
                    
            today = datetime.date.today().strftime("%Y-%m-%d")
            contact = "9876543210" if status == "lost" else "0422-262728 (Security Desk)"
            reporter_details = f"{student_name} ({roll_no}, {dept})"
            
            # Save into lost_found database
            try:
                cursor.execute(
                    "INSERT INTO lost_found (item_name, description, status, reported_by, contact, date) VALUES (?, ?, ?, ?, ?, ?)",
                    (item_name, query, status, reporter_details, contact, today)
                )
            except Exception:
                cursor.execute(
                    "INSERT INTO lost_found (item_name, description, status, reported_by, contact, date) VALUES (?, ?, ?, ?, ?, ?)",
                    (item_name, query, status, reporter_details, contact, today)
                )

            # Send notification
            notif_title = f"{status.title()} Item Alert: {item_name}"
            notif_content = (
                f"A new report has been filed for a {status} item:\n"
                f"- **Item**: {item_name}\n"
                f"- **Reporter**: {student_name} ({roll_no})\n"
                f"- **Details/Location**: \"{query}\"\n"
                f"Contact Security Desk for recovery."
            )
            sender_role = "student" if roll_no.startswith("7177") else "staff"
            cursor.execute(
                "INSERT INTO notifications (title, content, date, category, sender_name, sender_role) VALUES (?, ?, ?, ?, ?, ?)",
                (notif_title, notif_content, today, "lost_found", student_name, sender_role)
            )
            conn.commit()

            # AI Similarity Search for Matches in opposite status items
            cursor.execute("SELECT item_name, description, reported_by, contact, date FROM lost_found WHERE status = ?", (opposite_status,))
            existing_items = cursor.fetchall()
            
            matched_items = []
            for item in existing_items:
                score = self.calculate_ai_similarity(query, item["description"])
                if score >= 0.35:
                    matched_items.append((score, item))
            
            matched_items.sort(key=lambda x: x[0], reverse=True)
            
            match_section = ""
            if matched_items:
                match_section += "\n\n### 🎯 AI Smart Match Found!\nOur AI Matcher scanned active records and found potential matches:\n"
                for score, item in matched_items[:3]:
                    confidence_pct = int(score * 100)
                    match_section += f"- **{confidence_pct}% Match Confidence** | **{item['item_name']}**: \"{item['description']}\"\n  - *Reported by:* {item['reported_by']} ({item['date']})\n  - *Contact:* **{item['contact']}**\n"
            else:
                match_section += "\n\n🤖 *AI Status:* No immediate match found in active database. Our AI system will continue monitoring incoming reports for you."

            return (
                f"### 🎒 Lost & Found Item Logged!\n\n"
                f"Your report has been logged in the Smart Campus Lost & Found Registry:\n"
                f"- **Item Category**: {item_name}\n"
                f"- **Type**: **{status.upper()}**\n"
                f"- **Details**: \"{query}\"\n"
                f"- **Reported By**: {reporter_details}\n"
                f"- **Date**: {today}\n"
                f"{match_section}"
            )
            
        # 2. Query/Search existing items
        else:
            cursor.execute("SELECT item_name, description, status, reported_by, contact, date FROM lost_found ORDER BY id DESC")
            records = cursor.fetchall()
            if not records:
                return "No items registered in the Lost & Found database."
            
            res = "### 🎒 Campus Lost & Found Registry\n"
            for r in records:
                status_emoji = "🔍 Lost" if r['status'] == 'lost' else "🎁 Found"
                res += f"- **{status_emoji} - {r['item_name']}**: \"{r['description']}\" | Reported by: {r['reported_by']} ({r['date']}) | Contact: {r['contact']}\n"
            return res

