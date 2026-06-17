import express from "express";

const app = express();
app.use(express.json({ limit: "15mb" }));

const INITIAL_DATABASE = {
  users: [
    { id: "admin-1", username: "admin", name: "Administrator", passwordHash: "admin123" }
  ],
  students: [
    {
      id: "std-1", name: "Ethan Rodriguez", rollNumber: "R-101", admissionNumber: "ADM-2024-001",
      classVal: "Grade 10", section: "A", dob: "2010-04-12", gender: "Male",
      parentName: "Carlos Rodriguez", parentPhone: "+1 (555) 123-4567",
      address: "1042 Sunset Blvd, Los Angeles, CA", admissionDate: "2024-08-15",
      photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan"
    },
    {
      id: "std-2", name: "Sophia Sterling", rollNumber: "R-102", admissionNumber: "ADM-2024-002",
      classVal: "Grade 10", section: "A", dob: "2010-09-21", gender: "Female",
      parentName: "Helen Sterling", parentPhone: "+1 (555) 987-6543",
      address: "305 Maple Street, Seattle, WA", admissionDate: "2024-08-15",
      photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia"
    },
    {
      id: "std-3", name: "Marcus Vance", rollNumber: "R-103", admissionNumber: "ADM-2024-003",
      classVal: "Grade 10", section: "B", dob: "2010-01-15", gender: "Male",
      parentName: "David Vance", parentPhone: "+1 (555) 456-7890",
      address: "712 Pine Ave, Portland, OR", admissionDate: "2024-08-16",
      photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"
    },
    {
      id: "std-4", name: "Olivia Chen", rollNumber: "R-104", admissionNumber: "ADM-2024-004",
      classVal: "Grade 9", section: "A", dob: "2011-06-30", gender: "Female",
      parentName: "Ying Chen", parentPhone: "+1 (555) 321-7654",
      address: "55 Walnut Dr, San Jose, CA", admissionDate: "2024-08-18",
      photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia"
    },
    {
      id: "std-5", name: "Aidan O'Connor", rollNumber: "R-105", admissionNumber: "ADM-2024-005",
      classVal: "Grade 9", section: "B", dob: "2011-11-05", gender: "Male",
      parentName: "Fiona O'Connor", parentPhone: "+1 (555) 654-9872",
      address: "18 Orchard Rd, Boston, MA", admissionDate: "2024-08-18",
      photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aidan"
    }
  ],
  attendance: [
    { id: "att-1", studentId: "std-1", date: "2026-06-01", status: "Present" },
    { id: "att-2", studentId: "std-2", date: "2026-06-01", status: "Present" },
    { id: "att-3", studentId: "std-3", date: "2026-06-01", status: "Absent" },
    { id: "att-4", studentId: "std-4", date: "2026-06-01", status: "Present" },
    { id: "att-5", studentId: "std-5", date: "2026-06-01", status: "Present" },
    { id: "att-6", studentId: "std-1", date: "2026-05-31", status: "Present" },
    { id: "att-7", studentId: "std-2", date: "2026-05-31", status: "Present" },
    { id: "att-8", studentId: "std-3", date: "2026-05-31", status: "Present" },
    { id: "att-9", studentId: "std-4", date: "2026-05-31", status: "Absent" },
    { id: "att-10", studentId: "std-5", date: "2026-05-31", status: "Present" },
  ],
  marks: [
    { id: "mrk-1", studentId: "std-1", subject: "Mathematics", score: 85, maxScore: 100 },
    { id: "mrk-2", studentId: "std-1", subject: "Science", score: 90, maxScore: 100 },
    { id: "mrk-3", studentId: "std-1", subject: "English", score: 88, maxScore: 100 },
    { id: "mrk-4", studentId: "std-1", subject: "Computer Science", score: 95, maxScore: 100 },
    { id: "mrk-5", studentId: "std-2", subject: "Mathematics", score: 92, maxScore: 100 },
    { id: "mrk-6", studentId: "std-2", subject: "Science", score: 87, maxScore: 100 },
    { id: "mrk-7", studentId: "std-2", subject: "English", score: 94, maxScore: 100 },
    { id: "mrk-8", studentId: "std-2", subject: "Computer Science", score: 91, maxScore: 100 },
    { id: "mrk-9", studentId: "std-3", subject: "Mathematics", score: 62, maxScore: 100 },
    { id: "mrk-10", studentId: "std-3", subject: "Science", score: 68, maxScore: 100 },
    { id: "mrk-11", studentId: "std-3", subject: "English", score: 75, maxScore: 100 },
    { id: "mrk-12", studentId: "std-4", subject: "Mathematics", score: 78, maxScore: 100 },
    { id: "mrk-13", studentId: "std-4", subject: "Science", score: 82, maxScore: 100 },
    { id: "mrk-14", studentId: "std-4", subject: "English", score: 80, maxScore: 100 },
    { id: "mrk-15", studentId: "std-5", subject: "Mathematics", score: 89, maxScore: 100 },
    { id: "mrk-16", studentId: "std-5", subject: "Science", score: 85, maxScore: 100 },
    { id: "mrk-17", studentId: "std-5", subject: "English", score: 84, maxScore: 100 },
  ],
  fees: [
    { id: "fee-1", studentId: "std-1", feeStatus: "Paid", totalFee: 1500, paidAmount: 1500, pendingAmount: 0, paymentDate: "2026-05-10" },
    { id: "fee-2", studentId: "std-2", feeStatus: "Partially Paid", totalFee: 1500, paidAmount: 1000, pendingAmount: 500, paymentDate: "2026-05-12" },
    { id: "fee-3", studentId: "std-3", feeStatus: "Pending", totalFee: 1500, paidAmount: 0, pendingAmount: 1500, paymentDate: "" },
    { id: "fee-4", studentId: "std-4", feeStatus: "Paid", totalFee: 1200, paidAmount: 1200, pendingAmount: 0, paymentDate: "2026-05-15" },
    { id: "fee-5", studentId: "std-5", feeStatus: "Partially Paid", totalFee: 1200, paidAmount: 600, pendingAmount: 600, paymentDate: "2026-05-18" }
  ]
};

