import React from 'react';
import { BookOpen, Clock, MapPin, User } from 'lucide-react';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SLOTS = [1, 2, 3, 4];
const SLOT_TIMES = {
  1: "09:00 AM - 10:30 AM",
  2: "10:30 AM - 12:00 PM",
  3: "01:00 PM - 02:30 PM",
  4: "02:30 PM - 04:00 PM"
};

export const getSubjectDetails = (subject) => {
  if (!subject) return { code: "-", faculty: "-", venue: "-" };
  const s = subject.toLowerCase();
  
  // 3rd Year CSE Mappings
  if (s.includes("data science")) {
    return { code: "CS301", faculty: "Dr. Raj Thilak", venue: "SF07" };
  }
  if (s.includes("compiler")) {
    return { code: "CS302", faculty: "Dr. Anbuarasu", venue: "TF 17" };
  }
  if (s.includes("machine learning")) {
    return { code: "CS303", faculty: "Dr. Geetha", venue: "SF07" };
  }
  if (s.includes("cloud")) {
    return { code: "CS304", faculty: "Dr. Guna Priya", venue: "TF 17" };
  }
  if (s.includes("soft skills") || s.includes("aptitude") || s.includes("training")) {
    return { code: "CS305", faculty: "Mr. Premkumar", venue: "CODE STUDIO" };
  }
  if (s.includes("internet of things") || s.includes("iot")) {
    return { code: "CS306", faculty: "Dr. Batcha", venue: "SIMULATION LAB" };
  }
  if (s === "pe" || s.includes("professional elective")) {
    return { code: "CS307", faculty: "Dr. Ramakrishnan", venue: "LH-403" };
  }
  if (s.includes("ldic")) {
    return { code: "CS308", faculty: "Dr. Kavitha", venue: "B-Block 105" };
  }
  
  // 1st Year Mappings
  if (s.includes("technical english")) {
    return { code: "HS101", faculty: "Dr. Geetha", venue: "LH-101" };
  }
  if (s.includes("engineering math i")) {
    return { code: "MA101", faculty: "Dr. Srinivasan", venue: "LH-101" };
  }
  if (s.includes("engineering physics")) {
    return { code: "PH101", faculty: "Dr. Radhakrishnan", venue: "PHYSICS LAB" };
  }
  if (s.includes("engineering chemistry")) {
    return { code: "CY101", faculty: "Dr. Saravanan", venue: "CHEMISTRY LAB" };
  }
  if (s.includes("programming in c") || s.includes("c programming lab")) {
    return { code: "CS101", faculty: "Mr. Vignesh", venue: "LAB 1" };
  }
  if (s.includes("python programming")) {
    return { code: "CS102", faculty: "Dr. Balasubramanian", venue: "LAB 2" };
  }

  // 2nd Year Mappings
  if (s.includes("discrete mathematics")) {
    return { code: "MA201", faculty: "Dr. Srinivasan", venue: "LH-201" };
  }
  if (s.includes("data structures") || s.includes("data structures lab")) {
    return { code: "CS201", faculty: "Dr. Ramakrishnan", venue: "LAB 3" };
  }
  if (s.includes("digital principles")) {
    return { code: "CS202", faculty: "Dr. Kavitha", venue: "LH-202" };
  }
  if (s.includes("oops using c++") || s.includes("c++ programming lab")) {
    return { code: "CS203", faculty: "Mr. Vignesh", venue: "LAB 4" };
  }

  // 4th Year Mappings
  if (s.includes("cryptography")) {
    return { code: "CS401", faculty: "Dr. Balasubramanian", venue: "LH-401" };
  }
  if (s.includes("ad hoc")) {
    return { code: "CS402", faculty: "Dr. Kavitha", venue: "LH-402" };
  }
  if (s.includes("professional elective v")) {
    return { code: "CS403", faculty: "Dr. Ramakrishnan", venue: "LH-403" };
  }
  if (s.includes("project phase ii") || s.includes("project work phase 2")) {
    return { code: "CS404", faculty: "Dr. Ramakrishnan", venue: "SEMINAR HALL" };
  }

  // IT & ECE specific Mappings
  if (s.includes("cyber security")) {
    return { code: "IT401", faculty: "Mr. Vignesh", venue: "LAB 4" };
  }
  if (s.includes("mobile computing")) {
    return { code: "IT402", faculty: "Dr. Batcha", venue: "SF08" };
  }
  if (s.includes("big data")) {
    return { code: "IT403", faculty: "Dr. Raj Thilak", venue: "LH-301" };
  }
  if (s.includes("basic electrical")) {
    return { code: "EE101", faculty: "Mrs. Shanthi", venue: "LH-102" };
  }
  if (s.includes("vlsi")) {
    return { code: "EC301", faculty: "Dr. Kavitha", venue: "LH-205" };
  }
  if (s.includes("microcontroller")) {
    return { code: "EC302", faculty: "Dr. Hariharan", venue: "SIMULATION LAB" };
  }
  if (s.includes("signal processing") || s.includes("dsp")) {
    return { code: "EC303", faculty: "Dr. Kavitha", venue: "B-Block 105" };
  }
  if (s.includes("antenna")) {
    return { code: "EC304", faculty: "Dr. Hariharan", venue: "LH-206" };
  }
  
  return { code: "CS310", faculty: "Dr. Hariharan", venue: "SF07" };
};

