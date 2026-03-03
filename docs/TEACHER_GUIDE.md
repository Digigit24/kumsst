# 👨‍🏫 Teacher's Guide - College ERP System

> **A Complete Guide for Teachers to Use the College Management System**

---

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [My Classes](#my-classes)
4. [Assignments](#assignments)
5. [Academic Management](#academic-management)
6. [Attendance](#attendance)
7. [Quick Reference](#quick-reference)

---

## 🎯 Introduction

Welcome to the Teacher's Guide! This documentation is specifically designed for teachers to help you manage your daily teaching activities efficiently.

### What You Can Do
- 👥 View and manage your students
- 📚 View your assigned subjects
- 📝 Create and manage assignments
- ✅ Review student submissions
- 📋 Mark student attendance
- 📅 View your timetable and lab schedules
- ⏰ Check class times

---

## 🚀 Getting Started

### Logging In

1. Open the ERP system in your browser
2. Enter your **username** (provided by admin)
3. Enter your **password**
4. Click **"Login"**

**✅ Success:** You'll see the Teacher Dashboard

### Your Dashboard

After logging in, you'll see:
- 📊 **Overview**: Quick stats about your classes and students
- 📅 **Today's Schedule**: Your classes for today
- 📝 **Pending Tasks**: Assignments to review, attendance to mark
- 🔔 **Notifications**: Important updates and announcements

---

## 👥 My Classes

The **My Classes** section helps you manage your students and subjects.

### 📊 My Classes Flow

```
┌────────────────────────────────────────────────────────┐
│                    MY CLASSES                          │
└────────────────────────────────────────────────────────┘
                         │
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
   ┌──────────┐                    ┌──────────┐
   │ Students │                    │ Subjects │
   │          │                    │          │
   └──────────┘                    └──────────┘
         │                               │
         │                               │
         ▼                               ▼
   View student list              View subject details
   View student details           View assigned classes
   Contact students               View subject materials
```

---

### 1️⃣ Students

**What is it?** View all students assigned to your classes.

**How to access:**

1. Navigate to **My Classes → Students**
2. You'll see a list of all students in your classes

**What you can see:**
- **Student Name**: Full name of the student
- **Admission Number**: Unique student ID
- **Class & Section**: Which class they belong to
- **Roll Number**: Class roll number
- **Contact Information**: Email and phone (if available)
- **Attendance Percentage**: Overall attendance
- **Performance**: Recent grades and marks

**What you can do:**
- 🔍 **Search**: Find students by name or admission number
- 📊 **Filter**: Filter by class, section, or performance
- 👁️ **View Details**: Click on a student to see complete profile
- 📧 **Contact**: Send messages to students or guardians
- 📈 **Track Progress**: View attendance and academic performance

**📝 Example:**
```
Student List - John Doe (Teacher)

Class: BCS Year 1 - Section A
Total Students: 30

1. John Smith (BCS2024001)
   Roll No: 1
   Attendance: 95%
   Email: john.smith@student.edu
   
2. Jane Doe (BCS2024002)
   Roll No: 2
   Attendance: 92%
   Email: jane.doe@student.edu
```

---

### 2️⃣ Subjects

**What is it?** View all subjects assigned to you for teaching.

**How to access:**

1. Navigate to **My Classes → Subjects**
2. You'll see all your assigned subjects

**What you can see:**
- **Subject Name**: Name of the subject (e.g., Data Structures)
- **Subject Code**: Unique code (e.g., CS201)
- **Class & Section**: Which classes you teach this subject to
- **Credits**: Credit hours for the subject
- **Type**: Theory/Practical/Both
- **Schedule**: When you teach this subject

**What you can do:**
- 📚 **View Syllabus**: See course outline and topics
- 📁 **Upload Materials**: Share notes, presentations, resources
- 📊 **View Students**: See students enrolled in this subject
- 📅 **Check Schedule**: View timetable for this subject
- 📝 **Create Assignments**: Create assignments for this subject

**📝 Example:**
```
My Subjects - John Doe (Teacher)

1. Data Structures (CS201)
   Class: BCS Year 1 - Section A
   Credits: 3
   Type: Theory + Practical
   Students: 30
   Schedule: Mon, Wed, Fri - Period 1
   
2. Database Management (CS301)
   Class: BCS Year 2 - Section B
   Credits: 4
   Type: Theory + Practical
   Students: 28
   Schedule: Tue, Thu - Period 2, 3
```

---

## 📝 Assignments

The **Assignments** section helps you create assignments and review student submissions.

### 📊 Assignments Flow

```
┌────────────────────────────────────────────────────────┐
│                    ASSIGNMENTS                         │
└────────────────────────────────────────────────────────┘
                         │
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
   ┌──────────┐    ┌──────────┐   ┌──────────┐
   │  Create  │    │    My    │   │Submission│
   │Assignment│    │Assignment│   │          │
   └──────────┘    └──────────┘   └──────────┘
         │               │               │
         ▼               ▼               ▼
   Create new      View all your    Review student
   assignment      assignments      submissions
   Set deadline    Edit/Delete      Grade & provide
   Assign to       View status      feedback
   students
```

---

### 1️⃣ Create Assignment

**What is it?** Create new assignments for your students.

**How to do it:**

1. Navigate to **Assignments → Create Assignment**
2. Click **"Create New Assignment"**
3. Fill in the details:
   - **Title**: Assignment title (e.g., "Data Structures - Assignment 1")
   - **Description**: Detailed instructions
   - **Subject**: Select subject
   - **Class & Section**: Select class/section
   - **Assignment Type**: Homework/Project/Quiz/Lab Work
   - **Total Marks**: Maximum marks (e.g., 100)
   - **Due Date**: Submission deadline
   - **Attach Files**: Upload reference materials (optional)
   - **Instructions**: Additional notes for students

4. Click **"Create Assignment"**

**✅ Success:** Assignment is created and visible to students.

**📝 Example:**
```
Assignment Details:

Title: Data Structures - Assignment 1
Description: Implement linked list operations in C++
Subject: Data Structures (CS201)
Class: BCS Year 1 - Section A
Type: Homework
Total Marks: 100
Due Date: January 30, 2026
Attachments: linked_list_template.cpp

Instructions:
- Implement insert, delete, and search operations
- Add proper comments in your code
- Submit both .cpp and .exe files
- Late submissions will have 10% penalty per day
```

---

### 2️⃣ My Assignments

**What is it?** View and manage all your created assignments.

**How to access:**

1. Navigate to **Assignments → My Assignments**
2. You'll see all assignments you've created

**What you can see:**
- **Assignment Title**: Name of the assignment
- **Subject**: Which subject it belongs to
- **Class & Section**: Assigned to which class
- **Due Date**: Submission deadline
- **Total Submissions**: How many students submitted
- **Pending**: Students who haven't submitted
- **Status**: Active/Closed/Graded

**What you can do:**
- 📝 **Edit**: Modify assignment details
- 🗑️ **Delete**: Remove assignment
- 👁️ **View**: See assignment details
- 📊 **View Submissions**: Check who submitted
- 📧 **Send Reminder**: Remind students about deadline
- ✅ **Close Assignment**: Stop accepting submissions

**📝 Example:**
```
My Assignments - Data Structures

1. Assignment 1 - Linked Lists
   Class: BCS Year 1 - Section A
   Due Date: January 30, 2026
   Submissions: 25/30
   Pending: 5 students
   Status: Active
   
2. Assignment 2 - Binary Trees
   Class: BCS Year 1 - Section A
   Due Date: February 15, 2026
   Submissions: 0/30
   Pending: 30 students
   Status: Active
```

---

### 3️⃣ Submissions

**What is it?** Review and grade student submissions.

**How to access:**

1. Navigate to **Assignments → Submissions**
2. Select an assignment
3. You'll see all student submissions

**What you can see:**
- **Student Name**: Who submitted
- **Submission Date**: When they submitted
- **Status**: On Time/Late/Not Submitted
- **Attached Files**: Student's work
- **Marks Obtained**: If already graded
- **Feedback**: Your comments

**What you can do:**
- 📥 **Download**: Download student's submission
- 👁️ **View**: Preview submitted files
- ✅ **Grade**: Assign marks
- 💬 **Feedback**: Provide comments
- 📧 **Contact**: Message the student
- 🔄 **Request Resubmission**: Ask for corrections

**How to grade:**

1. Click on a submission
2. Review the student's work
3. Enter **Marks Obtained** (out of total marks)
4. Add **Feedback** (comments, suggestions)
5. Click **"Save Grade"**

**📝 Example:**
```
Submission Details:

Assignment: Data Structures - Assignment 1
Student: John Smith (BCS2024001)
Submitted: January 28, 2026 (2 days before deadline)
Status: On Time

Attached Files:
- linked_list.cpp (15 KB)
- output_screenshot.png (250 KB)

Grading:
Marks: 85/100
Feedback: Good implementation of insert and delete operations. 
However, search function has a bug in edge cases. Please review 
the logic when the list is empty. Overall, well-commented code.

Grade Status: Graded
```

---

## 📚 Academic Management

The **Academic** section helps you view schedules and manage lab sessions.

### 📊 Academic Flow

```
┌────────────────────────────────────────────────────────┐
│                  ACADEMIC MANAGEMENT                   │
└────────────────────────────────────────────────────────┘
                         │
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
   ┌──────────┐    ┌──────────┐   ┌──────────┐
   │  Class   │    │   Lab    │   │Timetable │
   │  Times   │    │ Schedule │   │          │
   └──────────┘    └──────────┘   └──────────┘
         │               │               │
         ▼               ▼               ▼
   View period     View lab         View your
   timings         sessions         weekly
                   Manage labs      schedule
```

---

### 1️⃣ Class Times

**What is it?** View the time slots for all periods in a day.

**How to access:**

1. Navigate to **Academic → Class Times**
2. You'll see all period timings

**What you can see:**
- **Period Number**: Period 1, 2, 3, etc.
- **Start Time**: When period begins
- **End Time**: When period ends
- **Duration**: Length of period
- **Is Break**: If it's a break period

**📝 Example:**
```
Class Times - Springfield University

Period 1:  9:00 AM - 10:00 AM  (60 minutes)
Period 2: 10:00 AM - 11:00 AM  (60 minutes)
Break:    11:00 AM - 11:15 AM  (15 minutes) [BREAK]
Period 3: 11:15 AM - 12:15 PM  (60 minutes)
Period 4: 12:15 PM -  1:15 PM  (60 minutes)
Lunch:     1:15 PM -  2:00 PM  (45 minutes) [BREAK]
Period 5:  2:00 PM -  3:00 PM  (60 minutes)
Period 6:  3:00 PM -  4:00 PM  (60 minutes)
```

---

### 2️⃣ Lab Schedules

**What is it?** View and manage your lab sessions.

**How to access:**

1. Navigate to **Academic → Lab Schedules**
2. You'll see all your scheduled lab sessions

**What you can see:**
- **Subject**: Which subject's lab
- **Class & Section**: Which students
- **Day**: Day of the week
- **Period**: Time slot
- **Lab/Classroom**: Which lab room
- **Type**: Regular/Special/Makeup

**What you can do:**
- 📅 **View Schedule**: See all your lab sessions
- 📝 **Add Notes**: Add instructions for lab
- 👥 **View Students**: See enrolled students
- 📊 **Track Attendance**: Mark lab attendance

**📝 Example:**
```
My Lab Schedules - John Doe

1. Data Structures Lab
   Class: BCS Year 1 - Section A
   Day: Wednesday
   Period: Period 5 (2:00 PM - 3:00 PM)
   Lab: Computer Lab A
   Type: Regular
   Students: 30
   
2. Database Management Lab
   Class: BCS Year 2 - Section B
   Day: Thursday
   Period: Period 3, 4 (11:15 AM - 1:15 PM)
   Lab: Computer Lab B
   Type: Regular
   Students: 28
```

---

### 3️⃣ Timetables

**What is it?** View your complete weekly teaching schedule.

**How to access:**

1. Navigate to **Academic → Timetables**
2. You'll see your weekly timetable

**What you can see:**
- **Day-wise Schedule**: All your classes for each day
- **Subject**: What you're teaching
- **Class & Section**: Which students
- **Period**: Time slot
- **Classroom**: Where to teach

**📝 Example:**
```
┌─────────────────────────────────────────────────────────────────┐
│         My Timetable - John Doe (Teacher)                       │
│         Week: January 20 - 26, 2026                             │
└─────────────────────────────────────────────────────────────────┘

Time        │ Monday      │ Tuesday     │ Wednesday   │ Thursday
────────────┼─────────────┼─────────────┼─────────────┼──────────
9:00-10:00  │ Data        │ Database    │ Data        │ Database
Period 1    │ Structures  │ Management  │ Structures  │ Management
            │ BCS Year 1A │ BCS Year 2B │ BCS Year 1A │ BCS Year 2B
            │ Room 101    │ Room 202    │ Room 101    │ Room 202
────────────┼─────────────┼─────────────┼─────────────┼──────────
10:00-11:00 │ Free        │ Database    │ Free        │ Database
Period 2    │             │ Management  │             │ Management
            │             │ BCS Year 2B │             │ BCS Year 2B
            │             │ Lab B       │             │ Lab B
────────────┼─────────────┼─────────────┼─────────────┼──────────
11:00-11:15 │           BREAK TIME                               │
────────────┼─────────────┼─────────────┼─────────────┼──────────
11:15-12:15 │ Data        │ Free        │ Data        │ Free
Period 3    │ Structures  │             │ Structures  │
            │ BCS Year 1B │             │ Lab A       │
            │ Room 103    │             │             │
```

---

## 📋 Attendance

The **Attendance** section helps you mark and track student attendance.

### 📊 Attendance Flow

```
┌────────────────────────────────────────────────────────┐
│                  STUDENT ATTENDANCE                    │
└────────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌────────────────────┐
              │   Select Class     │
              │   Select Section   │
              │   Select Subject   │
              └─────────┬──────────┘
                        │
                        ▼
              ┌────────────────────┐
              │  Student List      │
              │  Appears           │
              └─────────┬──────────┘
                        │
                        ▼
              ┌────────────────────┐
              │  Mark Attendance   │
              │  Present/Absent/   │
              │  Late/Excused      │
              └─────────┬──────────┘
                        │
                        ▼
              ┌────────────────────┐
              │  Submit            │
              │  Attendance        │
              └────────────────────┘
```

---

### Taking Student Attendance

**What is it?** Mark daily attendance for your classes.

**How to do it:**

1. Navigate to **Attendance → Student Attendance**
2. Click **"Mark Attendance"**
3. Select:
   - **Date**: Today or previous date
   - **Class**: Select your class
   - **Section**: Select section
   - **Subject**: Select your subject
   - **Period**: Select time slot (optional)

4. Student list will appear
5. For each student, mark:
   - ✅ **Present**: Student is in class
   - ❌ **Absent**: Student is not in class
   - ⏰ **Late**: Student arrived late
   - 📝 **Excused**: Absent with permission

6. Add **Remarks** if needed
7. Click **"Submit Attendance"**

**✅ Success:** Attendance is saved and students/parents can view it.

**📝 Example:**
```
Mark Attendance

Date: January 20, 2026
Class: BCS Year 1
Section: Section A
Subject: Data Structures
Period: Period 1 (9:00 AM - 10:00 AM)

Students (30):
☑ 1. John Smith (BCS2024001)     - Present
☑ 2. Jane Doe (BCS2024002)       - Present
☐ 3. Mike Johnson (BCS2024003)   - Absent
⏰ 4. Sarah Williams (BCS2024004) - Late (arrived 9:15 AM)
📝 5. Tom Brown (BCS2024005)      - Excused (Medical certificate)
...

Remarks: Mike Johnson absent without notice. Sarah arrived 15 mins late.

[Submit Attendance] [Cancel]
```

---

### 💡 Attendance Tips for Teachers

**Daily Routine:**
1. ✅ Take attendance at the start of each class
2. ✅ Mark late arrivals when they enter
3. ✅ Update excused absences when you receive notes
4. ✅ Add remarks for patterns (frequently late, etc.)

**Best Practices:**
1. ✅ Be consistent - same time every class
2. ✅ Double-check before submitting
3. ✅ Use remarks for special situations
4. ✅ Review attendance reports weekly

**Common Scenarios:**
- **Student arrives after you marked attendance**: Edit and change to "Late"
- **Student has medical certificate**: Mark as "Excused" and add remark
- **Student leaves early**: Mark "Present" with remark about early departure
- **Forgot to take attendance**: You can mark for previous dates

---

### Viewing Attendance Reports

**How to view:**

1. Navigate to **Attendance → Student Attendance**
2. Click **"View Reports"**
3. Select filters:
   - **Class & Section**: Your class
   - **Subject**: Your subject
   - **Date Range**: Week/Month/Custom

**Available Reports:**
- 📊 **Daily Summary**: Today's attendance
- 📈 **Student-wise**: Individual student attendance history
- 📉 **Defaulter List**: Students with low attendance
- 📅 **Monthly Report**: Month-wise attendance percentage

**📝 Example Report:**
```
Attendance Report - Data Structures
Class: BCS Year 1 - Section A
Period: January 1-20, 2026

Student Name          Total  Present  Absent  Late  Percentage
─────────────────────────────────────────────────────────────
John Smith            15     15       0       0     100%
Jane Doe              15     14       1       0     93%
Mike Johnson          15     12       3       0     80%  ⚠️
Sarah Williams        15     13       0       2     87%
Tom Brown             15     14       1       0     93%

⚠️ Students below 85% attendance
```

---

## ✅ Quick Reference Guide

### Daily Tasks Checklist

**Every Day:**
- [ ] Check your dashboard for today's schedule
- [ ] Review any notifications or announcements
- [ ] Mark attendance for all your classes
- [ ] Check for new assignment submissions

**Weekly:**
- [ ] Review attendance reports
- [ ] Grade pending assignments
- [ ] Plan next week's lessons
- [ ] Update course materials if needed

**Monthly:**
- [ ] Generate attendance reports
- [ ] Review student performance
- [ ] Submit grades (if required)
- [ ] Plan upcoming assessments

---

### Common Tasks Quick Guide

| Task | Where to Go | What to Do |
|------|------------|------------|
| **View my students** | My Classes → Students | See all students in your classes |
| **View my subjects** | My Classes → Subjects | See assigned subjects |
| **Create assignment** | Assignments → Create Assignment | Fill form and create |
| **Grade submissions** | Assignments → Submissions | Select assignment, grade students |
| **Mark attendance** | Attendance → Student Attendance | Select class, mark attendance |
| **View timetable** | Academic → Timetables | See your weekly schedule |
| **Check lab schedule** | Academic → Lab Schedules | View lab sessions |
| **View class times** | Academic → Class Times | See period timings |

---

### Keyboard Shortcuts (if available)

- **Ctrl + D**: Go to Dashboard
- **Ctrl + A**: Mark Attendance
- **Ctrl + T**: View Timetable
- **Ctrl + S**: View Students
- **Ctrl + N**: Create New Assignment

---

## 🆘 Troubleshooting

### "I can't see my students"
**Solution:** Check that you have been assigned to teach that class/section. Contact admin if needed.

### "Assignment not visible to students"
**Solution:** Ensure assignment status is "Active" and due date is in the future.

### "Cannot mark attendance for past dates"
**Solution:** Contact admin to enable backdated attendance marking.

### "Student not in attendance list"
**Solution:** Verify student is enrolled in the selected class and section.

### "Cannot access timetable"
**Solution:** Ensure you have been assigned subjects and timetable entries exist.

---

## 📞 Need Help?

If you need assistance:
1. Check this guide first
2. Contact your department head
3. Reach out to the system administrator
4. Check the help section in the system

---

## 🎉 Best Practices for Teachers

### Classroom Management:
1. ✅ Take attendance regularly and on time
2. ✅ Provide timely feedback on assignments
3. ✅ Keep students informed about deadlines
4. ✅ Use remarks to communicate with parents

### Assignment Management:
1. ✅ Create clear, detailed assignment instructions
2. ✅ Set realistic deadlines
3. ✅ Grade submissions promptly
4. ✅ Provide constructive feedback

### Communication:
1. ✅ Respond to student queries quickly
2. ✅ Keep parents informed about attendance
3. ✅ Share important announcements
4. ✅ Maintain professional communication

### Time Management:
1. ✅ Check your timetable daily
2. ✅ Plan your lessons in advance
3. ✅ Allocate time for grading
4. ✅ Keep track of deadlines

---

**Happy Teaching! 📚**

---

*Last Updated: January 2026*
*Version: 1.0 - Teacher's Guide*
