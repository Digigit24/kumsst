# Print Template Module: Architecture & Backend Handoff

**Rationale:**
The Print Module allows the Institution to design, manage, and generate professional documents (Certificates, Transcripts, ID Cards, etc.) with a consistent "Letterhead" configuration.

## 1. High-Level Architecture (The 3 Pillars)

The module is built on three distinct resources that work together:

1.  **Print Configuration (The "Letterhead")**:
    *   **Scope:** Global per College/Institution.
    *   **Purpose:** Defines the persistent visual identity (Logo, Header text/layout, Footer text/layout, Watermark, Colors, Default Fonts, Authorized Signatories).
    *   **Key Behavior:** This is where the new **2D Drag-to-Position** logic lives.

2.  **Print Templates (The "Body Content")**:
    *   **Scope:** Library of designs (e.g., "Degree Certificate", "Grade Sheet").
    *   **Purpose:** Defines the HTML structure (the "meat") of the document, using placeholders like `{{student_name}}` or `{{course}}`.
    *   **Relation:** A Template sits *inside* the Configuration's header/footer frame. (Though templates can optionally override header/footer images if needed).

3.  **Print Documents (The "Generated Instance")**:
    *   **Scope:** An actual generated PDF for a specific student.
    *   **Purpose:** The result of merging: `Configuration + Template + Student Data`.
    *   **Flow:** User selects Student(s) + Template -> Backend generates PDF.

---

## 2. API Endpoints Overview

The frontend interacts with the following endpoints (as defined in `api.config.ts`):

| Resource | Method | Endpoint | Purpose |
| :--- | :--- | :--- | :--- |
| **Config** | `GET` | `/api/v1/reports/print/config/` | Get global settings |
| **Config** | `PATCH` | `/api/v1/reports/print/config/{id}/` | Update settings (including draggable positions) |
| **Signatories**| `POST` | `/api/v1/reports/print/config/add_signatory/` | Add a new signatory |
| **Templates** | `GET` | `/api/v1/reports/print/templates/` | List available templates |
| **Templates** | `POST` | `/api/v1/reports/print/templates/` | Create a new template body |
| **Documents** | `POST` | `/api/v1/reports/print/documents/` | **Generate PDF** (Triggers production) |
| **Bulk Jobs** | `POST` | `/api/v1/reports/print/bulk-jobs/` | Mass PDF generation |

---

## 3. Data Models & New Requirements

### A. Print Configuration Model (Crucial Updates)

The `PrintConfiguration` model must store the standard branding fields PLUS the new **2D Positioning Fields**.

**New Fields Required (Backend Implementation Checklist):**

| Field Name | Type | Properties | Description |
| :--- | :--- | :--- | :--- |
| `logo_x_position` | `Float` | `null=True, blank=True` | X position % (0-100) |
| `logo_y_position` | `Float` | `null=True, blank=True` | Y position % (0-100) |
| `header_text_x_position`| `Float` | `null=True, blank=True` | X position % (0-100) |
| `header_text_y_position`| `Float` | `null=True, blank=True` | Y position % (0-100) |
| `footer_text_x_position`| `Float` | `null=True, blank=True` | X position % (0-100) |
| `footer_text_y_position`| `Float` | `null=True, blank=True` | Y position % (0-100) |
| `logo_position` | `String` | -- | **DEPRECATED/FALLBACK**. Used if X/Y are null. |

**Standard Fields (Existing):**
*   `logo` (ImageField)
*   `header_content` (TextField/HTML)
*   `header_image` (ImageField)
*   `header_background_color` (Char/Hex)
*   `header_text_color` (Char/Hex)
*   `header_layout` ('side-by-side' | 'stacked')
*   `footer_content` (TextField/HTML)
*   `footer_image` (ImageField)
*   `watermark_image` (ImageField)
*   `watermark_opacity` (Float)
*   `paper_size` ('A4', 'Letter', etc.)
*   `authorized_signatures` (ManyToMany/ForeignKey)

### B. Sample Configuration Payload (JSON)

```json
{
  "header_content": "<h3>KUMS College of Engineering</h3><p>Excellence in Education</p>",
  "header_layout": "side-by-side",
  "logo_x_position": 15.5,
  "logo_y_position": 20.0,
  "header_text_x_position": 85.0,
  "header_text_y_position": 50.0,
  "footer_content": "Contact: info@kums.edu",
  "footer_text_x_position": 50.0,
  "footer_text_y_position": 90.0
}
```

