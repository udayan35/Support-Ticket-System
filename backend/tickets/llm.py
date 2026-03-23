import os
import json
import logging

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a support ticket classification assistant. Your job is to analyze support ticket descriptions and assign the most appropriate category and priority level.

Categories:
- billing: Payment issues, invoices, charges, refunds, subscription costs
- technical: Bugs, errors, crashes, performance issues, integrations, API problems
- account: Login issues, password reset, profile settings, permissions, account access
- general: General questions, feature requests, feedback, anything that doesn't fit above

Priority levels:
- critical: System is completely down, data loss, security breach, blocking all work
- high: Major feature broken, significant business impact, many users affected
- medium: Feature partially broken, workaround exists, moderate impact
- low: Minor issue, cosmetic problem, nice-to-have request, low urgency

Respond ONLY with valid JSON in this exact format:
{"category": "<one of: billing, technical, account, general>", "priority": "<one of: low, medium, high, critical>"}

Do not include any explanation or additional text."""


def classify_ticket(description: str) -> dict | None:
    """
    Call Anthropic Claude to classify a ticket description.
    Returns dict with 'suggested_category' and 'suggested_priority', or None on failure.
    """
    api_key = os.environ.get('ANTHROPIC_API_KEY', '').strip()
    if not api_key:
        logger.warning("ANTHROPIC_API_KEY not set, skipping classification")
        return None

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)

        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=100,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f"Classify this support ticket:\n\n{description}"
                }
            ]
        )

        raw = message.content[0].text.strip()
        result = json.loads(raw)

        valid_categories = ['billing', 'technical', 'account', 'general']
        valid_priorities = ['low', 'medium', 'high', 'critical']

        category = result.get('category', '').lower()
        priority = result.get('priority', '').lower()

        if category not in valid_categories or priority not in valid_priorities:
            logger.warning(f"LLM returned invalid values: {result}")
            return None

        return {
            'suggested_category': category,
            'suggested_priority': priority,
        }

    except json.JSONDecodeError as e:
        logger.error(f"LLM returned non-JSON response: {e}")
        return None
    except Exception as e:
        logger.error(f"LLM classification failed: {e}")
        return None
