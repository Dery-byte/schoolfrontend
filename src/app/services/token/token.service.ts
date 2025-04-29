import { Injectable } from '@angular/core';
import {JwtHelperService} from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class TokenService {


  // set token(token: string) {
  //   localStorage.setItem('token', token);
  // }

  // get token() {
  //   return localStorage.getItem('token') as string;
  // }

  isTokenValid() {
    const token = this.token;
    if (!token) {
      return false;
    }
    // decode the token
    const jwtHelper = new JwtHelperService();
    // check expiry date
    const isTokenExpired = jwtHelper.isTokenExpired(token);
    if (isTokenExpired) {
      localStorage.clear();
      return false;
    }
    return true;
  }

  isTokenNotValid() {
    return !this.isTokenValid();
  }

  get userRoles(): string[] {
    const token = this.token;
    if (token) {
      const jwtHelper = new JwtHelperService();
      const decodedToken = jwtHelper.decodeToken(token);
      console.log(decodedToken.authorities);
      return decodedToken.authorities;
    }
    return [];
  }


  // clear(): void {
  //   localStorage.removeItem(this.token);
  // }

  set token(value: string) {
    localStorage.setItem('token', value);
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  clear(): void {
    localStorage.removeItem('token');
  }
}
