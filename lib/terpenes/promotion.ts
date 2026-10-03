import evidenceLedgerData from "@/data/terpenes/evidence-ledger.json";
import tpsGenesData from "@/data/terpenes/tps-genes.json";
import cultivarIndexData from "@/public/data/terpenes/cultivars/index.json";
import { terpeneSeedCompounds } from "@/lib/terpenes/data";

export type TerpenePromotionCandidate = {
  slug: string;
  score: number;
  status: "promotion-ready" | "needs-exact-cultivar-or-occurrence-review" | "needs-biological-identity-review" | "evidence-review";
  exactTpsMajorProduct: boolean;
  exactCultivarAnalyte: boolean;
  reviewedEvidenceCount: number;
  claimTypes: string[];
  sourceIds: string[];
  cultivar: {
    measurementKind: string;
    cultivarCount: number;
    measuredSamples: number;
    multiLabCultivars: number;
    positiveMedianShare: number;
  } | null;
  nextActions: string[];
};

export type TerpenePromotionQueue = {
  policy: {
    nameSimilarityEstablishesIdentity: false;
    aggregateIsomersCountAsExactCompound: false;
    tentativeTpsProductsCountAsPromotionReady: false;
    reviewedRecordRequiresExactChemicalIdentity: true;
    reviewedRecordRequiresEvidenceScopedClaims: true;
  };
  reviewedCompoundCount: number;
  candidateCount: number;
  promotionReadyCount: number;
  candidates: TerpenePromotionCandidate[];
};

type AnyRecord = Record<string, unknown>;
const asRecords=(value: unknown): AnyRecord[]=>Array.isArray(value)?value.filter((item):item is AnyRecord=>Boolean(item)&&typeof item==="object"):[];
const text=(value: unknown)=>String(value??"").trim();
const numberValue=(value: unknown)=>Number.isFinite(Number(value))?Number(value):0;

export function buildTerpenePromotionQueue(): TerpenePromotionQueue {
  const reviewed=new Set(terpeneSeedCompounds.map((compound)=>compound.slug));
  const tpsBySlug=new Map<string, AnyRecord[]>();
  for(const gene of asRecords((tpsGenesData as AnyRecord).genes)){
    for(const product of asRecords(gene.majorProducts)){
      const slug=text(product.slug);
      if(!slug) continue;
      const rows=tpsBySlug.get(slug)??[];
      rows.push(product);
      tpsBySlug.set(slug,rows);
    }
  }

  const cultivarBySlug=new Map<string, AnyRecord>();
  for(const analyte of asRecords((cultivarIndexData as AnyRecord).analytes)){
    const slug=text(analyte.canonicalSlug);
    if(slug&&text(analyte.measurementKind)==="compound") cultivarBySlug.set(slug,analyte);
  }

  const evidenceBySlug=new Map<string, AnyRecord[]>();
  for(const record of asRecords((evidenceLedgerData as AnyRecord).records)){
    const slug=text(record.compoundSlug);
    const status=text(record.reviewStatus);
    if(!slug||slug.startsWith("_")||!["source-verified","editorial-reviewed"].includes(status)) continue;
    const rows=evidenceBySlug.get(slug)??[];
    rows.push(record);
    evidenceBySlug.set(slug,rows);
  }

  const slugs=new Set([...tpsBySlug.keys(),...cultivarBySlug.keys(),...evidenceBySlug.keys()]);
  const candidates=[...slugs].filter((slug)=>!reviewed.has(slug)).map((slug)=>{
    const tps=tpsBySlug.get(slug)??[];
    const cultivar=cultivarBySlug.get(slug)??null;
    const evidence=evidenceBySlug.get(slug)??[];
    const claimTypes=[...new Set(evidence.map((record)=>text(record.claimType)).filter(Boolean))].sort();
    const sourceIds=[...new Set(evidence.map((record)=>text(record.sourceId)).filter(Boolean))].sort();
    let score=0;
    if(tps.length) score+=5;
    if(cultivar) score+=5;
    score+=Math.min(3,evidence.length);
    if(numberValue(cultivar?.multiLabCultivars)>=100) score+=1;
    if(numberValue(cultivar?.measuredSamples)>=1000) score+=1;

    const status: TerpenePromotionCandidate["status"] =
      tps.length&&cultivar?"promotion-ready":
      tps.length?"needs-exact-cultivar-or-occurrence-review":
      cultivar?"needs-biological-identity-review":"evidence-review";

    return {
      slug,
      score,
      status,
      exactTpsMajorProduct:tps.length>0,
      exactCultivarAnalyte:Boolean(cultivar),
      reviewedEvidenceCount:evidence.length,
      claimTypes,
      sourceIds,
      cultivar:cultivar?{
        measurementKind:text(cultivar.measurementKind),
        cultivarCount:numberValue(cultivar.cultivarCount),
        measuredSamples:numberValue(cultivar.measuredSamples),
        multiLabCultivars:numberValue(cultivar.multiLabCultivars),
        positiveMedianShare:numberValue(cultivar.positiveMedianShare),
      }:null,
      nextActions:status==="promotion-ready"
        ?["verify exact chemical identity and identifiers","promote only after editorial review","refresh reviewed property, sensory, and occurrence evidence","verify chapter readiness and source links"]
        :status==="needs-exact-cultivar-or-occurrence-review"
          ?["verify exact chemical identity and identifiers","resolve exact Cannabis occurrence or analyte evidence without collapsing isomers","keep candidate status until exact occurrence review is complete"]
          :["verify exact chemical identity","review Cannabis occurrence and genetics evidence"],
    };
  }).sort((a,b)=>b.score-a.score||a.slug.localeCompare(b.slug));

  return {
    policy:{
      nameSimilarityEstablishesIdentity:false,
      aggregateIsomersCountAsExactCompound:false,
      tentativeTpsProductsCountAsPromotionReady:false,
      reviewedRecordRequiresExactChemicalIdentity:true,
      reviewedRecordRequiresEvidenceScopedClaims:true,
    },
    reviewedCompoundCount:reviewed.size,
    candidateCount:candidates.length,
    promotionReadyCount:candidates.filter((candidate)=>candidate.status==="promotion-ready").length,
    candidates,
  };
}
