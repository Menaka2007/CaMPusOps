import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import uvicorn
from fastapi import FastAPI, HTTPException 
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import datetime
from typing import List
from orchestrator import OrchestratorAgent, DB_PATH

app = FastAPI(title="Smart Campus Assistant Backend")

@app.get("/")
def root():
    return {"status": "ok", "service": "Smart Campus Assistant Backend"}

@app.get("/health")
def health_check():
    return {"status": "ok"}


# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = OrchestratorAgent()

# Database migration: add photo, priority, ai_flag columns to complaints table if not exists
conn = sqlite3.connect(DB_PATH)
try:
    conn.execute("ALTER TABLE complaints ADD COLUMN photo TEXT")
except sqlite3.OperationalError:
    pass

try:
    conn.execute("ALTER TABLE complaints ADD COLUMN priority TEXT DEFAULT 'Medium Priority 🛠️'")
except sqlite3.OperationalError:
    pass

try:
    conn.execute("ALTER TABLE complaints ADD COLUMN ai_flag TEXT DEFAULT 'Verified Genuine ✅'")
except sqlite3.OperationalError:
    pass

conn.commit()
conn.close()



class LoginRequest(BaseModel):
    roll_no: str
    password: str  # In a demo, password validation is basic

class StudentLoginRequest(BaseModel):
    register_number: str
    name: str

class StaffLoginRequest(BaseModel):
    faculty_id: str
    name: str

class AdminLoginRequest(BaseModel):
    username: str
    password: str

class QueryRequest(BaseModel):
    query: str
    roll_no: str
    name: str

class DirectAgentRequest(BaseModel):
    agent_name: str
    query: str
    roll_no: str
    name: str
    dept: str = "CSE"
    photo: str = None

class AttendanceRecord(BaseModel):
    roll_no: str
    status: str

class AttendanceSubmitRequest(BaseModel):
    dept: str
    year: int
    subject: str
    slot_index: int
    date: str
    records: List[AttendanceRecord]

class UpdateComplaintRequest(BaseModel):
    id: int
    status: str

class UpdateDocumentRequest(BaseModel):
    id: int
    status: str

class AddNotificationRequest(BaseModel):
    title: str
    content: str
    category: str
    sender_name: str = "Campus Registrar"
    sender_role: str = "admin"

@app.post("/api/login")
def login(request: LoginRequest):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # We query by roll_no
    cursor.execute("SELECT roll_no, name, dept, year, role FROM students WHERE roll_no = ?", (request.roll_no.strip(),))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=400, detail="User not found. Use demo credentials (e.g. 717721L101 for Student, STAFF001 for Staff, ADMIN001 for Admin).")
        
    return {
        "roll_no": user["roll_no"],
        "name": user["name"],
        "dept": user["dept"],
        "year": user["year"],
        "role": user["role"]
    }

@app.post("/api/login/student")
def login_student(request: StudentLoginRequest):
    entered_name = request.name.strip()
    
    allowed_students = [
        "Aravind Swamy",
        "J. Samhitha",
        "S. Chandrika",
        "Menaka S",
        "Vinisha",
        "Anushya",
        "Varsha",
        "Kanishka",
        "Prega",
        "Akshaya",
        "Madhumita"
    ]
    
    # Ensure no duplicates in the configuration
    lower_names = [name.lower() for name in allowed_students]
    if len(set(lower_names)) != len(allowed_students):
        raise HTTPException(status_code=400, detail="Duplicate names are not allowed in the configuration.")
        
    # Check if the name matches one of the 10 registered students case-insensitively
    if entered_name.lower() not in lower_names:
        raise HTTPException(status_code=400, detail="Access Denied. You are not a registered student.")
        
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    print(f"[DEBUG] login_student received register_number: '{request.register_number}', name: '{request.name}'")
    cursor.execute("SELECT id, roll_no, name, dept, year, role FROM students WHERE LOWER(name) = ? AND role = 'student'", (entered_name.lower(),))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=400, detail="Access Denied. You are not a registered student.")
        
    return {
        "success": True,
        "student_id": user["id"],
        "roll_no": user["roll_no"],
        "name": user["name"],
        "dept": user["dept"],
        "year": user["year"],
        "role": user["role"]
    }

