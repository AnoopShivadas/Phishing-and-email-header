// ============================================================================
// CYBERSECURITY LEARNING PLATFORM - MAIN JAVASCRIPT
// ============================================================================

// Global Variables and State Management
let currentEmailIndex = 0;
let correctSimulationAnswers = 0;
let currentQuizQuestion = 0;
let quizScore = 0;
let quizAnswers = [];
let isQuizActive = false;

// Sample Data
const phishingEmails = [
    {
        id: 1,
        isPhishing: true,
        from: "security@paypal-urgent.com",
        to: "user@example.com",
        subject: "URGENT: Account Will Be Suspended - Verify Now!",
        body: `Dear Valued Customer,

We have detected suspicious activity on your PayPal account. Your account will be suspended within 24 hours unless you verify your identity immediately.

Click here to verify your account: http://paypal-verification.suspicious-site.net/verify

If you don't verify within 24 hours, your account will be permanently closed and all funds will be frozen.

Thank you for your immediate attention.

PayPal Security Team`,
        redFlags: [
            "Urgent/threatening language about account suspension",
            "Suspicious sender domain (paypal-urgent.com instead of paypal.com)",
            "Generic greeting 'Dear Valued Customer'",
            "Suspicious verification URL pointing to external site",
            "Creates false sense of urgency with 24-hour deadline",
            "Poor grammar: 'will be frozen' instead of professional language"
        ]
    },
    {
        id: 2,
        isPhishing: false,
        from: "noreply@github.com",
        to: "developer@company.com",
        subject: "GitHub Security Alert: New sign-in from Chrome on Windows",
        body: `Hi developer@company.com,

A new sign-in to your account was detected.

Device: Chrome on Windows
Location: San Francisco, CA, USA  
Time: January 15, 2024 at 2:30 PM PST

If this was you, you can safely ignore this email.

If this wasn't you, please secure your account immediately:
- Change your password
- Review your security settings
- Enable two-factor authentication

View security settings: https://github.com/settings/security

Thanks,
The GitHub Team`,
        redFlags: []
    },
    {
        id: 3,
        isPhishing: true,
        from: "support@microsoft-security.org",
        to: "user@business.com",
        subject: "Microsoft Office 365 - License Expired",
        body: `Microsoft Office 365 Notification

Your Microsoft Office 365 license has expired. To continue using Office applications, you must renew your subscription immediately.

Your account details:
Email: user@business.com
License: Business Premium
Status: EXPIRED

To avoid service interruption, click below to renew:
http://office365-renewal.fake-microsoft.org/renew?user=user@business.com

Failure to renew within 48 hours will result in permanent data loss.

Microsoft Support Team
Copyright © 2024 Microsoft Corporation`,
        redFlags: [
            "Suspicious sender domain (microsoft-security.org instead of microsoft.com)",
            "False urgency about license expiration",
            "Threatening data loss to create panic",
            "Fake renewal URL pointing to external domain",
            "No option to log into official Microsoft portal",
            "Generic business communication style"
        ]
    }
];

const quizQuestions = [
    {
        id: 1,
        question: "What is the most common type of phishing attack?",
        options: [
            "Email phishing",
            "SMS phishing (Smishing)",
            "Voice phishing (Vishing)",
            "Social media phishing"
        ],
        correct: 0,
        explanation: "Email phishing remains the most common type, accounting for over 90% of phishing attacks. Attackers send mass emails impersonating legitimate organizations to steal credentials and personal information."
    },
    {
        id: 2,
        question: "Which of the following is NOT a red flag for phishing emails?",
        options: [
            "Urgent language and time pressure",
            "Generic greetings like 'Dear Customer'",
            "Professional email signature with contact details",
            "Suspicious links or attachments"
        ],
        correct: 2,
        explanation: "Professional email signatures with legitimate contact details are actually signs of authentic emails. Phishing emails typically lack proper signatures or use fake contact information."
    },
    {
        id: 3,
        question: "What does SPF stand for in email authentication?",
        options: [
            "Secure Protection Framework",
            "Sender Policy Framework",
            "Simple Password Function",
            "Spam Prevention Filter"
        ],
        correct: 1,
        explanation: "SPF (Sender Policy Framework) is an email authentication method that specifies which mail servers are authorized to send emails on behalf of a domain."
    },
    {
        id: 4,
        question: "Which authentication method uses cryptographic signatures to verify email integrity?",
        options: [
            "SPF",
            "DMARC",
            "DKIM",
            "TLS"
        ],
        correct: 2,
        explanation: "DKIM (DomainKeys Identified Mail) uses cryptographic signatures to verify that an email message hasn't been tampered with during transmission."
    },
    {
        id: 5,
        question: "What should you do if you receive a suspicious email asking for personal information?",
        options: [
            "Reply with your information to verify authenticity",
            "Click the link to check if it's legitimate",
            "Delete the email and report it as phishing",
            "Forward it to your contacts to warn them"
        ],
        correct: 2,
        explanation: "The safest approach is to delete suspicious emails and report them to your IT department or email provider. Never provide personal information or click suspicious links."
    },
    {
        id: 6,
        question: "What percentage of data breaches involve phishing attacks?",
        options: [
            "25%",
            "45%",
            "67%",
            "83%"
        ],
        correct: 3,
        explanation: "According to recent cybersecurity reports, approximately 83% of organizations experienced phishing attacks, making it the most common attack vector for data breaches."
    },
    {
        id: 7,
        question: "Which of the following domains is most likely to be used in a phishing attack?",
        options: [
            "support@paypal.com",
            "security@paypal-verification.net",
            "noreply@paypal.com",
            "help@paypal.com"
        ],
        correct: 1,
        explanation: "Phishing attacks often use domains that look similar to legitimate ones but have slight variations. 'paypal-verification.net' is suspicious because it's not the official paypal.com domain."
    },
    {
        id: 8,
        question: "What is spear phishing?",
        options: [
            "Phishing attacks via SMS messages",
            "Targeted phishing attacks on specific individuals",
            "Phishing attacks using fake websites",
            "Automated phishing attacks using bots"
        ],
        correct: 1,
        explanation: "Spear phishing refers to targeted phishing attacks that focus on specific individuals or organizations, often using personal information to make the attack more convincing."
    },
    {
        id: 9,
        question: "Which government agency should you report phishing attempts to in India?",
        options: [
            "CBI",
            "CERT-In",
            "RBI",
            "TRAI"
        ],
        correct: 1,
        explanation: "CERT-In (Computer Emergency Response Team - India) is the national agency responsible for cybersecurity incidents and should be contacted to report phishing attempts."
    },
    {
        id: 10,
        question: "What is the best way to verify if an email is legitimate?",
        options: [
            "Check if it has professional formatting",
            "Look for spelling and grammar errors",
            "Contact the organization through official channels",
            "Check the email's timestamp"
        ],
        correct: 2,
        explanation: "The most reliable way to verify an email's legitimacy is to contact the organization directly through their official website or phone number, not through any contact information provided in the suspicious email."
    }
];

