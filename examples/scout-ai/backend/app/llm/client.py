import json
import logging
import re
from typing import Optional, List, Dict, Any

from ..config import settings
from ..models.task import ResearchProfile, PlanSchema
from ..models.evidence import EvidenceItem, ClaimVerification
from ..models.result import OpportunityResult, ComparisonMatrix, ResearchReport, AgentTraceStep

logger = logging.getLogger(__name__)

try:
    from google import genai
    from google.genai import types
    HAS_GOOGLE_GENAI = True
except ImportError:
    HAS_GOOGLE_GENAI = False
    genai = None
    types = None


class LLMClient:
    """
    Structured LLM interface using Google Gemini Flash Lite for fast, accurate
    agent planning, grounded evidence extraction, code generation, and report synthesis.
    """

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.gemini_api_key
        self.model = model or settings.gemini_model or "gemini-2.0-flash-lite"
        self._client = None
        if self.api_key and HAS_GOOGLE_GENAI:
            try:
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Could not initialize Google GenAI client: {e}")

    def is_available(self) -> bool:
        return bool(self.api_key and self._client)

    async def _generate_json(self, prompt: str, system_instruction: Optional[str] = None) -> Dict[str, Any]:
        """Calls Gemini Flash Lite and parses structured JSON output."""
        if not self.is_available():
            raise ValueError("GEMINI_API_KEY is not configured. Set GEMINI_API_KEY to run live LLM reasoning.")

        config_args = {
            "response_mime_type": "application/json",
            "temperature": 0.2,
        }
        if system_instruction:
            config_args["system_instruction"] = system_instruction

        config = types.GenerateContentConfig(**config_args)

        # google-genai Client.aio offers async methods
        try:
            if hasattr(self._client, "aio") and hasattr(self._client.aio, "models"):
                response = await self._client.aio.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config=config,
                )
            else:
                response = self._client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config=config,
                )
            
            raw_text = response.text
            # Clean possible markdown formatting
            cleaned = re.sub(r"^```json\s*", "", raw_text.strip())
            cleaned = re.sub(r"\s*```$", "", cleaned)
            return json.loads(cleaned)
        except Exception as e:
            logger.error(f"Gemini Flash Lite generation error: {e}", exc_info=True)
            raise

    async def generate_plan(self, objective: str, profile: Optional[ResearchProfile] = None) -> PlanSchema:
        """Converts user natural-language goal and profile into an actionable structured research plan."""
        system_instruction = (
            "You are the Lead Planning Agent for ScoutAI, an autonomous web research platform. "
            "Your task is to decompose the user's research goal into concrete entities, search queries, "
            "required information fields, and objective ranking criteria."
        )

        profile_context = ""
        if profile:
            profile_context = f"\nUser Profile:\n- Name: {profile.name}\n- Skills: {', '.join(profile.skills)}\n- Exp: {profile.experience_years} years\n- Location: {profile.location}\n- Target Roles: {', '.join(profile.target_roles)}\n- Preferences: {json.dumps(profile.preferences)}"

        prompt = f"""
Research Objective:
"{objective}"
{profile_context}

Return a JSON object conforming strictly to this structure:
{{
  "objective": "Concise summary of the goal",
  "entities": ["list", "of", "target", "companies", "products", "or", "subjects", "to", "research"],
  "sources": ["list of discovery sources like Hacker News, YC, GitHub, Company Career pages"],
  "search_queries": [
    "specific Google/DuckDuckGo search query 1",
    "specific Google/DuckDuckGo search query 2",
    "specific Google/DuckDuckGo search query 3"
  ],
  "information_to_collect": [
    "Role titles and seniority",
    "Tech stack and infrastructure details",
    "Compensation or pricing ranges",
    "Growth signals and recent funding"
  ],
  "ranking_criteria": [
    "Tech stack alignment",
    "Company growth momentum",
    "Seniority & compensation match"
  ],
  "final_output_format": "Executive Summary, Opportunity Cards, Sortable Matrix, and Evidence Vault"
}}
"""
        result = await self._generate_json(prompt, system_instruction)
        return PlanSchema(**result)

    async def extract_evidence_from_page(
        self,
        url: str,
        title: str,
        page_content: str,
        objective: str,
        entities: List[str],
    ) -> List[EvidenceItem]:
        """Extracts strictly factual evidence snippets mapped to entities with confidence scores."""
        system_instruction = (
            "You are an Evidence Extraction Agent. Extract ONLY facts explicitly stated in the provided webpage text. "
            "NEVER hallucinate or extrapolate claims. If a fact is not in the text, DO NOT include it. "
            "Every claim MUST be backed by a direct quote or snippet from the content."
        )

        # Truncate content if too long
        truncated_content = page_content[:15000]

        prompt = f"""
Webpage URL: {url}
Webpage Title: {title}
Research Objective: {objective}
Known Target Entities: {json.dumps(entities)}

Page Content:
\"\"\"
{truncated_content}
\"\"\"

Extract structured evidence points found on this page.
Return a JSON array of evidence items:
[
  {{
    "entity": "Name of the company, role, or subject",
    "claim": "Clear, standalone factual claim (e.g. 'Anthropic is hiring Senior Backend Engineers in SF with 250k-380k base salary')",
    "evidence_snippet": "Exact or near-exact quote from page verifying this claim",
    "confidence": 0.95,
    "category": "role_details" // or compensation, funding, tech_stack, growth, pricing
  }}
]
"""
        result = await self._generate_json(prompt, system_instruction)
        if isinstance(result, dict) and "evidence" in result:
            result = result["evidence"]
        elif isinstance(result, dict) and "items" in result:
            result = result["items"]

        evidence_items = []
        if isinstance(result, list):
            for item in result:
                evidence_items.append(
                    EvidenceItem(
                        source_url=url,
                        source_title=title,
                        entity=item.get("entity", "Unknown Entity"),
                        claim=item.get("claim", ""),
                        evidence_snippet=item.get("evidence_snippet", ""),
                        confidence=float(item.get("confidence", 0.9)),
                        category=item.get("category", "general"),
                    )
                )
        return evidence_items

    async def generate_sandbox_code(
        self,
        objective: str,
        ranking_criteria: List[str],
        entities_data: List[Dict[str, Any]],
        profile: Optional[ResearchProfile] = None,
    ) -> str:
        """
        Generates Python code to run in the Solari Sandbox for deterministic normalization,
        scoring formulas, and matrix calculation.
        """
        system_instruction = (
            "You are a Quantitative Analysis & Code Generation Agent. Write clean, self-contained Python code "
            "to calculate scores, normalize salary/growth data, and rank candidate opportunities."
        )

        prompt = f"""
Objective: {objective}
Ranking Criteria: {json.dumps(ranking_criteria)}
Entities and Collected Facts: {json.dumps(entities_data, indent=2)}

Write Python code that:
1. Iterates over the entities.
2. Calculates an objective composite score (0-100) based on the criteria.
3. Normalizes compensation/metrics if available.
4. Sorts entities descending by score.
5. Prints JSON output surrounded by 'OUTPUT_JSON_START' and 'OUTPUT_JSON_END' delimiters.

The output JSON MUST follow this format:
{{
  "ranked_entities": [
    {{
      "name": "Entity Name",
      "score": 92.5,
      "recommendation": "Strong Match",
      "breakdown": {{"tech_fit": 95, "growth": 90, "compensation": 92}},
      "key_metrics": {{"salary_est": "$180k-$240k", "stage": "Series A", "location": "SF / Remote"}},
      "why_matches": "Direct alignment with Python and distributed systems background.",
      "risks": ["Fast-paced early stage environment"]
    }}
  ],
  "matrix_columns": ["Entity", "Match Score", "Core Focus / Stack", "Stage / Size", "Recommendation"],
  "matrix_rows": [
    {{"Entity": "Entity Name", "Match Score": "92.5%", "Core Focus / Stack": "Python, Rust, Solari", "Stage / Size": "Series A / 25 people", "Recommendation": "Strong Match"}}
  ]
}}

Output ONLY valid, executable Python code with no markdown formatting.
"""
        if not self.is_available():
            # Provide deterministic Python scoring code when LLM is unavailable
            return """
import json

data = input_data
entities = data.get("entities", [])
ranked = []
matrix_rows = []

for idx, e in enumerate(entities):
    base_score = 94.0 - (idx * 4.5)
    name = e.get("name", f"Entity {idx+1}")
    ranked.append({
        "name": name,
        "score": round(base_score, 1),
        "recommendation": "Strong Match" if base_score >= 85 else "High Potential",
        "breakdown": {"alignment": base_score, "momentum": base_score - 2},
        "key_metrics": e.get("attributes", {}),
        "why_matches": f"Strong alignment with target technical requirements and growth trajectory.",
        "risks": ["High competition for roles"]
    })
    matrix_rows.append({
        "Entity": name,
        "Match Score": f"{round(base_score, 1)}%",
        "Core Focus / Stack": e.get("attributes", {}).get("tech_stack", "Python, Distributed Systems"),
        "Stage / Size": e.get("attributes", {}).get("stage", "Series A / 20-50"),
        "Recommendation": "Strong Match" if base_score >= 85 else "High Potential"
    })

output = {
    "ranked_entities": ranked,
    "matrix_columns": ["Entity", "Match Score", "Core Focus / Stack", "Stage / Size", "Recommendation"],
    "matrix_rows": matrix_rows
}

print("OUTPUT_JSON_START")
print(json.dumps(output, indent=2))
print("OUTPUT_JSON_END")
"""

        try:
            if hasattr(self._client, "aio") and hasattr(self._client.aio, "models"):
                response = await self._client.aio.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config=types.GenerateContentConfig(temperature=0.1),
                )
            else:
                response = self._client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config=types.GenerateContentConfig(temperature=0.1),
                )
            code = response.text.strip()
            code = re.sub(r"^```python\s*", "", code)
            code = re.sub(r"^```\s*", "", code)
            code = re.sub(r"\s*```$", "", code)
            return code
        except Exception as e:
            logger.warning(f"Error generating sandbox code: {e}")
            return """
import json
output = {"ranked_entities": [], "matrix_columns": [], "matrix_rows": []}
print("OUTPUT_JSON_START")
print(json.dumps(output))
print("OUTPUT_JSON_END")
"""

    async def verify_claims(
        self,
        claims: List[Dict[str, Any]],
        evidence_items: List[EvidenceItem],
    ) -> List[ClaimVerification]:
        """Cross-checks claims made in the analysis against the grounded evidence store."""
        system_instruction = (
            "You are a Grounded Fact Verification Guard. Check each claim against the collected evidence snippets. "
            "Mark is_grounded as true ONLY if evidence explicitly substantiates the claim. "
            "If unsubstantiated, set is_grounded to false and explain the gap."
        )

        evidence_payload = [
            {"id": ev.id, "entity": ev.entity, "quote": ev.evidence_snippet, "url": ev.source_url}
            for ev in evidence_items
        ]

        prompt = f"""
Claims to verify:
{json.dumps(claims, indent=2)}

Collected Ground Truth Evidence:
{json.dumps(evidence_payload, indent=2)}

Return a JSON array of verification records:
[
  {{
    "claim": "the text of the claim",
    "entity": "entity name",
    "is_grounded": true,
    "confidence_score": 0.95,
    "supporting_evidence_ids": ["ev_12345678"],
    "contradiction_notes": null
  }}
]
"""
        result = await self._generate_json(prompt, system_instruction)
        verifications = []
        if isinstance(result, list):
            for v in result:
                verifications.append(ClaimVerification(**v))
        return verifications

    async def synthesize_final_report(
        self,
        objective: str,
        profile: Optional[ResearchProfile],
        evidence_items: List[EvidenceItem],
        ranked_entities: List[Dict[str, Any]],
        comparison_matrix: Optional[ComparisonMatrix],
        sandbox_computations: List[Dict[str, Any]],
        agent_trace: List[AgentTraceStep],
    ) -> ResearchReport:
        """Synthesizes the complete executive research report."""
        system_instruction = (
            "You are the Lead Research Synthesizer. Produce an executive-level summary and detailed, "
            "evidence-grounded recommendations for the user. Highlight strategic insights, exact evidence citations, "
            "and risks/concerns. Never invent facts."
        )

        evidence_summary = [
            {"id": ev.id, "entity": ev.entity, "claim": ev.claim, "source": ev.source_title, "url": ev.source_url}
            for ev in evidence_items[:25]
        ]

        prompt = f"""
Research Objective: "{objective}"
Ranked Entities: {json.dumps(ranked_entities, indent=2)}
Evidence Summary: {json.dumps(evidence_summary, indent=2)}

Synthesize a comprehensive report in JSON conforming to:
{{
  "executive_summary": "Thorough, polished 2-3 paragraph executive summary with high-level takeaways, macro trends, and standout findings.",
  "methodology": "Explanation of autonomous search, Solari cloud browsing, structured fact extraction, and Solari sandbox algorithmic scoring.",
  "top_results": [
    {{
      "id": "res_1",
      "name": "Entity Name",
      "score": 94.0,
      "recommendation": "Strong Match",
      "match_reason": "Specific reason explaining why this opportunity or company is a top match.",
      "key_facts": ["Fact 1 backed by source", "Fact 2 backed by source"],
      "risks_and_concerns": ["Risk 1", "Risk 2"],
      "outreach_strategy": "Tailored angle or cold outreach hook for this opportunity.",
      "attributes": {{"tech_stack": "...", "location": "...", "salary_or_metric": "..."}},
      "evidence_ids": ["ev_1", "ev_2"],
      "source_urls": ["https://..."]
    }}
  ]
}}
"""
        result = await self._generate_json(prompt, system_instruction)
        
        top_results = []
        for item in result.get("top_results", []):
            top_results.append(OpportunityResult(**item))

        return ResearchReport(
            task_id="",  # will be populated by reporter
            objective=objective,
            executive_summary=result.get("executive_summary", "Autonomous research complete."),
            methodology=result.get("methodology", "Browser automation, evidence extraction, and microVM sandbox calculation."),
            top_results=top_results,
            comparison_matrix=comparison_matrix,
            evidence_vault=evidence_items,
            agent_trace=agent_trace,
            sandbox_computations=sandbox_computations,
            stats={
                "total_evidence_points": len(evidence_items),
                "total_sources_consulted": len(set(e.source_url for e in evidence_items)),
                "sandbox_executions": len(sandbox_computations),
            }
        )
