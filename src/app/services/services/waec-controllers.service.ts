/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { verifyWaecResult } from '../fn/waec-controllers/verify-waec-result';
import { VerifyWaecResult$Params } from '../fn/waec-controllers/verify-waec-result';

@Injectable({ providedIn: 'root' })
export class WaecControllersService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `verifyWaecResult()` */
  static readonly VerifyWaecResultPath = '/auth/waecs/verify';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `verifyWaecResult()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  verifyWaecResult$Response(params: VerifyWaecResult$Params, context?: HttpContext): Observable<StrictHttpResponse<{
}>> {
    return verifyWaecResult(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `verifyWaecResult$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  verifyWaecResult(params: VerifyWaecResult$Params, context?: HttpContext): Observable<{
}> {
    return this.verifyWaecResult$Response(params, context).pipe(
      map((r: StrictHttpResponse<{
}>): {
} => r.body)
    );
  }

}
