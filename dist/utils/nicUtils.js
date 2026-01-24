"use strict";
/**
 * Sri Lankan NIC Parser Utility
 * Extracts Date of Birth and Gender from NIC numbers.
 * Supports both 9-digit (old) and 12-digit (new) formats.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNIC = parseNIC;
function parseNIC(nic) {
    if (!nic)
        return null;
    let year;
    let dayOfYear;
    let gender;
    // New format: 12 digits (e.g., 199012345678)
    if (nic.length === 12 && /^\d+$/.test(nic)) {
        year = parseInt(nic.substring(0, 4));
        dayOfYear = parseInt(nic.substring(4, 7));
    }
    // Old format: 9 digits + character (e.g., 901234567V)
    else if (nic.length === 10 && /^\d{9}[vVxX]$/.test(nic)) {
        year = 1900 + parseInt(nic.substring(0, 2));
        dayOfYear = parseInt(nic.substring(2, 5));
    }
    else {
        return null; // Invalid format
    }
    // Gender detection
    if (dayOfYear > 500) {
        gender = 'Female';
        dayOfYear -= 500;
    }
    else {
        gender = 'Male';
    }
    // Day of year validation (1-366)
    if (dayOfYear < 1 || dayOfYear > 366)
        return null;
    // Calculate Date of Birth using UTC to avoid timezone shifts
    const dobDate = new Date(Date.UTC(year, 0, dayOfYear));
    const dob = dobDate.toISOString().split('T')[0]; // Get YYYY-MM-DD
    return { dob, gender };
}
