import * as vscode from 'vscode';
import fetch from 'node-fetch';

/**
 * Client for making Claude API requests that mimic the Cline extension
 */
export class ClaudeAPIClient {
  /**
   * Send a request to Claude API
   * @param message User's message
   * @returns Claude's response text
   */
  public static async sendMessage(message: string): Promise<string> {
    try {
      // Get API key from extension settings
      const config = vscode.workspace.getConfiguration('rooCode');
      const apiKey = config.get('claudeApiKey') as string;
      
      if (!apiKey) {
        throw new Error('Claude API key not configured. Please add it in settings.');
      }
      
      const apiUrl = 'https://app.claude.gg/v1/messages';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          
          // Critical headers that mimic Cline extension
          'HTTP-Referer': 'https://cline.bot',
          'X-Title': 'Cline',
          'User-Agent': `VSCode/${vscode.version} (Cline/1.4.0)`
        },
        body: JSON.stringify({
          model: "claude-3-opus-20240229",
          messages: [
            { role: "user", content: message }
          ],
          max_tokens: 4096,
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API Error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw error;
    }
  }
}