const sampleHeaders = {
    good: `Return-Path: <noreply@github.com>
Delivered-To: developer@company.com
Received: from github.com (github.com [140.82.113.4])
    by mx.company.com with ESMTPS id abc123def456
    (version=TLSv1.3 cipher=TLS_AES_256_GCM_SHA384)
    for <developer@company.com>; Mon, 15 Jan 2024 14:30:15 -0800
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=github.com;
    s=github; t=1705359015;
    h=from:to:subject:date:mime-version;
    bh=abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx=;
    b=xyz789abc012def345ghi678jkl901mno234pqr567stu890vwx123=
Authentication-Results: mx.company.com;
    spf=pass smtp.mailfrom=github.com;
    dkim=pass header.d=github.com;
    dmarc=pass header.from=github.com
Message-ID: <security-alert-123456@github.com>
Date: Mon, 15 Jan 2024 22:30:15 +0000
From: GitHub <noreply@github.com>
To: developer@company.com
Subject: Security Alert: New sign-in detected
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8`,

    suspicious: `Return-Path: <support@paypal-security.com>
Delivered-To: user@example.com
Received: from mail.suspicious-server.net (unknown [192.168.1.100])
    by mx.example.com with ESMTP id fake123
    for <user@example.com>; Mon, 15 Jan 2024 10:30:00 -0500
Authentication-Results: mx.example.com;
    spf=fail smtp.mailfrom=paypal-security.com;
    dkim=none;
    dmarc=fail header.from=paypal-security.com
Message-ID: <urgent-notice-789@suspicious-server.net>
Date: Mon, 15 Jan 2024 15:30:00 +0000
From: PayPal Security <support@paypal-security.com>
To: user@example.com
Subject: Urgent: Account Verification Required
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8`
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, info)
 */
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
}

/**
 * Smooth scroll to section
 * @param {string} sectionId - ID of the section to scroll to
 */
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Generate random ID
 * @returns {string} Random ID string
 */
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// ============================================================================
// NAVIGATION FUNCTIONALITY
// ============================================================================

/**
 * Initialize navigation functionality
 */
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// ============================================================================
// PHISHING SIMULATION FUNCTIONALITY
// ============================================================================

/**
 * Display current email in simulation
 */
function displayCurrentEmail() {
    const emailDisplay = document.getElementById('emailDisplay');
    const currentEmailSpan = document.getElementById('currentEmail');
    
    if (!emailDisplay || currentEmailIndex >= phishingEmails.length) return;
    
    const email = phishingEmails[currentEmailIndex];
    
    emailDisplay.innerHTML = `
        <div class="email-header">
            <div class="email-field">
                <span class="field-label">From:</span>
                <span class="field-value">${email.from}</span>
            </div>
            <div class="email-field">
                <span class="field-label">To:</span>
                <span class="field-value">${email.to}</span>
            </div>
            <div class="email-field">
                <span class="field-label">Subject:</span>
                <span class="field-value">${email.subject}</span>
            </div>
        </div>
        <div class="email-body">
            ${email.body.replace(/\n/g, '<br>')}
        </div>
    `;
    
    if (currentEmailSpan) {
        currentEmailSpan.textContent = currentEmailIndex + 1;
    }
}

/**
 * Handle simulation answer
 * @param {boolean} markedAsPhishing - Whether user marked email as phishing
 */
function handleSimulationAnswer(markedAsPhishing) {
    const email = phishingEmails[currentEmailIndex];
    const feedbackArea = document.getElementById('feedbackArea');
    const nextButton = document.getElementById('nextEmail');
    const markPhishingBtn = document.getElementById('markPhishing');
    const markSafeBtn = document.getElementById('markSafe');
    const correctCountSpan = document.getElementById('correctCount');
    
    const isCorrect = markedAsPhishing === email.isPhishing;
    if (isCorrect) {
        correctSimulationAnswers++;
        if (correctCountSpan) {
            correctCountSpan.textContent = correctSimulationAnswers;
        }
    }
    
    let feedbackContent = '';
    
    if (email.isPhishing) {
        if (markedAsPhishing) {
            feedbackContent = `
                <div class="feedback-title correct">
                    <i class="fas fa-check-circle" aria-hidden="true"></i>
                    Correct! This is a phishing email.
                </div>
                <p>You successfully identified this phishing attempt. Here are the red flags you should have noticed:</p>
                <div class="red-flags">
                    ${email.redFlags.map(flag => `<div class="red-flag-item">${flag}</div>`).join('')}
                </div>
            `;
        } else {
            feedbackContent = `
                <div class="feedback-title incorrect">
                    <i class="fas fa-times-circle" aria-hidden="true"></i>
                    Incorrect. This is actually a phishing email!
                </div>
                <p>This email was designed to steal your personal information. Here are the warning signs you missed:</p>
                <div class="red-flags">
                    ${email.redFlags.map(flag => `<div class="red-flag-item">${flag}</div>`).join('')}
                </div>
            `;
        }
    } else {
        if (markedAsPhishing) {
            feedbackContent = `
                <div class="feedback-title incorrect">
                    <i class="fas fa-times-circle" aria-hidden="true"></i>
                    Incorrect. This is actually a legitimate email.
                </div>
                <p>This email is from a trusted source. Here's what makes it legitimate:</p>
                <ul>
                    <li>Sender domain matches the organization (github.com)</li>
                    <li>Professional and informative tone</li>
                    <li>Links direct to official website</li>
                    <li>No urgent demands for personal information</li>
                    <li>Clear security notification with helpful advice</li>
                </ul>
            `;
        } else {
            feedbackContent = `
                <div class="feedback-title correct">
                    <i class="fas fa-check-circle" aria-hidden="true"></i>
                    Correct! This is a legitimate email.
                </div>
                <p>You correctly identified this as a safe email. This demonstrates good security awareness!</p>
                <ul>
                    <li>Legitimate sender domain</li>
                    <li>Professional communication style</li>
                    <li>Helpful security information</li>
                    <li>No suspicious requests</li>
                </ul>
            `;
        }
    }
    
    if (feedbackArea) {
        feedbackArea.innerHTML = feedbackContent;
        feedbackArea.className = `feedback-area ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`;
        feedbackArea.style.display = 'block';
    }
    
    // Disable buttons and show next button
    if (markPhishingBtn) markPhishingBtn.disabled = true;
    if (markSafeBtn) markSafeBtn.disabled = true;
    
    if (currentEmailIndex < phishingEmails.length - 1) {
        if (nextButton) {
            nextButton.style.display = 'block';
            nextButton.focus();
        }
    } else {
        // Show final results
        showSimulationResults();
    }
    
    // Show toast notification
    showToast(
        isCorrect ? 'Correct answer!' : 'Incorrect answer. Review the feedback to learn more.',
        isCorrect ? 'success' : 'error'
    );
}

