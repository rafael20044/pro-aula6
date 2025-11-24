import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  set(key:string, data:any){
    const save = JSON.stringify(data);
    localStorage.setItem(key, save);
  }

  get<T>(key:string){
    const data = localStorage.getItem(key);
    return (data) ? JSON.parse(data) as T : null;
  }

  remove(key:string){
    localStorage.removeItem(key);
  }
}
