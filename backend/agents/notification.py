from agents.base import BaseAgent
from typing import Dict, Any

class NotificationAgent(BaseAgent):
    def handle(self, query: str, context: Dict[str, Any]) -> str:
        q = query.lower()
        
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        # Categorize query
        category = None
        if q in ["circular", "placement", "workshop", "emergency", "exam", "lost_found", "teacher_notice", "student_post"]:
            category = q
        elif "placement" in q or "job" in q or "career" in q or "drive" in q:
            category = "placement"
        elif "workshop" in q or "seminar" in q:
            category = "workshop"
        elif "emergency" in q or "rain" in q or "alert" in q:
            category = "emergency"
        elif "exam" in q:
            category = "exam"
        elif "lost" in q or "found" in q:
            category = "lost_found"
        elif "teacher" in q or "faculty" in q or "professor" in q:
            category = "teacher_notice"
        elif "student" in q or "post" in q or "union" in q:
            category = "student_post"
        elif q == "circular" or "circulars" in q:
            category = "circular"
            
        if category:
            cursor.execute("SELECT title, content, date, category, sender_name, sender_role FROM notifications WHERE category = ? ORDER BY date DESC", (category,))
        else:
            cursor.execute("SELECT title, content, date, category, sender_name, sender_role FROM notifications ORDER BY date DESC")
            
        records = cursor.fetchall()
        if not records:
            return "No matching circulars or announcements found."
            
        res = "### 🔔 College Notices & Announcements\n"
        for r in records:
            cat_emoji = (
                "📢" if r['category'] == 'circular'
                else "💼" if r['category'] == 'placement' 
                else "🎓" if r['category'] == 'workshop' 
                else "🚨" if r['category'] == 'emergency' 
                else "📋" if r['category'] == 'exam'
                else "🔍" if r['category'] == 'lost_found'
                else "👨‍🏫" if r['category'] == 'teacher_notice'
                else "👥" if r['category'] == 'student_post'
                else "🔔"
            )
            
            sender_role_display = "Teacher" if r['sender_role'] == 'teacher' else "Student" if r['sender_role'] == 'student' else "Admin"
            sender_info = f"Posted by: {r['sender_name']} ({sender_role_display})"
            clean_title = r['title'].split(" |tags:")[0].split(" |category:")[0].strip()
            
            res += f"#### {cat_emoji} {clean_title} ({r['date']})\n{sender_info}\n{r['content']}\n\n---\n"
        return res
