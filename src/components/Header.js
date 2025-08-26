import { NavLink } from "react-router-dom";

export const Header = () => {
    const getNavLinkClass = ({ isActive }) =>
        isActive ? 'text-2xl text-gray-300 border-b-2 border-gray-400 pb-1 transition duration-200 ease-in-out px-3' : 'text-2xl text-gray-200 hover:text-blue-300 transition duration-200 ease-in-out px-3';

    return (
        <header className="bg-blue-900 text-white shadow-md sticky top-0 z-50">
            <div className="max-w-71 mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center space-x-4">
                    <img src="/img/logo.svg" alt="logo"/>
                    <span className="text-xl font-semibold">Baseball Central</span>
                </div>
                {/* Menu */}
                <nav className="flex space-x-10">
                    <NavLink to="/" end className={getNavLinkClass}>Home</NavLink>
                    <NavLink to="/News" end className={getNavLinkClass}>News</NavLink>
                    <NavLink to="/Scores" end className={getNavLinkClass}>Scores</NavLink>
                    <NavLink to="/Schedule" end className={getNavLinkClass}>Schedule</NavLink>
                    <NavLink to="/Standings" end className={getNavLinkClass}>Standings</NavLink>
                    <NavLink to="/Database" end className={getNavLinkClass}>Database</NavLink>
                    <NavLink to="/Props" end className={getNavLinkClass}>Props</NavLink>
                    <NavLink to="/Blog" end className={getNavLinkClass}>Blog</NavLink>
                </nav>
                {/* Search and Login */}
                <div className="flex items-center space-x-4 text-2xl">
                    <input
                        type="text"
                        placeholder="search"
                        className="hidden md:block px-2 py-1 rounded bg-white text-black text-sm"
                    />
                    <button className="bg-white text-blue-500 font-bold px-3 py-1 rounded hover:bg-gray-100 transition">Login</button>
                </div>
            </div> 
        </header>
    );
}