import { statsGlossary } from "../util/statsGlossary";
import { BlockMath } from "react-katex";

function formatFormula(description, formula) {
    return (
        <>
            {description && <p className="text-gray-600">{description}</p>}
            {formula && (
                <div className="mt-2">
                    <span className="font-semibold text-gray-800">Formula:</span>
                    <BlockMath math={formula} />
                </div>
            )}
        </>
    )
}

export const StatsGlossaryFooter = () => {
    return (
        <div className="mt-12 border-t border-gray-300 pt-6 text-sm text-gray-700 max-w-12xl mx-auto px-4">
            <h3 className="text-lg font-semibold mb-4">Glossary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
                {Object.entries(statsGlossary).map(([stat, { name, description, formula }]) => (
                    <div key={stat} className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
                        <div className="font-semibold">{stat} - {name}</div>
                        <div className="text-gray-600 mt-1">{formatFormula(description, formula)}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}