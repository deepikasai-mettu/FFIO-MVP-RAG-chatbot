# import sys
# print(sys.executable)  # This will print the Python interpreter being used
# print(sys.path)        # This will print the Python path to verify where it's looking for packages

import boto3
import os
import re
from flask import Flask, render_template, request, redirect, url_for
from PyPDF2 import PdfReader
from docx import Document  # For handling DOCX files
from llm_client import BedrockClient, OpenAIClient  # Import the LLM clients
import spacy  # For NLP-based sentence extraction

# Initialize Flask application
app = Flask(__name__)


# Where NOFO PDFs are stored in the backend
S3_NOFOS_BUCKET = 'ffio-nofos-bucket'


def get_nofo_list_from_s3():
    s3_client = boto3.client('s3')
    NOFOs = s3_client.list_objects_v2(Bucket=S3_NOFOS_BUCKET)

    nofo_list = []
    if 'Contents' in NOFOs:
        for NOFO in NOFOs['Contents']:
            key = NOFO['Key']
            if key.lower().endswith(('.pdf', '.docx')):
                nofo_list.append({'name': key, 'url': f'https://{S3_NOFOS_BUCKET}.s3.amazonaws.com/{key}'})

    return nofo_list


# Load spaCy English model
nlp = spacy.load('en_core_web_sm')


def convert_pdf_to_text(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text


def convert_docx_to_text(docx_path):
    doc = Document(docx_path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return '\n'.join(full_text)


def extract_relevant_sentences(NOFO_text):
    doc = nlp(NOFO_text)
    keywords = ['eligibility', 'deadline', 'requirement', 'submission', 'application', 'criteria', 'documents', 'narrative', 'sections']
    relevant_sentences = []

    for sent in doc.sents:
        if any(keyword in sent.text.lower() for keyword in keywords):
            relevant_sentences.append(sent.text.strip())

    # Combine relevant sentences into a single string
    extracted_text = ' '.join(relevant_sentences)

    return extracted_text if extracted_text else NOFO_text  # If no matches, return the original text


# Choose the LLM client here
# To switch models, change BedrockClient() to OpenAIClient()
llm_client = BedrockClient()
# llm_client = OpenAIClient()  # Uncomment this line to use OpenAI GPT


def gather_requirements_from_nofo(NOFO_text):
    prompt = (
        "Given the following extracted sentences from a NOFO document, please extract and provide the information using the exact headings and bullet points as specified below. Do not include any introductory text or additional commentary. Use the following format:\n\n"
        "Documents Required:\n"
        "- [list items]\n"
        "\n"
        "Narrative Sections:\n"
        "- [list items]\n"
        "\n"
        "Eligibility Criteria:\n"
        "- [list items]\n"
        "\n"
        "Key Deadlines:\n"
        "- [list items]\n"
        "\n"
        f"Extracted NOFO Sentences:\n{NOFO_text.strip()}"
    )

    response_text = llm_client.get_response(prompt)
    print(response_text)
    if response_text:
        checklists = parse_llm_response(response_text)
        return checklists
    else:
        print("Failed to get response from the LLM.")
        return None


def parse_llm_response(response_text):
    checklists = {
        'documents_required': [],
        'narrative_sections': [],
        'eligibility_criteria': [],
        'key_deadlines': []
    }

    try:
        # Print the response text for debugging
        print("LLM Response:")
        print(response_text)

        # Define possible headings for each section
        headings_docs = [
            r"Documents Required for Grant Application",
            r"Documents required for a complete grant application",
            r"Documents Required",
            r"Required Documents"
        ]
        headings_narrative = [
            r"Sections Needed for Narrative Document",
            r"Sections needed for the narrative document",
            r"Narrative Sections",
            r"Required Narrative Sections"
        ]
        headings_eligibility = [
            r"Eligibility Criteria",
            r"Eligibility",
            r"Eligibility Requirements"
        ]
        headings_deadlines = [
            r"Key Deadlines",
            r"Important Dates",
            r"Deadlines"
        ]

        # Build patterns
        def build_pattern(headings):
            headings_pattern = '|'.join(headings)
            pattern = rf"(?i)(?:{headings_pattern}):?\s*\n((?:[-–•]\s?.*\n?)+)"
            return pattern

        pattern_docs = build_pattern(headings_docs)
        pattern_narrative = build_pattern(headings_narrative)
        pattern_eligibility = build_pattern(headings_eligibility)
        pattern_deadlines = build_pattern(headings_deadlines)

        # Extract lists for each section
        docs_match = re.search(pattern_docs, response_text)
        if docs_match:
            checklists['documents_required'] = re.findall(r'[-–•]\s?(.*)', docs_match.group(1))
        else:
            print("No match found for Documents Required")

        narrative_match = re.search(pattern_narrative, response_text)
        if narrative_match:
            checklists['narrative_sections'] = re.findall(r'[-–•]\s?(.*)', narrative_match.group(1))
  