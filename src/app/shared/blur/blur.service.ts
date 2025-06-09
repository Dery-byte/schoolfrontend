import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class BlurService {

  constructor() { }

    private blurSubject = new BehaviorSubject<boolean>(false);
  blur$ = this.blurSubject.asObservable();

  setBlur(state: boolean) {
    this.blurSubject.next(state);
  }
}
