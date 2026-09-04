export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">About Class OP</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        Class OP is a student-facing preview for clustering Iowa State classes around a dorm walk. It is not Workday,
        not AccessPlus, and not an official university product. Demo Workday simulates a successful sign-in and seeds a
        Computer Engineering Fall Y1 week from Friley Hall.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Optimization rules</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-muted">
        <li>Start from the dorm (Friley / 212 Beyer Ct) and cluster nearby buildings.</li>
        <li>Mornings: Carver (MATH), Coover (CPRE), Hoover/Marston (ENGR 1010).</li>
        <li>Keep CHEM lecture in the afternoon at Troxel; disc/lab at Gilman/Hach on Tuesday.</li>
        <li>Avoid scattering a single day across both the west engineering quad and east lecture halls.</li>
      </ul>

      <h2 className="mt-8 text-lg font-semibold">Data</h2>
      <p className="mt-2 text-sm text-ink-muted">
        Section times come from the public ISU Schedule of Classes (api.classes.iastate.edu, Fall 2026). Buildings and
        rooms are not in that API — map pins use the coordinates supplied with this preview. Degree context is the
        2026–27 Computer Engineering catalog (127 credits).
      </p>

      <h2 className="mt-8 text-lg font-semibold">Schematic map references</h2>
      <p className="mt-2 text-sm text-ink-muted">
        The live planner uses OSM tiles and real lat/lon. These Beyer Loop drawings are the visual brief.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Fig
          src="/refs/3d585e1ec92b0734ff4f44a39cc41e7ad0d5c9b07e50c115e0a9ef0aa6ea6b37.png"
          cap="Overview"
        />
        <Fig
          src="/refs/0d379d74e4fd61a9578aaaea02d7405235d499a1561603cf0db5777f49f356bd.png"
          cap="MWF"
        />
        <Fig
          src="/refs/8838955f90e5d32071ed610047aff61daa237a14c652cf4c53db4693c91e83df.png"
          cap="TR"
        />
      </div>
    </div>
  );
}

function Fig({ src, cap }: { src: string; cap: string }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-stone-200 bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`Beyer Loop ${cap} schematic`} className="h-36 w-full object-cover" />
      <figcaption className="px-2 py-1.5 text-center text-[11px] text-ink-muted">{cap}</figcaption>
    </figure>
  );
}
