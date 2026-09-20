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

        # Matches short greeting phrases like "hello ai", "hi assistant", "hey there bot"
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
        
        # 1. Scheduler Agent Keywords
        scheduler_keywords = [
            "exam", "test", "internal", "semester", "timetable", "class", "schedule", "shedule", "subject",
            "holiday", "vacation", "workshop", "seminar", "placement", "drive", "faculty", "book", "prof",
            "attendance", "absent", "present", "eligibility", "cutoff", "today", "classes", "calendar",
            "academic calendar", "planner", "event", "events"
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
        if "calendar" in q or "academic calendar" in q or "planner" in q or "event" in q or "events" in q:
            return "Scheduler Agent"
        if "notification" in q or "notifications" in q or "announcement" in q or "bulletin" in q or "placement" in q or "alert" in q or "circular" in q:
            return "Notification Agent"

        # Find maximum scored agent
        best_agent = max(scores, key=scores.get)
        if scores[best_agent] > 0:
            return best_agent
            
        return None

    def process_query(self, query: str, student_roll: str, student_name: str) -> Dict[str, Any]:
        q_clean = query.strip()
        name_display = student_name if student_name else "there"

        # 1. Direct Greeting / Introduction Check
        if self.is_greeting_or_intro(q_clean):
            return {
                "agent": "CampusOps AI Guard",
                "response": (
                    f"Hello {name_display}! 👋 Welcome to CampusOps AI.\n\n"
                    "How can I assist you today? You can ask me about:\n"
                    "- ⏰ **Today's Classes**: *\"What is my class schedule today?\"*\n"
                    "- 📅 **Class Timetable**: *\"Show my class timetable\"*\n"
                    "- 📊 **Attendance Status**: *\"Check my attendance percentage\"*\n"
                    "- 👨‍🏫 **Faculty Appointments**: *\"Book appointment with faculty\"*\n"
                    "- 🛠️ **Maintenance & Complaints**: *\"AC not working in Room 304\"*\n"
                    "- 📜 **Certificates & Bonafide**: *\"Apply for bonafide certificate\"*\n"
                    "- 💳 **Fee Inquiries**: *\"What are my pending fee dues?\"*\n"
                    "- 📢 **Campus Notices**: *\"Show recent circulars\"*\n"
                    "- 🔍 **Lost & Found**: *\"Lost my water bottle in cafeteria\"*"
                ),
                "query": query
            }

        agent_name = self.detect_intent(query)
        
        # 2. If no specialist agent matched, provide helpful guidance instead of arbitrary calendar dump
        if not agent_name:
            return {
                "agent": "CampusOps AI Guard",
                "response": (
                    f"I'm here to assist with campus services, {name_display}! 👋\n\n"
                    "I didn't quite catch that request. Here are some things you can ask me:\n"
                    "- ⏰ **Classes & Timetable**: *\"What classes do I have today?\"*\n"
                    "- 📊 **Attendance**: *\"What is my attendance percentage?\"*\n"
                    "- 🛠️ **Complaints**: *\"Fan not working in Lab 2\"*\n"
                    "- 📜 **Documents**: *\"Apply for bonafide certificate\"*\n"
                    "- 💳 **Fees**: *\"Check my pending dues\"*\n"
                    "- 🔍 **Lost & Found**: *\"Found keys near cafeteria\"*"
                ),
                "query": query
            }

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
