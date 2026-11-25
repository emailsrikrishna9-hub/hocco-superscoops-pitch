/* Company-specific data for the shell: HOCCO Superscoops.
   Sources are typed with the four evidence labels. Scenario maths mirror case/model.py (sizing block). */
window.SITE = {
  titles: {
    landing: "A ₹1,660 crore aisle HOCCO isn't in yet | Sri Krishna",
    plan: "The Plan: HOCCO Superscoops | Sri Krishna",
    talk: "Let's Talk | Sri Krishna"
  },
  evLabels: { fact: "Reported fact", third: "Third-party estimate", assume: "My assumption", calc: "My calculation" },
  sources: {
    imarc: { title: "India ice cream market, 2026: about ₹27,170 Cr (INR 271.66 bn), ~11% a year", publisher: "IMARC Group", type: "third", url: "https://www.imarcgroup.com/insight/how-big-will-india-ice-cream-industry", note: "Market research estimate. Used as the top-down base for the better-for-you segment." },
    emr: { title: "Sugar-free ice cream in India growing 17.7% CAGR", publisher: "Expert Market Research", type: "third", url: "https://www.expertmarketresearch.com/reports/india-ice-cream-and-frozen-dessert-market", note: "Used as a lower anchor for my 25% better-for-you growth assumption, which also includes protein and low-calorie SKUs." },
    bfyshare: { title: "Better-for-you share of ice cream today: 2.5% (range 2 to 3%)", publisher: "My estimate", type: "assume", note: "From counting better-for-you SKUs on quick-commerce shelves against the category. Conservative uses 2%, aggressive 3%." },
    bfygrowth: { title: "Better-for-you segment growth: 25% a year", publisher: "My estimate", type: "assume", note: "Above the 17.7% sugar-free CAGR because protein and low-calorie SKUs are growing faster on quick commerce. Conservative uses 20%, aggressive 30%." },
    bottomup: { title: "Bottom-up demand: 110M adults × 35% health-motivated × 40% monthly buyers × 35% open to BFY", publisher: "My estimate (case model)", type: "calc", note: "110M adults aged 20 to 55 in the top 60 cities; health motivation anchored on ICMR-INDIAB urban diabetes and prediabetes (~30%) plus fitness-active adults. 5.4M buyers × 2.5 occasions a month × ₹100 × 12 = ₹1,620 Cr a year." },
    icmr: { title: "ICMR-INDIAB-17: diabetes and prediabetes prevalence in India", publisher: "The Lancet Diabetes and Endocrinology, 2023", type: "fact", url: "https://www.thelancet.com/journals/landia/article/PIIS2213-8587(23)00119-5/fulltext", note: "Peer-reviewed national survey. Anchors the health-motivated share." },
    instamart: { title: "Protein orders on Instamart up 150% in two years", publisher: "Business Today, May 2026", type: "fact", url: "https://www.businesstoday.in/amp/latest/trends/story/indias-protein-craze-grows-beyond-gyms-as-eggs-paneer-dominate-online-carts-heres-what-else-india-is-ordering-533379-2026-05-27", note: "Platform-reported figure via press." },
    hocco: { title: "HOCCO: ~₹220 Cr revenue FY25, ~75% general trade, ~20% quick commerce", publisher: "YourStory, May 2025; Inc42", type: "fact", url: "https://yourstory.com/2025/05/startup-ankit-chona-hocco-india-ice-cream-market", note: "Company figures as reported in press interviews." },
    hoccofund: { title: "HOCCO raised at a valuation reported near ₹2,000 Cr", publisher: "Entrackr", type: "fact", url: "https://entrackr.com/news/ice-cream-brand-hocco-raises-rs-115-cr-at-rs-2000-cr-valuation-10511951", note: "Reported funding round." },
    blinkit: { title: "Shelf prices: NOTO ₹101, Go Zero ₹95, Get-A-Way ₹96 per 100 ml; Amul Protein stick ₹50", publisher: "Blinkit listings", type: "fact", url: "https://blinkit.com/prn/amul-protein-cola-ice-cream-stick/prid/729771", note: "Listed prices at the time of research; they change often." },
    amul: { title: "Amul launches a 10 g protein kulfi", publisher: "FoodTechBiz", type: "fact", url: "https://www.foodtechbiz.com/product-launches/amul-launches-worlds-highest-protein-kulfi", note: "Competitor launch." },
    fssai: { title: "FSSAI claims rules: 'sugar free' means ≤ 0.5 g sugars per 100 g", publisher: "FSSAI Advertising and Claims compendium", type: "fact", url: "https://fssai.gov.in/upload/uploadfiles/files/Compendium_Advertising_Claims_Regulations_16_11_2021.pdf", note: "Milk's own lactose exceeds this, so a dairy ice cream can say 'No Added Sugar' but not 'Sugar Free'." },
    som: { title: "HOCCO share path: 4% of the segment in FY28, 10% in FY30", publisher: "My estimate (case model)", type: "assume", note: "10% is comparable to the share a strong regional brand holds in its core category. FY30 runs April 2029 to March 2030, so the segment is taken at mid-year: ₹679 Cr × 1.25^3.5 ≈ ₹1,483 Cr." },
    unit: { title: "Hero cup unit economics: COGS ₹34, cold chain ₹6, quick-commerce margin 30%", publisher: "My estimate (case model)", type: "assume", note: "COGS from milk protein isolate, whey, allulose and erythritol at current supplier prices. To be confirmed by pilot batch costing (gate H6)." },
    planner: { title: "Launch planner, case plan: 12-week net revenue ~₹3.18 Cr, payback ~week 23", publisher: "My calculation (launch planner)", type: "calc", note: "Five cities, eight SKUs, quick commerce plus modern trade plus gyms, ₹2 L marketing per city per week, 1.5 lakh sample cups, ₹3 L listing per city." }
  },
  scenarios: {
    sets: {
      cons: { label: "Conservative", share: 0.02, growth: 0.20, som: 0.06 },
      base: { label: "Base", share: 0.025, growth: 0.25, som: 0.10 },
      aggr: { label: "Aggressive", share: 0.03, growth: 0.30, som: 0.12 }
    },
    compute: function (s) {
      var cat = 27170, seg26 = cat * s.share, sam = 1617;
      var seg30 = seg26 * Math.pow(1 + s.growth, 4), fy30seg = seg26 * Math.pow(1 + s.growth, 3.5);
      return {
        label: s.label, sharePct: s.share, growthPct: s.growth, somPct: s.som,
        seg26: seg26, seg30: seg30, fy30seg: fy30seg, fy30rev: fy30seg * s.som,
        pen: seg26 / sam, gap: sam - seg26, sam: sam
      };
    }
  }
};
