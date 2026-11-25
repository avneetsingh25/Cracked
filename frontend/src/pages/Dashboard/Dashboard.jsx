import "./Dashboard.css";
import CreateInterview from "./CreateInterview";
import Navbar from "../../components/Navbar/Navbar";
import { useEffect, useState } from "react";
import apiFetch from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, CircleCheck, Clock3, Sparkles } from "lucide-react";

function Dashboard() {

    const [user, setUser] = useState(null);
    const [showCreateInterview, setShowCreateInterview] = useState(false);
    const [interviews, setInterviews] = useState([]);
    const [interviewRefreshKey, setInterviewRefreshKey] = useState(0);
    const [startingInterviewId, setStartingInterviewId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const getUser = async () => {

            try {
                const response = await apiFetch(
                    "http://localhost:3000/api/auth/get-me",
                    { method: "GET" }
                );
                const data = await response.json();
                console.log("Logged in user:", data);

                if (response.ok) {
                    setUser(data.user);
                }
            } catch (error) {
                console.log("Get user error:", error);
            }
        };

        getUser();

    }, []);

    useEffect(() => {
        const getInterviews = async () => {
            try {
                const response = await apiFetch(
                    "http://localhost:3000/api/interview/getAll",
                    { method: "GET" }
                );

                const data = await response.json();
                console.log("My Interviews:", data);

                if (response.ok) {
                    setInterviews(data.interviews || []);
                }
            } catch (error) {
                console.log("Fetch interviews error:", error);
            }
        };

        getInterviews();
    }, [interviewRefreshKey]);


    const handleStartInterview = async (interviewId) => {
        if (startingInterviewId) {
            return;
        }

        setStartingInterviewId(interviewId);
        try {
            const response = await apiFetch(
                `http://localhost:3000/api/question/generate/${interviewId}`,
                { method: "POST" }
            );

            const data = await response.json();
            console.log("Generated Questions:", data);

            if (response.ok) {
                navigate(`/interview/${interviewId}`);
            } else {
                alert(data.message || "Failed to generate questions");
            }
        } catch (error) {
            console.log("Start interview error:", error);
            alert("Something went wrong while starting interview");
        } finally {
            setStartingInterviewId(null);
        }
    };


    return (
        <>
            <Navbar />
            <main className="dashboard-page">

                <div className="dashboard-container">

                    <div className="dashboard-welcome">
                        <div>
                            <p className="dashboard-label">
                                DASHBOARD
                            </p>
                            <h1>
                                Welcome back, {user?.username || "User"} 👋
                            </h1>
                            <p>
                                Ready to crack your next interview?
                            </p>
                        </div>

                        <button
                            className="start-interview-btn"
                            onClick={() => setShowCreateInterview(true)}
                        >
                            + Start New Interview
                        </button>
                    </div>


                    <div className="dashboard-stats">
                        <div className="stat-card">
                            <div className="stat-icon stat-icon-blue"><BriefcaseBusiness size={19} /></div>
                            <span className="stat-label">Interviews</span>
                            <h2>{interviews.length}</h2>
                            <p>Total interviews</p>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon stat-icon-green"><CircleCheck size={19} /></div>
                            <span className="stat-label">Completed</span>
                            <h2>
                                {interviews.filter((item) => item.status === "completed").length}
                            </h2>
                            <p>Interviews completed</p>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon stat-icon-violet"><Sparkles size={19} /></div>
                            <span className="stat-label">Average Score</span>
                            <h2>--</h2>
                            <p>Across completed interviews</p>
                        </div>

                    </div>


                    <div className="dashboard-section">

                        <div className="section-header">
                            <div>
                                <h2>Recent Interviews</h2>
                                <p>Your latest interview attempts</p>
                            </div>
                            {interviews.length > 0 && (
                                <span className="interview-count">
                                    {interviews.length} {interviews.length === 1 ? "interview" : "interviews"}
                                </span>
                            )}
                        </div>

                        
                    {interviews.length === 0 ? (
                        <div className="empty-interviews">
                            <div className="empty-icon"><Sparkles size={25} /></div>
                            <h3>No interviews yet</h3>
                            <p>
                                Start your first AI-powered interview
                                and see your performance here.
                            </p>
                            <button
                                className="start-empty-btn"
                                onClick={() => setShowCreateInterview(true)}
                            >
                                Start Your First Interview
                            </button>
                        </div>
                    ) : (
                        <div className="interviews-list">
                            {interviews.map((item) => (
                                <div className="interview-card" key={item._id}>
                                    <div className="interview-card-top">
                                        <div className="interview-card-icon"><BriefcaseBusiness size={20} /></div>
                                        <span className={`interview-status status-${item.status}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <h3>{item.title}</h3>
                                    <p className="interview-role">{item.role}</p>
                                    <div className="interview-meta">
                                        <span>{item.interviewType}</span>
                                        <span>{item.difficulty}</span>
                                        <span><Clock3 size={14} /> {item.duration} min</span>
                                    </div>
                                    {item.status === "completed" ? (
                                        <button
                                            className="start-card-btn secondary-card-btn"
                                            onClick={() => navigate(`/results/${item._id}`)}
                                        >
                                            View feedback <ArrowRight size={16} />
                                        </button>
                                    ) : (
                                        <button
                                            className="start-card-btn"
                                            onClick={() => handleStartInterview(item._id)}
                                            disabled={Boolean(startingInterviewId)}
                                        >
                                            {startingInterviewId === item._id
                                                ? "Opening interview..."
                                                : item.status === "ongoing"
                                                    ? "Continue interview"
                                                    : "Start interview"}
                                            <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}


                    </div>

                </div>

            </main>

            {showCreateInterview && (
                <CreateInterview
                    onClose={() => setShowCreateInterview(false)}
                    onCreated={() => setInterviewRefreshKey((key) => key + 1)}
                />
            )}
        </>
    );
}

export default Dashboard;