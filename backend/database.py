import sqlite3
import os
import shutil

DB_ORIGIN = os.path.join(os.path.dirname(os.path.abspath(__file__)), "campus.db")

# In serverless environments (e.g. Vercel), the deployment directory is read-only.
# Copy database to /tmp so write operations succeed seamlessly.
if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
    DB_PATH = "/tmp/campus.db"
    if not os.path.exists(DB_PATH) and os.path.exists(DB_ORIGIN):
        try:
            shutil.copyfile(DB_ORIGIN, DB_PATH)
        except Exception:
            DB_PATH = DB_ORIGIN
else:
    DB_PATH = DB_ORIGIN

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
        ("24EE026", "Menaka", "EEE", 2, "menaka@sece.ac.in", "student"),
        ("24EC045", "Chandrighaa", "ECE", 3, "chandrighaa@sece.ac.in", "student"),
        ("24CS006", "Samyuktha", "CSE", 4, "samyuktha@sece.ac.in", "student"),
        ("24CC052", "Akshaya", "CCE", 2, "akshaya@sece.ac.in", "student"),
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

        # EEE Year 1
        ("EEE", 1, "Monday", "Engineering Math I", "Physics", "Technical English", "Chemistry", "", ""),
        ("EEE", 1, "Tuesday", "Physics", "Chemistry", "Engineering Math I", "Technical English", "", ""),
        ("EEE", 1, "Wednesday", "Engineering Math I", "Programming in C", "Physics", "Engineering Graphics", "", ""),
        ("EEE", 1, "Thursday", "Technical English", "Programming in C", "Engineering Math I", "Physics", "", ""),
        ("EEE", 1, "Friday", "Chemistry", "Programming in C", "Engineering Math I", "Workshop", "", ""),

        # EEE Year 2
        ("EEE", 2, "Monday", "Electrical Machines I", "Network Theory", "Analog Electronics", "Signals & Systems", "Electrical Lab", "Power Electronics Lab"),
        ("EEE", 2, "Tuesday", "Network Theory", "Electrical Machines I", "Electromagnetic Fields", "Analog Electronics", "Electrical Machines Lab", ""),
        ("EEE", 2, "Wednesday", "Power Electronics", "Network Theory", "Electrical Machines I", "Electrical Measurements", "Electrical Measurements Lab", ""),
        ("EEE", 2, "Thursday", "Analog Electronics", "Power Electronics", "Signals & Systems", "Network Theory", "Technical Seminar", ""),
        ("EEE", 2, "Friday", "Electrical Machines I", "Power Electronics", "Measurements", "Signals & Systems", "Library", ""),

        # EEE Year 3
        ("EEE", 3, "Monday", "Power Systems II", "Power Electronics", "Microcontrollers", "Control Systems", "Renewable Energy", "Soft Skills"),
        ("EEE", 3, "Tuesday", "Control Systems", "Electrical Drives", "Power Systems II", "Microcontrollers", "Renewable Energy", "Power Electronics"),
        ("EEE", 3, "Wednesday", "Microcontrollers", "Power Systems II", "Control Systems", "Electrical Drives", "Power Electronics", "Renewable Energy"),
        ("EEE", 3, "Thursday", "Electrical Drives", "Power Electronics", "Microcontrollers", "Control Systems", "Power Systems II", "Soft Skills"),
        ("EEE", 3, "Friday", "Renewable Energy", "Control Systems Lab", "Control Systems Lab", "Power Electronics", "Electrical Drives", "Project"),

        # EEE Year 4
        ("EEE", 4, "Monday", "Smart Grid", "Electric Vehicles", "Professional Elective", "Project", "", ""),
        ("EEE", 4, "Tuesday", "Electric Vehicles", "Smart Grid", "Professional Elective", "Project", "", ""),
        ("EEE", 4, "Wednesday", "Professional Elective", "Smart Grid", "Electric Vehicles", "Project", "", ""),
        ("EEE", 4, "Thursday", "Smart Grid", "Professional Elective", "Electric Vehicles", "Project", "", ""),
        ("EEE", 4, "Friday", "Project", "Project", "Project", "Project", "", ""),

        # ECE Year 2
        ("ECE", 2, "Monday", "Electronic Circuits", "Signals & Systems", "Digital Electronics", "Network Theory", "", ""),
        ("ECE", 2, "Tuesday", "Digital Electronics", "Electronic Circuits", "Signals & Systems", "Microprocessors", "", ""),
        ("ECE", 2, "Wednesday", "Network Theory", "Digital Electronics", "Electronic Circuits", "Microprocessors", "", ""),
        ("ECE", 2, "Thursday", "Signals & Systems", "Microprocessors", "Digital Electronics", "Electronic Circuits", "", ""),
        ("ECE", 2, "Friday", "Electronic Circuits", "Digital Electronics Lab", "Digital Electronics Lab", "Signals & Systems", "", ""),

        # ECE Year 4
        ("ECE", 4, "Monday", "5G Communication", "IoT", "Professional Elective", "Project", "", ""),
        ("ECE", 4, "Tuesday", "IoT", "5G Communication", "Professional Elective", "Project", "", ""),
        ("ECE", 4, "Wednesday", "Professional Elective", "5G Communication", "IoT", "Project", "", ""),
        ("ECE", 4, "Thursday", "5G Communication", "Professional Elective", "IoT", "Project", "", ""),
        ("ECE", 4, "Friday", "Project", "Project", "Project", "Project", "", ""),

        # CCE Year 1
        ("CCE", 1, "Monday", "Engineering Math I", "Physics", "Technical English", "Chemistry", "", ""),
        ("CCE", 1, "Tuesday", "Physics", "Chemistry", "Engineering Math I", "Technical English", "", ""),
        ("CCE", 1, "Wednesday", "Engineering Math I", "Programming in C", "Physics", "Engineering Graphics", "", ""),
        ("CCE", 1, "Thursday", "Technical English", "Programming in C", "Engineering Math I", "Physics", "", ""),
        ("CCE", 1, "Friday", "Chemistry", "Programming in C", "Engineering Math I", "Workshop", "", ""),

        # CCE Year 2
        ("CCE", 2, "Monday", "Data Structures", "Digital Electronics", "Computer Networks", "OOPs", "", ""),
        ("CCE", 2, "Tuesday", "Computer Networks", "Data Structures", "Database Systems", "OOPs", "", ""),
        ("CCE", 2, "Wednesday", "Digital Electronics", "Database Systems", "Data Structures", "Computer Networks", "", ""),
        ("CCE", 2, "Thursday", "OOPs", "Data Structures", "Digital Electronics", "Database Systems", "", ""),
        ("CCE", 2, "Friday", "Computer Networks", "Data Structures Lab", "Data Structures Lab", "OOPs", "", ""),

        # CCE Year 3
        ("CCE", 3, "Monday", "Cloud Computing", "Cybersecurity", "IoT", "AI & ML", "Data Analytics", "Soft Skills"),
        ("CCE", 3, "Tuesday", "AI & ML", "Cloud Computing", "Cybersecurity", "IoT", "Data Analytics", "Cloud Computing"),
        ("CCE", 3, "Wednesday", "Cybersecurity", "AI & ML", "Cloud Computing", "Data Analytics", "IoT", "AI & ML"),
        ("CCE", 3, "Thursday", "IoT", "Cloud Computing", "AI & ML", "Cybersecurity", "Data Analytics", "Soft Skills"),
        ("CCE", 3, "Friday", "Data Analytics", "AI Lab", "AI Lab", "Cloud Computing", "Cybersecurity", "Project"),

        # CCE Year 4
        ("CCE", 4, "Monday", "Cloud Security", "Advanced AI", "Professional Elective", "Project", "", ""),
        ("CCE", 4, "Tuesday", "Advanced AI", "Cloud Security", "Professional Elective", "Project", "", ""),
        ("CCE", 4, "Wednesday", "Professional Elective", "Advanced AI", "Cloud Security", "Project", "", ""),
        ("CCE", 4, "Thursday", "Cloud Security", "Professional Elective", "Advanced AI", "Project", "", ""),
        ("CCE", 4, "Friday", "Project", "Project", "Project", "Project", "", ""),
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
        ("24EE026", "Tuition Fee", 85000.0, 85000.0, "2026-06-30"),
        ("24EE026", "Exam Fee", 3200.0, 0.0, "2026-08-15"),
        ("24EE026", "Bus Fee", 22000.0, 22000.0, "2026-06-30"),

        ("24EC045", "Tuition Fee", 85000.0, 80000.0, "2026-06-30"),
        ("24EC045", "Exam Fee", 3200.0, 3200.0, "2026-08-15"),
        ("24EC045", "Hostel Fee", 65000.0, 45000.0, "2026-07-15"),

        ("24CS006", "Tuition Fee", 90000.0, 90000.0, "2026-06-30"),
        ("24CS006", "Exam Fee", 3200.0, 3200.0, "2026-08-15"),
        ("24CS006", "Placement Training Fee", 10000.0, 5000.0, "2026-09-01"),

        ("24CC052", "Tuition Fee", 85000.0, 45000.0, "2026-06-30"),
        ("24CC052", "Exam Fee", 3200.0, 0.0, "2026-08-15"),
        ("24CC052", "Bus Fee", 18000.0, 10000.0, "2026-07-31")
    ]
    cursor.executemany("INSERT INTO fees (roll_no, type, total, paid, due_date) VALUES (?, ?, ?, ?, ?)", fees_data)

    # 8. Complaints
    complaints_data = [
        ("24EE026", "Classroom Complaint", "AC remote is missing in Room 304", "In Progress", "2026-07-28"),
        ("24EC045", "Hostel Complaint", "No hot water in Block C bathroom", "Resolved", "2026-07-25")
    ]
    cursor.executemany("INSERT INTO complaints (roll_no, category, description, status, date) VALUES (?, ?, ?, ?, ?)", complaints_data)

    # 9. Documents
    docs_data = [
        ("24EE026", "Bonafide Certificate", "Approved & Ready to Collect", "2026-07-27"),
        ("24CS006", "No Due Certificate", "Pending Department Approval", "2026-07-29")
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
        ("24EE026", "Submit Lab Report", "2026-08-05", "11:59 PM"),
        ("24EE026", "Pay Exam Fee", "2026-08-10", "04:00 PM")
    ]
    cursor.executemany("INSERT INTO reminders (roll_no, title, date, time) VALUES (?, ?, ?, ?)", reminders_data)

    # 13. Assignments
    assignments_data = [
        ("24CS006", "Compiler Design", "Assignment 2 - Parsing Trees", "2026-08-08", "pending"),
        ("24CS006", "Machine Learning", "Project Proposal submission", "2026-08-12", "pending")
    ]
    cursor.executemany("INSERT INTO assignments (roll_no, subject, title, due_date, status) VALUES (?, ?, ?, ?, ?)", assignments_data)

    # 14. Faculty Bookings
    bookings_data = [
        ("Samyuktha", "24CS006", "CSE", "Dr. Ramakrishnan", "2026-08-02", "10:30 AM", "Project Review", "Confirmed")
    ]
    cursor.executemany("INSERT INTO faculty_bookings (student_name, reg_no, dept, faculty_name, date, time, purpose, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", bookings_data)

    # 15. Attendance
    attendance_data = [
        # 24EE026 (Menaka - EEE Y2)
        ("EEE", 2, "Circuit Theory", 1, "2026-08-01", "24EE026", "present"),
        ("EEE", 2, "Circuit Theory", 1, "2026-08-03", "24EE026", "present"),
        ("EEE", 2, "Circuit Theory", 1, "2026-08-05", "24EE026", "absent"),
        ("EEE", 2, "Circuit Theory", 1, "2026-08-08", "24EE026", "present"),
        ("EEE", 2, "Electrical Machines", 2, "2026-08-02", "24EE026", "present"),
        ("EEE", 2, "Electrical Machines", 2, "2026-08-06", "24EE026", "present"),
        ("EEE", 2, "Electrical Machines", 2, "2026-08-09", "24EE026", "absent"),
        ("EEE", 2, "Electrical Machines", 2, "2026-08-13", "24EE026", "present"),
        ("EEE", 2, "Measurements", 3, "2026-08-02", "24EE026", "present"),
        ("EEE", 2, "Measurements", 3, "2026-08-07", "24EE026", "absent"),
        ("EEE", 2, "Measurements", 3, "2026-08-11", "24EE026", "absent"),
        ("EEE", 2, "Measurements", 3, "2026-08-14", "24EE026", "present"),

        # 24EC045 (Chandrighaa - ECE Y3)
        ("ECE", 3, "VLSI Design", 1, "2026-08-01", "24EC045", "present"),
        ("ECE", 3, "VLSI Design", 1, "2026-08-03", "24EC045", "present"),
        ("ECE", 3, "VLSI Design", 1, "2026-08-06", "24EC045", "present"),
        ("ECE", 3, "VLSI Design", 1, "2026-08-08", "24EC045", "absent"),
        ("ECE", 3, "Digital Signal Processing", 2, "2026-08-02", "24EC045", "present"),
        ("ECE", 3, "Digital Signal Processing", 2, "2026-08-05", "24EC045", "present"),
        ("ECE", 3, "Digital Signal Processing", 2, "2026-08-09", "24EC045", "present"),
        ("ECE", 3, "Microcontrollers", 3, "2026-08-03", "24EC045", "absent"),
        ("ECE", 3, "Microcontrollers", 3, "2026-08-07", "24EC045", "absent"),
        ("ECE", 3, "Microcontrollers", 3, "2026-08-10", "24EC045", "present"),

        # 24CS006 (Samyuktha - CSE Y4)
        ("CSE", 4, "Cryptography & Security", 1, "2026-08-01", "24CS006", "present"),
        ("CSE", 4, "Cryptography & Security", 1, "2026-08-03", "24CS006", "present"),
        ("CSE", 4, "Cryptography & Security", 1, "2026-08-06", "24CS006", "present"),
        ("CSE", 4, "Cryptography & Security", 1, "2026-08-08", "24CS006", "present"),
        ("CSE", 4, "Ad Hoc Networks", 2, "2026-08-02", "24CS006", "present"),
        ("CSE", 4, "Ad Hoc Networks", 2, "2026-08-05", "24CS006", "absent"),
        ("CSE", 4, "Ad Hoc Networks", 2, "2026-08-09", "24CS006", "present"),
        ("CSE", 4, "Project Phase II", 3, "2026-08-02", "24CS006", "present"),
        ("CSE", 4, "Project Phase II", 3, "2026-08-04", "24CS006", "present"),
        ("CSE", 4, "Project Phase II", 3, "2026-08-07", "24CS006", "present"),

        # 24CC052 (Akshaya - CCE Y2)
        ("CCE", 2, "Digital Electronics", 1, "2026-08-01", "24CC052", "present"),
        ("CCE", 2, "Digital Electronics", 1, "2026-08-03", "24CC052", "absent"),
        ("CCE", 2, "Digital Electronics", 1, "2026-08-06", "24CC052", "absent"),
        ("CCE", 2, "Digital Electronics", 1, "2026-08-08", "24CC052", "present"),
        ("CCE", 2, "Data Structures", 2, "2026-08-02", "24CC052", "present"),
        ("CCE", 2, "Data Structures", 2, "2026-08-05", "24CC052", "present"),
        ("CCE", 2, "Data Structures", 2, "2026-08-09", "24CC052", "present"),
        ("CCE", 2, "Mathematics III", 3, "2026-08-03", "24CC052", "absent"),
        ("CCE", 2, "Mathematics III", 3, "2026-08-07", "24CC052", "absent"),
        ("CCE", 2, "Mathematics III", 3, "2026-08-10", "24CC052", "present")
    ]
    cursor.executemany("INSERT INTO attendance (dept, year, subject, slot_index, date, roll_no, status) VALUES (?, ?, ?, ?, ?, ?, ?)", attendance_data)

    conn.commit()
    conn.close()
    print("Database re-initialized and seeded successfully!")

if __name__ == "__main__":
    init_db()