/**
 * Move to next email in simulation
 */
function showNextEmail() {
    currentEmailIndex++;
    const feedbackArea = document.getElementById('feedbackArea');
    const nextButton = document.getElementById('nextEmail');
    const markPhishingBtn = document.getElementById('markPhishing');
    const markSafeBtn = document.getElementById('markSafe');
    
    // Reset UI
    if (feedbackArea) feedbackArea.style.display = 'none';
    if (nextButton) nextButton.style.display = 'none';
    if (markPhishingBtn) markPhishingBtn.disabled = false;
    if (markSafeBtn) markSafeBtn.disabled = false;
    
    displayCurrentEmail();
    
    if (currentEmailIndex >= phishingEmails.length) {
        showSimulationResults();
    }
}

/**
 * Show simulation completion results
 */
function showSimulationResults() {
    const emailDisplay = document.getElementById('emailDisplay');
    const simulationControls = document.querySelector('.simulation-controls');
    const nextButton = document.getElementById('nextEmail');
    
    const percentage = Math.round((correctSimulationAnswers / phishingEmails.length) * 100);
    let performanceMessage = '';
    
    if (percentage >= 80) {
        performanceMessage = 'Excellent! You have strong phishing detection skills.';
    } else if (percentage >= 60) {
        performanceMessage = 'Good job! With some practice, you can improve your detection skills.';
    } else {
        performanceMessage = 'Consider reviewing the educational materials to improve your phishing detection abilities.';
    }
    
    if (emailDisplay) {
        emailDisplay.innerHTML = `
            <div class="simulation-results">
                <h3><i class="fas fa-trophy" aria-hidden="true"></i> Simulation Complete!</h3>
                <div class="results-summary">
                    <div class="score-display">${correctSimulationAnswers}/${phishingEmails.length}</div>
                    <div class="percentage">${percentage}%</div>
                </div>
                <p class="performance-message">${performanceMessage}</p>
                <button class="cta-button primary" onclick="restartSimulation()">
                    <i class="fas fa-redo" aria-hidden="true"></i>
                    Try Again
                </button>
            </div>
        `;
    }
    
    if (simulationControls) simulationControls.style.display = 'none';
    if (nextButton) nextButton.style.display = 'none';
    
    showToast('Phishing simulation completed!', 'success');
}

/**
 * Restart the phishing simulation
 */
function restartSimulation() {
    currentEmailIndex = 0;
    correctSimulationAnswers = 0;
    
    const feedbackArea = document.getElementById('feedbackArea');
    const simulationControls = document.querySelector('.simulation-controls');
    const correctCountSpan = document.getElementById('correctCount');
    
    if (feedbackArea) feedbackArea.style.display = 'none';
    if (simulationControls) simulationControls.style.display = 'flex';
    if (correctCountSpan) correctCountSpan.textContent = '0';
    
    displayCurrentEmail();
    showToast('Simulation restarted!', 'info');
}

/**
 * Initialize phishing simulation
 */
function initSimulation() {
    displayCurrentEmail();
    
    const markPhishingBtn = document.getElementById('markPhishing');
    const markSafeBtn = document.getElementById('markSafe');
    const nextButton = document.getElementById('nextEmail');
    
    if (markPhishingBtn) {
        markPhishingBtn.addEventListener('click', () => handleSimulationAnswer(true));
    }
    
    if (markSafeBtn) {
        markSafeBtn.addEventListener('click', () => handleSimulationAnswer(false));
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', showNextEmail);
    }
}

// ============================================================================
// EMAIL HEADER ANALYZER FUNCTIONALITY
// ============================================================================

/**
 * Parse email headers and extract key information
 * @param {string} headers - Raw email headers
 * @returns {Object} Parsed header information
 */
function parseEmailHeaders(headers) {
    const lines = headers.split('\n');
    const parsed = {
        from: '',
        returnPath: '',
        received: [],
        authResults: {
            spf: 'none',
            dkim: 'none',
            dmarc: 'none'
        },
        messageId: '',
        date: '',
        subject: ''
    };
    
    let currentField = '';
    let currentValue = '';
    
    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        
        // Check if this is a new field (starts with field name followed by colon)
        const fieldMatch = line.match(/^([A-Za-z-]+):\s*(.*)$/);
        if (fieldMatch) {
            // Process previous field
            if (currentField && currentValue) {
                processHeaderField(parsed, currentField.toLowerCase(), currentValue);
            }
            
            currentField = fieldMatch[1];
            currentValue = fieldMatch[2];
        } else if (line.startsWith(' ') || line.startsWith('\t')) {
            // Continuation of previous field
            currentValue += ' ' + line.trim();
        }
    }
    
    // Process final field
    if (currentField && currentValue) {
        processHeaderField(parsed, currentField.toLowerCase(), currentValue);
    }
    
    return parsed;
}

/**
 * Process individual header field
 * @param {Object} parsed - Parsed headers object
 * @param {string} field - Field name
 * @param {string} value - Field value
 */
