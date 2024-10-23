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
}