from agents.base import BaseAgent
from typing import Dict, Any

class FeeAgent(BaseAgent):
    def handle(self, query: str, context: Dict[str, Any]) -> str:
        q = query.lower()
        roll_no = context.get("roll_no", "717721L101")
        
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        # 1. Scholarship Info
        if "scholarship" in q:
            # Let's return scholarship demo details
            return (
                "### 🎓 Scholarship Status\n"
                "According to the database:\n"
                "- **Scholarship Type**: First Graduate Scholarship\n"
                "- **Eligible Amount**: ₹25,000 / year\n"
                "- **Status**: **Approved & Disbursed** to tuition ledger.\n\n"
                "For renewing or applying to new government/private scholarships (e.g. NSP, PMSS), visit the College Scholarship Section in Admin Block."
            )
            
        # 2. Payment History
        elif "history" in q or "paid" in q or "receipt" in q:
            cursor.execute("SELECT type, total, paid, due_date FROM fees WHERE roll_no = ? AND paid > 0", (roll_no,))
            records = cursor.fetchall()
            if not records:
                return "No payment history found."
            
            res = "### 💳 Payment History Ledger\n"
            for r in records:
                res += f"- **{r['type']}**: Paid **₹{r['paid']:,}** of ₹{r['total']:,} (Due: {r['due_date']})\n"
            return res
            
        # 3. Overall dues, tuition/hostel/bus/exam fee
        else:
            cursor.execute("SELECT type, total, paid, due_date FROM fees WHERE roll_no = ?", (roll_no,))
            records = cursor.fetchall()
            if not records:
                return "No fee records found for your account."
                
            res = "### 💰 Fee Details & Outstanding Dues\n"
            total_due = 0.0
            for r in records:
                due = r['total'] - r['paid']
                status = "✅ Fully Paid" if due <= 0 else f"❌ Pending: **₹{due:,}**"
                res += f"- **{r['type']}**: Total: ₹{r['total']:,} | Paid: ₹{r['paid']:,} | Due: {status} (Deadline: {r['due_date']})\n"
                if due > 0:
                    total_due += due
                    
            if total_due > 0:
                res += f"\n**Total Balance Due: ₹{total_due:,}**\n\n*Click 'Pay Now' next to the balance in the dashboard portal to complete the transaction via payment gateway.*"
            else:
                res += "\n🎉 **All clear! You have no outstanding dues.**"
            return res
