
import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Resolve the HTTP status from any error shape:
 *  - AppError / fetchApi: error.status
 *  - Raw AxiosError:      error.response?.status
 */
function resolveStatus(error: any): number {
    return (
        error?.status ??
        error?.response?.status ??
        0
    );
}

/**
 * Extract a user-friendly message from various error shapes.
 *
 * Handles:
 *  - AppError  { message, status, errors }          (from normalized apiClient / fetchApi)
 *  - AxiosError { response: { data: { detail, non_field_errors, ... } } }
 *  - DRF nested detail: { detail: { non_field_errors: [...] } }
 *  - Plain { message } or Error instances
 */
function resolveMessage(error: any): string {
    // Already-normalized message (AppError / fetchApi)
    if (typeof error?.message === 'string' && error.message !== 'Request failed') {
        return error.message;
    }

    // Raw Axios — dig into response data
    const data = error?.response?.data ?? error?.errors;
    if (data && typeof data === 'object') {
        // { detail: "string" }
        if (typeof data.detail === 'string') return data.detail;

        // { detail: { non_field_errors: [...] } }
        if (data.detail && typeof data.detail === 'object') {
            if (Array.isArray(data.detail.non_field_errors) && data.detail.non_field_errors.length) {
                return data.detail.non_field_errors.join('. ');
            }
            const parts: string[] = [];
            for (const [k, v] of Object.entries(data.detail)) {
                if (Array.isArray(v)) parts.push(`${k}: ${(v as string[]).join(', ')}`);
                else if (typeof v === 'string') parts.push(`${k}: ${v}`);
            }
            if (parts.length) return parts.join(' | ');
        }

        // { non_field_errors: [...] }
        if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
            return data.non_field_errors.join('. ');
        }

        // { error: "string" }
        if (typeof data.error === 'string') return data.error;

        // { message: "string" }
        if (typeof data.message === 'string') return data.message;

        // Generic field errors { field1: [...], field2: [...] }
        const fieldParts: string[] = [];
        for (const [k, v] of Object.entries(data)) {
            if (Array.isArray(v)) fieldParts.push(`${k}: ${(v as string[]).join(', ')}`);
            else if (typeof v === 'string') fieldParts.push(`${k}: ${v}`);
        }
        if (fieldParts.length) return fieldParts.join(' | ');
    }

    // Fallback
    if (typeof error?.message === 'string') return error.message;
    if (typeof error === 'string') return error;

    return 'An unexpected error occurred';
}

/**
 * Build a description string from field-level validation errors
 * for display beneath the toast title.
 */
function resolveDescription(error: any): string | undefined {
    const data = error?.errors ?? error?.response?.data;
    if (!data || typeof data !== 'object') return undefined;

    // Collect field-level errors (skip meta keys)
    const skipKeys = new Set(['detail', 'error', 'message', 'status', 'non_field_errors']);
    const parts: string[] = [];

    for (const [key, val] of Object.entries(data)) {
        if (skipKeys.has(key)) continue;
        if (Array.isArray(val)) {
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            parts.push(`${label}: ${(val as string[]).join(', ')}`);
        }
    }

    return parts.length > 0 ? parts.join('\n') : undefined;
}

/**
 * Global Error Handler Component
 *
 * Listens for unhandled promise rejections (API errors that aren't caught
 * by component-level try/catch) and displays user-friendly toast notifications.
 *
 * Supports both:
 *  - Normalized AppError { message, status, errors }  (from apiClient + fetchApi)
 *  - Raw AxiosError { response: { status, data } }    (safety net)
 */
export function GlobalErrorHandler() {
    useEffect(() => {
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const error = event.reason;

            // Ignore non-error rejections (e.g. aborted requests)
            if (!error) return;

            console.error('GlobalErrorHandler: Uncaught Promise Rejection:', error);

            const status = resolveStatus(error);
            const message = resolveMessage(error);
            const description = resolveDescription(error);

            // Prevent the default browser "Unhandled promise rejection" console error
            event.preventDefault();

            // ── 400 Bad Request ──────────────────────────────────────────
            if (status === 400) {
                toast.error('Validation Error', {
                    description: message,
                    duration: 6000,
                });
                return;
            }

            // ── 401 Unauthorized ─────────────────────────────────────────
            if (status === 401) {
                // Auth interceptor already handles redirect — suppress duplicate toasts
                return;
            }

            // ── 403 Forbidden ────────────────────────────────────────────
            if (status === 403) {
                toast.error('Access Denied', {
                    description: message || 'You do not have permission to perform this action.',
                    duration: 5000,
                });
                return;
            }

            // ── 404 Not Found ────────────────────────────────────────────
            if (status === 404) {
                toast.error('Not Found', {
                    description: message || 'The requested resource could not be found.',
                    duration: 5000,
                });
                return;
            }

            // ── 408 / 429 — Timeout & Rate Limiting ──────────────────────
            if (status === 408) {
                toast.error('Request Timeout', {
                    description: 'The server took too long to respond. Please try again.',
                    duration: 5000,
                });
                return;
            }

            if (status === 429) {
                toast.error('Too Many Requests', {
                    description: 'You are sending requests too quickly. Please wait a moment.',
                    duration: 5000,
                });
                return;
            }

            // ── 5xx Server Errors ────────────────────────────────────────
            if (status >= 500) {
                toast.error('Server Error', {
                    description: 'Something went wrong on the server. Please try again later.',
                    duration: 5000,
                });
                return;
            }

            // ── Network errors (status === 0) ───────────────────────────
            if (status === 0 && error && typeof error === 'object') {
                toast.error('Connection Error', {
                    description: 'Unable to reach the server. Please check your internet connection.',
                    duration: 5000,
                });
                return;
            }

            // ── Other known-status errors ────────────────────────────────
            if (status > 0) {
                toast.error(`Error (${status})`, {
                    description: description || message,
                    duration: 5000,
                });
                return;
            }

            // ── Standard Error instances ─────────────────────────────────
            if (error instanceof Error) {
                toast.error('Application Error', {
                    description: error.message,
                    duration: 5000,
                });
                return;
            }

            // ── Fallback ─────────────────────────────────────────────────
            if (typeof error === 'string') {
                toast.error('Error', { description: error, duration: 5000 });
            }
        };

        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    }, []);

    // Catch synchronous window errors — ErrorBoundary handles render crashes,
    // but log here for visibility.
    useEffect(() => {
        const handleWindowError = (event: ErrorEvent) => {
            if (event.error) {
                console.error('GlobalErrorHandler: Uncaught Window Error:', event.error);
            } else {
                console.error(
                    'GlobalErrorHandler: Uncaught Window Error (no error object):',
                    event.message,
                    'at',
                    event.filename,
                    ':',
                    event.lineno,
                    ':',
                    event.colno
                );
            }
        };
        window.addEventListener('error', handleWindowError);
        return () => window.removeEventListener('error', handleWindowError);
    }, []);

    return null;
}
