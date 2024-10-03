
import boto3
import json
import os
import re
from flask import Flask, render_template, request, redirect, url_for
from PyPDF2 import PdfReader
from llm_client import BedrockClient, OpenAIClient  # Import the LLM clients

# Initialize Flask application
app = Flask(__name__)

# Where NOFO PDFs are stored in the backend
S3_NOFOS_BUCKET = 'ffio-nofos-bucket'

def get_nofo_list_from_s3():
    s3_client = boto3.client('s3')
    # Response now contains all objects in NOFO bucket
    NOFOs = s3_client.list_objects_v2(Bucket=S3_NOFOS_BUCKET)

    nofo_list = []
    if 'Contents' in NOFOs:
        for NOFO in NOFOs['Contents']:
            key = NOFO['Key']
            # Filtering to only include PDF files
            if key.endswith('.pdf'):
                nofo_list.append({'name': key, 'url': f'https://{S3_NOFOS_BUCKET}.s3.amazonaws.com/{key}'})

    return nofo_list

# Redirect root URL to the landing page
@app.route('/')
def home():
    return redirect(url_for('landing_page'))

@app.route('/landing')
def landing_page():
    # Retrieves the list of NOFOs from the previous function
    nofo_list = get_nofo_list_from_s3()
    # Passes the list of NOFOs off to the landing file
    return render_template('landing.html', nofos=nofo_list)

# Function to convert a PDF to text using PyPDF2
def convert_pdf_to_text(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

# Handles the form submission when a NOFO is selected and the submit button is clicked
@app.route('/process_nofo', methods=['POST'])
def process_nofo():
    # Retrieve the name of the NOFO the user selected from the dropdown
    nofo_name = request.form.get('nofo')

    # If the user hits submit without choosing a NOFO
    if not nofo_name:
        print("Please select a NOFO.")
        return redirect(url_for('landing_page'))

    # Download the selected NOFO PDF from S3
    s3_client = boto3.client('s3')
    pdf_file_path = f'/tmp/{nofo_name}'
    s3_client.download_file(S3_NOFOS_BUCKET, nofo_name, pdf_file_path)

    # Convert PDF to text
    NOFO_text = convert_pdf_to_text(pdf_file_path)

    # The NOFO text is passed onto the function responsible for gathering requirements
    checklists = gather_requirements_from_nofo(NOFO_text)

    # The checklists are then passed onto a new HTML file, so that it can handle displaying them
    return render_template('checklists.html', checklists=checklists)

# Choose the LLM client here
# To switch models, change BedrockClient() to OpenAIClient()
llm_client = BedrockClient()
# llm_client = OpenAIClient()  # Uncomment this line to use OpenAI GPT

def gather_requirements_from_nofo(NOFO_text):
    prompt = (
        "Given the following NOFO text, provide:\n"
        "1. A list of documents required for a complete grant application.\n"
        "2. A list of sections needed for the narrative document.\n"
        "3. Eligibility criteria to be considered for the grant.\n"
        "4. Key deadlines for the grant application.\n\n"
        f"NOFO Text: {NOFO_text.strip()}"
    )

    response_text = llm_client.get_response(prompt)
    print(response_text)
    if response_text:
        checklists = parse_llm_response(response_text)
        return checklists
    else:
        print("Failed to get response from the LLM.")
        return None

# Function to parse the LLM response and extract the required information
def parse_llm_response(response_text):
    checklists = {
        'documents_required': [],
        'narrative_sections': [],
        'eligibility_criteria': [],
        'key_deadlines': []
    }

    try:
        # Split the response into sections based on numbered headings
        sections = re.split(r'\n(?=\d\.)', response_text)
        for section in sections:
            if section.startswith('1.'):
                checklists['documents_required'] = re.findall(r'-\s*(.*)', section)
            elif section.startswith('2.'):
                checklists['narrative_sections'] = re.findall(r'-\s*(.*)', section)
            elif section.startswith('3.'):
                checklists['eligibility_criteria'] = re.findall(r'-\s*(.*)', section)
            elif section.startswith('4.'):
                checklists['key_deadlines'] = re.findall(r'-\s*(.*)', section)
    except Exception as e:
        print(f"Error parsing LLM response: {e}")
        # If parsing fails, return the raw response
        checklists = {'response': response_text}

    return checklists

if __name__ == '__main__':
    app.run(debug=True)
