import os
from typing import Dict, Any
from agents.scheduler import SchedulerAgent
from agents.complaint import ComplaintAgent
from agents.document import DocumentRequestAgent
from agents.fee import FeeAgent
from agents.notification import NotificationAgent
from agents.lost_found import LostFoundAgent

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "campus.db")

class OrchestratorAgent:
    def __init__(self):
        self.agents = {
            "Scheduler Agent": SchedulerAgent(DB_PATH),
            "Complaint Agent": ComplaintAgent(DB_PATH),
            "Document Request Agent": DocumentRequestAgent(DB_PATH),
            "Fee & Payment Agent": FeeAgent(DB_PATH),
            "Notification Agent": NotificationAgent(DB_PATH),
            "Lost & Found Agent": LostFoundAgent(DB_PATH)
        }

    def detect_intent(self, query: str) -> str:
        q = query.lower()
        
        # 1. Scheduler Agent Keywords
        scheduler_keywords = [
            "exam", "test", "internal", "semester", "timetable", "class", "schedule", "shedule", "subject",
            "holiday", "vacation", "workshop", "seminar", "placement", "drive", "faculty", "book", "prof",
            "attendance", "absent", "present", "eligibility", "cutoff", "today", "classes"
        ]
        
        # 2. Complaint Agent Keywords
        complaint_keywords = [
            "complaint", "not working", "broken", "repair", "leak", "dirty", "faulty", "issue", "ac", "fan", "light",
            "maintenance", "hostel", "bus", "classroom", "eee lab"
        ]
        
        # 3. Document Request Agent Keywords
        document_keywords = [
            "bonafide", "certificate", "study", "transfer", "conduct", "hall ticket", "no due", "degree",
            "id card request", "document status", "apply", "request"
        ]
        
        # 4. Fee & Payment Agent Keywords
        fee_keywords = [
            "fee", "payment", "tuition", "hostel fee", "bus fee", "exam fee", "due", "paid", "receipt", "scholarship"
        ]
        
        # 5. Notification Agent Keywords
        notification_keywords = [
            "announcement", "announcements", "alert", "notice", "notices", "placement notification", "circular", "circulars", "emergency", "rain alert", "news", "notification", "notifications", "bulletin"
        ]
        
        # 6. Lost & Found Agent Keywords
        lost_found_keywords = [
            "lost", "found", "missing", "misplaced", "picked up", "charger", "water bottle", "keys", "phone", "bag"
        ]

        # Prioritize matching based on context/weights
        # Let's count matching words
        scores = {
            "Scheduler Agent": sum(1 for k in scheduler_keywords if k in q),
            "Complaint Agent": sum(1 for k in complaint_keywords if k in q),
            "Document Request Agent": sum(1 for k in document_keywords if k in q),
            "Fee & Payment Agent": sum(1 for k in fee_keywords if k in q),
            "Notification Agent": sum(1 for k in notification_keywords if k in q),
            "Lost & Found Agent": sum(1 for k in lost_found_keywords if k in q),
        }
        
        # Special manual routing rule overrides if specific words match
        if "attendance" in q or "eligibility" in q or "cutoff" in q:
            return "Scheduler Agent"
        if "bonafide" in q or "hall ticket" in q or "study certificate" in q or "conduct certificate" in q:
            return "Document Request Agent"
        if "fee" in q or "dues" in q or "scholarship" in q:
            return "Fee & Payment Agent"
        if "lost" in q or "found" in q or ("id card" in q and "lost" in q):
            return "Lost & Found Agent"
        if "not working" in q or "complaint" in q or "fan" in q or "light" in q:
            return "Complaint Agent"
        if "timetable" in q or "class" in q or "classes" in q or "schedule" in q or "shedule" in q or "today" in q:
            return "Scheduler Agent"
        if "notification" in q or "notifications" in q or "announcement" in q or "bulletin" in q or "placement" in q or "alert" in q or "circular" in q:
            return "Notification Agent"

        # Find maximum scored agent
        best_agent = max(scores, key=scores.get)
        if scores[best_agent] > 0:
            return best_agent
            
        # Fallback to Scheduler or Notification
        return "Scheduler Agent"

    def process_query(self, query: str, student_roll: str, student_name: str) -> Dict[str, Any]:
        agent_name = self.detect_intent(query)
        agent = self.agents[agent_name]
        
        context = {
            "roll_no": student_roll,
            "student_name": student_name
        }
        
        try:
            response = agent.handle(query, context)
        except Exception as e:
            response = f"An error occurred in {agent_name}: {str(e)}"
            
        return {
            "agent": agent_name,
            "response": response,
            "query": query
        }
