import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";

export default function PatientPage() {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [manualInput, setManualInput] = useState("");
    const [showChat, setShowChat] = useState(true);
    const [chats, setChats] = useState([]);
    const [patientDetails, setPatientDetails] = useState([]);
    const [showPatientInfo, setShowPatientInfo] = useState(false);

    const { isAuthenticated, details, role } = useSelector((state) => state.auth);
    const recognitionRef = useRef(null);
    function getSafeMarkdown(text) {
        if (!text || typeof text !== "string") return "**Bot:** ...";

        // Replace double asterisks with valid Markdown bold formatting
        let safeText = text
            .replace(/\r?\n/g, "  \n")              // newline fix for markdown
            .replace(/\*\*(?![\w\s])/g, "")         // remove malformed bold openers
            .replace(/(?<![\w\s])\*\*/g, "")        // remove malformed bold closers
            .replace(/\*/g, "\\*")                  // escape any remaining rogue asterisks

        return `**Bot:** ${safeText}`;
    }


    const startRecording = () => {
        try {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onresult = (event) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                handleAnalysis(text);
            };

            recognition.start();
            setIsRecording(true);
            recognitionRef.current = recognition;

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setIsRecording(false);
            };
        } catch (err) {
            console.error("Speech recognition not supported", err);
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleAnalysis = async (text) => {
        try {
            // Add temporary loading state
            const loadingId = Date.now();
            setChats((prevChats) => [
                ...prevChats,
                {
                    id: loadingId,
                    user: text,
                    bot: null,
                    critical: null,
                    loading: true,
                },
            ]);

            const classificationRes = await fetch("http://127.0.0.1:5000/api/patient/classify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });
            console.log(classificationRes);
            if (!classificationRes.ok) throw new Error("Classification API failed");

            const chatRes = await fetch("http://127.0.0.1:5000/api/patient/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            if (!chatRes.ok) throw new Error("Chat API failed");

            const classification = await classificationRes.json();
            const chatResponse = await chatRes.json();

            const botMessage = chatResponse.response;
            const firstWord = botMessage.trim().split(" ")[0].toLowerCase();
            const type = firstWord === "critical" ? "critical" : "non-critical";

            // Update the chat with actual response
            setChats((prevChats) =>
                prevChats.map((chat) =>
                    chat.id === loadingId
                        ? {
                            ...chat,
                            bot: botMessage,
                            critical: classification.critical,
                            loading: false,
                        }
                        : chat
                )
            );

            const newPatientDetail = {
                statement: text,
                type,
            };
            setPatientDetails((prev) => [...prev, newPatientDetail]);

            setShowChat(true);
        } catch (err) {
            console.error("API Error:", err);

            setChats((prevChats) =>
                prevChats.map((chat) =>
                    chat.loading
                        ? {
                            ...chat,
                            bot: `Error: ${err.message}`,
                            critical: false,
                            loading: false,
                        }
                        : chat
                )
            );

            setShowChat(true);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            {/* Your Info Button */}
            <button
                onClick={() => setShowPatientInfo(!showPatientInfo)}
                className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition z-50"
            >
                Your Info
            </button>

            {/* Patient Info Box */}
            {showPatientInfo && details && (
                <div className="absolute top-20 left-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50">
                    <h2 className="text-lg font-semibold mb-2">Patient Info</h2>
                    <p><strong>Name:</strong> {details.data.name}</p>
                    <p><strong>Latitude:</strong> {details.data.latitude}</p>
                    <p><strong>Longitude:</strong> {details.data.longitude}</p>
                    <p><strong>BloodGroup:</strong> {details.data.bloodGroup}</p>

                    <button
                        onClick={() => setShowPatientInfo(false)}
                        className="mt-3 text-sm text-red-500 hover:underline"
                    >
                        Close
                    </button>
                </div>
            )}

            {/* Emergency Button & Stop Recording */}
            <div className="flex gap-4">
                <button
                    onClick={startRecording}
                    disabled={isRecording}
                    className={`${isRecording ? "bg-red-600" : "bg-red-500"
                        } text-white rounded-full p-6 text-lg font-bold 
          hover:bg-red-600 transition-all duration-300 w-40 h-40 
          flex items-center justify-center shadow-xl hover:shadow-2xl`}
                >
                    {isRecording ? "Recording..." : "EMERGENCY"}
                </button>

                {isRecording && (
                    <button
                        onClick={stopRecording}
                        className="bg-gray-700 text-white rounded-full p-4 text-lg 
            font-bold hover:bg-gray-800 transition-all duration-300 
            w-40 h-40 flex items-center justify-center shadow-xl hover:shadow-2xl"
                    >
                        STOP
                    </button>
                )}
            </div>

            {/* Text Input Box */}
            <div className="mt-6 w-full max-w-lg">
                <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Type your condition here..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={() => {
                        handleAnalysis(manualInput);
                        setManualInput("");
                    }}
                    className="mt-2 w-full bg-blue-500 text-white font-bold py-2 rounded-md hover:bg-blue-600 transition"
                >
                    Send
                </button>
            </div>

            {/* Chatbot Window */}
            {showChat && (
                <div className="fixed bottom-4 right-4 w-[500px] max-h-[600px] bg-white border border-gray-300 shadow-lg rounded-lg overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-200">
                        <h2 className="text-lg font-semibold">Chat with Assistant</h2>
                        <button onClick={() => setShowChat(false)} className="text-gray-600">✖</button>
                    </div>
                    <div className="p-4 max-h-[520px] overflow-y-auto space-y-4">
                        {chats.map((chat, index) => (
                            <div key={index}>
                                <p className="text-gray-800 font-semibold">Patient: {chat.user}</p>
                                <div
                                    className={`mt-1 p-3 rounded-lg ${chat.critical === true
                                        ? "bg-red-100 border border-red-300"
                                        : chat.critical === false
                                            ? "bg-green-100 border border-green-300"
                                            : "bg-gray-100 border border-gray-300"
                                        }`}
                                >
                                    {chat.loading ? (
                                        <div className="w-full h-2 bg-gray-200 rounded overflow-hidden relative">
                                            <div className="absolute top-0 left-0 h-full w-1/4 bg-blue-500 animate-loading-bar" />
                                        </div>
                                    ) : (
                                        <>
                                            <p className="font-semibold">
                                                {chat.critical
                                                    ? "CRITICAL - Dispatching ambulance!"
                                                    : "Non-critical assistance"}
                                            </p>

                                            <div className="mt-1 prose prose-sm max-w-full">
                                                <ReactMarkdown>
                                                    {`**Bot:** ${chat.bot || " "}`}
                                                </ReactMarkdown>
                                            </div>



                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Loading bar animation style */}
            <style>
                {`
    @keyframes loading-bar {
      0% { left: -25%; }
      50% { left: 50%; }
      100% { left: 100%; }
    }
    .animate-loading-bar {
      animation: loading-bar 1.5s ease-in-out infinite;
    }
  `}
            </style>

        </div>
    );
}
