import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {ItemDetails, ItemPreview} from '../models/item';

type GqlResp<T> = { data?: T; errors?: Array<{ message: string }> };

const SEARCH_ITEMS = `
query searchItemByName($name: String!, $lang: LanguageCode!, $gamemode: GameMode) {
  items(lang: $lang, name: $name, gameMode: $gamemode) {
    id
    name
    iconLink
  }
}
`;

const GET_ITEM_BY_ID = `
query getItemById($id: ID!, $lang: LanguageCode!, $gamemode: GameMode) {
  item(id: $id, lang: $lang, gameMode: $gamemode) {
    id
    name
    description
    avg24hPrice
    height
    width
    iconLink
    image512pxLink
  }
}
`;
@Injectable({ providedIn: 'root' })
export class ItemApiService {
  private http = inject(HttpClient);
  private endpoint = 'https://api.tarkov.dev/graphql';

  searchItems(params: { name: string; lang: 'en' | 'ru'; gamemode?: 'pve' | 'regular' }): Observable<ItemPreview[]> {
    return this.http
      .post<GqlResp<{ items: ItemPreview[] }>>(this.endpoint, {
        query: SEARCH_ITEMS,
        variables: params,
      })
      .pipe(
        map(res => {
          if (res.errors?.length) throw new Error(res.errors[0].message);
          return res.data?.items ?? [];
        })
      );
  }
  getItemById(params: { id: string; lang: 'en' | 'ru'; gamemode?: 'pve' | 'regular' }): Observable<ItemDetails> {
    return this.http
      .post<GqlResp<{ item: ItemDetails | null }>>(this.endpoint, {
        query: GET_ITEM_BY_ID,
        variables: params,
      })
      .pipe(
        map(res => {
          if (res.errors?.length) throw new Error(res.errors[0].message);
          const item = res.data?.item;
          if (!item) throw new Error('Item not found');
          return item;
        })
      );


  }
}
