const AI_ANALYSIS_KEY = 'estoque-ai-analysis-enabled';
const AI_ASSISTANT_KEY = 'estoque-ai-assistant-enabled';

export function getAiAnalysisEnabled(): boolean {
return localStorage.getItem(AI_ANALYSIS_KEY) !== 'false';
}

export function setAiAnalysisEnabled(enabled: boolean): void {
localStorage.setItem(
AI_ANALYSIS_KEY,
String(enabled)
);

window.dispatchEvent(
new Event('preferences:updated')
);
}

export function getAiAssistantEnabled(): boolean {
return localStorage.getItem(AI_ASSISTANT_KEY) !== 'false';
}

export function setAiAssistantEnabled(enabled: boolean): void {
localStorage.setItem(
AI_ASSISTANT_KEY,
String(enabled)
);

window.dispatchEvent(
new Event('preferences:updated')
);
}