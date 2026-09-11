import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "campus.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Drop existing tables if any
    tables = [
        "students", "faculty", "departments", "academic_calendar",
        "timetable", "exams", "fees", "complaints", "documents",
        "notifications", "lost_found", "reminders", "assignments",
        "faculty_bookings", "attendance"
    ]
    for table in tables:
        cursor.execute(f"DROP TABLE IF EXISTS {table}")

    # Create tables
    cursor.execute("""
    CREATE TABLE students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roll_no TEXT UNIQUE,
        name TEXT,
        dept TEXT,
        year INTEGER,
        email TEXT,
        role TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE faculty (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        dept TEXT,
        designation TEXT,
        email TEXT,
        room_no TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        code TEXT UNIQUE
    )
    """)

    cursor.execute("""
    CREATE TABLE academic_calendar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        date TEXT,
        type TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE timetable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dept TEXT,
        year INTEGER,
        day TEXT,
        slot_1 TEXT,
        slot_2 TEXT,
        slot_3 TEXT,
        slot_4 TEXT,
        slot_5 TEXT,
        slot_6 TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE exams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT,
        code TEXT,
        date TEXT,
        time TEXT,
        type TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE fees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roll_no TEXT,
        type TEXT,
        total REAL,
        paid REAL,
        due_date TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roll_no TEXT,
        category TEXT,
        description TEXT,
        status TEXT,
        date TEXT,
        photo TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roll_no TEXT,
        type TEXT,
        status TEXT,
        requested_date TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        date TEXT,
        category TEXT,
        sender_name TEXT DEFAULT 'Campus Registrar',
        sender_role TEXT DEFAULT 'admin'
    )
    """)

    cursor.execute("""
    CREATE TABLE lost_found (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_name TEXT,
        description TEXT,
        status TEXT,
        reported_by TEXT,
        contact TEXT,
        date TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roll_no TEXT,
        title TEXT,
        date TEXT,
        time TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roll_no TEXT,
        subject TEXT,
        title TEXT,
        due_date TEXT,
        status TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE faculty_bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_name TEXT,
        reg_no TEXT,
        dept TEXT,
        faculty_name TEXT,
        date TEXT,
        time TEXT,
        purpose TEXT,
        status TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dept TEXT,
        year INTEGER,
        subject TEXT,
        slot_index INTEGER,
        date TEXT,
        roll_no TEXT,
        status TEXT
    )
    """)

    students_data = [
        ("717721L101", "Aravind Swamy", "CSE", 1, "aravind@sece.ac.in", "student"),
        ("717721L102", "J. Samhitha", "CSE", 1, "samhitha.j@sece.ac.in", "student"),
        ("717721L103", "Vinisha", "CSE", 1, "vinisha@sece.ac.in", "student"),
        ("717721L104", "Anushya", "CSE", 2, "anushya@sece.ac.in", "student"),
        ("717721L105", "Varsha", "CSE", 2, "varsha@sece.ac.in", "student"),
        ("717721L106", "Kanishka", "CSE", 3, "kanishka@sece.ac.in", "student"),
        ("717721L107", "Prega", "CSE", 3, "prega@sece.ac.in", "student"),
        ("717721L108", "Akshaya", "CSE", 4, "akshaya@sece.ac.in", "student"),
        ("717721L109", "Madhumita", "CSE", 4, "madhumita@sece.ac.in", "student"),
        ("717721L110", "S. Chandrika", "ECE", 1, "chandrika.s@sece.ac.in", "student"),
        ("717721L111", "Menaka S", "IT", 4, "menaka.s@sece.ac.in", "student"),
        ("STAFF001", "Dr. Balasubramanian", "CSE", 0, "bala.cse@sece.ac.in", "staff"),
        ("ADMIN001", "Campus Registrar", "ADMIN", 0, "registrar@sece.ac.in", "admin")
    ]
    cursor.executemany("INSERT INTO students (roll_no, name, dept, year, email, role) VALUES (?, ?, ?, ?, ?, ?)", students_data)

    # 2. Faculty
    faculty_data = [
        ("Dr. Ramakrishnan", "CSE", "Professor & Head", "ramakrishnan.cse@sece.ac.in", "LH-403"),
        ("Dr. Raj Thilak", "CSE", "Associate Professor", "rajthilak.cse@sece.ac.in", "SF07"),
        ("Dr. Geetha", "CSE", "Professor", "geetha.cse@sece.ac.in", "SF07"),
        ("Dr. Guna Priya", "CSE", "Associate Professor", "gunapriya.cse@sece.ac.in", "TF 17"),
        ("Dr. Anbuarasu", "CSE", "Assistant Professor", "anbuarasu.cse@sece.ac.in", "TF 17"),
        ("Dr. Batcha", "CSE", "Associate Professor", "batcha.cse@sece.ac.in", "SIMULATION LAB"),
        ("Mr. Premkumar", "CSE", "Assistant Professor", "premkumar.cse@sece.ac.in", "CODE STUDIO"),
        ("Dr. Kavitha", "ECE", "Professor", "kavitha.ece@sece.ac.in", "B-Block 105"),
        ("Mr. Vignesh", "IT", "Assistant Professor", "vignesh.it@sece.ac.in", "A-Block 410"),
        ("Mrs. Shanthi", "EEE", "Associate Professor", "shanthi.eee@sece.ac.in", "C-Block 201"),
        ("Dr. Srinivasan", "MATH", "Professor", "srinivasan.math@sece.ac.in", "LH-101"),
        ("Dr. Radhakrishnan", "PHY", "Professor", "radhakrishnan.phy@sece.ac.in", "PHYSICS LAB"),
        ("Dr. Saravanan", "CHEM", "Professor", "saravanan.chem@sece.ac.in", "CHEMISTRY LAB"),
        ("Dr. Balasubramanian", "CSE", "Professor", "bala.cse@sece.ac.in", "LAB 2"),
        ("Dr. Hariharan", "ECE", "Professor", "hariharan.ece@sece.ac.in", "SIMULATION LAB")
    ]
    cursor.executemany("INSERT INTO faculty (name, dept, designation, email, room_no) VALUES (?, ?, ?, ?, ?)", faculty_data)

    # 3. Departments
    depts = [
        ("Computer Science and Engineering", "CSE"),
        ("Electronics and Communication Engineering", "ECE"),
        ("Information Technology", "IT"),
        ("Electrical and Electronics Engineering", "EEE"),
        ("Mechanical Engineering", "MECH")
    ]
    cursor.executemany("INSERT INTO departments (name, code) VALUES (?, ?)", depts)

    # 4. Academic Calendar
    calendar_data = [
        ("Independence Day Celebration", "2026-08-15", "holiday"),
        ("Gender-Neutral Pronoun Workshop & Safe Space Training", "2026-08-22", "event"),
        ("Internal Assessment Test I", "2026-09-01", "exam"),
        ("Decolonizing STEM & Intersectionality in Computing Seminar", "2026-09-08", "event"),
        ("Eco-Anxiety Support Group & Climate Justice Circle", "2026-09-18", "event"),
        ("Annual Cultural Fest - ESHWARIA (100% Carbon Neutral & Vegan)", "2026-09-25", "event"),
        ("Gandhi Jayanthi", "2026-10-02", "holiday"),
        ("Semester End Examinations", "2026-11-15", "exam")
    ]
    cursor.executemany("INSERT INTO academic_calendar (title, date, type) VALUES (?, ?, ?)", calendar_data)

    # 5. Timetable (CSE Years 1-4, ECE Year 3, IT Year 4)
    timetable_data = [
        # CSE Year 1
        ("CSE", 1, "Monday", "Technical English", "Engineering Math I", "Engineering Physics", "Engineering Chemistry", "", ""),
        ("CSE", 1, "Tuesday", "Engineering Physics", "Engineering Chemistry", "Engineering Math I", "Technical English", "", ""),
        ("CSE", 1, "Wednesday", "Engineering Math I", "Programming in C", "Engineering Physics", "C Programming Lab", "", ""),
        ("CSE", 1, "Thursday", "Technical English", "Programming in C", "Engineering Math I", "Engineering Physics", "", ""),
        ("CSE", 1, "Friday", "Engineering Chemistry", "Programming in C", "Engineering Math I", "Python Programming", "", ""),

        # CSE Year 2
        ("CSE", 2, "Monday", "Discrete Mathematics", "Data Structures", "Digital Principles", "OOPs using C++", "", ""),
        ("CSE", 2, "Tuesday", "Data Structures", "OOPs using C++", "Discrete Mathematics", "Data Structures Lab", "", ""),
        ("CSE", 2, "Wednesday", "Digital Principles", "Discrete Mathematics", "OOPs using C++", "Data Structures", "", ""),
        ("CSE", 2, "Thursday", "Data Structures", "Discrete Mathematics", "Digital Principles", "C++ Programming Lab", "", ""),
        ("CSE", 2, "Friday", "OOPs using C++", "Data Structures", "Discrete Mathematics", "Digital Principles", "", ""),

        # CSE Year 3
        ("CSE", 3, "Monday", "Data Science", "Machine Learning", "PE", "LDIC", "Cloud Computing", "Internet of Things"),
        ("CSE", 3, "Tuesday", "Cloud Computing", "Compiler Design", "PE", "LDIC", "Soft Skills", "Cloud Computing"),
        ("CSE", 3, "Wednesday", "Machine Learning", "Data Science", "Internet of Things", "PE", "LDIC", "Data Science"),
        ("CSE", 3, "Thursday", "Compiler Design", "Cloud Computing", "PE", "LDIC", "Machine Learning", "Soft Skills"),
        ("CSE", 3, "Friday", "Internet of Things", "Machine Learning Lab", "Machine Learning Lab", "PE", "LDIC", "Compiler Design"),
        
        # CSE Year 4
        ("CSE", 4, "Monday", "Cryptography & Security", "Ad Hoc Networks", "Professional Elective V", "Project Phase II", "", ""),
        ("CSE", 4, "Tuesday", "Ad Hoc Networks", "Professional Elective V", "Cryptography & Security", "Project Phase II", "", ""),
        ("CSE", 4, "Wednesday", "Cryptography & Security", "Ad Hoc Networks", "Project Phase II", "Project Phase II", "", ""),
        ("CSE", 4, "Thursday", "Professional Elective V", "Cryptography & Security", "Ad Hoc Networks", "Project Phase II", "", ""),
        ("CSE", 4, "Friday", "Project Phase II", "Project Phase II", "Project Phase II", "Project Phase II", "", ""),

        # ECE Year 1
        ("ECE", 1, "Monday", "Technical English", "Engineering Math I", "Engineering Physics", "Basic Electrical Engg", "", ""),
        ("ECE", 1, "Tuesday", "Engineering Physics", "Basic Electrical Engg", "Engineering Math I", "Technical English", "", ""),
        ("ECE", 1, "Wednesday", "Engineering Math I", "Basic Electrical Engg", "Programming in C", "Physics Lab", "", ""),
        ("ECE", 1, "Thursday", "Technical English", "Programming in C", "Engineering Math I", "Basic Electrical Engg", "", ""),
        ("ECE", 1, "Friday", "Basic Electrical Engg", "Programming in C", "Engineering Physics", "Python Programming", "", ""),

        # ECE Year 3
        ("ECE", 3, "Monday", "VLSI Design", "Microcontrollers", "Digital Signal Processing", "Antennas", "PE", "LDIC"),
        ("ECE", 3, "Tuesday", "Microcontrollers", "Antennas", "VLSI Design", "DSP Lab", "PE", "LDIC"),
        ("ECE", 3, "Wednesday", "Digital Signal Processing", "VLSI Design", "Microcontrollers", "Antennas", "PE", "LDIC"),
        ("ECE", 3, "Thursday", "Antennas", "Digital Signal Processing", "VLSI Design", "Embedded Lab", "PE", "LDIC"),
        ("ECE", 3, "Friday", "VLSI Design", "Microcontrollers", "Digital Signal Processing", "Antennas", "PE", "LDIC"),

        # IT Year 4
        ("IT", 4, "Monday", "Cyber Security", "Mobile Computing", "Project Work Phase 2", "Project Work Phase 2", "PE", "LDIC"),
        ("IT", 4, "Tuesday", "Mobile Computing", "Cloud Computing", "Cyber Security", "Project Work Phase 2", "PE", "LDIC"),
        ("IT", 4, "Wednesday", "Cyber Security", "Big Data Analytics", "Mobile Computing", "Cloud Lab", "PE", "LDIC"),
        ("IT", 4, "Thursday", "Big Data Analytics", "Cyber Security", "Project Work Phase 2", "Project Work Phase 2", "PE", "LDIC"),
        ("IT", 4, "Friday", "Project Work Phase 2", "Mobile Computing", "Big Data Analytics", "Project Work Phase 2", "PE", "LDIC")
    ]
    cursor.executemany("INSERT INTO timetable (dept, year, day, slot_1, slot_2, slot_3, slot_4, slot_5, slot_6) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", timetable_data)

    # 6. Exams
    exams_data = [
        ("Machine Learning", "CS8691", "2026-09-01", "09:30 AM - 12:30 PM", "internal"),
        ("Compiler Design", "CS8602", "2026-09-02", "09:30 AM - 12:30 PM", "internal"),
        ("Data Science", "CS8601", "2026-09-03", "09:30 AM - 12:30 PM", "internal"),
        ("Semester Theory Exam - Machine Learning", "CS8691", "2026-11-15", "10:00 AM - 01:00 PM", "semester"),
        ("Semester Theory Exam - Compiler Design", "CS8602", "2026-11-17", "10:00 AM - 01:00 PM", "semester")
    ]
    cursor.executemany("INSERT INTO exams (subject, code, date, time, type) VALUES (?, ?, ?, ?, ?)", exams_data)

    # 7. Fee records
    fees_data = [
        ("717721L101", "Tuition Fee", 85000.0, 85000.0, "2026-06-30"),
        ("717721L101", "Exam Fee", 3200.0, 0.0, "2026-08-15"),
        ("717721L101", "Hostel Fee", 65000.0, 45000.0, "2026-07-15"),
        ("717721L101", "Bus Fee", 22000.0, 22000.0, "2026-06-30"),
        
        ("717721L102", "Tuition Fee", 85000.0, 80000.0, "2026-06-30"),
        ("717721L102", "Exam Fee", 3200.0, 3200.0, "2026-08-15"),

        ("717721L103", "Tuition Fee", 90000.0, 90000.0, "2026-06-30"),
        ("717721L103", "Bus Fee", 18000.0, 10000.0, "2026-07-31"),
        ("717721L103", "Library Fee", 1500.0, 1500.0, "2026-08-10"),

        ("717721L104", "Tuition Fee", 85000.0, 45000.0, "2026-06-30"),
        ("717721L104", "Exam Fee", 3200.0, 0.0, "2026-08-15"),

        ("717721L105", "Tuition Fee", 85000.0, 85000.0, "2026-06-30"),
        ("717721L105", "Exam Fee", 3200.0, 3200.0, "2026-08-15"),
        ("717721L105", "Placement Training Fee", 10000.0, 5000.0, "2026-09-01"),

        ("717721L106", "Tuition Fee", 85000.0, 85000.0, "2026-06-30"),
        ("717721L106", "Hostel Fee", 70000.0, 70000.0, "2026-07-15"),

        ("717721L107", "Tuition Fee", 88000.0, 60000.0, "2026-06-30"),
        ("717721L107", "Exam Fee", 3400.0, 3400.0, "2026-08-15"),
        ("717721L107", "Lab Fee", 5000.0, 0.0, "2026-08-20"),

        ("717721L108", "Tuition Fee", 85000.0, 85000.0, "2026-06-30"),
        ("717721L108", "Bus Fee", 25000.0, 15000.0, "2026-07-31"),

        ("717721L109", "Tuition Fee", 85000.0, 85000.0, "2026-06-30"),
        ("717721L109", "Exam Fee", 3200.0, 3200.0, "2026-08-15"),

        ("717721L110", "Tuition Fee", 92000.0, 50000.0, "2026-06-30"),
        ("717721L110", "Exam Fee", 3200.0, 0.0, "2026-08-15"),
        ("717721L110", "Hostel Fee", 65000.0, 65000.0, "2026-07-15")
    ]
    cursor.executemany("INSERT INTO fees (roll_no, type, total, paid, due_date) VALUES (?, ?, ?, ?, ?)", fees_data)

    # 8. Complaints
    complaints_data = [
        ("717721L101", "Classroom Complaint", "AC remote is missing in Room 304", "In Progress", "2026-07-28"),
        ("717721L102", "Hostel Complaint", "No hot water in Block C bathroom", "Resolved", "2026-07-25")
    ]
    cursor.executemany("INSERT INTO complaints (roll_no, category, description, status, date) VALUES (?, ?, ?, ?, ?)", complaints_data)

    # 9. Documents
    docs_data = [
        ("717721L101", "Bonafide Certificate", "Approved & Ready to Collect", "2026-07-27"),
        ("717721L101", "No Due Certificate", "Pending Department Approval", "2026-07-29")
    ]
    cursor.executemany("INSERT INTO documents (roll_no, type, status, requested_date) VALUES (?, ?, ?, ?)", docs_data)

    # 10. Notifications
    notif_data = [
        ("Placement Drive: Zoho Corporation", "Zoho is visiting SECE on August 10th for Software Engineer role. CTC: 8.5 LPA. Register before August 5th.", "2026-07-29", "placement", "Placement Officer", "admin"),
        ("Workshop on Generative AI", "A 2-day national level workshop on Generative AI is organized by CSE Dept on August 20-21. Register in college portal.", "2026-07-28", "workshop", "Dr. Balasubramanian", "teacher"),
        ("Exam Fees Notification", "All students must pay their Semester Exam Fees on or before August 15th to avoid late fee penalties.", "2026-07-27", "exam", "Campus Registrar", "admin"),
        ("Emergency Notice: Rain Alert", "Heavy rain is forecast for tomorrow. College will function as normal, but college buses will leave 15 mins early.", "2026-07-30", "emergency", "Campus Registrar", "admin"),
        ("Special Lecture: Quantum Computing", "Guest lecture by Dr. Ramesh from IIT Madras on Friday at 2:00 PM in Seminar Hall 1. All CSE & ECE students are invited.", "2026-07-29", "teacher_notice", "Dr. Ramakrishnan", "teacher"),
        ("Lab Manual Submission Deadline", "Submit your Machine Learning lab manuals on or before this Friday for internal valuation. Late submissions will lose internal marks.", "2026-07-30", "teacher_notice", "Dr. Kavitha", "teacher"),
        ("Lost: Black HP Laptop Charger", "Lost my HP laptop charger in CSE Lab 3 near system 45. If found, please contact me or leave it with the security desk.", "2026-07-29", "lost_found", "Aravind Swamy", "student"),
        ("Found: Milton Blue Water Bottle", "Found a blue steel Milton water bottle in C-Block Seminar Hall. Please claim it at the Security Desk.", "2026-07-28", "lost_found", "Security Desk", "admin"),
        ("Symposium Registration Open", "Registrations for our national-level technical symposium are now open. Visit the desk in Block A or register online.", "2026-07-30", "student_post", "J. Samhitha", "student")
    ]
    cursor.executemany("INSERT INTO notifications (title, content, date, category, sender_name, sender_role) VALUES (?, ?, ?, ?, ?, ?)", notif_data)

    # 11. Lost & Found
    lost_found_data = [
        ("Black HP Laptop Charger", "Left in CSE Lab 3 near system 45", "lost", "Aravind Swamy", "9876543210", "2026-07-29"),
        ("Milton Water Bottle", "Blue steel bottle found in C-Block Seminar Hall", "found", "Security Desk", "0422-262728", "2026-07-28")
    ]
    cursor.executemany("INSERT INTO lost_found (item_name, description, status, reported_by, contact, date) VALUES (?, ?, ?, ?, ?, ?)", lost_found_data)

    # 12. Reminders
    reminders_data = [
        ("717721L101", "Submit ML Lab Report", "2026-08-05", "11:59 PM"),
        ("717721L101", "Pay Exam Fee", "2026-08-10", "04:00 PM")
    ]
    cursor.executemany("INSERT INTO reminders (roll_no, title, date, time) VALUES (?, ?, ?, ?)", reminders_data)

    # 13. Assignments
    assignments_data = [
        ("717721L101", "Compiler Design", "Assignment 2 - Parsing Trees", "2026-08-08", "pending"),
        ("717721L101", "Machine Learning", "Project Proposal submission", "2026-08-12", "pending")
    ]
    cursor.executemany("INSERT INTO assignments (roll_no, subject, title, due_date, status) VALUES (?, ?, ?, ?, ?)", assignments_data)

    # 14. Faculty Bookings
    bookings_data = [
        ("Aravind Swamy", "717721L101", "CSE", "Dr. Ramakrishnan", "2026-08-02", "10:30 AM", "Project Review", "Confirmed")
    ]
    cursor.executemany("INSERT INTO faculty_bookings (student_name, reg_no, dept, faculty_name, date, time, purpose, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", bookings_data)

    # 15. Attendance
    attendance_data = [
        # 717721L101 (Aravind Swamy - CSE)
        ("CSE", 1, "Engineering Math I", 1, "2026-08-01", "717721L101", "present"),
        ("CSE", 1, "Engineering Math I", 1, "2026-08-03", "717721L101", "present"),
        ("CSE", 1, "Engineering Math I", 1, "2026-08-05", "717721L101", "present"),
        ("CSE", 1, "Engineering Math I", 1, "2026-08-08", "717721L101", "absent"),
        ("CSE", 1, "Engineering Math I", 1, "2026-08-10", "717721L101", "present"),
        ("CSE", 1, "Engineering Math I", 1, "2026-08-12", "717721L101", "present"),

        ("CSE", 1, "Technical English", 2, "2026-08-01", "717721L101", "present"),
        ("CSE", 1, "Technical English", 2, "2026-08-04", "717721L101", "present"),
        ("CSE", 1, "Technical English", 2, "2026-08-07", "717721L101", "present"),
        ("CSE", 1, "Technical English", 2, "2026-08-11", "717721L101", "present"),
        ("CSE", 1, "Technical English", 2, "2026-08-14", "717721L101", "present"),

        ("CSE", 1, "Engineering Physics", 3, "2026-08-02", "717721L101", "present"),
        ("CSE", 1, "Engineering Physics", 3, "2026-08-05", "717721L101", "absent"),
        ("CSE", 1, "Engineering Physics", 3, "2026-08-09", "717721L101", "absent"),
        ("CSE", 1, "Engineering Physics", 3, "2026-08-12", "717721L101", "absent"),
        ("CSE", 1, "Engineering Physics", 3, "2026-08-15", "717721L101", "present"), # 2/5 = 40% (Low attendance alert!)

        ("CSE", 1, "Programming in C", 4, "2026-08-02", "717721L101", "present"),
        ("CSE", 1, "Programming in C", 4, "2026-08-06", "717721L101", "present"),
        ("CSE", 1, "Programming in C", 4, "2026-08-09", "717721L101", "present"),
        ("CSE", 1, "Programming in C", 4, "2026-08-13", "717721L101", "present"),

        # 717721L102 (J. Samhitha)
        ("CSE", 1, "Engineering Math I", 1, "2026-08-01", "717721L102", "present"),
        ("CSE", 1, "Engineering Math I", 1, "2026-08-03", "717721L102", "present"),
        ("CSE", 1, "Engineering Math I", 1, "2026-08-05", "717721L102", "present"),
        ("CSE", 1, "Technical English", 2, "2026-08-01", "717721L102", "present"),
        ("CSE", 1, "Engineering Physics", 3, "2026-08-02", "717721L102", "present"),
        ("CSE", 1, "Programming in C", 4, "2026-08-02", "717721L102", "present"),

        # 717721L106 (Kanishka - CSE Y3)
        ("CSE", 3, "Machine Learning", 1, "2026-08-01", "717721L106", "present"),
        ("CSE", 3, "Machine Learning", 1, "2026-08-03", "717721L106", "present"),
        ("CSE", 3, "Machine Learning", 1, "2026-08-06", "717721L106", "present"),
        ("CSE", 3, "Machine Learning", 1, "2026-08-08", "717721L106", "present"),
        ("CSE", 3, "Machine Learning", 1, "2026-08-10", "717721L106", "present"),
        ("CSE", 3, "Compiler Design", 2, "2026-08-02", "717721L106", "present"),
        ("CSE", 3, "Compiler Design", 2, "2026-08-05", "717721L106", "absent"),
        ("CSE", 3, "Compiler Design", 2, "2026-08-09", "717721L106", "present"),
        ("CSE", 3, "Data Science", 3, "2026-08-02", "717721L106", "present"),
        ("CSE", 3, "Data Science", 3, "2026-08-04", "717721L106", "present"),

        # 717721L111 (Menaka S - IT Y4)
        ("IT", 4, "Cyber Security", 1, "2026-08-01", "717721L111", "present"),
        ("IT", 4, "Cyber Security", 1, "2026-08-03", "717721L111", "present"),
        ("IT", 4, "Cyber Security", 1, "2026-08-06", "717721L111", "present"),
        ("IT", 4, "Cyber Security", 1, "2026-08-08", "717721L111", "absent"),
        ("IT", 4, "Cyber Security", 1, "2026-08-11", "717721L111", "present"),
        ("IT", 4, "Mobile Computing", 2, "2026-08-02", "717721L111", "present"),
        ("IT", 4, "Mobile Computing", 2, "2026-08-05", "717721L111", "present"),
        ("IT", 4, "Mobile Computing", 2, "2026-08-09", "717721L111", "present"),
        ("IT", 4, "Project Work Phase 2", 3, "2026-08-02", "717721L111", "present"),
        ("IT", 4, "Project Work Phase 2", 3, "2026-08-04", "717721L111", "present"),
        ("IT", 4, "Big Data Analytics", 4, "2026-08-03", "717721L111", "absent"),
        ("IT", 4, "Big Data Analytics", 4, "2026-08-07", "717721L111", "absent"),
        ("IT", 4, "Big Data Analytics", 4, "2026-08-10", "717721L111", "present") # 1/3 = 33.3%
    ]
    cursor.executemany("INSERT INTO attendance (dept, year, subject, slot_index, date, roll_no, status) VALUES (?, ?, ?, ?, ?, ?, ?)", attendance_data)

    conn.commit()
    conn.close()
    print("Database re-initialized and seeded successfully!")

if __name__ == "__main__":
    init_db()
