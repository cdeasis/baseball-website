import { NavLink, useLocation } from 'react-router-dom';

export const ToggleScoresSchedule = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname.toLowerCase().startsWith(path.toLowerCase());

    return (
        <div className="flex justify-center gap-4 py-4 text-sm sm:text-2xl font-semibold">
            <NavLink to="/Scores" className={`px-4 py-2 rounded-full transition ${isActive('/scores') ? 'bg-blue-200 text-blue-800' : 'text-gray-600 hover:bg-gray-100' }`}>
                Scores
            </NavLink>
            <NavLink to="/Schedule" className={`px-4 py-2 rounded-full transition ${isActive('/schedule') ? 'bg-blue-200 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}>
                Schedule
            </NavLink>
        </div>
    )
}