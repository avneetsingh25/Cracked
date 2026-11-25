import "./Hero.css";
import HeroDashboard from "./HeroDashboard/HeroDashboard";
import { Link } from "react-router-dom";
function Hero(){
    return (
        <section className="hero">
            <div className="hero-container">
                <div className="hero-left">
                    <span className="hero-tag">
                        ⚡ AI-Powered Interview Practice Platform
                    </span>
                    <h1>
                        Practice Smarter
                        <br/>
                        <span>Crack Interviews Faster</span>
                    </h1>
                    <p>
                        Cracked AI helps you practice real-world technical interviews, get instant 
                        AI evaluations, detailed feedback and improve you and your confidence with
                        every attempt before the actual interview.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/register" className="primary-btn">
                            Start Free Interview →
                        </Link>
                        <a href="#features" className="secondary-btn">Explore Features</a>
                    </div>
                    <div className="hero-features">
                        <div className="hero-feature">
                            <span className="feature-icon">🤖</span>
                            <span>AI Generated Questions</span>
                        </div>
                        <div className="hero-feature">
                            <span className="feature-icon">⚡</span>
                            <span>Instant Evaluations</span>
                        </div>
                        <div className="hero-feature">
                            <span className="feature-icon">▣</span>
                            <span>Detailed Feedback</span>
                        </div>
                        <div className="hero-feature">
                            <span className="feature-icon">🛡</span>
                            <span>Secure &amp; Private</span>
                        </div>
                    </div>
                </div>
                <div className="hero-right">
                    <HeroDashboard />
                </div>
            </div>
        </section>
    );
}

export default Hero;