function processHeaderField(parsed, field, value) {
    switch (field) {
        case 'from':
            parsed.from = value;
            break;
        case 'return-path':
            parsed.returnPath = value;
            break;
        case 'received':
            parsed.received.push(value);
            break;
        case 'authentication-results':
            parseAuthResults(parsed, value);
            break;
        case 'message-id':
            parsed.messageId = value;
            break;
        case 'date':
            parsed.date = value;
            break;
        case 'subject':
            parsed.subject = value;
            break;
    }
}

/**
 * Parse authentication results
 * @param {Object} parsed - Parsed headers object
 * @param {string} authResults - Authentication results string
 */
function parseAuthResults(parsed, authResults) {
    if (authResults.includes('spf=pass')) {
        parsed.authResults.spf = 'pass';
    } else if (authResults.includes('spf=fail')) {
        parsed.authResults.spf = 'fail';
    } else if (authResults.includes('spf=softfail')) {
        parsed.authResults.spf = 'softfail';
    }
    
    if (authResults.includes('dkim=pass')) {
        parsed.authResults.dkim = 'pass';
    } else if (authResults.includes('dkim=fail')) {
        parsed.authResults.dkim = 'fail';
    }
    
    if (authResults.includes('dmarc=pass')) {
        parsed.authResults.dmarc = 'pass';
    } else if (authResults.includes('dmarc=fail')) {
        parsed.authResults.dmarc = 'fail';
    }
}

/**
 * Analyze parsed headers and generate security verdict
 * @param {Object} parsed - Parsed header information
 * @returns {Object} Analysis results
 */
function analyzeHeaders(parsed) {
    const analysis = {
        overallRisk: 'low',
        riskScore: 0,
        issues: [],
        recommendations: []
    };
    
    // Check SPF
    if (parsed.authResults.spf === 'fail') {
        analysis.riskScore += 30;
        analysis.issues.push('SPF check failed - sender IP not authorized');
        analysis.recommendations.push('Verify sender authenticity through alternative means');
    } else if (parsed.authResults.spf === 'softfail') {
        analysis.riskScore += 15;
        analysis.issues.push('SPF soft fail - sender IP questionable');
    }
    
    // Check DKIM
    if (parsed.authResults.dkim === 'fail') {
        analysis.riskScore += 25;
        analysis.issues.push('DKIM signature validation failed');
        analysis.recommendations.push('Email content may have been tampered with');
    } else if (parsed.authResults.dkim === 'none') {
        analysis.riskScore += 10;
        analysis.issues.push('No DKIM signature found');
    }
    
    // Check DMARC
    if (parsed.authResults.dmarc === 'fail') {
        analysis.riskScore += 35;
        analysis.issues.push('DMARC policy check failed');
        analysis.recommendations.push('High likelihood of spoofed sender');
    } else if (parsed.authResults.dmarc === 'none') {
        analysis.riskScore += 5;
        analysis.issues.push('No DMARC policy found');
    }
    
    // Check for suspicious patterns
    if (parsed.from && parsed.returnPath) {
        const fromDomain = parsed.from.match(/@([^>]+)/);
        const returnDomain = parsed.returnPath.match(/@([^>]+)/);
        if (fromDomain && returnDomain && fromDomain[1] !== returnDomain[1]) {
            analysis.riskScore += 20;
            analysis.issues.push('From domain differs from Return-Path domain');
        }
    }
    
    // Determine overall risk level
    if (analysis.riskScore >= 60) {
        analysis.overallRisk = 'high';
    } else if (analysis.riskScore >= 30) {
        analysis.overallRisk = 'medium';
    } else {
        analysis.overallRisk = 'low';
    }
    
    return analysis;
}

/**
 * Display header analysis results
 * @param {Object} parsed - Parsed header information
 * @param {Object} analysis - Analysis results
 */
