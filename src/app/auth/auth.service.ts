// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { AuthenticationService } from '../services/services'; // Generated service
import { AuthenticationRequest } from '../services/models/authentication-request';
import { TokenService } from '../services/token/token.service';
import { decodeToken } from '../Utilities/token.util';
import { Observable, BehaviorSubject,map } from 'rxjs';
import { Router } from '@angular/router';


export interface UserSession {
    username: string;
    roles: string[];
  }

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    private userSubject = new BehaviorSubject<UserSession | null>(null);
  private currentUser: string | null = null;
  private currentUserSubject = new BehaviorSubject<string | null>(null);
  public user$: Observable<string | null> = this.currentUserSubject.asObservable();



  constructor(
    private generatedAuth: AuthenticationService,
    private tokenService: TokenService,
    private router:Router
  ) {

    // this.initializeUserFromToken();
  }

  login(authRequest: AuthenticationRequest): Observable<any> {
    return this.generatedAuth.authenticate({ body: authRequest }).pipe(
      map((response) => {
        const token = response.token;
  
        if (typeof token === 'string') {
          this.tokenService.token = token;
          this.setUserFromToken(token);
          const decoded = decodeToken(token);
          if (decoded?.sub) {
            this.setUser(decoded.sub);
          }
  
          return decoded;
        } else {
          throw new Error('Token is missing or invalid');
        }
      })
    );
  }

  private comingFromRegistration = false;

  setComingFromRegistration(value: boolean) {
    this.comingFromRegistration = value;
  }
  
  isComingFromRegistration(): boolean {
    return this.comingFromRegistration;
  }

  setUserFromToken(token: string): void {
    const decoded = decodeToken(token);
    if (decoded?.sub) {
      const user: UserSession = {
        username: decoded.sub,
        roles: decoded.authorities || []
      };
      this.userSubject.next(user);
    }
  }
  

//   setUser(username: string): void {
//     this.currentUser = username;
//   }

setUser(username: string): void {
    this.currentUserSubject.next(username);
  }



  initializeUserFromToken(): void {
    const token = this.tokenService.token;
    if (!token) return;
  
    const decoded = decodeToken(token);
    const username = decoded?.sub;
  
    if (username) {
      this.setUser(username);
    }
  }
  


  isRegistered(): boolean {
    const token = this.tokenService.token;
    if (!token) return false;
  
    const decoded = decodeToken(token);
    return !!decoded?.sub; // `sub` contains the username
  }
  

  

//   getUser(): string | null {
//     return this.currentUser;
//   }

  logout(): void {
    this.currentUser=null;
    localStorage.removeItem('token');
    this.tokenService.clear(); // Assuming your TokenService supports this
    // this.currentUser = null;
    this.router.navigate(['user', 'home']).then(() => {
      window.location.reload();
    });

  }


//   isLoggedIn(): boolean {
//     const token = this.tokenService.token;
//     if (!token) return false;
//     const decoded = decodeToken(token);
//     // Optional: Add expiration check here
//     if (!decoded || !decoded.sub) return false;
//     return true;
//   }


//   isLoggedIn(): boolean {
//     return !!this.userSubject.value;
//   }

isLoggedIn(): boolean {
    const token = this.tokenService.token;
    const decoded = token ? decodeToken(token) : null;
    return !!decoded?.sub;
  }


  
  getUser(): UserSession | null {
    return this.userSubject.value;
  }

  getRoles(): string[] {
    return this.userSubject.value?.roles || [];
  }

  getUsername(): string | null {
    return this.userSubject.value?.username || null;
  }
  
}
