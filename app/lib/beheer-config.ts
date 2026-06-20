// // app/lib/beheer-config.ts
// import { db } from "@/db";
// import { beheerMetadata } from "@/db/schema";
// import { eq, asc } from "drizzle-orm";

// export async function getBeheerConfig(tabelNaam: string) {
//   const metadata = await db
//     .select()
//     .from(beheerMetadata)
//     .where(eq(beheerMetadata.tabelNaam, tabelNaam))
//     .orderBy(asc(beheerMetadata.volgnummer));

//   return {
//     titel: metadata[0]?.tabelLabel || "Beheer",
//     velden: metadata.map(m => ({
//       id: m.veldId,
//       label: m.veldLabel,
//       type: m.veldType
//     }))
//   };
// }