function displayAnalysisResults(parsed, analysis) {
    const resultsContainer = document.getElementById('analyzerResults');
    if (!resultsContainer) return;
    
    const getRiskColor = (risk) => {
        switch (risk) {
            case 'high': return 'fail';
            case 'medium': return 'warning';
            case 'low': return 'pass';
            default: return 'warning';
        }
    };
    
    const getStatusClass = (status) => {
        if (status === 'pass') return 'pass';
        if (status === 'fail') return 'fail';
        return 'warning';
    };
    
    resultsContainer.innerHTML = `
        <div class="result-section">
            <h3><i class="fas fa-chart-bar" aria-hidden="true"></i> Overall Assessment</h3>
            <div class="result-item ${getRiskColor(analysis.overallRisk)}">
                <span class="result-label">Security Risk Level:</span>
                <span class="result-status ${getRiskColor(analysis.overallRisk)}">${analysis.overallRisk.toUpperCase()}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Risk Score:</span>
                <span class="result-value">${analysis.riskScore}/100</span>
            </div>
        </div>
        
        <div class="result-section">
            <h3><i class="fas fa-shield-alt" aria-hidden="true"></i> Authentication Results</h3>
            <div class="result-item ${getStatusClass(parsed.authResults.spf)}">
                <span class="result-label">SPF (Sender Policy Framework):</span>
                <span class="result-status ${getStatusClass(parsed.authResults.spf)}">${parsed.authResults.spf.toUpperCase()}</span>
            </div>
            <div class="result-item ${getStatusClass(parsed.authResults.dkim)}">
                <span class="result-label">DKIM (DomainKeys Identified Mail):</span>
                <span class="result-status ${getStatusClass(parsed.authResults.dkim)}">${parsed.authResults.dkim.toUpperCase()}</span>
            </div>
            <div class="result-item ${getStatusClass(parsed.authResults.dmarc)}">
                <span class="result-label">DMARC (Domain-based Authentication):</span>
                <span class="result-status ${getStatusClass(parsed.authResults.dmarc)}">${parsed.authResults.dmarc.toUpperCase()}</span>
            </div>
        </div>
        
        <div class="result-section">
            <h3><i class="fas fa-info-circle" aria-hidden="true"></i> Header Details</h3>
            <div class="result-item">
                <span class="result-label">From:</span>
                <span class="result-value">${parsed.from || 'Not found'}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Return-Path:</span>
                <span class="result-value">${parsed.returnPath || 'Not found'}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Message-ID:</span>
                <span class="result-value">${parsed.messageId || 'Not found'}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Date:</span>
                <span class="result-value">${parsed.date || 'Not found'}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Received Hops:</span>
                <span class="result-value">${parsed.received.length} hop(s)</span>
            </div>
        </div>
        
        ${analysis.issues.length > 0 ? `
        <div class="result-section">
            <h3><i class="fas fa-exclamation-triangle" aria-hidden="true"></i> Security Issues Found</h3>
            ${analysis.issues.map(issue => `
                <div class="result-item fail">
                    <span class="result-label">${issue}</span>
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${analysis.recommendations.length > 0 ? `
        <div class="result-section">
            <h3><i class="fas fa-lightbulb" aria-hidden="true"></i> Recommendations</h3>
            ${analysis.recommendations.map(rec => `
                <div class="result-item warning">
                    <span class="result-label">${rec}</span>
                </div>
            `).join('')}
        </div>
        ` : ''}
    `;
    
    resultsContainer.style.display = 'block';
    
    // Show toast based on risk level
    const toastMessages = {
        low: 'Email appears to be legitimate',
        medium: 'Email has some security concerns',
        high: 'Email has significant security risks'
    };
    
    const toastTypes = {
        low: 'success',
        medium: 'info',
        high: 'error'
    };
    
    showToast(toastMessages[analysis.overallRisk], toastTypes[analysis.overallRisk]);
}

/**
 * Analyze email headers from input
 */
function analyzeEmailHeaders() {
    const headerInput = document.getElementById('headerInput');
    if (!headerInput) return;
    
    const headers = headerInput.value.trim();
    if (!headers) {
        showToast('Please paste email headers to analyze', 'error');
        return;
    }
    
    try {
        const parsed = parseEmailHeaders(headers);
        const analysis = analyzeHeaders(parsed);
        displayAnalysisResults(parsed, analysis);
        
        // Scroll to results
        const resultsContainer = document.getElementById('analyzerResults');
        if (resultsContainer) {
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } catch (error) {
        showToast('Error analyzing headers. Please check the format and try again.', 'error');
        console.error('Header analysis error:', error);
    }
}

/**
 * Load sample header examples
 * @param {string} type - Type of example (good or suspicious)
 */
function loadHeaderExample(type) {
    const headerInput = document.getElementById('headerInput');
    if (!headerInput) return;
    
    if (sampleHeaders[type]) {
        headerInput.value = sampleHeaders[type];
        showToast(`Loaded ${type} email header example`, 'info');
    }
}

/**
 * Initialize email header analyzer
 */
function initEmailAnalyzer() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loadGoodBtn = document.getElementById('loadGoodExample');
    const loadSuspiciousBtn = document.getElementById('loadSuspiciousExample');
    
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeEmailHeaders);
    }
    
    if (loadGoodBtn) {
        loadGoodBtn.addEventListener('click', () => loadHeaderExample('good'));
    }
    
    if (loadSuspiciousBtn) {
        loadSuspiciousBtn.addEventListener('click', () => loadHeaderExample('suspicious'));
    }
}

// ============================================================================
// QUIZ FUNCTIONALITY
// ============================================================================

/**
 * Start the cybersecurity quiz
 */
function startQuiz() {
    currentQuizQuestion = 0;
    quizScore = 0;
    quizAnswers = [];
    isQuizActive = true;
    
    const quizContent = document.getElementById('quizContent');
    const quizStats = document.getElementById('quizStats');
    const certificateSection = document.getElementById('certificateSection');
    
    if (quizStats) quizStats.style.display = 'flex';
    if (certificateSection) certificateSection.style.display = 'none';
    
    updateQuizProgress();
    displayQuizQuestion();
    
    showToast('Quiz started! Good luck!', 'info');
}

/**
 * Display current quiz question
 */
function displayQuizQuestion() {
    if (currentQuizQuestion >= quizQuestions.length) {
        showQuizResults();
        return;
    }
    
    const question = quizQuestions[currentQuizQuestion];
    const quizContent = document.getElementById('quizContent');
    
    if (!quizContent) return;
    
    quizContent.innerHTML = `
        <div class="question-container">
            <h3 class="question-title">Question ${currentQuizQuestion + 1}: ${question.question}</h3>
            <div class="answer-options">
                ${question.options.map((option, index) => `
                    <div class="answer-option" data-index="${index}" role="button" tabindex="0" aria-describedby="question-${question.id}">
                        ${option}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Add click and keyboard event listeners to answer options
    const answerOptions = quizContent.querySelectorAll('.answer-option');
    answerOptions.forEach((option, index) => {
        option.addEventListener('click', () => selectQuizAnswer(index));
        option.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectQuizAnswer(index);
            }
        });
    });
}

/**
 * Handle quiz answer selection
 * @param {number} selectedIndex - Index of selected answer
 */
