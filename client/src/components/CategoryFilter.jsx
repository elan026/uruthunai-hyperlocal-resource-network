import { Check } from 'lucide-react';

export default function CategoryFilter({ categories, selectedCategory, onSelect }) {
    return (
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-2">
            <h3 className="font-bold text-navy-800 text-lg mb-2 pl-2">Categories</h3>
            {categories.map((cat, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(cat.name)}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all ${selectedCategory === cat.name
                            ? 'bg-teal-50 border border-teal-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]'
                            : 'bg-white border border-transparent hover:bg-gray-50 hover:border-gray-100'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full shadow-inner border border-black/10`} style={{ backgroundColor: cat.color }}></div>
                        <span className={`font-semibold ${selectedCategory === cat.name ? 'text-teal-800' : 'text-gray-600'}`}>{cat.name}</span>
                    </div>
                    {selectedCategory === cat.name && <Check className="w-4 h-4 text-teal-600" />}
                </button>
            ))}
        </div>
    );
}
