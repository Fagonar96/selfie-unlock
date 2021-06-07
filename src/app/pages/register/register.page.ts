import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  constructor(private authService: AuthService) { }

  model = new User('', '', '', '')

  onSubmit() { 
    console.log(this.model);

    const _name = this.model.name;
    const _email = this.model.email;
    const _password = this.model.password;
    const _register = {email: _email, password: _password, name: _name}
    this.authService.signup(_register);
  }

  ngOnInit() {
  }

}
