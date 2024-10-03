# llm_client.py

import boto3
import json
import openai
import os

class LLMClient:
    def get_response(self, prompt):
        raise NotImplementedError("Subclasses should implement this method.")

class BedrockClient(LLMClient):
    def __init__(self):
        self.bedrock_client = boto3.client('bedrock-runtime', region_name='us-east-1')
        self.model_id = "anthropic.claude-v2"  # Update to a model supported by Messages API

    def get_response(self, prompt):
        messages = [
            {"role": "user", "content": "You are an AI language model that assists with extracting information from NOFO documents."},
            {"role": "assistant", "content": prompt}
        ]

        payload = {
            "messages": messages,
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "temperature": 0.7,
            "stop_sequences": [],
            "top_k": 250,
            "top_p": 1.0,
        }

        try:
            response = self.bedrock_client.invoke_model(
                modelId=self.model_id,
                contentType="application/json",
                accept="application/json",
                body=json.dumps(payload)
            )

            response_body = json.loads(response['body'].read())
            # The response is in the 'completion' field
            return response_body.get('completion', '')
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
                temperature=0.7,
            )
            return response['choices'][0]['message']['content']
        except Exception as e:
            print(f"An error occurred with OpenAIClient: {e}")
            return None
