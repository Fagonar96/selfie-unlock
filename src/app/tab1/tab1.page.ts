import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { PhotoService, UserPhoto } from '../services/photo.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  public photos: UserPhoto[] = []
  constructor(private photoService: PhotoService) {}

  getPhotoGallery(){
    this.photoService.getPictures().subscribe(Response=>{
      this.photos = Response;
    })
  }

  deletePhoto(photo: UserPhoto){
    this.photoService.deletePhoto(photo).subscribe(()=>{
      this.getPhotoGallery();
    })
  }

  ionViewWillEnter(){
    this.getPhotoGallery()
  }

}
