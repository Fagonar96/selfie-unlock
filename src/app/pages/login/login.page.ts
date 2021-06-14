import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  public errorMessage: string = null;

  constructor(private authService: AuthService, private router: Router) { }

  model = new User('', '', '', '')

  onSubmit() { 
    //console.log(this.model);

    const _email = this.model.email;
    const _password = this.model.password;
    const _loginData = {email: _email, password: _password};
    this.authService.login(_loginData).subscribe(
      ()=> {
        this.router.navigate(['/tabs']);
      },
      () => {
        this.errorMessage = "Credenciales inválidas.";
      }
    )
  }

  ngOnInit() {
  }

}
