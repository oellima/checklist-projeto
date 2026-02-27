import { useState, useEffect } from 'react'

export default function App() {
  const defaultCategories = ["Escopo", "Design", "Desenvolvimento"];
  const ITEMS_PER_PAGE = 30;
  
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('project_master_data_cats');
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('project_master_data_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [taskInput, setTaskInput] = useState('');
  const [catInput, setCatInput] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Resetar página ao trocar de categoria ou buscar
  const handleCategoryChange = (cat) => {
    setActiveFilter(cat);
    setTaskInput('');
    setCurrentPage(1);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [taskInput]);

  useEffect(() => {
    localStorage.setItem('project_master_data_cats', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('project_master_data_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addCategory = (e) => {
    e.preventDefault();
    if (!catInput.trim() || categories.includes(catInput.trim())) return;
    setCategories([...categories, catInput.trim()]);
    setCatInput('');
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!taskInput.trim() || activeFilter === 'Todos') return;
    setTasks([...tasks, { id: Date.now(), category: activeFilter, text: taskInput.trim(), completed: false }]);
    setTaskInput('');
  };

  const deleteCategory = (name) => {
    if (window.confirm(`Excluir "${name}"?`)) {
      setCategories(categories.filter(c => c !== name));
      setTasks(tasks.filter(t => t.category !== name));
      if (activeFilter === name) setActiveFilter('Todos');
    }
  };

  const resetProject = () => {
    if (window.confirm("⚠️ ATENÇÃO: Desejas resetar todo o projeto?")) {
      setCategories(defaultCategories);
      setTasks([]);
      setActiveFilter('Todos');
      setTaskInput('');
      setCurrentPage(1);
      localStorage.removeItem('project_master_data_cats');
      localStorage.removeItem('project_master_data_tasks');
    }
  };

  const printReport = () => window.print();

  // Lógica de Filtro e Paginação
  const filteredTasks = tasks.filter(t => {
    const search = taskInput.toLowerCase();
    if (activeFilter === 'Todos') {
      return t.text.toLowerCase().includes(search) || t.category.toLowerCase().includes(search);
    }
    return t.category === activeFilter && t.text.toLowerCase().includes(search);
  });

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const relevant = activeFilter === 'Todos' ? tasks : tasks.filter(t => t.category === activeFilter);
  const percent = relevant.length > 0 ? Math.round((relevant.filter(t => t.completed).length / relevant.length) * 100) : 0;
  
  const isDone = percent === 100 && relevant.length > 0;
  const statusColor = isDone ? '#eab308' : '#10b981';

  return (
    <div className="h-screen w-full bg-slate-100 font-sans text-slate-900 flex flex-col md:flex-row overflow-hidden">
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          aside, .no-print, button, form, .fab-button, .pagination-controls { display: none !important; }
          main { width: 100% !important; height: auto !important; overflow: visible !important; position: absolute !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}} />

      {/* SIDEBAR */}
      <aside className={`fixed inset-0 z-50 bg-slate-900 transition-transform transform md:relative md:translate-x-0 md:flex md:w-72 flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800">
          <div className="flex justify-between items-center md:block">
            <div>
              <h1 className="text-white text-xl font-black tracking-tight">CHECKLIST PROJETO</h1>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-1">Gestão de Categorias</p>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="md:hidden text-white text-2xl p-2">✕</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          <button onClick={() => handleCategoryChange('Todos')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeFilter === 'Todos' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
            <span>📁 Ver Todas</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeFilter === 'Todos' ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-800 text-slate-500'}`}>{tasks.length}</span>
          </button>
          <div className="h-px bg-slate-800 my-4"></div>
          {categories.map(cat => {
            const count = tasks.filter(t => t.category === cat).length;
            return (
              <div key={cat} className="flex items-center group">
                <button onClick={() => handleCategoryChange(cat)} className={`flex-1 flex items-center justify-between text-left px-4 py-3 rounded-xl text-xs font-bold ${activeFilter === cat ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                  <span className="truncate">{cat}</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeFilter === cat ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-800 text-slate-500'}`}>{count}</span>
                </button>
                <button onClick={() => deleteCategory(cat)} className="p-2 text-slate-600 hover:text-red-500 transition-colors">✕</button>
              </div>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-slate-800 no-print space-y-3">
          <form onSubmit={addCategory} className="flex gap-2">
            <input value={catInput} onChange={e => setCatInput(e.target.value)} placeholder="Nova categoria..." className="flex-1 bg-slate-800 border-none rounded-lg px-3 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500" />
            <button className="bg-indigo-600 text-white px-3 py-2 rounded-lg font-bold hover:bg-indigo-500">+</button>
          </form>
          <button onClick={resetProject} className="w-full py-2 border border-red-900/30 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-red-950/30 transition-colors">Resetar Projeto</button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative overflow-hidden">
        <header className="p-4 md:p-8 border-b border-slate-100 flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setIsMenuOpen(true)} className="md:hidden p-2 bg-slate-100 rounded-lg no-print">☰</button>
            <div className="min-w-0">
              <h2 className="text-sm md:text-2xl font-black truncate uppercase text-slate-800 leading-none">{activeFilter}</h2>
              <p className="text-[9px] md:text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={printReport} className="no-print flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 px-3 md:px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all">
              <span>📄</span> <span className="whitespace-nowrap">Gerar Relatório</span>
            </button>

            <div className={`flex items-center gap-3 px-3 md:px-4 py-1.5 rounded-full shrink-0 transition-all duration-500 ${isDone ? 'bg-yellow-50' : 'bg-slate-50'}`}>
              <div className="hidden sm:flex flex-col items-center justify-center">
                <p className="text-[7px] font-black text-slate-400 uppercase leading-none mb-0.5">Status de</p>
                <p className={`text-[9px] font-black uppercase leading-none ${isDone ? 'text-yellow-600' : 'text-indigo-600'}`}>Entrega</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black transition-colors ${isDone ? 'text-yellow-600' : 'text-indigo-600'}`}>{percent}%</span>
                <div className="w-8 h-8 md:w-10 md:h-10 relative">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="16" fill="none" stroke={statusColor} strokeWidth="3" strokeDasharray="100" strokeDashoffset={100 - percent} strokeLinecap="round" className="transition-all duration-700" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:px-8 md:py-5 bg-slate-50/30 no-print shrink-0">
          <form onSubmit={addTask} className="flex gap-3 max-w-4xl relative">
            <div className="flex-1 relative flex items-center">
              <input value={taskInput} onChange={e => setTaskInput(e.target.value)} placeholder={activeFilter === 'Todos' ? "🔍 Busque por texto ou categoria..." : "📝 Digite e pressione Enter..."} className="w-full bg-white border-none rounded-2xl px-5 py-3 pr-12 text-sm outline-none shadow-sm focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300" />
              {taskInput.length > 0 && (
                <button type="button" onClick={() => setTaskInput('')} className="absolute right-4 p-1 text-slate-300 hover:text-indigo-500">✕</button>
              )}
            </div>
            {activeFilter !== 'Todos' && <button className="bg-indigo-600 text-white px-6 rounded-2xl font-black text-xs shadow-md">SALVAR</button>}
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-3 custom-scrollbar">
          {paginatedTasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-10 select-none">
              <p className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-slate-400">Lista Vazia</p>
            </div>
          ) : (
            paginatedTasks.map(t => (
              <div key={t.id} onClick={() => setTasks(tasks.map(x => x.id === t.id ? {...x, completed: !x.completed} : x))} className={`task-card flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${t.completed ? 'bg-slate-50 border-transparent opacity-50' : 'bg-white border-slate-50 shadow-sm hover:border-indigo-100'}`}>
                <div className="flex items-center gap-4 truncate">
                  <div className={`w-6 h-6 rounded-lg border-2 flex-shrink-0 flex items-center justify-center ${t.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200 bg-white'}`}>{t.completed && <span className="text-white text-xs">✓</span>}</div>
                  <div className="truncate">
                    {activeFilter === 'Todos' && <p className="text-[8px] font-black text-indigo-400 uppercase mb-1">{t.category}</p>}
                    <p className={`text-sm font-semibold truncate ${t.completed ? 'line-through text-slate-400 font-normal' : 'text-slate-700'}`}>{t.text}</p>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setTasks(tasks.filter(x => x.id !== t.id)); }} className="no-print text-slate-200 hover:text-red-400 p-2 ml-2 transition-colors">✕</button>
              </div>
            ))
          )}
          <div className="h-20 md:hidden"></div>
        </div>

        {/* CONTROLES DE PAGINAÇÃO */}
        {totalPages > 1 && (
          <div className="pagination-controls p-4 border-t border-slate-100 flex items-center justify-center gap-4 bg-white shrink-0 no-print">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-all font-black text-xs uppercase tracking-tighter"
            >
              Anterior
            </button>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Página {currentPage} de {totalPages}
            </span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-all font-black text-xs uppercase tracking-tighter"
            >
              Próxima
            </button>
          </div>
        )}

        <button onClick={() => setIsMenuOpen(true)} className="fab-button md:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center text-xl z-40 border-4 border-white active:scale-90 transition-all">📂</button>
      </main>
    </div>
  )
}