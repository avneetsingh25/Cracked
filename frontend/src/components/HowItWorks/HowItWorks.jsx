import "./HowItWorks.css";
import {
    FaFileCirclePlus,
    FaKeyboard,
    FaBrain,
    FaChartLine
} from "react-icons/fa6";

function HowItWorks() {
    return (
        <>
            <section id="how-it-works" className="how-it-works-section">

                <div className="how-it-works-container">

                    <div className="how-it-works-heading">
                        <span>HOW IT WORKS</span>
                        <h2>
                            Simple steps to ace
                            <br />
                            your next interview
                        </h2>
                    </div>

                    <div className="steps-container">

                        <div className="step">
                            <div className="step-icon create-icon">
                                <FaFileCirclePlus />
                            </div>
                            <h3>Create Interview</h3>
                            <p>
                                Choose role, experience level,
                                tech stack and number of questions.
                            </p>
                        </div>
                        <div className="step-arrow">
                            →
                        </div>
                        <div className="step">
                            <div className="step-icon answer-icon">
                                <FaKeyboard />
                            </div>
                            <h3>Answer Questions</h3>
                            <p>
                                Answer the questions one by one
                                at your own pace.
                            </p>
                        </div>
                        <div className="step-arrow">
                            →
                        </div>
                        <div className="step">
                            <div className="step-icon evaluation-icon">
                                <FaBrain />
                            </div>
                            <h3>AI Evaluation</h3>
                            <p>
                                AI evaluates your answers and
                                provides detailed feedback.
                            </p>
                        </div>
                        <div className="step-arrow">
                            →
                        </div>
                        <div className="step">
                            <div className="step-icon report-icon">
                                <FaChartLine />
                            </div>
                            <h3>Final Report</h3>
                            <p>
                                Get your overall score, feedback
                                and recommended next steps.
                            </p>
                        </div>

                    </div>

                </div>

            </section>

            <section className="final-report-section">

                <div className="final-report-container">

                    <div className="final-report-heading">
                        <span>FINAL REPORT PREVIEW</span>
                        <h2>
                            Understand your performance
                            <br />
                            at a glance
                        </h2>
                    </div>

                    <div className="final-report-card">

                        <div className="report-rating">
                            <h3>Overall Rating</h3>
                            <div className="score-circle">
                                <div className="score-content">
                                    <strong>8.4</strong>
                                    <span>/ 10</span>
                                </div>
                            </div>
                            <div className="rating-stars">
                                ★ ★ ★ ★ ☆
                            </div>
                            <p>
                                Great Job! Keep improving.
                            </p>
                        </div>
                        <div className="report-strengths">
                            <h3>Strengths</h3>
                            <p>
                                <span className="success-icon">✓</span>
                                Good understanding of OOP
                            </p>
                            <p>
                                <span className="success-icon">✓</span>
                                Strong DBMS concepts
                            </p>
                            <p>
                                <span className="success-icon">✓</span>
                                Clear communication
                            </p>
                            <div className="report-divider"></div>
                            <h3>Areas to Improve</h3>
                            <p>
                                <span className="improve-icon">●</span>
                                System Design
                            </p>
                            <p>
                                <span className="improve-icon">●</span>
                                Operating Systems
                            </p>
                            <p>
                                <span className="improve-icon">●</span>
                                Time Complexity
                            </p>
                        </div>
                        <div className="report-recommendation">
                            <h3>Recommendation</h3>
                            <p>
                                You are ready for most
                                entry-level interviews.
                            </p>
                            <div className="report-divider"></div>
                            <h3>Next Steps</h3>
                            <p className="next-step">
                                → Practice Trees
                            </p>
                            <p className="next-step">
                                → Revise Networking
                            </p>
                            <p className="next-step">
                                → Mock Interviews
                            </p>
                        </div>

                    </div>

                </div>

            </section>
        </>
    );
}

export default HowItWorks;