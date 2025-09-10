
        // Main Application JavaScript
        // This script handles all interactive functionality for the cybersecurity education platform

        // Application State
        let currentPhishingEmail = 0;
        let currentQuizQuestion = 0;
        let quizScore = 0;
        let quizAnswers = [];
        let quizStarted = false;

        // Sample phishing email templates for simulation
        const phishingEmails = [
            {
                isPhishing: true,
                from: "security@paypaI.com", // Note: capital I instead of l
                replyTo: "noreply@suspicious-domain.com",
                subject: "URGENT: Your Account Will Be Suspended",
                body: `
                    <p>Dear Valued Customer,</p>
                    <p><strong>IMMEDIATE ACTION REQUIRED!</strong></p>
                    <p>We have detected suspicious activity on your account. Your account will be permanently suspended within 24 hours unless you verify your information immediately.</p>
                    <p><a href="http://paypal-security-verification.malicious-site.com" style="color: #0070ba;">Click here to verify your account now</a></p>
                    <p>Failure to comply will result in permanent account closure and loss of funds.</p>
                    <p>Sincerely,<br>PayPal Security Team</p>
                `,
                redFlags: [
                    "Domain spoofing: 'paypaI.com' uses capital I instead of lowercase l",
                    "Mismatched Reply-To address pointing to suspicious domain",
                    "Urgent/threatening language creating false sense of urgency",
                    "Suspicious link domain not matching legitimate PayPal",
                    "Generic greeting 'Dear Valued Customer' instead of personal name"
                ]
            },
            {
                isPhishing: false,
                from: "notifications@github.com",
                replyTo: "noreply@github.com",
                subject: "Weekly activity summary for your repositories",
                body: `
                    <p>Hi [Your Name],</p>
                    <p>Here's your weekly activity summary from GitHub:</p>
                    <ul>
                        <li>3 new commits to your repositories</li>
                        <li>2 pull requests merged</li>
                        <li>1 new star on your project</li>
                    </ul>
                    <p>You can view detailed statistics in your <a href="https://github.com/settings/profile" style="color: #0366d6;">GitHub dashboard</a>.</p>
                    <p>Best regards,<br>The GitHub Team</p>
                `,
                redFlags: [] // This is a legitimate email
            },
            {
                isPhishing: true,
                from: "admin@your-bank.com",
                replyTo: "noreply@fake-bank-security.net",
                subject: "Security Alert: Unusual Login Detected",
                body: `
                    <p>Dear Customer,</p>
                    <p>We detected an unusual login attempt from an unrecognized device in Nigeria at 3:47 AM.</p>
                    <p><strong>Location:</strong> Lagos, Nigeria<br>
                    <strong>Device:</strong> Unknown Mobile Device<br>
                    <strong>Time:</strong> 3:47 AM EST</p>
                    <p>If this was not you, please click the link below immediately to secure your account:</p>
                    <p><a href="http://secure-bank-login.phishing-site.ru/verify" style="color: #cc0000;">SECURE MY ACCOUNT NOW</a></p>
                    <p>For your security, we have temporarily locked your account.</p>
                `,
                redFlags: [
                    "Mismatched Reply-To domain (.net vs .com)",
                    "Suspicious foreign domain (.ru) in the verification link",
                    "Creating panic with account locking claim",
                    "Generic 'Dear Customer' greeting",
                    "Urgent call-to-action with threatening consequences"
                ]
            }
        ];

        // Sample email headers for analyzer
        const sampleHeaders = {
            good: `Return-Path: <notifications@github.com>
Received: from github.com (192.30.255.112) by mx.example.com
    with ESMTP id ABC123; Thu, 01 Jan 2024 12:00:00 +0000
DKIM-Signature: v=1; a=rsa-sha256; d=github.com; s=default;
    bh=abc123...; b=def456...
From: GitHub <notifications@github.com>
Reply-To: noreply@github.com
To: user@example.com
Subject: Your weekly GitHub activity summary
Date: Thu, 01 Jan 2024 12:00:00 +0000
Message-ID: <weekly-summary-20240101@github.com>
Authentication-Results: mx.example.com;
    spf=pass smtp.mailfrom=github.com;
    dkim=pass header.d=github.com;
    dmarc=pass header.from=github.com`,
            
            suspicious: `Return-Path: <bounce@malicious-server.net>
Received: from unknown-server.xyz ([192.168.1.100]) by mx.example.com
    with SMTP id XYZ789; Thu, 01 Jan 2024 25:99:99 +0000
From: security@paypaI.com
Reply-To: noreply@suspicious-domain.com
To: victim@example.com
Subject: URGENT: Verify Your Account Now!
Date: Thu, 01 Jan 2024 25:99:99 +0000
Message-ID: <phishing-123@malicious-server.net>
Authentication-Results: mx.example.com;
    spf=fail smtp.mailfrom=paypaI.com;
    dkim=none;
    dmarc=fail header.from=paypaI.com`
        };

        // Quiz questions with explanations
        const quizQuestions = [
            {
                question: "What is the most common way phishing attacks are delivered?",
                options: [
                    "Phone calls",
                    "Email messages",
                    "Physical mail",
                    "Social media posts"
                ],
                correct: 1,
                explanation: "Email is the most common delivery method for phishing attacks, accounting for over 90% of all phishing attempts. Attackers use email because it's cost-effective and can reach many victims simultaneously."
            },
            {
                question: "Which domain is suspicious in a PayPal phishing email?",
                options: [
                    "paypal.com",
                    "paypaI.com (with capital I)",
                    "paypal.co.uk",
                    "mail.paypal.com"
                ],
                correct: 1,
                explanation: "The domain 'paypaI.com' uses a capital letter 'I' instead of lowercase 'l', making it visually similar but technically different from the legitimate 'paypal.com'. This is called typosquatting or homograph attack."
            },
            {
                question: "What does SPF in email headers validate?",
                options: [
                    "Email content authenticity",
                    "Sender's authorized servers",
                    "Recipient verification",
                    "Message encryption"
                ],
                correct: 1,
                explanation: "SPF (Sender Policy Framework) validates that emails are being sent from servers authorized by the domain owner. It helps prevent email spoofing by checking if the sending server is listed in the domain's SPF record."
            },
            {
                question: "Which is a red flag in email communication?",
                options: [
                    "Personalized greeting with your name",
                    "Company logo and branding",
                    "Urgent action required within hours",
                    "Professional email signature"
                ],
                correct: 2,
                explanation: "Urgent language creating artificial time pressure is a common phishing tactic. Legitimate organizations rarely require immediate action within hours and usually provide reasonable time frames for account-related actions."
            },
            {
                question: "What should you do first when you suspect a phishing email?",
                options: [
                    "Click the link to investigate",
                    "Reply asking for verification",
                    "Forward to IT security team",
                    "Delete it immediately"
                ],
                correct: 2,
                explanation: "The first step should be to report it to your IT security team or relevant authority. They can analyze the threat, protect other users, and provide guidance on next steps."
            },
            {
                question: "What does DKIM provide in email security?",
                options: [
                    "Sender server authorization",
                    "Message content integrity",
                    "Recipient authentication",
                    "Email encryption"
                ],
                correct: 1,
                explanation: "DKIM (DomainKeys Identified Mail) provides message integrity by using cryptographic signatures. It ensures that the email content hasn't been tampered with during transit."
            },
            {
                question: "Which greeting is more likely in a phishing email?",
                options: [
                    "Dear John Smith",
                    "Hello John",
                    "Dear Valued Customer",
                    "Hi there, John"
                ],
                correct: 2,
                explanation: "Generic greetings like 'Dear Valued Customer' are common in phishing emails because attackers often don't have personal information about their targets. Legitimate companies usually personalize communications."
            },
            {
                question: "What percentage of data breaches involve phishing?",
                options: [
                    "25%",
                    "50%",
                    "75%",
                    "95%"
                ],
                correct: 3,
                explanation: "According to cybersecurity research, approximately 95% of successful data breaches involve some form of phishing attack, making it the most significant attack vector in cybersecurity."
            },
            {
                question: "What should you check when hovering over a link?",
                options: [
                    "Link color",
                    "Link text content",
                    "Actual destination URL",
                    "Link formatting"
                ],
                correct: 2,
                explanation: "Always check the actual destination URL when hovering over a link. Phishing emails often display legitimate-looking link text while the actual URL points to malicious websites."
            },
            {
                question: "What does a DMARC policy of 'p=reject' mean?",
                options: [
                    "Monitor but don't block emails",
                    "Move suspicious emails to spam",
                    "Block all unauthenticated emails",
                    "Encrypt all outgoing emails"
                ],
                correct: 2,
                explanation: "A DMARC policy of 'p=reject' instructs receiving mail servers to reject (completely block) all emails that fail SPF and DKIM authentication checks, providing the strongest protection level."
            }
        ];

        // DOM elements
        const phishingSimulation = document.getElementById('phishing-simulation');
        const phishingFeedback = document.getElementById('phishing-feedback');
        const markPhishBtn = document.getElementById('mark-phish');
        const markSafeBtn = document.getElementById('mark-safe');
        const nextEmailBtn = document.getElementById('next-email');
        const analyzeBtn = document.getElementById('analyze-headers');
        const loadGoodBtn = document.getElementById('load-sample-good');
        const loadBadBtn = document.getElementById('load-sample-bad');
        const emailHeadersTextarea = document.getElementById('email-headers');
        const analyzerResults = document.getElementById('analyzer-results');
        const startQuizBtn = document.getElementById('start-quiz');
        const restartQuizBtn = document.getElementById('restart-quiz');
        const quizContainer = document.getElementById('quiz-container');
        const quizResults = document.getElementById('quiz-results');
        const quizProgress = document.getElementById('quiz-progress');
        const quizCounter = document.getElementById('quiz-counter');

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            // Set up smooth scrolling for navigation links
            setupSmoothScrolling();
            
            // Initialize phishing simulation
            loadPhishingEmail();
            
            // Set up event listeners
            setupEventListeners();
            
            // Add fade-in animation to cards as they come into view
            setupIntersectionObserver();
        });

        // Smooth scrolling for navigation links
        function setupSmoothScrolling() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
        }

        // Set up all event listeners
        function setupEventListeners() {
            // Phishing simulation controls
            markPhishBtn.addEventListener('click', () => checkPhishingAnswer(true));
            markSafeBtn.addEventListener('click', () => checkPhishingAnswer(false));
            nextEmailBtn.addEventListener('click', nextPhishingEmail);
            
            // Email analyzer controls
            analyzeBtn.addEventListener('click', analyzeEmailHeaders);
            loadGoodBtn.addEventListener('click', () => loadSampleHeaders('good'));
            loadBadBtn.addEventListener('click', () => loadSampleHeaders('suspicious'));
            
            // Quiz controls
            startQuizBtn.addEventListener('click', startQuiz);
            restartQuizBtn.addEventListener('click', restartQuiz);
            
            // Keyboard navigation support
            document.addEventListener('keydown', handleKeyboardNavigation);
        }

        // Intersection Observer for fade-in animations
        function setupIntersectionObserver() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.card').forEach(card => {
                observer.observe(card);
            });
        }

        // Keyboard navigation handler
        function handleKeyboardNavigation(e) {
            // Add keyboard shortcuts for common actions
            if (e.altKey) {
                switch(e.code) {
                    case 'KeyN':
                        e.preventDefault();
                        if (nextEmailBtn.style.display !== 'none') {
                            nextPhishingEmail();
                        }
                        break;
                    case 'KeyQ':
                        e.preventDefault();
                        if (!quizStarted) {
                            startQuiz();
                        }
                        break;
                }
            }
        }

        // Phishing Simulation Functions
        function loadPhishingEmail() {
            const email = phishingEmails[currentPhishingEmail];
            phishingSimulation.innerHTML = `
                <div class="phishing-email">
                    <div class="email-header">
                        <strong>From:</strong> ${email.from}<br>
                        <strong>Reply-To:</strong> ${email.replyTo}<br>
                        <strong>Subject:</strong> ${email.subject}
                    </div>
                    <div class="email-body">
                        ${email.body}
                    </div>
                </div>
            `;
            
            // Reset feedback and button states
            phishingFeedback.classList.remove('show');
            markPhishBtn.disabled = false;
            markSafeBtn.disabled = false;
            nextEmailBtn.style.display = 'none';
        }

        function checkPhishingAnswer(userSaysPhishing) {
            const email = phishingEmails[currentPhishingEmail];
            const isCorrect = userSaysPhishing === email.isPhishing;
            
            // Disable buttons after answer
            markPhishBtn.disabled = true;
            markSafeBtn.disabled = true;
            nextEmailBtn.style.display = 'inline-block';
            
            // Show feedback
            const feedbackClass = isCorrect ? 'feedback-correct' : 'feedback-incorrect';
            const resultText = isCorrect ? '✅ Correct!' : '❌ Incorrect';
            
            let feedbackContent = `<h4>${resultText}</h4>`;
            
            if (email.isPhishing) {
                feedbackContent += `<p><strong>This is a phishing email.</strong></p>`;
                if (email.redFlags.length > 0) {
                    feedbackContent += `<p><strong>Red flags identified:</strong></p><ul>`;
                    email.redFlags.forEach(flag => {
                        feedbackContent += `<li>${flag}</li>`;
                    });
                    feedbackContent += `</ul>`;
                }
            } else {
                feedbackContent += `<p><strong>This is a legitimate email.</strong></p>`;
                feedbackContent += `<p>It comes from a verified domain, uses appropriate language, and doesn't exhibit typical phishing red flags.</p>`;
            }
            
            phishingFeedback.className = `phishing-feedback show ${feedbackClass}`;
            phishingFeedback.innerHTML = feedbackContent;
        }

        function nextPhishingEmail() {
            currentPhishingEmail = (currentPhishingEmail + 1) % phishingEmails.length;
            loadPhishingEmail();
        }

        // Email Header Analysis Functions
        function loadSampleHeaders(type) {
            emailHeadersTextarea.value = sampleHeaders[type];
        }

        function analyzeEmailHeaders() {
            const headers = emailHeadersTextarea.value.trim();
            if (!headers) {
                alert('Please paste email headers to analyze.');
                return;
            }
            
            const analysis = parseEmailHeaders(headers);
            displayAnalysisResults(analysis);
        }

        function parseEmailHeaders(headers) {
            const analysis = {
                headers: {},
                securityChecks: {},
                receivedHops: [],
                verdict: '',
                recommendations: []
            };
            
            // Parse basic headers
            const lines = headers.split('\n');
            let currentHeader = '';
            let currentValue = '';
            
            lines.forEach(line => {
                if (line.match(/^[A-Za-z-]+:/)) {
                    // Save previous header
                    if (currentHeader) {
                        analysis.headers[currentHeader] = currentValue.trim();
                    }
                    
                    // Start new header
                    const parts = line.split(':');
                    currentHeader = parts[0].toLowerCase();
                    currentValue = parts.slice(1).join(':');
                } else {
                    // Continuation of previous header
                    currentValue += ' ' + line.trim();
                }
            });
            
            // Save last header
            if (currentHeader) {
                analysis.headers[currentHeader] = currentValue.trim();
            }
            
            // Parse Received headers for hops
            lines.forEach(line => {
                if (line.toLowerCase().startsWith('received:')) {
                    const received = line.substring(9).trim();
                    const ipMatch = received.match(/\[?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]?/);
                    const hostMatch = received.match(/from\s+([^\s\[]+)/);
                    const dateMatch = received.match(/;\s*(.+)$/);
                    
                    if (ipMatch || hostMatch) {
                        analysis.receivedHops.push({
                            ip: ipMatch ? ipMatch[1] : 'Unknown',
                            host: hostMatch ? hostMatch[1] : 'Unknown',
                            timestamp: dateMatch ? dateMatch[1] : 'Unknown'
                        });
                    }
                }
            });
            
            // Security analysis
            analysis.securityChecks = performSecurityChecks(analysis.headers);
            
            // Generate verdict and recommendations
            const { verdict, recommendations } = generateVerdict(analysis.securityChecks, analysis.headers);
            analysis.verdict = verdict;
            analysis.recommendations = recommendations;
            
            return analysis;
        }

        function performSecurityChecks(headers) {
            const checks = {
                spf: { status: 'unknown', message: 'SPF not checked' },
                dkim: { status: 'unknown', message: 'DKIM not checked' },
                dmarc: { status: 'unknown', message: 'DMARC not checked' },
                domainMatch: { status: 'unknown', message: 'Domain matching not checked' },
                timestamp: { status: 'unknown', message: 'Timestamp not checked' }
            };
            
            // Check Authentication-Results for SPF, DKIM, DMARC
            if (headers['authentication-results']) {
                const authResults = headers['authentication-results'].toLowerCase();
                
                if (authResults.includes('spf=pass')) {
                    checks.spf = { status: 'pass', message: 'SPF validation passed' };
                } else if (authResults.includes('spf=fail')) {
                    checks.spf = { status: 'fail', message: 'SPF validation failed - sender not authorized' };
                }
                
                if (authResults.includes('dkim=pass')) {
                    checks.dkim = { status: 'pass', message: 'DKIM signature valid' };
                } else if (authResults.includes('dkim=fail') || authResults.includes('dkim=none')) {
                    checks.dkim = { status: 'fail', message: 'DKIM signature missing or invalid' };
                }
                
                if (authResults.includes('dmarc=pass')) {
                    checks.dmarc = { status: 'pass', message: 'DMARC policy satisfied' };
                } else if (authResults.includes('dmarc=fail')) {
                    checks.dmarc = { status: 'fail', message: 'DMARC policy violation detected' };
                }
            }
            
            // Check domain matching between From and Return-Path
            if (headers['from'] && headers['return-path']) {
                const fromDomain = extractDomain(headers['from']);
                const returnPathDomain = extractDomain(headers['return-path']);
                
                if (fromDomain && returnPathDomain && fromDomain.toLowerCase() === returnPathDomain.toLowerCase()) {
                    checks.domainMatch = { status: 'pass', message: 'From and Return-Path domains match' };
                } else {
                    checks.domainMatch = { status: 'warning', message: 'From and Return-Path domains do not match' };
                }
            }
            
            // Check timestamp validity
            if (headers['date']) {
                const emailDate = new Date(headers['date']);
                const now = new Date();
                const daysDiff = Math.abs(now - emailDate) / (1000 * 60 * 60 * 24);
                
                if (!isNaN(emailDate.getTime()) && daysDiff < 30) {
                    checks.timestamp = { status: 'pass', message: 'Date appears valid and recent' };
                } else if (isNaN(emailDate.getTime())) {
                    checks.timestamp = { status: 'fail', message: 'Invalid or malformed date' };
                } else {
                    checks.timestamp = { status: 'warning', message: 'Email date is more than 30 days old' };
                }
            }
            
            return checks;
        }

        function extractDomain(emailOrAddress) {
            // Extract domain from email address or angle brackets
            const match = emailOrAddress.match(/[<\s]?([^@\s<>]+@)?([^>\s]+\.[^>\s]+)[>\s]?/);
            return match ? match[2] : null;
        }

        function generateVerdict(securityChecks, headers) {
            let suspiciousCount = 0;
            let failCount = 0;
            const recommendations = [];
            
            Object.values(securityChecks).forEach(check => {
                if (check.status === 'fail') failCount++;
                if (check.status === 'warning' || check.status === 'fail') suspiciousCount++;
            });
            
            let verdict = '';
            if (failCount === 0 && suspiciousCount === 0) {
                verdict = 'This email appears legitimate with good security indicators.';
            } else if (failCount >= 2 || suspiciousCount >= 3) {
                verdict = 'This email has multiple suspicious indicators and may be a phishing attempt.';
                recommendations.push('Do not click any links or download attachments');
                recommendations.push('Verify the sender through alternative communication methods');
                recommendations.push('Report this email to your security team');
            } else {
                verdict = 'This email has some suspicious indicators that warrant caution.';
                recommendations.push('Exercise caution with any links or attachments');
                recommendations.push('Verify sender authenticity if requesting sensitive actions');
            }
            
            // Add specific recommendations based on failed checks
            if (securityChecks.spf.status === 'fail') {
                recommendations.push('SPF failure indicates potential sender spoofing');
            }
            if (securityChecks.dkim.status === 'fail') {
                recommendations.push('Missing DKIM signature suggests email may have been tampered with');
            }
            if (securityChecks.domainMatch.status === 'warning') {
                recommendations.push('Mismatched domains could indicate spoofing attempt');
            }
            
            return { verdict, recommendations };
        }

        function displayAnalysisResults(analysis) {
            let html = `
                <h3><i class="fas fa-clipboard-list" style="color: var(--accent-teal);"></i> Analysis Results</h3>
                
                <div class="security-verdict">
                    <h4>Security Verdict</h4>
                    <p><strong>${analysis.verdict}</strong></p>
                </div>
            `;
            
            // Security checks summary
            html += `
                <h4>Security Checks</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-sm); margin-bottom: var(--space-md);">
            `;
            
            Object.entries(analysis.securityChecks).forEach(([check, result]) => {
                const statusClass = result.status === 'pass' ? 'security-good' : 
                                  result.status === 'warning' ? 'security-warning' : 
                                  result.status === 'fail' ? 'security-danger' : '';
                
                html += `
                    <div>
                        <strong>${check.toUpperCase()}:</strong><br>
                        <span class="security-indicator ${statusClass}">${result.message}</span>
                    </div>
                `;
            });
            
            html += `</div>`;
            
            // Recommendations
            if (analysis.recommendations.length > 0) {
                html += `
                    <h4>Recommendations</h4>
                    <ul>
                `;
                analysis.recommendations.forEach(rec => {
                    html += `<li>${rec}</li>`;
                });
                html += `</ul>`;
            }
            
            // Key headers table
            html += `
                <h4>Key Email Headers</h4>
                <table class="header-table">
                    <thead>
                        <tr>
                            <th>Header</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            const importantHeaders = ['from', 'reply-to', 'return-path', 'subject', 'date', 'message-id'];
            importantHeaders.forEach(header => {
                if (analysis.headers[header]) {
                    html += `
                        <tr>
                            <td><strong>${header.toUpperCase()}</strong></td>
                            <td>${escapeHtml(analysis.headers[header])}</td>
                        </tr>
                    `;
                }
            });
            
            html += `
                    </tbody>
                </table>
            `;
            
            // Received hops
            if (analysis.receivedHops.length > 0) {
                html += `
                    <h4>Email Route (Received Hops)</h4>
                    <table class="header-table">
                        <thead>
                            <tr>
                                <th>Host</th>
                                <th>IP Address</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                analysis.receivedHops.forEach(hop => {
                    html += `
                        <tr>
                            <td>${escapeHtml(hop.host)}</td>
                            <td>${escapeHtml(hop.ip)}</td>
                            <td>${escapeHtml(hop.timestamp)}</td>
                        </tr>
                    `;
                });
                
                html += `
                        </tbody>
                    </table>
                `;
            }
            
            analyzerResults.innerHTML = html;
            analyzerResults.classList.add('show');
        }

        // Quiz Functions
        function startQuiz() {
            quizStarted = true;
            currentQuizQuestion = 0;
            quizScore = 0;
            quizAnswers = [];
            
            startQuizBtn.style.display = 'none';
            restartQuizBtn.style.display = 'none';
            quizResults.style.display = 'none';
            
            showQuizQuestion();
        }

        function showQuizQuestion() {
            if (currentQuizQuestion >= quizQuestions.length) {
                showQuizResults();
                return;
            }
            
            const question = quizQuestions[currentQuizQuestion];
            const progress = ((currentQuizQuestion + 1) / quizQuestions.length) * 100;
            
            // Update progress bar
            quizProgress.style.width = progress + '%';
            quizProgress.parentElement.setAttribute('aria-valuenow', currentQuizQuestion + 1);
            quizCounter.textContent = `Question ${currentQuizQuestion + 1} of ${quizQuestions.length}`;
            
            // Create question HTML
            let html = `
                <div class="quiz-question">
                    <h3>Question ${currentQuizQuestion + 1}</h3>
                    <p><strong>${question.question}</strong></p>
                    <ul class="quiz-options">
            `;
            
            question.options.forEach((option, index) => {
                html += `
                    <li class="quiz-option">
                        <label>
                            <input type="radio" name="quiz-answer" value="${index}" />
                            ${option}
                        </label>
                    </li>
                `;
            });
            
            html += `
                    </ul>
                    <div class="quiz-explanation" id="quiz-explanation-${currentQuizQuestion}">
                        <p><strong>Explanation:</strong> ${question.explanation}</p>
                    </div>
                    <button type="button" class="btn btn-primary" onclick="submitQuizAnswer()" id="submit-answer" style="margin-top: var(--space-md);">
                        Submit Answer
                    </button>
                </div>
            `;
            
            quizContainer.innerHTML = html;
        }

        function submitQuizAnswer() {
            const selectedOption = document.querySelector('input[name="quiz-answer"]:checked');
            if (!selectedOption) {
                alert('Please select an answer.');
                return;
            }
            
            const userAnswer = parseInt(selectedOption.value);
            const question = quizQuestions[currentQuizQuestion];
            const isCorrect = userAnswer === question.correct;
            
            if (isCorrect) {
                quizScore++;
            }
            
            quizAnswers.push({
                question: currentQuizQuestion,
                userAnswer: userAnswer,
                correct: isCorrect
            });
            
            // Show explanation
            const explanation = document.getElementById(`quiz-explanation-${currentQuizQuestion}`);
            explanation.classList.add('show');
            
            // Update submit button to next button
            const submitBtn = document.getElementById('submit-answer');
            submitBtn.textContent = currentQuizQuestion === quizQuestions.length - 1 ? 'View Results' : 'Next Question';
            submitBtn.onclick = nextQuizQuestion;
            
            // Disable option selection
            document.querySelectorAll('input[name="quiz-answer"]').forEach(input => {
                input.disabled = true;
                if (parseInt(input.value) === question.correct) {
                    input.parentElement.style.background = 'rgba(16, 185, 129, 0.2)';
                    input.parentElement.style.borderColor = 'var(--success)';
                } else if (input.checked && !isCorrect) {
                    input.parentElement.style.background = 'rgba(239, 68, 68, 0.2)';
                    input.parentElement.style.borderColor = 'var(--error)';
                }
            });
        }

        function nextQuizQuestion() {
            currentQuizQuestion++;
            showQuizQuestion();
        }

        function showQuizResults() {
            const percentage = Math.round((quizScore / quizQuestions.length) * 100);
            let message = '';
            let certificateHtml = '';
            
            if (percentage >= 90) {
                message = '🏆 Excellent! You have a strong understanding of cybersecurity concepts.';
                certificateHtml = generateCertificate('Excellence', percentage);
            } else if (percentage >= 70) {
                message = '👍 Good job! You have a solid foundation but there\'s room for improvement.';
                certificateHtml = generateCertificate('Competency', percentage);
            } else if (percentage >= 50) {
                message = '📚 You\'re on the right track, but consider reviewing the learning materials.';
            } else {
                message = '🎯 This is a good learning opportunity. Review the materials and try again!';
            }
            
            quizProgress.style.width = '100%';
            quizProgress.parentElement.setAttribute('aria-valuenow', quizQuestions.length);
            quizCounter.textContent = 'Quiz Complete!';
            
            let html = `
                <h3><i class="fas fa-trophy" style="color: var(--accent-teal);"></i> Quiz Results</h3>
                <div style="text-align: center; margin-bottom: var(--space-lg);">
                    <div style="font-size: 3rem; font-weight: bold; color: var(--accent-teal); margin-bottom: var(--space-sm);">
                        ${quizScore}/${quizQuestions.length}
                    </div>
                    <div style="font-size: 2rem; margin-bottom: var(--space-sm);">
                        ${percentage}%
                    </div>
                    <p style="font-size: 1.1rem; max-width: 600px; margin: 0 auto var(--space-md);">
                        ${message}
                    </p>
                </div>
                
                ${certificateHtml}
                
                <h4>Question Review</h4>
                <div style="text-align: left;">
            `;
            
            quizAnswers.forEach((answer, index) => {
                const question = quizQuestions[answer.question];
                const statusIcon = answer.correct ? '✅' : '❌';
                const statusClass = answer.correct ? 'security-good' : 'security-danger';
                
                html += `
                    <div style="margin-bottom: var(--space-md); padding: var(--space-sm); border: 1px solid var(--border); border-radius: var(--radius);">
                        <p><strong>Question ${index + 1}:</strong> ${question.question}</p>
                        <p><span class="security-indicator ${statusClass}">${statusIcon} ${answer.correct ? 'Correct' : 'Incorrect'}</span></p>
                        <p><strong>Correct answer:</strong> ${question.options[question.correct]}</p>
                        <p><strong>Explanation:</strong> ${question.explanation}</p>
                    </div>
                `;
            });
            
            html += '</div>';
            
            quizContainer.innerHTML = html;
            quizResults.style.display = 'block';
            restartQuizBtn.style.display = 'inline-block';
            quizStarted = false;
        }

        function generateCertificate(level, percentage) {
            const date = new Date().toLocaleDateString();
            return `
                <div id="certificate" style="
                    background: linear-gradient(135deg, var(--card-bg) 0%, var(--glass-bg) 100%);
                    border: 2px solid var(--accent-teal);
                    border-radius: var(--radius-lg);
                    padding: var(--space-xl);
                    margin: var(--space-lg) 0;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                ">
                    <div style="position: absolute; top: -50px; left: -50px; width: 100px; height: 100px; background: radial-gradient(circle, rgba(20, 184, 166, 0.1) 0%, transparent 70%);"></div>
                    <div style="position: absolute; bottom: -50px; right: -50px; width: 100px; height: 100px; background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);"></div>
                    
                    <h3 style="color: var(--accent-teal); margin-bottom: var(--space-md);">
                        <i class="fas fa-certificate" aria-hidden="true"></i>
                        Certificate of ${level}
                    </h3>
                    <p style="font-size: 1.2rem; margin-bottom: var(--space-sm);">
                        This certifies that the student has successfully completed
                    </p>
                    <h4 style="color: var(--accent-blue); margin-bottom: var(--space-sm);">
                        Phishing Awareness & Email Security Quiz
                    </h4>
                    <p style="margin-bottom: var(--space-md);">
                        with a score of <strong>${percentage}%</strong>
                    </p>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">
                        <!-- Edit group info here -->
                        Issued by: 3 BScIT Students (Intern ID: 226)<br>
                        Date: ${date}
                    </p>
                    
                    <button type="button" class="btn btn-small btn-secondary" onclick="downloadCertificate()" style="margin-top: var(--space-sm);">
                        <i class="fas fa-download" aria-hidden="true"></i>
                        Download Certificate
                    </button>
                </div>
            `;
        }

        function restartQuiz() {
            currentQuizQuestion = 0;
            quizScore = 0;
            quizAnswers = [];
            quizStarted = false;
            
            quizContainer.innerHTML = '';
            quizResults.style.display = 'none';
            restartQuizBtn.style.display = 'none';
            startQuizBtn.style.display = 'inline-block';
            
            // Reset progress bar
            quizProgress.style.width = '0%';
            quizProgress.parentElement.setAttribute('aria-valuenow', 0);
            quizCounter.textContent = 'Question 1 of 10';
        }

        // Utility Functions
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function downloadCheatSheet() {
            // Generate a comprehensive cheat sheet
            const cheatSheetContent = `
PHISHING IDENTIFICATION CHEAT SHEET
================================

RED FLAGS TO WATCH FOR:
• Urgent/threatening language ("Account will be closed!")
• Generic greetings ("Dear Customer" instead of your name)  
• Suspicious sender domains (paypaI.com vs paypal.com)
• Mismatched Reply-To addresses
• Unexpected attachments, especially .exe, .zip files
• Poor grammar and spelling mistakes
• Requests for sensitive information via email

EMAIL HEADER ANALYSIS:
• SPF: Validates authorized sending servers
• DKIM: Ensures message hasn't been tampered with  
• DMARC: Combines SPF and DKIM for stronger protection
• Check From vs Return-Path domain matching
• Verify realistic timestamps

PROTECTION TIPS:
✓ Hover over links to see true destination
✓ Contact organization directly to verify suspicious emails
✓ Use two-factor authentication (2FA)
✓ Keep software and browsers updated
✓ Report phishing to security team or authorities

REPORTING CHANNELS:
• Company IT Security Team
• phishing@fbi.gov
• US-CERT: https://www.us-cert.gov/report
• Local Computer Emergency Response Team (CERT)

Generated by Cybersecurity Education Platform
Date: ${new Date().toLocaleDateString()}
            `;
            
            downloadTextFile('phishing-cheat-sheet.txt', cheatSheetContent);
        }

        function downloadCertificate() {
            // Create a downloadable certificate as HTML
            const certificateDiv = document.getElementById('certificate');
            if (!certificateDiv) return;
            
            const certificateHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Cybersecurity Quiz Certificate</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .certificate { 
            border: 3px solid #14b8a6; 
            padding: 40px; 
            text-align: center; 
            background: #f8f9fa;
        }
        h1 { color: #14b8a6; }
        .score { font-size: 1.5em; font-weight: bold; color: #3b82f6; }
    </style>
</head>
<body>
    <div class="certificate">
        ${certificateDiv.innerHTML}
    </div>
</body>
</html>
            `;
            
            downloadTextFile('cybersecurity-certificate.html', certificateHtml);
        }

        function exportQuizResults() {
            if (quizAnswers.length === 0) {
                alert('Please complete the quiz first to export results.');
                return;
            }
            
            const results = {
                completedDate: new Date().toISOString(),
                totalQuestions: quizQuestions.length,
                correctAnswers: quizScore,
                percentage: Math.round((quizScore / quizQuestions.length) * 100),
                questions: quizAnswers.map(answer => ({
                    questionNumber: answer.question + 1,
                    question: quizQuestions[answer.question].question,
                    userAnswer: quizQuestions[answer.question].options[answer.userAnswer],
                    correctAnswer: quizQuestions[answer.question].options[quizQuestions[answer.question].correct],
                    isCorrect: answer.correct,
                    explanation: quizQuestions[answer.question].explanation
                }))
            };
            
            downloadTextFile('quiz-results.json', JSON.stringify(results, null, 2));
        }

        function printPage() {
            // Hide interactive elements for printing
            const elementsToHide = document.querySelectorAll('.btn, .phishing-controls, nav');
            elementsToHide.forEach(el => el.style.display = 'none');
            
            window.print();
            
            // Restore interactive elements after printing
            setTimeout(() => {
                elementsToHide.forEach(el => el.style.display = '');
            }, 1000);
        }

        function downloadTextFile(filename, content) {
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // Make functions available globally for onclick handlers
        window.submitQuizAnswer = submitQuizAnswer;
        window.downloadCheatSheet = downloadCheatSheet;
        window.downloadCertificate = downloadCertificate;
        window.exportQuizResults = exportQuizResults;
        window.printPage = printPage;
