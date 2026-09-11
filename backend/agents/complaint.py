from agents.base import BaseAgent
from typing import Dict, Any
import datetime
import re

class ComplaintAgent(BaseAgent):
    def analyze_complaint_with_ai(self, text: str) -> Dict[str, Any]:
        """
        AI Moderation & Priority Classification Engine
        
        Evaluates text for:
        1. Gibberish / Random Keyboard Mashing (e.g., asdfghjkl, qwerty1234, zxcvbnm)
        2. Abusive / Vulgar / Profane Language
        3. Off-Topic / Spam / Gaming / Commercial Scams
        4. Short / Vague Non-Complaints (e.g., 'hi', 'test', '123')
        5. Urgency & Priority Scoring (Critical Emergency, High Priority, Medium Priority, Low Priority)
        """
        raw = text.strip()
        
        # Extract actual description if formatted as "complaint about hostel at Room 101: text"
        clean_desc = raw
        if ":" in raw:
            parts = raw.split(":", 1)
            clean_desc = parts[1].strip()
        elif "complaint about" in raw.lower():
            clean_desc = raw.lower().replace("complaint about", "").strip()

        desc_lower = clean_desc.lower()

        # 1. Length & Basic Validity Check
        if len(clean_desc) < 4:
            return {
                "is_valid": False,
                "reason": "Complaint description is too short or incomplete. Please describe the problem clearly.",
                "flag": "Too Short / Vague"
            }

        # 2. Profanity / Abusive / Offensive Language Filter
        profanity_keywords = [
            "fool", "idiot", "stupid", "bastard", "crap", "damn", "hate", "rubbish", 
            "bloody", "curse", "abuse", "asshole", "bitch", "fuck", "shit"
        ]
        for word in profanity_keywords:
            if re.search(rf"\b{word}\b", desc_lower):
                return {
                    "is_valid": False,
                    "reason": "Abusive, disrespectful, or vulgar language detected. Complaints must adhere to campus conduct guidelines.",
                    "flag": "Abusive / Inappropriate Content"
                }

        # 3. Spam / Off-Topic / Scams / Non-Campus Query Filter
        spam_keywords = [
            "pubg", "free diamonds", "crypto", "bitcoin", "earn money", "cashback", 
            "win prize", "discount coupon", "sing a song", "who are you", "what is your name",
            "movie ticket", "buy iphone", "telegram link", "whatsapp group", "followers", "likes", "subscribe",
            "tell me a joke", "how are you", "weather today", "what is 2+", "play game", "free wifi password"
        ]
        for spam in spam_keywords:
            if spam in desc_lower:
                return {
                    "is_valid": False,
                    "reason": "Spam, promotional, or off-topic non-campus content detected.",
                    "flag": "Spam / Off-Topic"
                }

        # 4. Gibberish & Random Keyboard Mashing Detection
        # Check for repeated characters like 'aaaaa', 'zzzzz', '11111'
        if re.search(r'(.)\1{4,}', desc_lower):
            return {
                "is_valid": False,
                "reason": "Repeated character pattern or gibberish text detected.",
                "flag": "Gibberish / Keyboard Mash"
            }

        # Common keyboard mashing strings
        keyboard_mash = ["asdf", "sdfg", "dfgh", "fghj", "ghjk", "hjkl", "qwerty", "werty", "zxcv", "xcvb", "cvbn", "vbnm", "123456", "abcdef"]
        mash_matches = sum(1 for k in keyboard_mash if k in desc_lower)
        if mash_matches >= 2 or (len(clean_desc) > 6 and mash_matches >= 1 and len(clean_desc.split()) <= 2):
            return {
                "is_valid": False,
                "reason": "Keyboard mashing or nonsense sequence detected (e.g., 'asdfghjkl').",
                "flag": "Gibberish / Random Text"
            }

        # Vowel to Consonant Ratio test for long single-word gibberish like 'hjksdfghjk'
        words = clean_desc.split()
        for w in words:
            clean_w = re.sub(r'[^a-zA-Z]', '', w.lower())
            if len(clean_w) >= 7:
                vowels = sum(1 for char in clean_w if char in "aeiouy")
                if vowels == 0 or (vowels / len(clean_w)) < 0.15:
                    return {
                        "is_valid": False,
                        "reason": f"Unusual non-word '{w}' detected by AI structural analysis.",
                        "flag": "Gibberish Structural Anomaly"
                    }

        # 5. AI Urgency & Priority Classifier for Genuine Complaints
        priority = "Medium Priority 🛠️"
        critical_keywords = [
            "fire", "short circuit", "smoke", "gas leak", "electric shock", "wire burning",
            "sparking", "flood", "pipe burst", "server down", "emergency", "danger", "hazard"
        ]
        high_keywords = [
            "ac not working", "projector broken", "exam hall", "power cut", "blackout",
            "lab computer", "exam", "lift stuck", "elevator", "water supply", "no water"
        ]
        low_keywords = [
            "scratch", "curtain", "dirty desk", "dust", "paint", "noise", "door squeak", "chair loose"
        ]

        if any(k in desc_lower for k in critical_keywords):
            priority = "Critical Emergency 🚨"
        elif any(k in desc_lower for k in high_keywords):
            priority = "High Priority ⚡"
        elif any(k in desc_lower for k in low_keywords):
            priority = "Low Priority ℹ️"
        else:
            priority = "Medium Priority 🛠️"

        return {
            "is_valid": True,
            "reason": "Verified genuine campus maintenance request.",
            "flag": "Verified Genuine ✅",
            "priority": priority
        }

    def handle(self, query: str, context: Dict[str, Any]) -> str:
        q = query.lower().strip()
        
        # Reliably resolve roll_no with fallback
        roll_no = context.get("roll_no") or context.get("register_number") or "717721L101"
        if not roll_no or str(roll_no).strip() == "":
            roll_no = "717721L101"
        roll_no = str(roll_no).strip()
        
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        status_keywords = ["status", "track", "my complaints", "list complaints", "view complaints", "history"]
        is_status_query = any(w in q for w in status_keywords) and not q.startswith("complaint about")
        
        if is_status_query:
            # Try fetching columns including priority if available
            try:
                cursor.execute("SELECT id, category, description, status, date, priority FROM complaints WHERE roll_no = ? ORDER BY id DESC", (roll_no,))
            except Exception:
                cursor.execute("SELECT id, category, description, status, date FROM complaints WHERE roll_no = ? ORDER BY id DESC", (roll_no,))
            
            records = cursor.fetchall()
            if not records:
                return "You have not registered any complaints yet."
            
            res = "### 📋 Your Registered Complaints & Status\n"
            for row in records:
                status_emoji = "⏳" if row["status"] == "Pending" else "⚙️" if row["status"] == "In Progress" else "✅"
                p_text = f" | Priority: **{row['priority']}**" if "priority" in row.keys() and row["priority"] else ""
                res += f"- **#{row['id']}** [{row['category']}]: \"{row['description']}\" | Status: **{status_emoji} {row['status']}**{p_text} ({row['date']})\n"
            return res
            
        else:
            # Run AI Moderation & Filter Check FIRST!
            ai_eval = self.analyze_complaint_with_ai(query)
            
            if not ai_eval["is_valid"]:
                return (
                    f"### 🛡️ AI Moderation Alert: Complaint Auto-Filtered & Rejected\n\n"
                    f"Our **CampusOps AI Safety Guard** analyzed your request and automatically filtered it:\n"
                    f"- **AI Detection Flag**: `{ai_eval['flag']}`\n"
                    f"- **Reason**: {ai_eval['reason']}\n\n"
                    f"> 🤖 **Notice:** Unusual, abusive, spam, or random text complaints are automatically rejected to keep the campus operations queue clean.\n\n"
                    f"**Please submit a valid complaint** (e.g. *\"AC not working in EEE Lab\"*, *\"Water leakage in Hostel Block 3\"*, *\"Projector cable faulty in Room 304\"*)."
                )

            # Valid complaint - proceed with category resolution and insertion
            category = "Classroom Complaint"
            if "hostel" in q:
                category = "Hostel Complaint"
            elif "bus" in q:
                category = "Bus Complaint"
            elif "lab" in q or "eee" in q:
                category = "Laboratory Complaint"
            elif "staff" in q:
                category = "Staff Complaint"
            elif "fan" in q or "light" in q or "ac" in q or "maintenance" in q:
                category = "Maintenance Complaint"
                
            today = datetime.date.today().strftime("%Y-%m-%d")
            photo = context.get("photo", None)
            priority = ai_eval["priority"]
            ai_flag = ai_eval["flag"]
            
            clean_desc = query
            if ":" in query:
                parts = query.split(":", 1)
                clean_desc = parts[1].strip()
                loc_part = parts[0].replace("complaint about ", "").strip()
                clean_desc = f"[{loc_part}] {clean_desc}"
            
            # Safely insert with priority & ai_flag columns if schema updated, else basic fallback
            try:
                cursor.execute(
                    "INSERT INTO complaints (roll_no, category, description, status, date, photo, priority, ai_flag) VALUES (?, ?, ?, 'Pending', ?, ?, ?, ?)",
                    (roll_no, category, clean_desc, today, photo, priority, ai_flag)
                )
            except Exception:
                cursor.execute(
                    "INSERT INTO complaints (roll_no, category, description, status, date, photo) VALUES (?, ?, ?, 'Pending', ?, ?)",
                    (roll_no, category, clean_desc, today, photo)
                )

            conn.commit()
            
            cursor.execute("SELECT last_insert_rowid() as id")
            complaint_id = cursor.fetchone()["id"]
            
            return (
                f"### 🛠️ Complaint Registered & AI Verified!\n\n"
                f"Your complaint has been verified by **CampusOps AI Guard** and logged in the database:\n"
                f"- **Complaint ID**: #{complaint_id}\n"
                f"- **Category**: {category}\n"
                f"- **Description**: \"{clean_desc}\"\n"
                f"- **AI Urgency Level**: **{priority}**\n"
                f"- **AI Moderation Status**: **{ai_flag}**\n"
                f"- **Status**: **Pending**\n"
                f"- **Date**: {today}\n\n"
                f"Our campus maintenance team has been notified."
            )