@app.post("/api/login/staff")
def login_staff(request: StaffLoginRequest):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, roll_no, name, dept, role FROM students WHERE roll_no = ? AND LOWER(name) = ? AND role = 'staff'", (request.faculty_id.strip(), request.name.strip().lower()))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=400, detail="Register number and name don't match our records")
        
    return {
        "success": True,
        "faculty_id": user["roll_no"],
        "name": user["name"],
        "department": user["dept"],
        "role": user["role"]
    }

@app.post("/api/login/admin")
def login_admin(request: AdminLoginRequest):
    ADMIN_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "admin.db")
    if not os.path.exists(ADMIN_DB_PATH):
        raise HTTPException(status_code=400, detail="Admin database not initialized. Please run create_admin.py script.")
        
    import hashlib
    conn = sqlite3.connect(ADMIN_DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT password_hash, salt FROM admin WHERE username = ?", (request.username.strip(),))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
        
    hashed = hashlib.sha256((request.password.strip() + row["salt"]).encode('utf-8')).hexdigest()
    if hashed != row["password_hash"]:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
        
    return {
        "success": True,
        "roll_no": "ADMIN001",
        "name": "Campus Registrar",
        "role": "admin"
    }

@app.post("/api/query")
def query_orchestrator(request: QueryRequest):
    result = orchestrator.process_query(
        query=request.query,
        student_roll=request.roll_no,
        student_name=request.name
    )
    return result

@app.post("/api/direct-agent")
def query_direct_agent(request: DirectAgentRequest):
    # Route directly to the requested specialist agent
    if request.agent_name not in orchestrator.agents:
        raise HTTPException(status_code=400, detail="Specialist agent not found")
        
    agent = orchestrator.agents[request.agent_name]
    context = {
        "roll_no": request.roll_no,
        "student_name": request.name,
        "dept": request.dept,
        "photo": request.photo
    }
    
    try:
        response = agent.handle(request.query, context)
    except Exception as e:
        response = f"An error occurred: {str(e)}"
        
    return {
        "agent": request.agent_name,
        "response": response,
        "query": request.query
    }

@app.get("/api/timetable/student/{roll_no}")
def get_student_timetable_json(roll_no: str):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Resolve student info
    cursor.execute("SELECT dept, year FROM students WHERE roll_no = ?", (roll_no.strip(),))
    student = cursor.fetchone()
    if not student:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")
        
    dept = student["dept"]
    year = student["year"]
    
    cursor.execute("SELECT day, slot_1, slot_2, slot_3, slot_4 FROM timetable WHERE dept = ? AND year = ?", (dept, year))
    slots = cursor.fetchall()
    conn.close()
    
    timetable_list = []
    for row in slots:
        timetable_list.append({
            "day": row["day"],
            "slot_1": row["slot_1"],
            "slot_2": row["slot_2"],
            "slot_3": row["slot_3"],
            "slot_4": row["slot_4"]
        })
    return {"timetable": timetable_list}

@app.get("/api/student/attendance/{roll_no}")
def get_student_attendance(roll_no: str):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Verify student exists
    cursor.execute("SELECT name, dept, year FROM students WHERE roll_no = ?", (roll_no.strip(),))
    student = cursor.fetchone()
    if not student:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")

    cursor.execute("""
        SELECT id, dept, year, subject, slot_index, date, status
        FROM attendance
        WHERE roll_no = ?
        ORDER BY date DESC, slot_index DESC
    """, (roll_no.strip(),))
    rows = cursor.fetchall()
    conn.close()

    total_classes = len(rows)
    attended_classes = sum(1 for r in rows if r["status"].lower() == "present")
    missed_classes = total_classes - attended_classes
    overall_pct = round((attended_classes / total_classes * 100), 1) if total_classes > 0 else 100.0

    # Subject-wise calculation
    subjects_map = {}
    for r in rows:
        sub = r["subject"]
        if sub not in subjects_map:
            subjects_map[sub] = {"total": 0, "attended": 0}
        subjects_map[sub]["total"] += 1
        if r["status"].lower() == "present":
            subjects_map[sub]["attended"] += 1

    subject_list = []
    low_attendance_subjects = []

    for sub, stats in subjects_map.items():
        sub_total = stats["total"]
        sub_att = stats["attended"]
        sub_pct = round((sub_att / sub_total * 100), 1) if sub_total > 0 else 100.0
        
        # Calculate classes needed to reach 75%
        # (attended + x) / (total + x) >= 0.75  =>  x >= 3*total - 4*attended
        needed = max(0, 3 * sub_total - 4 * sub_att) if sub_pct < 75.0 else 0
        
        status = "Safe" if sub_pct >= 80.0 else ("Warning" if sub_pct >= 75.0 else "Critical")
        
        item = {
            "subject": sub,
            "total_classes": sub_total,
            "attended_classes": sub_att,
            "missed_classes": sub_total - sub_att,
            "percentage": sub_pct,
            "is_low": sub_pct < 75.0,
            "status": status,
            "classes_needed_for_75": needed
        }
        subject_list.append(item)
        if sub_pct < 75.0:
            low_attendance_subjects.append(sub)

    # If student has no recorded attendance yet, provide realistic mock subjects so UI is never empty
    if total_classes == 0:
        default_subs = [
            {"subject": "Engineering Math I", "total_classes": 12, "attended_classes": 11, "missed_classes": 1, "percentage": 91.7, "is_low": False, "status": "Safe", "classes_needed_for_75": 0},
            {"subject": "Technical English", "total_classes": 10, "attended_classes": 9, "missed_classes": 1, "percentage": 90.0, "is_low": False, "status": "Safe", "classes_needed_for_75": 0},
            {"subject": "Programming in C", "total_classes": 14, "attended_classes": 12, "missed_classes": 2, "percentage": 85.7, "is_low": False, "status": "Safe", "classes_needed_for_75": 0},
            {"subject": "Engineering Physics", "total_classes": 10, "attended_classes": 7, "missed_classes": 3, "percentage": 70.0, "is_low": True, "status": "Critical", "classes_needed_for_75": 2}
        ]
        overall_pct = 84.8
        total_classes = 46
        attended_classes = 39
        missed_classes = 7
        subject_list = default_subs
        low_attendance_subjects = ["Engineering Physics"]

    return {
        "student_name": student["name"],
        "roll_no": roll_no,
        "department": student["dept"],
        "year": student["year"],
        "total_classes": total_classes,
        "attended_classes": attended_classes,
        "missed_classes": missed_classes,
        "overall_percentage": overall_pct,
        "is_eligible_for_exams": overall_pct >= 75.0,
        "has_low_attendance": len(low_attendance_subjects) > 0 or overall_pct < 75.0,
        "low_attendance_subjects": low_attendance_subjects,
        "subjects": subject_list,
        "recent_sessions": [
            {
                "id": r["id"],
                "date": r["date"],
                "subject": r["subject"],
                "slot_index": r["slot_index"],
                "status": r["status"]
            }
            for r in rows[:15]
        ]
    }

class AddSlotRequest(BaseModel):
    dept: str
    year: int
    day: str
    slot_index: int
    subject: str

class DeleteSlotRequest(BaseModel):
    dept: str
    year: int
    day: str
    slot_index: int

@app.get("/api/staff/timetable/{dept}")
def get_staff_timetable(dept: str):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT year, day, slot_1, slot_2, slot_3, slot_4, slot_5, slot_6 FROM timetable WHERE dept = ?", (dept.strip(),))
    slots = cursor.fetchall()
    conn.close()
    
    timetable_list = []
    for row in slots:
        timetable_list.append({
            "year": row["year"],
            "day": row["day"],
            "slot_1": row["slot_1"] or "",
            "slot_2": row["slot_2"] or "",
            "slot_3": row["slot_3"] or "",
            "slot_4": row["slot_4"] or "",
            "slot_5": row["slot_5"] or "",
            "slot_6": row["slot_6"] or ""
        })
    return {"timetable": timetable_list}

@app.post("/api/staff/timetable/add")
def add_staff_slot(request: AddSlotRequest):
    if request.slot_index < 1 or request.slot_index > 6:
        raise HTTPException(status_code=400, detail="Invalid slot index. Must be 1 to 6.")
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    slot_column = f"slot_{request.slot_index}"
    
    # Check if a row exists for this dept, year, day
    cursor.execute("SELECT id FROM timetable WHERE dept = ? AND year = ? AND day = ?", (request.dept, request.year, request.day))
    row = cursor.fetchone()
    
    if row:
        cursor.execute(f"UPDATE timetable SET {slot_column} = ? WHERE id = ?", (request.subject, row[0]))
    else:
        # Create row
        cols = ["dept", "year", "day", slot_column]
        placeholders = ["?", "?", "?", "?"]
        vals = [request.dept, request.year, request.day, request.subject]
        cursor.execute(f"INSERT INTO timetable ({', '.join(cols)}) VALUES ({', '.join(placeholders)})", vals)
        
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Slot added successfully"}

@app.post("/api/staff/timetable/delete")
def delete_staff_slot(request: DeleteSlotRequest):
    if request.slot_index < 1 or request.slot_index > 6:
        raise HTTPException(status_code=400, detail="Invalid slot index. Must be 1 to 6.")
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    slot_column = f"slot_{request.slot_index}"
    cursor.execute(f"UPDATE timetable SET {slot_column} = '' WHERE dept = ? AND year = ? AND day = ?", (request.dept, request.year, request.day))
    
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Slot cleared successfully"}

@app.get("/api/staff/meetings")
def get_staff_meetings():
    # Return mock meetings matching the UI screenshot
    return {
        "meetings": [
            {"id": 1, "title": "Department Syllabus Review", "time": "2026-07-29 @ 04:15 PM", "location": "CSE Conference Room"},
            {"id": 2, "title": "Academic Council Board Meeting", "time": "2026-08-04 @ 11:30 AM", "location": "Principal's Office"}
        ]
    }

@app.get("/api/staff/invigilations")
def get_staff_invigilations():
    # Return mock invigilations matching the UI screenshot
    return {
        "invigilations": [
            {"id": 1, "title": "Midterm Test - Basic ECE", "time": "2026-08-14 @ 10:00 AM - 12:00 PM", "location": "Room LH-2"}
        ]
    }

@app.get("/api/staff/students")
def get_staff_students(dept: str = "CSE", year: int = 1):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT roll_no, name FROM students WHERE dept = ? AND year = ? AND role = 'student' ORDER BY roll_no", (dept.strip(), year))
    rows = cursor.fetchall()
    
    # Fallback to all students in department if specific year has no students
    if not rows:
        cursor.execute("SELECT roll_no, name FROM students WHERE dept = ? AND role = 'student' ORDER BY roll_no", (dept.strip(),))
        rows = cursor.fetchall()
        
    # Fallback to all registered students if no department match
    if not rows:
        cursor.execute("SELECT roll_no, name FROM students WHERE role = 'student' ORDER BY roll_no")
        rows = cursor.fetchall()

    conn.close()
    return [{"roll_no": r["roll_no"], "name": r["name"]} for r in rows]

@app.post("/api/staff/attendance/submit")
def submit_attendance(request: AttendanceSubmitRequest):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        # First delete existing attendance for this combination to prevent duplicates
        cursor.execute("""
            DELETE FROM attendance 
            WHERE dept = ? AND year = ? AND subject = ? AND slot_index = ? AND date = ?
        """, (request.dept, request.year, request.subject, request.slot_index, request.date))
        
        # Insert new records
        for rec in request.records:
            cursor.execute("""
                INSERT INTO attendance (dept, year, subject, slot_index, date, roll_no, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (request.dept, request.year, request.subject, request.slot_index, request.date, rec.roll_no, rec.status))
        conn.commit()
    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    conn.close()
    return {"status": "success", "message": "Attendance submitted successfully"}

@app.get("/api/admin/metrics")
def get_admin_metrics():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    total_students = 60
    
    cursor.execute("SELECT COUNT(*) FROM complaints WHERE status != 'Resolved'")
    pending_complaints = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM documents WHERE status = 'Submitted' or status = 'Pending'")
    pending_docs = cursor.fetchone()[0]
    
    cursor.execute("SELECT SUM(total - paid) FROM fees")
    outstanding_fees = cursor.fetchone()[0] or 0.0
    
    conn.close()
    return {
        "total_students": total_students,
        "pending_complaints": pending_complaints,
        "pending_docs": pending_docs,
        "outstanding_fees": outstanding_fees
    }

@app.get("/api/admin/complaints")
def get_admin_complaints():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        SELECT c.id, c.roll_no, s.name as student_name, c.category, c.description, c.status, c.date, c.photo, c.priority, c.ai_flag 
        FROM complaints c 
        LEFT JOIN students s ON c.roll_no = s.roll_no 
        ORDER BY c.id DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/api/admin/complaints/update")
def update_complaint_status(request: UpdateComplaintRequest):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE complaints SET status = ? WHERE id = ?", (request.status, request.id))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Complaint status updated"}

@app.post("/api/admin/complaints/clean-spam")
def clean_spam_complaints():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # 1. Direct delete by existing ai_flag
    cursor.execute("DELETE FROM complaints WHERE ai_flag LIKE '%Gibberish%' OR ai_flag LIKE '%Spam%' OR ai_flag LIKE '%Abusive%' OR ai_flag LIKE '%Too Short%'")
    direct_deleted = cursor.rowcount
    
    # 2. Retroactive scan of remaining complaints using ComplaintAgent AI Moderation
    from agents.complaint import ComplaintAgent
    agent = ComplaintAgent(DB_PATH)
    
    cursor.execute("SELECT id, description, ai_flag FROM complaints")
    rows = cursor.fetchall()
    
    extra_deleted = 0
    for r in rows:
        eval_res = agent.analyze_complaint_with_ai(r["description"])
        if not eval_res["is_valid"]:
            cursor.execute("DELETE FROM complaints WHERE id = ?", (r["id"],))
            extra_deleted += 1
            
    total_deleted = direct_deleted + extra_deleted
    conn.commit()
    conn.close()
    return {
        "status": "success", 
        "message": f"AI Purge Engine completed: {total_deleted} spam/unusual complaints automatically removed from database." if total_deleted > 0 else "AI Purge Engine scanned all complaints: 0 spam complaints found. Database is 100% clean! ✅"
    }


@app.get("/api/admin/documents")
def get_admin_documents():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        SELECT d.id, d.roll_no, s.name as student_name, d.type, d.status, d.requested_date 
        FROM documents d 
        LEFT JOIN students s ON d.roll_no = s.roll_no 
        ORDER BY d.id DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/api/admin/documents/update")
def update_document_status(request: UpdateDocumentRequest):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE documents SET status = ? WHERE id = ?", (request.status, request.id))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Document request status updated"}

@app.post("/api/admin/notifications/add")
@app.post("/api/notifications/add")
def add_notification(request: AddNotificationRequest):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    today = datetime.date.today().strftime("%Y-%m-%d")
    cursor.execute(
        "INSERT INTO notifications (title, content, date, category, sender_name, sender_role) VALUES (?, ?, ?, ?, ?, ?)",
        (request.title, request.content, today, request.category, request.sender_name, request.sender_role)
    )
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Notification broadcasted successfully"}

@app.get("/api/admin/notifications")
@app.get("/api/notifications")
def get_admin_notifications():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, title, content, date, category, sender_name, sender_role
        FROM notifications
        ORDER BY id DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/api/academic-calendar")
def get_academic_calendar():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, date, type FROM academic_calendar ORDER BY date ASC")
    rows = cursor.fetchall()
    conn.close()
    return {"calendar": [dict(r) for r in rows]}

class AddEventRequest(BaseModel):
    title: str
    date: str
    type: str = "event"

class DeleteEventRequest(BaseModel):
    id: int

@app.post("/api/academic-calendar/add")
def add_calendar_event(request: AddEventRequest):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO academic_calendar (title, date, type) VALUES (?, ?, ?)", (request.title, request.date, request.type))
    
    # Log a bulletin notice for the scheduled event
    clean_title = request.title.split(" |tags:")[0]
    category = "workshop"
    today = datetime.date.today().strftime("%Y-%m-%d")
    cursor.execute(
        "INSERT INTO notifications (title, content, date, category, sender_name, sender_role) VALUES (?, ?, ?, ?, ?, ?)",
        (f"Event: {clean_title}", f"A new campus event has been scheduled for {request.date}.\nDetails: {request.title}", today, category, "Faculty Organizer", "teacher")
    )
    
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Event added successfully"}

@app.post("/api/academic-calendar/delete")
def delete_calendar_event(request: DeleteEventRequest):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM academic_calendar WHERE id = ?", (request.id,))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Event deleted successfully"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
