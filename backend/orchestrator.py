import os
import re
from typing import Dict, Any, Optional
from agents.scheduler import SchedulerAgent
from agents.complaint import ComplaintAgent
from agents.document import DocumentRequestAgent
from agents.fee import FeeAgent
from agents.notification import NotificationAgent
from agents.lost_found import LostFoundAgent

from database import DB_PATH

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

    def is_greeting_or_intro(self, query: str) -> bool:
        clean = re.sub(r'[^a-zA-Z0-9\s]', '', query.strip().lower())
        words = clean.split()
        if not words:
            return False

        exact_greetings = {
            "hello", "hi", "hey", "howdy", "greetings", "yo", "sup",
            "namaste", "vanakkam", "hola", "good morning", "good afternoon",
            "good evening", "good day", "hey there", "hello there", "hi there",
            "who are you", "what can you do", "help", "help me"
        }
        if clean in exact_greetings:
            return True

        if len(words) <= 3 and words[0] in ["hello", "hi", "hey", "howdy", "yo", "sup", "hola"]:
            action_words = {
                "exam", "timetable", "class", "classes", "attendance", "fee", "fees",
                "complaint", "repair", "bonafide", "certificate", "lost", "found",
                "schedule", "shedule", "holiday", "placement", "circular"
            }
            if not any(w in action_words for w in words):
                return True

        return False

    def detect_intent(self, query: str) -> Optional[str]:
        q = query.lower()

        scheduler_keywords = [
            "exam", "test", "internal", "semester", "timetable", "class", "schedule", "shedule", "subject",
            "holiday", "vacation", "workshop", "seminar", "placement", "drive", "faculty", "book", "prof",
            "attendance", "absent", "present", "eligibility", "cutoff", "today", "classes", "calendar",
            "academic calendar", "planner", "event", "events"
        ]
        complaint_keywords = [
            "complaint", "not working", "broken", "repair", "leak", "dirty", "faulty", "issue", "ac", "fan", "light",
            "maintenance", "hostel", "bus", "classroom", "eee lab"
        ]
        document_keywords = [
            "bonafide", "certificate", "study", "transfer", "conduct", "hall ticket", "no due", "degree",
            "id card request", "document status", "apply", "request"
        ]
        fee_keywords = [
            "fee", "payment", "tuition", "hostel fee", "bus fee", "exam fee", "due", "paid", "receipt", "scholarship"
        ]
        notification_keywords = [
            "announcement", "announcements", "alert", "notice", "notices", "placement notification", "circular",
            "circulars", "emergency", "rain alert", "news", "notification", "notifications", "bulletin"
        ]
        lost_found_keywords = [
            "lost", "found", "missing", "misplaced", "picked up", "charger", "water bottle", "keys", "phone", "bag"
        ]

        scores = {
            "Scheduler Agent": sum(1 for k in scheduler_keywords if k in q),
            "Complaint Agent": sum(1 for k in complaint_keywords if k in q),
            "Document Request Agent": sum(1 for k in document_keywords if k in q),
            "Fee & Payment Agent": sum(1 for k in fee_keywords if k in q),
            "Notification Agent": sum(1 for k in notification_keywords if k in q),
            "Lost & Found Agent": sum(1 for k in lost_found_keywords if k in q),
        }

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
        if "calendar" in q or "academic calendar" in q or "planner" in q or "event" in q or "events" in q:
            return "Scheduler Agent"
        if "notification" in q or "notifications" in q or "announcement" in q or "bulletin" in q or "placement" in q or "alert" in q or "circular" in q:
            return "Notification Agent"

        best_agent = max(scores, key=scores.get)
        if scores[best_agent] > 0:
            return best_agent

        return None

    def process_query(self, query: str, student_roll: str, student_name: str) -> Dict[str, Any]:
        q_clean = query.strip()
        name_display = student_name if student_name else "there"

        roll_upper = str(student_roll).upper()
        is_staff = roll_upper.startswith("STAFF")
        is_admin = roll_upper.startswith("ADMIN")

        # 1. Greeting / Introduction
        if self.is_greeting_or_intro(q_clean):
            if is_staff:
                response = (
                    f"Hello {name_display}! Welcome to the **Faculty Portal AI Assistant**.\n\n"
                    "I can help you with:\n"
                    "- **Teaching Schedule**: *\"Show my timetable\"*\n"
                    "- **Student Attendance**: *\"How do I mark attendance?\"*\n"
                    "- **Broadcast Notice**: *\"Post a notice to students\"*\n"
                    "- **Academic Calendar**: *\"Show upcoming events\"*\n"
                    "- **Lost & Found**: *\"Found keys near cafeteria\"*\n"
                    "- **Maintenance**: *\"AC not working in Lab 2\"*"
                )
            elif is_admin:
                response = (
                    f"Hello {name_display}! Welcome to the **Admin Control Panel AI**.\n\n"
                    "I can assist you with:\n"
                    "- **Campus Metrics**: *\"Show pending complaints\"*\n"
                    "- **Notifications**: *\"Show all announcements\"*\n"
                    "- **Academic Calendar**: *\"Show upcoming events\"*\n"
                    "- **Fee Overview**: *\"Show outstanding fees\"*\n"
                    "- **Lost & Found**: *\"Show lost items\"*"
                )
            else:
                response = (
                    f"Hello {name_display}! Welcome to **CampusOps AI**.\n\n"
                    "How can I assist you today? Ask me about:\n"
                    "- **Today's Classes**: *\"What classes do I have today?\"*\n"
                    "- **My Timetable**: *\"Show my timetable\"*\n"
                    "- **Attendance**: *\"Check my attendance percentage\"*\n"
                    "- **Maintenance**: *\"AC not working in Room 304\"*\n"
                    "- **Certificates**: *\"Apply for bonafide certificate\"*\n"
                    "- **Fee Dues**: *\"What are my pending fee dues?\"*\n"
                    "- **Notices**: *\"Show recent circulars\"*\n"
                    "- **Lost & Found**: *\"Lost my water bottle in cafeteria\"*"
                )
            return {"agent": "CampusOps AI Guard", "response": response, "query": query}

        agent_name = self.detect_intent(query)

        # 2. No agent matched — role-aware fallback
        if not agent_name:
            if is_staff:
                response = (
                    f"I didn't quite catch that, {name_display}. As a faculty member, you can ask me:\n\n"
                    "- *\"Show my teaching schedule\"*\n"
                    "- *\"How do I mark attendance?\"*\n"
                    "- *\"Post a notice to students\"*\n"
                    "- *\"Show upcoming campus events\"*\n"
                    "- *\"Report a maintenance issue\"*"
                )
            elif is_admin:
                response = (
                    f"I didn't quite catch that, {name_display}. As admin, you can ask me:\n\n"
                    "- *\"Show pending complaints\"*\n"
                    "- *\"Show all notifications\"*\n"
                    "- *\"Show outstanding fee dues\"*\n"
                    "- *\"Show academic calendar\"*"
                )
            else:
                response = (
                    f"I didn't quite catch that, {name_display}. Try asking:\n\n"
                    "- *\"What classes do I have today?\"*\n"
                    "- *\"What is my attendance percentage?\"*\n"
                    "- *\"Fan not working in Lab 2\"*\n"
                    "- *\"Apply for bonafide certificate\"*\n"
                    "- *\"Check my pending fee dues\"*\n"
                    "- *\"Found keys near cafeteria\"*"
                )
            return {"agent": "CampusOps AI Guard", "response": response, "query": query}

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
