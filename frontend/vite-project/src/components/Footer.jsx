import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { name: 'Trading Dashboard', href: '/dashboard' },
        { name: 'Portfolio Management', href: '/portfolio' },
        { name: 'Market Analysis', href: '/analysis' },
        { name: 'AI Predictions', href: '/predictions' }
      ]
    },
    {
      title: 'AI Features',
      links: [
        { name: 'Predictive Models', href: '/ai/predictions' },
        { name: 'Sentiment Analysis', href: '/ai/sentiment' },
        { name: 'Pattern Recognition', href: '/ai/patterns' },
        { name: 'Market Microstructure', href: '/ai/microstructure' }
      ]
    },
    {
      title: 'Markets',
      links: [
        { name: 'Stocks', href: '/markets/stocks' },
        { name: 'Cryptocurrency', href: '/markets/crypto' },
        { name: 'Forex', href: '/markets/forex' },
        { name: 'Commodities', href: '/markets/commodities' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'API Documentation', href: '/docs' },
        { name: 'System Status', href: '/status' },
        { name: 'Contact', href: '/contact' }
      ]
    }
  ];

  const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com/aitrading', icon: '🐦' },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/aitrading', icon: '💼' },
    { name: 'GitHub', href: 'https://github.com/aitrading', icon: '🐙' },
    { name: 'YouTube', href: 'https://youtube.com/aitrading', icon: '📺' }
  ];

  return (
    <footer style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '40px 20px 20px',
      color: 'white',
      marginTop: 'auto'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Main Footer Content */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginBottom: '30px' }}>
          {/* Company Info */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', textDecoration: 'none', marginBottom: '15px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>TradeFlowAI</div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>Trading Platform</div>
              </div>
            </Link>

            <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '20px', lineHeight: '1.5' }}>
              The world's most advanced AI-powered trading platform with
              ultra-low latency execution and institutional-grade analytics.
            </p>

            <div style={{ display: 'flex', gap: '15px' }}>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.name}
                >
                  <span style={{ fontSize: '18px' }}>{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: 'white' }}>
                {section.title}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {section.links.map((link) => (
                  <li key={link.name} style={{ marginBottom: '8px' }}>
                    <Link
                      to={link.href}
                      style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        textDecoration: 'none',
                        fontSize: '14px',
                        transition: 'color 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.color = 'white'}
                      onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.7)'}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Bottom */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
              © {currentYear} TradeFlow AI. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <Link to="/privacy" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontSize: '12px' }}>
                Privacy Policy
              </Link>
              <Link to="/terms" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontSize: '12px' }}>
                Terms of Service
              </Link>
              <Link to="/disclaimer" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontSize: '12px' }}>
                Risk Disclaimer
              </Link>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', opacity: 0.7 }}>
              <span>🔒</span>
              <span>SSL Secured</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', opacity: 0.7 }}>
              <span>🛡️</span>
              <span>SOC 2 Compliant</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', opacity: 0.7 }}>
              <span>⚡</span>
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>

        {/* Risk Disclaimer */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(255, 0, 0, 0.1)',
          border: '1px solid rgba(255, 0, 0, 0.2)',
          borderRadius: '8px'
        }}>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.8, lineHeight: '1.4' }}>
            <strong>Risk Warning:</strong> Trading involves substantial risk and may result in the loss of your invested capital.
            Past performance is not indicative of future results. Please ensure you fully understand the risks involved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;