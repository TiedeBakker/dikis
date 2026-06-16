import { getGroepContext, getFormulierBlueprint, getKeuzelijstMetOpties } from "./actions";
import TestDashboardClient from "./TestDashboardClient";

export default async function TestPage() {
  const context = await getGroepContext("groep-keuring-1");

  if (!context || !context.groep.standaardSetId) {
    return <div className="p-8 text-red-500">Groep of gekoppeld formulier niet gevonden.</div>;
  }

  const ruweVelden = await getFormulierBlueprint(context.groep.standaardSetId);

  const veldenMetOpties = await Promise.all(
    ruweVelden.map(async (veld) => {
      let opties: { id: string; waarde: string }[] = [];
      if (veld.type === "keuzelijst" && veld.keuzelijstId) {
        opties = await getKeuzelijstMetOpties(veld.keuzelijstId);
      }
      return { ...veld, opties };
    })
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <TestDashboardClient context={context} velden={veldenMetOpties} />
    </div>
  );
}