---

## 4. PDF Generation Logic (The Critical Part)

When the backend generates the PDF (via `POST /documents/`), it must respect the **Drag-to-Position** coordinates.

**Logic Rules:**

1.  **Coordinate System**: The values are **percentages** (0-100%) relative to the Header container (for header elements) or Footer container (for footer elements).
2.  **Anchor Point**: The position represents the **center** of the element (`transform: translate(-50%, -50%)`).
3.  **Precedence**: If `*_x_position` is NOT NULL, use Absolute Positioning. If NULL, fallback to standard Flexbox layout (`header_layout`).

### Reference HTML/CSS for PDF Generator (Jinja2/WeasyPrint compatible)

Use this CSS logic in your PDF generator template to match the Frontend Preview exactly:

```html
<style>
    /* ... Base Page Styles ... */
    @page { size: {{ paper_size }}; margin: 0; }
    
    .header {
        position: relative;
        height: {{ header_height }}px;
        /* ... background styles ... */
    }

    /* LOGO POSITONING LOGIC */
    .logo {
        {% if logo_x_position is not none %}
            /* CUSTOM DRAG POSITION */
            position: absolute;
            left: {{ logo_x_position }}%;
            top: {{ logo_y_position }}%;
            transform: translate(-50%, -50%);
        {% else %}
            /* FALLBACK LEGACY LAYOUT */
            display: flex;
            justify-content: {{ 'flex-start' if logo_position == 'left' else 'center' }};
        {% endif %}
    }

    /* HEADER TEXT POSITIONING LOGIC */
    .header-content {
        {% if header_text_x_position is not none %}
            /* CUSTOM DRAG POSITION */
            position: absolute;
            left: {{ header_text_x_position }}%;
            top: {{ header_text_y_position }}%;
            transform: translate(-50%, -50%);
            width: auto; /* Allow content to size itself */
            white-space: nowrap; /* Prevent wrapping if desired, or remove to allow wrapping */
        {% else %}
            /* FALLBACK LEGACY LAYOUT */
            flex: 1;
            text-align: {{ header_text_align }};
        {% endif %}
    }

    /* FOOTER TEXT POSITIONING LOGIC */
    .footer { position: relative; height: {{ footer_height }}px; }
    
    .footer-text {
        {% if footer_text_x_position is not none %}
            /* CUSTOM DRAG POSITION */
            position: absolute;
            left: {{ footer_text_x_position }}%;
            top: {{ footer_text_y_position }}%;
            transform: translate(-50%, -50%);
        {% else %}
            /* FALLBACK */
            text-align: center;
        {% endif %}
    }
</style>
```

---

## 5. Workflow Summary (User Journey)

1.  **Setup (One-Time)**:
    *   Admin goes to `/print/configuration`.
    *   Uploads Logo.
    *   **Drags Logo** to top-left (e.g., X:10%, Y:20%).
    *   **Drags Header Text** to center-right (e.g., X:80%, Y:50%).
    *   Saves -> `PATCH /api/v1/reports/print/config/`.

2.  **Template Creation**:
    *   Admin goes to `/print/templates`.
    *   Creates "Merit Certificate".
    *   Enters HTML body: `<h1>Certificate of Merit</h1><p>Awarded to {{student_name}}...</p>`.
    *   Saves -> `POST /api/v1/reports/print/templates/`.

3.  **Generation**:
    *   Admin goes to `/print/documents`.
    *   Selects "John Doe" + "Merit Certificate".
    *   Clicks "Generate".
    *   **Backend Process**:
        1.  Fetch `PrintConfiguration` (Get Logo X/Y coordinates).
        2.  Fetch `PrintTemplate` (Get Body HTML).
        3.  Fetch Student Data (John Doe).
        4.  **MERGE**: Apply Config Header/Footer around Template Body.
        5.  **RENDER**: Generate PDF using the CSS logic above.
    *   Response: Returns PDF URL or File.

---

**Note to Backend Developer:**
The success of the "WYSIWYG" (What You See Is What You Get) editor depends entirely on the PDF generator respecting the `position: absolute` and percentage-based coordinates sent in the Configuration payload. Please ensure your PDF engine (WeasyPrint, wkhtmltopdf, or similar) supports these CSS properties.
