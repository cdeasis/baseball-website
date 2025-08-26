import { Header } from '../components/Header';
import { StatsGlossaryFooter } from '../components/StatsGlossaryFooter';
import { NavLink, useParams } from 'react-router-dom';
import { StandingsView } from '../views/StandingsView';
import { ExpandView } from '../views/ExpandView';
import { VersusDivisionView } from '../views/VersusDivisionView';
import { WildCardView } from '../views/WildCardView';

const mainTabs = [
    { path: "standings", label: "Standings"},
    { path: "wildcard", label: "Wild Card"},
    { path: "expanded", label: "Expanded"},
    { path: "vs-division", label: "Vs. Division"},
];

const subTabs = ["division", "league", "overall"];

export const Standings = () => {
    const { tab = 'standings', subtab = 'division' } = useParams();

    const showSubTabs = tab !== 'wildcard';

    const renderView = () => {
        if (tab === 'standings') return <StandingsView />
        if (tab === 'wildcard') return <WildCardView />
        if (tab === 'expanded') return <ExpandView />
        if (tab === 'vs-division') return <VersusDivisionView/>
        return <div>Unknown Tab</div>;
    }

    return (
        <div>
            <Header />

            {/* Main Tab Header */}
            <div className="border-b border-gray-300 bg-white sticky top-0 z-10">
                <div className="flex justify-center px-6 py-4">
                    <div className="flex space-x-10 max-w-screen-lg w-full justify-center">
                        {mainTabs.map(({ path, label}) => (
                            <NavLink key={path} to={path === "wildcard" ? `/standings/wildcard`: `/standings/${path}/division`} className={`text-lg font-bold px-4 py-2 transition-all duration-150 ${tab===path ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-600'}`}>
                                {label}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>

            {/* SubTab Header */}
            {showSubTabs && (
                <div className="border-b border-gray-200 by-gray-50">
                    <div className="flex justify-center px-6 py-3">
                        <div className="flex space-x-4 max-w-screen-md w-full justify-center">
                            {subTabs.map((sub) => (
                                <NavLink key={sub} to={`/standings/${tab}/${sub}`} className={`text-base px-5 py-2 rounded-full font-semibold transition-all duration-150 ${subtab === sub ? 'bg-blue-500 text-white' : 'border-gray-300 text-gray-600'}`}>
                                    {sub.charAt(0).toUpperCase() + sub.slice(1)}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <div className="p-6">
                {renderView()}
            </div>

            {/* Glossary */}
            <StatsGlossaryFooter />
        </div>
    );
}