// In-memory DB (resets on cold start — acceptable for demo)
let db: any = JSON.parse(JSON.stringify(INITIAL_DATABASE));
let activeSessions: { [token: string]: string } = {};

const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. Valid authorization header required." });
  }
  const token = authHeader.substring(7);
  if (!activeSessions[token]) {
    return res.status(401).json({ error: "Invalid or expired admin session." });
  }
  next();
};

// Auth routes
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = db.users.find((u: any) => u.username === username);
  if (user && user.passwordHash === password) {
    const token = `token-${Math.random().toString(36).substr(2)}-${Date.now()}`;
    activeSessions[token] = user.id;
    return res.json({ token, user: { id: user.id, username: user.username, name: user.name } });
  }
  return res.status(401).json({ error: "Invalid username or password. Try admin/admin123" });
});

app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    delete activeSessions[authHeader.substring(7)];
  }
  res.json({ success: true });
});

app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No session active" });
  }
  const token = authHeader.substring(7);
  const userId = activeSessions[token];
  if (!userId) return res.status(401).json({ error: "Expired session" });
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) return res.status(401).json({ error: "User not found" });
  res.json({ id: user.id, username: user.username, name: user.name });
});

// Dashboard stats
app.get("/api/dashboard/stats", requireAuth, (req, res) => {
  const todayDate = "2026-06-01";
  const todayAttendance = db.attendance.filter((a: any) => a.date === todayDate);
  const presentToday = todayAttendance.filter((a: any) => a.status === "Present").length;
  const absentToday = todayAttendance.filter((a: any) => a.status === "Absent").length;

  let totalFeesCollected = 0;
  let pendingFees = 0;
  db.fees.forEach((f: any) => {
    totalFeesCollected += Number(f.paidAmount || 0);
    pendingFees += Math.max(0, Number(f.totalFee || 0) - Number(f.paidAmount || 0));
  });

  const gradeDistribution: { [key: string]: number } = {};
  db.students.forEach((s: any) => {
    const cls = s.classVal || "Grade 10";
    gradeDistribution[cls] = (gradeDistribution[cls] || 0) + 1;
  });
  const chartData = Object.keys(gradeDistribution).map(key => ({ name: key, students: gradeDistribution[key] }));

  res.json({ totalStudents: db.students.length, presentToday, absentToday, totalFeesCollected, pendingFees, chartData });
});

