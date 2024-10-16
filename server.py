import boto3
import json
import fitz  # PyMuPDF for PDF parsing
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
from llm_client import BedrockClient, OpenAIClient

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = './uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize the LLM clients
bedrock_client = BedrockClient()
openai_client = OpenAIClient()

def extract_text_from_pdf(file_path):
    """Extracts text from a PDF using PyMuPDF."""
    doc = fitz.open(file_path)
    text = ""
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        text += page.get_text()
    return text

@app.route('/analyze', methods=['POST'])
def analyze_document():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Save the uploaded PDF file
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    # Extract text from the PDF
    document_content = extract_text_from_pdf(file_path)

    # Call Claude LLM through Bedrock
    raw_response = bedrock_client.get_response(f"Analyze this document and to the best of your ability, categorize the information into 4 categories: Eligibility Criteria, Required Documents, Project Narrative Sections, and Key Deadlines: {document_content}")
    
    # Parse the raw response into sections based on newlines
    sections = raw_response.split("\n\n")
    data = {
        "eligibility": sections[0].replace("Eligibility Criteria:\n", ""),
        "documents": sections[1].replace("Required Documents:\n", ""),
        "narrative": sections[2].replace("Project Narrative Sections:\n", ""),
        "deadlines": sections[3].replace("Key Deadlines:\n", ""),
    }
    
    return jsonify({"response": sections})

    # Return success message for now (implement PDF processing logic later)
    # return jsonify({"message": f"File {filename} uploaded successfully."})

if __name__ == '__main__':
    app.run(port=5002)

