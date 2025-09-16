import { useParams } from 'react-router-dom';
import { DivisionStandingsTable } from '../components/standingsTables/DivisionStandingsTable';
import { LeagueStandingsTable } from '../components/standingsTables/LeagueStandingsTable';
import { OverallStandingsTable } from '../components/standingsTables/OverallStandingsTable';

export const ExpandView = () => {
    // cols
    const columns = ["team","W","L","PCT","GB","HOME","AWAY","DAY","NIGHT","RHP","LHP","GRASS","TURF","1-RUN","XTRA","EXWL"];

    const { subtab = "divsion" } = useParams();

    if (subtab === "division") return <DivisionStandingsTable columns={columns} groupBy="division" compact/>;
    if (subtab === "league") return <LeagueStandingsTable columns={columns} groupBy="league" compact/>;
    if (subtab === "overall") return <OverallStandingsTable columns={columns} groupBy="overall" compact/>;

    return <div>Unknown Tab</div>;
}