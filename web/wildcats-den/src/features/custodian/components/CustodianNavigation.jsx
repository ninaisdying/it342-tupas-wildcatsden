import { NavLink, useLocation } from "react-router-dom";
import { useState, useLayoutEffect, useRef } from "react";
import "../../../layout/styles/DashboardRoutes.css";

const navItems = [
  { path: "", label: "All" },
  { path: "nge", label: "NGE" },
  { path: "sal", label: "SAL" },
  { path: "gle", label: "GLE" },
  { path: "court", label: "Court" },
  { path: "acad", label: "ACAD" },
  { path: "lrac", label: "LRAC" },
  { path: "more", label: "More" },
];

export default function CustodianNavigation({ 
  searchQuery, 
  filters, 
  showFilters, 
  onFiltersChange, 
  onFilterToggle,
  basePath = "/custodian/my-venues" 
}) {
  const location = useLocation();
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const navRefs = useRef([]);

  useLayoutEffect(() => {
    if (searchQuery) {
      setIndicatorStyle({ width: 0, left: 0, opacity: 0 });
    } else {
      const fullPath = location.pathname;
      let currentSegment = "";
      
      if (fullPath.startsWith(basePath)) {
        const remainingPath = fullPath.substring(basePath.length);
        currentSegment = remainingPath.split("/").filter(Boolean)[0] || "";
      }
      
      const activeIndex = navItems.findIndex(item => 
        currentSegment === item.path || 
        (item.path === "" && currentSegment === "")
      );
      
      const activeTab = navRefs.current[activeIndex >= 0 ? activeIndex : 0];
      
      if (activeTab) {
        setIndicatorStyle({
          width: `${activeTab.offsetWidth}px`,
          left: `${activeTab.offsetLeft}px`,
          opacity: 1
        });
      }
    }
  }, [location.pathname, showFilters, searchQuery, basePath]);

  const handleCapacityChange = (e) => onFiltersChange({ ...filters, capacity: e.target.value });
  const handleLocationChange = (e) => onFiltersChange({ ...filters, location: e.target.value });
  const clearFilters = () => onFiltersChange({ capacity: "", location: "" });
  const hasActiveFilters = filters.capacity || filters.location;

  const shouldShowNav = !searchQuery;

  const buildNavLinkPath = (itemPath) => {
    if (itemPath === "") {
      return basePath; // "/custodian/my-venues"
    }
    return `${basePath}/${itemPath}`; 
  };

  return (
    <nav className="nav-container">
      <div className="nav-inner">
        {/* Hide indicator when search is active */}
        {shouldShowNav && <div className="active-indicator" style={indicatorStyle} />}
        
        {/* Hide nav items when search is active */}
        {shouldShowNav ? (
          navItems.map((item, idx) => (
            <div
              key={item.path || "all"}
              ref={(el) => (navRefs.current[idx] = el)}
              className="nav-link-wrapper"
            >
              <NavLink
                to={buildNavLinkPath(item.path)}
                end={item.path === ""} 
                className={() => { 
                  const fullPath = location.pathname;
                  const isItemActive = item.path === ""
                    ? fullPath === basePath || fullPath === `${basePath}/`
                    : fullPath === `${basePath}/${item.path}`;
                  
                  return `nav-link ${isItemActive ? "active" : ""}`;
                }}
              >
                {item.label}
              </NavLink>
              {idx < navItems.length - 1 && <span className="nav-dot">•</span>}
            </div>
          ))
        ) : (
          <div className="search-active-message">
            {searchQuery ? `Search: "${searchQuery}"` : "Filters"}
          </div>
        )}
        
        {/* Always show filter pill */}
        <div className="filter-pill" onClick={onFilterToggle}>
          <div className="filter-icon-container">
            <img src="/icons/filter.png" className="filter-icon" alt="Filter" />
            {hasActiveFilters && <div className="filter-badge" />}
          </div>
          <p className="filter-text">Filters</p>
        </div>
        
        {showFilters && (
          <div className="filter-dropdown">
            <div className="filter-header">
              <h3>Filters</h3>
              {hasActiveFilters && <button className="clear-filters" onClick={clearFilters}>Clear All</button>}
            </div>
            <div className="filter-group">
              <label>Minimum Capacity</label>
              <select value={filters.capacity} onChange={handleCapacityChange}>
                <option value="">Any capacity</option>
                <option value="50">50+ people</option>
                <option value="100">100+ people</option>
                <option value="150">150+ people</option>
                <option value="200">200+ people</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Location Area</label>
              <select value={filters.location} onChange={handleLocationChange}>
                <option value="">All areas</option>
                {navItems
                  .filter(item => item.path !== "")
                  .map((item) => (
                    <option key={item.path} value={item.label}>{item.label}</option>
                  ))}
                <option value="More">More</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}