import {
    Utils
  } from "../utils"

import { AppConfig } from "../types";

export class LandingPageClient {
    private readonly API;
    constructor(protected _appConfig: AppConfig) {
        this.API = _appConfig.httpEndpoint.slice(0,-1);
    }
  // Returns a list of documents in the S3 bucket (hard-coded on the backend)
  async getNOFOs() {
    const auth = await Utils.authenticate();
    const response = await fetch(this.API + '/s3-nofo-bucket-data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization' : auth
      },
    });
    if (!response.ok) {
      throw new Error('Failed to get files');
    }
    const result = await response.json();
    return result;
  }

  // Return NOFO summary from S3 bucket
  async getNOFOSummary(documentKey){
    const auth = await Utils.authenticate();
    const url = new URL(this.API + '/s3-nofo-summary');
    url.searchParams.append('documentKey', documentKey);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization' : auth
      },
    });
    if (!response.ok) {
      throw new Error('Failed to get files');
    }
    const result = await response.json();
    return result;

  }

  // Fetches a signed upload URL from the backend Lambda for uploading a file to S3
  async getUploadURL(fileName: string, fileType: string): Promise<string> {
    if (!fileType) {
      alert('Must have a valid file type!');
      throw new Error('Invalid file type');
    }
    try {
      const auth = await Utils.authenticate();
      const response = await fetch(`${this.API}/test-url`, { // Updated path
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': auth,
        },
        body: JSON.stringify({ fileName, fileType }),
      });
      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }
      const data = await response.json();
      return data.signedUrl;
    } catch (error) {
      console.error('Error fetching upload URL:', error);
      throw error;
    }
  }
  // Uploads the file to S3 using the presigned URL provided by the backend
  async uploadFileToS3(signedUrl: string, file: File) {
    try {
      const response = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });
      if (!response.ok) {
        throw new Error('Failed to upload the file');
      }
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error;
    }
  }
}