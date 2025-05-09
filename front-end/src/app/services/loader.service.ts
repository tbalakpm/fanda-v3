import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private isLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() {}

  showLoader(): void {
    this.isLoading.next(true);
  }

  hideLoader(): void {
    this.isLoading.next(false);
  }

  isLoadingActive(): Observable<boolean> {
    return this.isLoading.asObservable();
  }
}
