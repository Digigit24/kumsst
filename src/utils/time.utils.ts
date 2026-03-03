export const convertTo24Hour = (time12: string): string => {
    if (!time12) return '';
    if (!time12.toUpperCase().includes('AM') && !time12.toUpperCase().includes('PM')) {
        // Assume already 24h or just HH:MM
        // Ensure it's HH:MM format if it's HH:MM:SS
        const parts = time12.split(':');
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }

    const [time, modifier] = time12.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') {
        hours = '00';
    }

    if (modifier.toUpperCase() === 'PM') {
        hours = String(parseInt(hours, 10) + 12);
    }
    
    // Handle 12 PM -> 12:00, 12 AM -> 00:00
    // Wait, 12 PM is 12:00. 1 PM is 13:00.
    // My logic above: if PM, +12. 
    // 12 PM -> 12+12 = 24? No. 12 PM is 12:00.
    // 1 PM -> 13:00.
    
    // Correct logic:
    // If AM: 12 AM -> 00. Others -> keep.
    // If PM: 12 PM -> 12. Others -> +12.
    
    let h = parseInt(time.split(':')[0], 10);
    const m = time.split(':')[1];
    
    if (modifier.toUpperCase() === 'PM' && h < 12) {
        h += 12;
    }
    if (modifier.toUpperCase() === 'AM' && h === 12) {
        h = 0;
    }
    
    return `${String(h).padStart(2, '0')}:${m}`;
};
