import '../app/App.css'

export default function SearchBar({ 
  placeholderText, 
  searchQuery, 
  onSearchChange, 
  onFilterToggle 
}) {
  return (
    <div className="search-bar-container">
      <input 
        className="search-bar"
        type="text" 
        placeholder={placeholderText || "Search venues..."}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );    
}