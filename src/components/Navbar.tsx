import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Smartphone, 
  Users, 
  Package, 
  Receipt, 
  BarChart2, 
  Settings, 
  LogOut,
  Menu,
  X,
  UserCog
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth'; 

function Navbar() {
  const location = useLocation();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Smartphone, label: 'Início' },
    { path: '/customers', icon: Users, label: 'Clientes' },
    { path: '/products', icon: Package, label: 'Produtos' },
    { path: '/receipts', icon: Receipt, label: 'Recibos' },
    { path: '/reports', icon: BarChart2, label: 'Relatórios' },
    { path: '/employees', icon: UserCog, label: 'Funcionários' },
    { path: '/settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src="https://i.postimg.cc/jdqFP75f/Captura-de-tela-2025-02-16-213923.png"
              alt="Logo IPHONES"
              className="h-12 transform hover:scale-105 transition-transform duration-200"
            />
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(item.path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => logout()}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(item.path)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon className="h-5 w-5 mr-2" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => {
              logout();
              setIsMenuOpen(false);
            }}
            className="flex w-full items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;