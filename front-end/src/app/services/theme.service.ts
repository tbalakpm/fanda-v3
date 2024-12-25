import { Injectable } from '@angular/core';

export enum ThemeType {
  dark = 'dark',
  default = 'default',
  darkCompact = 'darkCompact',
  defaultCompact = 'defaultCompact',
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  currentTheme = ThemeType.default;
  previousTheme = ThemeType.default.toString();
  isCompact = localStorage.getItem('compact') === 'true';

  constructor() {}

  private removeUnusedTheme(theme: string): void {
    document.documentElement.classList.remove(theme);
    const removedThemeStyle = document.getElementById(theme);
    if (removedThemeStyle) {
      document.head.removeChild(removedThemeStyle);
    }
  }

  private loadCss(href: string, id: string): Promise<Event> {
    return new Promise((resolve, reject) => {
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = href;
      style.id = id;
      style.onload = resolve;
      style.onerror = reject;
      document.head.append(style);
    });
  }

  public loadTheme(firstLoad = true): Promise<Event> {
    console.log('loadTheme');
    const theme =
      (localStorage.getItem('theme') || ThemeType.default) +
      (this.isCompact ? 'Compact' : '');
    if (firstLoad) {
      document.documentElement.classList.add(theme);
    }
    return new Promise<Event>((resolve, reject) => {
      this.loadCss(`${theme}.css`, theme).then(
        (e) => {
          if (!firstLoad) {
            document.documentElement.classList.add(theme);
            this.removeUnusedTheme(this.previousTheme);
          }
          if (
            this.previousTheme === 'darkCompact' &&
            theme !== 'dark' &&
            !firstLoad
          )
            document.documentElement.classList.remove('dark');
          this.previousTheme = theme;
          if (theme === 'darkCompact')
            document.documentElement.classList.add('dark');
          resolve(e);
        },
        (e) => reject(e)
      );
    });
  }

  public toggleTheme(theme: ThemeType): Promise<Event> {
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    return this.loadTheme(false);
  }

  public toggleCompact(): Promise<Event> {
    this.isCompact = !this.isCompact;
    localStorage.setItem('compact', this.isCompact ? 'true' : 'false');
    return this.loadTheme(false);
  }
}