function selectQuizAnswer(selectedIndex) {
    const question = quizQuestions[currentQuizQuestion];
    const isCorrect = selectedIndex === question.correct;
    const quizContent = document.getElementById('quizContent');
    
    if (!quizContent) return;
    
    // Record answer
    quizAnswers.push({
        questionId: question.id,
        question: question.question,
        selectedAnswer: question.options[selectedIndex],
        correctAnswer: question.options[question.correct],
        isCorrect: isCorrect
    });
    
    if (isCorrect) {
        quizScore++;
        updateQuizStats();
    }
    
    // Update UI to show correct/incorrect answers
    const answerOptions = quizContent.querySelectorAll('.answer-option');
    answerOptions.forEach((option, index) => {
        option.style.pointerEvents = 'none';
        option.removeAttribute('tabindex');
        
        if (index === question.correct) {
            option.classList.add('correct');
        } else if (index === selectedIndex && !isCorrect) {
            option.classList.add('incorrect');
        }
    });
    
    // Show explanation
    const questionContainer = quizContent.querySelector('.question-container');
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = `question-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    feedbackDiv.innerHTML = `
        <strong>${isCorrect ? 'Correct!' : 'Incorrect.'}</strong><br>
        ${question.explanation}
    `;
    
    questionContainer.appendChild(feedbackDiv);
    
    // Add next question button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'next-question-btn';
    nextBtn.textContent = currentQuizQuestion === quizQuestions.length - 1 ? 'See Results' : 'Next Question';
    nextBtn.addEventListener('click', () => {
        currentQuizQuestion++;
        updateQuizProgress();
        displayQuizQuestion();
    });
    
    questionContainer.appendChild(nextBtn);
    nextBtn.focus();
    
    // Show toast notification
    showToast(
        isCorrect ? 'Correct answer!' : 'Incorrect. Review the explanation.',
        isCorrect ? 'success' : 'error'
    );
}

/**
 * Update quiz progress bar and text
 */
function updateQuizProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    const progress = ((currentQuizQuestion) / quizQuestions.length) * 100;
    
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
    
    if (progressText) {
        if (currentQuizQuestion >= quizQuestions.length) {
            progressText.textContent = 'Quiz Complete!';
        } else {
            progressText.textContent = `Question ${currentQuizQuestion + 1} of ${quizQuestions.length}`;
        }
    }
}

/**
 * Update quiz statistics display
 */
function updateQuizStats() {
    const correctAnswersSpan = document.getElementById('correctAnswers');
    if (correctAnswersSpan) {
        correctAnswersSpan.textContent = quizScore;
    }
}

/**
 * Display quiz completion results
 */
function showQuizResults() {
    isQuizActive = false;
    const quizContent = document.getElementById('quizContent');
    const certificateSection = document.getElementById('certificateSection');
    const progressFill = document.getElementById('progressFill');
    
    if (progressFill) {
        progressFill.style.width = '100%';
    }
    
    updateQuizProgress();
    
    const percentage = Math.round((quizScore / quizQuestions.length) * 100);
    let performanceMessage = '';
    let performanceClass = '';
    
    if (percentage >= 90) {
        performanceMessage = 'Outstanding! You have excellent cybersecurity knowledge.';
        performanceClass = 'excellent';
    } else if (percentage >= 80) {
        performanceMessage = 'Great job! You have strong cybersecurity awareness.';
        performanceClass = 'good';
    } else if (percentage >= 70) {
        performanceMessage = 'Good work! Consider reviewing some topics to improve further.';
        performanceClass = 'fair';
    } else {
        performanceMessage = 'Keep learning! Review the educational materials to strengthen your knowledge.';
        performanceClass = 'needs-improvement';
    }
    
    if (quizContent) {
        quizContent.innerHTML = `
            <div class="quiz-results">
                <h3><i class="fas fa-trophy" aria-hidden="true"></i> Quiz Complete!</h3>
                <div class="score-display">${quizScore}/${quizQuestions.length}</div>
                <div class="score-message ${performanceClass}">${percentage}% - ${performanceMessage}</div>
                
                <div class="performance-breakdown">
                    <div class="performance-item">
                        <div class="performance-value">${quizScore}</div>
                        <div class="performance-label">Correct</div>
                    </div>
                    <div class="performance-item">
                        <div class="performance-value">${quizQuestions.length - quizScore}</div>
                        <div class="performance-label">Incorrect</div>
                    </div>
                    <div class="performance-item">
                        <div class="performance-value">${percentage}%</div>
                        <div class="performance-label">Score</div>
                    </div>
                    <div class="performance-item">
                        <div class="performance-value">${formatDate(new Date()).split(',')[0]}</div>
                        <div class="performance-label">Date</div>
                    </div>
                </div>
                
                <button class="cta-button primary" onclick="startQuiz()">
                    <i class="fas fa-redo" aria-hidden="true"></i>
                    Retake Quiz
                </button>
            </div>
        `;
    }
    
    if (certificateSection) {
        certificateSection.style.display = 'block';
    }
    
    showToast(`Quiz completed! You scored ${percentage}%`, 'success');
}

/**
 * Generate and download certificate
 */
function generateCertificate() {
    const userNameInput = document.getElementById('userName');
    if (!userNameInput || !userNameInput.value.trim()) {
        showToast('Please enter your name to generate certificate', 'error');
        userNameInput?.focus();
        return;
    }
    
    const userName = userNameInput.value.trim();
    const percentage = Math.round((quizScore / quizQuestions.length) * 100);
    const canvas = document.getElementById('certificateCanvas');
    const ctx = canvas.getContext('2d');
    
    // Certificate design
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    
    // Header
    ctx.fillStyle = '#14b8a6';
    ctx.font = 'bold 32px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF COMPLETION', canvas.width / 2, 100);
    
    ctx.fillStyle = '#06ffa5';
    ctx.font = 'bold 28px Inter';
    ctx.fillText('Cybersecurity Training Program', canvas.width / 2, 140);
    
    // Recipient
    ctx.fillStyle = '#f9fafb';
    ctx.font = '24px Inter';
    ctx.fillText('This certifies that', canvas.width / 2, 200);
    
    ctx.fillStyle = '#14b8a6';
    ctx.font = 'bold 36px Inter';
    ctx.fillText(userName, canvas.width / 2, 250);
    
    // Achievement
    ctx.fillStyle = '#f9fafb';
    ctx.font = '20px Inter';
    ctx.fillText('has successfully completed the', canvas.width / 2, 300);
    ctx.fillText('Phishing Detection and Email Security course', canvas.width / 2, 330);
    
    ctx.fillStyle = '#06ffa5';
    ctx.font = 'bold 28px Inter';
    ctx.fillText(`Score: ${percentage}%`, canvas.width / 2, 380);
    
    // Date and signature
    ctx.fillStyle = '#9ca3af';
    ctx.font = '16px Inter';
    ctx.fillText(`Completed on: ${formatDate(new Date()).split(',')[0]}`, canvas.width / 2, 450);
    ctx.fillText('CyberSecure Learning Platform', canvas.width / 2, 480);
    ctx.fillText('Group 3 BScIT Students - Intern ID: 226', canvas.width / 2, 500);
    
    // Logo/Icon
    ctx.fillStyle = '#14b8a6';
    ctx.font = 'bold 60px FontAwesome';
    ctx.fillText('🛡️', canvas.width / 2, 550);
    
    // Download certificate
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `cybersecurity-certificate-${userName.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast('Certificate downloaded successfully!', 'success');
    });
}

/**
 * Export quiz results as JSON
 */
function exportQuizResultsJSON() {
    if (!quizAnswers.length) {
        showToast('No quiz results to export', 'error');
        return;
    }
    
    const results = {
        completedDate: new Date().toISOString(),
        score: quizScore,
        totalQuestions: quizQuestions.length,
        percentage: Math.round((quizScore / quizQuestions.length) * 100),
        answers: quizAnswers,
        metadata: {
            platform: 'CyberSecure Learning Platform',
            version: '1.0',
            exportFormat: 'JSON'
        }
    };
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `quiz-results-${new Date().toISOString().split('T')[0]}.json`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('Quiz results exported as JSON', 'success');
}

