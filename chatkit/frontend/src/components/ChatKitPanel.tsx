import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { BookOpen, Calendar, Sparkles, Zap } from "lucide-react";
import { FormEvent, useCallback, useState } from "react";
import { CHATKIT_API_DOMAIN_KEY, CHATKIT_API_URL } from "../lib/config";

export function ChatKitPanel() {
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [journey, setJourney] = useState("");
  const [journeyQuestion, setJourneyQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);

  const chatkit = useChatKit({
    api: { url: CHATKIT_API_URL, domainKey: CHATKIT_API_DOMAIN_KEY },
    theme: { colorScheme: "dark" },
    composer: {
      // File uploads are disabled for the demo backend.
      attachments: { enabled: false },
    },
    startScreen: {
      greeting: "Hi, I'm your Giant Coach. How can I help today?",
      prompts: [
        { title: "Reset my plan", text: "Help me reset my focus plan for this week." },
        { title: "New habit", text: "Suggest a new habit to boost my confidence." },
        { title: "Coaching recap", text: "Summarize my last coaching conversation." },
      ],
    },
    onError(event: CustomEvent<{ error: Error }>) {
      const detailError = event.detail?.error;
      const message =
        detailError instanceof Error ? detailError.message : "ChatKit error";
      setError(message);
    },
  });

  const sendToChat = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      try {
        setError(null);
        await chatkit.sendUserMessage({ text: trimmed });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to send message.";
        setError(message);
      }
    },
    [chatkit],
  );

  const handleAppointment = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      if (!appointmentDate || !appointmentTime) {
        setError("Please select a date and time before scheduling.");
        return;
      }

      await sendToChat(
        `I would like to schedule an appointment on ${appointmentDate} at ${appointmentTime}.`,
      );

      setAppointmentDate("");
      setAppointmentTime("");
    },
    [appointmentDate, appointmentTime, sendToChat],
  );

  const handleJourneyQuestion = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      if (!journey) {
        setError("Please select a journey.");
        return;
      }

      if (!journeyQuestion.trim()) {
        setError("Please enter your question.");
        return;
      }

      await sendToChat(`Regarding the ${journey} Journey: ${journeyQuestion.trim()}`);
      setJourneyQuestion("");
    },
    [journey, journeyQuestion, sendToChat],
  );

  return (
    <div className="gc-widget-container">
      <div className="gc-main-row">
        <aside className="gc-marketing-panel" aria-label="Giant Coach quick actions">
          <div className="gc-panel-header">
            <div className="gc-brand">
              <span className="gc-icon-box" aria-hidden="true">
                <Sparkles size={16} />
              </span>
              Giant Coach
            </div>
          </div>

          <div className="gc-tools-scroll">
            <form
              className="gc-feature-block"
              onSubmit={(event) => void handleAppointment(event)}
            >
              <div className="gc-feature-title">
                <div className="gc-icon-box" aria-hidden="true">
                  <Calendar size={16} />
                </div>
                Schedule an appointment
              </div>
              <div className="gc-input-row">
                <input
                  type="date"
                  className="gc-input-date"
                  value={appointmentDate}
                  onChange={(event) => setAppointmentDate(event.target.value)}
                  aria-label="Appointment date"
                />
                <select
                  className="gc-input-select"
                  value={appointmentTime}
                  onChange={(event) => setAppointmentTime(event.target.value)}
                  aria-label="Appointment time"
                >
                  <option value="">Time</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                </select>
                <button type="submit" className="gc-btn-submit">
                  Schedule
                </button>
              </div>
            </form>

            <div className="gc-divider" aria-hidden="true" />

            <form
              className="gc-feature-block"
              onSubmit={(event) => void handleJourneyQuestion(event)}
            >
              <div className="gc-feature-title">
                <div className="gc-icon-box" aria-hidden="true">
                  <BookOpen size={16} />
                </div>
                Ask about a journey
              </div>
              <div className="gc-input-row">
                <select
                  className="gc-input-select"
                  value={journey}
                  onChange={(event) => setJourney(event.target.value)}
                  aria-label="Select journey"
                >
                  <option value="">Select journey...</option>
                  <option value="Awareness">Journey of Awareness</option>
                  <option value="Acceptance">Journey of Acceptance</option>
                  <option value="Empowerment">Journey of Empowerment</option>
                  <option value="Abundance">Journey of Abundance</option>
                </select>
              </div>
              <div className="gc-input-row">
                <textarea
                  className="gc-input-text"
                  placeholder="Type your question..."
                  rows={2}
                  value={journeyQuestion}
                  onChange={(event) => setJourneyQuestion(event.target.value)}
                  aria-label="Journey question"
                />
                <button type="submit" className="gc-btn-submit">
                  Ask
                </button>
              </div>
            </form>
          </div>
        </aside>

        <section className="gc-chat-wrapper">
          <div className="gc-chat-header">
            <span className="gc-icon-box" aria-hidden="true">
              <Zap size={16} />
            </span>
            Live AI Coaching <span aria-hidden="true">· Powered by ChatKit</span>
          </div>

          <ChatKit control={chatkit.control} className="gc-chatkit-frame" />

          {error ? (
            <div className="gc-error" role="alert">
              <strong>Something went wrong</strong>
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)}>
                Dismiss
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
