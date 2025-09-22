import { useParams } from 'react-router-dom';
import { DivisionStandingsTable } from '../components/standingsTables/DivisionStandingsTable';
import { LeagueStandingsTable } from '../components/standingsTables/LeagueStandingsTable';
import { OverallStandingsTable } from '../components/standingsTables/OverallStandingsTable';

export const VersusDivisionView = () => {
    // cols
    const columns = ["team", "W", "L", "PCT", "GB", "WCGB", "EAST", "CENT", "WEST", "INTR", "RHP","LHP","EXWL"];

    console.log("View Columns:", columns);
    const { subtab = "divsion" } = useParams();

    if (subtab === "division") return <DivisionStandingsTable columns={columns} groupBy="division"/>;
    if (subtab === "league") return <LeagueStandingsTable columns={columns} groupBy="league"/>;
    if (subtab === "overall") return <OverallStandingsTable columns={columns} groupBy="overall"/>;

    console.log("VersusDivisionView rendered");

    return <div>Unknown Tab</div>;
}