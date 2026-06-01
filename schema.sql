-- -------------------------------------------------------------
-- SQL SCHEMA FOR SUPABASE ROBUST SCHOOL MANAGEMENT APPLICATION
-- PostgreSQL Tables, Foreign Key Relationships, and Row Level Security (RLS)
-- -------------------------------------------------------------

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS / ADMINS TABLE
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. STUDENTS TABLE
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    roll_number VARCHAR(100) UNIQUE NOT NULL,
    admission_number VARCHAR(100) UNIQUE NOT NULL,
    class_val VARCHAR(50) NOT NULL,
    section VARCHAR(50) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    parent_name VARCHAR(255) NOT NULL,
    parent_phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    admission_date DATE DEFAULT CURRENT_DATE NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index search fields for optimal performance
CREATE INDEX idx_students_name ON public.students(name);
CREATE INDEX idx_students_roll_number ON public.students(roll_number);
CREATE INDEX idx_students_admission_number ON public.students(admission_number);

-- 3. ATTENDANCE TABLE
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('Present', 'Absent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    -- Prevent multiple attendance records for the same student on the same date
    CONSTRAINT unique_student_date UNIQUE(student_id, date)
);

CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_attendance_student_id ON public.attendance(student_id);

-- 4. MARKS TABLE
CREATE TABLE public.marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject VARCHAR(150) NOT NULL,
    score NUMERIC(5,2) NOT NULL CHECK (score >= 0),
    max_score NUMERIC(5,2) NOT NULL DEFAULT 100.0 CHECK (max_score > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    -- Unique constraint to avoid duplicating a subject score for the exact same student
    CONSTRAINT unique_student_subject UNIQUE(student_id, subject)
);

CREATE INDEX idx_marks_student_id ON public.marks(student_id);

-- 5. FEES TABLE
CREATE TABLE public.fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID UNIQUE NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    fee_status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (fee_status IN ('Paid', 'Pending', 'Partially Paid')),
    total_fee NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total_fee >= 0),
    paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
    pending_amount NUMERIC(10,2) NOT NULL GENERATED ALWAYS AS (total_fee - paid_amount) STORED,
    payment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_fees_student_id ON public.fees(student_id);


-- -------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------

-- Enable Row Level Security for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

-- Create policies for Users
CREATE POLICY "Allow authenticated admins to select users" 
ON public.users FOR SELECT 
TO authenticated 
USING (true);

-- Create policies for Students
CREATE POLICY "Allow authenticated admins full access to students"
ON public.students FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for Attendance
CREATE POLICY "Allow authenticated admins full access to attendance"
ON public.attendance FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for Marks
CREATE POLICY "Allow authenticated admins full access to marks"
ON public.marks FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for Fees
CREATE POLICY "Allow authenticated admins full access to fees"
ON public.fees FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
