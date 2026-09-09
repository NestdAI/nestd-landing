// DESIGN FIXTURES ONLY. Never publish as genuine reviews or measured results.
// Change these values to explore the layout. Real proof requires a separate verified release.
export const previewProof = {
  activeUsers: "1.250",
  timings: [["Nestd", "30 sec"], ["Platform A", "5 min"], ["Platform B", "15 min"]],
  // Shared linear scale, seconds; keep in sync with the displayed example labels.
  timingSeconds: [30, 300, 900],
  // Set a local /assets/... URL plus an accurate alt description after adding approved portraits.
  portraits: [{src: "", alt: ""}, {src: "", alt: ""}, {src: "", alt: ""}],
  reviews: {
    nl: [
      ["Naam reviewer 01", "Ik hoef niet meer steeds alle websites af te gaan. Een melding en ik kan meteen kijken."],
      ["Naam reviewer 02", "Mijn zoekwensen staan klaar. Daardoor kan ik me richten op de woningen die bij mij passen."],
      ["Naam reviewer 03", "Fijn om nieuw aanbod op één plek te zien en daarna zelf te reageren."]
    ],
    en: [
      ["Reviewer name 01", "I no longer have to keep checking every website. An alert lets me take a look straight away."],
      ["Reviewer name 02", "My preferences are set, so I can focus on homes that suit my search."],
      ["Reviewer name 03", "It is helpful to see new listings in one place and then respond myself."]
    ]
  }
};