// Students
app.get("/api/students", requireAuth, (req, res) => {
  const search = req.query.search?.toString().toLowerCase() || "";
  const page = parseInt(req.query.page?.toString() || "1", 10);
  const limit = parseInt(req.query.limit?.toString() || "10", 10);

  let filtered = db.students;
  if (search) {
    filtered = filtered.filter((s: any) =>
      s.name.toLowerCase().includes(search) ||
      s.rollNumber.toLowerCase().includes(search) ||
      s.admissionNumber.toLowerCase().includes(search)
    );
  }

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * limit, page * limit);
  res.json({ students: paginated, total, page, limit, totalPages: Math.ceil(total / limit) });
});

app.get("/api/students/:id", requireAuth, (req, res) => {
  const student = db.students.find((s: any) => s.id === req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found" });
  res.json(student);
});

app.post("/api/students", requireAuth, (req, res) => {
  const newStudent = req.body;
  const id = `std-${Math.random().toString(36).substr(2, 9)}`;
  const studentObj = {
    id,
    name: newStudent.name || "Unnamed Student",
    rollNumber: newStudent.rollNumber || `R-${100 + db.students.length + 1}`,
    admissionNumber: newStudent.admissionNumber || `ADM-2026-${String(db.students.length + 1).padStart(3, "0")}`,
    classVal: newStudent.classVal || "Grade 10",
    section: newStudent.section || "A",
    dob: newStudent.dob || "2010-01-01",
    gender: newStudent.gender || "Male",
    parentName: newStudent.parentName || "Unknown",
    parentPhone: newStudent.parentPhone || "",
    address: newStudent.address || "",
    admissionDate: newStudent.admissionDate || "2026-06-01",
    photoUrl: newStudent.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newStudent.name || "Default")}`
  };

  db.students.push(studentObj);
  db.fees.push({ id: `fee-${Math.random().toString(36).substr(2, 9)}`, studentId: id, feeStatus: "Pending", totalFee: 1500, paidAmount: 0, pendingAmount: 1500, paymentDate: "" });
  db.attendance.push({ id: `att-${Math.random().toString(36).substr(2, 9)}`, studentId: id, date: "2026-06-01", status: "Present" });

  res.status(201).json(studentObj);
});

app.put("/api/students/:id", requireAuth, (req, res) => {
  const index = db.students.findIndex((s: any) => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Student not found" });
  db.students[index] = { ...db.students[index], ...req.body, id: req.params.id };
  res.json(db.students[index]);
});

app.delete("/api/students/:id", requireAuth, (req, res) => {
  if (!db.students.some((s: any) => s.id === req.params.id)) {
    return res.status(404).json({ error: "Student not found" });
  }
  db.students = db.students.filter((s: any) => s.id !== req.params.id);
  db.fees = db.fees.filter((f: any) => f.studentId !== req.params.id);
  db.marks = db.marks.filter((m: any) => m.studentId !== req.params.id);
  db.attendance = db.attendance.filter((a: any) => a.studentId !== req.params.id);
  res.json({ success: true, message: "Student records removed successfully" });
});

// Attendance
app.get("/api/attendance", requireAuth, (req, res) => {
  const dateStr = req.query.date?.toString() || "2026-06-01";
  const responseData = db.students.map((student: any) => {
    const record = db.attendance.find((a: any) => a.studentId === student.id && a.date === dateStr);
    return {
      studentId: student.id, name: student.name, rollNumber: student.rollNumber,
      classVal: student.classVal, section: student.section, date: dateStr,
      status: record ? record.status : "Present",
      attendanceId: record ? record.id : null
    };
  });
  res.json(responseData);
});

app.post("/api/attendance/bulk", requireAuth, (req, res) => {
  const { date, records } = req.body;
  if (!date || !Array.isArray(records)) {
    return res.status(400).json({ error: "Date and valid student records list required" });
  }
  records.forEach((rec: any) => {
    const existingIndex = db.attendance.findIndex((a: any) => a.studentId === rec.studentId && a.date === date);
    if (existingIndex !== -1) {
      db.attendance[existingIndex].status = rec.status;
    } else {
      db.attendance.push({ id: `att-${Math.random().toString(36).substr(2, 9)}`, studentId: rec.studentId, date, status: rec.status });
    }
  });
  res.json({ success: true, message: `Attendance updated for ${records.length} students.` });
});

app.get("/api/attendance/student/:studentId", requireAuth, (req, res) => {
  const studentRecs = db.attendance.filter((a: any) => a.studentId === req.params.studentId);
  const presentCount = studentRecs.filter((a: any) => a.status === "Present").length;
  const totalDays = studentRecs.length;
  res.json({
    history: studentRecs.sort((a: any, b: any) => b.date.localeCompare(a.date)),
    presentCount, absentCount: totalDays - presentCount, totalDays,
    percentage: totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 100
  });
});

// Marks
app.get("/api/marks/student/:studentId", requireAuth, (req, res) => {
  res.json(db.marks.filter((m: any) => m.studentId === req.params.studentId));
});

app.post("/api/marks", requireAuth, (req, res) => {
  const { studentId, subject, score, maxScore } = req.body;
  if (!studentId || !subject || score === undefined) {
    return res.status(400).json({ error: "Missing required marks fields" });
  }
  const existingIndex = db.marks.findIndex((m: any) => m.studentId === studentId && m.subject.toLowerCase() === subject.toLowerCase());
  if (existingIndex !== -1) {
    db.marks[existingIndex].score = Number(score);
    db.marks[existingIndex].maxScore = Number(maxScore || 100);
    return res.json(db.marks[existingIndex]);
  }
  const markRecord = { id: `mrk-${Math.random().toString(36).substr(2, 9)}`, studentId, subject, score: Number(score), maxScore: Number(maxScore || 100) };
  db.marks.push(markRecord);
  res.status(201).json(markRecord);
});

app.put("/api/marks/:id", requireAuth, (req, res) => {
  const index = db.marks.findIndex((m: any) => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Marks entry not found" });
  db.marks[index] = { ...db.marks[index], score: Number(req.body.score), maxScore: Number(req.body.maxScore || 100) };
  res.json(db.marks[index]);
});

app.delete("/api/marks/:id", requireAuth, (req, res) => {
  if (!db.marks.some((m: any) => m.id === req.params.id)) {
    return res.status(404).json({ error: "Marks entry not found" });
  }
  db.marks = db.marks.filter((m: any) => m.id !== req.params.id);
  res.json({ success: true });
});

// Fees
app.get("/api/fees", requireAuth, (req, res) => {
  const detailedFees = db.fees.map((f: any) => {
    const s = db.students.find((std: any) => std.id === f.studentId);
    return { ...f, studentName: s ? s.name : "Unknown Student", rollNumber: s ? s.rollNumber : "N/A", classVal: s ? s.classVal : "N/A" };
  });
  res.json(detailedFees);
});

app.get("/api/fees/student/:studentId", requireAuth, (req, res) => {
  const f = db.fees.find((record: any) => record.studentId === req.params.studentId);
  if (!f) return res.json({ studentId: req.params.studentId, feeStatus: "Pending", totalFee: 1500, paidAmount: 0, pendingAmount: 1500, paymentDate: "" });
  res.json(f);
});

app.put("/api/fees/:id", requireAuth, (req, res) => {
  const index = db.fees.findIndex((f: any) => f.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Fees record not found" });

  const parsedTotal = Number(req.body.totalFee !== undefined ? req.body.totalFee : db.fees[index].totalFee);
  const parsedPaid = Number(req.body.paidAmount !== undefined ? req.body.paidAmount : db.fees[index].paidAmount);
  const pending = Math.max(0, parsedTotal - parsedPaid);
  const status = parsedPaid >= parsedTotal ? "Paid" : parsedPaid > 0 ? "Partially Paid" : "Pending";

  db.fees[index] = { ...db.fees[index], totalFee: parsedTotal, paidAmount: parsedPaid, pendingAmount: pending, feeStatus: status, paymentDate: req.body.paymentDate || new Date().toISOString().split("T")[0] };
  res.json(db.fees[index]);
});

export default app;
