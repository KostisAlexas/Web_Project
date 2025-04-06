import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../features/professor/dashboard.css"
import "./ProfessorSidebar.css";

const ProfessorSidebar = () => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const menuItems = [
    { path: "/", iconPath: "/icon-home.png", label: "Αρχική" },
    { path: "/professor/dashboard", iconPath: "/icon-hat.jpeg", label: "Διπλωματικές" },
    { path: "/professor/invitations", iconPath: "/icon-invitation.jpeg", label: "Προσκλήσεις" },
    { path: "/professor/stats", iconPath: "/icon-stats.jpg", label: "Στατιστικά" },
  ];

  return (
    <aside className={`sidebar professor-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
      <button className="toggle-sidebar-btn" onClick={toggleSidebar}>
        {isSidebarOpen ? "⟩" : "⟨"}
      </button>

      <div className="sidebar-logo">
        {isSidebarOpen && <img src="/icon-ceid.png" alt="icon-ceid" className="logo-img" />}
      </div>

      <nav className="menu">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isHovered = hoveredItem === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`menu-item ${isActive ? "active" : ""}`}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                backgroundColor: isHovered && !isActive ? "#193e58" : isActive ? "#3f4652" : "transparent",
              }}
            >
              <img src={item.iconPath} alt={item.label} className="menu-icon" />
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default ProfessorSidebar;
