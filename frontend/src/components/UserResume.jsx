import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import "../ui/dashboard.css";

function UserResume() {
  const userId = Number(localStorage.getItem("userId"));
  const userName = localStorage.getItem("userName") || "Applicant";
  const userEmail = localStorage.getItem("userEmail") || "";

  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState(0);
  const [builder, setBuilder] = useState({
    title: "Software Developer",
    phone: "",
    address: "",
    summary: "",
    education: "",
    internships: "",
    projects: "",
    certifications: "",
    achievements: "",
    languages: "",
    strengths: "",
    hobbies: "",
    github: "",
    linkedin: "",
  });

  useEffect(() => {
    if (!userId) return;

    api
      .get(`/api/resume/user/${userId}`)
      .then((res) => {
        const resume = res.data || null;
        if (resume) {
          setSkills(resume.skills || "");
          setExperience(Number(resume.experience || 0));
        }
      })
      .catch(() => {});

    api
      .get(`/api/users/profile/${userId}`)
      .then((res) => {
        const profile = res.data || {};
        setBuilder((prev) => ({
          ...prev,
          phone: profile.phone || "",
          address: profile.address || "",
          github: profile.github_url || "",
          linkedin: profile.linkedin_url || "",
        }));
      })
      .catch(() => {});
  }, [userId]);

  const handleBuilderChange = (event) => {
    const { name, value } = event.target;
    setBuilder((prev) => ({ ...prev, [name]: value }));
  };

  const getSkillList = () =>
    String(skills || "")
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

  const getBulletList = (value) =>
    String(value || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

  const getFlexibleList = (value) =>
    String(value || "")
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const renderBulletListHtml = (items, fallback) => {
    if (!items.length) return `<li>${escapeHtml(fallback)}</li>`;
    return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  };

  const buildResumeHtml = () => {
    const skillItems = getSkillList();
    const educationItems = getBulletList(builder.education);
    const internshipItems = getBulletList(builder.internships);
    const projectItems = getBulletList(builder.projects);
    const certificationItems = getBulletList(builder.certifications);
    const achievementItems = getBulletList(builder.achievements);
    const languageItems = getFlexibleList(builder.languages);
    const strengthItems = getBulletList(builder.strengths);
    const hobbyItems = getBulletList(builder.hobbies);

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(userName)} Resume</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 34px; color: #0f172a; line-height: 1.55; }
    h1 { margin: 0 0 4px; font-size: 30px; }
    h2 { margin: 24px 0 10px; font-size: 17px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; letter-spacing: 0.3px; }
    p, li { font-size: 14px; }
    ul { padding-left: 20px; margin: 0; }
    .muted { color: #475569; }
    .contact { margin-top: 8px; }
    .contact a { color: #1d4ed8; text-decoration: none; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(userName)}</h1>
  <p class="muted">${escapeHtml(builder.title)}</p>
  <p class="contact">
    ${escapeHtml(userEmail)}
    ${builder.phone ? ` | ${escapeHtml(builder.phone)}` : ""}
    ${builder.address ? ` | ${escapeHtml(builder.address)}` : ""}
  </p>
  <p class="contact">
    ${builder.github ? `GitHub: <a href="${escapeHtml(builder.github)}">${escapeHtml(builder.github)}</a>` : ""}
    ${builder.github && builder.linkedin ? " | " : ""}
    ${builder.linkedin ? `LinkedIn: <a href="${escapeHtml(builder.linkedin)}">${escapeHtml(builder.linkedin)}</a>` : ""}
  </p>
  <h2>Professional Summary</h2>
  <p>${escapeHtml(builder.summary || "Add your professional summary here.")}</p>
  <div class="two-col">
    <div>
      <h2>Skills</h2>
      <ul>${renderBulletListHtml(skillItems, "Add your skills")}</ul>
    </div>
    <div>
      <h2>Experience</h2>
      <p>${escapeHtml(`${experience} year(s) of experience`)}</p>
    </div>
  </div>
  <h2>Education</h2>
  <ul>${renderBulletListHtml(educationItems, "Add your education details")}</ul>
  <h2>Internships</h2>
  <ul>${renderBulletListHtml(internshipItems, "Add internship details")}</ul>
  <h2>Projects</h2>
  <ul>${renderBulletListHtml(projectItems, "Add your project details")}</ul>
  <h2>Certifications</h2>
  <ul>${renderBulletListHtml(certificationItems, "Add certifications")}</ul>
  <h2>Achievements</h2>
  <ul>${renderBulletListHtml(achievementItems, "Add achievements")}</ul>
  <div class="two-col">
    <div>
      <h2>Languages</h2>
      <ul>${renderBulletListHtml(languageItems, "Add languages")}</ul>
    </div>
    <div>
      <h2>Strengths</h2>
      <ul>${renderBulletListHtml(strengthItems, "Add strengths")}</ul>
    </div>
  </div>
  <h2>Hobbies</h2>
  <ul>${renderBulletListHtml(hobbyItems, "Add hobbies or interests")}</ul>
</body>
</html>`;
  };

  const toPdfText = (value) =>
    String(value || "")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)")
      .replace(/\r/g, "");

  const wrapText = (text, maxLength = 86) => {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    if (!words.length) return [""];
    const lines = [];
    let current = words[0];

    for (let i = 1; i < words.length; i += 1) {
      const next = `${current} ${words[i]}`;
      if (next.length <= maxLength) {
        current = next;
      } else {
        lines.push(current);
        current = words[i];
      }
    }

    lines.push(current);
    return lines;
  };

  const buildPdfSections = () => {
    const sections = [
      {
        heading: "PROFILE",
        lines: [
          userName,
          builder.title,
          [userEmail, builder.phone, builder.address].filter(Boolean).join(" | "),
          [builder.github, builder.linkedin].filter(Boolean).join(" | "),
        ].filter(Boolean),
      },
      {
        heading: "SUMMARY",
        lines: wrapText(builder.summary || "Add your professional summary here."),
      },
      {
        heading: "SKILLS",
        lines: getSkillList().length ? getSkillList().map((item) => `- ${item}`) : ["- Add your skills"],
      },
      {
        heading: "EXPERIENCE",
        lines: [`${experience} year(s) of experience`],
      },
      {
        heading: "EDUCATION",
        lines: getBulletList(builder.education).length
          ? getBulletList(builder.education).flatMap((item) => wrapText(`- ${item}`))
          : ["- Add your education details"],
      },
      {
        heading: "INTERNSHIPS",
        lines: getBulletList(builder.internships).length
          ? getBulletList(builder.internships).flatMap((item) => wrapText(`- ${item}`))
          : ["- Add internship details"],
      },
      {
        heading: "PROJECTS",
        lines: getBulletList(builder.projects).length
          ? getBulletList(builder.projects).flatMap((item) => wrapText(`- ${item}`))
          : ["- Add your project details"],
      },
      {
        heading: "CERTIFICATIONS",
        lines: getBulletList(builder.certifications).length
          ? getBulletList(builder.certifications).flatMap((item) => wrapText(`- ${item}`))
          : ["- Add certifications"],
      },
      {
        heading: "ACHIEVEMENTS",
        lines: getBulletList(builder.achievements).length
          ? getBulletList(builder.achievements).flatMap((item) => wrapText(`- ${item}`))
          : ["- Add achievements"],
      },
      {
        heading: "LANGUAGES",
        lines: getFlexibleList(builder.languages).length
          ? getFlexibleList(builder.languages).map((item) => `- ${item}`)
          : ["- Add languages"],
      },
      {
        heading: "STRENGTHS",
        lines: getBulletList(builder.strengths).length
          ? getBulletList(builder.strengths).map((item) => `- ${item}`)
          : ["- Add strengths"],
      },
      {
        heading: "HOBBIES",
        lines: getBulletList(builder.hobbies).length
          ? getBulletList(builder.hobbies).map((item) => `- ${item}`)
          : ["- Add hobbies or interests"],
      },
    ];

    return sections;
  };

  const downloadCreatedResumePdf = () => {
    const pages = [[]];
    let pageIndex = 0;
    let y = 800;
    const startNewPage = () => {
      pages.push([]);
      pageIndex += 1;
      y = 800;
    };

    const pushLine = (fontSize, text) => {
      if (y < 48) startNewPage();
      pages[pageIndex].push(`BT /F1 ${fontSize} Tf 48 ${y} Td (${toPdfText(text)}) Tj ET`);
      y -= fontSize + 6;
    };

    buildPdfSections().forEach((section) => {
      if (y < 90) startNewPage();
      pushLine(13, section.heading);
      section.lines.forEach((line) => {
        wrapText(line).forEach((wrapped) => {
          pushLine(10, wrapped);
        });
      });
      y -= 4;
    });

    const objects = [];
    const addObject = (content) => {
      objects.push(content);
      return objects.length;
    };

    const pageIds = [];
    const contentIds = [];
    const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    const pagesId = addObject("");

    pages.forEach((pageLines) => {
      const stream = pageLines.join("\n");
      const contentId = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
      contentIds.push(contentId);
      const pageId = addObject(
        `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`
      );
      pageIds.push(pageId);
    });

    objects[pagesId - 1] = `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds
      .map((id) => `${id} 0 R`)
      .join(" ")}] >>`;
    const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

    let pdf = "%PDF-1.4\n";
    const offsets = [0];

    objects.forEach((object, index) => {
      offsets.push(pdf.length);
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += "0000000000 65535 f \n";
    offsets.slice(1).forEach((offset) => {
      pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    const blob = new Blob([pdf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${userName.replace(/\s+/g, "-").toLowerCase()}-resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openCreatedResume = () => {
    const blob = new Blob([buildResumeHtml()], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  return (
    <motion.div className="dashboard-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="app-title">Resume</h1>
      <p className="app-subtitle">Create, preview, and download a fuller resume from your profile data.</p>

      <div className="form-card resume-builder-panel">
        <h2>Create Resume</h2>
        <p className="panel-subtitle">Build a richer resume with summary, education, projects, certifications, links, and more.</p>

        <div className="resume-builder-grid resume-builder-grid--two-col">
          <input name="title" placeholder="Role title" value={builder.title} onChange={handleBuilderChange} />
          <input name="phone" placeholder="Phone number" value={builder.phone} onChange={handleBuilderChange} />
          <input name="address" placeholder="Address" value={builder.address} onChange={handleBuilderChange} />
          <input name="github" placeholder="GitHub profile link" value={builder.github} onChange={handleBuilderChange} />
          <input name="linkedin" placeholder="LinkedIn profile link" value={builder.linkedin} onChange={handleBuilderChange} />
          <textarea
            name="summary"
            placeholder="Professional summary"
            value={builder.summary}
            onChange={handleBuilderChange}
            rows={4}
            className="resume-wide-field"
          />
          <textarea
            name="languages"
            placeholder="Languages (one per line or comma separated)"
            value={builder.languages}
            onChange={handleBuilderChange}
            rows={3}
          />
          <textarea
            name="education"
            placeholder="Education (one item per line)"
            value={builder.education}
            onChange={handleBuilderChange}
            rows={4}
          />
          <textarea
            name="internships"
            placeholder="Internships (one item per line)"
            value={builder.internships}
            onChange={handleBuilderChange}
            rows={4}
          />
          <textarea
            name="projects"
            placeholder="Projects (one item per line)"
            value={builder.projects}
            onChange={handleBuilderChange}
            rows={4}
          />
          <textarea
            name="certifications"
            placeholder="Certifications (one item per line)"
            value={builder.certifications}
            onChange={handleBuilderChange}
            rows={4}
          />
          <textarea
            name="achievements"
            placeholder="Achievements (one item per line)"
            value={builder.achievements}
            onChange={handleBuilderChange}
            rows={4}
          />
          <textarea
            name="strengths"
            placeholder="Strengths (one item per line)"
            value={builder.strengths}
            onChange={handleBuilderChange}
            rows={4}
          />
          <textarea
            name="hobbies"
            placeholder="Hobbies and interests (one item per line)"
            value={builder.hobbies}
            onChange={handleBuilderChange}
            rows={4}
          />
        </div>

        <div className="resume-helper-card">
          <strong>Included automatically</strong>
          <span>Name, email, skills, experience, phone, address, GitHub, and LinkedIn are used in the generated resume.</span>
        </div>

        <div className="btn-row">
          <button className="primary-btn" onClick={openCreatedResume}>
            Preview Created Resume
          </button>
          <button className="secondary-btn" onClick={downloadCreatedResumePdf}>
            Download Resume PDF
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default UserResume;
