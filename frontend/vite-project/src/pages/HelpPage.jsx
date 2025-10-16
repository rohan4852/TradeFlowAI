import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HelpPage.css';

const HelpPage = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('faq');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedFaq, setExpandedFaq] = useState(null);

    const faqData = [
        {
            id: 1,
            question: "How do I get started with trading?",
            answer: "To get started, complete your profile setup, verify your identity, and fund your account. Then explore our educational resources and start with paper trading to practice."
        },
        {
            id: 2,
            question: "What are the trading fees?",
            answer: "We offer competitive pricing with $0 commission on stock trades. Options trades are $0.65 per contract. See our full fee schedule in the pricing section."
        },
        {
            id: 3,
            question: "How does the AI prediction system work?",
            answer: "Our AI analyzes market data, news sentiment, technical indicators, and historical patterns to generate predictions with confidence scores. These are suggestions, not financial advice."
        },
        {
            id: 4,
            question: "Is my data secure?",
            answer: "Yes, we use bank-level encryption, two-factor authentication, and follow strict security protocols to protect your data and funds."
        },
        {
            id: 5,
            question: "Can I trade on mobile?",
            answer: "Absolutely! Our platform is fully responsive and optimized for mobile trading. You can access all features from your smartphone or tablet."
        },
        {
            id: 6,
            question: "What markets can I trade?",
            answer: "You can trade US stocks, ETFs, options, and cryptocurrencies. We're continuously adding new markets and instruments."
        },
        {
            id: 7,
            question: "How do I withdraw funds?",
            answer: "Go to your account settings, select 'Withdraw Funds', choose your method (bank transfer or wire), and follow the instructions. Withdrawals typically take 1-3 business days."
        },
        {
            id: 8,
            question: "What if I forget my password?",
            answer: "Click 'Forgot Password' on the login page, enter your email, and we'll send you a secure reset link. You can also contact support for assistance."
        }
    ];

    const tutorials = [
        {
            title: "Getting Started Guide",
            description: "Complete walkthrough for new users",
            duration: "10 min",
            level: "Beginner"
        },
        {
            title: "Understanding Charts",
            description: "Learn to read candlestick charts and indicators",
            duration: "15 min",
            level: "Beginner"
        },
        {
            title: "AI Predictions Explained",
            description: "How to interpret and use AI trading signals",
            duration: "12 min",
            level: "Intermediate"
        },
        {
            title: "Risk Management",
            description: "Essential strategies for protecting your capital",
            duration: "20 min",
            level: "Intermediate"
        },
        {
            title: "Advanced Order Types",
            description: "Master stop-loss, limit, and conditional orders",
            duration: "18 min",
            level: "Advanced"
        },
        {
            title: "Portfolio Optimization",
            description: "Build and balance a diversified portfolio",
            duration: "25 min",
            level: "Advanced"
        }
    ];

    const filteredFaq = faqData.filter(item =>
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleFaq = (id) => {
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    return (
        <div className="help-page">
            <div className="help-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    ← Back to Dashboard
                </button>
                <h1>Help & Support</h1>
            </div>

            <div className="help-content">
                <div className="help-sidebar">
                    <nav className="help-nav">
                        <button
                            className={activeSection === 'faq' ? 'active' : ''}
                            onClick={() => setActiveSection('faq')}
                        >
                            📋 FAQ
                        </button>
                        <button
                            className={activeSection === 'tutorials' ? 'active' : ''}
                            onClick={() => setActiveSection('tutorials')}
                        >
                            🎓 Tutorials
                        </button>
                        <button
                            className={activeSection === 'contact' ? 'active' : ''}
                            onClick={() => setActiveSection('contact')}
                        >
                            📞 Contact Support
                        </button>
                        <button
                            className={activeSection === 'resources' ? 'active' : ''}
                            onClick={() => setActiveSection('resources')}
                        >
                            📚 Resources
                        </button>
                    </nav>
                </div>

                <div className="help-main">
                    {activeSection === 'faq' && (
                        <div className="faq-section">
                            <h2>Frequently Asked Questions</h2>

                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Search FAQ..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="faq-list">
                                {filteredFaq.map(item => (
                                    <div key={item.id} className="faq-item">
                                        <button
                                            className="faq-question"
                                            onClick={() => toggleFaq(item.id)}
                                        >
                                            {item.question}
                                            <span className={`faq-icon ${expandedFaq === item.id ? 'expanded' : ''}`}>
                                                ▼
                                            </span>
                                        </button>
                                        {expandedFaq === item.id && (
                                            <div className="faq-answer">
                                                {item.answer}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'tutorials' && (
                        <div className="tutorials-section">
                            <h2>Video Tutorials</h2>
                            <p>Learn at your own pace with our comprehensive video guides</p>

                            <div className="tutorials-grid">
                                {tutorials.map((tutorial, index) => (
                                    <div key={index} className="tutorial-card">
                                        <div className="tutorial-header">
                                            <h3>{tutorial.title}</h3>
                                            <span className={`level-badge ${tutorial.level.toLowerCase()}`}>
                                                {tutorial.level}
                                            </span>
                                        </div>
                                        <p>{tutorial.description}</p>
                                        <div className="tutorial-meta">
                                            <span>⏱️ {tutorial.duration}</span>
                                            <button className="watch-btn">Watch Now</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'contact' && (
                        <div className="contact-section">
                            <h2>Contact Support</h2>

                            <div className="contact-options">
                                <div className="contact-card">
                                    <h3>💬 Live Chat</h3>
                                    <p>Get instant help from our support team</p>
                                    <p><strong>Available:</strong> 24/7</p>
                                    <button className="contact-btn">Start Chat</button>
                                </div>

                                <div className="contact-card">
                                    <h3>📧 Email Support</h3>
                                    <p>Send us a detailed message</p>
                                    <p><strong>Response time:</strong> Within 2 hours</p>
                                    <button className="contact-btn">Send Email</button>
                                </div>

                                <div className="contact-card">
                                    <h3>📞 Phone Support</h3>
                                    <p>Speak directly with our experts</p>
                                    <p><strong>Hours:</strong> Mon-Fri 8AM-8PM EST</p>
                                    <button className="contact-btn">Call Now</button>
                                </div>
                            </div>

                            <div className="contact-form">
                                <h3>Send us a message</h3>
                                <form>
                                    <div className="form-group">
                                        <label>Subject</label>
                                        <select>
                                            <option>General Question</option>
                                            <option>Technical Issue</option>
                                            <option>Account Problem</option>
                                            <option>Trading Question</option>
                                            <option>Billing Issue</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Message</label>
                                        <textarea rows="5" placeholder="Describe your issue or question..."></textarea>
                                    </div>
                                    <button type="submit" className="submit-btn">Send Message</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeSection === 'resources' && (
                        <div className="resources-section">
                            <h2>Additional Resources</h2>

                            <div className="resources-grid">
                                <div className="resource-card">
                                    <h3>📖 Trading Guide</h3>
                                    <p>Comprehensive guide covering all aspects of trading</p>
                                    <button className="resource-btn">Download PDF</button>
                                </div>

                                <div className="resource-card">
                                    <h3>📊 Market Analysis</h3>
                                    <p>Daily market insights and analysis reports</p>
                                    <button className="resource-btn">View Reports</button>
                                </div>

                                <div className="resource-card">
                                    <h3>🎯 Trading Strategies</h3>
                                    <p>Proven strategies for different market conditions</p>
                                    <button className="resource-btn">Learn More</button>
                                </div>

                                <div className="resource-card">
                                    <h3>📈 Economic Calendar</h3>
                                    <p>Stay updated with important economic events</p>
                                    <button className="resource-btn">View Calendar</button>
                                </div>

                                <div className="resource-card">
                                    <h3>🔧 API Documentation</h3>
                                    <p>For developers wanting to integrate our services</p>
                                    <button className="resource-btn">View Docs</button>
                                </div>

                                <div className="resource-card">
                                    <h3>🎮 Paper Trading</h3>
                                    <p>Practice trading with virtual money</p>
                                    <button className="resource-btn">Start Practice</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HelpPage;