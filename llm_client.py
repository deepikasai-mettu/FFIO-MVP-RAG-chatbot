import boto3
import json
import openai
import os


class LLMClient:
    def get_response(self, prompt):
        raise NotImplementedError("Subclasses should implement this method.")


class BedrockClient(LLMClient):
    def __init__(self):
        self.bedrock_client = boto3.client(
            service_name='bedrock-runtime',
            region_name='us-east-1'
        )
        self.model_id = "anthropic.claude-v2"

    def get_response(self, prompt):
        print("Getting response from Bedrock...")

        system_prompt = "You are an AI language model that assists with extracting information from NOFO documents."

        messages = [
            {
                "role": "user",
                "content": prompt
            }
        ]

        payload = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "system": system_prompt,
            "temperature": 0,
            "messages": messages
        }

        try:
            print("Making the API call to Bedrock...")
            response = self.bedrock_client.invoke_model(
                body=json.dumps(payload),
                modelId=self.model_id
            )
            print(response)
            response_body = json.loads(response.get('body').read())

            # Extract the generated text from the response
            generated_text = ''
            content_list = response_body.get('content', [])
            for item in content_list:
                if item.get('type') == 'text':
                    generated_text += item.get('text', '')

            # Return the generated text
            return generated_text.strip()
        except Exception as e:
            print(f"An error occurred with BedrockClient: {e}")
            return None


class OpenAIClient(LLMClient):
    def __init__(self):
        openai.api_key = os.getenv("OPENAI_API_KEY")

    def get_response(self, prompt):
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
                temperature=0.1,
            )
            return response['choices'][0]['message']['content']
        except Exception as e:
            print(f"An error occurred with OpenAIClient: {e}")
            return None
