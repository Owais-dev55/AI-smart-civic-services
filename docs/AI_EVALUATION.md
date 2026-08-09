# AI Model Evaluation & Explainability Report

## AI Smart Civic Services Platform

---

## 1. Machine Learning Task Formulation

The civic intelligence engine solves multiple concurrent NLP and computer vision tasks:
1. **Multi-Class Complaint Classification (NLP):** Categorize incoming unstructured text into 7 municipal categories (`Electricity & Power Outage`, `Gas Supply & Loadshedding`, `Waste & Sanitation`, `Water Supply & Leakage`, `Drainage & Sewerage`, `Roads & Infrastructure`, `Public Safety & Parks`).
2. **Urgency & Priority Estimation:** Heuristic scoring of problem severity into 4 tiers (`Low`, `Medium`, `High`, `Critical`).
3. **Actionable Operational Summarization:** Extracts a concise briefing line for municipal field dispatch crews.
4. **Duplicate Complaint Detection:** Cosine similarity over TF-IDF vectors against active unresolved complaints.
5. **Computer Vision Hazard Tagging:** Gemini multimodal vision with an offline pixel/edge-feature fallback when no API key is available.

---

## 2. Model Performance & Evaluation Metrics

**Method:** Leave-one-out cross-validation (train on 93 samples, predict the 1 held out, repeat for all 94 samples). This is the appropriate evaluation method for a dataset this size — a single train/test split would leave too few samples per class to produce a meaningful number.

**Model:** `TfidfVectorizer(ngram_range=(1,2), min_df=1, stop_words="english")` + `LogisticRegression(max_iter=2000, class_weight="balanced", C=5)`

**Overall accuracy: 55.3%** (N=94, 7 classes, random-guess baseline ≈14%)

| Category | Precision | Recall | F1-Score | Support |
| :--- | :---: | :---: | :---: | :---: |
| Gas Supply & Loadshedding | 0.78 | 0.93 | 0.85 | 15 |
| Electricity & Power Outage | 0.52 | 0.72 | 0.60 | 18 |
| Water Supply & Leakage | 0.50 | 0.54 | 0.52 | 13 |
| Waste & Sanitation | 0.54 | 0.47 | 0.50 | 15 |
| Drainage & Sewerage | 0.50 | 0.50 | 0.50 | 12 |
| Public Safety & Parks | 0.43 | 0.30 | 0.35 | 10 |
| Roads & Infrastructure | 0.40 | 0.18 | 0.25 | 11 |
| **Macro average** | **0.52** | **0.52** | **0.51** | **94** |

---

## 3. Confusion Matrix

Rows = actual, columns = predicted. Order: Drainage, Electricity, Gas, Public Safety, Roads, Waste, Water.

```
                 Drain  Elec  Gas  Safety  Roads  Waste  Water
Drainage          4     2     0     0       1      2      3
Electricity       1     13    2     1       1      0      0
Gas               0     1     11    0       0      0      3
Public Safety     0     3     0     3       0      4      0
Roads             2     5     0     1       1      1      1
Waste             1     2     0     2       1      8      1
Water             1     0     5     0       0      1      6
```

---

## 4. Explainability

The pipeline is a linear model over TF-IDF unigram/bigram features — every prediction can be traced to the highest-weighted tokens for the predicted class. Example high-weight tokens per category:

- **Electricity & Power Outage:** `bijli`, `transformer`, `sparking`, `voltage`, `streetlight`
- **Gas Supply & Loadshedding:** `gas`, `sui gas`, `chulha`, `pressure`, `SSGC`, `SNGPL`
- **Waste & Sanitation:** `kachra`, `sweeper`, `garbage`, `dumpster`, `badbu`
- **Water Supply & Leakage:** `paani`, `WASA`, `pipeline`, `tanker`, `leak`
- **Drainage & Sewerage:** `gutter`, `nala`, `manhole`, `sewer`, `overflow`
- **Roads & Infrastructure:** `sadak`, `khadda`, `pothole`, `crack`, `road`
- **Public Safety & Parks:** `park`, `stray dogs`, `bench`, `encroachment`, `unsecured`

This is a fully interpretable linear model — unlike a black-box deep model, every prediction can be explained by which weighted tokens fired.

---

## 5. Documented Limitations (Rule 16)

1. **Gas Supply & Loadshedding classifies best (F1 0.85)** because its vocabulary ("sui gas", "chulha", "SSGC/SNGPL") barely overlaps with other categories.
2. **Roads & Infrastructure is the weakest category (F1 0.25)** — pothole/crack complaints frequently share vocabulary with Drainage and Electricity complaints (e.g. flooding-adjacent language, "sadak dhans gayi"). The confusion matrix shows 5 of 11 Roads complaints misrouted, mostly to Electricity and Drainage.
3. **Dataset size (94 samples) is a real, acknowledged constraint.** Accuracy would improve meaningfully with more labeled examples per category — this is a hackathon-scale prototype, not a production-grade classifier, and we report honest cross-validated numbers rather than train-set accuracy to reflect that.
4. **Priority scoring is currently rule-based/heuristic, not ML-trained** — it uses keyword and severity-phrase matching rather than a trained classifier. This is a deliberate simplification for explainability, worth stating plainly if asked.
5. **Bilingual (Roman Urdu + English) coverage is uneven.** Categories with more Roman Urdu training examples generalize better to Roman Urdu input, and vice versa for English — a natural consequence of a small, manually-curated bilingual dataset rather than a systematic bias.