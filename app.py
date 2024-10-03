"""
Shreya Thalvayapati
Tuesday, October 1st, 2024
Attempting to Build a Landing Page for the FFIO
"""

# import statements
from flask import Flask, render_template, redirect, url_for
import boto3

app = Flask(__name__)

# AWS S3 Configuration
S3_NOFOS_BUCKET = 'ffio-nofos-bucket'

def get_nofo_list_from_s3():
    s3_client = boto3.client('s3')
    response = s3_client.list_objects_v2(Bucket=S3_NOFOS_BUCKET)

    nofo_list = []
    if 'Contents' in response:
        for obj in response['Contents']:
            key = obj['Key']
            if key.endswith('.pdf'):  # Filtering to only include PDF files
                nofo_list.append({'name': key, 'url': f'https://{S3_NOFOS_BUCKET}.s3.amazonaws.com/{key}'})

    return nofo_list

@app.route('/')
def home():
    return redirect(url_for('landing_page'))

@app.route('/landing')
def landing_page():
    nofo_list = get_nofo_list_from_s3()
    return render_template('landing.html', nofos=nofo_list)

if __name__ == '__main__':
    app.run(debug=True)
