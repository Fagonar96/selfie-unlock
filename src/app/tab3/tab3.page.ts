import { Component } from '@angular/core';
import { Settings } from '../models/settings.model';
import { AuthService } from '../services/auth.service';
import { PhotoService } from '../services/photo.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
 
  constructor(private photoService: PhotoService, private authService: AuthService) {}

  model = new Settings(0, 0);

  onSubmit(){
    console.log(this.model)

    const _maxFaceDist = this.model.maxFaceDistance;
    const _knownMaxFaceDist = this.model.knownMaxFaceDistance;
    this.photoService.sendSettings(_maxFaceDist, _knownMaxFaceDist)
  }

  onSubmit2(){
    this.authService.logout()
  }

}
