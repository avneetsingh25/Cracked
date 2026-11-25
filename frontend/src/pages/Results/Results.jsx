import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiFetch from "../../utils/api";
import "./Results.css";

function formatIdealAnswerPoint(text) {
    const colonIndex = text.indexOf(":");
    const heading = colonIndex > 0
        ? text.slice(0, colonIndex).replace(/\*/g, "").trim()
        : "";
    const explanation = colonIndex > 0
        ? text.slice(colonIndex + 1).trim()
        : text.trim();

    if (
        heading &&
        !/^\d+$/.test(heading) &&
        heading.length <= 60 &&
        heading.split(/\s+/).length <= 8 &&
        explanation
    ) {
        return { heading, explanation };
    }

    return { heading: "", explanation: text };
}

function renderIdealAnswerText(text) {
    return String(text).split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("*") && part.endsWith("*")) {
            return <strong key={index}>{part.slice(1, -1)}</strong>;
        }
        return part;
    });
}

function formatIdealAnswer(idealAnswer) {
    const text = String(idealAnswer || "").trim();

    if (!text) {
        return [];
    }

    const blocks = [];
    let paragraphLines = [];
    let currentList = null;

    function flushParagraph() {
        if (paragraphLines.length > 0) {
            blocks.push({
                type: "paragraph",
                point: formatIdealAnswerPoint(paragraphLines.join(" "))
            });
            paragraphLines = [];
        }
    }

    function flushList() {
        if (currentList) {
            blocks.push(currentList);
            currentList = null;
        }
    }

    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim();

        if (!line) {
            flushParagraph();
            flushList();
            continue;
        }

        const listMarker = line.match(/^(?:([-•])|(\*+)|(\d+[.)]))\s+(.+)$/);
        if (listMarker) {
            flushParagraph();
            const ordered = Boolean(listMarker[3]);

            if (currentList && currentList.ordered !== ordered) {
                flushList();
            }
            if (!currentList) {
                currentList = { type: "list", ordered, items: [] };
            }
            currentList.items.push(
                formatIdealAnswerPoint(listMarker[4].replace(/\*/g, ""))
            );
        } else if (currentList) {
            const lastItem = currentList.items[currentList.items.length - 1];
            lastItem.explanation = `${lastItem.explanation} ${line.replace(/\*/g, "")}`.trim();
        } else {
            paragraphLines.push(line.replace(/\*/g, ""));
        }
    }

    flushParagraph();
    flushList();
    return blocks;
}

function IdealAnswer({ answer }) {
    const blocks = formatIdealAnswer(answer);
    const content = (point) => (
        <>
            {point.heading && (
                <strong>{renderIdealAnswerText(point.heading)}: </strong>
            )}
            {renderIdealAnswerText(point.explanation)}
        </>
    );

    return (
        <div className="question-result-section ideal-answer-section">
            <div className="ideal-answer-heading">
                <h4>Ideal Answer:</h4>
            </div>
            <div className="ideal-answer-content">
                {blocks.length > 0 ? (
                    blocks.map((block, index) => (
                        block.type === "list" ? (
                            block.ordered ? (
                                <ol key={index}>
                                    {block.items.map((point, itemIndex) => (
                                        <li key={itemIndex}>{content(point)}</li>
                                    ))}
                                </ol>
                            ) : (
                                <ul key={index}>
                                    {block.items.map((point, itemIndex) => (
                                        <li key={itemIndex}>{content(point)}</li>
                                    ))}
                                </ul>
                            )
                        ) : (
                            <p key={index}>{content(block.point)}</p>
                        )
                    ))
                ) : (
                    <p>No ideal answer available.</p>
                )}
            </div>
        </div>
    );
}

