import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  FlaskConical, 
  Droplet, 
  Thermometer, 
  Search, 
  Filter, 
  Sparkles, 
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Bug,
  Leaf,
  Sprout
} from 'lucide-react';
import { fetchRiskAnalysis } from '../api';

const CROP_DISEASES_MAP = {
  Wheat: [
    { name: 'Yellow Rust (Puccinia striiformis)', disease_type: 'Fungal Rust', probability_percent: 18.0, risk_level: 'Low Risk', symptoms: 'Bright yellow pustules forming linear stripes along leaf veins.', organic_solution: 'Spray Neem oil extract (5ml/L) and ensure wide row spacing for canopy aeration.', chemical_solution: 'Apply Propiconazole 25% EC @ 1ml/L water or Tebuconazole @ 1.5ml/L.' },
    { name: 'Powdery Mildew (Blumeria graminis)', disease_type: 'Powdery Mildew', probability_percent: 15.0, risk_level: 'Low Risk', symptoms: 'White powdery fungal patches appearing on lower leaves and stems.', organic_solution: 'Foliar spray of Potassium Bicarbonate (3g/L) or diluted milk whey solution.', chemical_solution: 'Apply Hexaconazole 5% EC @ 2ml/L or Wettable Sulphur 80% WP @ 3g/L.' }
  ],
  Rice: [
    { name: 'Rice Blast (Magnaporthe oryzae)', disease_type: 'Fungal Blast / Neck Rot', probability_percent: 22.0, risk_level: 'Low Risk', symptoms: 'Spindle-shaped lesions with grey centers on leaves and neck rot on panicles.', organic_solution: 'Apply Pseudomonas fluorescens bio-fungicide @ 10g/L and avoid excess nitrogen.', chemical_solution: 'Foliar spray of Tricyclazole 75% WP @ 0.6g/L or Isoprothiolane 40% EC @ 1.5ml/L.' },
    { name: 'Bacterial Leaf Blight (Xanthomonas oryzae)', disease_type: 'Bacterial Blight', probability_percent: 19.0, risk_level: 'Low Risk', symptoms: 'Water-soaked wavy yellowish lesions starting from leaf tips.', organic_solution: 'Spray Fresh Cow Dung Extract filtrate (5%) or Neem cake soil incorporation.', chemical_solution: 'Spray Copper Oxychloride 50% WP @ 2.5g/L mixed with Streptocycline @ 6g per 60L water.' }
  ],
  Maize: [
    { name: 'Northern Corn Leaf Blight (Exserohilum turcicum)', disease_type: 'Fungal Leaf Blight', probability_percent: 17.0, risk_level: 'Low Risk', symptoms: 'Long elliptical greyish-green lesions on leaves.', organic_solution: 'Incorporate Trichoderma viride into soil and rotate with leguminous crops.', chemical_solution: 'Spray Mancozeb 75% WP @ 2.5g/L or Azoxystrobin @ 1ml/L.' },
    { name: 'Charcoal Stalk Rot (Macrophomina phaseolina)', disease_type: 'Fungal Stalk Rot', probability_percent: 14.0, risk_level: 'Low Risk', symptoms: 'Internal stalk disintegration with minute black sclerotia inside pith.', organic_solution: 'Apply bio-agent Trichoderma harzianum @ 5kg/ha blended with FYM.', chemical_solution: 'Seed treatment with Carbendazim 50% WP @ 2g/kg seed before sowing.' }
  ],
  Cotton: [
    { name: 'Fusarium Wilt (Fusarium oxysporum)', disease_type: 'Vascular Wilt', probability_percent: 20.0, risk_level: 'Low Risk', symptoms: 'Yellowing and drooping of leaves with brown vascular discoloration in stems.', organic_solution: 'Soil drenching with Trichoderma viride and farmyard manure soil enrichment.', chemical_solution: 'Soil drench with Carbendazim 12% + Mancozeb 63% WP @ 2g/L water.' },
    { name: 'Cotton Leaf Curl Virus (CLCuV)', disease_type: 'Viral Leaf Curl', probability_percent: 16.0, risk_level: 'Low Risk', symptoms: 'Upward curling of leaf margins and enation on lower leaf surface.', organic_solution: 'Control whitefly vector using yellow sticky traps and Neem seed kernel extract (5%).', chemical_solution: 'Spray Imidacloprid 17.8% SL @ 0.5ml/L or Acetamiprid 20% SP @ 0.2g/L.' }
  ],
  Sugarcane: [
    { name: 'Red Rot (Colletotrichum falcatum)', disease_type: 'Fungal Stalk Rot', probability_percent: 25.0, risk_level: 'Low Risk', symptoms: 'Reddening of internal stalk tissue with transverse white patches and alcohol odor.', organic_solution: 'Hot water sett treatment at 50°C for 2 hours before planting.', chemical_solution: 'Dipper sett treatment in Carbendazim 50% WP @ 1g/L for 15 minutes.' },
    { name: 'Sugarcane Smut (Sporisorium scitamineum)', disease_type: 'Fungal Smut', probability_percent: 18.0, risk_level: 'Low Risk', symptoms: 'Black whip-like structure emerging from apex of infected canes.', organic_solution: 'Rogue out infected smut whips using plastic bags to avoid spore dispersal.', chemical_solution: 'Spray Propiconazole 25% EC @ 1ml/L on standing cane canopy.' }
  ],
  Soybean: [
    { name: 'Soybean Rust (Phakopsora pachyrhizi)', disease_type: 'Fungal Rust', probability_percent: 21.0, risk_level: 'Low Risk', symptoms: 'Tan to reddish-brown lesions with pustules on underside of lower leaves.', organic_solution: 'Spray bio-control agent Bacillus subtilis @ 5g/L at flowering.', chemical_solution: 'Spray Hexaconazole 5% EC @ 1ml/L or Tebuconazole + Trifloxystrobin @ 0.7g/L.' },
    { name: 'Charcoal Rot (Macrophomina phaseolina)', disease_type: 'Fungal Root Rot', probability_percent: 17.0, risk_level: 'Low Risk', symptoms: 'Reddish-brown discoloration of taproot pith with black microsclerotia.', organic_solution: 'Soil enrichment with Trichoderma harzianum @ 2.5 kg/acre.', chemical_solution: 'Seed treatment with Thiram 75% WP @ 3g/kg seed.' }
  ],
  Tomato: [
    { name: 'Early Blight (Alternaria solani)', disease_type: 'Fungal Blight', probability_percent: 24.0, risk_level: 'Low Risk', symptoms: 'Concentric target-board ring dark spots on older leaves.', organic_solution: 'Spray Copper Sulfate + Lime (Bordeaux mixture 1%) or Neem oil (5ml/L).', chemical_solution: 'Spray Chlorothalonil 75% WP @ 2g/L or Mancozeb @ 2.5g/L.' },
    { name: 'Late Blight (Phytophthora infestans)', disease_type: 'Fungal Blight', probability_percent: 22.0, risk_level: 'Low Risk', symptoms: 'Water-soaked dark brown spots with white fungal mold under leaves.', organic_solution: 'Prune lower leaves for ground aeration and spray Trichoderma harzianum.', chemical_solution: 'Spray Cymoxanil + Mancozeb @ 2g/L or Metalaxyl + Mancozeb @ 2.5g/L.' }
  ],
  Potato: [
    { name: 'Potato Late Blight (Phytophthora infestans)', disease_type: 'Fungal Mildew & Blight', probability_percent: 26.0, risk_level: 'Moderate Risk', symptoms: 'Rapid blackening of foliage with fuzzy white mildew growth beneath wet leaves.', organic_solution: 'Earthing up soil to cover tubers and spraying Bio-fungicide Pseudomonas fluorescens.', chemical_solution: 'Foliar spray of Dimethomorph 50% WP @ 1g/L or Metalaxyl-MZ @ 2.5g/L.' },
    { name: 'Bacterial Wilt (Ralstonia solanacearum)', disease_type: 'Bacterial Wilt', probability_percent: 19.0, risk_level: 'Low Risk', symptoms: 'Rapid wilting of foliage with bacterial slime streaming from vascular bundles.', organic_solution: 'Crop rotation with non-solanaceous crops and soil solarization.', chemical_solution: 'Soil drenching with Streptocycline @ 1g/10L water.' }
  ],
  Barley: [
    { name: 'Net Blotch (Pyrenophora teres)', disease_type: 'Fungal Foliar Blotch', probability_percent: 16.0, risk_level: 'Low Risk', symptoms: 'Dark brown net-like crisscross bar lines on leaves.', organic_solution: 'Seed dressing with Trichoderma viride @ 4g/kg seed.', chemical_solution: 'Foliar spray of Propiconazole 25% EC @ 1ml/L.' },
    { name: 'Barley Covered Smut (Ustilago hordei)', disease_type: 'Fungal Smut', probability_percent: 14.0, risk_level: 'Low Risk', symptoms: 'Persistent grayish membrane replacing grain heads with black smut mass.', organic_solution: 'Hot water seed soak treatment @ 52°C for 11 minutes.', chemical_solution: 'Seed treatment with Carboxin 75% WP @ 2.5g/kg seed.' }
  ],
  Chickpea: [
    { name: 'Ascochyta Blight (Ascochyta rabiei)', disease_type: 'Fungal Blight', probability_percent: 19.0, risk_level: 'Low Risk', symptoms: 'Circular necrotic lesions with dark pycnidia rings on leaves and stems.', organic_solution: 'Use resistant cultivars and spray Trichoderma harzianum formulation.', chemical_solution: 'Seed treatment with Thiophanate-methyl @ 2g/kg and foliar spray of Chlorothalonil @ 2g/L.' },
    { name: 'Fusarium Wilt (Fusarium oxysporum f. sp. ciceris)', disease_type: 'Vascular Wilt', probability_percent: 18.0, risk_level: 'Low Risk', symptoms: 'Drooping of petioles and leaflets with dark brown xylem vessel staining.', organic_solution: 'Seed treatment with Trichoderma viride @ 5g/kg seed.', chemical_solution: 'Seed treatment with Carbendazim 25% + Thiram 50% WS @ 3g/kg.' }
  ],
  Groundnut: [
    { name: 'Tikka Leaf Spot (Cercospora arachidicola)', disease_type: 'Fungal Leaf Spot', probability_percent: 23.0, risk_level: 'Low Risk', symptoms: 'Small dark brown circular spots surrounded by yellow halos on leaves.', organic_solution: 'Foliar spray of 5% Neem seed kernel extract at 30 & 50 days after sowing.', chemical_solution: 'Spray Carbendazim 50% WP @ 1g/L or Mancozeb @ 2g/L.' },
    { name: 'Stem Rot / Collar Rot (Sclerotium rolfsii)', disease_type: 'Fungal Stem Rot', probability_percent: 17.0, risk_level: 'Low Risk', symptoms: 'White cottony mycelial fan growth on stem base near soil line.', organic_solution: 'Apply Pseudomonas fluorescens bio-agent @ 2.5 kg/ha with neem cake.', chemical_solution: 'Soil drenching with Tebuconazole 25.9% EC @ 1.5ml/L.' }
  ],
  Coffee: [
    { name: 'Coffee Leaf Rust (Hemileia vastatrix)', disease_type: 'Fungal Rust', probability_percent: 28.0, risk_level: 'Moderate Risk', symptoms: 'Powdery orange-yellow spots on lower leaf surfaces causing severe defoliation.', organic_solution: 'Prune shade trees for sunlight penetration and apply Bordeaux mixture (0.5%).', chemical_solution: 'Spray Copper Oxychloride 50% WP @ 3g/L or Cyproconazole @ 0.5ml/L.' },
    { name: 'Black Rot (Koleroga / Pellicularia koleroga)', disease_type: 'Fungal Foliar Rot', probability_percent: 20.0, risk_level: 'Low Risk', symptoms: 'Blackened leaves hanging bound by web-like fungal threads.', organic_solution: 'Centering and handling of coffee bushes for aeration.', chemical_solution: 'Spray Bordeaux mixture (1%) before monsoon onset.' }
  ],
  Tea: [
    { name: 'Blister Blight (Exobasidium vexans)', disease_type: 'Fungal Blister Blight', probability_percent: 27.0, risk_level: 'Moderate Risk', symptoms: 'Translucent pale-yellow blister spots on young tender shoots.', organic_solution: 'Apply bio-control agent Trichoderma harzianum @ 2g/L after pluckings.', chemical_solution: 'Spray Copper Oxychloride @ 2.1g/L + Nickel Chloride @ 2.1g/L formulation.' },
    { name: 'Black Rot (Corticium theae)', disease_type: 'Fungal Leaf Rot', probability_percent: 18.0, risk_level: 'Low Risk', symptoms: 'Dark brown patches on mature leaves causing premature dropping.', organic_solution: 'Pruning diseased branches and removing weeds around bush stems.', chemical_solution: 'Foliar spray of Copper Oxychloride 50% WP @ 2.5g/L.' }
  ],
  Onion: [
    { name: 'Purple Blotch (Alternaria porri)', disease_type: 'Fungal Purple Blotch', probability_percent: 21.0, risk_level: 'Low Risk', symptoms: 'Small water-soaked sunken lesions turning purple with yellow margins.', organic_solution: 'Spray Neem oil (3ml/L) blended with sticky sticker agent.', chemical_solution: 'Spray Mancozeb 75% WP @ 2.5g/L or Difenoconazole @ 1ml/L.' },
    { name: 'Stemphylium Leaf Blight (Stemphylium vesicarium)', disease_type: 'Fungal Leaf Blight', probability_percent: 18.0, risk_level: 'Low Risk', symptoms: 'Elongated light-yellowish brown spots on leaves with dark spore masses.', organic_solution: 'Ensure proper field drainage and foliar spray of Trichoderma harzianum @ 5g/L.', chemical_solution: 'Foliar spray of Tebuconazole 25.9% EC @ 1ml/L or Propiconazole @ 1ml/L.' }
  ],
  Garlic: [
    { name: 'Downy Mildew (Peronospora destructor)', disease_type: 'Downy Mildew', probability_percent: 20.0, risk_level: 'Low Risk', symptoms: 'Pale-green elongated spots covered with violet furry mold growth.', organic_solution: 'Foliar spray of Trichoderma harzianum and avoiding overhead irrigation.', chemical_solution: 'Spray Metalaxyl 8% + Mancozeb 64% WP @ 2.5g/L.' },
    { name: 'Stemphylium Blight (Stemphylium vesicarium)', disease_type: 'Fungal Blight', probability_percent: 17.0, risk_level: 'Low Risk', symptoms: 'Yellow-brown lesions on leaves turning black with fungal spores.', organic_solution: 'Use clean seed bulbs and spray Garlic-Neem bio-extract.', chemical_solution: 'Spray Chlorothalonil 75% WP @ 2g/L.' }
  ],
  Mustard: [
    { name: 'Alternaria Blight (Alternaria brassicae)', disease_type: 'Fungal Foliar Blight', probability_percent: 22.0, risk_level: 'Low Risk', symptoms: 'Concentric ring brown circular lesions on leaves, pods, and stems.', organic_solution: 'Spray Garlic bulb extract (5%) or Neem cake soil amendment.', chemical_solution: 'Foliar spray of Mancozeb 75% WP @ 2g/L or Iprodione @ 2g/L.' },
    { name: 'White Rust (Albugo candida)', disease_type: 'Fungal Rust', probability_percent: 19.0, risk_level: 'Low Risk', symptoms: 'White to cream-colored raised pustules on lower leaf surface.', organic_solution: 'Timely sowing in October and foliar spray of Trichoderma harzianum.', chemical_solution: 'Spray Metalaxyl-MZ @ 2g/L water.' }
  ],
  Sunflower: [
    { name: 'Alternaria Leaf Blight (Alternaria helianthi)', disease_type: 'Fungal Leaf Blight', probability_percent: 18.0, risk_level: 'Low Risk', symptoms: 'Dark brown necrotic spots with yellow halos on leaf blades.', organic_solution: 'Seed treatment with Pseudomonas fluorescens @ 10g/kg seed.', chemical_solution: 'Spray Ziram 80% WP @ 2g/L or Mancozeb @ 2.5g/L.' },
    { name: 'Sunflower Head Rot (Rhizopus oryzae)', disease_type: 'Fungal Head Rot', probability_percent: 15.0, risk_level: 'Low Risk', symptoms: 'Brown water-soaked soft rot of head back with black spore heads.', organic_solution: 'Avoid sprinkler irrigation during flowering stage.', chemical_solution: 'Foliar spray of Mancozeb 75% WP @ 2g/L at head formation.' }
  ],
  Apple: [
    { name: 'Apple Scab (Venturia inaequalis)', disease_type: 'Fungal Fruit & Leaf Scab', probability_percent: 29.0, risk_level: 'Moderate Risk', symptoms: 'Olive-green velvety spots turning scabby and dark on leaves and fruits.', organic_solution: 'Prune canopy and spray Lime Sulphur solution (1%) during pink bud stage.', chemical_solution: 'Spray Myclobutanil 10% WP @ 0.4g/L or Captan 50% WP @ 2.5g/L.' },
    { name: 'Powdery Mildew (Podosphaera leucotricha)', disease_type: 'Powdery Mildew', probability_percent: 21.0, risk_level: 'Low Risk', symptoms: 'White powdery coating on young shoots, leaves, and flower buds.', organic_solution: 'Pruning mildewed shoot tips in winter.', chemical_solution: 'Spray Penconazole 10% EC @ 0.5ml/L or Wettable Sulphur @ 3g/L.' }
  ],
  Banana: [
    { name: 'Sigatoka Leaf Spot (Mycosphaerella musicola)', disease_type: 'Fungal Leaf Spot', probability_percent: 25.0, risk_level: 'Low Risk', symptoms: 'Dark reddish-brown streaks expanding into oblong leaf spots with grey centers.', organic_solution: 'De-leafing infected leaves and spraying Mineral oil emulsion (1%).', chemical_solution: 'Spray Propiconazole 25% EC @ 1ml/L or Carbendazim @ 1g/L.' },
    { name: 'Panama Wilt (Fusarium oxysporum f. sp. cubense)', disease_type: 'Vascular Wilt', probability_percent: 21.0, risk_level: 'Low Risk', symptoms: 'Yellowing of lower leaf margins progressing upward with longitudinal pseudostem splitting.', organic_solution: 'Soil application of Trichoderma viride @ 25g/plant with FYM.', chemical_solution: 'Corm injection of Carbendazim 50% WP (3ml of 2% soln).' }
  ],
  Watermelon: [
    { name: 'Anthracnose (Colletotrichum orbiculare)', disease_type: 'Fungal Anthracnose', probability_percent: 20.0, risk_level: 'Low Risk', symptoms: 'Sunken water-soaked circular dark lesions on leaves and melon rind.', organic_solution: 'Crop rotation and foliar spray of Trichoderma harzianum.', chemical_solution: 'Spray Chlorothalonil 75% WP @ 2g/L or Copper Oxychloride @ 2.5g/L.' },
    { name: 'Fusarium Wilt (Fusarium oxysporum f. sp. niveum)', disease_type: 'Vascular Wilt', probability_percent: 18.0, risk_level: 'Low Risk', symptoms: 'Dulling of vine leaf color followed by rapid permanent wilting.', organic_solution: 'Grafting onto resistant bottle gourd rootstocks.', chemical_solution: 'Soil drenching with Carbendazim 50% WP @ 1g/L water.' }
  ]
};