/**
 * Export quiz results as text
 */
function exportQuizResultsText() {
    if (!quizAnswers.length) {
        showToast('No quiz results to export', 'error');
        return;
    }
    
    const percentage = Math.round((quizScore / quizQuestions.length) * 100);
    let textContent = `CYBERSECURITY QUIZ RESULTS
============================

Date: ${formatDate(new Date())}
Score: ${quizScore}/${quizQuestions.length} (${percentage}%)
Platform: CyberSecure Learning Platform

DETAILED RESULTS:
`;
    
    quizAnswers.forEach((answer, index) => {
        textContent += `
${index + 1}. ${answer.question}
   Your Answer: ${answer.selectedAnswer}
   Correct Answer: ${answer.correctAnswer}
   Result: ${answer.isCorrect ? 'CORRECT' : 'INCORRECT'}
`;
    });
    
    textContent += `
============================
Generated by CyberSecure Learning Platform
Group 3 BScIT Students - Intern ID: 226`;
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `quiz-results-${new Date().toISOString().split('T')[0]}.txt`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('Quiz results exported as text file', 'success');
}

/**
 * Initialize quiz functionality
 */
function initQuiz() {
    const startQuizBtn = document.getElementById('startQuizBtn');
    const generateCertificateBtn = document.getElementById('generateCertificate');
    const exportJSONBtn = document.getElementById('exportJSON');
    const exportTextBtn = document.getElementById('exportText');
    
    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', startQuiz);
    }
    
    if (generateCertificateBtn) {
        generateCertificateBtn.addEventListener('click', generateCertificate);
    }
    
    if (exportJSONBtn) {
        exportJSONBtn.addEventListener('click', exportQuizResultsJSON);
    }
    
    if (exportTextBtn) {
        exportTextBtn.addEventListener('click', exportQuizResultsText);
    }
}

// ============================================================================
// RESOURCES AND EXPORT FUNCTIONALITY
// ============================================================================

/**
 * Generate and download cheat sheet
 */
function downloadCheatSheet() {
    const cheatSheetContent = `PHISHING DETECTION CHEAT SHEET
===============================

🚨 RED FLAGS TO WATCH FOR:
• Urgent/threatening language
• Generic greetings ("Dear Customer")
• Suspicious sender addresses
• Mismatched URLs/domains
• Unexpected attachments
• Poor grammar/spelling
• Requests for sensitive info

🔍 VERIFICATION STEPS:
1. Check sender domain carefully
2. Hover over links (don't click!)
3. Look for official contact info
4. Verify through separate channel
5. Check for SSL certificates
6. Review email headers

🛡️ PROTECTION MEASURES:
• Enable 2FA/MFA
• Keep software updated
• Use reputable antivirus
• Regular security training
• Report suspicious emails
• Use email filtering

📞 REPORTING CONTACTS:
CERT-In: incident@cert-in.org.in
US-CERT: info@us-cert.gov
Google: phishing@gmail.com
Microsoft: reportphishing@microsoft.com
PayPal: spoof@paypal.com

Generated by CyberSecure Learning Platform
Group 3 BScIT Students - Intern ID: 226`;

    const blob = new Blob([cheatSheetContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'phishing-detection-cheat-sheet.txt';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('Cheat sheet downloaded!', 'success');
}

/**
 * Export lessons as PDF (simplified text version)
 */
function exportLessons() {
    const lessonsContent = `CYBERSECURITY EDUCATION - COMPLETE LESSONS
=========================================

TABLE OF CONTENTS
=================
1. Understanding Phishing Threats
2. Types of Phishing Attacks
3. Red Flag Indicators
4. Email Authentication
5. Protection Strategies
6. Reporting Procedures

1. UNDERSTANDING PHISHING THREATS
=================================

What is Phishing?
Phishing is a cybercrime where attackers impersonate legitimate organizations to steal sensitive information like passwords, credit card numbers, and personal data through deceptive emails, websites, or messages.

Why It Matters:
• $12 billion in annual losses globally
• 1 in 4 people fall victim to phishing
• 83% of organizations are affected
• Average cost of $4.91M per breach

Social Impact:
• Identity theft and fraud
• Emotional distress for victims
• Erosion of digital trust
• Need for cybersecurity education

2. TYPES OF PHISHING ATTACKS
============================

Email Phishing:
Mass emails targeting credentials and personal information from a large number of users.

Spear Phishing:
Targeted attacks on specific individuals using personalized information to appear more legitimate.

Whaling:
Attacks targeting high-profile executives and decision-makers in organizations.

Smishing (SMS Phishing):
Phishing attempts delivered via SMS text messages to mobile devices.

Vishing (Voice Phishing):
Voice-based phishing attacks conducted over phone calls.

3. RED FLAG INDICATORS
======================

Common Warning Signs:
• Urgent or threatening language
• Suspicious sender addresses
• Generic greetings like "Dear Customer"
• Unexpected attachments
• Mismatched URLs and domains
• Poor grammar and spelling mistakes
• Requests for sensitive information

4. EMAIL AUTHENTICATION
=======================

SPF (Sender Policy Framework):
Verifies that the sending mail server is authorized to send emails for the domain.

DKIM (DomainKeys Identified Mail):
Uses cryptographic signatures to verify email authenticity and integrity.

DMARC (Domain-based Message Authentication):
Combines SPF and DKIM to provide comprehensive email authentication.

5. PROTECTION STRATEGIES
========================

Personal Protection:
• Verify sender identity through separate communication
• Hover over links to preview URLs
• Use multi-factor authentication (MFA)
• Keep software and browsers updated
• Use reputable antivirus software
• Participate in regular security training

Organizational Protection:
• Implement email filtering solutions
• Conduct regular security awareness training
• Establish clear reporting procedures
• Deploy endpoint detection and response
• Regular security assessments

6. REPORTING PROCEDURES
=======================

Government Agencies:
• CERT-In: incident@cert-in.org.in
• US-CERT: info@us-cert.gov
• IC3: ic3.gov

Major Platforms:
• Google: phishing@gmail.com
• Microsoft: reportphishing@microsoft.com
• PayPal: spoof@paypal.com

Remember: Report immediately and never provide personal information in response to suspicious requests.

=========================================
© 2024 CyberSecure Learning Platform
Group 3 BScIT Students - Intern ID: 226
=========================================`;

    const blob = new Blob([lessonsContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'cybersecurity-complete-lessons.txt';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('Lessons exported successfully!', 'success');
}

/**
 * Export analyzer results
 */
function exportAnalyzerResults() {
    const resultsContainer = document.getElementById('analyzerResults');
    if (!resultsContainer || resultsContainer.style.display === 'none') {
        showToast('No analyzer results to export. Please analyze email headers first.', 'error');
        return;
    }
    
    // Extract text content from results
    const resultSections = resultsContainer.querySelectorAll('.result-section');
    let exportContent = `EMAIL HEADER ANALYSIS RESULTS
============================

Analysis Date: ${formatDate(new Date())}

`;
    
    resultSections.forEach(section => {
        const title = section.querySelector('h3').textContent;
        exportContent += `${title}\n${'='.repeat(title.length)}\n\n`;
        
        const resultItems = section.querySelectorAll('.result-item');
        resultItems.forEach(item => {
            const label = item.querySelector('.result-label')?.textContent || '';
            const value = item.querySelector('.result-value')?.textContent || 
                         item.querySelector('.result-status')?.textContent || '';
            
            if (label && value) {
                exportContent += `${label} ${value}\n`;
            } else if (label) {
                exportContent += `• ${label}\n`;
            }
        });
        
        exportContent += '\n';
    });
    
    exportContent += `
============================
Generated by CyberSecure Learning Platform
Email Header Analyzer Tool
Group 3 BScIT Students - Intern ID: 226
============================`;
    
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `email-analysis-results-${new Date().toISOString().split('T')[0]}.txt`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('Analyzer results exported!', 'success');
}

/**
 * Initialize resources functionality
 */
function initResources() {
    const downloadCheatSheetBtn = document.getElementById('downloadCheatSheet');
    const exportLessonsBtn = document.getElementById('exportLessons');
    const exportAnalyzerBtn = document.getElementById('exportAnalyzer');
    
    if (downloadCheatSheetBtn) {
        downloadCheatSheetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            downloadCheatSheet();
        });
    }
    
    if (exportLessonsBtn) {
        exportLessonsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            exportLessons();
        });
    }
    
    if (exportAnalyzerBtn) {
        exportAnalyzerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            exportAnalyzerResults();
        });
    }
}

