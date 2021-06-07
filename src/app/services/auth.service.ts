import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _user: User = null;

  get user(): User { return { ...this._user }; }

  constructor(private http: HttpClient,
    private router: Router) { }


  login(loginData: LoginData) {
    return this.http.post<LoginResponse>(environment.restapiUrl + '/user', loginData)
    .pipe(
      tap(
        (response) => {
          this._user = new User(response.name, loginData.email, response.token);

          // Almacenamiento en el Local Storage
          sessionStorage.setItem('user', JSON.stringify(this._user));
        }
      )
    );
  }

  signup(signupData: SignupData) {
    return this.http.put(environment.restapiUrl + '/user', signupData);
  }

  isAuthenticated() {
    return !!this._user;
  }

  logout() {
    this._user = null;
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}

export interface LoginData {
  email: string,
  password: string,
}

export interface LoginResponse {
  token: string,
  name: string,
}

export interface SignupData {
  email: string,
  password: string,
  name: string,
}


