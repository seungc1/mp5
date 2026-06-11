function CategorySidebar({
  categories,
  activeCategory,
  isHomeView,
  onCategoryClick,
}) {
  return (
    <aside className="left-sidebar box">
      <h3>카테고리</h3>
      <ul className="menu-list">
        {categories.map((category) => {
          const isActive = activeCategory === category && isHomeView;

          return (
            <li key={category}>
              <button
                className={isActive ? "active" : ""}
                type="button"
                onClick={() => onCategoryClick(category)}
              >
                {category}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export default CategorySidebar;
