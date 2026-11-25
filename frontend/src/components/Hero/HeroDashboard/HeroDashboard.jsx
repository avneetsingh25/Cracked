import "./HeroDashboard.css";

function HeroDashboard() {
    return (
        <div className="dashboard">


            <div className="sidebar">
                <h2>Cracked</h2>
                <ul>
                    <li className="active">
                        Dashboard
                    </li>
                    <li>
                        Interviews
                    </li>
                    <li>
                        History
                    </li>
                    <li>
                        Analytics
                    </li>
                    <li>
                        Profile
                    </li>
                </ul>
            </div>

            <div className="dashboard-main">
                <div className="dashboard-top">
                    <div className="dashboard-content">
                        <div className="question-header">
                            <div>
                                <p>Technical Interview</p>
                                <h3>Question 3 of 10</h3>
                            </div>
                            <span className="difficulty">Medium</span>
                        </div>

                        <div className="question-card">
                            <p className="question-label">Question</p>
                            <h3>Explain the difference between JWT and Sessions.</h3>
                            <textarea placeholder="Type your answer here..."></textarea>
                            <button className="submit-answer">
                                Submit Answer →
                            </button>
                        </div>
                    </div>

                    <div className="score-card">
                        <p>Overall Score</p>
                        <div className="score-circle">
                            <span>8.7</span>
                            <small>/10</small>
                        </div>
                        <h4>Great Performance! 🚀</h4>
                        <div className="score-details">
                            <div>
                                <span>Completed</span>
                                <strong>7 / 10</strong>
                            </div>
                            <div>
                                <span>Time Taken</span>
                                <strong>25:30</strong>
                            </div>
                            <div>
                                <span>Accuracy</span>
                                <strong>85%</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="evaluation-card">
                    <div className="evaluation-title">
                        <h3>
                            AI Evaluation (Your Last Answer)
                        </h3>
                    </div>
                    <div className="evaluation-content">
                        <div className="evaluation-box score-box">
                            <span>Score</span>
                            <strong>8 / 10</strong>
                        </div>
                        <div className="evaluation-box strengths-box">
                            <span>Strengths</span>
                            <p>
                                <span className="evaluation-icon success-icon">✓</span>
                                Good understanding of concepts
                            </p>
                        </div>
                        <div className="evaluation-box improvements-box">
                            <span>Improvements</span>
                            <p>
                                <span className="evaluation-icon improvement-icon">●</span>
                                Add more examples for clarity
                            </p>
                        </div>
                        <div className="evaluation-box ideal-answer-box">
                            <span>Ideal Answer</span>
                            <button>
                                View Ideal Answer
                                <strong>→</strong>
                            </button>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}

export default HeroDashboard;