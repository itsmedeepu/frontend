import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ShoppingCart, Leaf, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, User } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';
import PriceComparisonModal from '../components/PriceComparisonModal';

interface HomeProps {
  user: User | null;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const [loading, setLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);
  const [comparisonProductName, setComparisonProductName] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const [reviews, setReviews] = useState([]);
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const scrollLeft = () => {
    if (sliderRef.current) {
      const cardWidth = 350 + 24; 
      sliderRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      const cardWidth = 350 + 24;
      sliderRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (sliderRef.current) {
      const cardWidth = 350 + 24;
      const scrollPos = sliderRef.current.scrollLeft;
      const index = Math.round(scrollPos / cardWidth);
      setActiveSlide(index);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsData, reviewsData] = await Promise.all([
           api.getProducts({ 
            category: category === 'All' ? undefined : category.toLowerCase(),
            search: debouncedSearch,
            available: 'true'
          }),
          api.getAllReviews()
        ]);
        
        setProducts(productsData);
        setReviews(reviewsData.reviews || []);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [category, debouncedSearch]);

  const categories = ['All', 'Veggies', 'Fruits', 'Seeds'];


  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="bg-emerald-700 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Fresh from the Earth to Your Table</h1>
          <p className="text-emerald-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Directly support local farmers and enjoy the freshest organic produce delivered right to your door.
          </p>
          <div className="relative max-w-xl mx-auto" id="home-search">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search for tomatoes, apples, honey..." 
              className="w-full pl-12 pr-4 py-4 rounded-full text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-none focus:outline-none focus:ring-4 focus:ring-emerald-500/50 shadow-xl transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Fresh Harvest</h2>
          <div className="flex flex-wrap gap-4 items-center overflow-x-auto pb-2 md:pb-0" id="home-categories">
            <div className="flex gap-2 p-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
              {categories.map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    category === cat 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20">
            <Loader size="lg" />
            <p className="text-center text-slate-500 mt-4 animate-pulse">Fetching fresh harvest...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map(product => (
              <div 
                key={product.id} 
                className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:shadow-emerald-900/10 transition-all"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={product.image?.startsWith('http') ? product.image : `${import.meta.env.VITE_BACKEND_URL}${product.image}`} 
                    alt={product.name} 
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!product.available ? 'grayscale opacity-75' : ''}`}
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                      {product.category}
                    </div>
                    {!product.available && (
                      <div className="bg-red-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Currently Unavailable
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight">{product.name}</h3>
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                      ₹{product.price}<span className="text-xs text-slate-400 dark:text-slate-500 font-normal">/{product.unit}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                    {product.description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <Leaf className="h-3.5 w-3.5 text-emerald-500" />
                      {product.farmerName || 'Local Farmer'}
                      {product.farmerRating !== undefined && product.farmerRating > 0 && (
                        <div className="flex items-center gap-0.5 ml-1 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded-md border border-amber-100 dark:border-amber-900/50">
                          <span className="text-amber-500 text-[10px]">★</span>
                          <span className="text-10px font-bold text-amber-600 dark:text-amber-500">{product.farmerRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        if (!user) {
                          navigate('/login');
                        } else {
                          const duplicates = products.filter(p => 
                            p.name.toLowerCase() === product.name.toLowerCase() && 
                            p.category === product.category
                          );

                          if (duplicates.length > 1) {
                            setComparisonProducts(duplicates);
                            setComparisonProductName(product.name);
                            setIsComparisonModalOpen(true);
                          } else {
                            addToCart(product);
                          }
                        }
                      }}
                      className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <PriceComparisonModal
          isOpen={isComparisonModalOpen}
          onClose={() => setIsComparisonModalOpen(false)}
          products={comparisonProducts}
          productName={comparisonProductName}
          onSelect={(product) => addToCart(product)}
        />

        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-slate-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">No products found</h3>
            <p className="text-slate-500">Try adjusting your search or category filter.</p>
          </div>
        )}

        <div className="mt-24 mb-20 animate-in slide-in-from-bottom-8 duration-500 delay-150 group/slider">
          <div className="flex items-center gap-3 mb-8 justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-2 rounded-lg">
                  <Leaf className="h-5 w-5" /> 
                </span>
                Community Love
              </h2>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={scrollLeft}
                className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-600 dark:text-slate-400 transition-colors"
                aria-label="Previous review"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={scrollRight}
                className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-600 dark:text-slate-400 transition-colors"
                aria-label="Next review"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div 
              ref={sliderRef}
              onScroll={handleScroll}
              className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide scroll-smooth"
            >
              {reviews.map((review: any) => (
                <div key={review._id} className="min-w-[300px] md:min-w-[350px] bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm snap-center hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${review.user?.name || 'User'}&background=random`} 
                      className="h-10 w-10 rounded-full" 
                      alt=""
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{review.user?.name || 'Happy Customer'}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Verified Buyer</div>
                    </div>
                    <div className="ml-auto flex items-center bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-900/50">
                      <span className="text-amber-500 text-xs mr-1">★</span>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-500">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm italic mb-4 leading-relaxed line-clamp-3">"{review.comment}"</p>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      {review.farmer?.farmDetails?.farmName || review.farmer?.name || 'Local Farm'}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && !loading && (
                <div className="w-full text-center py-10 text-slate-400 italic">No reviews yet. Be the first to share your experience!</div>
              )}
            </div>
            <div className="absolute right-0 top-0 bottom-8 linear-wipe pointer-events-none w-24 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent lg:hidden"></div>
          </div>
          
          {reviews.length > 0 && (
            <div className="flex justify-center gap-2 mt-4">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (sliderRef.current) {
                      const cardWidth = 350 + 24;
                      sliderRef.current.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
                      setActiveSlide(idx);
                    }
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeSlide 
                      ? 'w-6 bg-emerald-600' 
                      : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-emerald-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
