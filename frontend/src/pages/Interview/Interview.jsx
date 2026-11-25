
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate} from "react-router-dom";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import apiFetch from "../../utils/api";
import "./Interview.css";

function Interview() {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [deadline, setDeadline] = useState(null);
    const [remainingSeconds, setRemainingSeconds] = useState(null);
    const [timeoutError, setTimeoutError] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceError, setVoiceError] = useState("");
    const submissionInProgressRef = useRef(false);
    const timeoutSubmissionStartedRef = useRef(false);
    const currentAnswerRef = useRef("");
    const speechBaseTextRef = useRef("");
    const recognitionRef = useRef(null);

    useEffect(() => {
        async function getQuestions() {
            try {
                const response = await apiFetch(
                    `http://localhost:3000/api/question/get/${interviewId}`,
                    { method: "GET" }
                );

                const data = await response.json();

                if (!response.ok) {
                    alert(data.message || "Failed to load questions");
                    return;
                }

                const questionList = data.questions || [];
                setQuestions(questionList);

                if (data.status === "completed") {
                    setCompleted(true);
                    return;
                }
                if (!Number.isFinite(data.duration) || data.duration <= 0) {
                    alert("Unable to start the interview timer. Please try again.");
                    return;
                }

                const answerResponse = await apiFetch(
                    `http://localhost:3000/api/answer/get/${interviewId}`,
                    { method: "GET" }
                );

                let savedAnswers = [];

                if (answerResponse.ok) {
                    const answerData = await answerResponse.json();

                    savedAnswers = (answerData.answers || [])
                        .filter(item => item.question)
                        .map(item => ({
                            questionId: item.question._id,
                            answer: item.answer
                        }));
                } else if (answerResponse.status !== 404) {
                    alert("Failed to load saved answers");
                    return;
                }
                setAnswers(savedAnswers);
                const savedIndex = localStorage.getItem(
                    `interview-${interviewId}-currentIndex`
                );

                const resumeIndex = savedIndex === null
                    ? 0
                    : Math.min(
                        Math.max(Number(savedIndex) || 0, 0),
                        questionList.length - 1
                    );

                setCurrentIndex(resumeIndex);
                setCurrentAnswer("");
                currentAnswerRef.current = "";

                if (questionList.length > 0) {
                    const deadlineKey = `interview-${interviewId}-deadline`;
                    let savedDeadline = Number(localStorage.getItem(deadlineKey));

                    if (!Number.isFinite(savedDeadline) || savedDeadline <= 0) {
                        savedDeadline = Date.now() + data.duration * 60 * 1000;
                        localStorage.setItem(deadlineKey, String(savedDeadline));
                    }

                    setDeadline(savedDeadline);
                }
                
            } catch (error) {
                console.log("Get questions error:", error);
                alert("Unable to load interview data");
            } finally {
                setLoading(false);
            }
        }

        getQuestions();
    }, [interviewId]);

    useEffect(() => {
        if (!deadline || completed) {
            return undefined;
        }

        function updateRemainingTime() {
            setRemainingSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
        }

        updateRemainingTime();
        const timerId = window.setInterval(updateRemainingTime, 1000);
        return () => window.clearInterval(timerId);
    }, [deadline, completed]);

    useEffect(() => () => {
        const recognition = recognitionRef.current;
        recognitionRef.current = null;
        if (recognition) {
            recognition.onresult = null;
            recognition.onerror = null;
            recognition.onend = null;
            recognition.stop();
        }
        window.speechSynthesis?.cancel();
    }, []);

    const speechRecognitionSupported = typeof window !== "undefined" && Boolean(
        window.SpeechRecognition || window.webkitSpeechRecognition
    );

    function stopVoiceInput() {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsRecording(false);
    }

    function startVoiceInput() {
        if (recognitionRef.current) {
            return;
        }

        if (!window.isSecureContext) {
            setVoiceError("Voice input requires localhost or a secure HTTPS connection.");
            return;
        }

        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!Recognition) {
            setVoiceError("Voice input is not supported in this browser. Try Chrome or Edge.");
            return;
        }

        const recognition = new Recognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = navigator.language || "en-US";
        speechBaseTextRef.current = currentAnswerRef.current.trim();

        recognition.onstart = () => {
            setIsRecording(true);
            setVoiceError("");
        };
        recognition.onresult = (event) => {
            const spokenText = Array.from(event.results)
                .map((result) => result[0].transcript.trim())
                .filter(Boolean)
                .join(" ");
            const updatedAnswer = [
                speechBaseTextRef.current,
                spokenText
            ].filter(Boolean).join(" ");
            currentAnswerRef.current = updatedAnswer;
            setCurrentAnswer(updatedAnswer);
        };
        recognition.onerror = (event) => {
            const errorMessages = {
                "not-allowed": "Allow microphone access in your browser to use voice input.",
                "audio-capture": "No microphone was detected. Connect a microphone and try again.",
                "no-speech": "No speech was detected. Try speaking a little closer to your microphone.",
                network: "The browser could not reach its speech recognition service. Check your internet connection and try again.",
                "service-not-allowed": "The browser or network is blocking speech recognition. Check microphone permission and try Chrome or Edge.",
                "language-not-supported": "Speech recognition does not support your browser's current language setting.",
                aborted: "Voice input was interrupted. Start recording again."
            };
            setVoiceError(
                errorMessages[event.error] ||
                `Voice input stopped (${event.error || "unknown browser error"}). Check microphone permission and try again.`
            );
            setIsRecording(false);
            recognitionRef.current = null;
        };
        recognition.onend = () => {
            if (recognitionRef.current === recognition) {
                recognitionRef.current = null;
                setIsRecording(false);
            }
        };

        recognitionRef.current = recognition;
        try {
            recognition.start();
        } catch (error) {
            recognitionRef.current = null;
            setIsRecording(false);
            setVoiceError(error.message || "Unable to start voice input.");
        }
    }

    function speakQuestion() {
        if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
            setVoiceError("Question audio is not supported in this browser.");
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new window.SpeechSynthesisUtterance(
            questions[currentIndex].questionText
        );
        utterance.lang = navigator.language || "en-US";
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => {
            setIsSpeaking(false);
            setVoiceError("Unable to play the question aloud.");
        };
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        setVoiceError("");
    }

    function stopSpeaking() {
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
    }

    async function handleNext() {
        if (isRecording) {
            alert("Stop voice recording before continuing.");
            return;
        }

        if (!currentAnswer.trim()) {
            alert("Please enter your answer first");
            return;
        }

        const currentQuestion = questions[currentIndex];

        setSubmitting(true);

        try {
            const saveResponse = await apiFetch(
                "http://localhost:3000/api/answer/save",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        interviewId,
                        questionId: currentQuestion._id,
                        answer: currentAnswer.trim()
                    })
                }
            );

            const saveData = await saveResponse.json();

            if (!saveResponse.ok) {
                alert(saveData.message || "Failed to save answer");
                return;
            }

            const updatedAnswers = [
                ...answers.filter(
                    item => item.questionId !== currentQuestion._id
                ),
                {
                    questionId: currentQuestion._id,
                    answer: currentAnswer.trim()
                }
            ];

            setAnswers(updatedAnswers);

            if (currentIndex < questions.length - 1) {
                localStorage.setItem(
                    `interview-${interviewId}-currentIndex`,
                    String(currentIndex + 1)
                );

                setCurrentIndex(currentIndex + 1);
                setCurrentAnswer("");
                currentAnswerRef.current = "";
                setShowHint(false);
                stopSpeaking();
            } else {
                await handleSubmit(updatedAnswers);
            }
        } catch (error) {
            console.log("Save answer error:", error);
            alert("Unable to save answer. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    const handleSubmit = useCallback(async (finalAnswers, timedOut = false) => {
        if (submissionInProgressRef.current) {
            return;
        }

        submissionInProgressRef.current = true;
        try {
            const response = await apiFetch(
                "http://localhost:3000/api/answer/submit",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        interviewId,
                        answers: finalAnswers,
                        timedOut
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setCompleted(true);
                localStorage.removeItem(`interview-${interviewId}-deadline`);
                localStorage.removeItem(`interview-${interviewId}-currentIndex`);
                navigate(`/results/${interviewId}`);
                return true;
            } else {
                alert(data.message || "Failed to submit interview");
            }
        } catch (error) {
            console.log("Submit interview error:", error);
            alert("Something went wrong while submitting");
        } finally {
            submissionInProgressRef.current = false;
        }
        return false;
    }, [interviewId, navigate]);

    const handleTimeout = useCallback(async () => {
        if (submitting || submissionInProgressRef.current || timeoutSubmissionStartedRef.current) {
            return;
        }

        timeoutSubmissionStartedRef.current = true;
        setSubmitting(true);
        setTimeoutError("");
        stopVoiceInput();
        stopSpeaking();

        try {
            let finalAnswers = answers;
            const latestAnswer = currentAnswerRef.current.trim();

            if (latestAnswer) {
                const currentQuestion = questions[currentIndex];
                const saveResponse = await apiFetch(
                    "http://localhost:3000/api/answer/save",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            interviewId,
                            questionId: currentQuestion._id,
                            answer: latestAnswer
                        })
                    }
                );
                const saveData = await saveResponse.json();

                if (!saveResponse.ok) {
                    throw new Error(saveData.message || "Failed to save your latest answer");
                }

                finalAnswers = [
                    ...answers.filter(item => item.questionId !== currentQuestion._id),
                    {
                        questionId: currentQuestion._id,
                        answer: latestAnswer
                    }
                ];
                setAnswers(finalAnswers);
            }

            const didSubmit = await handleSubmit(finalAnswers, true);
            if (!didSubmit) {
                setTimeoutError("Please retry to save your interview results.");
                timeoutSubmissionStartedRef.current = false;
            }
        } catch (error) {
            console.log("Timeout submission error:", error);
            setTimeoutError(error.message || "Unable to save your interview.");
            timeoutSubmissionStartedRef.current = false;
        } finally {
            setSubmitting(false);
        }
    }, [answers, currentIndex, interviewId, questions, submitting, handleSubmit]);

    useEffect(() => {
        if (remainingSeconds !== 0 || loading || completed) {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            handleTimeout();
        }, 0);
        return () => window.clearTimeout(timeoutId);
    }, [remainingSeconds, loading, completed, submitting, handleTimeout]);

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remaining = seconds % 60;
        return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
    }

    if (loading) {
        return <p className="interview-message">Loading questions...</p>;
    }

    if (completed) {
        return (
            <main className="interview-page">
                <section className="interview-box completion-box">
                    <h1>🎉 Interview Completed!</h1>
                    <p>Your answers have been submitted successfully.</p>
                    <p>You cannot attempt this interview again.</p>
                    <button onClick={() => window.location.href = "/dashboard"}>
                        Back to Dashboard
                    </button>
                </section>
            </main>
        );
    }

    if (questions.length === 0) {
        return <p className="interview-message">No questions found.</p>;
    }

    const currentQuestion = questions[currentIndex];

    return (
        <main className="interview-page">
            <section className="interview-box">
                <div className="interview-heading">
                    <p className="interview-label">AI INTERVIEW</p>
                    {remainingSeconds !== null && (
                        <p
                            className={`interview-timer${remainingSeconds <= 60 ? " interview-timer-warning" : ""}`}
                            role="timer"
                            aria-label={`Time remaining: ${formatTime(remainingSeconds)}`}
                        >
                            Time remaining: {formatTime(remainingSeconds)}
                        </p>
                    )}
                </div>
                <h1>Question {currentIndex + 1} of {questions.length}</h1>

                <div className="interview-progress-bar">
                    <div
                        style={{
                            width: `${((currentIndex + 1) / questions.length) * 100}%`
                        }}
                    />
                </div>

                <p className="interview-topic">{currentQuestion.topic}</p>
                <div className="interview-question-prompt">
                    <h2>{currentQuestion.questionText}</h2>
                    <button
                        type="button"
                        className="interview-audio-btn"
                        onClick={isSpeaking ? stopSpeaking : speakQuestion}
                        disabled={submitting || remainingSeconds === 0}
                        aria-label={isSpeaking ? "Stop question audio" : "Read question aloud"}
                    >
                        {isSpeaking ? <VolumeX size={17} /> : <Volume2 size={17} />}
                        {isSpeaking ? "Stop audio" : "Read aloud"}
                    </button>
                </div>

                <div className="voice-answer-controls">
                    <div className="voice-answer-copy">
                        <strong>Answer by voice</strong>
                        <p>Your speech will appear below as editable text.</p>
                    </div>
                    {speechRecognitionSupported ? (
                        <button
                            type="button"
                            className={`voice-input-btn${isRecording ? " voice-input-active" : ""}`}
                            onClick={isRecording ? stopVoiceInput : startVoiceInput}
                            disabled={submitting || remainingSeconds === 0}
                        >
                            {isRecording ? <MicOff size={17} /> : <Mic size={17} />}
                            {isRecording ? "Stop recording" : "Start recording"}
                        </button>
                    ) : (
                        <p className="voice-support-message">
                            Voice input works in supported browsers such as Chrome and Edge.
                        </p>
                    )}
                </div>

                {isRecording && (
                    <p className="voice-recording-status" role="status">
                        Listening. Speak naturally, then stop recording to review your transcript.
                    </p>
                )}
                {voiceError && (
                    <p className="voice-error-message" role="alert">{voiceError}</p>
                )}

                <textarea
                    value={currentAnswer}
                    onChange={(event) => {
                        currentAnswerRef.current = event.target.value;
                        setCurrentAnswer(event.target.value);
                    }}
                    placeholder="Speak or write your answer here..."
                    rows={7}
                    disabled={submitting || remainingSeconds === 0 || isRecording}
                />

                {timeoutError && (
                    <div className="interview-timeout-error" role="alert">
                        <p>Time is up, but your interview could not be submitted: {timeoutError}</p>
                        <button type="button" onClick={handleTimeout} disabled={submitting}>
                            Retry submission
                        </button>
                    </div>
                )}

                <button
                    onClick={handleNext}
                    disabled={submitting || remainingSeconds === 0 || isRecording}
                >
                    {submitting
                        ? "Submitting..."
                        : currentIndex === questions.length - 1
                            ? "Submit Interview"
                            : "Next Question →"}
                </button>

                {currentQuestion.hint && (
                    <div className="interview-hint-section">
                        <button
                            type="button"
                            className="hint-toggle-btn"
                            onClick={() => setShowHint(!showHint)}
                        >
                            {showHint ? "Hide Hint ▲" : "💡 Show Hint"}
                        </button>

                        {showHint && (
                            <p className="interview-hint">
                                {currentQuestion.hint}
                            </p>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}

export default Interview;
