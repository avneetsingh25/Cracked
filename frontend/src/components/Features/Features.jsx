import "./Features.css";

import {
    Sparkles,
    Bot,
    BarChart3,
    Lightbulb,
    MessageSquareText,
    ShieldCheck
} from "lucide-react";

function Features() {
    return (
        <section id="features" className="features-section">

            <div className="features-container">

                <div className="features-heading">
                    <span>WHY CRACKED?</span>
                    <h2>
                        Everything You Need to
                        <br />
                        <span>Crack Your Next Interview</span>
                    </h2>
                    <p>
                        Practice smarter with AI-powered tools designed to
                        help you prepare, improve and perform better.
                    </p>
                </div>

                <div className="features-grid">

                    <div className="feature-card">
                        <div className="feature-card-icon">
                            <Sparkles />
                        </div>
                        <h3>AI Generated Questions</h3>
                        <p>
                            Get realistic interview questions generated
                            according to your role and experience.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-card-icon">
                            <Bot />
                        </div>
                        <h3>AI Evaluation</h3>
                        <p>
                            Receive instant AI-powered evaluation of every
                            answer you give.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-card-icon">
                            <BarChart3 />
                        </div>
                        <h3>Performance Scoring</h3>
                        <p>
                            Track your performance with clear scores,
                            accuracy and completion insights.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-card-icon">
                            <Lightbulb />
                        </div>
                        <h3>Ideal Answers</h3>
                        <p>
                            Compare your responses with strong ideal answers
                            and understand what you missed.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-card-icon">
                            <MessageSquareText />
                        </div>
                        <h3>Detailed Feedback</h3>
                        <p>
                            Understand your strengths and areas that need
                            improvement after every interview.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-card-icon">
                            <ShieldCheck />
                        </div>
                        <h3>Secure & Private</h3>
                        <p>
                            Your interview practice and personal data remain
                            secure and private.
                        </p>
                    </div>

                </div>

            </div>

        </section>
    );
}

export default Features;