function Results() {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        async function getResults() {
            try {
                const response = await apiFetch(
                    `http://localhost:3000/api/result/feedback/${interviewId}`,
                    { method: "GET" }
                );

                const data = await response.json();

                if (response.ok) {
                    setResult(data);
                } else {
                    setError(data.message || "Failed to load results");
                }
            } catch (err) {
                console.log("Get results error:", err);
                setError("Unable to load interview results.");
            } finally {
                setLoading(false);
            }
        }

        getResults();
    }, [interviewId]);

    if (loading) {
        return <p className="results-message">Generating your results...</p>;
    }

    if (error) {
        return (
            <main className="results-page">
                <div className="results-card">
                    <h2>Unable to load results</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate("/dashboard")}>
                        Back to Dashboard
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="results-page">
            <section className="results-card">
                <p className="results-label">INTERVIEW RESULTS</p>
                <h1>🎉 Interview Completed!</h1>
                <p className="results-subtitle">
                    Here is your AI-generated performance report.
                </p>

                <div className="results-score">
                    <span>Average Score</span>
                    <h2>{result.averageScore} <small>/ 10</small></h2>
                    <p>Based on {result.totalQuestions} evaluated questions</p>
                </div>

                <div className="results-section">
                    <h2>Overall Feedback</h2>
                    <p>{result.overallFeedback}</p>
                </div>

                <div className="results-section">
                    <h2>Recommendation</h2>
                    <p>{result.recommendation}</p>
                </div>

                <div className="results-section">
                    <h2>Next Steps</h2>
                    {Array.isArray(result.nextSteps) ? (
                        <ul>
                            {result.nextSteps.map((step, index) => (
                                <li key={index}>{step}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>{result.nextSteps}</p>
                    )}
                </div>

                {/* Question-wise results */}
                {showDetails && (
                    <div className="question-results">
                        <h2>Question-wise Performance</h2>

                        {result.questionResults?.length > 0 ? (
                            result.questionResults.map((item, index) => (
                                <div className="question-result-card" key={index}>
                                    <div className="question-result-header">
                                        <h3>
                                            Question {item.questionNumber ?? index + 1}
                                        </h3>
                                        <span className="question-score">
                                            {item.score ?? 0}/10
                                        </span>
                                    </div>

                                    {item.topic && (
                                        <p className="question-topic">
                                            Topic: {item.topic}
                                        </p>
                                    )}

                                    <div className="question-result-section">
                                        <h4>Question</h4>
                                        <p>{item.questionText || "Question unavailable"}</p>
                                    </div>

                                    <div className="question-result-section">
                                        <h4>Your Answer</h4>
                                        <p>{item.answer || "No answer available"}</p>
                                    </div>

                                    <div className="question-result-section">
                                        <h4>AI Feedback</h4>
                                        {Array.isArray(item.feedback) ? (
                                            <ul>
                                                {item.feedback.map((point, i) => (
                                                    <li key={i}>{point}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>{item.feedback || "No feedback available"}</p>
                                        )}
                                    </div>

                                    <div className="question-result-section">
                                        <h4>Strengths</h4>
                                        {item.strengths?.length > 0 ? (
                                            <ul>
                                                {item.strengths.map((point, i) => (
                                                    <li key={i}>{point}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>No strengths listed.</p>
                                        )}
                                    </div>

                                    <div className="question-result-section">
                                        <h4>Areas to Improve</h4>
                                        {item.improvements?.length > 0 ? (
                                            <ul>
                                                {item.improvements.map((point, i) => (
                                                    <li key={i}>{point}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>No improvements listed.</p>
                                        )}
                                    </div>

                                    <IdealAnswer answer={item.idealAnswer} />
                                </div>
                            ))
                        ) : (
                            <p>Question-wise results are not available.</p>
                        )}
                    </div>
                )}
                <button
                    className="results-toggle-btn"
                    onClick={() => setShowDetails(!showDetails)}
                >
                    {showDetails
                        ? "Hide Detailed Results ↑"
                        : "Explore Your Answers & Feedback →"}
                </button>
                <button
                    className="results-dashboard-btn"
                    onClick={() => navigate("/dashboard")}
                >
                    Back to Dashboard →
                </button>
            </section>
        </main>
    );

}

export default Results;
