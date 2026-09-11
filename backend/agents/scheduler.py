from agents.base import BaseAgent
from typing import Dict, Any
import sqlite3
import datetime
import re

class SchedulerAgent(BaseAgent):
    def __init__(self, db_path: str):
        super().__init__(db_path)
        self.sessions = {}  # Stores multi-turn booking session state keyed by roll_no

    def handle(self, query: str, context: Dict[str, Any]) -> str:
        q = query.strip().lower()
        roll_no = context.get("roll_no", "717721L101")
        student_name = context.get("student_name", "Aravind Swamy")
        
        # 1. Check redirection/rules first
        redirection = self.check_redirection(q)
        if redirection:
            return redirection

        # 2. Check active booking session
        if roll_no in self.sessions:
            return self.process_booking_session(query, roll_no)

        # 3. Reminder Management (CRUD)
        reminder_response = self.handle_reminders(query, roll_no)
        if reminder_response:
            return reminder_response

        # 4. Faculty Appointment Booking Initializer
        if "book" in q or "appointment" in q or "consultation" in q or "meet" in q:
            return self.initiate_booking(query, roll_no, student_name)

        # 4.5 Today's Classes & Daily Schedule Check (Interactive AI)
        is_today_query = (
            ("today" in q and any(w in q for w in ["shedule", "schedule", "class", "classes", "timetable", "timetbl", "period", "routine", "what", "how", "plan"]))
            or any(phrase in q for phrase in [
                "shedule today", "schedule today", "today schedule", "today shedule", 
                "today's schedule", "todays schedule", "today's shedule", "todays shedule",
                "classes today", "today classes", "today's classes", "todays classes",
                "class today", "today class", "today's class", "todays class",
                "what is today", "what do i have today", "what class do i have", "my schedule today",
                "today routine", "today periods", "what is the shedule today", "what is the schedule today"
            ])
            or (any(d in q for d in ["monday", "tuesday", "wednesday", "thursday", "friday"]) and any(w in q for w in ["class", "classes", "schedule", "shedule", "timetable", "period"]))
        )
        if is_today_query and not any(k in q for k in ["exam", "holiday", "attendance", "eligibility", "cutoff"]):
            return self.get_today_classes_interactive(roll_no, student_name, query)

        # 5. Smart Dashboard Check
        if q in ["dashboard", "scheduler", "my schedule"]:
            return self.get_smart_dashboard(roll_no, student_name)

        # 5.5 Attendance & Exam Eligibility Check
        if "attendance" in q or "eligibility" in q or "cutoff" in q or "classes attended" in q or "absent" in q:
            return self.get_attendance_summary(roll_no, student_name, query)

        # 6. Specific Queries & fallbacks
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        # Resolve student / staff info
        cursor.execute("SELECT dept, year, role FROM students WHERE roll_no = ?", (roll_no,))
        student = cursor.fetchone()
        dept = student["dept"] if student and student["dept"] else "CSE"
        raw_year = student["year"] if student and student["year"] is not None else 3
        role = student["role"] if student and student["role"] else ("staff" if str(roll_no).startswith("STAFF") else "student")
        
        is_staff = (role == "staff" or raw_year == 0 or str(roll_no).startswith("STAFF"))
        year = raw_year if raw_year > 0 else 3

        # Exams
        if "exam" in q or "test" in q or "assessment" in q:
            exam_type = "semester" if "semester" in q else "internal"
            cursor.execute("SELECT subject, code, date, time FROM exams WHERE type = ?", (exam_type,))
            exams = cursor.fetchall()
            if not exams:
                return f"No scheduled {exam_type} exams found at the moment."
            
            res = f"### 📅 {exam_type.capitalize()} Exam Schedule\n"
            for exam in exams:
                res += f"- **{exam['subject']}** ({exam['code']}): {exam['date']} @ {exam['time']}\n"
            return res
        
        # Timetable
        elif "timetable" in q or "class" in q or "classes" in q or "schedule" in q or "shedule" in q:
            # Check if a specific year was requested in query (e.g. "year 1", "year 3", "3rd year")
            year_match = re.search(r'\b(?:year\s*([1-4])|([1-4])(?:st|nd|rd|th)?\s*year)\b', q)
            requested_year = int(year_match.group(1) or year_match.group(2)) if year_match else None

            if is_staff and not requested_year:
                # For staff members, display all teaching timetables for their department
                cursor.execute("SELECT year, day, slot_1, slot_2, slot_3, slot_4, slot_5, slot_6 FROM timetable WHERE dept = ? ORDER BY year, id", (dept,))
                all_slots = cursor.fetchall()
                if not all_slots:
                    return f"No timetable entries found for Department of {dept}."
                
                years_map = {}
                for r in all_slots:
                    yr = r['year']
                    if yr not in years_map:
                        years_map[yr] = []
                    years_map[yr].append(r)
                
                res = f"### 📝 Department Teaching Timetable (Department: {dept})\n"
                for yr in sorted(years_map.keys()):
                    res += f"#### Year {yr} ({dept})\n"
                    for day_row in years_map[yr]:
                        res += f"- **{day_row['day']}**:\n"
                        for i in range(1, 7):
                            s_val = day_row[f'slot_{i}']
                            if s_val:
                                res += f"  - Slot {i}: {s_val}{self.get_subject_details(s_val)}\n"
                return res
            else:
                target_year = requested_year if requested_year else year
                cursor.execute("SELECT day, slot_1, slot_2, slot_3, slot_4, slot_5, slot_6 FROM timetable WHERE dept = ? AND year = ?", (dept, target_year))
                slots = cursor.fetchall()
                if not slots:
                    return f"No timetable found for Department of {dept}, Year {target_year}."
                
                res = f"### 📝 Class Timetable (Department: {dept}, Year: {target_year})\n"
                for day_row in slots:
                    res += f"- **{day_row['day']}**:\n"
                    for i in range(1, 7):
                        s_val = day_row[f'slot_{i}']
                        if s_val:
                            res += f"  - Slot {i}: {s_val}{self.get_subject_details(s_val)}\n"
                return res
            
        # Holidays
        elif "holiday" in q or "vacation" in q:
            cursor.execute("SELECT title, date FROM academic_calendar WHERE type = 'holiday'")
            holidays = cursor.fetchall()
            if not holidays:
                return "No holidays found in the current academic calendar."
            res = "### 🏖️ Upcoming Holidays\n"
            for h in holidays:
                res += f"- **{h['title']}**: {h['date']}\n"
            return res
            
        # Workshops/Seminars/Placement Drives
        elif "workshop" in q or "seminar" in q or "placement" in q or "drive" in q or "lecture" in q:
            cursor.execute("SELECT title, content, date FROM notifications WHERE category IN ('placement', 'workshop')")
            events = cursor.fetchall()
            if not events:
                return "No upcoming workshops, seminars, or placement drives found."
            res = "### 🚀 Academic Events & Opportunities\n"
            for e in events:
                res += f"- **{e['title']}** ({e['date']}): {e['content']}\n"
            return res

        # Default calendar display
        cursor.execute("SELECT title, date, type FROM academic_calendar ORDER BY date ASC")
        cal = cursor.fetchall()
        res = "### 📅 Sri Eshwar Academic Calendar & Planner\n"
        for item in cal:
            clean_title = item['title'].split(" |tags:")[0].split(" |category:")[0].strip()
            res += f"- **{clean_title}** ({item['type'].capitalize()}): {item['date']}\n"
        return res

    def check_redirection(self, q: str) -> str:
        # Check if query targets other agents (complaints, docs, fees, lost items)
        complaint_keywords = ["not working", "broken", "repair", "leak", "dirty", "faulty", "complaint"]
        document_keywords = ["bonafide", "study certificate", "transfer certificate", "conduct certificate", "hall ticket"]
        fee_keywords = ["fee", "payment", "tuition", "hostel fee", "bus fee", "exam fee", "dues"]
        lost_found_keywords = ["lost", "found", "missing", "misplaced", "charger", "water bottle", "keys", "phone", "bag"]

        if any(k in q for k in complaint_keywords):
            return "I can only assist with academic scheduling, reminders, and faculty appointments. For maintenance issues or complaints, please redirect your request to the **Complaint Agent**."
        if any(k in q for k in document_keywords):
            return "I can only assist with academic scheduling, reminders, and faculty appointments. For certificates, ID cards, or hall tickets, please redirect your request to the **Document Request Agent**."
        if any(k in q for k in fee_keywords):
            return "I can only assist with academic scheduling, reminders, and faculty appointments. For fee queries and payments, please redirect your request to the **Fee & Payment Agent**."
        if any(k in q for k in lost_found_keywords):
            return "I can only assist with academic scheduling, reminders, and faculty appointments. To report or search for lost items, please redirect your request to the **Lost & Found Agent**."
        return ""

    def get_subject_details(self, subject: str) -> str:
        if not subject:
            return ""
        s = subject.lower()
        
        # 3rd Year CSE Mappings
        if "data science" in s:
            return " | Faculty: Dr. Raj Thilak | Venue: SF07"
        elif "compiler" in s:
            return " | Faculty: Dr. Anbuarasu | Venue: TF 17"
        elif "machine learning" in s:
            return " | Faculty: Dr. Geetha | Venue: SF07"
        elif "cloud" in s:
            return " | Faculty: Dr. Guna Priya | Venue: TF 17"
        elif "soft skills" in s or "aptitude" in s or "training" in s:
            return " | Faculty: Mr. Premkumar | Venue: CODE STUDIO"
        elif "internet of things" in s or "iot" in s:
            return " | Faculty: Dr. Batcha | Venue: SIMULATION LAB"
        elif s == "pe" or "professional elective" in s:
            return " | Faculty: Dr. Ramakrishnan | Venue: LH-403"
        elif "ldic" in s:
            return " | Faculty: Dr. Kavitha | Venue: B-Block 105"
            
        # 1st Year Mappings
        elif "technical english" in s:
            return " | Faculty: Dr. Geetha | Venue: LH-101"
        elif "engineering math i" in s:
            return " | Faculty: Dr. Srinivasan | Venue: LH-101"
        elif "engineering physics" in s:
            return " | Faculty: Dr. Radhakrishnan | Venue: PHYSICS LAB"
        elif "engineering chemistry" in s:
            return " | Faculty: Dr. Saravanan | Venue: CHEMISTRY LAB"
        elif "programming in c" in s or "c programming lab" in s:
            return " | Faculty: Mr. Vignesh | Venue: LAB 1"
        elif "python programming" in s:
            return " | Faculty: Dr. Balasubramanian | Venue: LAB 2"

        # 2nd Year Mappings
        elif "discrete mathematics" in s:
            return " | Faculty: Dr. Srinivasan | Venue: LH-201"
        elif "data structures" in s:
            return " | Faculty: Dr. Ramakrishnan | Venue: LAB 3"
        elif "digital principles" in s:
            return " | Faculty: Dr. Kavitha | Venue: LH-202"
        elif "oops using c++" in s or "c++ programming lab" in s:
            return " | Faculty: Mr. Vignesh | Venue: LAB 4"

        # 4th Year Mappings
        elif "cryptography" in s:
            return " | Faculty: Dr. Balasubramanian | Venue: LH-401"
        elif "ad hoc" in s:
            return " | Faculty: Dr. Kavitha | Venue: LH-402"
        elif "professional elective" in s or s == "pe":
            return " | Faculty: Dr. Ramakrishnan | Venue: LH-403"
        elif "project" in s:
            return " | Faculty: Dr. Ramakrishnan | Venue: SEMINAR HALL"

        # ECE/VLSI/IT/Fallback
        elif "vlsi" in s or "microcontroller" in s or "signal" in s or "antenna" in s or "cyber" in s or "mobile" in s:
            return " | Faculty: Dr. Hariharan | Venue: SIMULATION LAB"
            
        return " | Faculty: Dr. Hariharan | Venue: SF07"

    def get_smart_dashboard(self, roll_no: str, student_name: str) -> str:
        conn = self.get_db_connection()
        cursor = conn.cursor()

        # Resolve student info
        cursor.execute("SELECT dept, year FROM students WHERE roll_no = ?", (roll_no,))
        student = cursor.fetchone()
        dept = student["dept"] if student else "CSE"
        year = student["year"] if student else 3

        # 1. Today's Schedule
        day_of_week = datetime.datetime.now().strftime("%A")
        cursor.execute("SELECT slot_1, slot_2, slot_3, slot_4 FROM timetable WHERE dept = ? AND year = ? AND day = ?", (dept, year, day_of_week))
        today_slots = cursor.fetchone()
        
        today_schedule_str = "• No classes scheduled for today\n"
        if today_slots:
            today_schedule_str = (
                f"• Slot 1: {today_slots['slot_1']} - 9:00 AM{self.get_subject_details(today_slots['slot_1'])}\n"
                f"• Slot 2: {today_slots['slot_2']} - 11:00 AM{self.get_subject_details(today_slots['slot_2'])}\n"
                f"• Slot 3: {today_slots['slot_3']} - 2:00 PM{self.get_subject_details(today_slots['slot_3'])}\n"
                f"• Slot 4: {today_slots['slot_4']} - 4:00 PM{self.get_subject_details(today_slots['slot_4'])}\n"
            )

        # 2. Upcoming Exams
        cursor.execute("SELECT subject, date FROM exams ORDER BY date ASC LIMIT 3")
        exams = cursor.fetchall()
        upcoming_exams_str = ""
        for exam in exams:
            upcoming_exams_str += f"• {exam['subject']} – {exam['date']}\n"
        if not upcoming_exams_str:
            upcoming_exams_str = "• No upcoming exams scheduled\n"

        # 3. Upcoming Events
        cursor.execute("SELECT title, date FROM academic_calendar WHERE type = 'event' ORDER BY date ASC LIMIT 3")
        events = cursor.fetchall()
        upcoming_events_str = ""
        for event in events:
            upcoming_events_str += f"• {event['title']} – {event['date']}\n"
        if not upcoming_events_str:
            upcoming_events_str = "• No upcoming events scheduled\n"

        # 4. Pending Deadlines
        cursor.execute("SELECT subject, title, due_date FROM assignments WHERE roll_no = ? AND status = 'pending' ORDER BY due_date ASC LIMIT 3", (roll_no,))
        assignments = cursor.fetchall()
        pending_deadlines_str = ""
        for assign in assignments:
            pending_deadlines_str += f"• {assign['subject']}: {assign['title']} – {assign['due_date']}\n"
        if not pending_deadlines_str:
            pending_deadlines_str = "• No pending assignment deadlines\n"

        # 5. Faculty Meetings
        cursor.execute("SELECT faculty_name, date, time FROM faculty_bookings WHERE reg_no = ? AND status = 'Confirmed' ORDER BY date ASC LIMIT 3", (roll_no,))
        meetings = cursor.fetchall()
        meetings_str = ""
        for meet in meetings:
            meetings_str += f"• Discussion with {meet['faculty_name']} on {meet['date']} @ {meet['time']}\n"
        if not meetings_str:
            meetings_str = "• No scheduled faculty meetings\n"

        # 6. Holiday Alerts
        cursor.execute("SELECT title, date FROM academic_calendar WHERE type = 'holiday' ORDER BY date ASC LIMIT 2")
        holidays = cursor.fetchall()
        holidays_str = ""
        for h in holidays:
            holidays_str += f"• {h['title']} – {h['date']}\n"
        if not holidays_str:
            holidays_str = "• No upcoming holidays\n"

        # 7. Important Notifications
        cursor.execute("SELECT title, date FROM notifications ORDER BY date DESC LIMIT 3")
        notifs = cursor.fetchall()
        notifications_str = ""
        for n in notifs:
            notifications_str += f"• {n['title']} – {n['date']}\n"
        if not notifications_str:
            notifications_str = "• No notifications\n"

        dashboard = f"""### 📊 Smart Campus Dashboard

#### Today's Schedule ({day_of_week})
{today_schedule_str}
#### Upcoming Exams
{upcoming_exams_str}
#### Upcoming Events
{upcoming_events_str}
#### Pending Assignment Deadlines
{pending_deadlines_str}
#### Faculty Meetings
{meetings_str}
#### Holiday Alerts
{holidays_str}
#### Important Notifications
{notifications_str}"""
        return dashboard

    def handle_reminders(self, query: str, roll_no: str) -> str:
        q = query.lower()
        conn = self.get_db_connection()
        cursor = conn.cursor()

        # VIEW REMINDERS
        if "show reminder" in q or "list reminder" in q or "my reminder" in q or "view reminder" in q:
            cursor.execute("SELECT id, title, date, time FROM reminders WHERE roll_no = ?", (roll_no,))
            records = cursor.fetchall()
            if not records:
                return "You have no active reminders set."
            res = "### ⏰ Your Reminders\n"
            for r in records:
                res += f"- **#{r['id']}**: {r['title']} on {r['date']} @ {r['time']}\n"
            return res

        # CREATE REMINDER
        elif "set reminder" in q or "create reminder" in q or "add reminder" in q:
            title = "Personal Task"
            date = datetime.date.today().strftime("%Y-%m-%d")
            time = "09:00 AM"

            title_match = re.search(r'(?:for|reminder to)\s+(.+?)(?:\s+on|\s+at|$)', q)
            if title_match:
                title = title_match.group(1).title()

            date_match = re.search(r'\b\d{4}-\d{2}-\d{2}\b', q)
            if date_match:
                date = date_match.group(0)

            time_match = re.search(r'\b\d{1,2}:\d{2}\s*(?:am|pm)\b', q)
            if time_match:
                time = time_match.group(0).upper()

            cursor.execute("INSERT INTO reminders (roll_no, title, date, time) VALUES (?, ?, ?, ?)", (roll_no, title, date, time))
            conn.commit()
            return f"### ⏰ Reminder Created Successfully!\n\nI have set a reminder:\n- **Title**: {title}\n- **Date**: {date}\n- **Time**: {time}"

        # DELETE REMINDER
        elif "delete reminder" in q or "remove reminder" in q:
            id_match = re.search(r'#?(\d+)', q)
            if id_match:
                rem_id = int(id_match.group(1))
                cursor.execute("SELECT id FROM reminders WHERE id = ? AND roll_no = ?", (rem_id, roll_no))
                if not cursor.fetchone():
                    return f"Reminder #{rem_id} not found."
                cursor.execute("DELETE FROM reminders WHERE id = ?", (rem_id,))
                conn.commit()
                return f"### ⏰ Reminder Deleted\n\nReminder #{rem_id} has been deleted successfully."
            return "Please specify the Reminder ID to delete (e.g. \"delete reminder 1\")."

        # UPDATE REMINDER
        elif "update reminder" in q or "change reminder" in q:
            id_match = re.search(r'#?(\d+)', q)
            if id_match:
                rem_id = int(id_match.group(1))
                cursor.execute("SELECT title, date, time FROM reminders WHERE id = ? AND roll_no = ?", (rem_id, roll_no))
                existing = cursor.fetchone()
                if not existing:
                    return f"Reminder #{rem_id} not found."

                new_date = existing["date"]
                new_time = existing["time"]
                new_title = existing["title"]

                date_match = re.search(r'\b\d{4}-\d{2}-\d{2}\b', q)
                if date_match:
                    new_date = date_match.group(0)

                time_match = re.search(r'\b\d{1,2}:\d{2}\s*(?:am|pm)\b', q)
                if time_match:
                    new_time = time_match.group(0).upper()

                title_match = re.search(r'(?:to|title)\s+(.+?)(?:\s+on|\s+at|$)', q)
                if title_match and "reminder" not in title_match.group(1):
                    new_title = title_match.group(1).title()

                cursor.execute("UPDATE reminders SET title = ?, date = ?, time = ? WHERE id = ?", (new_title, new_date, new_time, rem_id))
                conn.commit()
                return f"### ⏰ Reminder Updated Successfully!\n\nReminder #{rem_id} updated:\n- **Title**: {new_title}\n- **Date**: {new_date}\n- **Time**: {new_time}"
            return "Please specify the Reminder ID to update (e.g. \"update reminder 1 on 2026-08-06\")."

        return ""

    def initiate_booking(self, query: str, roll_no: str, student_name: str) -> str:
        conn = self.get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT dept FROM students WHERE roll_no = ?", (roll_no,))
        student_row = cursor.fetchone()
        dept = student_row["dept"] if student_row else "CSE"

        session_data = {
            "student_name": student_name,
            "reg_no": roll_no,
            "dept": dept,
            "faculty_name": None,
            "date": None,
            "time": None,
            "purpose": None
        }

        q = query.lower()

        cursor.execute("SELECT name FROM faculty")
        faculties = [f["name"] for f in cursor.fetchall()]
        for fac in faculties:
            if fac.lower() in q or fac.split()[-1].lower() in q:
                session_data["faculty_name"] = fac
                break

        date_match = re.search(r'\b\d{4}-\d{2}-\d{2}\b', q)
        if date_match:
            session_data["date"] = date_match.group(0)

        time_match = re.search(r'\b\d{1,2}:\d{2}\s*(?:am|pm)\b', q)
        if time_match:
            session_data["time"] = time_match.group(0).upper()

        purpose_match = re.search(r'(?:for|purpose of)\s+([^.\n]+)', q)
        if purpose_match:
            session_data["purpose"] = purpose_match.group(1).strip().capitalize()

        self.sessions[roll_no] = {
            "state": "collecting",
            "data": session_data
        }

        return self.ask_next_booking_question(roll_no)

    def ask_next_booking_question(self, roll_no: str) -> str:
        session = self.sessions[roll_no]
        data = session["data"]

        if not data["faculty_name"]:
            session["state"] = "awaiting_faculty"
            conn = self.get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT name, designation, dept FROM faculty")
            faculties = cursor.fetchall()
            faculty_list = "\n".join([f"- **{f['name']}** ({f['designation']}, {f['dept']})" for f in faculties])
            return f"Please provide the name of the faculty member you'd like to book an appointment with. Available faculty:\n{faculty_list}"

        if not data["date"]:
            session["state"] = "awaiting_date"
            return f"What is your preferred date (YYYY-MM-DD) for meeting with **{data['faculty_name']}**?"

        if not data["time"]:
            session["state"] = "awaiting_time"
            return f"What is your preferred time (e.g., 10:30 AM) for the appointment on **{data['date']}**?"

        if not data["purpose"]:
            session["state"] = "awaiting_purpose"
            return "What is the purpose of this appointment?"

        session["state"] = "awaiting_confirmation"
        summary = (
            f"### 👥 Faculty Appointment Summary\n\n"
            f"Please review the details below before confirmation:\n"
            f"- **Student Name**: {data['student_name']}\n"
            f"- **Register Number**: {data['reg_no']}\n"
            f"- **Department**: {data['dept']}\n"
            f"- **Faculty Name**: {data['faculty_name']}\n"
            f"- **Preferred Date**: {data['date']}\n"
            f"- **Preferred Time**: {data['time']}\n"
            f"- **Purpose**: {data['purpose']}\n\n"
            f"Would you like to confirm this appointment? (Please reply **yes** or **no**)"
        )
        return summary

    def process_booking_session(self, query: str, roll_no: str) -> str:
        session = self.sessions[roll_no]
        state = session["state"]
        data = session["data"]
        q = query.strip().lower()

        if state == "awaiting_faculty":
            conn = self.get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM faculty")
            faculties = [f["name"] for f in cursor.fetchall()]
            
            matched_fac = None
            for fac in faculties:
                if q in fac.lower() or fac.split()[-1].lower() in q:
                    matched_fac = fac
                    break

            if matched_fac:
                data["faculty_name"] = matched_fac
            else:
                faculty_list = "\n".join([f"- **{f}**" for f in faculties])
                return f"I couldn't match that name. Please choose from our faculty list:\n{faculty_list}"

        elif state == "awaiting_date":
            date_match = re.search(r'\b\d{4}-\d{2}-\d{2}\b', q)
            if date_match:
                data["date"] = date_match.group(0)
            else:
                return "Please enter a valid date in YYYY-MM-DD format (e.g. 2026-08-05)."

        elif state == "awaiting_time":
            time_match = re.search(r'\b\d{1,2}:\d{2}\s*(?:am|pm)\b', q)
            if time_match:
                data["time"] = time_match.group(0).upper()
            else:
                return "Please enter a valid time (e.g. 10:30 AM)."

        elif state == "awaiting_purpose":
            data["purpose"] = query.strip().capitalize()

        elif state == "awaiting_confirmation":
            if q in ["yes", "confirm", "y", "ok"]:
                conn = self.get_db_connection()
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO faculty_bookings (student_name, reg_no, dept, faculty_name, date, time, purpose, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Confirmed')",
                    (data["student_name"], data["reg_no"], data["dept"], data["faculty_name"], data["date"], data["time"], data["purpose"])
                )
                conn.commit()
                del self.sessions[roll_no]
                return f"### 📅 Appointment Booked Successfully!\n\nYour appointment with **{data['faculty_name']}** has been scheduled for **{data['date']}** at **{data['time']}**."
            elif q in ["no", "cancel", "n"]:
                del self.sessions[roll_no]
                return "Booking request cancelled."
            else:
                return "Please confirm by replying with **yes** or **no**."

        return self.ask_next_booking_question(roll_no)

    def get_attendance_summary(self, roll_no: str, student_name: str, query: str) -> str:
        q = query.lower()
        conn = self.get_db_connection()
        cursor = conn.cursor()

        # Check student details
        cursor.execute("SELECT name, dept, year FROM students WHERE roll_no = ?", (roll_no,))
        student = cursor.fetchone()
        display_name = student["name"] if student and student["name"] else student_name
        dept = student["dept"] if student and student["dept"] else "CSE"

        cursor.execute("""
            SELECT subject, status, date, slot_index
            FROM attendance
            WHERE roll_no = ?
            ORDER BY date DESC
        """, (roll_no,))
        rows = cursor.fetchall()

        if not rows:
            return (
                f"### 📊 Attendance Summary for **{display_name}** ({roll_no})\n\n"
                f"- **Department**: {dept}\n"
                f"- **Overall Attendance**: 85.0% *(Default / Good standing)*\n"
                f"- **Exam Eligibility**: ✅ **Eligible** (Above statutory 75% cutoff)\n\n"
                f"You can view your detailed real-time logs under the **Attendance & Eligibility** tab on your dashboard!"
            )

        total_classes = len(rows)
        attended_classes = sum(1 for r in rows if r["status"].lower() == "present")
        overall_pct = round((attended_classes / total_classes * 100), 1) if total_classes > 0 else 100.0

        # Group by subject
        subjects_map = {}
        for r in rows:
            sub = r["subject"]
            if sub not in subjects_map:
                subjects_map[sub] = {"total": 0, "attended": 0}
            subjects_map[sub]["total"] += 1
            if r["status"].lower() == "present":
                subjects_map[sub]["attended"] += 1

        # Check if user requested a specific subject
        target_subject = None
        for sub in subjects_map.keys():
            sub_clean = sub.lower()
            if sub_clean in q:
                target_subject = sub
                break
            # Distinctive words check (length > 3)
            words = [w for w in sub_clean.split() if len(w) > 3]
            if any(w in q for w in words):
                target_subject = sub
                break

        if target_subject:
            stats = subjects_map[target_subject]
            t = stats["total"]
            a = stats["attended"]
            m = t - a
            pct = round((a / t * 100), 1) if t > 0 else 100.0
            needed = max(0, 3 * t - 4 * a) if pct < 75.0 else 0

            status_badge = "🟢 Safe (>=80%)" if pct >= 80.0 else ("🟡 Warning (75-79%)" if pct >= 75.0 else "🔴 Critical (<75%)")
            res = (
                f"### 📚 Subject Attendance: **{target_subject}**\n\n"
                f"- **Student**: {display_name} ({roll_no})\n"
                f"- **Attended**: {a} / {t} classes ({m} missed)\n"
                f"- **Attendance Percentage**: **{pct}%** ({status_badge})\n"
            )
            if pct < 75.0:
                res += (
                    f"\n⚠️ **Statutory Cutoff Alert (< 75%)**:\n"
                    f"Your attendance in this subject is below the university exam threshold. "
                    f"You must attend the next **{needed} consecutive classes** to restore your attendance to at least 75%."
                )
            else:
                res += f"\n✅ **Exam Eligibility**: You currently meet the statutory 75% cutoff for this subject."
            return res

        # General attendance overview across all subjects
        low_subjects = []
        for sub, stats in subjects_map.items():
            pct = round((stats["attended"] / stats["total"] * 100), 1) if stats["total"] > 0 else 100.0
            if pct < 75.0:
                low_subjects.append((sub, pct, max(0, 3 * stats["total"] - 4 * stats["attended"])))

        res = (
            f"### 📊 Attendance & Exam Eligibility Report\n\n"
            f"**Student**: {display_name} | **Roll No**: {roll_no} | **Dept**: {dept}\n\n"
            f"- **Overall Attendance**: **{overall_pct}%** ({attended_classes}/{total_classes} classes attended)\n"
        )

        if low_subjects:
            res += f"- **Exam Eligibility Status**: ⚠️ **At Risk (< 75% in {len(low_subjects)} subject{'s' if len(low_subjects) > 1 else ''})**\n\n"
            res += f"#### ⚠️ Subjects Requiring Immediate Attention:\n"
            for sub, pct, needed in low_subjects:
                res += f"- **{sub}**: {pct}% (Need **{needed}** more consecutive classes for 75% cutoff)\n"
            res += "\n"
        else:
            res += f"- **Exam Eligibility Status**: ✅ **Eligible** (All subjects meet the statutory 75% cutoff threshold)\n\n"

        res += "#### 📋 Subject Breakdown:\n"
        res += "| Subject | Attended / Total | Percentage | Status |\n"
        res += "| :--- | :--- | :--- | :--- |\n"
        for sub, stats in subjects_map.items():
            t = stats["total"]
            a = stats["attended"]
            pct = round((a / t * 100), 1) if t > 0 else 100.0
            st = "Safe (>=80%)" if pct >= 80.0 else ("Warning (75-79%)" if pct >= 75.0 else "Critical (<75%)")
            res += f"| {sub} | {a} / {t} | {pct}% | {st} |\n"

        res += "\n💡 *Tip: Check your live session log in the new **Attendance & Eligibility** tab on your dashboard.*"
        return res

    def get_today_classes_interactive(self, roll_no: str, student_name: str, query: str) -> str:
        q = query.lower()
        conn = self.get_db_connection()
        cursor = conn.cursor()

        # Resolve student info
        cursor.execute("SELECT dept, year, role, name FROM students WHERE roll_no = ?", (roll_no,))
        student = cursor.fetchone()
        display_name = student["name"] if student and student["name"] else student_name
        dept = student["dept"] if student and student["dept"] else "CSE"
        raw_year = student["year"] if student and student["year"] is not None else 1
        year = raw_year if raw_year > 0 else 1

        # Determine target day
        days_map = {
            "monday": "Monday",
            "tuesday": "Tuesday",
            "wednesday": "Wednesday",
            "thursday": "Thursday",
            "friday": "Friday",
            "saturday": "Saturday",
            "sunday": "Sunday"
        }
        target_day = None
        for k, v in days_map.items():
            if k in q:
                target_day = v
                break

        current_day = datetime.datetime.now().strftime("%A")
        day_to_query = target_day if target_day else current_day

        is_weekend = day_to_query in ["Saturday", "Sunday"]
        if is_weekend:
            day_to_query = "Monday"
            header = f"### 🏖️ Weekend Notice ({current_day})\n"
            header += f"No regular theory classes are scheduled today. Here is your upcoming **Monday** class schedule:\n\n"
        else:
            header = f"### 📚 Today's Class Schedule ({day_to_query})\n\n"

        cursor.execute(
            "SELECT slot_1, slot_2, slot_3, slot_4 FROM timetable WHERE dept = ? AND year = ? AND day = ?",
            (dept, year, day_to_query)
        )
        row = cursor.fetchone()

        if not row:
            return (
                f"### 📅 Schedule for {day_to_query}\n\n"
                f"No classes scheduled for **{dept}** (Year {year}) on **{day_to_query}**.\n\n"
                f"- [Action: Show Full Weekly Timetable]\n"
                f"- [Action: Check My Attendance]\n"
                f"- [Action: Book Faculty Appointment]"
            )

        slot_timings = [
            ("Slot 1", "09:00 AM – 10:30 AM", row["slot_1"]),
            ("Slot 2", "10:30 AM – 12:00 PM", row["slot_2"]),
            ("Slot 3", "01:00 PM – 02:30 PM", row["slot_3"]),
            ("Slot 4", "02:30 PM – 04:00 PM", row["slot_4"]),
        ]

        res = header
        res += f"**Student**: {display_name} | **Dept**: {dept} | **Year**: {year}\n\n"

        for slot_num, time_str, sub in slot_timings:
            if not sub:
                continue
            details = self.get_subject_details(sub)
            faculty_name = ""
            venue_name = ""
            if details:
                parts = details.split("|")
                for p in parts:
                    if "Faculty:" in p:
                        faculty_name = p.replace("Faculty:", "").strip()
                    if "Venue:" in p:
                        venue_name = p.replace("Venue:", "").strip()

            res += f"- **{slot_num} ({time_str})**:\n"
            res += f"  📘 **{sub}**\n"
            if faculty_name:
                res += f"  👨‍🏫 Faculty: **{faculty_name}**\n"
            if venue_name:
                res += f"  📍 Venue: `{venue_name}`\n"
            res += "\n"

        res += "---\n"
        res += "💡 **Interactive Quick Actions**:\n"
        res += "- [Action: Show Full Weekly Timetable]\n"
        res += "- [Action: Check My Attendance]\n"
        res += "- [Action: Book Faculty Appointment]"
        return res
