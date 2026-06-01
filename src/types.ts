/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  admissionNumber: string;
  classVal: string;
  section: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  parentName: string;
  parentPhone: string;
  address: string;
  admissionDate: string;
  photoUrl: string; // Base64 or placeholder url
}

export type AttendanceStatus = 'Present' | 'Absent';

export interface Attendance {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}

export interface Marks {
  id: string;
  studentId: string;
  subject: string;
  score: number;
  maxScore: number;
}

export type FeeStatus = 'Paid' | 'Pending' | 'Partially Paid';

export interface FeeRecord {
  id: string;
  studentId: string;
  feeStatus: FeeStatus;
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
  paymentDate?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
}

export interface DashboardStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  totalFeesCollected: number;
  pendingFees: number;
}
