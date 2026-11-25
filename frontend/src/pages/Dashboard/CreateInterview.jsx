import { useState } from "react";
import "./CreateInterview.css";
import apiFetch from "../../utils/api";

function CreateInterview({ onClose, onCreated }) {
    const [formData, setFormData] = useState({
        title: "",
        role: "",
        experienceLevel: "Fresher",
        interviewType: "Technical",
        difficulty: "Easy",
        duration: 15
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await apiFetch(
                "http://localhost:3000/api/interview/create",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                }
            );
            const data = await response.json();
            console.log("Create Interview Response:", data);
            if (response.ok) {
                alert("Interview created successfully!");
                onClose();
                onCreated(); 
            } else {
                alert(data.message || "Failed to create interview");
            }
        } catch (error) {
            console.log("Create interview error:", error);
            alert("Something went wrong");
        }
    };

    return (
        <div className="create-interview-overlay">
            <div className="create-interview-card">

                <div className="create-interview-header">
                    <div>
                        <p className="create-label">NEW INTERVIEW</p>
                        <h2>Create Interview</h2>
                        <p>
                            Set up your AI-powered mock interview.
                        </p>
                    </div>

                    <button
                        className="close-btn"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Interview Title</label>
                        <input
                            type="text"
                            name="title"
                            placeholder="e.g. Frontend Developer Interview"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Job Role</label>
                        <input
                            type="text"
                            name="role"
                            placeholder="e.g. Software Developer"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">

                        <div className="form-group">
                            <label>Experience Level</label>

                            <select
                                name="experienceLevel"
                                value={formData.experienceLevel}
                                onChange={handleChange}
                            >
                                <option value="Fresher">Fresher</option>
                                <option value="1-2 Years">1-2 Years</option>
                                <option value="3-5 Years">3-5 Years</option>
                                <option value="5+ Years">5+ Years</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Interview Type</label>

                            <select
                                name="interviewType"
                                value={formData.interviewType}
                                onChange={handleChange}
                            >
                                <option value="Technical">Technical</option>
                                <option value="HR">HR</option>
                                <option value="Mixed">Mixed</option>
                            </select>
                        </div>

                    </div>

                    <div className="form-row">

                        <div className="form-group">
                            <label>Difficulty</label>

                            <select
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleChange}
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Duration</label>

                            <select
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                            >
                                <option value={15}>15 minutes</option>
                                <option value={30}>30 minutes</option>
                                <option value={45}>45 minutes</option>
                                <option value={60}>60 minutes</option>
                            </select>
                        </div>

                    </div>

                    <div className="create-interview-actions">

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="create-btn"
                        >
                            Create Interview
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
}

export default CreateInterview;