const getSlotColor = (subject) => {
  if (!subject) return "rgba(148, 163, 184, 0.05)";
  const s = subject.toLowerCase();
  if (s.includes("lab") || s.includes("laboratory")) {
    return "rgba(99, 102, 241, 0.08)"; // Indigo
  }
  if (s.includes("skills") || s.includes("training") || s.includes("aptitude")) {
    return "rgba(16, 185, 129, 0.08)"; // Emerald
  }
  if (s.includes("project") || s.includes("seminar")) {
    return "rgba(245, 158, 11, 0.08)"; // Amber
  }
  return "rgba(109, 40, 217, 0.06)"; // Purple
};

const TimetableGrid = ({ timetable = [] }) => {
  const findDayRow = (day) => {
    return timetable.find(t => t.day.toLowerCase() === day.toLowerCase());
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto', borderRadius: '1rem', border: '1px solid rgba(109, 40, 217, 0.15)', background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.03)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '850px', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(109, 40, 217, 0.15)', background: 'rgba(109, 40, 217, 0.05)' }}>
            <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', width: '120px' }}>Day</th>
            {SLOTS.map((slot) => (
              <th key={slot} style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>Period {slot}</span>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 400, marginTop: '0.15rem' }}>{SLOT_TIMES[slot]}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day) => {
            const dayRow = findDayRow(day);
            return (
              <tr key={day} style={{ borderBottom: '1px solid rgba(109, 40, 217, 0.08)', transition: 'background 0.2s' }}>
                <td style={{ padding: '1rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', background: 'rgba(109, 40, 217, 0.02)' }}>{day}</td>
                {SLOTS.map((slot) => {
                  const subject = dayRow ? dayRow[`slot_${slot}`] : null;
                  const details = getSubjectDetails(subject);
                  return (
                    <td key={slot} style={{ padding: '0.6rem' }}>
                      <div 
                        style={{
                          borderRadius: '0.75rem',
                          border: '1px solid rgba(109, 40, 217, 0.1)',
                          padding: '0.75rem',
                          background: getSlotColor(subject),
                          height: '95px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxSizing: 'border-box'
                        }}
                      >
                        {subject ? (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', width: '100%' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e1b4b', display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', flex: 1 }} title={subject}>
                                {subject}
                              </span>
                              <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'rgba(109, 40, 217, 0.08)', color: 'var(--primary)', padding: '0.15rem 0.35rem', borderRadius: '0.35rem', whiteSpace: 'nowrap' }}>
                                {details.code}
                              </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.4rem' }}>
                              <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <MapPin size={11} style={{ opacity: 0.7 }} /> {details.venue}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <User size={11} style={{ opacity: 0.7 }} /> {details.faculty}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                            No Class
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TimetableGrid;
