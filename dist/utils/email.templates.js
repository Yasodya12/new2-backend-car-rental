"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tripCompletedTemplate = exports.tripCancelledTemplate = exports.tripAcceptedTemplate = exports.otpEmailTemplate = exports.loginNotificationTemplate = exports.adminNotificationTemplate = exports.passwordResetTemplate = exports.tripAssignmentTemplate = exports.bookingConfirmationTemplate = exports.baseTemplate = void 0;
const baseTemplate = (content, title = "Transport Service") => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#667eea',
                        secondary: '#764ba2',
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-100 font-sans">
    <div class="max-w-2xl mx-auto my-8">
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <div class="bg-gradient-to-r from-primary to-secondary text-white p-8 text-center">
                <h1 class="text-3xl font-light m-0">🚗 Transport Service</h1>
            </div>
            
            <div class="p-8">
                ${content}
            </div>
            
            <div class="bg-primary text-white p-6 text-center text-sm">
                <p class="font-semibold mb-2">Transport Service</p>
                <p class="mb-1">📧 support@transportservice.com | 📞 +94 (71) 250-2124</p>
                <p class="m-0">© 2025 Transport Service. All rights reserved</p>
            </div>
        </div>
    </div>
</body>
</html>
`;
exports.baseTemplate = baseTemplate;
const bookingConfirmationTemplate = (customerName, tripId) => {
    const content = `
        <h2 class="text-2xl text-primary mb-6 mt-0">🎉 Booking Confirmed!</h2>
        <p class="mb-4">Hi <span class="font-semibold">${customerName}</span>,</p>
        <p class="mb-6">Great news! Your booking has been successfully confirmed.</p>
        
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p class="mb-2"><span class="font-semibold">Trip ID:</span> <span class="font-mono text-primary">${tripId}</span></p>
            <p class="m-0"><span class="font-semibold">Status:</span> <span class="text-green-600 font-semibold">Confirmed ✅</span></p>
        </div>
        
        <p class="mb-4">We're excited to serve you! Our team will contact you soon with detailed trip information including:</p>
        <ul class="list-disc pl-6 mb-6 space-y-1">
            <li>Driver contact details</li>
            <li>Vehicle information</li>
            <li>Pickup time and location</li>
            <li>Any special instructions</li>
        </ul>
        
        <p class="mb-6">Thank you for choosing our transport service. We're committed to providing you with a safe and comfortable journey.</p>
        
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="m-0"><span class="font-semibold text-blue-800">Need help?</span> <span class="text-blue-700">Feel free to contact our support team at any time.</span></p>
        </div>
    `;
    return (0, exports.baseTemplate)(content, "Booking Confirmed");
};
exports.bookingConfirmationTemplate = bookingConfirmationTemplate;
const tripAssignmentTemplate = (driverName, tripId, startLocation, endLocation, date) => {
    const content = `
        <h2 class="text-2xl text-primary mb-6 mt-0">🚚 New Trip Assignment</h2>
        <p class="mb-4">Hello <span class="font-semibold">${driverName}</span>,</p>
        <p class="mb-6">You have been assigned a new trip. Please review the details below:</p>
        
        <div class="bg-gray-50 border-l-4 border-primary rounded-lg p-6 mb-6">
            <h3 class="text-lg font-semibold mb-4 text-gray-800">Trip Details</h3>
            <div class="space-y-3">
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <span class="font-semibold text-gray-700">Trip ID:</span>
                    <span class="font-mono text-primary">${tripId}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <span class="font-semibold text-gray-700">From:</span>
                    <span class="text-gray-800">📍 ${startLocation}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <span class="font-semibold text-gray-700">To:</span>
                    <span class="text-gray-800">📍 ${endLocation}</span>
                </div>
                <div class="flex justify-between items-center py-2">
                    <span class="font-semibold text-gray-700">Date:</span>
                    <span class="text-gray-800">📅 ${date}</span>
                </div>
            </div>
        </div>
        
        <p class="mb-4">Please log into your driver dashboard to view complete trip details including:</p>
        <ul class="list-disc pl-6 mb-6 space-y-1">
            <li>Customer contact information</li>
            <li>Pickup time</li>
            <li>Special requirements</li>
            <li>Route suggestions</li>
        </ul>
        
        <div class="text-center mb-6">
            <a href="#" class="inline-block bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-full font-semibold text-decoration-none hover:opacity-90 transition-opacity">
                View Trip Details
            </a>
        </div>
        
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="m-0"><span class="font-semibold text-yellow-800">Important:</span> <span class="text-yellow-700">Please confirm your availability for this trip within 30 minutes.</span></p>
        </div>
    `;
    return (0, exports.baseTemplate)(content, "New Trip Assignment");
};
exports.tripAssignmentTemplate = tripAssignmentTemplate;
const passwordResetTemplate = (resetToken) => {
    const resetLink = `https://localhost:3000/reset-password?token=${resetToken}`;
    const content = `
        <h2 class="text-2xl text-primary mb-6 mt-0">🔐 Password Reset Request</h2>
        <p class="mb-6">We received a request to reset your password. If you made this request, click the button below to reset your password:</p>
        
        <div class="text-center mb-8">
            <a href="${resetLink}" class="inline-block bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-full font-semibold text-lg text-decoration-none hover:opacity-90 transition-opacity">
                Reset My Password
            </a>
        </div>
        
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <p class="font-semibold text-yellow-800 mb-3">Security Notice:</p>
            <ul class="list-disc pl-6 space-y-1 text-yellow-700">
                <li>This link will expire in 1 hour for security reasons</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password will remain unchanged</li>
            </ul>
        </div>
        
        <p class="mb-3">For security purposes, here's the reset link if the button doesn't work:</p>
        <div class="bg-gray-100 p-4 rounded-lg mb-6 break-all font-mono text-sm border">
            ${resetLink}
        </div>
        
        <p class="text-gray-600">If you're having trouble accessing your account, please contact our support team.</p>
    `;
    return (0, exports.baseTemplate)(content, "Password Reset");
};
exports.passwordResetTemplate = passwordResetTemplate;
const adminNotificationTemplate = (subject, message) => {
    const content = `
        <h2 class="text-2xl text-primary mb-6 mt-0">🔔 Admin Notification</h2>
        
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 class="text-xl font-semibold text-blue-800 mb-3">${subject}</h3>
            <p class="text-blue-700 m-0">${message}</p>
        </div>
        
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p class="m-0"><span class="font-semibold text-gray-700">Notification Time:</span> <span class="text-gray-600">${new Date().toLocaleString()}</span></p>
        </div>
        
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="m-0"><span class="font-semibold text-yellow-800">Action Required:</span> <span class="text-yellow-700">Please review this notification and take appropriate action if necessary.</span></p>
        </div>
    `;
    return (0, exports.baseTemplate)(content, `Admin Alert: ${subject}`);
};
exports.adminNotificationTemplate = adminNotificationTemplate;
const loginNotificationTemplate = (message, userAgent, ipAddress) => {
    const content = `
        <h2 class="text-2xl text-primary mb-6 mt-0">🔐 Login Notification</h2>
        <p class="mb-6">${message}</p>
        
        <div class="bg-gray-50 border-l-4 border-primary rounded-lg p-6 mb-6">
            <h3 class="text-lg font-semibold mb-4 text-gray-800">Login Details</h3>
            <div class="space-y-3">
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <span class="font-semibold text-gray-700">Time:</span>
                    <span class="text-gray-800">${new Date().toLocaleString()}</span>
                </div>
                ${userAgent ? `
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <span class="font-semibold text-gray-700">Device/Browser:</span>
                    <span class="text-gray-800 text-sm">${userAgent}</span>
                </div>
                ` : ''}
                ${ipAddress ? `
                <div class="flex justify-between items-center py-2">
                    <span class="font-semibold text-gray-700">IP Address:</span>
                    <span class="text-gray-800 font-mono">${ipAddress}</span>
                </div>
                ` : ''}
            </div>
        </div>
        
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p class="m-0"><span class="font-semibold text-red-800">Security Notice:</span> <span class="text-red-700">If this wasn't you, please change your password immediately and contact our support team.</span></p>
        </div>
        
        <div class="text-center">
            <a href="#" class="inline-block bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-full font-semibold text-decoration-none hover:opacity-90 transition-opacity">
                View Account Activity
            </a>
        </div>
    `;
    return (0, exports.baseTemplate)(content, "Login Notification");
};
exports.loginNotificationTemplate = loginNotificationTemplate;
const otpEmailTemplate = (otp, userName) => {
    const content = `
        <h2 class="text-2xl text-primary mb-6 mt-0">🔐 Password Reset OTP</h2>
        ${userName ? `<p class="mb-4">Hi <span class="font-semibold">${userName}</span>,</p>` : '<p class="mb-4">Hello,</p>'}
        <p class="mb-6">You have requested to reset your password. Please use the following OTP (One-Time Password) to verify your identity:</p>
        
        <div class="bg-gradient-to-r from-primary to-secondary text-white p-8 rounded-lg text-center mb-6">
            <p class="text-sm mb-2 text-white opacity-90">Your OTP Code</p>
            <p class="text-4xl font-bold tracking-widest m-0">${otp}</p>
        </div>
        
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <p class="font-semibold text-yellow-800 mb-3">⚠️ Important Security Information:</p>
            <ul class="list-disc pl-6 space-y-1 text-yellow-700">
                <li>This OTP is valid for <strong>10 minutes</strong> only</li>
                <li>Do not share this OTP with anyone</li>
                <li>If you didn't request this password reset, please ignore this email</li>
                <li>Your password will remain unchanged if you don't use this OTP</li>
            </ul>
        </div>
        
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="m-0"><span class="font-semibold text-blue-800">Need help?</span> <span class="text-blue-700">If you're having trouble resetting your password, please contact our support team.</span></p>
        </div>
    `;
    return (0, exports.baseTemplate)(content, "Password Reset OTP");
};
exports.otpEmailTemplate = otpEmailTemplate;
const tripAcceptedTemplate = (customerName, tripId, driverName, vehicleBrand, vehicleModel, vehicleNumber, startLocation, endLocation, date, price) => {
    const content = `
        <h2 class="text-2xl text-primary mb-6 mt-0">🎉 Trip Accepted!</h2>
        <p class="mb-4">Hi <span class="font-semibold">${customerName}</span>,</p>
        <p class="mb-6">Good news! A driver has accepted your trip request and will be with you shortly.</p>
        
        <div class="bg-gray-50 border-l-4 border-primary rounded-lg p-6 mb-6">
            <h3 class="text-lg font-semibold mb-4 text-gray-800">Trip Details</h3>
            <div class="space-y-3">
                 <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <span class="font-semibold text-gray-700">Trip ID:</span>
                    <span class="font-mono text-primary">${tripId}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <span class="font-semibold text-gray-700">From:</span>
                    <span class="text-gray-800">📍 ${startLocation}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <span class="font-semibold text-gray-700">To:</span>
                    <span class="text-gray-800">📍 ${endLocation}</span>
                </div>
                 <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <span class="font-semibold text-gray-700">Date:</span>
                    <span class="text-gray-800">📅 ${new Date(date).toLocaleString()}</span>
                </div>
                 <div class="flex justify-between items-center py-2">
                    <span class="font-semibold text-gray-700">Estimated Price:</span>
                    <span class="text-gray-800 font-bold">LKR ${price}</span>
                </div>
            </div>
        </div>

        <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-6 mb-6">
            <h3 class="text-lg font-semibold mb-4 text-green-800">Driver & Vehicle Details</h3>
            <div class="space-y-3">
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <span class="font-semibold text-gray-700">Driver:</span>
                    <span class="text-gray-800">${driverName}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <span class="font-semibold text-gray-700">Vehicle:</span>
                    <span class="text-gray-800">${vehicleBrand} ${vehicleModel}</span>
                </div>
                 <div class="flex justify-between items-center py-2">
                    <span class="font-semibold text-gray-700">Vehicle Number:</span>
                    <span class="text-gray-800 font-mono">${vehicleNumber}</span>
                </div>
            </div>
        </div>
        
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p class="m-0 text-blue-800">You can track your trip status in your dashboard.</p>
        </div>
    `;
    return (0, exports.baseTemplate)(content, "Trip Accepted");
};
exports.tripAcceptedTemplate = tripAcceptedTemplate;
const tripCancelledTemplate = (customerName, tripId, startLocation, endLocation, date) => {
    const content = `
        <h2 class="text-2xl text-red-600 mb-6 mt-0">❌ Trip Cancelled</h2>
        <p class="mb-4">Hi <span class="font-semibold">${customerName}</span>,</p>
        <p class="mb-6">We regret to inform you that your trip has been cancelled.</p>
        
        <div class="bg-gray-50 border-l-4 border-red-500 rounded-lg p-6 mb-6">
            <h3 class="text-lg font-semibold mb-4 text-gray-800">Trip Details</h3>
            <div class="space-y-3">
                 <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <span class="font-semibold text-gray-700">Trip ID:</span>
                    <span class="font-mono text-primary">${tripId}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <span class="font-semibold text-gray-700">From:</span>
                    <span class="text-gray-800">📍 ${startLocation}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <span class="font-semibold text-gray-700">To:</span>
                    <span class="text-gray-800">📍 ${endLocation}</span>
                </div>
                 <div class="flex justify-between items-center py-2">
                    <span class="font-semibold text-gray-700">Scheduled Date:</span>
                    <span class="text-gray-800">📅 ${new Date(date).toLocaleString()}</span>
                </div>
            </div>
        </div>

        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
             <p class="m-0 text-red-700">If this was a mistake or you need to re-book, please visit our app immediately.</p>
        </div>
        
        <p class="mb-4">We apologize for any inconvenience caused.</p>
    `;
    return (0, exports.baseTemplate)(content, "Trip Cancelled");
};
exports.tripCancelledTemplate = tripCancelledTemplate;
const tripCompletedTemplate = (customerName, tripId, price, startLocation, endLocation, date, distance) => {
    const content = `
        <h2 class="text-2xl text-primary mb-6 mt-0">📄 Trip Bill</h2>
        <p class="mb-4">Hi <span class="font-semibold">${customerName}</span>,</p>
        <p class="mb-6">Here is the bill for your recent trip.</p>
        
        <div class="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
            <div class="text-center border-b border-gray-200 pb-4 mb-4">
                <p class="text-gray-500 text-sm uppercase tracking-wider mb-1">Total Fare</p>
                <h3 class="text-3xl font-bold text-gray-800 m-0">LKR ${price}</h3>
                <p class="text-blue-600 text-sm font-semibold mt-2">Please ensure payment is settled.</p>
            </div>

            <div class="space-y-3">
                 <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="font-semibold text-gray-600">Trip ID</span>
                    <span class="font-mono text-gray-800">${tripId}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="font-semibold text-gray-600">Date</span>
                    <span class="text-gray-800">${new Date(date).toLocaleString()}</span>
                </div>
                ${distance ? `
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="font-semibold text-gray-600">Distance</span>
                    <span class="text-gray-800">${distance}</span>
                </div>` : ''}
                
                <div class="mt-4 pt-2">
                    <div class="flex items-start mb-2">
                        <div class="w-24 flex-shrink-0 text-gray-500 text-sm">Pick up</div>
                        <div class="text-gray-800 text-sm">${startLocation}</div>
                    </div>
                    <div class="flex items-start">
                        <div class="w-24 flex-shrink-0 text-gray-500 text-sm">Drop off</div>
                        <div class="text-gray-800 text-sm">${endLocation}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="text-center mb-6">
            <p class="mb-3 text-gray-600">How was your trip?</p>
            <a href="#" class="inline-block bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full font-semibold text-decoration-none hover:bg-yellow-300 transition-colors">
                Rate Your Driver
            </a>
        </div>
        
        <p class="text-center text-gray-500 text-sm">Need help with this trip? Contact support with your Trip ID.</p>
    `;
    return (0, exports.baseTemplate)(content, "Trip Bill");
};
exports.tripCompletedTemplate = tripCompletedTemplate;
