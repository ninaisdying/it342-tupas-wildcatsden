import { NavLink, useLocation } from "react-router-dom";
import { useState, useLayoutEffect, useRef } from "react";
import "./styles/DashboardRoutes.css";

const navItems = [
  { path: "/venues", label: "All" },
  { path: "/venues/nge", label: "NGE" },
  { path: "/venues/sal", label: "SAL" },
  { path: "/venues/gle", label: "GLE" },
  { path: "/venues/court", label: "Court" },
  { path: "/venues/acad", label: "ACAD" },
  { path: "/venues/lrac", label: "LRAC" },
  { path: "/venues/more", label: "More" },
];

export default function Navigation({ searchQuery, filters, showFilters, onFiltersChange, onFilterToggle }) {
  const location = useLocation();
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const navRefs = useRef([]);

  useLayoutEffect(() => {
    if (searchQuery) {
      setIndicatorStyle({ width: 0, left: 0, opacity: 0 });
    } else {
      // Find active tab - default to "All" if at /venues
      const activeIndex = navItems.findIndex(item => 
        location.pathname === item.path || 
        (item.path !== "/venues" && location.pathname.startsWith(item.path))
      );
      
      const defaultIndex = 0; // "All" is at index 0
      const activeTab = navRefs.current[activeIndex >= 0 ? activeIndex : defaultIndex];
      
      if (activeTab) {
        setIndicatorStyle({
          width: `${activeTab.offsetWidth}px`,
          left: `${activeTab.offsetLeft}px`,
          opacity: 1
        });
      }
    }
  }, [location.pathname, showFilters, searchQuery]);

  const handleCapacityChange = (e) => onFiltersChange({ ...filters, capacity: e.target.value });
  const handleLocationChange = (e) => onFiltersChange({ ...filters, location: e.target.value });
  const clearFilters = () => onFiltersChange({ capacity: "", location: "" });
  const hasActiveFilters = filters.capacity || filters.location;

  const shouldShowNav = !searchQuery;

  return (
    <nav className="nav-container">
      <div className="nav-inner">
        {/* Hide indicator when search is active */}
        {shouldShowNav && <div className="active-indicator" style={indicatorStyle} />}
        
        {/* Hide nav items when search is active */}
        {shouldShowNav ? (
          navItems.map((item, idx) => (
            <div
              key={item.path}
              ref={(el) => (navRefs.current[idx] = el)}
              className="nav-link-wrapper"
            >
              <NavLink
                to={item.path}
                end={item.path === "/venues"} // Use "end" for exact match on "/venues"
                className={({ isActive: navLinkIsActive }) => {
                  // Rename the parameter to avoid conflict
                  // For "All" (/venues), check if it's exactly active
                  // For others, check if path starts with
                  const isItemActive = item.path === "/venues" 
                    ? location.pathname === "/venues"
                    : location.pathname.startsWith(item.path);
                  
                  return `nav-link ${isItemActive ? "active" : ""}`;
                }}
              >
                {item.label}
              </NavLink>
              {idx < navItems.length - 1 && <span className="nav-dot">•</span>}
            </div>
          ))
        ) : (
          // Show a placeholder or search info when nav is hidden
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
                .filter(item => item.path !== "/venues") // Exclude "All" from filter dropdown
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