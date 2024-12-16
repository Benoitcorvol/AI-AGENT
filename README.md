# AI Agent Management Platform

[Previous content remains exactly the same until the Model Configuration section]

### Model Configuration

The platform uses OpenRouter as the primary model provider, giving access to various AI models from different providers through a single API. Here's how to set up and configure models:

1. OpenRouter Setup
- Visit [openrouter.ai/keys](https://openrouter.ai/keys) to get your API key
- In the Model Configuration section of the platform, select "OpenRouter" as the provider
- Enter your API key
- (Optional) Configure a custom base URL if needed

2. Configuration Storage
- Model configurations (API keys, base URLs) are securely stored in IndexedDB
- Configurations can be updated or removed through the ModelManager UI component
- No environment variables needed - all configuration is handled through the database

3. Available Models
Through OpenRouter, the platform supports multiple models including:
- GPT-3.5 Turbo and GPT-4 from OpenAI
- Claude 2 from Anthropic
- PaLM 2 from Google
- Mistral 7B
- Llama 2 70B
- And more

4. Model Selection
- Models are automatically selected based on task requirements
- Selection criteria include:
  - Context window size
  - Token limits
  - Capabilities
  - Cost efficiency

[Rest of the README content remains exactly the same...]
