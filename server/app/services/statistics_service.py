"""
Statistical Analytics Engine for AI Smart Civic Services Platform.
Implements Benchmark 2 (Batch 4 Statistics) with comprehensive measures of central tendency,
dispersion, frequency distributions, Quartile/IQR outlier fences, and plain-English civic interpretations.
"""

import math
from typing import List, Dict, Any, Optional, Tuple
from collections import Counter


class StatisticalEngine:
    """
    Computes rigorous descriptive statistics, frequency distributions,
    IQR boxplot boundaries, upper/lower outlier fences, and generates
    decision-making natural language interpretations for municipal leaders.
    """

    @staticmethod
    def calculate_mean(values: List[float]) -> float:
        if not values:
            return 0.0
        return round(sum(values) / len(values), 2)

    @staticmethod
    def calculate_median(values: List[float]) -> float:
        if not values:
            return 0.0
        sorted_vals = sorted(values)
        n = len(sorted_vals)
        mid = n // 2
        if n % 2 == 0:
            return round((sorted_vals[mid - 1] + sorted_vals[mid]) / 2.0, 2)
        else:
            return round(sorted_vals[mid], 2)

    @staticmethod
    def calculate_mode(values: List[float]) -> float:
        if not values:
            return 0.0
        # Round values to 1 decimal place to group close resolution times
        rounded_vals = [round(v, 1) for v in values]
        counts = Counter(rounded_vals)
        max_count = max(counts.values())
        modes = [val for val, count in counts.items() if count == max_count]
        return round(modes[0], 2)

    @staticmethod
    def calculate_variance(values: List[float], is_sample: bool = True) -> float:
        if len(values) < 2:
            return 0.0
        mean_val = sum(values) / len(values)
        squared_diff_sum = sum((x - mean_val) ** 2 for x in values)
        divisor = len(values) - 1 if is_sample else len(values)
        return round(squared_diff_sum / divisor, 2)

    @staticmethod
    def calculate_standard_deviation(values: List[float], is_sample: bool = True) -> float:
        var = StatisticalEngine.calculate_variance(values, is_sample=is_sample)
        return round(math.sqrt(var), 2)

    @staticmethod
    def calculate_quartiles(values: List[float]) -> Tuple[float, float, float, float]:
        """
        Computes Q1 (25th percentile), Q2 (Median), Q3 (75th percentile), and IQR.
        """
        if not values:
            return 0.0, 0.0, 0.0, 0.0
        
        sorted_vals = sorted(values)
        n = len(sorted_vals)
        
        # Method: Tukey's hinges
        mid = n // 2
        if n % 2 == 0:
            lower_half = sorted_vals[:mid]
            upper_half = sorted_vals[mid:]
        else:
            lower_half = sorted_vals[:mid]
            upper_half = sorted_vals[mid + 1:]
            
        q1 = StatisticalEngine.calculate_median(lower_half) if lower_half else sorted_vals[0]
        q2 = StatisticalEngine.calculate_median(sorted_vals)
        q3 = StatisticalEngine.calculate_median(upper_half) if upper_half else sorted_vals[-1]
        iqr = round(q3 - q1, 2)
        
        return q1, q2, q3, iqr

    @staticmethod
    def calculate_outlier_fences(q1: float, q3: float, iqr: float) -> Tuple[float, float]:
        """
        Calculates Lower Fence (Q1 - 1.5*IQR) and Upper Fence (Q3 + 1.5*IQR).
        """
        lower_fence = round(q1 - 1.5 * iqr, 2)
        upper_fence = round(q3 + 1.5 * iqr, 2)
        return lower_fence, upper_fence

    def generate_comprehensive_report(self, complaints: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Processes complaint dataset and produces full statistical analysis
        satisfying all Benchmark 2 requirements.
        """
        total_count = len(complaints)
        if total_count == 0:
            return {"total_complaints": 0, "message": "No complaints available for statistical analysis."}

        # 1. Resolution Time Statistics (Resolved items only)
        resolved_items = [c for c in complaints if c.get("status") == "Resolved" and c.get("resolution_hours") is not None]
        res_times = [float(c["resolution_hours"]) for c in resolved_items]
        
        res_stats = {}
        outlier_complaints = []
        if res_times:
            r_mean = self.calculate_mean(res_times)
            r_median = self.calculate_median(res_times)
            r_mode = self.calculate_mode(res_times)
            r_min = round(min(res_times), 2)
            r_max = round(max(res_times), 2)
            r_range = round(r_max - r_min, 2)
            r_variance = self.calculate_variance(res_times)
            r_std_dev = self.calculate_standard_deviation(res_times)
            
            q1, q2, q3, iqr = self.calculate_quartiles(res_times)
            lower_fence, upper_fence = self.calculate_outlier_fences(q1, q3, iqr)
            
            # Find upper fence outliers (unusually delayed resolution)
            for c in resolved_items:
                if float(c["resolution_hours"]) > upper_fence:
                    outlier_complaints.append({
                        "id": c.get("id"),
                        "category": c.get("category"),
                        "ward": c.get("ward"),
                        "resolution_hours": c.get("resolution_hours"),
                        "threshold_exceeded_by": round(float(c["resolution_hours"]) - upper_fence, 2),
                        "description": c.get("description", "")[:90] + "..."
                    })

            res_stats = {
                "count_resolved": len(res_times),
                "mean_hours": r_mean,
                "median_hours": r_median,
                "mode_hours": r_mode,
                "min_hours": r_min,
                "max_hours": r_max,
                "range_hours": r_range,
                "variance": r_variance,
                "std_dev_hours": r_std_dev,
                "quartiles": {
                    "q1_hours": q1,
                    "q2_median_hours": q2,
                    "q3_hours": q3,
                    "iqr_hours": iqr,
                    "lower_fence_hours": lower_fence,
                    "upper_fence_hours": upper_fence
                },
                "upper_fence_outliers": outlier_complaints
            }
        else:
            res_stats = {
                "count_resolved": 0,
                "mean_hours": 0.0,
                "median_hours": 0.0,
                "mode_hours": 0.0,
                "min_hours": 0.0,
                "max_hours": 0.0,
                "range_hours": 0.0,
                "variance": 0.0,
                "std_dev_hours": 0.0,
                "quartiles": {"q1_hours": 0, "q2_median_hours": 0, "q3_hours": 0, "iqr_hours": 0, "lower_fence_hours": 0, "upper_fence_hours": 0},
                "upper_fence_outliers": []
            }

        # 2. Priority Score Statistics
        priority_scores = [float(c.get("priority_score", 50.0)) for c in complaints]
        prio_stats = {
            "mean_score": self.calculate_mean(priority_scores),
            "median_score": self.calculate_median(priority_scores),
            "mode_score": self.calculate_mode(priority_scores),
            "min_score": round(min(priority_scores), 1) if priority_scores else 0,
            "max_score": round(max(priority_scores), 1) if priority_scores else 0,
            "std_dev": self.calculate_standard_deviation(priority_scores)
        }

        # 3. Frequency Distributions
        # Category Frequency
        cat_counts = Counter(c.get("category", "Other") for c in complaints)
        category_distribution = [
            {
                "category": cat,
                "count": count,
                "percentage": round((count / total_count) * 100, 1)
            }
            for cat, count in cat_counts.most_common()
        ]

        # Priority Frequency
        prio_counts = Counter(c.get("priority", "Medium") for c in complaints)
        priority_order = ["Critical", "High", "Medium", "Low"]
        priority_distribution = [
            {
                "priority": p,
                "count": prio_counts.get(p, 0),
                "percentage": round((prio_counts.get(p, 0) / total_count) * 100, 1)
            }
            for p in priority_order
        ]

        # Status Distribution
        status_counts = Counter(c.get("status", "Open") for c in complaints)
        status_distribution = [
            {"status": s, "count": cnt, "percentage": round((cnt / total_count) * 100, 1)}
            for s, cnt in status_counts.items()
        ]

        # Ward Distribution
        ward_counts = Counter(c.get("ward", "Unknown") for c in complaints)
        ward_distribution = [
            {"ward": w, "count": cnt, "percentage": round((cnt / total_count) * 100, 1)}
            for w, cnt in sorted(ward_counts.items())
        ]

        # 4. Natural Language Statistical Interpretations
        # Translates mathematical values into concrete municipal policy insights!
        interpretations = self._generate_civic_interpretations(
            total_count=total_count,
            cat_distribution=category_distribution,
            res_stats=res_stats,
            prio_distribution=priority_distribution,
            outliers=outlier_complaints
        )

        return {
            "total_complaints": total_count,
            "resolution_time_stats": res_stats,
            "priority_score_stats": prio_stats,
            "category_distribution": category_distribution,
            "priority_distribution": priority_distribution,
            "status_distribution": status_distribution,
            "ward_distribution": ward_distribution,
            "statistical_interpretation": interpretations
        }

    def _generate_civic_interpretations(
        self,
        total_count: int,
        cat_distribution: List[Dict[str, Any]],
        res_stats: Dict[str, Any],
        prio_distribution: List[Dict[str, Any]],
        outliers: List[Dict[str, Any]]
    ) -> Dict[str, str]:
        """
        Creates clear, explainable summaries that explain the meaning
        behind standard deviation, IQR fences, and frequencies for decision makers.
        """
        top_cat = cat_distribution[0] if cat_distribution else {"category": "Roads", "percentage": 0}
        
        # Central tendency explanation
        mean_h = res_stats.get("mean_hours", 0)
        med_h = res_stats.get("median_hours", 0)
        std_h = res_stats.get("std_dev_hours", 0)
        skewness_note = "positively skewed (mean > median)" if mean_h > med_h else "symmetrically distributed"
        
        central_tendency_text = (
            f"Across {res_stats.get('count_resolved', 0)} resolved complaints, the average resolution time is {mean_h} hours, "
            f"while the median is {med_h} hours. The distribution is {skewness_note}, indicating that a few complicated "
            f"utility cases pulled up the arithmetic mean, but 50% of Complains were resolved within {med_h} hours."
        )

        # Dispersion & Outlier fence explanation
        q1 = res_stats.get("quartiles", {}).get("q1_hours", 0)
        q3 = res_stats.get("quartiles", {}).get("q3_hours", 0)
        iqr = res_stats.get("quartiles", {}).get("iqr_hours", 0)
        upper_fence = res_stats.get("quartiles", {}).get("upper_fence_hours", 0)
        
        dispersion_text = (
            f"The standard deviation of resolution times is {std_h} hours with an Interquartile Range (IQR) of {iqr} hours "
            f"(spanning between Q1={q1}h and Q3={q3}h). The Tukey Upper Fence cutoff for anomalous delay is {upper_fence} hours. "
            f"Currently, {len(outliers)} complaints breached this threshold, representing statistical outliers that require "
            f"supervisory intervention by municipal zone managers."
        )

        # Volume & Risk priority explanation
        crit_count = next((p["count"] for p in prio_distribution if p["priority"] == "Critical"), 0)
        high_count = next((p["count"] for p in prio_distribution if p["priority"] == "High"), 0)
        combined_urgent_pct = round(((crit_count + high_count) / max(1, total_count)) * 100, 1)

        risk_volume_text = (
            f"'{top_cat['category']}' represents the highest complaint frequency at {top_cat['percentage']}% of total civic Complains. "
            f"Furthermore, {combined_urgent_pct}% of incoming reports are classified as Critical or High priority by the AI model, "
            f"demonstrating that automated triage is essential to prevent public safety bottlenecks on arterial roads and power grids."
        )

        return {
            "central_tendency_insight": central_tendency_text,
            "dispersion_and_outliers_insight": dispersion_text,
            "volume_and_risk_insight": risk_volume_text
        }
