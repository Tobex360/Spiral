import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/logo.svg';
import { 
  GithubOutlined, 
  XOutlined, 
  LinkedinOutlined, 
  MailOutlined 
} from '@ant-design/icons';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary pt-16 pb-8">
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* 🔥 Logo (Centered) */}
        <div className="flex justify-center mb-12">
          <Link 
            to="/" 
            className="flex items-center gap-3 hover:scale-105 active:scale-95 transition-transform"
          >
            <img src={Logo} alt="Spiral" className="h-12 sm:h-14 md:h-16 w-auto" />
            <p className="text-3xl sm:text-4xl md:text-5xl text-primary font-rubik">
              SPIRAL
            </p>
          </Link>
        </div>

        {/* 🔥 Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 text-center md:text-left justify-center">
          
          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">
              Quick Links
            </h4>
            <ul className="space-y-4">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/" className="footer-link">Register</Link></li>
              <li><Link to="/" className="footer-link">Login</Link></li>
              <li><Link to="/" className="footer-link">Catalogue</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">
              Support
            </h4>
            <ul className="space-y-4">
              <li><Link to="/" className="footer-link">Help Center</Link></li>
              <li><Link to="/" className="footer-link">Terms of Service</Link></li>
              <li><Link to="/" className="footer-link">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">
              Stay Connected
            </h4>

            <div className="flex justify-center md:justify-start gap-4 mb-6">
              <a href="https://x.com/mirrorman_ult" className="social-icon">
                <XOutlined />
              </a>
              <a href="https://www.linkedin.com/in/tobechukwu-echefu-1318b6336/" className="social-icon">
                <LinkedinOutlined />
              </a>
              <a href="https://github.com/Tobex360" className="social-icon">
                <GithubOutlined />
              </a>
            </div>

            <a 
              href="mailto:tobex360@gmail.com" 
              className="flex items-center justify-center md:justify-start gap-2 text-white text-sm hover:text-primary transition-colors"
            >
              <MailOutlined />
              <span>Tobex360@gmail.com</span>
            </a>
          </div>

        </div>
      </div>

      {/* 🔥 Bottom Bar (Aligned with container) */}
      <div className="font-wallpoet max-w-7xl mx-auto px-6 lg:px-8 mt-12 pt-6 border-t border-gray-600 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        
        <p className="text-white/50 text-l font-medium">
          © {currentYear} SPIRAL. All rights reserved.
        </p>

        <span className="text-white text-l">
          Powered by{" "}
          <a 
            href="https://my-portfolio-snowy-alpha-98.vercel.app/" 
            className="hover:text-primary"
          >
            Echefu Tobechukwu
          </a>
        </span>

      </div>

    </footer>
  );
}

export default Footer;