export default function RiskField({ predictionResult, setActiveTab, onSelectCropForPrediction }) {
  const [formData, setFormData] = useState({
    crop_type: predictionResult?.crop_type || 'Wheat',
    soil_type: predictionResult?.soil_type || 'Loam',
    soil_ph: predictionResult?.soil_ph || 6.5,
    nitrogen: predictionResult?.nitrogen || 120,
    phosphorus: predictionResult?.phosphorus || 60,
    potassium: predictionResult?.potassium || 40,
    temperature: predictionResult?.temperature || 22.0,
    rainfall: predictionResult?.rainfall || 650,
    humidity: predictionResult?.humidity || 65.0,
    irrigation_level: predictionResult?.irrigation_level || 'Medium',
    sunshine_hours: predictionResult?.sunshine_hours || 8.0
  });

  const [riskData, setRiskData] = useState(predictionResult || null);
  const [loading, setLoading] = useState(false);
  const [selectedRiskCrop, setSelectedRiskCrop] = useState('target');
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const cropsList = ['Wheat','Rice','Maize','Cotton','Sugarcane','Soybean','Tomato','Potato','Barley','Chickpea','Groundnut','Coffee','Tea','Onion','Garlic','Mustard','Sunflower','Apple','Banana','Watermelon'];

  useEffect(() => {
    runRiskAnalysis(formData);
  }, []);

  const runRiskAnalysis = async (payload) => {
    setLoading(true);
    try {
      const res = await fetchRiskAnalysis(payload);
      setRiskData(res);
    } catch (err) {
      console.error('Risk analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? (value === '' ? '' : parseFloat(value)) : value;
    const updated = { ...formData, [name]: val };
    setFormData(updated);
    if (name === 'crop_type') {
      setSelectedRiskCrop('target');
    }
    runRiskAnalysis(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runRiskAnalysis(formData);
  };

  const targetRiskPercent = riskData?.target_crop_risk_percent ?? riskData?.risk_percent ?? 25.0;
  const targetRiskLevel = riskData?.target_crop_risk_level || riskData?.risk_level || (targetRiskPercent > 50 ? 'High Risk' : 'Low Risk');
  const targetDiseases = riskData?.target_crop_diseases || riskData?.diseases || [];

  const recCrop = riskData?.recommended_crop || 'Onion';
  const recRiskPercent = riskData?.recommended_crop_risk_percent ?? 15.0;
  const recRiskLevel = riskData?.recommended_crop_risk_level || 'Low Risk';
  const recDiseases = riskData?.recommended_crop_diseases || [];

  const activeCropName = selectedRiskCrop === 'recommended' ? recCrop : formData.crop_type;
  const rawDiseases = selectedRiskCrop === 'recommended' ? recDiseases : targetDiseases;
  const activeDiseases = (rawDiseases && rawDiseases.length > 0) 
    ? rawDiseases 
    : (CROP_DISEASES_MAP[activeCropName] || CROP_DISEASES_MAP['Onion']);

  const riskMatrix = riskData?.all_crops_risk_matrix || [];

  const filteredMatrix = riskMatrix.filter(item => {
    const matchesSearch = item.crop_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.primary_diseases.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = riskFilter === 'All' || item.risk_level === riskFilter;
    return matchesSearch && matchesFilter;
  });

  const getRiskBadgeColor = (level, percent) => {
    if (percent >= 75 || level === 'Severe Risk') return 'bg-red-100 text-red-800 border-red-300';
    if (percent >= 50 || level === 'High Risk') return 'bg-amber-100 text-amber-800 border-amber-300';
    if (percent >= 25 || level === 'Moderate Risk') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl p-5 md:p-6 bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 text-white shadow-lg border border-teal-800/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5 backdrop-blur-xs">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Agronomic Disease & Risk Intelligence
              </span>
            </div>
            <h2 className="text-xl md:text-3xl font-extrabold text-white">Crop Risk Field & Pathology Solution Center</h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Evaluate real-time disease probabilities, environmental infection vectors, and organic & chemical solutions across all 20 crop varieties.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab && setActiveTab('prediction')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <Sprout className="w-4 h-4" /> Run New Prediction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-4 glass-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Bug className="w-4 h-4 text-emerald-600" /> Field & Climate Parameters
          </h3>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Crop Variety</label>
            <select name="crop_type" value={formData.crop_type} onChange={handleChange} className="w-full">
              {cropsList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Temp (°C)</label>
              <input type="number" step="0.5" min="-10" max="60" name="temperature" value={formData.temperature} onChange={handleChange} className="w-full" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Humidity (%)</label>
              <input type="number" step="0.5" min="0" max="100" name="humidity" value={formData.humidity} onChange={handleChange} className="w-full" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rainfall (mm)</label>
              <input type="number" step="1" min="0" max="5000" name="rainfall" value={formData.rainfall} onChange={handleChange} className="w-full" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Soil pH</label>
              <input type="number" step="0.1" min="3.5" max="10.0" name="soil_ph" value={formData.soil_ph} onChange={handleChange} className="w-full" required />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary justify-center text-xs py-2.5">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{loading ? 'Evaluating Pathology Risk...' : 'Analyze Risk Field'}</span>
          </button>
        </form>

        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              onClick={() => setSelectedRiskCrop('target')}
              className={`p-5 rounded-2xl cursor-pointer transition-all border ${selectedRiskCrop === 'target' ? 'bg-white border-emerald-500 ring-2 ring-emerald-500 shadow-md scale-[1.01]' : 'bg-white border-slate-200 hover:border-emerald-300'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">EXPECTED CROP RISK</span>
                <span className={`px-2.5 py-0.5 rounded-full border text-xs font-black ${getRiskBadgeColor(targetRiskLevel, targetRiskPercent)}`}>
                  {targetRiskPercent}% {targetRiskLevel}
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-xl font-black text-slate-900">{formData.crop_type}</h3>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${targetRiskPercent > 60 ? 'bg-red-500' : targetRiskPercent > 35 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${targetRiskPercent}%` }} />
                </div>
              </div>
              <div className="text-xs text-slate-600 pt-3 flex justify-between items-center">
                <span>Pathogens: {targetDiseases.length > 0 ? targetDiseases.length : 0}</span>
                <span className="font-bold text-emerald-600 text-[10px] uppercase">Active View</span>
              </div>
            </div>

            <div 
              onClick={() => setSelectedRiskCrop('recommended')}
              className={`p-5 rounded-2xl cursor-pointer transition-all border ${selectedRiskCrop === 'recommended' ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500 shadow-md scale-[1.01]' : 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-400'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">RECOMMENDED CROP RISK</span>
                <span className={`px-2.5 py-0.5 rounded-full border text-xs font-black ${getRiskBadgeColor(recRiskLevel, recRiskPercent)}`}>
                  {recRiskPercent}% {recRiskLevel}
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-xl font-black text-emerald-900">{recCrop}</h3>
                <div className="w-full bg-emerald-100 rounded-full h-2 mt-2 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-600 transition-all duration-500" style={{ width: `${recRiskPercent}%` }} />
                </div>
              </div>
              <div className="text-xs text-emerald-800 pt-3 flex justify-between items-center">
                <span>Advantage: {targetRiskPercent > recRiskPercent ? `${(targetRiskPercent - recRiskPercent).toFixed(1)}% safer` : 'Optimal'}</span>
                {selectedRiskCrop === 'recommended' && <span className="font-bold text-emerald-600 text-[10px] uppercase">Active View</span>}
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Disease Pathology Diagnostics for {activeCropName}
            </h3>
            {activeDiseases.length > 0 ? (
              <div className="space-y-4">
                {activeDiseases.map((disease, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Bug className="w-4 h-4 text-slate-700" />
                        <h4 className="font-extrabold text-sm text-slate-900">{disease.name}</h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full border text-xs font-extrabold ${getRiskBadgeColor(disease.risk_level, disease.probability_percent)}`}>
                        {disease.probability_percent}% Prob
                      </span>
                    </div>
                    <p className="text-xs text-slate-700"><strong>Symptoms:</strong> {disease.symptoms}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                        <span className="font-bold text-emerald-900 block mb-1">Organic Solution</span>
                        {disease.organic_solution}
                      </div>
                      <div className="p-3 rounded-lg bg-teal-50 border border-teal-200">
                        <span className="font-bold text-teal-900 block mb-1">Chemical Dose</span>
                        {disease.chemical_solution}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs">No severe pathogens detected for {activeCropName}.</div>
            )}
          </div>
        </div>
      </div>

      {/* 20 Crop Risk Breakdown Matrix */}
      <div className="glass-panel p-5 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-600" /> All 20 Crops Disease Risk Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative pathology risk percentages under your field's exact weather and soil profile.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search crop or disease..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="pl-8 text-xs py-1.5 w-48" 
              />
            </div>
            <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="text-xs py-1.5">
              <option value="All">All Risk Levels</option>
              <option value="Low Risk">Low Risk (&lt;25%)</option>
              <option value="Moderate Risk">Moderate Risk (25-50%)</option>
              <option value="High Risk">High Risk (50-75%)</option>
              <option value="Severe Risk">Severe Risk (&gt;75%)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full text-left text-xs md:text-sm text-slate-700 min-w-[620px]">
            <thead className="text-xs uppercase bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
              <tr>
                <th className="px-3 py-2.5">Crop Variety</th>
                <th className="px-3 py-2.5">Risk Level</th>
                <th className="px-3 py-2.5">Disease Risk Gauge</th>
                <th className="px-3 py-2.5 hidden md:table-cell">Disease Categories & Types</th>
                <th className="px-3 py-2.5 hidden lg:table-cell">Primary Susceptible Diseases</th>
                <th className="px-3 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2.5 font-bold text-slate-900 flex items-center gap-2">
                    <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {row.crop_type}
                    {row.crop_type === formData.crop_type && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Target</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded-md border text-xs font-bold ${getRiskBadgeColor(row.risk_level, row.risk_percent)}`}>
                      {row.risk_percent}% {row.risk_level}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 w-36">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          row.risk_percent > 60 ? 'bg-red-500' : row.risk_percent > 35 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${row.risk_percent}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2.5 hidden md:table-cell text-xs">
                    <div className="flex items-center gap-1 flex-wrap">
                      {(row.disease_types || ['Fungal Pathology']).map((type, tIdx) => (
                        <span key={tIdx} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold">
                          🔬 {type}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 hidden lg:table-cell text-xs text-slate-600">
                    {row.primary_diseases.join(', ')}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => {
                        setFormData(prev => ({ ...prev, crop_type: row.crop_type }));
                        runRiskAnalysis({ ...formData, crop_type: row.crop_type });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Analyze Diseases
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
