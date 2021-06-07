import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const user: User =  this.authService.user;
    
    let modifiedRequest = request;

    // Se verifica si existe un usuario logueado
    if(!!user) {
      const token: string = user.token;
      // Se verifica que el token sea valido
      if(!!token) {
        // Se modifica el request para agregar el header de autorizacion
        modifiedRequest = request.clone({
            headers: request.headers.append('Authorization', 'Basic ' + user.token).
                      append('Access-Control-Request-Headers', 'accept, origin, authorization').
                      append('Access-Control-Request-Method','GET,PUT,POST,DELETE,PATCH,OPTIONS').
                      append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS')
        });
      }
    }
    return next.handle(modifiedRequest);
  }
}