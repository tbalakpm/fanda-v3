// @Injectable({ providedIn: 'root' })
// export class InventoryService {
//   private _baseUrl = environment.ICMS_API_URL;
//   private _apiUrl = `/inventories`;

//   constructor(private http: HttpClient) {}

//   searchGtn(gtn: string): Observable<GTN> {
//     return this.http.get<any>(`${this._baseUrl}${this._apiUrl}/${gtn}`);
//   }
// }
