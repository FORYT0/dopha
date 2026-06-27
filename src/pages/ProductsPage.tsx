import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { products, categories } from '../data/products';
import ProductCard from '../components/ProductCard';

const sortOptions = [
  { key: 'featured', label: 'Featured' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'name-asc', label: 'Name: A-Z' },
];

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleBadge = (badge: string) => {
    setSelectedBadges(prev =>
      prev.includes(badge) ? prev.filter(b => b !== badge) : [...prev, badge]
    );
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q))
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    if (selectedBadges.length > 0) {
      result = result.filter(p => selectedBadges.includes(p.badge || ''));
    }

    const min = parseInt(priceRange.min);
    const max = parseInt(priceRange.max);
    if (!isNaN(min)) result = result.filter(p => p.price >= min);
    if (!isNaN(max)) result = result.filter(p => p.price <= max);

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'name-asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }

    return result;
  }, [searchQuery, selectedCategories, selectedBadges, priceRange, sortBy]);

  const activeFilterCount = selectedCategories.length + selectedBadges.length + (priceRange.min || priceRange.max ? 1 : 0);

  return (
    <div className="pt-16 min-h-screen">
      {/* Header */}
      <div className="bg-[var(--light-gray)] py-14 border-b border-[var(--medium-gray)]">
        <div className="max-w-[1280px] mx-auto px-[5%]">
          <div className="text-sm text-[var(--text-muted)] mb-2">
            <span className="hover:text-[var(--teal)] cursor-pointer">Home</span> <span className="mx-2">/</span> <span className="text-[var(--charcoal)]">Products</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--charcoal)] mb-2">All Components</h1>
          <p className="text-[var(--text-muted)]">Browse our complete catalog of {products.length}+ electronic components</p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-[5%] py-8">
        {/* Search and controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search 140+ components..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[var(--medium-gray)] rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[var(--teal)] focus:ring-1 focus:ring-[var(--teal)]"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border transition-all ${showFilters ? 'bg-[var(--teal)] text-white border-[var(--teal)]' : 'bg-white border-[var(--medium-gray)] text-[var(--charcoal)] hover:border-[var(--teal)]'}`}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 w-5 h-5 bg-[var(--amber)] text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-5 py-3 rounded-xl text-sm font-medium border border-[var(--medium-gray)] bg-white outline-none focus:border-[var(--teal)] cursor-pointer"
            >
              {sortOptions.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Active filter pills */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCategories.map(cat => {
              const catName = categories.find(c => c.id === cat)?.name || cat;
              return (
                <button key={cat} onClick={() => toggleCategory(cat)} className="inline-flex items-center gap-1.5 bg-[var(--teal-light)] text-[var(--teal)] px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-[var(--teal)] hover:text-white transition-colors">
                  {catName} <X size={12} />
                </button>
              );
            })}
            {selectedBadges.map(badge => (
              <button key={badge} onClick={() => toggleBadge(badge)} className="inline-flex items-center gap-1.5 bg-[var(--amber-light)] text-[var(--amber)] px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-[var(--amber)] hover:text-white transition-colors">
                {badge === 'sale' ? 'On Sale' : 'TUM Fave'} <X size={12} />
              </button>
            ))}
            {(priceRange.min || priceRange.max) && (
              <button onClick={() => setPriceRange({ min: '', max: '' })} className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-gray-200 transition-colors">
                KSh {priceRange.min || '0'} - {priceRange.max || '∞'} <X size={12} />
              </button>
            )}
            <button onClick={() => { setSelectedCategories([]); setSelectedBadges([]); setPriceRange({ min: '', max: '' }); }} className="text-xs text-[var(--text-muted)] hover:text-red-500 ml-2 underline">
              Clear all
            </button>
          </div>
        )}

        <p className="text-sm text-[var(--text-muted)] mb-6">{filteredProducts.length} results found</p>

        {/* Filters + Products Grid */}
        <div className="flex gap-8">
          {/* Sidebar filters */}
          {(showFilters || window.innerWidth >= 768) && (
            <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-64 shrink-0`}>
              <div className="bg-white border border-[var(--medium-gray)] rounded-2xl p-6 sticky top-20">
                <h3 className="text-sm font-bold text-[var(--charcoal)] mb-4 uppercase tracking-wider">Category</h3>
                <div className="space-y-2.5 mb-6">
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                        className="w-4 h-4 rounded border-[var(--medium-gray)] text-[var(--teal)] focus:ring-[var(--teal)]"
                      />
                      <span className="text-sm text-[var(--charcoal)] group-hover:text-[var(--teal)] transition-colors">{cat.name}</span>
                      <span className="text-xs text-[var(--text-muted)] ml-auto">{cat.count}</span>
                    </label>
                  ))}
                </div>

                <h3 className="text-sm font-bold text-[var(--charcoal)] mb-4 uppercase tracking-wider">Price Range</h3>
                <div className="flex gap-2 mb-6">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={e => setPriceRange(p => ({ ...p, min: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--medium-gray)] rounded-lg text-sm outline-none focus:border-[var(--teal)]"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={e => setPriceRange(p => ({ ...p, max: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--medium-gray)] rounded-lg text-sm outline-none focus:border-[var(--teal)]"
                  />
                </div>

                <h3 className="text-sm font-bold text-[var(--charcoal)] mb-4 uppercase tracking-wider">Badge</h3>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedBadges.includes('sale')}
                      onChange={() => toggleBadge('sale')}
                      className="w-4 h-4 rounded border-[var(--medium-gray)] text-[var(--teal)] focus:ring-[var(--teal)]"
                    />
                    <span className="text-sm text-[var(--charcoal)] group-hover:text-[var(--teal)] transition-colors">On Sale</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedBadges.includes('tum')}
                      onChange={() => toggleBadge('tum')}
                      className="w-4 h-4 rounded border-[var(--medium-gray)] text-[var(--teal)] focus:ring-[var(--teal)]"
                    />
                    <span className="text-sm text-[var(--charcoal)] group-hover:text-[var(--teal)] transition-colors">TUM Favorites</span>
                  </label>
                </div>
              </div>
            </aside>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <Search size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-40" />
                <p className="text-lg font-medium text-[var(--charcoal)] mb-2">No products found</p>
                <p className="text-sm text-[var(--text-muted)]">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
