# 📚 College ERP System - User Guide

> **A Complete Step-by-Step Guide to Setting Up and Using Your College Management System**

---

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Core Setup (Foundation)](#core-setup-foundation)

---

## 🎯 Introduction

Welcome to your College ERP System! This guide will walk you through setting up and using the system, starting from the very foundation.

### What You'll Learn
- How to set up your college in the system
- The correct order to create different modules
- Understanding dependencies between modules

---

## 🚀 Getting Started

Before you begin, make sure you have:
- ✅ Administrator access to the system
- ✅ Basic information about your college
- ✅ Academic calendar details

---

## 🏗️ Core Setup (Foundation)

The **Core** module is the foundation of your ERP system. Everything else depends on these basic settings.

### 📊 Setup Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CORE MODULE SETUP                         │
└─────────────────────────────────────────────────────────────┘

    Step 1                Step 2                Step 3
┌──────────┐         ┌──────────┐         ┌──────────────┐
│ College  │────────▶│ Academic │────────▶│  Academic    │
│          │         │   Year   │         │   Session    │
└──────────┘         └──────────┘         └──────────────┘
                                                  │
                                                  │
                     ┌────────────────────────────┴─────────┐
                     │                                      │
                     ▼                                      ▼
              ┌──────────┐                          ┌──────────┐
              │ Holidays │                          │ Activity │
              │          │                          │   Logs   │
              └──────────┘                          └──────────┘
              (Independent)                         (Independent)

Legend:
────▶  Required dependency (must be created first)
```

---

### Step 1️⃣: Create a College

**What is it?** Your institution's basic information and identity in the system.

**When to do it?** This is the FIRST thing you must do.

**How to do it:**

1. Navigate to **Core → Colleges**
2. Click **"Add New College"**
3. Fill in the details:
   - **College Name**: Full name of your institution
   - **College Code**: Short code (e.g., "ABC" for ABC College)
   - **Address**: Complete address
   - **Contact Information**: Phone, email, website
   - **Established Year**: When your college was founded
   - **Affiliation**: University or board affiliation

4. Click **"Save"**

**✅ Success Indicator:** You should see your college listed in the colleges table.

**📝 Example:**
```
College Name: Springfield University
College Code: SPU
Address: 123 Main Street, Springfield
Phone: +1-555-0100
Email: info@springfield.edu
Established: 1985
```

---

### Step 2️⃣: Create Academic Year

**What is it?** The yearly cycle for your academic activities (e.g., 2024-2025).

**When to do it?** After creating your college.

**Why it's important:** Academic sessions, classes, and student enrollments are tied to academic years.

**How to do it:**

1. Navigate to **Core → Academic Years**
2. Click **"Add New Academic Year"**
3. Fill in the details:
   - **Year Name**: e.g., "2024-2025"
   - **Start Date**: When the academic year begins
   - **End Date**: When the academic year ends
   - **College**: Select your college
   - **Is Current**: Mark if this is the current year
   - **Status**: Active/Inactive

4. Click **"Save"**

**✅ Success Indicator:** The academic year appears in the list.

**📝 Example:**
```
Year Name: 2024-2025
Start Date: July 1, 2024
End Date: June 30, 2025
College: Springfield University
Is Current: ✓ Yes
Status: Active
```

---

### Step 3️⃣: Create Academic Session

**What is it?** A semester or term within an academic year (e.g., Fall 2024, Spring 2025).

**When to do it?** After creating an academic year.

**⚠️ Dependency:** You MUST create an Academic Year first!

**How to do it:**

1. Navigate to **Core → Academic Sessions**
2. Click **"Add New Session"**
3. Fill in the details:
   - **Session Name**: e.g., "Fall Semester 2024"
   - **Academic Year**: Select from dropdown (created in Step 2)
   - **Start Date**: Session start date
   - **End Date**: Session end date
   - **College**: Select your college
   - **Is Current**: Mark if this is the active session
   - **Status**: Active/Inactive

4. Click **"Save"**

**✅ Success Indicator:** The session appears linked to the academic year.

**📝 Example:**
```
Session Name: Fall Semester 2024
Academic Year: 2024-2025
Start Date: August 15, 2024
End Date: December 20, 2024
College: Springfield University
Is Current: ✓ Yes
Status: Active
```

---

### Step 4️⃣: Add Holidays (Optional)

**What is it?** Official holidays and breaks during the academic year.

**When to do it?** Anytime after creating academic sessions.

**⚠️ Note:** This is INDEPENDENT - no dependencies required!

**How to do it:**

1. Navigate to **Core → Holidays**
2. Click **"Add New Holiday"**
3. Fill in the details:
   - **Holiday Name**: e.g., "Christmas Break"
   - **Start Date**: First day of holiday
   - **End Date**: Last day of holiday
   - **Holiday Type**: National/Regional/College-specific
   - **Description**: Brief description
   - **Applies To**: All colleges or specific college

4. Click **"Save"**

**📝 Example:**
```
Holiday Name: Christmas Break
Start Date: December 24, 2024
End Date: January 2, 2025
Type: College Holiday
Description: Winter break for all students and staff
```

---

### Step 5️⃣: Activity Logs (Automatic)

**What is it?** System-generated logs of all activities in the ERP.

**When to do it?** Nothing to do - this is automatic!

**⚠️ Note:** This is INDEPENDENT and automatically maintained by the system.

**How to view:**

1. Navigate to **Core → Activity Logs**
2. View all system activities with filters:
   - User who performed the action
   - Action type (Create, Update, Delete)
   - Date and time
   - Module affected

**📝 Use Case:** Track who created what and when for audit purposes.

---

## ✅ Core Module Completion Checklist

Before moving to the next module, ensure:

- [ ] ✓ College is created
- [ ] ✓ At least one Academic Year is created
- [ ] ✓ At least one Academic Session is created
- [ ] ✓ Holidays are added (optional but recommended)
- [ ] ✓ You can view activity logs

---


## 🎓 Academic Setup

The **Academic** module handles all educational structure - from faculties and programs to timetables. This is where you define what you teach and how it's organized.

### 📊 Complete Academic Module Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    ACADEMIC MODULE SETUP                        │
│                  (Recommended Creation Order)                   │
└────────────────────────────────────────────────────────────────┘

INDEPENDENT ITEMS (Create First - No Dependencies)
┌──────────┐    ┌──────────┐    ┌──────────┐
│ Faculty  │    │ Subject  │    │Classroom │
│          │    │          │    │          │
└─────┬────┘    └──────────┘    └──────────┘
      │
      │
      ▼
┌──────────┐         ┌──────────────┐
│ Program  │────────▶│ Class Time   │
│          │         │  (Periods)   │
└─────┬────┘         └──────────────┘
      │
      │ (+ Academic Session from Core)
      ▼
┌──────────┐
│ Classes  │
│          │
└─────┬────┘
      │
      ▼
┌──────────┐
│ Sections │
│          │
└─────┬────┘
      │
      │ (+ Subject + Teacher)
      ▼
┌──────────────────┐         ┌────────────────────┐
│     Subject      │         │ Optional Subject   │
│   Assignments    │         │      Groups        │
└────────┬─────────┘         └────────────────────┘
         │                    (Needs: Class + Subjects)
         │
         │ (+ Class Time + Classroom)
         ▼
┌──────────────────┐
│  Lab Schedules   │
└────────┬─────────┘
         │
         │ (+ Class + Section)
         ▼
┌──────────────────┐         ┌────────────────────┐
│  Class Teacher   │         │    TIMETABLE       │
│   Assignments    │         │                    │
└──────────────────┘         └────────────────────┘
                              (Needs: Everything!)

Legend:
────▶  Dependency flow
```

---

### 📋 Academic Module Creation Order

Follow this order for smooth setup:

1. **Faculty** (Independent)
2. **Subject** (Independent)
3. **Classroom** (Independent)
4. **Class Time** (Independent)
5. **Program** (Needs: Faculty)
6. **Classes** (Needs: Program + Academic Session)
7. **Sections** (Needs: Classes)
8. **Optional Subject Groups** (Needs: Class + Subjects)
9. **Subject Assignments** (Needs: Subject + Class + Section + Teacher)
10. **Lab Schedules** (Needs: Subject Assignment + Section + Period + Classroom)
11. **Class Teacher** (Needs: Class + Section + Academic Session + Teacher)
12. **Timetable** (Needs: Class + Section + Subject Assignment + Classroom + Lab Schedule)

---

### Step 1️⃣: Create Faculty

**What is it?** Academic divisions or departments (e.g., "Faculty of Engineering", "Faculty of Arts").

**When to do it?** Start here - it's independent!

**⚠️ Dependencies:** None - completely independent!

**How to do it:**

1. Navigate to **Academic → Faculties**
2. Click **"Add New Faculty"**
3. Fill in the details:
   - **Faculty Name**: e.g., "Faculty of Engineering"
   - **Faculty Code**: e.g., "FOE"
   - **Description**: Brief description
   - **College**: Select your college
   - **Status**: Active/Inactive

4. Click **"Save"**

**📝 Example:**
```
Faculty Name: Faculty of Engineering
Faculty Code: FOE
Description: Handles all engineering programs
College: Springfield University
Status: Active
```

---

### Step 2️⃣: Create Subjects

**What is it?** Individual courses or subjects taught (e.g., "Data Structures", "Mathematics").

**When to do it?** Early in the setup - it's independent!

**⚠️ Dependencies:** None - completely independent!

**How to do it:**

1. Navigate to **Academic → Subjects**
2. Click **"Add New Subject"**
3. Fill in the details:
   - **Subject Name**: e.g., "Data Structures"
   - **Subject Code**: e.g., "CS201"
   - **Credits**: Credit hours (e.g., 3)
   - **Type**: Theory/Practical/Both
   - **Description**: Brief description

4. Click **"Save"**

**📝 Example:**
```
Subject Name: Data Structures
Subject Code: CS201
Credits: 3
Type: Theory + Practical
Description: Study of arrays, linked lists, trees, graphs
```

---

### Step 3️⃣: Create Classrooms

**What is it?** Physical rooms where classes are held (e.g., "Room 101", "Lab A").

**When to do it?** Early in the setup - it's independent!

**⚠️ Dependencies:** None - completely independent!

**How to do it:**

1. Navigate to **Academic → Classrooms**
2. Click **"Add New Classroom"**
3. Fill in the details:
   - **Classroom Name**: e.g., "Room 101"
   - **Classroom Code**: e.g., "R101"
   - **Building**: Building name/number
   - **Floor**: Floor number
   - **Capacity**: Maximum students
   - **Type**: Lecture Hall/Lab/Seminar Room
   - **Facilities**: Projector, AC, etc.

4. Click **"Save"**

**📝 Example:**
```
Classroom Name: Computer Lab A
Code: LAB-A
Building: Engineering Block
Floor: 2
Capacity: 40 students
Type: Computer Lab
Facilities: 40 PCs, Projector, AC
```

---

### Step 4️⃣: Create Class Times (Periods)

**What is it?** Time slots for classes throughout the day (e.g., "Period 1: 9:00 AM - 10:00 AM").

**When to do it?** Before creating timetables.

**⚠️ Dependencies:** None - completely independent!

**How to do it:**

1. Navigate to **Academic → Class Times**
2. Click **"Add New Class Time"**
3. Fill in the details:
   - **Period Number**: e.g., 1, 2, 3
   - **Start Time**: e.g., 9:00 AM
   - **End Time**: e.g., 10:00 AM
   - **College**: Select your college
   - **Is Break**: Mark if this is a break period
   - **Status**: Active/Inactive

4. Click **"Save"**

**💡 Tip:** Create all periods for your daily schedule in one go!

**📝 Example:**
```
Period Number: 1
Start Time: 9:00 AM
End Time: 10:00 AM
College: Springfield University
Is Break: No
Status: Active
```

**Sample Daily Schedule:**
```
Period 1:  9:00 AM - 10:00 AM
Period 2: 10:00 AM - 11:00 AM
Break:    11:00 AM - 11:15 AM (Mark as Break)
Period 3: 11:15 AM - 12:15 PM
Period 4: 12:15 PM -  1:15 PM
Lunch:     1:15 PM -  2:00 PM (Mark as Break)
Period 5:  2:00 PM -  3:00 PM
Period 6:  3:00 PM -  4:00 PM
```

---

### Step 5️⃣: Create Programs

**What is it?** Degree programs offered (e.g., "Bachelor of Computer Science", "MBA").

**When to do it?** After creating Faculty.

**⚠️ Dependencies:** 
- ✅ Faculty must be created first

**How to do it:**

1. Navigate to **Academic → Programs**
2. Click **"Add New Program"**
3. Fill in the details:
   - **Program Name**: e.g., "Bachelor of Computer Science"
   - **Program Code**: e.g., "BCS"
   - **Faculty**: Select faculty (created in Step 1)
   - **Duration**: Number of years (e.g., 4 years)
   - **College**: Select college
   - **Description**: Brief description

4. Click **"Save"**

**📝 Example:**
```
Program Name: Bachelor of Computer Science
Program Code: BCS
Faculty: Faculty of Engineering
Duration: 4 years
College: Springfield University
Description: Undergraduate program in computer science
```

---

### Step 6️⃣: Create Classes

**What is it?** Year levels within a program (e.g., "BCS Year 1", "BCS Year 2").

**When to do it?** After creating Programs and Academic Sessions.

**⚠️ Dependencies:** 
- ✅ Program must be created first
- ✅ Academic Session must be created first (from Core module)

**How to do it:**

1. Navigate to **Academic → Classes**
2. Click **"Add New Class"**
3. Fill in the details:
   - **Class Name**: e.g., "BCS Year 1"
   - **Program**: Select program (created in Step 5)
   - **Academic Session**: Select session (from Core module)
   - **Year Level**: 1, 2, 3, or 4
   - **College**: Select college
   - **Capacity**: Maximum students
   - **Status**: Active/Inactive

4. Click **"Save"**

**📝 Example:**
```
Class Name: BCS Year 1
Program: Bachelor of Computer Science
Academic Session: Fall Semester 2024
Year Level: 1
Capacity: 60 students
Status: Active
```

---

### Step 7️⃣: Create Sections

**What is it?** Divisions within a class when you have too many students (e.g., "Section A", "Section B").

**When to do it?** After creating Classes.

**⚠️ Dependencies:** 
- ✅ Class must be created first

**Why sections?** When you have 60 students but your classroom only fits 30, you create 2 sections.

**How to do it:**

1. Navigate to **Academic → Sections**
2. Click **"Add New Section"**
3. Fill in the details:
   - **Section Name**: e.g., "Section A"
   - **Class**: Select class (created in Step 6)
   - **Capacity**: Maximum students in this section
   - **Status**: Active/Inactive

4. Click **"Save"**

**📝 Example:**
```
Section Name: Section A
Class: BCS Year 1
Capacity: 30 students
Status: Active
```

**💡 Tip:** For 60 students, create:
- Section A (30 students)
- Section B (30 students)

---

### Step 8️⃣: Create Optional Subject Groups

**What is it?** Groups of elective subjects where students can choose one (e.g., choose between Python or Java).

**When to do it?** After creating Classes and Subjects.

**⚠️ Dependencies:** 
- ✅ Class must be created first
- ✅ Subjects must be created first

**How to do it:**

1. Navigate to **Academic → Optional Subject Groups**
2. Click **"Add New Group"**
3. Fill in the details:
   - **Group Name**: e.g., "Programming Language Elective"
   - **Class**: Select class
   - **Subjects**: Select multiple subjects for this group
   - **Minimum Selection**: How many subjects student must choose
   - **Maximum Selection**: Maximum subjects student can choose
   - **Description**: Brief description

4. Click **"Save"**

**📝 Example:**
```
Group Name: Programming Language Elective
Class: BCS Year 2
Subjects: Python Programming, Java Programming, C++ Programming
Minimum Selection: 1
Maximum Selection: 1
Description: Students must choose one programming language
```

---

### Step 9️⃣: Create Subject Assignments

**What is it?** Assigning teachers to teach specific subjects to specific sections.

**When to do it?** After creating Subjects, Classes, Sections, and Teachers.

**⚠️ Dependencies:** 
- ✅ Subject must be created first
- ✅ Class must be created first
- ✅ Section must be created first
- ✅ Teacher (user with teacher role) must be created first

**How to do it:**

1. Navigate to **Academic → Subject Assignments**
2. Click **"Add New Assignment"**
3. Fill in the details:
   - **Section**: Select section
   - **Subject**: Select subject
   - **Teacher**: Select teacher
   - **Academic Session**: Select session
   - **Status**: Active/Inactive

4. Click **"Save"**

**📝 Example:**
```
Section: BCS Year 1 - Section A
Subject: Data Structures
Teacher: John Doe
Academic Session: Fall Semester 2024
Status: Active
```

---

### Step 🔟: Create Lab Schedules

**What is it?** Scheduled lab sessions for practical subjects.

**When to do it?** After creating Subject Assignments, Sections, Class Times, and Classrooms.

**⚠️ Dependencies:** 
- ✅ Subject Assignment must be created first
- ✅ Section must be created first
- ✅ Period (from Class Time) must be created first
- ✅ Classroom must be created first

**How to do it:**

1. Navigate to **Academic → Lab Schedules**
2. Click **"Add New Lab Schedule"**
3. Fill in the details:
   - **Subject Assignment**: Select assignment
   - **Section**: Select section
   - **Day of Week**: Monday, Tuesday, etc.
   - **Period**: Select time slot
   - **Classroom**: Select lab/classroom
   - **Lab Type**: Regular/Special/Makeup
   - **Status**: Active/Inactive

4. Click **"Save"**

**📝 Example:**
```
Subject Assignment: Data Structures - John Doe - Section A
Section: BCS Year 1 - Section A
Day: Wednesday
Period: Period 5 (2:00 PM - 3:00 PM)
Classroom: Computer Lab A
Lab Type: Regular
Status: Active
```

---

### Step 1️⃣1️⃣: Assign Class Teachers

**What is it?** Assigning a teacher as the class teacher (homeroom teacher) for a class and section.

**When to do it?** After creating Classes, Sections, Academic Sessions, and Teachers.

**⚠️ Dependencies:** 
- ✅ Class must be created first
- ✅ Section must be created first
- ✅ Academic Session must be created first
- ✅ Teacher must be created first

**How to do it:**

1. Navigate to **Academic → Class Teachers**
2. Click **"Assign Class Teacher"**
3. Fill in the details:
   - **Class**: Select class
   - **Section**: Select section
   - **Teacher**: Select teacher
   - **Academic Session**: Select session
   - **Effective From**: Start date
   - **Effective To**: End date (optional)
   - **Status**: Active/Inactive

4. Click **"Save"**

**📝 Example:**
```
Class: BCS Year 1
Section: Section A
Teacher: John Doe
Academic Session: Fall Semester 2024
Effective From: August 15, 2024
Status: Active
```

---

### Step 1️⃣2️⃣: Create Timetable

**What is it?** The complete weekly schedule showing which subject is taught when, where, and by whom.

**When to do it?** After EVERYTHING else is created - this is the final step!

**⚠️ Dependencies (ALL required):** 
- ✅ Class must be created
- ✅ Section must be created
- ✅ Subject Assignment must be created
- ✅ Classroom must be created (optional but recommended)
- ✅ Lab Schedule must be created (for lab sessions)

**How to do it:**

1. Navigate to **Academic → Timetables**
2. Select your **Class** and **Section**
3. Click **"Add Schedule Entry"**
4. Fill in the details:
   - **Subject Assignment**: Select (shows subject + teacher)
   - **Day of Week**: Monday, Tuesday, etc.
   - **Class Time**: Select period
   - **Teacher Override** (Optional): Different teacher for this slot
   - **Classroom** (Optional): Assign specific room
   - **Effective From**: When this schedule starts
   - **Effective To** (Optional): When it ends
   - **Status**: Active

5. Click **"Create Timetable Entry"**
6. Repeat for each day and period

**📝 Example:**
```
Class: BCS Year 1 (pre-filled)
Section: Section A (pre-filled)
Subject Assignment: Data Structures - John Doe
Day: Monday
Period: Period 1 (9:00 AM - 10:00 AM)
Classroom: Room 101
Effective From: August 15, 2024
Status: Active
```

---

### 🎨 Sample Timetable Result

After creating all entries, your timetable will look like this:

```
┌─────────────────────────────────────────────────────────────────┐
│         BCS Year 1 - Section A Timetable                        │
│         Fall Semester 2024                                      │
└─────────────────────────────────────────────────────────────────┘

Time        │ Monday      │ Tuesday     │ Wednesday   │ Thursday
────────────┼─────────────┼─────────────┼─────────────┼──────────
9:00-10:00  │ Data        │ Mathematics │ Data        │ Physics
Period 1    │ Structures  │ Prof. Smith │ Structures  │ Dr. Brown
            │ John Doe    │ Room 202    │ John Doe    │ Room 103
            │ Room 101    │             │ Room 101    │
────────────┼─────────────┼─────────────┼─────────────┼──────────
10:00-11:00 │ English     │ Data        │ Mathematics │ Data
Period 2    │ Ms. Wilson  │ Structures  │ Prof. Smith │ Structures
            │ Room 105    │ Lab A       │ Room 202    │ Lab A
────────────┼─────────────┼─────────────┼─────────────┼──────────
11:00-11:15 │           BREAK TIME                               │
────────────┼─────────────┼─────────────┼─────────────┼──────────
11:15-12:15 │ Physics     │ English     │ Physics     │ English
Period 3    │ Dr. Brown   │ Ms. Wilson  │ Lab B       │ Ms. Wilson
            │ Room 103    │ Room 105    │             │ Room 105
```

---

## ✅ Academic Module Completion Checklist

Before considering the Academic module complete, ensure:

**Independent Items:**
- [ ] ✓ Faculties are created
- [ ] ✓ Subjects are created
- [ ] ✓ Classrooms are created
- [ ] ✓ Class Times (Periods) are created

**Dependent Items:**
- [ ] ✓ Programs are created (needs Faculty)
- [ ] ✓ Classes are created (needs Program + Academic Session)
- [ ] ✓ Sections are created (needs Classes)
- [ ] ✓ Optional Subject Groups created (if needed)
- [ ] ✓ Subject Assignments created (needs Subject + Class + Section + Teacher)
- [ ] ✓ Lab Schedules created (needs Subject Assignment + Period + Classroom)
- [ ] ✓ Class Teachers assigned (needs Class + Section + Teacher)
- [ ] ✓ Timetable entries created (needs everything!)

---

## 📊 Academic Module Dependencies Summary

| Item | Dependencies | Create After |
|------|-------------|--------------|
| **Faculty** | None | Anytime |
| **Subject** | None | Anytime |
| **Classroom** | None | Anytime |
| **Class Time** | None | Anytime |
| **Program** | Faculty | Faculty |
| **Classes** | Program + Academic Session | Program + Core module |
| **Sections** | Classes | Classes |
| **Optional Subject Groups** | Class + Subjects | Classes + Subjects |
| **Subject Assignments** | Subject + Class + Section + Teacher | All prerequisites |
| **Lab Schedules** | Subject Assignment + Section + Period + Classroom | Subject Assignments + Class Times + Classrooms |
| **Class Teacher** | Class + Section + Academic Session + Teacher | Classes + Sections |
| **Timetable** | Class + Section + Subject Assignment + Classroom + Lab Schedule | Everything! |

---

---

## �‍🎓 Student Management

The **Student** module handles all student-related information - from basic enrollment to documents, addresses, and medical records.

### 📊 Student Module Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    STUDENT MODULE SETUP                         │
└────────────────────────────────────────────────────────────────┘

PREREQUISITES (Must exist first)
┌──────────────┐    ┌──────────┐    ┌──────────┐
│   Program    │    │  Class   │    │ Section  │
│ (Academic)   │    │(Academic)│    │(Academic)│
└──────────────┘    └──────────┘    └──────────┘
                           │
                           │
                           ▼
                    ┌──────────────┐
                    │   Academic   │
                    │     Year     │
                    │    (Core)    │
                    └──────────────┘

STEP 1: CREATE STUDENT
┌─────────────────────────────────────────────┐
│              STUDENT                        │
│  (Needs: Program, Class, Section,           │
│   Academic Year)                            │
└──────────────┬──────────────────────────────┘
               │
               │ Student ID Created
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│         ADDITIONAL STUDENT INFORMATION                   │
│         (All need Student to be created first)           │
└──────────────────────────────────────────────────────────┘
               │
               ├──────────────┬──────────────┬─────────────┐
               │              │              │             │
               ▼              ▼              ▼             ▼
        ┌──────────┐   ┌──────────┐  ┌──────────┐  ┌──────────┐
        │Guardians │   │Documents │  │ Address  │  │ Medical  │
        │          │   │          │  │          │  │ Records  │
        └──────────┘   └──────────┘  └──────────┘  └──────────┘

               ├──────────────┬──────────────┐
               │              │              │
               ▼              ▼              ▼
        ┌──────────┐   ┌──────────┐  ┌──────────────┐
        │ Student  │   │Promotion │  │ Certificates │
        │  Groups  │   │          │  │              │
        └──────────┘   └──────────┘  └──────────────┘

Legend:
────▶  Dependency flow
```

---

### 📋 Student Module Creation Order

1. **Student** (Needs: Program + Class + Section + Academic Year)
2. **Guardians** (Needs: Student)
3. **Student Documents** (Needs: Student)
4. **Student Addresses** (Needs: Student)
5. **Student Medical Records** (Needs: Student)
6. **Student Groups** (Needs: Student)
7. **Student Promotions** (Needs: Student + New Class)
8. **Certificates** (Needs: Student)

---

### Step 1️⃣: Create Student

**What is it?** The main student record with personal and academic information.

**When to do it?** After completing Academic module setup (Program, Class, Section).

**⚠️ Dependencies:** 
- ✅ Program must be created (from Academic module)
- ✅ Class must be created (from Academic module)
- ✅ Section must be created (from Academic module)
- ✅ Academic Year must be created (from Core module)

**How to do it:**

1. Navigate to **Students → Students**
2. Click **"Add New Student"**
3. Fill in the **Personal Information**:
   - **First Name**: Student's first name
   - **Last Name**: Student's last name
   - **Date of Birth**: Student's birth date
   - **Gender**: Male/Female/Other
   - **Blood Group**: A+, B+, O+, etc.
   - **Email**: Student's email (optional)
   - **Phone**: Contact number (optional)
   - **Photo**: Upload student photo

4. Fill in the **Academic Details**:
   - **Admission Number**: Unique student ID
   - **Admission Date**: Date of admission
   - **Program**: Select program (e.g., BCS)
   - **Class**: Select class (e.g., BCS Year 1)
   - **Section**: Select section (e.g., Section A)
   - **Academic Year**: Select year (e.g., 2024-2025)
   - **Roll Number**: Class roll number

5. Fill in **Additional Information** (Optional):
   - **Religion**: Student's religion
   - **Caste/Category**: If applicable
   - **Nationality**: Student's nationality
   - **Mother Tongue**: Primary language

6. Click **"Save"**

**✅ Success Indicator:** Student appears in the students list with admission number.

**📝 Example:**
```
Personal Information:
- First Name: John
- Last Name: Smith
- Date of Birth: January 15, 2006
- Gender: Male
- Blood Group: A+
- Email: john.smith@student.edu
- Phone: +1-555-0123

Academic Details:
- Admission Number: BCS2024001
- Admission Date: August 1, 2024
- Program: Bachelor of Computer Science
- Class: BCS Year 1
- Section: Section A
- Academic Year: 2024-2025
- Roll Number: 1

Status: Active
```

---

### Step 2️⃣: Add Guardians

**What is it?** Parent or guardian information for the student.

**When to do it?** After creating the student.

**⚠️ Dependencies:** 
- ✅ Student must be created first

**How to do it:**

1. Navigate to **Students → Guardians**
2. Click **"Add New Guardian"**
3. Fill in the details:
   - **Student**: Select student
   - **Guardian Type**: Father/Mother/Legal Guardian
   - **First Name**: Guardian's first name
   - **Last Name**: Guardian's last name
   - **Relationship**: Father/Mother/Uncle/Aunt/Other
   - **Phone**: Contact number
   - **Email**: Guardian's email
   - **Occupation**: Guardian's profession
   - **Annual Income**: Family income (optional)
   - **Address**: Guardian's address
   - **Is Primary Contact**: Mark if main contact

4. Click **"Save"**

**💡 Tip:** You can add multiple guardians (father, mother, etc.) for one student.

**�📝 Example:**
```
Student: John Smith (BCS2024001)
Guardian Type: Father
First Name: Robert
Last Name: Smith
Relationship: Father
Phone: +1-555-0124
Email: robert.smith@email.com
Occupation: Engineer
Is Primary Contact: ✓ Yes
```

---

### Step 3️⃣: Add Student Documents

**What is it?** Important documents like birth certificate, ID proof, previous marksheets, etc.

**When to do it?** After creating the student.

**⚠️ Dependencies:** 
- ✅ Student must be created first

**How to do it:**

1. Navigate to **Students → Student Documents**
2. Click **"Add New Document"**
3. Fill in the details:
   - **Student**: Select student
   - **Document Type**: Birth Certificate/ID Proof/Marksheet/Transfer Certificate/etc.
   - **Document Title**: Brief title
   - **Document Number**: Reference number (if any)
   - **Issue Date**: When document was issued
   - **Expiry Date**: If applicable
   - **Issued By**: Issuing authority
   - **Upload Document**: Attach file (PDF, Image)
   - **Notes**: Additional information

4. Click **"Save"**

**📝 Example:**
```
Student: John Smith (BCS2024001)
Document Type: Birth Certificate
Document Title: Birth Certificate - John Smith
Document Number: BC/2006/12345
Issue Date: January 20, 2006
Issued By: City Hospital, Springfield
File: birth_certificate.pdf
```

---

### Step 4️⃣: Add Student Addresses

**What is it?** Student's residential addresses (current and permanent).

**When to do it?** After creating the student.

**⚠️ Dependencies:** 
- ✅ Student must be created first

**How to do it:**

1. Navigate to **Students → Student Addresses**
2. Click **"Add New Address"**
3. Fill in the details:
   - **Student**: Select student
   - **Address Type**: Current/Permanent/Temporary
   - **Address Line 1**: Street address
   - **Address Line 2**: Additional address info
   - **City**: City name
   - **State/Province**: State name
   - **Postal Code**: ZIP/PIN code
   - **Country**: Country name
   - **Is Primary**: Mark if main address

4. Click **"Save"**

**💡 Tip:** Add both current and permanent addresses if they're different.

**📝 Example:**
```
Student: John Smith (BCS2024001)
Address Type: Current
Address Line 1: 123 Main Street
Address Line 2: Apartment 4B
City: Springfield
State: Illinois
Postal Code: 62701
Country: United States
Is Primary: ✓ Yes
```

---

### Step 5️⃣: Add Medical Records

**What is it?** Student's health information, allergies, medical conditions, and emergency contacts.

**When to do it?** After creating the student.

**⚠️ Dependencies:** 
- ✅ Student must be created first

**How to do it:**

1. Navigate to **Students → Student Medical Records**
2. Click **"Add New Medical Record"**
3. Fill in the details:
   - **Student**: Select student
   - **Blood Group**: A+, B+, O+, etc.
   - **Height**: In cm or feet/inches
   - **Weight**: In kg or lbs
   - **Medical Conditions**: Diabetes, Asthma, etc.
   - **Allergies**: Food allergies, drug allergies
   - **Medications**: Current medications
   - **Doctor Name**: Family doctor
   - **Doctor Phone**: Doctor's contact
   - **Emergency Contact**: Emergency contact person
   - **Emergency Phone**: Emergency number
   - **Last Checkup Date**: Date of last medical exam
   - **Notes**: Additional health information

4. Click **"Save"**

**📝 Example:**
```
Student: John Smith (BCS2024001)
Blood Group: A+
Height: 170 cm
Weight: 65 kg
Medical Conditions: None
Allergies: Peanuts
Medications: None
Doctor Name: Dr. Sarah Johnson
Doctor Phone: +1-555-0125
Emergency Contact: Robert Smith (Father)
Emergency Phone: +1-555-0124
Last Checkup: July 15, 2024
```

---

### Step 6️⃣: Create Student Groups

**What is it?** Organizing students into groups for activities, sports, clubs, etc.

**When to do it?** After creating students.

**⚠️ Dependencies:** 
- ✅ Students must be created first

**How to do it:**

1. Navigate to **Students → Student Groups**
2. Click **"Add New Group"**
3. Fill in the details:
   - **Group Name**: e.g., "Debate Club", "Football Team"
   - **Group Type**: Club/Sports/Academic/Cultural
   - **Description**: Purpose of the group
   - **Coordinator**: Teacher in charge
   - **Students**: Select multiple students
   - **Meeting Schedule**: When group meets
   - **Status**: Active/Inactive

4. Click **"Save"**

**📝 Example:**
```
Group Name: Computer Science Club
Group Type: Academic
Description: Students interested in programming and technology
Coordinator: John Doe (Teacher)
Students: 
  - John Smith (BCS2024001)
  - Jane Doe (BCS2024002)
  - Mike Johnson (BCS2024003)
Meeting Schedule: Every Friday 4:00 PM
Status: Active
```

---

### Step 7️⃣: Student Promotions

**What is it?** Moving students from one class to the next (e.g., Year 1 to Year 2).

**When to do it?** At the end of academic year or semester.

**⚠️ Dependencies:** 
- ✅ Student must be created
- ✅ New class (next year) must be created

**How to do it:**

1. Navigate to **Students → Student Promotions**
2. Click **"Promote Students"**
3. Fill in the details:
   - **Current Class**: Select current class (e.g., BCS Year 1)
   - **Current Section**: Select current section
   - **Promote To Class**: Select next class (e.g., BCS Year 2)
   - **Promote To Section**: Select new section
   - **Academic Year**: New academic year
   - **Promotion Date**: Date of promotion
   - **Select Students**: Choose students to promote
   - **Remarks**: Promotion notes

4. Click **"Promote"**

**📝 Example:**
```
Current Class: BCS Year 1
Current Section: Section A
Promote To Class: BCS Year 2
Promote To Section: Section A
Academic Year: 2025-2026
Promotion Date: June 30, 2025
Students: Select all eligible students
Remarks: Promoted based on academic performance
```

---

### Step 8️⃣: Issue Certificates

**What is it?** Generating certificates for students (bonafide, character, transfer, etc.).

**When to do it?** When student requests a certificate.

**⚠️ Dependencies:** 
- ✅ Student must be created

**How to do it:**

1. Navigate to **Students → Certificates**
2. Click **"Issue New Certificate"**
3. Fill in the details:
   - **Student**: Select student
   - **Certificate Type**: Bonafide/Character/Transfer/Completion
   - **Certificate Number**: Unique certificate ID
   - **Issue Date**: Date of issue
   - **Purpose**: Why certificate is needed
   - **Valid Until**: Expiry date (if applicable)
   - **Issued By**: Authority name
   - **Remarks**: Additional notes
   - **Template**: Select certificate template

4. Click **"Generate Certificate"**

**📝 Example:**
```
Student: John Smith (BCS2024001)
Certificate Type: Bonafide Certificate
Certificate Number: CERT/2024/001
Issue Date: September 15, 2024
Purpose: Bank loan application
Valid Until: December 31, 2024
Issued By: Principal, Springfield University
Remarks: Student is currently enrolled in BCS Year 1
```

---

## ✅ Student Module Completion Checklist

Before considering the Student module complete, ensure:

**Basic Student Information:**
- [ ] ✓ Students are created with all personal details
- [ ] ✓ Academic details (Program, Class, Section) are assigned
- [ ] ✓ Admission numbers are generated

**Additional Information:**
- [ ] ✓ Guardian information is added
- [ ] ✓ Important documents are uploaded
- [ ] ✓ Addresses (current and permanent) are recorded
- [ ] ✓ Medical records are maintained

**Optional (As Needed):**
- [ ] ✓ Students are organized into groups
- [ ] ✓ Promotions are processed at year-end
- [ ] ✓ Certificates are issued when requested

---

## 📊 Student Module Dependencies Summary

| Item | Dependencies | Create After |
|------|-------------|--------------|
| **Student** | Program + Class + Section + Academic Year | Academic + Core modules |
| **Guardians** | Student | Student |
| **Student Documents** | Student | Student |
| **Student Addresses** | Student | Student |
| **Medical Records** | Student | Student |
| **Student Groups** | Students (multiple) | Students |
| **Promotions** | Student + New Class | Student + Next year's class |
| **Certificates** | Student | Student |

---

## 💡 Student Module Best Practices

### When Creating Students:
1. ✅ Always fill in complete personal information
2. ✅ Ensure admission number is unique
3. ✅ Assign correct Program, Class, and Section
4. ✅ Upload student photo for easy identification

### Managing Student Data:
1. ✅ Add guardian information immediately after student creation
2. ✅ Upload important documents during admission
3. ✅ Keep medical records updated for emergencies
4. ✅ Maintain both current and permanent addresses

### Year-End Activities:
1. ✅ Review student performance before promotion
2. ✅ Create next year's classes before promoting
3. ✅ Promote students in batches by section
4. ✅ Generate completion certificates for graduating students

---

## 📝 Next Steps

Once you've completed the Student module setup, you're ready to move on to the next module. The documentation will be updated with additional modules as we progress.

---

## 📋 Attendance Management

The **Attendance** module helps you track daily attendance for students and staff members.

### 📊 Attendance Module Flow

```
┌────────────────────────────────────────────────────────────────┐
│                   ATTENDANCE MODULE SETUP                       │
└────────────────────────────────────────────────────────────────┘

STUDENT ATTENDANCE
┌──────────────────────────────────────────────────────────┐
│  Prerequisites (from Academic Module)                    │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│  │  Class   │───▶│ Section  │───▶│ Subject  │          │
│  │          │    │          │    │          │          │
│  └──────────┘    └──────────┘    └──────────┘          │
└──────────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌────────────────────┐
              │      STUDENT       │
              │    ATTENDANCE      │
              │                    │
              │ Mark Present/      │
              │ Absent/Late        │
              └────────────────────┘

STAFF ATTENDANCE
┌──────────────────────────────────────────────────────────┐
│  Prerequisites (from System Module)                      │
│  ┌──────────┐                                            │
│  │ Teacher/ │                                            │
│  │  Staff   │                                            │
│  └──────────┘                                            │
└──────────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌────────────────────┐
              │       STAFF        │
              │    ATTENDANCE      │
              │                    │
              │ Mark Present/      │
              │ Absent/Leave       │
              └────────────────────┘

Legend:
────▶  Dependency flow
```

---

### 📋 Attendance Module Components

1. **Student Attendance** (Needs: Class + Section + Subject)
2. **Staff Attendance** (Needs: Teacher/Staff)

---

### Step 1️⃣: Mark Student Attendance

**What is it?** Daily attendance tracking for students in a class.

**When to do it?** Daily, for each class period or once per day.

**⚠️ Dependencies:** 
- ✅ Class must be created (from Academic module)
- ✅ Section must be created (from Academic module)
- ✅ Subject must be created (from Academic module)
- ✅ Students must be enrolled in the class/section

**How to do it:**

1. Navigate to **Attendance → Student Attendance**
2. Click **"Mark Attendance"** or **"Take Attendance"**
3. Select the filters:
   - **Date**: Select attendance date (default: today)
   - **Class**: Select class (e.g., BCS Year 1)
   - **Section**: Select section (e.g., Section A)
   - **Subject**: Select subject (e.g., Data Structures)
   - **Period**: Select time period (optional)

4. The system will display all students in that section
5. For each student, mark:
   - **Present** ✓ (Student is in class)
   - **Absent** ✗ (Student is not in class)
   - **Late** ⏰ (Student arrived late)
   - **Excused** 📝 (Absent with permission)

6. Add **Remarks** if needed (optional)
7. Click **"Submit Attendance"**

**✅ Success Indicator:** Attendance is saved and shows in attendance reports.

**📝 Example:**
```
Date: January 20, 2026
Class: BCS Year 1
Section: Section A
Subject: Data Structures
Period: Period 1 (9:00 AM - 10:00 AM)

Students:
1. John Smith (BCS2024001)     - ✓ Present
2. Jane Doe (BCS2024002)       - ✓ Present
3. Mike Johnson (BCS2024003)   - ✗ Absent
4. Sarah Williams (BCS2024004) - ⏰ Late
5. Tom Brown (BCS2024005)      - 📝 Excused (Medical appointment)

Remarks: Mike Johnson absent without notice
```

---

### 💡 Student Attendance Tips

**Daily Workflow:**
1. ✅ Take attendance at the start of each class
2. ✅ Mark late arrivals when students come in
3. ✅ Update excused absences when you receive notes
4. ✅ Add remarks for unusual situations

**Best Practices:**
1. ✅ Be consistent with timing (same time each day)
2. ✅ Double-check before submitting (hard to edit later)
3. ✅ Use remarks to note patterns (frequently late, etc.)
4. ✅ Review attendance reports weekly

**Common Scenarios:**
- **Student arrives after attendance**: Mark as "Late"
- **Student has doctor's note**: Mark as "Excused"
- **Student leaves early**: Mark as "Present" with remark
- **Forgot to take attendance**: Can mark for previous dates

---

### Step 2️⃣: Mark Staff Attendance

**What is it?** Daily attendance tracking for teachers and staff members.

**When to do it?** Daily, typically in the morning.

**⚠️ Dependencies:** 
- ✅ Teacher/Staff users must be created (from System module)
- ✅ Users must have teacher or staff role assigned

**How to do it:**

1. Navigate to **Attendance → Staff Attendance**
2. Click **"Mark Attendance"**
3. Select the filters:
   - **Date**: Select attendance date (default: today)
   - **Department**: Select department (optional filter)
   - **Staff Type**: Teacher/Administrative Staff/Support Staff

4. The system will display all staff members
5. For each staff member, mark:
   - **Present** ✓ (Staff is at work)
   - **Absent** ✗ (Staff is not at work)
   - **Half Day** ½ (Staff worked half day)
   - **On Leave** 📅 (Approved leave)
   - **Work From Home** 🏠 (Remote work)

6. Add **Remarks** if needed (optional)
7. Click **"Submit Attendance"**

**✅ Success Indicator:** Staff attendance is saved and shows in reports.

**📝 Example:**
```
Date: January 20, 2026
Department: Computer Science
Staff Type: Teacher

Staff Members:
1. John Doe (Teacher)          - ✓ Present
2. Sarah Johnson (Teacher)     - ✓ Present
3. Mike Wilson (Teacher)       - 📅 On Leave (Sick Leave)
4. Emily Davis (Teacher)       - 🏠 Work From Home
5. Robert Brown (Teacher)      - ½ Half Day (Personal work)

Remarks: Mike Wilson on approved sick leave
```

---

### 💡 Staff Attendance Tips

**Daily Workflow:**
1. ✅ Mark attendance in the morning (9:00 AM - 10:00 AM)
2. ✅ Update for late arrivals or early departures
3. ✅ Cross-check with leave applications
4. ✅ Note work-from-home arrangements

**Best Practices:**
1. ✅ Coordinate with HR for leave approvals
2. ✅ Mark approved leaves accurately
3. ✅ Use remarks for special circumstances
4. ✅ Generate monthly reports for payroll

**Common Scenarios:**
- **Staff on approved leave**: Mark as "On Leave"
- **Staff working remotely**: Mark as "Work From Home"
- **Staff arrives late**: Mark as "Present" with remark
- **Staff leaves early**: Mark as "Half Day" or add remark
- **Staff on official duty**: Mark as "Present" with remark

---

## 📊 Attendance Reports

Both student and staff attendance can generate various reports:

### Student Attendance Reports:
- **Daily Attendance**: Today's attendance for all classes
- **Class-wise Attendance**: Attendance for specific class/section
- **Student-wise Attendance**: Individual student's attendance history
- **Monthly Summary**: Month-wise attendance percentage
- **Defaulter List**: Students with low attendance
- **Subject-wise Attendance**: Attendance for specific subjects

### Staff Attendance Reports:
- **Daily Attendance**: Today's staff attendance
- **Department-wise**: Attendance by department
- **Individual Staff**: Specific staff member's history
- **Monthly Summary**: Month-wise attendance and leaves
- **Leave Summary**: Leave taken by staff members
- **Attendance Percentage**: Overall attendance statistics

---

## ✅ Attendance Module Completion Checklist

Before considering the Attendance module operational, ensure:

**Student Attendance:**
- [ ] ✓ Classes and sections are created
- [ ] ✓ Subjects are assigned to sections
- [ ] ✓ Students are enrolled
- [ ] ✓ Teachers can access attendance marking
- [ ] ✓ Daily attendance is being marked regularly

**Staff Attendance:**
- [ ] ✓ Teachers and staff are created in system
- [ ] ✓ Departments are set up
- [ ] ✓ Attendance marking process is established
- [ ] ✓ Leave integration is working
- [ ] ✓ Reports are accessible to HR/Admin

---

## 📊 Attendance Module Dependencies Summary

| Item | Dependencies | Create After |
|------|-------------|--------------|
| **Student Attendance** | Class + Section + Subject | Academic module + Students |
| **Staff Attendance** | Teacher/Staff users | System module |

---

## 💡 Attendance Best Practices

### For Teachers (Student Attendance):
1. ✅ **Be punctual**: Take attendance at the same time daily
2. ✅ **Be accurate**: Double-check before submitting
3. ✅ **Be detailed**: Use remarks for special cases
4. ✅ **Be consistent**: Follow school attendance policy

### For Administrators (Staff Attendance):
1. ✅ **Morning routine**: Mark attendance early in the day
2. ✅ **Verify leaves**: Cross-check with approved leave applications
3. ✅ **Track patterns**: Monitor frequent absences
4. ✅ **Generate reports**: Monthly reports for payroll and HR

### For Students/Parents:
1. ✅ **Check regularly**: Review attendance in student portal
2. ✅ **Report errors**: Notify teacher if attendance is incorrect
3. ✅ **Maintain records**: Keep medical certificates for excused absences
4. ✅ **Monitor percentage**: Ensure meeting minimum attendance requirement

---

## 🚨 Common Attendance Issues & Solutions

### Issue: "Cannot mark attendance for past dates"
**Solution:** Check system settings - admin may need to enable backdated attendance.

### Issue: "Student not showing in attendance list"
**Solution:** Verify student is enrolled in the selected class and section.

### Issue: "Already marked attendance for this date"
**Solution:** Edit existing attendance instead of creating new entry.

### Issue: "Staff member not appearing"
**Solution:** Ensure user has correct role (teacher/staff) assigned.

---

## 📝 Next Steps

Once you've completed the Attendance module setup, you're ready to move on to the next module. The documentation will be updated with additional modules as we progress.

---

*Last Updated: January 2026*
*Version: 1.3 - Core + Academic + Student + Attendance Modules*

