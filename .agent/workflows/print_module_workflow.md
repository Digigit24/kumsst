---
description: Comprehensive workflow for the Print Module, covering Template creation, Document generation, and Approval.
---

# Print Module Workflow

This document outlines the standard operating procedure for the Print Module. The system assumes a **Template-First** approach: you define reusable blueprints (Templates) and then generate specific instances (Documents) from them.

## 1. Template Creation (Blueprint Phase)
*User Role: System Admin / College Admin*

The process begins with defining a standard layout.

1.  **Navigate**: Go to `Print Module` > `Templates`.
2.  **Action**: Click **"Create Template"**.
3.  **Configuration**:
    *   **Meta & Layout**: Define Paper Size (A4/Letter), Orientation, and Margins.
    *   **Branding**: Set global defaults for this template:
        *   *Header*: Logo, Company Name, Background Color.
        *   *Footer*: Address, Contact Info, Page Numbers.
        *   *Watermark*: Default watermark (e.g., "CONFIDENTIAL") if applicable.
    *   **Content**: Set the base HTML structure (e.g., the standard text of a Certificate or ID Card).
4.  **Save**: This creates a **Print Template**.
    *   *Status*: `Active` (Ready for use).

## 2. Document Generation (Instance Phase)
*User Role: Staff / Admin*

Once a template exists, you create specific documents from it (e.g., "Merit Certificate for John Doe").

1.  **Navigate**: Go to `Print Module` > `Templates` (or `Documents`).
2.  **Action**:
    *   From `Templates`: Click the template name or "Edit" icon (effectively "Use Template").
    *   *Note*: Currently, the "Edit" action on a template initializes a **New Document** based on that template's settings.s
3.  **Customization**:
    *   The `Print Configuration` page loads with the Template's defaults pre-filled.
    *   **Overrides**: You can change specific details for *this specific document* without affecting the original template:
        *   Modify the Body Content (e.g., insert student names).
        *   Adjust Branding (e.g., change watermark to "ORIGINAL" for this print).
4.  **Save**: Clicking "Save Document" creates a **Print Document**.
    *   *Status*: `Pending Approval` or `Draft` (depending on configuration).
    *   *Reference*: A unique reference number is assigned.

## 3. Approval Process
*User Role: Approver (Principal / HOD)*

Documents often require validation before printing to ensure accuracy and prevent misuse.

1.  **Navigate**: Go to `Print Module` > `Approvals`.
2.  **Review**: Select the `Pending Approval` document.
3.  **Validate**: Check content, layout, and purpose.
4.  **Decision**:
    *   **Approve**: Status becomes `Approved`. document is locked for printing.
    *   **Reject**: Status becomes `Rejected`. Creator must fix and resubmit.

## 4. Output & Distribution
*User Role: Staff / Admin*

Only `Approved` documents can be finalized.

1.  **Navigate**: Go to `Print Module` > `Documents`.
2.  **Select**: Click on an `Approved` document.
3.  **Action**:
    *   **Preview**: View the exact render on screen.
    *   **Download PDF**: Generate a high-fidelity PDF file.
    *   **Print**: Send directly to the browser's print dialog.
4.  **Mark as Printed**: After physical printing, click "Mark as Printed".
    *   *Tracking*: This increments the `Print Count` and updates status to `Printed`.
    *   *Security*: Helps prevent unauthorized duplicate prints.

## Summary Checklist

| Step | Action | Output | Status Change |
| :--- | :--- | :--- | :--- |
| **1** | Create Template | `PrintTemplate` | `Active` |
| **2** | Use Template | `PrintDocument` | `Pending Approval` |
| **3** | Approve | `PrintDocument` | `Approved` |
| **4** | Print/Download | PDF / Physical Copy | `Printed` |