// ============================================================================
// CONTACT FORM FUNCTIONALITY
// ============================================================================

/**
 * Handle contact form submission
 * @param {Event} e - Form submission event
 */
function handleContactSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Simple validation
    if (!name || !email || !message) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    // Simulate form submission (in a real app, this would send to a server)
    const submitButton = e.target.querySelector('.submit-button');
    const originalText = submitButton.innerHTML;
    
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitButton.disabled = true;
    
    setTimeout(() => {
        showToast('Thank you for your message! We\'ll get back to you soon.', 'success');
        e.target.reset();
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }, 2000);
}

/**
 * Initialize contact form
 */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmission);
    }
}

// ============================================================================
// ACCESSIBILITY ENHANCEMENTS
// ============================================================================

/**
 * Handle keyboard navigation for interactive elements
 */
function initKeyboardNavigation() {
    // Handle Enter key on buttons that aren't actually buttons
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            const target = e.target;
            
            // Handle quiz answer options
            if (target.classList.contains('answer-option') && !target.classList.contains('correct') && !target.classList.contains('incorrect')) {
                e.preventDefault();
                const index = parseInt(target.dataset.index);
                if (!isNaN(index)) {
                    selectQuizAnswer(index);
                }
            }
        }
    });
    
    // Improve focus visibility
    document.addEventListener('focusin', (e) => {
        if (e.target.matches('button, input, textarea, select, a, [tabindex]')) {
            e.target.classList.add('keyboard-focused');
        }
    });
    
    document.addEventListener('focusout', (e) => {
        e.target.classList.remove('keyboard-focused');
    });
}

/**
 * Announce important updates to screen readers
 * @param {string} message - Message to announce
 */
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// ============================================================================
// MAIN INITIALIZATION
// ============================================================================

/**
 * Initialize all functionality when DOM is loaded
 */
function initializeApp() {
    console.log('Initializing CyberSecure Learning Platform...');
    
    try {
        // Initialize core functionality
        initNavigation();
        initSimulation();
        initEmailAnalyzer();
        initQuiz();
        initResources();
        initContactForm();
        initKeyboardNavigation();
        
        // Add smooth scrolling for all internal links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                scrollToSection(targetId);
            });
        });
        
        // Initialize scroll-to-top functionality
        let scrollToTopBtn = document.createElement('button');
        scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        scrollToTopBtn.className = 'scroll-to-top';
        scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
        scrollToTopBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--accent-teal);
            color: var(--primary-dark);
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            cursor: pointer;
            display: none;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transition: var(--transition-smooth);
        `;
        
        document.body.appendChild(scrollToTopBtn);
        
        // Show/hide scroll to top button
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.style.display = 'block';
            } else {
                scrollToTopBtn.style.display = 'none';
            }
        });
        
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        console.log('CyberSecure Learning Platform initialized successfully!');
        showToast('Welcome to CyberSecure Learning Platform!', 'success');
        
    } catch (error) {
        console.error('Error initializing application:', error);
        showToast('There was an error loading the application. Please refresh the page.', 'error');
    }
}

// ============================================================================
// EVENT LISTENERS AND APP STARTUP
// ============================================================================

// Initialize app when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Handle window resize for responsive adjustments
window.addEventListener('resize', () => {
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 768) {
        const navMenu = document.querySelector('.nav-menu');
        const navToggle = document.querySelector('.nav-toggle');
        if (navMenu && navToggle) {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    }
});

// Handle visibility change to pause animations when tab is not visible
document.addEventListener('visibilitychange', () => {
    const animations = document.querySelectorAll('[style*="animation"]');
    animations.forEach(el => {
        if (document.hidden) {
            el.style.animationPlayState = 'paused';
        } else {
            el.style.animationPlayState = 'running';
        }
    });
});

// Export functions for global access (if needed)
window.CyberSecurePlatform = {
    scrollToSection,
    showToast,
    startQuiz,
    restartSimulation,
    analyzeEmailHeaders,
    generateCertificate,
    downloadCheatSheet,
    exportLessons,
    exportAnalyzerResults
};
