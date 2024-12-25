import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GTN } from '../models';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private _baseUrl = environment.ICMS_API_URL;
  private _apiUrl = `/inventories`;

  constructor(private http: HttpClient) {}

  searchGtn(gtn: string): Observable<GTN> {
    return this.http.get<any>(`${this._baseUrl}${this._apiUrl}/${gtn}`);
  }
}
