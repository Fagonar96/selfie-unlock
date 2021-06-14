import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Storage } from '@capacitor/storage';
import { Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  // Array which contains each photo captured
  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = 'photos';

  // Array which contains each photo from server
  public server_photos: UserPhoto[] = [];

  constructor(private platform: Platform, private http: HttpClient) {}

  public async loadSaved() {
    // Retrieve cached photo array data
    const photoList = await Storage.get({ key: this.PHOTO_STORAGE });
    this.photos = JSON.parse(photoList.value) || [];

    // If running on the web...
    if (!this.platform.is('hybrid')) {
      // Display the photo by reading into base64 format
      for (let photo of this.photos) {
        // Read each saved photo's data from the Filesystem
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data,
        });

        // Web platform only: Load the photo as base64 data
        photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
      }
    }
  }


  // Use the device camera to take a photo
  // Store the photo data into permanent file storage
  public async addNewToGallery() {
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    // Save the picture and add it to the photo collection
    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(savedImageFile);

    // Cache all photo data for future retrieval
    Storage.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });
  }

  // Save picture to file on device
  private async savePicture(cameraPhoto: Photo) {
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(cameraPhoto);

    // Write the file to the data directory
    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    // Send the new image to the web server
    console.log("Sending image: " + fileName);
    console.log(base64Data)
    const send = await this.sendPicture(fileName, base64Data);

    if (this.platform.is('hybrid')) {
      // Display the new image by rewriting the 'file://' path to HTTP
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      };
    } else {
      // Use webPath to display the new image instead of base64 since it's
      // already loaded into memory
      return {
        filepath: fileName,
        webviewPath: cameraPhoto.webPath,
      };
    }
  }

  // Read camera photo into base64 format based on the platform the app is running on
  private async readAsBase64(cameraPhoto: Photo) {
    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is('hybrid')) {
      // Read the file into base64 format
      const file = await Filesystem.readFile({
        path: cameraPhoto.path,
      });

      return file.data;
    } else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(cameraPhoto.webPath!);
      const blob = await response.blob();

      return (await this.convertBlobToBase64(blob)) as string;
    }
  }

  public async getPictures(){
    this.http.get<UserPhoto[]>(environment.restapiUrl + '/photo').subscribe((Response)=>{
      this.photos = Response;
      // Update photos array cache by overwriting the existing photo array
      Storage.set({
        key: this.PHOTO_STORAGE,
        value: JSON.stringify(this.photos),
      });
    })
  }

  // Send the picture to the web server
  public async sendPicture(fileName: string, fileData: string){
    // Http post request to send the picture
    return this.http.post(environment.restapiUrl + '/photo', {name: fileName, data: fileData}).subscribe((Response)=>{
      console.log(Response)
    })
  }

  // Delete picture by removing it from reference data and the filesystem
  public async deletePicture(photo: UserPhoto, position: number) {
    // Remove this photo from the Photos reference data array
    this.photos.splice(position, 1);

    // Update photos array cache by overwriting the existing photo array
    Storage.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });

    // Delete photo file from filesystem
    const filename = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);
    console.log("Deleting image: " + filename);
    await Filesystem.deleteFile({
      path: filename,
      directory: Directory.Data,
    });

    return this.http.delete(environment.restapiUrl + '/photo/' + filename)
  }

  public async sendSettings(maxFace: number, knownMaxFace: number) {
    console.log("Sending settings: " + maxFace + ", " + knownMaxFace)
    console.log(environment.restapiUrl + '/settings')
    return this.http.post(environment.restapiUrl + '/settings', {maxFaceDist: maxFace, knownMaxFace: knownMaxFace});
  }
  
  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}

// Interface to hold our photo metadata
export interface UserPhoto {
  filepath: string;
  webviewPath: string;
}