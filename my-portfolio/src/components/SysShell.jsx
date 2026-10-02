import { useState, useRef, useEffect } from "react";
import projectsData from "../data/projects";
import experienceData from "../data/experience";

export default function SysShell() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([
    {
      type: "system",
      text: "SYS-SHELL v2.4 // TYPE 'help' FOR AVAILABLE COMMANDS",
    },
  ]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [history, isOpen]);

  const handleCommand = (e) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;

    let response = "";
    switch (cmd) {
      case "help":
        response =
          "AVAILABLE COMMANDS:\n- about: Display engineer profile\n- skills: List technical stack\n- projects: View selected works\n- experience: View hardware revision logs\n- contact: Get communication channels\n- clear: Purge terminal history";
        break;
      case "about":
        response =
          "Computer engineer designing low-level firmware and high-performance software systems.";
        break;
      case "skills":
        response =
          "STACK: C / C++, Python, Verilog, Embedded Systems, Linux, React, Git, PCB Design";
        break;
      case "projects":
        response = projectsData
          .map(
            (p) =>
              `[${p.category}] ${p.title} (${p.year}) - ${p.tech.join(", ")}`,
          )
          .join("\n");
        break;
      case "experience":
        response = experienceData
          .map((e) => `${e.rev}: ${e.role} @ ${e.company} (${e.period})`)
          .join("\n");
        break;
      case "contact":
        response =
          "EMAIL: you@example.com\nGITHUB: github.com/your-username\nLINKEDIN: linkedin.com/in/your-username";
        break;
      case "clear":
        setHistory([]);
        setInput("");
        return;
      default:
        response = `Command not recognized: '${cmd}'. Type 'help' for valid directives.`;
    }

    setHistory((prev) => [
      ...prev,
      { type: "user", text: `> ${input}` },
      { type: "output", text: response },
    ]);
    setInput("");
  };

  return (
    <div
      style={{ position: "fixed", bottom: "2rem", left: "2rem", zIndex: 1000 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn"
        style={{
          background: "rgba(10, 10, 12, 0.85)",
          backdropFilter: "blur(8px)",
          borderColor: "var(--ember)",
        }}
      >
        {isOpen ? "Close Terminal [X]" : ">_ Terminal"}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            left: 0,
            width: "min(460px, 90vw)",
            height: "340px",
            background: "rgba(10, 10, 12, 0.95)",
            border: "1px solid var(--line)",
            backdropFilter: "blur(12px)",
            padding: "1.2rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            color: "var(--bone)",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
          }}
        >
          <div
            style={{
              color: "var(--ember)",
              marginBottom: "0.8rem",
              borderBottom: "1px solid var(--line)",
              paddingBottom: "0.4rem",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>// SYS-SHELL INTERACTIVE CONSOLE</span>
            <span
              style={{ cursor: "pointer", color: "var(--muted)" }}
              onClick={() => setHistory([])}
            >
              [CLEAR]
            </span>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "grid",
              gap: "0.6rem",
              marginBottom: "0.8rem",
            }}
          >
            {history.map((item, i) => (
              <div
                key={i}
                style={{
                  whiteSpace: "pre-wrap",
                  color:
                    item.type === "user"
                      ? "var(--bone)"
                      : item.type === "system"
                        ? "var(--ember)"
                        : "#b9b5ad",
                }}
              >
                {item.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleCommand}
            style={{
              display: "flex",
              gap: "0.5rem",
              borderTop: "1px solid var(--line)",
              paddingTop: "0.8rem",
            }}
          >
            <span style={{ color: "var(--ember)" }}>$</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="type a command..."
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--bone)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                flex: 1,
              }}
              autoFocus
            />
          </form>
        </div>
      )}
    </div>
  );
}
